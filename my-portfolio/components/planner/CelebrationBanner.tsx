"use client";

import { useEffect, useMemo } from "react";
import { Trophy } from "lucide-react";

const COLORS = ["#8b5cf6", "#d946ef", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e"];

export interface CelebrationProps {
  show: boolean;
  streak: number;
  onClose: () => void;
}

export default function CelebrationBanner({ show, streak, onClose }: CelebrationProps) {
  // Deterministic pseudo-random (pure — Math.sin) so render stays pure.
  const pieces = useMemo(() => {
    const rand = (i: number, n: number) => {
      const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: rand(i, 1) * 100,
      delay: rand(i, 2) * 0.6,
      dur: 1.6 + rand(i, 3) * 1.4,
      rot: rand(i, 4) * 360,
      color: COLORS[i % COLORS.length],
      size: 6 + rand(i, 5) * 6,
    }));
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 5200);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {/* Confetti */}
      <div className="planner-confetti-layer absolute inset-0 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="planner-confetti-piece"
            style={
              {
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                ["--delay" as string]: `${p.delay}s`,
                ["--dur" as string]: `${p.dur}s`,
                ["--rot" as string]: `${p.rot}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Banner */}
      <div
        className="pointer-events-auto animate-scale-in relative flex flex-col items-center gap-2 rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-900/90 to-fuchsia-900/80 backdrop-blur px-8 py-7 shadow-2xl cursor-pointer max-w-[90vw]"
        onClick={onClose}
      >
        <Trophy size={40} className="text-amber-300" />
        <p className="text-xl font-bold text-white text-center">Day complete.</p>
        <p className="text-sm text-violet-100 text-center max-w-xs">
          Every block done. That&rsquo;s not luck — that&rsquo;s evidence you
          showed up as the man you&rsquo;re becoming.
        </p>
        {streak > 0 && (
          <p className="mt-1 text-sm font-semibold text-amber-200">
            🔥 {streak}-day streak
          </p>
        )}
      </div>
    </div>
  );
}
