import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PrizeLevel {
  prize: number
  ranks: string
  count: number
  min_points: number
  max_points: number
  hands_no_hh: number
  bb100_no_hh: number
  is_top_value: boolean
  hands_max_hh?: number
  bb100_max_hh?: number
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
  stakes: Stake[]
}

interface DayOfWeek {
  day: string
  min: number
  avg: number
  max: number
  n: number
}

interface Anomaly {
  date: string
  points: number
  z_score: number
  type: 'high' | 'low'
}

interface RakebackData {
  generated_at: string
  game_types: GameType[]
  day_of_week: Record<string, Record<string, DayOfWeek[]>>
  anomalies: Record<string, Record<string, Anomaly[]>>
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return n.toFixed(0)
}

function StakeTable({ stake, hasHappyHour }: { stake: Stake; hasHappyHour: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 text-xs bg-neutral-900/50">
            <th className="py-2 px-3 text-right font-medium">Prize</th>
            <th className="py-2 px-3 text-center font-medium">Ranks</th>
            <th className="py-2 px-3 text-right font-medium">Pts Range</th>
            <th className="py-2 px-3 text-right font-medium">Hands</th>
            <th className="py-2 px-3 text-right font-medium">bb/100</th>
            {hasHappyHour && (
              <>
                <th className="py-2 px-3 text-right font-medium text-amber-500/70">HH Hands</th>
                <th className="py-2 px-3 text-right font-medium text-amber-500/70">HH bb/100</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {stake.prize_levels.map((level, idx) => (
            <tr
              key={idx}
              className={cn(
                'border-t border-neutral-800/30 transition-colors hover:bg-neutral-800/30',
                level.is_top_value && 'bg-emerald-500/10'
              )}
            >
              <td className="py-2 px-3 text-right font-medium">
                <span className={cn(level.is_top_value && 'text-emerald-400')}>
                  ${level.prize}
                </span>
                {level.is_top_value && (
                  <span className="ml-1 text-emerald-500">★</span>
                )}
              </td>
              <td className="py-2 px-3 text-center text-neutral-400">{level.ranks}</td>
              <td className="py-2 px-3 text-right text-neutral-500 font-mono text-xs">
                {formatNumber(level.min_points)}-{formatNumber(level.max_points)}
              </td>
              <td className="py-2 px-3 text-right text-neutral-400 font-mono text-xs">
                {formatNumber(level.hands_no_hh)}
              </td>
              <td
                className={cn(
                  'py-2 px-3 text-right font-semibold text-xs',
                  level.is_top_value ? 'text-emerald-400' : 'text-neutral-200'
                )}
              >
                {level.bb100_no_hh.toFixed(2)}
              </td>
              {hasHappyHour && (
                <>
                  <td className="py-2 px-3 text-right text-amber-500/50 font-mono text-xs">
                    {formatNumber(level.hands_max_hh ?? 0)}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-400 font-semibold text-xs">
                    {level.bb100_max_hh?.toFixed(2)}
                  </td>
                </>
              )}
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

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
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

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <span className="text-emerald-400">★</span> Best value (top 3 bb/100)
          </span>
          {currentGame?.has_happy_hour && (
            <span className="text-amber-500/70">HH = Max happy hour</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto -mx-4 px-4 space-y-6">
        {currentStake && currentGame && (
          <StakeTable stake={currentStake} hasHappyHour={currentGame.has_happy_hour} />
        )}

        {/* Day of Week patterns */}
        {selectedStake && data.day_of_week?.[selectedGame]?.[selectedStake] && (
          <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
            <div className="bg-neutral-900/50 px-3 py-2 text-xs font-medium text-neutral-400">
              Points to Win (Rank 1) by Day
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {data.day_of_week[selectedGame][selectedStake].map(d => (
                  <div key={d.day} className="bg-neutral-800/50 rounded px-2 py-1 text-xs">
                    <span className="text-neutral-400">{d.day}</span>
                    <span className="text-neutral-500 mx-1">|</span>
                    <span className="text-emerald-400">{formatNumber(d.min)}</span>
                    <span className="text-neutral-600">-</span>
                    <span className="text-neutral-300">{formatNumber(d.avg)}</span>
                    <span className="text-neutral-600">-</span>
                    <span className="text-red-400">{formatNumber(d.max)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-600">
                <span className="text-emerald-400">min</span> - avg - <span className="text-red-400">max</span> points needed
              </div>
            </div>
          </div>
        )}

        {/* Anomalies */}
        {selectedStake && data.anomalies?.[selectedGame]?.[selectedStake]?.length > 0 && (
          <div className="rounded-lg border border-neutral-800/50 overflow-hidden">
            <div className="bg-neutral-900/50 px-3 py-2 text-xs font-medium text-neutral-400">
              Unusual Days (easier/harder than normal)
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {data.anomalies[selectedGame][selectedStake].map(a => (
                  <div
                    key={a.date}
                    className={cn(
                      'rounded px-2 py-1 text-xs',
                      a.type === 'low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    <span>{a.date}</span>
                    <span className="ml-1 opacity-70">
                      {formatNumber(a.points)} pts {a.type === 'low' ? '📉' : '📈'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
