import {
  Brain,
  Coffee,
  BookOpen,
  Dumbbell,
  Gamepad2,
  Moon,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "./types";

export interface BlockMeta {
  label: string;
  icon: LucideIcon;
  // Full Tailwind class strings (JIT-safe — never interpolate fragments).
  accent: string; // left accent bar bg
  text: string; // icon / dot text color
  tint: string; // subtle card bg tint
  border: string; // card border
  ring: string; // focus ring
  glow: string; // box-shadow color on complete (rgba)
}

export const BLOCK_TYPE_META: Record<BlockType, BlockMeta> = {
  work: {
    label: "Deep Work",
    icon: Brain,
    accent: "bg-blue-500",
    text: "text-blue-300",
    tint: "bg-blue-950/30",
    border: "border-blue-900/50",
    ring: "focus-visible:ring-blue-500/40",
    glow: "rgba(59,130,246,0.35)",
  },
  break: {
    label: "Break",
    icon: Coffee,
    accent: "bg-amber-500",
    text: "text-amber-300",
    tint: "bg-amber-950/30",
    border: "border-amber-900/50",
    ring: "focus-visible:ring-amber-500/40",
    glow: "rgba(245,158,11,0.35)",
  },
  learn: {
    label: "Learn",
    icon: BookOpen,
    accent: "bg-cyan-500",
    text: "text-cyan-300",
    tint: "bg-cyan-950/30",
    border: "border-cyan-900/50",
    ring: "focus-visible:ring-cyan-500/40",
    glow: "rgba(6,182,212,0.35)",
  },
  exercise: {
    label: "Exercise",
    icon: Dumbbell,
    accent: "bg-emerald-500",
    text: "text-emerald-300",
    tint: "bg-emerald-950/30",
    border: "border-emerald-900/50",
    ring: "focus-visible:ring-emerald-500/40",
    glow: "rgba(16,185,129,0.35)",
  },
  leisure: {
    label: "Leisure",
    icon: Gamepad2,
    accent: "bg-rose-500",
    text: "text-rose-300",
    tint: "bg-rose-950/30",
    border: "border-rose-900/50",
    ring: "focus-visible:ring-rose-500/40",
    glow: "rgba(244,63,94,0.35)",
  },
  sleep: {
    label: "Wind-down",
    icon: Moon,
    accent: "bg-slate-500",
    text: "text-slate-300",
    tint: "bg-slate-900/40",
    border: "border-slate-800/60",
    ring: "focus-visible:ring-slate-500/40",
    glow: "rgba(148,163,184,0.3)",
  },
};

// Order that tap-to-cycle walks through.
export const BLOCK_TYPES: BlockType[] = [
  "work",
  "break",
  "learn",
  "exercise",
  "leisure",
  "sleep",
];

export const XP_PER_COMPLETE = 10;
export const XP_PER_LEVEL = 100;
export const SOS_XP = 5;

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export function levelProgress(xp: number): number {
  return Math.max(0, xp) % XP_PER_LEVEL;
}

export interface TemplateBlock {
  type: BlockType;
  title: string;
  durationMin: number;
}

// The default day, wake → sleep. Editable per-day; user can add/remove/reorder.
export const DEFAULT_DAY: TemplateBlock[] = [
  { type: "break", title: "Wake + morning prime", durationMin: 30 },
  { type: "exercise", title: "Move my body", durationMin: 45 },
  { type: "work", title: "Deep work — today's ONE focus", durationMin: 120 },
  { type: "break", title: "Reset", durationMin: 15 },
  { type: "work", title: "Deep work II", durationMin: 90 },
  { type: "break", title: "Lunch + presence", durationMin: 45 },
  { type: "learn", title: "Learn — sharpen the craft", durationMin: 60 },
  { type: "work", title: "Deep work III", durationMin: 90 },
  { type: "break", title: "Reset", durationMin: 15 },
  { type: "work", title: "Admin + tasks", durationMin: 45 },
  { type: "exercise", title: "Walk / air", durationMin: 30 },
  { type: "break", title: "Dinner + people", durationMin: 60 },
  { type: "leisure", title: "The thing I actually love", durationMin: 60 },
  { type: "learn", title: "Read", durationMin: 30 },
  { type: "sleep", title: "Pre-sleep impression", durationMin: 20 },
];

export const DEFAULT_DAY_START_MIN = 6 * 60; // 06:00
