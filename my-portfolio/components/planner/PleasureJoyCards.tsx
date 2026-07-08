"use client";

import { ArrowRight } from "lucide-react";
import type { PleasureJoyPair } from "./types";

export interface PleasureJoyProps {
  pairs: PleasureJoyPair[];
  compact?: boolean;
}

export default function PleasureJoyCards({ pairs, compact }: PleasureJoyProps) {
  return (
    <div className={compact ? "space-y-2" : "grid grid-cols-1 gap-2"}>
      {pairs.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
        >
          <div className="flex items-stretch gap-3">
            <p className="flex-1 text-xs text-zinc-500 line-through decoration-zinc-600">
              {p.pleasure}
            </p>
            <ArrowRight
              size={16}
              className="shrink-0 self-center text-violet-500"
            />
            <p className="flex-1 text-xs text-violet-200 font-medium">
              {p.joy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
