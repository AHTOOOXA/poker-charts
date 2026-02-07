import { describe, it, expect } from 'vitest'
import {
  filterChartByActions,
  isOopRelativeTo,
  getValidIpPositions,
  getValidOopPositions,
  resolveRanges,
  countRangeCombos,
} from './rangeResolver'
import type { Chart } from '@/data/ranges'
import type { WeightedCell } from '@/types/poker'

describe('filterChartByActions', () => {
  it('returns empty chart for null input', () => {
    expect(filterChartByActions(null, ['raise'])).toEqual({})
  })

  it('filters to only allowed actions', () => {
    const chart: Chart = {
      AA: 'raise',
      KK: 'call',
      QQ: { weight: 100, actions: { raise: 60, call: 40 } },
    }
    const filtered = filterChartByActions(chart, ['raise'])

    expect(filtered['AA']).toBe('raise')
    expect(filtered['KK']).toBeUndefined()
    expect(filtered['QQ']).toBeDefined()
  })

  it('normalizes action percentages when filtering', () => {
    const chart: Chart = {
      QQ: { weight: 100, actions: { raise: 60, call: 40 } },
    }
    const filtered = filterChartByActions(chart, ['raise'])
    const cell = filtered['QQ'] as WeightedCell

    // Weight should be reduced: 100 * (60/100) = 60
    expect(cell.weight).toBe(60)
  })

  it('preserves fold actions', () => {
    const chart: Chart = { AA: 'fold' }
    const filtered = filterChartByActions(chart, ['raise'])
    expect(filtered['AA']).toBeUndefined()
  })

  it('handles zero-weight cells', () => {
    const chart: Chart = {
      AA: { weight: 0, actions: { raise: 100 } },
    }
    const filtered = filterChartByActions(chart, ['raise'])
    expect(filtered['AA']).toBeUndefined()
  })

  it('simplifies to single action string when possible', () => {
    const chart: Chart = {
      AA: { weight: 100, actions: { raise: 100 } },
    }
    const filtered = filterChartByActions(chart, ['raise'])
    // Full weight + single action = simplified to string
    expect(filtered['AA']).toBe('raise')
  })
})

describe('isOopRelativeTo', () => {
  it('SB is OOP to all other positions', () => {
    expect(isOopRelativeTo('SB', 'BB')).toBe(true)
    expect(isOopRelativeTo('SB', 'BTN')).toBe(true)
  })

  it('BTN is not OOP relative to anyone', () => {
    expect(isOopRelativeTo('BTN', 'SB')).toBe(false)
    expect(isOopRelativeTo('BTN', 'BB')).toBe(false)
  })

  it('BB is OOP relative to UTG through BTN', () => {
    expect(isOopRelativeTo('BB', 'UTG')).toBe(true)
    expect(isOopRelativeTo('BB', 'BTN')).toBe(true)
  })
})

describe('getValidIpPositions', () => {
  it('returns positions acting after OOP postflop', () => {
    const ipPositions = getValidIpPositions('SB')
    expect(ipPositions).toContain('BB')
    expect(ipPositions).toContain('BTN')
    expect(ipPositions).not.toContain('SB')
  })

  it('returns empty for BTN (last to act)', () => {
    expect(getValidIpPositions('BTN')).toEqual([])
  })
})

describe('getValidOopPositions', () => {
  it('returns positions acting before IP postflop', () => {
    const oopPositions = getValidOopPositions('BTN')
    expect(oopPositions).toContain('SB')
    expect(oopPositions).toContain('BB')
    expect(oopPositions).toContain('CO')
    expect(oopPositions).not.toContain('BTN')
  })

  it('returns empty for SB (first to act)', () => {
    expect(getValidOopPositions('SB')).toEqual([])
  })
})

describe('resolveRanges', () => {
  it('returns error when positions are the same', () => {
    const result = resolveRanges('pekarstas', 'srp', 'UTG', 'UTG')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('OOP and IP cannot be the same position')
  })

  describe('SRP', () => {
    it('resolves SRP where OOP opened', () => {
      // CO opens, BTN calls. CO=OOP (acts first postflop? no)
      // Actually postflop: SB, BB, UTG, MP, CO, BTN
      // So UTG=OOP, BTN=IP. UTG is earlier preflop so UTG opened.
      const result = resolveRanges('pekarstas', 'srp', 'UTG', 'BTN')
      expect(result.isValid).toBe(true)
      expect(result.oopDescription).toContain('UTG')
      expect(result.oopDescription).toContain('RFI')
      expect(result.ipDescription).toContain('BTN')
    })

    it('resolves SRP where IP opened', () => {
      // BTN opens, BB calls. BB=OOP, BTN=IP. BTN is earlier preflop.
      const result = resolveRanges('pekarstas', 'srp', 'BB', 'BTN')
      expect(result.isValid).toBe(true)
      // IP opened (BTN), OOP called (BB)
      expect(result.ipDescription).toContain('RFI')
      expect(result.oopDescription).toContain('call')
    })
  })

  describe('3bet pot', () => {
    it('resolves 3bet pot where OOP opened and IP 3bet', () => {
      // UTG opens, BTN 3bets, UTG calls
      const result = resolveRanges('pekarstas', '3bet', 'UTG', 'BTN')
      expect(result.isValid).toBe(true)
      expect(result.oopDescription).toContain('3bet')
      expect(result.oopDescription).toContain('call')
      expect(result.ipDescription).toContain('3bet')
    })

    it('resolves 3bet pot where IP opened and OOP 3bet', () => {
      // BTN opens, BB 3bets, BTN calls
      const result = resolveRanges('pekarstas', '3bet', 'BB', 'BTN')
      expect(result.isValid).toBe(true)
      expect(result.oopDescription).toContain('3bet')
      expect(result.ipDescription).toContain('3bet')
      expect(result.ipDescription).toContain('call')
    })
  })
})

describe('countRangeCombos', () => {
  it('counts full-weight hands correctly', () => {
    const chart: Chart = { AA: 'raise' }
    // AA = pair = 6 combos
    expect(countRangeCombos(chart)).toBe(6)
  })

  it('counts suited and offsuit hands', () => {
    const chart: Chart = { AKs: 'raise', AKo: 'call' }
    // AKs = 4, AKo = 12
    expect(countRangeCombos(chart)).toBe(16)
  })

  it('applies weight to combo count', () => {
    const chart: Chart = {
      AA: { weight: 50, actions: { raise: 100 } },
    }
    // 6 combos * 0.5 weight = 3
    expect(countRangeCombos(chart)).toBe(3)
  })

  it('skips fold entries', () => {
    const chart: Chart = { AA: 'fold', KK: 'raise' }
    expect(countRangeCombos(chart)).toBe(6)
  })

  it('returns 0 for empty range', () => {
    expect(countRangeCombos({})).toBe(0)
  })
})
