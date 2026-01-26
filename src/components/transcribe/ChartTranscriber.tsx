import { useState, useCallback, useEffect } from 'react'
import { POSITIONS, PROVIDERS, HAND_GRID, RANKS, type Action, type Position, type Provider } from '@/types/poker'
import { cn } from '@/lib/utils'

// Editor cell format matches the app's Cell type
type EditorCell = Action | [Action, Action]
type GridState = Record<string, EditorCell>
type ChartSet = Record<string, GridState>

interface EditorState {
  provider: Provider
  charts: ChartSet
}

const STORAGE_KEY = 'poker-chart-editor-v4'

const ACTION_COLORS: Record<Action, string> = {
  fold: 'bg-neutral-800',
  call: 'bg-emerald-600',
  raise: 'bg-sky-600',
  allin: 'bg-rose-600',
}

const ACTION_TEXT: Record<Action, string> = {
  fold: 'text-neutral-500',
  call: 'text-white',
  raise: 'text-white',
  allin: 'text-white',
}

// Scenario types and labels
type ScenarioType = 'RFI' | 'vs-open' | 'vs-3bet' | 'vs-4bet'

const SCENARIO_ACTIONS: Record<ScenarioType, Action[]> = {
  'RFI': ['fold', 'raise'],
  'vs-open': ['fold', 'call', 'raise', 'allin'],
  'vs-3bet': ['fold', 'call', 'raise', 'allin'],
  'vs-4bet': ['fold', 'call', 'allin'],
}

const ACTION_LABELS: Record<ScenarioType, Record<Action, string>> = {
  'RFI': { fold: 'Fold', call: 'Call', raise: 'Open', allin: 'Jam' },
  'vs-open': { fold: 'Fold', call: 'Call', raise: '3bet', allin: 'Jam' },
  'vs-3bet': { fold: 'Fold', call: 'Call', raise: '4bet', allin: 'Jam' },
  'vs-4bet': { fold: 'Fold', call: 'Call', raise: '4bet', allin: 'Jam' },
}

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
  } catch {}
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

function calcRangeStats(grid: GridState) {
  let pairs = 0, suited = 0, offsuit = 0

  for (const [hand, cell] of Object.entries(grid)) {
    if (isFoldCell(cell)) continue
    const weight = Array.isArray(cell) ? 0.5 : 1

    if (hand.length === 2) pairs += 6 * weight
    else if (hand.endsWith('s')) suited += 4 * weight
    else if (hand.endsWith('o')) offsuit += 12 * weight
  }

  const combos = pairs + suited + offsuit
  return {
    combos: Math.round(combos),
    percent: Math.round((combos / 1326) * 1000) / 10,
    pairs: Math.round(pairs),
    suited: Math.round(suited),
    offsuit: Math.round(offsuit)
  }
}

// Mini hand cell for the editor grid
interface MiniCellProps {
  hand: string
  cell: EditorCell | undefined
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: () => void
}

function MiniCell({ hand, cell, onMouseDown, onMouseEnter }: MiniCellProps) {
  const isSplit = Array.isArray(cell)
  const action = isSplit ? cell[0] : (cell || 'fold')

  if (isSplit) {
    const [bottom, top] = cell
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        className="aspect-square flex items-center justify-center relative overflow-hidden rounded-[2px] cursor-crosshair text-[9px] sm:text-[11px]"
      >
        <div className={cn('absolute inset-0 h-1/2', ACTION_COLORS[top])} />
        <div className={cn('absolute inset-0 top-1/2 h-1/2', ACTION_COLORS[bottom])} />
        <span className="relative z-10 font-semibold text-white mix-blend-difference">{hand}</span>
      </div>
    )
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={cn(
        'aspect-square flex items-center justify-center font-semibold tracking-tight rounded-[2px] cursor-crosshair text-[9px] sm:text-[11px]',
        ACTION_COLORS[action],
        ACTION_TEXT[action]
      )}
    >
      {hand}
    </div>
  )
}

export function ChartTranscriber() {
  const [state, setState] = useState<EditorState>(loadState)
  const [isPainting, setIsPainting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedHero, setExpandedHero] = useState<Position | null>(null)

  // Brush state
  const [scenario, setScenario] = useState<ScenarioType>('RFI')
  const [isSplitMode, setIsSplitMode] = useState(false)
  const [action1, setAction1] = useState<Action>('raise') // bottom/primary
  const [action2, setAction2] = useState<Action>('fold')  // top/secondary

  const { provider, charts } = state
  const actions = SCENARIO_ACTIONS[scenario]
  const labels = ACTION_LABELS[scenario]

  // Persist
  useEffect(() => { saveState(state) }, [state])

  // Mouse up anywhere stops painting
  useEffect(() => {
    const handler = () => setIsPainting(false)
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      const key = e.key

      // Number keys 1-4 select action1
      if (key >= '1' && key <= '4') {
        const idx = parseInt(key) - 1
        if (idx < actions.length) {
          setAction1(actions[idx])
        }
        return
      }

      // Shift + number keys select action2
      if (e.shiftKey && key >= '!' && key <= '$') {
        const shiftMap: Record<string, number> = { '!': 0, '@': 1, '#': 2, '$': 3 }
        const idx = shiftMap[key]
        if (idx !== undefined && idx < actions.length) {
          setAction2(actions[idx])
        }
        return
      }

      // S toggles split mode
      if (key.toLowerCase() === 's') {
        setIsSplitMode(prev => !prev)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions])

  const setProvider = (p: Provider) => setState(s => ({ ...s, provider: p }))

  // Get the cell to paint based on current brush state
  const getBrushCell = useCallback((): EditorCell => {
    if (isSplitMode) {
      return [action1, action2]
    }
    return action1
  }, [isSplitMode, action1, action2])

  const paintCell = useCallback((chartKey: string, hand: string) => {
    const brushCell = getBrushCell()
    setState(s => {
      const grid = s.charts[chartKey] || {}
      if (isFoldCell(brushCell)) {
        const { [hand]: _, ...rest } = grid
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
    if (isPainting) {
      paintCell(chartKey, hand)
    }
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

  // Preview of current brush
  const brushPreview = isSplitMode ? (
    <div className="w-8 h-8 relative rounded overflow-hidden border border-neutral-600">
      <div className={cn('absolute inset-0 h-1/2', ACTION_COLORS[action2])} />
      <div className={cn('absolute inset-0 top-1/2 h-1/2', ACTION_COLORS[action1])} />
    </div>
  ) : (
    <div className={cn('w-8 h-8 rounded border border-neutral-600', ACTION_COLORS[action1])} />
  )

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-sm py-3 border-b border-neutral-800 -mx-4 px-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Provider */}
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm"
          >
            {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="h-6 w-px bg-neutral-700" />

          {/* Mode toggle */}
          <div className="flex rounded overflow-hidden border border-neutral-700">
            <button
              onClick={() => setIsSplitMode(false)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium',
                !isSplitMode ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-400'
              )}
            >
              Solid
            </button>
            <button
              onClick={() => setIsSplitMode(true)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium',
                isSplitMode ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-400'
              )}
            >
              Split
            </button>
          </div>

          {/* Action 1 (bottom/primary) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">{isSplitMode ? 'Bottom:' : 'Action:'}</span>
            <div className="flex gap-1">
              {actions.map((a, i) => (
                <button
                  key={a}
                  onClick={() => setAction1(a)}
                  className={cn(
                    'px-2 py-1 rounded text-sm font-medium min-w-[50px]',
                    ACTION_COLORS[a],
                    action1 === a ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-75'
                  )}
                >
                  {labels[a]} <span className="opacity-50 text-xs">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action 2 (top/secondary) - only in split mode */}
          {isSplitMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Top:</span>
              <div className="flex gap-1">
                {actions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAction2(a)}
                    className={cn(
                      'px-2 py-1 rounded text-sm font-medium min-w-[50px]',
                      ACTION_COLORS[a],
                      action2 === a ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-75'
                    )}
                  >
                    {labels[a]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-6 w-px bg-neutral-700" />

          {/* Brush preview */}
          {brushPreview}

          <div className="flex-1" />

          <span className="text-neutral-500 text-sm">{filledCharts}/{totalCharts}</span>

          <button onClick={handleClearAll} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
            Clear
          </button>
          <button onClick={handleCopyCode} className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm font-medium">
            {copied ? 'Copied!' : 'Copy TS'}
          </button>
        </div>

        {/* Help text */}
        <div className="text-xs text-neutral-600 mt-2">
          Keys: 1-4 = action · S = toggle split · Drag to paint
        </div>
      </div>

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
                  {heroCharts.map(({ key, scenario: chartScenario }) => {
                    const grid = charts[key] || {}
                    const stats = calcRangeStats(grid)
                    const label = key.replace(/-/g, ' ')

                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-2"
                        onMouseEnter={() => setScenario(chartScenario)}
                      >
                        <div className="text-sm font-medium text-neutral-300">{label}</div>

                        {/* Grid */}
                        <div className="bg-neutral-900/50 rounded-lg border border-neutral-800/50 p-3 select-none">
                          {/* Column headers */}
                          <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]">
                            <div className="w-5 sm:w-6" />
                            {RANKS.map(r => (
                              <div key={r} className="aspect-square flex items-center justify-center text-neutral-500 font-medium text-[9px] sm:text-[10px]">
                                {r}
                              </div>
                            ))}
                          </div>

                          {/* Grid rows */}
                          {HAND_GRID.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]">
                              <div className="w-5 sm:w-6 flex items-center justify-center text-neutral-500 font-medium text-[9px] sm:text-[10px]">
                                {RANKS[rowIdx]}
                              </div>
                              {row.map(hand => (
                                <MiniCell
                                  key={hand.name}
                                  hand={hand.name}
                                  cell={grid[hand.name]}
                                  onMouseDown={(e) => handleCellMouseDown(key, hand.name, e)}
                                  onMouseEnter={() => handleCellMouseEnter(key, hand.name)}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="text-xs text-neutral-500 flex gap-2">
                          <span className="text-neutral-400 font-medium">{stats.combos} combos</span>
                          <span>({stats.percent}%)</span>
                          <span className="text-neutral-600">{stats.pairs}p {stats.suited}s {stats.offsuit}o</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
