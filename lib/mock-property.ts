// Mock property data for template preview
import { Property } from './properties'

// Placeholder image styles
export type PlaceholderImageStyle = 'modern' | 'traditional' | 'luxury' | 'cottage' | 'ranch' | 'none'

// Layout options for the property page
export type LayoutStyle = 'default' | 'fullwidth' | 'gallery' | 'compact' | 'magazine'

// Placeholder image URLs using picsum.photos with consistent seeds based on style
export const PLACEHOLDER_IMAGES: Record<PlaceholderImageStyle, { main: string; gallery: string[] }> = {
  modern: {
    main: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
    ],
  },
  traditional: {
    main: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
    ],
  },
  luxury: {
    main: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
    ],
  },
  cottage: {
    main: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&h=600&fit=crop',
    ],
  },
  ranch: {
    main: 'https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
    ],
  },
  none: {
    main: '',
    gallery: [],
  },
}

// Get placeholder images for a property based on style
export function getPlaceholderImages(style: PlaceholderImageStyle): { main: string; gallery: string[] } {
  return PLACEHOLDER_IMAGES[style]
}

// Generate realistic placeholder data for missing fields
export function fillMockData(property: Property, imageStyle: PlaceholderImageStyle = 'modern'): Property {
  const placeholderImages = imageStyle !== 'none' ? PLACEHOLDER_IMAGES[imageStyle] : null

  // For images: when a style is selected (not 'none'), ALWAYS use placeholders
  // This allows previewing different image styles regardless of existing images
  const useImageUrl = imageStyle === 'none'
    ? property.imageUrl
    : (placeholderImages?.main || property.imageUrl || null)
  const useImages = imageStyle === 'none'
    ? property.images
    : (placeholderImages?.gallery || property.images || [])

  return {
    ...property,

    // Address - keep real data, fill county if missing
    county: property.county || 'Harris County',

    // Pricing - add original price if missing to show price reduction
    originalPrice: property.originalPrice || (property.status !== 'sold' ? Math.round(property.listPrice * 1.05) : null),

    // Property details
    sqft: property.sqft || 2150,
    lotSize: property.lotSize || 0.18,
    lotSizeUnit: property.lotSizeUnit || 'acres',
    yearBuilt: property.yearBuilt || 2003,
    stories: property.stories || 1,
    propertyStyle: property.propertyStyle || 'Ranch',

    // Garage
    garageSpaces: property.garageSpaces || 2,
    garageType: property.garageType || 'Attached',

    // HOA & Taxes
    hoaFee: property.hoaFee || 50.42,
    hoaFrequency: property.hoaFrequency || 'monthly',
    taxAmount: property.taxAmount || 6156,
    taxYear: property.taxYear || 2025,
    taxRate: property.taxRate || 0.023118,

    // Location
    neighborhood: property.neighborhood || 'Sample Neighborhood',
    subdivision: property.subdivision || 'Sample Subdivision Sec 02',
    schoolDistrict: property.schoolDistrict || 'Cypress-Fairbanks ISD',
    schools: Object.keys(property.schools).length > 0 ? property.schools : {
      elementary: 'Sample Elementary School',
      middle: 'Sample Middle School',
      high: 'Sample High School',
    },

    // MLS data
    mlsNumber: property.mlsNumber || '8394808',
    mlsBoard: property.mlsBoard || 'HAR',
    daysOnMarket: property.daysOnMarket || 45,
    listingAgent: property.listingAgent || 'Greg Knapp',
    listingAgentPhone: property.listingAgentPhone || '(469) 485-7313',
    listingOffice: property.listingOffice || 'Artistic Real Estate Group',

    // Content
    headline: property.headline || `Beautiful ${property.beds} Bedroom Home in ${property.city}`,
    description: property.description || `Welcome to this stunning ${property.beds} bedroom, ${property.baths} bathroom home located in the heart of ${property.city}. This well-maintained property features a bright, open layout with soaring ceilings and abundant natural light throughout.

The spacious eat-in kitchen offers modern conveniences and plenty of storage. The primary suite includes a large walk-in closet and en-suite bathroom. Additional highlights include a dedicated utility room, covered patio, and generous backyard perfect for entertaining.

Located in a sought-after neighborhood with excellent schools and easy access to shopping, dining, and major highways. Don't miss this opportunity to make this house your home!`,
    features: property.features.length > 0 ? property.features : [
      'Open Floor Plan',
      'Granite Countertops',
      'Stainless Steel Appliances',
      'Hardwood Floors',
      'Crown Molding',
      'Covered Patio',
      'Sprinkler System',
      'Energy Efficient Windows',
      'Walk-in Closets',
      'Ceiling Fans',
      'Security System',
      'Two-Car Garage',
    ],

    // Media - use placeholder images based on selected style
    // When style is 'none', keep original images; otherwise use placeholders for preview
    imageUrl: useImageUrl,
    images: useImages,

    // Virtual tour placeholder
    virtualTourUrl: property.virtualTourUrl || null,
  }
}

// Check if a property has mostly empty optional fields
export function needsPreviewData(property: Property): boolean {
  const optionalFields = [
    property.county,
    property.yearBuilt,
    property.propertyStyle,
    property.garageType,
    property.hoaFee,
    property.taxAmount,
    property.neighborhood,
    property.subdivision,
    property.schoolDistrict,
    property.mlsNumber,
    property.description,
  ]

  const filledCount = optionalFields.filter(f => f !== null && f !== undefined).length
  return filledCount < optionalFields.length / 2
}
