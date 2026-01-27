import type { Action, Position, Provider } from '@/types/poker'
import { POSITIONS } from '@/types/poker'
import { POSTFLOP_ORDER } from '@/constants/poker'
import { getChart, type Chart } from '@/data/ranges'

type PotType = 'srp' | '3bet'

/**
 * Filter a chart to only include hands with specific actions
 */
export function filterChartByActions(
  chart: Chart | null,
  allowedActions: Action[]
): Chart {
  if (!chart) return {}

  const filtered: Chart = {}
  for (const [hand, cell] of Object.entries(chart)) {
    const actions = Array.isArray(cell) ? cell : [cell]
    const hasAllowedAction = actions.some((a) => allowedActions.includes(a))
    if (hasAllowedAction) {
      // Keep only the allowed actions
      if (Array.isArray(cell)) {
        const filteredActions = cell.filter((a) => allowedActions.includes(a))
        if (filteredActions.length === 1) {
          filtered[hand] = filteredActions[0]
        } else if (filteredActions.length > 1) {
          filtered[hand] = filteredActions as [Action, Action]
        }
      } else if (allowedActions.includes(cell)) {
        filtered[hand] = cell
      }
    }
  }
  return filtered
}

/**
 * Get the preflop position index (0 = UTG, 5 = BB)
 */
function getPositionIndex(position: Position): number {
  return POSITIONS.indexOf(position)
}

/**
 * Determine if position A is "earlier" than position B (acts first preflop)
 * UTG is earliest (0), BB is latest (5)
 */
function isEarlierPosition(a: Position, b: Position): boolean {
  return getPositionIndex(a) < getPositionIndex(b)
}

/**
 * Get the postflop position order (who acts first postflop)
 * Postflop order: SB, BB, UTG, MP, CO, BTN
 * Return: true if A acts before B postflop (A is OOP relative to B)
 */
export function isOopRelativeTo(a: Position, b: Position): boolean {
  return POSTFLOP_ORDER.indexOf(a) < POSTFLOP_ORDER.indexOf(b)
}

/**
 * Get valid IP positions for a given OOP position
 * IP must act after OOP postflop
 */
export function getValidIpPositions(oopPosition: Position): Position[] {
  const oopIdx = POSTFLOP_ORDER.indexOf(oopPosition)
  return POSTFLOP_ORDER.slice(oopIdx + 1)
}

/**
 * Get valid OOP positions for a given IP position
 * OOP must act before IP postflop
 */
export function getValidOopPositions(ipPosition: Position): Position[] {
  const ipIdx = POSTFLOP_ORDER.indexOf(ipPosition)
  return POSTFLOP_ORDER.slice(0, ipIdx)
}

export interface ResolvedRanges {
  oopRange: Chart
  ipRange: Chart
  oopDescription: string
  ipDescription: string
  isValid: boolean
  error?: string
}

/**
 * Resolve which ranges to use for OOP and IP based on pot type
 *
 * SRP (Single Raised Pot):
 * - OOP opened (RFI), IP called (vs-open call)
 * - OOP range = OOP's RFI range (raise/allin)
 * - IP range = IP's vs-open range against OOP (call only)
 *
 * 3bet Pot:
 * - OOP opened, IP 3bet, OOP called
 * - OOP range = OOP's vs-3bet range against IP (call only)
 * - IP range = IP's vs-open range against OOP (raise/allin = 3bet)
 */
export function resolveRanges(
  provider: Provider,
  potType: PotType,
  oopPosition: Position,
  ipPosition: Position
): ResolvedRanges {
  // Validate positions
  if (oopPosition === ipPosition) {
    return {
      oopRange: {},
      ipRange: {},
      oopDescription: '',
      ipDescription: '',
      isValid: false,
      error: 'OOP and IP cannot be the same position',
    }
  }

  // Determine who opened based on preflop position (earlier position opens)
  // In SRP: the earlier position opened
  // In 3bet: the earlier position opened, later position 3bet

  if (potType === 'srp') {
    // SRP: OOP opened, IP called
    // But wait - OOP might not be the opener. Let's think about this:
    // If CO opens and BTN calls: CO = OOP (acts first postflop), BTN = IP
    // CO opened, BTN called -> correct
    //
    // If BTN opens and BB calls: BB = OOP, BTN = IP
    // BTN opened, BB called -> correct (opener is IP here)
    //
    // So in SRP, the opener could be either OOP or IP depending on positions.
    // The caller is always the later actor preflop.

    // Determine opener: in SRP, the one with earlier preflop position opened
    const oopIsOpener = isEarlierPosition(oopPosition, ipPosition)

    if (oopIsOpener) {
      // OOP opened (RFI), IP called (vs-open)
      const oopChart = getChart(provider, oopPosition, 'RFI')
      const ipChart = getChart(provider, ipPosition, 'vs-open', oopPosition)

      return {
        oopRange: filterChartByActions(oopChart, ['raise', 'allin']),
        ipRange: filterChartByActions(ipChart, ['call']),
        oopDescription: `${oopPosition} RFI`,
        ipDescription: `${ipPosition} vs ${oopPosition} open (call)`,
        isValid: true,
      }
    } else {
      // IP opened (RFI), OOP called (vs-open from blinds usually)
      const ipChart = getChart(provider, ipPosition, 'RFI')
      const oopChart = getChart(provider, oopPosition, 'vs-open', ipPosition)

      return {
        oopRange: filterChartByActions(oopChart, ['call']),
        ipRange: filterChartByActions(ipChart, ['raise', 'allin']),
        oopDescription: `${oopPosition} vs ${ipPosition} open (call)`,
        ipDescription: `${ipPosition} RFI`,
        isValid: true,
      }
    }
  } else {
    // 3bet pot: Someone opened, someone 3bet, opener called
    // The 3bettor is the one who acts later preflop (responding to the open)

    const oopIsOpener = isEarlierPosition(oopPosition, ipPosition)

    if (oopIsOpener) {
      // OOP opened, IP 3bet, OOP called the 3bet
      // OOP range = vs-3bet (call)
      // IP range = vs-open (raise = 3bet)
      const oopChart = getChart(provider, oopPosition, 'vs-3bet', ipPosition)
      const ipChart = getChart(provider, ipPosition, 'vs-open', oopPosition)

      return {
        oopRange: filterChartByActions(oopChart, ['call']),
        ipRange: filterChartByActions(ipChart, ['raise', 'allin']),
        oopDescription: `${oopPosition} vs ${ipPosition} 3bet (call)`,
        ipDescription: `${ipPosition} 3bet vs ${oopPosition}`,
        isValid: true,
      }
    } else {
      // IP opened, OOP 3bet, IP called the 3bet
      // OOP range = vs-open (raise = 3bet)
      // IP range = vs-3bet (call)
      const oopChart = getChart(provider, oopPosition, 'vs-open', ipPosition)
      const ipChart = getChart(provider, ipPosition, 'vs-3bet', oopPosition)

      return {
        oopRange: filterChartByActions(oopChart, ['raise', 'allin']),
        ipRange: filterChartByActions(ipChart, ['call']),
        oopDescription: `${oopPosition} 3bet vs ${ipPosition}`,
        ipDescription: `${ipPosition} vs ${oopPosition} 3bet (call)`,
        isValid: true,
      }
    }
  }
}

/**
 * Count total combos in a range (non-fold hands)
 */
export function countRangeCombos(chart: Chart): number {
  let total = 0
  for (const [hand, cell] of Object.entries(chart)) {
    if (cell === 'fold') continue
    // Determine combo count based on hand type
    const isPair = hand.length === 2 && hand[0] === hand[1]
    const isSuited = hand.endsWith('s')
    const baseCombos = isPair ? 6 : isSuited ? 4 : 12
    total += baseCombos
  }
  return total
}
