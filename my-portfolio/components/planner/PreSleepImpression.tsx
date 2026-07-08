"use client";

import { useState } from "react";
import { MoonStar, ArrowRight, X, Copy, Check, Sparkles } from "lucide-react";
import type { TomorrowPatch } from "./types";
import type { ScheduledBlock } from "./util";
import { PRESLEEP_STEPS } from "./anchorContent";
import { buildTodayCard, parseTomorrow } from "./claudeBridge";

export interface PreSleepProps {
  date: string;
  identityStatement: string;
  carLine: string;
  goal: string;
  scheduled: ScheduledBlock[];
  xp: number;
  level: number;
  streak: number;
  graceRemaining: number;
  sosCount: number;
  onApplyTomorrow: (patch: TomorrowPatch) => void;
  onComplete: (reflectionNote: string) => void;
  onClose: () => void;
}

const GUIDED = PRESLEEP_STEPS.length;

export default function PreSleepImpression(props: PreSleepProps) {
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [applyMsg, setApplyMsg] = useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  const reflectStep = GUIDED;
  const bridgeStep = GUIDED + 1;

  function card(): string {
    return buildTodayCard({
      date: props.date,
      identityStatement: props.identityStatement,
      carLine: props.carLine,
      goal: props.goal,
      scheduled: props.scheduled,
      xp: props.xp,
      level: props.level,
      streak: props.streak,
      graceRemaining: props.graceRemaining,
      sosCount: props.sosCount,
      reflectionNote: note,
    });
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(card());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function applyPaste() {
    const patch = parseTomorrow(paste);
    if (!patch) {
      setApplyMsg({
        kind: "err",
        text: "Couldn't read a valid plan block. Paste the ```planner``` block Claude gives you.",
      });
      return;
    }
    props.onApplyTomorrow(patch);
    const parts: string[] = [];
    if (patch.focus) parts.push("tomorrow's focus");
    if (patch.blocks) parts.push(`${patch.blocks.length} blocks`);
    if (patch.presleepAffirmation) parts.push("a new affirmation");
    if (patch.weightGoal) parts.push(`emphasis on ${patch.weightGoal}`);
    setApplyMsg({
      kind: "ok",
      text: `Applied ${parts.join(", ")}. Tomorrow's set.`,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pre-sleep impression"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-950/97 to-black backdrop-blur-md" />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700/40 bg-zinc-900/90 p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={props.onClose}
          aria-label="Close"
          className="btn-press absolute top-4 right-4 text-zinc-500 hover:text-zinc-200"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <MoonStar size={18} className="text-slate-300" />
          <span className="text-xs uppercase tracking-widest text-slate-300/80">
            Pre-sleep impression
          </span>
        </div>

        {/* Guided steps */}
        {step < GUIDED && (
          <>
            <div className="flex justify-center mb-6">
              <div className="planner-breathe planner-breathe-slow w-24 h-24 rounded-full bg-gradient-to-br from-slate-500/20 to-violet-500/20 border border-slate-400/20" />
            </div>
            <div className="text-center min-h-[6rem]">
              <h2 className="text-lg font-bold text-zinc-100 mb-2">
                {PRESLEEP_STEPS[step].title}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {PRESLEEP_STEPS[step].body}
              </p>
            </div>
          </>
        )}

        {/* Reflection */}
        {step === reflectStep && (
          <div className="min-h-[6rem]">
            <h2 className="text-lg font-bold text-zinc-100 mb-2 text-center">
              A line for the day
            </h2>
            <p className="text-sm text-zinc-500 mb-3 text-center">
              What happened, how you felt, what ran long — for you and for
              Claude tonight.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Tonight I…"
              className="w-full resize-none bg-zinc-950/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
        )}

        {/* Claude bridge */}
        {step === bridgeStep && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-violet-400" />
              <h2 className="text-base font-bold text-zinc-100">
                Talk it through with Claude
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
              Copy this into your Claude.ai app, have the conversation, then
              paste the <span className="text-violet-300">```planner```</span>{" "}
              block it gives you back here.
            </p>

            <div className="relative">
              <pre className="max-h-40 overflow-y-auto no-scrollbar rounded-xl bg-zinc-950/70 border border-zinc-800 p-3 text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
                {card()}
              </pre>
              <button
                onClick={copyCard}
                className="btn-press absolute top-2 right-2 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg px-2.5 py-1.5"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Paste Claude&rsquo;s reply for tomorrow
              </label>
              <textarea
                value={paste}
                onChange={(e) => {
                  setPaste(e.target.value);
                  setApplyMsg(null);
                }}
                rows={3}
                placeholder="Paste the ```planner``` block here…"
                className="w-full resize-none bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <button
                onClick={applyPaste}
                disabled={!paste.trim()}
                className="btn-press mt-2 w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-100 font-medium rounded-xl py-2.5 text-sm"
              >
                Apply to tomorrow
              </button>
              {applyMsg && (
                <p
                  className={`mt-2 text-xs ${
                    applyMsg.kind === "ok" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {applyMsg.text}
                </p>
              )}
              <p className="mt-2 text-[11px] text-zinc-600">
                No Claude tonight? That&rsquo;s fine — just skip. Tomorrow still
                adapts on its own.
              </p>
            </div>
          </div>
        )}

        {/* Progress + advance */}
        <div className="flex gap-1.5 my-6">
          {Array.from({ length: GUIDED + 2 }).map((_, s) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-slate-400" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (step < bridgeStep) setStep(step + 1);
            else props.onComplete(note.trim());
          }}
          className="btn-press w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-xl py-3"
        >
          {step < bridgeStep ? "Next" : "Rest now"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
