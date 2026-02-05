import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Distribution {
  min: number
  p25: number
  median: number
  p75: number
  max: number
}

interface PrizeLevel {
  prize: number
  ranks: string
  distribution: Distribution
  hands_no_hh: number
  bb100_no_hh: number
  is_top_value: boolean
  hands_max_hh?: number
  bb100_max_hh?: number
  extra_hands?: number | null
  marginal_bb100?: number | null
}

interface Stake {
  id: string
  name: string
  bb_value: number
  prize_levels: PrizeLevel[]
}

interface GameType {
  id: string
  name: string
  has_happy_hour: boolean
  pts_per_hand: number
  stakes: Stake[]
}

interface DayOfWeekData {
  easiest_day: string
  hardest_day: string
  variance_pct: number
  day_scores: Record<string, number>
}

interface RakebackData {
  generated_at: string
  day_of_week: Record<string, DayOfWeekData>
  game_types: GameType[]
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return n.toFixed(0)
}

function formatHandsCompact(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return n.toFixed(0)
}


function StakeTable({ stake, hasHappyHour }: { stake: Stake; hasHappyHour: boolean }) {
  // Show all prize levels
  const displayLevels = stake.prize_levels

  return (
    <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-500 text-xs bg-neutral-900/50">
            <th className="py-2 px-2 text-center font-medium">Ranks</th>
            <th className="py-2 px-2 text-right font-medium">Prize</th>
            <th className="py-2 px-2 text-right font-medium text-neutral-600 border-l border-neutral-800/50" title="Minimum score needed (easiest day)">Min</th>
            <th className="py-2 px-2 text-right font-medium" title="25th percentile">p25</th>
            <th className="py-2 px-2 text-right font-medium text-violet-400/70" title="Median score needed (typical day)">Med</th>
            <th className="py-2 px-2 text-right font-medium" title="75th percentile">p75</th>
            <th className="py-2 px-2 text-right font-medium text-neutral-600" title="Maximum score needed (hardest day)">Max</th>
            <th className="py-2 px-2 text-right font-medium border-l border-neutral-800/50">Hands</th>
            <th className="py-2 px-2 text-right font-medium">bb/100</th>
            {hasHappyHour && (
              <>
                <th className="py-2 px-2 text-right font-medium text-amber-500/70 border-l border-neutral-800/50">HH</th>
                <th className="py-2 px-2 text-right font-medium text-amber-500/70">bb/100</th>
              </>
            )}
            <th className="py-2 px-2 text-right font-medium text-cyan-400/70 border-l border-neutral-800/50" title="Extra hands needed vs tier below">+Hands</th>
            <th className="py-2 px-2 text-right font-medium text-cyan-400/70" title="Marginal bb/100: effective rakeback of only the extra hands needed to reach this tier from the one below">Δ</th>
          </tr>
        </thead>
        <tbody>
          {displayLevels.map((level, idx) => (
            <tr
              key={idx}
              className={cn(
                'border-t border-neutral-800/30 transition-colors hover:bg-neutral-800/30',
                level.is_top_value ? 'bg-emerald-500/5' : idx % 2 === 1 && 'bg-neutral-900/30'
              )}
            >
              <td className="py-1.5 px-2 text-center text-neutral-400 text-xs">
                {level.ranks}
              </td>
              <td className="py-1.5 px-2 text-right font-medium">
                {level.is_top_value && (
                  <span className="mr-0.5 text-emerald-500 text-xs">★</span>
                )}
                <span className={cn(level.is_top_value && 'text-emerald-400')}>
                  ${level.prize}
                </span>
              </td>
              <td className="py-1.5 px-2 text-right text-neutral-600 font-mono text-xs border-l border-neutral-800/50">
                {formatNumber(level.distribution.min)}
              </td>
              <td className="py-1.5 px-2 text-right text-neutral-400 font-mono text-xs">
                {formatNumber(level.distribution.p25)}
              </td>
              <td className="py-1.5 px-2 text-right text-violet-400 font-mono text-xs font-semibold">
                {formatNumber(level.distribution.median)}
              </td>
              <td className="py-1.5 px-2 text-right text-neutral-400 font-mono text-xs">
                {formatNumber(level.distribution.p75)}
              </td>
              <td className="py-1.5 px-2 text-right text-neutral-600 font-mono text-xs">
                {formatNumber(level.distribution.max)}
              </td>
              <td className="py-1.5 px-2 text-right text-neutral-400 font-mono text-xs border-l border-neutral-800/50">
                {formatHandsCompact(level.hands_no_hh)}
              </td>
              <td
                className={cn(
                  'py-1.5 px-2 text-right font-semibold text-xs',
                  level.is_top_value ? 'text-emerald-400' : 'text-neutral-200'
                )}
              >
                {level.bb100_no_hh.toFixed(2)}
              </td>
              {hasHappyHour && (
                <>
                  <td className="py-1.5 px-2 text-right text-amber-500/50 font-mono text-xs border-l border-neutral-800/50">
                    {formatHandsCompact(level.hands_max_hh ?? 0)}
                  </td>
                  <td className="py-1.5 px-2 text-right text-amber-400 font-semibold text-xs">
                    {level.bb100_max_hh?.toFixed(2)}
                  </td>
                </>
              )}
              <td className="py-1.5 px-2 text-right font-mono text-xs text-cyan-400/70 border-l border-neutral-800/50">
                {level.extra_hands != null ? formatHandsCompact(level.extra_hands) : '—'}
              </td>
              <td className="py-1.5 px-2 text-right font-mono text-xs text-cyan-400/70">
                {level.marginal_bb100 != null ? level.marginal_bb100.toFixed(1) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

export function RakebackAnalysis() {
  const [data, setData] = useState<RakebackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string>('rush')
  const [selectedStake, setSelectedStake] = useState<string | null>(null)

  useEffect(() => {
    fetch('/leaderboards/rakeback.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load rakeback data')
        return res.json()
      })
      .then((json: RakebackData) => {
        setData(json)
        const game = json.game_types.find(g => g.id === selectedGame)
        if (game?.stakes.length) {
          setSelectedStake(game.stakes[0].id)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (data) {
      const game = data.game_types.find(g => g.id === selectedGame)
      if (game?.stakes.length) {
        setSelectedStake(game.stakes[0].id)
      }
    }
  }, [selectedGame, data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Loading rakeback data...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error || 'No data'}</div>
      </div>
    )
  }

  const currentGame = data.game_types.find(g => g.id === selectedGame)
  const currentStake = currentGame?.stakes.find(s => s.id === selectedStake)
  const dowData = data.day_of_week?.[selectedGame]

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Day of week disclaimer */}
      {dowData && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-amber-400">💡</span>
            <div className="text-neutral-300">
              <span className="text-amber-300">Points vary ~10-18% by day.</span>
              {' '}
              <span className="text-emerald-400">{dowData.easiest_day}</span> tends to be easiest,
              {' '}
              <span className="text-red-400">{dowData.hardest_day}</span> hardest.
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 pb-4">
        {/* Game type + Stakes row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {data.game_types.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
                selectedGame === game.id
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-emerald-500/30'
              )}
            >
              {game.name}
            </button>
          ))}

          <span className="text-neutral-700 mx-1">|</span>

          {currentGame?.stakes.map(stake => (
            <button
              key={stake.id}
              onClick={() => setSelectedStake(stake.id)}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
                selectedStake === stake.id
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                  : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-violet-500/30'
              )}
            >
              {stake.name}
            </button>
          ))}
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <span className="text-emerald-400">★</span> Best value (top 3 bb/100)
          </span>
          <span className="text-cyan-400/70">+Hands / Δ = Extra volume &amp; marginal bb/100 vs tier below</span>
          {currentGame?.has_happy_hour && (
            <span className="text-amber-500/70">HH = Max happy hour bonus</span>
          )}
          {currentGame && (
            <span className="text-neutral-600">
              {currentGame.pts_per_hand} pts/hand
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        {currentStake && currentGame && (
          <StakeTable stake={currentStake} hasHappyHour={currentGame.has_happy_hour} />
        )}
      </div>
    </div>
  )
}
