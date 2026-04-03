"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, ArrowLeft, Clock, ChevronRight, Car } from "lucide-react";

interface Post {
  name: string;
  title: string;
  excerpt: string;
  readingTime: number;
  path: string;
}

export default function AutoArchitectureSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/automotive")
      .then(res => res.json())
      .then(json => {
        setPosts(json.files);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    setContent("");
    fetch(selectedPost.path)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch(() => setContent(""));
  }, [selectedPost]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-zinc-400 py-20 justify-center">
        <Loader2 className="animate-spin" size={20} />
        <span>Loading automotive content...</span>
      </div>
    );
  }

  /* ── ARTICLE READER ─────────────────────────────── */
  if (selectedPost) {
    return (
      <div className="animate-fade-in-up">
        {/* Back button */}
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center space-x-2 text-zinc-400 hover:text-amber-400 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">All Articles</span>
        </button>

        {/* Article meta header */}
        <div className="mb-6 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-900/20 text-amber-400 border-amber-700/40 flex items-center gap-1.5">
              <Car size={11} />
              Automotive Architecture
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock size={11} />
              {selectedPost.readingTime} min read
            </span>
          </div>
        </div>

        {/* Article body */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-6 sm:px-8 sm:py-8">
          {content ? (
            <div className="prose prose-sm sm:prose-base prose-invert max-w-none
              prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:leading-tight prose-h1:mb-4
              prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-sm prose-p:sm:text-base
              prose-strong:text-zinc-200
              prose-em:text-zinc-300 prose-em:text-sm
              prose-hr:border-zinc-700 prose-hr:my-6
              prose-blockquote:border-l-amber-500 prose-blockquote:border-l-2
              prose-blockquote:bg-zinc-800/30 prose-blockquote:px-4 prose-blockquote:py-1
              prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-blockquote:text-zinc-400
              prose-code:text-amber-300 prose-code:bg-zinc-800/60 prose-code:px-1.5 prose-code:py-0.5
              prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
              prose-a:text-amber-400 hover:prose-a:text-amber-300
              prose-ul:text-zinc-400 prose-ol:text-zinc-400
              prose-li:my-1
            ">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-zinc-500 py-12 justify-center">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Loading article…</span>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {posts.length > 1 && (
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 mb-3 font-mono uppercase tracking-widest">More articles</p>
            <div className="flex flex-col gap-2">
              {posts
                .filter(p => p.path !== selectedPost.path)
                .map(p => (
                  <button
                    key={p.path}
                    onClick={() => setSelectedPost(p)}
                    className="flex items-center justify-between text-left px-4 py-3 rounded-lg border border-zinc-800 hover:border-amber-700/40 hover:bg-zinc-800/40 transition-all group"
                  >
                    <span className="text-sm text-zinc-300 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {p.title}
                    </span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-amber-500 flex-shrink-0 ml-3 transition-colors" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── ARTICLE LIST ───────────────────────────────── */
  return (
    <div className="animate-fade-in-up space-y-10">
      {/* Section header */}
      <div>
        <div className="flex items-center space-x-3 mb-3">
          <Car className="text-amber-500" size={24} />
          <h2 className="text-3xl font-bold text-zinc-100">Automotive Architecture</h2>
        </div>
        <p className="text-zinc-400 max-w-xl text-sm sm:text-base leading-relaxed">
          Where software logic meets mechanical reality. Engineering essays at the intersection of AI and automotive design.
        </p>
      </div>

      {/* Article cards */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <button
            key={post.path}
            onClick={() => setSelectedPost(post)}
            className="w-full text-left rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 hover-amber-glow transition-all group overflow-hidden"
          >
            {/* Amber accent strip */}
            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" />

            <div className="p-5 sm:p-6">
              {/* Meta row */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-amber-500/70 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-600">
                  <Clock size={11} />
                  {post.readingTime} min read
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors leading-snug mb-2">
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
              )}

              {/* Read CTA */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 group-hover:text-amber-500 transition-colors">
                <span>Read article</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
