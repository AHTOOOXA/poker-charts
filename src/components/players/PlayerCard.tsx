import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RegTypeBadge } from './RegTypeBadge'
import type { PlayerStats, Stake } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'
import { getDatesCovered } from '@/data/players'
import { Copy, Check, Trophy } from 'lucide-react'

const STAKE_COLORS: Record<Stake, string> = {
  nl10: 'bg-emerald-500',
  nl25: 'bg-blue-500',
  nl50: 'bg-violet-500',
  nl100: 'bg-amber-500',
  nl200: 'bg-red-500',
}

// Format large numbers: 271750 -> "272K", 1500 -> "1.5K", 500 -> "500"
function formatNumber(n: number): string {
  if (n >= 100000) {
    return `${Math.round(n / 1000)}K`
  }
  if (n >= 1000) {
    const k = n / 1000
    return `${k.toFixed(1).replace(/\.0$/, '')}K`
  }
  return n.toString()
}

// Format rank with suffix: 1 -> "1st", 2 -> "2nd", etc.
function formatRank(n: number): string {
  if (n === 0) return '–'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Generate copy text for HUD notes
// Format: GRINDER 7K/d 87K NL10:83% NL25:17%
function generateCopyText(player: PlayerStats): string {
  const regType = player.reg_type.toUpperCase()

  const handsPerDay = player.days_active > 0
    ? formatNumber(Math.round(player.estimated_hands / player.days_active))
    : '0'

  const totalHands = formatNumber(player.estimated_hands)

  // Calculate stake percentages
  const stakeEntries = STAKES.map(stake => ({
    stake,
    count: player.stakes[stake] ?? 0,
  })).filter(e => e.count > 0)

  const totalStakeEntries = stakeEntries.reduce((sum, e) => sum + e.count, 0)

  const stakesStr = stakeEntries
    .map(({ stake, count }) => {
      const pct = Math.round((count / totalStakeEntries) * 100)
      return `${STAKE_LABELS[stake]}:${pct}%`
    })
    .join(' ')

  return `${regType} ${handsPerDay}/d ${totalHands} ${stakesStr}`
}

interface PlayerCardProps {
  player: PlayerStats
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [copied, setCopied] = useState(false)
  const allDates = getDatesCovered()

  // Calculate stake hands with percentages
  const stakeHands = STAKES.map(stake => ({
    stake,
    hands: player.hands_by_stake[stake] ?? 0,
  })).filter(e => e.hands > 0)

  const totalStakeHands = stakeHands.reduce((sum, e) => sum + e.hands, 0)

  const stakesWithPct = stakeHands.map(({ stake, hands }) => ({
    stake,
    hands,
    pct: Math.round((hands / totalStakeHands) * 100),
  }))

  // Hands per day
  const handsPerDay = player.days_active > 0
    ? Math.round(player.estimated_hands / player.days_active)
    : 0

  // Max hands for heat scaling
  const handsValues = Object.values(player.hands_by_date)
  const maxHands = handsValues.length > 0 ? Math.max(...handsValues) : 1

  const copyText = generateCopyText(player)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/50 hover:border-neutral-700/50 transition-colors">
      {/* Header: Name + Badge + Copy text + Copy button */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white truncate">{player.nickname}</h3>
        <RegTypeBadge type={player.reg_type} className="shrink-0" />
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">{copyText}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
            title={`Copy: ${copyText}`}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Row 1: Volume + Activity */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Section title="Volume">
          <StatRow label="Hands" value={formatNumber(player.estimated_hands)} />
          <StatRow label="Intensity" value={`${formatNumber(handsPerDay)}/d`} />
          <StatRow label="Points" value={formatNumber(Math.round(player.total_points))} />
        </Section>

        <Section title="Activity">
          <StatRow label="Days" value={`${player.days_active}/${allDates.length}`} secondary={`${Math.round((player.days_active / allDates.length) * 100)}%`} />
          <StatRow label="Streak" value={`${player.current_streak}d`} secondary={`best: ${player.longest_streak}d`} />
        </Section>
      </div>

      {/* Row 2: Stakes + Placements */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Section title="Stakes">
          <div className="space-y-1.5">
            {stakesWithPct.map(({ stake, hands, pct }) => (
              <div key={stake} className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-10 shrink-0">{STAKE_LABELS[stake]}</span>
                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', STAKE_COLORS[stake])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-400 w-10 text-right tabular-nums">{formatNumber(hands)}</span>
                <span className="text-xs text-neutral-600 w-8 text-right tabular-nums">{pct}%</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Placements">
          {/* Medal row */}
          <div className="flex items-center gap-3 mb-2">
            <Medal place={1} count={player.top1} />
            <Medal place={2} count={player.top3 - player.top1} />
            <Medal place={3} count={player.top10 - player.top3} label="4-10" />
          </div>
          <StatRow label="Top 50" value={player.top50} />
          <StatRow label="Best" value={formatRank(player.best_rank)} secondary={`avg: ${formatRank(Math.round(player.avg_rank))}`} />
          <StatRow label="Prize" value={`$${Math.round(player.total_prize)}`} />
        </Section>
      </div>

      {/* Row 3: Timeline */}
      <Section title="Timeline" subtitle={`${formatDate(player.first_seen)} → ${formatDate(player.last_seen)}`}>
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
      </Section>
    </div>
  )
}

// Section wrapper with title
function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">{title}</span>
        {subtitle && <span className="text-[10px] text-neutral-600">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

// Stat row: label + value + optional secondary
function StatRow({
  label,
  value,
  secondary,
}: {
  label: string
  value: string | number
  secondary?: string
}) {
  return (
    <div className="flex items-baseline text-xs">
      <span className="text-neutral-500 w-14 shrink-0">{label}</span>
      <span className="text-neutral-200 tabular-nums">{value}</span>
      {secondary && <span className="text-neutral-600 text-[10px] ml-1.5">{secondary}</span>}
    </div>
  )
}

// Medal display for placements
function Medal({ place, count, label }: { place: 1 | 2 | 3; count: number; label?: string }) {
  const colors = {
    1: 'text-amber-400',
    2: 'text-neutral-400',
    3: 'text-amber-600',
  }

  const labels = {
    1: '1st',
    2: '2-3',
    3: label || '4-10',
  }

  return (
    <div className="flex items-center gap-1">
      <Trophy className={cn('w-3 h-3', colors[place])} />
      <span className="text-xs text-neutral-400 tabular-nums">{count}</span>
      <span className="text-[9px] text-neutral-600">{labels[place]}</span>
    </div>
  )
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Convert JS getDay() (0=Sun) to Monday-based (0=Mon)
function getMondayBasedDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

// Get heat color based on hands played (GitHub-style)
function getHeatColorWithText(hands: number, maxHands: number): string {
  if (hands === 0) return 'bg-neutral-800/50 text-neutral-600'

  const intensity = Math.min(hands / maxHands, 1)

  if (intensity > 0.75) return 'bg-emerald-500/50 text-emerald-300'
  if (intensity > 0.5) return 'bg-emerald-500/35 text-emerald-400'
  if (intensity > 0.25) return 'bg-emerald-500/25 text-emerald-400'
  return 'bg-emerald-500/15 text-emerald-500'
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

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(date)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Find months that have their 1st day in each week
  const getMonthStartingInWeek = (week: (string | null)[]): number | null => {
    for (const date of week) {
      if (date) {
        const d = new Date(date + 'T00:00:00')
        if (d.getDate() === 1) {
          return d.getMonth()
        }
      }
    }
    return null
  }

  // Get the primary month for a week (first valid date)
  const getWeekMonth = (week: (string | null)[]): number | null => {
    const firstDate = week.find(d => d !== null)
    if (!firstDate) return null
    return new Date(firstDate + 'T00:00:00').getMonth()
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Track which months we've shown labels for
  const shownMonths = new Set<number>()

  return (
    <div className="flex gap-1">
      {/* Weekday labels */}
      <div className="flex flex-col gap-1 text-[9px] text-neutral-500 pr-1 mt-4">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="h-6 flex items-center">
            {i % 2 === 1 ? day : ''}
          </div>
        ))}
      </div>

      {/* Week columns with month labels */}
      {weeks.map((week, weekIdx) => {
        // Show month label when: 1) first week, or 2) a month's 1st day appears in this week
        const monthStarting = getMonthStartingInWeek(week)
        const weekMonth = getWeekMonth(week)

        let monthLabel = ''
        let isNewMonth = false

        // First week - show its month
        if (weekIdx === 0 && weekMonth !== null && !shownMonths.has(weekMonth)) {
          monthLabel = monthNames[weekMonth]
          shownMonths.add(weekMonth)
        }
        // A new month starts in this week
        if (monthStarting !== null && !shownMonths.has(monthStarting)) {
          monthLabel = monthNames[monthStarting]
          shownMonths.add(monthStarting)
          isNewMonth = true
        }

        return (
          <div key={weekIdx} className={cn('flex flex-col gap-1', isNewMonth && weekIdx > 0 && 'ml-2')}>
            {/* Month label */}
            <div className="h-4 text-[9px] text-neutral-500 flex items-center justify-center">
              {monthLabel}
            </div>
            {WEEKDAYS.map((_, dayIdx) => {
              const date = week[dayIdx]
              if (!date) {
                return <div key={dayIdx} className="w-8 h-6" />
              }

              const hands = handsByDate[date] ?? 0
              const heatClass = getHeatColorWithText(hands, maxHands)

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'w-8 h-6 rounded text-[8px] flex items-center justify-center font-medium tabular-nums',
                    heatClass
                  )}
                  title={`${formatDateShort(date)}: ${hands > 0 ? formatNumber(hands) + ' hands' : 'no activity'}`}
                >
                  {hands > 0 ? formatNumber(hands) : '–'}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
