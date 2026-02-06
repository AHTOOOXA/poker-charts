import { cn } from '@/lib/utils'
import type { PlayerType } from '@/types/player'

const PLAYER_TYPE_STYLES: Record<PlayerType, { colors: string; label: string }> = {
  HV: {
    colors: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'HV',
  },
  REG: {
    colors: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    label: 'REG',
  },
  REC: {
    colors: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'REC',
  },
}

interface RegTypeBadgeProps {
  type: PlayerType
  className?: string
}

export function RegTypeBadge({ type, className }: RegTypeBadgeProps) {
  const style = PLAYER_TYPE_STYLES[type]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        style.colors,
        className
      )}
    >
      {style.label}
    </span>
  )
}
