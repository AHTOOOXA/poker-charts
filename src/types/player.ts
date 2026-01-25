export type RegType = 'grinder' | 'regular' | 'casual' | 'new' | 'inactive'

export type Stake = 'nl2' | 'nl5' | 'nl10' | 'nl25' | 'nl50' | 'nl100' | 'nl200' | 'nl500' | 'nl1000' | 'nl2000'

export const STAKES: Stake[] = ['nl2', 'nl5', 'nl10', 'nl25', 'nl50', 'nl100', 'nl200', 'nl500', 'nl1000', 'nl2000']

export const STAKE_LABELS: Record<Stake, string> = {
  nl2: 'NL2',
  nl5: 'NL5',
  nl10: 'NL10',
  nl25: 'NL25',
  nl50: 'NL50',
  nl100: 'NL100',
  nl200: 'NL200',
  nl500: 'NL500',
  nl1000: 'NL1K',
  nl2000: 'NL2K',
}

export const REG_TYPES: RegType[] = ['grinder', 'regular', 'casual', 'new', 'inactive']

export const REG_TYPE_LABELS: Record<RegType, string> = {
  grinder: 'Grinder',
  regular: 'Regular',
  casual: 'Casual',
  new: 'New',
  inactive: 'Inactive',
}

// Individual leaderboard entry
export interface LeaderboardEntry {
  date: string
  stake: Stake
  rank: number
  points: number
  prize: number
}

// Game type breakdown (used for both rush and cash)
export interface GameTypeStats {
  entries: number
  estimated_hands: number
  total_points: number
  total_prize: number
  hands_by_stake: Partial<Record<Stake, number>>
  // Placements
  top1: number
  top3: number
  top10: number
  top50: number
  best_rank: number
  avg_rank: number
  // Individual entries
  entries_list: LeaderboardEntry[]
}

export interface PlayerStats {
  nickname: string
  entries: number
  days_active: number
  first_seen: string
  last_seen: string
  activity_rate: number
  entries_per_day: number
  current_streak: number
  longest_streak: number
  dates: string[]
  stakes: Partial<Record<Stake, number>>
  hands_by_stake: Partial<Record<Stake, number>>
  primary_stake: Stake
  stake_count: number
  reg_type: RegType
  total_points: number
  estimated_hands: number
  hands_by_date: Record<string, number>
  // Placement stats
  top1: number
  top3: number
  top10: number
  top50: number
  best_rank: number
  avg_rank: number
  total_prize: number
  // Game type breakdowns
  rush: GameTypeStats
  regular: GameTypeStats
}

export interface StatsData {
  generated_at: string
  latest_date: string
  summary: {
    total_entries: number
    unique_players: number
    dates_covered: string[]
    stakes_covered: Stake[]
    files_processed: number
    reg_counts: Record<RegType, number>
  }
  players: PlayerStats[]
}

export interface PlayerFilters {
  search: string
  regTypes: RegType[]
  stakes: Stake[]
}
