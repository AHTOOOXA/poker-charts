import { useState } from 'react'
import { PlayerSearch } from '@/components/players/PlayerSearch'
import { LeaderboardArchive } from './LeaderboardArchive'
import { RakebackAnalysis } from './RakebackAnalysis'
import { cn } from '@/lib/utils'
import { getDatesCovered } from '@/data/players'

type ViewMode = 'players' | 'archive' | 'rakeback'

export function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('players')
  const dates = getDatesCovered()
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  return (
    <div className="flex flex-col h-full">
      {/* View mode toggle + date range */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 p-1 bg-neutral-900/50 rounded-lg w-fit">
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
        <button
          onClick={() => setViewMode('rakeback')}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            viewMode === 'rakeback'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          )}
        >
          Rakeback
        </button>
        </div>
        <span className="text-xs text-neutral-500">
          {firstDate} — {lastDate}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'players' && <PlayerSearch />}
        {viewMode === 'archive' && <LeaderboardArchive />}
        {viewMode === 'rakeback' && <RakebackAnalysis />}
      </div>
    </div>
  )
}
