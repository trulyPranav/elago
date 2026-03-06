# ELAGO — Map-Centric Real Estate Platform

## Tech Stack
- **Next.js 14** (App Router)
- **React-Leaflet** (OpenStreetMap, no API key needed)
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

## To use Google Maps
Replace Leaflet in `MapView.tsx` with `@react-google-maps/api` and set your API key in `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```
