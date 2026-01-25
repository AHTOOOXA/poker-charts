import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, Grouping, HandCategory, Position, Provider } from '@/types/poker'

type PotType = 'srp' | '3bet'

type AnalyzerState = {
  // Pot configuration
  potType: PotType
  setPotType: (p: PotType) => void

  // Positions (OOP acts first postflop, IP acts last)
  oopPosition: Position
  setOopPosition: (p: Position) => void
  ipPosition: Position
  setIpPosition: (p: Position) => void

  // Provider for range data
  provider: Provider
  setProvider: (p: Provider) => void

  // Board state (0-5 cards)
  board: Card[]
  addCard: (card: Card) => void
  removeCard: (index: number) => void
  clearBoard: () => void
  setBoard: (cards: Card[]) => void

  // UI state
  grouping: Grouping
  setGrouping: (g: Grouping) => void
  highlightedCategories: HandCategory[]
  toggleHighlight: (cat: HandCategory) => void
  clearHighlights: () => void
}

export const useAnalyzerStore = create(
  persist<AnalyzerState>(
    (set) => ({
      // Pot config
      potType: 'srp',
      setPotType: (potType) => set({ potType }),

      // Positions - default to common scenario: CO opens, BTN calls
      oopPosition: 'CO',
      setOopPosition: (oopPosition) => set({ oopPosition }),
      ipPosition: 'BTN',
      setIpPosition: (ipPosition) => set({ ipPosition }),

      // Provider
      provider: 'pekarstas',
      setProvider: (provider) => set({ provider }),

      // Board
      board: [],
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

      // UI
      grouping: 'standard',
      setGrouping: (grouping) => set({ grouping }),
      highlightedCategories: [],
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
    { name: 'poker-analyzer' }
  )
)
