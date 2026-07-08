"use client";

import { useState } from "react";
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Scissors,
  Expand,
  Compass,
  Heart,
  Sparkles,
} from "lucide-react";
import type { NudgeLogEntry, NudgeKind } from "./types";

const KIND_ICON: Record<NudgeKind, typeof Scissors> = {
  duration_trim: Scissors,
  duration_grow: Expand,
  weight_shift: Compass,
  line_resonance: Heart,
  claude_emphasis: Sparkles,
};

export default function NudgeFeed({ nudges }: { nudges: NudgeLogEntry[] }) {
  const [open, setOpen] = useState(false);
  if (nudges.length === 0) return null;

  const recent = [...nudges].slice(-8).reverse();
  const latest = recent[0];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <BrainCircuit size={15} className="text-violet-400 shrink-0" />
        <span className="flex-1 min-w-0 text-xs text-zinc-400 truncate">
          <span className="uppercase tracking-widest text-zinc-500 mr-2">
            Training log
          </span>
          {!open && <span className="text-zinc-400">{latest.text}</span>}
        </span>
        {open ? (
          <ChevronUp size={15} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-zinc-500 shrink-0" />
        )}
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-2">
          {recent.map((n) => {
            const Icon = KIND_ICON[n.kind] ?? BrainCircuit;
            return (
              <li key={n.id} className="flex items-start gap-2 text-xs">
                <Icon size={13} className="text-violet-400/70 mt-0.5 shrink-0" />
                <span className="flex-1 text-zinc-300">{n.text}</span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                  {n.date.slice(5)}
                </span>
              </li>
            );
          })}
          <li className="pt-1 text-[10px] text-zinc-600">
            Every automatic adjustment shows up here — nothing changes silently.
          </li>
        </ul>
      )}
    </div>
  );
}
