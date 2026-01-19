# CLAUDE.md - Realtor Site Project Guide

## Project Overview

**Realtor-Site** is a Next.js 14 real estate website for **Greg Knapp** of **Artistic Real Estate Group** featuring a VRM-based animated mascot that serves as a conversational lead generation assistant.

- **Agent**: Greg Knapp (Broker & Owner)
- **Brokerage**: Artistic Real Estate Group
- **Phone**: (469) 485-7313
- **Email**: angela@artisticrealestate.com
- **Service Area**: Dallas-Fort Worth Metroplex, Texas

### Tech Stack
- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4.1
- **3D/Mascot**: Three.js 0.164.0 + three-vrm 2.1.0
- **Database**: PostgreSQL
- **State**: Zustand 4.5.0
- **Forms**: React Hook Form + Zod

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (copy and edit)
cp .env.example .env.local

# Start PostgreSQL (via Docker)
docker-compose up -d db

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
realtor-site/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (MascotProvider lives here)
│   ├── page.tsx                 # Home page with sold properties showcase
│   ├── about/                   # About Greg page
│   ├── contact/                 # Contact form
│   ├── listings/                # Sold properties page
│   ├── admin/                   # Admin dashboard
│   │   ├── login/               # Authentication
│   │   ├── setup/               # Initial setup
│   │   └── leads/               # Lead management
│   ├── api/                     # API routes
│   │   ├── leads/               # Lead CRUD
│   │   └── admin/               # Auth endpoints
│   └── debug/
│       └── mascot/              # Animation testing tool
├── components/
│   ├── mascot/                  # VRM mascot system
│   │   ├── Mascot.tsx           # Walking behavior, position
│   │   ├── VRMAvatar.tsx        # Three.js rendering, animations
│   │   ├── MascotChat.tsx       # Chat UI, lead capture flow
│   │   └── MascotProvider.tsx   # State context
│   ├── ui/                      # Navigation, Footer
│   └── admin/                   # Admin components
├── lib/
│   ├── db.ts                    # PostgreSQL pool, schema
│   ├── auth.ts                  # Session management
│   ├── leads.ts                 # Lead CRUD operations
│   ├── sold-properties.ts       # Sold properties data and helpers
│   └── listings.ts              # Listing data (deprecated)
├── types/                       # TypeScript interfaces
├── public/mascot/               # VRM model files
└── MASCOT_DEV_NOTES.md          # Animation development guide
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/sold-properties.ts` | Greg's transaction history data and stats |
| `components/mascot/VRMAvatar.tsx` | Three.js scene, bone animations, expressions |
| `components/mascot/Mascot.tsx` | Walking state machine, position management |
| `components/mascot/MascotChat.tsx` | Conversation flow, lead capture |
| `lib/db.ts` | Database connection, schema initialization |
| `lib/leads.ts` | Lead CRUD, notes, conversation history |
| `app/debug/mascot/page.tsx` | Animation testing and bone editor |

## Sold Properties Data

The site displays Greg's actual transaction history from `lib/sold-properties.ts`:

```typescript
import { soldProperties, getSoldStats, formatPrice } from '@/lib/sold-properties'

const stats = getSoldStats()
// { totalSold: 16, totalVolume: $X, avgPrice: $Y, cities: [...] }

const featured = getFeaturedSold(6) // Top 6 by price
```

### Cities Served
Allen, Burleson, Carrollton, Dallas, Duncanville, Fort Worth, Garland,
Greenville, Little Elm, Plano, The Colony, Waxahachie, White Settlement

## Mascot System

### Architecture

The mascot persists across all pages via the root layout:

```
MascotProvider (context)
  └─ Root Layout
      └─ Mascot (fixed position, bottom-right)
          ├─ MascotChat (speech bubble)
          └─ VRMAvatar (Three.js canvas)
```

### Animation States

| State | Description | Expression |
|-------|-------------|------------|
| `idle` | Subtle breathing, head sway | Neutral |
| `friendly` | Increased movement | Happy (0.6) |
| `excited` | Fast bobbing | Happy (0.9) + Surprised |
| `thinking` | Head tilt | Minimal |
| `happy` | Fluid movement | Happy (0.6) |
| `waving` | Right arm raised, waving | Happy (0.7) |
| `walking` | Leg swing, arm counter-swing | Neutral (0.4) |

### Bone Rotation Reference

- **X axis**: Forward/backward tilt
- **Y axis**: Twist/rotation
- **Z axis**: Side-to-side lean
- **Natural arms**: Z = ±1.1 (down at sides, NOT T-pose)

### Chat Flow

1. Greeting (page-specific, auto-opens after delay)
2. Intent: Buying / Selling / Renting
3. Timeline: ASAP / 1-3 months / 3-6 months / Just browsing
4. Budget (buying/renting only)
5. Email collection
6. Name collection
7. Thank you

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/leads` | Create new lead |
| GET | `/api/leads` | List leads (auth required) |
| GET | `/api/leads/[id]` | Get single lead |
| PATCH | `/api/leads/[id]` | Update lead |
| DELETE | `/api/leads/[id]` | Delete lead |
| POST | `/api/leads/[id]/notes` | Add activity note |
| POST | `/api/admin/auth` | Login |
| GET | `/api/admin/setup` | Check setup status |

## Database Schema

Main tables:
- `leads` - Contact info, qualification data, source
- `lead_notes` - Activity log (calls, meetings)
- `lead_conversations` - Chat history
- `admin_users` - Admin accounts
- `sessions` - Active sessions

Lead sources: `mascot_chat`, `contact_form`, `listing_inquiry`, `home_valuation`, `newsletter`

Lead statuses: `new`, `contacted`, `qualified`, `showing`, `offer`, `closed`, `lost`

## Debug Tools

Access at `/debug/mascot`:
- **Animation Testing**: Test preset mood animations
- **Bone Editor**: Manual bone rotation control

## Common Patterns

### Reading Mascot State
```tsx
import { useMascot } from '@/components/mascot/MascotProvider';

const { mood, setMood, isChatOpen, setChatOpen } = useMascot();
```

### Adding New Animation State
1. Add state to `VRMAvatar.tsx` switch statement
2. Define bone rotations and expressions
3. Update `MascotProvider.tsx` types if needed

### Creating Leads
```tsx
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'visitor@example.com',
    name: 'Visitor Name',
    intent: 'buying',
    timeline: '1-3 months',
    budget: '$300k-400k',
    source: 'mascot_chat'
  })
});
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5489/realtor_leads
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_REALTOR_NAME=Greg Knapp
NEXT_PUBLIC_REALTOR_PHONE=(469) 485-7313
NEXT_PUBLIC_REALTOR_EMAIL=angela@artisticrealestate.com
NEXT_PUBLIC_BROKERAGE=Artistic Real Estate Group
```

## Important Constraints

1. **React hooks before returns** - Declare all hooks before any early return statements
2. **No dynamic require()** - Don't use `require()` in component render functions
3. **Animation loop** - Must call both `requestAnimationFrame` and `renderer.render()`
4. **Canvas size** - 320x350px, camera at (0, 0.9, 2.5)
5. **Walk direction** - 1 = left, -1 = right, 0 = face camera

## Additional Documentation

- [MASCOT_DEV_NOTES.md](./MASCOT_DEV_NOTES.md) - Detailed animation development guide

## Claude Skills

Skills are detailed guides for specific tasks. Located in `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| [dev-environment.md](./.claude/skills/dev-environment.md) | Dev server, Docker, database management, ports, troubleshooting |
| [mascot-animation.md](./.claude/skills/mascot-animation.md) | VRM bone rotations, animation creation, debug tools |

## Dependencies

Key packages:
- `three` + `@pixiv/three-vrm` - VRM avatar rendering
- `framer-motion` - UI animations
- `react-hook-form` + `zod` - Form handling
- `pg` - PostgreSQL client
- `bcryptjs` - Password hashing
- `zustand` - State management
