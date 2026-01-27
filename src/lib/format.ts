// Format large numbers: 271750 -> "272k", 1500 -> "1.5k", 500 -> "500"
export function formatNumber(n: number): string {
  if (n >= 100000) {
    return `${Math.round(n / 1000)}k`
  }
  if (n >= 1000) {
    const k = n / 1000
    return `${k.toFixed(1).replace(/\.0$/, '')}k`
  }
  return n.toString()
}

// Format rank with suffix: 1 -> "1st", 2 -> "2nd", etc.
export function formatRank(n: number): string {
  if (n === 0) return '–'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Format date for display: "2026-01-15" -> "Jan 15"
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
