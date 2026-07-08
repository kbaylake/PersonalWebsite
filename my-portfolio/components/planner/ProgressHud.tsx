"use client";

import { Flame, Shield, Zap, X, Car } from "lucide-react";
import { XP_PER_LEVEL } from "./blockConfig";
import { TOKEN_REGEN_CLEAN_DAYS } from "./store";

export interface HudProps {
  xp: number;
  level: number;
  streak: number;
  graceRemaining: number;
  cleanRunTowardToken: number;
  lifetimeCleanDays: number;
  completedCount: number;
  totalCount: number;
  carLine: string;
  carNumbers: string;
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
  const toNextShield = TOKEN_REGEN_CLEAN_DAYS - props.cleanRunTowardToken;

  return (
    <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/40 to-zinc-900/60 p-4">
      {/* Lifetime evidence leads — the number that can never go down. */}
      <div className="flex items-center gap-4">
        <div className="leading-tight">
          <p className="text-2xl font-bold text-zinc-50">
            {props.lifetimeCleanDays}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            lifetime clean days
          </p>
        </div>
        <div className="flex items-center gap-1.5 leading-tight">
          <Flame
            size={16}
            className={props.streak > 0 ? "text-orange-400" : "text-zinc-600"}
          />
          <span className="text-sm text-zinc-300">
            {props.streak}-day run
          </span>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5"
          title={
            props.graceRemaining > 0
              ? "Grace shield — one missed day is covered"
              : `Shield regenerating — ${toNextShield} clean day${toNextShield === 1 ? "" : "s"} to go`
          }
        >
          <Shield
            size={16}
            className={
              props.graceRemaining > 0
                ? "text-violet-300 fill-violet-500/30"
                : "text-zinc-600"
            }
          />
          {props.graceRemaining === 0 && (
            <span className="text-[10px] text-zinc-500">
              {toNextShield}d to refill
            </span>
          )}
        </div>
      </div>

      {/* Level / XP */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-600/20 border border-violet-500/40 text-violet-200 text-[11px] font-bold">
            {props.level}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-violet-300/70">
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
      </div>

      {/* Today progress */}
      <div className="mt-3">
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

      {/* Car anchor — folded in as a quiet fact */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-950/40 border border-violet-900/30 px-3 py-2">
        <Car size={15} className="text-violet-400/70 shrink-0" />
        <p className="flex-1 min-w-0 text-xs text-zinc-300 truncate">
          {props.carLine}
        </p>
        <p className="shrink-0 font-mono text-[10px] text-violet-300/70">
          {props.carNumbers}
        </p>
      </div>

      {props.notice && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
            props.notice.kind === "protected"
              ? "bg-violet-950/40 border border-violet-700/40 text-violet-100"
              : "bg-zinc-800/60 border border-zinc-700 text-zinc-200"
          }`}
        >
          <span className="flex-1">
            {props.notice.kind === "protected"
              ? "Streak protected — that one's covered. Grace refills as you stack clean days."
              : `Run's back to 0 — a data point, not a verdict. Your ${props.lifetimeCleanDays} lifetime clean days, level, and XP are untouched. One clean day starts the next run.`}
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
