import { describe, it, expect } from 'vitest'
import { evaluateHand, parseCard, formatCard } from './handEvaluator'
import type { Card } from '@/types/poker'

function cards(...strs: string[]): Card[] {
  return strs.map(s => {
    const c = parseCard(s)
    if (!c) throw new Error(`Invalid card: ${s}`)
    return c
  })
}

function hole(a: string, b: string): [Card, Card] {
  return cards(a, b) as [Card, Card]
}

describe('parseCard', () => {
  it('parses valid cards', () => {
    expect(parseCard('As')).toEqual({ rank: 'A', suit: 's' })
    expect(parseCard('Kh')).toEqual({ rank: 'K', suit: 'h' })
    expect(parseCard('Td')).toEqual({ rank: 'T', suit: 'd' })
    expect(parseCard('2c')).toEqual({ rank: '2', suit: 'c' })
  })

  it('is case-insensitive', () => {
    expect(parseCard('aS')).toEqual({ rank: 'A', suit: 's' })
  })

  it('returns null for invalid input', () => {
    expect(parseCard('')).toBeNull()
    expect(parseCard('A')).toBeNull()
    expect(parseCard('Ax')).toBeNull()
    expect(parseCard('Xs')).toBeNull()
    expect(parseCard('AsK')).toBeNull()
  })
})

describe('formatCard', () => {
  it('formats cards with suit symbols', () => {
    expect(formatCard({ rank: 'A', suit: 's' })).toBe('A♠')
    expect(formatCard({ rank: 'K', suit: 'h' })).toBe('K♥')
    expect(formatCard({ rank: 'Q', suit: 'd' })).toBe('Q♦')
    expect(formatCard({ rank: 'J', suit: 'c' })).toBe('J♣')
  })
})

describe('evaluateHand', () => {
  it('throws if board has fewer than 3 cards', () => {
    expect(() => evaluateHand(hole('As', 'Kh'), cards('2d'))).toThrow(
      'Board must have at least 3 cards'
    )
  })

  describe('made hands', () => {
    it('detects straight flush', () => {
      expect(
        evaluateHand(hole('Ts', '9s'), cards('Js', 'Qs', 'Ks'))
      ).toBe('straight-flush')
    })

    it('detects quads', () => {
      expect(
        evaluateHand(hole('As', 'Ah'), cards('Ad', 'Ac', '2s'))
      ).toBe('quads')
    })

    it('detects full house', () => {
      expect(
        evaluateHand(hole('As', 'Ah'), cards('Ad', 'Kc', 'Ks'))
      ).toBe('full-house')
    })

    it('detects flush', () => {
      expect(
        evaluateHand(hole('As', '3s'), cards('Ks', '9s', '2s'))
      ).toBe('flush')
    })

    it('detects straight', () => {
      expect(
        evaluateHand(hole('Ts', '9h'), cards('8d', '7c', '6s'))
      ).toBe('straight')
    })

    it('detects wheel straight (A-5)', () => {
      expect(
        evaluateHand(hole('As', '2h'), cards('3d', '4c', '5s'))
      ).toBe('straight')
    })

    it('detects set (pocket pair hits board)', () => {
      expect(
        evaluateHand(hole('Ks', 'Kh'), cards('Kd', '7c', '2s'))
      ).toBe('set')
    })

    it('detects trips (board pair + hole card)', () => {
      expect(
        evaluateHand(hole('Ks', 'Qh'), cards('Kd', 'Kc', '2s'))
      ).toBe('trips')
    })

    it('detects two pair', () => {
      expect(
        evaluateHand(hole('As', 'Kh'), cards('Ad', 'Kc', '2s'))
      ).toBe('two-pair')
    })

    it('detects overpair', () => {
      expect(
        evaluateHand(hole('As', 'Ah'), cards('Kd', '7c', '2s'))
      ).toBe('overpair')
    })

    it('detects top pair', () => {
      expect(
        evaluateHand(hole('As', 'Qh'), cards('Ad', '7c', '2s'))
      ).toBe('top-pair')
    })

    it('detects second pair', () => {
      expect(
        evaluateHand(hole('Ks', 'Qh'), cards('Ad', 'Kc', '2s'))
      ).toBe('second-pair')
    })

    it('detects low pair', () => {
      expect(
        evaluateHand(hole('2s', 'Qh'), cards('Ad', 'Kc', '2d'))
      ).toBe('low-pair')
    })

    it('detects underpair (pocket pair between board cards)', () => {
      // 88 on A-K-7: pair of 8s doesn't match any board rank, falls through to underpair
      expect(
        evaluateHand(hole('8s', '8h'), cards('Ad', 'Kc', '7s'))
      ).toBe('underpair')
    })
  })

  describe('draws', () => {
    it('detects flush draw', () => {
      expect(
        evaluateHand(hole('As', '3s'), cards('Ks', '9s', '2d'))
      ).toBe('flush-draw')
    })

    it('detects OESD', () => {
      // 9-T on 7-8-2 board: can complete with 6 or J
      expect(
        evaluateHand(hole('9s', 'Th'), cards('7d', '8c', '2s'))
      ).toBe('oesd')
    })

    it('detects gutshot', () => {
      // A-K on Q-J-3 board: need T for straight
      expect(
        evaluateHand(hole('As', 'Kh'), cards('Qd', 'Jc', '3s'))
      ).toBe('gutshot')
    })
  })

  describe('unpaired', () => {
    it('detects overcards', () => {
      expect(
        evaluateHand(hole('As', 'Kh'), cards('9d', '7c', '2s'))
      ).toBe('overcards')
    })

    it('detects air', () => {
      expect(
        evaluateHand(hole('3s', '2h'), cards('Ad', 'Kc', '9s'))
      ).toBe('air')
    })
  })

  describe('edge cases', () => {
    it('handles turn and river cards', () => {
      expect(
        evaluateHand(hole('As', 'Ah'), cards('Kd', '7c', '2s', 'Ad', '3c'))
      ).toBe('set')
    })

    it('prefers stronger category', () => {
      // Flush beats straight when 5+ suited cards
      expect(
        evaluateHand(hole('Ts', '9s'), cards('8s', '7s', '2s'))
      ).toBe('flush')
    })
  })
})
