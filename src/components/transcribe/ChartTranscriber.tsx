import { useState, useCallback, useEffect } from 'react'
import { POSITIONS, type Action, type Position, type Provider } from '@/types/poker'
import { TranscriberToolbar, SCENARIO_ACTIONS, type ScenarioType } from './TranscriberToolbar'
import { TranscriberGrid, type EditorCell, type GridState } from './TranscriberGrid'

type ChartSet = Record<string, GridState>

interface EditorState {
  provider: Provider
  charts: ChartSet
}

const STORAGE_KEY = 'poker-chart-editor-v4'

interface ChartKeyInfo {
  key: string
  hero: Position
  scenario: ScenarioType
  villain?: Position
}

function generateChartKeys(): ChartKeyInfo[] {
  const keys: ChartKeyInfo[] = []
  const posOrder = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const

  // RFI
  for (const hero of POSITIONS) {
    if (hero !== 'BB') {
      keys.push({ key: `${hero}-RFI`, hero, scenario: 'RFI' })
    }
  }

  // vs-open
  for (let h = 1; h < posOrder.length; h++) {
    for (let v = 0; v < h; v++) {
      keys.push({ key: `${posOrder[h]}-vs-open-${posOrder[v]}`, hero: posOrder[h], scenario: 'vs-open', villain: posOrder[v] })
    }
  }

  // vs-3bet
  for (let h = 0; h < posOrder.length - 1; h++) {
    if (posOrder[h] === 'BB') continue
    for (let v = h + 1; v < posOrder.length; v++) {
      keys.push({ key: `${posOrder[h]}-vs-3bet-${posOrder[v]}`, hero: posOrder[h], scenario: 'vs-3bet', villain: posOrder[v] })
    }
  }

  // vs-4bet
  for (const villain of ['UTG', 'MP', 'CO', 'BTN', 'SB'] as const) {
    keys.push({ key: `BB-vs-4bet-${villain}`, hero: 'BB', scenario: 'vs-4bet', villain })
  }
  for (const villain of ['UTG', 'MP', 'CO', 'BTN'] as const) {
    keys.push({ key: `SB-vs-4bet-${villain}`, hero: 'SB', scenario: 'vs-4bet', villain })
  }
  for (const villain of ['UTG', 'CO'] as const) {
    keys.push({ key: `BTN-vs-4bet-${villain}`, hero: 'BTN', scenario: 'vs-4bet', villain })
  }
  keys.push({ key: 'CO-vs-4bet-UTG', hero: 'CO', scenario: 'vs-4bet', villain: 'UTG' })
  keys.push({ key: 'MP-vs-4bet-UTG', hero: 'MP', scenario: 'vs-4bet', villain: 'UTG' })

  return keys
}

const ALL_CHART_KEYS = generateChartKeys()

function groupByHero(): Record<Position, ChartKeyInfo[]> {
  const groups: Record<Position, ChartKeyInfo[]> = { UTG: [], MP: [], CO: [], BTN: [], SB: [], BB: [] }
  for (const chart of ALL_CHART_KEYS) {
    groups[chart.hero].push(chart)
  }
  return groups
}

const CHARTS_BY_HERO = groupByHero()

function loadState(): EditorState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { provider: 'greenline', charts: {} }
}

function saveState(state: EditorState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function isFoldCell(cell: EditorCell | undefined): boolean {
  if (!cell) return true
  if (Array.isArray(cell)) return cell[0] === 'fold' && cell[1] === 'fold'
  return cell === 'fold'
}

function cellToExport(cell: EditorCell): string {
  if (Array.isArray(cell)) {
    return `['${cell[0]}', '${cell[1]}']`
  }
  return `'${cell}'`
}

function chartsToCode(charts: ChartSet): string {
  const lines: string[] = []
  lines.push("import type { Chart } from './index'")
  lines.push('')
  lines.push('export const charts: Record<string, Chart> = {')

  for (const { key } of ALL_CHART_KEYS) {
    const grid = charts[key] || {}
    const entries = Object.entries(grid)
      .filter(([, cell]) => !isFoldCell(cell))
      .sort(([a], [b]) => a.localeCompare(b))

    if (entries.length === 0) {
      lines.push(`  '${key}': {},`)
    } else {
      const cellStrs = entries.map(([hand, cell]) => `'${hand}': ${cellToExport(cell)}`)
      lines.push(`  '${key}': {`)
      lines.push(`    ${cellStrs.join(', ')},`)
      lines.push(`  },`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

export function ChartTranscriber() {
  const [state, setState] = useState<EditorState>(loadState)
  const [isPainting, setIsPainting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedHero, setExpandedHero] = useState<Position | null>(null)

  // Brush state
  const [scenario, setScenario] = useState<ScenarioType>('RFI')
  const [isSplitMode, setIsSplitMode] = useState(false)
  const [action1, setAction1] = useState<Action>('raise')
  const [action2, setAction2] = useState<Action>('fold')

  const { provider, charts } = state
  const actions = SCENARIO_ACTIONS[scenario]

  // Persist
  useEffect(() => { saveState(state) }, [state])

  // Mouse up stops painting
  useEffect(() => {
    const handler = () => setIsPainting(false)
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      const key = e.key

      if (key >= '1' && key <= '4') {
        const idx = parseInt(key) - 1
        if (idx < actions.length) setAction1(actions[idx])
        return
      }

      if (e.shiftKey && key >= '!' && key <= '$') {
        const shiftMap: Record<string, number> = { '!': 0, '@': 1, '#': 2, '$': 3 }
        const idx = shiftMap[key]
        if (idx !== undefined && idx < actions.length) setAction2(actions[idx])
        return
      }

      if (key.toLowerCase() === 's') {
        setIsSplitMode(prev => !prev)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions])

  const setProvider = (p: Provider) => setState(s => ({ ...s, provider: p }))

  const getBrushCell = useCallback((): EditorCell => {
    return isSplitMode ? [action1, action2] : action1
  }, [isSplitMode, action1, action2])

  const paintCell = useCallback((chartKey: string, hand: string) => {
    const brushCell = getBrushCell()
    setState(s => {
      const grid = s.charts[chartKey] || {}
      if (isFoldCell(brushCell)) {
        const { [hand]: _removed, ...rest } = grid
void _removed
        return { ...s, charts: { ...s.charts, [chartKey]: rest } }
      }
      return { ...s, charts: { ...s.charts, [chartKey]: { ...grid, [hand]: brushCell } } }
    })
  }, [getBrushCell])

  const handleCellMouseDown = useCallback((chartKey: string, hand: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsPainting(true)
    paintCell(chartKey, hand)
  }, [paintCell])

  const handleCellMouseEnter = useCallback((chartKey: string, hand: string) => {
    if (isPainting) paintCell(chartKey, hand)
  }, [isPainting, paintCell])

  const handleCopyCode = useCallback(async () => {
    const code = chartsToCode(charts)
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [charts])

  const handleClearAll = useCallback(() => {
    if (confirm('Clear all charts?')) {
      setState(s => ({ ...s, charts: {} }))
    }
  }, [])

  const totalCharts = ALL_CHART_KEYS.length
  const filledCharts = ALL_CHART_KEYS.filter(c => {
    const grid = charts[c.key]
    return grid && Object.values(grid).some(cell => !isFoldCell(cell))
  }).length

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <TranscriberToolbar
        provider={provider}
        setProvider={setProvider}
        scenario={scenario}
        isSplitMode={isSplitMode}
        setIsSplitMode={setIsSplitMode}
        action1={action1}
        setAction1={setAction1}
        action2={action2}
        setAction2={setAction2}
        filledCharts={filledCharts}
        totalCharts={totalCharts}
        onClear={handleClearAll}
        onCopy={handleCopyCode}
        copied={copied}
      />

      {/* Charts by position */}
      <div className="flex flex-col gap-6">
        {POSITIONS.map(hero => {
          const heroCharts = CHARTS_BY_HERO[hero]
          if (heroCharts.length === 0) return null

          const heroFilled = heroCharts.filter(c => {
            const grid = charts[c.key]
            return grid && Object.values(grid).some(cell => !isFoldCell(cell))
          }).length

          return (
            <div key={hero} className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setExpandedHero(expandedHero === hero ? null : hero)
                  if (heroCharts[0]) setScenario(heroCharts[0].scenario)
                }}
                className="flex items-center gap-2 text-left"
              >
                <span className="text-lg font-semibold text-white">{hero}</span>
                <span className="text-sm text-neutral-500">{heroFilled}/{heroCharts.length}</span>
                <span className="text-neutral-600">{expandedHero === hero ? '▼' : '▶'}</span>
              </button>

              {expandedHero === hero && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {heroCharts.map(({ key, scenario: chartScenario }) => (
                    <div key={key} onMouseEnter={() => setScenario(chartScenario)}>
                      <TranscriberGrid
                        chartKey={key}
                        grid={charts[key] || {}}
                        onCellMouseDown={handleCellMouseDown}
                        onCellMouseEnter={handleCellMouseEnter}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
