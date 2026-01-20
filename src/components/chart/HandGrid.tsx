import { cn } from '@/lib/utils'
import { HAND_GRID, RANKS, type Action, type Hand } from '@/types/poker'

const ACTION_STYLES: Record<Action, string> = {
  fold: 'bg-neutral-800/60 text-neutral-500 border-neutral-700/30',
  call: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-emerald-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  raise: 'bg-gradient-to-br from-sky-500 to-sky-700 text-white border-sky-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  '3bet': 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
  'all-in': 'bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
}

const ACTION_HOVER_GLOW: Record<Action, string> = {
  fold: 'hover:shadow-[0_0_12px_rgba(115,115,115,0.3)]',
  call: 'hover:shadow-[0_0_12px_rgba(52,211,153,0.5)]',
  raise: 'hover:shadow-[0_0_12px_rgba(56,189,248,0.5)]',
  '3bet': 'hover:shadow-[0_0_12px_rgba(251,191,36,0.5)]',
  'all-in': 'hover:shadow-[0_0_12px_rgba(251,113,133,0.5)]',
}

interface HandCellProps {
  hand: Hand
  action: Action | null
  onHover?: (hand: Hand | null) => void
}

function HandCell({ hand, action, onHover }: HandCellProps) {
  const effectiveAction = action || 'fold'
  const styleClass = ACTION_STYLES[effectiveAction]
  const glowClass = ACTION_HOVER_GLOW[effectiveAction]

  return (
    <div
      className={cn(
        'aspect-square flex items-center justify-center',
        'text-[9px] sm:text-[11px] font-semibold tracking-tight',
        'rounded-[3px] border cursor-default',
        'transition-all duration-200 ease-out',
        'hover:scale-110 hover:z-10',
        styleClass,
        glowClass
      )}
      onMouseEnter={() => onHover?.(hand)}
      onMouseLeave={() => onHover?.(null)}
    >
      {hand.name}
    </div>
  )
}

interface HandGridProps {
  getAction: (hand: string) => Action | null
  onHandHover?: (hand: Hand | null) => void
}

export function HandGrid({ getAction, onHandHover }: HandGridProps) {
  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Container with subtle glow */}
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 rounded-xl blur-2xl" />

        {/* Grid container */}
        <div className="relative bg-neutral-900/50 backdrop-blur-sm rounded-xl p-3 border border-neutral-800/50">
          {/* Column headers */}
          <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-[3px] mb-[3px]">
            <div className="w-5 sm:w-6" />
            {RANKS.map((rank) => (
              <div
                key={rank}
                className="aspect-square flex items-center justify-center text-[9px] sm:text-[10px] text-neutral-500 font-medium"
              >
                {rank}
              </div>
            ))}
          </div>

          {/* Grid with row headers */}
          {HAND_GRID.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-[auto_repeat(13,1fr)] gap-[3px] mb-[3px]">
              <div className="w-5 sm:w-6 flex items-center justify-center text-[9px] sm:text-[10px] text-neutral-500 font-medium">
                {RANKS[rowIdx]}
              </div>
              {row.map((hand) => (
                <HandCell
                  key={hand.name}
                  hand={hand}
                  action={getAction(hand.name)}
                  onHover={onHandHover}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
