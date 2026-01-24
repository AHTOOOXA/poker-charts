import { cn } from '@/lib/utils'

const LEGEND_ITEMS = [
  { label: 'Raise', color: 'bg-sky-600' },
  { label: 'Call', color: 'bg-emerald-600' },
  { label: 'All-in', color: 'bg-rose-600' },
  { label: 'Fold', color: 'bg-neutral-800' },
]

export function Legend() {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded-sm', color)} />
          <span className="text-xs text-neutral-400 font-medium">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm overflow-hidden flex flex-col">
          <div className="h-1/2 bg-neutral-800" />
          <div className="h-1/2 bg-sky-600" />
        </div>
        <span className="text-xs text-neutral-400 font-medium">Mixed</span>
      </div>
    </div>
  )
}
