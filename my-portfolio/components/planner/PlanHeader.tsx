"use client";

import { Target, Sunrise, MoonStar } from "lucide-react";
import { formatClock, formatDuration } from "./util";

export interface PlanHeaderProps {
  goal: string;
  dayStartMin: number;
  totalMin: number;
  onSetGoal: (goal: string) => void;
  onSetDayStart: (min: number) => void;
}

export default function PlanHeader(props: PlanHeaderProps) {
  const endMin = props.dayStartMin + props.totalMin;
  const hh = Math.floor(props.dayStartMin / 60);
  const mm = props.dayStartMin % 60;
  const timeValue = `${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {/* One goal */}
      <div className="rounded-2xl border border-violet-800/40 bg-zinc-900/50 p-4">
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-violet-300/70 mb-2">
          <Target size={13} /> Today&rsquo;s one thing
        </label>
        <input
          value={props.goal}
          onChange={(e) => props.onSetGoal(e.target.value)}
          placeholder="The single thing that would make today a win…"
          className="w-full bg-transparent text-lg text-zinc-100 placeholder:text-zinc-600 outline-none border-b border-zinc-800 focus:border-violet-500 pb-1 transition-colors"
        />
      </div>

      {/* Day window */}
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-300">
          <Sunrise size={15} className="text-amber-400" />
          <span className="text-zinc-500 text-xs">Start</span>
          <input
            type="time"
            value={timeValue}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              if (!Number.isNaN(h) && !Number.isNaN(m))
                props.onSetDayStart(h * 60 + m);
            }}
            className="bg-transparent text-zinc-100 outline-none font-mono"
          />
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-400">
          <MoonStar size={15} className="text-slate-400" />
          <span className="text-zinc-500 text-xs">Ends</span>
          <span className="font-mono text-zinc-200">{formatClock(endMin)}</span>
        </div>
        <span className="ml-auto text-xs text-zinc-500 font-mono">
          {formatDuration(props.totalMin)} planned
        </span>
      </div>
    </div>
  );
}
