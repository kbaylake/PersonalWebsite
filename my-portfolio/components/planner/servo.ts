// The servo mechanism (Psycho-Cybernetics, mechanized):
// target self-image → behave → measure error → small automatic correction → repeat.
// Pure functions only — no I/O, no React. The reducer invokes runDailyTick.

import type {
  PlannerState,
  DayPlan,
  GoalId,
  ReminderCategory,
  ReminderLine,
} from "./types";
import {
  MIN_DURATION,
  GOAL_META,
  resolveBaselineDuration,
  isTemplateTitle,
} from "./blockConfig";
import {
  addDays,
  daysBetween,
  istDateOfIso,
  istNowMinutes,
  makeId,
} from "./util";

// ── Constants (the servo's gains — small, capped, rate-limited) ──

export const ALIGN_COMPLETION_WEIGHT = 80;
export const ALIGN_MORNING_WEIGHT = 10;
export const ALIGN_PRESLEEP_WEIGHT = 10;
export const ALIGN_SOS_BONUS_PER_EVENT = 5;
export const ALIGN_SOS_BONUS_CAP = 10;

export const MISS_RATE_WINDOW_DAYS = 7;
export const GOAL_SOS_SIGNAL_PER_EVENT = 2;
export const GOAL_SOS_SIGNAL_CAP = 10;
export const WEIGHT_SMOOTHING = 1;

export const CHRONIC_MISS_MIN_SAMPLES = 5;
export const CHRONIC_MISS_RATE_THRESHOLD = 0.6;
export const DURATION_NUDGE_STEP = 15;
export const DURATION_NUDGE_COOLDOWN_DAYS = 5;

export const TICKET_BASE = 2;
export const TICKET_GOAL_SCALE = 10;
export const TICKET_EMPHASIS_BONUS = 5;
export const LINE_WEIGHT_CAP = 6;
export const IDENTITY_GOAL_WEIGHT_EQUIV = 0.25;

export const NUDGE_LOG_MAX = 30;
export const CHECKIN_INTERVAL_DAYS = 7;
export const TITLE_STATS_WINDOW = 7;

// ── Category ↔ goal mapping ──────────────────────────────────────

export const CATEGORY_TO_GOAL: Record<ReminderCategory, GoalId | null> = {
  car: "car",
  focus: "engineer",
  discipline: "engineer",
  devotion: "redirect",
  presence: "presence",
  identity: null,
};

export const GOAL_TO_CATEGORIES: Record<GoalId, ReminderCategory[]> = {
  car: ["car"],
  engineer: ["focus", "discipline"],
  redirect: ["devotion"],
  presence: ["presence"],
};

// ── Error signal: daily Alignment (0–100) ────────────────────────
// "80% for finishing your blocks, 10% for each ritual — plus a bonus every
// time you use SOS, because reaching for the tool is the win."

export function computeAlignment(
  day: DayPlan | undefined,
  sosCountThatDay: number
): number {
  if (!day) return 0;
  const total = day.blocks.length;
  const completedFrac =
    total > 0 ? day.blocks.filter((b) => b.completed).length / total : 0;
  const raw =
    ALIGN_COMPLETION_WEIGHT * completedFrac +
    ALIGN_MORNING_WEIGHT * (day.morningPrimeDone ? 1 : 0) +
    ALIGN_PRESLEEP_WEIGHT * (day.preSleepDone ? 1 : 0);
  const sosBonus = Math.min(
    ALIGN_SOS_BONUS_CAP,
    ALIGN_SOS_BONUS_PER_EVENT * sosCountThatDay
  );
  return Math.min(100, Math.round(raw + sosBonus));
}

export function sosCountOnDate(state: PlannerState, date: string): number {
  return state.sosEvents.filter((e) => istDateOfIso(e.ts) === date).length;
}

function sosCountLastWindow(state: PlannerState, today: string): number {
  return state.sosEvents.filter(
    (e) => daysBetween(istDateOfIso(e.ts), today) < MISS_RATE_WINDOW_DAYS
  ).length;
}

// ── Per-goal error → weights ─────────────────────────────────────

export function missRateFor(
  state: PlannerState,
  goal: GoalId,
  today: string
): number {
  let seen = 0;
  let missed = 0;
  for (let i = 1; i <= MISS_RATE_WINDOW_DAYS; i++) {
    const day = state.days[addDays(today, -i)];
    if (!day) continue;
    for (const b of day.blocks) {
      if (b.goal !== goal) continue;
      seen += 1;
      if (!b.completed) missed += 1;
    }
  }
  return seen > 0 ? missed / seen : 0; // no data is never treated as bad data
}

export function computeGoalWeights(
  state: PlannerState,
  today: string
): Record<GoalId, number> {
  const sos7 = sosCountLastWindow(state, today);
  const errors = state.goalAreas.map((g) => {
    const gap = 10 - g.rating; // 0–9
    const missSignal = 10 * missRateFor(state, g.id, today); // 0–10
    const sosSignal =
      g.id === "redirect"
        ? Math.min(GOAL_SOS_SIGNAL_CAP, GOAL_SOS_SIGNAL_PER_EVENT * sos7)
        : 0;
    return { id: g.id, err: gap + missSignal + sosSignal };
  });
  const total = errors.reduce((s, e) => s + e.err + WEIGHT_SMOOTHING, 0);
  const weights = {} as Record<GoalId, number>;
  for (const e of errors) weights[e.id] = (e.err + WEIGHT_SMOOTHING) / total;
  return weights;
}

export function weakestGoal(weights: Record<GoalId, number>): GoalId {
  let best: GoalId = "car";
  let max = -1;
  for (const id of Object.keys(weights) as GoalId[]) {
    if (weights[id] > max) {
      max = weights[id];
      best = id;
    }
  }
  return best;
}

// ── Weighted-but-deterministic reminder rotation ─────────────────

function ticketsFor(
  line: ReminderLine,
  weights: Record<GoalId, number>,
  lineWeights: Record<string, number>,
  emphasisCategory: ReminderCategory | null
): number {
  const goal = CATEGORY_TO_GOAL[line.category];
  const goalShare = goal ? weights[goal] ?? 0.25 : IDENTITY_GOAL_WEIGHT_EQUIV;
  const resonance =
    Math.min(lineWeights[line.id] ?? 1, LINE_WEIGHT_CAP) - 1; // 0..5 bonus
  const emphasis = line.category === emphasisCategory ? TICKET_EMPHASIS_BONUS : 0;
  return TICKET_BASE + Math.round(TICKET_GOAL_SCALE * goalShare) + resonance + emphasis;
}

/** Ticket-expanded line pool (weighted). Shared by live rotation + .ics export. */
export function expandTickets(
  state: PlannerState,
  emphasisCategory: ReminderCategory | null
): string[] {
  const expanded: string[] = [];
  for (const l of state.reminderLines) {
    const n = ticketsFor(l, state.goalWeights, state.lineWeights, emphasisCategory);
    for (let i = 0; i < n; i++) expanded.push(l.id);
  }
  return expanded;
}

/** Deterministic line for a slot index over a pre-expanded pool. */
export function lineForSlot(
  state: PlannerState,
  expanded: string[],
  slot: number
): ReminderLine | undefined {
  if (expanded.length === 0) return undefined;
  // Spread consecutive slots across the pool instead of walking neighbors.
  const idx = (slot * 7919) % expanded.length; // 7919 prime → good dispersion
  return state.reminderLines.find((l) => l.id === expanded[idx]);
}

/**
 * The line for the current time slot. Deterministic: expansion order is fixed
 * by the lines array; weights only change at the tick / check-in / one daily
 * resonance tap — so every slot's line is reproducible across reloads.
 */
export function weightedReminderLine(
  state: PlannerState,
  today: string,
  dayStartMin: number
): ReminderLine | undefined {
  if (state.reminderLines.length === 0) return undefined;
  const emphasis =
    state.claudeEmphasis && state.claudeEmphasis.date === today
      ? state.claudeEmphasis.category
      : null;
  const expanded = expandTickets(state, emphasis);
  const cadence = Math.max(30, state.settings.reminderCadenceMin);
  const slot = Math.floor(Math.max(0, istNowMinutes() - dayStartMin) / cadence);
  return lineForSlot(state, expanded, slot);
}

// ── Where the servo aims the rituals ─────────────────────────────

export function pickRehearsalGoal(
  state: PlannerState,
  today: string
): { goal: GoalId; reason: "claude" | "sos" | "missed" | "weakest"; missedTitle?: string } {
  const emphasis =
    state.claudeEmphasis && state.claudeEmphasis.date === today
      ? CATEGORY_TO_GOAL[state.claudeEmphasis.category]
      : null;
  if (emphasis) return { goal: emphasis, reason: "claude" };

  const yesterday = state.days[addDays(today, -1)];
  if (yesterday && sosCountOnDate(state, yesterday.date) > 0) {
    return { goal: "redirect", reason: "sos" };
  }
  const topMissed = yesterday?.blocks.find((b) => !b.completed && b.goal);
  if (topMissed?.goal) {
    return { goal: topMissed.goal, reason: "missed", missedTitle: topMissed.title };
  }
  return { goal: weakestGoal(state.goalWeights), reason: "weakest" };
}

export function pickPresleepLine(
  state: PlannerState,
  today: string
): ReminderLine | undefined {
  const emphasisCat =
    state.claudeEmphasis && state.claudeEmphasis.date === today
      ? state.claudeEmphasis.category
      : null;
  const targetCats = emphasisCat
    ? [emphasisCat]
    : GOAL_TO_CATEGORIES[weakestGoal(state.goalWeights)];
  const pool = state.reminderLines.filter((l) => targetCats.includes(l.category));
  const candidates = pool.length
    ? pool
    : state.reminderLines.filter((l) => l.category === "identity");
  if (candidates.length === 0) return state.reminderLines[0];
  return candidates.reduce((best, l) =>
    (state.lineWeights[l.id] ?? 1) > (state.lineWeights[best.id] ?? 1) ? l : best
  );
}

// ── The daily servo tick ─────────────────────────────────────────
// Runs once per day boundary (idempotent via lastEvalDate): finalizes past
// days' alignment, updates per-title stats, applies streak forgiveness
// (missing days count as misses), applies capped auto-nudges, recomputes
// goal weights, and logs every adjustment to the training log.

export interface TickResult {
  state: PlannerState;
  notice: { kind: "protected" | "reset"; days: number } | null;
}

export function runDailyTick(state: PlannerState, today: string): TickResult {
  // Determine the first date to evaluate.
  let cursor: string;
  if (state.lastEvalDate) {
    cursor = addDays(state.lastEvalDate, 1);
  } else {
    const past = Object.keys(state.days)
      .filter((d) => d < today)
      .sort();
    if (past.length === 0) {
      const seeded = seedWeights(state, today);
      return {
        state: { ...seeded, lastEvalDate: addDays(today, -1) },
        notice: null,
      };
    }
    cursor = past[0];
  }
  if (cursor >= today) {
    // Nothing new to evaluate — still make sure weights exist.
    return { state: seedWeights(state, today), notice: null };
  }

  let next: PlannerState = { ...state };
  const alignment = { ...next.alignment };
  const titleStats = { ...next.titleStats };
  const nudges = [...next.nudges];
  let protectedDays = 0;
  let resetHappened = false;

  while (cursor < today) {
    const day = next.days[cursor];

    // 1. Finalize alignment (missing day → honest 0).
    alignment[cursor] = computeAlignment(day, sosCountOnDate(next, cursor));

    // 2. Per-title outcomes (template titles only; rolling window).
    if (day) {
      for (const b of day.blocks) {
        if (!isTemplateTitle(b.title)) continue;
        const arr = [...(titleStats[b.title] ?? []), b.completed ? "done" as const : "miss" as const];
        titleStats[b.title] = arr.slice(-TITLE_STATS_WINDOW);
      }
    }

    // 3. Streak: a day with an unfinished plan OR no plan at all is a miss —
    //    grace absorbs it (streak HOLDS), otherwise the streak resets.
    //    Lifetime numbers are never touched here.
    const wasClean =
      !!day && day.blocks.length > 0 && day.blocks.every((b) => b.completed);
    if (!wasClean) {
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

    cursor = addDays(cursor, 1);
  }

  next = { ...next, alignment, titleStats, lastEvalDate: addDays(today, -1) };

  // 4. Chronic-miss trims (small, cooled-down, floored, logged).
  const titleNudgeDates = { ...next.titleNudgeDates };
  const templateOverrides = { ...next.templateOverrides };
  for (const title of Object.keys(titleStats)) {
    const outcomes = titleStats[title];
    if (outcomes.length < CHRONIC_MISS_MIN_SAMPLES) continue;
    const missRate = outcomes.filter((o) => o === "miss").length / outcomes.length;
    if (missRate < CHRONIC_MISS_RATE_THRESHOLD) continue;
    const last = titleNudgeDates[title];
    if (last && daysBetween(last, today) < DURATION_NUDGE_COOLDOWN_DAYS) continue;
    const current = resolveBaselineDuration(title, templateOverrides);
    const trimmed = Math.max(MIN_DURATION, current - DURATION_NUDGE_STEP);
    if (trimmed === current) continue;
    templateOverrides[title] = trimmed;
    titleNudgeDates[title] = today;
    nudges.push({
      id: makeId("nudge"),
      date: today,
      kind: "duration_trim",
      text: `"${title}" was missed ${Math.round(missRate * 100)}% of the last ${outcomes.length} days — trimmed ${current}m → ${trimmed}m so it's easier to actually finish.`,
    });
  }
  next = { ...next, templateOverrides, titleNudgeDates };

  // 5. Clear a stale Claude emphasis (it only ever applies to its target day).
  if (next.claudeEmphasis && next.claudeEmphasis.date < today) {
    next = { ...next, claudeEmphasis: null };
  }

  // 6. Recompute the target weights; log a shift of the growth edge.
  const goalWeights = computeGoalWeights(next, today);
  const weakest = weakestGoal(goalWeights);
  if (next.lastWeakestGoal && weakest !== next.lastWeakestGoal) {
    nudges.push({
      id: makeId("nudge"),
      date: today,
      kind: "weight_shift",
      text: `Growth edge moved from ${GOAL_META[next.lastWeakestGoal].label} to ${GOAL_META[weakest].label} — reminders, the morning rehearsal, and tonight's line now lean that way.`,
    });
  }
  next = {
    ...next,
    goalWeights,
    lastWeakestGoal: weakest,
    nudges: nudges.slice(-NUDGE_LOG_MAX),
  };

  const notice = resetHappened
    ? { kind: "reset" as const, days: 0 }
    : protectedDays > 0
      ? { kind: "protected" as const, days: protectedDays }
      : null;

  return { state: next, notice };
}

function seedWeights(state: PlannerState, today: string): PlannerState {
  const goalWeights = computeGoalWeights(state, today);
  return {
    ...state,
    goalWeights,
    lastWeakestGoal: state.lastWeakestGoal ?? weakestGoal(goalWeights),
  };
}

// ── Check-in gate ────────────────────────────────────────────────

export function checkinDue(state: PlannerState, today: string): boolean {
  if (!state.lastCheckinDate) return true; // first run: set the baseline now
  return daysBetween(state.lastCheckinDate, today) >= CHECKIN_INTERVAL_DAYS;
}
