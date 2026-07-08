import type { BlockType, ReminderCategory, TomorrowPatch } from "./types";
import type { ScheduledBlock } from "./util";
import { BLOCK_TYPES } from "./blockConfig";
import { formatClock } from "./util";

const CATEGORIES: ReminderCategory[] = [
  "identity",
  "car",
  "focus",
  "devotion",
  "presence",
  "discipline",
];

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
}

/** Build the copyable card the user pastes into their Claude.ai app. */
export function buildTodayCard(i: TodayCardInput): string {
  const done = i.scheduled.filter((s) => s.block.completed);
  const missed = i.scheduled.filter((s) => !s.block.completed);

  const blockLine = (s: ScheduledBlock) =>
    `- [${s.block.completed ? "x" : " "}] ${formatClock(s.startMin)} ${s.block.title} (${s.block.type}, ${s.block.durationMin}m)`;

  return `You are my end-of-day coach. Ground your reply in the methods of Joseph Murphy (*The Power of Your Subconscious Mind*), Maxwell Maltz (*Psycho-Cybernetics*), and Joe Dispenza (*Becoming Supernatural*).

WHO I AM (my self-image — reinforce it, don't rebuild it):
${i.identityStatement}
${i.carLine}

TODAY (${i.date})
One thing: ${i.goal || "(none set)"}
Done: ${done.length}/${i.scheduled.length} blocks · XP ${i.xp} (level ${i.level}) · streak ${i.streak} · grace ${i.graceRemaining} · redirects used ${i.sosCount}

Blocks:
${i.scheduled.map(blockLine).join("\n")}

${missed.length ? `What I didn't get to:\n${missed.map((s) => `- ${s.block.title}`).join("\n")}` : "I completed everything."}

My reflection: ${i.reflectionNote || "(none written)"}

HOW TO COACH ME:
1. Treat misses as feedback and course-correction, never failure (Maltz). Don't scold.
2. Help me feel the elevated emotion of the future as already real — gratitude, pride, devotion (Dispenza).
3. End by helping me hold, in present tense, that I'm already this man and already own the car — an impression to fall asleep on (Murphy).
Talk with me for a few turns. When we're done, and ONLY then, output tomorrow as a single fenced code block in exactly this format (omit any field you don't want to change):

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

Rules for the block: "type" must be one of ${BLOCK_TYPES.join(", ")}; "weightGoal" one of ${CATEGORIES.join(", ")}; "durationMin" a multiple of 15 between 15 and 480. Keep it realistic for a real human day.`;
}

// ── Strict parser for the pasted reply ───────────────────────────

function extractJson(text: string): string | null {
  // Prefer a ```planner fenced block; fall back to any fenced block, then raw.
  const fenced =
    text.match(/```(?:planner)?\s*([\s\S]*?)```/i)?.[1] ??
    text.match(/\{[\s\S]*\}/)?.[0];
  return fenced ? fenced.trim() : null;
}

export function parseTomorrow(text: string): TomorrowPatch | null {
  const jsonStr = extractJson(text);
  if (!jsonStr) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr.startsWith("{") ? jsonStr : `{${jsonStr}}`);
  } catch {
    try {
      raw = JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }
  if (typeof raw !== "object" || raw === null) return null;
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
    for (const b of obj.blocks) {
      if (typeof b !== "object" || b === null) continue;
      const bo = b as Record<string, unknown>;
      const title = typeof bo.title === "string" ? bo.title.trim() : "";
      const type = bo.type as BlockType;
      const durRaw = typeof bo.durationMin === "number" ? bo.durationMin : NaN;
      if (!title || !BLOCK_TYPES.includes(type) || Number.isNaN(durRaw)) continue;
      const dur = Math.min(480, Math.max(15, Math.round(durRaw / 15) * 15));
      blocks.push({ title: title.slice(0, 120), type, durationMin: dur });
    }
    if (blocks.length > 0) patch.blocks = blocks.slice(0, 20);
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
