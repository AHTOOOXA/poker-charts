import { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { RegTypeBadge } from './RegTypeBadge'
import { GameTypeSection, GameTypeSkeleton } from './PlayerGameType'
import { PlayerTimeline } from './PlayerTimeline'
import type { PlayerStats, PlayerType } from '@/types/player'
import { STAKE_LABELS, STAKES } from '@/types/player'
import { getDatesCovered } from '@/data/players'

// Classify player into 3 tiers based on volume
function classifyPlayer(player: PlayerStats): PlayerType {
  const hands = player.estimated_hands
  const days = player.days_active
  const hpd = days > 0 ? hands / days : 0

  if (hpd >= 25000) return 'HV'
  if (hands >= 60000) return 'REG'
  return 'REC'
}

// Generate copy text summary
function generateCopyText(player: PlayerStats): string {
  const playerType = classifyPlayer(player)

  const handsPerDay = player.days_active > 0
    ? formatNumber(Math.round(player.estimated_hands / player.days_active))
    : '0'
  const totalHands = formatNumber(player.estimated_hands)

  const rushHands = player.rush.estimated_hands
  const regularHands = player.regular.estimated_hands
  const ninemaxHands = player['9max'].estimated_hands
  const totalGameHands = rushHands + regularHands + ninemaxHands

  let gameType = ''
  if (totalGameHands > 0) {
    const rushPct = rushHands / totalGameHands
    if (rushPct >= 0.7) gameType = 'RUSH'
    else if (rushPct <= 0.3) gameType = 'HOLDEM'
    else gameType = 'HYBRID'
  }

  const primaryStake = STAKE_LABELS[player.primary_stake] || 'NL?'
  const playedStakes = STAKES.filter(stake => (player.stakes[stake] ?? 0) > 0)
  let stakeStr = `@${primaryStake}`

  if (playedStakes.length > 1) {
    const minStake = STAKE_LABELS[playedStakes[0]]
    const maxStake = STAKE_LABELS[playedStakes[playedStakes.length - 1]]
    stakeStr = `@${primaryStake} ${minStake}-${maxStake}`
  }

  return `${playerType} ${handsPerDay}/d ${totalHands} ${gameType} ${stakeStr}`.replace(/\s+/g, ' ').trim()
}

interface PlayerCardProps {
  player: PlayerStats
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const allDates = getDatesCovered()

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handsPerDay = player.days_active > 0
    ? Math.round(player.estimated_hands / player.days_active)
    : 0

  const handsValues = Object.values(player.hands_by_date)
  const maxHands = handsValues.length > 0 ? Math.max(...handsValues) : 1

  const copyText = generateCopyText(player)

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText).then(
      () => {
        setCopied(true)
        copyTimerRef.current = setTimeout(() => setCopied(false), 1500)
      },
      () => { /* clipboard write failed — ignore silently */ }
    )
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/50 hover:border-neutral-700/50 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white truncate min-w-0">{player.nickname}</h3>
        <RegTypeBadge type={classifyPlayer(player)} className="shrink-0" />
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">{copyText}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
            title={copyText}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Volume + Activity */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
          <div className="text-2xl font-semibold text-neutral-100 tabular-nums">
            {formatNumber(player.estimated_hands)}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">hands</div>
          <div className="text-xs text-neutral-400 mt-2">
            {formatNumber(handsPerDay)}<span className="text-neutral-600">/day</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-neutral-100 tabular-nums">{player.days_active}</span>
            <span className="text-sm text-neutral-500">of {allDates.length} days</span>
          </div>
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

      {/* Game Types */}
      <div className="grid grid-cols-3 gap-3 mb-3 items-stretch">
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
        {player['9max'].estimated_hands > 0 ? (
          <GameTypeSection title="9-Max" stats={player['9max']} variant="9max" />
        ) : (
          <GameTypeSkeleton title="9-Max" variant="9max" />
        )}
      </div>

      {/* Timeline */}
      <PlayerTimeline
        dates={allDates}
        handsByDate={player.hands_by_date}
        maxHands={maxHands}
        firstSeen={player.first_seen}
        lastSeen={player.last_seen}
      />
    </div>
  )
}
