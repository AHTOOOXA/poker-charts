# PRD: Postflop Range Analyzer

**Version:** 2.0
**Date:** January 2026
**Status:** Implemented

---

## 1. Overview

### 1.1 Vision

The Postflop Range Analyzer is a Flopzilla-inspired tool for studying how both players' ranges connect with specific board textures in common postflop scenarios. It provides side-by-side analysis of IP (In Position) and OOP (Out of Position) ranges for Single Raised Pots and 3bet Pots.

### 1.2 Problem Statement

Currently, the app displays preflop ranges but provides no postflop analysis. Players need to understand:
- How often their range hits a specific board
- What portion of their range is strong vs weak vs drawing
- How card removal affects combo counts

### 1.3 Target Users

- Online poker players studying hand ranges
- Players preparing for specific opponents/scenarios
- Coaches explaining range vs board interactions
- Players reviewing hands to understand equity distributions

### 1.4 Success Metrics

| Metric | Target |
|--------|--------|
| Page engagement | >20% of sessions visit Analyzer |
| Analysis completion | >80% of visits result in board input |
| Return usage | >50% of users return to Analyzer within 7 days |

---

## 2. User Stories

### 2.1 Primary User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-1 | Player | Load my BTN vs CO range and see how it hits A♠K♦7♥ | I understand my range advantage |
| US-2 | Player | See how many combos I have of sets, two pair, top pair | I can plan bet sizing |
| US-3 | Player | Quickly input boards by clicking or typing | Analysis is fast and frictionless |
| US-4 | Coach | Create a custom range and show a student the breakdown | I can teach range construction |
| US-5 | Player | See a visual pie chart of my range composition | I get instant visual feedback |

### 2.2 Secondary User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-6 | Player | Generate a random board | I can practice random spot analysis |
| US-7 | Player | See combos broken down by action (raise/call) | I know my raising vs calling range strength |
| US-8 | Player | Click on a category to highlight those hands in the grid | I can visually identify which hands fall where |

---

## 3. Feature Specifications

### 3.1 Scenario Selection

#### 3.1.1 Pot Type

Users select the type of pot:

| Pot Type | Description | Range Resolution |
|----------|-------------|------------------|
| **SRP** | Single Raised Pot | Opener RFI vs Caller's call range |
| **3bet Pot** | 3bet pot where opener called | Opener's vs-3bet call vs 3bettor's 3bet range |

#### 3.1.2 Position Selection

**OOP (Out of Position):**
- The player who acts first on each postflop street
- Postflop order: SB → BB → UTG → MP → CO → BTN

**IP (In Position):**
- The player who acts last on each postflop street
- Must be "later" in postflop order than OOP

**Range Resolution Logic:**

| Pot Type | OOP Range | IP Range |
|----------|-----------|----------|
| SRP (OOP opened) | OOP's RFI (raise) | IP's vs-open (call) |
| SRP (IP opened) | OOP's vs-open (call) | IP's RFI (raise) |
| 3bet (OOP opened) | OOP's vs-3bet (call) | IP's vs-open (raise = 3bet) |
| 3bet (IP opened) | OOP's vs-open (raise = 3bet) | IP's vs-3bet (call) |

**Provider:**
- Pekarstas, Greenline, GTOWizard GG R&C
- Determines which range pack to use for both players

---

### 3.2 Board Input

#### 3.2.1 Card Picker Interface

A visual representation of a 52-card deck for selecting board cards.

**Layout:**
```
♠: A K Q J T 9 8 7 6 5 4 3 2
♥: A K Q J T 9 8 7 6 5 4 3 2
♦: A K Q J T 9 8 7 6 5 4 3 2
♣: A K Q J T 9 8 7 6 5 4 3 2
```

**Behavior:**
- Click card to add to board (fills left to right: flop → turn → river)
- Click selected card to remove it
- Maximum 5 cards
- Minimum 3 cards for analysis (flop required)
- Used cards shown with reduced opacity / strikethrough
- Cards in hero's range combos automatically removed (card removal)

**Board Display:**
```
┌────┐ ┌────┐ ┌────┐   ┌────┐   ┌────┐
│ A  │ │ K  │ │ 7  │   │    │   │    │
│ ♠  │ │ ♦  │ │ ♥  │   │    │   │    │
└────┘ └────┘ └────┘   └────┘   └────┘
 Flop   Flop   Flop     Turn    River
```

**Visual Design:**
- Cards use suit colors: ♠♣ = white/gray, ♥♦ = red
- Empty slots show dashed border
- Flop cards grouped together, turn/river slightly separated

#### 3.2.2 Keyboard Input

Alternative text-based input for power users.

**Format:** `AsKd7h` or `As Kd 7h` or `AKs, Kd, 7h`

**Input Field:**
- Placeholder: "Type board: AsKd7h"
- Auto-validates and highlights errors
- Syncs bidirectionally with card picker

#### 3.2.3 Board Actions

| Button | Action |
|--------|--------|
| Clear | Remove all board cards |
| Random Flop | Generate random 3 cards |
| Random Turn | Add random 4th card (if flop exists) |
| Random River | Add random 5th card (if turn exists) |
| Random Full | Generate random 5 cards |

---

### 3.3 Hand Strength Analysis

#### 3.3.1 Hand Categories

Hands are categorized into mutually exclusive groups (a hand belongs to exactly one category, the strongest applicable).

**Made Hands (ordered by strength):**

| Category | Description | Example on A♠K♦7♥ |
|----------|-------------|-------------------|
| Straight Flush | 5-card straight flush | - |
| Quads | Four of a kind | - |
| Full House | Three of a kind + pair | - |
| Flush | 5 cards same suit | - |
| Straight | 5-card straight | - |
| Three of a Kind / Set | Pocket pair hits board | 77 → set of 7s |
| Three of a Kind / Trips | Board pair + hole card | - (no paired board) |
| Two Pair (Top Two) | Top two board cards paired | AK → AA+KK |
| Two Pair (Other) | Any other two pair | A7, K7 |
| Overpair | Pair > top board card | - (A is top) |
| Top Pair (Top Kicker) | Pair top card, A-K kicker | AQ, AJ |
| Top Pair (Good Kicker) | Pair top card, decent kicker | AT, A9 |
| Top Pair (Weak Kicker) | Pair top card, weak kicker | A5, A3 |
| Second Pair | Pair second card | KQ, KJ |
| Third Pair / Low Pair | Pair third+ card | 87, 76 |
| Underpair | Pocket pair < lowest board | 55, 44 |

**Drawing Hands (if no made hand above pair):**

| Category | Description | Outs |
|----------|-------------|------|
| Flush Draw | 4 to flush | 9 |
| OESD | Open-ended straight draw | 8 |
| Gutshot | Inside straight draw | 4 |
| Backdoor Flush | 3 to flush | ~1.5 |
| Backdoor Straight | 3 to straight | ~1.5 |
| Overcards | Two cards > board | varies |

**No Equity:**

| Category | Description |
|----------|-------------|
| Air | No pair, no draw, no overcards |

#### 3.3.2 Combo Calculation

**Base Combos by Hand Type:**

| Hand Type | Combos | Example |
|-----------|--------|---------|
| Pocket Pair | 6 | AA = A♠A♥, A♠A♦, A♠A♣, A♥A♦, A♥A♣, A♦A♣ |
| Suited | 4 | AKs = A♠K♠, A♥K♥, A♦K♦, A♣K♣ |
| Offsuit | 12 | AKo = A♠K♥, A♠K♦, A♠K♣, A♥K♠, ... |

**Card Removal:**

When board cards are present, combos are reduced:

| Scenario | Removal |
|----------|---------|
| Board has A♠ | AA: 6→3, AKs: 4→3, AKo: 12→9 |
| Board has A♠K♦ | AK: 16→9 (remove all combos with A♠ or K♦) |

**Formula:**
```
Available combos = Total combos - Combos containing board cards
```

#### 3.3.3 Breakdown Display

**Table Format:**

```
Category          Combos    %       ██████████
──────────────────────────────────────────────
Sets                  3    2.1%    ██
Two Pair             12    8.4%    ████
Top Pair (TK)        15   10.5%    █████
Top Pair (GK)        18   12.6%    ██████
Second Pair          10    7.0%    ███
Flush Draw           14    9.8%    █████
OESD                  8    5.6%    ███
Gutshot              16   11.2%    █████
Overcards            22   15.4%    ████████
Air                  25   17.5%    █████████
──────────────────────────────────────────────
TOTAL               143  100.0%
```

**Grouping Options:**

| Group By | Categories |
|----------|------------|
| Simple (default) | Made Hands, Draws, Air |
| Standard | Sets+, Two Pair, Top Pair, Other Pair, Draws, Nothing |
| Detailed | All categories shown individually |

---

### 3.4 Visualization

#### 3.4.1 Pie Chart

Circular chart showing range composition.

**Segments:**
- Each hand category = one segment
- Segment size proportional to combo count
- Colors match category (configurable palette)
- Hover shows: "Top Pair: 33 combos (23.1%)"

**Default Color Palette:**

| Category | Color |
|----------|-------|
| Sets / Full House+ | Purple (#8B5CF6) |
| Two Pair | Indigo (#6366F1) |
| Top Pair | Sky (#0EA5E9) |
| Other Pairs | Cyan (#06B6D4) |
| Flush Draw | Emerald (#10B981) |
| OESD | Green (#22C55E) |
| Gutshot | Lime (#84CC16) |
| Overcards | Yellow (#EAB308) |
| Backdoor | Orange (#F97316) |
| Air | Gray (#6B7280) |

#### 3.4.2 Hand Grid Highlighting

When user clicks a category in the breakdown:

**Behavior:**
- Hands in that category are highlighted
- Other hands are dimmed (50% opacity)
- Click again to clear highlighting
- Multiple categories can be selected (shift+click)

**Visual:**
- Highlighted hands have bright border
- Category badge shown in corner of cell

#### 3.4.3 Equity Bar (Optional v2)

Horizontal bar showing range vs range equity.

```
HERO   ████████████████████░░░░░░░░░░   62.3%
VILLAIN ░░░░░░░░░░░░░░░░░░░████████████   37.7%
```

---

### 3.5 Action Filtering

#### 3.5.1 Filter by Preflop Action

Users can analyze subsets of their range.

**Checkboxes:**
- [x] Raise (85 combos)
- [x] Call (58 combos)
- [ ] Fold (hidden by default)

**Behavior:**
- Unchecking "Raise" removes all raising hands from analysis
- Breakdown recalculates with filtered range
- Useful for analyzing: "How does my calling range hit this board?"

#### 3.5.2 Split Cell Handling

For hands with mixed actions like `['raise', 'call']`:

**Options:**
1. **Include in both** - Count in raise AND call (duplicates combos)
2. **Primary action only** - Use first action in array
3. **50/50 split** - Count half combos in each (default)

---

## 4. Interface Layout

### 4.1 Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Charts] [Players] [Transcribe] [Analyze]                    🌙 Dark Mode  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │     RANGE SELECTION         │  │            BOARD INPUT                │ │
│  │                             │  │                                       │ │
│  │  Mode: [Preset ▼] [Custom]  │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │
│  │                             │  │  │ A♠ │ │ K♦ │ │ 7♥ │ │    │ │    │  │ │
│  │  Provider: [Pekarstas    ▼] │  │  └────┘ └────┘ └────┘ └────┘ └────┘  │ │
│  │                             │  │                                       │ │
│  │  Hero:                      │  │  [Clear] [Random Flop] [Random Full]  │ │
│  │  [UTG][MP][CO][BTN][SB][BB] │  │                                       │ │
│  │                             │  │  ♠ A K Q J T 9 8 7 6 5 4 3 2         │ │
│  │  Scenario: [vs Open      ▼] │  │  ♥ A K Q J T 9 8 7 6 5 4 3 2         │ │
│  │                             │  │  ♦ A K Q J T 9 8 7 6 5 4 3 2         │ │
│  │  Villain:                   │  │  ♣ A K Q J T 9 8 7 6 5 4 3 2         │ │
│  │  [UTG][MP][CO][ - ][ - ]    │  │                                       │ │
│  │                             │  └───────────────────────────────────────┘ │
│  │  ─────────────────────────  │                                           │
│  │                             │  ┌───────────────────────────────────────┐ │
│  │  Filter by Action:          │  │          BREAKDOWN                    │ │
│  │  [x] Raise  (85)            │  │                                       │ │
│  │  [x] Call   (58)            │  │  Category        Combos    %     Bar  │ │
│  │  [ ] Fold   (1,022)         │  │  ────────────────────────────────────  │ │
│  │                             │  │  Sets                3   2.1%   ██    │ │
│  └─────────────────────────────┘  │  Two Pair           12   8.4%   ████  │ │
│                                   │  Top Pair           33  23.1%   █████ │ │
│  ┌─────────────────────────────┐  │  Second Pair        10   7.0%   ███   │ │
│  │       HAND GRID             │  │  Flush Draw         14   9.8%   █████ │ │
│  │                             │  │  OESD                8   5.6%   ███   │ │
│  │    A  K  Q  J  T  9 ...     │  │  Gutshot            16  11.2%   ████  │ │
│  │ A [██][██][██][██][  ] ...  │  │  Overcards          22  15.4%   █████ │ │
│  │ K [██][██][██][  ][  ] ...  │  │  Air                25  17.5%   █████ │ │
│  │ Q [██][  ][██][  ][  ] ...  │  │  ────────────────────────────────────  │ │
│  │ J [██][  ][  ][██][  ] ...  │  │  TOTAL             143  100%          │ │
│  │ ...                         │  │                                       │ │
│  │                             │  │  Group by: [Simple ▼]                 │ │
│  │  Range: 143 combos          │  └───────────────────────────────────────┘ │
│  │  Raise: 85 | Call: 58       │                                           │
│  └─────────────────────────────┘  ┌───────────────────────────────────────┐ │
│                                   │          PIE CHART                    │ │
│                                   │       ┌─────────────┐                 │ │
│                                   │       │    ╱╲       │  ● Sets         │ │
│                                   │       │   ╱  ╲      │  ● Two Pair     │ │
│                                   │       │  ╱    ╲     │  ● Top Pair     │ │
│                                   │       │ ╱      ╲    │  ● Draws        │ │
│                                   │       │╱        ╲   │  ● Air          │ │
│                                   │       └──────────┘                    │ │
│                                   └───────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tablet Layout (768px - 1023px)

- Stack Board Input above Breakdown
- Hand Grid moves below controls
- Pie chart shows inline with breakdown

### 4.3 Mobile Layout (<768px)

```
┌─────────────────────────────────┐
│ [Charts][Players][Trans][Analy] │
├─────────────────────────────────┤
│                                 │
│  RANGE SELECTION                │
│  [Preset ▼] Provider, Pos...    │
│                                 │
│  BOARD                          │
│  [A♠][K♦][7♥][ ][ ]            │
│  [Clear] [Random]               │
│                                 │
│  CARD PICKER (collapsed)        │
│  [Show Card Picker ▼]           │
│                                 │
│  BREAKDOWN                      │
│  Sets        3   2.1%  ██       │
│  Two Pair   12   8.4%  ████     │
│  ...                            │
│                                 │
│  [Show Hand Grid ▼]             │
│  [Show Pie Chart ▼]             │
│                                 │
└─────────────────────────────────┘
```

**Mobile Adaptations:**
- Collapsible sections for grid and pie chart
- Card picker in bottom sheet/modal
- Simplified breakdown (fewer columns)
- Touch-friendly tap targets (44px minimum)

---

## 5. UI/UX Specifications

### 5.1 Visual Design

#### 5.1.1 Color Palette

Extends existing app palette:

| Element | Color | Token |
|---------|-------|-------|
| Background | #0a0a0a | bg-neutral-950 |
| Card BG | #171717 | bg-neutral-900 |
| Border | #262626 | border-neutral-800 |
| Text Primary | #fafafa | text-neutral-50 |
| Text Secondary | #a3a3a3 | text-neutral-400 |
| Accent | #0ea5e9 | text-sky-500 |

#### 5.1.2 Typography

| Element | Style |
|---------|-------|
| Section Headers | 14px semibold, uppercase, tracking-wide |
| Labels | 13px medium, neutral-400 |
| Values | 14px tabular-nums, neutral-50 |
| Combo Counts | 16px bold, tabular-nums |

#### 5.1.3 Spacing

| Element | Value |
|---------|-------|
| Section padding | 16px |
| Card gap | 16px |
| Grid gap | 8px |
| Button gap | 8px |

### 5.2 Interactions

#### 5.2.1 Board Input

| Action | Behavior |
|--------|----------|
| Click empty slot | Open card picker focused on that slot |
| Click filled slot | Remove card |
| Click card in picker | Add to next empty slot |
| Right-click card in picker | Quick-preview that card without adding |

#### 5.2.2 Hand Grid

| Action | Behavior |
|--------|----------|
| Hover cell | Show tooltip: "AKs: Top Pair (15 combos)" |
| Click cell (in Custom mode) | Toggle hand in/out of range |
| Click cell (in Preset mode) | Highlight all hands in same category |

#### 5.2.3 Breakdown Table

| Action | Behavior |
|--------|----------|
| Click row | Highlight hands in that category on grid |
| Hover row | Subtle highlight, cursor pointer |
| Click already-selected row | Clear highlight |

### 5.3 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Focus board slot 1-5 |
| `C` | Clear board |
| `R` | Random flop |
| `F` | Toggle action filter panel |
| `G` | Cycle grouping mode |
| `Esc` | Clear all highlights |

### 5.4 Loading & Empty States

#### 5.4.1 No Range Selected

```
┌─────────────────────────────────┐
│                                 │
│     Select a range to begin    │
│                                 │
│  Choose a preset scenario or    │
│  switch to Custom mode to       │
│  build your own range.          │
│                                 │
└─────────────────────────────────┘
```

#### 5.4.2 No Board Entered

```
┌─────────────────────────────────┐
│                                 │
│      Enter a board to analyze   │
│                                 │
│  Click cards below or type      │
│  AsKd7h to input a flop.        │
│                                 │
│       [Random Flop]             │
│                                 │
└─────────────────────────────────┘
```

#### 5.4.3 Calculating (if needed)

```
┌─────────────────────────────────┐
│                                 │
│         Analyzing...            │
│         ████████░░░░            │
│                                 │
└─────────────────────────────────┘
```

### 5.5 Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Invalid card input | "Invalid card: Xx. Use format: As, Kh, 7d" | Highlight input, show valid format |
| Duplicate card | "K♦ is already on the board" | Flash the existing card |
| No range data | "No range found for BTN vs-open MP" | Suggest similar ranges or custom mode |

### 5.6 Animations

| Element | Animation |
|---------|-----------|
| Card added to board | Scale 0.8→1.0, opacity 0→1 (150ms ease-out) |
| Card removed | Scale 1.0→0.8, opacity 1→0 (100ms ease-in) |
| Breakdown update | Bars animate width (200ms ease-out) |
| Pie chart update | Segments animate (300ms ease-out) |
| Grid highlight | Fade non-highlighted to 50% (150ms) |

---

## 6. Technical Architecture

### 6.1 State Management

```typescript
// src/stores/analyzerStore.ts

interface AnalyzerState {
  // Range source
  mode: 'preset' | 'custom'

  // Preset mode
  provider: Provider
  hero: Position
  scenario: Scenario
  villain: Position | null

  // Custom mode
  customRange: Map<string, Action>  // hand -> action

  // Board
  board: Card[]  // 0-5 cards

  // Filters
  showRaise: boolean
  showCall: boolean
  showFold: boolean

  // UI
  grouping: 'simple' | 'standard' | 'detailed'
  highlightedCategories: Set<HandCategory>
}

interface Card {
  rank: Rank  // 'A' | 'K' | ... | '2'
  suit: Suit  // 's' | 'h' | 'd' | 'c'
}

type HandCategory =
  | 'straight-flush' | 'quads' | 'full-house' | 'flush' | 'straight'
  | 'set' | 'trips' | 'two-pair-top' | 'two-pair-other'
  | 'overpair' | 'top-pair-tk' | 'top-pair-gk' | 'top-pair-wk'
  | 'second-pair' | 'low-pair' | 'underpair'
  | 'flush-draw' | 'oesd' | 'gutshot'
  | 'bdfd' | 'bdsd' | 'overcards' | 'air'
```

### 6.2 Core Functions

```typescript
// src/lib/analyzer/handEvaluator.ts

// Evaluate a specific 2-card hand + board
function evaluateHand(
  holeCards: [Card, Card],
  board: Card[]
): HandCategory

// src/lib/analyzer/comboCounter.ts

// Count combos for a hand considering card removal
function countCombos(
  hand: string,        // e.g., "AKs"
  board: Card[]
): number

// Enumerate all specific combos for a hand
function enumerateCombos(
  hand: string,        // e.g., "AKs"
  board: Card[]
): [Card, Card][]      // e.g., [[A♠,K♠], [A♥,K♥], [A♣,K♣]]

// src/lib/analyzer/rangeAnalyzer.ts

// Analyze entire range against board
function analyzeRange(
  range: Map<string, Action>,
  board: Card[],
  filters: { raise: boolean, call: boolean }
): AnalysisResult

interface AnalysisResult {
  totalCombos: number
  byCategory: Map<HandCategory, CategoryResult>
  byAction: Map<Action, number>
}

interface CategoryResult {
  combos: number
  percentage: number
  hands: string[]  // which hands fall in this category
}
```

### 6.3 Component Structure

```
src/components/analyze/
├── AnalyzerPage.tsx           # Main container
├── RangeSelector/
│   ├── RangeSelector.tsx      # Mode toggle + content
│   ├── PresetSelector.tsx     # Provider/position/scenario
│   └── CustomRangeEditor.tsx  # Click-to-select grid
├── BoardInput/
│   ├── BoardInput.tsx         # Main container
│   ├── BoardDisplay.tsx       # 5-card slot display
│   ├── CardPicker.tsx         # 52-card selection grid
│   └── BoardActions.tsx       # Clear/Random buttons
├── Analysis/
│   ├── BreakdownTable.tsx     # Category table
│   ├── BreakdownRow.tsx       # Single row with bar
│   ├── PieChart.tsx           # Recharts pie
│   └── ActionFilter.tsx       # Raise/Call checkboxes
└── shared/
    ├── Card.tsx               # Single card display
    └── CategoryBadge.tsx      # Colored category label
```

### 6.4 Data Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  Zustand Store  │
│  (analyzerStore)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Range Resolver │────▶│   getChart()    │
│  (preset/custom)│     │   (existing)    │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Range Analyzer │
│  (analyzeRange) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    UI Update    │
│ (table, chart)  │
└─────────────────┘
```

---

## 7. Edge Cases & Validation

### 7.1 Board Validation

| Case | Handling |
|------|----------|
| < 3 cards | Show "Enter flop to analyze" message |
| Duplicate card | Prevent selection, show error toast |
| Card in range but on board | Automatically remove from combo count |

### 7.2 Range Validation

| Case | Handling |
|------|----------|
| Empty range (all folds) | Show "Range is empty" message |
| No data for scenario | Show "No data available" with suggestion |
| All combos removed by board | Show "No combos remaining after card removal" |

### 7.3 Split Cell Handling

When cell is `['raise', 'call']`:

```typescript
// Default: 50/50 split
if (showRaise && showCall) {
  raiseWeight = 0.5
  callWeight = 0.5
} else if (showRaise) {
  raiseWeight = 1.0
  callWeight = 0.0
} else if (showCall) {
  raiseWeight = 0.0
  callWeight = 1.0
}
```

---

## 8. Future Considerations (v2+)

### 8.1 Range vs Range Mode

Compare two ranges side-by-side:

```
HERO RANGE                    VILLAIN RANGE
BTN vs Open (CO)             CO RFI
143 combos                    167 combos

Board: A♠K♦7♥

HERO BREAKDOWN               VILLAIN BREAKDOWN
Sets: 3 (2.1%)               Sets: 3 (1.8%)
Two Pair: 12 (8.4%)          Two Pair: 9 (5.4%)
...                          ...

EQUITY: Hero 54.2% | Villain 45.8%
```

### 8.2 Equity Calculation

Monte Carlo simulation for true equity:

- Sample N random runouts (default 10,000)
- Calculate win/tie/loss for each combo
- Display equity percentage with confidence interval

### 8.3 Turn/River Analysis

Show how equity changes across streets:

```
FLOP (A♠K♦7♥)     TURN (+Q♣)      RIVER (+2♦)
Equity: 62%        Equity: 58%      Equity: 100%
```

### 8.4 Save/Load Analyses

- Name and save specific board + range combinations
- "Favorites" for common study spots
- Export as image/text for sharing

### 8.5 Flop Texture Browser

Filter/browse by texture type:
- Monotone (3 suited)
- Two-tone (2 suited)
- Rainbow (3 suits)
- Paired
- Connected
- High/Medium/Low

---

## 9. Acceptance Criteria

### 9.1 MVP Launch Criteria

- [ ] User can select preset range (provider + position + scenario)
- [ ] User can input 3-5 board cards via click or keyboard
- [ ] Breakdown shows all categories with combo counts
- [ ] Card removal correctly reduces combo counts
- [ ] Pie chart visualizes distribution
- [ ] Action filters work (raise/call toggle)
- [ ] Grid highlights hands when category clicked
- [ ] Mobile responsive layout works
- [ ] Page loads in < 1 second
- [ ] No console errors

### 9.2 Quality Criteria

- [ ] Hand evaluator correctly categorizes all hand types
- [ ] Combo counts match manual verification (sample 10 hands)
- [ ] UI matches design specifications
- [ ] Keyboard shortcuts documented and functional
- [ ] Empty/error states display correctly

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | - | Initial draft |
