import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Position, Provider } from '@/types/poker'

type ChartState = {
  // Chart provider
  provider: Provider
  setProvider: (p: Provider) => void

  // Hero's position
  position: Position
  setPosition: (p: Position) => void

  // Villain position
  villain: Position | null
  setVillain: (v: Position | null) => void

  // UI state - which tab we're on
  tab: 'charts' | 'players' | 'transcribe'
  setTab: (t: 'charts' | 'players' | 'transcribe') => void
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      provider: 'pekarstas',
      setProvider: (provider) => set({ provider }),

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
