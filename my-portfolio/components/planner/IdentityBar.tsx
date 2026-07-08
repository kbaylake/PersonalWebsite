"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ReminderLine } from "./types";
import { currentReminderIndex } from "./util";

export interface IdentityBarProps {
  identityStatement: string;
  reminders: ReminderLine[];
  dayStartMin: number;
  cadenceMin: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  identity: "who I am",
  car: "the car",
  focus: "the work",
  devotion: "devotion",
  presence: "presence",
  discipline: "discipline",
};

export default function IdentityBar(props: IdentityBarProps) {
  const [idx, setIdx] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    function refresh() {
      const next = currentReminderIndex(
        props.dayStartMin,
        props.cadenceMin,
        props.reminders.length
      );
      setIdx(next);
      setFadeKey((k) => k + 1);
    }
    refresh();
    // Re-evaluate every minute so the ~2h rotation lands without a reload.
    const iv = setInterval(refresh, 60_000);
    return () => clearInterval(iv);
  }, [props.dayStartMin, props.cadenceMin, props.reminders.length]);

  const line = props.reminders[idx];

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950/80 backdrop-blur border-b border-violet-900/30">
      <p className="text-sm font-semibold text-zinc-100 leading-snug">
        {props.identityStatement}
      </p>
      {line && (
        <div
          key={fadeKey}
          className="animate-fade-in-up mt-1.5 flex items-start gap-2"
        >
          <Sparkles size={14} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-sm italic text-violet-300 leading-snug">
            {line.text}
            <span className="ml-2 not-italic text-[10px] uppercase tracking-wider text-violet-500/60">
              {CATEGORY_LABEL[line.category]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
