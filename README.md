# Summer Leagues Monorepo

Unified monorepo for managing three Riichi Mahjong leagues: Musou (4p), 3ma (3p), and HK16 (TWMJ).

## Project Structure

```
summerleagues/
├── apps/
│   ├── musou/           # Musou League (4p Riichi)
│   ├── sanma/           # 3ma League (3p Riichi)
│   └── hk16/            # HK16 League (TWMJ)
├── packages/
│   └── shared/          # Shared types, utilities, and components
├── package.json         # Monorepo root
├── pnpm-workspace.yaml  # pnpm workspace config
└── tsconfig.json        # Root TypeScript config
```

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Development
Run all apps in parallel:
```bash
pnpm dev
```

Run a specific app:
```bash
cd apps/musou && pnpm dev
cd apps/sanma && pnpm dev
cd apps/hk16 && pnpm dev
```

### Build
Build all apps:
```bash
pnpm build
```

Build specific app:
```bash
cd apps/musou && pnpm build
```

## Shared Package

The `@summerleagues/shared` package contains:
- **types**: Common types used across all leagues (Team, Player, GameResult, etc.)
- **utils**: Shared utility functions (formatting, calculations, etc.)

### Using Shared Package

In any app, import from the shared package:
```typescript
import { formatPoints, LEAGUE_NAMES } from '@summerleagues/shared'
```

## Apps

### Musou League (`apps/musou`)
- 4-player Riichi Mahjong
- Database: Neon PostgreSQL + Upstash Redis
- Features: Lineup submission, game results, standings

### 3ma League (`apps/sanma`)
- 3-player Riichi Mahjong
- Database: Supabase
- Features: Match tracking, player rankings

### HK16 League (`apps/hk16`)
- TWMJ format league
- Database: Custom configuration
- Features: Score management, leaderboards

## Deployment

Each app can be deployed independently to Vercel or other platforms.

### Deploy Musou
```bash
cd apps/musou
vercel deploy
```

### Deploy 3ma
```bash
cd apps/sanma
vercel deploy
```

### Deploy HK16
```bash
cd apps/hk16
vercel deploy
```

## Environment Variables

Each app maintains its own `.env.local` file with league-specific configurations.

## Contributing

1. Create a feature branch
2. Make changes in the relevant app directory
3. Update shared package if adding common functionality
4. Test all affected apps: `pnpm build`
5. Create a pull request
