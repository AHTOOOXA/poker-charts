export type RegType = 'grinder' | 'regular' | 'casual' | 'new' | 'inactive'

export type Stake = 'nl10' | 'nl25' | 'nl50' | 'nl100' | 'nl200'

export const STAKES: Stake[] = ['nl10', 'nl25', 'nl50', 'nl100', 'nl200']

export const STAKE_LABELS: Record<Stake, string> = {
  nl10: 'NL10',
  nl25: 'NL25',
  nl50: 'NL50',
  nl100: 'NL100',
  nl200: 'NL200',
}

export const REG_TYPES: RegType[] = ['grinder', 'regular', 'casual', 'new', 'inactive']

export const REG_TYPE_LABELS: Record<RegType, string> = {
  grinder: 'Grinder',
  regular: 'Regular',
  casual: 'Casual',
  new: 'New',
  inactive: 'Inactive',
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
  primary_stake: Stake
  stake_count: number
  reg_type: RegType
  total_points: number
  estimated_hands: number
  hands_by_date: Record<string, number>
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
