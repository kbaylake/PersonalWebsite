"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import type { CaptureEntry } from "./types";

export interface CaptureLogProps {
  captures: CaptureEntry[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}

function timeLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function CaptureLog(props: CaptureLogProps) {
  const [text, setText] = useState("");

  function commit() {
    const t = text.trim();
    if (!t) return;
    props.onAdd(t);
    setText("");
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-2">
        <Zap size={13} className="text-violet-400" /> Capture
      </p>
      <p className="text-[11px] text-zinc-500 mb-2">
        Something pulling your attention? Dump it here and get back to the block.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
        rows={2}
        placeholder="An interruption, an idea, an urge… (Enter to log)"
        className="w-full resize-none bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-violet-500/40"
      />
      {props.captures.length > 0 && (
        <ul className="mt-3 space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
          {[...props.captures].reverse().map((c) => (
            <li
              key={c.id}
              className="group flex items-start gap-2 text-sm text-zinc-300"
            >
              <span className="shrink-0 text-[10px] font-mono text-zinc-600 pt-0.5 w-14">
                {timeLabel(c.ts)}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-words">
                {c.text}
              </span>
              <button
                onClick={() => props.onDelete(c.id)}
                aria-label="Delete entry"
                className="btn-press opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
