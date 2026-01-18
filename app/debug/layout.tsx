import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debug - Mascot Animation',
  robots: 'noindex, nofollow',
}

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Minimal layout without Navigation, Footer, or Mascot
  return (
    <div className="debug-layout">
      {children}
    </div>
  )
}
