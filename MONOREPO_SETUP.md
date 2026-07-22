# Monorepo Setup Guide

This document explains the structure and how to work with the unified Summer Leagues monorepo.

## Structure Overview

```
summerleagues/
├── apps/
│   ├── musou/              # Musou League (4p Riichi) - Neon + Redis
│   ├── sanma/              # 3ma League (3p Riichi) - Supabase
│   └── hk16/               # HK16 League (TWMJ) - Custom
├── packages/
│   └── shared/             # Shared types, utils, components
└── docs/
    └── LINEUP_HUB.md       # Unified lineup submission documentation
```

## Key Points

### Each App is Independent
- Each app in `/apps/` is a complete Next.js application
- Each has its own database, environment variables, and deployment
- Apps can be deployed separately without affecting others

### Shared Package
- Located in `packages/shared/`
- Contains common types, utilities, and helper functions
- All apps import from `@summerleagues/shared`

### Database Strategies
- **Musou**: Uses Neon PostgreSQL + Upstash Redis
- **3ma**: Uses Supabase
- **HK16**: Uses custom configuration

Each maintains its own database connection strings in `.env.local`

## Development Workflow

### Local Setup
```bash
# Install all dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Run a specific app
cd apps/musou && pnpm dev
```

### Adding Shared Code
When you want to share functionality across leagues:

1. Add the code to `packages/shared/src/{types,utils,components}/`
2. Export it from `packages/shared/src/index.ts`
3. Import in any app: `import { MyUtil } from '@summerleagues/shared'`

### Environment Variables
Each app maintains its own `.env.local`:

```bash
# apps/musou/.env.local
DATABASE_URL=postgresql://...
REDIS_URL=https://...

# apps/sanma/.env.local
SUPABASE_URL=...
SUPABASE_KEY=...

# apps/hk16/.env.local
# Custom configuration
```

## Unified Lineup Submission

### Current State
- Managers must visit 3 separate sites to submit lineups
- Duplicate work for managers with teams in multiple leagues

### Solution: Lineup Hub
A single web interface where managers can:
1. Log in once
2. Select their team
3. See all leagues they're registered in
4. Submit lineups for all leagues from one place

### Implementation
The Lineup Hub (to be built):
- Separate lightweight app in the monorepo
- Calls APIs on all 3 league sites
- Maintains unified authentication
- Reduces friction for managers

## Building for Production

### Build All Apps
```bash
pnpm build
```

### Build Specific App
```bash
cd apps/musou && pnpm build
```

### Deploy to Vercel

**Option 1: Deploy each app separately** (Recommended initially)
```bash
cd apps/musou
vercel deploy

cd ../sanma
vercel deploy

cd ../hk16
vercel deploy
```

**Option 2: Configure monorepo on Vercel**
- Set root directory to each app directory when deploying
- Vercel automatically manages workspaces

## Common Tasks

### Add a new dependency to all apps
```bash
pnpm add -r next@latest
```

### Add dependency only to Musou
```bash
pnpm add -w --filter @summerleagues/musou next-auth
```

### Add to shared package
```bash
pnpm add -w --filter @summerleagues/shared lodash-es
```

### Type check everything
```bash
pnpm type-check
```

### Lint all apps
```bash
pnpm lint
```

## Migration Checklist

- [x] Create monorepo root configuration
- [x] Copy all 3 apps to `/apps/`
- [x] Create shared package in `/packages/shared`
- [x] Add shared package as dependency to each app
- [ ] Test each app builds independently
- [ ] Update any shared utilities/types in shared package
- [ ] Push to `summerleagues` repository
- [ ] Update deployment pipelines
- [ ] Plan Lineup Hub implementation

## Troubleshooting

### App not finding shared package
- Run `pnpm install` in the root
- Check that `@summerleagues/shared` is in app's `package.json`
- Verify path aliases if using TypeScript imports

### pnpm workspace issues
- Delete `pnpm-lock.yaml` and run `pnpm install`
- Ensure each app has a `package.json` with a unique `name` field

### Build failures
- Check each app's `.env.local` is configured
- Verify database connections are active
- Run `pnpm type-check` to catch TypeScript errors early
