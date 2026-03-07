'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Property } from './components/data';
import FilterPanel, { Filters } from './components/FilterPanel';
import RightPanel from './components/RightPanel';
import AppHeader from './components/AppHeader';
import StatusBar from './components/StatusBar';
import { api } from './lib/api';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

const DEFAULT_FILTERS: Filters = {
  types: ['Flat', 'Villa', 'Commercial', 'Plot'],
  statuses: ['New Launch', 'Under Construction', 'Ready', 'Resale'],
  priceMin: 4500000, priceMax: 35000000,
  builder: [], nearMetro: false, highAppreciation: false,
  possessionMonth: null, possessionYear: null,
  city: '',
};

export default function Home() {
  const [filters, setFilters]                 = useState<Filters>(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [properties, setProperties]           = useState<Property[]>([]);
  const [total, setTotal]                     = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  // Debounce filter changes by 400 ms (avoids firing on each slider tick)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedFilters(f), 400);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.getProperties({
      limit: 100,                    // map view needs all visible pins at once
      types:        debouncedFilters.types,
      statuses:     debouncedFilters.statuses,
      priceMin:     debouncedFilters.priceMin,
      priceMax:     debouncedFilters.priceMax,
      builder:      debouncedFilters.builder.length ? debouncedFilters.builder : undefined,
      highAppreciation: debouncedFilters.highAppreciation || undefined,
      possessionYear:   debouncedFilters.possessionYear ?? undefined,
      city:             debouncedFilters.city || undefined,
    })
      .then(({ data, pagination }) => {
        if (cancelled) return;
        setProperties(data);
        setTotal(pagination.total);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedFilters]);

  return (
    <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
      <AppHeader />
      <StatusBar properties={properties} total={total} loading={loading} />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          collapsed={filterCollapsed}
          onToggle={() => setFilterCollapsed(v => !v)}
          resultCount={total}
        />
        <main className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-brand-muted font-body mb-2">{error}</p>
                <button onClick={() => setDebouncedFilters({ ...debouncedFilters })}
                  className="text-xs text-brand-orange font-body font-semibold underline">
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <MapView
              properties={properties}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
            />
          )}
        </main>
        <RightPanel
          properties={properties}
          selectedId={selectedId}
          onSelect={setSelectedId}
          collapsed={resultsCollapsed}
          onToggle={() => setResultsCollapsed(v => !v)}
          loading={loading}
        />
      </div>
    </div>
  );
}
