# PRD: OCR Hand History → Player Notes

**Status:** Draft
**Author:** Anton
**Date:** 2026-02-06

## Overview

A browser-based tool that converts poker hand history screenshots into short, actionable player notes using OCR + LLM. No backend, no account — paste a screenshot, get a note ready to copy into your HUD or poker room.

## Problem

1. **Hand history access** — GGPoker (and similar sites) restrict hand history exports. Players often only have screenshots or replays. Text is not selectable/copyable.
2. **Note-taking burden** — Identifying exploitable player tendencies requires reviewing many hands. Manual review is tedious. Writing good concise notes is a skill most players lack.
3. **Pattern recognition is hard** — Subtle tells (overcalling, sizing patterns, out-of-line actions, bluff frequency) require experienced analysis. Rule-based detection only catches obvious patterns; an LLM can read the full hand story and extract nuanced reads.

## Solution

A client-side web app that:
1. Accepts hand history screenshots (paste, drag-drop, or file picker)
2. Extracts hand history text via OCR (Tesseract.js, in-browser)
3. Sends parsed hand to a public LLM API (Gemini Flash, browser-direct) to generate a condensed player note
4. Outputs a short, HUD-compatible note ready to copy-paste

## Target Users

- Online poker players (primarily GGPoker Rush & Cash)
- Players building reads on opponents without traditional HUD access
- Players who want to quickly convert hand replays into lasting notes

## Design Principles

1. **Zero friction** — Paste and see a note. One-time API key setup.
2. **Fast enough** — Note appears within 3-4 seconds of paste (OCR ~1-2s + LLM ~1-2s).
3. **Useful notes** — LLM produces notes a winning player would actually write. Focus on exploitable tendencies, not hand summaries.

---

## Features

### P0: Screenshot → OCR → Player Note

#### Screenshot Input
- Paste from clipboard (Cmd/Ctrl+V)
- Drag and drop image file
- File picker fallback
- Support PNG, JPG, WebP

#### OCR Extraction
- Tesseract.js (WASM, in-browser) extracts text from hand history screenshot
- Image preprocessing: crop, threshold, denoise for better OCR accuracy
- Primary target: GGPoker hand replay view (structured action log columns)
- Actions vocabulary (Russian): Рейз, Фолд, Колл, Ставка, Чек, Олл-ин

#### LLM Note Generation
- Send extracted hand history text to LLM API (browser-direct)
- Default provider: Google Gemini Flash (free tier, 15 RPM, native browser CORS)
- System prompt instructs LLM to produce short, HUD-compatible player notes
- Focus areas: overcalling, bluff capability, out-of-line actions, unusual sizings, exploitable tendencies
- LLM sees full hand context and can identify subtle patterns a rule engine would miss

#### Note Output
Condensed, HUD-compatible format (max ~100 chars):
```
UTG limp-4bet KJo; river 2x overbet w/ TP — spewy
BTN cold4b vs UTG open + MP 3b — narrow value only
BB call 3b OOP w/ K9o then donk flop — wide rec, stab happy
CO min-raise river after x/c x/c — likely thin value, not bluffing
```
- Copy to clipboard (one click)
- Append mode: add notes for same player across multiple hands

#### API Key Management
- User provides their own Gemini API key (one-time setup)
- Stored in localStorage (same pattern as existing Zustand persistence)
- Settings panel to enter/update/remove key
- Clear indicator when key is missing or invalid
- Future: support OpenRouter, Groq, OpenAI as alternative providers

### P1: Enhanced OCR

#### Card Recognition
- Template matching against GGPoker card assets for board card detection
- Output: `Card[]` for context-enriched LLM prompts
- 52 PNG templates captured from GGPoker client

#### Position Detection
- Identify hero/villain positions from action log text or seat layout
- Map to standard positions: UTG, MP, CO, BTN, SB, BB

#### Stack & Pot Tracking
- Extract pot sizes from column headers
- Extract stack sizes from table view
- Provides SPR context to LLM for better note quality

### P2: Range Analysis Integration

#### Range Analysis Display
- Reuse existing `AnalyzerPage` components:
  - `HandGrid` — 13x13 range visualization
  - `BreakdownTable` — category breakdown (top pair, draws, air, etc.)
  - `BreakdownPieChart` — visual distribution
- Auto-select appropriate preflop ranges based on detected positions and action

### P3: Enhancements

#### Multi-Language Support
- Russian (current GGPoker default)
- English
- Chinese (simplified)
- Auto-detect from screenshot

#### Batch Processing
- Upload multiple screenshots from same session
- Generate aggregated player profile across hands
- Combine notes into summary read per player

#### Alternative LLM Providers
- OpenRouter (access to Claude, GPT-4, Llama, etc.)
- Groq (fast, free tier, Llama/Mixtral)
- OpenAI (GPT-4o-mini)
- Provider picker in settings

---

## Technical Architecture

### Stack
- **Framework:** React + Vite + TypeScript (existing poker-charts stack)
- **OCR:** Tesseract.js (WASM, runs in browser)
- **Image Processing:** OpenCV.js (WASM) for preprocessing
- **LLM:** Google Gemini Flash API (browser-direct)
- **State:** Zustand (existing pattern)
- **Styling:** Tailwind + shadcn/ui (existing)

### LLM Integration
**Why Gemini Flash:**
- Native browser CORS support
- Free tier: 15 requests/minute, sufficient for hand-by-hand analysis
- Fast (~1-2s response for short completions)
- Good instruction-following for structured output

**API call from browser:**
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 150 }
    })
  }
)
```

**System prompt (draft):**
```
You are an expert poker note-taker. Given a hand history, generate a SHORT
player note (max 100 chars) about the villain. Focus ONLY on exploitable
tendencies and unusual actions:
- Overcalling (calling too wide, especially OOP)
- Bluff capability (does villain bluff? at what frequency/spots?)
- Out-of-line actions (donk bets, limp-reraise, cold 4bet, min-raise river)
- Sizing tells (overbets, min-bets, non-standard sizing)
- Positional leaks (open limp, cold call from SB, etc.)

Format: "<position> <concise action>; <read>"
Output ONLY the note, no explanation. If nothing notable, output "standard line".
```

### Directory Structure
```
src/
├── components/
│   ├── notes/
│   │   ├── NotesPage.tsx           # Main page
│   │   ├── ScreenshotInput.tsx     # Paste/drop/file input
│   │   ├── OcrPreview.tsx          # Show OCR'd text, let user verify/edit
│   │   ├── NoteResult.tsx          # Generated note + copy button
│   │   └── ApiKeySettings.tsx      # API key input + provider config
│   └── analyze/                    # Existing - reuse (P2)
├── lib/
│   ├── ocr/
│   │   ├── imagePreprocessor.ts    # Crop, threshold, denoise
│   │   ├── tesseractWorker.ts      # Tesseract.js wrapper
│   │   └── cardDetector.ts         # Template matching for cards (P1)
│   ├── llm/
│   │   ├── geminiClient.ts         # Gemini Flash API client
│   │   ├── notePrompt.ts           # System prompt + few-shot examples
│   │   └── providers.ts            # Provider abstraction (future)
│   └── analyzer/                   # Existing - reuse
├── assets/
│   └── card-templates/             # 52 reference card images (P1)
└── types/
    └── ocr.ts                      # OCR + notes types
```

### Data Flow
```
Screenshot (paste/drop)
    │
    ▼
Canvas (load image)
    │
    ▼
Image Preprocessing (OpenCV.js)
├── Crop to action log region
├── Threshold + denoise
    │
    ▼
Tesseract.js OCR
    │
    ▼
Raw Hand History Text
    │
    ├─── Display in OcrPreview (user can verify/edit)
    │
    ▼
Gemini Flash API (browser-direct)
    │
    ▼
Player Note (short text)
    │
    ▼
NoteResult → Copy to Clipboard
```

### Performance Budget
| Operation | Target | Notes |
|-----------|--------|-------|
| Tesseract init (cold) | <3s | One-time, cached after |
| Tesseract init (warm) | <500ms | Worker reuse |
| Image preprocessing | <200ms | Crop + threshold |
| Action log OCR | <1s | Single region, preprocessed |
| LLM API call | <2s | Gemini Flash, ~150 tokens out |
| **Total paste-to-note** | **<4s** | **After initial load** |

### Bundle Size Budget
| Dependency | Size | Lazy Load |
|------------|------|-----------|
| Tesseract.js core | ~800KB | Yes |
| Tesseract language data (rus+eng) | ~4MB | Yes, on first use |
| OpenCV.js | ~8MB | Yes |
| Card templates (P1) | ~200KB | Preload |

Lazy load strategy: Notes page loads core React immediately, then fetches WASM modules in background while user reads instructions / enters API key.

---

## User Flow

### First Time Setup
1. User navigates to `/notes` (new route)
2. Sees prompt to enter Gemini API key (link to Google AI Studio to get free key)
3. Enters key, stored in localStorage
4. WASM modules begin loading in background

### Happy Path
1. User takes screenshot of GGPoker hand replay (Snipping Tool / Cmd+Shift+4)
2. Pastes into browser (Ctrl/Cmd+V)
3. Sees OCR processing indicator (~1-2s)
4. OCR'd hand history text appears in preview panel (editable, user can fix OCR errors)
5. LLM generates player note (~1-2s)
6. Note appears with "Copy" button
7. User clicks Copy, pastes into HUD/poker room
8. User pastes next screenshot (repeat)

### Error States
- **No text detected:** "Couldn't extract text. Make sure the hand history is visible and readable."
- **Partial OCR:** Show what was extracted, user can edit before sending to LLM
- **No API key:** Prompt to enter key with link to Google AI Studio
- **API key invalid / quota exceeded:** Clear error message with guidance
- **LLM rate limit:** "Rate limited. Wait a moment and try again." (15 RPM free tier)

---

## Open Questions

1. **OCR accuracy on GGPoker replay** — How well does Tesseract handle the GGPoker action log font? May need aggressive preprocessing (high contrast, binarization). Need to test with real screenshots.
2. **LLM prompt tuning** — The system prompt needs iteration with real hands. Few-shot examples will be critical for consistent note quality and format.
3. **Multi-hand aggregation** — When user pastes multiple hands from same villain, should notes auto-merge? Or append with hand # prefix?
4. **Card template acquisition** — Need to screenshot each card from GGPoker for P1 card detection. Automate or manual?
5. **Alternative LLM fallback** — If Gemini is down or user prefers another provider, how seamless should switching be?

---

## Success Metrics

| Metric | Target |
|--------|--------|
| OCR text extraction accuracy | >90% (readable enough for LLM) |
| Note usefulness | Player would actually save the note |
| Time to note (warm) | <4s |
| User completes full flow | >80% of attempts |

---

## Milestones

### M1: OCR + LLM Pipeline POC (1 week)
- [ ] Screenshot input (paste handler)
- [ ] Load image to canvas
- [ ] Tesseract.js integration (WASM, lazy loaded)
- [ ] Image preprocessing (crop, binarize, denoise)
- [ ] OCR'd text preview (editable)
- [ ] Gemini Flash API client (browser-direct)
- [ ] API key settings (localStorage)
- [ ] System prompt with few-shot examples
- [ ] Note output + copy to clipboard
- [ ] End-to-end: paste screenshot → see note

### M2: OCR Quality (1 week)
- [ ] Test with real GGPoker hand replay screenshots
- [ ] Tune preprocessing for GGPoker fonts (threshold, contrast)
- [ ] Region detection for action log area (avoid table graphics noise)
- [ ] Russian + English language data
- [ ] Handle multiple screenshot formats/resolutions

### M3: LLM Prompt Tuning (1 week)
- [ ] Collect 20+ real hand examples with ideal notes
- [ ] Iterate system prompt for consistency
- [ ] Add few-shot examples covering: overcalling, bluff spots, sizing tells, positional leaks, passive play, aggro lines
- [ ] Ensure output stays within ~100 char limit
- [ ] Handle edge cases: standard lines, multiway pots, all-in preflop

### M4: Card Detection + Range Analysis (1 week)
- [ ] Manual card template capture (52 cards)
- [ ] Template matching for board cards
- [ ] Wire detected cards to existing `AnalyzerPage`
- [ ] Position detection from OCR'd action log
- [ ] Auto-select ranges based on detected positions

### M5: Polish (1 week)
- [ ] Error handling and edge cases
- [ ] Loading states and progress indicators
- [ ] Note history (localStorage, recent notes list)
- [ ] Multi-hand notes for same player (append mode)
- [ ] Alternative LLM provider support

---

## Non-Goals (v1)

- Real-time screen capture (requires native app)
- PokerStars / other client support
- Account system / cloud storage
- Self-hosted LLM (quality too low for useful notes)
- Mobile app
- GTO solver integration

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
