import { useMemo, useState } from 'react'
import { PlayerSearchInput } from './PlayerSearchInput'
import { PlayerFilters } from './PlayerFilters'
import { PlayerList } from './PlayerList'
import { getAllPlayers, applyFilters, sortPlayers, getStatsData, SORT_OPTIONS, type SortOption } from '@/data/players'
import type { RegType, Stake } from '@/types/player'

export function PlayerSearch() {
  const [search, setSearch] = useState('')
  const [selectedRegTypes, setSelectedRegTypes] = useState<RegType[]>([])
  const [selectedStakes, setSelectedStakes] = useState<Stake[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('hands')

  const allPlayers = useMemo(() => getAllPlayers(), [])
  const statsData = useMemo(() => getStatsData(), [])

  const filteredPlayers = useMemo(() => {
    const filtered = applyFilters(allPlayers, {
      search,
      regTypes: selectedRegTypes,
      stakes: selectedStakes,
    })
    return sortPlayers(filtered, sortBy, search)
  }, [allPlayers, search, selectedRegTypes, selectedStakes, sortBy])

  return (
    <div className="flex flex-col h-full">
      {/* Search + filters */}
      <div className="space-y-3 pb-4">
        <PlayerSearchInput value={search} onChange={setSearch} />
        <PlayerFilters
          selectedRegTypes={selectedRegTypes}
          onRegTypesChange={setSelectedRegTypes}
          selectedStakes={selectedStakes}
          onStakesChange={setSelectedStakes}
        />
        {/* Results count + sort */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">
            {filteredPlayers.length} of {statsData.summary.unique_players} players
          </span>
          <div className="flex items-center gap-2">
            <span className="text-neutral-600">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    sortBy === opt.value
                      ? 'bg-neutral-700 text-neutral-200'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        <PlayerList players={filteredPlayers} />
      </div>
    </div>
  )
}
