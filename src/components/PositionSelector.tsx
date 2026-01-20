import { cn } from '@/lib/utils'
import type { Position } from '@/types/poker'

interface PositionSelectorProps {
  selected: Position
  onSelect: (position: Position) => void
}

interface PositionButtonProps {
  position: Position
  selected: Position
  onSelect: (position: Position) => void
  className: string
}

function PositionButton({ position, selected, onSelect, className }: PositionButtonProps) {
  const isSelected = selected === position

  return (
    <button
      onClick={() => onSelect(position)}
      className={cn(
        'absolute w-12 h-12 rounded-full font-bold text-xs transition-all duration-300',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
        isSelected
          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_20px_rgba(52,211,153,0.5)]'
          : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 backdrop-blur-sm border border-neutral-700/50 hover:border-neutral-600',
        className
      )}
    >
      <span className={cn(
        'transition-all duration-300',
        isSelected && 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
      )}>
        {position}
      </span>
    </button>
  )
}

export function PositionSelector({ selected, onSelect }: PositionSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <p className="text-center text-neutral-500 text-sm mb-6 tracking-wide uppercase">
        Select your position
      </p>

      {/* Poker table shape */}
      <div className="relative aspect-[16/10] mx-auto">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-[50%] blur-xl" />

        {/* Table felt - outer ring */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-emerald-950/60 rounded-[50%] border-2 border-emerald-700/30 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)]" />

        {/* Table felt - inner */}
        <div className="absolute inset-3 bg-gradient-to-br from-emerald-800/20 to-emerald-900/30 rounded-[50%] border border-emerald-600/20" />

        {/* Table pattern overlay */}
        <div className="absolute inset-4 rounded-[50%] opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)'
          }}
        />

        {/* Dealer button in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full border border-neutral-600 flex items-center justify-center shadow-lg">
            <span className="text-[10px] text-neutral-400 font-bold tracking-wider">DEAL</span>
          </div>
        </div>

        {/* Position buttons */}
        <PositionButton
          position="UTG"
          selected={selected}
          onSelect={onSelect}
          className="left-[8%] top-[18%] -translate-x-1/2"
        />
        <PositionButton
          position="MP"
          selected={selected}
          onSelect={onSelect}
          className="left-[2%] top-1/2 -translate-y-1/2 -translate-x-1/2"
        />
        <PositionButton
          position="CO"
          selected={selected}
          onSelect={onSelect}
          className="left-[8%] bottom-[18%] -translate-x-1/2"
        />
        <PositionButton
          position="BTN"
          selected={selected}
          onSelect={onSelect}
          className="right-[8%] bottom-[18%] translate-x-1/2"
        />
        <PositionButton
          position="SB"
          selected={selected}
          onSelect={onSelect}
          className="right-[2%] top-1/2 -translate-y-1/2 translate-x-1/2"
        />
        <PositionButton
          position="BB"
          selected={selected}
          onSelect={onSelect}
          className="right-[8%] top-[18%] translate-x-1/2"
        />
      </div>

      {/* Hint text */}
      <p className="text-center text-neutral-600 text-xs mt-6">
        Tap a position to see ranges
      </p>
    </div>
  )
}
