"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import type { PleasureJoyPair, SosEvent } from "./types";
import SosOverlay from "./SosOverlay";

export interface SosButtonProps {
  identityStatement: string;
  pairs: PleasureJoyPair[];
  seedIndex: number;
  contactName: string;
  contactPhone: string;
  onLog: (event: SosEvent) => void;
}

export default function SosButton(props: SosButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Redirect — I feel the pull"
        className="btn-press fixed z-40 right-4 flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold pl-4 pr-5 py-3 shadow-lg shadow-violet-900/40"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <LifeBuoy size={18} />
        <span className="text-sm">I feel the pull</span>
      </button>

      {open && (
        <SosOverlay
          identityStatement={props.identityStatement}
          pairs={props.pairs}
          seedIndex={props.seedIndex}
          contactName={props.contactName}
          contactPhone={props.contactPhone}
          onLog={props.onLog}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
