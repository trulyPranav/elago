import { NextRequest, NextResponse } from 'next/server';

type NearbyRequestBody = {
  lat?: number;
  lng?: number;
};

type SearchConfig = {
  facilityType: string;
  placeTypes: string[];
  radius: number;
};

const SEARCHES: SearchConfig[] = [
  { facilityType: 'school', placeTypes: ['school'], radius: 2500 },
  { facilityType: 'hospital', placeTypes: ['hospital'], radius: 2500 },
  { facilityType: 'place_of_worship', placeTypes: ['hindu_temple', 'church', 'mosque', 'synagogue'], radius: 2500 },
  { facilityType: 'supermarket', placeTypes: ['supermarket'], radius: 2500 },
  { facilityType: 'mall', placeTypes: ['shopping_mall'], radius: 3000 },
  { facilityType: 'railway_station', placeTypes: ['train_station'], radius: 3000 },
  { facilityType: 'subway_entrance', placeTypes: ['subway_station'], radius: 3000 },
  { facilityType: 'park', placeTypes: ['park'], radius: 2000 },
];

const PLACES_ENDPOINT = process.env.GOOGLE_PLACES_ENDPOINT || 'https://places.googleapis.com/v1/places:searchNearby';

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!key) {
    return NextResponse.json(
      { error: 'Missing Places API key. Set GOOGLE_PLACES_API_KEY in environment.' },
      { status: 500 },
    );
  }

  const body = (await req.json()) as NearbyRequestBody;
  const { lat, lng } = body;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 });
  }

  const diagnostics: Array<{ facilityType: string; status: number; details?: string }> = [];

  const results = await Promise.all(
    SEARCHES.map(async (search) => {
      try {
        const response = await fetch(PLACES_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location',
          },
          body: JSON.stringify({
            includedTypes: search.placeTypes,
            maxResultCount: 6,
            locationRestriction: {
              circle: {
                center: {
                  latitude: lat,
                  longitude: lng,
                },
                radius: search.radius,
              },
            },
          }),
          cache: 'no-store',
        });

        if (!response.ok) {
          let details = '';
          try {
            details = await response.text();
          } catch {
            details = '';
          }
          diagnostics.push({ facilityType: search.facilityType, status: response.status, details: details.slice(0, 400) });
          console.error(`[places/nearby] ${search.facilityType} request failed with status ${response.status} ${details ? `- ${details}` : ''}`);
          return { facilityType: search.facilityType, places: [] as Array<{ placeId: string; displayName: string; lat: number; lng: number }> };
        }

        const data = (await response.json()) as {
          places?: Array<{
            id?: string;
            displayName?: { text?: string };
            location?: { latitude?: number; longitude?: number };
          }>;
        };

        console.log(`[places/nearby] ${search.facilityType}: fetched ${(data.places || []).length} places`);

        const places = (data.places || [])
          .map((p) => ({
            placeId: p.id || '',
            displayName: p.displayName?.text || '',
            lat: p.location?.latitude,
            lng: p.location?.longitude,
          }))
          .filter((p): p is { placeId: string; displayName: string; lat: number; lng: number } => (
            typeof p.lat === 'number' && typeof p.lng === 'number'
          ));

        return { facilityType: search.facilityType, places };
      } catch (error) {
        console.error(`[places/nearby] ${search.facilityType} request threw`, error);
        diagnostics.push({ facilityType: search.facilityType, status: 0, details: error instanceof Error ? error.message : 'unknown error' });
        return { facilityType: search.facilityType, places: [] as Array<{ placeId: string; displayName: string; lat: number; lng: number }> };
      }
    }),
  );

  const has403 = diagnostics.some((d) => d.status === 403);
  if (has403) {
    console.error('[places/nearby] One or more requests were forbidden (403). Check Places key restrictions, API enablement, and billing.');
  }

  return NextResponse.json({
    results,
    meta: {
      endpoint: PLACES_ENDPOINT,
      diagnostics,
    },
  });
}
