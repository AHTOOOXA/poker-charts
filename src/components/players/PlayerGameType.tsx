import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatRank, formatDate } from '@/lib/format'
import type { GameTypeStats, Stake } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'

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

const VARIANT_STYLES = {
  rush: {
    border: 'border-amber-500/30',
    title: 'text-amber-500',
  },
  holdem: {
    border: 'border-emerald-500/30',
    title: 'text-emerald-500',
  },
}

interface GameTypeSectionProps {
  title: string
  stats: GameTypeStats
  variant: 'rush' | 'holdem'
}

export function GameTypeSection({ title, stats, variant }: GameTypeSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const styles = VARIANT_STYLES[variant]

  // Calculate stake hands with percentages
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

      {/* Leaderboard section */}
      <div className="mt-auto pt-3 border-t border-neutral-800/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs group"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Leaderboard</span>
          <ChevronDown className={cn('w-4 h-4 text-neutral-500 transition-transform', expanded && 'rotate-180')} />
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
            <div className="flex items-center text-xs text-neutral-600 mb-2 px-1">
              <span className="w-16">Date</span>
              <span className="w-12">Stake</span>
              <span className="w-10 text-right">Place</span>
              <span className="w-14 text-right">Points</span>
              <span className="w-12 text-right">Prize</span>
            </div>
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
                  <span className="w-16 text-neutral-500">{formatDate(entry.date)}</span>
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

interface GameTypeSkeletonProps {
  title: string
  variant: 'rush' | 'holdem'
}

export function GameTypeSkeleton({ title, variant }: GameTypeSkeletonProps) {
  const styles = {
    rush: { border: 'border-amber-500/10', title: 'text-amber-500/40' },
    holdem: { border: 'border-emerald-500/10', title: 'text-emerald-500/40' },
  }[variant]

  return (
    <div className={cn('p-2.5 rounded-lg bg-neutral-800/10 border flex flex-col', styles.border)}>
      <div className="flex items-baseline justify-between mb-2">
        <span className={cn('text-xs uppercase tracking-wide font-medium', styles.title)}>{title}</span>
      </div>
      <div className="flex-1 flex items-center justify-center py-6">
        <span className="text-xs text-neutral-600">No data yet</span>
      </div>
    </div>
  )
}
