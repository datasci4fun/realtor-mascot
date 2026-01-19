import { query, ensureInitialized } from './db'

// Default settings (fallback to env vars)
const DEFAULT_SETTINGS = {
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

export type SiteSettings = typeof DEFAULT_SETTINGS

// In-memory cache for settings
let settingsCache: SiteSettings | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60000 // 1 minute

/**
 * Get all site settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // Return cached settings if still valid
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache
  }

  try {
    await ensureInitialized()

    const result = await query(
      `SELECT key, value FROM settings WHERE key LIKE 'site_%' OR key LIKE 'realtor_%' OR key LIKE 'brokerage_%' OR key LIKE 'office_%' OR key LIKE 'service_%' OR key LIKE 'facebook_%' OR key LIKE 'instagram_%' OR key LIKE 'linkedin_%' OR key LIKE 'twitter_%' OR key LIKE 'youtube_%'`
    )

    const settings = { ...DEFAULT_SETTINGS }

    for (const row of result.rows) {
      const key = row.key.replace('site_', '').replace('settings_', '') as keyof SiteSettings
      if (key in settings) {
        settings[key] = row.value as string
      }
    }

    // Update cache
    settingsCache = settings
    cacheTimestamp = Date.now()

    return settings
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: keyof SiteSettings): Promise<string> {
  const settings = await getSiteSettings()
  return settings[key] || DEFAULT_SETTINGS[key] || ''
}

/**
 * Update site settings
 */
export async function updateSiteSettings(
  updates: Partial<SiteSettings>,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureInitialized()

    for (const [key, value] of Object.entries(updates)) {
      if (key in DEFAULT_SETTINGS) {
        await query(
          `INSERT INTO settings (key, value, updated_by, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()`,
          [key, JSON.stringify(value), updatedBy || null]
        )
      }
    }

    // Clear cache
    settingsCache = null
    cacheTimestamp = 0

    return { success: true }
  } catch (error) {
    console.error('Error updating site settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    }
  }
}

/**
 * Clear settings cache (call after updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null
  cacheTimestamp = 0
}
