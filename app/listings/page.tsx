'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List, Phone, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader';
import FilterPanel, { Filters } from '../components/FilterPanel';
import { formatPrice, TYPE_COLORS, STATUS_LIGHT } from '../components/data';
import { api, type Property, type Pagination } from '../lib/api';

const LIMIT = 12;

const DEFAULT_FILTERS: Filters = {
  types: ['Flat', 'Villa', 'Commercial', 'Plot'],
  statuses: ['New Launch', 'Under Construction', 'Ready', 'Resale'],
  priceMin: 4500000,
  priceMax: 35000000,
  builder: [],
  nearMetro: false,
  highAppreciation: false,
  possessionMonth: null,
  possessionYear: null,
  city: '',
};

export default function ListingsPage() {
  const router = useRouter();
  const [view, setView]             = useState<'grid'|'list'>('grid');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]             = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Debounce search input 400 ms
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(val);
    }, 400);
  };

  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFiltersChange = useCallback((next: Filters) => {
    setFilters(next);
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedFilters(next);
    }, 400);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.getProperties({
      page,
      limit: LIMIT,
      sortBy: 'newest',
      types: debouncedFilters.types,
      statuses: debouncedFilters.statuses,
      priceMin: debouncedFilters.priceMin,
      priceMax: debouncedFilters.priceMax,
      builder: debouncedFilters.builder.length ? debouncedFilters.builder : undefined,
      highAppreciation: debouncedFilters.highAppreciation || undefined,
      possessionYear: debouncedFilters.possessionYear ?? undefined,
      city: debouncedFilters.city || undefined,
      q: debouncedSearch || undefined,
    })
      .then(({ data, pagination: pg }) => {
        if (cancelled) return;
        setProperties(data);
        setPagination(pg);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, debouncedFilters, debouncedSearch]);

  return (
    <div className="h-screen flex flex-col bg-brand-light overflow-hidden">
      <SubPageHeader
        backLabel="Map View"
        center={
          <div className="flex items-center gap-2 bg-brand-light border border-brand-border rounded-xl px-3 py-2 w-64">
            <Search size={13} className="text-brand-muted"/>
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search projects or builders…"
              className="bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none font-body w-full"/>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg border transition-colors ${view==='grid' ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover'}`}><Grid size={14}/></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg border transition-colors ${view==='list' ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-border text-brand-muted hover:bg-brand-hover'}`}><List size={14}/></button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          collapsed={filterCollapsed}
          onToggle={() => setFilterCollapsed(v => !v)}
          resultCount={pagination?.total ?? properties.length}
        />

        <main className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-body text-2xl font-bold text-brand-navy">All Listings</h1>
                <p className="text-brand-muted text-sm font-body">
                  {loading ? (
                    <span className="flex items-center gap-1.5"><Loader2 size={12} className="animate-spin"/> Loading…</span>
                  ) : pagination ? (
                    `${pagination.total} properties found`
                  ) : null}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-brand-muted font-body mb-2">{error}</p>
                <button onClick={() => setPage(p => p)} className="text-xs text-brand-orange font-body font-semibold underline">Retry</button>
              </div>
            )}

            {!error && (
              <>
                <div className={loading ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
                  <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                    {loading && properties.length === 0
                      ? Array.from({ length: LIMIT }).map((_, i) => (
                          <div key={i} className="bg-white rounded-2xl border border-brand-border overflow-hidden animate-pulse">
                            <div className="h-44 bg-brand-border/40" />
                            <div className="p-4 space-y-2.5">
                              <div className="h-3.5 bg-brand-border/40 rounded w-3/4" />
                              <div className="h-3 bg-brand-border/40 rounded w-1/2" />
                              <div className="h-4 bg-brand-border/40 rounded w-2/3" />
                            </div>
                          </div>
                        ))
                      : properties.map((p, i) => (
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

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage || loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-border text-sm font-body font-semibold text-brand-muted hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={14}/> Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          disabled={loading}
                          className={`w-9 h-9 rounded-xl text-sm font-body font-semibold transition-all disabled:cursor-not-allowed ${
                            p === page ? 'bg-brand-navy text-white' : 'text-brand-muted hover:bg-brand-hover border border-brand-border'
                          }`}>
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!pagination.hasNextPage || loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-border text-sm font-body font-semibold text-brand-muted hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Next <ChevronRight size={14}/>
                    </button>
                  </div>
                )}

                {!loading && properties.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-4xl mb-4">🏡</div>
                    <p className="text-brand-muted font-body font-medium mb-1">No properties found</p>
                    <p className="text-brand-muted/60 font-body text-sm">Try a different search or filter</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
