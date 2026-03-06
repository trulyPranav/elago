'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, ChevronDown, Map, TrendingUp, X, Home as HomeIcon, BarChart2, List } from 'lucide-react';
import { PROPERTIES, PropertyStatus } from './components/data';
import FilterPanel, { Filters } from './components/FilterPanel';
import RightPanel from './components/RightPanel';
import ElagoLogo from './components/ElagoLogo';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

const DEFAULT: Filters = {
  types: ['Flat','Villa','Commercial','Plot'],
  statuses: ['New Launch','Under Construction','Ready','Resale'],
  priceMin: 4500000, priceMax: 35000000,
  builder: [], nearMetro: false, highAppreciation: false,
  possessionMonth: null, possessionYear: null,
};

const NOTIFICATIONS = [
  { id:1, title:'New listing added', desc:'Embassy Edge – Hebbal updated pricing', time:'2 min ago', unread:true },
  { id:2, title:'Price drop alert', desc:'Sobha Dream Acres reduced by ₹3L', time:'1 hr ago', unread:true },
  { id:3, title:'New launch', desc:'Mahindra Windchimes Phase 2 announced', time:'3 hrs ago', unread:false },
  { id:4, title:'Possession update', desc:'Brigade Utopia possession moved to Jun 2027', time:'Yesterday', unread:false },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    const u = localStorage.getItem('elago_user');
    if (!u) { router.replace('/login'); return; }
    setUser(JSON.parse(u));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => PROPERTIES.filter(p => {
    if (!filters.types.includes(p.type)) return false;
    if (!filters.statuses.includes(p.status)) return false;
    if (p.priceFrom < filters.priceMin) return false;
    if (p.priceTo > filters.priceMax) return false;
    if (filters.builder.length > 0 && !filters.builder.includes(p.builder)) return false;
    if (filters.highAppreciation && !p.highAppreciation) return false;
    if (filters.possessionYear && p.possessionYear && p.possessionYear > filters.possessionYear) return false;
    return true;
  }), [filters]);

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-brand-light">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"/>
        <p className="text-brand-muted text-sm font-body">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2 bg-white border-b border-brand-border z-50 flex-shrink-0 card-shadow">
        <div className="flex items-center gap-6">
          <ElagoLogo size="md"/>
          <div className="h-6 w-px bg-brand-border"/>
          <span className="text-xs font-body font-bold text-brand-navy uppercase tracking-widest">Dashboard</span>
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {[
              { label:'Map View', href:'/', icon: Map },
              { label:'Listings', href:'/listings', icon: List },
              { label:'Analytics', href:'/analytics', icon: BarChart2 },
            ].map(({ label, href, icon: Icon }) => (
              <button key={label} onClick={() => router.push(href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${href==='/' ? 'bg-brand-navy text-white font-semibold' : 'text-brand-muted hover:text-brand-navy hover:bg-brand-hover'}`}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-brand-light border border-brand-border rounded-xl px-3 py-2 w-64 focus-within:border-brand-orange/50 transition-colors">
          <Search size={13} className="text-brand-muted flex-shrink-0"/>
          <input type="text" placeholder="Search projects, builders, areas..." className="bg-transparent text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none font-body w-full"/>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
              className={`relative p-2 rounded-lg border transition-colors ${showNotifs ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
              <Bell size={16}/>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-orange rounded-full flex items-center justify-center text-[9px] text-white font-bold">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl card-shadow-lg border border-brand-border z-50 overflow-hidden animate-fadein-fast">
                <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-light">
                  <span className="text-sm font-body font-bold text-brand-navy">Notifications</span>
                  <span className="text-xs bg-brand-orange text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-brand-border/50 last:border-0 hover:bg-brand-hover cursor-pointer transition-colors ${n.unread ? 'bg-brand-orange/3' : ''}`}>
                      <div className="flex items-start gap-2.5">
                        {n.unread && <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-1.5"/>}
                        {!n.unread && <span className="w-2 h-2 flex-shrink-0 mt-1.5"/>}
                        <div className="flex-1">
                          <p className={`text-xs font-body font-semibold ${n.unread ? 'text-brand-navy' : 'text-brand-muted'}`}>{n.title}</p>
                          <p className="text-xs text-brand-muted font-body mt-0.5">{n.desc}</p>
                          <p className="text-[10px] text-brand-muted/60 font-body mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-brand-border text-center">
                  <button className="text-xs text-brand-orange font-body font-semibold hover:underline">Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button onClick={() => router.push('/settings')}
            className="p-2 rounded-lg border border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text transition-colors">
            <Settings size={16}/>
          </button>

          {/* User menu */}
          <div className="relative ml-1" ref={userMenuRef}>
            <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
              className="flex items-center gap-2 pl-3 border-l border-brand-border hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-orange flex items-center justify-center text-white text-sm font-bold font-body shadow">
                {(user.avatar || (user.name||'U')[0]).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-body font-bold text-brand-navy leading-none">{user.name || 'User'}</p>
                <p className="text-[10px] font-body text-brand-orange leading-none mt-0.5">{user.role || 'Agent'}</p>
              </div>
              <ChevronDown size={12} className={`text-brand-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`}/>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl card-shadow-lg border border-brand-border z-50 overflow-hidden animate-fadein-fast">
                <div className="px-4 py-3 border-b border-brand-border bg-brand-light">
                  <p className="text-xs font-bold text-brand-navy font-body">{user.name}</p>
                  <p className="text-[10px] text-brand-muted font-body">{user.email}</p>
                </div>
                {[
                  { label: 'My Profile',  action: () => router.push('/profile') },
                  { label: 'Settings',    action: () => router.push('/settings') },
                  { label: 'Sign Out',    action: () => { localStorage.removeItem('elago_user'); router.replace('/login'); }, danger: true },
                ].map(({ label, action, danger }) => (
                  <button key={label} onClick={action}
                    className={`w-full text-left px-4 py-2.5 text-sm font-body transition-colors border-b border-brand-border/40 last:border-0 ${danger ? 'text-red-500 hover:bg-red-50' : 'text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-5 py-1.5 bg-white border-b border-brand-border/60 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-brand-muted font-body">
          <Map size={11} className="text-brand-orange"/>
          <span>Showing <span className="text-brand-navy font-bold">{filtered.length}</span> properties</span>
        </div>
        <div className="h-3 w-px bg-brand-border"/>
        {(['New Launch','Ready','Under Construction'] as PropertyStatus[]).map(s => (
          <span key={s} className="text-xs text-brand-muted font-body">
            <span className="text-brand-navy font-bold">{PROPERTIES.filter(p=>p.status===s).length}</span> {s}
          </span>
        ))}
        {filtered.some(p=>p.highAppreciation) && (
          <span className="flex items-center gap-1 text-xs text-brand-orange font-body font-semibold ml-auto">
            <TrendingUp size={10}/> {filtered.filter(p=>p.highAppreciation).length} High Appreciation
          </span>
        )}
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <FilterPanel filters={filters} onChange={setFilters} collapsed={filterCollapsed} onToggle={() => setFilterCollapsed(!filterCollapsed)} resultCount={filtered.length}/>
        <main className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
          <MapView properties={filtered} selectedId={selectedId} onSelect={setSelectedId}/>
        </main>
        <RightPanel properties={filtered} selectedId={selectedId} onSelect={setSelectedId} collapsed={resultsCollapsed} onToggle={() => setResultsCollapsed(!resultsCollapsed)}/>
      </div>
    </div>
  );
}
