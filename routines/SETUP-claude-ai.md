# Becoming v3 — claude.ai setup (connectors + the two nightly schedules)

Everything the loop needs that has to live *on your Claude subscription* rather
than in the website. Do these in the **Claude app / claude.ai** while signed in
as yourself, so the routines run as you and can use your own connectors.

Prerequisite (website side, one-time): set `PLANNER_SYNC_KEY` + the Upstash env
vars in Vercel (see `planner-guide.html` § 7). Until that's done the routines
below will fail-safe and no-op — they never damage anything, they just stop.

---

## Part 1 — Enable & test the connectors

In the Claude app → **Settings → Connectors**, make sure these three are
connected (re-authorize any that show expired):

- **Google Calendar** — the morning routine writes your day here; the evening
  routine reads tomorrow's meetings.
- **Gmail** — the morning digest email.
- **Asana** — the evening routine pulls due tasks into tomorrow's plan.

Then paste this into a normal Claude chat to confirm all three respond
(read-only — it changes nothing):

```
Test my connectors, read-only, and report back in one line each:

1. Google Calendar — list my events for tomorrow (Asia/Kolkata timezone). Just titles + times.
2. Gmail — how many unread threads are in my inbox right now? Don't open or change anything.
3. Asana — list up to 5 of my tasks due today, tomorrow, or overdue. Titles + due dates only.

If any connector is not authorized, say exactly which one and stop — do not guess.
```

If Google Calendar says it needs re-authorization, reconnect it in
Settings → Connectors and run the test again. All three must answer before the
schedules below are useful.

---

## Part 2 — Register the two nightly schedules

Use **claude.ai → your profile → Scheduled tasks** (a.k.a. Automations). Create
**two** tasks. For each:

- **Timezone:** Asia/Kolkata (IST)
- **Model:** **Sonnet** (the feedback loop is Sonnet-optimised — do not use Opus/Fable here)
- **Prompt:** paste the matching routine file's full contents (below), and at the
  very top add one line with your real key:

  ```
  My planner sync key is: <PASTE_YOUR_PLANNER_SYNC_KEY_HERE>
  Wherever the routine says $PLANNER_SYNC_KEY, use that value as the x-planner-key header.
  ```

### Task A — Evening (comparator + corrector)
- **Schedule:** every day at **22:00 IST** (`0 22 * * *`)
- **Prompt body:** the full contents of `routines/evening-2200-IST.md`
- What it does: measures today's alignment, writes tonight's coaching note,
  reads tomorrow's calendar + Asana, and proposes tomorrow's plan — all written
  to your shared state so your phone shows it at pre-sleep.

### Task B — Morning (actuator)
- **Schedule:** every day at **07:00 IST** (`0 7 * * *`), before the 07:30 wake
- **Prompt body:** the full contents of `routines/morning-0700-IST.md`
- What it does: lands the approved (or auto-applied) plan on your Google
  Calendar with popup reminders, sends the morning digest email, and fires the
  weak-hour ntfy pings.

> Why not Claude Code cron? Claude Code's scheduler is session-only (dies when
> the terminal session closes, expires in 7 days) and can't reach these
> connectors headlessly. claude.ai Scheduled Tasks is the durable, connector-aware
> home for the loop.

---

## Part 3 — First-run sanity check

After both tasks are saved and the website env is set:

1. Open **bedifutureworks.com/planner**, go to **Settings**, paste the same
   sync key, and confirm the sync chip in the header turns to **synced**.
2. Either wait for 22:00, or manually run the Evening task once from the
   Scheduled Tasks screen. Within a minute the planner should show a **proposal
   card** for tomorrow and a **coach note** at pre-sleep.
3. Approve the proposal. Next morning (or a manual Morning run) should put the
   blocks on your Google Calendar and email you the digest.

If a run reports "sync key empty" or "401/503", the website env vars aren't set
yet — finish `planner-guide.html` § 7 first.
