# GGPoker Leaderboard Data Analysis

A data-driven approach to understanding poker leaderboard competition patterns and optimizing grinding strategy.

## Problem Statement

GGPoker runs daily leaderboards where players earn points based on hands played. Points convert to cash prizes based on final ranking. The core questions:

1. **How many points do I need to win X dollars?**
2. **What's the effective rakeback (bb/100) for each prize tier?**
3. **Are there temporal patterns I can exploit?**

## Data Overview

| Metric | Value |
|--------|-------|
| Date range | Dec 1, 2025 – Jan 31, 2026 |
| Total days | 62 |
| Game types | Rush & Cash, Regular 6-max, 9-max |
| Stakes | NL2 – NL200 |
| Total entries | ~260,000 |

**Data structure per CSV:**
```
Rank, Nickname, Points, Prize
1, PlayerX, 44877.00, 150.00
2, PlayerY, 39958.00, 110.00
...
```

## Initial Approach (Rejected)

The first implementation calculated "effective rakeback" using:

```
hands = points / pts_per_hand
bb100 = (prize / bb_value) / hands * 100
```

With assumed rates:
- Rush & Cash: 1.50 pts/hand
- Regular: 0.48 pts/hand

**Why this was problematic:**

1. **pts/hand varies by player** – Table count, play speed, and game format affect actual rates
2. **Averages hide distribution** – Knowing "average 45k points for $150" doesn't tell you if 40k is enough on an easy day
3. **Not actionable** – Users can't easily convert this to decision-making

## Refined Approach

### Key Insight: Frame as a Lookup Problem

Instead of calculating derived metrics, answer the direct question:

> "If I grind X points on [day], what prize can I expect?"

This requires understanding the **distribution** of points needed per prize tier, segmented by day of week.

### Hypothesis: Day-of-Week Matters

Poker grinding behavior likely varies by day:
- Weekends: More recreational players? Or more grinders with free time?
- Weekdays: Fewer competitors? Or dedicated regs?

## Methodology

### Step 1: Initial Day-of-Week Analysis

Grouped data by (stake, prize, day_of_week) and calculated median points needed.

**First result (Rush NL25, $110 prize):**

| Day | Median Points |
|-----|---------------|
| Wed | 37.5k |
| Mon | 37.9k |
| Sun | 43.9k |

Initial conclusion: Wednesday is easiest, Sunday is hardest.

### Step 2: Holiday Contamination Check

The analysis period (Dec–Jan) contains major holidays. Checked for outliers:

```
2025-12-31 (Wed): 18.8k pts  ← NYE, massive outlier
2025-12-25 (Thu): 49.7k pts  ← Christmas
2026-01-01 (Thu): 43.8k pts  ← New Year's Day
```

**NYE (18.8k)** was 60% below the median, severely skewing Wednesday's data.

### Step 3: Exclude Holidays

Removed 7 holiday dates:
- Dec 24-26 (Christmas)
- Dec 31 – Jan 2 (New Year)
- Jan 6 (Epiphany)

**Result after exclusion (Rush NL25, $110 prize):**

| Day | Before | After | Δ |
|-----|--------|-------|---|
| Wed | 37.5k | 41.3k | +3.8k |
| Mon | 37.9k | 37.9k | — |
| Sun | 43.9k | 43.9k | — |

Wednesday flipped from "easiest" to "medium-hard" once the NYE outlier was removed.

### Step 4: Weighted Cross-Stake Analysis

Different stakes have different player pool sizes:

| Stake | Entries/Day | Weight |
|-------|-------------|--------|
| NL2 | ~400 | 5 |
| NL5 | ~350 | 4 |
| NL10 | ~300 | 3 |
| NL25 | ~300 | 2 |
| NL50 | ~240 | 1 |
| NL100 | ~140 | 0.5 |

**Rationale for weighting:**
1. Larger player pools = more statistically significant data
2. More users play lower stakes = more relevant to majority
3. Lower stakes have more consistent competition patterns

For each (stake, prize) pair, ranked days 1-7 by median points needed. Then calculated weighted average rank per day.

## Key Findings

### Day Difficulty Rankings (Weighted)

| Rank | Day | Score | Interpretation |
|------|-----|-------|----------------|
| 1 | **Thursday** | 2.40 | 🟢 Easiest |
| 2 | Friday | 3.46 | Medium |
| 3 | Monday | 3.55 | Medium |
| 4 | Tuesday | 3.63 | Medium |
| 5 | Sunday | 3.92 | Medium |
| 6 | Saturday | 4.84 | Medium-Hard |
| 7 | **Wednesday** | 6.19 | 🔴 Hardest |

### Practical Impact

**NL2 (Rank 1 prize: $30):**
- Thursday: 43.1k points needed
- Wednesday: 51.0k points needed
- Δ: 18% more points on Wednesday
- bb/100 difference: **0.81 bb/100**

At lower stakes, choosing the right day to grind is worth nearly 1 bb/100 in effective rakeback.

### Variance by Prize Tier

Higher prize tiers show more day-to-day variance:

| Prize Tier | Points Variance |
|------------|-----------------|
| Rank 1 | 10-20% |
| Rank 5-10 | 5-10% |
| Rank 20+ | 3-5% |

**Interpretation:** Competition for top spots is more sensitive to who shows up that day. Lower ranks are more consistent.

## Statistical Considerations

### Sample Size

- 55 non-holiday days
- ~8 data points per (day, stake, prize) combination
- Sufficient for median estimates, less reliable for percentiles

### Potential Biases

1. **Seasonal bias** – Dec-Jan may not represent year-round patterns (holidays, weather, work schedules)
2. **Promotion effects** – GGPoker may run promotions affecting specific days
3. **Reg migration** – Regular players may shift stakes based on perceived value

### What More Data Would Enable

With 6+ months of data:
- Monthly pattern analysis (beginning vs end of month)
- Specific date effects (payday patterns)
- Confidence intervals on percentile estimates

## Actionable Conclusions

### For Players

1. **Grind Thursday** – Consistently the easiest day across stakes
2. **Avoid Wednesday** – Highest competition, worst value
3. **Lower stakes benefit most** – Day selection worth ~0.8 bb/100 at NL2, diminishes at higher stakes
4. **Top prizes have highest variance** – If chasing rank 1, day selection matters more

### For Product (if building tools)

1. **Show distribution, not averages** – "35k-45k points for $100" is more useful than "40k average"
2. **Day-of-week recommendations** – Simple "Thursday = easy" badge
3. **Personal expected value calculator** – "Your typical volume → expected prize"

## Technical Implementation Notes

### Data Pipeline

```
CSV files (daily snapshots)
    ↓
Python parser (exclude holidays, validate data)
    ↓
Aggregate by (game, stake, prize, day_of_week)
    ↓
Calculate percentiles (p25, p50, p75)
    ↓
JSON output for web app
```

### Key Formulas

**Points to bb/100 conversion:**
```python
hands = points / pts_per_hand  # 1.5 for Rush, 0.48 for Regular
bb100 = (prize / bb_value) / hands * 100
```

**Weighted day ranking:**
```python
weighted_avg = Σ(rank × stake_weight) / Σ(stake_weight)
```

---

## Appendix: Raw Day-of-Week Data

### Rush NL25 (Holidays Excluded)

| Prize | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Δ% |
|-------|-----|-----|-----|-----|-----|-----|-----|---|
| $150 | 43.8k | 45.4k | 45.4k | 46.9k | 44.7k | 45.1k | 46.6k | 7% |
| $110 | 37.9k | 40.9k | 41.3k | 40.0k | 39.1k | 40.8k | 43.9k | 16% |
| $100 | 35.2k | 35.6k | 38.3k | 34.4k | 35.2k | 35.7k | 38.0k | 11% |
| $90 | 33.7k | 32.8k | 36.0k | 34.1k | 33.6k | 34.3k | 36.1k | 10% |
| $80 | 31.5k | 30.9k | 32.3k | 32.0k | 31.3k | 32.3k | 32.8k | 6% |

### Rush NL2 (Holidays Excluded)

| Prize | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Δ% |
|-------|-----|-----|-----|-----|-----|-----|-----|---|
| $30 | 47.3k | 47.9k | 51.0k | 43.1k | 48.6k | 48.7k | 47.1k | 18% |
| $25 | 44.1k | 45.3k | 47.9k | 39.7k | 45.7k | 46.6k | 44.7k | 21% |
| $21 | 40.7k | 41.9k | 44.1k | 37.1k | 43.8k | 42.9k | 41.5k | 19% |

---

## UI Implementation

The final UI includes:

1. **Day-of-week disclaimer** at top with 💡 icon
   - Shows easiest/hardest days
   - Notes ~10-18% variance

2. **Swarm plot visualization** for each prize tier
   - Dots for min/max outliers
   - Box for p25-p75 interquartile range
   - Vertical line for median
   - All scaled to same x-axis for comparison

3. **Data columns**
   - Prize and ranks
   - Points range (p25-p75)
   - Hands needed (at base pts/hand rate)
   - bb/100 effective rakeback
   - For Rush: Happy Hour adjusted hands and bb/100

4. **Value indicators**
   - ★ marks top 3 bb/100 prize tiers
   - Green highlighting for best value rows

---

*Analysis performed: February 2026*
*Data source: GGPoker daily leaderboard exports*
