import { MapPin, Mail, Phone, Terminal, GraduationCap, Award, Github, Linkedin, Briefcase, Code2, FileText, ArrowUpRight } from 'lucide-react';
import { leadership, projects } from '@/data/content';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  "Agentic AI":             "bg-purple-900/30 text-purple-300 border-purple-800/50",
  "Automotive AI":          "bg-amber-900/30 text-amber-300 border-amber-800/50",
  "Computer Vision":        "bg-blue-900/30 text-blue-300 border-blue-800/50",
  "GenAI":                  "bg-orange-900/30 text-orange-300 border-orange-800/50",
  "Reinforcement Learning": "bg-red-900/30 text-red-300 border-red-800/50",
  "ML · FinTech":           "bg-yellow-900/30 text-yellow-300 border-yellow-800/50",
};

const AI_CATEGORIES = new Set([
  'Agentic AI', 'GenAI', 'Computer Vision',
  'Reinforcement Learning', 'ML · FinTech', 'Automotive AI',
]);

const AI_KEYWORDS = [
  'llm', 'gpt', 'rag', 'mcp', 'genai', 'agentic', 'faiss', 'langchain',
  'huggingface', 'transformer', 'yolo', 'openai', 'claude', 'gemini',
  'pytorch', 'tensorflow', 'whisper', 'bert', 'fine-tun', 'vector',
  'diffusion', 'embedding', 'mistral', 'ollama',
];

function isAiTag(tech: string) {
  const lower = tech.toLowerCase();
  return AI_KEYWORDS.some(kw => lower.includes(kw));
}

const aiProjects = projects.filter(p => AI_CATEGORIES.has(p.category));

export default function ResumeSection() {
  return (
    <div className="animate-fade-in-up">
      {/* HERO */}
      <section className="mb-16">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm font-medium text-amber-400 mb-6 animate-slide-in-down">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Agent Engineer @ Prodigal</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 tracking-tight mb-6">
          Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Intelligence.</span><br />
          Designing <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Mobility.</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-8 max-w-2xl">
          Agent Engineer at <span className="text-zinc-300 font-medium">Prodigal</span>, building agentic AI for consumer finance — voice agents and orchestration for collections calls.
          I specialise in <span className="text-zinc-300 font-medium">MCP-orchestrated pipelines</span>, production RAG, and LLM systems that reason, retrieve, and act autonomously — with the same precision-engineering mindset I bring to <span className="text-amber-500/80 font-medium">automotive architecture</span>.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-10">
          <a href="mailto:kbedi03@gmail.com" className="flex items-center space-x-2 hover:text-amber-400 transition-colors group">
            <Mail size={18} className="group-hover:scale-110 transition-transform" />
            <span>kbedi03@gmail.com</span>
          </a>
          <div className="flex items-center space-x-2">
            <Phone size={18} /> <span>+91 7021484750</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={18} /> <span>Mumbai, Maharashtra</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="btn-press bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
            <Linkedin size={18} />
            <span><a href='https://www.linkedin.com/in/karan-bedi-9414a9241/' target="_blank" rel="noopener noreferrer">LinkedIn Connect</a></span>
          </button>
          <button className="btn-press bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
            <Github size={18} />
            <span><a href="https://github.com/kbaylake" target="_blank" rel="noopener noreferrer">GitHub</a></span>
          </button>
        </div>
      </section>

      {/* AI PROJECTS SPOTLIGHT */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest mb-1.5">What I Build</p>
            <div className="flex items-center gap-3">
              <Code2 className="text-amber-500" size={22} />
              <h2 className="text-2xl font-semibold text-zinc-100">AI / ML Projects</h2>
            </div>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors font-mono group"
          >
            All {projects.length} projects
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiProjects.map((project, idx) => {
            const catColor = categoryColors[project.category] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700';
            return (
              <div
                key={idx}
                className="card-elevate ai-card border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 hover:border-amber-700/30 transition-colors"
              >
                {/* Category + paper badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catColor}`}>
                    {project.category}
                  </span>
                  {project.paper && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-900/20 text-amber-400 border-amber-700/40 flex items-center gap-1">
                      <FileText size={10} />
                      Published Research
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-zinc-100 mb-0.5 leading-snug">{project.title}</h3>
                <p className="text-xs text-amber-500/80 font-mono mb-3">{project.subtitle}</p>

                {/* Impact */}
                <p className="text-xs text-zinc-500 font-mono leading-relaxed mb-4">
                  <span className="text-amber-600/80">▸ </span>{project.impact}
                </p>

                {/* Stack pills */}
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 5).map((tech, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded border border-zinc-700/50 bg-zinc-800/80 text-zinc-400 ${isAiTag(tech) ? 'tag-ai' : ''}`}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 5 && (
                    <span className="text-xs text-zinc-600 px-1 py-0.5 font-mono">+{project.stack.length - 5}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="mb-20 scroll-reveal">
        <div className="flex items-center space-x-3 mb-8">
          <Briefcase className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Experience</h2>
        </div>

        <div className="border-b border-zinc-800/50 pb-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <h3 className="font-medium text-zinc-200">Agent Engineer</h3>
              <p className="text-sm text-amber-500">Prodigal</p>
              <p className="text-xs text-zinc-500 mt-1">May 2026 - Present</p>
            </div>
            <div className="md:w-2/3 space-y-2">
              <p className="text-sm text-zinc-400">• Building agentic AI for consumer finance, focused on collections calls — voice agents, orchestration, and production LLM pipelines.</p>
              <p className="text-sm text-zinc-400">• Designing MCP-orchestrated systems that reason, retrieve context, and act autonomously in regulated financial workflows.</p>
              <p className="text-sm text-zinc-400">• Shipping production RAG and tool-calling architectures for real-time customer interactions at scale.</p>
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-800/50 pb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <h3 className="font-medium text-zinc-200">Senior Assistant Engineer (Intern)</h3>
              <p className="text-sm text-amber-500">Samsung India, Noida</p>
              <p className="text-xs text-zinc-500 mt-1">Jan 2026 - May 2026</p>
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
      <section className="mb-20 scroll-reveal">
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
            <span
              key={idx}
              className="skill-chip animate-scale-in bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium cursor-default"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="mb-20 scroll-reveal">
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
      <section className="scroll-reveal">
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCap className="text-amber-500" size={24} />
          <h2 className="text-2xl font-semibold text-zinc-100">Education</h2>
        </div>
        <div className="card-elevate bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
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
