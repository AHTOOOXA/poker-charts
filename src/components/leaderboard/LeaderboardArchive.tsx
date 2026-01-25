import { useMemo, useState } from 'react'
import { getLeaderboardResults, getDatesForStake, getStakesCovered, type GameType } from '@/data/players'
import { STAKES, STAKE_LABELS, type Stake, type RegType, type PlayerType } from '@/types/player'
import { RegTypeBadge } from '@/components/players/RegTypeBadge'
import { cn } from '@/lib/utils'

// Map old RegType to new PlayerType for display
const REG_TO_PLAYER_TYPE: Record<RegType, PlayerType> = {
  grinder: 'GRIND',
  regular: 'REG',
  casual: 'REC',
  new: 'REC',
  inactive: 'REC',
}

export function LeaderboardArchive() {
  const availableStakes = useMemo(() => {
    const covered = new Set(getStakesCovered())
    return STAKES.filter(s => covered.has(s))
  }, [])
  const [selectedStake, setSelectedStake] = useState<Stake>('nl100')
  const [gameType, setGameType] = useState<GameType>('rush')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const availableDates = useMemo(
    () => getDatesForStake(selectedStake, gameType),
    [selectedStake, gameType]
  )

  // Derive effective date - if selected date isn't valid, use first available
  const effectiveDate = availableDates.includes(selectedDate)
    ? selectedDate
    : availableDates[0] || ''

  const results = useMemo(() => {
    if (!effectiveDate) return []
    return getLeaderboardResults(effectiveDate, selectedStake, gameType)
  }, [effectiveDate, selectedStake, gameType])

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto">
      {/* Filters */}
      <div className="space-y-3 pb-4">
        {/* Game type + Stakes row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Game type toggle */}
          <button
            onClick={() => setGameType('rush')}
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
              gameType === 'rush'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-emerald-500/30'
            )}
          >
            Rush & Cash
          </button>
          <button
            onClick={() => setGameType('regular')}
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
              gameType === 'regular'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-sky-500/30'
            )}
          >
            Regular
          </button>

          <span className="text-neutral-700 mx-1">|</span>

          {/* Stake buttons */}
          {availableStakes.map(stake => (
            <button
              key={stake}
              onClick={() => setSelectedStake(stake)}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
                selectedStake === stake
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                  : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-violet-500/30'
              )}
            >
              {STAKE_LABELS[stake]}
            </button>
          ))}
        </div>

        {/* Date selector row */}
        <div className="flex items-center gap-2">
          <select
            value={effectiveDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-neutral-800/50 text-neutral-200 px-3 py-1 rounded text-xs border border-neutral-700/50 focus:outline-none focus:border-neutral-500 cursor-pointer"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
          <span className="text-neutral-500 text-xs">
            {results.length} players
          </span>
        </div>
      </div>

      {/* Results table */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        {results.length === 0 ? (
          <div className="text-neutral-500 text-center py-12 text-sm">
            No results for this selection
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 text-xs bg-neutral-900/50">
                  <th className="py-2 px-3 w-12 font-medium">#</th>
                  <th className="py-2 px-3 font-medium">Player</th>
                  <th className="py-2 px-3 text-right w-24 font-medium">Points</th>
                  <th className="py-2 px-3 text-right w-20 font-medium">Prize</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr
                    key={result.nickname}
                    className={cn(
                      'border-t border-neutral-800/30 transition-colors hover:bg-neutral-800/30',
                      result.rank <= 3 && 'bg-neutral-900/30'
                    )}
                  >
                    <td className="py-2 px-3">
                      {result.rank <= 3 ? (
                        <span className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                          result.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
                          result.rank === 2 && 'bg-neutral-400/20 text-neutral-300',
                          result.rank === 3 && 'bg-amber-600/20 text-amber-500'
                        )}>
                          {result.rank}
                        </span>
                      ) : (
                        <span className="text-neutral-500 pl-1.5">{result.rank}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-200 font-medium">{result.nickname}</span>
                        <RegTypeBadge type={REG_TO_PLAYER_TYPE[result.regType]} />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400 font-mono text-xs">
                      {result.points.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {result.prize > 0 ? (
                        <span className="text-emerald-400 font-semibold text-xs">
                          ${result.prize}
                        </span>
                      ) : (
                        <span className="text-neutral-700">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
