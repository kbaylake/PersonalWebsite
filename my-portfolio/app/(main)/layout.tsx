import Navbar from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {children}
      </main>
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        <p>© 2026 Karan Bedi — AI Engineer × Automotive Architect.</p>
      </footer>
    </>
  );
}
