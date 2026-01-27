/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/lib/utils'
import { ACTION_COLORS, ACTION_TEXT } from '@/constants/poker'
import { HAND_GRID, RANKS, type Action } from '@/types/poker'

type EditorCell = Action | [Action, Action]
type GridState = Record<string, EditorCell>

export { type EditorCell, type GridState }

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

function isFoldCell(cell: EditorCell | undefined): boolean {
  if (!cell) return true
  if (Array.isArray(cell)) return cell[0] === 'fold' && cell[1] === 'fold'
  return cell === 'fold'
}

export function calcRangeStats(grid: GridState) {
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

interface TranscriberGridProps {
  chartKey: string
  grid: GridState
  onCellMouseDown: (chartKey: string, hand: string, e: React.MouseEvent) => void
  onCellMouseEnter: (chartKey: string, hand: string) => void
}

export function TranscriberGrid({ chartKey, grid, onCellMouseDown, onCellMouseEnter }: TranscriberGridProps) {
  const stats = calcRangeStats(grid)
  const label = chartKey.replace(/-/g, ' ')

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-neutral-300">{label}</div>

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
                onMouseDown={(e) => onCellMouseDown(chartKey, hand.name, e)}
                onMouseEnter={() => onCellMouseEnter(chartKey, hand.name)}
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
}
