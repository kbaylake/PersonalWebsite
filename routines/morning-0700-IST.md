# Becoming — Morning Routine (07:00 IST)

Fires at **07:00 IST**, before the 07:30 wake, so the day is already laid out
when he opens his eyes.

**Run this on Sonnet.** You are the *actuator* half of the servo. Overnight the
evening routine proposed today's plan and wrote a coaching note. Your job now:
put the plan live in the real world — on his Google Calendar with reminders,
as weak-hour pushes to his phone, and as a digest email — so when he wakes the
day is already set up around who he's becoming. You never invent completions.

## Environment
- Site base URL: `https://bedifutureworks.com`
- Sync key: env `PLANNER_SYNC_KEY`. If empty → stop (ntfy alert if a topic is known).
- `today` = the current `Asia/Kolkata` calendar date.

## Step 1 — Pull state
```bash
curl -s -H "x-planner-key: $PLANNER_SYNC_KEY" https://bedifutureworks.com/api/planner/sync
```
Parse `{ rev, state }` → `S`. On failure/401/503: stop.

## Step 2 — Land the plan for today
Look at `S.proposal`.
- If it exists and `proposal.date === today`:
  - If `status === "approved"`: apply it cleanly.
  - If `status === "pending"` (he didn't approve in time): apply it anyway (that's the hybrid-servo default), and set a flag so the app shows a one-tap revert.
  - Applying = build `S.days[today]` with `blocks` from `proposal.blocks` (each: fresh id, `completed:false`, `completedAt:null`, carry `type/title/durationMin/goal`), set `days[today].goal = proposal.focus`, preserve any existing `captures`. Then set `proposal.status = "applied"`.
  - Append a training-log nudge to `S.nudges` (cap 30): if it was auto-applied unapproved, text = `"Applied this morning's plan you hadn't approved — one-tap revert is on the board."`; if approved, `"Set up the plan you approved last night."`
- If there's no usable proposal: leave `S.days[today]` as the app seeded it (his default day). Don't fabricate one.

## Step 3 — Write the morning coaching cue
Set `S.coachNote.morning` (keep the same `date === today`; preserve `evening` if
present) to a 2-line present-tense rehearsal cue aimed at today's growth edge
(the highest-weight goal in `S.goalWeights`) and today's focus. Warm, specific,
Dispenza-style elevated emotion. Example: *"Before the day grabs you: see the
6.50 signed and the Octavia yours. Today's deep-work block is where that man
shows up — go one level deeper than yesterday."*

## Step 4 — Push blocks to Google Calendar (connector)
Using the Google Calendar MCP tool, on his primary calendar:
1. **First delete** today's previously-planner-created events, so re-runs never
   duplicate. Identify them by the marker string `"[becoming]"` in the event
   description for today's date. List today's events, delete the ones whose
   description contains `[becoming]`.
2. **Create** one timed event per block in `S.days[today].blocks`, in schedule
   order starting at `S.days[today].dayStartMin` (minutes from local midnight,
   IST), each lasting its `durationMin`. Title = block title. Description =
   `"[becoming] <type>"`. Add a popup reminder at 0 minutes (fires a phone
   notification). Skip `sleep`/wind-down blocks if you like, or include them.
   If the Calendar tool is unavailable, skip this step and note it — do not fail
   the whole routine.

## Step 5 — Weak-hour phone pings (ntfy)
If `S.pingPrefs.weakHourPings` is true AND `S.pingPrefs.ntfyTopic` is set:
- Take the 1–2 weak hours the evening routine identified (recompute from
  `S.distractionEvents` bucketed by IST hour if needed).
- For each, schedule a ping carrying a relevant identity line (pick one whose
  category maps to the growth edge; else the identity statement). ntfy supports
  scheduled delivery via the `At:` header:
```bash
curl -s -H "Title: Becoming" -H "At: <e.g. 3pm>" \
  -d "<the identity line>" https://ntfy.sh/<topic>
```
Cap at 3 pings for the day.

## Step 6 — Morning digest email (connector)
Using the Gmail MCP tool, send the owner (his own address) a short digest:
- Subject: `Becoming — <today>, your day is set`
- Body: identity statement · today's ONE thing · a compact table of blocks
  (time — title — duration) · yesterday's alignment (`S.alignment[yesterday]`)
  · the growth edge · one line from the coaching note.
- **Send it** (not just draft) in the real morning run. During a dry-run, create
  a draft instead so nothing is actually sent.

## Step 7 — Write state back
Append a `S.routineLog` entry (cap 14):
`{ ts: "<now ISO>", kind: "morning", summary: "applied <k> blocks, <n> calendar events, <p> pings, digest sent" }`.
Then PUT with the `rev` from step 1:
```bash
curl -s -X PUT -H "x-planner-key: $PLANNER_SYNC_KEY" -H "Content-Type: application/json" \
  -d '{"rev": <rev>, "state": <full mutated S> }' \
  https://bedifutureworks.com/api/planner/sync
```
- 200 → done.
- 409 → GET fresh state, re-apply steps 2–6 additive changes, PUT once more. If it 409s again, ntfy an alert and stop.
- Other error → ntfy alert if a topic is known, then stop.

**Guardrails:** never set any block `completed`, never change `xp`, `streak`,
`graceRemaining`, or `lifetimeCleanDays` — those belong to his real actions and
the app's own math. You only lay the day out in the world and hand it to him.
