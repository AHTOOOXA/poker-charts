import { useState } from 'react'
import { PlayerSearch } from '@/components/players/PlayerSearch'
import { LeaderboardArchive } from './LeaderboardArchive'
import { cn } from '@/lib/utils'

type ViewMode = 'players' | 'archive'

export function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('players')

  return (
    <div className="flex flex-col h-full">
      {/* View mode toggle */}
      <div className="flex gap-1 mb-4 p-1 bg-neutral-900/50 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('players')}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            viewMode === 'players'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          )}
        >
          Player Search
        </button>
        <button
          onClick={() => setViewMode('archive')}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            viewMode === 'archive'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          )}
        >
          Results Archive
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'players' ? <PlayerSearch /> : <LeaderboardArchive />}
      </div>
    </div>
  )
}
