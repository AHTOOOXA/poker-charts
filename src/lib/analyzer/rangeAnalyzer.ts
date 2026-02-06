import type { Card, Cell, HandCategory, ActionWeights } from '@/types/poker'
import { HAND_GRID, normalizeCell } from '@/types/poker'
import type { Chart } from '@/data/ranges'
import { getAvailableCombos } from './comboCounter'
import { evaluateHand } from './handEvaluator'

export interface CategoryResult {
  category: HandCategory
  combos: number
  percentage: number
  hands: string[] // which hand names fall in this category
}

export interface AnalysisResult {
  totalCombos: number
  byCategory: CategoryResult[]
  byAction: {
    raise: number
    call: number
    fold: number
    allin: number
  }
}

/**
 * Get the weight of a hand for combo counting based on filters
 * Returns a value 0-1 representing the fraction of combos that match filters
 */
function getHandWeight(cell: Cell, showRaise: boolean, showCall: boolean): number {
  const { weight, actions } = normalizeCell(cell)
  if (weight === 0) return 0

  let actionWeight = 0
  if (showRaise) {
    actionWeight += (actions.raise || 0) / 100
    actionWeight += (actions.allin || 0) / 100
  }
  if (showCall) {
    actionWeight += (actions.call || 0) / 100
  }

  return (weight / 100) * actionWeight
}

/**
 * Check if a hand should be included based on action filters
 */
function shouldIncludeHand(
  cell: Cell,
  showRaise: boolean,
  showCall: boolean
): boolean {
  return getHandWeight(cell, showRaise, showCall) > 0
}

/**
 * Get action weights from cell
 */
function getCellActions(cell: Cell): ActionWeights {
  return normalizeCell(cell).actions
}

/**
 * Get range weight from cell (0-100)
 */
function getCellWeight(cell: Cell): number {
  return normalizeCell(cell).weight
}

/**
 * Analyze a range against a board
 */
export function analyzeRange(
  range: Chart,
  board: Card[],
  showRaise: boolean = true,
  showCall: boolean = true
): AnalysisResult {
  if (board.length < 3) {
    return {
      totalCombos: 0,
      byCategory: [],
      byAction: { raise: 0, call: 0, fold: 0, allin: 0 },
    }
  }

  const categoryMap = new Map<
    HandCategory,
    { combos: number; hands: Set<string> }
  >()
  const actionCounts = { raise: 0, call: 0, fold: 0, allin: 0 }
  let totalCombos = 0

  // Iterate through all 169 hands
  for (const row of HAND_GRID) {
    for (const hand of row) {
      const cell = range[hand.name] || 'fold'

      // Count by action (before filtering)
      const cellWeight = getCellWeight(cell)
      const cellActions = getCellActions(cell)
      const availableCombos = getAvailableCombos(hand.name, board)
      const baseCombos = availableCombos.length

      // Distribute combos by range weight and action distribution
      const inRangeCombos = baseCombos * (cellWeight / 100)
      for (const action of ['fold', 'call', 'raise', 'allin'] as const) {
        const pct = cellActions[action] || 0
        actionCounts[action] += inRangeCombos * (pct / 100)
      }
      // Combos not in range count as fold
      actionCounts.fold += baseCombos - inRangeCombos

      // Skip if doesn't match filters
      if (!shouldIncludeHand(cell, showRaise, showCall)) {
        continue
      }

      const weight = getHandWeight(cell, showRaise, showCall)
      if (weight === 0) continue

      // Analyze each specific combo
      for (const combo of availableCombos) {
        const category = evaluateHand(combo, board)
        const comboWeight = weight

        if (!categoryMap.has(category)) {
          categoryMap.set(category, { combos: 0, hands: new Set() })
        }

        const catData = categoryMap.get(category)!
        catData.combos += comboWeight
        catData.hands.add(hand.name)
        totalCombos += comboWeight
      }
    }
  }

  // Convert to result format
  const byCategory: CategoryResult[] = []

  // Define category order (strongest to weakest)
  const categoryOrder: HandCategory[] = [
    'straight-flush',
    'quads',
    'full-house',
    'flush',
    'straight',
    'set',
    'trips',
    'two-pair',
    'overpair',
    'top-pair',
    'second-pair',
    'low-pair',
    'underpair',
    'flush-draw',
    'oesd',
    'gutshot',
    'overcards',
    'air',
  ]

  for (const category of categoryOrder) {
    const data = categoryMap.get(category)
    if (data && data.combos > 0) {
      byCategory.push({
        category,
        combos: Math.round(data.combos * 10) / 10, // Round to 1 decimal
        percentage: totalCombos > 0 ? (data.combos / totalCombos) * 100 : 0,
        hands: [...data.hands],
      })
    }
  }

  return {
    totalCombos: Math.round(totalCombos * 10) / 10,
    byCategory,
    byAction: {
      raise: Math.round(actionCounts.raise * 10) / 10,
      call: Math.round(actionCounts.call * 10) / 10,
      fold: Math.round(actionCounts.fold * 10) / 10,
      allin: Math.round(actionCounts.allin * 10) / 10,
    },
  }
}

/**
 * Group categories for simplified display
 */
export function groupCategories(
  results: CategoryResult[],
  grouping: 'simple' | 'standard' | 'detailed'
): CategoryResult[] {
  if (grouping === 'detailed') {
    return results
  }

  const groups: Record<string, { categories: HandCategory[]; label: string }> =
    grouping === 'simple'
      ? {
          'made-hands': {
            categories: [
              'straight-flush',
              'quads',
              'full-house',
              'flush',
              'straight',
              'set',
              'trips',
              'two-pair',
              'overpair',
              'top-pair',
              'second-pair',
              'low-pair',
              'underpair',
            ],
            label: 'Made Hands',
          },
          draws: {
            categories: ['flush-draw', 'oesd', 'gutshot'],
            label: 'Draws',
          },
          nothing: {
            categories: ['overcards', 'air'],
            label: 'Nothing',
          },
        }
      : {
          'strong-made': {
            categories: [
              'straight-flush',
              'quads',
              'full-house',
              'flush',
              'straight',
              'set',
              'trips',
            ],
            label: 'Strong Made',
          },
          'two-pair': {
            categories: ['two-pair'],
            label: 'Two Pair',
          },
          'top-pair': {
            categories: ['overpair', 'top-pair'],
            label: 'Top Pair+',
          },
          'other-pair': {
            categories: ['second-pair', 'low-pair', 'underpair'],
            label: 'Other Pairs',
          },
          draws: {
            categories: ['flush-draw', 'oesd', 'gutshot'],
            label: 'Draws',
          },
          nothing: {
            categories: ['overcards', 'air'],
            label: 'Nothing',
          },
        }

  const grouped: CategoryResult[] = []

  for (const [groupKey, group] of Object.entries(groups)) {
    const matching = results.filter((r) =>
      group.categories.includes(r.category)
    )
    if (matching.length === 0) continue

    const totalCombos = matching.reduce((sum, r) => sum + r.combos, 0)
    const totalPercentage = matching.reduce((sum, r) => sum + r.percentage, 0)
    const allHands = [...new Set(matching.flatMap((r) => r.hands))]

    grouped.push({
      category: groupKey as HandCategory,
      combos: Math.round(totalCombos * 10) / 10,
      percentage: totalPercentage,
      hands: allHands,
    })
  }

  return grouped
}

/**
 * Get hands in a specific category from analysis results
 */
export function getHandsInCategory(
  results: AnalysisResult,
  category: HandCategory
): string[] {
  const catResult = results.byCategory.find((r) => r.category === category)
  return catResult?.hands || []
}
