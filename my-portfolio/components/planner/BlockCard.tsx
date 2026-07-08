"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  Minus,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Palette,
} from "lucide-react";
import type { Block, BlockType } from "./types";
import { BLOCK_TYPE_META, BLOCK_TYPES, GOAL_META } from "./blockConfig";
import { formatClock, formatDuration, nextDayFlag } from "./util";
import BlockTypePicker from "./BlockTypePicker";

export interface BlockCardProps {
  block: Block;
  startMin: number;
  endMin: number;
  index: number;
  total: number;
  onToggle: () => void;
  onStep: (delta: number) => void;
  onEditTitle: (title: string) => void;
  onSetType: (type: BlockType) => void;
  onCycleGoal: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  // Desktop DnD
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

export default function BlockCard(props: BlockCardProps) {
  const { block, startMin, endMin } = props;
  const meta = BLOCK_TYPE_META[block.type];
  const Icon = meta.icon;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(block.title);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commitTitle() {
    const t = draft.trim();
    if (t && t !== block.title) props.onEditTitle(t);
    else setDraft(block.title);
    setEditing(false);
  }

  function cycleType() {
    const i = BLOCK_TYPES.indexOf(block.type);
    props.onSetType(BLOCK_TYPES[(i + 1) % BLOCK_TYPES.length]);
  }

  function handleToggle() {
    if (!block.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 700);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    }
    props.onToggle();
  }

  return (
    <li
      draggable={!editing}
      onDragStart={(e) => {
        // Only the grip/arrow handle starts a drag — never the checkbox,
        // title, or steppers (confirmed v1 bug: text selection hijacked).
        const target = e.target as HTMLElement;
        if (!target.closest?.("[data-drag-handle]")) {
          e.preventDefault();
          return;
        }
        props.onDragStart();
      }}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
      className={`relative ${props.isDragging ? "drag-ghost" : ""}`}
    >
      {props.isDragOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.7)] z-10" />
      )}

      <div
        className={`group flex items-stretch gap-0 rounded-xl border ${meta.border} ${
          block.completed ? "opacity-60" : ""
        } ${meta.tint} overflow-hidden transition-all duration-300 ${
          justCompleted ? "planner-complete-pulse" : ""
        }`}
        style={
          justCompleted
            ? ({ ["--glow" as string]: meta.glow } as React.CSSProperties)
            : undefined
        }
      >
        {/* Accent bar */}
        <span className={`w-1.5 shrink-0 ${meta.accent}`} aria-hidden />

        {/* Reorder controls — this cluster is the only drag handle */}
        <div
          data-drag-handle
          className="flex flex-col items-center justify-center px-1 gap-0.5"
        >
          <button
            onClick={() => props.onMove(-1)}
            disabled={props.index === 0}
            aria-label={`Move ${block.title} up`}
            className="btn-press p-1 rounded text-zinc-500 hover:text-violet-300 disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronUp size={16} />
          </button>
          <GripVertical
            size={14}
            className="text-zinc-700 cursor-grab active:cursor-grabbing hidden sm:block"
            aria-hidden
          />
          <button
            onClick={() => props.onMove(1)}
            disabled={props.index === props.total - 1}
            aria-label={`Move ${block.title} down`}
            className="btn-press p-1 rounded text-zinc-500 hover:text-violet-300 disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Checkbox */}
        <div className="flex items-center pl-1 pr-2">
          <button
            role="checkbox"
            aria-checked={block.completed}
            aria-label={`${block.completed ? "Uncheck" : "Complete"} ${block.title}`}
            onClick={handleToggle}
            className={`btn-press w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              block.completed
                ? `${meta.accent} border-transparent text-zinc-950`
                : `border-zinc-600 text-transparent hover:border-violet-400`
            }`}
          >
            <Check size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 py-2.5 pr-2">
          <div className="flex items-center gap-2">
            <button
              onClick={cycleType}
              aria-label={`Block type: ${meta.label}. Tap to change.`}
              className="btn-press shrink-0"
              title="Tap to change type"
            >
              <Icon size={15} className={meta.text} />
            </button>
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") {
                    setDraft(block.title);
                    setEditing(false);
                  }
                }}
                className="flex-1 min-w-0 bg-zinc-950/60 border border-violet-700/50 rounded px-2 py-0.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            ) : (
              <button
                onClick={() => {
                  setDraft(block.title);
                  setEditing(true);
                }}
                className={`flex-1 min-w-0 text-left text-sm font-medium truncate ${
                  block.completed
                    ? "line-through text-zinc-500"
                    : "text-zinc-100"
                }`}
              >
                {block.title}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 pl-6 text-xs text-zinc-500 font-mono">
            <span>
              {formatClock(startMin)} – {formatClock(endMin)}
            </span>
            {nextDayFlag(startMin) && (
              <span className="text-violet-400/70">+1</span>
            )}
            <span className="text-zinc-700">·</span>
            <span>{formatDuration(block.durationMin)}</span>
            <button
              onClick={props.onCycleGoal}
              aria-label={
                block.goal
                  ? `Goal: ${GOAL_META[block.goal].label}. Tap to change.`
                  : "No goal tagged. Tap to tag a goal."
              }
              title="Which goal does this block serve?"
              className={`btn-press flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-sans ${
                block.goal
                  ? `border-zinc-700 ${GOAL_META[block.goal].text}`
                  : "border-zinc-800 text-zinc-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  block.goal ? GOAL_META[block.goal].dot : "bg-zinc-700"
                }`}
              />
              {block.goal ? GOAL_META[block.goal].short : "goal"}
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5 pr-2">
          <button
            onClick={() => props.onStep(-15)}
            disabled={block.durationMin <= 15}
            aria-label="Decrease duration 15 minutes"
            className="btn-press w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-800 disabled:opacity-25"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => props.onStep(15)}
            aria-label="Increase duration 15 minutes"
            className="btn-press w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-800"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="Open type picker"
            className="btn-press w-7 h-7 rounded-md hidden sm:flex items-center justify-center text-zinc-500 hover:text-violet-300 hover:bg-zinc-800"
          >
            <Palette size={14} />
          </button>
          <button
            onClick={props.onDelete}
            aria-label={`Delete ${block.title}`}
            className="btn-press w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-zinc-800"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {pickerOpen && (
        <BlockTypePicker
          onPick={props.onSetType}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </li>
  );
}
