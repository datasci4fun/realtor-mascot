import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MascotProvider } from '@/components/mascot/MascotProvider'
import { Mascot } from '@/components/mascot/Mascot'
import { Navigation } from '@/components/ui/Navigation'
import { Footer } from '@/components/ui/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artistic Real Estate Group | Greg Knapp - DFW Buyer Specialist',
  description: 'The Original Buyer Broker in Texas. Greg Knapp helps buyers save time, effort, and money across the Dallas-Fort Worth metroplex.',
  keywords: ['real estate', 'DFW homes', 'buyer agent', 'Dallas Fort Worth realtor', 'Texas real estate'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MascotProvider>
          {/* Navigation */}
          <Navigation />

          {/* Page content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <Footer />

          {/* Mascot - persists across all pages */}
          <Mascot />
        </MascotProvider>
      </body>
    </html>
  )
}
