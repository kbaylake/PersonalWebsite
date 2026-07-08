import type { Block } from "./types";

// ── IST date handling ────────────────────────────────────────────
// India is a fixed +05:30 with no DST, so no timezone library is needed.

export function istDateString(d: Date = new Date()): string {
  // en-CA yields YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function istYesterdayString(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return istDateString(yesterday);
}

/** Shift a YYYY-MM-DD string by n days (noon-UTC anchored to avoid tz drift). */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Friendly IST date label, e.g. "Wed, 8 Jul". */
export function friendlyDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(dateStr + "T12:00:00Z"));
  } catch {
    return dateStr;
  }
}

/** Minutes since local midnight, in IST. */
export function istNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
}

// ── Clock formatting ─────────────────────────────────────────────

export function formatClock(totalMin: number): string {
  const wrapped = ((totalMin % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function nextDayFlag(totalMin: number): boolean {
  return totalMin >= 1440;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── Schedule ─────────────────────────────────────────────────────

export interface ScheduledBlock {
  block: Block;
  startMin: number;
  endMin: number;
}

/** Recompute each block's clock window as dayStart + Σ prior durations. */
export function computeSchedule(
  dayStartMin: number,
  blocks: Block[]
): ScheduledBlock[] {
  let cursor = dayStartMin;
  return blocks.map((block) => {
    const startMin = cursor;
    const endMin = cursor + block.durationMin;
    cursor = endMin;
    return { block, startMin, endMin };
  });
}

export function totalDurationMin(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.durationMin, 0);
}

// ── Ids ──────────────────────────────────────────────────────────

let counter = 0;
export function makeId(prefix = "b"): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${counter}_${rand}`;
}

// ── Reminder rotation ────────────────────────────────────────────
// Deterministic across reloads: index derived from minutes since day start.

export function currentReminderIndex(
  dayStartMin: number,
  cadenceMin: number,
  poolLength: number
): number {
  if (poolLength === 0) return 0;
  const now = istNowMinutes();
  const elapsed = Math.max(0, now - dayStartMin);
  const slot = Math.floor(elapsed / cadenceMin);
  return slot % poolLength;
}
