"use client";

import { useEffect, useState } from "react";
import { Wind, PhoneCall, Sparkles, X, Check } from "lucide-react";
import type { PleasureJoyPair, SosEvent } from "./types";
import { SOS_LINE } from "./anchorContent";
import { makeId } from "./util";
import { useOverlay } from "./useOverlay";

export interface SosOverlayProps {
  identityStatement: string;
  pairs: PleasureJoyPair[];
  seedIndex: number;
  contactName: string;
  contactPhone: string;
  onLog: (event: SosEvent) => void;
  onClose: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4; // 4 = neutral close after the one allowed loop

export default function SosOverlay(props: SosOverlayProps) {
  const [step, setStep] = useState<Step>(0);
  const [loops, setLoops] = useState(0);
  const [reachedPerson, setReachedPerson] = useState(false);
  const pair = props.pairs.length
    ? props.pairs[props.seedIndex % props.pairs.length]
    : undefined;

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  }, []);

  function finish(outcome: SosEvent["outcome"]) {
    props.onLog({
      id: makeId("sos"),
      ts: new Date().toISOString(),
      triggerTag: null,
      maxStepReached: Math.min(step, 3),
      reachedPerson,
      outcome,
    });
    props.onClose();
  }

  const overlayRef = useOverlay(() => finish("abandoned"));

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Redirect"
    >
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md" />
      <div
        ref={overlayRef}
        className="relative w-full max-w-md rounded-3xl border border-violet-700/40 bg-zinc-900 p-6 shadow-2xl animate-scale-in"
      >
        <button
          onClick={() => finish("abandoned")}
          aria-label="Close"
          className="btn-press absolute top-4 right-4 text-zinc-500 hover:text-zinc-200"
        >
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-violet-500" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mb-4">
              <Wind size={26} className="text-violet-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              First, move your body
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Stand up. Five slow breaths. Cold water on your face, or 20
              pushups. This isn&rsquo;t a need — it&rsquo;s the empty-bored-lost
              feeling. Break the loop physically first.
            </p>
            <button
              onClick={() => setStep(1)}
              className="btn-press w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3"
            >
              Done — next
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mb-4">
              <PhoneCall size={24} className="text-emerald-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              Reach a real person
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Presence beats a screen every time. One message, one call — get
              out of your own head.
            </p>
            {props.contactPhone ? (
              <div className="flex gap-2 mb-3">
                <a
                  href={`tel:${props.contactPhone}`}
                  onClick={() => setReachedPerson(true)}
                  className="btn-press flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3"
                >
                  Call {props.contactName || "them"}
                </a>
                <a
                  href={`sms:${props.contactPhone}`}
                  onClick={() => setReachedPerson(true)}
                  className="btn-press flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3"
                >
                  Text
                </a>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 mb-3">
                Tip: add a go-to contact in settings so this is one tap.
              </p>
            )}
            <button
              onClick={() => setStep(2)}
              className="btn-press w-full text-zinc-400 hover:text-zinc-200 text-sm py-2"
            >
              Skip — next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-violet-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              Become the man
            </h2>
            <p className="text-sm italic text-violet-200 mb-4 leading-relaxed">
              {props.identityStatement}
            </p>
            {pair && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-left mb-6">
                <p className="text-xs text-zinc-500 line-through mb-1">
                  {pair.pleasure}
                </p>
                <p className="text-sm text-violet-200 font-medium">{pair.joy}</p>
              </div>
            )}
            <button
              onClick={() => setStep(3)}
              className="btn-press w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3"
            >
              I&rsquo;m ready
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-2 leading-relaxed">{SOS_LINE}</p>
            <h2 className="text-lg font-bold text-zinc-100 mb-6">Did it pass?</h2>
            <div className="flex gap-2">
              <button
                onClick={() => finish("passed")}
                className="btn-press flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3"
              >
                It passed
              </button>
              <button
                onClick={() => {
                  if (loops === 0) {
                    setLoops(1);
                    setStep(0);
                  } else {
                    setStep(4);
                  }
                }}
                className="btn-press flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl py-3"
              >
                Still here — again
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mb-4">
              <Check size={26} className="text-violet-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              Logged. That&rsquo;s not nothing.
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              You stood in it and reached for the tool twice — that&rsquo;s the
              rep that rewires. Step away from the screen now; the feeling
              finishes passing on its own.
            </p>
            <button
              onClick={() => finish("escalated")}
              className="btn-press w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
