# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev           # Start dev server (http://localhost:5173)
bun run build     # Type-check with tsc, then build with Vite
bun run lint      # Run ESLint
bun run preview   # Preview production build locally
```

Add shadcn/ui components:
```bash
bunx --bun shadcn@latest add <component>
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 + Vite 7
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand with localStorage persistence (key: `poker-chart`)

## Architecture

This is a frontend-only static app (deployed to Vercel) for visualizing poker hand ranges.

**State Management**: Single Zustand store at `src/stores/chartStore.ts` with localStorage persistence. Currently tracks selected position.

**Styling**: Uses shadcn/ui CSS variables (bg-background, text-foreground, bg-primary, etc.) defined in `src/index.css`. Dark mode via `.dark` class on root.

**Import Alias**: Use `@/` for src imports:
```typescript
import { useChartStore } from '@/stores/chartStore'
```

## Poker Domain

**Hand Grid**: 13x13 grid representing all 169 starting hands:
- Diagonal: pocket pairs (AA, KK, QQ...)
- Above diagonal: suited hands (AKs, AQs...)
- Below diagonal: offsuit hands (AKo, AQo...)

**Positions**: UTG, MP, CO, BTN, SB, BB

**Actions**: fold, call, raise, 3bet, all-in (color-coded)
