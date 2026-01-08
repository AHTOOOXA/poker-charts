import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ChartState = {
  position: string
  setPosition: (p: string) => void
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      position: 'BTN',
      setPosition: (position) => set({ position }),
    }),
    { name: 'poker-chart' }
  )
)
