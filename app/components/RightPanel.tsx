'use client';
import { useState } from 'react';
import { ArrowUpDown, ChevronRight, Phone, BedDouble, Square, TrendingUp } from 'lucide-react';
import { Property, formatPrice, TYPE_COLORS, STATUS_COLORS } from './data';
import { useRouter } from 'next/navigation';

const STATUS_LIGHT: Record<string, string> = {
  'New Launch':'#f15a29','Under Construction':'#F0B429','Ready':'#10b981','Resale':'#8B5CF6'
};

function PropertyCard({ property, selected, onClick, index }: { property: Property; selected: boolean; onClick: ()=>void; index: number }) {
  const router = useRouter();
  return (
    <div onClick={onClick}
      className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-200 group animate-fadein bg-white ${selected ? 'border-brand-orange shadow-md ring-1 ring-brand-orange/20' : 'border-brand-border hover:border-brand-navy/30 hover:shadow-md'}`}
      style={{ animationDelay: `${index*40}ms` }}>
      <div className="relative h-28 overflow-hidden">
        <img src={property.image} alt={property.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          <span className="text-[10px] font-body font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: STATUS_LIGHT[property.status] || '#64748b' }}>
            {property.status}
          </span>
          {property.highAppreciation && (
            <span className="text-[10px] font-body bg-brand-orange text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={8}/>
            </span>
          )}
        </div>
        <span className="absolute top-1.5 right-1.5 text-[10px] font-body font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: TYPE_COLORS[property.type] }}>
          {property.type}
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="font-body text-xs font-bold text-brand-navy leading-tight mb-0.5 group-hover:text-brand-orange transition-colors">{property.name}</h3>
        <p className="text-[10px] text-brand-muted font-body mb-1.5">{property.builder}</p>
        <div className="text-xs font-mono font-bold text-brand-orange mb-1.5">{formatPrice(property.priceFrom)} – {formatPrice(property.priceTo)}</div>
        {property.bedrooms && (
          <div className="flex items-center gap-1 text-[10px] text-brand-muted font-body mb-2">
            <BedDouble size={9}/> {property.bedrooms} &nbsp;·&nbsp; <Square size={9}/> {property.area}
          </div>
        )}
        <div className="flex gap-1">
          <a href={`tel:${property.phone}`} onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-orange text-white text-[10px] font-body font-semibold hover:bg-orange-600 transition-colors">
            <Phone size={9}/> Call
          </a>
          <button onClick={e => { e.stopPropagation(); router.push(`/property/${property.id}`); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-brand-navy text-brand-navy text-[10px] font-body font-semibold hover:bg-brand-navy hover:text-white transition-colors">
            Details →
          </button>
        </div>
      </div>
      {selected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-orange"/>}
    </div>
  );
}

export default function RightPanel({ properties, selectedId, onSelect, collapsed, onToggle }: {
  properties: Property[]; selectedId: string|null; onSelect:(id:string)=>void; collapsed:boolean; onToggle:()=>void;
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
