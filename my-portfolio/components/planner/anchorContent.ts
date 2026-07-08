import type {
  ReminderLine,
  PleasureJoyPair,
  PlannerSettings,
  GoalArea,
} from "./types";

// The spine — the self-image everything ladders up to (Maltz).
export const IDENTITY_STATEMENT =
  "I am the man who keeps his word to himself — focused at his work, present with his people, devoted in his heart, and already the owner of the life he's building.";

// Rotating first-person, present-tense reminders (Murphy: repeated impression;
// Dispenza: feel it now). Positive framing only — never the negation.
export const REMINDER_LINES: ReminderLine[] = [
  // Identity
  { id: "id-1", text: "I act now the way I will when the work and the person I'm waiting for are already here.", category: "identity" },
  { id: "id-2", text: "I keep my word to myself first — that's the whole game.", category: "identity" },
  { id: "id-3", text: "I finish what I start. I'm someone worth betting on.", category: "identity" },
  // Car
  { id: "car-1", text: "I own my MK3 Octavia — I can feel the wheel in my hands.", category: "car" },
  { id: "car-2", text: "The deal closes at 6.50; I stay open and the downpayment finds its way to me.", category: "car" },
  { id: "car-3", text: "The car is already mine. The last 5% is just permission I give myself.", category: "car" },
  // Focus / career
  { id: "foc-1", text: "I do deep, undistracted work like the top agent engineer I'm becoming.", category: "focus" },
  { id: "foc-2", text: "I close the tab and go one level deeper — my future is built in this hour.", category: "focus" },
  { id: "foc-3", text: "Hard work isn't the rat race; purposeless work is. Mine has a purpose.", category: "focus" },
  // Devotion (archetype)
  { id: "dev-1", text: "I build a life worth being devoted to, so when she's here I'm already ready.", category: "devotion" },
  { id: "dev-2", text: "I become the man she'll know on sight — I feel it in my skin.", category: "devotion" },
  { id: "dev-3", text: "I don't chase the feeling from a screen; I earn the real thing by living well now.", category: "devotion" },
  // Presence
  { id: "pre-1", text: "I put the phone down and look up — the people in front of me are the point.", category: "presence" },
  { id: "pre-2", text: "Grounded connection over a glowing screen. Every time.", category: "presence" },
  // Discipline
  { id: "dis-1", text: "I spend on purpose and I save on purpose — every rupee has a job.", category: "discipline" },
  { id: "dis-2", text: "I do the boring rep because it's mine to do.", category: "discipline" },
];

// George Lucas: pleasure must double to satisfy and empties; joy compounds.
export const PLEASURE_JOY_PAIRS: PleasureJoyPair[] = [
  {
    id: "pj-1",
    pleasure: "Porn — a spike that has to double next time and leaves me emptier.",
    joy: "Devotion — presence with someone real, a feeling that compounds and stays in my skin.",
  },
  {
    id: "pj-2",
    pleasure: "Endless reels — a numb scroll I won't remember tomorrow.",
    joy: "The game / work I love — a flow I'm proud of that builds on itself.",
  },
  {
    id: "pj-3",
    pleasure: "Aimless noise and chit-chat — busy, forgettable, going nowhere.",
    joy: "Purposeful work — the effort that becomes the car and the career.",
  },
  {
    id: "pj-4",
    pleasure: "Performing for attention I don't even want.",
    joy: "Being present in my own life — solid, chosen, mine.",
  },
];

// The servo target — seeded at rating 5; the weekly check-in makes it his.
export const DEFAULT_GOAL_AREAS: GoalArea[] = [
  { id: "car", label: "The Car", rating: 5 },
  { id: "engineer", label: "Top Agent Engineer", rating: 5 },
  { id: "redirect", label: "Redirecting the Pull", rating: 5 },
  { id: "presence", label: "Presence", rating: 5 },
];

export const DEFAULT_SETTINGS: PlannerSettings = {
  identityStatement: IDENTITY_STATEMENT,
  dayStartMin: 6 * 60,
  reminderCadenceMin: 120,
  contactName: "",
  contactPhone: "",
  georgiaName: "Georgia",
  weightGoal: null,
  car: {
    label: "MK3 Skoda Octavia",
    line: "I own my MK3 Skoda Octavia.",
    numbers: "6.50L · ₹2L down · collect the week after Pune",
  },
};

// Morning prime — guided steps (Maltz rehearsal + Dispenza elevated emotion).
export const MORNING_STEPS: { title: string; body: string; seconds: number }[] = [
  {
    title: "Read who I am",
    body: IDENTITY_STATEMENT,
    seconds: 15,
  },
  {
    title: "Rehearse the day",
    body: "See it done: the deep-work session landing, the drive in the Octavia, the evening present with people. Watch the man you're becoming run today.",
    seconds: 45,
  },
  {
    title: "Feel it now",
    body: "Hold the gratitude and quiet pride of it being already true. Let it land in your chest, not your head.",
    seconds: 45,
  },
  {
    title: "Breathe it in",
    body: "Four slow breaths. In through the nose, out slow. Seal the state.",
    seconds: 30,
  },
];

// Pre-sleep impression — guided steps (Maltz feedback + Murphy sleep technique).
export const PRESLEEP_STEPS: { title: string; body: string; seconds: number }[] = [
  {
    title: "The day was feedback, not a verdict",
    body: "Whatever missed is course-correction, not failure. Note it, then let it go.",
    seconds: 20,
  },
  {
    title: "Name what went right",
    body: "Three things. Feel the gratitude for each — real, specific, yours.",
    seconds: 40,
  },
  {
    title: "Hold the wish fulfilled",
    body: "Present tense: already the man, already the owner, already devoted and present. Fall asleep on this feeling.",
    seconds: 45,
  },
];

// SOS reframe line surfaced in the redirect flow.
export const SOS_LINE =
  "Stand up. Breathe. This is the empty-bored-lost feeling — not a need. I redirect it: body first, then a real person, then back to who I'm becoming.";
