"use client";

import { Sunrise, MoonStar, Check, ArrowRight } from "lucide-react";
import type { DayPlan } from "./types";
import { BLOCK_TYPE_META } from "./blockConfig";
import {
  istNowMinutes,
  formatClock,
  formatDuration,
  type ScheduledBlock,
} from "./util";

export interface NowCardProps {
  day: DayPlan;
  scheduled: ScheduledBlock[];
  alignmentToday: number;
  onOpenMorning: () => void;
  onOpenPresleep: () => void;
  onComplete: (id: string) => void;
}

const EVENING_MIN = 21 * 60;

/**
 * The first fold: one time-aware next action.
 * Morning (prime not done) → start the prime. Evening → close the day.
 * Otherwise → the current/next block with a single big complete tap.
 */
export default function NowCard(props: NowCardProps) {
  const now = istNowMinutes();
  const { day } = props;

  // Morning state: prime not done and it's before mid-afternoon.
  if (!day.morningPrimeDone && now < 15 * 60) {
    return (
      <button
        onClick={props.onOpenMorning}
        className="btn-press w-full flex items-center gap-3 rounded-2xl border border-amber-600/50 bg-gradient-to-r from-amber-950/50 to-zinc-900 p-4 text-left"
      >
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 shrink-0">
          <Sunrise size={20} className="text-amber-300" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-amber-100">
            Start here — morning prime
          </span>
          <span className="block text-xs text-amber-200/60 mt-0.5">
            2 minutes: see the day already done, feel it, then begin.
          </span>
        </span>
        <ArrowRight size={18} className="text-amber-300 shrink-0" />
      </button>
    );
  }

  // Evening state: everything done (or it's late) and pre-sleep pending.
  const incomplete = props.scheduled.filter((s) => !s.block.completed);
  const isEvening = now >= EVENING_MIN || incomplete.length === 0;
  if (!day.preSleepDone && isEvening) {
    const doneCount = props.scheduled.length - incomplete.length;
    return (
      <button
        onClick={props.onOpenPresleep}
        className="btn-press w-full flex items-center gap-3 rounded-2xl border border-slate-500/50 bg-gradient-to-r from-slate-900 to-zinc-900 p-4 text-left"
      >
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-500/20 border border-slate-400/40 shrink-0">
          <MoonStar size={20} className="text-slate-200" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-slate-100">
            Close the day
          </span>
          <span className="block text-xs text-slate-300/60 mt-0.5">
            {doneCount}/{props.scheduled.length} blocks ·{" "}
            {props.alignmentToday}/100 aligned · end on the right impression.
          </span>
        </span>
        <ArrowRight size={18} className="text-slate-300 shrink-0" />
      </button>
    );
  }

  // Midday state: the current (or next) incomplete block, one-tap complete.
  const current =
    incomplete.find((s) => s.startMin <= now && now < s.endMin) ?? incomplete[0];
  if (!current) return null; // everything done and pre-sleep done — board shows the rest

  const meta = BLOCK_TYPE_META[current.block.type];
  const Icon = meta.icon;
  const isNow = current.startMin <= now && now < current.endMin;
  const remaining = isNow ? current.endMin - now : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border ${meta.border} ${meta.tint} p-4`}
    >
      <span
        className={`flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-950/40 border ${meta.border} shrink-0`}
      >
        <Icon size={20} className={meta.text} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          {isNow ? "Right now" : "Up next"}
        </p>
        <p className="text-sm font-bold text-zinc-100 truncate">
          {current.block.title}
        </p>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          {formatClock(current.startMin)} – {formatClock(current.endMin)}
          {remaining !== null && (
            <span className={meta.text}> · {formatDuration(remaining)} left</span>
          )}
        </p>
      </div>
      <button
        onClick={() => props.onComplete(current.block.id)}
        aria-label={`Complete ${current.block.title}`}
        className={`btn-press flex items-center justify-center w-12 h-12 rounded-full ${meta.accent} text-zinc-950 shrink-0`}
      >
        <Check size={22} strokeWidth={3} />
      </button>
    </div>
  );
}
