import { redirect } from 'next/navigation'
import { getPortalClient } from '@/lib/portal-auth'

export default async function PortalPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  redirect('/portal/dashboard')
}
