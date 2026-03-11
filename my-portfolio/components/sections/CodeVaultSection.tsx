import { Github, Code2, Terminal } from "lucide-react";

export default function CodeVaultSection() {
  const username = "kbaylake"; // replace with your GitHub username

  return (
    <div className="animate-fade-in-up space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          The Code Vault
        </h2>

        <p className="text-slate-400 mb-8">
          Tracking my consistency, algorithmic thinking, and daily LeetCode breakdowns.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-12 overflow-x-auto">
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

        <div>
          <h3 className="text-xl font-medium text-slate-200 mb-6 flex items-center space-x-2">
            <Code2 size={24} className="text-cyan-400" />
            <span>Daily LeetCode Architectures</span>
          </h3>

          <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-10 text-center">
            <Terminal className="mx-auto text-slate-600 mb-4" size={32} />

            <p className="text-slate-400 mb-2">
              Automated Notion Integration Pending...
            </p>

            <p className="text-sm text-slate-500 max-w-md mx-auto">
              This space will automatically populate with my daily Notion documents
              explaining time/space complexities and deep-dives into 15–25 medium
              level problems a week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}