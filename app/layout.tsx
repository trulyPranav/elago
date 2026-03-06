import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'elaGO — Premium Real Estate Discovery',
  description: 'Map-first real estate platform for Bangalore',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="h-screen overflow-hidden bg-brand-light font-body text-brand-text">
        {children}
      </body>
    </html>
  )
}
