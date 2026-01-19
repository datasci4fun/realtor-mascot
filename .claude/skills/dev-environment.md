# Dev Environment Skill

Manage the development server, Docker containers, and database for the realtor site.

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Dev Server | 3000 | http://localhost:3000 |
| Production App (Docker) | 3847 | http://localhost:3847 |
| PostgreSQL | 5489 | localhost:5489 |

**Database Credentials (default):**
- User: `realtor`
- Password: `realtor_secret_123`
- Database: `realtor_leads`

## Commands

### Dev Server

**Start dev server:**
```bash
npm run dev
```

**Start in background (for Claude):**
```bash
cd /c/Users/blixa/Documents/Code/My-Mate-Engine/realtor-site && npm run dev &
```

**Stop dev server (Windows):**
```bash
taskkill //F //IM node.exe
```

**Restart with fresh cache:**
```bash
taskkill //F //IM node.exe 2>&1 || true
rm -rf .next
npm run dev
```

**Check if dev server is running:**
```bash
netstat -an | grep ":3000.*LISTENING"
```

### Docker

**Start database only (most common for development):**
```bash
docker-compose up -d db
```

**Start full stack (database + production app):**
```bash
docker-compose up -d
```

**Rebuild and start app container:**
```bash
docker-compose up -d --build app
```

**Stop all containers:**
```bash
docker-compose down
```

**Stop and remove volumes (reset database):**
```bash
docker-compose down -v
```

**View logs:**
```bash
docker-compose logs -f        # All services
docker-compose logs -f db     # Database only
docker-compose logs -f app    # App only
```

**Check container status:**
```bash
docker-compose ps
```

### Database

**Connect to database (via psql in container):**
```bash
docker exec -it realtor_db psql -U realtor -d realtor_leads
```

**Run seed script:**
```bash
npm run seed
```

**Seed test lead for portal:**
```bash
node scripts/seed-test-lead.js
```

### Build & Type Check

**TypeScript check:**
```bash
npx tsc --noEmit
```

**Production build:**
```bash
npm run build
```

**Lint:**
```bash
npm run lint
```

## Common Issues

### Port 3000 already in use
```bash
# Find what's using the port
netstat -ano | grep :3000

# Kill node processes
taskkill //F //IM node.exe
```

### 404 errors after code changes
The `.next` cache is corrupted. Clear and restart:
```bash
taskkill //F //IM node.exe 2>&1 || true
rm -rf .next
npm run dev
```

### Database connection failed
1. Check if Docker is running
2. Start the database container:
```bash
docker-compose up -d db
```
3. Wait for health check to pass:
```bash
docker-compose ps  # Should show "healthy"
```

### Build fails with EPERM error
A dev server is holding file locks. Kill it first:
```bash
taskkill //F //IM node.exe
rm -rf .next
npm run build
```

### Container won't start
Check for port conflicts or view logs:
```bash
docker-compose logs app
docker-compose logs db
```

## Environment Variables

Create `.env.local` from example:
```bash
cp .env.example .env.local
```

**Required for development:**
```env
DATABASE_URL=postgresql://realtor:realtor_secret_123@localhost:5489/realtor_leads
```

**Optional:**
```env
PORTAL_DEBUG_LOGIN=true                    # Skip email verification
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_REALTOR_NAME=Greg Knapp
NEXT_PUBLIC_REALTOR_PHONE=(469) 485-7313
NEXT_PUBLIC_REALTOR_EMAIL=angela@artisticrealestate.com
NEXT_PUBLIC_BROKERAGE=Artistic Real Estate Group
```

## Typical Development Workflow

1. **Start database:**
   ```bash
   docker-compose up -d db
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Open browser:** http://localhost:3000

4. **When done, stop everything:**
   ```bash
   taskkill //F //IM node.exe
   docker-compose down
   ```

## Production Deployment (Docker)

1. **Build and start:**
   ```bash
   docker-compose up -d --build
   ```

2. **Access at:** http://localhost:3847

3. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

## Portal Testing

**Access portal:** http://localhost:3000/portal/login

**With debug mode enabled** (`PORTAL_DEBUG_LOGIN=true`):
- Enter any email that exists in the leads table
- Click the debug login link that appears

**Create test lead:**
```bash
node scripts/seed-test-lead.js
```
