import { cn } from '@/lib/utils'
import type { CategoryResult } from '@/lib/analyzer'
import type { HandCategory } from '@/types/poker'
import { CATEGORY_CONFIGS } from '@/types/poker'

interface BreakdownTableProps {
  results: CategoryResult[]
  totalCombos: number
  highlightedCategories: HandCategory[]
  onCategoryClick: (category: HandCategory) => void
}

function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIGS.find((c) => c.id === category) || {
      id: category as HandCategory,
      label: category,
      color: '#6B7280',
    }
  )
}

// Custom labels for grouped categories
const GROUP_LABELS: Record<string, string> = {
  'made-hands': 'Made Hands',
  draws: 'Draws',
  nothing: 'Nothing',
  'strong-made': 'Strong Made',
  'two-pair': 'Two Pair',
  'top-pair': 'Top Pair+',
  'other-pair': 'Other Pairs',
}

const GROUP_COLORS: Record<string, string> = {
  'made-hands': '#6366F1',
  draws: '#EAB308',
  nothing: '#6B7280',
  'strong-made': '#8B5CF6',
  'two-pair': '#0EA5E9',
  'top-pair': '#14B8A6',
  'other-pair': '#22C55E',
}

export function BreakdownTable({
  results,
  totalCombos,
  highlightedCategories,
  onCategoryClick,
}: BreakdownTableProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-8">
        Enter a board to see breakdown
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {results.map((result) => {
        const config = getCategoryConfig(result.category)
        const isGrouped = GROUP_LABELS[result.category]
        const label = isGrouped || config.label
        const color = isGrouped ? GROUP_COLORS[result.category] : config.color
        const isHighlighted = highlightedCategories.includes(
          result.category as HandCategory
        )

        return (
          <button
            key={result.category}
            onClick={() => onCategoryClick(result.category as HandCategory)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
              'transition-colors text-left',
              isHighlighted
                ? 'bg-neutral-700/50 ring-1 ring-neutral-600'
                : 'hover:bg-neutral-800/50'
            )}
          >
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />

            {/* Category name */}
            <span className="flex-1 text-sm text-neutral-200 font-medium">
              {label}
            </span>

            {/* Combos */}
            <span className="text-sm text-neutral-300 tabular-nums font-semibold w-12 text-right">
              {result.combos.toFixed(result.combos % 1 === 0 ? 0 : 1)}
            </span>

            {/* Percentage */}
            <span className="text-sm text-neutral-500 tabular-nums w-14 text-right">
              {result.percentage.toFixed(1)}%
            </span>

            {/* Bar */}
            <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${result.percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </button>
        )
      })}

      {/* Total */}
      <div className="flex items-center gap-3 px-3 py-2 border-t border-neutral-800 mt-2 pt-2">
        <div className="w-3" />
        <span className="flex-1 text-sm text-neutral-400 font-medium">
          Total
        </span>
        <span className="text-sm text-neutral-200 tabular-nums font-bold w-12 text-right">
          {totalCombos.toFixed(totalCombos % 1 === 0 ? 0 : 1)}
        </span>
        <span className="text-sm text-neutral-500 tabular-nums w-14 text-right">
          100%
        </span>
        <div className="w-20" />
      </div>
    </div>
  )
}
