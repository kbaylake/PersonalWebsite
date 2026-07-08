"use client";

import { useRef, useState } from "react";
import { X, Download, Upload } from "lucide-react";
import type { PlannerSettings } from "./types";
import { useOverlay } from "./useOverlay";

export interface SettingsPanelProps {
  settings: PlannerSettings;
  onSave: (partial: Partial<PlannerSettings>) => void;
  onExport: () => void;
  onImport: (raw: string) => boolean;
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
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useOverlay(props.onClose);

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
      <div
        ref={overlayRef}
        className="relative w-full max-w-md rounded-2xl border border-violet-800/40 bg-zinc-900 p-5 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar"
      >
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

        {/* Data — the backup moves between this site and the standalone file */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Your data
          </p>
          <div className="flex gap-2">
            <button
              onClick={props.onExport}
              className="btn-press flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300 hover:border-violet-600/60"
            >
              <Download size={14} /> Export backup
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-press flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300 hover:border-violet-600/60"
            >
              <Upload size={14} /> Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const ok = props.onImport(String(reader.result ?? ""));
                  setImportMsg(
                    ok
                      ? "Imported — your data is loaded."
                      : "That file isn't a planner backup."
                  );
                };
                reader.readAsText(file);
                e.target.value = "";
              }}
            />
          </div>
          {importMsg && (
            <p className="mt-2 text-xs text-zinc-400">{importMsg}</p>
          )}
          <p className="mt-2 text-[11px] text-zinc-600">
            Everything lives in this browser. Export before clearing site data —
            the same file also imports into the standalone planner.
          </p>
        </div>
      </div>
    </div>
  );
}
