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

  const username = "kbaylake"; // replace with your GitHub username

  // Fetch the list of files automatically from our API route
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

  // Fetch actual markdown content when a file is clicked
  useEffect(() => {
    if (selectedFile) {
      setFileContent(""); // Clear previous content while loading
      fetch(selectedFile.path)
        .then(res => res.text())
        .then(text => setFileContent(text));
    }
  }, [selectedFile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
        <p className="text-slate-400">Scanning Code Vault...</p>
      </div>
    );
  }

  // --- FILE VIEWER (NOTION-LIKE READER) ---
  if (selectedFile) {
    return (
      <div className="animate-fade-in-up">
        <button 
          onClick={() => setSelectedFile(null)}
          className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Vault</span>
        </button>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-10">
          <h1 className="text-4xl font-bold text-slate-100 mb-8">{selectedFile.name}</h1>
          
          <div className="prose prose-invert prose-cyan max-w-none 
            prose-headings:text-slate-100 prose-headings:font-semibold
            prose-p:text-slate-400 prose-p:leading-relaxed
            prose-a:text-cyan-400 hover:prose-a:text-cyan-300
            prose-strong:text-slate-200 prose-strong:font-medium
            prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800
            prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
            prose-ul:marker:text-slate-600 prose-li:text-slate-400">
            {fileContent ? (
              <ReactMarkdown>{fileContent}</ReactMarkdown>
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

  // --- MAIN VAULT VIEW ---
  return (
    <div className="animate-fade-in-up space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          The Code Vault
        </h2>
        <p className="text-slate-400 mb-8">
          Tracking my consistency, algorithmic thinking, and daily LeetCode breakdowns.
        </p>

        {/* --- GITHUB HEATMAP (Preserved from your code) --- */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-12 overflow-x-auto no-scrollbar">
          <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center space-x-2">
            <Github size={20} className="text-cyan-400" />
            <span>GitHub Contributions</span>
          </h3>
          <img
            src={`https://ghchart.rshah.org/06b6d4/${username}?t=${Date.now()}`}
            alt="GitHub Commits Heatmap"
            className="min-w-[700px] opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* --- FILE BROWSER --- */}
        <div>
          <h3 className="text-xl font-medium text-slate-200 mb-6 flex items-center space-x-2">
            <Code2 size={24} className="text-cyan-400" />
            <span>Daily LeetCode Architectures</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / Categories */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Categories</h3>
              {data.map((item) => (
                <button
                  key={item.category}
                  onClick={() => setActiveCategory(item.category)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group
                    ${activeCategory === item.category 
                      ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'}`}
                >
                  <span className="truncate mr-2">{item.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-colors flex-shrink-0
                    ${activeCategory === item.category ? 'bg-cyan-900/50 text-cyan-300' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    {item.files.length}
                  </span>
                </button>
              ))}
            </div>

            {/* File List */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
                {activeCategory && data.find(d => d.category === activeCategory)?.files.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {data.find(d => d.category === activeCategory)?.files.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-500 border border-slate-800 group-hover:border-cyan-500/20 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors">{file.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">Markdown Document</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-10">
                    <Terminal size={48} className="text-slate-700 mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No documents yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
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