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
          <div className={cn('w-4 h-4 rounded-sm', color)} aria-hidden="true" />
          <span className="text-xs text-neutral-400 font-medium">{label}</span>
        </div>
      ))}
      {/* Mixed example: 70% weight, raise 60% / call 40% - bands from bottom */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm overflow-hidden relative bg-neutral-800">
          <div className="absolute bottom-0 left-0 w-[60%] h-[70%] bg-sky-600" />
          <div className="absolute bottom-0 left-[60%] w-[40%] h-[70%] bg-emerald-600" />
        </div>
        <span className="text-xs text-neutral-400 font-medium">Mixed</span>
      </div>
    </div>
  )
}
