"use client";

import { useState } from "react";
import { Sunrise, ArrowRight, X, BrainCircuit } from "lucide-react";
import type { NudgeLogEntry, GoalId } from "./types";
import { MORNING_STEPS } from "./anchorContent";
import { GOAL_META } from "./blockConfig";
import { useOverlay } from "./useOverlay";

export interface MorningPrimeProps {
  initialFocus: string;
  lastNightNote: string; // yesterday's pre-sleep note, quoted back
  coachMorningNote: string; // the routine's 2-line rehearsal cue for today
  overnightNudges: NudgeLogEntry[]; // adjustments since yesterday
  rehearsalGoal: GoalId;
  rehearsalReason: "claude" | "sos" | "missed" | "weakest";
  rehearsalMissedTitle?: string;
  onComplete: (focus: string) => void;
  onClose: () => void;
}

const REHEARSAL_LINE: Record<GoalId, string> = {
  car: "See yourself signing at 6.50, hand on the Octavia's wheel — feel the quiet pride of it being already yours.",
  engineer:
    "See this afternoon's deep-work block landing — tabs closed, one level deeper, the work only the top agent engineer ships.",
  redirect:
    "See the pull arriving today — and see yourself stand, breathe, and walk toward something real instead. Feel how solid that man is.",
  presence:
    "See tonight's table — phone face-down, eyes up, fully with the people in front of you. Feel how grounded that is.",
};

const REASON_INTRO: Record<MorningPrimeProps["rehearsalReason"], string> = {
  claude: "Tonight's Claude session pointed today here:",
  sos: "Yesterday the pull showed up — so today we rehearse meeting it:",
  missed: "Yesterday this slipped — so today we rehearse it landing:",
  weakest: "This week's growth edge gets the rehearsal:",
};

export default function MorningPrime(props: MorningPrimeProps) {
  const hasIntro =
    props.overnightNudges.length > 0 ||
    !!props.lastNightNote ||
    !!props.coachMorningNote;
  const [step, setStep] = useState(hasIntro ? -1 : 0);
  const [focus, setFocus] = useState(props.initialFocus);
  const overlayRef = useOverlay(props.onClose);

  const total = MORNING_STEPS.length;
  const onFocusStep = step >= total;
  const goalMeta = GOAL_META[props.rehearsalGoal];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Morning prime"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-zinc-950/95 to-zinc-950 backdrop-blur-md" />
      <div
        ref={overlayRef}
        className="relative w-full max-w-md rounded-3xl border border-amber-700/30 bg-zinc-900/90 p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <button
          onClick={props.onClose}
          aria-label="Close"
          className="btn-press absolute top-4 right-4 text-zinc-500 hover:text-zinc-200"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Sunrise size={18} className="text-amber-400" />
          <span className="text-xs uppercase tracking-widest text-amber-300/80">
            Morning prime
          </span>
        </div>

        {/* Step -1: proof the system listened overnight */}
        {step === -1 && (
          <div className="min-h-[9rem]">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={16} className="text-violet-400" />
              <h2 className="text-lg font-bold text-zinc-100">
                While you slept, it listened
              </h2>
            </div>
            {props.coachMorningNote && (
              <p className="mb-3 rounded-xl border border-violet-800/40 bg-violet-950/30 p-3 text-sm text-violet-100 leading-relaxed">
                {props.coachMorningNote}
              </p>
            )}
            {props.lastNightNote && (
              <blockquote className="mb-3 border-l-2 border-slate-500/50 pl-3 text-sm italic text-slate-300">
                Last night you said: &ldquo;{props.lastNightNote}&rdquo;
              </blockquote>
            )}
            {props.overnightNudges.length > 0 ? (
              <ul className="space-y-1.5">
                {props.overnightNudges.slice(-3).map((n) => (
                  <li key={n.id} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-violet-400 mt-0.5">→</span>
                    {n.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400">
                No adjustments needed — yesterday held its shape.
              </p>
            )}
          </div>
        )}

        {/* Breathing circle for the guided steps */}
        {step >= 0 && !onFocusStep && (
          <div className="flex justify-center mb-6">
            <div className="planner-breathe w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-amber-400/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-amber-400/20" />
            </div>
          </div>
        )}

        {step >= 0 && !onFocusStep && (
          <div className="text-center min-h-[8rem]">
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              {MORNING_STEPS[step].title}
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {MORNING_STEPS[step].body}
            </p>
            {/* The rehearsal step gets the servo's target woven in */}
            {step === 1 && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-left">
                <p className={`text-[10px] uppercase tracking-widest mb-1 ${goalMeta.text}`}>
                  {REASON_INTRO[props.rehearsalReason]}
                </p>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {props.rehearsalMissedTitle
                    ? `See "${props.rehearsalMissedTitle}" going all the way through today — started on time, finished, checked. Feel the click of keeping your word.`
                    : REHEARSAL_LINE[props.rehearsalGoal]}
                </p>
              </div>
            )}
          </div>
        )}

        {onFocusStep && (
          <div className="text-center min-h-[7rem]">
            <h2 className="text-lg font-bold text-zinc-100 mb-3">
              Today&rsquo;s one thing
            </h2>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Name the single win for today…"
              className="w-full bg-zinc-950/60 border border-amber-700/40 rounded-xl px-4 py-3 text-center text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 my-6">
          {Array.from({ length: total + 1 + (hasIntro ? 1 : 0) }).map((_, s) => {
            const dotStep = hasIntro ? s - 1 : s;
            return (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  dotStep <= step ? "bg-amber-500" : "bg-zinc-700"
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={() => {
            if (onFocusStep) props.onComplete(focus.trim());
            else setStep(step + 1);
          }}
          className="btn-press w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-3"
        >
          {onFocusStep ? "Begin the day" : "Next"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
