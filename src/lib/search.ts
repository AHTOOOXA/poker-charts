/**
 * Smart search utilities for player search
 * - Fuzzy matching for typo tolerance
 * - Keyboard layout conversion (Russian → English QWERTY)
 */

// Russian ЙЦУКЕН keyboard layout → English QWERTY mapping
const RUSSIAN_TO_QWERTY: Record<string, string> = {
  // Row 1
  'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
  // Row 2
  'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': "'",
  // Row 3
  'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
  // Ukrainian specific
  'і': 's', 'ї': ']', 'є': "'", 'ґ': ']',
}


/**
 * Convert text typed in wrong keyboard layout to English QWERTY
 * e.g., "ызшен" (Russian keys) → "smith" (what user meant to type)
 */
export function convertToQwerty(text: string): string {
  return text
    .split('')
    .map(char => {
      const lower = char.toLowerCase()
      const converted = RUSSIAN_TO_QWERTY[lower]
      if (converted) {
        // Preserve original case
        return char === lower ? converted : converted.toUpperCase()
      }
      return char
    })
    .join('')
}

/**
 * Check if text contains any Cyrillic characters
 */
export function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text)
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses a combination of techniques for good typo tolerance
 */
export function calculateSimilarity(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  // Exact match
  if (q === t) return 1

  // Contains match (weighted by position)
  if (t.includes(q)) {
    const pos = t.indexOf(q)
    // Earlier position = higher score, starts with = bonus
    return 0.9 - (pos * 0.01)
  }

  // Query contains target (user typed more than needed)
  if (q.includes(t)) {
    return 0.7
  }

  // Levenshtein-based fuzzy matching
  const distance = levenshteinDistance(q, t)

  // Allow more errors for longer strings
  const maxAllowedDistance = Math.min(3, Math.floor(q.length / 2) + 1)

  if (distance <= maxAllowedDistance) {
    // Convert distance to similarity score (0.3 - 0.6 range for fuzzy matches)
    return Math.max(0.3, 0.6 - (distance * 0.1))
  }

  // Check if query matches start of any word in target
  const words = t.split(/[\s_\-.]/)
  for (const word of words) {
    if (word.startsWith(q)) {
      return 0.75
    }
    const wordDistance = levenshteinDistance(q, word)
    if (wordDistance <= maxAllowedDistance) {
      return Math.max(0.25, 0.5 - (wordDistance * 0.1))
    }
  }

  return 0
}

/**
 * Levenshtein distance - number of edits needed to transform one string to another
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Use two rows instead of full matrix for memory efficiency
  let prevRow: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)
  let currRow: number[] = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      )
    }

    // Swap rows
    const temp = prevRow
    prevRow = currRow
    currRow = temp
  }

  return prevRow[b.length]
}

export interface SearchResult<T> {
  item: T
  score: number
  matchType: 'exact' | 'starts' | 'contains' | 'fuzzy' | 'layout'
}

export interface SearchOptions {
  /** Minimum score to include in results (0-1) */
  threshold?: number
  /** Maximum results to return */
  limit?: number
}

/**
 * Smart search through items with fuzzy matching and keyboard layout conversion
 */
export function smartSearch<T>(
  items: T[],
  query: string,
  getSearchField: (item: T) => string,
  options: SearchOptions = {}
): SearchResult<T>[] {
  const { threshold = 0.25, limit } = options

  if (!query.trim()) {
    return items.map(item => ({ item, score: 1, matchType: 'exact' as const }))
  }

  const normalizedQuery = query.trim().toLowerCase()

  // Check if query might be in wrong keyboard layout
  const convertedQuery = hasCyrillic(query) ? convertToQwerty(query).toLowerCase() : null

  const results: SearchResult<T>[] = []

  for (const item of items) {
    const field = getSearchField(item).toLowerCase()

    let bestScore = 0
    let matchType: SearchResult<T>['matchType'] = 'fuzzy'

    // Try original query
    const originalScore = calculateSimilarity(normalizedQuery, field)
    if (originalScore > bestScore) {
      bestScore = originalScore
      if (originalScore === 1) matchType = 'exact'
      else if (field.startsWith(normalizedQuery)) matchType = 'starts'
      else if (field.includes(normalizedQuery)) matchType = 'contains'
      else matchType = 'fuzzy'
    }

    // Try converted query (if different)
    if (convertedQuery && convertedQuery !== normalizedQuery) {
      const convertedScore = calculateSimilarity(convertedQuery, field)
      if (convertedScore > bestScore) {
        bestScore = convertedScore
        matchType = 'layout'
      }
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore, matchType })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return limit ? results.slice(0, limit) : results
}
