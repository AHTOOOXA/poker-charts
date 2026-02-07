import { CATEGORY_CONFIGS, type HandCategory } from '@/types/poker'

// Labels for grouped categories (used in simple/standard grouping modes)
export const GROUP_LABELS: Record<string, string> = {
  'made-hands': 'Made Hands',
  draws: 'Draws',
  nothing: 'Nothing',
  'strong-made': 'Strong Made',
  'two-pair': 'Two Pair',
  'top-pair': 'Top Pair+',
  'other-pair': 'Other Pairs',
}

// Colors for grouped categories
export const GROUP_COLORS: Record<string, string> = {
  'made-hands': '#6366F1',
  draws: '#EAB308',
  nothing: '#6B7280',
  'strong-made': '#8B5CF6',
  'two-pair': '#0EA5E9',
  'top-pair': '#14B8A6',
  'other-pair': '#22C55E',
}

const FALLBACK_COLOR = '#6B7280'

export function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIGS.find((c) => c.id === category) || {
      id: category as HandCategory,
      label: category,
      color: FALLBACK_COLOR,
    }
  )
}

export function getCategoryColor(category: string): string {
  return GROUP_COLORS[category] ?? getCategoryConfig(category).color
}

export function getCategoryLabel(category: string): string {
  return GROUP_LABELS[category] ?? getCategoryConfig(category).label
}

// Analyzer position colors
export const OOP_COLOR = '#f97316' // orange
export const IP_COLOR = '#22c55e' // green
