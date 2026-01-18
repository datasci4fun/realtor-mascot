'use client'

import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'agent'
}

interface AdminLayoutClientProps {
  user: AdminUser | null
  children: React.ReactNode
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  // If no user, just render children (login page handles its own layout)
  if (!user) {
    return <div className="min-h-screen bg-gray-100">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar user={user} onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 lg:pl-0">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}
