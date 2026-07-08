"use client";

import { useState } from "react";
import { Crosshair, X } from "lucide-react";
import type { GoalArea, GoalId, PlannerState } from "./types";
import { GOAL_META } from "./blockConfig";
import { missRateFor } from "./servo";

export interface WeeklyCheckinProps {
  goalAreas: GoalArea[];
  state: PlannerState;
  today: string;
  firstTime: boolean;
  onSave: (ratings: Record<GoalId, number>) => void;
  onDismiss: () => void;
}

/** Four sliders, auto-defaults, one tap. This IS setting the servo's target. */
export default function WeeklyCheckin(props: WeeklyCheckinProps) {
  const [ratings, setRatings] = useState<Record<GoalId, number>>(() => {
    const r = {} as Record<GoalId, number>;
    for (const g of props.goalAreas) r[g.id] = g.rating;
    return r;
  });

  return (
    <div className="rounded-2xl border border-violet-700/40 bg-violet-950/20 p-4 animate-scale-in">
      <div className="flex items-start justify-between mb-1">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-violet-300/80">
          <Crosshair size={13} />
          {props.firstTime ? "Set your target" : "Weekly check-in — 15 seconds"}
        </p>
        <button
          onClick={props.onDismiss}
          aria-label="Skip for now"
          className="btn-press text-zinc-500 hover:text-zinc-200"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-zinc-300 mb-4">
        {props.firstTime
          ? "Where does each area honestly feel right now? This is the self-image the system steers by."
          : "Where does each area feel this week? Lower ratings pull more support their way."}
      </p>

      <div className="space-y-4">
        {props.goalAreas.map((g) => {
          const meta = GOAL_META[g.id];
          const miss = Math.round(missRateFor(props.state, g.id, props.today) * 100);
          return (
            <div key={g.id}>
              <div className="flex items-baseline justify-between mb-1">
                <label
                  htmlFor={`rate-${g.id}`}
                  className={`text-sm font-medium ${meta.text}`}
                >
                  {g.label}
                </label>
                <span className="text-xs font-mono text-zinc-400">
                  {ratings[g.id]}/10
                  {miss > 0 && (
                    <span className="text-zinc-600"> · {miss}% missed</span>
                  )}
                </span>
              </div>
              <input
                id={`rate-${g.id}`}
                type="range"
                min={1}
                max={10}
                step={1}
                value={ratings[g.id]}
                onChange={(e) =>
                  setRatings((r) => ({ ...r, [g.id]: Number(e.target.value) }))
                }
                className="w-full accent-violet-500"
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={() => props.onSave(ratings)}
        className="btn-press mt-5 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 text-sm"
      >
        {props.firstTime ? "Lock in my target" : "Done"}
      </button>
    </div>
  );
}
