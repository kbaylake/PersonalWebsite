// Shared types for the planner. Pure types — safe to import from server or client.

export type BlockType =
  | "work"
  | "break"
  | "learn"
  | "exercise"
  | "leisure"
  | "sleep";

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  durationMin: number;
  completed: boolean;
  completedAt: string | null;
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
  weightGoal: ReminderCategory | null;
  car: {
    label: string;
    line: string; // present-tense ownership line
    numbers: string; // e.g. "6.50L · ₹2L down · collect after Pune"
  };
}

export interface PlannerState {
  version: number;
  hydrated: boolean; // true once loaded from storage + reconciled (not persisted-critical)
  notice: { kind: "protected" | "reset"; days: number } | null;
  xp: number;
  streak: number;
  graceRemaining: number;
  cleanRunTowardToken: number;
  lifetimeCleanDays: number;
  lastAllCompleteDate: string | null;
  lastEvalDate: string | null; // last date streak-rollover was run for
  templateOverrides: Record<string, number>; // block title → learned duration
  days: Record<string, DayPlan>;
  settings: PlannerSettings;
  reminderLines: ReminderLine[];
  pleasureJoyPairs: PleasureJoyPair[];
  sosEvents: SosEvent[];
}

// The strictly-validated shape a pasted `planner` block from Claude may contain.
export interface TomorrowPatch {
  blocks?: { title: string; type: BlockType; durationMin: number }[];
  focus?: string;
  weightGoal?: ReminderCategory;
  presleepAffirmation?: string;
}
