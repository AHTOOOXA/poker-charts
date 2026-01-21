import { cn } from '@/lib/utils'
import type { RegType } from '@/types/player'

const REG_TYPE_COLORS: Record<RegType, string> = {
  grinder: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  regular: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  casual: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  new: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  inactive: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
}

interface RegTypeBadgeProps {
  type: RegType
  className?: string
}

export function RegTypeBadge({ type, className }: RegTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        REG_TYPE_COLORS[type],
        className
      )}
    >
      {type}
    </span>
  )
}
