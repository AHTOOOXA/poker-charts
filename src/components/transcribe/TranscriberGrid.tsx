/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/lib/utils'
import { ACTION_COLORS, ACTION_TEXT } from '@/constants/poker'
import { HAND_GRID, RANKS, normalizeCell, getSortedActions, type Cell } from '@/types/poker'

type EditorCell = Cell
type GridState = Record<string, EditorCell>

export { type EditorCell, type GridState }

interface MiniCellProps {
  hand: string
  cell: EditorCell | undefined
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: () => void
}

function MiniCell({ hand, cell, onMouseDown, onMouseEnter }: MiniCellProps) {
  const { weight, actions } = normalizeCell(cell || 'fold')
  const sortedActions = getSortedActions(actions)

  // Not in range - fold cell
  if (weight === 0 || sortedActions.length === 0) {
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        className={cn(
          'aspect-square flex items-center justify-center font-semibold tracking-tight rounded-[2px] cursor-crosshair text-[9px] sm:text-[11px]',
          ACTION_COLORS.fold,
          ACTION_TEXT.fold
        )}
      >
        {hand}
      </div>
    )
  }

  // Full weight with single action - solid cell
  if (weight === 100 && sortedActions.length === 1) {
    const [action] = sortedActions[0]
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

  // Weighted cell - horizontal bands from bottom, all same height = weight
  let accumulatedWidth = 0
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={cn(
        'aspect-square flex items-center justify-center relative overflow-hidden rounded-[2px] cursor-crosshair text-[9px] sm:text-[11px]',
        ACTION_COLORS.fold
      )}
    >
      {sortedActions.map(([action, percent]) => {
        const left = accumulatedWidth
        accumulatedWidth += percent
        return (
          <div
            key={action}
            className={cn('absolute bottom-0', ACTION_COLORS[action])}
            style={{
              left: `${left}%`,
              width: `${percent}%`,
              height: `${weight}%`,
            }}
          />
        )
      })}
      <span className="relative z-10 font-semibold text-white mix-blend-difference">{hand}</span>
    </div>
  )
}

function getCellPlayWeight(cell: EditorCell | undefined): number {
  if (!cell) return 0
  const { weight, actions } = normalizeCell(cell)
  // Calculate % of combos that are played (not folded)
  const foldPct = actions.fold || 0
  const playPct = 100 - foldPct
  return (weight / 100) * (playPct / 100)
}

export function calcRangeStats(grid: GridState) {
  let pairs = 0, suited = 0, offsuit = 0

  for (const [hand, cell] of Object.entries(grid)) {
    const weight = getCellPlayWeight(cell)
    if (weight === 0) continue

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
