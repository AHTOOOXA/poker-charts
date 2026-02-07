import { useMemo, useState, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { PlayerSearchInput } from './PlayerSearchInput'
import { PlayerFilters } from './PlayerFilters'
import { PlayerList } from './PlayerList'
import { getAllPlayers, applyFilters, sortPlayers, getStatsData, SORT_OPTIONS, type SortOption } from '@/data/players'
import { convertToQwerty } from '@/lib/search'
import type { RegType, Stake } from '@/types/player'

export function PlayerSearch() {
  const { q } = useSearch({ from: '/leaderboard/' })
  const navigate = useNavigate({ from: '/leaderboard/' })
  const search = q
  const setSearch = useCallback((value: string) => {
    void navigate({ search: { q: value || undefined } as never, replace: true })
  }, [navigate])
  const [selectedRegTypes, setSelectedRegTypes] = useState<RegType[]>([])
  const [selectedStakes, setSelectedStakes] = useState<Stake[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('hands')

  const allPlayers = useMemo(() => getAllPlayers(), [])
  const statsData = useMemo(() => getStatsData(), [])

  const { players: filteredPlayers, usedLayoutConversion, convertedQuery } = useMemo(() => {
    const filterResult = applyFilters(allPlayers, {
      search,
      regTypes: selectedRegTypes,
      stakes: selectedStakes,
    })
    const sorted = sortPlayers(filterResult.players, sortBy, search)
    return {
      players: sorted,
      usedLayoutConversion: filterResult.usedLayoutConversion,
      convertedQuery: filterResult.usedLayoutConversion ? convertToQwerty(search) : null,
    }
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
        {/* Layout conversion hint */}
        {usedLayoutConversion && convertedQuery && (
          <div className="text-xs text-amber-500/80 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="M6 8h.001"/>
              <path d="M10 8h.001"/>
              <path d="M14 8h.001"/>
              <path d="M18 8h.001"/>
              <path d="M8 12h.001"/>
              <path d="M12 12h.001"/>
              <path d="M16 12h.001"/>
              <path d="M7 16h10"/>
            </svg>
            <span>Searching for "{convertedQuery}"</span>
          </div>
        )}

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
