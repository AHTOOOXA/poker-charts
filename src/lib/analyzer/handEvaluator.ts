import type { Card, HandCategory, Rank, Suit } from '@/types/poker'
import { RANKS } from '@/types/poker'

// Rank values for comparison (A=14, K=13, ..., 2=2)
const RANK_VALUES: Record<Rank, number> = {
  A: 14, K: 13, Q: 12, J: 11, T: 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
}

function getRankValue(rank: Rank): number {
  return RANK_VALUES[rank]
}

function sortByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))
}

// Count occurrences of each rank
function countRanks(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>()
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
  }
  return counts
}

// Count occurrences of each suit
function countSuits(cards: Card[]): Map<Suit, number> {
  const counts = new Map<Suit, number>()
  for (const card of cards) {
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1)
  }
  return counts
}

// Check if cards form a straight (returns highest card rank value if true)
function getStraightHighCard(cards: Card[]): number | null {
  const uniqueRanks = [...new Set(cards.map((c) => getRankValue(c.rank)))]
  uniqueRanks.sort((a, b) => b - a)

  // Check for wheel (A-2-3-4-5)
  if (
    uniqueRanks.includes(14) &&
    uniqueRanks.includes(2) &&
    uniqueRanks.includes(3) &&
    uniqueRanks.includes(4) &&
    uniqueRanks.includes(5)
  ) {
    return 5 // Wheel, 5-high straight
  }

  // Check for regular straights
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      return uniqueRanks[i]
    }
  }

  return null
}

// Check if cards form a flush (returns suit if true)
function getFlushSuit(cards: Card[]): Suit | null {
  const suitCounts = countSuits(cards)
  for (const [suit, count] of suitCounts) {
    if (count >= 5) return suit
  }
  return null
}

// Check for straight flush
function hasStraightFlush(cards: Card[]): boolean {
  const flushSuit = getFlushSuit(cards)
  if (!flushSuit) return false

  const flushCards = cards.filter((c) => c.suit === flushSuit)
  return getStraightHighCard(flushCards) !== null
}

// Count draws (flush draw, OESD, gutshot)
function countFlushDrawOuts(cards: Card[]): number {
  const suitCounts = countSuits(cards)
  for (const [, count] of suitCounts) {
    if (count === 4) return 9 // Flush draw
  }
  return 0
}

// Check for straight draws
function getStraightDrawType(
  holeCards: Card[],
  board: Card[]
): 'oesd' | 'gutshot' | null {
  const allCards = [...holeCards, ...board]
  const uniqueRanks = [...new Set(allCards.map((c) => getRankValue(c.rank)))]
  uniqueRanks.sort((a, b) => b - a)

  // Need at least one hole card to contribute to the draw
  const holeRanks = new Set(holeCards.map((c) => getRankValue(c.rank)))

  // Check for OESD (open-ended straight draw - 8 outs)
  // Need 4 consecutive cards with gaps on both ends
  for (let high = 14; high >= 5; high--) {
    const needed = [high, high - 1, high - 2, high - 3]
    const have = needed.filter((r) => uniqueRanks.includes(r))

    if (have.length === 4) {
      // Check if it's open-ended (can complete on both sides)
      const canCompleteHigh = high < 14 && !uniqueRanks.includes(high + 1)
      const canCompleteLow = high - 4 >= 1 && !uniqueRanks.includes(high - 4)

      // Make sure at least one hole card contributes
      const holeContributes = needed.some((r) => holeRanks.has(r))

      if (canCompleteHigh && canCompleteLow && holeContributes) {
        return 'oesd'
      }
    }
  }

  // Check for wheel draw (A-2-3-4 or 2-3-4-5)
  if (uniqueRanks.includes(14)) {
    const wheelCards = [14, 2, 3, 4, 5].filter((r) => uniqueRanks.includes(r))
    if (wheelCards.length === 4) {
      const holeContributes = [14, 2, 3, 4, 5].some((r) => holeRanks.has(r))
      if (holeContributes) {
        // If missing 5 or A, it's OESD; if missing 2,3,4, it's gutshot
        const missing = [14, 2, 3, 4, 5].find((r) => !uniqueRanks.includes(r))
        if (missing === 5 || missing === 14) return 'oesd'
        return 'gutshot'
      }
    }
  }

  // Check for gutshot (inside straight draw - 4 outs)
  for (let high = 14; high >= 5; high--) {
    const straightCards = [high, high - 1, high - 2, high - 3, high - 4]
    const have = straightCards.filter((r) => uniqueRanks.includes(r))

    if (have.length === 4) {
      // Make sure at least one hole card contributes
      const holeContributes = straightCards.some((r) => holeRanks.has(r))
      if (holeContributes) {
        return 'gutshot'
      }
    }
  }

  return null
}

/**
 * Evaluate a 2-card hole hand against a board and categorize it
 */
export function evaluateHand(
  holeCards: [Card, Card],
  board: Card[]
): HandCategory {
  if (board.length < 3) {
    throw new Error('Board must have at least 3 cards')
  }

  const allCards = [...holeCards, ...board]
  const rankCounts = countRanks(allCards)
  const boardRanks = sortByRankDesc(board).map((c) => getRankValue(c.rank))
  const holeRanks = holeCards.map((c) => getRankValue(c.rank)).sort((a, b) => b - a)

  // Check for made hands first (strongest to weakest)

  // Straight flush
  if (hasStraightFlush(allCards)) {
    return 'straight-flush'
  }

  // Quads
  for (const [, count] of rankCounts) {
    if (count === 4) return 'quads'
  }

  // Full house
  let hasThreeOfKind = false
  let hasPair = false
  for (const [, count] of rankCounts) {
    if (count >= 3) hasThreeOfKind = true
    if (count >= 2) hasPair = true
  }
  if (hasThreeOfKind && hasPair) {
    // Need to check we have at least 3+2
    const counts = [...rankCounts.values()].sort((a, b) => b - a)
    if (counts[0] >= 3 && counts[1] >= 2) {
      return 'full-house'
    }
  }

  // Flush
  if (getFlushSuit(allCards)) {
    return 'flush'
  }

  // Straight
  if (getStraightHighCard(allCards)) {
    return 'straight'
  }

  // Three of a kind (set vs trips)
  for (const [rank, count] of rankCounts) {
    if (count === 3) {
      // Set: pocket pair hit the board
      if (holeRanks[0] === holeRanks[1] && getRankValue(holeCards[0].rank) === getRankValue(rank as unknown as Rank)) {
        return 'set'
      }
      // Trips: board pair + one hole card
      return 'trips'
    }
  }

  // Two pair
  const pairs: number[] = []
  for (const [rank, count] of rankCounts) {
    if (count === 2) {
      pairs.push(RANK_VALUES[rank])
    }
  }
  if (pairs.length >= 2) {
    return 'two-pair'
  }

  // One pair
  if (pairs.length === 1) {
    const pairRank = pairs[0]
    const topBoardRank = boardRanks[0]
    const secondBoardRank = boardRanks[1]
    const thirdBoardRank = boardRanks[2]

    // Check if pair involves a hole card
    const holeInPair = holeRanks.includes(pairRank)

    if (!holeInPair) {
      // Board pair - check if we have overpair
      if (holeRanks[0] === holeRanks[1] && holeRanks[0] > topBoardRank) {
        return 'overpair'
      }
      // Board pair but we have underpair
      if (holeRanks[0] === holeRanks[1]) {
        return 'underpair'
      }
      // No pair for us, this will be handled as draws/air
    } else {
      // We paired a hole card with the board
      if (pairRank === topBoardRank) {
        return 'top-pair'
      }
      if (pairRank === secondBoardRank) {
        return 'second-pair'
      }
      if (pairRank === thirdBoardRank || pairRank < thirdBoardRank) {
        return 'low-pair'
      }
    }
  }

  // Pocket pair below the board
  if (holeRanks[0] === holeRanks[1]) {
    const topBoardRank = boardRanks[0]
    if (holeRanks[0] > topBoardRank) {
      return 'overpair'
    }
    return 'underpair'
  }

  // Drawing hands
  const flushOuts = countFlushDrawOuts(allCards)
  if (flushOuts > 0) {
    return 'flush-draw'
  }

  const straightDraw = getStraightDrawType(holeCards, board)
  if (straightDraw === 'oesd') {
    return 'oesd'
  }
  if (straightDraw === 'gutshot') {
    return 'gutshot'
  }

  // Overcards (both hole cards above top board card)
  const topBoardRank = boardRanks[0]
  if (holeRanks[0] > topBoardRank && holeRanks[1] > topBoardRank) {
    return 'overcards'
  }

  // Air
  return 'air'
}

/**
 * Parse a card string like "As" or "Kh" into a Card object
 */
export function parseCard(str: string): Card | null {
  if (str.length !== 2) return null

  const rankStr = str[0].toUpperCase()
  const suitStr = str[1].toLowerCase()

  if (!RANKS.includes(rankStr as Rank)) return null
  if (!['s', 'h', 'd', 'c'].includes(suitStr)) return null

  return {
    rank: rankStr as Rank,
    suit: suitStr as Suit,
  }
}

/**
 * Format a card to string like "A♠"
 */
export function formatCard(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    s: '♠',
    h: '♥',
    d: '♦',
    c: '♣',
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}
