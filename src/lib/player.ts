import { formatNumber } from '@/lib/format'
import type { PlayerStats, PlayerType } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'

// Classify player into 3 tiers based on volume
export function classifyPlayer(player: PlayerStats): PlayerType {
  const hands = player.estimated_hands
  const days = player.days_active
  const hpd = days > 0 ? hands / days : 0

  if (hpd >= 25000) return 'HV'
  if (hands >= 60000) return 'REG'
  return 'REC'
}

// Generate copy text summary
export function generateCopyText(player: PlayerStats): string {
  const playerType = classifyPlayer(player)

  const handsPerDay = player.days_active > 0
    ? formatNumber(Math.round(player.estimated_hands / player.days_active))
    : '0'
  const totalHands = formatNumber(player.estimated_hands)

  const rushHands = player.rush.estimated_hands
  const regularHands = player.regular.estimated_hands
  const ninemaxHands = player['9max'].estimated_hands
  const totalGameHands = rushHands + regularHands + ninemaxHands

  let gameType = ''
  if (totalGameHands > 0) {
    const rushPct = rushHands / totalGameHands
    if (rushPct >= 0.7) gameType = 'RUSH'
    else if (rushPct <= 0.3) gameType = 'HOLDEM'
    else gameType = 'HYBRID'
  }

  const primaryStake = STAKE_LABELS[player.primary_stake] || 'NL?'
  const playedStakes = STAKES.filter(stake => (player.stakes[stake] ?? 0) > 0)
  let stakeStr = `@${primaryStake}`

  if (playedStakes.length > 1) {
    const minStake = STAKE_LABELS[playedStakes[0]]
    const maxStake = STAKE_LABELS[playedStakes[playedStakes.length - 1]]
    stakeStr = `@${primaryStake} ${minStake}-${maxStake}`
  }

  return `${playerType} ${handsPerDay}/d ${totalHands} ${gameType} ${stakeStr}`.replace(/\s+/g, ' ').trim()
}
