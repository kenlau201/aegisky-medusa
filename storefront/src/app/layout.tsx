import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic', 'latin-ext'] })

export const metadata: Metadata = {
  title: {
    default: 'Aegisky - Global B2B Drone & UAV Supply Chain Platform',
    template: '%s | Aegisky',
  },
  description: 'Aegisky is the international B2B marketplace for drones, FPV systems, industrial UAVs and components. 6,300+ products, 430+ brands, 100+ countries, multi-currency, global shipping, compliance verified.',
  keywords: ['drone', 'UAV', 'FPV', 'quadcopter', 'brushless motor', 'flight controller', 'LiPo battery', 'drone components', 'B2B drone marketplace', 'industrial drone', 'drone supply chain'],
  authors: [{ name: 'Aegisky' }],
  creator: 'Aegisky',
  publisher: 'Aegisky',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aegisky.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'zh': '/zh',
      'ru': '/ru',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aegisky.com',
    siteName: 'Aegisky',
    title: 'Aegisky - Global B2B Drone & UAV Supply Chain Platform',
    description: '6,300+ drone products from 430+ brands. FPV, industrial UAVs, components. Multi-currency, global shipping, compliance verified.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aegisky - B2B Drone Supply Chain Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aegisky - Global B2B Drone Platform',
    description: '6,300+ drone products, 430+ brands, worldwide shipping.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
