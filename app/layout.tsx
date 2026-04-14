import type { Metadata, Viewport } from 'next'
import { Nunito, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { LoadingScreen } from '@/components/loading-screen'
import './globals.css'

const nunito = Nunito({
  subsets: ["latin"],
  variable: '--font-nunito',
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Starrymoon | Handmade Beaded Jewelry',
  description: 'Handmade beaded bracelets, necklaces, phone charms & more. Cute, aesthetic jewelry for teens. Made with love in India.',
  keywords: ['handmade jewelry', 'beaded bracelets', 'teen jewelry', 'cute accessories', 'phone charms', 'starrymoon'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F472B6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" style={{ background: "#FEBEC3" }}>
        {/* Prevent hero flash: hide content until loading screen JS hydrates */}
        <style dangerouslySetInnerHTML={{ __html: `
          body > *:not(.loading-screen):not(script):not(style) {
            visibility: hidden;
          }
          .loading-screen ~ * {
            visibility: visible !important;
          }
          body.app-loaded > * {
            visibility: visible !important;
          }
        ` }} />
        <AuthProvider>
          <CartProvider>
            <LoadingScreen />
            {children}
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

