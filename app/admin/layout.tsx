import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-100">
      {user && (
        <nav className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/admin" className="font-bold text-lg">
                  Lead Manager
                </Link>
                <div className="flex space-x-4">
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/leads"
                    className="px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    All Leads
                  </Link>
                  <Link
                    href="/"
                    className="px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                    target="_blank"
                  >
                    View Site
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {user.email}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  )
}
