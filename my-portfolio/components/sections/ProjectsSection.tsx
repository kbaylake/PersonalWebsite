"use client";
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { projects } from '@/data/content';

const categoryColors: Record<string, string> = {
  "Agentic AI":           "bg-purple-900/30 text-purple-300 border-purple-800/50",
  "Automotive AI":        "bg-amber-900/30 text-amber-300 border-amber-800/50",
  "Computer Vision":      "bg-blue-900/30 text-blue-300 border-blue-800/50",
  "GenAI":                "bg-orange-900/30 text-orange-300 border-orange-800/50",
  "Reinforcement Learning": "bg-red-900/30 text-red-300 border-red-800/50",
  "Database Engineering": "bg-green-900/30 text-green-300 border-green-800/50",
  "Full-Stack":           "bg-cyan-900/30 text-cyan-300 border-cyan-800/50",
  "Mobile Development":   "bg-teal-900/30 text-teal-300 border-teal-800/50",
  "Game Dev":             "bg-pink-900/30 text-pink-300 border-pink-800/50",
  "ML · FinTech":         "bg-yellow-900/30 text-yellow-300 border-yellow-800/50",
};

export default function ProjectsSection() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-zinc-100 mb-2">Selected Projects</h2>
      <p className="text-zinc-400 mb-3">
        AI pipelines, autonomous agents, data systems, and production builds.
      </p>
      <p className="text-xs text-zinc-600 mb-10 font-mono">
        Click <span className="text-amber-600">Technical Details</span> to expand the engineering breakdown for each project.
      </p>

      <div className="grid grid-cols-1 gap-5">
        {projects.map((project, idx) => {
          const isOpen = expandedIdx === idx;
          const catColor = categoryColors[project.category] ?? "bg-zinc-800 text-zinc-400 border-zinc-700";

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all duration-200 ${
                isOpen
                  ? 'border-amber-700/40 bg-zinc-900/70'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              {/* --- CARD HEADER (always visible) --- */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catColor}`}>
                      {project.category}
                    </span>
                    {project.paper && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-900/20 text-amber-400 border-amber-700/40 flex items-center gap-1">
                        <FileText size={11} />
                        Published Research
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-zinc-100 mb-0.5">{project.title}</h3>
                <p className="text-sm text-amber-500/80 font-mono mb-3">{project.subtitle}</p>

                {/* Non-technical summary — for HR / manufacturing managers */}
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{project.summary}</p>

                {/* Impact line */}
                <p className="text-xs text-zinc-500 font-mono mb-4">
                  <span className="text-zinc-600">▸ </span>{project.impact}
                </p>

                {/* Tech stack pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.map((tech, i) => (
                    <span key={i} className="text-xs bg-zinc-800/80 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-700/50">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Expand button */}
                <button
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp size={14} />
                      Hide Technical Details
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      View Technical Details
                    </>
                  )}
                </button>
              </div>

              {/* --- EXPANDED: Technical deep-dive --- */}
              {isOpen && (
                <div className="border-t border-zinc-800 px-6 pb-6 pt-5">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Engineering Breakdown</p>
                  <ul className="space-y-3">
                    {project.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
                        <span className="text-amber-600 mt-1.5 flex-shrink-0 font-mono text-xs">0{i + 1}</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
