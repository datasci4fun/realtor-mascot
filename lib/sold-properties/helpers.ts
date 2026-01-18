// Helper functions for sold properties
// Greg Knapp - Artistic Real Estate Group

import { SoldProperty } from './types'
import { soldProperties } from './data'

// Calculate stats
export function getSoldStats() {
  const totalSold = soldProperties.length
  const totalVolume = soldProperties.reduce((sum, p) => sum + p.closePrice, 0)
  const avgPrice = Math.round(totalVolume / totalSold)
  const cities = Array.from(new Set(soldProperties.map(p => p.city))).sort()

  return {
    totalSold,
    totalVolume,
    avgPrice,
    cities,
  }
}

// Get featured sold properties (highest value)
export function getFeaturedSold(limit = 6): SoldProperty[] {
  return [...soldProperties]
    .sort((a, b) => b.closePrice - a.closePrice)
    .slice(0, limit)
}

// Get recent sold properties
export function getRecentSold(limit = 6): SoldProperty[] {
  return soldProperties.slice(0, limit)
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

// Check if property sold over asking price
export function isSoldOverAsking(property: SoldProperty): boolean {
  return property.closePrice > property.listPrice
}

// Get the price difference (positive = over asking, negative = under)
export function getPriceDifference(property: SoldProperty): number {
  return property.closePrice - property.listPrice
}

// Generate URL-friendly slug from address and city
export function generateSlug(address: string, city: string): string {
  const combined = `${address}-${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Find property by slug
export function findPropertyBySlug(slug: string): SoldProperty | undefined {
  return soldProperties.find(p => generateSlug(p.address, p.city) === slug)
}

// Get all slugs for static generation
export function getAllSlugs(): string[] {
  return soldProperties.map(p => generateSlug(p.address, p.city))
}

// Get total baths (full + half)
export function getTotalBaths(property: SoldProperty): string {
  if (property.halfBaths) {
    return `${property.baths}.${property.halfBaths}`
  }
  return property.baths.toString()
}
