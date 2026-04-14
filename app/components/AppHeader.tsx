'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Search, ChevronDown, Map, BarChart2, List, Settings2 } from 'lucide-react';
import { DEFAULT_USER } from '../lib/user';

const NAV_ITEMS = [
  { label: 'Map View',  href: '/',          icon: Map },
  { label: 'Listings',  href: '/listings',  icon: List },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Manage',    href: '/manage',    icon: Settings2 },
] as const;

export default function AppHeader() {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = DEFAULT_USER;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="relative flex items-center justify-between px-5 py-2 bg-white border-b border-brand-border z-50 flex-shrink-0 card-shadow">
      <div className="flex items-center gap-2">
        <Image
          src="/elago_logo.jpeg"
          alt="elaGO"
          width={110}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <div className="h-6 w-px bg-brand-border" />
      </div>

      <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-full max-w-4xl px-6">
        <div className="grid grid-cols-[1fr_1fr_2.4fr_1fr_1fr] gap-3 w-full items-center">
          {NAV_ITEMS.slice(0, 2).map(({ label, href, icon: Icon }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                pathname === href
                  ? 'bg-brand-navy text-white font-semibold'
                  : 'text-brand-muted hover:text-brand-navy hover:bg-brand-hover'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}

          <div className="w-full flex items-center gap-2 bg-brand-light border border-brand-border rounded-xl px-3 py-2 focus-within:border-brand-orange/50 transition-colors">
            <Search size={13} className="text-brand-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search projects, builders, areas…"
              className="bg-transparent text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none font-body w-full"
            />
          </div>

          {NAV_ITEMS.slice(2).map(({ label, href, icon: Icon }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                pathname === href
                  ? 'bg-brand-navy text-white font-semibold'
                  : 'text-brand-muted hover:text-brand-navy hover:bg-brand-hover'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative ml-1" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 pl-3 border-l border-brand-border hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-orange flex items-center justify-center text-white text-sm font-bold font-body shadow">
              {user.avatar}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-body font-bold text-brand-navy leading-none">{user.name}</p>
              <p className="text-[10px] font-body text-brand-orange leading-none mt-0.5">{user.role}</p>
            </div>
            <ChevronDown size={12} className={`text-brand-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl card-shadow-lg border border-brand-border z-50 overflow-hidden animate-fadein-fast">
              <div className="px-4 py-3 bg-brand-light">
                <p className="text-xs font-bold text-brand-navy font-body">{user.name}</p>
                <p className="text-[10px] text-brand-muted font-body">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
