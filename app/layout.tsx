import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MascotProvider } from '@/components/mascot/MascotProvider'
import { Mascot } from '@/components/mascot/Mascot'
import { Navigation } from '@/components/ui/Navigation'
import { Footer } from '@/components/ui/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sarah Johnson Realty | Find Your Dream Home',
  description: 'Expert real estate services in the Greater Metro Area. Helping families find their perfect home for over 15 years.',
  keywords: ['real estate', 'homes for sale', 'realtor', 'property listings'],
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

          {/* Page content - this changes between routes */}
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
