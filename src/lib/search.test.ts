import { describe, it, expect } from 'vitest'
import { convertToQwerty, hasCyrillic, calculateSimilarity, smartSearch } from './search'

describe('convertToQwerty', () => {
  it('converts Russian ЙЦУКЕН layout to QWERTY', () => {
    // Russian ЙЦУКЕН keyboard layout → QWERTY:
    // й→q, ц→w, у→e, к→r, е→t, н→y, г→u, ш→i, щ→o, з→p
    // ф→a, ы→s, в→d, а→f, п→g, р→h, о→j, л→k, д→l
    // я→z, ч→x, с→c, м→v, и→b, т→n, ь→m

    // "test" typed on Russian keyboard (е→t, у→e, ы→s, е→t)
    expect(convertToQwerty('еу|ые')).toBe('te|st')

    // "hello" typed on Russian keyboard (р→h, у→e, д→l, д→l, щ→o)
    expect(convertToQwerty('ру|ддщ')).toBe('he|llo')

    // "qwerty" typed on Russian keyboard
    expect(convertToQwerty('йцукен')).toBe('qwerty')
  })

  it('preserves case', () => {
    expect(convertToQwerty('Йцукен')).toBe('Qwerty')
    expect(convertToQwerty('ЙЦУКЕН')).toBe('QWERTY')
  })

  it('passes through non-Cyrillic characters', () => {
    expect(convertToQwerty('hello')).toBe('hello')
    expect(convertToQwerty('test123')).toBe('test123')
    expect(convertToQwerty('mixed йцу')).toBe('mixed qwe')
  })
})

describe('hasCyrillic', () => {
  it('detects Cyrillic characters', () => {
    expect(hasCyrillic('привет')).toBe(true)
    expect(hasCyrillic('hello')).toBe(false)
    expect(hasCyrillic('test123')).toBe(false)
    expect(hasCyrillic('mixed тест')).toBe(true)
  })
})

describe('calculateSimilarity', () => {
  it('returns 1 for exact matches', () => {
    expect(calculateSimilarity('test', 'test')).toBe(1)
    expect(calculateSimilarity('TEST', 'test')).toBe(1)
  })

  it('returns high score for contains matches', () => {
    const score = calculateSimilarity('smith', 'johnsmith')
    expect(score).toBeGreaterThan(0.8)
    expect(score).toBeLessThan(1)
  })

  it('returns higher score for starts-with matches', () => {
    const startsScore = calculateSimilarity('smith', 'smithyg')
    const containsScore = calculateSimilarity('smith', 'johnsmith')
    expect(startsScore).toBeGreaterThan(containsScore)
  })

  it('returns positive score for fuzzy matches (typos)', () => {
    // Single character typo
    expect(calculateSimilarity('smtih', 'smith')).toBeGreaterThan(0.3)
    // Missing character
    expect(calculateSimilarity('smih', 'smith')).toBeGreaterThan(0.3)
    // Extra character
    expect(calculateSimilarity('smiith', 'smith')).toBeGreaterThan(0.3)
  })

  it('returns 0 for completely different strings', () => {
    expect(calculateSimilarity('abc', 'xyz')).toBe(0)
    expect(calculateSimilarity('hello', 'world')).toBe(0)
  })
})

describe('smartSearch', () => {
  const items = [
    { name: 'SmithyG' },
    { name: 'JohnSmith' },
    { name: 'PokerPro' },
    { name: 'TestPlayer' },
    { name: 'smith_test' },
  ]

  it('finds exact matches', () => {
    const results = smartSearch(items, 'SmithyG', item => item.name)
    expect(results[0].item.name).toBe('SmithyG')
    expect(results[0].matchType).toBe('exact')
  })

  it('finds partial matches', () => {
    const results = smartSearch(items, 'smith', item => item.name)
    expect(results.length).toBeGreaterThanOrEqual(3)
    expect(results.map(r => r.item.name)).toContain('SmithyG')
    expect(results.map(r => r.item.name)).toContain('JohnSmith')
    expect(results.map(r => r.item.name)).toContain('smith_test')
  })

  it('finds fuzzy matches (typos)', () => {
    const results = smartSearch(items, 'Smityg', item => item.name)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.name).toBe('SmithyG')
    expect(results[0].matchType).toBe('fuzzy')
  })

  it('handles keyboard layout conversion', () => {
    // "poker" typed on Russian keyboard: з→p, щ→o, л→k, у→e, к→r = "зщлук"
    // But wait, let me check: п→g, о→j, к→r, е→t, р→h would be "poker"
    // Actually з=p, щ=o, л=k, у=e, к=r, so зщлук = poker!
    const results = smartSearch(items, 'зщлук', item => item.name)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].item.name).toBe('PokerPro')
    expect(results[0].matchType).toBe('layout')
  })

  it('ranks exact matches higher than partial matches', () => {
    const items2 = [
      { name: 'testplayer' },
      { name: 'test' },
      { name: 'testing' },
    ]
    const results = smartSearch(items2, 'test', item => item.name)
    expect(results[0].item.name).toBe('test')
    expect(results[0].score).toBe(1)
  })

  it('respects threshold option', () => {
    const results = smartSearch(items, 'xyz', item => item.name, { threshold: 0.5 })
    expect(results.length).toBe(0)
  })

  it('respects limit option', () => {
    const results = smartSearch(items, 's', item => item.name, { limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })
})
