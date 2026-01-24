import { cn } from '@/lib/utils'
import { HAND_GRID, RANKS, type Action, type Hand } from '@/types/poker'

const ACTION_STYLES: Record<Action, string> = {
  'fold': 'bg-neutral-800/60 text-neutral-500 border-neutral-700/30',
  'call': 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  'call-passive': 'bg-gradient-to-br from-emerald-400/60 to-emerald-600/60 text-white border-emerald-400/20 border-dashed',
  'raise': 'bg-gradient-to-br from-sky-500 to-sky-700 text-white border-sky-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  'raise-passive': 'bg-gradient-to-br from-sky-400/60 to-sky-600/60 text-white border-sky-400/20 border-dashed',
  '3bet': 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
  '3bet-fold': 'bg-gradient-to-br from-amber-400/70 to-amber-600/70 text-black border-amber-300/20',
  '3bet-call': 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  '4bet-bluff': 'bg-gradient-to-br from-purple-500 to-purple-700 text-white border-purple-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  'all-in': 'bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
}

interface HandCellProps {
  hand: Hand
  action: Action | null
  compact?: boolean
}

function HandCell({ hand, action, compact }: HandCellProps) {
  const effectiveAction = action || 'fold'
  const styleClass = ACTION_STYLES[effectiveAction]

  return (
    <div
      className={cn(
        'aspect-square flex items-center justify-center',
        'font-semibold tracking-tight',
        'rounded-[2px] border cursor-default',
        compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]',
        styleClass
      )}
    >
      {hand.name}
    </div>
  )
}

interface HandGridProps {
  getAction: (hand: string) => Action | null
  onHandHover?: (hand: Hand | null) => void
  compact?: boolean
  title?: string
  subtitle?: string
}

export function HandGrid({ getAction, compact, title, subtitle }: HandGridProps) {
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
                action={getAction(hand.name)}
                compact={compact}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
