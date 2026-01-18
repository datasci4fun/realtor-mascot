# Web Tech Comparison

A practical comparison of tech options for building the web mascot, covering both local development and production deployment.

**Current Target**: Real estate website with mascot as lead generation assistant.

---

## Table of Contents

1. [Production Recommendation](#production-recommendation-nextjs)
2. [Requirements Analysis](#requirements-analysis)
3. [Framework Comparison](#framework-comparison)
4. [Real Estate Site Architecture](#real-estate-site-architecture)
5. [Mascot as Lead Magnet](#mascot-as-lead-magnet)
6. [Tech Stack Summary](#tech-stack-summary)
7. [Localhost Development Options](#localhost-development-options)

---

## Production Recommendation: Next.js

For a real estate site with lead generation, **Next.js** is the clear choice.

### Why Next.js

| Requirement | Why It Matters | Next.js Solution |
|-------------|----------------|------------------|
| **SEO** | Listings must rank on Google | Server-side rendering (SSR) |
| **Performance** | Lots of property images | Built-in image optimization |
| **Lead Capture** | Convert visitors to leads | API routes + form handling |
| **Professional** | Business credibility | Industry standard framework |
| **Scalability** | Growing listings | Static generation (SSG) + ISR |
| **Maintainability** | Future developers | Large talent pool |

### Setup

```bash
npx create-next-app@latest realtor-site --typescript --tailwind --app
cd realtor-site
npm install three @pixiv/three-vrm framer-motion react-hook-form
npm run dev
```

---

## Requirements Analysis

### Real Estate Site Needs

| Requirement | Priority | Notes |
|-------------|----------|-------|
| SEO for listings | Critical | Each property needs to be indexed |
| Image optimization | Critical | Property photos are heavy |
| Lead capture forms | Critical | The whole point of the mascot |
| Fast page loads | High | Bounce rate matters |
| Mobile responsive | High | Many users browse on phone |
| CRM integration | High | HubSpot, Salesforce, etc. |
| Easy content updates | Medium | Realtor adds new listings |
| Analytics | Medium | Track mascot engagement |

### Mascot Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Persists across pages | Critical | Never unmounts during navigation |
| Conversational UI | Critical | Collects lead info naturally |
| Page-aware behavior | High | Different actions per page |
| Non-intrusive | High | Helpful, not annoying |
| Mobile support | Medium | Smaller/hidden on mobile? |

---

## Framework Comparison

### For Production Real Estate Site

| Requirement | Vanilla JS | Next.js | Astro | SvelteKit |
|-------------|-----------|---------|-------|-----------|
| SEO (SSR/SSG) | Poor | Excellent | Excellent | Good |
| Image optimization | Manual | Built-in | Built-in | Plugin |
| Real estate templates | None | Many | Some | Few |
| Form handling | Manual | Easy | Easy | Easy |
| Mascot integration | Easy | Medium | Easy (islands) | Easy |
| Hiring/maintenance | Hard | Easy | Medium | Medium |
| Learning curve | Low | Medium | Low | Medium |
| Ecosystem | Small | Huge | Growing | Medium |
| Hosting options | Any | Vercel (ideal) | Any | Any |

### Verdict

| Use Case | Recommendation |
|----------|----------------|
| Production real estate site | **Next.js** |
| Content-heavy, minimal interactivity | Astro |
| Small team, want simplicity | SvelteKit |
| Prototype/localhost only | Vite + Vanilla JS |

---

## Real Estate Site Architecture

### Project Structure

```
realtor-site/
├── app/
│   ├── layout.tsx              # Root layout with persistent mascot
│   ├── page.tsx                # Homepage
│   ├── listings/
│   │   ├── page.tsx            # All listings (with filters)
│   │   └── [id]/
│   │       └── page.tsx        # Individual listing (SEO optimized)
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── api/
│       ├── leads/
│       │   └── route.ts        # Lead capture endpoint
│       └── listings/
│           └── route.ts        # Listings API
├── components/
│   ├── mascot/
│   │   ├── Mascot.tsx          # Three.js avatar wrapper
│   │   ├── MascotProvider.tsx  # Context for mascot state
│   │   ├── MascotChat.tsx      # Chat bubble / lead capture UI
│   │   ├── MascotState.ts      # Persistent state management
│   │   └── MascotBehavior.ts   # Page-specific behaviors
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── ListingFilters.tsx
│   │   ├── ListingGallery.tsx
│   │   └── ListingMap.tsx
│   ├── forms/
│   │   ├── LeadForm.tsx
│   │   ├── ContactForm.tsx
│   │   └── ScheduleViewing.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── listings.ts             # Fetch listings from CMS/API
│   ├── leads.ts                # CRM integration
│   ├── analytics.ts            # Track events
│   └── mascot-prompts.ts       # Mascot dialogue/responses
├── public/
│   ├── mascot/
│   │   └── realtor-mascot.vrm
│   └── images/
├── styles/
│   └── globals.css
└── types/
    ├── listing.ts
    └── lead.ts
```

### Persistent Mascot in Layout

```tsx
// app/layout.tsx
import { MascotProvider } from '@/components/mascot/MascotProvider'
import { Mascot } from '@/components/mascot/Mascot'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MascotProvider>
          {/* Mascot persists across all page navigations */}
          <Mascot />

          <Navigation />

          {/* Only this part changes between pages */}
          <main>{children}</main>

          <Footer />
        </MascotProvider>
      </body>
    </html>
  )
}
```

### Listing Page with SEO

```tsx
// app/listings/[id]/page.tsx
import { Metadata } from 'next'
import { getListing } from '@/lib/listings'
import { ListingGallery } from '@/components/listings/ListingGallery'
import { ListingDetails } from '@/components/listings/ListingDetails'
import { ScheduleViewing } from '@/components/forms/ScheduleViewing'

// Generate SEO metadata for each listing
export async function generateMetadata({ params }): Promise<Metadata> {
  const listing = await getListing(params.id)

  return {
    title: `${listing.address} | ${listing.price} | Realtor Name`,
    description: `${listing.beds} bed, ${listing.baths} bath home in ${listing.neighborhood}. ${listing.description.slice(0, 150)}...`,
    openGraph: {
      images: [listing.photos[0]],
    },
  }
}

// Generate static pages for all listings at build time
export async function generateStaticParams() {
  const listings = await getAllListings()
  return listings.map((listing) => ({
    id: listing.id,
  }))
}

export default async function ListingPage({ params }) {
  const listing = await getListing(params.id)

  return (
    <article className="listing-page">
      <ListingGallery photos={listing.photos} />
      <ListingDetails listing={listing} />
      <ScheduleViewing listingId={listing.id} />
    </article>
  )
}
```

---

## Mascot as Lead Magnet

### Core Concept

The mascot acts as a friendly assistant that:
1. Greets visitors naturally (not immediately)
2. Offers help based on current page
3. Collects lead info through conversation
4. Submits to CRM automatically

### Mascot Chat Component

```tsx
// components/mascot/MascotChat.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMascot } from './MascotProvider'

type ConversationState =
  | 'hidden'
  | 'greeting'
  | 'asking_intent'
  | 'collecting_info'
  | 'scheduling'
  | 'thank_you'
  | 'idle'

interface LeadData {
  name: string
  email: string
  phone: string
  intent: 'buying' | 'selling' | 'renting' | ''
  priceRange: string
  timeline: string
  listingInterest?: string
}

export function MascotChat() {
  const pathname = usePathname()
  const { mascotPosition, setMascotMood } = useMascot()

  const [state, setState] = useState<ConversationState>('hidden')
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    intent: '',
    priceRange: '',
    timeline: '',
  })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')

  // Page-specific greetings
  const greetings = {
    '/': "Hi! Looking for your dream home? I can help you find it!",
    '/listings': "See anything you like? I can schedule a viewing for you!",
    '/listings/[id]': "Beautiful property, right? Want to see it in person?",
    '/about': "Want to know more about Sarah? She's helped 200+ families!",
    '/contact': "I'll make sure Sarah gets your message right away!",
  }

  // Trigger greeting after delay
  useEffect(() => {
    if (hasInteracted) return

    const timer = setTimeout(() => {
      const greeting = getGreetingForPath(pathname)
      setCurrentMessage(greeting)
      setState('greeting')
      setMascotMood('friendly')
    }, 5000) // Wait 5 seconds before greeting

    return () => clearTimeout(timer)
  }, [pathname, hasInteracted])

  // Handle user responses
  const handleQuickReply = async (reply: string) => {
    setHasInteracted(true)

    switch (state) {
      case 'greeting':
        if (reply === 'yes_help') {
          setState('asking_intent')
          setCurrentMessage("Great! Are you looking to buy, sell, or rent?")
        } else {
          setState('idle')
          setCurrentMessage("No problem! I'm here if you need me.")
        }
        break

      case 'asking_intent':
        setLeadData(prev => ({ ...prev, intent: reply as LeadData['intent'] }))
        setState('collecting_info')
        setCurrentMessage("What's your timeline?")
        break

      // ... more conversation flow
    }
  }

  const submitLead = async () => {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...leadData,
        source: 'mascot',
        page: pathname,
        timestamp: new Date().toISOString(),
      }),
    })

    setState('thank_you')
    setCurrentMessage(`Thanks ${leadData.name}! Sarah will reach out soon.`)
    setMascotMood('happy')
  }

  if (state === 'hidden') return null

  return (
    <div className="mascot-chat">
      <div className="chat-bubble">
        <p>{currentMessage}</p>
      </div>

      {state === 'greeting' && (
        <div className="quick-replies">
          <button onClick={() => handleQuickReply('yes_help')}>
            Yes, help me!
          </button>
          <button onClick={() => handleQuickReply('just_browsing')}>
            Just browsing
          </button>
        </div>
      )}

      {state === 'asking_intent' && (
        <div className="quick-replies">
          <button onClick={() => handleQuickReply('buying')}>Buying</button>
          <button onClick={() => handleQuickReply('selling')}>Selling</button>
          <button onClick={() => handleQuickReply('renting')}>Renting</button>
        </div>
      )}

      {state === 'collecting_info' && (
        <form onSubmit={(e) => { e.preventDefault(); submitLead(); }}>
          <input
            type="email"
            placeholder="Your email"
            value={leadData.email}
            onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  )
}
```

### Page-Specific Mascot Behaviors

```ts
// lib/mascot-prompts.ts

export const pageBehaviors = {
  home: {
    position: { x: 85, y: 70 },
    greeting: "Welcome! Looking for a new home in [City]?",
    greetingDelay: 3000,
    idleMessages: [
      "I know this area really well!",
      "Sarah has helped 200+ families find their home.",
      "Want me to show you some listings?",
    ],
    actions: [
      { label: "I'm buying", value: 'buying', next: 'buyer_flow' },
      { label: "I'm selling", value: 'selling', next: 'seller_flow' },
      { label: "Just looking", value: 'browsing', next: 'passive' },
    ],
  },

  listings: {
    position: { x: 90, y: 50 },
    greeting: "Found some great options! Need help narrowing it down?",
    greetingDelay: 8000, // Wait longer, let them browse
    onFilter: "Good choice! Let me update the results.",
    onScroll: (viewedCount: number) => {
      if (viewedCount >= 5) {
        return "You've seen a few! Want me to save your favorites?"
      }
      return null
    },
    idlePrompt: {
      delay: 30000, // After 30 seconds
      message: "Need help? I know which neighborhoods have the best schools!",
    },
  },

  listingDetail: {
    position: { x: 85, y: 40 },
    greeting: "This one's a gem! 3 people viewed it today.",
    greetingDelay: 2000, // They're interested, engage quickly
    photoGalleryTrigger: "Gorgeous kitchen, right?",
    ctaPrompt: {
      delay: 15000,
      message: "Want to schedule a viewing? I can set it up in 30 seconds!",
    },
    exitIntent: {
      message: "Before you go - want me to email you similar listings?",
      showEmailCapture: true,
    },
  },

  contact: {
    position: { x: 20, y: 60 },
    greeting: "Sarah usually responds within an hour!",
    onFormFocus: "I'll make sure she sees this right away.",
    onFormSubmit: "Got it! Sarah will be in touch very soon.",
  },

  about: {
    position: { x: 15, y: 70 },
    greeting: "Sarah's been in real estate for 15 years!",
    passive: true, // Don't push lead capture on about page
  },
}
```

### Lead Capture Conversation Flow

```ts
// lib/lead-flows.ts

export const buyerFlow = [
  {
    id: 'intent_confirm',
    message: "Awesome! Buying a home is exciting!",
    next: 'timeline',
  },
  {
    id: 'timeline',
    message: "What's your timeline?",
    options: [
      { label: 'ASAP', value: 'asap' },
      { label: '1-3 months', value: '1-3m' },
      { label: '3-6 months', value: '3-6m' },
      { label: 'Just exploring', value: 'exploring' },
    ],
    field: 'timeline',
    next: 'budget',
  },
  {
    id: 'budget',
    message: "What's your budget range?",
    options: [
      { label: 'Under $300k', value: '<300k' },
      { label: '$300k - $500k', value: '300-500k' },
      { label: '$500k - $750k', value: '500-750k' },
      { label: '$750k+', value: '750k+' },
    ],
    field: 'priceRange',
    next: 'email',
  },
  {
    id: 'email',
    message: "I'll send you matching listings! What's your email?",
    input: 'email',
    field: 'email',
    next: 'name',
  },
  {
    id: 'name',
    message: "And what should I call you?",
    input: 'text',
    field: 'name',
    next: 'complete',
  },
  {
    id: 'complete',
    message: "Perfect, {name}! I'll send listings to {email}. Sarah may reach out to learn more about what you're looking for!",
    action: 'submit_lead',
  },
]

export const sellerFlow = [
  {
    id: 'intent_confirm',
    message: "Great! Sarah has sold 150+ homes in this area.",
    next: 'timeline',
  },
  {
    id: 'timeline',
    message: "When are you thinking of listing?",
    options: [
      { label: 'ASAP', value: 'asap' },
      { label: '1-3 months', value: '1-3m' },
      { label: '3-6 months', value: '3-6m' },
      { label: 'Just curious about value', value: 'valuation' },
    ],
    field: 'timeline',
    next: 'email',
  },
  {
    id: 'email',
    message: "I can have Sarah send you a free home valuation! What's your email?",
    input: 'email',
    field: 'email',
    next: 'address',
  },
  {
    id: 'address',
    message: "What's the property address?",
    input: 'text',
    field: 'propertyAddress',
    next: 'name',
  },
  {
    id: 'name',
    message: "And your name?",
    input: 'text',
    field: 'name',
    next: 'complete',
  },
  {
    id: 'complete',
    message: "Thanks {name}! Sarah will send the valuation to {email} within 24 hours.",
    action: 'submit_lead',
  },
]
```

### CRM Integration

```ts
// app/api/leads/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const lead = await request.json()

  // Validate required fields
  if (!lead.email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Send to HubSpot
  try {
    await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: lead.email,
          firstname: lead.name || '',
          phone: lead.phone || '',
          buying_timeline: lead.timeline || '',
          budget_range: lead.priceRange || '',
          lead_source: 'website_mascot',
          lead_source_page: lead.page || '',
          hs_lead_status: 'NEW',
        },
      }),
    })
  } catch (error) {
    console.error('HubSpot error:', error)
  }

  // Send email notification to Realtor
  await fetch(process.env.EMAIL_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: process.env.REALTOR_EMAIL,
      subject: `New Lead: ${lead.name || 'Unknown'} - ${lead.intent || 'Inquiry'}`,
      html: `
        <h2>New Lead from Website Mascot</h2>
        <p><strong>Name:</strong> ${lead.name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'Not provided'}</p>
        <p><strong>Intent:</strong> ${lead.intent || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${lead.timeline || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${lead.priceRange || 'Not specified'}</p>
        <p><strong>Page:</strong> ${lead.page}</p>
        <p><strong>Time:</strong> ${lead.timestamp}</p>
      `,
    }),
  })

  // Track in analytics
  // await trackEvent('lead_captured', { source: 'mascot', intent: lead.intent })

  return NextResponse.json({ success: true })
}
```

---

## Tech Stack Summary

### Production Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 14 (App Router) | SEO, image optimization, industry standard |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Fast development, consistent design |
| **3D/Mascot** | Three.js + three-vrm | VRM avatar support |
| **Animation** | Framer Motion | Page transitions, mascot animations |
| **Forms** | React Hook Form + Zod | Validation, easy handling |
| **CRM** | HubSpot or Salesforce | Lead management |
| **CMS** | Sanity or Contentful | Listings management |
| **Hosting** | Vercel | Perfect for Next.js, great CDN |
| **Analytics** | Plausible or PostHog | Track mascot engagement |
| **Email** | Resend or SendGrid | Lead notifications |

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "three": "^0.160.0",
    "@pixiv/three-vrm": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@tailwindcss/forms": "^0.5.0",
    "zustand": "^4.0.0"
  }
}
```

### Quick Start

```bash
# Create project
npx create-next-app@latest realtor-site --typescript --tailwind --app

# Install dependencies
cd realtor-site
npm install three @pixiv/three-vrm framer-motion react-hook-form zod zustand

# Start development
npm run dev
```

---

## Localhost Development Options

*For prototyping before production, these simpler options work well.*

### Quick Comparison (Localhost Only)

| Approach | Setup Time | Learning Curve | Iteration Speed |
|----------|-----------|----------------|-----------------|
| Vanilla JS (no build) | 2 min | Low | Manual refresh |
| Vanilla JS + Vite | 5 min | Low | Hot reload |
| Svelte + Vite | 5 min | Medium | Hot reload |

### Simplest Option: No Build

For quick prototyping, just open an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      "@pixiv/three-vrm": "https://unpkg.com/@pixiv/three-vrm@2.0.6/lib/three-vrm.module.js"
    }
  }
  </script>
</head>
<body>
  <script type="module">
    import * as THREE from 'three'
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
    import { VRMLoaderPlugin } from '@pixiv/three-vrm'

    // Quick prototype code here
  </script>
</body>
</html>
```

### Vite for Better DX

```bash
npm create vite@latest prototype -- --template vanilla
cd prototype
npm install three @pixiv/three-vrm
npm run dev
```

---

## Useful Libraries

| Library | Purpose | Install |
|---------|---------|---------|
| three | 3D rendering | `npm i three` |
| @pixiv/three-vrm | VRM avatar loading | `npm i @pixiv/three-vrm` |
| framer-motion | Animations & transitions | `npm i framer-motion` |
| zustand | Simple state management | `npm i zustand` |
| react-hook-form | Form handling | `npm i react-hook-form` |
| zod | Schema validation | `npm i zod` |
| lil-gui | Debug UI (dev only) | `npm i lil-gui` |

---

## External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [three-vrm](https://github.com/pixiv/three-vrm) - VRM loader for Three.js
- [Three.js](https://threejs.org/) - 3D library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [HubSpot API](https://developers.hubspot.com/) - CRM integration
- [Vercel](https://vercel.com/) - Hosting platform
