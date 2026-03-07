'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PROPERTIES, getPossessionYear } from './components/data';
import FilterPanel, { Filters } from './components/FilterPanel';
import RightPanel from './components/RightPanel';
import AppHeader from './components/AppHeader';
import StatusBar from './components/StatusBar';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

const DEFAULT_FILTERS: Filters = {
  types: ['Flat', 'Villa', 'Commercial', 'Plot'],
  statuses: ['New Launch', 'Under Construction', 'Ready', 'Resale'],
  priceMin: 4500000, priceMax: 35000000,
  builder: [], nearMetro: false, highAppreciation: false,
  possessionMonth: null, possessionYear: null,
};

export default function Home() {
  const [filters, setFilters]               = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  const filtered = useMemo(() => PROPERTIES.filter(p => {
    if (!filters.types.includes(p.type)) return false;
    if (!filters.statuses.includes(p.status)) return false;
    if (p.priceFrom < filters.priceMin) return false;
    if (p.priceTo > filters.priceMax) return false;
    if (filters.builder.length > 0 && !filters.builder.includes(p.builder)) return false;
    if (filters.highAppreciation && !p.highAppreciation) return false;
    if (filters.possessionYear) {
      const yr = getPossessionYear(p.possession);
      if (yr && yr > filters.possessionYear) return false;
    }
    return true;
  }), [filters]);

  return (
    <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
      <AppHeader />
      <StatusBar filtered={filtered} />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          collapsed={filterCollapsed}
          onToggle={() => setFilterCollapsed(v => !v)}
          resultCount={filtered.length}
        />
        <main className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
          <MapView properties={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </main>
        <RightPanel
          properties={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          collapsed={resultsCollapsed}
          onToggle={() => setResultsCollapsed(v => !v)}
        />
      </div>
    </div>
  );
}
