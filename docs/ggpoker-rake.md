# GGPoker Rake Structure

## Classic 6-Max No Limit Hold'em

5% rake with caps based on player count.

**Additional Deduction:** Bad Beat Jackpot - 1BB taken from pots ≥ 30BB (see BBJ section below)

### Low Stakes

| Blinds | Buy-in | 2 Players | 3 Players | 4 Players | 5+ Players |
|--------|--------|-----------|-----------|-----------|------------|
| $0.01/$0.02 | $0.50 | $0.05 | $0.10 | $0.15 | $0.20 |
| $0.02/$0.05 | $1 | $0.13 | $0.25 | $0.38 | $0.50 |
| $0.05/$0.10 | $2 | $0.25 | $0.50 | $0.75 | $1.00 |
| $0.10/$0.25 | $5 | $0.50 | $1.00 | $1.50 | $2.00 |

### Middle Stakes

| Blinds | Buy-in | 2 Players | 3 Players | 4 Players | 5+ Players |
|--------|--------|-----------|-----------|-----------|------------|
| $0.25/$0.50 | $10 | $1.00 | $2.00 | $3.00 | $4.00 |
| $0.50/$1 | $20 | $1.25 | $2.50 | $3.75 | $5.00 |
| $1/$2 | $40 | $1.50 | $3.00 | $4.50 | $6.00 |

### High Stakes

| Blinds | Buy-in | 2 Players | 3 Players | 4 Players | 5+ Players |
|--------|--------|-----------|-----------|-----------|------------|
| $2/$5 | $100 | 0.4BB | 0.8BB | 1.2BB | 1.6BB |
| $5/$10 | $200 | 0.25BB | 0.5BB | 0.75BB | 1BB |
| $10/$20 | $500 | 0.188BB | 0.375BB | 0.563BB | 0.75BB |

---

## Rush & Cash (Fast-Fold)

5% rake with **flat 3BB cap** regardless of player count.

**Additional Deductions:**
- **Cash Drop Fund:** 0.5BB taken from pots ≥ 30BB
- **Bad Beat Jackpot:** 1BB taken from pots ≥ 30BB (see BBJ section below)

### Low Stakes

| Blinds | Game | Buy-in | Rake Cap |
|--------|------|--------|----------|
| $0.01/$0.02 | Hold'em | $1 | 3BB ($0.06) |
| $0.01/$0.02 | PLO | $0.40 | 3BB ($0.06) |
| $0.02/$0.05 | Hold'em | $2 | 3BB ($0.15) |
| $0.02/$0.05 | PLO | $1 | 3BB ($0.15) |
| $0.05/$0.10 | Hold'em | $4 | 3BB ($0.30) |
| $0.05/$0.10 | PLO | $2 | 3BB ($0.30) |

### Middle Stakes

| Blinds | Game | Buy-in | Rake Cap |
|--------|------|--------|----------|
| $0.10/$0.25 | Hold'em | $10 | 3BB ($0.75) |
| $0.10/$0.25 | PLO | $5 | 3BB ($0.75) |
| $0.25/$0.50 | Hold'em | $20 | 3BB ($1.50) |
| $0.25/$0.50 | PLO | $10 | 3BB ($1.50) |
| $0.50/$1 | Hold'em | $40 | 3BB ($3.00) |
| $0.50/$1 | PLO | $20 | 3BB ($3.00) |
| $1/$2 | Hold'em | $80 | 3BB ($6.00) |
| $1/$2 | PLO | $40 | 3BB ($6.00) |

---

## Key Differences: Classic vs Rush & Cash

| Aspect | Classic 6-Max | Rush & Cash |
|--------|---------------|-------------|
| Rake Cap | Scales with player count | Flat 3BB |
| Cap at NL10 (5+ players) | 2BB ($0.50) | 3BB ($0.75) |
| Cap at NL25 (5+ players) | 8BB ($4.00) | 3BB ($1.50) |
| Cash Drop (pots ≥ 30BB) | None | 0.5BB |
| BBJ (pots ≥ 30BB) | 1BB | 1BB |
| **Max Total (pots ≥ 30BB)** | Rake + 1BB | **4.5BB** |

**Strategic Implication:** Rush & Cash has a higher cap at micro stakes but becomes more favorable at NL25+ compared to classic tables with 5+ players.

---

## Bad Beat Jackpot (BBJ)

Shared jackpot fund across Hold'em, PLO, PLO-5, PLO-6, Short Deck, and Rush & Cash.

### Qualifying Hands

| Game | Losing Hand Required |
|------|---------------------|
| Hold'em | AAATT or better (full house) |
| Rush & Cash Hold'em | AAATT or better |
| PLO | 2222 or better (quads) |
| Rush & Cash PLO | 2222 or better |
| PLO-5 | 8888 or better |
| PLO-6 | JJJJ or better |
| Short Deck | 6666 or better |

### BBJ Requirements

- Hand must go to showdown
- Both winner and loser must use **both hole cards** to make best 5-card hand
- Pocket pairs required for quads
- Rush & Cash: Only awarded at tables with 6 dealt players

### Payout Distribution

| Recipient | Prize |
|-----------|-------|
| Bad Beat Winner (pot loser, 2nd best hand) | 10% |
| Bad Beat Opponent (pot winner) | 3% |
| Other Players at Table | 0.8% |

### Fund Contribution

| Game Type | Pot Threshold | Contribution |
|-----------|---------------|--------------|
| Hold'em, PLO, PLO-5, PLO-6 | ≥ 30BB | 1BB |
| Rush & Cash (Hold'em & PLO) | ≥ 30BB | 1BB |
| 9-Max Games | ≥ 30BB | 0.8BB |
| Short Deck | ≥ 100 antes | 1 ante |

---

## Total Effective Rake (Rush & Cash)

For pots ≥ 30BB at Rush & Cash:

| Deduction | Amount |
|-----------|--------|
| Rake | Up to 3BB (5% capped) |
| Cash Drop | 0.5BB |
| Bad Beat Jackpot | 1BB |
| **Maximum Total** | **4.5BB** |

**Example at NL10 ($0.05/$0.10):**
- Pot of 50BB ($5.00): Rake $0.25 (cap) + Cash Drop $0.05 + BBJ $0.10 = **$0.40 total (4BB)**

### True Rake % by Pot Size (Rush & Cash)

The advertised "5% rake" is misleading for pots 30-90BB due to jackpot fees:

| Pot Size | Rake | Jackpot | Cash Drop | Total | True % |
|----------|------|---------|-----------|-------|--------|
| 30BB | 1.5BB | 1BB | 0.5BB | 3BB | 10.0% |
| 35BB | 1.75BB | 1BB | 0.5BB | 3.25BB | 9.3% |
| 40BB | 2BB | 1BB | 0.5BB | 3.5BB | 8.75% |
| 50BB | 2.5BB | 1BB | 0.5BB | 4BB | 8.0% |
| 60BB | 3BB | 1BB | 0.5BB | 4.5BB | 7.5% |
| 90BB+ | 3BB | 1BB | 0.5BB | 4.5BB | 5.0% |

The true 5% rake only applies to pots of **90BB or larger**.

---

## Effective Rake (bb/100)

Data from [Primedope](https://www.primedope.com/online-poker-rake-comparison-rake-calculator/) (January 2026).

### GGPoker Rush & Cash (Fast-Fold) - Base Rake Only

*Note: These numbers do NOT include jackpot fees (see "True Effective Rake" below)*

| Stakes | $/100 hands | bb/100 | Rake % | Cap |
|--------|-------------|--------|--------|-----|
| NL10 ($0.05/$0.10) | $0.72 | 7.21 | 5% | $0.30 |
| NL25 ($0.10/$0.25) | $1.80 | 7.21 | 5% | $0.75 |
| NL50 ($0.25/$0.50) | $3.71 | 7.42 | 5% | $1.50 |
| NL100 ($0.50/$1.00) | $7.61 | 7.61 | 5% | $3.00 |
| NL200 ($1.00/$2.00) | $13.51 | 6.76 | 5% | $6.00 |
| NL500 ($2.50/$5.00) | $25.10 | 5.02 | 5% | $15.00 |

### True Effective Rake (Including Jackpot Fees)

For pots ≥ 30BB, add **1.5BB** (1BB jackpot + 0.5BB Cash Drop) to base rake.

Player-reported actual rake at Rush & Cash: **~10.5 bb/100** at micro stakes.

| Stakes | Base Rake | + Jackpot Fees | True Effective |
|--------|-----------|----------------|----------------|
| NL10 | 7.21 bb/100 | ~3 bb/100 | **~10 bb/100** |
| NL25 | 7.21 bb/100 | ~3 bb/100 | **~10 bb/100** |
| NL50 | 7.42 bb/100 | ~2.5 bb/100 | **~10 bb/100** |
| NL100 | 7.61 bb/100 | ~2 bb/100 | **~9.5 bb/100** |

### GGPoker Regular Tables (6-max)

| Stakes | Effective Rake (bb/100) |
|--------|------------------------|
| NL2 | 9.10 |
| NL5 | 9.10 |
| NL10 | 9.10 |
| NL25 | 8.83 |
| NL50 | 9.00 |
| NL100 | 8.55 |
| NL200 | 6.76 |
| NL1000 | 4.67 |

---

## Fast-Fold Rake Comparison (6 players)

### NL10 ($0.05/$0.10)

| Rank | Site | bb/100 | Net Rake | Cap |
|------|------|--------|----------|-----|
| 1 | Unibet | 5.35 | 2.68% | €2.00 |
| **2** | **GGPoker** | **7.21** | **3.61%** | **$0.30** |
| 3 | PokerStars | 8.01 | 4.01% | $1.50 |
| 4 | CoinPoker | 8.40 | 4.20% | $0.75 |
| 5 | PokerStars EU | 8.86 | 4.44% | €1.25 |
| 6 | ACR/WPN | 8.92 | 4.46% | $3.00 |
| 7 | 888Poker | 8.92 | 4.46% | $4.00 |

### All Stakes Comparison (GGPoker vs Competition)

| Stakes | GGPoker | PokerStars | ACR/WPN | 888Poker |
|--------|---------|------------|---------|----------|
| NL10 | 7.21 | 8.01 | 8.92 | 8.92 |
| NL25 | 7.21 | 7.75 | 8.85 | 8.90 |
| NL50 | 7.42 | 7.40 | 8.04 | 8.43 |
| NL100 | 7.61 | 6.73 | 7.10 | 7.66 |
| NL200 | 6.76 | 4.65 | 4.81 | 5.35 |
| NL500 | 5.02 | 3.15 | 3.15 | 3.65 |

**Key Insight:** GGPoker has the **lowest fast-fold rake at NL10-NL50** (after Unibet), but becomes **expensive at NL200+**.

---

## GGPoker Unique Raking Rules

Unlike most sites that use "no flop, no drop":
- **GGPoker rakes hands with a 3-bet preflop** even without a flop
- This affects 3-bet pots significantly
- Most other sites only rake if the hand sees a flop

### Where GGPoker Rake is Competitive

- **Fast-fold NL10-NL50**: Best or second-best in industry
- **PLO at micros**: Favorable structure
- **High stakes (NL200+)**: Significantly more expensive than competitors

### Rakeback

GGPoker offers **up to 60% rakeback** through Fish Buffet loyalty program.

*Warning: GGPoker uses PVI (Player Value Index) which can reduce effective rakeback below advertised rates.*

| Base Rake | After 25% RB | After 50% RB |
|-----------|--------------|--------------|
| 10 bb/100 | 7.5 bb/100 | 5.0 bb/100 |
| 7.21 bb/100 | 5.4 bb/100 | 3.6 bb/100 |

---

## Strategic Implications

1. **Avoid large pots when marginal** - Additional BBJ/Cash Drop fees kick in at 30BB+
2. **Rush & Cash rake is heavier than it appears** - 3BB cap + 1.5BB in jackpot fees
3. **Cold calling becomes even worse** - High effective rake punishes marginal spots
4. **3-bet or fold preferred** - Win pots preflop before rake/fees apply
5. **Micros require higher winrate** - 9bb/100 rake means you need 10bb/100+ to profit
6. **Maximize rakeback** - At micros, Fish Buffet rewards significantly reduce effective rake
7. **High stakes players consider alternatives** - GGPoker's 2.5x rake vs Stars/ACR matters at NL1000+

---

## Sources

- [Primedope Rake Calculator](https://www.primedope.com/online-poker-rake-comparison-rake-calculator/)
- [Worldpokerdeals Rake Comparison](https://worldpokerdeals.com/poker-rooms-rake-comparison)
- [GTO Wizard - Rake & Rakeback Explained](https://blog.gtowizard.com/rake-rakeback-explained-optimize-your-poker-earnings/)
- GGPoker Official Rake Tables
