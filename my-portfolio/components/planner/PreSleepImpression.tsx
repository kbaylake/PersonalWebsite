"use client";

import { useState } from "react";
import { MoonStar, ArrowRight, X, Copy, Check, Sparkles, Heart } from "lucide-react";
import type { TomorrowPatch, ReminderLine } from "./types";
import type { ScheduledBlock } from "./util";
import { PRESLEEP_STEPS } from "./anchorContent";
import { buildTodayCard, type TodayCardInput } from "./claudeBridge";
import { parseTomorrow } from "./claudeBridge";
import { useOverlay } from "./useOverlay";

export interface PreSleepProps {
  cardInput: Omit<TodayCardInput, "reflectionNote">;
  scheduled: ScheduledBlock[];
  coachEveningNote: string; // the routine's personal reframe for tonight
  presleepLine: ReminderLine | undefined; // tonight's servo-chosen affirmation
  resonanceCandidates: ReminderLine[]; // lines actually shown today
  resonanceDone: boolean;
  onResonance: (lineId: string) => void;
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
  const [resonated, setResonated] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);
  const overlayRef = useOverlay(props.onClose);

  const reflectStep = GUIDED; // 3
  const resonanceStep = GUIDED + 1; // 4
  const bridgeStep = GUIDED + 2; // 5
  const totalSteps = GUIDED + 3;

  function card(): string {
    return buildTodayCard({ ...props.cardInput, reflectionNote: note });
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
        text: "Couldn't read a valid plan block. Paste Claude's final ```planner``` block.",
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

  const skipResonance = props.resonanceDone || props.resonanceCandidates.length === 0;

  function advance() {
    let next = step + 1;
    if (next === resonanceStep && skipResonance) next += 1;
    if (next > bridgeStep) {
      props.onComplete(note.trim());
      return;
    }
    setStep(next);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pre-sleep impression"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-950/97 to-black backdrop-blur-md" />
      <div
        ref={overlayRef}
        className="relative w-full max-w-md rounded-3xl border border-slate-700/40 bg-zinc-900/90 p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar"
      >
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
            <div className="text-center min-h-[7rem]">
              <h2 className="text-lg font-bold text-zinc-100 mb-2">
                {PRESLEEP_STEPS[step].title}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {PRESLEEP_STEPS[step].body}
              </p>
              {/* First step carries the routine's personal coaching reframe */}
              {step === 0 && props.coachEveningNote && (
                <p className="mt-4 rounded-xl border border-violet-800/40 bg-violet-950/25 px-4 py-3 text-sm text-violet-100 leading-relaxed text-left">
                  {props.coachEveningNote}
                </p>
              )}
              {/* Final guided step: tonight's servo-chosen line to sleep on */}
              {step === GUIDED - 1 && props.presleepLine && (
                <p className="mt-4 rounded-xl border border-violet-800/40 bg-violet-950/20 px-4 py-3 text-sm italic text-violet-200">
                  &ldquo;{props.presleepLine.text}&rdquo;
                </p>
              )}
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
              What happened, how you felt, what ran long. It&rsquo;s quoted back
              to you tomorrow morning.
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

        {/* Resonance — one tap trains the rotation */}
        {step === resonanceStep && !skipResonance && (
          <div className="min-h-[6rem]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart size={15} className="text-violet-400" />
              <h2 className="text-lg font-bold text-zinc-100">
                Which line carried you today?
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mb-3 text-center">
              One tap — it&rsquo;ll show up a bit more often. Skip if none did.
            </p>
            <div className="space-y-2">
              {props.resonanceCandidates.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setResonated(l.id);
                    props.onResonance(l.id);
                  }}
                  disabled={resonated !== null}
                  className={`btn-press w-full text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                    resonated === l.id
                      ? "border-violet-500 bg-violet-500/20 text-violet-100"
                      : resonated !== null
                        ? "border-zinc-800 text-zinc-600"
                        : "border-zinc-700 text-zinc-300 hover:border-violet-700"
                  }`}
                >
                  {l.text}
                </button>
              ))}
            </div>
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
              paste its final{" "}
              <span className="text-violet-300">```planner```</span> block back
              here.
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
                No Claude tonight? That&rsquo;s fine — just finish. Tomorrow
                still adapts on its own.
              </p>
            </div>
          </div>
        )}

        {/* Progress + advance */}
        <div className="flex gap-1.5 my-6">
          {Array.from({ length: totalSteps }).map((_, s) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-slate-400" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={advance}
          className="btn-press w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-xl py-3"
        >
          {step >= bridgeStep ? "Rest now" : "Next"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
