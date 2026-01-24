import { cn } from '@/lib/utils'
import { RegTypeBadge } from './RegTypeBadge'
import type { PlayerStats, Stake } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'
import { getDatesCovered } from '@/data/players'

const STAKE_COLORS: Record<Stake, string> = {
  nl10: '#10b981',
  nl25: '#3b82f6',
  nl50: '#8b5cf6',
  nl100: '#f59e0b',
  nl200: '#ef4444',
}

// Format large numbers: 271750 -> "272K", 1500 -> "1.5K", 500 -> "500"
function formatHands(n: number): string {
  if (n >= 100000) {
    return `${Math.round(n / 1000)}K`
  }
  if (n >= 10000) {
    const k = n / 1000
    return `${k.toFixed(1).replace(/\.0$/, '')}K`
  }
  if (n >= 1000) {
    const k = n / 1000
    return `${k.toFixed(1).replace(/\.0$/, '')}K`
  }
  return n.toString()
}

// Get heat color based on hands played (GitHub-style)
function getHeatColor(hands: number, maxHands: number): string {
  if (hands === 0) return 'bg-neutral-800/50 text-neutral-600'

  const intensity = Math.min(hands / maxHands, 1)

  if (intensity > 0.75) return 'bg-emerald-500/50 text-emerald-300'
  if (intensity > 0.5) return 'bg-emerald-500/35 text-emerald-400'
  if (intensity > 0.25) return 'bg-emerald-500/25 text-emerald-400'
  return 'bg-emerald-500/15 text-emerald-500'
}

interface PlayerCardProps {
  player: PlayerStats
}

export function PlayerCard({ player }: PlayerCardProps) {
  const allDates = getDatesCovered()

  // Calculate max hands for heat scaling
  const handsValues = Object.values(player.hands_by_date)
  const maxHands = handsValues.length > 0 ? Math.max(...handsValues) : 1

  // Calculate stake percentages
  const stakeEntries = STAKES.map(stake => ({
    stake,
    count: player.stakes[stake] ?? 0,
  })).filter(e => e.count > 0)

  const totalStakeEntries = stakeEntries.reduce((sum, e) => sum + e.count, 0)

  // Build pie chart gradient
  let currentAngle = 0
  const gradientStops: string[] = []
  stakeEntries.forEach(({ stake, count }) => {
    const percentage = (count / totalStakeEntries) * 100
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage
    gradientStops.push(`${STAKE_COLORS[stake]} ${startAngle}% ${endAngle}%`)
    currentAngle = endAngle
  })
  const pieGradient = gradientStops.length > 0
    ? `conic-gradient(${gradientStops.join(', ')})`
    : 'bg-neutral-700'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Average hands per active day
  const handsPerDay = player.days_active > 0
    ? Math.round(player.estimated_hands / player.days_active)
    : 0

  return (
    <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/50 hover:border-neutral-700/50 transition-colors">
      {/* Header: nickname + badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{player.nickname}</h3>
        <RegTypeBadge type={player.reg_type} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <Stat label="Hands" value={formatHands(player.estimated_hands)} highlight />
        <Stat label="Hands/Day" value={formatHands(handsPerDay)} />
        <Stat label="Days" value={player.days_active} suffix={`/${allDates.length}`} />
        <Stat label="Streak" value={player.current_streak} suffix="d" />
        <Stat label="Activity" value={`${Math.round(player.activity_rate * 100)}%`} />
      </div>

      {/* Stakes + Calendar row */}
      <div className="flex gap-4 mb-4">
        {/* Stake distribution */}
        <div className="shrink-0">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Stakes</div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full shrink-0"
              style={{ background: pieGradient }}
            />
            <div className="flex flex-col gap-0.5">
              {stakeEntries.map(({ stake, count }) => (
                <div key={stake} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: STAKE_COLORS[stake] }}
                  />
                  <span className="text-neutral-400">{STAKE_LABELS[stake]}</span>
                  <span className="text-neutral-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity calendar with hand counts - GitHub style */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">
            Hands by Day
            <span className="text-neutral-600 ml-2 normal-case">
              (best streak: {player.longest_streak}d)
            </span>
          </div>
          <GitHubCalendar
            dates={allDates}
            handsByDate={player.hands_by_date}
            maxHands={maxHands}
          />
          {/* Heat legend */}
          <div className="flex items-center gap-2 mt-2 text-[9px] text-neutral-500">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded bg-neutral-800/50" />
              <div className="w-3 h-3 rounded bg-emerald-500/15" />
              <div className="w-3 h-3 rounded bg-emerald-500/25" />
              <div className="w-3 h-3 rounded bg-emerald-500/35" />
              <div className="w-3 h-3 rounded bg-emerald-500/50" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Footer: dates + primary stake */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>
          First <span className="text-neutral-400">{formatDate(player.first_seen)}</span>
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          Last <span className="text-neutral-400">{formatDate(player.last_seen)}</span>
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          Primary <span className="text-neutral-400">{STAKE_LABELS[player.primary_stake]}</span>
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          <span className="text-neutral-400">{player.entries}</span> entries
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          <span className="text-neutral-400">{formatHands(Math.round(player.total_points))}</span> pts
        </span>
      </div>
    </div>
  )
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Convert JS getDay() (0=Sun) to Monday-based (0=Mon)
function getMondayBasedDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

function GitHubCalendar({
  dates,
  handsByDate,
  maxHands,
}: {
  dates: string[]
  handsByDate: Record<string, number>
  maxHands: number
}) {
  // Build week columns (GitHub style: rows = weekdays, cols = weeks)
  const weeks: (string | null)[][] = []
  let currentWeek: (string | null)[] = []

  // Get day of week for first date (0 = Monday)
  const firstDate = new Date(dates[0] + 'T00:00:00')
  const firstDayOfWeek = getMondayBasedDay(firstDate)

  // Pad the first week with nulls
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null)
  }

  // Fill in dates
  for (const date of dates) {
    const d = new Date(date + 'T00:00:00')
    const dayOfWeek = getMondayBasedDay(d)

    // Start new week on Monday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(date)
  }

  // Push final week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex gap-1">
      {/* Weekday labels */}
      <div className="flex flex-col gap-1 text-[9px] text-neutral-500 pr-1">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="h-6 flex items-center">
            {i % 2 === 1 ? day : ''}
          </div>
        ))}
      </div>

      {/* Week columns */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-1">
          {WEEKDAYS.map((_, dayIdx) => {
            const date = week[dayIdx]
            if (!date) {
              return <div key={dayIdx} className="w-8 h-6" />
            }

            const hands = handsByDate[date] ?? 0
            const heatClass = getHeatColor(hands, maxHands)

            return (
              <div
                key={dayIdx}
                className={cn(
                  'w-8 h-6 rounded text-[8px] flex items-center justify-center font-medium tabular-nums',
                  heatClass
                )}
                title={`${formatDateShort(date)}: ${hands > 0 ? formatHands(hands) + ' hands' : 'no activity'}`}
              >
                {hands > 0 ? formatHands(hands) : '–'}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Stat({
  label,
  value,
  suffix = '',
  highlight = false,
}: {
  label: string
  value: string | number
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div className="text-center">
      <div className={cn(
        'text-lg font-semibold',
        highlight ? 'text-emerald-400' : 'text-white'
      )}>
        {value}
        {suffix && <span className="text-sm text-neutral-500">{suffix}</span>}
      </div>
      <div className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}
