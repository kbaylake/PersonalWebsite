"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, ArrowLeft } from "lucide-react";

interface Post {
  name: string;
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
        if (json.files.length > 0) setSelectedPost(json.files[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
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

  if (selectedPost) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center space-x-2 text-zinc-400 hover:text-amber-400 mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>All Articles</span>
        </button>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
          <div className="prose prose-invert max-w-none
            prose-headings:text-zinc-100
            prose-p:text-zinc-400
            prose-strong:text-zinc-200
            prose-em:text-zinc-300
            prose-hr:border-zinc-700
            prose-blockquote:border-l-amber-500
            prose-blockquote:bg-zinc-900/50
            prose-blockquote:px-4
            prose-blockquote:py-1
            prose-code:text-amber-300 prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-a:text-amber-400 hover:prose-a:text-amber-300
          ">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="flex items-center space-x-2 text-zinc-500">
                <Loader2 className="animate-spin" size={16} />
                <span>Loading document...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-12">
      <div>
        <h2 className="text-4xl font-bold text-zinc-100 mb-4">
          Automotive Architecture
        </h2>
        <p className="text-xl text-zinc-400 max-w-3xl">
          Where software logic meets mechanical reality.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <button
            key={post.path}
            onClick={() => setSelectedPost(post)}
            className="w-full text-left p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-all"
          >
            <h3 className="text-xl text-zinc-200">{post.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}
