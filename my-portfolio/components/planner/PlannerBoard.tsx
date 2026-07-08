"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Sunrise,
  MoonStar,
  Check,
  Settings2,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import type { PlannerState, ReminderCategory } from "./types";
import { reducer } from "./reducer";
import {
  loadState,
  createDefaultState,
  exportStateJson,
  importStateJson,
} from "./store";
import {
  computeSchedule,
  totalDurationMin,
  istDateString,
  istNowMinutes,
  addDays,
  friendlyDate,
} from "./util";
import { levelFromXp, GOAL_META, type BlockMeta } from "./blockConfig";
import { BLOCK_TYPE_META } from "./blockConfig";
import {
  computeAlignment,
  sosCountOnDate,
  pickRehearsalGoal,
  pickPresleepLine,
  weakestGoal,
  checkinDue,
} from "./servo";
import { buildReminderIcs } from "./icsExport";
import { syncDayToGoogle } from "./googleSync";
import IdentityBar from "./IdentityBar";
import NowCard from "./NowCard";
import ProgressHud from "./ProgressHud";
import TrendPanel from "./TrendPanel";
import NudgeFeed from "./NudgeFeed";
import WeeklyCheckin from "./WeeklyCheckin";
import PlanHeader from "./PlanHeader";
import BlockList from "./BlockList";
import CaptureLog from "./CaptureLog";
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

// Which reminder category cheers a completed block of each type.
const TYPE_TO_CHEER: Record<string, ReminderCategory> = {
  work: "focus",
  learn: "focus",
  exercise: "discipline",
  break: "presence",
  leisure: "devotion",
  sleep: "identity",
};

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
  const [sosOpen, setSosOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; meta: BlockMeta; key: number } | null>(null);

  // Hydrate from localStorage; the reducer seeds today + runs the servo tick.
  useEffect(() => {
    dispatch({ type: "HYDRATE", state: loadState() });
  }, []);

  // Midnight while open / returning to the tab: re-seed + tick (no-op otherwise).
  useEffect(() => {
    const iv = setInterval(() => dispatch({ type: "ENSURE_TODAY" }), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") dispatch({ type: "ENSURE_TODAY" });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Persist on every change once hydrated (transient fields are stripped).
  useEffect(() => {
    if (state.hydrated) {
      import("./store").then(({ saveState }) => saveState(state));
    }
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

  const sosCountToday = useMemo(
    () => sosCountOnDate(state, todayKey),
    [state, todayKey]
  );
  const alignmentToday = useMemo(
    () => computeAlignment(day, sosCountToday),
    [day, sosCountToday]
  );

  const yKey = addDays(todayKey, -1);
  const yday = state.days[yKey];
  const showReflection = !!yday && !yday.reflected && yday.blocks.length > 0;
  const showCheckin = checkinDue(state, todayKey);

  if (!state.hydrated || !day) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-zinc-600">
        <div className="animate-pulse">Loading your day…</div>
      </div>
    );
  }

  // Toggle completion; fire the celebration on the last block, and a small
  // identity-evidence toast on each completion.
  function handleToggle(id: string) {
    const b = day!.blocks.find((x) => x.id === id);
    if (b && !b.completed) {
      const remaining = day!.blocks.filter(
        (x) => !x.completed && x.id !== id
      ).length;
      if (remaining === 0 && day!.blocks.length > 0) {
        setCelebrating(true);
      } else {
        const cat = TYPE_TO_CHEER[b.type] ?? "identity";
        const pool = state.reminderLines.filter((l) => l.category === cat);
        const line = pool[(completedCount + b.title.length) % Math.max(1, pool.length)];
        if (line) {
          setToast({
            text: line.text,
            meta: BLOCK_TYPE_META[b.type],
            key: Date.now(),
          });
        }
      }
    }
    dispatch({ type: "TOGGLE_COMPLETE", id });
  }

  const rehearsal = pickRehearsalGoal(state, todayKey);
  const presleepLine = pickPresleepLine(state, todayKey);
  const resonanceCandidates = state.reminderLines.filter(
    (l) =>
      day.shownLineIds.includes(l.id) ||
      (presleepLine && l.id === presleepLine.id)
  );
  const overnightNudges = state.nudges.filter(
    (n) => (n.date === todayKey || n.date === yKey) && n.kind !== "line_resonance"
  );

  const finalized = Object.keys(state.alignment);
  const avg14 =
    finalized.length > 0
      ? Math.round(
          finalized
            .sort()
            .slice(-14)
            .reduce((s, d) => s + state.alignment[d], 0) /
            Math.min(14, finalized.length)
        )
      : null;

  const now = istNowMinutes();
  const morningWindow = now < 15 * 60;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32">
      <IdentityBar
        state={state}
        today={todayKey}
        dayStartMin={day.dayStartMin}
        onShown={(lineId) => dispatch({ type: "RECORD_SHOWN_LINE", lineId })}
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

      <div className="space-y-4">
        {/* The first fold: one next action */}
        <NowCard
          day={day}
          scheduled={scheduled}
          alignmentToday={alignmentToday}
          onOpenMorning={() => setMorningOpen(true)}
          onOpenPresleep={() => setPresleepOpen(true)}
          onComplete={handleToggle}
        />

        {/* Ritual row — salience follows the clock */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMorningOpen(true)}
            className={`btn-press flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition ${
              day.morningPrimeDone
                ? "border-zinc-800 bg-zinc-900/40 text-zinc-500"
                : morningWindow
                  ? "border-amber-700/50 bg-amber-950/30 text-amber-200"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
            }`}
          >
            {day.morningPrimeDone ? <Check size={14} /> : <Sunrise size={14} />}
            Morning prime
          </button>
          <button
            onClick={() => setPresleepOpen(true)}
            className={`btn-press flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition ${
              day.preSleepDone
                ? "border-zinc-800 bg-zinc-900/40 text-zinc-500"
                : !morningWindow
                  ? "border-slate-600/50 bg-slate-900/40 text-slate-200"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
            }`}
          >
            {day.preSleepDone ? <Check size={14} /> : <MoonStar size={14} />}
            Pre-sleep
          </button>
        </div>

        {showCheckin && (
          <WeeklyCheckin
            goalAreas={state.goalAreas}
            state={state}
            today={todayKey}
            firstTime={!state.lastCheckinDate}
            onSave={(ratings) => dispatch({ type: "RATE_GOALS", ratings })}
            onDismiss={() => dispatch({ type: "DISMISS_CHECKIN" })}
          />
        )}

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
          cleanRunTowardToken={state.cleanRunTowardToken}
          lifetimeCleanDays={state.lifetimeCleanDays}
          completedCount={completedCount}
          totalCount={totalCount}
          carLine={state.settings.car.line}
          carNumbers={state.settings.car.numbers}
          notice={state.notice}
          onDismissNotice={() => dispatch({ type: "DISMISS_NOTICE" })}
        />

        <TrendPanel state={state} today={todayKey} alignmentToday={alignmentToday} />

        <NudgeFeed nudges={state.nudges} />

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
          onCycleGoal={(id) => dispatch({ type: "SET_BLOCK_GOAL", id })}
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

        {/* One quiet line — the full reframe lives inside the SOS flow */}
        <button
          onClick={() => setSosOpen(true)}
          className="btn-press w-full flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-left"
        >
          <ShieldAlert size={15} className="text-violet-400 shrink-0" />
          <span className="flex-1 text-xs text-zinc-400">
            Feeling the pull? The redirect is one tap away.
          </span>
          <ChevronRight size={15} className="text-zinc-600" />
        </button>
      </div>

      <SosButton
        identityStatement={state.settings.identityStatement}
        pairs={state.pleasureJoyPairs}
        seedIndex={state.sosEvents.length}
        contactName={state.settings.contactName}
        contactPhone={state.settings.contactPhone}
        open={sosOpen}
        onOpenChange={setSosOpen}
        onLog={(event) => dispatch({ type: "LOG_SOS", event })}
      />

      <CelebrationBanner
        show={celebrating}
        streak={state.streak}
        onClose={() => setCelebrating(false)}
      />

      {/* Identity-evidence toast on each completion */}
      {toast && (
        <CompletionToast
          key={toast.key}
          text={toast.text}
          meta={toast.meta}
          onDone={() => setToast(null)}
        />
      )}

      {morningOpen && (
        <MorningPrime
          initialFocus={day.goal}
          lastNightNote={yday?.note ?? ""}
          overnightNudges={overnightNudges}
          rehearsalGoal={rehearsal.goal}
          rehearsalReason={rehearsal.reason}
          rehearsalMissedTitle={rehearsal.missedTitle}
          onComplete={(focus) => {
            dispatch({ type: "MARK_MORNING_DONE", focus });
            setMorningOpen(false);
          }}
          onClose={() => setMorningOpen(false)}
        />
      )}

      {presleepOpen && (
        <PreSleepImpression
          cardInput={{
            date: todayKey,
            identityStatement: state.settings.identityStatement,
            carLine: state.settings.car.line,
            goal: day.goal,
            scheduled,
            xp: state.xp,
            level: levelFromXp(state.xp),
            streak: state.streak,
            graceRemaining: state.graceRemaining,
            sosCount: sosCountToday,
            alignmentToday,
            alignmentAvg14: avg14,
            goalAreas: state.goalAreas,
            weakestGoalLabel: GOAL_META[weakestGoal(state.goalWeights)].label,
            recentNudges: state.nudges.slice(-3),
          }}
          scheduled={scheduled}
          presleepLine={presleepLine}
          resonanceCandidates={resonanceCandidates}
          resonanceDone={!!day.resonanceLineId}
          onResonance={(lineId) => dispatch({ type: "MARK_RESONANCE", lineId })}
          onApplyTomorrow={(patch) => dispatch({ type: "APPLY_TOMORROW", patch })}
          onComplete={(note) => {
            dispatch({ type: "MARK_PRESLEEP_DONE", note });
            setPresleepOpen(false);
          }}
          onClose={() => setPresleepOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={state.settings}
          onSave={(partial) => dispatch({ type: "UPDATE_SETTINGS", partial })}
          onDownloadReminders={() => {
            const blob = new Blob([buildReminderIcs(state, todayKey)], {
              type: "text/calendar",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "becoming-reminders.ics";
            a.click();
            URL.revokeObjectURL(url);
          }}
          onSyncCalendar={
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
              ? () =>
                  syncDayToGoogle(
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
                    todayKey,
                    scheduled
                  )
              : null
          }
          onExport={() => {
            const blob = new Blob([exportStateJson(state)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `becoming-backup-${todayKey}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onImport={(raw) => {
            const imported = importStateJson(raw);
            if (!imported) return false;
            dispatch({ type: "IMPORT_STATE", state: imported });
            return true;
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

// Small non-blocking toast: the win, named as identity evidence.
function CompletionToast({
  text,
  meta,
  onDone,
}: {
  text: string;
  meta: BlockMeta;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const Icon = meta.icon;
  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 max-w-[90vw] sm:max-w-md rounded-full border border-zinc-700 bg-zinc-900/95 backdrop-blur px-4 py-2.5 shadow-xl animate-scale-in"
      style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
    >
      <Icon size={15} className={`${meta.text} shrink-0`} />
      <span className="text-xs text-zinc-200 italic truncate">{text}</span>
    </div>
  );
}
