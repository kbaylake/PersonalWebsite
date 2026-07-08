"use client";

import { Flame, Shield, Zap, X } from "lucide-react";
import { XP_PER_LEVEL } from "./blockConfig";

export interface HudProps {
  xp: number;
  level: number;
  streak: number;
  graceRemaining: number;
  lifetimeCleanDays: number;
  completedCount: number;
  totalCount: number;
  notice: { kind: "protected" | "reset"; days: number } | null;
  onDismissNotice: () => void;
}

export default function ProgressHud(props: HudProps) {
  const progress = props.xp % XP_PER_LEVEL;
  const pct = Math.round((progress / XP_PER_LEVEL) * 100);

  const dayPct =
    props.totalCount > 0
      ? Math.round((props.completedCount / props.totalCount) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/40 to-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Level + XP */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-200 text-xs font-bold">
              {props.level}
            </span>
            <span className="text-xs uppercase tracking-widest text-violet-300/70">
              Level
            </span>
            <span
              key={props.xp}
              className="planner-xp-bump ml-auto flex items-center gap-1 text-sm font-mono text-violet-200"
            >
              <Zap size={13} className="text-violet-400" />
              {props.xp} XP
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {XP_PER_LEVEL - progress} XP to level {props.level + 1}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 flex-wrap">
        {/* Streak */}
        <div className="flex items-center gap-2">
          <Flame
            size={18}
            className={props.streak > 0 ? "text-orange-400" : "text-zinc-600"}
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-100">
              {props.streak} day{props.streak === 1 ? "" : "s"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              streak
            </p>
          </div>
        </div>

        {/* Grace shields */}
        <div className="flex items-center gap-1.5" title="Grace — one protected miss, refills as you stack clean days">
          {Array.from({ length: Math.max(1, props.graceRemaining) }).map((_, i) => (
            <Shield
              key={i}
              size={16}
              className={
                i < props.graceRemaining
                  ? "text-violet-300 fill-violet-500/30"
                  : "text-zinc-700"
              }
            />
          ))}
        </div>

        {/* Lifetime */}
        <div className="ml-auto text-right leading-tight">
          <p className="text-sm font-semibold text-zinc-100">
            {props.lifetimeCleanDays}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            clean days
          </p>
        </div>
      </div>

      {/* Today progress */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
          <span>Today</span>
          <span>
            {props.completedCount}/{props.totalCount}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${dayPct}%` }}
          />
        </div>
      </div>

      {props.notice && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
            props.notice.kind === "protected"
              ? "bg-violet-950/40 border border-violet-700/40 text-violet-100"
              : "bg-zinc-800/60 border border-zinc-700 text-zinc-200"
          }`}
        >
          <span className="flex-1">
            {props.notice.kind === "protected"
              ? "Streak protected — that one's covered. Grace refills as you stack clean days."
              : `Streak's back to 0 — a data point, not a verdict. Your ${props.lifetimeCleanDays} clean days, level, and XP are still yours. One clean day starts the next run.`}
          </span>
          <button
            onClick={props.onDismissNotice}
            aria-label="Dismiss"
            className="btn-press text-zinc-400 hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
