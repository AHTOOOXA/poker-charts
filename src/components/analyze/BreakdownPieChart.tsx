import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryResult } from '@/lib/analyzer'
import { CATEGORY_CONFIGS } from '@/types/poker'

interface BreakdownPieChartProps {
  results: CategoryResult[]
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

function getCategoryColor(category: string): string {
  if (GROUP_COLORS[category]) {
    return GROUP_COLORS[category]
  }
  const config = CATEGORY_CONFIGS.find((c) => c.id === category)
  return config?.color || '#6B7280'
}

function getCategoryLabel(category: string): string {
  if (GROUP_LABELS[category]) {
    return GROUP_LABELS[category]
  }
  const config = CATEGORY_CONFIGS.find((c) => c.id === category)
  return config?.label || category
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      category: string
      combos: number
      percentage: number
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) {
    return null
  }

  const data = payload[0].payload
  const label = getCategoryLabel(data.category)

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-sm font-medium text-neutral-200">{label}</div>
      <div className="text-xs text-neutral-400">
        {data.combos.toFixed(1)} combos ({data.percentage.toFixed(1)}%)
      </div>
    </div>
  )
}

export function BreakdownPieChart({ results }: BreakdownPieChartProps) {
  if (results.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">
        No data to display
      </div>
    )
  }

  const data = results.map((r) => ({
    ...r,
    name: getCategoryLabel(r.category),
    value: r.combos,
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(entry.category)}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
