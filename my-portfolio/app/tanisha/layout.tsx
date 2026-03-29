import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanisha Bedi | Portfolio",
  description: "Tanisha Bedi's personal portfolio",
};

export default function TanishaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-cyan-900/50 flex items-center justify-center text-cyan-400 font-semibold text-sm">
              TB
            </div>
            <span className="text-slate-100 font-semibold tracking-wide hidden sm:block">Tanisha Bedi</span>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {children}
      </main>
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 Tanisha Bedi.</p>
      </footer>
    </>
  );
}
