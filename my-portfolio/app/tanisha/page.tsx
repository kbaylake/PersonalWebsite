import { MapPin, Mail, Phone, Terminal, GraduationCap, Award, Briefcase } from 'lucide-react';
import { skills, leadership } from '@/data/content';

export default function TanishaHome() {
  return (
    <div className="animate-fade-in-up">
      {/* HERO */}
      <section className="mb-20">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-sm font-medium text-cyan-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>Open to Opportunities</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-100 tracking-tight mb-6">
          Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Foundations.</span><br />
          Shaping <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tomorrow.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8 max-w-2xl">
          Commerce and business professional with a passion for finance, strategy, and building meaningful ventures.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-10">
          <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors cursor-pointer">
            <Mail size={18} /> <span>tanisha@bedifutureworks.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={18} /> <span>Mumbai, Maharashtra</span>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="mb-20">
        <div className="flex items-center space-x-3 mb-8">
          <Terminal className="text-cyan-500" size={24} />
          <h2 className="text-2xl font-semibold text-slate-100">Technical Arsenal</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, idx) => (
            <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-cyan-800 hover:text-cyan-300 transition-colors cursor-default">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="mb-20">
        <div className="flex items-center space-x-3 mb-8">
          <Award className="text-cyan-500" size={24} />
          <h2 className="text-2xl font-semibold text-slate-100">Leadership Journey</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {leadership.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-4 border-b border-slate-800/50 pb-6 last:border-0">
              <div className="md:w-1/3">
                <h3 className="font-medium text-slate-200">{item.role}</h3>
                <p className="text-sm text-cyan-500">{item.org}</p>
                <p className="text-xs text-slate-500 mt-1">{item.date}</p>
              </div>
              <div className="md:w-2/3">
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCap className="text-cyan-500" size={24} />
          <h2 className="text-2xl font-semibold text-slate-100">Education</h2>
        </div>
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between mb-2">
            <h3 className="text-lg font-medium text-slate-200">B.Com (Accountancy)</h3>
          </div>
          <p className="text-slate-400 mb-4">Anil Surendra Modi School of Commerce (AMSOC), NMIMS University <span className="text-slate-600">|</span> 2025 – 2029</p>
          <div className="space-y-2 pt-4 border-t border-slate-800/50 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Prabhavati Padamshi Soni International Junior College — A Levels Commerce</span>
              <span className="text-slate-300">2023 – 2025</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Vibgyor High</span>
              <span className="text-slate-300">2023</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
