import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
