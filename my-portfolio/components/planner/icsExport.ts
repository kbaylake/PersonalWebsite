// Phone reminders without any account: a downloadable .ics calendar whose
// recurring daily events carry the weighted identity lines. Import once into
// Google Calendar → real notifications at the user's cadence, zero OAuth.

import type { PlannerState } from "./types";
import { expandTickets, lineForSlot } from "./servo";

const LAST_SLOT_MIN = 23 * 60; // 11:00 PM IST — end of the waking day
const EVENT_MINUTES = 5;

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding: max 75 octets, continuation lines start with a space. */
function fold(line: string): string {
  const out: string[] = [];
  let s = line;
  while (s.length > 74) {
    out.push(s.slice(0, 74));
    s = " " + s.slice(74);
  }
  out.push(s);
  return out.join("\r\n");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function buildReminderIcs(state: PlannerState, todayDate: string): string {
  const cadence = Math.max(30, state.settings.reminderCadenceMin);
  const startMin = state.settings.dayStartMin;
  const expanded = expandTickets(state, null); // static snapshot: no one-day emphasis
  const dateCompact = todayDate.replace(/-/g, "");
  const now = new Date();
  const dtstamp =
    now.getUTCFullYear() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    "T" +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    "00Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Becoming Planner//EN",
    "CALSCALE:GREGORIAN",
    fold("X-WR-CALNAME:Becoming — reminders"),
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  let slot = 0;
  for (let t = startMin; t <= LAST_SLOT_MIN; t += cadence, slot++) {
    const line = lineForSlot(state, expanded, slot);
    if (!line) continue;
    const end = t + EVENT_MINUTES;
    lines.push(
      "BEGIN:VEVENT",
      `UID:becoming-slot-${slot}@bedifutureworks.com`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Asia/Kolkata:${dateCompact}T${pad(Math.floor(t / 60))}${pad(t % 60)}00`,
      `DTEND;TZID=Asia/Kolkata:${dateCompact}T${pad(Math.floor(end / 60))}${pad(end % 60)}00`,
      "RRULE:FREQ=DAILY",
      fold("SUMMARY:" + escapeIcs(line.text)),
      fold(
        "DESCRIPTION:" +
          escapeIcs("Becoming — open the planner for today's live line: bedifutureworks.com/planner")
      ),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      fold("DESCRIPTION:" + escapeIcs(line.text)),
      "TRIGGER:PT0S",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
