import { MapPin, Mail, Phone, Terminal, GraduationCap, Award, Github, Linkedin, Briefcase } from 'lucide-react';
import { leadership } from '@/data/content';

export default function ResumeSection() {
  return (
    <div className="animate-fade-in-up">
      {/* HERO */}
      <section className="mb-20">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm font-medium text-amber-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>AI Engineer × Automotive Systems</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 tracking-tight mb-6">
          Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Intelligence.</span><br />
          Designing <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Mobility.</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-8 max-w-2xl">
          AI and Data Analytics engineer building machine learning, computer vision, and agentic AI systems.
          Bridging scalable software with the future of automotive architecture.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-10">
          <div className="flex items-center space-x-2 hover:text-amber-400 transition-colors cursor-pointer">
            <Mail size={18} /> <span>kbedi03@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={18} /> <span>+91 7021484750</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={18} /> <span>Mumbai, Maharashtra</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2">
            <Linkedin size={18} />
            <span><a href='https://www.linkedin.com/in/karan-bedi-9414a9241/' target="_blank" rel="noopener noreferrer">LinkedIn Connect</a></span>
          </button>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2">
            <Github size={18} />
            <span><a href="https://github.com/kbaylake" target="_blank" rel="noopener noreferrer">GitHub</a></span>
          </button>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="mb-20">
        <div className="flex items-center space-x-3 mb-8">
          <Briefcase className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Experience</h2>
        </div>

        <div className="border-b border-zinc-800/50 pb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <h3 className="font-medium text-zinc-200">Senior Assistant Engineer (Intern)</h3>
              <p className="text-sm text-amber-500">Samsung India, Noida</p>
              <p className="text-xs text-zinc-500 mt-1">Jan 2026 - Present</p>
            </div>
            <div className="md:w-2/3 space-y-2">
              <p className="text-sm text-zinc-400">• Built AI-driven computer vision pipelines for defect detection and pattern analysis.</p>
              <p className="text-sm text-zinc-400">• Developed ETL workflows using Pandas, NumPy, and MySQL for large-scale data processing.</p>
              <p className="text-sm text-zinc-400">• Created Power BI dashboards to visualize operational metrics and defect trends.</p>
              <p className="text-sm text-zinc-400">• Collaborated with cross-functional teams to drive ML-based process optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="mb-20">
        <div className="flex items-center space-x-3 mb-8">
          <Terminal className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Technical Arsenal</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            "Python for AI/ML",
            "Machine Learning (Supervised & Unsupervised)",
            "Computer Vision (OpenCV, Image Processing)",
            "Agentic AI Systems",
            "MCP (Model Context Protocol)",
            "Data Preprocessing & Feature Engineering",
            "Model Evaluation & Optimization",
            "Pandas & NumPy",
            "SQL (MySQL) for Data Pipelines",
            "ETL & Data Pipelines",
            "REST APIs & AI Integration",
            "Power BI (AI-driven Analytics)",
            "Data Visualization",
            "Git & Docker"
          ].map((skill, idx) => (
            <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-amber-800 hover:text-amber-300 transition-colors cursor-default">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="mb-20">
        <div className="flex items-center space-x-3 mb-8">
          <Award className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">My Leadership Journey</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {leadership.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-4 border-b border-zinc-800/50 pb-6 last:border-0">
              <div className="md:w-1/3">
                <h3 className="font-medium text-zinc-200">{item.role}</h3>
                <p className="text-sm text-amber-500">{item.org}</p>
                <p className="text-xs text-zinc-500 mt-1">{item.date}</p>
              </div>
              <div className="md:w-2/3">
                <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCap className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Education</h2>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between mb-2">
            <h3 className="text-lg font-medium text-zinc-200">B.Tech in Artificial Intelligence</h3>
            <span className="text-amber-400 font-medium">CGPA 3.16/4.0</span>
          </div>
          <p className="text-zinc-400 mb-4">MPSTME, NMIMS University <span className="text-zinc-600">|</span> 2021 - 2026</p>
          <div className="space-y-2 pt-4 border-t border-zinc-800/50 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Prabhavati Padamshi Soni International Junior College (A Levels)</span>
              <span className="text-zinc-300">81.6% <span className="text-zinc-600 mx-1">|</span> 2019-2021</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vibgyor High Goregaon West (IGCSE)</span>
              <span className="text-zinc-300">89.875% <span className="text-zinc-600 mx-1">|</span> 2019</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
