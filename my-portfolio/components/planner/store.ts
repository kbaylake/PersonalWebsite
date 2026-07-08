import type { DayPlan, PlannerState, Block } from "./types";
import {
  DEFAULT_DAY,
  DEFAULT_DAY_START_MIN,
  type TemplateBlock,
} from "./blockConfig";
import {
  DEFAULT_SETTINGS,
  REMINDER_LINES,
  PLEASURE_JOY_PAIRS,
} from "./anchorContent";
import { istDateString, makeId } from "./util";

const STORAGE_KEY = "planner_state_v1";
const STATE_VERSION = 1;

// Grace-token tuning.
export const MAX_GRACE = 1;
export const TOKEN_REGEN_CLEAN_DAYS = 7;

// ── Seeding ──────────────────────────────────────────────────────

function blockFromTemplate(
  t: TemplateBlock,
  overrides: Record<string, number>
): Block {
  return {
    id: makeId(),
    type: t.type,
    title: t.title,
    durationMin: overrides[t.title] ?? t.durationMin,
    completed: false,
    completedAt: null,
  };
}

export function seedDay(
  date: string,
  dayStartMin: number,
  overrides: Record<string, number> = {}
): DayPlan {
  return {
    date,
    dayStartMin,
    goal: "",
    blocks: DEFAULT_DAY.map((t) => blockFromTemplate(t, overrides)),
    captures: [],
    reflected: false,
    morningPrimeDone: false,
    preSleepDone: false,
  };
}

export function createDefaultState(): PlannerState {
  const today = istDateString();
  return {
    version: STATE_VERSION,
    hydrated: false,
    notice: null,
    xp: 0,
    streak: 0,
    graceRemaining: MAX_GRACE,
    cleanRunTowardToken: 0,
    lifetimeCleanDays: 0,
    lastAllCompleteDate: null,
    lastEvalDate: null,
    templateOverrides: {},
    days: { [today]: seedDay(today, DEFAULT_DAY_START_MIN) },
    settings: { ...DEFAULT_SETTINGS },
    reminderLines: REMINDER_LINES.map((l) => ({ ...l })),
    pleasureJoyPairs: PLEASURE_JOY_PAIRS.map((p) => ({ ...p })),
    sosEvents: [],
  };
}

// ── Persistence ──────────────────────────────────────────────────

export function loadState(): PlannerState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    if (!parsed || parsed.version !== STATE_VERSION) {
      return migrate();
    }
    return hydrateMissing(parsed as PlannerState);
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: PlannerState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — fail silently; the in-memory state still works.
  }
}

// Fill in any fields a stored blob might be missing (forward-compat safety).
function hydrateMissing(s: PlannerState): PlannerState {
  const base = createDefaultState();
  return {
    ...base,
    ...s,
    settings: { ...base.settings, ...s.settings },
    reminderLines: s.reminderLines?.length ? s.reminderLines : base.reminderLines,
    pleasureJoyPairs: s.pleasureJoyPairs?.length
      ? s.pleasureJoyPairs
      : base.pleasureJoyPairs,
    days: s.days ?? base.days,
    sosEvents: s.sosEvents ?? [],
    templateOverrides: s.templateOverrides ?? {},
  };
}

function migrate(): PlannerState {
  // No prior versions yet — start fresh but keep the door open.
  return createDefaultState();
}

// ── Day access ───────────────────────────────────────────────────

/** Return today's plan, seeding it (immutably) if absent. */
export function ensureToday(state: PlannerState): {
  state: PlannerState;
  today: string;
} {
  const today = istDateString();
  if (state.days[today]) return { state, today };
  const seeded = seedDay(today, state.settings.dayStartMin, state.templateOverrides);
  return {
    state: { ...state, days: { ...state.days, [today]: seeded } },
    today,
  };
}

// ── Completion helpers ───────────────────────────────────────────

export function isDayClean(day: DayPlan | undefined): boolean {
  if (!day || day.blocks.length === 0) return false;
  return day.blocks.every((b) => b.completed);
}

// ── Streak rollover (misses only; clean days are counted at completion) ──

function dateAfter(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export interface ReconcileResult {
  state: PlannerState;
  notice: { kind: "protected" | "reset"; days: number } | null;
}

/**
 * Evaluate any past days that ended while unevaluated. Clean days were already
 * credited optimistically at completion; here we only handle misses, applying
 * grace-token forgiveness before resetting the streak.
 */
export function reconcileStreak(state: PlannerState): ReconcileResult {
  const today = istDateString();
  let cursor = state.lastEvalDate ? dateAfter(state.lastEvalDate) : null;

  // If we've never evaluated, only look back at days that actually exist.
  if (!cursor) {
    const past = Object.keys(state.days)
      .filter((d) => d < today)
      .sort();
    if (past.length === 0) {
      return { state: { ...state, lastEvalDate: yesterdayOf(today) }, notice: null };
    }
    cursor = past[0];
  }

  let next = { ...state };
  let protectedDays = 0;
  let resetHappened = false;

  while (cursor < today) {
    const day = next.days[cursor];
    if (day && day.blocks.length > 0 && !isDayClean(day)) {
      // A real miss.
      if (next.graceRemaining >= 1) {
        next = {
          ...next,
          graceRemaining: next.graceRemaining - 1,
          cleanRunTowardToken: 0,
        };
        protectedDays += 1;
      } else if (next.streak > 0) {
        next = { ...next, streak: 0, cleanRunTowardToken: 0 };
        resetHappened = true;
      }
    }
    cursor = dateAfter(cursor);
  }

  next = { ...next, lastEvalDate: yesterdayOf(today) };

  const notice = resetHappened
    ? { kind: "reset" as const, days: 0 }
    : protectedDays > 0
      ? { kind: "protected" as const, days: protectedDays }
      : null;

  return { state: next, notice };
}

function yesterdayOf(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export { STORAGE_KEY };
