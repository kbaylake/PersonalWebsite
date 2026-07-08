// Shared types for the planner. Pure types — safe to import from server or client.

export type BlockType =
  | "work"
  | "break"
  | "learn"
  | "exercise"
  | "leisure"
  | "sleep";

// ── The servo target: the four goal areas ────────────────────────

export type GoalId = "car" | "engineer" | "redirect" | "presence";

export interface GoalArea {
  id: GoalId;
  label: string;
  rating: number; // 1-10 weekly self-rating — the explicit Maltz gap
}

export type NudgeKind =
  | "duration_trim"
  | "duration_grow"
  | "weight_shift"
  | "line_resonance"
  | "claude_emphasis";

export interface NudgeLogEntry {
  id: string;
  date: string; // IST date the nudge was applied
  kind: NudgeKind;
  text: string; // human-readable reason — this IS the training log
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  durationMin: number;
  completed: boolean;
  completedAt: string | null;
  goal: GoalId | null; // tap-to-cycle chip; null = untagged
}

export interface CaptureEntry {
  id: string;
  ts: string; // ISO timestamp
  text: string;
}

export interface DayPlan {
  date: string; // IST YYYY-MM-DD
  dayStartMin: number; // minutes from local midnight
  goal: string;
  blocks: Block[];
  captures: CaptureEntry[];
  reflected: boolean;
  morningPrimeDone: boolean;
  preSleepDone: boolean;
  note: string; // pre-sleep reflection — persisted, quoted back next morning
  shownLineIds: string[]; // lines the IdentityBar actually rendered today (cap 4)
  resonanceLineId: string | null; // "which line carried you" — write-once per day
}

export type ReminderCategory =
  | "identity"
  | "car"
  | "focus"
  | "devotion"
  | "presence"
  | "discipline";

export interface ReminderLine {
  id: string;
  text: string;
  category: ReminderCategory;
}

export interface PleasureJoyPair {
  id: string;
  pleasure: string;
  joy: string;
}

export interface SosEvent {
  id: string;
  ts: string;
  triggerTag: string | null;
  maxStepReached: number;
  reachedPerson: boolean;
  outcome: "passed" | "escalated" | "abandoned" | null;
}

export interface PlannerSettings {
  identityStatement: string;
  dayStartMin: number;
  reminderCadenceMin: number;
  contactName: string;
  contactPhone: string;
  georgiaName: string;
  weightGoal: ReminderCategory | null; // transient one-day Claude override; cleared at next tick
  car: {
    label: string;
    line: string; // present-tense ownership line
    numbers: string; // e.g. "6.50L · ₹2L down · collect after Pune"
  };
}

export interface PlannerState {
  version: number;
  hydrated: boolean; // transient — stripped before persisting
  notice: { kind: "protected" | "reset"; days: number } | null; // transient
  xp: number;
  streak: number;
  graceRemaining: number;
  cleanRunTowardToken: number;
  lifetimeCleanDays: number;
  lastAllCompleteDate: string | null;
  lastEvalDate: string | null; // last date the daily servo tick evaluated
  templateOverrides: Record<string, number>; // block title → learned duration
  days: Record<string, DayPlan>;
  settings: PlannerSettings;
  reminderLines: ReminderLine[];
  pleasureJoyPairs: PleasureJoyPair[];
  sosEvents: SosEvent[];
  // ── v2 servo state ──
  goalAreas: GoalArea[];
  goalWeights: Record<GoalId, number>; // normalized, sums to 1; recomputed at tick + check-in
  lastWeakestGoal: GoalId | null;
  lastCheckinDate: string | null; // null = check-in due (first-run baseline)
  alignment: Record<string, number>; // date → finalized 0-100 (today never stored)
  nudges: NudgeLogEntry[]; // ring buffer, most recent last, cap 30
  lineWeights: Record<string, number>; // lineId → 1..6 resonance weight
  titleStats: Record<string, ("done" | "miss")[]>; // rolling last-7 outcomes per template title
  titleNudgeDates: Record<string, string>; // title → date of last auto duration nudge
  claudeEmphasis: { category: ReminderCategory; date: string } | null; // one-day override from the bridge
}

// The strictly-validated shape a pasted `planner` block from Claude may contain.
export interface TomorrowPatch {
  blocks?: { title: string; type: BlockType; durationMin: number }[];
  focus?: string;
  weightGoal?: ReminderCategory;
  presleepAffirmation?: string;
}
