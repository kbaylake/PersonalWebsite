import type { DayPlan, PlannerState, Block, GoalId } from "./types";
import {
  DEFAULT_DAY,
  DEFAULT_DAY_START_MIN,
  type TemplateBlock,
} from "./blockConfig";
import {
  DEFAULT_SETTINGS,
  DEFAULT_GOAL_AREAS,
  REMINDER_LINES,
  PLEASURE_JOY_PAIRS,
} from "./anchorContent";
import { istDateString, makeId } from "./util";

const STORAGE_KEY = "planner_state_v1"; // key kept stable across versions
const STATE_VERSION = 3;

// v3 servo-loop defaults.
const DEFAULT_PING_PREFS = { ntfyTopic: "", weakHourPings: false };

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
    goal: t.goal ?? null,
  };
}

export function emptyDay(date: string, dayStartMin: number): DayPlan {
  return {
    date,
    dayStartMin,
    goal: "",
    blocks: [],
    captures: [],
    reflected: false,
    morningPrimeDone: false,
    preSleepDone: false,
    note: "",
    shownLineIds: [],
    resonanceLineId: null,
  };
}

export function seedDay(
  date: string,
  dayStartMin: number,
  overrides: Record<string, number> = {}
): DayPlan {
  return {
    ...emptyDay(date, dayStartMin),
    blocks: DEFAULT_DAY.map((t) => blockFromTemplate(t, overrides)),
  };
}

const EVEN_WEIGHTS: Record<GoalId, number> = {
  car: 0.25,
  engineer: 0.25,
  redirect: 0.25,
  presence: 0.25,
};

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
    goalAreas: DEFAULT_GOAL_AREAS.map((g) => ({ ...g })),
    goalWeights: { ...EVEN_WEIGHTS },
    lastWeakestGoal: null,
    lastCheckinDate: null,
    alignment: {},
    nudges: [],
    lineWeights: {},
    titleStats: {},
    titleNudgeDates: {},
    claudeEmphasis: null,
    proposal: null,
    coachNote: null,
    coachInbox: [],
    distractionEvents: [],
    pingPrefs: { ...DEFAULT_PING_PREFS },
    routineLog: [],
  };
}

// ── Migration & hydration ────────────────────────────────────────

/** Default-fill the v3 servo-loop fields onto any older state. */
function fillV3Fields(s: Partial<PlannerState>): Pick<
  PlannerState,
  | "proposal"
  | "coachNote"
  | "coachInbox"
  | "distractionEvents"
  | "pingPrefs"
  | "routineLog"
> {
  return {
    proposal: s.proposal ?? null,
    coachNote: s.coachNote ?? null,
    coachInbox: Array.isArray(s.coachInbox) ? s.coachInbox : [],
    distractionEvents: Array.isArray(s.distractionEvents) ? s.distractionEvents : [],
    pingPrefs: {
      ntfyTopic:
        typeof s.pingPrefs?.ntfyTopic === "string" ? s.pingPrefs.ntfyTopic : "",
      weakHourPings: !!s.pingPrefs?.weakHourPings,
    },
    routineLog: Array.isArray(s.routineLog) ? s.routineLog.slice(-14) : [],
  };
}

/** Fill any missing v2 fields on a day (covers v1 days and partial blobs). */
function hydrateDay(d: Partial<DayPlan> & { date: string }): DayPlan {
  return {
    ...emptyDay(d.date, d.dayStartMin ?? DEFAULT_DAY_START_MIN),
    ...d,
    note: d.note ?? "",
    shownLineIds: Array.isArray(d.shownLineIds) ? d.shownLineIds : [],
    resonanceLineId: d.resonanceLineId ?? null,
    blocks: Array.isArray(d.blocks)
      ? d.blocks.map((b) => ({ ...b, goal: b.goal ?? null }))
      : [],
    captures: Array.isArray(d.captures) ? d.captures : [],
  };
}

/**
 * v1 → v2: preserve everything the user has lived (xp, streak, days,
 * settings, overrides, SOS log); default-fill only the new servo fields.
 */
function migrateV1toV2(old: Partial<PlannerState>): PlannerState {
  const base = createDefaultState();
  const days: Record<string, DayPlan> = {};
  for (const [date, day] of Object.entries(old.days ?? {})) {
    days[date] = hydrateDay({ ...(day as DayPlan), date });
  }
  return {
    ...base,
    ...old,
    version: STATE_VERSION,
    hydrated: false,
    notice: null,
    settings: {
      ...base.settings,
      ...(old.settings ?? {}),
      weightGoal: null, // v1's permanent override becomes the transient claudeEmphasis
      car: { ...base.settings.car, ...(old.settings?.car ?? {}) },
    },
    days: Object.keys(days).length ? days : base.days,
    reminderLines: old.reminderLines?.length ? old.reminderLines : base.reminderLines,
    pleasureJoyPairs: old.pleasureJoyPairs?.length
      ? old.pleasureJoyPairs
      : base.pleasureJoyPairs,
    sosEvents: old.sosEvents ?? [],
    templateOverrides: old.templateOverrides ?? {},
    // fresh servo fields
    goalAreas: base.goalAreas,
    goalWeights: base.goalWeights,
    lastWeakestGoal: null,
    lastCheckinDate: null,
    alignment: {},
    nudges: [],
    lineWeights: {},
    titleStats: {},
    titleNudgeDates: {},
    claudeEmphasis: null,
    ...fillV3Fields({}),
  };
}

/** v2 → v3: preserve everything; default-fill only the servo-loop fields. */
function migrateV2toV3(old: Partial<PlannerState>): PlannerState {
  const base = createDefaultState();
  const days: Record<string, DayPlan> = {};
  for (const [date, day] of Object.entries(old.days ?? {})) {
    days[date] = hydrateDay({ ...(day as DayPlan), date });
  }
  return {
    ...base,
    ...old,
    version: STATE_VERSION,
    hydrated: false,
    notice: null,
    settings: {
      ...base.settings,
      ...(old.settings ?? {}),
      car: { ...base.settings.car, ...(old.settings?.car ?? {}) },
    },
    days: Object.keys(days).length ? days : base.days,
    ...fillV3Fields(old),
  };
}

/** Defensive fill for a current-version blob (forward-compat safety). */
function hydrateMissing(s: PlannerState): PlannerState {
  const base = createDefaultState();
  const days: Record<string, DayPlan> = {};
  for (const [date, day] of Object.entries(s.days ?? base.days)) {
    days[date] = hydrateDay({ ...(day as DayPlan), date });
  }
  return {
    ...base,
    ...s,
    hydrated: false,
    notice: null,
    settings: {
      ...base.settings,
      ...s.settings,
      car: { ...base.settings.car, ...(s.settings?.car ?? {}) },
    },
    days,
    reminderLines: s.reminderLines?.length ? s.reminderLines : base.reminderLines,
    pleasureJoyPairs: s.pleasureJoyPairs?.length
      ? s.pleasureJoyPairs
      : base.pleasureJoyPairs,
    sosEvents: s.sosEvents ?? [],
    templateOverrides: s.templateOverrides ?? {},
    goalAreas: s.goalAreas?.length === 4 ? s.goalAreas : base.goalAreas,
    goalWeights:
      s.goalWeights && Object.keys(s.goalWeights).length === 4
        ? s.goalWeights
        : base.goalWeights,
    lastWeakestGoal: s.lastWeakestGoal ?? null,
    lastCheckinDate: s.lastCheckinDate ?? null,
    alignment: s.alignment ?? {},
    nudges: Array.isArray(s.nudges) ? s.nudges : [],
    lineWeights: s.lineWeights ?? {},
    titleStats: s.titleStats ?? {},
    titleNudgeDates: s.titleNudgeDates ?? {},
    claudeEmphasis: s.claudeEmphasis ?? null,
    ...fillV3Fields(s),
  };
}

export function normalizeLoaded(parsed: Partial<PlannerState>): PlannerState {
  if (!parsed || typeof parsed !== "object") return createDefaultState();
  if (parsed.version === STATE_VERSION) {
    return hydrateMissing(parsed as PlannerState);
  }
  if (parsed.version === 2) {
    return migrateV2toV3(parsed);
  }
  if (parsed.version === 1) {
    // v1 → current: migrateV1toV2 default-fills from createDefaultState (which
    // already carries the v3 fields), so one hop lands a complete v3 state.
    return migrateV1toV2(parsed);
  }
  return createDefaultState();
}

// ── Persistence ──────────────────────────────────────────────────

export function loadState(): PlannerState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return normalizeLoaded(JSON.parse(raw) as Partial<PlannerState>);
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: PlannerState): void {
  if (typeof window === "undefined") return;
  try {
    // Reset transient fields — they're session-only.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, hydrated: false, notice: null })
    );
  } catch {
    // Storage full or unavailable — fail silently; in-memory state still works.
  }
}

// ── Backup / restore (shared schema with the standalone file) ────

export function exportStateJson(state: PlannerState): string {
  return JSON.stringify({ ...state, hydrated: false, notice: null }, null, 2);
}

/** Parse an imported backup; returns null if it isn't a planner backup. */
export function importStateJson(raw: string): PlannerState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    if (!parsed || typeof parsed !== "object") return null;
    // Accept any known schema version — normalizeLoaded migrates it forward.
    if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== STATE_VERSION)
      return null;
    if (!parsed.days || typeof parsed.days !== "object") return null;
    return normalizeLoaded(parsed);
  } catch {
    return null;
  }
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

export { STORAGE_KEY, STATE_VERSION };
