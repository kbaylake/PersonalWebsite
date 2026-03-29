'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Car, Folder, Wrench, Rocket } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Resume', icon: null },
  { href: '/codevault', label: 'Code Vault', icon: Terminal },
  { href: '/projects', label: 'Projects', icon: Folder },
  { href: '/creations', label: 'Creations', icon: Wrench },
  { href: '/futurebuilds', label: 'Future Builds', icon: Rocket },
  { href: '/automotive', label: 'Automotive Architecture', icon: Car },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* --- LOGO SECTION --- */}
        <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
          <img
            src="/images/profile.jpeg"
            alt="Karan Bedi"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-cyan-900/50"
          />
          <span className="text-slate-100 font-semibold tracking-wide hidden sm:block">Karan Bedi</span>
        </Link>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex space-x-6 text-sm font-medium overflow-x-auto no-scrollbar px-2 w-full justify-start sm:justify-end">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-cyan-400 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
              >
                {Icon && <Icon size={14} />}
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
