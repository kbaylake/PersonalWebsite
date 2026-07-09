"use client";

import { useState } from "react";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import type { CoachNote, CoachMessage } from "./types";

export interface CoachCardProps {
  note: CoachNote | null;
  today: string;
  inbox: CoachMessage[];
  onSend: (text: string) => void;
  /** Copy a compact day snapshot and open claude.ai for a live conversation. */
  onGoDeeper: () => void;
}

// Async coaching surface. The scheduled routine writes notes + replies into
// state; the user can leave a message any time and the next routine answers.
// "Go deeper" jumps to a live Claude conversation seeded with today.
export default function CoachCard(props: CoachCardProps) {
  const [draft, setDraft] = useState("");
  const note = props.note;
  const noteText =
    note && note.date === props.today ? note.evening || note.morning : null;
  const thread = props.inbox.slice(-6);

  function send() {
    const t = draft.trim();
    if (!t) return;
    props.onSend(t);
    setDraft("");
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle size={15} className="text-violet-400" />
        <p className="text-sm font-semibold text-zinc-200">Your coach</p>
      </div>

      {noteText && (
        <p className="text-xs italic text-violet-200/90 leading-relaxed border-l-2 border-violet-700/60 pl-3 mb-3">
          {noteText}
        </p>
      )}

      {thread.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {thread.map((m) => (
            <div
              key={m.id}
              className={`text-xs rounded-xl px-3 py-1.5 max-w-[85%] ${
                m.from === "user"
                  ? "ml-auto bg-violet-600/25 text-violet-100"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Tell your coach anything…"
          className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button
          onClick={send}
          aria-label="Send to coach"
          className="btn-press flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-3"
        >
          <Send size={15} />
        </button>
      </div>

      <button
        onClick={props.onGoDeeper}
        className="btn-press mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 py-1.5"
      >
        <ExternalLink size={13} /> Go deeper tonight — open Claude with today
      </button>
    </div>
  );
}
