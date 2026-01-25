import type { Card, Rank } from '@/types/poker'
import { RANKS, SUITS } from '@/types/poker'

/**
 * Parse a hand name like "AKs", "AKo", or "AA" into its components
 */
export function parseHandName(hand: string): {
  rank1: Rank
  rank2: Rank
  type: 'pair' | 'suited' | 'offsuit'
} | null {
  if (hand.length < 2 || hand.length > 3) return null

  const rank1 = hand[0].toUpperCase() as Rank
  const rank2 = hand[1].toUpperCase() as Rank

  if (!RANKS.includes(rank1) || !RANKS.includes(rank2)) return null

  if (hand.length === 2) {
    // Pocket pair (e.g., "AA")
    if (rank1 !== rank2) return null
    return { rank1, rank2, type: 'pair' }
  }

  const suffix = hand[2].toLowerCase()
  if (suffix === 's') {
    return { rank1, rank2, type: 'suited' }
  } else if (suffix === 'o') {
    return { rank1, rank2, type: 'offsuit' }
  }

  return null
}

/**
 * Generate all specific card combinations for a hand
 */
export function enumerateCombos(hand: string): [Card, Card][] {
  const parsed = parseHandName(hand)
  if (!parsed) return []

  const { rank1, rank2, type } = parsed
  const combos: [Card, Card][] = []

  if (type === 'pair') {
    // 6 combinations for pairs: choose 2 suits from 4
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        combos.push([
          { rank: rank1, suit: SUITS[i] },
          { rank: rank2, suit: SUITS[j] },
        ])
      }
    }
  } else if (type === 'suited') {
    // 4 combinations for suited: same suit for both cards
    for (const suit of SUITS) {
      combos.push([
        { rank: rank1, suit },
        { rank: rank2, suit },
      ])
    }
  } else {
    // 12 combinations for offsuit: different suits
    for (const suit1 of SUITS) {
      for (const suit2 of SUITS) {
        if (suit1 !== suit2) {
          combos.push([
            { rank: rank1, suit: suit1 },
            { rank: rank2, suit: suit2 },
          ])
        }
      }
    }
  }

  return combos
}

/**
 * Check if a card is blocked by the board
 */
function isCardBlocked(card: Card, board: Card[]): boolean {
  return board.some((b) => b.rank === card.rank && b.suit === card.suit)
}

/**
 * Get available combos for a hand after removing board blockers
 */
export function getAvailableCombos(hand: string, board: Card[]): [Card, Card][] {
  const allCombos = enumerateCombos(hand)

  return allCombos.filter(([card1, card2]) => {
    return !isCardBlocked(card1, board) && !isCardBlocked(card2, board)
  })
}

/**
 * Count available combos for a hand after removing board blockers
 */
export function countCombos(hand: string, board: Card[]): number {
  return getAvailableCombos(hand, board).length
}

/**
 * Get base combo count for a hand type (without blockers)
 */
export function getBaseCombos(hand: string): number {
  const parsed = parseHandName(hand)
  if (!parsed) return 0

  switch (parsed.type) {
    case 'pair':
      return 6
    case 'suited':
      return 4
    case 'offsuit':
      return 12
  }
}

/**
 * Calculate how many combos are removed by the board
 */
export function getRemovedCombos(hand: string, board: Card[]): number {
  return getBaseCombos(hand) - countCombos(hand, board)
}
