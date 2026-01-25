import { cn } from '@/lib/utils'
import type { Card } from '@/types/poker'
import { RANKS, SUITS } from '@/types/poker'
import { Shuffle, Trash2 } from 'lucide-react'
import { BoardDisplay } from './BoardDisplay'
import { CardPicker } from './CardPicker'

interface BoardInputProps {
  cards: Card[]
  onAddCard: (card: Card) => void
  onRemoveCard: (index: number) => void
  onClear: () => void
  onSetBoard: (cards: Card[]) => void
}

function getRandomCard(exclude: Card[]): Card {
  const available: Card[] = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      const isExcluded = exclude.some(
        (c) => c.rank === rank && c.suit === suit
      )
      if (!isExcluded) {
        available.push({ rank, suit })
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)]
}

function generateRandomBoard(count: number, existing: Card[] = []): Card[] {
  const cards = [...existing]
  while (cards.length < count) {
    cards.push(getRandomCard(cards))
  }
  return cards
}

export function BoardInput({
  cards,
  onAddCard,
  onRemoveCard,
  onClear,
  onSetBoard,
}: BoardInputProps) {
  const handleCardClick = (card: Card) => {
    const isSelected = cards.some(
      (c) => c.rank === card.rank && c.suit === card.suit
    )
    if (isSelected) {
      const index = cards.findIndex(
        (c) => c.rank === card.rank && c.suit === card.suit
      )
      onRemoveCard(index)
    } else {
      onAddClick(card)
    }
  }

  const onAddClick = (card: Card) => {
    if (cards.length < 5) {
      onAddCard(card)
    }
  }

  const handleRandomFlop = () => {
    onSetBoard(generateRandomBoard(3))
  }

  const handleRandomTurn = () => {
    if (cards.length >= 3) {
      onSetBoard(generateRandomBoard(4, cards.slice(0, 3)))
    }
  }

  const handleRandomRiver = () => {
    if (cards.length >= 4) {
      onSetBoard(generateRandomBoard(5, cards.slice(0, 4)))
    }
  }

  const handleRandomFull = () => {
    onSetBoard(generateRandomBoard(5))
  }

  return (
    <div className="space-y-4">
      {/* Board Display */}
      <div>
        <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wide font-medium">
          Board
        </div>
        <BoardDisplay cards={cards} onRemoveCard={onRemoveCard} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClear}
          disabled={cards.length === 0}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium',
            'flex items-center gap-1.5',
            'transition-colors',
            cards.length === 0
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          onClick={handleRandomFlop}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium',
            'flex items-center gap-1.5',
            'bg-neutral-800 text-neutral-300 hover:bg-neutral-700',
            'transition-colors'
          )}
        >
          <Shuffle className="w-3.5 h-3.5" />
          Random Flop
        </button>

        <button
          onClick={handleRandomTurn}
          disabled={cards.length < 3}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium',
            'flex items-center gap-1.5',
            'transition-colors',
            cards.length < 3
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          )}
        >
          +Turn
        </button>

        <button
          onClick={handleRandomRiver}
          disabled={cards.length < 4}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium',
            'flex items-center gap-1.5',
            'transition-colors',
            cards.length < 4
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          )}
        >
          +River
        </button>

        <button
          onClick={handleRandomFull}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium',
            'flex items-center gap-1.5',
            'bg-sky-600 text-white hover:bg-sky-500',
            'transition-colors'
          )}
        >
          <Shuffle className="w-3.5 h-3.5" />
          Random Full
        </button>
      </div>

      {/* Card Picker */}
      <div>
        <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wide font-medium">
          Select Cards
        </div>
        <CardPicker
          selectedCards={cards}
          onCardClick={handleCardClick}
          maxCards={5}
        />
      </div>
    </div>
  )
}
