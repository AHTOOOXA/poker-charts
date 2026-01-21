import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Position, Scenario } from '@/types/poker'

type ChartState = {
  // Hero's position
  position: Position
  setPosition: (p: Position) => void

  // Current scenario
  scenario: Scenario
  setScenario: (s: Scenario) => void

  // Villain position (for scenarios that need it)
  villain: Position | null
  setVillain: (v: Position | null) => void

  // UI state - which view we're on
  view: 'position' | 'chart' | 'players'
  setView: (v: 'position' | 'chart' | 'players') => void

  // Reset to position selection
  reset: () => void
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      position: 'BTN',
      setPosition: (position) => set({ position }),

      scenario: 'RFI',
      setScenario: (scenario) => set({ scenario, villain: null }),

      villain: null,
      setVillain: (villain) => set({ villain }),

      view: 'position',
      setView: (view) => set({ view }),

      reset: () => set({ view: 'position', scenario: 'RFI', villain: null }),
    }),
    { name: 'poker-chart' }
  )
)
