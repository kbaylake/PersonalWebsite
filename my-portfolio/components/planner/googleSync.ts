// Full Google Calendar sync — entirely client-side, matching the planner's
// no-backend architecture. Uses Google Identity Services (token flow): needs
// only a public OAuth Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID), no secret,
// no database. The token lives in memory for ~50 minutes; syncing again after
// that just re-prompts the Google popup.
//
// API cost stays minimal by design: sync runs only on an explicit tap and is
// one list call + one delete per stale event + one insert per block.

import type { ScheduledBlock } from "./util";
import { addDays } from "./util";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface TokenResponse {
  access_token?: string;
  error?: string;
}
interface TokenClient {
  requestAccessToken: () => void;
}
interface GoogleGis {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: {
        client_id: string;
        scope: string;
        callback: (resp: TokenResponse) => void;
      }) => TokenClient;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleGis;
  }
}

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (typeof window !== "undefined" && window.google?.accounts) {
    return Promise.resolve();
  }
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        gisPromise = null;
        reject(new Error("Couldn't load Google sign-in — check your connection."));
      };
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  await loadGis();
  return new Promise((resolve, reject) => {
    const tc = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.access_token) {
          cachedToken = { token: resp.access_token, expiresAt: Date.now() + 50 * 60 * 1000 };
          resolve(resp.access_token);
        } else {
          reject(new Error(resp.error || "Google sign-in was cancelled."));
        }
      },
    });
    tc.requestAccessToken();
  });
}

function isoAt(date: string, min: number): string {
  const dayShift = Math.floor(min / 1440);
  const d = dayShift ? addDays(date, dayShift) : date;
  const m = ((min % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${d}T${hh}:${mm}:00+05:30`;
}

/**
 * Push today's blocks to the user's primary Google Calendar as real events
 * with popup reminders. Idempotent: previously-synced events for this date
 * (tagged via extendedProperties) are removed first, so re-syncing after an
 * edit never duplicates. Returns the number of events created.
 */
export async function syncDayToGoogle(
  clientId: string,
  date: string,
  scheduled: ScheduledBlock[]
): Promise<number> {
  const token = await getAccessToken(clientId);
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  const listRes = await fetch(
    API +
      "?maxResults=100&privateExtendedProperty=" +
      encodeURIComponent("plannerDayDate=" + date),
    { headers }
  );
  if (!listRes.ok) throw new Error("Calendar read failed (" + listRes.status + ").");
  const existing = (await listRes.json()) as { items?: { id: string }[] };
  for (const ev of existing.items ?? []) {
    await fetch(API + "/" + ev.id, { method: "DELETE", headers });
  }

  let created = 0;
  for (const s of scheduled) {
    const body = {
      summary: s.block.title,
      description: "Becoming planner block (" + s.block.type + ")",
      start: { dateTime: isoAt(date, s.startMin), timeZone: "Asia/Kolkata" },
      end: { dateTime: isoAt(date, s.endMin), timeZone: "Asia/Kolkata" },
      reminders: { useDefault: false, overrides: [{ method: "popup" as const, minutes: 0 }] },
      extendedProperties: { private: { plannerManaged: "1", plannerDayDate: date } },
    };
    const r = await fetch(API, { method: "POST", headers, body: JSON.stringify(body) });
    if (r.ok) created += 1;
  }
  return created;
}
