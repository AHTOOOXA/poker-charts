import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod/v4'
import { POSITIONS, PROVIDERS, RANKS, SUITS, HAND_CATEGORIES } from '@/types/poker'
import type { Card, Grouping, HandCategory, Position, Provider } from '@/types/poker'

type PotType = 'srp' | '3bet'

// Schema for validation on restore
const cardSchema = z.object({
  rank: z.enum(RANKS),
  suit: z.enum(SUITS),
})

const analyzerStateSchema = z.object({
  potType: z.enum(['srp', '3bet']),
  oopPosition: z.enum(POSITIONS),
  ipPosition: z.enum(POSITIONS),
  provider: z.enum(PROVIDERS),
  board: z.array(cardSchema).max(5),
  grouping: z.enum(['simple', 'standard', 'detailed']),
  highlightedCategories: z.array(z.enum(HAND_CATEGORIES)),
})

type AnalyzerState = {
  potType: PotType
  setPotType: (p: PotType) => void
  oopPosition: Position
  setOopPosition: (p: Position) => void
  ipPosition: Position
  setIpPosition: (p: Position) => void
  provider: Provider
  setProvider: (p: Provider) => void
  board: Card[]
  addCard: (card: Card) => void
  removeCard: (index: number) => void
  clearBoard: () => void
  setBoard: (cards: Card[]) => void
  grouping: Grouping
  setGrouping: (g: Grouping) => void
  highlightedCategories: HandCategory[]
  toggleHighlight: (cat: HandCategory) => void
  clearHighlights: () => void
}

const defaultState = {
  potType: 'srp' as PotType,
  oopPosition: 'CO' as Position,
  ipPosition: 'BTN' as Position,
  provider: 'pekarstas' as Provider,
  board: [] as Card[],
  grouping: 'standard' as Grouping,
  highlightedCategories: [] as HandCategory[],
}

export const useAnalyzerStore = create(
  persist<AnalyzerState>(
    (set) => ({
      ...defaultState,
      setPotType: (potType) => set({ potType }),
      setOopPosition: (oopPosition) => set({ oopPosition }),
      setIpPosition: (ipPosition) => set({ ipPosition }),
      setProvider: (provider) => set({ provider }),
      addCard: (card) =>
        set((state) => {
          if (state.board.length >= 5) return state
          const exists = state.board.some(
            (c) => c.rank === card.rank && c.suit === card.suit
          )
          if (exists) return state
          return { board: [...state.board, card] }
        }),
      removeCard: (index) =>
        set((state) => ({
          board: state.board.filter((_, i) => i !== index),
        })),
      clearBoard: () => set({ board: [] }),
      setBoard: (board) => set({ board: board.slice(0, 5) }),
      setGrouping: (grouping) => set({ grouping }),
      toggleHighlight: (cat) =>
        set((state) => {
          const has = state.highlightedCategories.includes(cat)
          return {
            highlightedCategories: has
              ? state.highlightedCategories.filter((c) => c !== cat)
              : [...state.highlightedCategories, cat],
          }
        }),
      clearHighlights: () => set({ highlightedCategories: [] }),
    }),
    {
      name: 'poker-analyzer',
      merge: (persisted, current) => {
        const result = analyzerStateSchema.safeParse(persisted)
        if (result.success) {
          return { ...current, ...result.data }
        }
        console.warn('Invalid analyzerStore state, using defaults')
        return current
      },
    }
  )
)
