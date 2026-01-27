import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod/v4'
import { POSITIONS, PROVIDERS } from '@/types/poker'
import type { Position, Provider } from '@/types/poker'

// Schema for validation on restore
const chartStateSchema = z.object({
  provider: z.enum(PROVIDERS),
  position: z.enum(POSITIONS),
  villain: z.enum(POSITIONS).nullable(),
})

type ChartState = {
  provider: Provider
  setProvider: (p: Provider) => void
  position: Position
  setPosition: (p: Position) => void
  villain: Position | null
  setVillain: (v: Position | null) => void
}

const defaultState = {
  provider: 'pekarstas' as Provider,
  position: 'BTN' as Position,
  villain: null as Position | null,
}

export const useChartStore = create(
  persist<ChartState>(
    (set) => ({
      ...defaultState,
      setProvider: (provider) => set({ provider }),
      setPosition: (position) => set({ position }),
      setVillain: (villain) => set({ villain }),
    }),
    {
      name: 'poker-chart',
      merge: (persisted, current) => {
        // Validate persisted state, fall back to defaults if invalid
        const result = chartStateSchema.safeParse(persisted)
        if (result.success) {
          return { ...current, ...result.data }
        }
        console.warn('Invalid chartStore state, using defaults')
        return current
      },
    }
  )
)
