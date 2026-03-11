import { Car } from 'lucide-react';

export default function AutoArchitectureSection() {
  return (
    <div className="animate-fade-in-up space-y-16">
      <div>
        <h2 className="text-4xl font-bold text-slate-100 mb-4">Automotive Architecture</h2>
        <p className="text-xl text-slate-400 max-w-3xl">
          Where software logic meets mechanical reality. This is my dedicated space for automotive innovation, engine mechanics, and drivetrain design.
        </p>
      </div>

      <section>
        <h3 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center">
          <span className="w-8 h-px bg-cyan-600 mr-4"></span>
          The Ideal Modern Car
        </h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <p className="text-slate-400 leading-relaxed mb-6">
            A blueprint for the future of mobility. Balancing the raw mechanical feedback of traditional engineering with the predictive, scalable capabilities of modern AI and edge computing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
              <h4 className="text-cyan-400 font-medium mb-2">Powertrain</h4>
              <p className="text-sm text-slate-500">Analysis of hybrid torque vectoring vs EV constraints.</p>
            </div>
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
              <h4 className="text-cyan-400 font-medium mb-2">Chassis Intelligence</h4>
              <p className="text-sm text-slate-500">Sensor fusion architectures for active suspension.</p>
            </div>
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
              <h4 className="text-cyan-400 font-medium mb-2">HMI</h4>
              <p className="text-sm text-slate-500">Structuring low-latency human-machine interfaces.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center">
          <span className="w-8 h-px bg-cyan-600 mr-4"></span>
          3 Dream Project Builds
        </h3>
        <div className="space-y-6">
          {['Build 01: The Track Purist', 'Build 02: Grand Touring Restomod', 'Build 03: Experimental Drivetrain'].map((build, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden group">
              <div className="w-full md:w-1/3 aspect-video bg-slate-950 border-r border-slate-800 flex items-center justify-center">
                <Car size={32} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
              </div>
              <div className="p-6 md:p-8 w-full md:w-2/3">
                <h4 className="text-xl font-medium text-slate-200 mb-2">{build}</h4>
                <p className="text-slate-500 text-sm">Detailed breakdown of chassis selection, engine swapping math, and suspension geometry coming soon.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center">
          <span className="w-8 h-px bg-cyan-600 mr-4"></span>
          Engineering Insights (Engines & Drivetrains)
        </h3>
        <div className="prose prose-invert max-w-none text-slate-400">
          <p>
            Documenting my research into the mechanical intricacies of automotive systems. From exploring new differential and gear systems to understanding combustion efficiencies and energy recovery strategies.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 text-cyan-500 text-sm font-medium border border-cyan-900/50 bg-cyan-900/10 px-4 py-2 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Currently drafting: "New Diff + Gear System Innovation"</span>
          </div>
        </div>
      </section>
    </div>
  );
}
