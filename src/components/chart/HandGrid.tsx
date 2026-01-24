import { cn } from '@/lib/utils'
import { HAND_GRID, RANKS, type Action, type Cell, type Hand } from '@/types/poker'

// Solid background colors for each action
const ACTION_COLORS: Record<Action, string> = {
  fold: 'bg-neutral-800',
  call: 'bg-emerald-600',
  raise: 'bg-sky-600',
  allin: 'bg-rose-600',
}

// Text colors
const ACTION_TEXT: Record<Action, string> = {
  fold: 'text-neutral-500',
  call: 'text-white',
  raise: 'text-white',
  allin: 'text-white',
}

interface HandCellProps {
  hand: Hand
  cell: Cell
  compact?: boolean
}

function HandCell({ hand, cell, compact }: HandCellProps) {
  const isSplit = Array.isArray(cell)

  if (isSplit) {
    // First action is more aggressive (bottom), second is less aggressive (top)
    const [bottom, top] = cell
    return (
      <div
        className={cn(
          'aspect-square flex items-center justify-center relative overflow-hidden',
          'rounded-[2px] cursor-default',
          compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]'
        )}
      >
        {/* Top half (passive) */}
        <div className={cn('absolute inset-0 h-1/2', ACTION_COLORS[top])} />
        {/* Bottom half (aggressive) */}
        <div className={cn('absolute inset-0 top-1/2 h-1/2', ACTION_COLORS[bottom])} />
        {/* Text overlay */}
        <span className="relative z-10 font-semibold text-white mix-blend-difference">
          {hand.name}
        </span>
      </div>
    )
  }

  // Solid cell
  const action = cell
  return (
    <div
      className={cn(
        'aspect-square flex items-center justify-center',
        'font-semibold tracking-tight',
        'rounded-[2px] cursor-default',
        compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]',
        ACTION_COLORS[action],
        ACTION_TEXT[action]
      )}
    >
      {hand.name}
    </div>
  )
}

interface HandGridProps {
  getCell: (hand: string) => Cell
  compact?: boolean
  title?: string
  subtitle?: string
}

export function HandGrid({ getCell, compact, title, subtitle }: HandGridProps) {
  return (
    <div className={cn('w-full', !compact && 'max-w-[420px]', 'mx-auto')}>
      {/* Title */}
      {title && (
        <div className={cn('mb-2', compact ? 'text-center' : '')}>
          <div className={cn('font-semibold text-white', compact ? 'text-xs' : 'text-sm')}>{title}</div>
          {subtitle && (
            <div className={cn('text-neutral-500', compact ? 'text-[10px]' : 'text-xs')}>{subtitle}</div>
          )}
        </div>
      )}

      {/* Grid container */}
      <div className={cn(
        'relative bg-neutral-900/50 backdrop-blur-sm rounded-lg border border-neutral-800/50',
        compact ? 'p-2' : 'p-3'
      )}>
        {/* Column headers */}
        <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]">
          <div className={compact ? 'w-4 sm:w-5' : 'w-5 sm:w-6'} />
          {RANKS.map((rank) => (
            <div
              key={rank}
              className={cn(
                'aspect-square flex items-center justify-center text-neutral-500 font-medium',
                compact ? 'text-[7px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'
              )}
            >
              {rank}
            </div>
          ))}
        </div>

        {/* Grid with row headers */}
        {HAND_GRID.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]"
          >
            <div className={cn(
              'flex items-center justify-center text-neutral-500 font-medium',
              compact ? 'w-4 sm:w-5 text-[7px] sm:text-[9px]' : 'w-5 sm:w-6 text-[9px] sm:text-[10px]'
            )}>
              {RANKS[rowIdx]}
            </div>
            {row.map((hand) => (
              <HandCell
                key={hand.name}
                hand={hand}
                cell={getCell(hand.name)}
                compact={compact}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
