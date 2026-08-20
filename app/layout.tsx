import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Buku Tamu SPPG Bontang Selatan',
  description: 'Buku Tamu Digital SPPG Bontang Selatan Berbas Tengah - Yayasan Fahreza Berkah Jaya',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/icon-light-32x32.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Buku Tamu SPPG Bontang Selatan',
    description: 'Buku Tamu Digital SPPG Bontang Selatan Berbas Tengah - Yayasan Fahreza Berkah Jaya',
    siteName: 'Buku Tamu SPPG Bontang Selatan',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 630,
        height: 630,
        alt: 'Logo Yayasan Fahreza Berkah Jaya',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Buku Tamu SPPG Bontang Selatan',
    description: 'Buku Tamu Digital SPPG Bontang Selatan Berbas Tengah - Yayasan Fahreza Berkah Jaya',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f3e8',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${fontSans.variable} font-sans bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
