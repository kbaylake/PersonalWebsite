import type {
  PlannerState,
  Block,
  BlockType,
  DayPlan,
  GoalId,
  SosEvent,
  TomorrowPatch,
  PlannerSettings,
  PingPrefs,
} from "./types";
import { istDateString, addDays, makeId } from "./util";
import {
  seedDay,
  ensureToday,
  isDayClean,
  MAX_GRACE,
  TOKEN_REGEN_CLEAN_DAYS,
} from "./store";
import {
  XP_PER_COMPLETE,
  SOS_XP,
  MIN_DURATION,
  MAX_DURATION,
  GOAL_CYCLE,
  GOAL_META,
  resolveBaselineDuration,
} from "./blockConfig";
import {
  runDailyTick,
  computeGoalWeights,
  weakestGoal,
  NUDGE_LOG_MAX,
  LINE_WEIGHT_CAP,
} from "./servo";

export type Action =
  | { type: "HYDRATE"; state: PlannerState }
  | { type: "ENSURE_TODAY" }
  | { type: "IMPORT_STATE"; state: PlannerState }
  | { type: "SET_GOAL"; goal: string }
  | { type: "SET_DAY_START"; min: number }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "STEP_DURATION"; id: string; delta: number }
  | { type: "EDIT_TITLE"; id: string; title: string }
  | { type: "SET_TYPE"; id: string; blockType: BlockType }
  | { type: "SET_BLOCK_GOAL"; id: string }
  | { type: "ADD_BLOCK" }
  | { type: "DELETE_BLOCK"; id: string }
  | { type: "RESTORE_BLOCK"; block: Block; index: number }
  | { type: "REORDER"; from: number; to: number }
  | { type: "MOVE"; index: number; dir: -1 | 1 }
  | { type: "ADD_CAPTURE"; text: string }
  | { type: "DELETE_CAPTURE"; id: string }
  | { type: "MARK_MORNING_DONE"; focus: string }
  | { type: "MARK_PRESLEEP_DONE"; note: string }
  | { type: "LOG_SOS"; event: SosEvent }
  | { type: "APPLY_TOMORROW"; patch: TomorrowPatch }
  | { type: "REFLECT_YESTERDAY"; date: string; ranLongTitles: string[] }
  | { type: "DISMISS_DAY"; date: string }
  | { type: "DISMISS_NOTICE" }
  | { type: "RATE_GOALS"; ratings: Record<GoalId, number> }
  | { type: "DISMISS_CHECKIN" }
  | { type: "MARK_RESONANCE"; lineId: string }
  | { type: "RECORD_SHOWN_LINE"; lineId: string }
  | { type: "UPDATE_SETTINGS"; partial: Partial<PlannerSettings> }
  // ── v3 cybernetic loop ──
  | { type: "APPROVE_PROPOSAL" }
  | { type: "APPLY_PROPOSAL" }
  | { type: "REVERT_PROPOSAL" }
  | { type: "DISMISS_PROPOSAL" }
  | { type: "COACH_SEND"; text: string }
  | { type: "SET_PING_PREFS"; partial: Partial<PingPrefs> };

function today(): string {
  return istDateString();
}

/** Immutably update today's day plan. */
function withToday(
  state: PlannerState,
  fn: (day: DayPlan) => DayPlan
): PlannerState {
  const key = today();
  const day = state.days[key];
  if (!day) return state;
  return { ...state, days: { ...state.days, [key]: fn(day) } };
}

function mapBlocks(day: DayPlan, fn: (b: Block) => Block): DayPlan {
  return { ...day, blocks: day.blocks.map(fn) };
}

/**
 * Keep the optimistic streak credit symmetric with the day's ACTUAL
 * cleanliness after ANY block mutation (toggle, add, delete, restore).
 * Fixes the confirmed v1 desyncs: adding a block after full completion
 * left phantom credit; deleting the last incomplete block granted none.
 */
function syncCleanCredit(state: PlannerState, key: string): PlannerState {
  const day = state.days[key];
  const cleanNow = isDayClean(day);
  const wasCounted = state.lastAllCompleteDate === key;

  if (cleanNow === wasCounted) return state;

  let {
    streak,
    lifetimeCleanDays,
    cleanRunTowardToken,
    graceRemaining,
    lastAllCompleteDate,
  } = state;

  if (cleanNow && !wasCounted) {
    streak += 1;
    lifetimeCleanDays += 1;
    cleanRunTowardToken += 1;
    if (
      cleanRunTowardToken >= TOKEN_REGEN_CLEAN_DAYS &&
      graceRemaining < MAX_GRACE
    ) {
      graceRemaining += 1;
      cleanRunTowardToken -= TOKEN_REGEN_CLEAN_DAYS;
    }
    lastAllCompleteDate = key;
  } else {
    streak = Math.max(0, streak - 1);
    lifetimeCleanDays = Math.max(0, lifetimeCleanDays - 1);
    cleanRunTowardToken = Math.max(0, cleanRunTowardToken - 1);
    lastAllCompleteDate = null;
  }

  return {
    ...state,
    streak,
    lifetimeCleanDays,
    cleanRunTowardToken,
    graceRemaining,
    lastAllCompleteDate,
  };
}

/** Seed today if missing, then run the daily servo tick (idempotent). */
function ensureAndTick(state: PlannerState): PlannerState {
  const ensured = ensureToday(state).state;
  const { state: ticked, notice } = runDailyTick(ensured, today());
  return notice ? { ...ticked, notice } : ticked;
}

export function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "HYDRATE":
    case "IMPORT_STATE":
      return { ...ensureAndTick(action.state), hydrated: true };

    case "ENSURE_TODAY": {
      // No-op fast path so the minute interval doesn't churn renders.
      const key = today();
      if (state.days[key] && state.lastEvalDate === addDays(key, -1)) return state;
      return ensureAndTick(state);
    }

    case "DISMISS_NOTICE":
      return { ...state, notice: null };

    case "SET_GOAL":
      return withToday(state, (d) => ({ ...d, goal: action.goal }));

    case "SET_DAY_START":
      return withToday(state, (d) => ({ ...d, dayStartMin: action.min }));

    case "STEP_DURATION":
      return withToday(state, (d) =>
        mapBlocks(d, (b) =>
          b.id === action.id
            ? {
                ...b,
                durationMin: Math.min(
                  MAX_DURATION,
                  Math.max(MIN_DURATION, b.durationMin + action.delta)
                ),
              }
            : b
        )
      );

    case "EDIT_TITLE":
      return withToday(state, (d) =>
        mapBlocks(d, (b) =>
          b.id === action.id ? { ...b, title: action.title } : b
        )
      );

    case "SET_TYPE":
      return withToday(state, (d) =>
        mapBlocks(d, (b) =>
          b.id === action.id ? { ...b, type: action.blockType } : b
        )
      );

    case "SET_BLOCK_GOAL":
      return withToday(state, (d) =>
        mapBlocks(d, (b) => {
          if (b.id !== action.id) return b;
          const i = GOAL_CYCLE.indexOf(b.goal);
          return { ...b, goal: GOAL_CYCLE[(i + 1) % GOAL_CYCLE.length] };
        })
      );

    case "ADD_BLOCK": {
      const next = withToday(state, (d) => ({
        ...d,
        blocks: [
          ...d.blocks,
          {
            id: makeId(),
            type: "work" as BlockType,
            title: "New block",
            durationMin: 30,
            completed: false,
            completedAt: null,
            goal: null,
          },
        ],
      }));
      return syncCleanCredit(next, today());
    }

    case "DELETE_BLOCK": {
      const next = withToday(state, (d) => ({
        ...d,
        blocks: d.blocks.filter((b) => b.id !== action.id),
      }));
      return syncCleanCredit(next, today());
    }

    case "RESTORE_BLOCK": {
      const next = withToday(state, (d) => {
        const blocks = [...d.blocks];
        const idx = Math.min(Math.max(0, action.index), blocks.length);
        blocks.splice(idx, 0, action.block);
        return { ...d, blocks };
      });
      return syncCleanCredit(next, today());
    }

    case "REORDER":
      return withToday(state, (d) => {
        const blocks = [...d.blocks];
        const [moved] = blocks.splice(action.from, 1);
        if (!moved) return d;
        const target = action.from < action.to ? action.to - 1 : action.to;
        blocks.splice(target, 0, moved);
        return { ...d, blocks };
      });

    case "MOVE":
      return withToday(state, (d) => {
        const target = action.index + action.dir;
        if (target < 0 || target >= d.blocks.length) return d;
        const blocks = [...d.blocks];
        [blocks[action.index], blocks[target]] = [
          blocks[target],
          blocks[action.index],
        ];
        return { ...d, blocks };
      });

    case "ADD_CAPTURE":
      return withToday(state, (d) => ({
        ...d,
        captures: [
          ...d.captures,
          { id: makeId("cap"), ts: new Date().toISOString(), text: action.text },
        ],
      }));

    case "DELETE_CAPTURE":
      return withToday(state, (d) => ({
        ...d,
        captures: d.captures.filter((c) => c.id !== action.id),
      }));

    case "MARK_MORNING_DONE":
      return withToday(state, (d) => ({
        ...d,
        morningPrimeDone: true,
        goal: action.focus || d.goal,
      }));

    case "MARK_PRESLEEP_DONE":
      return withToday(state, (d) => ({
        ...d,
        preSleepDone: true,
        note: action.note || d.note,
      }));

    case "RECORD_SHOWN_LINE":
      return withToday(state, (d) => {
        if (d.shownLineIds.includes(action.lineId)) return d;
        return {
          ...d,
          shownLineIds: [...d.shownLineIds, action.lineId].slice(-4),
        };
      });

    case "MARK_RESONANCE": {
      const key = today();
      const day = state.days[key];
      if (!day || day.resonanceLineId) return state; // write-once per day
      const line = state.reminderLines.find((l) => l.id === action.lineId);
      if (!line) return state;
      return {
        ...state,
        days: {
          ...state.days,
          [key]: { ...day, resonanceLineId: action.lineId },
        },
        lineWeights: {
          ...state.lineWeights,
          [action.lineId]: Math.min(
            LINE_WEIGHT_CAP,
            (state.lineWeights[action.lineId] ?? 1) + 1
          ),
        },
        nudges: [
          ...state.nudges,
          {
            id: makeId("nudge"),
            date: key,
            kind: "line_resonance" as const,
            text: `"${line.text}" carried you today — it'll show up a bit more often.`,
          },
        ].slice(-NUDGE_LOG_MAX),
      };
    }

    case "LOG_SOS": {
      const bonus = action.event.outcome === "passed" ? SOS_XP : 0;
      return {
        ...state,
        xp: Math.max(0, state.xp + bonus),
        sosEvents: [...state.sosEvents, action.event],
      };
    }

    case "TOGGLE_COMPLETE":
      return toggleComplete(state, action.id);

    case "APPLY_TOMORROW":
      return applyTomorrow(state, action.patch);

    case "REFLECT_YESTERDAY":
      return reflectYesterday(state, action.date, action.ranLongTitles);

    case "DISMISS_DAY": {
      const day = state.days[action.date];
      if (!day) return state;
      return {
        ...state,
        days: { ...state.days, [action.date]: { ...day, reflected: true } },
      };
    }

    case "RATE_GOALS": {
      const key = today();
      const goalAreas = state.goalAreas.map((g) => ({
        ...g,
        rating: Math.min(10, Math.max(1, action.ratings[g.id] ?? g.rating)),
      }));
      const interim = { ...state, goalAreas, lastCheckinDate: key };
      const goalWeights = computeGoalWeights(interim, key);
      const weakest = weakestGoal(goalWeights);
      const nudges =
        state.lastWeakestGoal && weakest !== state.lastWeakestGoal
          ? [
              ...state.nudges,
              {
                id: makeId("nudge"),
                date: key,
                kind: "weight_shift" as const,
                text: `Growth edge moved from ${GOAL_META[state.lastWeakestGoal].label} to ${GOAL_META[weakest].label} — reminders and rituals now lean that way.`,
              },
            ].slice(-NUDGE_LOG_MAX)
          : state.nudges;
      return {
        ...interim,
        goalWeights,
        lastWeakestGoal: weakest,
        nudges,
      };
    }

    case "DISMISS_CHECKIN":
      return { ...state, lastCheckinDate: today() };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.partial,
          car: { ...state.settings.car, ...(action.partial.car ?? {}) },
        },
      };

    case "APPROVE_PROPOSAL": {
      if (!state.proposal || state.proposal.status !== "pending") return state;
      return {
        ...state,
        proposal: { ...state.proposal, status: "approved" },
      };
    }

    case "APPLY_PROPOSAL":
      return applyProposal(state);

    case "REVERT_PROPOSAL":
      return revertProposal(state);

    case "DISMISS_PROPOSAL":
      return { ...state, proposal: null };

    case "COACH_SEND": {
      const text = action.text.trim();
      if (!text) return state;
      return {
        ...state,
        coachInbox: [
          ...state.coachInbox,
          {
            id: makeId("msg"),
            ts: new Date().toISOString(),
            from: "user" as const,
            text: text.slice(0, 1000),
          },
        ].slice(-50),
      };
    }

    case "SET_PING_PREFS":
      return {
        ...state,
        pingPrefs: { ...state.pingPrefs, ...action.partial },
      };

    default:
      return state;
  }
}

// ── Proposal apply / revert (the hybrid-servo checkpoint) ────────

function proposalBlocks(state: PlannerState): Block[] {
  const p = state.proposal;
  if (!p) return [];
  return p.blocks.map((b) => ({
    id: makeId(),
    type: b.type,
    title: b.title,
    durationMin: b.durationMin,
    completed: false,
    completedAt: null,
    goal: b.goal ?? null,
  }));
}

function applyProposal(state: PlannerState): PlannerState {
  const p = state.proposal;
  if (!p) return state;
  const base =
    state.days[p.date] ??
    seedDay(p.date, state.settings.dayStartMin, state.templateOverrides);
  const day: DayPlan = { ...base, blocks: proposalBlocks(state), goal: p.focus || base.goal };
  const next: PlannerState = {
    ...state,
    days: { ...state.days, [p.date]: day },
    proposal: { ...p, status: "applied" },
    nudges: [
      ...state.nudges,
      {
        id: makeId("nudge"),
        date: today(),
        kind: "claude_emphasis" as const,
        text: `Applied the plan proposed for ${p.date}: ${p.blocks.length} blocks, focus "${p.focus || "—"}".`,
      },
    ].slice(-NUDGE_LOG_MAX),
  };
  // If the applied day is today, keep streak credit honest.
  return syncCleanCredit(next, today());
}

function revertProposal(state: PlannerState): PlannerState {
  const p = state.proposal;
  if (!p) return state;
  const day = seedDay(p.date, state.settings.dayStartMin, state.templateOverrides);
  const next: PlannerState = {
    ...state,
    days: { ...state.days, [p.date]: day },
    proposal: { ...p, status: "reverted" },
    nudges: [
      ...state.nudges,
      {
        id: makeId("nudge"),
        date: today(),
        kind: "claude_emphasis" as const,
        text: `Reverted the auto-applied plan for ${p.date} — back to your default day.`,
      },
    ].slice(-NUDGE_LOG_MAX),
  };
  return syncCleanCredit(next, today());
}

// ── Completion with XP + symmetric streak credit ─────────────────

function toggleComplete(state: PlannerState, id: string): PlannerState {
  const key = today();
  const day = state.days[key];
  if (!day) return state;

  const target = day.blocks.find((b) => b.id === id);
  if (!target) return state;

  const nowCompleted = !target.completed;
  const blocks = day.blocks.map((b) =>
    b.id === id
      ? {
          ...b,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : null,
        }
      : b
  );

  const next: PlannerState = {
    ...state,
    xp: Math.max(
      0,
      state.xp + (nowCompleted ? XP_PER_COMPLETE : -XP_PER_COMPLETE)
    ),
    days: { ...state.days, [key]: { ...day, blocks } },
  };

  return syncCleanCredit(next, key);
}

// ── Apply Claude's tomorrow patch (one-day emphasis, always logged) ──

function applyTomorrow(state: PlannerState, patch: TomorrowPatch): PlannerState {
  const key = today();
  const tomorrow = addDays(key, 1);
  const base =
    state.days[tomorrow] ??
    seedDay(tomorrow, state.settings.dayStartMin, state.templateOverrides);

  let day: DayPlan = { ...base };
  const next: PlannerState = state;
  const applied: string[] = [];

  if (patch.blocks && patch.blocks.length > 0) {
    day = {
      ...day,
      blocks: patch.blocks.map((b) => ({
        id: makeId(),
        type: b.type,
        title: b.title,
        durationMin: b.durationMin,
        completed: false,
        completedAt: null,
        goal: null,
      })),
    };
    applied.push(`${patch.blocks.length} blocks`);
  }
  if (patch.focus) {
    day = { ...day, goal: patch.focus };
    applied.push("focus");
  }

  let reminderLines = next.reminderLines;
  let lineWeights = next.lineWeights;
  if (patch.presleepAffirmation) {
    const exists = reminderLines.some((l) => l.text === patch.presleepAffirmation);
    if (!exists) {
      const newId = makeId("line");
      reminderLines = [
        {
          id: newId,
          text: patch.presleepAffirmation,
          category: patch.weightGoal ?? "identity",
        },
        ...reminderLines,
      ];
      lineWeights = { ...lineWeights, [newId]: 3 }; // surfaces quickly, still capped
      applied.push("a fresh affirmation");
    }
  }

  let claudeEmphasis = next.claudeEmphasis;
  let nudges = next.nudges;
  if (patch.weightGoal) {
    claudeEmphasis = { category: patch.weightGoal, date: tomorrow };
    applied.push(`emphasis on ${patch.weightGoal}`);
  }
  if (applied.length) {
    nudges = [
      ...nudges,
      {
        id: makeId("nudge"),
        date: key,
        kind: "claude_emphasis" as const,
        text: `From tonight's Claude session: applied ${applied.join(", ")} for tomorrow.`,
      },
    ].slice(-NUDGE_LOG_MAX);
  }

  return {
    ...next,
    reminderLines,
    lineWeights,
    claudeEmphasis,
    nudges,
    days: { ...next.days, [tomorrow]: day },
  };
}

// ── Reflection → duration growth (user-initiated, logged) ────────

function reflectYesterday(
  state: PlannerState,
  date: string,
  ranLongTitles: string[]
): PlannerState {
  const day = state.days[date];
  const overrides = { ...state.templateOverrides };
  const titleNudgeDates = { ...state.titleNudgeDates };
  const nudges = [...state.nudges];
  const key = today();

  for (const title of ranLongTitles) {
    const current =
      overrides[title] ??
      day?.blocks.find((b) => b.title === title)?.durationMin ??
      resolveBaselineDuration(title, overrides);
    const grown = Math.min(MAX_DURATION, current + 15);
    if (grown === current) continue;
    overrides[title] = grown;
    titleNudgeDates[title] = key; // auto-trim won't fight a fresh grow
    nudges.push({
      id: makeId("nudge"),
      date: key,
      kind: "duration_grow",
      text: `"${title}" ran long — grew ${current}m → ${grown}m to match how it actually goes.`,
    });
  }

  return {
    ...state,
    templateOverrides: overrides,
    titleNudgeDates,
    nudges: nudges.slice(-NUDGE_LOG_MAX),
    days: day
      ? { ...state.days, [date]: { ...day, reflected: true } }
      : state.days,
  };
}
