'use client';
import { useState } from 'react';
import { SlidersHorizontal, MapPin, ChevronDown, X, TrendingUp, Train } from 'lucide-react';
import { PropertyType, PropertyStatus, TYPE_COLORS, MONTHS } from './data';

export interface Filters {
  types: PropertyType[];
  statuses: PropertyStatus[];
  priceMin: number;
  priceMax: number;
  builder: string[];
  nearMetro: boolean;
  highAppreciation: boolean;
  possessionMonth: number | null;
  possessionYear: number | null;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  collapsed: boolean;
  onToggle: () => void;
  resultCount: number;
}

const ALL_TYPES:    PropertyType[]   = ['Flat','Villa','Commercial','Plot'];
const ALL_STATUSES: PropertyStatus[] = ['New Launch','Under Construction','Ready','Resale'];
const ALL_BUILDERS = ['Prestige Group','Sobha Developers','Embassy Group','Brigade Group','Adarsh Developers','Mahindra Lifespace'];
const YEARS = [2024,2025,2026,2027,2028];

const STATUS_COLORS_MAP: Record<PropertyStatus, string> = {
  'New Launch': '#f15a29', 'Under Construction': '#F0B429', 'Ready': '#10b981', 'Resale': '#8B5CF6'
};

const TYPE_ICON_COLOR: Record<PropertyType, string> = {
  Flat: '#00405c', Villa: '#f15a29', Commercial: '#10b981', Plot: '#F0B429'
};

export default function FilterPanel({ filters, onChange, collapsed, onToggle, resultCount }: Props) {
  const [builderOpen, setBuilderOpen] = useState(false);

  const toggleType    = (t: PropertyType)   => onChange({ ...filters, types:    filters.types.includes(t)    ? filters.types.filter(x=>x!==t)    : [...filters.types, t] });
  const toggleStatus  = (s: PropertyStatus) => onChange({ ...filters, statuses: filters.statuses.includes(s) ? filters.statuses.filter(x=>x!==s) : [...filters.statuses, s] });
  const toggleBuilder = (b: string)         => onChange({ ...filters, builder:  filters.builder.includes(b)  ? filters.builder.filter(x=>x!==b)  : [...filters.builder, b] });

  const hasActive = filters.types.length < 4 || filters.statuses.length < 4
    || filters.priceMin > 4500000 || filters.priceMax < 35000000
    || filters.builder.length > 0 || filters.nearMetro || filters.highAppreciation
    || filters.possessionMonth !== null || filters.possessionYear !== null;

  const fmt = (v: number) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : `₹${(v/100000).toFixed(0)}L`;

  if (collapsed) {
    return (
      <button onClick={onToggle}
        className="flex flex-col items-center gap-2 w-10 py-4 bg-white border-r border-brand-border hover:bg-brand-hover transition-colors group card-shadow-sm">
        <SlidersHorizontal size={16} className="text-brand-muted group-hover:text-brand-orange transition-colors" />
        {hasActive && <span className="w-2 h-2 rounded-full bg-brand-orange" />}
        <span className="text-[10px] text-brand-muted tracking-widest uppercase" style={{writingMode:'vertical-rl'}}>Filters</span>
      </button>
    );
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-brand-border animate-slide-left overflow-hidden" style={{width:260}}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-brand-orange" />
          <span className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">Refine</span>
          {hasActive && <span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full font-medium border border-brand-orange/20">Active</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-navy bg-brand-navy/10 px-2 py-0.5 rounded-full">{resultCount} results</span>
          <button onClick={onToggle} className="text-brand-muted hover:text-brand-text p-0.5 transition-colors"><X size={13}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 bg-white">
        {/* Status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Status</label>
          </div>
          <p className="text-xs text-brand-muted mb-2">(multi-select)</p>
          <div className="space-y-1.5">
            {ALL_STATUSES.map(s => {
              const active = filters.statuses.includes(s);
              return (
                <button key={s} onClick={() => toggleStatus(s)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body transition-all text-left border ${active ? 'bg-brand-navy/5 border-brand-navy/20 text-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text hover:border-brand-border'}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? STATUS_COLORS_MAP[s] : '#cbd5e1' }}/>
                  <span className="flex-1">{s}</span>
                  {active && <span className="text-xs font-bold text-brand-navy">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Location</label>
          </div>
          <div className="relative">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input type="text" placeholder="Search area, city..."
              className="w-full bg-brand-light border border-brand-border rounded-lg pl-8 pr-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body" />
          </div>
          <button className="text-xs text-brand-orange mt-1.5 flex items-center gap-1.5 hover:opacity-80 font-medium">
            <span className="w-1 h-1 bg-brand-orange rounded-full"/>Drop pin on map
          </button>
        </div>

        {/* Property Type */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Property Type</label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_TYPES.map(type => {
              const active = filters.types.includes(type);
              return (
                <button key={type} onClick={() => toggleType(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-body transition-all ${active ? 'border-brand-navy/30 bg-brand-navy/5 text-brand-navy font-medium' : 'border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: active ? TYPE_ICON_COLOR[type] : '#cbd5e1' }}/>
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Price Range</label>
          </div>
          <div className="space-y-2">
            <input type="range" min={4500000} max={35000000} step={500000} value={filters.priceMin}
              onChange={e => onChange({...filters, priceMin:+e.target.value})} className="w-full" />
            <input type="range" min={4500000} max={35000000} step={500000} value={filters.priceMax}
              onChange={e => onChange({...filters, priceMax:+e.target.value})} className="w-full" />
            <div className="flex justify-between">
              <span className="text-xs font-mono font-semibold text-brand-orange">{fmt(filters.priceMin)}</span>
              <span className="text-xs font-mono font-semibold text-brand-orange">{fmt(filters.priceMax)}</span>
            </div>
          </div>
        </div>

        {/* Possession */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Possession By</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-brand-muted mb-1">Month</p>
              <select value={filters.possessionMonth ?? ''} onChange={e => onChange({...filters, possessionMonth: e.target.value ? +e.target.value : null})}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-2 py-2 text-xs text-brand-text font-body focus:outline-none focus:border-brand-orange/60 transition-all">
                <option value="">Any</option>
                {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-brand-muted mb-1">Year</p>
              <select value={filters.possessionYear ?? ''} onChange={e => onChange({...filters, possessionYear: e.target.value ? +e.target.value : null})}
                className="w-full bg-brand-light border border-brand-border rounded-lg px-2 py-2 text-xs text-brand-text font-body focus:outline-none focus:border-brand-orange/60 transition-all">
                <option value="">Any</option>
                {[2024,2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Builder */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Builder</label>
          </div>
          <div className="relative">
            <button onClick={() => setBuilderOpen(!builderOpen)}
              className="w-full flex items-center justify-between bg-brand-light border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text font-body hover:border-brand-orange/40 transition-colors">
              <span className={filters.builder.length === 0 ? 'text-brand-muted' : ''}>
                {filters.builder.length === 0 ? 'All Builders' : `${filters.builder.length} selected`}
              </span>
              <ChevronDown size={13} className={`text-brand-muted transition-transform ${builderOpen?'rotate-180':''}`} />
            </button>
            {builderOpen && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white border border-brand-border rounded-xl card-shadow overflow-hidden">
                {ALL_BUILDERS.map(b => {
                  const checked = filters.builder.includes(b);
                  return (
                    <button key={b} onClick={() => toggleBuilder(b)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-body hover:bg-brand-hover text-left transition-colors border-b border-brand-border/50 last:border-0">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-brand-navy border-brand-navy' : 'border-brand-border'}`}>
                        {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                      </span>
                      <span className={checked ? 'text-brand-navy font-medium' : 'text-brand-muted'}>{b}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {filters.builder.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.builder.map(b => (
                <span key={b} className="flex items-center gap-1 text-xs bg-brand-navy/10 text-brand-navy px-2 py-0.5 rounded-full font-medium border border-brand-navy/20">
                  {b.split(' ')[0]}
                  <button onClick={() => toggleBuilder(b)} className="hover:text-brand-orange ml-0.5"><X size={9}/></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick filters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-0.5 bg-brand-orange rounded"/>
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Quick Filters</label>
          </div>
          <div className="space-y-2">
            <button onClick={() => onChange({...filters, nearMetro: !filters.nearMetro})}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body border transition-all ${filters.nearMetro ? 'bg-brand-navy/5 border-brand-navy/30 text-brand-navy font-medium' : 'border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
              <Train size={13}/> Near Metro
              {filters.nearMetro && <span className="ml-auto text-xs font-bold text-brand-navy">✓</span>}
            </button>
            <button onClick={() => onChange({...filters, highAppreciation: !filters.highAppreciation})}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body border transition-all ${filters.highAppreciation ? 'bg-brand-orange/5 border-brand-orange/30 text-brand-orange font-medium' : 'border-brand-border text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
              <TrendingUp size={13}/> High Appreciation
              {filters.highAppreciation && <span className="ml-auto text-xs font-bold text-brand-orange">✓</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 py-3 border-t border-brand-border flex-shrink-0 bg-white">
        <button onClick={() => onChange({ types: ALL_TYPES, statuses: ALL_STATUSES, priceMin: 4500000, priceMax: 35000000, builder: [], nearMetro: false, highAppreciation: false, possessionMonth: null, possessionYear: null })}
          className="w-full py-2 rounded-lg border-2 border-brand-orange text-brand-orange text-sm font-body font-semibold hover:bg-brand-orange hover:text-white transition-all uppercase tracking-wide">
          Reset All Filters
        </button>
      </div>
    </aside>
  );
}
