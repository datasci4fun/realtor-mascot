// Combined sold properties data
// Sorted by close date, newest first

import { dfwProperties } from './dfw-properties'
import { houstonProperties } from './houston-properties'

export const soldProperties = [...houstonProperties, ...dfwProperties]
  .sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())

// Re-export individual datasets for direct access if needed
export { dfwProperties, houstonProperties }
