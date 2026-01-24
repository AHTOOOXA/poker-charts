import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Position } from '@/types/poker'

type ChartState = {
  // Hero's position
  position: Position
  setPosition: (p: Position) => void

  // Villain position
  villain: Position | null
  setVillain: (v: Position | null) => void

  // UI state - which tab we're on (charts vs players)
  tab: 'charts' | 'players'
  setTab: (t: 'charts' | 'players') => void
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      position: 'BTN',
      setPosition: (position) => set({ position }),

      villain: null,
      setVillain: (villain) => set({ villain }),

      tab: 'charts',
      setTab: (tab) => set({ tab }),
    }),
    { name: 'poker-chart' }
  )
)
