"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface Post {
  name: string;
  path: string;
}

export default function AutoArchitectureSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch list of markdown files (like CodeVault)
useEffect(() => {
  fetch("/api/automotive")
    .then(res => res.json())
    .then(json => {
      setPosts(json.files);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);

  // Fetch markdown content when selected
  useEffect(() => {
    if (selectedPost) {
      setContent("");
      fetch(selectedPost.path)
        .then((res) => res.text())
        .then((text) => setContent(text));
    }
  }, [selectedPost]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-slate-400 py-20 justify-center">
        <Loader2 className="animate-spin" size={20} />
        <span>Loading automotive content...</span>
      </div>
    );
  }

  // --- SINGLE POST VIEW ---
  if (selectedPost) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-slate-400 hover:text-cyan-400 mb-6"
        >
          ← Back
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">

          <div className="prose prose-invert max-w-none 
            prose-headings:text-slate-100
            prose-p:text-slate-400
            prose-strong:text-slate-200
            prose-em:text-slate-300
            prose-hr:border-slate-700
            prose-blockquote:border-l-cyan-500
            prose-blockquote:bg-slate-900/50
            prose-blockquote:px-4
            prose-blockquote:py-1
          ">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="flex items-center space-x-2 text-slate-500">
                <Loader2 className="animate-spin" size={16} />
                <span>Loading document...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="animate-fade-in-up space-y-12">
      <div>
        <h2 className="text-4xl font-bold text-slate-100 mb-4">
          Automotive Architecture
        </h2>
        <p className="text-xl text-slate-400 max-w-3xl">
          Where software logic meets mechanical reality.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <button
            key={post.path}
            onClick={() => setSelectedPost(post)}
            className="w-full text-left p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all"
          >
            <h3 className="text-xl text-slate-200">{post.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}