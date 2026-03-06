'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, Grid, List, Phone, TrendingUp } from 'lucide-react';
import ElagoLogo from '../components/ElagoLogo';
import { PROPERTIES, formatPrice, TYPE_COLORS, STATUS_COLORS } from '../components/data';

const STATUS_LIGHT: Record<string, string> = {
  'New Launch':'#f15a29','Under Construction':'#F0B429','Ready':'#10b981','Resale':'#8B5CF6'
};

export default function ListingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    if (!localStorage.getItem('elago_user')) router.replace('/login');
  }, []);

  const filtered = PROPERTIES.filter(p =>
    (typeFilter === 'All' || p.type === typeFilter) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.builder.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY:'auto', height:'100vh' }}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-brand-border card-shadow">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-body">
            <ArrowLeft size={15}/> Map View
          </button>
          <div className="h-4 w-px bg-brand-border"/>
          <ElagoLogo size="sm"/>
        </div>
        <div className="flex items-center gap-2 bg-brand-light border border-brand-border rounded-xl px-3 py-2 w-64">
          <Search size={13} className="text-brand-muted"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or builders…"
            className="bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none font-body w-full"/>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg border transition-colors ${view==='grid' ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover'}`}><Grid size={14}/></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg border transition-colors ${view==='list' ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover'}`}><List size={14}/></button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-body text-2xl font-bold text-brand-navy">All Listings</h1>
            <p className="text-brand-muted text-sm font-body">{filtered.length} properties found</p>
          </div>
          <div className="flex gap-2">
            {['All','Flat','Villa','Commercial','Plot'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all ${typeFilter===t ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:border-brand-navy/30 hover:text-brand-navy'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {filtered.map((p, i) => (
            <div key={p.id} onClick={() => router.push(`/property/${p.id}`)}
              className="bg-white rounded-2xl border border-brand-border card-shadow hover:shadow-lg hover:border-brand-navy/20 transition-all cursor-pointer group animate-fadein overflow-hidden"
              style={{ animationDelay: `${i*40}ms` }}>
              <div className="relative h-44 overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-body font-bold text-white" style={{ backgroundColor: STATUS_LIGHT[p.status] }}>{p.status}</span>
                  {p.highAppreciation && <span className="text-xs px-1.5 py-0.5 rounded-full font-body bg-brand-orange text-white flex items-center gap-1"><TrendingUp size={9}/> Rising</span>}
                </div>
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-body font-bold text-white" style={{ backgroundColor: TYPE_COLORS[p.type] }}>{p.type}</span>
              </div>
              <div className="p-4">
                <h3 className="font-body text-sm font-bold text-brand-navy mb-0.5 group-hover:text-brand-orange transition-colors">{p.name}</h3>
                <p className="text-xs text-brand-muted mb-2">{p.builder} · {p.address}</p>
                <div className="text-base font-mono font-bold text-brand-orange mb-3">{formatPrice(p.priceFrom)} – {formatPrice(p.priceTo)}</div>
                <div className="flex gap-2">
                  <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-orange text-white text-xs font-body font-semibold hover:bg-orange-600 transition-colors">
                    <Phone size={12}/> Call
                  </a>
                  <button className="flex-1 py-2 rounded-lg border-2 border-brand-navy text-brand-navy text-xs font-body font-semibold hover:bg-brand-navy hover:text-white transition-colors">
                    Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
