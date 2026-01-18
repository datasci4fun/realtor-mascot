// Mock property data for template preview
import { Property } from './properties'

// Generate realistic placeholder data for missing fields
export function fillMockData(property: Property): Property {
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
