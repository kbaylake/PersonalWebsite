"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ResumeSection from '@/components/sections/ResumeSection';
import CodeVaultSection from '@/components/sections/CodeVaultSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import CreationsSection from '@/components/sections/CreationsSection';
import FutureBuildsSection from '@/components/sections/FutureBuildsSection';
import AutoArchitectureSection from '@/components/sections/AutoArchitectureSection';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-900 selection:text-cyan-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {activeTab === 'home' && <ResumeSection />}
        {activeTab === 'code' && <CodeVaultSection />}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'creations' && <CreationsSection />}
        {activeTab === 'future' && <FutureBuildsSection />}
        {activeTab === 'auto' && <AutoArchitectureSection />}
      </main>
      
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 Karan Bedi. Built for the future of mobility.</p>
      </footer>
    </div>
  );
}
