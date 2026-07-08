"use client";

import type { BlockType } from "./types";
import { BLOCK_TYPES, BLOCK_TYPE_META } from "./blockConfig";
import { useOverlay } from "./useOverlay";

export default function BlockTypePicker({
  onPick,
  onClose,
}: {
  onPick: (type: BlockType) => void;
  onClose: () => void;
}) {
  const overlayRef = useOverlay(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose block type"
    >
      <div
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={overlayRef}
        className="relative w-full sm:max-w-sm bg-zinc-900 border border-violet-800/40 rounded-t-2xl sm:rounded-2xl p-4 pb-6 animate-scale-in shadow-2xl"
      >
        <p className="text-xs uppercase tracking-widest text-violet-300/80 mb-3 px-1">
          Block type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map((t) => {
            const meta = BLOCK_TYPE_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                onClick={() => {
                  onPick(t);
                  onClose();
                }}
                className={`btn-press flex items-center gap-3 rounded-xl border ${meta.border} ${meta.tint} px-3 py-3 text-left hover:brightness-125 transition`}
              >
                <span className={`w-1.5 h-8 rounded-full ${meta.accent}`} />
                <Icon size={18} className={meta.text} />
                <span className="text-sm text-zinc-200">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
