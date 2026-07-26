import type {
  Property,
  PriceChartRow,
  FloorAvailability,
} from '../components/data';

// ─── Re-export for consumers that only import from lib/api ───────────────────
export type { Property, PriceChartRow, FloorAvailability };

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── API envelope ────────────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  pagination?: Pagination;
  message?: string;
}

// ─── Analytics shape ─────────────────────────────────────────────────────────
export interface AnalyticsKpis {
  total: number;
  highAppreciation: number;
  ready: number;
  newLaunch: number;
  avgPrice: number;
  avgPricePerSqft: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKpis;
  byType: { type: string; count: number }[];
  byStatus: { status: string; count: number }[];
  topBuilders: { builder: string; count: number }[];
  priceRange: { minPrice: number; maxPrice: number };
}

// ─── Paginated result wrapper ─────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

// ─── Query params for GET /api/properties ────────────────────────────────────
export interface PropertyQuery {
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  types?: string[];
  statuses?: string[];
  priceMin?: number;
  priceMax?: number;
  builder?: string[];
  highAppreciation?: boolean;
  possessionYear?: number;
  city?: string;
  q?: string;
}

// ─── Core fetch helper ────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('elago_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...((init?.headers as Record<string, string>) || {}),
    },
  });

  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(res.status, `API error ${res.status}`);
  }

  if (!res.ok || !body.success) {
    throw new ApiError(
      body.statusCode ?? res.status,
      body.message ?? `API error ${res.status}`,
      body,
    );
  }

  return body;
}

// ─── Query-string builder ─────────────────────────────────────────────────────
function buildParams(query: PropertyQuery): string {
  const p = new URLSearchParams();
  if (query.page != null)            p.set('page',            String(query.page));
  if (query.limit != null)           p.set('limit',           String(query.limit));
  if (query.sortBy)                  p.set('sortBy',          query.sortBy);
  if (query.types?.length)           p.set('types',           query.types.join(','));
  if (query.statuses?.length)        p.set('statuses',        query.statuses.join(','));
  if (query.priceMin != null)        p.set('priceMin',        String(query.priceMin));
  if (query.priceMax != null)        p.set('priceMax',        String(query.priceMax));
  if (query.builder?.length)         p.set('builder',         query.builder.join(','));
  if (query.highAppreciation)        p.set('highAppreciation', 'true');
  if (query.possessionYear != null)  p.set('possessionYear',  String(query.possessionYear));
  if (query.city)                    p.set('city',            query.city);
  if (query.q)                       p.set('q',               query.q);
  const str = p.toString();
  return str ? `?${str}` : '';
}

// ─── Public API ───────────────────────────────────────────────────────────────
/** Shape for create / update requests */
export interface PropertyPayload {
  name: string;
  builder: string;
  address: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  type: import('../components/data').PropertyType;
  status: import('../components/data').PropertyStatus;
  priceFrom: number;
  priceTo: number;
  pricePerSqft?: number;
  areaSqft: number;
  bedrooms: number[];
  possession: string;
  phone: string;
  email: string;
  image: string;
  description: string;
  highlights: string[];
  amenities: string[];
  highAppreciation: boolean;
  builderDocLink?: string;
  priceChartUrl?: string;
  rental?: { expectedRent?: number; vacancyRate?: number };
}

export interface BulkUploadSkippedDuplicate {
  rowNumber: number;
  name: string;
  builder: string;
  reason: string;
}

export interface BulkUploadImportedProperty {
  id: string;
  name: string;
}

export interface BulkUploadResult {
  message: string;
  imported: number;
  skipped: number;
  skippedDuplicates?: BulkUploadSkippedDuplicate[];
  properties?: BulkUploadImportedProperty[];
}

export type NearbyAmenityInput =
  | string
  | { type?: string; types?: string[]; displayName?: string };

export interface PropertyChartRequest {
  currentPropertyValue: number;
  currentRentValue: number;
  nearbyAmenities: NearbyAmenityInput[];
  startYear: number;
  yearsToProject: number;
  intervalYears: number;
}

export interface PropertyChartPoint {
  x: number;
  propertyValueINR: number;
  rentValueINR: number;
  totalINR: number;
}

export interface PropertyChartMeta {
  chartStartYear: number;
  rentStartYear: number;
  propertyIndex: number;
  rentIndex: number;
}

export interface PropertyChartResult {
  propertyName: string;
  locationCoordinates?: { lat: number; lng: number };
  chartMeta: PropertyChartMeta;
  coordinates: PropertyChartPoint[];
  aiEvaluation?: {
    factors?: unknown;
    [key: string]: unknown;
  };
}

// ─── API body transformer ────────────────────────────────────────────────────
function toApiBody(p: PropertyPayload) {
  return {
    name:              p.name,
    builder:           p.builder,
    propertyType:      p.type,
    status:            p.status,
    high_appreciation: p.highAppreciation,
    location: {
      address:     p.address,
      area:        p.locality,
      city:        p.city,
      coordinates: { lat: p.lat, lng: p.lng },
    },
    details: {
      area_sqft:       p.areaSqft,
      description:     p.description,
      possession_date: p.possession,
      bedrooms:        p.bedrooms,
      amenities:       p.amenities,
    },
    pricing: {
      price_from:     p.priceFrom,
      price_to:       p.priceTo,
      price_per_sqft: p.pricePerSqft,
    },
    contact: { phone: p.phone, email: p.email },
    media: {
      images:       p.image ? [p.image] : [],
      brochure_url: p.priceChartUrl ?? '',
    },
    highlights:       p.highlights,
    builder_doc_link: p.builderDocLink,
    rental:           p.rental,
  };
}

export const api = {
  /** Paginated, filtered property list */
  getProperties: async (
    query: PropertyQuery = {},
  ): Promise<PaginatedResult<Property>> => {
    const res = await apiFetch<Property[]>(
      `/api/properties${buildParams(query)}`,
    );
    return {
      data: res.data,
      pagination: res.pagination ?? {
        page: 1, limit: 20, total: res.data.length,
        totalPages: 1, hasNextPage: false, hasPrevPage: false,
      },
    };
  },

  /** Single property (full detail with floorAvailability, priceChart) */
  getProperty: (id: string): Promise<ApiResponse<Property>> =>
    apiFetch<Property>(`/api/properties/${id}`),

  /** Sorted list of distinct builder names */
  getBuilders: async (): Promise<string[]> => {
    const res = await apiFetch<string[]>('/api/properties/builders');
    return res.data;
  },

  /** Analytics dashboard aggregates */
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await apiFetch<AnalyticsData>('/api/analytics');
    return res.data;
  },

  /** Create a new property */
  createProperty: async (payload: PropertyPayload): Promise<Property> => {
    const res = await apiFetch<Property>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(toApiBody(payload)),
    });
    return res.data;
  },

  /** Update an existing property */
  updateProperty: async (id: string, payload: PropertyPayload): Promise<Property> => {
    const res = await apiFetch<Property>(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiBody(payload)),
    });
    return res.data;
  },

  /** Delete a property */
  deleteProperty: async (id: string): Promise<void> => {
    await apiFetch<null>(`/api/properties/${id}`, { method: 'DELETE' });
  },

  /** Bulk upload properties via CSV */
  bulkUploadProperties: async (file: File): Promise<BulkUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch<BulkUploadResult>('/api/properties/bulk-upload', {
      method: 'POST',
      body: formData,
    });
    return {
      ...res.data,
      skippedDuplicates: res.data.skippedDuplicates ?? [],
      properties: res.data.properties ?? [],
    };
  },

  /** Upload property image */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiFetch<{ url: string }>('/api/properties/upload-image', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  /** AI-driven property/rent projection chart */
  getPropertyChart: async (
    id: string,
    payload: PropertyChartRequest,
    signal?: AbortSignal,
  ): Promise<PropertyChartResult> => {
    const res = await apiFetch<PropertyChartResult>(`/api/properties/${id}/chart`, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    });
    return res.data;
  },

  /** Login with credentials */
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const res = await apiFetch<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (typeof window !== 'undefined' && res.data) {
      localStorage.setItem('elago_token', res.data.token);
      localStorage.setItem('elago_user', JSON.stringify(res.data.user));
    }
    
    return res.data;
  },

  /** Get current user details from active session */
  getMe: async (): Promise<{ user: any }> => {
    const res = await apiFetch<{ user: any }>('/api/auth/me');
    return res.data;
  },
};
