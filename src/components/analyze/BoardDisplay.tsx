import { cn } from '@/lib/utils'
import type { Card } from '@/types/poker'
import { SUIT_SYMBOLS, SUIT_NAMES, RANK_NAMES, SUIT_COLORS, SUIT_BG } from '@/constants/cards'
import { X } from 'lucide-react'

interface CardSlotProps {
  card?: Card
  label: string
  onClick?: () => void
}

function CardSlot({ card, label, onClick }: CardSlotProps) {
  if (!card) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn(
            'w-12 h-16 sm:w-14 sm:h-20 rounded-lg',
            'border-2 border-dashed border-neutral-700',
            'flex items-center justify-center',
            'text-neutral-600'
          )}
        >
          <span className="text-2xl">?</span>
        </div>
        <span className="text-[10px] text-neutral-500">{label}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        aria-label={`Remove ${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}`}
        className={cn(
          'w-12 h-16 sm:w-14 sm:h-20 rounded-lg',
          'border-2 border-neutral-600',
          'flex flex-col items-center justify-center',
          'relative group',
          'transition-all hover:border-red-500',
          SUIT_BG[card.suit]
        )}
      >
        <span className={cn('text-xl sm:text-2xl font-bold', SUIT_COLORS[card.suit])}>
          {card.rank}
        </span>
        <span className={cn('text-lg sm:text-xl', SUIT_COLORS[card.suit])}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
        <div
          aria-hidden="true"
          className={cn(
            'absolute -top-1.5 -right-1.5',
            'w-5 h-5 rounded-full bg-red-600',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <X className="w-3 h-3 text-white" />
        </div>
      </button>
      <span className="text-[10px] text-neutral-500">{label}</span>
    </div>
  )
}

interface BoardDisplayProps {
  cards: Card[]
  onRemoveCard: (index: number) => void
}

export function BoardDisplay({ cards, onRemoveCard }: BoardDisplayProps) {
  const labels = ['Flop', 'Flop', 'Flop', 'Turn', 'River']

  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {/* Flop cards - grouped */}
      <div className="flex gap-1 sm:gap-1.5">
        {[0, 1, 2].map((i) => (
          <CardSlot
            key={i}
            card={cards[i]}
            label={labels[i]}
            onClick={() => onRemoveCard(i)}
          />
        ))}
      </div>

      {/* Turn - slightly separated */}
      <div className="ml-1 sm:ml-2">
        <CardSlot
          card={cards[3]}
          label={labels[3]}
          onClick={() => onRemoveCard(3)}
        />
      </div>

      {/* River - slightly separated */}
      <div className="ml-1 sm:ml-2">
        <CardSlot
          card={cards[4]}
          label={labels[4]}
          onClick={() => onRemoveCard(4)}
        />
      </div>
    </div>
  )
}
