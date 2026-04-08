'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MessageCircle,
  Download,
  ExternalLink,
  BedDouble,
  Square,
  Calendar,
  TrendingUp,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  Loader2,
  Sparkles,
  LineChart as LineChartIcon,
  Table,
  RotateCcw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice, STATUS_LIGHT, TYPE_COLORS } from '../../components/data';
import {
  api,
  ApiError,
  type Property,
  type PropertyChartRequest,
  type PropertyChartResult,
} from '../../lib/api';
import SubPageHeader from '../../components/SubPageHeader';

const DEFAULT_YEARS_TO_PROJECT = 25;
const DEFAULT_INTERVAL_YEARS = 5;
const CURRENT_YEAR = new Date().getFullYear();
const SUGGESTED_AMENITIES = ['metro', 'school', 'hospital', 'shopping_mall', 'it_park'];
const FACILITY_TO_AMENITY_TYPES: Record<string, string[]> = {
  school: ['school'],
  hospital: ['hospital'],
  place_of_worship: ['place_of_worship'],
  supermarket: ['supermarket'],
  mall: ['shopping_mall'],
  railway_station: ['train_station', 'transit_station'],
  subway_entrance: ['subway_station', 'transit_station', 'metro'],
  park: ['park'],
};

type NearbyPlacesResponse = {
  results?: Array<{
    facilityType: string;
    places: Array<{ placeId: string; displayName: string; lat: number; lng: number }>;
  }>;
  error?: string;
};

type TrendsFormState = {
  currentPropertyValue: number;
  currentRentValue: number;
  nearbyAmenities: string[];
  startYear: number;
  yearsToProject: number;
  intervalYears: number;
};

function parsePossessionYear(possession: string): number | null {
  const match = possession.match(/(20\d{2}|21\d{2})/);
  return match ? Number(match[1]) : null;
}

function compactINR(value: number): string {
  return `Rs. ${new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function growthPercent(base: number, current: number): number {
  if (base <= 0) return 0;
  return ((current - base) / base) * 100;
}

function toAiFactorList(factors: unknown): string[] {
  if (Array.isArray(factors)) {
    return factors.map((item) => String(item)).filter(Boolean);
  }
  if (factors && typeof factors === 'object') {
    return Object.entries(factors as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`);
  }
  return [];
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllFloors, setShowAllFloors] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'floors' | 'docs' | 'trends'>('overview');

  const [showAdvancedTrends, setShowAdvancedTrends] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [showTableFallback, setShowTableFallback] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [loadingNearbyAmenities, setLoadingNearbyAmenities] = useState(false);
  const [nearbyAmenitiesError, setNearbyAmenitiesError] = useState<string | null>(null);
  const [seriesVisibility, setSeriesVisibility] = useState({
    property: true,
    rent: true,
    total: true,
  });

  const [trendsForm, setTrendsForm] = useState<TrendsFormState>({
    currentPropertyValue: 0,
    currentRentValue: 0,
    nearbyAmenities: [],
    startYear: CURRENT_YEAR,
    yearsToProject: DEFAULT_YEARS_TO_PROJECT,
    intervalYears: DEFAULT_INTERVAL_YEARS,
  });

  const [trendsResult, setTrendsResult] = useState<PropertyChartResult | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [trendsDebugPayload, setTrendsDebugPayload] = useState<string | null>(null);

  const chartCacheRef = useRef<Map<string, PropertyChartResult>>(new Map());
  const trendsAbortRef = useRef<AbortController | null>(null);
  const trendsInitializedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    trendsInitializedRef.current = false;
    setTrendsResult(null);
    setTrendsError(null);
    setTrendsDebugPayload(null);

    api.getProperty(id)
      .then((res) => {
        if (cancelled) return;
        setProperty(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 400)) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load property');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!property || trendsInitializedRef.current) return;
    const defaultPropertyValue = Math.round((property.priceFrom + property.priceTo) / 2);
    const defaultRentValue = property.rental?.expectedRent ?? 0;
    const possessionYear = parsePossessionYear(property.possession);

    setTrendsForm((prev) => ({
      ...prev,
      currentPropertyValue: defaultPropertyValue,
      currentRentValue: defaultRentValue,
      startYear: Math.max(CURRENT_YEAR, possessionYear ?? CURRENT_YEAR),
      nearbyAmenities: property.highlights.slice(0, 2).map((h) => h.toLowerCase().replaceAll(' ', '_')),
    }));
    trendsInitializedRef.current = true;
  }, [property]);

  useEffect(() => {
    return () => {
      trendsAbortRef.current?.abort();
    };
  }, []);

  const FLOOR_STATUS_DISPLAY = {
    available: { label: 'Available', icon: <CheckCircle2 size={13} className="text-green-500" />, color: 'text-green-600' },
    limited: { label: 'Limited', icon: <AlertCircle size={13} className="text-yellow-500" />, color: 'text-yellow-600' },
    sold: { label: 'Sold Out', icon: <XCircle size={13} className="text-red-500" />, color: 'text-red-500' },
  } as const;

  const images = property ? [property.image] : [];
  const floors = property?.floorAvailability ?? [];
  const visibleFloors = showAllFloors ? floors : floors.slice(0, 4);
  const availableUnits = floors.reduce((sum, floor) => sum + floor.available, 0);
  const totalUnits = floors.reduce((sum, floor) => sum + floor.total, 0);

  const chartPoints = trendsResult?.coordinates ?? [];
  const baseTotal = chartPoints[0]?.totalINR ?? 0;
  const finalTotal = chartPoints.at(-1)?.totalINR ?? 0;
  const yearSpan = chartPoints.length > 1 ? chartPoints.at(-1)!.x - chartPoints[0].x : 0;
  const cagr = useMemo(() => {
    if (baseTotal <= 0 || finalTotal <= 0 || yearSpan <= 0) return 0;
    return (Math.pow(finalTotal / baseTotal, 1 / yearSpan) - 1) * 100;
  }, [baseTotal, finalTotal, yearSpan]);

  const finalRentShare = useMemo(() => {
    if (!chartPoints.length) return 0;
    const last = chartPoints[chartPoints.length - 1];
    if (!last.totalINR) return 0;
    return (last.rentValueINR / last.totalINR) * 100;
  }, [chartPoints]);

  const aiFactorList = useMemo(() => toAiFactorList(trendsResult?.aiEvaluation?.factors), [trendsResult]);

  const setTrendField = <K extends keyof TrendsFormState>(key: K, value: TrendsFormState[K]) => {
    setTrendsForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setTrendsForm((prev) => {
      const exists = prev.nearbyAmenities.includes(amenity);
      return {
        ...prev,
        nearbyAmenities: exists
          ? prev.nearbyAmenities.filter((item) => item !== amenity)
          : [...prev.nearbyAmenities, amenity],
      };
    });
  };

  const addCustomAmenity = () => {
    const normalized = customAmenityInput.trim().toLowerCase().replaceAll(' ', '_');
    if (!normalized) return;
    setTrendsForm((prev) => ({
      ...prev,
      nearbyAmenities: prev.nearbyAmenities.includes(normalized)
        ? prev.nearbyAmenities
        : [...prev.nearbyAmenities, normalized],
    }));
    setCustomAmenityInput('');
  };

  const fetchAmenitiesFromPlaces = async () => {
    if (!property || loadingNearbyAmenities) return;

    setLoadingNearbyAmenities(true);
    setNearbyAmenitiesError(null);

    try {
      const response = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: property.lat, lng: property.lng }),
      });

      const data = (await response.json().catch(() => ({}))) as NearbyPlacesResponse;
      if (!response.ok) {
        throw new Error(data.error || `Places request failed (${response.status})`);
      }

      const amenityTypes = new Set<string>();
      (data.results || []).forEach((item) => {
        if (!item.places?.length) return;
        (FACILITY_TO_AMENITY_TYPES[item.facilityType] || [item.facilityType]).forEach((type) => amenityTypes.add(type));
      });

      const discovered = Array.from(amenityTypes);
      if (discovered.length === 0) {
        setNearbyAmenitiesError('No nearby amenities were found for this location.');
        return;
      }

      setTrendsForm((prev) => ({
        ...prev,
        nearbyAmenities: Array.from(new Set([...prev.nearbyAmenities, ...discovered])),
      }));
      setNearbyAmenitiesError(null);
    } catch (err) {
      setNearbyAmenitiesError(err instanceof Error ? err.message : 'Failed to fetch nearby amenities.');
    } finally {
      setLoadingNearbyAmenities(false);
    }
  };

  const validateTrendsForm = (): string[] => {
    const errors: string[] = [];
    if (trendsForm.currentPropertyValue <= 0) errors.push('Current property value must be greater than 0.');
    if (trendsForm.currentRentValue < 0) errors.push('Current rent value cannot be negative.');
    if (trendsForm.startYear < 2000 || trendsForm.startYear > 2100) errors.push('Start year must be between 2000 and 2100.');
    if (trendsForm.yearsToProject < 5 || trendsForm.yearsToProject > 50) errors.push('Projection horizon must be between 5 and 50 years.');
    if (trendsForm.intervalYears < 1 || trendsForm.intervalYears > 10) errors.push('Interval must be between 1 and 10 years.');
    if (!Array.isArray(trendsForm.nearbyAmenities)) errors.push('Nearby amenities must be an array.');
    return errors;
  };

  const handleGenerateTrends = async () => {
    if (!property) return;

    const errors = validateTrendsForm();
    if (errors.length) {
      setTrendsError(errors.join(' '));
      setTrendsDebugPayload(null);
      return;
    }

    const payload: PropertyChartRequest = {
      currentPropertyValue: trendsForm.currentPropertyValue,
      currentRentValue: trendsForm.currentRentValue,
      nearbyAmenities: trendsForm.nearbyAmenities,
      startYear: trendsForm.startYear,
      yearsToProject: trendsForm.yearsToProject,
      intervalYears: trendsForm.intervalYears,
    };

    const cacheKey = `${property.id}:${JSON.stringify(payload)}`;
    const cached = chartCacheRef.current.get(cacheKey);
    if (cached) {
      setTrendsResult(cached);
      setTrendsError(null);
      setTrendsDebugPayload('Loaded from local cache');
      return;
    }

    trendsAbortRef.current?.abort();
    const controller = new AbortController();
    trendsAbortRef.current = controller;

    setTrendsLoading(true);
    setTrendsError(null);
    setTrendsDebugPayload(null);

    try {
      const result = await api.getPropertyChart(property.id, payload, controller.signal);
      chartCacheRef.current.set(cacheKey, result);
      setTrendsResult(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (err instanceof ApiError) {
        setTrendsError(err.message || 'Failed to generate trends projection.');
        setTrendsDebugPayload(JSON.stringify(err.details ?? { statusCode: err.statusCode, message: err.message }, null, 2));
      } else {
        setTrendsError(err instanceof Error ? err.message : 'Failed to generate trends projection.');
        setTrendsDebugPayload(JSON.stringify({ error: String(err) }, null, 2));
      }
    } finally {
      if (!controller.signal.aborted) setTrendsLoading(false);
    }
  };

  const resetTrendsToDefaults = () => {
    if (!property) return;
    const possessionYear = parsePossessionYear(property.possession);
    setTrendsForm({
      currentPropertyValue: Math.round((property.priceFrom + property.priceTo) / 2),
      currentRentValue: property.rental?.expectedRent ?? 0,
      nearbyAmenities: [],
      startYear: Math.max(CURRENT_YEAR, possessionYear ?? CURRENT_YEAR),
      yearsToProject: DEFAULT_YEARS_TO_PROJECT,
      intervalYears: DEFAULT_INTERVAL_YEARS,
    });
    setTrendsError(null);
    setTrendsDebugPayload(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light">
        <SubPageHeader subtitle="Loading..." />
        <div className="h-72 bg-brand-border/30 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6 h-20 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-brand-border h-16 animate-pulse" />
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-brand-border h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted font-body mb-2 font-semibold">Property not found</p>
          <p className="text-brand-muted/60 font-body text-sm mb-4">This listing may have been removed.</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-body font-semibold">
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted font-body mb-2">{error ?? 'Failed to load property'}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-brand-orange font-body font-semibold underline mr-4">
            Retry
          </button>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-body font-semibold">
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY: 'auto', height: '100vh' }}>
      <SubPageHeader
        subtitle={property.name}
        right={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-brand-muted text-xs font-body hover:bg-brand-hover hover:text-brand-text transition-colors">
              <Share2 size={12} /> Share
            </button>
            <a href={`tel:${property.phone}`} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-body font-semibold hover:bg-orange-600 transition-colors">
              <Phone size={12} /> Call Now
            </a>
          </div>
        }
      />

      <div className="relative h-72 overflow-hidden">
        <img src={images[activeImage]} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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
                <TrendingUp size={10} /> High Appreciation
              </span>
            )}
          </div>
          <h1 className="font-body text-3xl font-bold text-white leading-tight drop-shadow">{property.name}</h1>
          <div className="flex items-center gap-1.5 text-white/80 text-sm font-body mt-1">
            <MapPin size={13} /> {property.address}
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-6 right-6 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImage ? 'border-brand-orange' : 'border-white/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white rounded-2xl border border-brand-border card-shadow px-6 py-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-brand-muted font-body uppercase tracking-wider mb-1">Price Range</p>
            <div className="text-2xl font-mono font-bold text-brand-orange">
              {formatPrice(property.priceFrom)} - {formatPrice(property.priceTo)}
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${property.phone}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-body text-sm font-semibold hover:bg-orange-600 transition-colors">
              <Phone size={14} /> {property.phone}
            </a>
            <a href={`https://wa.me/91${property.phone}`} target="_blank" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-body text-sm font-semibold hover:bg-green-600 transition-colors">
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={`mailto:${property.email}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-brand-navy text-brand-navy font-body text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors">
              <Mail size={14} /> Email
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Builder', value: property.builder, icon: Building2 },
            { label: 'Possession', value: property.possession, icon: Calendar },
            { label: 'Area', value: property.area, icon: Square },
            ...(property.bedrooms ? [{ label: 'Configuration', value: property.bedrooms, icon: BedDouble }] : []),
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl px-4 py-3 border border-brand-border card-shadow flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-brand-orange" />
              </div>
              <div>
                <p className="text-xs text-brand-muted font-body">{label}</p>
                <p className="text-sm text-brand-navy font-body font-semibold leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mb-5 bg-white rounded-xl p-1 border border-brand-border card-shadow w-fit">
          {(['overview', 'floors', 'docs', 'trends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-body font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-brand-navy text-white shadow' : 'text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              {tab === 'floors' ? 'Floor Availability' : tab === 'docs' ? 'Documents' : tab === 'trends' ? 'Trends' : 'Overview'}
            </button>
          ))}
        </div>

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
                  {property.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2.5 text-sm font-body text-brand-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
                <h3 className="font-body text-base font-bold text-brand-navy uppercase tracking-wider mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-full bg-brand-light border border-brand-border text-brand-text text-xs font-body font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-brand-border card-shadow">
                <h4 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">Quick Facts</h4>
                <div className="space-y-2.5">
                  {[
                    ['Type', property.type],
                    ['Status', property.status],
                    ['Builder', property.builder],
                    ['Possession', property.possession],
                    ['Area', property.area],
                    ...(property.bedrooms ? [['Config', property.bedrooms]] : []),
                  ].map(([k, v]) => (
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
                  <MapPin size={13} className="text-brand-orange flex-shrink-0 mt-0.5" />
                  <span>{property.address}</span>
                </div>
                <p className="text-xs text-brand-muted/50 font-mono mt-2">
                  {property.lat.toFixed(4)} degrees N, {property.lng.toFixed(4)} degrees E
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'floors' && (
          <div className="space-y-4">
            {floors.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-brand-border card-shadow text-center">
                <AlertCircle size={32} className="text-brand-muted mx-auto mb-3" />
                <p className="text-brand-muted font-body font-medium mb-1">Floor availability not yet added</p>
                <p className="text-brand-muted/60 font-body text-sm">Contact the builder or our team for unit-level details.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['Total Units', totalUnits, 'text-brand-navy'],
                    ['Available', availableUnits, 'text-green-600'],
                    ['Floors Listed', floors.length, 'text-brand-orange'],
                  ].map(([label, value, color]) => (
                    <div key={label as string} className="bg-white rounded-xl p-4 border border-brand-border card-shadow text-center">
                      <div className={`text-3xl font-mono font-bold mb-1 ${color as string}`}>{value}</div>
                      <div className="text-xs text-brand-muted font-body font-medium">{label as string}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
                  <div className="grid grid-cols-6 px-5 py-3 border-b border-brand-border bg-brand-light">
                    {['Floor', 'Unit Types', 'Total', 'Available', 'Rs./sqft', 'Status'].map((h) => (
                      <div key={h} className="text-xs text-brand-muted font-body font-bold uppercase tracking-wider">
                        {h}
                      </div>
                    ))}
                  </div>
                  {visibleFloors.map((floor, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-6 px-5 py-3.5 border-b border-brand-border/40 last:border-0 hover:bg-brand-hover transition-colors ${
                        floor.status === 'sold' ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="text-sm text-brand-navy font-body font-semibold">{floor.label}</div>
                      <div className="text-sm text-brand-muted font-body">{floor.unitTypes ?? '-'} </div>
                      <div className="text-sm text-brand-navy font-mono font-medium">{floor.total}</div>
                      <div className={`text-sm font-mono font-bold ${floor.available > 0 ? 'text-green-600' : 'text-red-500'}`}>{floor.available}</div>
                      <div className="text-sm text-brand-orange font-mono font-semibold">{floor.pricePerSqft ? `Rs. ${floor.pricePerSqft.toLocaleString()}` : '-'}</div>
                      <div className={`flex items-center gap-1.5 text-xs font-body font-semibold ${FLOOR_STATUS_DISPLAY[floor.status].color}`}>
                        {FLOOR_STATUS_DISPLAY[floor.status].icon} {FLOOR_STATUS_DISPLAY[floor.status].label}
                      </div>
                    </div>
                  ))}
                </div>

                {floors.length > 4 && (
                  <button
                    onClick={() => setShowAllFloors(!showAllFloors)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-brand-navy text-brand-navy text-sm font-body font-semibold hover:bg-brand-navy hover:text-white transition-all"
                  >
                    {showAllFloors ? (
                      <>
                        <ChevronUp size={14} /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Show all {floors.length} floors
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-brand-border card-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={22} className="text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-body text-base font-bold text-brand-navy mb-1">Price Chart</h3>
                  <p className="text-xs text-brand-muted font-body mb-4">Floor-wise pricing from the builder (PDF/Excel)</p>
                  {property.priceChartUrl ? (
                    <a href={property.priceChartUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-body font-semibold hover:bg-orange-600 transition-colors">
                      <Download size={14} /> Download Price Chart
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-muted text-sm font-body bg-brand-light px-3 py-2 rounded-lg border border-brand-border">
                      <AlertCircle size={14} /> Not available for this project
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-brand-border card-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={22} className="text-brand-navy" />
                </div>
                <div>
                  <h3 className="font-body text-base font-bold text-brand-navy mb-1">Builder Brochure</h3>
                  <p className="text-xs text-brand-muted font-body mb-4">Full specification document from the developer</p>
                  {property.builderDocLink ? (
                    <a href={property.builderDocLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy text-white text-sm font-body font-semibold hover:bg-brand-navy2 transition-colors">
                      <ExternalLink size={14} /> Open Document
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-muted text-sm font-body bg-brand-light px-3 py-2 rounded-lg border border-brand-border">
                      <AlertCircle size={14} /> Not available for this project
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-brand-light rounded-2xl p-5 border-2 border-dashed border-brand-border text-center">
              <p className="text-xs text-brand-muted font-body">
                Documents are uploaded per-project by the admin. Contact <span className="text-brand-orange font-semibold">support@elago.in</span> to upload price charts or brochures for this listing.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-brand-border card-shadow p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-body text-base font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-orange" /> AI Trend Projection
                  </h3>
                  <p className="text-xs text-brand-muted font-body mt-1">
                    Project property value and rent growth in 5-year intervals, with index factors derived by AI.
                  </p>
                </div>
                <button
                  onClick={resetTrendsToDefaults}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border text-xs font-body font-semibold text-brand-muted hover:bg-brand-hover"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Current Property Value (INR)</label>
                  <input
                    type="number"
                    min={1}
                    value={trendsForm.currentPropertyValue || ''}
                    onChange={(e) => setTrendField('currentPropertyValue', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Current Rent Value (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={trendsForm.currentRentValue || ''}
                    onChange={(e) => setTrendField('currentRentValue', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide">Nearby Amenities</label>
                  <button
                    type="button"
                    onClick={fetchAmenitiesFromPlaces}
                    disabled={loadingNearbyAmenities}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border text-xs font-body font-semibold text-brand-navy hover:bg-brand-hover disabled:opacity-60"
                  >
                    {loadingNearbyAmenities ? <><Loader2 size={12} className="animate-spin" /> Discovering...</> : <><MapPin size={12} /> Use Places Nearby</>}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {SUGGESTED_AMENITIES.map((amenity) => {
                    const selected = trendsForm.nearbyAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-body font-semibold transition-all ${
                          selected
                            ? 'bg-brand-navy text-white border-brand-navy'
                            : 'border-brand-border text-brand-muted hover:border-brand-navy hover:text-brand-navy'
                        }`}
                      >
                        {amenity.replaceAll('_', ' ')}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                    placeholder="Add custom amenity"
                    className="flex-1 px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-4 py-2 rounded-xl bg-brand-light border border-brand-border text-sm font-body font-semibold text-brand-navy"
                  >
                    Add
                  </button>
                </div>
                {trendsForm.nearbyAmenities.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {trendsForm.nearbyAmenities.map((amenity) => (
                      <span key={amenity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-body text-brand-orange">
                        {amenity.replaceAll('_', ' ')}
                        <button type="button" onClick={() => toggleAmenity(amenity)}>
                          <XCircle size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {nearbyAmenitiesError && (
                  <p className="mt-2 text-xs text-red-600 font-body">{nearbyAmenitiesError}</p>
                )}
              </div>

              <div className="mt-4 border-t border-brand-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvancedTrends((prev) => !prev)}
                  className="text-xs font-body font-semibold text-brand-navy flex items-center gap-1"
                >
                  {showAdvancedTrends ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Advanced controls
                </button>
                {showAdvancedTrends && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Start Year</label>
                      <input
                        type="number"
                        min={2000}
                        max={2100}
                        value={trendsForm.startYear}
                        onChange={(e) => setTrendField('startYear', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Projection Horizon</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={trendsForm.yearsToProject}
                        onChange={(e) => setTrendField('yearsToProject', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">Interval (Years)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={trendsForm.intervalYears}
                        onChange={(e) => setTrendField('intervalYears', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm font-body"
                      />
                    </div>
                  </div>
                )}
              </div>

              {trendsError && <p className="mt-3 text-sm text-red-600 font-body">{trendsError}</p>}

              {trendsDebugPayload && (
                <div className="mt-3 border border-brand-border rounded-xl p-3 bg-brand-light">
                  <button
                    type="button"
                    className="text-xs font-body font-semibold text-brand-navy flex items-center gap-1"
                    onClick={() => setShowDebugPanel((prev) => !prev)}
                  >
                    {showDebugPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Debug Panel
                  </button>
                  {showDebugPanel && (
                    <pre className="mt-2 text-[11px] bg-white border border-brand-border rounded-lg p-2 overflow-auto max-h-44 text-brand-muted">
                      {trendsDebugPayload}
                    </pre>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  disabled={trendsLoading}
                  onClick={handleGenerateTrends}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white text-sm font-body font-semibold hover:bg-orange-600 disabled:opacity-60"
                >
                  {trendsLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Generating projection...
                    </>
                  ) : (
                    <>
                      <LineChartIcon size={14} /> Generate Projection
                    </>
                  )}
                </button>
              </div>
            </div>

            {trendsLoading && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-5">
                <div className="h-72 rounded-xl bg-brand-light animate-pulse" />
              </div>
            )}

            {trendsResult && !trendsLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-brand-border card-shadow p-4">
                    <p className="text-xs text-brand-muted font-body">Final Total</p>
                    <p className="text-lg font-mono font-bold text-brand-navy">{formatPrice(finalTotal)}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-brand-border card-shadow p-4">
                    <p className="text-xs text-brand-muted font-body">Net Increase</p>
                    <p className="text-lg font-mono font-bold text-brand-orange">{formatPrice(finalTotal - baseTotal)}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-brand-border card-shadow p-4">
                    <p className="text-xs text-brand-muted font-body">CAGR</p>
                    <p className="text-lg font-mono font-bold text-brand-navy">{cagr.toFixed(2)}%</p>
                  </div>
                  <div className="bg-white rounded-xl border border-brand-border card-shadow p-4">
                    <p className="text-xs text-brand-muted font-body">Final Rent Share</p>
                    <p className="text-lg font-mono font-bold text-brand-navy">{finalRentShare.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-border card-shadow p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">Projection Chart</h3>
                    <div className="flex items-center gap-2">
                      {[
                        { key: 'property', label: 'Property Value', color: '#2563eb' },
                        { key: 'rent', label: 'Rent Value', color: '#16a34a' },
                        { key: 'total', label: 'Total', color: '#f59e0b' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() =>
                            setSeriesVisibility((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof typeof prev],
                            }))
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${
                            seriesVisibility[item.key as keyof typeof seriesVisibility]
                              ? 'text-white'
                              : 'text-brand-muted border-brand-border bg-white'
                          }`}
                          style={seriesVisibility[item.key as keyof typeof seriesVisibility] ? { backgroundColor: item.color, borderColor: item.color } : undefined}
                        >
                          {item.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowTableFallback((prev) => !prev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-body font-semibold text-brand-muted hover:bg-brand-hover"
                      >
                        <Table size={12} /> {showTableFallback ? 'Hide Table' : 'Table View'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[760px] h-[360px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartPoints} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="x" tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis tickFormatter={(value) => compactINR(value)} tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload || !payload.length) return null;
                              const point = chartPoints.find((p) => p.x === label);
                              if (!point) return null;
                              const growth = growthPercent(baseTotal, point.totalINR);
                              return (
                                <div className="bg-white border border-brand-border rounded-xl shadow p-3 min-w-[220px]">
                                  <p className="text-xs font-body font-bold text-brand-navy mb-1">Year {label}</p>
                                  <p className="text-xs font-body text-brand-muted">Property: {formatPrice(point.propertyValueINR)}</p>
                                  <p className="text-xs font-body text-brand-muted">Rent: {formatPrice(point.rentValueINR)}</p>
                                  <p className="text-xs font-body text-brand-muted">Total: {formatPrice(point.totalINR)}</p>
                                  <p className="text-xs font-body font-semibold text-brand-orange mt-1">Growth vs base: {growth.toFixed(1)}%</p>
                                </div>
                              );
                            }}
                          />
                          {seriesVisibility.property && <Line type="monotone" dataKey="propertyValueINR" name="Property Value" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />}
                          {seriesVisibility.rent && <Line type="monotone" dataKey="rentValueINR" name="Rent Value" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />}
                          {seriesVisibility.total && <Line type="monotone" dataKey="totalINR" name="Total" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {showTableFallback && (
                    <div className="mt-4 border border-brand-border rounded-xl overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-brand-light border-b border-brand-border">
                          <tr>
                            {['Year', 'Property (INR)', 'Rent (INR)', 'Total (INR)', 'Growth %'].map((head) => (
                              <th key={head} className="px-3 py-2 text-left text-xs uppercase font-body font-bold text-brand-muted">
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chartPoints.map((row) => (
                            <tr key={row.x} className="border-b border-brand-border/50 last:border-b-0">
                              <td className="px-3 py-2 text-sm font-body text-brand-navy">{row.x}</td>
                              <td className="px-3 py-2 text-sm font-body text-brand-muted">{formatPrice(row.propertyValueINR)}</td>
                              <td className="px-3 py-2 text-sm font-body text-brand-muted">{formatPrice(row.rentValueINR)}</td>
                              <td className="px-3 py-2 text-sm font-body text-brand-orange font-semibold">{formatPrice(row.totalINR)}</td>
                              <td className="px-3 py-2 text-sm font-body text-brand-navy">{growthPercent(baseTotal, row.totalINR).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-brand-border card-shadow p-5">
                    <h4 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-2">AI Factors Summary</h4>
                    <div className="space-y-2 text-sm font-body text-brand-muted">
                      <p>Property Index: <span className="font-semibold text-brand-navy">{trendsResult.chartMeta.propertyIndex.toFixed(4)}</span></p>
                      <p>Rent Index: <span className="font-semibold text-brand-navy">{trendsResult.chartMeta.rentIndex.toFixed(4)}</span></p>
                      <p>Rent Start Year: <span className="font-semibold text-brand-navy">{trendsResult.chartMeta.rentStartYear}</span></p>
                      <p>Amenities Considered: <span className="font-semibold text-brand-navy">{trendsForm.nearbyAmenities.length || 0}</span></p>
                    </div>
                    {aiFactorList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-brand-border">
                        <p className="text-xs font-body font-semibold text-brand-muted uppercase mb-2">Detected factors</p>
                        <ul className="space-y-1">
                          {aiFactorList.map((item) => (
                            <li key={item} className="text-xs font-body text-brand-muted">- {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-border card-shadow p-5">
                    <h4 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-2">Projection Meta</h4>
                    <div className="space-y-2 text-sm font-body text-brand-muted">
                      <p>Chart Start Year: <span className="font-semibold text-brand-navy">{trendsResult.chartMeta.chartStartYear}</span></p>
                      <p>Points Generated: <span className="font-semibold text-brand-navy">{chartPoints.length}</span></p>
                      <p>Location: <span className="font-semibold text-brand-navy">{property.address}</span></p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!trendsResult && !trendsLoading && !trendsError && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-10 text-center">
                <LineChartIcon size={30} className="text-brand-border mx-auto mb-3" />
                <p className="text-brand-muted font-body font-medium mb-1">Generate AI projection to view long-term trends</p>
                <p className="text-brand-muted/70 font-body text-sm">
                  Set current value and rent, pick nearby amenities, then click Generate Projection.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
