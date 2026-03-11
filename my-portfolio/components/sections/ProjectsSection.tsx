import { ExternalLink } from 'lucide-react';
import { projects } from '@/data/content';

export default function ProjectsSection() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-slate-100 mb-2">Selected Projects</h2>
      <p className="text-slate-400 mb-10">Data pipelines, AI models, and scalable architectures.</p>
      
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8 hover:border-cyan-900/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
              <h3 className="text-xl font-medium text-slate-200 mb-4 md:mb-0 md:pr-8">{project.title}</h3>
              <button className="flex items-center space-x-2 text-sm bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg transition-colors flex-shrink-0 w-fit">
                <ExternalLink size={14} />
                <span>Live Demo</span>
              </button>
            </div>
            <ul className="space-y-3">
              {project.points.map((point, i) => (
                <li key={i} className="flex items-start text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-700 mr-3 mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
