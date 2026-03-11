import { Wrench } from 'lucide-react';

export default function CreationsSection() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-slate-100 mb-2">Creations & Builds</h2>
      <p className="text-slate-400 mb-10">Hardware, setups, and things I've built with my own hands.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {['Custom PC Architecture', 'Ergonomic Desk Setup', 'Hardware Modifications'].map((item, idx) => (
          <div key={idx} className="bg-slate-900/30 border border-slate-800 rounded-xl aspect-video flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-900/80 transition-all">
            <Wrench className="text-slate-600 group-hover:text-cyan-400 mb-4 transition-colors" size={32} />
            <h3 className="text-lg font-medium text-slate-300 group-hover:text-cyan-50">{item}</h3>
            <p className="text-sm text-slate-500 mt-2">Gallery & Specs coming soon.</p>
          </div>
        ))}
      </div>
    </div>
  );
}