import type {
  PlayerStats,
  StatsData,
  PlayerFilters,
  RegType,
  Stake,
  RawStatsData,
  RawPlayerStats,
  RawGameTypeStats,
  GameTypeStats,
  LeaderboardEntry,
  CompactLeaderboardEntry,
} from '@/types/player'
import { smartSearch } from '@/lib/search'
import rawStatsData from '../../leaderboards/stats.json'

// Decode compact entries_list format: [dateIdx, stakeIdx, rank, points, prize] -> LeaderboardEntry
function decodeEntriesList(
  compactEntries: CompactLeaderboardEntry[],
  dates: string[],
  stakes: Stake[]
): LeaderboardEntry[] {
  return compactEntries.map(([dateIdx, stakeIdx, rank, points, prize]) => ({
    date: dates[dateIdx],
    stake: stakes[stakeIdx],
    rank,
    points,
    prize,
  }))
}

// Decode a game type's stats
function decodeGameTypeStats(
  raw: RawGameTypeStats,
  dates: string[],
  stakes: Stake[]
): GameTypeStats {
  return {
    ...raw,
    entries_list: decodeEntriesList(raw.entries_list, dates, stakes),
  }
}

// Decode a player's stats
function decodePlayerStats(
  raw: RawPlayerStats,
  dates: string[],
  stakes: Stake[]
): PlayerStats {
  return {
    nickname: raw.nickname,
    entries: raw.entries,
    days_active: raw.days_active,
    first_seen: raw.first_seen,
    last_seen: raw.last_seen,
    activity_rate: raw.activity_rate,
    entries_per_day: raw.entries_per_day,
    current_streak: raw.current_streak,
    longest_streak: raw.longest_streak,
    stakes: raw.stakes,
    hands_by_stake: raw.hands_by_stake,
    primary_stake: raw.primary_stake,
    stake_count: raw.stake_count,
    reg_type: raw.reg_type,
    total_points: raw.total_points,
    estimated_hands: raw.estimated_hands,
    hands_by_date: raw.hands_by_date,
    top1: raw.top1,
    top3: raw.top3,
    top10: raw.top10,
    top50: raw.top50,
    best_rank: raw.best_rank,
    avg_rank: raw.avg_rank,
    total_prize: raw.total_prize,
    rush: decodeGameTypeStats(raw.rush, dates, stakes),
    regular: decodeGameTypeStats(raw.regular, dates, stakes),
  }
}

// Decode the entire stats data
function decodeStatsData(raw: RawStatsData): StatsData {
  const { dates_covered, stakes_covered } = raw.summary
  return {
    ...raw,
    players: raw.players.map(p => decodePlayerStats(p, dates_covered, stakes_covered)),
  }
}

// Type and decode the imported JSON
const data = decodeStatsData(rawStatsData as RawStatsData)

export function getAllPlayers(): PlayerStats[] {
  return data.players
}

export function getStatsData(): StatsData {
  return data
}

export interface PlayerSearchResult {
  players: PlayerStats[]
  /** True if keyboard layout conversion was used */
  usedLayoutConversion: boolean
}

/**
 * Search players with fuzzy matching and keyboard layout conversion
 * - Tolerates typos (e.g., "Smityg" matches "SmithyG")
 * - Handles wrong keyboard layout (e.g., Russian "ызшен" matches "smith")
 */
export function searchPlayers(
  players: PlayerStats[],
  query: string
): PlayerSearchResult {
  if (!query.trim()) {
    return { players, usedLayoutConversion: false }
  }

  const results = smartSearch(
    players,
    query,
    (p) => p.nickname,
    { threshold: 0.25 }
  )

  const usedLayoutConversion = results.some(r => r.matchType === 'layout')

  return {
    players: results.map(r => r.item),
    usedLayoutConversion,
  }
}

/** Simple search that returns just the filtered array (for backwards compatibility) */
export function searchPlayersSimple(
  players: PlayerStats[],
  query: string
): PlayerStats[] {
  return searchPlayers(players, query).players
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

export interface FilterResult {
  players: PlayerStats[]
  usedLayoutConversion: boolean
}

export function applyFilters(
  players: PlayerStats[],
  filters: PlayerFilters
): FilterResult {
  // Search first (includes fuzzy matching and layout conversion)
  const searchResult = searchPlayers(players, filters.search)
  let result = searchResult.players

  // Apply other filters
  result = filterByRegType(result, filters.regTypes)
  result = filterByStake(result, filters.stakes)

  return {
    players: result,
    usedLayoutConversion: searchResult.usedLayoutConversion,
  }
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
  // If there's a search query, results are already sorted by relevance from smartSearch
  // Only apply secondary sort when no search query
  if (query.trim()) {
    return players
  }

  const sorted = [...players]
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

export function getStakesCovered(): Stake[] {
  return data.summary.stakes_covered
}

export type GameType = 'rush' | 'regular'

export interface LeaderboardResult {
  nickname: string
  rank: number
  points: number
  prize: number
  regType: RegType
}

export function getLeaderboardResults(
  date: string,
  stake: Stake,
  gameType: GameType
): LeaderboardResult[] {
  const results: LeaderboardResult[] = []

  for (const player of data.players) {
    const gameStats = player[gameType]
    if (!gameStats) continue

    const entry = gameStats.entries_list.find(
      e => e.date === date && e.stake === stake
    )
    if (entry) {
      results.push({
        nickname: player.nickname,
        rank: entry.rank,
        points: entry.points,
        prize: entry.prize,
        regType: player.reg_type,
      })
    }
  }

  return results.sort((a, b) => a.rank - b.rank)
}

// Get available dates for a specific stake/game type combination
export function getDatesForStake(stake: Stake, gameType: GameType): string[] {
  const datesSet = new Set<string>()

  for (const player of data.players) {
    const gameStats = player[gameType]
    if (!gameStats) continue

    for (const entry of gameStats.entries_list) {
      if (entry.stake === stake) {
        datesSet.add(entry.date)
      }
    }
  }

  return Array.from(datesSet).sort().reverse()
}
