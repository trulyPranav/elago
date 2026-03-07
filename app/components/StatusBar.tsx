import { Map, TrendingUp } from 'lucide-react';
import { Property, PropertyStatus, PROPERTIES } from './data';

interface StatusBarProps {
  filtered: Property[];
}

export default function StatusBar({ filtered }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-1.5 bg-white border-b border-brand-border/60 flex-shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-brand-muted font-body">
        <Map size={11} className="text-brand-orange" />
        <span>
          Showing <span className="text-brand-navy font-bold">{filtered.length}</span> properties
        </span>
      </div>
      <div className="h-3 w-px bg-brand-border" />
      {(['New Launch', 'Ready', 'Under Construction'] as PropertyStatus[]).map(s => (
        <span key={s} className="text-xs text-brand-muted font-body">
          <span className="text-brand-navy font-bold">{PROPERTIES.filter(p => p.status === s).length}</span> {s}
        </span>
      ))}
      {filtered.some(p => p.highAppreciation) && (
        <span className="flex items-center gap-1 text-xs text-brand-orange font-body font-semibold ml-auto">
          <TrendingUp size={10} /> {filtered.filter(p => p.highAppreciation).length} High Appreciation
        </span>
      )}
    </div>
  );
}
