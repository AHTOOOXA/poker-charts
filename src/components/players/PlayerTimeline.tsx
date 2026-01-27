import { cn } from '@/lib/utils'
import { formatNumber, formatDate } from '@/lib/format'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Convert JS getDay() (0=Sun) to Monday-based (0=Mon)
function getMondayBasedDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

// Get heat color based on hands played
function getHeatColorWithText(hands: number, maxHands: number): string {
  if (hands === 0) return 'bg-neutral-800/50 text-neutral-600'

  const intensity = Math.min(hands / maxHands, 1)

  if (intensity > 0.75) return 'bg-emerald-500/50 text-emerald-300'
  if (intensity > 0.5) return 'bg-emerald-500/35 text-emerald-400'
  if (intensity > 0.25) return 'bg-emerald-500/25 text-emerald-400'
  return 'bg-emerald-500/15 text-emerald-500'
}

interface PlayerTimelineProps {
  dates: string[]
  handsByDate: Record<string, number>
  maxHands: number
  firstSeen: string
  lastSeen: string
}

export function PlayerTimeline({ dates, handsByDate, maxHands, firstSeen, lastSeen }: PlayerTimelineProps) {
  return (
    <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Timeline</span>
        <span className="text-xs text-neutral-600">{formatDate(firstSeen)} → {formatDate(lastSeen)}</span>
      </div>
      <GitHubCalendar dates={dates} handsByDate={handsByDate} maxHands={maxHands} />
    </div>
  )
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
  // Extend dates to show 1 more month ahead
  const lastDataDate = new Date(dates[dates.length - 1] + 'T00:00:00')
  const extendedDates = [...dates]

  const endDate = new Date(lastDataDate.getFullYear(), lastDataDate.getMonth() + 2, 0)
  const currentDate = new Date(lastDataDate)
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

    const isNewMonth: boolean = currentColumn === null ||
      month !== currentColumn.month ||
      year !== currentColumn.year

    if (dayOfWeek === 0 || isNewMonth) {
      if (currentColumn && currentColumn.days.some(d => d !== null)) {
        columns.push(currentColumn)
      }
      currentColumn = {
        month,
        year,
        days: [null, null, null, null, null, null, null],
        isFirstOfMonth: isNewMonth && (currentColumn !== null),
      }
    }

    if (currentColumn) {
      currentColumn.days[dayOfWeek] = date
    }
  }

  if (currentColumn && currentColumn.days.some(d => d !== null)) {
    columns.push(currentColumn)
  }

  const shownMonths = new Set<string>()
  const shownYears = new Set<number>()

  return (
    <div className="flex gap-1 overflow-hidden">
      {/* Weekday labels */}
      <div className="flex flex-col gap-1 text-xs text-neutral-500 pr-1 mt-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="w-8 h-6 flex items-center">{day}</div>
        ))}
      </div>

      {/* Columns with month labels */}
      {columns.map((col, colIdx) => {
        const monthKey = `${col.year}-${col.month}`
        let monthLabel = ''
        let showYear = false

        if (!shownMonths.has(monthKey)) {
          monthLabel = MONTH_NAMES[col.month]
          shownMonths.add(monthKey)

          const isFirstMonth = shownMonths.size === 1
          const isJanuary = col.month === 0
          if ((isFirstMonth || isJanuary) && !shownYears.has(col.year)) {
            showYear = true
            shownYears.add(col.year)
          }
        }

        return (
          <div key={colIdx} className={cn('flex flex-col gap-1', col.isFirstOfMonth && colIdx > 0 && 'ml-3')}>
            <div className="h-4 text-xs text-neutral-500 flex items-center justify-center gap-0.5">
              {monthLabel}
              {showYear && <span className="text-neutral-600">'{String(col.year).slice(-2)}</span>}
            </div>
            {WEEKDAYS.map((_, dayIdx) => {
              const date = col.days[dayIdx]
              if (!date) {
                return <div key={dayIdx} className="w-12 h-6" />
              }

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
                  title={isFuture ? `${formatDate(date)}: upcoming` : `${formatDate(date)}: ${hands > 0 ? formatNumber(hands) + ' hands' : 'no activity'}`}
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
