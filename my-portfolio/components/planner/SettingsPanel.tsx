"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { PlannerSettings } from "./types";

export interface SettingsPanelProps {
  settings: PlannerSettings;
  onSave: (partial: Partial<PlannerSettings>) => void;
  onClose: () => void;
}

export default function SettingsPanel(props: SettingsPanelProps) {
  const s = props.settings;
  const [identity, setIdentity] = useState(s.identityStatement);
  const [contactName, setContactName] = useState(s.contactName);
  const [contactPhone, setContactPhone] = useState(s.contactPhone);
  const [carLine, setCarLine] = useState(s.car.line);
  const [carNumbers, setCarNumbers] = useState(s.car.numbers);
  const [cadence, setCadence] = useState(s.reminderCadenceMin);

  function save() {
    props.onSave({
      identityStatement: identity.trim() || s.identityStatement,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      reminderCadenceMin: Math.min(360, Math.max(30, cadence)),
      car: { ...s.car, line: carLine.trim(), numbers: carNumbers.trim() },
    });
    props.onClose();
  }

  const field =
    "w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-violet-500/40";
  const label = "text-xs text-zinc-500 mb-1 block";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={props.onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-violet-800/40 bg-zinc-900 p-5 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-100">Settings</h2>
          <button
            onClick={props.onClose}
            aria-label="Close"
            className="btn-press text-zinc-500 hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label}>Identity statement</label>
            <textarea
              rows={3}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className={`${field} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Go-to person</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Their number</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91…"
                inputMode="tel"
                className={field}
              />
            </div>
          </div>
          <div>
            <label className={label}>Car — ownership line</label>
            <input
              value={carLine}
              onChange={(e) => setCarLine(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label}>Car — the numbers</label>
            <input
              value={carNumbers}
              onChange={(e) => setCarNumbers(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label}>
              Reminder rhythm — every {Math.round(cadence / 60 * 10) / 10}h
            </label>
            <input
              type="range"
              min={30}
              max={240}
              step={30}
              value={cadence}
              onChange={(e) => setCadence(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
        </div>

        <button
          onClick={save}
          className="btn-press mt-5 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3"
        >
          Save
        </button>
      </div>
    </div>
  );
}
