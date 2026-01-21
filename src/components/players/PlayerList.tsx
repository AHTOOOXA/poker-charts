import { PlayerCard } from './PlayerCard'
import type { PlayerStats } from '@/types/player'

interface PlayerListProps {
  players: PlayerStats[]
  maxDisplay?: number
}

export function PlayerList({ players, maxDisplay = 30 }: PlayerListProps) {
  const displayPlayers = players.slice(0, maxDisplay)
  const hasMore = players.length > maxDisplay

  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No players found. Try adjusting your search or filters.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayPlayers.map((player) => (
        <PlayerCard key={player.nickname} player={player} />
      ))}
      {hasMore && (
        <div className="text-center py-4 text-neutral-500 text-sm">
          Showing {maxDisplay} of {players.length} players
        </div>
      )}
    </div>
  )
}
