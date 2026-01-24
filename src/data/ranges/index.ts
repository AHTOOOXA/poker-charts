import type { Cell, Position, Provider, Scenario } from '@/types/poker'
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
