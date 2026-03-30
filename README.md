# ELAGO — Map-Centric Real Estate Platform

## Tech Stack
- **Next.js 14** (App Router)
- **Google Maps JavaScript API** + **Google Places API**
- **Tailwind CSS**
- **Lucide React** (icons)
- **TypeScript**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features
- 🗺️ **Map-first UI** — Dark-themed interactive map with property pins
- 🎯 **Color-coded pins** — Blue (Flat), Green (Villa), Red (Commercial), Yellow (Plot)
- 🔍 **Filter Panel** — Property type, price range, status, builder, quick chips
- 📋 **Results Panel** — Live-filtered property list with sort
- 🃏 **Hover cards** — Rich property preview on pin click
- 🌗 **Dark luxury aesthetic** — Cormorant Garamond + DM Sans fonts

## Google Maps Setup
Set your API key in `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here
GOOGLE_PLACES_API_KEY=your_places_key_here
NEXT_PUBLIC_GOOGLE_MAP_ID=your_map_id_here
```

Also ensure the following APIs are enabled in Google Cloud:
- Maps JavaScript API
- Places API

Notes:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is used in the browser for rendering the map.
- `GOOGLE_PLACES_API_KEY` is used server-side by `app/api/places/nearby/route.ts` for nearby search.
- `NEXT_PUBLIC_GOOGLE_MAP_ID` is optional; if omitted, the app falls back to `DEMO_MAP_ID` for advanced markers.
