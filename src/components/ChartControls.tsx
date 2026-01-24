import { useChartStore } from '@/stores/chartStore'
import { type Position } from '@/types/poker'
import { cn } from '@/lib/utils'

// Custom order: UTG, MP, CO (top row), BB, SB, BTN (bottom row)
const POSITION_ORDER: Position[] = ['UTG', 'MP', 'CO', 'BB', 'SB', 'BTN']

interface PositionGridProps {
  label: string
  selected: Position | null
  onSelect: (p: Position) => void
  disabled?: Position[]
}

function PositionGrid({ label, selected, onSelect, disabled = [] }: PositionGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-neutral-500 text-xs uppercase tracking-wide text-center">{label}</span>
      <div className="grid grid-cols-3 gap-1.5">
        {POSITION_ORDER.map(p => {
          const isDisabled = disabled.includes(p)
          const isSelected = selected === p
          const isDealer = p === 'BTN'
          return (
            <button
              key={p}
              onClick={() => !isDisabled && onSelect(p)}
              disabled={isDisabled}
              className={cn(
                'relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                isDisabled && 'opacity-30 cursor-not-allowed',
                isDealer && !isSelected && !isDisabled && 'ring-2 ring-amber-500/50',
                isSelected
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : !isDisabled && 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              )}
            >
              {p}
              {isDealer && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center shadow">
                  D
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ChartControls() {
  const { position, villain, setPosition, setVillain } = useChartStore()

  // Villain must be different from hero
  const disabledVillains = [position]

  return (
    <div className="flex items-start justify-center gap-8">
      <PositionGrid
        label="I'm on"
        selected={position}
        onSelect={setPosition}
      />
      <PositionGrid
        label="vs"
        selected={villain}
        onSelect={setVillain}
        disabled={disabledVillains}
      />
    </div>
  )
}
