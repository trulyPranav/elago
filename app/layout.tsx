import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'elaGO — Premium Real Estate Discovery',
  description: 'Map-first real estate platform for Bangalore',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-brand-light font-body text-brand-text">
        {children}
      </body>
    </html>
  )
}
