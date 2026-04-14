import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RealtimePricesProvider } from '@/contexts/realtime-prices-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://predictiontrade.online'),
  title: {
    default: 'Prediction Trade - Free Polymarket Simulator & Paper Trading Platform',
    template: '%s | Prediction Trade',
  },
  description: 'Practice prediction market trading risk-free with our Polymarket simulator. Paper trade with $10,000 virtual funds using live market data. Learn trading strategies before investing real money.',
  keywords: [
    'Polymarket simulator',
    'paper trading prediction markets',
    'prediction market practice',
    'virtual trading platform',
    'Polymarket practice',
    'prediction market simulator',
    'learn prediction markets',
    'risk-free trading',
    'crypto prediction markets',
    'event contracts trading',
    'simulador Polymarket',
    'mercados de predicción',
  ],
  authors: [{ name: 'Prediction Trade' }],
  creator: 'Prediction Trade',
  publisher: 'Prediction Trade',
  generator: 'Next.js',
  applicationName: 'Prediction Trade',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://predictiontrade.online',
    siteName: 'Prediction Trade',
    title: 'Prediction Trade - Free Polymarket Simulator & Paper Trading',
    description: 'Practice prediction market trading risk-free. Paper trade with $10,000 virtual funds using live Polymarket data.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Prediction Trade - Polymarket Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prediction Trade - Free Polymarket Simulator',
    description: 'Practice prediction market trading risk-free with live Polymarket data.',
    images: ['/images/logo.png'],
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
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <RealtimePricesProvider>
          {children}
        </RealtimePricesProvider>
        <Analytics />
      </body>
    </html>
  )
}
