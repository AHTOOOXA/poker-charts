import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RegTypeBadge } from './RegTypeBadge'
import type { PlayerStats, Stake, GameTypeStats } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'
import { getDatesCovered } from '@/data/players'
import { Copy, Check, ChevronDown } from 'lucide-react'

const STAKE_COLORS: Record<Stake, string> = {
  nl2: 'bg-slate-400',
  nl5: 'bg-teal-500',
  nl10: 'bg-emerald-500',
  nl25: 'bg-blue-500',
  nl50: 'bg-violet-500',
  nl100: 'bg-amber-500',
  nl200: 'bg-red-500',
  nl500: 'bg-rose-600',
  nl1000: 'bg-pink-600',
  nl2000: 'bg-fuchsia-600',
}

// Format large numbers: 271750 -> "272k", 1500 -> "1.5k", 500 -> "500"
function formatNumber(n: number): string {
  if (n >= 100000) {
    return `${Math.round(n / 1000)}k`
  }
  if (n >= 1000) {
    const k = n / 1000
    return `${k.toFixed(1).replace(/\.0$/, '')}k`
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
// Format: GRINDER 7k/d 87k RUSH:85% NL10:83% NL25:17%
function generateCopyText(player: PlayerStats): string {
  const regType = player.reg_type.toUpperCase()

  const handsPerDay = player.days_active > 0
    ? formatNumber(Math.round(player.estimated_hands / player.days_active))
    : '0'

  const totalHands = formatNumber(player.estimated_hands)

  // Calculate dominant game type
  const rushHands = player.rush.estimated_hands
  const regularHands = player.regular.estimated_hands
  const totalGameHands = rushHands + regularHands

  let gameTypeStr = ''
  if (totalGameHands > 0) {
    const rushPct = Math.round((rushHands / totalGameHands) * 100)
    if (rushPct >= 50) {
      gameTypeStr = `RUSH:${rushPct}%`
    } else {
      gameTypeStr = `HOLDEM:${100 - rushPct}%`
    }
  }

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

  return `${regType} ${handsPerDay}/d ${totalHands} ${gameTypeStr} ${stakesStr}`.replace(/\s+/g, ' ').trim()
}

interface PlayerCardProps {
  player: PlayerStats
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [copied, setCopied] = useState(false)
  const allDates = getDatesCovered()

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
        <h3 className="text-lg font-semibold text-white truncate min-w-0">{player.nickname}</h3>
        <RegTypeBadge type={player.reg_type} className="shrink-0" />
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">{copyText}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
            title={copyText}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Row 1: Volume + Activity - Hero Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Volume */}
        <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
          <div className="text-2xl font-semibold text-neutral-100 tabular-nums">
            {formatNumber(player.estimated_hands)}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">hands</div>
          <div className="text-xs text-neutral-400 mt-2">
            {formatNumber(handsPerDay)}<span className="text-neutral-600">/day</span>
          </div>
        </div>

        {/* Activity */}
        <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-neutral-100 tabular-nums">{player.days_active}</span>
            <span className="text-sm text-neutral-500">of {allDates.length} days</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500/50 rounded-full"
              style={{ width: `${Math.round((player.days_active / allDates.length) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            {player.current_streak}d streak
            {player.longest_streak > player.current_streak && (
              <span className="text-neutral-600"> · best: {player.longest_streak}d</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Game Types (Rush & Cash / Hold'em) */}
      <div className="grid grid-cols-2 gap-3 mb-3 items-stretch">
        {player.rush.estimated_hands > 0 ? (
          <GameTypeSection title="Rush & Cash" stats={player.rush} variant="rush" />
        ) : (
          <GameTypeSkeleton title="Rush & Cash" variant="rush" />
        )}
        {player.regular.estimated_hands > 0 ? (
          <GameTypeSection title="Hold'em" stats={player.regular} variant="holdem" />
        ) : (
          <GameTypeSkeleton title="Hold'em" variant="holdem" />
        )}
      </div>

      {/* Row 3: Timeline */}
      <Section title="Timeline" subtitle={`${formatDate(player.first_seen)} → ${formatDate(player.last_seen)}`}>
        <GitHubCalendar
          dates={allDates}
          handsByDate={player.hands_by_date}
          maxHands={maxHands}
        />
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
        <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">{title}</span>
        {subtitle && <span className="text-xs text-neutral-600">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

// Skeleton placeholder when game type has no data
function GameTypeSkeleton({ title, variant }: { title: string; variant: 'rush' | 'holdem' }) {
  const variantStyles = {
    rush: {
      border: 'border-amber-500/10',
      title: 'text-amber-500/40',
    },
    holdem: {
      border: 'border-emerald-500/10',
      title: 'text-emerald-500/40',
    },
  }
  const styles = variantStyles[variant]

  return (
    <div className={cn('p-2.5 rounded-lg bg-neutral-800/10 border flex flex-col', styles.border)}>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <span className={cn('text-xs uppercase tracking-wide font-medium', styles.title)}>{title}</span>
      </div>

      {/* Placeholder content */}
      <div className="flex-1 flex items-center justify-center py-6">
        <span className="text-xs text-neutral-600">No data yet</span>
      </div>
    </div>
  )
}

// Game type section (Rush or Holdem) - self-contained with stakes
function GameTypeSection({ title, stats, variant }: { title: string; stats: GameTypeStats; variant: 'rush' | 'holdem' }) {
  const [expanded, setExpanded] = useState(false)

  // Variant colors: Rush = amber/orange, Holdem = emerald/green
  const variantStyles = {
    rush: {
      border: 'border-amber-500/30',
      title: 'text-amber-500',
      accent: 'bg-amber-500',
    },
    holdem: {
      border: 'border-emerald-500/30',
      title: 'text-emerald-500',
      accent: 'bg-emerald-500',
    },
  }
  const styles = variantStyles[variant]

  // Calculate stake hands with percentages for this game type
  const stakeHands = STAKES.map(stake => ({
    stake,
    hands: stats.hands_by_stake[stake] ?? 0,
  })).filter(e => e.hands > 0)

  const totalStakeHands = stakeHands.reduce((sum, e) => sum + e.hands, 0)

  const stakesWithPct = stakeHands.map(({ stake, hands }) => ({
    stake,
    hands,
    pct: Math.round((hands / totalStakeHands) * 100),
  }))

  // Calculate median rank (using avg_rank as proxy)
  const medianRank = Math.round(stats.avg_rank)

  return (
    <div className={cn('p-2.5 rounded-lg bg-neutral-800/30 border flex flex-col', styles.border)}>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <span className={cn('text-xs uppercase tracking-wide font-medium', styles.title)}>{title}</span>
        <span className="text-sm text-neutral-300 font-medium tabular-nums">${Math.round(stats.total_prize)}</span>
      </div>

      {/* Total hands */}
      <div className="text-sm text-neutral-200 font-medium tabular-nums mb-2">
        {formatNumber(stats.estimated_hands)}
      </div>

      {/* Stakes breakdown */}
      <div className="space-y-1.5 mb-4">
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

      {/* Leaderboard section - pushed to bottom */}
      <div className="mt-auto pt-3 border-t border-neutral-800/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs group"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Leaderboard</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-neutral-500 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>

        {/* Summary row */}
        <div className="flex items-baseline gap-4 text-xs mt-2">
          <div>
            <span className="text-neutral-500">best: </span>
            <span className="text-neutral-200 font-medium">{formatRank(stats.best_rank)}</span>
          </div>
          <div>
            <span className="text-neutral-500">median: </span>
            <span className="text-neutral-200 font-medium">{formatRank(medianRank)}</span>
          </div>
          <div className="ml-auto">
            <span className="text-neutral-600">{stats.entries} entries</span>
          </div>
        </div>

        {/* Expanded entries list */}
        {expanded && stats.entries_list && (
          <div className="mt-3 pt-3 border-t border-neutral-800/30">
            {/* Header */}
            <div className="flex items-center text-xs text-neutral-600 mb-2 px-1">
              <span className="w-16">Date</span>
              <span className="w-12">Stake</span>
              <span className="w-10 text-right">Place</span>
              <span className="w-14 text-right">Points</span>
              <span className="w-12 text-right">Prize</span>
            </div>
            {/* Entries */}
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {stats.entries_list.map((entry, idx) => (
                <div
                  key={`${entry.date}-${entry.stake}-${idx}`}
                  className={cn(
                    'flex items-center text-xs px-1 py-1 rounded',
                    entry.rank <= 3 && 'bg-amber-500/10',
                    entry.rank > 3 && entry.rank <= 10 && 'bg-emerald-500/5'
                  )}
                >
                  <span className="w-16 text-neutral-500">{formatDateCompact(entry.date)}</span>
                  <span className="w-12 text-neutral-400">{STAKE_LABELS[entry.stake]}</span>
                  <span className={cn(
                    'w-10 text-right tabular-nums font-medium',
                    entry.rank === 1 && 'text-amber-400',
                    entry.rank === 2 && 'text-neutral-300',
                    entry.rank === 3 && 'text-amber-600',
                    entry.rank > 3 && 'text-neutral-400'
                  )}>
                    {formatRank(entry.rank)}
                  </span>
                  <span className="w-14 text-right text-neutral-500 tabular-nums">{formatNumber(Math.round(entry.points))}</span>
                  <span className="w-12 text-right text-neutral-400 tabular-nums">
                    {entry.prize > 0 ? `$${Math.round(entry.prize)}` : '–'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format date compact: 2026-01-15 -> "Jan 15"
function formatDateCompact(dateStr: string): string {
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
  // Extend dates to show 1 more month ahead (to avoid overflow)
  const lastDataDate = new Date(dates[dates.length - 1] + 'T00:00:00')
  const extendedDates = [...dates]

  // Add dates for 1 more month
  const endDate = new Date(lastDataDate.getFullYear(), lastDataDate.getMonth() + 2, 0)
  let currentDate = new Date(lastDataDate)
  currentDate.setDate(currentDate.getDate() + 1)

  while (currentDate <= endDate) {
    extendedDates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Continue until end of that week (Sunday)
  while (getMondayBasedDay(currentDate) !== 0) {
    extendedDates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Track which dates are "future" (beyond actual data)
  const lastRealDate = dates[dates.length - 1]

  // Build columns that break at month boundaries
  type Column = {
    month: number
    year: number
    days: (string | null)[]
    isFirstOfMonth: boolean
  }

  const columns: Column[] = []
  let currentColumn: Column | null = null

  for (const date of extendedDates) {
    const d = new Date(date + 'T00:00:00')
    const dayOfWeek = getMondayBasedDay(d)
    const month = d.getMonth()
    const year = d.getFullYear()

    // Check if this is a new month
    const isNewMonth: boolean = currentColumn === null ||
      month !== currentColumn.month ||
      year !== currentColumn.year

    // Start new column if: new week (Monday) OR new month
    if (dayOfWeek === 0 || isNewMonth) {
      // Save current column if exists and has data
      if (currentColumn && currentColumn.days.some(d => d !== null)) {
        columns.push(currentColumn)
      }
      // Start new column
      currentColumn = {
        month,
        year,
        days: [null, null, null, null, null, null, null],
        isFirstOfMonth: isNewMonth && (currentColumn !== null),
      }
    }

    // Add date to current column at correct weekday position
    if (currentColumn) {
      currentColumn.days[dayOfWeek] = date
    }
  }

  // Don't forget the last column
  if (currentColumn && currentColumn.days.some(d => d !== null)) {
    columns.push(currentColumn)
  }

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Track which months and years we've shown labels for
  const shownMonths = new Set<string>()
  const shownYears = new Set<number>()

  return (
    <div className="flex gap-1 overflow-hidden">
      {/* Weekday labels */}
      <div className="flex flex-col gap-1 text-xs text-neutral-500 pr-1 mt-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="w-8 h-6 flex items-center">
            {day}
          </div>
        ))}
      </div>

      {/* Columns with month labels */}
      {columns.map((col, colIdx) => {
        const monthKey = `${col.year}-${col.month}`
        let monthLabel = ''
        let showYear = false

        // Show month label on first column of each month
        if (!shownMonths.has(monthKey)) {
          monthLabel = monthNames[col.month]
          shownMonths.add(monthKey)

          // Show year on: first month shown OR every January
          const isFirstMonth = shownMonths.size === 1
          const isJanuary = col.month === 0
          if ((isFirstMonth || isJanuary) && !shownYears.has(col.year)) {
            showYear = true
            shownYears.add(col.year)
          }
        }

        return (
          <div key={colIdx} className={cn('flex flex-col gap-1', col.isFirstOfMonth && colIdx > 0 && 'ml-3')}>
            {/* Month label with optional year */}
            <div className="h-4 text-xs text-neutral-500 flex items-center justify-center gap-0.5">
              {monthLabel}
              {showYear && <span className="text-neutral-600">'{String(col.year).slice(-2)}</span>}
            </div>
            {WEEKDAYS.map((_, dayIdx) => {
              const date = col.days[dayIdx]
              if (!date) {
                return <div key={dayIdx} className="w-12 h-6" />
              }

              // Check if this is a future date (beyond actual data)
              const isFuture = date > lastRealDate

              const hands = handsByDate[date] ?? 0
              const heatClass = isFuture
                ? 'bg-neutral-800/20 text-neutral-700'
                : getHeatColorWithText(hands, maxHands)

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'w-12 h-6 rounded text-xs flex items-center justify-center font-medium tabular-nums',
                    heatClass,
                    isFuture && 'opacity-40'
                  )}
                  title={isFuture ? `${formatDateShort(date)}: upcoming` : `${formatDateShort(date)}: ${hands > 0 ? formatNumber(hands) + ' hands' : 'no activity'}`}
                >
                  {isFuture ? '·' : (hands > 0 ? formatNumber(hands) : '–')}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
