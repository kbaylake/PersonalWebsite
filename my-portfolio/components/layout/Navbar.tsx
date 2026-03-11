import { Terminal, Car, Folder, Wrench, Rocket } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* --- LOGO SECTION --- */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <img 
            src="/images/profile.jpeg" 
            alt="Karan Bedi"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-cyan-900/50"
          />
          <span className="text-slate-100 font-semibold tracking-wide hidden sm:block">Karan Bedi</span>
        </div>
        
        {/* --- NAVIGATION TABS --- */}
        <div className="flex space-x-6 text-sm font-medium overflow-x-auto no-scrollbar px-2 w-full justify-start sm:justify-end">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex-shrink-0 transition-colors hover:text-cyan-400 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            Resume
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${activeTab === 'code' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Terminal size={14} />
            <span>Code Vault</span>
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${activeTab === 'projects' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Folder size={14} />
            <span>Projects</span>
          </button>
          <button 
            onClick={() => setActiveTab('creations')}
            className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${activeTab === 'creations' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Wrench size={14} />
            <span>Creations</span>
          </button>
          <button 
            onClick={() => setActiveTab('future')}
            className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${activeTab === 'future' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Rocket size={14} />
            <span>Future Builds</span>
          </button>
          <button 
            onClick={() => setActiveTab('auto')}
            className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${activeTab === 'auto' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Car size={14} />
            <span>Automotive Architecture</span>
          </button>
        </div>
      </div>
    </nav>
  );
}