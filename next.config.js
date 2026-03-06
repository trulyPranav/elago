/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
  // Ensure Leaflet CSS is bundled correctly
  webpack: (config) => {
    return config;
  },
}
module.exports = nextConfig
