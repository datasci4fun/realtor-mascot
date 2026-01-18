'use client'

import Link from 'next/link'
import { ComponentProps } from 'react'

// Simple wrapper - just use regular Link for now
// View Transitions API was causing performance issues with the page animations
export function TransitionLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />
}
