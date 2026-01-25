import { useState, useCallback, useEffect } from 'react'
import { HAND_GRID, RANKS, POSITIONS, SCENARIOS, type Action, type Cell, type Position, type Scenario } from '@/types/poker'
import { getChartKey } from '@/data/ranges'
import { cn } from '@/lib/utils'

type GridState = Record<string, Cell>

const ACTIONS: Action[] = ['fold', 'call', 'raise', 'allin']

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

const ACTION_KEYS: Record<string, Action> = {
  f: 'fold',
  c: 'call',
  r: 'raise',
  a: 'allin',
}

function cellToChar(cell: Cell): string {
  if (Array.isArray(cell)) {
    const [a, b] = cell
    if (b === 'fold') {
      if (a === 'raise') return 'R'
      if (a === 'call') return 'C'
      if (a === 'allin') return 'A'
    }
    // Other splits - use first letter of each
    return a[0] + b[0]
  }
  if (cell === 'fold') return '.'
  return cell[0] // c, r, a
}

function charToCell(char: string): Cell {
  if (char === '.' || char === 'f') return 'fold'
  if (char === 'c') return 'call'
  if (char === 'r') return 'raise'
  if (char === 'a') return 'allin'
  if (char === 'R') return ['raise', 'fold']
  if (char === 'C') return ['call', 'fold']
  if (char === 'A') return ['allin', 'fold']
  return 'fold'
}

function gridToText(grid: GridState): string {
  const rows: string[] = []
  for (let row = 0; row < 13; row++) {
    let line = ''
    for (let col = 0; col < 13; col++) {
      const hand = HAND_GRID[row][col].name
      const cell = grid[hand] || 'fold'
      line += cellToChar(cell)
    }
    rows.push(line)
  }
  return rows.join('\n')
}

function textToGrid(text: string): GridState {
  const grid: GridState = {}
  const lines = text.trim().split('\n')
  for (let row = 0; row < Math.min(13, lines.length); row++) {
    const line = lines[row]
    for (let col = 0; col < Math.min(13, line.length); col++) {
      const hand = HAND_GRID[row][col].name
      const cell = charToCell(line[col])
      if (cell !== 'fold') {
        grid[hand] = cell
      }
    }
  }
  return grid
}

function gridToCode(grid: GridState, chartKey: string): string {
  const entries = Object.entries(grid)
    .filter(([, cell]) => cell !== 'fold')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hand, cell]) => {
      const cellStr = Array.isArray(cell)
        ? `['${cell[0]}', '${cell[1]}']`
        : `'${cell}'`
      return `'${hand}': ${cellStr}`
    })

  return `'${chartKey}': {\n  ${entries.join(', ')},\n},`
}

export function ChartTranscriber() {
  const [grid, setGrid] = useState<GridState>({})
  const [hero, setHero] = useState<Position>('BTN')
  const [scenario, setScenario] = useState<Scenario>('RFI')
  const [villain, setVillain] = useState<Position | null>(null)
  const [importText, setImportText] = useState('')
  const [copied, setCopied] = useState(false)

  // Paintbrush state
  const [brush, setBrush] = useState<Action>('raise')
  const [isPainting, setIsPainting] = useState(false)

  const chartKey = getChartKey(hero, scenario, villain || undefined)
  const scenarioConfig = SCENARIOS.find(s => s.id === scenario)
  const needsVillain = scenarioConfig?.requiresVillain ?? false

  // Reactive text output
  const gridText = gridToText(grid)

  // Keyboard shortcuts for brush selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = ACTION_KEYS[e.key.toLowerCase()]
      if (action) {
        setBrush(action)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Stop painting when mouse released anywhere
  useEffect(() => {
    const handleMouseUp = () => setIsPainting(false)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const paintCell = useCallback((hand: string) => {
    setGrid(prev => {
      if (brush === 'fold') {
        const { [hand]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [hand]: brush }
    })
  }, [brush])

  const handleCellMouseDown = useCallback((hand: string, e: React.MouseEvent) => {
    e.preventDefault()

    // Shift+click toggles split
    if (e.shiftKey) {
      setGrid(prev => {
        const current = prev[hand] || 'fold'
        if (current === 'fold') return prev

        if (Array.isArray(current)) {
          return { ...prev, [hand]: current[0] }
        } else {
          return { ...prev, [hand]: [current, 'fold'] as Cell }
        }
      })
      return
    }

    setIsPainting(true)
    paintCell(hand)
  }, [paintCell])

  const handleCellMouseEnter = useCallback((hand: string) => {
    if (isPainting) {
      paintCell(hand)
    }
  }, [isPainting, paintCell])

  const handleImport = useCallback(() => {
    const parsed = textToGrid(importText)
    setGrid(parsed)
    setImportText('')
  }, [importText])

  const handleCopyCode = useCallback(async () => {
    const code = gridToCode(grid, chartKey)
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [grid, chartKey])

  const handleClear = useCallback(() => {
    setGrid({})
    setImportText('')
  }, [])

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* Controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={hero}
          onChange={(e) => setHero(e.target.value as Position)}
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
        >
          {POSITIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as Scenario)}
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
        >
          {SCENARIOS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {needsVillain && (
          <select
            value={villain || ''}
            onChange={(e) => setVillain(e.target.value as Position || null)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          >
            <option value="">Select villain</option>
            {POSITIONS.filter(p => p !== hero).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        <span className="text-neutral-400 text-sm font-mono">{chartKey}</span>
      </div>

      {/* Brush toolbar */}
      <div className="flex gap-1">
        {ACTIONS.map(action => (
          <button
            key={action}
            onClick={() => setBrush(action)}
            className={cn(
              'px-4 py-2 rounded text-sm font-medium transition-all',
              ACTION_COLORS[action],
              brush === action
                ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-950'
                : 'opacity-60 hover:opacity-80'
            )}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
            <span className="ml-1.5 text-xs opacity-60">({action[0].toUpperCase()})</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleClear}
          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
        >
          Clear
        </button>
      </div>

      {/* Grid */}
      <div className="relative bg-neutral-900/50 backdrop-blur-sm rounded-lg border border-neutral-800/50 p-2 select-none max-w-md">
        {/* Column headers */}
        <div className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]">
          <div className="w-4 sm:w-5" />
          {RANKS.map((rank) => (
            <div
              key={rank}
              className="aspect-square flex items-center justify-center text-neutral-500 font-medium text-[7px] sm:text-[9px]"
            >
              {rank}
            </div>
          ))}
        </div>

        {/* Grid with row headers */}
        {HAND_GRID.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-[auto_repeat(13,1fr)] gap-[2px] mb-[2px]">
            <div className="w-4 sm:w-5 flex items-center justify-center text-neutral-500 font-medium text-[7px] sm:text-[9px]">
              {RANKS[rowIdx]}
            </div>
            {row.map((hand) => {
              const cell = grid[hand.name] || 'fold'
              const isSplit = Array.isArray(cell)

              if (isSplit) {
                const [bottom, top] = cell
                return (
                  <div
                    key={hand.name}
                    onMouseDown={(e) => handleCellMouseDown(hand.name, e)}
                    onMouseEnter={() => handleCellMouseEnter(hand.name)}
                    className="aspect-square flex items-center justify-center relative overflow-hidden rounded-[2px] text-[8px] sm:text-[10px] cursor-pointer"
                  >
                    <div className={cn('absolute inset-0 h-1/2', ACTION_COLORS[top])} />
                    <div className={cn('absolute inset-0 top-1/2 h-1/2', ACTION_COLORS[bottom])} />
                    <span className="relative z-10 font-semibold text-white mix-blend-difference">
                      {hand.name}
                    </span>
                  </div>
                )
              }

              return (
                <div
                  key={hand.name}
                  onMouseDown={(e) => handleCellMouseDown(hand.name, e)}
                  onMouseEnter={() => handleCellMouseEnter(hand.name)}
                  className={cn(
                    'aspect-square flex items-center justify-center font-semibold tracking-tight rounded-[2px] cursor-pointer text-[8px] sm:text-[10px]',
                    ACTION_COLORS[cell],
                    ACTION_TEXT[cell]
                  )}
                >
                  {hand.name}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Help */}
      <div className="text-xs text-neutral-500">
        Click or drag to paint · Shift+click to toggle split · Keys: F C R A
      </div>

      {/* Text I/O */}
      <div className="grid grid-cols-2 gap-4">
        {/* Output - reactive */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-neutral-400">Output</span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm"
            >
              {copied ? 'Copied!' : 'Copy TS'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
            >
              Clear
            </button>
          </div>
          <textarea
            value={gridText}
            readOnly
            className="w-full h-56 bg-neutral-900 border border-neutral-700 rounded p-2 font-mono text-sm"
          />
        </div>

        {/* Import */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-neutral-400">Import</span>
            <button
              onClick={handleImport}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
            >
              Apply
            </button>
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`. = fold, c = call, r = raise, a = allin\nR = raise/fold, C = call/fold`}
            className="w-full h-56 bg-neutral-900 border border-neutral-700 rounded p-2 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}
