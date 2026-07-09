"use client";

import { Sparkles, Check, RotateCcw, X } from "lucide-react";
import type { PlanProposal } from "./types";
import { BLOCK_TYPE_META, GOAL_META } from "./blockConfig";
import { formatDuration } from "./util";

export interface ProposalCardProps {
  proposal: PlanProposal;
  isToday: boolean; // proposal.date === today
  onApprove: () => void;
  onApply: () => void;
  onRevert: () => void;
  onDismiss: () => void;
}

// The hybrid-servo checkpoint: the evening routine proposes tomorrow; the user
// approves it at pre-sleep. If the morning routine auto-applied it (no approval
// in time), the card flips to a one-tap "revert".
export default function ProposalCard(props: ProposalCardProps) {
  const p = props.proposal;
  if (p.status === "reverted") return null;

  // Auto-applied today, unreviewed → offer revert.
  if (p.status === "applied") {
    if (!props.isToday) return null;
    return (
      <div className="rounded-2xl border border-amber-800/50 bg-amber-950/25 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={15} className="text-amber-300" />
          <p className="text-sm font-semibold text-amber-100">
            Built while you slept
          </p>
        </div>
        <p className="text-xs text-amber-200/80 mb-3">{p.rationale}</p>
        <div className="flex gap-2">
          <button
            onClick={props.onDismiss}
            className="btn-press flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-sm font-semibold py-2.5"
          >
            <Check size={14} /> Keep it
          </button>
          <button
            onClick={props.onRevert}
            className="btn-press flex items-center justify-center gap-1.5 rounded-xl border border-amber-700/60 text-amber-200 text-sm font-medium px-4 py-2.5"
          >
            <RotateCcw size={14} /> Revert
          </button>
        </div>
      </div>
    );
  }

  if (p.status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 px-4 py-3 flex items-center gap-2">
        <Check size={15} className="text-emerald-300 shrink-0" />
        <p className="text-xs text-emerald-100 flex-1">
          Tomorrow’s plan approved — the morning routine will set it live.
        </p>
        <button
          onClick={props.onDismiss}
          aria-label="Cancel approval"
          className="btn-press text-emerald-400/70 hover:text-emerald-200"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // pending
  return (
    <div className="rounded-2xl border border-violet-700/50 bg-violet-950/25 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={15} className="text-violet-300" />
        <p className="text-sm font-semibold text-violet-100">
          A plan for {p.date === new Date().toISOString().slice(0, 10) ? "today" : "tomorrow"}
        </p>
      </div>
      {p.focus && (
        <p className="text-xs text-zinc-300 mb-1">
          <span className="text-zinc-500">One thing: </span>
          {p.focus}
        </p>
      )}
      <p className="text-xs text-violet-200/80 mb-3">{p.rationale}</p>

      <ul className="space-y-1 mb-3">
        {p.blocks.slice(0, 12).map((b, i) => {
          const meta = BLOCK_TYPE_META[b.type];
          return (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.accent}`} />
              <span className="text-zinc-200 flex-1 truncate">
                {b.title}
                {b.fixed && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-amber-400/80">
                    fixed
                  </span>
                )}
              </span>
              {b.goal && (
                <span className={`text-[10px] ${GOAL_META[b.goal].text}`}>
                  {GOAL_META[b.goal].short}
                </span>
              )}
              <span className="text-zinc-500">{formatDuration(b.durationMin)}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2">
        <button
          onClick={props.onApprove}
          className="btn-press flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5"
        >
          <Check size={14} /> Approve
        </button>
        <button
          onClick={props.onApply}
          className="btn-press flex items-center justify-center rounded-xl border border-violet-700/60 text-violet-200 text-sm font-medium px-4 py-2.5"
        >
          Apply now
        </button>
        <button
          onClick={props.onDismiss}
          aria-label="Dismiss proposal"
          className="btn-press flex items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 px-3 py-2.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
