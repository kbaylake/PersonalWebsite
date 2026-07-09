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
  // ── v3 cybernetic-loop state (written by the scheduled routines) ──
  proposal: PlanProposal | null;
  coachNote: CoachNote | null;
  coachInbox: CoachMessage[]; // async chat with the coach; cap 50
  distractionEvents: DistractionEvent[]; // merged from the sensor endpoint; cap 200
  pingPrefs: PingPrefs;
  routineLog: RoutineLogEntry[]; // last 14 routine runs
}

// The strictly-validated shape a pasted `planner` block from Claude may contain.
export interface TomorrowPatch {
  blocks?: { title: string; type: BlockType; durationMin: number }[];
  focus?: string;
  weightGoal?: ReminderCategory;
  presleepAffirmation?: string;
}

// ── v3: the real-life cybernetic loop (controller = scheduled Claude agent) ──

export interface ProposalBlock {
  type: BlockType;
  title: string;
  durationMin: number;
  goal: GoalId | null;
  fixed?: boolean; // a real calendar meeting — surfaced but not reshuffled
}

/** Tomorrow's plan, proposed by the evening routine, approved at pre-sleep. */
export interface PlanProposal {
  date: string; // the day this plan is for
  focus: string;
  blocks: ProposalBlock[];
  rationale: string; // one short paragraph: why this shape, from what it sensed
  status: "pending" | "approved" | "applied" | "reverted";
  createdBy: string; // "evening-routine" | "morning-routine"
}

/** The routine's written coaching, surfaced in the rituals. */
export interface CoachNote {
  date: string;
  morning?: string; // 2-line rehearsal cue → MorningPrime step 0
  evening?: string; // Maltz/Dispenza/Murphy reframe → pre-sleep guided text
}

export interface CoachMessage {
  id: string;
  ts: string;
  from: "user" | "coach";
  text: string;
}

export interface DistractionEvent {
  ts: string; // ISO
  app: string;
}

export interface PingPrefs {
  ntfyTopic: string; // free ntfy.sh push topic (syncs across devices + routines)
  weakHourPings: boolean; // let the loop pre-plant reminders in weak hours
}

export interface RoutineLogEntry {
  ts: string;
  kind: "morning" | "evening";
  summary: string;
}
