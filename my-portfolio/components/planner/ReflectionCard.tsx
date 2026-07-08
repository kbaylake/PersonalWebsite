"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";

export interface ReflectionCardProps {
  blocks: { id: string; title: string }[];
  onSave: (ranLongTitles: string[]) => void;
  onDismiss: () => void;
}

export default function ReflectionCard(props: ReflectionCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(title: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-cyan-800/40 bg-cyan-950/20 p-4 animate-scale-in">
      <div className="flex items-start justify-between mb-1">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-300/80">
          <Clock size={13} /> 15 seconds — yesterday
        </p>
        <button
          onClick={props.onDismiss}
          aria-label="Dismiss"
          className="btn-press text-zinc-500 hover:text-zinc-200"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-zinc-300 mb-3">
        Which blocks ran long? I&rsquo;ll give them more room going forward.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {props.blocks.map((b) => (
          <button
            key={b.id}
            onClick={() => toggle(b.title)}
            className={`btn-press text-xs rounded-full border px-3 py-1.5 transition ${
              selected.has(b.title)
                ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                : "border-zinc-700 text-zinc-400 hover:border-cyan-700"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => props.onSave([...selected])}
          className="btn-press flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl py-2"
        >
          Save
        </button>
        <button
          onClick={props.onDismiss}
          className="btn-press px-4 text-sm text-zinc-400 hover:text-zinc-200"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
