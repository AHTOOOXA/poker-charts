import { cn } from '@/lib/utils'
import type { Card, Rank, Suit } from '@/types/poker'
import { RANKS, SUITS } from '@/types/poker'
import { SUIT_SYMBOLS, SUIT_NAMES, RANK_NAMES, SUIT_COLORS } from '@/constants/cards'

interface CardPickerProps {
  selectedCards: Card[]
  onCardClick: (card: Card) => void
  maxCards?: number
}

export function CardPicker({
  selectedCards,
  onCardClick,
  maxCards = 5,
}: CardPickerProps) {
  const isSelected = (rank: Rank, suit: Suit) =>
    selectedCards.some((c) => c.rank === rank && c.suit === suit)

  const isFull = selectedCards.length >= maxCards

  return (
    <div className="space-y-1">
      {SUITS.map((suit) => (
        <div key={suit} className="flex items-center gap-1">
          <span
            className={cn(
              'w-5 text-center text-lg',
              SUIT_COLORS[suit]
            )}
            aria-hidden="true"
          >
            {SUIT_SYMBOLS[suit]}
          </span>
          <div className="flex gap-[2px]" role="group" aria-label={`${SUIT_NAMES[suit]} cards`}>
            {RANKS.map((rank) => {
              const selected = isSelected(rank, suit)
              const disabled = !selected && isFull

              return (
                <button
                  key={`${rank}${suit}`}
                  onClick={() => onCardClick({ rank, suit })}
                  disabled={disabled}
                  aria-label={`${RANK_NAMES[rank]} of ${SUIT_NAMES[suit]}${selected ? ', selected' : ''}`}
                  aria-pressed={selected}
                  className={cn(
                    'w-6 h-8 sm:w-7 sm:h-9 rounded text-xs sm:text-sm font-semibold',
                    'transition-all duration-100',
                    'flex items-center justify-center',
                    selected
                      ? cn(
                          'bg-neutral-100 ring-2 ring-sky-500',
                          SUIT_COLORS[suit].replace('text-neutral-300', 'text-neutral-800')
                        )
                      : cn(
                          'bg-neutral-800 hover:bg-neutral-700',
                          disabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer',
                          SUIT_COLORS[suit]
                        )
                  )}
                >
                  {rank}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
