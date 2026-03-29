import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Karan Bedi | Portfolio",
  description: "Software Engineer & Automotive Futurist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-300 antialiased selection:bg-cyan-900 selection:text-cyan-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          <p>© 2026 Karan Bedi. Built for the future of mobility.</p>
        </footer>
      </body>
    </html>
  );
}
