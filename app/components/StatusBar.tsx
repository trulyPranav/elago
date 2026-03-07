import { Map, TrendingUp, Loader2 } from 'lucide-react';
import { Property } from './data';

interface StatusBarProps {
  properties: Property[];
  total: number;
  loading: boolean;
}

export default function StatusBar({ properties, total, loading }: StatusBarProps) {
  const statusCounts = (status: string) =>
    properties.filter(p => p.status === status).length;

  return (
    <div className="flex items-center gap-3 px-5 py-1.5 bg-white border-b border-brand-border/60 flex-shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-brand-muted font-body">
        {loading
          ? <Loader2 size={11} className="text-brand-orange animate-spin" />
          : <Map size={11} className="text-brand-orange" />
        }
        <span>
          Showing <span className="text-brand-navy font-bold">{properties.length}</span>
          {total > properties.length && (
            <> of <span className="text-brand-navy font-bold">{total}</span></>
          )} properties
        </span>
      </div>
      <div className="h-3 w-px bg-brand-border" />
      {(['New Launch', 'Ready', 'Under Construction'] as const).map(s => (
        <span key={s} className="text-xs text-brand-muted font-body">
          <span className="text-brand-navy font-bold">{statusCounts(s)}</span> {s}
        </span>
      ))}
      {properties.some(p => p.highAppreciation) && (
        <span className="flex items-center gap-1 text-xs text-brand-orange font-body font-semibold ml-auto">
          <TrendingUp size={10} /> {properties.filter(p => p.highAppreciation).length} High Appreciation
        </span>
      )}
    </div>
  );
}
