import type { Cell, Position, Provider, Scenario, WeightedCell } from '@/types/poker'
import { normalizeCell } from '@/types/poker'
import { charts as pekarstas } from './pekarstas'
import { charts as greenline } from './greenline'
import { charts as gtowizardGgRc } from './gtowizard-gg-rc'

// Chart is a sparse map of hand -> cell (unlisted hands are fold)
export type Chart = Record<string, Cell>

export type ChartKey = string

export function getChartKey(hero: Position, scenario: Scenario, villain?: Position): ChartKey {
  if (villain) {
    return `${hero}-${scenario}-${villain}`
  }
  return `${hero}-${scenario}`
}

const providers: Record<Provider, Record<string, Chart>> = {
  pekarstas,
  greenline,
  'gtowizard-gg-rc': gtowizardGgRc,
}

export function getChart(
  provider: Provider,
  hero: Position,
  scenario: Scenario,
  villain?: Position
): Chart | null {
  const charts = providers[provider]
  if (!charts) return null
  const key = getChartKey(hero, scenario, villain)
  return charts[key] || null
}

export function getCell(
  provider: Provider,
  hero: Position,
  scenario: Scenario,
  hand: string,
  villain?: Position
): Cell {
  const chart = getChart(provider, hero, scenario, villain)
  if (!chart) return 'fold'
  return chart[hand] || 'fold'
}

/**
 * Get the raise+allin effective frequency from a cell (0-100).
 * This represents how often the hero continues aggressively with this hand.
 */
export function computeAggressiveWeight(cell: Cell): number {
  if (cell === 'fold') return 0
  const { weight, actions } = normalizeCell(cell)
  const raiseFreq = (actions.raise ?? 0) + (actions.allin ?? 0)
  return weight * (raiseFreq / 100)
}

/**
 * Lookup the parent weight for a hand at a given scenario (0-100).
 * Parent weight represents how often the hero reaches this scenario from
 * the previous decision point.
 *
 * Mapping:
 *   RFI        → no parent → 100
 *   vs-open    → no parent → 100
 *   vs-3bet    → hero's RFI raise+allin frequency
 *   vs-4bet    → hero's vs-open raise+allin frequency (vs villain)
 *   3bet-defense → hero's vs-open raise+allin frequency (vs villain)
 */
export function getParentWeight(
  provider: Provider,
  hero: Position,
  scenario: Scenario,
  hand: string,
  villain?: Position
): number {
  if (scenario === 'vs-3bet') {
    const parentCell = getCell(provider, hero, 'RFI', hand)
    return computeAggressiveWeight(parentCell)
  }
  if (scenario === 'vs-4bet' || scenario === '3bet-defense') {
    if (!villain) return 100
    const parentCell = getCell(provider, hero, 'vs-open', hand, villain)
    return computeAggressiveWeight(parentCell)
  }
  return 100
}

/**
 * Get a cell with its weight cascaded from the parent scenario.
 * The cell's weight is multiplied by the parent weight.
 */
export function getCellWithCascadedWeight(
  provider: Provider,
  hero: Position,
  scenario: Scenario,
  hand: string,
  villain?: Position
): Cell {
  const cell = getCell(provider, hero, scenario, hand, villain)
  if (cell === 'fold') return 'fold'

  const parentWeight = getParentWeight(provider, hero, scenario, hand, villain)
  if (parentWeight >= 100) return cell

  const { weight, actions } = normalizeCell(cell)
  const cascadedWeight = (weight * parentWeight) / 100
  if (cascadedWeight <= 0) return 'fold'

  return { weight: cascadedWeight, actions } as WeightedCell
}
