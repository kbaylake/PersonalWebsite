"use client";

import { Car } from "lucide-react";

export interface CarAnchorProps {
  line: string;
  numbers: string;
}

export default function CarAnchor(props: CarAnchorProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-800/40 bg-gradient-to-br from-zinc-900 to-violet-950/30 p-4">
      <Car
        size={80}
        className="absolute -right-3 -bottom-3 text-violet-500/10"
        aria-hidden
      />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-widest text-violet-300/60 mb-1">
          Already mine
        </p>
        <p className="text-base font-semibold text-zinc-100 leading-snug">
          {props.line}
        </p>
        <p className="mt-1.5 font-mono text-xs text-violet-300/80">
          {props.numbers}
        </p>
      </div>
    </div>
  );
}
