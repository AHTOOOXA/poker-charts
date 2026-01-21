import { useMemo, useState } from 'react'
import { PlayerSearchInput } from './PlayerSearchInput'
import { PlayerFilters } from './PlayerFilters'
import { PlayerList } from './PlayerList'
import { getAllPlayers, applyFilters, sortByRelevance, getStatsData } from '@/data/players'
import type { RegType, Stake } from '@/types/player'

export function PlayerSearch() {
  const [search, setSearch] = useState('')
  const [selectedRegTypes, setSelectedRegTypes] = useState<RegType[]>([])
  const [selectedStakes, setSelectedStakes] = useState<Stake[]>([])

  const allPlayers = useMemo(() => getAllPlayers(), [])
  const statsData = useMemo(() => getStatsData(), [])

  const filteredPlayers = useMemo(() => {
    const filtered = applyFilters(allPlayers, {
      search,
      regTypes: selectedRegTypes,
      stakes: selectedStakes,
    })
    return sortByRelevance(filtered, search)
  }, [allPlayers, search, selectedRegTypes, selectedStakes])

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
        {/* Results count */}
        <div className="text-xs text-neutral-500">
          {filteredPlayers.length} of {statsData.summary.unique_players} players
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        <PlayerList players={filteredPlayers} />
      </div>
    </div>
  )
}
