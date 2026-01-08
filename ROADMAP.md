# Poker Charts Roadmap

## Phase 1: Core Grid Component

### 1.1 Hand Grid UI
- [ ] Create 13x13 grid component (`HandGrid.tsx`)
- [ ] Create individual cell component (`Cell.tsx`)
- [ ] Display hand labels (AA, AKs, AKo, etc.)
- [ ] Proper grid layout with CSS Grid
- [ ] Distinguish pairs / suited / offsuit visually

### 1.2 Basic Interactivity
- [ ] Hover states showing hand details
- [ ] Click to select/deselect hands
- [ ] Shift+click for range selection
- [ ] Clear selection button

## Phase 2: Range Data Model

### 2.1 Range Schema
- [ ] Define TypeScript types for ranges
- [ ] JSON schema for range files
- [ ] Example structure:
  ```typescript
  type Range = {
    id: string
    name: string
    position: Position
    situation: string // "RFI", "vs 3bet", etc.
    hands: Record<Hand, Action | ActionFrequency>
  }
  ```

### 2.2 Preloaded Ranges
- [ ] Create default RFI ranges per position
- [ ] 3-bet ranges
- [ ] Calling ranges
- [ ] Store in `src/data/ranges/`

## Phase 3: Position & Situation Selector

### 3.1 Position Tabs
- [ ] Add shadcn Tabs component
- [ ] Switch between UTG/MP/CO/BTN/SB/BB
- [ ] Persist selected position to store

### 3.2 Situation Dropdown
- [ ] RFI (Raise First In)
- [ ] vs Open (facing open raise)
- [ ] vs 3-bet
- [ ] vs 4-bet
- [ ] Dynamic based on position context

## Phase 4: Action Colors & Legend

### 4.1 Color Scheme
- [ ] Define poker-specific color palette
  - Fold: gray
  - Call: green
  - Raise/3-bet: red/orange
  - All-in: purple
- [ ] Add to Tailwind theme or CSS variables

### 4.2 Legend Component
- [ ] Display action colors
- [ ] Show hand count per action
- [ ] Percentage of range

## Phase 5: Range Editor

### 5.1 Edit Mode
- [ ] Toggle between view/edit modes
- [ ] Select action brush (fold/call/raise)
- [ ] Paint cells with selected action
- [ ] Undo/redo support

### 5.2 Range Operations
- [ ] Import range from text (PokerStove format)
- [ ] Export range to text
- [ ] Copy range to clipboard
- [ ] Duplicate range

## Phase 6: Persistence & Sharing

### 6.1 Local Storage
- [ ] Save custom ranges to localStorage
- [ ] List saved ranges
- [ ] Delete/rename ranges

### 6.2 URL Sharing
- [ ] Encode range in URL params
- [ ] Shareable links
- [ ] QR code generation (optional)

## Phase 7: Dark Theme & Polish

### 7.1 Poker-Optimized Dark Theme
- [ ] Dark green felt background
- [ ] High contrast hand labels
- [ ] Subtle grid lines
- [ ] Card suit colors (optional)

### 7.2 Responsive Design
- [ ] Mobile-friendly grid scaling
- [ ] Touch interactions
- [ ] Landscape orientation lock hint

## Phase 8: Advanced Features (Future)

### 8.1 Equity Calculator Integration
- [ ] Hand vs range equity
- [ ] Range vs range comparison

### 8.2 GTO Approximations
- [ ] Mixed strategy display (frequencies)
- [ ] Gradient cells for mixed actions

### 8.3 Session Tracker
- [ ] Track hands played
- [ ] Compare to chart
- [ ] Deviation analysis

---

## Quick Wins (Start Here)

1. **HandGrid.tsx** - Get the 13x13 grid rendering
2. **Cell.tsx** - Basic cell with hand label
3. **Add shadcn Button & Tabs** - Position selector
4. **Wire up Zustand** - Position state already done
5. **Static range data** - One JSON file with BTN RFI range

## Tech Decisions to Make

- [ ] Routing? (React Router vs TanStack Router vs none)
- [ ] Range format? (simple array vs frequency map)
- [ ] Mobile-first or desktop-first?
- [ ] Import existing range libraries or build from scratch?
