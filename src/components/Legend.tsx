import { cn } from '@/lib/utils'
import type { Action } from '@/types/poker'

const LEGEND_ITEMS: { action: Action; label: string; gradient: string; dashed?: boolean }[] = [
  { action: 'raise', label: 'Raise', gradient: 'bg-gradient-to-r from-sky-500 to-sky-600' },
  { action: 'raise-passive', label: 'Raise (vs fish)', gradient: 'bg-gradient-to-r from-sky-400/60 to-sky-500/60', dashed: true },
  { action: 'call', label: 'Call', gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
  { action: 'call-passive', label: 'Call (vs fish)', gradient: 'bg-gradient-to-r from-emerald-400/60 to-emerald-500/60', dashed: true },
  { action: '3bet', label: '3bet', gradient: 'bg-gradient-to-r from-amber-400 to-amber-500' },
  { action: '3bet-fold', label: '3bet/fold', gradient: 'bg-gradient-to-r from-amber-400/70 to-amber-500/70' },
  { action: '3bet-call', label: '3bet/call', gradient: 'bg-gradient-to-r from-amber-500 to-amber-600' },
  { action: '4bet-bluff', label: '4bet bluff', gradient: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { action: 'all-in', label: 'All-in', gradient: 'bg-gradient-to-r from-rose-500 to-rose-600' },
  { action: 'fold', label: 'Fold', gradient: 'bg-neutral-700' },
]

export function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap py-2">
      {LEGEND_ITEMS.map(({ action, label, gradient, dashed }) => (
        <div key={action} className="flex items-center gap-1.5">
          <div className={cn(
            'w-3 h-3 rounded-sm shadow-sm',
            gradient,
            dashed && 'border border-dashed border-white/30'
          )} />
          <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
