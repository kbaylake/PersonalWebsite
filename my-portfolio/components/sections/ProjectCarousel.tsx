'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, Code2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { projects } from '@/data/content';

const categoryColors: Record<string, string> = {
  "Agentic AI":             "bg-purple-900/30 text-purple-300 border-purple-800/50",
  "Automotive AI":          "bg-amber-900/30 text-amber-300 border-amber-800/50",
  "Computer Vision":        "bg-blue-900/30 text-blue-300 border-blue-800/50",
  "GenAI":                  "bg-orange-900/30 text-orange-300 border-orange-800/50",
  "Reinforcement Learning": "bg-red-900/30 text-red-300 border-red-800/50",
  "Database Engineering":   "bg-green-900/30 text-green-300 border-green-800/50",
  "Full-Stack":             "bg-cyan-900/30 text-cyan-300 border-cyan-800/50",
  "Mobile Development":     "bg-teal-900/30 text-teal-300 border-teal-800/50",
  "Game Dev":               "bg-pink-900/30 text-pink-300 border-pink-800/50",
  "ML · FinTech":           "bg-yellow-900/30 text-yellow-300 border-yellow-800/50",
};

const AI_CATEGORIES = new Set([
  'Agentic AI', 'GenAI', 'Computer Vision',
  'Reinforcement Learning', 'ML · FinTech', 'Automotive AI',
]);

const AI_KEYWORDS = [
  'llm', 'gpt', 'rag', 'mcp', 'genai', 'agentic', 'faiss', 'langchain',
  'huggingface', 'transformer', 'yolo', 'openai', 'claude', 'gemini',
  'pytorch', 'tensorflow', 'whisper', 'bert', 'fine-tun', 'vector',
  'diffusion', 'embedding', 'mistral', 'ollama',
];

function isAiTag(tech: string) {
  const lower = tech.toLowerCase();
  return AI_KEYWORDS.some(kw => lower.includes(kw));
}

export default function ProjectCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const touchStartX = useRef<number | null>(null);
  const total = projects.length;

  const go = (next: number, dir: 'right' | 'left') => {
    setDirection(dir);
    setCurrent(next);
  };

  const prev = () => go((current - 1 + total) % total, 'left');
  const next = () => go((current + 1) % total, 'right');

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const project = projects[current];
  const catColor = categoryColors[project.category] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700';
  const isAi = AI_CATEGORIES.has(project.category);

  return (
    <section className="mb-20 scroll-reveal">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Code2 className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Selected Projects</h2>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors font-mono group"
        >
          All {total} projects
          <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Carousel wrapper */}
      <div className="relative md:px-8">
        {/* Card */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="select-none"
        >
          <div
            key={`${current}-${direction}`}
            className={`border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 md:p-8 card-elevate ${isAi ? 'ai-card' : 'hover-amber-glow'} ${
              direction === 'right' ? 'carousel-slide-right' : 'carousel-slide-left'
            }`}
          >
            {/* Top meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catColor}`}>
                {project.category}
              </span>
              {project.paper && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-900/20 text-amber-400 border-amber-700/40 flex items-center gap-1">
                  <FileText size={11} />
                  Published Research
                </span>
              )}
              <span className="ml-auto text-xs font-mono text-zinc-600 tabular-nums">
                {String(current + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(total).padStart(2, '0')}
              </span>
            </div>

            {/* Title + subtitle */}
            <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-1 leading-tight">
              {project.title}
            </h3>
            <p className="text-sm text-amber-500/80 font-mono mb-4">{project.subtitle}</p>

            {/* Summary */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">{project.summary}</p>

            {/* Impact line */}
            <div className="flex items-start gap-2 mb-5 bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-4 py-2.5">
              <span className="text-amber-500 font-mono text-xs mt-0.5 flex-shrink-0">▸</span>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">{project.impact}</p>
            </div>

            {/* Stack pills */}
            <div className="flex flex-wrap gap-2">
              {project.stack.slice(0, 7).map((tech, i) => (
                <span
                  key={i}
                  className={`text-xs bg-zinc-800/80 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-700/50 ${isAiTag(tech) ? 'tag-ai' : ''}`}
                >
                  {tech}
                </span>
              ))}
              {project.stack.length > 7 && (
                <span className="text-xs text-zinc-600 px-2 py-1 font-mono">
                  +{project.stack.length - 7} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop side arrows */}
        <button
          onClick={prev}
          className="btn-press hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-700/50 hover:bg-zinc-800 transition-colors shadow-md"
          aria-label="Previous project"
        >
          <ChevronLeft size={17} />
        </button>
        <button
          onClick={next}
          className="btn-press hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-700/50 hover:bg-zinc-800 transition-colors shadow-md"
          aria-label="Next project"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between mt-5 px-1">
        {/* Mobile prev */}
        <button
          onClick={prev}
          className="md:hidden flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors font-medium"
        >
          <ChevronLeft size={15} />
          Prev
        </button>

        {/* Dot indicators — centered */}
        <div className="flex items-center gap-1.5 mx-auto">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i >= current ? 'right' : 'left')}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-1.5 bg-amber-500'
                  : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
              aria-label={`Jump to project ${i + 1}: ${projects[i].title}`}
            />
          ))}
        </div>

        {/* Mobile next */}
        <button
          onClick={next}
          className="md:hidden flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors font-medium"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}
