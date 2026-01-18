// Layout components for property detail pages

import { LayoutStyle } from '@/lib/mock-property'

export { FullWidthLayout } from './FullWidthLayout'
export { GalleryLayout } from './GalleryLayout'
export { CompactLayout } from './CompactLayout'
export { MagazineLayout } from './MagazineLayout'
export { DefaultLayout } from './DefaultLayout'

// Layout selector helper
import { FullWidthLayout } from './FullWidthLayout'
import { GalleryLayout } from './GalleryLayout'
import { CompactLayout } from './CompactLayout'
import { MagazineLayout } from './MagazineLayout'
import { DefaultLayout } from './DefaultLayout'

export function getLayoutComponent(layout: LayoutStyle) {
  switch (layout) {
    case 'fullwidth':
      return FullWidthLayout
    case 'gallery':
      return GalleryLayout
    case 'compact':
      return CompactLayout
    case 'magazine':
      return MagazineLayout
    case 'default':
      return DefaultLayout
    default:
      return DefaultLayout
  }
}

// Common props interface
export interface LayoutProps {
  property: import('@/types/property').Property
  children?: React.ReactNode
}
