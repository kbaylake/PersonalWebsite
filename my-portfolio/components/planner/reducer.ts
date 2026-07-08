import type {
  PlannerState,
  Block,
  BlockType,
  DayPlan,
  SosEvent,
  TomorrowPatch,
  PlannerSettings,
} from "./types";
import { istDateString, addDays, makeId } from "./util";
import { seedDay, MAX_GRACE, TOKEN_REGEN_CLEAN_DAYS } from "./store";
import { XP_PER_COMPLETE, SOS_XP, DEFAULT_DAY } from "./blockConfig";

export type Action =
  | { type: "HYDRATE"; state: PlannerState }
  | { type: "SET_GOAL"; goal: string }
  | { type: "SET_DAY_START"; min: number }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "STEP_DURATION"; id: string; delta: number }
  | { type: "EDIT_TITLE"; id: string; title: string }
  | { type: "SET_TYPE"; id: string; blockType: BlockType }
  | { type: "ADD_BLOCK" }
  | { type: "DELETE_BLOCK"; id: string }
  | { type: "RESTORE_BLOCK"; block: Block; index: number }
  | { type: "REORDER"; from: number; to: number }
  | { type: "MOVE"; index: number; dir: -1 | 1 }
  | { type: "ADD_CAPTURE"; text: string }
  | { type: "DELETE_CAPTURE"; id: string }
  | { type: "MARK_MORNING_DONE"; focus: string }
  | { type: "MARK_PRESLEEP_DONE" }
  | { type: "LOG_SOS"; event: SosEvent }
  | { type: "APPLY_TOMORROW"; patch: TomorrowPatch }
  | { type: "REFLECT_YESTERDAY"; date: string; ranLongTitles: string[] }
  | { type: "DISMISS_DAY"; date: string }
  | { type: "DISMISS_NOTICE" }
  | { type: "UPDATE_SETTINGS"; partial: Partial<PlannerSettings> };

const MAX_DURATION = 480;

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

export function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

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
                  Math.max(15, b.durationMin + action.delta)
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

    case "ADD_BLOCK":
      return withToday(state, (d) => ({
        ...d,
        blocks: [
          ...d.blocks,
          {
            id: makeId(),
            type: "work",
            title: "New block",
            durationMin: 30,
            completed: false,
            completedAt: null,
          },
        ],
      }));

    case "DELETE_BLOCK":
      return withToday(state, (d) => ({
        ...d,
        blocks: d.blocks.filter((b) => b.id !== action.id),
      }));

    case "RESTORE_BLOCK":
      return withToday(state, (d) => {
        const blocks = [...d.blocks];
        const idx = Math.min(Math.max(0, action.index), blocks.length);
        blocks.splice(idx, 0, action.block);
        return { ...d, blocks };
      });

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
      return withToday(state, (d) => ({ ...d, preSleepDone: true }));

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

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.partial,
          car: { ...state.settings.car, ...(action.partial.car ?? {}) },
        },
      };

    case "REFLECT_YESTERDAY":
      return reflectYesterday(state, action.date, action.ranLongTitles);

    case "DISMISS_DAY":
      return {
        ...state,
        days: state.days[action.date]
          ? {
              ...state.days,
              [action.date]: { ...state.days[action.date], reflected: true },
            }
          : state.days,
      } as PlannerState;

    default:
      return state;
  }
}

// ── Completion with XP + optimistic streak ───────────────────────

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
  const newDay: DayPlan = { ...day, blocks };

  const xp = Math.max(
    0,
    state.xp + (nowCompleted ? XP_PER_COMPLETE : -XP_PER_COMPLETE)
  );

  const wasCounted = state.lastAllCompleteDate === key;
  const cleanNow = blocks.length > 0 && blocks.every((b) => b.completed);

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
    if (cleanRunTowardToken >= TOKEN_REGEN_CLEAN_DAYS && graceRemaining < MAX_GRACE) {
      graceRemaining += 1;
      cleanRunTowardToken -= TOKEN_REGEN_CLEAN_DAYS;
    }
    lastAllCompleteDate = key;
  } else if (!cleanNow && wasCounted) {
    streak = Math.max(0, streak - 1);
    lifetimeCleanDays = Math.max(0, lifetimeCleanDays - 1);
    cleanRunTowardToken = Math.max(0, cleanRunTowardToken - 1);
    lastAllCompleteDate = null;
  }

  return {
    ...state,
    xp,
    streak,
    lifetimeCleanDays,
    cleanRunTowardToken,
    graceRemaining,
    lastAllCompleteDate,
    days: { ...state.days, [key]: newDay },
  };
}

// ── Apply Claude's tomorrow patch ────────────────────────────────

function applyTomorrow(state: PlannerState, patch: TomorrowPatch): PlannerState {
  const tomorrow = addDays(today(), 1);
  const base =
    state.days[tomorrow] ??
    seedDay(tomorrow, state.settings.dayStartMin, state.templateOverrides);

  let day: DayPlan = { ...base };

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
      })),
    };
  }
  if (patch.focus) day = { ...day, goal: patch.focus };

  let reminderLines = state.reminderLines;
  if (patch.presleepAffirmation) {
    const exists = reminderLines.some(
      (l) => l.text === patch.presleepAffirmation
    );
    if (!exists) {
      reminderLines = [
        { id: makeId("line"), text: patch.presleepAffirmation, category: "identity" },
        ...reminderLines,
      ];
    }
  }

  const settings = patch.weightGoal
    ? { ...state.settings, weightGoal: patch.weightGoal }
    : state.settings;

  return {
    ...state,
    settings,
    reminderLines,
    days: { ...state.days, [tomorrow]: day },
  };
}

// ── Reflection → duration learning ───────────────────────────────

function reflectYesterday(
  state: PlannerState,
  date: string,
  ranLongTitles: string[]
): PlannerState {
  const day = state.days[date];
  const overrides = { ...state.templateOverrides };

  for (const title of ranLongTitles) {
    const current =
      overrides[title] ??
      day?.blocks.find((b) => b.title === title)?.durationMin ??
      DEFAULT_DAY.find((t) => t.title === title)?.durationMin ??
      30;
    overrides[title] = Math.min(MAX_DURATION, current + 15);
  }

  return {
    ...state,
    templateOverrides: overrides,
    days: day
      ? { ...state.days, [date]: { ...day, reflected: true } }
      : state.days,
  };
}
