'use client'

import { useRouter } from 'next/navigation'
import PortalSidebar from './PortalSidebar'
import type { PortalClient } from '@/types/portal'

interface PortalLayoutClientProps {
  client: PortalClient | null
  unreadMessages?: number
  children: React.ReactNode
}

export default function PortalLayoutClient({ client, unreadMessages = 0, children }: PortalLayoutClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/portal/auth', { method: 'DELETE' })
    router.push('/portal/login')
  }

  // If no client, just render children (login/verify pages handle their own layout)
  if (!client) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PortalSidebar client={client} onLogout={handleLogout} unreadMessages={unreadMessages} />

      {/* Main content */}
      <main className="flex-1 lg:pl-0">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}
