import { NextResponse } from "next/server";
import {
  upstashCreds,
  extractKey,
  keyMatches,
  appendEvent,
  readEvents,
  clearEvents,
  type SensorEvent,
} from "@/lib/plannerSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight real-life sensor endpoint. iPhone Shortcuts POST here when a
// distraction app opens; the evening routine GETs the accumulated list and
// merges it into state, then DELETEs to clear consumed events.
//
// POST   { type, app? }          → append (server stamps ts if absent)
// GET                            → { events: [...] }
// DELETE                         → clears the list

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function notConfigured() {
  return NextResponse.json({ error: "sync not configured" }, { status: 503 });
}

export async function POST(req: Request) {
  const creds = upstashCreds();
  if (!creds) return notConfigured();
  if (!keyMatches(extractKey(req))) return unauthorized();

  let body: { type?: unknown; app?: unknown; ts?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // Shortcuts sometimes send form/no body — treat as a generic distraction.
    body = {};
  }
  const type: SensorEvent["type"] =
    body.type === "ping_ack" ? "ping_ack" : "distraction";
  const event: SensorEvent = {
    type,
    app: typeof body.app === "string" ? body.app.slice(0, 40) : undefined,
    ts: typeof body.ts === "string" ? body.ts : new Date().toISOString(),
  };
  try {
    await appendEvent(creds, event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("planner event POST:", err);
    return NextResponse.json({ error: "append failed" }, { status: 502 });
  }
}

export async function GET(req: Request) {
  const creds = upstashCreds();
  if (!creds) return notConfigured();
  if (!keyMatches(extractKey(req))) return unauthorized();
  try {
    return NextResponse.json({ events: await readEvents(creds) });
  } catch (err) {
    console.error("planner event GET:", err);
    return NextResponse.json({ error: "read failed" }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  const creds = upstashCreds();
  if (!creds) return notConfigured();
  if (!keyMatches(extractKey(req))) return unauthorized();
  try {
    await clearEvents(creds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("planner event DELETE:", err);
    return NextResponse.json({ error: "clear failed" }, { status: 502 });
  }
}
