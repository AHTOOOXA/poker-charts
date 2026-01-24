import { useCallback } from 'react'
import { HandGrid } from '@/components/chart/HandGrid'
import { ChartControls } from '@/components/ChartControls'
import { Legend } from '@/components/Legend'
import { PlayerSearch } from '@/components/players/PlayerSearch'
import { getCell } from '@/data/ranges'
import { useChartStore } from '@/stores/chartStore'
import { POSITIONS, SCENARIOS, type Scenario } from '@/types/poker'
import { cn } from '@/lib/utils'

// Get available scenarios for a hero/villain pair
function getAvailableScenarios(hero: string, villain: string | null): Scenario[] {
  const heroIdx = POSITIONS.indexOf(hero as any)
  const villainIdx = villain ? POSITIONS.indexOf(villain as any) : -1

  const scenarios: Scenario[] = []

  // RFI - hero can open (no villain involvement, but we still show it)
  if (hero !== 'BB') {
    scenarios.push('RFI')
  }

  if (villain) {
    const villainBefore = villainIdx < heroIdx
    const villainAfter = villainIdx > heroIdx

    // vs-open: villain opened before hero
    if (villainBefore) {
      scenarios.push('vs-open')
    }

    // vs-3bet: hero opened, villain (after) 3bet
    if (villainAfter) {
      scenarios.push('vs-3bet')
    }

    // vs-4bet: hero 3bet, villain 4bet (BB facing 4bet after 3betting)
    if (hero === 'BB' && villainBefore) {
      scenarios.push('vs-4bet')
    }
  }

  return scenarios
}

function App() {
  const {
    position,
    villain,
    tab,
    setTab,
  } = useChartStore()

  const availableScenarios = getAvailableScenarios(position, villain)

  // Create getCell function for a specific scenario
  const createGetCell = useCallback(
    (scenario: Scenario) => {
      // Only pass villain for scenarios that require it
      const scenarioConfig = SCENARIOS.find(s => s.id === scenario)
      const villainForScenario = scenarioConfig?.requiresVillain ? villain : undefined
      return (hand: string) => {
        return getCell(position, scenario, hand, villainForScenario || undefined)
      }
    },
    [position, villain]
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-3 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-wide">
            <span className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Poker Charts
            </span>
          </h1>

          {/* Navigation tabs */}
          <nav className="flex gap-1">
            <button
              onClick={() => setTab('charts')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === 'charts'
                  ? 'bg-neutral-800/50 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              Charts
            </button>
            <button
              onClick={() => setTab('players')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === 'players'
                  ? 'bg-neutral-800/50 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              Players
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 p-4 flex flex-col overflow-auto">
        {tab === 'players' ? (
          <PlayerSearch />
        ) : (
          <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {/* Position selectors */}
            <ChartControls />

            {/* Charts grid - 2 columns */}
            <div className="grid grid-cols-2 gap-6">
              {availableScenarios.map(scenarioId => {
                const config = SCENARIOS.find(s => s.id === scenarioId)
                return (
                  <HandGrid
                    key={scenarioId}
                    getCell={createGetCell(scenarioId)}
                    compact
                    title={config?.label}
                    subtitle={config?.description}
                  />
                )
              })}
            </div>

            {/* Legend */}
            <Legend />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
