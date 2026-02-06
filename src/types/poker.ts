export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
export type Rank = (typeof RANKS)[number]

export const SUITS = ['s', 'h', 'd', 'c'] as const
export type Suit = (typeof SUITS)[number]

export interface Card {
  rank: Rank
  suit: Suit
}

// Hand categories for range analysis (ordered by strength)
export const HAND_CATEGORIES = [
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
] as const

export type HandCategory = (typeof HAND_CATEGORIES)[number]

export interface CategoryConfig {
  id: HandCategory
  label: string
  color: string
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  { id: 'straight-flush', label: 'Straight Flush', color: '#8B5CF6' },
  { id: 'quads', label: 'Quads', color: '#7C3AED' },
  { id: 'full-house', label: 'Full House', color: '#6D28D9' },
  { id: 'flush', label: 'Flush', color: '#4F46E5' },
  { id: 'straight', label: 'Straight', color: '#4338CA' },
  { id: 'set', label: 'Set', color: '#6366F1' },
  { id: 'trips', label: 'Trips', color: '#818CF8' },
  { id: 'two-pair', label: 'Two Pair', color: '#0EA5E9' },
  { id: 'overpair', label: 'Overpair', color: '#06B6D4' },
  { id: 'top-pair', label: 'Top Pair', color: '#14B8A6' },
  { id: 'second-pair', label: 'Second Pair', color: '#10B981' },
  { id: 'low-pair', label: 'Low Pair', color: '#22C55E' },
  { id: 'underpair', label: 'Underpair', color: '#84CC16' },
  { id: 'flush-draw', label: 'Flush Draw', color: '#EAB308' },
  { id: 'oesd', label: 'OESD', color: '#F59E0B' },
  { id: 'gutshot', label: 'Gutshot', color: '#F97316' },
  { id: 'overcards', label: 'Overcards', color: '#FB923C' },
  { id: 'air', label: 'Air', color: '#6B7280' },
]

export type Grouping = 'simple' | 'standard' | 'detailed'

export const PROVIDERS = ['pekarstas', 'greenline', 'gtowizard-gg-rc'] as const
export type Provider = (typeof PROVIDERS)[number]

export interface ProviderConfig {
  id: Provider
  label: string
  description?: string
}

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  { id: 'pekarstas', label: 'Pekarstas', description: 'GGPoker chart pack' },
  { id: 'greenline', label: 'Greenline' },
  { id: 'gtowizard-gg-rc', label: 'GTOWizard GG R&C' },
]

export const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const
export type Position = (typeof POSITIONS)[number]

// 4 core actions - meaning is contextual based on scenario
// - fold: don't play
// - call: passive (call open, call 3bet, call 4bet)
// - raise: aggressive (open, 3bet, 4bet depending on scenario)
// - allin: maximum aggression (jam, 5bet)
export const ACTIONS = ['fold', 'call', 'raise', 'allin'] as const
export type Action = (typeof ACTIONS)[number]

// Action distribution - percentages for each action (should sum to 100)
export type ActionWeights = Partial<Record<Action, number>>

// Full weighted cell with range weight and action distribution
export interface WeightedCell {
  // Range weight: what % of this hand is in the range (0-100)
  // Displays as fill height from TOP of cell
  weight: number
  // Action distribution for the in-range portion (should sum to 100)
  // Displays as horizontal bands LEFT to RIGHT (aggressive to passive)
  actions: ActionWeights
}

// A cell can be:
// - Single action: "raise" (= 100% weight, 100% raise)
// - Legacy tuple: ["raise", "call"] (= 100% weight, 50/50 split)
// - Full weighted: { weight: 60, actions: { raise: 70, call: 30 } }
export type Cell = Action | [Action, Action] | WeightedCell

// Check if cell is a WeightedCell object
function isWeightedCell(cell: Cell): cell is WeightedCell {
  return typeof cell === 'object' && !Array.isArray(cell) && 'weight' in cell
}

// Normalize any Cell format to WeightedCell
export function normalizeCell(cell: Cell): WeightedCell {
  // Already a WeightedCell
  if (isWeightedCell(cell)) {
    return cell
  }
  // Single action = 100% weight, 100% that action
  if (typeof cell === 'string') {
    return { weight: 100, actions: { [cell]: 100 } }
  }
  // Legacy tuple [action, action] = 100% weight, 50/50 split
  if (Array.isArray(cell)) {
    const [a, b] = cell
    if (a === b) return { weight: 100, actions: { [a]: 100 } }
    return { weight: 100, actions: { [a]: 50, [b]: 50 } }
  }
  // Fallback
  return { weight: 0, actions: {} }
}

// Action display order: aggressive (left) to passive (right)
const ACTION_ORDER: Action[] = ['allin', 'raise', 'call', 'fold']

// Get ordered action entries sorted by display order
export function getSortedActions(actions: ActionWeights): [Action, number][] {
  return ACTION_ORDER
    .filter(action => actions[action] && actions[action]! > 0)
    .map(action => [action, actions[action]!] as [Action, number])
}

export type HandType = 'pair' | 'suited' | 'offsuit'

export interface Hand {
  name: string
  type: HandType
  row: number
  col: number
}

export type Scenario =
  | 'RFI'
  | 'vs-open'
  | 'vs-3bet'
  | 'vs-4bet'
  | '3bet-defense'

export interface ScenarioConfig {
  id: Scenario
  label: string
  description: string
  requiresVillain: boolean
}

export const SCENARIOS: ScenarioConfig[] = [
  { id: 'RFI', label: 'RFI', description: 'Raise first in', requiresVillain: false },
  { id: 'vs-open', label: 'vs Open', description: 'Facing an open raise', requiresVillain: true },
  { id: 'vs-3bet', label: 'vs 3bet', description: 'You opened, facing 3bet', requiresVillain: true },
  { id: 'vs-4bet', label: 'vs 4bet', description: 'You 3bet, facing 4bet', requiresVillain: true },
  { id: '3bet-defense', label: '3bet Defense', description: 'Your 3bet got called', requiresVillain: true },
]

// Generate all 169 hands
export function generateHandGrid(): Hand[][] {
  const grid: Hand[][] = []

  for (let row = 0; row < 13; row++) {
    const rowHands: Hand[] = []
    for (let col = 0; col < 13; col++) {
      const r1 = RANKS[row]
      const r2 = RANKS[col]

      let name: string
      let type: HandType

      if (row === col) {
        name = `${r1}${r2}`
        type = 'pair'
      } else if (row < col) {
        name = `${r1}${r2}s`
        type = 'suited'
      } else {
        name = `${r2}${r1}o`
        type = 'offsuit'
      }

      rowHands.push({ name, type, row, col })
    }
    grid.push(rowHands)
  }

  return grid
}

export const HAND_GRID = generateHandGrid()

// Get valid villain positions based on hero position and scenario
export function getValidVillains(hero: Position, scenario: Scenario): Position[] {
  const positions = [...POSITIONS]
  const heroIdx = positions.indexOf(hero)

  switch (scenario) {
    case 'RFI':
      return []
    case 'vs-open':
      // Villain must be earlier position (opened before us)
      return positions.slice(0, heroIdx)
    case 'vs-3bet':
      // Villain must be later position (3bet us after we opened)
      return positions.slice(heroIdx + 1)
    case 'vs-4bet':
      // Villain is the original opener we 3bet
      return positions.slice(0, heroIdx)
    case '3bet-defense':
      // Villain called our 3bet (original opener)
      return positions.slice(0, heroIdx)
    default:
      return []
  }
}

// Get valid scenarios for a position
export function getValidScenarios(position: Position): ScenarioConfig[] {
  const posIdx = POSITIONS.indexOf(position)

  return SCENARIOS.filter(s => {
    switch (s.id) {
      case 'RFI':
        // Everyone can RFI except BB (already posted)
        return position !== 'BB'
      case 'vs-open':
        // Need someone before us to open
        return posIdx > 0
      case 'vs-3bet':
        // Need someone after us to 3bet
        return posIdx < POSITIONS.length - 1
      case 'vs-4bet':
        // Need to be able to 3bet (have opener before) and face 4bet
        return posIdx > 0
      case '3bet-defense':
        return posIdx > 0
      default:
        return true
    }
  })
}
