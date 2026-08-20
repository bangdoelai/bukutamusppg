import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buku Tamu SPPG Bontang Selatan',
    short_name: 'Buku Tamu SPPG',
    description: 'Buku Tamu Digital SPPG Bontang Selatan Berbas Tengah',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3e8',
    theme_color: '#f7f3e8',
    lang: 'id',
    icons: [
      { src: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
