"use client";
import React, { useState, useEffect } from 'react';
import { Github, Code2, ChevronRight, FileText, ArrowLeft, Loader2, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VaultFile {
  name: string;
  path: string;
}

interface CategoryData {
  category: string;
  files: VaultFile[];
}

export default function CodeVaultSection() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const username = "kbaylake";
  const heatmapUrl = `https://ghchart.rshah.org/f59e0b/${username}`;

  useEffect(() => {
    fetch('/api/vault')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        if (json.length > 0) setActiveCategory(json[0].category);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    fetch(selectedFile.path)
      .then(res => res.text())
      .then(text => setFileContent(text))
      .catch(() => setFileContent(""));
  }, [selectedFile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-zinc-400">Scanning Code Vault...</p>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => setSelectedFile(null)}
          className="flex items-center space-x-2 text-zinc-400 hover:text-amber-400 mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Vault</span>
        </button>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-10">
          <h1 className="text-4xl font-bold text-zinc-100 mb-8">{selectedFile.name}</h1>

          <div className="prose prose-invert max-w-none
            prose-headings:text-zinc-100 prose-headings:font-semibold
            prose-p:text-zinc-400 prose-p:leading-relaxed
            prose-a:text-amber-400 hover:prose-a:text-amber-300
            prose-strong:text-zinc-200 prose-strong:font-medium
            prose-code:text-amber-300 prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800
            prose-blockquote:border-l-amber-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
            prose-ul:marker:text-zinc-600 prose-li:text-zinc-400">
            {fileContent ? (
              <ReactMarkdown>{fileContent}</ReactMarkdown>
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
        <h2 className="text-3xl font-bold text-zinc-100 mb-2">The Code Vault</h2>
        <p className="text-zinc-400 mb-8">
          Tracking my consistency, algorithmic thinking, and daily LeetCode breakdowns.
        </p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12 overflow-x-auto no-scrollbar">
          <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center space-x-2">
            <Github size={20} className="text-amber-400" />
            <span>GitHub Contributions</span>
          </h3>
          <img
            src={heatmapUrl}
            alt="GitHub Commits Heatmap"
            className="min-w-[700px] opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        <div>
          <h3 className="text-xl font-medium text-zinc-200 mb-6 flex items-center space-x-2">
            <Code2 size={24} className="text-amber-400" />
            <span>Daily LeetCode Architectures</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">Categories</h3>
              {data.map((item) => (
                <button
                  key={item.category}
                  onClick={() => setActiveCategory(item.category)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group
                    ${activeCategory === item.category
                      ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'}`}
                >
                  <span className="truncate mr-2">{item.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-colors flex-shrink-0
                    ${activeCategory === item.category ? 'bg-amber-900/50 text-amber-300' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}>
                    {item.files.length}
                  </span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 min-h-[400px]">
                {activeCategory && data.find(d => d.category === activeCategory)?.files.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {data.find(d => d.category === activeCategory)?.files.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-amber-500 border border-zinc-800 group-hover:border-amber-500/20 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-zinc-200 font-medium group-hover:text-amber-400 transition-colors">{file.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1">Markdown Document</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-10">
                    <Terminal size={48} className="text-zinc-700 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">No documents yet</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">
                      Add a <code>.md</code> file into the <br/><code>public/code-vault/{activeCategory}</code><br/> folder to see it appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
