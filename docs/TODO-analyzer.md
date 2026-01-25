# Postflop Analyzer - Feature Roadmap

## Completed

- [x] **Basic Range Analysis** - Analyze how a range hits a board with category breakdown
- [x] **Side-by-Side Comparison** - Show OOP and IP ranges simultaneously
- [x] **Pot Type Selection** - SRP and 3bet pot scenarios
- [x] **Position Selection** - OOP/IP with postflop order validation
- [x] **Range Resolution** - Auto-slice ranges by action (call vs raise) based on scenario
- [x] **Board Input** - Click cards or use random buttons
- [x] **Breakdown Table** - Categories with combo counts, percentages, bars
- [x] **Pie Chart** - Visual distribution using Recharts
- [x] **Grouping Modes** - Simple, Standard, Detailed category grouping

---

## Phase 1: Quick Wins

### Hand Highlighting
Click a category row to highlight those hands in the grid. Other hands dim to 50% opacity. Click again to clear.

### Board Texture Labels
Auto-detect and display board characteristics:
- **Suit**: Monotone, Two-tone, Rainbow
- **Pairing**: Paired, Double-paired, Trips
- **Connectivity**: Connected, Gapped, Disconnected
- **Height**: High (A-T), Medium (9-6), Low (5-2)

### Combo Count Display
Show how card removal affects combos: "AK: 16 → 9 combos" when A or K is on board.

### Keyboard Shortcuts
- `R` - Random flop
- `T` - Add random turn
- `V` - Add random river
- `C` - Clear board
- `1-5` - Focus card slot
- `Esc` - Clear highlights

---

## Phase 2: Core Features

### Equity Calculation
Monte Carlo simulation for range vs range equity.
- Run in Web Worker to avoid UI blocking
- Show progress: "Calculating... 54.2%"
- Display: "OOP: 54.2% | IP: 45.8%"
- Target: 10,000 iterations in <3 seconds

### Range Advantage Indicator
Visual indicator showing who has the advantage:
- **Equity advantage**: Who wins more often
- **Nuts advantage**: Who has more strong hands (sets+, two pair+)
- **Nut draws**: Who has more flush draws, straight draws

### 4bet Pot Support
Add pot type for 4bet scenarios:
- Opener raises → Villain 3bets → Opener 4bets → Villain calls
- OOP range: vs-4bet (call)
- IP range: vs-3bet (raise = 4bet)

### Turn/River Analysis
Show how equity and range composition changes:
- Add turn card → recalculate
- Show delta: "OOP equity: 54% → 62% (+8%)"
- Highlight which hands improved/worsened

---

## Phase 3: Study Tools

### Save/Load Spots
Save specific scenarios for study review:
- Name the spot (e.g., "CO vs BTN SRP Ace-high flop")
- Save: pot type, positions, board, notes
- Load from dropdown or list view
- Store in localStorage

### Spot Library
Pre-built common study spots:
- "Dry ace-high flop SRP"
- "Wet low flop 3bet pot"
- "Monotone board"
- "Paired board"

### Notes & Annotations
Add text notes to saved spots:
- "OOP should check entire range here"
- "IP has significant nut advantage"

### Hand History Import
Paste a hand history, auto-populate:
- Positions
- Pot type (detect from actions)
- Board cards

---

## Phase 4: Advanced Analysis

### Blocker Analysis
Show how specific hands block opponent's range:
- "Holding A♠ blocks 12 combos of opponent's top pair"
- "K♠Q♠ blocks flush draws"

### Range vs Range Matrix
Grid showing equity of each hand vs opponent's range:
- Rows: Your hands
- Columns: Equity buckets (0-20%, 20-40%, etc.)
- Color-coded heatmap

### EV Estimation
Rough EV calculations for common actions:
- Bet X% pot with Y% equity = +/-EV
- Required fold equity for bluffs

### Multi-way Pots
Support for 3+ players:
- SRP with caller in middle
- Squeezed pots
- More complex but useful

---

## Phase 5: Polish & UX

### Mobile Layout
Responsive design for phone screens:
- Stack OOP/IP vertically
- Collapsible sections
- Bottom sheet for card picker
- Touch-friendly tap targets (44px+)

### Export Options
Share analysis results:
- **Image**: Screenshot with branding
- **Text**: Markdown-formatted breakdown
- **Link**: Shareable URL with encoded state

### Themes
Visual customization:
- Card styles (4-color deck option)
- Category colors
- Compact vs spacious layout

### Onboarding
First-time user experience:
- Tooltips explaining OOP/IP
- Example scenario walkthrough
- "Try it" prompts

---

## Technical Debt

### Performance
- [ ] Memoize hand evaluations
- [ ] Lazy load analyzer page (code splitting)
- [ ] Virtualize large lists if needed

### Testing
- [ ] Unit tests for hand evaluator
- [ ] Unit tests for range resolver
- [ ] Integration tests for equity calculation

### Code Quality
- [ ] Extract shared types to dedicated file
- [ ] Document range resolution logic
- [ ] Add error boundaries

---

## Ideas Backlog

- **Solver integration**: Import GTO+ or PioSolver ranges
- **HUD stats overlay**: Show how specific player deviates from GTO
- **Training mode**: Quiz user on range composition
- **Flop browser**: Filter/search flops by texture
- **Range builder**: Visual tool to create custom ranges
- **Comparison mode**: Compare two different board runouts
- **Session review**: Analyze multiple spots from a session
