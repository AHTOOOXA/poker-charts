import { cn } from '@/lib/utils'
import type { Action } from '@/types/poker'

const LEGEND_ITEMS: { action: Action; label: string; gradient: string }[] = [
  { action: 'raise', label: 'Raise', gradient: 'bg-gradient-to-r from-sky-500 to-sky-600' },
  { action: 'call', label: 'Call', gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
  { action: '3bet', label: '3bet', gradient: 'bg-gradient-to-r from-amber-400 to-amber-500' },
  { action: 'all-in', label: 'All-in', gradient: 'bg-gradient-to-r from-rose-500 to-rose-600' },
  { action: 'fold', label: 'Fold', gradient: 'bg-neutral-700' },
]

export function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap py-2">
      {LEGEND_ITEMS.map(({ action, label, gradient }) => (
        <div key={action} className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-sm shadow-sm',
            gradient
          )} />
          <span className="text-xs text-neutral-500 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
