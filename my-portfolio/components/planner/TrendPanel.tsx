"use client";

import { TrendingUp } from "lucide-react";
import type { PlannerState } from "./types";
import { GOAL_META } from "./blockConfig";
import { missRateFor, weakestGoal } from "./servo";
import { addDays } from "./util";

export interface TrendPanelProps {
  state: PlannerState;
  today: string;
  alignmentToday: number;
}

const DAYS = 14;
const W = 280;
const H = 56;

export default function TrendPanel({ state, today, alignmentToday }: TrendPanelProps) {
  // 13 finalized days + today's live value (dashed marker).
  const values: { v: number; live: boolean }[] = [];
  for (let i = DAYS - 1; i >= 1; i--) {
    values.push({ v: state.alignment[addDays(today, -i)] ?? 0, live: false });
  }
  values.push({ v: alignmentToday, live: true });

  const stepX = W / (DAYS - 1);
  const y = (v: number) => H - (v / 100) * (H - 6) - 3;
  const pts = values.map((d, i) => `${(i * stepX).toFixed(1)},${y(d.v).toFixed(1)}`);
  const solidPts = pts.slice(0, -1).join(" ");
  const lastSolid = pts[pts.length - 2];
  const livePt = pts[pts.length - 1];

  const weakest = weakestGoal(state.goalWeights);
  const weakArea = state.goalAreas.find((g) => g.id === weakest);
  const weakMiss = Math.round(missRateFor(state, weakest, today) * 100);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
          <TrendingUp size={13} className="text-violet-400" /> Becoming — 14 days
        </p>
        <span className="text-xs font-mono text-violet-300">
          {alignmentToday}/100 today
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-14"
        role="img"
        aria-label={`Alignment over the last 14 days, today ${alignmentToday} out of 100`}
      >
        {/* "aligned" gridline at 80 */}
        <line
          x1="0"
          y1={y(80)}
          x2={W}
          y2={y(80)}
          stroke="rgba(139,92,246,0.25)"
          strokeDasharray="3 4"
          strokeWidth="1"
        />
        <polyline
          points={solidPts}
          fill="none"
          stroke="url(#plannerTrendGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* today: dashed continuation + hollow marker */}
        <line
          x1={lastSolid.split(",")[0]}
          y1={lastSolid.split(",")[1]}
          x2={livePt.split(",")[0]}
          y2={livePt.split(",")[1]}
          stroke="rgba(216,180,254,0.7)"
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        <circle
          cx={livePt.split(",")[0]}
          cy={livePt.split(",")[1]}
          r="3.5"
          fill="#18181b"
          stroke="#d8b4fe"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="plannerTrendGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>

      {/* Per-goal bars: filled = self-rating (how it feels), marker = behavior */}
      <div className="mt-3 space-y-2">
        {state.goalAreas.map((g) => {
          const meta = GOAL_META[g.id];
          const behaviorPct = Math.round((1 - missRateFor(state, g.id, today)) * 100);
          return (
            <div key={g.id} className="flex items-center gap-2">
              <span className={`w-20 shrink-0 text-[11px] ${meta.text}`}>
                {meta.short}
              </span>
              <div className="relative flex-1 h-1.5 rounded-full bg-zinc-800 overflow-visible">
                <div
                  className={`h-full rounded-full ${meta.bar} opacity-70 transition-all duration-500`}
                  style={{ width: `${g.rating * 10}%` }}
                />
                <span
                  className="absolute -top-0.5 w-0.5 h-2.5 rounded bg-zinc-200"
                  style={{ left: `${behaviorPct}%` }}
                  title={`Behavior: ${behaviorPct}% of tagged blocks kept`}
                />
              </div>
              <span className="w-8 text-right text-[10px] font-mono text-zinc-500">
                {g.rating}/10
              </span>
            </div>
          );
        })}
      </div>

      {weakArea && (
        <p className="mt-3 text-xs text-zinc-400">
          <span className={`font-semibold ${GOAL_META[weakest].text}`}>
            Growth edge: {weakArea.label}
          </span>
          <span className="text-zinc-500">
            {" "}
            — rated {weakArea.rating}/10
            {weakMiss > 0 ? `, ${weakMiss}% of tagged blocks missed this week` : ""}.
            Reminders and rituals lean here.
          </span>
        </p>
      )}
    </div>
  );
}
