import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karan Bedi | AI Engineer × Automotive Architect",
  description: "AI & Forward-Deployed Engineer open to roles in Mumbai — agentic AI, voice agents, multi-LLM orchestration, and MCP systems, with a parallel focus on automotive architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-300 antialiased selection:bg-amber-900 selection:text-amber-50">
        {children}
      </body>
    </html>
  );
}
