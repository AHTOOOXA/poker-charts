export type RegType = 'grinder' | 'regular' | 'casual' | 'new' | 'inactive'

// Player classification by volume (3 tiers)
export type PlayerType = 'HV' | 'REG' | 'REC'

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

// Individual leaderboard entry (decoded format)
export interface LeaderboardEntry {
  date: string
  stake: Stake
  rank: number
  points: number
  prize: number
}

// Compact entry format from JSON: [dateIdx, stakeIdx, rank, points, prize]
export type CompactLeaderboardEntry = [number, number, number, number, number]

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
  // Individual entries (decoded)
  entries_list: LeaderboardEntry[]
}

// Raw game type stats from JSON (with compact entries)
export interface RawGameTypeStats {
  entries: number
  estimated_hands: number
  total_points: number
  total_prize: number
  hands_by_stake: Partial<Record<Stake, number>>
  top1: number
  top3: number
  top10: number
  top50: number
  best_rank: number
  avg_rank: number
  entries_list: CompactLeaderboardEntry[]
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
  '9max': GameTypeStats
}

// Raw player stats from JSON (with compact entries)
export interface RawPlayerStats {
  nickname: string
  entries: number
  days_active: number
  first_seen: string
  last_seen: string
  activity_rate: number
  entries_per_day: number
  current_streak: number
  longest_streak: number
  stakes: Partial<Record<Stake, number>>
  hands_by_stake: Partial<Record<Stake, number>>
  primary_stake: Stake
  stake_count: number
  reg_type: RegType
  total_points: number
  estimated_hands: number
  hands_by_date: Record<string, number>
  top1: number
  top3: number
  top10: number
  top50: number
  best_rank: number
  avg_rank: number
  total_prize: number
  rush: RawGameTypeStats
  regular: RawGameTypeStats
  '9max': RawGameTypeStats
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

// Raw stats data from JSON (with compact entries)
export interface RawStatsData {
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
  players: RawPlayerStats[]
}

export interface PlayerFilters {
  search: string
  regTypes: RegType[]
  stakes: Stake[]
}
