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

export type SortOption = 'hands' | 'prize' | 'entries' | 'days' | 'best_rank'

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'hands', label: 'Hands' },
  { value: 'prize', label: 'Prize $' },
  { value: 'entries', label: 'Entries' },
  { value: 'days', label: 'Days Active' },
  { value: 'best_rank', label: 'Best Rank' },
]

export function sortPlayers(
  players: PlayerStats[],
  sortBy: SortOption,
  query: string
): PlayerStats[] {
  const sorted = [...players]

  // If there's a search query, prioritize relevance first
  if (query.trim()) {
    const lowerQuery = query.toLowerCase()
    sorted.sort((a, b) => {
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

      return 0
    })
  }

  // Then apply selected sort
  return sorted.sort((a, b) => {
    switch (sortBy) {
      case 'hands':
        return b.estimated_hands - a.estimated_hands
      case 'prize':
        return b.total_prize - a.total_prize
      case 'entries':
        return b.entries - a.entries
      case 'days':
        return b.days_active - a.days_active
      case 'best_rank':
        // Lower rank is better, 0 means no rank
        if (a.best_rank === 0) return 1
        if (b.best_rank === 0) return -1
        return a.best_rank - b.best_rank
      default:
        return 0
    }
  })
}

// Keep for backwards compatibility
export function sortByRelevance(
  players: PlayerStats[],
  query: string
): PlayerStats[] {
  return sortPlayers(players, 'hands', query)
}

export function getDatesCovered(): string[] {
  return data.summary.dates_covered
}
