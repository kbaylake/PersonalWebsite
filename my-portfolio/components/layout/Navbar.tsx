'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Terminal, Car, Folder, Wrench, Rocket, Menu, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

        {/* --- DESKTOP NAV --- */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-1.5 transition-colors hover:text-amber-400 group relative ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}
              >
                {Icon && <Icon size={14} className="group-hover:scale-110 transition-transform duration-150" />}
                <span className="relative">
                  {label}
                  {!isActive && <span className="nav-underline" />}
                </span>
              </Link>
            );
          })}
        </div>

        {/* --- MOBILE HAMBURGER BUTTON --- */}
        <button
          className="md:hidden relative text-zinc-400 hover:text-amber-400 transition-colors p-2 -mr-2"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
          >
            <X size={22} />
          </span>
          <span
            className={`flex items-center justify-center transition-all duration-200 ${isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
          >
            <Menu size={22} />
          </span>
        </button>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60'
                  }`}
                >
                  {Icon ? (
                    <Icon size={16} className="flex-shrink-0" />
                  ) : (
                    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold text-amber-500/60">▸</span>
                  )}
                  <span className="text-sm font-medium">{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
