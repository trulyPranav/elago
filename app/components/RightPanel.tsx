'use client';
import { useState } from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { Property } from './data';
import PropertyCard from './PropertyCard';

export default function RightPanel({ properties, selectedId, onSelect, collapsed, onToggle }: {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [sort, setSort] = useState<'featured'|'price-asc'|'price-desc'>('featured');
  const sorted = [...properties].sort((a,b) => sort==='price-asc' ? a.priceFrom-b.priceFrom : sort==='price-desc' ? b.priceFrom-a.priceFrom : 0);

  if (collapsed) {
    return (
      <button onClick={onToggle}
        className="flex flex-col items-center gap-2 w-10 py-4 bg-white border-l border-brand-border hover:bg-brand-hover transition-colors group">
        <ChevronRight size={16} className="text-brand-muted group-hover:text-brand-orange transition-colors rotate-180"/>
        <span className="text-[10px] text-brand-muted tracking-widest uppercase" style={{writingMode:'vertical-rl'}}>{properties.length} Results</span>
      </button>
    );
  }

  return (
    <aside className="w-72 h-full flex flex-col bg-brand-light border-l border-brand-border animate-slide-right overflow-hidden" style={{width:280}}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border flex-shrink-0 bg-white">
        <div>
          <span className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">Results</span>
          <span className="ml-2 text-xs font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">{properties.length} found</span>
        </div>
        <button onClick={onToggle} className="text-brand-muted hover:text-brand-text transition-colors p-1">
          <ChevronRight size={14}/>
        </button>
      </div>

      <div className="px-3 py-2 border-b border-brand-border flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={11} className="text-brand-muted flex-shrink-0"/>
          <select value={sort} onChange={e => setSort(e.target.value as any)}
            className="flex-1 bg-brand-light border border-brand-border rounded-lg px-2 py-1.5 text-xs text-brand-text font-body focus:outline-none focus:border-brand-orange/50 transition-all">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="text-3xl mb-3">🏡</div>
            <p className="text-brand-muted font-body text-sm">No properties match</p>
            <p className="text-brand-muted/60 font-body text-xs mt-1">Try adjusting filters</p>
          </div>
        ) : sorted.map((p, i) => (
          <PropertyCard key={p.id} property={p} selected={selectedId === p.id} onClick={() => onSelect(p.id)} index={i}/>
        ))}
      </div>
    </aside>
  );
}
