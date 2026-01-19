'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SiteSettings {
  realtor_name: string
  realtor_phone: string
  realtor_email: string
  realtor_title: string
  realtor_license: string
  realtor_photo: string
  brokerage_name: string
  office_address: string
  office_city: string
  office_state: string
  office_zip: string
  service_areas: string
  site_title: string
  site_description: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  twitter_url: string
  youtube_url: string
}

// Default settings (fallback)
const DEFAULT_SETTINGS: SiteSettings = {
  realtor_name: process.env.NEXT_PUBLIC_REALTOR_NAME || 'Greg Knapp',
  realtor_phone: process.env.NEXT_PUBLIC_REALTOR_PHONE || '(469) 485-7313',
  realtor_email: process.env.NEXT_PUBLIC_REALTOR_EMAIL || 'angela@artisticrealestate.com',
  brokerage_name: process.env.NEXT_PUBLIC_BROKERAGE || 'Artistic Real Estate Group',
  realtor_title: 'Broker & Owner',
  realtor_license: '',
  realtor_photo: '',
  office_address: '',
  office_city: '',
  office_state: 'TX',
  office_zip: '',
  service_areas: 'Dallas-Fort Worth Metroplex',
  site_title: 'Artistic Real Estate Group',
  site_description: 'Your trusted real estate partner in the DFW area',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  twitter_url: '',
  youtube_url: '',
}

interface SiteSettingsContextType {
  settings: SiteSettings
  isLoading: boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return context
}

// Helper to format phone for tel: links
export function formatPhoneForLink(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}
