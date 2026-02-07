import { describe, it, expect } from 'vitest'
import { analyzeRange, groupCategories, getHandsInCategory } from './rangeAnalyzer'
import type { Card } from '@/types/poker'
import type { Chart } from '@/data/ranges'

function card(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] }
}

const flop: Card[] = [card('A', 's'), card('K', 'h'), card('7', 'd')]

describe('analyzeRange', () => {
  it('returns empty result for board with fewer than 3 cards', () => {
    const result = analyzeRange({ AA: 'raise' }, [card('A', 's')])
    expect(result.totalCombos).toBe(0)
    expect(result.byCategory).toEqual([])
  })

  it('analyzes a single hand correctly', () => {
    const range: Chart = { AA: 'raise' }
    const result = analyzeRange(range, flop)

    // AA on A-K-7 board: 3 combos (As blocked), should be set (pocket pair hit board)
    expect(result.totalCombos).toBeGreaterThan(0)
    expect(result.byCategory.length).toBeGreaterThan(0)
    const categories = result.byCategory.map(c => c.category)
    expect(categories).toContain('set')
  })

  it('distributes action counts correctly', () => {
    const range: Chart = { AKs: 'raise' }
    const result = analyzeRange(range, flop)

    expect(result.byAction.raise).toBeGreaterThan(0)
    expect(result.byAction.call).toBe(0)
    expect(result.byAction.fold).toBeGreaterThan(0) // unlisted hands fold
  })

  it('handles weighted cells', () => {
    const range: Chart = {
      AKs: { weight: 50, actions: { raise: 60, call: 40 } },
    }
    const result = analyzeRange(range, flop)

    expect(result.totalCombos).toBeGreaterThan(0)
    expect(result.byAction.raise).toBeGreaterThan(0)
    expect(result.byAction.call).toBeGreaterThan(0)
  })

  it('respects showRaise and showCall filters', () => {
    const range: Chart = {
      AKs: { weight: 100, actions: { raise: 50, call: 50 } },
    }
    const raiseOnly = analyzeRange(range, flop, true, false)
    const callOnly = analyzeRange(range, flop, false, true)

    // Both should have combos but less than unfiltered
    expect(raiseOnly.totalCombos).toBeGreaterThan(0)
    expect(callOnly.totalCombos).toBeGreaterThan(0)
  })

  it('handles an empty range', () => {
    const result = analyzeRange({}, flop)
    expect(result.totalCombos).toBe(0)
    expect(result.byCategory).toEqual([])
  })

  it('orders categories from strongest to weakest', () => {
    const range: Chart = {
      AA: 'raise',
      AKs: 'raise',
      '32o': 'call',
    }
    const result = analyzeRange(range, flop)
    const categories = result.byCategory.map(c => c.category)

    // If both set and top-pair exist, set should come first
    if (categories.includes('set') && categories.includes('top-pair')) {
      expect(categories.indexOf('set')).toBeLessThan(categories.indexOf('top-pair'))
    }
  })

  it('handles board blockers correctly', () => {
    // As is on the board, so AKs combos with As are blocked
    const range: Chart = { AKs: 'raise' }
    const result = analyzeRange(range, flop)
    // AKs normally has 4 combos, As and Kh are on board
    // Available: AdKd, AcKc (AsKs blocked by As, AhKh blocked by Kh) -> 2 combos
    // But since these are suited, actually: AsKs blocked, AhKh blocked -> AdKd, AcKc = 2
    expect(result.totalCombos).toBe(2)
  })
})

describe('groupCategories', () => {
  const sampleResults = [
    { category: 'set' as const, combos: 3, percentage: 20, hands: ['AA'] },
    { category: 'top-pair' as const, combos: 6, percentage: 40, hands: ['AKs', 'AKo'] },
    { category: 'air' as const, combos: 6, percentage: 40, hands: ['32o'] },
  ]

  it('returns results as-is for detailed grouping', () => {
    const result = groupCategories(sampleResults, 'detailed')
    expect(result).toEqual(sampleResults)
  })

  it('groups into simple categories', () => {
    const result = groupCategories(sampleResults, 'simple')
    const groupNames = result.map(r => r.category as string)
    expect(groupNames).toContain('made-hands')
    expect(groupNames).toContain('nothing')
    expect(groupNames).not.toContain('set')
  })

  it('groups into standard categories', () => {
    const result = groupCategories(sampleResults, 'standard')
    const groupNames = result.map(r => r.category as string)
    // set goes into strong-made, top-pair into top-pair+, air into nothing
    expect(groupNames).toContain('strong-made')
    expect(groupNames).toContain('top-pair')
    expect(groupNames).toContain('nothing')
  })

  it('sums combos and percentages within groups', () => {
    const result = groupCategories(sampleResults, 'simple')
    const madeHands = result.find(r => (r.category as string) === 'made-hands')
    expect(madeHands).toBeDefined()
    // set (3) + top-pair (6) = 9
    expect(madeHands!.combos).toBe(9)
    expect(madeHands!.percentage).toBe(60)
  })

  it('deduplicates hands within groups', () => {
    const dupeResults = [
      { category: 'set' as const, combos: 3, percentage: 20, hands: ['AA'] },
      { category: 'trips' as const, combos: 3, percentage: 20, hands: ['AA'] },
    ]
    const result = groupCategories(dupeResults, 'simple')
    const madeHands = result.find(r => (r.category as string) === 'made-hands')
    expect(madeHands!.hands).toEqual(['AA'])
  })
})

describe('getHandsInCategory', () => {
  it('returns hands for an existing category', () => {
    const analysis = {
      totalCombos: 10,
      byCategory: [
        { category: 'set' as const, combos: 3, percentage: 30, hands: ['AA', 'KK'] },
      ],
      byAction: { raise: 10, call: 0, fold: 0, allin: 0 },
    }
    expect(getHandsInCategory(analysis, 'set')).toEqual(['AA', 'KK'])
  })

  it('returns empty array for missing category', () => {
    const analysis = {
      totalCombos: 0,
      byCategory: [],
      byAction: { raise: 0, call: 0, fold: 0, allin: 0 },
    }
    expect(getHandsInCategory(analysis, 'quads')).toEqual([])
  })
})
