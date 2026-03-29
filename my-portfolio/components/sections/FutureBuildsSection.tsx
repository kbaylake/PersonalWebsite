import { Rocket } from 'lucide-react';

export default function FutureBuildsSection() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-zinc-100 mb-2">Future Builds</h2>
      <p className="text-zinc-400 mb-10">Non-academic, highly technical personal engineering concepts currently on the drawing board.</p>

      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="border border-zinc-800 border-dashed rounded-xl p-8 bg-zinc-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <Rocket className="text-amber-600" size={20} />
              <h3 className="text-xl font-medium text-zinc-300">Project Alpha-0{i}</h3>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${i * 15}%` }}></div>
            </div>
            <p className="text-sm text-zinc-500">Research & Design Phase. Documentation will be published upon prototype finalization.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
