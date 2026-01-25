# Poker Lab - Refactoring Plan

## Rename: poker-charts → poker-lab

### Files to Update

| File | Change |
|------|--------|
| `package.json` | `"name": "poker-lab"` |
| `index.html` | `<title>Poker Lab</title>` |
| `src/App.tsx` | Header text → "Poker Lab" |
| `src/stores/chartStore.ts` | localStorage key: `'poker-lab'` (add migration from old key) |
| `ROADMAP.md` | Update title |
| Vercel | Update project name if needed |

### localStorage Migration

```typescript
// In chartStore.ts - migrate old key to new
const OLD_KEY = 'poker-chart'
const NEW_KEY = 'poker-lab'

if (localStorage.getItem(OLD_KEY) && !localStorage.getItem(NEW_KEY)) {
  localStorage.setItem(NEW_KEY, localStorage.getItem(OLD_KEY)!)
  localStorage.removeItem(OLD_KEY)
}
```

---

## Tab Renaming

| Current | New | Notes |
|---------|-----|-------|
| Charts | **Ranges** | More accurate term |
| Leaderboard | **Players** | Broader scope |
| Transcribe | **Editor** | Clearer purpose |
| *(new)* | **Trainer** | Preflop quiz |

---

## New Feature: Preflop Trainer

### Core Concept

Quiz mode that tests preflop decisions using existing chart data.

### User Flow

1. **Setup Screen**
   - Select provider (Pekarstas, Greenline, GTOWizard)
   - Select scenario type (RFI, vs-open, vs-3bet, etc.)
   - Select positions to train (all, or specific like BTN/CO)
   - Optional: timed mode toggle

2. **Quiz Screen**
   - Display: Position badge + Hand (e.g., "CO" + "AJo")
   - Four buttons: Fold / Call / Raise / All-in
   - Keyboard shortcuts: F / C / R / A (same as Editor)

3. **Answer Reveal**
   - Show correct action with color
   - Show if user was correct (green check / red x)
   - Optional: show mini hand grid with hand highlighted
   - "Next" button or auto-advance

4. **Session Summary**
   - Total: 47/50 correct (94%)
   - Breakdown by position
   - Most missed hands list
   - Option to retry missed hands only

### Data Model

```typescript
interface TrainerSession {
  id: string
  startedAt: Date
  provider: string
  scenario: string
  positions: Position[]
  questions: TrainerQuestion[]
}

interface TrainerQuestion {
  position: Position
  hand: string // e.g., "AKs"
  correctAction: Action
  userAnswer: Action | null
  answeredAt: Date | null
  timeMs: number | null // if timed mode
}

interface TrainerStats {
  totalQuestions: number
  correctAnswers: number
  byPosition: Record<Position, { total: number; correct: number }>
  mostMissed: Array<{ hand: string; position: Position; missCount: number }>
}
```

### Store Addition

```typescript
// src/stores/trainerStore.ts
interface TrainerState {
  // Settings
  provider: string
  scenario: string
  positions: Position[]
  timedMode: boolean

  // Current session
  session: TrainerSession | null
  currentIndex: number

  // History
  stats: TrainerStats

  // Actions
  startSession: () => void
  answerQuestion: (action: Action) => void
  nextQuestion: () => void
  endSession: () => void
}
```

### Components

```
src/components/trainer/
├── TrainerPage.tsx        # Main container with setup/quiz/summary views
├── TrainerSetup.tsx       # Provider, scenario, position selection
├── TrainerQuiz.tsx        # Question display + answer buttons
├── TrainerResult.tsx      # Single answer feedback
├── TrainerSummary.tsx     # End of session stats
└── TrainerStats.tsx       # Historical performance (optional)
```

### UI/UX Details

- Large, centered hand display (e.g., big "KQs" text)
- Position badge with color (same colors as Ranges tab)
- Answer buttons in a row, keyboard accessible
- Progress bar showing question X of Y
- Streak counter for motivation (🔥 5 in a row!)

### Question Generation

```typescript
function generateQuestions(
  provider: string,
  scenario: string,
  positions: Position[],
  count: number = 50
): TrainerQuestion[] {
  // 1. Get chart data for provider/scenario
  // 2. For each position, collect hands with non-fold actions
  // 3. Weight towards hands with mixed strategies (harder)
  // 4. Randomly select `count` hands
  // 5. Shuffle order
}
```

### Edge Cases

- **Mixed strategies**: If chart shows "raise 70% / fold 30%", accept either as correct but show the primary action
- **Split cells**: Handle hands that have multiple valid actions
- **Empty scenarios**: Skip positions with no chart data

### Future Enhancements (v2)

- [ ] Spaced repetition for missed hands
- [ ] Leaderboard for trainer scores
- [ ] Custom hand sets (practice specific hands)
- [ ] Villain-aware training (vs UTG open from BB, etc.)
- [ ] Export missed hands to study list
