export type PropertyType   = 'Flat' | 'Villa' | 'Commercial' | 'Plot';
export type PropertyStatus = 'New Launch' | 'Under Construction' | 'Ready' | 'Resale';

export interface PriceChartRow {
  floors: string;
  unitType: string;
  area: number;
  basePricePerSqft: number;
  totalPrice: number;
}

export interface FloorAvailability {
  floor: number;
  label: string;
  available: number;
  total: number;
  status: 'available' | 'limited' | 'sold';
}

export interface Property {
  id: string;
  name: string;
  builder: string;
  address: string;
  lat: number;
  lng: number;
  type: PropertyType;
  status: PropertyStatus;
  priceFrom: number;
  priceTo: number;
  area: string;
  bedrooms?: string;
  possession: string;   // "Mar 2026" format
  phone: string;
  email: string;
  image: string;
  description: string;
  highlights: string[];
  amenities: string[];
  highAppreciation: boolean;
  // Optional — only populate for properties that have this data
  priceChart?: PriceChartRow[];
  floorAvailability?: FloorAvailability[];
  builderDocLink?: string;
}

export const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Prestige Lakeside Habitat',
    builder: 'Prestige Group',
    address: 'Whitefield, Bangalore',
    lat: 12.9698,
    lng: 77.7499,
    type: 'Villa',
    status: 'New Launch',
    priceFrom: 8500000,
    priceTo: 14500000,
    area: '1100–1650 sqft',
    bedrooms: '2, 3 BHK',
    possession: 'Mar 2026',
    phone: '9999999999',
    email: 'sales@prestige.com',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    description: 'A landmark address offering villa residences with lake views and world-class amenities in the heart of Whitefield. Each home is crafted with premium materials, open floor plans, and private outdoor spaces designed for modern living.',
    highlights: ['Lake facing units', 'Private pool villas available', 'RERA approved', '24/7 security', 'Proximity to IT corridor'],
    amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Tennis Court', 'Children Play Area'],
    highAppreciation: true,
    priceChart: [
      { floors: '1 – 5',   unitType: '2 BHK', area: 1100, basePricePerSqft: 7200, totalPrice: 7920000  },
      { floors: '1 – 5',   unitType: '3 BHK', area: 1350, basePricePerSqft: 7200, totalPrice: 9720000  },
      { floors: '6 – 10',  unitType: '2 BHK', area: 1100, basePricePerSqft: 7500, totalPrice: 8250000  },
      { floors: '6 – 10',  unitType: '3 BHK', area: 1350, basePricePerSqft: 7500, totalPrice: 10125000 },
      { floors: '11 – 15', unitType: '3 BHK', area: 1350, basePricePerSqft: 8000, totalPrice: 10800000 },
      { floors: '11 – 15', unitType: '3 BHK', area: 1650, basePricePerSqft: 8000, totalPrice: 13200000 },
      { floors: '16 – 20', unitType: '3 BHK', area: 1650, basePricePerSqft: 8800, totalPrice: 14520000 },
    ],
    floorAvailability: [
      { floor: 1,  label: 'Floor 1',  available: 2, total: 4, status: 'available' },
      { floor: 2,  label: 'Floor 2',  available: 0, total: 4, status: 'sold'      },
      { floor: 3,  label: 'Floor 3',  available: 1, total: 4, status: 'limited'   },
      { floor: 4,  label: 'Floor 4',  available: 3, total: 4, status: 'available' },
      { floor: 5,  label: 'Floor 5',  available: 0, total: 4, status: 'sold'      },
      { floor: 6,  label: 'Floor 6',  available: 2, total: 4, status: 'available' },
      { floor: 7,  label: 'Floor 7',  available: 4, total: 4, status: 'available' },
      { floor: 8,  label: 'Floor 8',  available: 1, total: 4, status: 'limited'   },
      { floor: 9,  label: 'Floor 9',  available: 0, total: 4, status: 'sold'      },
      { floor: 10, label: 'Floor 10', available: 2, total: 4, status: 'available' },
      { floor: 11, label: 'Floor 11', available: 3, total: 4, status: 'available' },
      { floor: 12, label: 'Floor 12', available: 4, total: 4, status: 'available' },
    ],
    builderDocLink: 'https://www.prestigeconstructions.com/brochures/lakeside-habitat.pdf',
  },
  {
    id: '2',
    name: 'Sobha Dream Acres',
    builder: 'Sobha Developers',
    address: 'Panathur Road, Bangalore',
    lat: 12.9489,
    lng: 77.6930,
    type: 'Flat',
    status: 'Ready',
    priceFrom: 5500000,
    priceTo: 9200000,
    area: '650–1350 sqft',
    bedrooms: '1, 2, 3 BHK',
    possession: 'Ready',
    phone: '8888888888',
    email: 'info@sobha.com',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    description: 'Thoughtfully designed apartments offering premium living in a prime location with excellent metro connectivity. Sobha\'s signature construction quality ensures lasting value.',
    highlights: ['Ready to move', 'Metro nearby', 'Premium fittings', 'Vastu compliant'],
    amenities: ['Rooftop Garden', 'Co-working Space', 'EV Charging', 'Yoga Deck'],
    highAppreciation: false,
  },
  {
    id: '3',
    name: 'Embassy Edge',
    builder: 'Embassy Group',
    address: 'Hebbal, Bangalore',
    lat: 13.0456,
    lng: 77.5978,
    type: 'Commercial',
    status: 'Under Construction',
    priceFrom: 12000000,
    priceTo: 35000000,
    area: '2000–8500 sqft',
    possession: 'Dec 2025',
    phone: '7777777777',
    email: 'commercial@embassy.com',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    description: 'Grade-A commercial spaces with LEED Platinum certification in a rapidly developing micro-market. Large floor plates, highway access, and premium business infrastructure.',
    highlights: ['LEED Platinum', 'Highway access', 'Large floor plates', '100% power backup'],
    amenities: ['Food Court', 'Conference Centre', 'Banking Zone', 'Concierge'],
    highAppreciation: true,
    builderDocLink: 'https://embassyofficepark.com/edge-brochure.pdf',
  },
  {
    id: '4',
    name: 'Brigade Utopia',
    builder: 'Brigade Group',
    address: 'Varthur, Bangalore',
    lat: 12.9430,
    lng: 77.7398,
    type: 'Flat',
    status: 'New Launch',
    priceFrom: 7200000,
    priceTo: 12800000,
    area: '950–1800 sqft',
    bedrooms: '2, 3 BHK',
    possession: 'Jun 2027',
    phone: '6666666666',
    email: 'utopia@brigade.com',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    description: 'An integrated township with 40 acres of greenery, homes, retail, and green corridors designed for the next generation of urban living.',
    highlights: ['Township project', '40 acres of greenery', 'High rental yield zone', 'School within campus'],
    amenities: ['Mini Theatre', 'Indoor Sports', 'Spa', 'Jogging Track', 'Amphitheatre'],
    highAppreciation: true,
  },
  {
    id: '5',
    name: 'Adarsh Palm Retreat',
    builder: 'Adarsh Developers',
    address: 'Sarjapur Road, Bangalore',
    lat: 12.9068,
    lng: 77.6890,
    type: 'Villa',
    status: 'Resale',
    priceFrom: 18000000,
    priceTo: 32000000,
    area: '3200–5400 sqft',
    bedrooms: '4, 5 BHK',
    possession: 'Ready',
    phone: '5555555555',
    email: 'villas@adarsh.com',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    description: 'Ultra-luxury standalone villas with private gardens and premium lifestyle amenities in one of Bangalore\'s most sought-after localities.',
    highlights: ['Standalone villa', 'Private garden', 'Smart home automation', 'Corner units'],
    amenities: ['Private Pool', 'Home Theatre', 'Servant Quarter', 'Garage', 'Landscaped Garden'],
    highAppreciation: false,
  },
  {
    id: '6',
    name: 'Mahindra Windchimes',
    builder: 'Mahindra Lifespace',
    address: 'Bannerghatta Road, Bangalore',
    lat: 12.8731,
    lng: 77.5993,
    type: 'Plot',
    status: 'New Launch',
    priceFrom: 4500000,
    priceTo: 8900000,
    area: '1200–2400 sqft',
    possession: 'Mar 2025',
    phone: '4444444444',
    email: 'plots@mahindra.com',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    description: 'Gated plotted development with internal roads, underground utilities, and community facilities. Clear titles with BDA-sanctioned layout.',
    highlights: ['Gated community', 'Clear titles', 'Bank loan approved', 'BDA sanctioned layout'],
    amenities: ['Club House', 'Park', 'Avenue Plantation', 'Underground Drainage'],
    highAppreciation: true,
  },
];

export const TYPE_COLORS: Record<PropertyType, string> = {
  Flat:       '#00405c',
  Villa:      '#f15a29',
  Commercial: '#10b981',
  Plot:       '#F0B429',
};

export const TYPE_BG: Record<PropertyType, string> = {
  Flat:       '#1A4F78',
  Villa:      '#2E7D4F',
  Commercial: '#C0392B',
  Plot:       '#B7770D',
};

export const STATUS_COLORS: Record<PropertyStatus, string> = {
  'New Launch':          '#E5521A',
  'Under Construction':  '#F0B429',
  'Ready':               '#1A4F78',
  'Resale':              '#7B3FA8',
};

export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(0)} L`;
  return `₹${price.toLocaleString()}`;
}

export const NEARBY_FACILITY_TYPES = [
  { key: 'school',   label: 'School',         color: '#3B82F6', emoji: '🏫' },
  { key: 'hospital', label: 'Hospital',        color: '#EF4444', emoji: '🏥' },
  { key: 'mall',     label: 'Mall',            color: '#8B5CF6', emoji: '🛍️' },
  { key: 'metro',    label: 'Metro Station',   color: '#F59E0B', emoji: '🚇' },
  { key: 'temple',   label: 'Temple',          color: '#F97316', emoji: '🛕' },
  { key: 'church',   label: 'Church',          color: '#6B7280', emoji: '⛪' },
  { key: 'park',     label: 'Park',            color: '#22C55E', emoji: '🌳' },
] as const;

// Deterministic pseudo-random POIs based on property ID
export function getNearbyFacilities(property: Property) {
  const seed = parseInt(property.id) || 1;
  const offsets = [
    [0.008, 0.005], [-0.006, 0.009], [0.010, -0.007], [-0.009, -0.004],
    [0.004, 0.012], [-0.012, 0.003], [0.007, -0.011],
  ];
  return NEARBY_FACILITY_TYPES.map((type, i) => ({
    ...type,
    lat: property.lat + offsets[i][0] * (1 + (seed % 3) * 0.1),
    lng: property.lng + offsets[i][1] * (1 + (seed % 2) * 0.15),
    name: `Nearby ${type.label} ${seed + i}`,
    distance: `${(0.4 + i * 0.15 + (seed % 5) * 0.08).toFixed(1)} km`,
  }));
}
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];