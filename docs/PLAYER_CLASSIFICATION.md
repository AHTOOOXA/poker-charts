# Player Classification System

This document explains the analytics approach for segmenting leaderboard participants by activity level.

## Objective

Provide context when browsing player profiles — understand whether someone is a high-volume regular or an occasional player based on their public leaderboard history.

## Data Overview

**Dataset:** 56 days of leaderboard data (Dec 1, 2025 — Jan 25, 2026)
- 27,064 unique players
- 227,010 total entries
- 952 CSV files
- 17 stakes: NL2–NL2000 (Rush & Cash + Regular Holdem)

### Key Distributions (56-day dataset)

| Metric | p25 | p50 | p75 | p90 | p95 |
|--------|-----|-----|-----|-----|-----|
| days_active | 2 | 4 | 10 | 22 | 30 |
| total_entries | 2 | 4 | 10 | 23 | 32 |
| estimated_hands | 2,212 | 7,176 | 26,080 | 72,826 | 120,374 |
| hands_per_day | 681 | 2,479 | 3,880 | 5,680 | 7,433 |

### Key Findings

1. **Game type split**: 49% Rush-only, 41% Holdem-only, 10% hybrid
2. **Hybrid players play more**: Avg 59K hands vs 37K (Rush) / 7K (Holdem)
3. **High volume outliers**: 211 players (0.8%) averaging 15K+ hands/day
4. **High churn**: 55% of players appear fewer than 5 days
5. **Stake distribution**: 54% play micros (NL2–NL10), 5% play high stakes (NL500+)

## Classification System (3 Tiers)

### Logic

```typescript
function classifyPlayer(player: PlayerStats): PlayerType {
  const hands = player.estimated_hands
  const days = player.days_active
  const hpd = days > 0 ? hands / days : 0

  if (hpd >= 25000) return 'HV'
  if (hands >= 60000) return 'REG'
  return 'REC'
}
```

### Thresholds

| Type | Criteria | Description |
|------|----------|-------------|
| **HV** | 25K+ hands/day | High volume outlier |
| **REG** | 60K+ hands (30k/mo) | Regular player |
| **REC** | Everything else | Occasional or new player |

## Hand Estimation

### Game-Type Specific Rates

| Game Type | Points/Hand | Notes |
|-----------|-------------|-------|
| Rush & Cash | 1.50–1.71 | Dynamic based on happy hour usage |
| Regular Holdem | 0.48 | Fixed rate |

### Rush & Cash Calibration

**Base rate (0% happy hours):**
```
4,000 hands = 6,000 points → 1.50 pts/hand
```

**Overall average (~3% HH):**
```
114,000 hands = 176,000 points → 1.54 pts/hand
```

**Regular Holdem:**
```
12,000 hands = 5,700 points → 0.48 pts/hand
```

### Happy Hour Mechanics

- **Window:** 06:00–07:59 UTC (2 hours daily)
- **Bonus:** 2x points during window

### Happy Hour Adjustment Formula

```python
def get_rush_pts_per_hand(avg_pts_per_entry):
    MIN_AVG = 8000
    MAX_AVG = 32000
    MIN_RATE = 1.50
    MAX_RATE = 1.71

    t = (avg_pts_per_entry - MIN_AVG) / (MAX_AVG - MIN_AVG)
    t = clamp(t, 0, 1)
    return MIN_RATE + (MAX_RATE - MIN_RATE) * sqrt(t)
```

| Avg pts/entry | Pts/hand | HH % (approx) |
|---------------|----------|----------------|
| 8k | 1.50 | ~0% |
| 15k | 1.57 | ~5% |
| 20k | 1.61 | ~7% |
| 32k | 1.71 | ~14% |

## Implementation

Classification is computed client-side in `PlayerCard.tsx`.

### Files

- `src/components/players/PlayerCard.tsx` — Classification logic + display
- `src/components/players/RegTypeBadge.tsx` — Badge component
- `src/types/player.ts` — PlayerType type definition

## Changelog

- **2026-01-21**: Initial classification (activity_rate based)
- **2026-01-21**: Revised to volume + consistency
- **2026-01-26**: 4-tier system based on expanded 56-day dataset
