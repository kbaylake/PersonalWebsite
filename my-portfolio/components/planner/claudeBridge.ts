import type {
  BlockType,
  ReminderCategory,
  TomorrowPatch,
  GoalArea,
  NudgeLogEntry,
} from "./types";
import type { ScheduledBlock } from "./util";
import { BLOCK_TYPES, MIN_DURATION, MAX_DURATION, GOAL_META } from "./blockConfig";
import { formatClock } from "./util";

const CATEGORIES: ReminderCategory[] = [
  "identity",
  "car",
  "focus",
  "devotion",
  "presence",
  "discipline",
];

const MAX_PASTE_CHARS = 200_000;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export interface TodayCardInput {
  date: string;
  identityStatement: string;
  carLine: string;
  goal: string;
  scheduled: ScheduledBlock[];
  xp: number;
  level: number;
  streak: number;
  graceRemaining: number;
  sosCount: number;
  reflectionNote: string;
  alignmentToday: number;
  alignmentAvg14: number | null;
  goalAreas: GoalArea[];
  weakestGoalLabel: string;
  recentNudges: NudgeLogEntry[];
}

/** Build the copyable card the user pastes into their Claude.ai app. */
export function buildTodayCard(i: TodayCardInput): string {
  const done = i.scheduled.filter((s) => s.block.completed);
  const missed = i.scheduled.filter((s) => !s.block.completed);

  const blockLine = (s: ScheduledBlock) =>
    `- [${s.block.completed ? "x" : " "}] ${formatClock(s.startMin)} ${s.block.title} (${s.block.type}${s.block.goal ? `, goal: ${GOAL_META[s.block.goal].short}` : ""}, ${s.block.durationMin}m)`;

  const goalLines = i.goalAreas
    .map((g) => `- ${g.label}: rated ${g.rating}/10`)
    .join("\n");

  const nudgeLines = i.recentNudges.length
    ? i.recentNudges.map((n) => `- (${n.date}) ${n.text}`).join("\n")
    : "- (none yet)";

  return `You are my end-of-day coach. Ground your reply in the methods of Joseph Murphy (*The Power of Your Subconscious Mind*), Maxwell Maltz (*Psycho-Cybernetics*), and Joe Dispenza (*Becoming Supernatural*).

WHO I AM (my self-image — reinforce it, don't rebuild it):
${i.identityStatement}
${i.carLine}

MY FOUR GOAL AREAS (weekly self-ratings):
${goalLines}
Current growth edge (where my system is leaning support): ${i.weakestGoalLabel}

TODAY (${i.date})
One thing: ${i.goal || "(none set)"}
Alignment: ${i.alignmentToday}/100${i.alignmentAvg14 !== null ? ` (14-day avg ${i.alignmentAvg14})` : ""} · Done ${done.length}/${i.scheduled.length} blocks · XP ${i.xp} (level ${i.level}) · streak ${i.streak} · grace ${i.graceRemaining} · redirects used ${i.sosCount}

Blocks:
${i.scheduled.map(blockLine).join("\n")}

${missed.length ? `What I didn't get to:\n${missed.map((s) => `- ${s.block.title}`).join("\n")}` : "I completed everything."}

Recent automatic adjustments my planner made (its training log):
${nudgeLines}

My reflection: ${i.reflectionNote || "(none written)"}

HOW TO COACH ME:
1. Treat misses as feedback and course-correction, never failure (Maltz). Don't scold.
2. Help me feel the elevated emotion of the future as already real — gratitude, pride, devotion (Dispenza).
3. End by helping me hold, in present tense, that I'm already this man and already own the car — an impression to fall asleep on (Murphy).
Talk with me for a few turns. When we're done, and ONLY then, output tomorrow's plan as ONE fenced code block whose fence tag is exactly \`planner\` (three backticks + the word planner). It must be the LAST fenced block in your reply. Omit any field you don't want to change. The format (shown indented here so it can't be mistaken for the real block):

    \`\`\`planner
    {
      "focus": "the one thing for tomorrow",
      "weightGoal": "focus",
      "presleepAffirmation": "a first-person present-tense line to end tomorrow on",
      "blocks": [
        { "title": "Deep work — the one thing", "type": "work", "durationMin": 120 }
      ]
    }
    \`\`\`

Rules: "type" must be one of ${BLOCK_TYPES.join(", ")}; "weightGoal" one of ${CATEGORIES.join(", ")}; "durationMin" a multiple of 15 between ${MIN_DURATION} and ${MAX_DURATION}. Keep it realistic for a real human day.`;
}

// ── Strict parser for the pasted reply ───────────────────────────

/**
 * Extract the LAST fenced block tagged exactly `planner`. The fence must sit
 * at the start of a line (≤3 spaces, per CommonMark) — the card's 4-space
 * indented format example can therefore never match — and the tag must be
 * followed by whitespace (so `planner-example` can't match). Taking the last
 * occurrence means a paste of a whole conversation resolves to Claude's
 * final answer, never to an instructional example earlier in the thread.
 */
function extractJson(text: string): string | null {
  const re = /(?:^|\n) {0,3}```planner\s+([\s\S]*?)```/gi;
  let last: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) last = m[1];
  if (last) return last.trim();
  // Fenced content exists but none is a line-start `planner` block — don't
  // guess (a bare-JSON fallback here could grab the card's own example).
  if (/```/.test(text)) return null;
  // Fallback: a bare JSON object pasted without any fence.
  const bare = text.match(/\{[\s\S]*\}/);
  return bare ? bare[0].trim() : null;
}

function safeParse(jsonStr: string): unknown {
  try {
    return JSON.parse(jsonStr, (key, value) =>
      FORBIDDEN_KEYS.has(key) ? undefined : value
    );
  } catch {
    return null;
  }
}

export function parseTomorrow(text: string): TomorrowPatch | null {
  if (typeof text !== "string" || !text.trim()) return null;
  const jsonStr = extractJson(text.slice(0, MAX_PASTE_CHARS));
  if (!jsonStr) return null;

  const raw = safeParse(jsonStr);
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const patch: TomorrowPatch = {};

  if (typeof obj.focus === "string" && obj.focus.trim()) {
    patch.focus = obj.focus.trim().slice(0, 200);
  }
  if (
    typeof obj.weightGoal === "string" &&
    CATEGORIES.includes(obj.weightGoal as ReminderCategory)
  ) {
    patch.weightGoal = obj.weightGoal as ReminderCategory;
  }
  if (
    typeof obj.presleepAffirmation === "string" &&
    obj.presleepAffirmation.trim()
  ) {
    patch.presleepAffirmation = obj.presleepAffirmation.trim().slice(0, 300);
  }
  if (Array.isArray(obj.blocks)) {
    type PatchBlock = { title: string; type: BlockType; durationMin: number };
    const blocks: PatchBlock[] = [];
    for (const b of obj.blocks.slice(0, 40)) {
      if (typeof b !== "object" || b === null) continue;
      const bo = b as Record<string, unknown>;
      const title = typeof bo.title === "string" ? bo.title.trim() : "";
      const type = bo.type as BlockType;
      const durRaw = typeof bo.durationMin === "number" ? bo.durationMin : NaN;
      if (!title || !BLOCK_TYPES.includes(type) || Number.isNaN(durRaw)) continue;
      const dur = Math.min(
        MAX_DURATION,
        Math.max(MIN_DURATION, Math.round(durRaw / 15) * 15)
      );
      blocks.push({ title: title.slice(0, 120), type, durationMin: dur });
    }
    if (blocks.length > 0) patch.blocks = blocks.slice(0, 20);
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
