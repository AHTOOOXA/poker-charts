import { memo } from 'react'
import { cn } from '@/lib/utils'
import { ACTION_COLORS, ACTION_TEXT } from '@/constants/poker'
import { HAND_GRID, RANKS, normalizeCell, getSortedActions, type Cell, type Hand } from '@/types/poker'

interface HandCellProps {
  hand: Hand
  cell: Cell
  compact?: boolean
  interactive?: boolean
  onMouseDown?: (hand: string, e: React.MouseEvent) => void
  onMouseEnter?: (hand: string) => void
}

function HandCell({ hand, cell, compact, interactive, onMouseDown, onMouseEnter }: HandCellProps) {
  const handleMouseDown = interactive && onMouseDown
    ? (e: React.MouseEvent) => onMouseDown(hand.name, e)
    : undefined

  const handleMouseEnter = interactive && onMouseEnter
    ? () => onMouseEnter(hand.name)
    : undefined

  const { weight, actions } = normalizeCell(cell)
  const sortedActions = getSortedActions(actions)

  // Not in range (weight = 0) - render empty/fold cell
  if (weight === 0 || sortedActions.length === 0) {
    return (
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'aspect-square flex items-center justify-center',
          'font-semibold tracking-tight',
          'rounded-[2px]',
          interactive ? 'cursor-crosshair' : 'cursor-default',
          compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]',
          ACTION_COLORS.fold,
          ACTION_TEXT.fold
        )}
      >
        {hand.name}
      </div>
    )
  }

  // Full weight (100%) with single action - render solid cell
  if (weight === 100 && sortedActions.length === 1) {
    const [action] = sortedActions[0]
    return (
      <div
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'aspect-square flex items-center justify-center',
          'font-semibold tracking-tight',
          'rounded-[2px]',
          interactive ? 'cursor-crosshair' : 'cursor-default',
          compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]',
          ACTION_COLORS[action],
          ACTION_TEXT[action]
        )}
      >
        {hand.name}
      </div>
    )
  }

  // Weighted cell - render with fill height and horizontal action bands
  let accumulatedWidth = 0
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'aspect-square flex items-center justify-center relative overflow-hidden',
        'rounded-[2px]',
        ACTION_COLORS.fold, // Background for unfilled portion
        interactive ? 'cursor-crosshair' : 'cursor-default',
        compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]'
      )}
    >
      {/* Horizontal action bands within the fill height (left to right: aggressive to passive) */}
      {sortedActions.map(([action, percent]) => {
        const left = accumulatedWidth
        accumulatedWidth += percent
        return (
          <div
            key={action}
            className={cn('absolute top-0', ACTION_COLORS[action])}
            style={{
              left: `${left}%`,
              width: `${percent}%`,
              height: `${weight}%`,
            }}
          />
        )
      })}
      {/* Text overlay */}
      <span className="relative z-10 font-semibold text-white mix-blend-difference">
        {hand.name}
      </span>
    </div>
  )
}

interface HandGridProps {
  getCell: (hand: string) => Cell
  compact?: boolean
  title?: string
  subtitle?: string
  // Interactive mode for painting
  interactive?: boolean
  onCellMouseDown?: (hand: string, e: React.MouseEvent) => void
  onCellMouseEnter?: (hand: string) => void
}

export const HandGrid = memo(function HandGrid({ getCell, compact, title, subtitle, interactive, onCellMouseDown, onCellMouseEnter }: HandGridProps) {
  return (
    <div className={cn('w-full', !compact && 'max-w-[420px]', interactive && 'select-none', 'mx-auto')}>
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
                interactive={interactive}
                onMouseDown={onCellMouseDown}
                onMouseEnter={onCellMouseEnter}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})
