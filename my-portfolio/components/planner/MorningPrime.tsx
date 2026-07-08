"use client";

import { useState } from "react";
import { Sunrise, ArrowRight, X } from "lucide-react";
import { MORNING_STEPS } from "./anchorContent";

export interface MorningPrimeProps {
  initialFocus: string;
  onComplete: (focus: string) => void;
  onClose: () => void;
}

export default function MorningPrime(props: MorningPrimeProps) {
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState(props.initialFocus);
  const total = MORNING_STEPS.length;
  const onFocusStep = step >= total;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Morning prime"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-zinc-950/95 to-zinc-950 backdrop-blur-md" />
      <div className="relative w-full max-w-md rounded-3xl border border-amber-700/30 bg-zinc-900/90 p-6 shadow-2xl animate-scale-in">
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

        {/* Breathing circle */}
        <div className="flex justify-center mb-6">
          <div className="planner-breathe w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-amber-400/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-400/20" />
          </div>
        </div>

        {!onFocusStep ? (
          <div className="text-center min-h-[7rem]">
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              {MORNING_STEPS[step].title}
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {MORNING_STEPS[step].body}
            </p>
          </div>
        ) : (
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
          {Array.from({ length: total + 1 }).map((_, s) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-amber-500" : "bg-zinc-700"
              }`}
            />
          ))}
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
