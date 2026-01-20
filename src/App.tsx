import { useCallback, useEffect, useState } from 'react'
import { HandGrid } from '@/components/chart/HandGrid'
import { ContextBar } from '@/components/ContextBar'
import { Legend } from '@/components/Legend'
import { PositionSelector } from '@/components/PositionSelector'
import { getAction } from '@/data/ranges'
import { useChartStore } from '@/stores/chartStore'
import { getValidVillains, SCENARIOS, type Hand, type Position } from '@/types/poker'

function App() {
  const {
    position,
    setPosition,
    scenario,
    villain,
    setVillain,
    view,
    setView,
  } = useChartStore()

  const [hoveredHand, setHoveredHand] = useState<Hand | null>(null)

  // Get action for a hand based on current context
  const getHandAction = useCallback(
    (hand: string) => {
      return getAction(position, scenario, hand, villain || undefined)
    },
    [position, scenario, villain]
  )

  // When position is selected, go to chart view
  const handlePositionSelect = (pos: Position) => {
    setPosition(pos)
    setView('chart')
  }

  // Auto-select first valid villain when scenario changes
  useEffect(() => {
    const currentScenarioConfig = SCENARIOS.find(s => s.id === scenario)
    if (currentScenarioConfig?.requiresVillain) {
      const validVillains = getValidVillains(position, scenario)
      if (validVillains.length > 0 && !villain) {
        setVillain(validVillains[0])
      }
    }
  }, [scenario, position, villain, setVillain])

  // Determine what info to show for hovered hand
  const currentScenarioConfig = SCENARIOS.find(s => s.id === scenario)
  const hoveredAction = hoveredHand ? getHandAction(hoveredHand.name) : null

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md">
        <h1 className="text-base font-semibold text-center tracking-wide">
          <span className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Poker Charts
          </span>
        </h1>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 p-4 flex flex-col">
        {view === 'position' ? (
          <div className="flex-1 flex flex-col justify-center">
            <PositionSelector selected={position} onSelect={handlePositionSelect} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* Context bar with dropdowns */}
            <ContextBar />

            {/* Hand info (shows when hovering) */}
            <div className="h-7 text-center flex items-center justify-center">
              {hoveredHand ? (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/30">
                  <span className="font-bold text-white">{hoveredHand.name}</span>
                  <span className="text-neutral-600">→</span>
                  <span
                    className={`font-semibold ${
                      hoveredAction === 'fold'
                        ? 'text-neutral-500'
                        : hoveredAction === 'call'
                        ? 'text-emerald-400'
                        : hoveredAction === 'raise'
                        ? 'text-sky-400'
                        : hoveredAction === '3bet'
                        ? 'text-amber-400'
                        : hoveredAction === 'all-in'
                        ? 'text-rose-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {hoveredAction?.toUpperCase() || 'FOLD'}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-600 text-sm">
                  {currentScenarioConfig?.description}
                  {villain && ` from ${villain}`}
                </span>
              )}
            </div>

            {/* The chart */}
            <div className="flex-1 flex items-center justify-center py-2">
              <HandGrid getAction={getHandAction} onHandHover={setHoveredHand} />
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
