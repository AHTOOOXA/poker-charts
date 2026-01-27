import { describe, it, expect } from 'vitest'
import {
  parseHandName,
  enumerateCombos,
  getAvailableCombos,
  countCombos,
  getBaseCombos,
} from './comboCounter'
import type { Card } from '@/types/poker'

describe('parseHandName', () => {
  it('parses pocket pairs', () => {
    expect(parseHandName('AA')).toEqual({ rank1: 'A', rank2: 'A', type: 'pair' })
    expect(parseHandName('22')).toEqual({ rank1: '2', rank2: '2', type: 'pair' })
    expect(parseHandName('TT')).toEqual({ rank1: 'T', rank2: 'T', type: 'pair' })
  })

  it('parses suited hands', () => {
    expect(parseHandName('AKs')).toEqual({ rank1: 'A', rank2: 'K', type: 'suited' })
    expect(parseHandName('76s')).toEqual({ rank1: '7', rank2: '6', type: 'suited' })
  })

  it('parses offsuit hands', () => {
    expect(parseHandName('AKo')).toEqual({ rank1: 'A', rank2: 'K', type: 'offsuit' })
    expect(parseHandName('72o')).toEqual({ rank1: '7', rank2: '2', type: 'offsuit' })
  })

  it('returns null for invalid hands', () => {
    expect(parseHandName('')).toBeNull()
    expect(parseHandName('A')).toBeNull()
    expect(parseHandName('AKQJ')).toBeNull()
    expect(parseHandName('XY')).toBeNull()
    expect(parseHandName('AKx')).toBeNull()
  })
})

describe('enumerateCombos', () => {
  it('returns 6 combos for pocket pairs', () => {
    const combos = enumerateCombos('AA')
    expect(combos).toHaveLength(6)
    // All should have rank A
    combos.forEach(([c1, c2]) => {
      expect(c1.rank).toBe('A')
      expect(c2.rank).toBe('A')
      expect(c1.suit).not.toBe(c2.suit)
    })
  })

  it('returns 4 combos for suited hands', () => {
    const combos = enumerateCombos('AKs')
    expect(combos).toHaveLength(4)
    combos.forEach(([c1, c2]) => {
      expect(c1.rank).toBe('A')
      expect(c2.rank).toBe('K')
      expect(c1.suit).toBe(c2.suit)
    })
  })

  it('returns 12 combos for offsuit hands', () => {
    const combos = enumerateCombos('AKo')
    expect(combos).toHaveLength(12)
    combos.forEach(([c1, c2]) => {
      expect(c1.rank).toBe('A')
      expect(c2.rank).toBe('K')
      expect(c1.suit).not.toBe(c2.suit)
    })
  })

  it('returns empty array for invalid hands', () => {
    expect(enumerateCombos('invalid')).toEqual([])
  })
})

describe('getBaseCombos', () => {
  it('returns 6 for pairs', () => {
    expect(getBaseCombos('AA')).toBe(6)
    expect(getBaseCombos('22')).toBe(6)
  })

  it('returns 4 for suited', () => {
    expect(getBaseCombos('AKs')).toBe(4)
  })

  it('returns 12 for offsuit', () => {
    expect(getBaseCombos('AKo')).toBe(12)
  })
})

describe('getAvailableCombos with board blockers', () => {
  it('removes blocked combos from pairs', () => {
    const board: Card[] = [{ rank: 'A', suit: 's' }]
    const combos = getAvailableCombos('AA', board)
    // With one A on board, we can only use remaining 3 Aces: C(3,2) = 3 combos
    expect(combos).toHaveLength(3)
  })

  it('removes blocked combos from suited hands', () => {
    const board: Card[] = [{ rank: 'A', suit: 's' }]
    const combos = getAvailableCombos('AKs', board)
    // As is blocked, so only AhKh, AdKd, AcKc remain = 3
    expect(combos).toHaveLength(3)
  })

  it('handles multiple blockers', () => {
    const board: Card[] = [
      { rank: 'A', suit: 's' },
      { rank: 'A', suit: 'h' },
    ]
    const combos = getAvailableCombos('AA', board)
    // Only Ad and Ac remain: C(2,2) = 1 combo
    expect(combos).toHaveLength(1)
  })

  it('returns all combos when no blockers', () => {
    const board: Card[] = [{ rank: '2', suit: 's' }]
    const combos = getAvailableCombos('AA', board)
    expect(combos).toHaveLength(6)
  })
})

describe('countCombos', () => {
  it('counts correctly with blockers', () => {
    const board: Card[] = [{ rank: 'A', suit: 's' }]
    expect(countCombos('AA', board)).toBe(3)
    expect(countCombos('AKs', board)).toBe(3)
    expect(countCombos('KK', board)).toBe(6)
  })
})
