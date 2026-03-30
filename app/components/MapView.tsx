import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { Property, TYPE_COLORS } from './data';
import MapPreviewCard from './MapPreviewCard';

const DEV_LOGS = process.env.NODE_ENV !== 'production';

interface MapViewProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
}

const FACILITY_TYPES: Record<string, { emoji: string; color: string; label: string }> = {
  school:           { emoji: '🏫', color: '#3B82F6', label: 'School' },
  hospital:         { emoji: '🏥', color: '#EF4444', label: 'Hospital' },
  place_of_worship: { emoji: '🛕', color: '#F0B429', label: 'Temple / Church' },
  mall:             { emoji: '🛍️', color: '#8B5CF6', label: 'Mall' },
  railway_station:  { emoji: '🚉', color: '#10b981', label: 'Railway' },
  subway_entrance:  { emoji: '🚇', color: '#10b981', label: 'Metro' },
  supermarket:      { emoji: '🛒', color: '#EC4899', label: 'Supermarket' },
  park:             { emoji: '🌳', color: '#22C55E', label: 'Park' },
};

// Clean outlined SVG icons for each property type
function getPropertyIcon(type: string, color: string, selected: boolean): string {
  const bg = selected ? color : 'white';
  const fg = selected ? 'white' : color;
  const borderColor = color;
  const size = selected ? 42 : 34;
  const shadow = selected ? `filter:drop-shadow(0 4px 12px ${color}55);` : `filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18));`;

  const icons: Record<string, string> = {
    Flat: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size+6}" viewBox="0 0 44 52" style="${shadow}">
        <!-- Pin base -->
        <path d="M22 50 L14 34 A12 12 0 1 1 30 34 Z" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <!-- Building icon inside circle -->
        <circle cx="22" cy="22" r="12" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <!-- Building floors -->
        <rect x="15" y="14" width="14" height="16" rx="1" fill="${fg}" opacity="0.15"/>
        <rect x="15" y="14" width="14" height="16" rx="1" fill="none" stroke="${fg}" stroke-width="1.2"/>
        <!-- Windows row 1 -->
        <rect x="17" y="16.5" width="3" height="2.5" rx="0.3" fill="${fg}" opacity="0.9"/>
        <rect x="23" y="16.5" width="3" height="2.5" rx="0.3" fill="${fg}" opacity="0.9"/>
        <!-- Windows row 2 -->
        <rect x="17" y="21" width="3" height="2.5" rx="0.3" fill="${fg}" opacity="0.9"/>
        <rect x="23" y="21" width="3" height="2.5" rx="0.3" fill="${fg}" opacity="0.9"/>
        <!-- Door -->
        <rect x="19.5" y="26" width="5" height="4" rx="0.5" fill="${fg}" opacity="0.9"/>
      </svg>`,

    Villa: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size+6}" viewBox="0 0 44 52" style="${shadow}">
        <path d="M22 50 L14 34 A12 12 0 1 1 30 34 Z" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <circle cx="22" cy="22" r="12" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <!-- Roof -->
        <path d="M13 21 L22 13 L31 21" fill="${fg}" opacity="0.9" stroke="${fg}" stroke-width="0.5" stroke-linejoin="round"/>
        <!-- House body -->
        <rect x="15" y="21" width="14" height="8" rx="0.5" fill="${fg}" opacity="0.85"/>
        <!-- Door -->
        <rect x="19.5" y="24" width="5" height="5" rx="0.5" fill="${bg}" opacity="0.9"/>
        <!-- Window -->
        <rect x="16.5" y="22.5" width="3" height="3" rx="0.3" fill="${bg}" opacity="0.9"/>
        <rect x="24.5" y="22.5" width="3" height="3" rx="0.3" fill="${bg}" opacity="0.9"/>
      </svg>`,

    Commercial: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size+6}" viewBox="0 0 44 52" style="${shadow}">
        <path d="M22 50 L14 34 A12 12 0 1 1 30 34 Z" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <circle cx="22" cy="22" r="12" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <!-- Tower left -->
        <rect x="13" y="17" width="8" height="12" rx="0.5" fill="${fg}" opacity="0.8"/>
        <!-- Tower right taller -->
        <rect x="23" y="14" width="8" height="15" rx="0.5" fill="${fg}" opacity="0.9"/>
        <!-- Glass windows grid left -->
        <rect x="14.5" y="18.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="18" y="18.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="14.5" y="22" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="18" y="22" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <!-- Glass windows grid right -->
        <rect x="24.5" y="15.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="28" y="15.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="24.5" y="19" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="28" y="19" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="24.5" y="22.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
        <rect x="28" y="22.5" width="2" height="2" rx="0.2" fill="${bg}" opacity="0.85"/>
      </svg>`,

    Plot: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size+6}" viewBox="0 0 44 52" style="${shadow}">
        <path d="M22 50 L14 34 A12 12 0 1 1 30 34 Z" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <circle cx="22" cy="22" r="12" fill="${bg}" stroke="${borderColor}" stroke-width="2"/>
        <!-- Land boundary -->
        <rect x="13" y="14" width="18" height="16" rx="1" fill="none" stroke="${fg}" stroke-width="1.5" stroke-dasharray="2.5,1.5"/>
        <!-- Corner markers -->
        <circle cx="13" cy="14" r="1.2" fill="${fg}"/>
        <circle cx="31" cy="14" r="1.2" fill="${fg}"/>
        <circle cx="13" cy="30" r="1.2" fill="${fg}"/>
        <circle cx="31" cy="30" r="1.2" fill="${fg}"/>
        <!-- Area fill hint -->
        <rect x="15" y="16" width="14" height="12" rx="0.5" fill="${fg}" opacity="0.12"/>
        <!-- Center marker -->
        <circle cx="22" cy="22" r="2" fill="none" stroke="${fg}" stroke-width="1.2"/>
        <circle cx="22" cy="22" r="0.8" fill="${fg}"/>
      </svg>`,
  };

  return icons[type] || icons['Flat'];
}

export default function MapView({ properties, selectedId, onSelect, loading = false }: MapViewProps) {
  const router = useRouter();
  const mapRef        = useRef<any>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const markersRef    = useRef<any[]>([]);
  const facilityRef   = useRef<any[]>([]);
  const mapsRef       = useRef<any>(null);
  const markerLibRef  = useRef<any>(null);
  const overlayRef    = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [activeFacilityTypes, setActiveFacilityTypes] = useState<string[]>([]);
  const [isCardRetracted, setIsCardRetracted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const clearMarker = useCallback((marker: any) => {
    if (!marker) return;
    if (typeof marker.setMap === 'function') {
      marker.setMap(null);
      return;
    }
    marker.map = null;
  }, []);

  const clearFacilities = useCallback(() => {
    facilityRef.current.forEach(clearMarker);
    facilityRef.current = [];
  }, [clearMarker]);

  const closeActive = useCallback(() => {
    setActiveProperty(null);
    setIsCardRetracted(false);
    onSelect(null);
    clearFacilities();
    setActiveFacilityTypes([]);
  }, [onSelect, clearFacilities]);

  useEffect(() => {
    let active = true;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setMapError('Missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local.');
      return;
    }

    if (!containerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
        });
        const google = await loader.load();
        const markerLib = await google.maps.importLibrary('marker');
        if (!active || !containerRef.current) return;

        mapsRef.current = google.maps;
        markerLibRef.current = markerLib;
        const map = new google.maps.Map(containerRef.current, {
          center: { lat: 12.9716, lng: 77.5946 },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID',
        });

        const overlay = new google.maps.OverlayView();
        overlay.onAdd = () => undefined;
        overlay.draw = () => undefined;
        overlay.onRemove = () => undefined;
        overlay.setMap(map);

        map.addListener('click', closeActive);

        mapRef.current = map;
        overlayRef.current = overlay;
        setMapError(null);
        setReady(true);
      } catch (err) {
        console.error(err);
        if (active) setMapError('Failed to load Google Maps. Check API key and Places API enablement.');
      }
    };

    initMap();

    return () => {
      active = false;
      closeActive();
      markersRef.current.forEach(clearMarker);
      markersRef.current = [];
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
      mapRef.current = null;
      markerLibRef.current = null;
      mapsRef.current = null;
      setReady(false);
    };
  }, [closeActive, clearMarker]);

  useEffect(() => {
    if (!ready) return;
    const onResize = () => {
      if (!mapsRef.current || !mapRef.current) return;
      const center = mapRef.current.getCenter();
      mapsRef.current.event.trigger(mapRef.current, 'resize');
      if (center) mapRef.current.setCenter(center);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ready]);

  const facilityMarkerSvg = (emoji: string, color: string) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="14" fill="white" stroke="${color}" stroke-width="2"/>
      <text x="15" y="20" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>`;

  const buildMarkerContent = useCallback((svgMarkup: string, clickable = true) => {
    const wrapper = document.createElement('div');
    wrapper.className = clickable ? 'property-pin' : '';
    wrapper.innerHTML = svgMarkup;
    return wrapper;
  }, []);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    if (!mapsRef.current || !mapRef.current || !markerLibRef.current) return;
    clearFacilities();
    setLoadingFacilities(true);
    setActiveFacilityTypes([]);

    try {
      if (DEV_LOGS) console.info('[MapView] Requesting nearby places for', { lat, lng });
      const response = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) {
        throw new Error(`Places request failed (${response.status})`);
      }

      const data: {
        results: Array<{
          facilityType: string;
          places: Array<{ placeId: string; displayName: string; lat: number; lng: number }>;
        }>;
      } = await response.json();

      const found = new Set<string>();
      const seen = new Set<string>();

      (data.results || []).forEach(({ facilityType, places }) => {
        const cfg = FACILITY_TYPES[facilityType];
        if (!cfg) return;
        places.forEach((place) => {
          const placeId = place?.placeId;
          if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return;
          if (placeId && seen.has(placeId)) return;
          if (placeId) seen.add(placeId);

          found.add(facilityType);
          const marker = new markerLibRef.current.AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat: place.lat, lng: place.lng },
            title: place?.displayName || cfg.label,
            zIndex: 10,
            content: buildMarkerContent(facilityMarkerSvg(cfg.emoji, cfg.color), false),
            gmpClickable: false,
          });

          facilityRef.current.push(marker);
        });
      });

      setActiveFacilityTypes(Array.from(found));
      if (DEV_LOGS) {
        console.info('[MapView] Nearby places loaded', {
          categories: Array.from(found),
          totalMarkers: facilityRef.current.length,
        });
      }
    } catch (e) {
      console.error(e);
    }
    finally { setLoadingFacilities(false); }
  }, [clearFacilities]);

  const getPropertyMarkerContent = useCallback((type: string, color: string, selected: boolean) => {
    const svgHtml = getPropertyIcon(type, color, selected).replace(/\n\s*/g, ' ').trim();
    return buildMarkerContent(svgHtml, true);
  }, [buildMarkerContent]);

  useEffect(() => {
    if (!mapsRef.current || !mapRef.current || !ready || !markerLibRef.current) return;
    markersRef.current.forEach(clearMarker);
    markersRef.current = [];

    properties.forEach(property => {
      const color = TYPE_COLORS[property.type];
      const isSel = property.id === selectedId;

      const marker = new markerLibRef.current.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: property.lat, lng: property.lng },
        content: getPropertyMarkerContent(property.type, color, isSel),
        zIndex: isSel ? 1000 : 100,
        title: property.name,
        gmpClickable: true,
      });

      marker.addEventListener('gmp-click', () => {
        if (DEV_LOGS) console.info('[MapView] Property marker clicked', { id: property.id, name: property.name });
        setIsCardRetracted(false);
        setActiveProperty(property);
        onSelect(property.id);
        loadNearby(property.lat, property.lng);
      });

      markersRef.current.push(marker);
    });
  }, [ready, properties, selectedId, getPropertyMarkerContent, onSelect, loadNearby, clearMarker]);

  useEffect(() => {
    if (!mapRef.current || !selectedId || !ready) return;
    const p = properties.find(x => x.id === selectedId);
    if (p) mapRef.current.panTo({ lat: p.lat, lng: p.lng });
  }, [selectedId, ready]);

  useEffect(() => {
    if (!selectedId) return;
    const exists = properties.some(p => p.id === selectedId);
    if (!exists) closeActive();
  }, [selectedId, properties, closeActive]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Thin loading bar while API is fetching */}
      {loading && ready && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-[2000] overflow-hidden">
          <div className="h-full bg-brand-orange animate-pulse w-full" />
        </div>
      )}

      {!ready && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-light z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-muted font-body tracking-widest uppercase">Loading map…</span>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-light z-10">
          <div className="text-center px-6">
            <p className="text-sm text-brand-navy font-body font-semibold mb-1">Google Maps failed to initialize</p>
            <p className="text-xs text-brand-muted font-body">{mapError}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {ready && (
        <div className="absolute bottom-6 left-4 bg-white rounded-xl p-3 z-[1000] pointer-events-none card-shadow border border-brand-border">
          <p className="text-xs text-brand-muted font-body uppercase tracking-widest mb-2 font-medium">Property Types</p>
          {([['Flat','#00405c','Multi-storey apt'],['Villa','#f15a29','Independent house'],['Commercial','#10b981','Office / Retail'],['Plot','#F0B429','Land / Plot']] as [string,string,string][]).map(([label, color, desc]) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div style={{ width: 20, height: 20, flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: getPropertyIcon(label, color, false).replace('width="34"','width="20"').replace('height="40"','height="20"').replace('viewBox="0 0 44 52"','viewBox="2 2 40 35"') }} />
              <div>
                <span className="text-xs text-brand-text font-body font-medium">{label}</span>
                <span className="text-xs text-brand-muted font-body ml-1 hidden xl:inline">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facility legend */}
      {ready && activeFacilityTypes.length > 0 && (
        <div className="absolute bottom-6 right-4 bg-white rounded-xl p-3 z-[1000] pointer-events-none card-shadow border border-brand-border animate-fadein max-w-[170px]">
          <p className="text-xs text-brand-muted font-body uppercase tracking-widest mb-2 font-medium">Nearby</p>
          {activeFacilityTypes.map(ft => {
            const cfg = FACILITY_TYPES[ft];
            return cfg ? (
              <div key={ft} className="flex items-center gap-2 mb-1 last:mb-0">
                <span className="text-sm">{cfg.emoji}</span>
                <span className="text-xs text-brand-text font-body">{cfg.label}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {loadingFacilities && ready && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-1.5 z-[1000] flex items-center gap-2 card-shadow border border-brand-border">
          <div className="w-3 h-3 border border-brand-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-muted font-body">Finding nearby places…</span>
        </div>
      )}

      {activeProperty && ready && !isCardRetracted && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[2000] pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setIsCardRetracted(true)}
              className="absolute -top-2 -right-2 z-10 px-2 py-1 rounded-full bg-brand-navy text-white text-[10px] font-body font-semibold shadow hover:bg-brand-navy2 transition-colors"
            >
              Retract
            </button>
            <MapPreviewCard
              property={activeProperty}
              onClose={closeActive}
              onOpenDetails={() => router.push(`/property/${activeProperty.id}`)}
            />
          </div>
        </div>
      )}

      {activeProperty && ready && isCardRetracted && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[2000] pointer-events-auto">
          <button
            onClick={() => setIsCardRetracted(false)}
            className="px-3 py-2 rounded-xl bg-white border border-brand-border card-shadow text-brand-navy text-xs font-body font-semibold hover:bg-brand-hover transition-colors max-w-[220px] text-left"
          >
            <span className="block uppercase tracking-wider text-[10px] text-brand-muted mb-0.5">Selected</span>
            <span className="block truncate">{activeProperty.name}</span>
          </button>
        </div>
      )}
    </div>
  );
}
