"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { PlannerState } from "./types";
import { weightedReminderLine } from "./servo";

export interface IdentityBarProps {
  state: PlannerState;
  today: string;
  dayStartMin: number;
  onShown: (lineId: string) => void;
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
  const [lineId, setLineId] = useState<string | null>(null);
  const [fadeKey, setFadeKey] = useState(0);
  const { state, today, dayStartMin, onShown } = props;
  const lastIdRef = useRef<string | null>(null);
  const onShownRef = useRef(onShown);
  onShownRef.current = onShown;

  useEffect(() => {
    function refresh() {
      const line = weightedReminderLine(state, today, dayStartMin);
      if (!line || lastIdRef.current === line.id) return;
      lastIdRef.current = line.id;
      setLineId(line.id);
      setFadeKey((k) => k + 1);
      onShownRef.current(line.id);
    }
    // First paint + re-evaluate every minute so the rotation lands live.
    const t = setTimeout(refresh, 0);
    const iv = setInterval(refresh, 60_000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.reminderLines,
    state.goalWeights,
    state.lineWeights,
    state.claudeEmphasis,
    state.settings.reminderCadenceMin,
    today,
    dayStartMin,
  ]);

  const line = state.reminderLines.find((l) => l.id === lineId);

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950/80 backdrop-blur border-b border-violet-900/30">
      <p className="text-sm font-semibold text-zinc-100 leading-snug">
        {state.settings.identityStatement}
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
