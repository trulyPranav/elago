'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Mail, MessageCircle, Download, ExternalLink, BedDouble, Square, Calendar, TrendingUp, MapPin, Building2, ChevronDown, ChevronUp, FileText, BarChart2, CheckCircle2, XCircle, AlertCircle, Share2, Loader2 } from 'lucide-react';
import { formatPrice, STATUS_LIGHT, TYPE_COLORS } from '../../components/data';
import { api, ApiError, type Property } from '../../lib/api';
import SubPageHeader from '../../components/SubPageHeader';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllFloors, setShowAllFloors] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview'|'floors'|'docs'>('overview');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    api.getProperty(id)
      .then(res => { if (!cancelled) setProperty(res.data); })
      .catch(err => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 400)) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load property');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const FLOOR_STATUS_DISPLAY = {
    available: { label: 'Available', icon: <CheckCircle2 size={13} className="text-green-500"/>, color: 'text-green-600' },
    limited:   { label: 'Limited',   icon: <AlertCircle  size={13} className="text-yellow-500"/>, color: 'text-yellow-600' },
    sold:      { label: 'Sold Out',  icon: <XCircle      size={13} className="text-red-500"/>,    color: 'text-red-500'   },
  } as const;

  if (loading) return (
    <div className="min-h-screen bg-brand-light">
      <SubPageHeader subtitle="Loading…" />
      {/* Hero skeleton */}
      <div className="h-72 bg-brand-border/30 animate-pulse"/>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-brand-border p-6 h-20 animate-pulse"/>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-brand-border h-16 animate-pulse"/>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-brand-border h-48 animate-pulse"/>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="text-center">
        <p className="text-brand-muted font-body mb-2 font-semibold">Property not found</p>
        <p className="text-brand-muted/60 font-body text-sm mb-4">This listing may have been removed.</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-body font-semibold">Back to Map</button>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="text-center">
        <p className="text-brand-muted font-body mb-2">{error ?? 'Failed to load property'}</p>
        <button onClick={() => window.location.reload()} className="text-xs text-brand-orange font-body font-semibold underline mr-4">Retry</button>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-body font-semibold">Back to Map</button>
      </div>
    </div>
  );

  const images = [property.image];
  const floors = property.floorAvailability ?? [];
  const visibleFloors = showAllFloors ? floors : floors.slice(0, 4);
  const availableUnits = floors.reduce((s, f) => s + f.available, 0);
  const totalUnits = floors.reduce((s, f) => s + f.total, 0);

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY: 'auto', height: '100vh' }}>

      <SubPageHeader
        subtitle={property.name}
        right={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted text-xs font-body hover:bg-brand-hover hover:text-brand-text transition-colors">
              <Share2 size={12}/> Share
            </button>
            <a href={`tel:${property.phone}`} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-body font-semibold hover:bg-orange-600 transition-colors">
              <Phone size={12}/> Call Now
            </a>
          </div>
        }
      />

      {/* Hero image banner */}
      <div className="relative h-72 overflow-hidden">
        <img src={images[activeImage]} alt={property.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"/>
        <div className="absolute bottom-6 left-6">
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-body font-bold text-white" style={{ backgroundColor: STATUS_LIGHT[property.status] || '#64748b' }}>
              {property.status}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-body font-bold text-white" style={{ backgroundColor: TYPE_COLORS[property.type] }}>
              {property.type}
            </span>
            {property.highAppreciation && (
              <span className="text-xs px-2.5 py-1 rounded-full font-body font-bold text-white bg-brand-orange flex items-center gap-1">
                <TrendingUp size={10}/> High Appreciation
              </span>
            )}
          </div>
          <h1 className="font-body text-3xl font-bold text-white leading-tight drop-shadow">{property.name}</h1>
          <div className="flex items-center gap-1.5 text-white/80 text-sm font-body mt-1">
            <MapPin size={13}/> {property.address}
          </div>
        </div>
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-6 flex gap-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-brand-orange' : 'border-white/40 opacity-70 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">

        {/* Price + CTAs row */}
        <div className="bg-white rounded-2xl border border-brand-border card-shadow px-6 py-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-brand-muted font-body uppercase tracking-wider mb-1">Price Range</p>
            <div className="text-2xl font-mono font-bold text-brand-orange">
              {formatPrice(property.priceFrom)} – {formatPrice(property.priceTo)}
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${property.phone}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-body text-sm font-semibold hover:bg-orange-600 transition-colors">
              <Phone size={14}/> {property.phone}
            </a>
            <a href={`https://wa.me/91${property.phone}`} target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-body text-sm font-semibold hover:bg-green-600 transition-colors">
              <MessageCircle size={14}/> WhatsApp
            </a>
            <a href={`mailto:${property.email}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-brand-navy text-brand-navy font-body text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors">
              <Mail size={14}/> Email
            </a>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Builder',    value: property.builder,    icon: Building2 },
            { label:'Possession', value: property.possession,  icon: Calendar },
            { label:'Area',       value: property.area,        icon: Square },
            ...(property.bedrooms ? [{ label:'Configuration', value: property.bedrooms, icon: BedDouble }] : []),
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl px-4 py-3 border border-brand-border card-shadow flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-brand-orange"/>
              </div>
              <div>
                <p className="text-xs text-brand-muted font-body">{label}</p>
                <p className="text-sm text-brand-navy font-body font-semibold leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border border-brand-border card-shadow w-fit">
          {(['overview','floors','docs'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-body font-semibold capitalize transition-all ${activeTab === tab ? 'bg-brand-navy text-white shadow' : 'text-brand-muted hover:text-brand-text hover:bg-brand-hover'}`}>
              {tab === 'floors' ? 'Floor Availability' : tab === 'docs' ? 'Documents' : 'Overview'}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
                <h3 className="font-body text-base font-bold text-brand-navy uppercase tracking-wider mb-3">About this Project</h3>
                <p className="text-brand-muted font-body text-sm leading-relaxed">{property.description}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
                <h3 className="font-body text-base font-bold text-brand-navy uppercase tracking-wider mb-3">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2.5 text-sm font-body text-brand-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0"/>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
                <h3 className="font-body text-base font-bold text-brand-navy uppercase tracking-wider mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(a => (
                    <span key={a} className="px-3 py-1.5 rounded-full bg-brand-light border border-brand-border text-brand-text text-xs font-body font-medium">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-brand-border card-shadow">
                <h4 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Quick Facts</h4>
                <div className="space-y-2.5">
                  {[['Type', property.type],['Status', property.status],['Builder', property.builder],['Possession', property.possession],['Area', property.area],...(property.bedrooms ? [['Config', property.bedrooms]] : [])].map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between text-xs font-body py-1.5 border-b border-brand-border/50 last:border-0">
                      <span className="text-brand-muted">{k}</span>
                      <span className="text-brand-navy font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-brand-border card-shadow">
                <h4 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-2">Location</h4>
                <div className="flex items-start gap-2 text-xs font-body text-brand-muted">
                  <MapPin size={13} className="text-brand-orange flex-shrink-0 mt-0.5"/>
                  <span>{property.address}</span>
                </div>
                <p className="text-xs text-brand-muted/50 font-mono mt-2">{property.lat.toFixed(4)}°N, {property.lng.toFixed(4)}°E</p>
              </div>
            </div>
          </div>
        )}

        {/* FLOORS */}
        {activeTab === 'floors' && (
          <div className="space-y-4">
            {floors.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-brand-border card-shadow text-center">
                <AlertCircle size={32} className="text-brand-muted mx-auto mb-3"/>
                <p className="text-brand-muted font-body font-medium mb-1">Floor availability not yet added</p>
                <p className="text-brand-muted/60 font-body text-sm">Contact the builder or our team for unit-level details.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['Total Units', totalUnits, 'text-brand-navy', 'bg-brand-navy/10'],
                    ['Available',   availableUnits, 'text-green-600', 'bg-green-50'],
                    ['Floors Listed', floors.length, 'text-brand-orange', 'bg-brand-orange/10'],
                  ].map(([label, value, color, bg]) => (
                    <div key={label as string} className="bg-white rounded-xl p-4 border border-brand-border card-shadow text-center">
                      <div className={`text-3xl font-mono font-bold mb-1 ${color as string}`}>{value}</div>
                      <div className="text-xs text-brand-muted font-body font-medium">{label as string}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-6 px-5 py-3 border-b border-brand-border bg-brand-light">
                    {['Floor','Unit Types','Total','Available','₹/sqft','Status'].map(h => (
                      <div key={h} className="text-xs text-brand-muted font-body font-bold uppercase tracking-wider">{h}</div>
                    ))}
                  </div>
                  {visibleFloors.map((floor, i) => (
                    <div key={i}
                      className={`grid grid-cols-6 px-5 py-3.5 border-b border-brand-border/40 last:border-0 hover:bg-brand-hover transition-colors ${floor.status === 'sold' ? 'opacity-50' : ''}`}>
                      <div className="text-sm text-brand-navy font-body font-semibold">{floor.label}</div>
                      <div className="text-sm text-brand-muted font-body">{floor.unitTypes ?? '—'}</div>
                      <div className="text-sm text-brand-navy font-mono font-medium">{floor.total}</div>
                      <div className={`text-sm font-mono font-bold ${floor.available > 0 ? 'text-green-600' : 'text-red-500'}`}>{floor.available}</div>
                      <div className="text-sm text-brand-orange font-mono font-semibold">{floor.pricePerSqft ? `₹${floor.pricePerSqft.toLocaleString()}` : '—'}</div>
                      <div className={`flex items-center gap-1.5 text-xs font-body font-semibold ${FLOOR_STATUS_DISPLAY[floor.status].color}`}>
                        {FLOOR_STATUS_DISPLAY[floor.status].icon} {FLOOR_STATUS_DISPLAY[floor.status].label}
                      </div>
                    </div>
                  ))}
                </div>

                {floors.length > 4 && (
                  <button onClick={() => setShowAllFloors(!showAllFloors)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-brand-navy text-brand-navy text-sm font-body font-semibold hover:bg-brand-navy hover:text-white transition-all">
                    {showAllFloors ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show all {floors.length} floors</>}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* DOCS */}
        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Price Chart */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border card-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={22} className="text-brand-orange"/>
                </div>
                <div>
                  <h3 className="font-body text-base font-bold text-brand-navy mb-1">Price Chart</h3>
                  <p className="text-xs text-brand-muted font-body mb-4">Floor-wise pricing from the builder (PDF/Excel)</p>
                  {property.priceChartUrl ? (
                    <a href={property.priceChartUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-body font-semibold hover:bg-orange-600 transition-colors">
                      <Download size={14}/> Download Price Chart
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-muted text-sm font-body bg-brand-light px-3 py-2 rounded-lg border border-brand-border">
                      <AlertCircle size={14}/> Not available for this project
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Builder Brochure */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border card-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={22} className="text-brand-navy"/>
                </div>
                <div>
                  <h3 className="font-body text-base font-bold text-brand-navy mb-1">Builder Brochure</h3>
                  <p className="text-xs text-brand-muted font-body mb-4">Full specification document from the developer</p>
                  {property.builderDocLink ? (
                    <a href={property.builderDocLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy text-white text-sm font-body font-semibold hover:bg-brand-navy2 transition-colors">
                      <ExternalLink size={14}/> Open Document
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-muted text-sm font-body bg-brand-light px-3 py-2 rounded-lg border border-brand-border">
                      <AlertCircle size={14}/> Not available for this project
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-brand-light rounded-2xl p-5 border-2 border-dashed border-brand-border text-center">
              <p className="text-xs text-brand-muted font-body">
                📎 Documents are uploaded per-project by the admin. Contact <span className="text-brand-orange font-semibold">support@elago.in</span> to upload price charts or brochures for this listing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
