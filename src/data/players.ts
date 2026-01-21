import type { PlayerStats, StatsData, PlayerFilters, RegType, Stake } from '@/types/player'
import statsData from '../../leaderboards/stats.json'

// Type the imported JSON
const data = statsData as StatsData

export function getAllPlayers(): PlayerStats[] {
  return data.players
}

export function getStatsData(): StatsData {
  return data
}

export function searchPlayers(
  players: PlayerStats[],
  query: string
): PlayerStats[] {
  if (!query.trim()) return players

  const lowerQuery = query.toLowerCase()
  return players.filter(p =>
    p.nickname.toLowerCase().includes(lowerQuery)
  )
}

export function filterByRegType(
  players: PlayerStats[],
  regTypes: RegType[]
): PlayerStats[] {
  if (regTypes.length === 0) return players
  return players.filter(p => regTypes.includes(p.reg_type))
}

export function filterByStake(
  players: PlayerStats[],
  stakes: Stake[]
): PlayerStats[] {
  if (stakes.length === 0) return players
  return players.filter(p => {
    // Player matches if they have any entries at the selected stakes
    return stakes.some(stake => (p.stakes[stake] ?? 0) > 0)
  })
}

export function applyFilters(
  players: PlayerStats[],
  filters: PlayerFilters
): PlayerStats[] {
  let result = players

  result = searchPlayers(result, filters.search)
  result = filterByRegType(result, filters.regTypes)
  result = filterByStake(result, filters.stakes)

  return result
}

export function sortByRelevance(
  players: PlayerStats[],
  query: string
): PlayerStats[] {
  if (!query.trim()) {
    // Default sort: by entries (most active first)
    return [...players].sort((a, b) => b.entries - a.entries)
  }

  const lowerQuery = query.toLowerCase()

  return [...players].sort((a, b) => {
    const aLower = a.nickname.toLowerCase()
    const bLower = b.nickname.toLowerCase()

    // Exact match first
    if (aLower === lowerQuery && bLower !== lowerQuery) return -1
    if (bLower === lowerQuery && aLower !== lowerQuery) return 1

    // Starts with query
    const aStarts = aLower.startsWith(lowerQuery)
    const bStarts = bLower.startsWith(lowerQuery)
    if (aStarts && !bStarts) return -1
    if (bStarts && !aStarts) return 1

    // Then by number of entries
    return b.entries - a.entries
  })
}

export function getDatesCovered(): string[] {
  return data.summary.dates_covered
}
