import { useAnalyzerStore } from '@/stores/analyzerStore'
import { type Position, PROVIDER_CONFIGS } from '@/types/poker'
import { POSTFLOP_ORDER } from '@/constants/poker'
import { getValidIpPositions, getValidOopPositions } from '@/lib/analyzer'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PositionGridProps {
  label: string
  selected: Position
  onSelect: (p: Position) => void
  disabled?: Position[]
  highlightColor?: string
}

function PositionGrid({
  label,
  selected,
  onSelect,
  disabled = [],
  highlightColor = 'bg-emerald-500',
}: PositionGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-neutral-500 text-xs uppercase tracking-wide font-medium">
        {label}
      </span>
      <div className="flex gap-1 flex-wrap">
        {POSTFLOP_ORDER.map((p) => {
          const isDisabled = disabled.includes(p)
          const isSelected = selected === p
          const isDealer = p === 'BTN'
          return (
            <button
              key={p}
              onClick={() => !isDisabled && onSelect(p)}
              disabled={isDisabled}
              className={cn(
                'relative px-3 py-1.5 rounded text-xs font-semibold transition-all',
                isDisabled && 'opacity-30 cursor-not-allowed',
                isDealer && !isSelected && !isDisabled && 'ring-1 ring-amber-500/50',
                isSelected
                  ? cn(highlightColor, 'text-white shadow-lg')
                  : !isDisabled && 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              )}
            >
              {p}
              {isDealer && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full text-[7px] font-bold text-black flex items-center justify-center">
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

export function RangeSelector() {
  const {
    provider,
    setProvider,
    potType,
    setPotType,
    oopPosition,
    setOopPosition,
    ipPosition,
    setIpPosition,
  } = useAnalyzerStore()

  const validIpPositions = getValidIpPositions(oopPosition)
  const validOopPositions = getValidOopPositions(ipPosition)

  const disabledIp = POSTFLOP_ORDER.filter((p) => !validIpPositions.includes(p))
  const disabledOop = POSTFLOP_ORDER.filter((p) => !validOopPositions.includes(p))

  const handleOopChange = (newOop: Position) => {
    setOopPosition(newOop)
    // If current IP is invalid, select first valid IP
    const newValidIp = getValidIpPositions(newOop)
    if (!newValidIp.includes(ipPosition)) {
      setIpPosition(newValidIp[0] || 'BTN')
    }
  }

  const handleIpChange = (newIp: Position) => {
    setIpPosition(newIp)
    // If current OOP is invalid, select first valid OOP
    const newValidOop = getValidOopPositions(newIp)
    if (!newValidOop.includes(oopPosition)) {
      setOopPosition(newValidOop[newValidOop.length - 1] || 'CO')
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <div className="text-xs text-neutral-400 mb-1.5 uppercase tracking-wide font-medium">
          Range Pack
        </div>
        <Select value={provider} onValueChange={(v) => setProvider(v as typeof provider)}>
          <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_CONFIGS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pot Type */}
      <div>
        <div className="text-xs text-neutral-400 mb-1.5 uppercase tracking-wide font-medium">
          Pot Type
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPotType('srp')}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              potType === 'srp'
                ? 'bg-sky-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            )}
          >
            <div>SRP</div>
            <div className="text-[10px] opacity-70">Single Raised</div>
          </button>
          <button
            onClick={() => setPotType('3bet')}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              potType === '3bet'
                ? 'bg-rose-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            )}
          >
            <div>3bet Pot</div>
            <div className="text-[10px] opacity-70">3bet Called</div>
          </button>
        </div>
      </div>

      {/* OOP Position */}
      <PositionGrid
        label="OOP (Out of Position)"
        selected={oopPosition}
        onSelect={handleOopChange}
        disabled={disabledOop}
        highlightColor="bg-orange-500"
      />

      {/* IP Position */}
      <PositionGrid
        label="IP (In Position)"
        selected={ipPosition}
        onSelect={handleIpChange}
        disabled={disabledIp}
        highlightColor="bg-emerald-500"
      />
    </div>
  )
}
