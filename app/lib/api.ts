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
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
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
};
