# Property URL Structure Documentation

## Target URL Format

```
https://www.artisticrealestate.com/idx/listing/{STATE}-{MLS_BOARD}/{MLS_NUMBER}/{ADDRESS_SLUG}
```

**Example:**
```
https://www.artisticrealestate.com/idx/listing/TX-HAR/60914006/10303-Mills-Run-Drive-Houston-TX-77070
```

### URL Components

| Component | Example | Description |
|-----------|---------|-------------|
| Base path | `/idx/listing/` | IDX-style listing path |
| State-MLS | `TX-HAR` | State code + MLS board identifier |
| MLS Number | `60914006` | Unique MLS listing number |
| Address Slug | `10303-Mills-Run-Drive-Houston-TX-77070` | Full address with city, state, zip |

---

## Current Implementation

### URL Format
```
/listings/{slug}
```

**Example:**
```
/listings/21110-park-wick-ln-katy
```

### Current Slug Generation
```typescript
// lib/sold-properties.ts & lib/properties.ts
function generateSlug(address: string, city: string): string {
  const combined = `${address}-${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
```

### Current Route Structure
```
app/listings/[slug]/page.tsx
```

---

## Gap Analysis

### Data We Have

| Field | Source | Example |
|-------|--------|---------|
| Address | HAR.com / Manual | `21110 Park Wick Ln` |
| City | HAR.com / Manual | `Katy` |
| State | Hardcoded | `TX` |
| Zip | HAR.com / Manual | `77450` |

### Data We Need

| Field | Description | Where to Get It |
|-------|-------------|-----------------|
| `mls_board` | MLS board identifier | HAR.com listing page, MLS feed |
| `mls_number` | Unique MLS listing ID | HAR.com listing page, MLS feed |

### MLS Board Codes (Texas)

| Code | Board | Coverage Area |
|------|-------|---------------|
| `HAR` | Houston Association of Realtors | Houston metro |
| `NTREIS` | North Texas Real Estate Info Systems | Dallas-Fort Worth |
| `SABOR` | San Antonio Board of Realtors | San Antonio |
| `ABOR` | Austin Board of Realtors | Austin |
| `CCAR` | Corpus Christi Association of Realtors | Corpus Christi |

---

## Required Changes

### 1. Database Schema Update

Add to `properties` table in `lib/db.ts`:

```sql
-- Already exists but not populated:
mls_number TEXT,

-- Need to add:
mls_board TEXT,  -- e.g., 'HAR', 'NTREIS'
```

### 2. Update Property Interface

```typescript
// lib/properties.ts
export interface Property {
  // ... existing fields ...
  mlsNumber: string | null    // Already exists
  mlsBoard: string | null     // Need to add
}
```

### 3. New Slug Generation

```typescript
function generateFullSlug(property: Property): string {
  // "10303-Mills-Run-Drive-Houston-TX-77070"
  const parts = [
    property.address,
    property.city,
    property.state,
    property.zip
  ]
  return parts
    .join('-')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

### 4. New Route Structure

Change from:
```
app/listings/[slug]/page.tsx
```

To:
```
app/idx/listing/[mlsRegion]/[mlsNumber]/[addressSlug]/page.tsx
```

Or use catch-all route:
```
app/idx/listing/[...params]/page.tsx
```

### 5. URL Builder Function

```typescript
function buildPropertyUrl(property: Property): string {
  const mlsRegion = `${property.state}-${property.mlsBoard}`
  const addressSlug = generateFullSlug(property)
  return `/idx/listing/${mlsRegion}/${property.mlsNumber}/${addressSlug}`
}

// Example output:
// /idx/listing/TX-HAR/60914006/10303-Mills-Run-Drive-Houston-TX-77070
```

---

## Data Collection Plan

### Option 1: Manual Entry
- When adding properties to database, include MLS number and board
- Suitable for small number of listings

### Option 2: HAR.com Scraping Enhancement
- Extract MLS number from HAR listing pages
- MLS number is typically visible on property detail pages
- Board code can be inferred from the source (HAR = Houston)

### Option 3: IDX Feed Integration
- Subscribe to RETS/IDX feed from MLS board
- Provides structured data including MLS numbers
- Requires MLS membership and API access

### Option 4: Hybrid Approach
1. For existing HAR properties: Re-scrape to get MLS numbers
2. For new properties: Require MLS data on entry
3. For DFW properties: May need NTREIS access

---

## Migration Path

### Phase 1: Add Fields (Current)
- [x] Database has `mls_number` field (unused)
- [ ] Add `mls_board` field to schema
- [ ] Update Property interface

### Phase 2: Collect MLS Data
- [ ] Re-scrape HAR listings for MLS numbers
- [ ] Determine MLS board for DFW properties
- [ ] Populate `mls_number` and `mls_board` for all properties

### Phase 3: Update Routes
- [ ] Create new route structure `/idx/listing/[...params]`
- [ ] Update slug generation to include full address
- [ ] Add URL builder function
- [ ] Set up redirects from old URLs to new URLs

### Phase 4: Update Links
- [ ] Update listings page to use new URL format
- [ ] Update home page featured properties
- [ ] Update any internal links

---

## Example Data Transformation

### Current Property Data
```typescript
{
  id: 'har-27',
  address: '10303 Millshaw Dr',
  city: 'Houston',
  state: 'TX',
  zip: '77070',
  mlsNumber: null,  // Missing!
  // No mlsBoard field
}
```

### Target Property Data
```typescript
{
  id: 'har-27',
  address: '10303 Millshaw Dr',
  city: 'Houston',
  state: 'TX',
  zip: '77070',
  mlsNumber: '60914006',
  mlsBoard: 'HAR',
}
```

### URL Output
```
/idx/listing/TX-HAR/60914006/10303-Millshaw-Dr-Houston-TX-77070
```

---

## Notes

- The `/idx/` prefix is industry standard for IDX (Internet Data Exchange) listings
- Including MLS number in URL helps with:
  - Uniqueness (addresses can repeat across time)
  - SEO (agents often search by MLS number)
  - Deep linking from MLS systems
- The address slug at the end is for human readability and SEO
- Consider 301 redirects from old URLs to maintain SEO juice
