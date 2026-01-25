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
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-2">
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
        {player.rush.estimated_hands > 0 && (
          <GameTypeSection title="Rush & Cash" stats={player.rush} />
        )}
        {player.regular.estimated_hands > 0 && (
          <GameTypeSection title="Hold'em" stats={player.regular} />
        )}
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

// Game type section (Rush or Holdem) - self-contained with stakes
function GameTypeSection({ title, stats }: { title: string; stats: GameTypeStats }) {
  const [expanded, setExpanded] = useState(false)

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
    <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50 flex flex-col">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">{title}</span>
        <span className="text-[10px] text-neutral-600">${Math.round(stats.total_prize)}</span>
      </div>

      {/* Total hands */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-sm text-neutral-200 font-medium tabular-nums">{formatNumber(stats.estimated_hands)}</span>
        <span className="text-[10px] text-neutral-500">hands</span>
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
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Leaderboard</span>
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
            <div className="flex items-center text-[10px] text-neutral-600 mb-2 px-1">
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
