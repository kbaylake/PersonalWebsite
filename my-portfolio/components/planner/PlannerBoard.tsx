"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { Sunrise, MoonStar, Check, Settings2, ShieldAlert } from "lucide-react";
import type { PlannerState } from "./types";
import { reducer } from "./reducer";
import {
  loadState,
  saveState,
  ensureToday,
  reconcileStreak,
  createDefaultState,
} from "./store";
import {
  computeSchedule,
  totalDurationMin,
  istDateString,
  addDays,
  friendlyDate,
  istNowMinutes,
} from "./util";
import { levelFromXp } from "./blockConfig";
import IdentityBar from "./IdentityBar";
import ProgressHud from "./ProgressHud";
import CarAnchor from "./CarAnchor";
import PlanHeader from "./PlanHeader";
import BlockList from "./BlockList";
import CaptureLog from "./CaptureLog";
import PleasureJoyCards from "./PleasureJoyCards";
import SosButton from "./SosButton";
import CelebrationBanner from "./CelebrationBanner";
import MorningPrime from "./MorningPrime";
import PreSleepImpression from "./PreSleepImpression";
import ReflectionCard from "./ReflectionCard";
import SettingsPanel from "./SettingsPanel";

function greeting(): string {
  const m = istNowMinutes();
  if (m < 5 * 60) return "Still up";
  if (m < 12 * 60) return "Good morning";
  if (m < 17 * 60) return "Good afternoon";
  if (m < 21 * 60) return "Good evening";
  return "Winding down";
}

export default function PlannerBoard() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    createDefaultState as () => PlannerState
  );
  const [celebrating, setCelebrating] = useState(false);
  const [morningOpen, setMorningOpen] = useState(false);
  const [presleepOpen, setPresleepOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hydrate from localStorage + reconcile streak on mount (dispatch only).
  useEffect(() => {
    const loaded = loadState();
    const { state: withDay } = ensureToday(loaded);
    const { state: reconciled, notice } = reconcileStreak(withDay);
    dispatch({
      type: "HYDRATE",
      state: { ...reconciled, hydrated: true, notice },
    });
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (state.hydrated) saveState(state);
  }, [state]);

  const todayKey = istDateString();
  const day = state.days[todayKey];

  const scheduled = useMemo(
    () => (day ? computeSchedule(day.dayStartMin, day.blocks) : []),
    [day]
  );
  const totalMin = day ? totalDurationMin(day.blocks) : 0;
  const completedCount = day ? day.blocks.filter((b) => b.completed).length : 0;
  const totalCount = day ? day.blocks.length : 0;

  const reminders = useMemo(() => {
    const base = state.reminderLines;
    if (!state.settings.weightGoal) return base;
    const boosted = base.filter((l) => l.category === state.settings.weightGoal);
    return boosted.length ? [...boosted, ...base] : base;
  }, [state.reminderLines, state.settings.weightGoal]);

  const yKey = addDays(todayKey, -1);
  const yday = state.days[yKey];
  const showReflection = !!yday && !yday.reflected && yday.blocks.length > 0;

  if (!state.hydrated || !day) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-zinc-600">
        <div className="animate-pulse">Loading your day…</div>
      </div>
    );
  }

  const sosCount = state.sosEvents.filter((e) =>
    e.ts.startsWith(todayKey)
  ).length;

  // Toggle completion, firing the celebration exactly when the last block lands.
  function handleToggle(id: string) {
    const b = day!.blocks.find((x) => x.id === id);
    if (b && !b.completed) {
      const remaining = day!.blocks.filter(
        (x) => !x.completed && x.id !== id
      ).length;
      if (remaining === 0 && day!.blocks.length > 0) setCelebrating(true);
    }
    dispatch({ type: "TOGGLE_COMPLETE", id });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32">
      <IdentityBar
        identityStatement={state.settings.identityStatement}
        reminders={reminders}
        dayStartMin={day.dayStartMin}
        cadenceMin={state.settings.reminderCadenceMin}
      />

      {/* Greeting + settings */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <div>
          <p className="text-xs text-zinc-500">{friendlyDate(todayKey)}</p>
          <h1 className="text-lg font-bold text-zinc-100">{greeting()}.</h1>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="btn-press p-2 rounded-lg text-zinc-500 hover:text-violet-300 hover:bg-zinc-900"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {/* Ritual row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setMorningOpen(true)}
          className={`btn-press flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
            day.morningPrimeDone
              ? "border-amber-800/40 bg-amber-950/20 text-amber-300/70"
              : "border-amber-700/50 bg-amber-950/30 text-amber-200"
          }`}
        >
          {day.morningPrimeDone ? <Check size={16} /> : <Sunrise size={16} />}
          Morning prime
        </button>
        <button
          onClick={() => setPresleepOpen(true)}
          className={`btn-press flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
            day.preSleepDone
              ? "border-slate-700/40 bg-slate-900/40 text-slate-400"
              : "border-slate-600/50 bg-slate-900/40 text-slate-200"
          }`}
        >
          {day.preSleepDone ? <Check size={16} /> : <MoonStar size={16} />}
          Pre-sleep
        </button>
      </div>

      <div className="space-y-4">
        {showReflection && (
          <ReflectionCard
            blocks={yday.blocks.map((b) => ({ id: b.id, title: b.title }))}
            onSave={(titles) =>
              dispatch({
                type: "REFLECT_YESTERDAY",
                date: yKey,
                ranLongTitles: titles,
              })
            }
            onDismiss={() => dispatch({ type: "DISMISS_DAY", date: yKey })}
          />
        )}

        <ProgressHud
          xp={state.xp}
          level={levelFromXp(state.xp)}
          streak={state.streak}
          graceRemaining={state.graceRemaining}
          lifetimeCleanDays={state.lifetimeCleanDays}
          completedCount={completedCount}
          totalCount={totalCount}
          notice={state.notice}
          onDismissNotice={() => dispatch({ type: "DISMISS_NOTICE" })}
        />

        <CarAnchor line={state.settings.car.line} numbers={state.settings.car.numbers} />

        <PlanHeader
          goal={day.goal}
          dayStartMin={day.dayStartMin}
          totalMin={totalMin}
          onSetGoal={(goal) => dispatch({ type: "SET_GOAL", goal })}
          onSetDayStart={(min) => dispatch({ type: "SET_DAY_START", min })}
        />

        <BlockList
          scheduled={scheduled}
          onToggle={handleToggle}
          onStep={(id, delta) => dispatch({ type: "STEP_DURATION", id, delta })}
          onEditTitle={(id, title) => dispatch({ type: "EDIT_TITLE", id, title })}
          onSetType={(id, blockType) => dispatch({ type: "SET_TYPE", id, blockType })}
          onDelete={(id) => dispatch({ type: "DELETE_BLOCK", id })}
          onRestore={(block, index) =>
            dispatch({ type: "RESTORE_BLOCK", block, index })
          }
          onReorder={(from, to) => dispatch({ type: "REORDER", from, to })}
          onMove={(index, dir) => dispatch({ type: "MOVE", index, dir })}
          onAdd={() => dispatch({ type: "ADD_BLOCK" })}
        />

        <CaptureLog
          captures={day.captures}
          onAdd={(text) => dispatch({ type: "ADD_CAPTURE", text })}
          onDelete={(id) => dispatch({ type: "DELETE_CAPTURE", id })}
        />

        {/* Pleasure vs joy — when the pull comes */}
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 mb-2 px-1">
            <ShieldAlert size={13} className="text-violet-400" /> When the pull comes
          </p>
          <PleasureJoyCards pairs={state.pleasureJoyPairs} />
        </div>
      </div>

      <SosButton
        identityStatement={state.settings.identityStatement}
        pairs={state.pleasureJoyPairs}
        seedIndex={state.sosEvents.length}
        contactName={state.settings.contactName}
        contactPhone={state.settings.contactPhone}
        onLog={(event) => dispatch({ type: "LOG_SOS", event })}
      />

      <CelebrationBanner
        show={celebrating}
        streak={state.streak}
        onClose={() => setCelebrating(false)}
      />

      {morningOpen && (
        <MorningPrime
          initialFocus={day.goal}
          onComplete={(focus) => {
            dispatch({ type: "MARK_MORNING_DONE", focus });
            setMorningOpen(false);
          }}
          onClose={() => setMorningOpen(false)}
        />
      )}

      {presleepOpen && (
        <PreSleepImpression
          date={todayKey}
          identityStatement={state.settings.identityStatement}
          carLine={state.settings.car.line}
          goal={day.goal}
          scheduled={scheduled}
          xp={state.xp}
          level={levelFromXp(state.xp)}
          streak={state.streak}
          graceRemaining={state.graceRemaining}
          sosCount={sosCount}
          onApplyTomorrow={(patch) => dispatch({ type: "APPLY_TOMORROW", patch })}
          onComplete={() => {
            dispatch({ type: "MARK_PRESLEEP_DONE" });
            setPresleepOpen(false);
          }}
          onClose={() => setPresleepOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={state.settings}
          onSave={(partial) => dispatch({ type: "UPDATE_SETTINGS", partial })}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
