# Poker Lab

Study tools and public leaderboard browser for online poker.

**Live:** [ahtoooxa.github.io/poker-charts](https://ahtoooxa.github.io/poker-charts/)

## Features

### Preflop Ranges
Interactive 13x13 hand grid viewer for GTO preflop charts. Supports multiple chart providers, all 6 positions, and scenarios including RFI, vs-open, vs-3bet, and vs-4bet. Cells support weighted ranges and multi-action splits with visual frequency indicators.

### GG Leaderboards
Browser for publicly available GGPoker/Natural8 daily leaderboard results.

- **Player Search** — look up any player's leaderboard history with fuzzy search and Russian keyboard layout auto-detection
- **Results Archive** — historical daily results filterable by stake, game type, and date
- **Rakeback Analysis** — prize tier distributions, hands needed, and marginal bb/100 breakdowns with happy hour bonuses

### Range Analyzer
Postflop equity breakdown tool. Input a board and compare OOP vs IP ranges with hand category breakdowns (made hands, draws, air), combo counting, and pie chart visualizations.

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Bun |
| Framework | React 19 |
| Build | Vite 7 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | TanStack Router |
| State | Zustand + localStorage persistence |
| Charts | Recharts |
| Validation | Zod |
| Deploy | GitHub Pages + GitHub Actions |
| Data pipeline | Python (Playwright, pandas) |

## Architecture

Static frontend SPA — no backend, no database. All data is bundled at build time or loaded from static JSON.

```
src/
  components/       # React components organized by feature
    chart/           # Hand grid, cells
    leaderboard/     # Leaderboard pages (search, archive, rakeback)
    players/         # Player cards, badges, filters, timeline
    analyze/         # Range analyzer
  data/
    ranges/          # Preflop chart data (static TS modules)
  stores/            # Zustand stores
  types/             # TypeScript types
  lib/               # Utilities

leaderboards/        # Public leaderboard data (CSV + JSON)
scripts/             # Python data pipeline (scraping, aggregation)
```

### Data Pipeline

Leaderboard data is collected from Natural8's publicly accessible leaderboard pages using Playwright, aggregated with Python scripts, and bundled as static JSON.

## Development

```bash
bun install          # Install dependencies
bun dev              # Dev server at localhost:7272
bun run build        # Type-check + production build
bun run lint         # ESLint
bun test             # Vitest
```

## Important Notice

> **This is an off-the-table study and research tool only.**
>
> This application must **not** be used during live poker sessions. The author does not use it during gameplay and does not recommend doing so. Using third-party tools while playing may violate your poker platform's terms of service and result in account restrictions.

This project is an independent study tool. It is **not** affiliated with, endorsed by, or connected to GGPoker, Natural8, or any other poker operator.

- **No real-time assistance** — this app does not interact with any poker client during gameplay
- **No hand history access** — no hand histories are imported, parsed, or stored
- **No private data** — all leaderboard data is sourced from publicly accessible pages on Natural8's website

Players are responsible for ensuring their use of any tools complies with the terms of service of their poker platform.

## License

MIT
