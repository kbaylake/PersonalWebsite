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
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
          <img
            src="/images/profile.jpeg"
            alt="Karan Bedi"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-900/50"
          />
          <div className="hidden sm:block">
            <span className="text-zinc-100 font-semibold tracking-wide">Karan Bedi</span>
            <span className="text-amber-500 text-xs font-mono ml-2 opacity-70">AI × AUTO</span>
          </div>
        </Link>

        {/* --- NAV TABS --- */}
        <div className="flex space-x-6 text-sm font-medium overflow-x-auto no-scrollbar px-2 w-full justify-start sm:justify-end">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 flex items-center space-x-1.5 transition-colors hover:text-amber-400 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}
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
