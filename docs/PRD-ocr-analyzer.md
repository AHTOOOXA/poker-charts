# PRD: OCR Poker Analyzer

**Status:** Draft
**Author:** Anton
**Date:** 2026-02-06

## Overview

A browser-based tool that extracts poker hand data from screenshots using OCR and provides instant range analysis. No backend, no account, no installation — paste a screenshot and get insights.

## Problem

1. **Range analysis friction** — Tools like Flopzilla require manual input of board, positions, and ranges. This takes 30-60 seconds per hand.
2. **Hand history access** — GGPoker (and similar sites) restrict hand history exports. Players often only have screenshots or replays.
3. **Note-taking burden** — Identifying exploitable player tendencies requires reviewing many hands. Manual review is tedious; automated pattern detection doesn't exist in a lightweight form.

## Solution

A client-side web app that:
1. Accepts poker table screenshots (paste, drag-drop, or file picker)
2. Extracts game state via OCR (board cards, positions, actions, stacks)
3. Displays Flopzilla-style range breakdown instantly
4. Optionally generates condensed player notes from unusual lines

## Target Users

- Online poker players (primarily GGPoker Rush & Cash)
- Players who want quick range analysis without manual data entry
- Players building reads on opponents without traditional HUD access

## Design Principles

1. **Zero friction** — Paste and see results. No login, no setup.
2. **Privacy-first** — All processing happens in-browser. No data leaves the device.
3. **Fast enough** — Analysis appears within 2 seconds of paste.
4. **Accurate enough** — Card recognition must be >99% accurate. Action OCR can tolerate ~95%.

---

## Features

### P0: Core OCR + Analysis

#### Screenshot Input
- Paste from clipboard (Cmd/Ctrl+V)
- Drag and drop image file
- File picker fallback
- Support PNG, JPG, WebP

#### Card Recognition
- Detect board cards (flop/turn/river) from table view
- Template matching against GGPoker card assets
- Output: `Card[]` (e.g., `[{rank: '7', suit: 's'}, {rank: '4', suit: 's'}, ...]`)

#### Position Detection
- Identify hero position from seat layout or action log
- Identify villain position(s) from action log
- Map to standard positions: UTG, MP, CO, BTN, SB, BB

#### Range Analysis Display
- Reuse existing `AnalyzerPage` components:
  - `HandGrid` — 13x13 range visualization
  - `BreakdownTable` — category breakdown (top pair, draws, air, etc.)
  - `BreakdownPieChart` — visual distribution
- Auto-select appropriate preflop ranges based on detected positions and action

### P1: Action Log Parsing

#### Street-by-Street Actions
- Parse the structured action log panel (bottom half of GGPoker screenshot)
- Extract per-street: `{player, position, action, amount}`
- Actions vocabulary (Russian): Рейз, Фолд, Колл, Ставка, Чек, Олл-ин

#### Pot Size Tracking
- Extract pot size from column headers
- Calculate SPR (stack-to-pot ratio) for analysis context

#### Stack Sizes
- Extract remaining stacks from table view or action results
- Enable SPR-aware analysis suggestions

### P2: Player Notes Generation

#### Unusual Line Detection
Flag hands containing:
- Limp-reraise (limp then raise over raise)
- Donk bet (OOP bet into PFR)
- Overbet (>pot sizing)
- Min-raise on river
- Check-raise flop → check-fold turn
- Cold 4bet from unusual position
- Open limp (non-SB/BB)

#### Note Output Format
Condensed, HUD-compatible format:
```
UTG limp-4bet KJo; R: 2x overbet w/ TP
BTN cold4b vs UTG open + MP 3b
```

#### Export
- Copy to clipboard (plain text)
- Future: Direct paste into PokerTracker/Hand2Note notes field

### P3: Enhancements

#### Multi-Language Support
- Russian (current GGPoker default)
- English
- Chinese (simplified)
- Auto-detect from screenshot

#### Hand History Text Input
- Alternative input: paste raw hand history text (when available)
- Parser for GGPoker HH format
- Same analysis output

#### Batch Processing
- Upload multiple screenshots
- Generate summary stats across hands
- Aggregate player notes

---

## Technical Architecture

### Stack
- **Framework:** React + Vite + TypeScript (existing poker-charts stack)
- **OCR:** Tesseract.js (WASM, runs in browser)
- **Image Processing:** OpenCV.js (WASM) for preprocessing
- **State:** Zustand (existing pattern)
- **Styling:** Tailwind + shadcn/ui (existing)

### Directory Structure
```
src/
├── components/
│   ├── ocr/
│   │   ├── OcrAnalyzerPage.tsx    # Main page
│   │   ├── ScreenshotInput.tsx    # Paste/drop/file input
│   │   ├── DetectionOverlay.tsx   # Visual feedback on detected regions
│   │   └── NotesOutput.tsx        # Generated player notes
│   └── analyze/                   # Existing - reuse
├── lib/
│   ├── ocr/
│   │   ├── imagePreprocessor.ts   # Crop, threshold, denoise
│   │   ├── cardDetector.ts        # Template matching for cards
│   │   ├── actionLogParser.ts     # OCR + parsing for action panel
│   │   ├── positionDetector.ts    # Position badge detection
│   │   └── tessaractWorker.ts     # Tesseract.js wrapper
│   ├── notes/
│   │   └── lineAnalyzer.ts        # Unusual line detection
│   └── analyzer/                  # Existing - reuse
├── assets/
│   └── card-templates/            # 52 reference card images (GGPoker theme)
└── types/
    └── ocr.ts                     # OCR-specific types
```

### Data Flow
```
Screenshot (paste/drop)
    │
    ▼
Canvas (load image)
    │
    ▼
Region Detection (OpenCV.js)
├── Board region → Card Detector (template match) → Card[]
├── Action log region → Tesseract.js → ActionLogParser → Action[]
└── Position badges → Color detection → Position[]
    │
    ▼
Hand State Builder
{
  board: Card[],
  players: Player[],
  streets: Street[],
  heroPosition: Position,
  villainPosition: Position
}
    │
    ├──────────────────────────────┐
    ▼                              ▼
Range Resolver              Line Analyzer
(existing)                  (new)
    │                              │
    ▼                              ▼
Range Analysis              Player Notes
(existing AnalyzerPage)     (text output)
```

### Performance Budget
| Operation | Target | Notes |
|-----------|--------|-------|
| Tesseract init (cold) | <3s | One-time, cached after |
| Tesseract init (warm) | <500ms | Worker reuse |
| Card template matching | <100ms | 52 templates, small regions |
| Action log OCR | <1s | Single region, preprocessed |
| Total paste-to-result | <2s | After initial load |

### Bundle Size Budget
| Dependency | Size | Lazy Load |
|------------|------|-----------|
| Tesseract.js core | ~800KB | Yes |
| Tesseract language data (rus+eng) | ~4MB | Yes, on first use |
| OpenCV.js | ~8MB | Yes |
| Card templates | ~200KB | Preload |

Lazy load strategy: OCR page loads core React immediately, then fetches WASM modules in background while user reads instructions.

---

## User Flow

### Happy Path
1. User navigates to `/ocr` (new route)
2. Sees paste target with instructions
3. Takes screenshot of GGPoker table (Snipping Tool / Cmd+Shift+4)
4. Pastes into browser (Ctrl/Cmd+V)
5. Sees loading indicator (~1-2s)
6. Board cards highlighted with detection overlay
7. Range analysis appears below (familiar Flopzilla-style breakdown)
8. (Optional) Clicks "Copy Notes" to get player note text

### Error States
- **No cards detected:** "Couldn't detect board cards. Make sure the table is visible."
- **Partial detection:** Show what was detected, highlight uncertain regions
- **Wrong poker client:** "This looks like PokerStars. Currently only GGPoker is supported."

---

## Open Questions

1. **Card template acquisition** — Need to screenshot each card from GGPoker. Automate or manual?
2. **Position detection reliability** — Color badges vs OCR of position text? Badges are faster but may vary by theme.
3. **Multi-table support** — Should we handle screenshots with multiple tables? (Probably no for v1)
4. **Hand history fallback** — If OCR fails, prompt user to paste HH text?

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Card detection accuracy | >99% |
| Action parsing accuracy | >95% |
| Time to analysis (warm) | <2s |
| User completes analysis flow | >80% of attempts |

---

## Milestones

### M1: Card Detection POC (1 week)
- [ ] Screenshot input (paste handler)
- [ ] Load image to canvas
- [ ] Manual card template capture (52 cards)
- [ ] Template matching implementation
- [ ] Display detected board cards

### M2: Integration with Existing Analyzer (1 week)
- [ ] Wire detected cards to `BoardInput`
- [ ] Auto-select ranges based on detected position (if parseable)
- [ ] Full analysis flow working end-to-end

### M3: Action Log OCR (2 weeks)
- [ ] Tesseract.js integration
- [ ] Action log region detection
- [ ] Russian text parsing
- [ ] Action sequence extraction
- [ ] Position detection from action log

### M4: Player Notes (1 week)
- [ ] Unusual line detection rules
- [ ] Note generation
- [ ] Copy to clipboard

### M5: Polish (1 week)
- [ ] Error handling and edge cases
- [ ] Loading states and progress indicators
- [ ] Mobile-friendly paste (if feasible)
- [ ] Documentation

---

## Non-Goals (v1)

- Real-time screen capture (requires native app)
- PokerStars / other client support
- Equity calculator
- GTO solver integration
- Account system / cloud storage
- Mobile app

---

## Appendix

### GGPoker Screenshot Regions

```
┌─────────────────────────────────────────────┐
│  Header: "Rush & Cash $0.05/$0.10 - #RC..." │
├─────────────────────────────────────────────┤
│                                             │
│              TABLE VIEW                     │
│   ┌──────────────────────────┐              │
│   │  Board Cards (5 slots)   │              │
│   └──────────────────────────┘              │
│                                             │
│  [Player 1]              [Player 2]         │
│   stack                   stack             │
│                                             │
├─────────────────────────────────────────────┤
│  ACTION LOG (structured columns)            │
│  ┌────────┬────────┬────────┬────────┬────┐ │
│  │Blinds  │Preflop │ Flop   │ Turn   │Rivr│ │
│  │        │ $X     │ $X     │ $X     │ $X │ │
│  ├────────┼────────┼────────┼────────┼────┤ │
│  │        │ UTG    │ UTG    │ UTG    │    │ │
│  │        │ Raise  │ Bet    │ Call   │    │ │
│  │        │ $0.20  │ $0.15  │ $0.64  │    │ │
│  │        │        │        │        │    │ │
│  └────────┴────────┴────────┴────────┴────┘ │
└─────────────────────────────────────────────┘
```

### Card Template Format
- 52 PNG files: `{rank}_{suit}.png` (e.g., `A_s.png`, `7_h.png`)
- Cropped to card face only (no background)
- Consistent dimensions (e.g., 40x56px)
- Captured from GGPoker client at 1x scale

### Russian Action Vocabulary
| Russian | English | Internal |
|---------|---------|----------|
| Рейз | Raise | `raise` |
| Фолд | Fold | `fold` |
| Колл | Call | `call` |
| Ставка | Bet | `bet` |
| Чек | Check | `check` |
| Олл-ин | All-in | `allin` |
| МБ | Small Blind | `sb` |
| ББ | Big Blind | `bb` |
