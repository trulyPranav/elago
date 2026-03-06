'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Bell, Shield, LogOut, Bookmark, MessageSquare, ChevronRight, Edit2, Settings, TrendingUp } from 'lucide-react';
import ElagoLogo from '../components/ElagoLogo';
import { PROPERTIES, formatPrice } from '../components/data';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'overview'|'saved'|'enquiries'>('overview');

  useEffect(() => {
    const u = localStorage.getItem('elago_user');
    if (!u) { router.replace('/login'); return; }
    setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => { localStorage.removeItem('elago_user'); router.replace('/login'); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY:'auto', height:'100vh' }}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-brand-border card-shadow">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-body font-medium transition-colors">
            <ArrowLeft size={15}/> Back
          </button>
          <div className="h-4 w-px bg-brand-border"/>
          <ElagoLogo size="sm"/>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-body font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={12}/> Sign Out
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-brand-border card-shadow p-6 mb-5 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-orange flex items-center justify-center text-white text-2xl font-bold font-body shadow-lg flex-shrink-0">
            {(user.avatar || (user.name||'U')[0]).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-body text-xl font-bold text-brand-navy">{user.name || 'User'}</h2>
                <span className="text-xs bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 rounded-full font-body font-semibold border border-brand-orange/20 inline-block mt-1">
                  {user.role || 'Sales Agent'}
                </span>
              </div>
              <button onClick={() => router.push('/settings')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted text-xs font-body hover:bg-brand-hover hover:text-brand-text transition-colors">
                <Edit2 size={12}/> Edit Profile
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {user.email && <span className="flex items-center gap-1.5 text-xs text-brand-muted font-body"><Mail size={11}/> {user.email}</span>}
              {user.phone && <span className="flex items-center gap-1.5 text-xs text-brand-muted font-body"><Phone size={11}/> {user.phone}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            ['Saved', '3', 'text-brand-orange', 'bg-brand-orange/10'],
            ['Enquiries', '7', 'text-brand-navy', 'bg-brand-navy/10'],
            ['Active Leads', '2', 'text-green-600', 'bg-green-50'],
          ].map(([label, val, color, bg]) => (
            <div key={label} className={`bg-white rounded-xl p-4 border border-brand-border card-shadow text-center`}>
              <div className={`text-2xl font-mono font-bold mb-1 ${color}`}>{val}</div>
              <div className="text-xs text-brand-muted font-body font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border border-brand-border card-shadow w-fit">
          {(['overview','saved','enquiries'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-body font-semibold capitalize transition-all ${tab===t ? 'bg-brand-navy text-white' : 'text-brand-muted hover:text-brand-text hover:bg-brand-hover'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Bookmark,      label:'Saved Properties', desc:'3 properties saved',    action: ()=>setTab('saved') },
              { icon: MessageSquare, label:'My Enquiries',     desc:'7 pending responses',    action: ()=>setTab('enquiries') },
              { icon: Bell,          label:'Notifications',    desc:'2 new alerts',            action: ()=>router.push('/settings') },
              { icon: Settings,      label:'Account Settings', desc:'Profile, security, prefs', action: ()=>router.push('/settings') },
            ].map(({ icon: Icon, label, desc, action }) => (
              <button key={label} onClick={action}
                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-brand-border card-shadow hover:border-brand-orange/30 hover:shadow-md transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-orange"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-navy font-body font-semibold">{label}</p>
                  <p className="text-xs text-brand-muted font-body">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-brand-muted group-hover:text-brand-orange transition-colors"/>
              </button>
            ))}
          </div>
        )}

        {tab === 'saved' && (
          <div className="space-y-3">
            {PROPERTIES.slice(0, 3).map(p => (
              <button key={p.id} onClick={() => router.push(`/property/${p.id}`)}
                className="w-full flex items-center gap-4 bg-white rounded-xl p-4 border border-brand-border card-shadow hover:border-brand-orange/30 hover:shadow-md transition-all text-left group">
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-navy font-body font-bold group-hover:text-brand-orange transition-colors">{p.name}</p>
                  <p className="text-xs text-brand-muted font-body">{p.builder} · {p.address}</p>
                  <p className="text-xs text-brand-orange font-mono font-bold mt-0.5">{formatPrice(p.priceFrom)} – {formatPrice(p.priceTo)}</p>
                </div>
                <ChevronRight size={14} className="text-brand-muted group-hover:text-brand-orange flex-shrink-0"/>
              </button>
            ))}
          </div>
        )}

        {tab === 'enquiries' && (
          <div className="space-y-3">
            {PROPERTIES.slice(0, 4).map((p, i) => (
              <div key={p.id} className="bg-white rounded-xl p-4 border border-brand-border card-shadow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-brand-navy font-body font-bold">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body font-semibold ${i%2===0 ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {i%2===0 ? 'Pending' : 'Replied'}
                  </span>
                </div>
                <p className="text-xs text-brand-muted font-body">{p.builder} · {['2 days ago','5 days ago','1 week ago','2 weeks ago'][i]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
