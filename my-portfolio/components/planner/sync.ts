"use client";

// Client sync layer. The planner stays localStorage-first; when a sync key is
// present this mirrors the whole state doc to the cloud store so the phone,
// the laptop, and the scheduled Claude routines all see the same state.
//
// Concurrency model (single user, a few devices): document-level, rev-gated.
// Higher server rev wins — on a stale write the server 409s, we pull its doc
// and adopt it. The sync key and rev live in localStorage only, never in the
// state doc and never in an exported backup.

import type { PlannerState } from "./types";

const KEY_LS = "planner_sync_key";
const REV_LS = "planner_sync_rev";
const SYNC_URL = "/api/planner/sync";
const PUSH_DEBOUNCE_MS = 3000;

export type SyncStatus = "off" | "syncing" | "synced" | "offline" | "conflict";

export function getSyncKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY_LS) ?? "";
  } catch {
    return "";
  }
}
export function setSyncKey(key: string): void {
  try {
    if (key.trim()) window.localStorage.setItem(KEY_LS, key.trim());
    else window.localStorage.removeItem(KEY_LS);
    window.localStorage.removeItem(REV_LS); // force a fresh pull under the new key
  } catch {
    /* ignore */
  }
}
function getRev(): number {
  try {
    return Number(window.localStorage.getItem(REV_LS) ?? "0") || 0;
  } catch {
    return 0;
  }
}
function setRev(rev: number): void {
  try {
    window.localStorage.setItem(REV_LS, String(rev));
  } catch {
    /* ignore */
  }
}

/** Serialize the state doc exactly as it will live on the server (no transient fields). */
function serialize(state: PlannerState): string {
  return JSON.stringify({ ...state, hydrated: false, notice: null });
}

let lastPushedJson = "";
let pushTimer: ReturnType<typeof setTimeout> | null = null;

interface SyncHandlers {
  onStatus?: (s: SyncStatus) => void;
  /** Server had a newer doc — replace local with this state. */
  onAdopt?: (state: PlannerState) => void;
}

/**
 * Pull once at startup. If the server has a newer doc, adopt it; if the server
 * is empty or behind, seed/refresh it from local. No-op without a key.
 */
export async function initialPull(local: PlannerState, h: SyncHandlers): Promise<void> {
  const key = getSyncKey();
  if (!key) {
    h.onStatus?.("off");
    return;
  }
  h.onStatus?.("syncing");
  try {
    const res = await fetch(`${SYNC_URL}?key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      h.onStatus?.("offline");
      return;
    }
    const doc = (await res.json()) as { rev: number; state: PlannerState | null };
    if (doc.state && doc.rev > getRev()) {
      setRev(doc.rev);
      lastPushedJson = serialize(doc.state);
      h.onAdopt?.(doc.state);
      h.onStatus?.("synced");
    } else {
      // Local is authoritative (server empty or behind) — push it up.
      setRev(doc.rev);
      await push(local, h, true);
    }
  } catch {
    h.onStatus?.("offline");
  }
}

/** Debounced push after a local change. */
export function schedulePush(state: PlannerState, h: SyncHandlers): void {
  if (!getSyncKey()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void push(state, h, false);
  }, PUSH_DEBOUNCE_MS);
}

/** Immediate push (compare-and-set). On 409, pull the server doc and adopt it. */
export async function push(
  state: PlannerState,
  h: SyncHandlers,
  fromInitial: boolean
): Promise<void> {
  const key = getSyncKey();
  if (!key) return;
  const json = serialize(state);
  if (json === lastPushedJson && !fromInitial) return; // nothing changed
  h.onStatus?.("syncing");
  try {
    const res = await fetch(`${SYNC_URL}?key=${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-planner-key": key },
      body: JSON.stringify({ rev: getRev(), state: JSON.parse(json) }),
    });
    if (res.status === 409) {
      // Another device wrote first — adopt the server's newer doc.
      const conflict = (await res.json()) as { currentRev: number };
      setRev(conflict.currentRev);
      const pulled = await fetch(`${SYNC_URL}?key=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });
      if (pulled.ok) {
        const doc = (await pulled.json()) as { rev: number; state: PlannerState | null };
        if (doc.state) {
          setRev(doc.rev);
          lastPushedJson = serialize(doc.state);
          h.onAdopt?.(doc.state);
        }
      }
      h.onStatus?.("synced");
      return;
    }
    if (!res.ok) {
      h.onStatus?.("offline");
      return;
    }
    const out = (await res.json()) as { rev: number };
    setRev(out.rev);
    lastPushedJson = json;
    h.onStatus?.("synced");
  } catch {
    h.onStatus?.("offline");
  }
}
