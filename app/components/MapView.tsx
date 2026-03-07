import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Property, TYPE_COLORS } from './data';
import MapPreviewCard from './MapPreviewCard';

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
  const [L, setL]     = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [activeFacilityTypes, setActiveFacilityTypes] = useState<string[]>([]);

  useEffect(() => {
    import('leaflet').then(mod => setL(mod.default));
  }, []);

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946], zoom: 11,
      zoomControl: true, attributionControl: true,
    });
    // Light map tiles - CartoDB Voyager (clean, light, no labels clutter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    const t = setTimeout(() => { map.invalidateSize({ animate: false }); setReady(true); }, 150);
    return () => { clearTimeout(t); map.remove(); mapRef.current = null; };
  }, [L]);

  useEffect(() => {
    if (!ready) return;
    const onResize = () => mapRef.current?.invalidateSize({ animate: false });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ready]);

  const clearFacilities = () => {
    facilityRef.current.forEach(m => m.remove());
    facilityRef.current = [];
  };

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    if (!L || !mapRef.current) return;
    clearFacilities();
    setLoadingFacilities(true);
    setActiveFacilityTypes([]);
    try {
      const q = `[out:json][timeout:15];(
        node["amenity"="school"](around:2500,${lat},${lng});
        node["amenity"="hospital"](around:2500,${lat},${lng});
        node["amenity"="place_of_worship"](around:2500,${lat},${lng});
        node["amenity"="supermarket"](around:2500,${lat},${lng});
        node["shop"="mall"](around:2500,${lat},${lng});
        node["railway"="station"](around:3000,${lat},${lng});
        node["station"="subway"](around:3000,${lat},${lng});
        node["leisure"="park"](around:2000,${lat},${lng});
      );out body 30;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST', body: `data=${encodeURIComponent(q)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const data = await res.json();
      const found = new Set<string>();
      (data.elements || []).forEach((el: any) => {
        const a = el.tags?.amenity, s = el.tags?.shop, r = el.tags?.railway, st = el.tags?.station, le = el.tags?.leisure;
        let ft = a === 'school' ? 'school' : a === 'hospital' ? 'hospital' : a === 'place_of_worship' ? 'place_of_worship'
          : (a === 'supermarket' || s === 'mall') ? 'mall' : r === 'station' ? 'railway_station'
          : st === 'subway' ? 'subway_entrance' : le === 'park' ? 'park' : '';
        if (!ft) return;
        const cfg = FACILITY_TYPES[ft];
        if (!cfg) return;
        found.add(ft);
        const name = el.tags?.name || cfg.label;
        const icon = L.divIcon({
          html: `<div style="width:30px;height:30px;background:white;border:2px solid ${cfg.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" title="${name}">${cfg.emoji}</div>`,
          className: '', iconSize: [30, 30], iconAnchor: [15, 15],
        });
        const m = L.marker([el.lat, el.lon], { icon, zIndexOffset: -100 });
        m.bindTooltip(`${cfg.emoji} <strong>${name}</strong>`, { permanent: false, direction: 'top', offset: [0, -16], opacity: 1 });
        m.addTo(mapRef.current);
        facilityRef.current.push(m);
      });
      setActiveFacilityTypes(Array.from(found));
    } catch(e) { console.error(e); }
    finally { setLoadingFacilities(false); }
  }, [L]);

  useEffect(() => {
    if (!L || !mapRef.current || !ready) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    properties.forEach(property => {
      const color = TYPE_COLORS[property.type];
      const isSel = property.id === selectedId;
      const svgHtml = getPropertyIcon(property.type, color, isSel);
      const w = isSel ? 42 : 34;
      const icon = L.divIcon({
        html: `<div class="property-pin">${svgHtml}</div>`,
        className: '', iconSize: [w, w + 6], iconAnchor: [w / 2, w + 6], popupAnchor: [0, -(w + 8)],
      });
      const marker = L.marker([property.lat, property.lng], { icon, zIndexOffset: isSel ? 1000 : 0 });
      marker.on('click', (e: any) => {
        const pt = mapRef.current.latLngToContainerPoint(e.latlng);
        setPopupPos({ x: pt.x, y: pt.y });
        setActiveProperty(property);
        onSelect(property.id);
        loadNearby(property.lat, property.lng);
        e.originalEvent?.stopPropagation();
      });
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [L, ready, properties, selectedId]);

  useEffect(() => {
    if (!mapRef.current || !selectedId || !ready) return;
    const p = properties.find(x => x.id === selectedId);
    if (p) mapRef.current.panTo([p.lat, p.lng], { animate: true, duration: 0.5 });
  }, [selectedId, ready]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const close = () => { setActiveProperty(null); onSelect(null); clearFacilities(); setActiveFacilityTypes([]); };
    mapRef.current.on('click', close);
    return () => mapRef.current?.off('click', close);
  }, [ready]);

  const clampL = () => Math.min(Math.max(popupPos.x - 144, 8), (containerRef.current?.offsetWidth ?? 900) - 298);
  const clampT = () => Math.max(popupPos.y - 440, 8);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Thin loading bar while API is fetching */}
      {loading && ready && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-[2000] overflow-hidden">
          <div className="h-full bg-brand-orange animate-pulse w-full" />
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-light z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-muted font-body tracking-widest uppercase">Loading map…</span>
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

      {activeProperty && ready && (
        <div className="absolute z-[2000] pointer-events-auto" style={{ left: clampL(), top: clampT() }}>
          <MapPreviewCard
            property={activeProperty}
            onClose={() => { setActiveProperty(null); onSelect(null); clearFacilities(); setActiveFacilityTypes([]); }}
            onOpenDetails={() => router.push(`/property/${activeProperty.id}`)}
          />
        </div>
      )}
    </div>
  );
}
