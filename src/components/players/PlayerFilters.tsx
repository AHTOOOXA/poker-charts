import { cn } from '@/lib/utils'
import { REG_TYPES, REG_TYPE_LABELS, STAKES, STAKE_LABELS } from '@/types/player'
import type { RegType, Stake } from '@/types/player'

const REG_TYPE_COLORS: Record<RegType, { active: string; inactive: string }> = {
  grinder: {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    inactive: 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-emerald-500/30',
  },
  regular: {
    active: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    inactive: 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-teal-500/30',
  },
  casual: {
    active: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    inactive: 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-sky-500/30',
  },
  new: {
    active: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    inactive: 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-amber-500/30',
  },
  inactive: {
    active: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/40',
    inactive: 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-neutral-500/30',
  },
}

interface PlayerFiltersProps {
  selectedRegTypes: RegType[]
  onRegTypesChange: (types: RegType[]) => void
  selectedStakes: Stake[]
  onStakesChange: (stakes: Stake[]) => void
}

export function PlayerFilters({
  selectedRegTypes,
  onRegTypesChange,
  selectedStakes,
  onStakesChange,
}: PlayerFiltersProps) {
  const toggleRegType = (type: RegType) => {
    if (selectedRegTypes.includes(type)) {
      onRegTypesChange(selectedRegTypes.filter(t => t !== type))
    } else {
      onRegTypesChange([...selectedRegTypes, type])
    }
  }

  const toggleStake = (stake: Stake) => {
    if (selectedStakes.includes(stake)) {
      onStakesChange(selectedStakes.filter(s => s !== stake))
    } else {
      onStakesChange([...selectedStakes, stake])
    }
  }

  return (
    <div className="space-y-3">
      {/* Reg type filters */}
      <div className="flex flex-wrap gap-2">
        {REG_TYPES.map(type => {
          const isActive = selectedRegTypes.includes(type)
          const colors = REG_TYPE_COLORS[type]
          return (
            <button
              key={type}
              onClick={() => toggleRegType(type)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isActive ? colors.active : colors.inactive
              )}
            >
              {REG_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>

      {/* Stake filters */}
      <div className="flex flex-wrap gap-2">
        {STAKES.map(stake => {
          const isActive = selectedStakes.includes(stake)
          return (
            <button
              key={stake}
              onClick={() => toggleStake(stake)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                  : 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:border-violet-500/30'
              )}
            >
              {STAKE_LABELS[stake]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
