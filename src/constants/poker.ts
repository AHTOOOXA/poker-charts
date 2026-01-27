import type { Action, Position } from '@/types/poker'

// Postflop position order (who acts first)
// SB acts first postflop, BTN acts last
export const POSTFLOP_ORDER: Position[] = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN']

// Background colors for each action (Tailwind classes)
export const ACTION_COLORS: Record<Action, string> = {
  fold: 'bg-neutral-800',
  call: 'bg-emerald-600',
  raise: 'bg-sky-600',
  allin: 'bg-rose-600',
}

// Text colors for each action (Tailwind classes)
export const ACTION_TEXT: Record<Action, string> = {
  fold: 'text-neutral-500',
  call: 'text-white',
  raise: 'text-white',
  allin: 'text-white',
}
