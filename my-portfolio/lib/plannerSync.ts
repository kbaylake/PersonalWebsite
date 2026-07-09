// Server-side shared-state layer for the planner's cybernetic loop.
// Backing store: Upstash Redis via its REST API (free Vercel-marketplace tier).
// No SDK — plain fetch — matching the repo's zero-extra-deps convention.
//
// The planner UI stays localStorage-first; this is a sync layer on top, so
// every helper degrades to a clear "not configured" signal when the env vars
// are absent rather than throwing.

import crypto from "crypto";

const STATE_REV_KEY = "planner:rev";
const STATE_DOC_KEY = "planner:state";
const EVENTS_KEY = "planner:events";
const EVENTS_CAP = 200;

interface UpstashCreds {
  url: string;
  token: string;
}

export function upstashCreds(): UpstashCreds | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** Run one Redis command via the Upstash REST root endpoint. */
async function redisCmd(creds: UpstashCreds, command: (string | number)[]): Promise<unknown> {
  const res = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`Upstash: ${json.error}`);
  return json.result;
}

// ── Auth ─────────────────────────────────────────────────────────

/** Constant-time compare that never short-circuits on length. */
export function keyMatches(provided: string | null | undefined): boolean {
  const expected = process.env.PLANNER_SYNC_KEY;
  if (!expected) return false; // no key configured → deny (route returns 503 first)
  const a = crypto.createHash("sha256").update(String(provided ?? "")).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Extract the caller's key from the header or the ?key= query param. */
export function extractKey(req: Request): string | null {
  const header = req.headers.get("x-planner-key");
  if (header) return header;
  try {
    return new URL(req.url).searchParams.get("key");
  } catch {
    return null;
  }
}

// ── State doc (rev + JSON) ───────────────────────────────────────

export interface SyncDoc {
  rev: number;
  state: unknown | null;
}

export async function getStateDoc(creds: UpstashCreds): Promise<SyncDoc> {
  const result = (await redisCmd(creds, ["MGET", STATE_REV_KEY, STATE_DOC_KEY])) as
    | (string | null)[]
    | null;
  const revRaw = result?.[0] ?? null;
  const stateRaw = result?.[1] ?? null;
  const rev = revRaw ? Number(revRaw) : 0;
  let state: unknown | null = null;
  if (stateRaw) {
    try {
      state = JSON.parse(stateRaw);
    } catch {
      state = null;
    }
  }
  return { rev: Number.isFinite(rev) ? rev : 0, state };
}

/**
 * Compare-and-set: only writes if the caller's expectedRev matches the stored
 * rev. Returns the new rev on success, or { conflict, currentRev } on mismatch.
 * The CAS is atomic via a Lua script so two devices can't clobber each other.
 */
export async function putStateDoc(
  creds: UpstashCreds,
  expectedRev: number,
  stateJson: string
): Promise<{ ok: true; rev: number } | { ok: false; currentRev: number }> {
  const script = `
    local curRev = tonumber(redis.call('GET', KEYS[1]) or '0')
    local expected = tonumber(ARGV[1])
    if curRev ~= expected then
      return -curRev - 1
    end
    local newRev = curRev + 1
    redis.call('SET', KEYS[1], newRev)
    redis.call('SET', KEYS[2], ARGV[2])
    return newRev
  `;
  const result = (await redisCmd(creds, [
    "EVAL",
    script,
    2,
    STATE_REV_KEY,
    STATE_DOC_KEY,
    expectedRev,
    stateJson,
  ])) as number;
  if (result < 0) {
    return { ok: false, currentRev: -result - 1 };
  }
  return { ok: true, rev: result };
}

// ── Sensor events (append-only, capped) ──────────────────────────

export interface SensorEvent {
  type: "distraction" | "ping_ack";
  app?: string;
  ts: string;
}

export async function appendEvent(creds: UpstashCreds, event: SensorEvent): Promise<void> {
  await redisCmd(creds, ["RPUSH", EVENTS_KEY, JSON.stringify(event)]);
  await redisCmd(creds, ["LTRIM", EVENTS_KEY, -EVENTS_CAP, -1]);
}

export async function readEvents(creds: UpstashCreds): Promise<SensorEvent[]> {
  const raw = (await redisCmd(creds, ["LRANGE", EVENTS_KEY, 0, -1])) as string[] | null;
  if (!Array.isArray(raw)) return [];
  const out: SensorEvent[] = [];
  for (const s of raw) {
    try {
      out.push(JSON.parse(s) as SensorEvent);
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

export async function clearEvents(creds: UpstashCreds): Promise<void> {
  await redisCmd(creds, ["DEL", EVENTS_KEY]);
}
