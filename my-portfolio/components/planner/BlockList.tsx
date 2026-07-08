"use client";

import { useState } from "react";
import { Plus, Undo2 } from "lucide-react";
import type { Block, BlockType } from "./types";
import type { ScheduledBlock } from "./util";
import BlockCard from "./BlockCard";

export interface BlockListProps {
  scheduled: ScheduledBlock[];
  onToggle: (id: string) => void;
  onStep: (id: string, delta: number) => void;
  onEditTitle: (id: string, title: string) => void;
  onSetType: (id: string, type: BlockType) => void;
  onDelete: (id: string) => void;
  onRestore: (block: Block, index: number) => void;
  onReorder: (from: number, to: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onAdd: () => void;
}

export default function BlockList(props: BlockListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [undo, setUndo] = useState<{ block: Block; index: number } | null>(null);
  const [announce, setAnnounce] = useState("");

  function handleDelete(index: number, block: Block) {
    props.onDelete(block.id);
    setUndo({ block, index });
    window.setTimeout(() => {
      setUndo((u) => (u && u.block.id === block.id ? null : u));
    }, 6000);
  }

  function handleMove(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= props.scheduled.length) return;
    props.onMove(index, dir);
    setAnnounce(
      `${props.scheduled[index].block.title} moved to position ${target + 1} of ${props.scheduled.length}`
    );
  }

  return (
    <div className="relative">
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      <ul className="space-y-2">
        {props.scheduled.map((s, i) => (
          <BlockCard
            key={s.block.id}
            block={s.block}
            startMin={s.startMin}
            endMin={s.endMin}
            index={i}
            total={props.scheduled.length}
            onToggle={() => props.onToggle(s.block.id)}
            onStep={(delta) => props.onStep(s.block.id, delta)}
            onEditTitle={(t) => props.onEditTitle(s.block.id, t)}
            onSetType={(t) => props.onSetType(s.block.id, t)}
            onDelete={() => handleDelete(i, s.block)}
            onMove={(dir) => handleMove(i, dir)}
            isDragging={dragIndex === i}
            isDragOver={overIndex === i && dragIndex !== null && dragIndex !== i}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDrop={() => {
              if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
                props.onReorder(dragIndex, overIndex);
              }
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
          />
        ))}
      </ul>

      <button
        onClick={props.onAdd}
        className="btn-press mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 hover:border-violet-600/60 hover:text-violet-300 transition"
      >
        <Plus size={16} /> Add block
      </button>

      {undo && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-full pl-4 pr-2 py-2 shadow-xl animate-scale-in">
          <span className="text-sm text-zinc-300">Block deleted</span>
          <button
            onClick={() => {
              props.onRestore(undo.block, undo.index);
              setUndo(null);
            }}
            className="btn-press flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-full px-3 py-1"
          >
            <Undo2 size={14} /> Undo
          </button>
        </div>
      )}
    </div>
  );
}
