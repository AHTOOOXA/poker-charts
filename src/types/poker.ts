export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
export type Rank = (typeof RANKS)[number]

export const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const
export type Position = (typeof POSITIONS)[number]

export const ACTIONS = ['fold', 'call', 'raise', '3bet', 'all-in'] as const
export type Action = (typeof ACTIONS)[number]

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
