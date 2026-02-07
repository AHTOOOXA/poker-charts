import { useMemo } from 'react'
import { useAnalyzerStore } from '@/stores/analyzerStore'
import { analyzeRange, groupCategories, resolveRanges, countRangeCombos } from '@/lib/analyzer'
import type { Chart } from '@/data/ranges'
import type { Card, Grouping } from '@/types/poker'
import { HandGrid } from '@/components/chart/HandGrid'
import { RangeSelector } from './RangeSelector'
import { BoardInput } from './BoardInput'
import { BreakdownTable } from './BreakdownTable'
import { BreakdownPieChart } from './BreakdownPieChart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OOP_COLOR, IP_COLOR } from '@/constants/breakdown'

interface RangeAnalysisProps {
  title: string
  subtitle: string
  chart: Chart
  board: Card[]
  grouping: Grouping
  color: string
}

function RangeAnalysis({
  title,
  subtitle,
  chart,
  board,
  grouping,
  color,
}: RangeAnalysisProps) {
  const analysis = useMemo(() => {
    if (board.length < 3) return null
    return analyzeRange(chart, board, true, true)
  }, [chart, board])

  const groupedResults = useMemo(() => {
    if (!analysis) return []
    return groupCategories(analysis.byCategory, grouping)
  }, [analysis, grouping])

  const getCell = (handName: string) => {
    return chart[handName] || 'fold'
  }

  const comboCount = useMemo(() => countRangeCombos(chart), [chart])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="px-3 py-2 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="text-sm font-semibold" style={{ color }}>
          {title}
        </div>
        <div className="text-xs text-neutral-400">{subtitle}</div>
        <div className="text-xs text-neutral-500 mt-1">
          {comboCount} preflop combos
        </div>
      </div>

      {/* Hand Grid */}
      <HandGrid getCell={getCell} compact />

      {/* Breakdown */}
      {board.length >= 3 ? (
        <>
          <BreakdownTable
            results={groupedResults}
            totalCombos={analysis?.totalCombos || 0}
            highlightedCategories={[]}
            onCategoryClick={() => {}}
          />
          <BreakdownPieChart results={groupedResults} />
        </>
      ) : (
        <div className="text-center text-neutral-500 py-6 text-sm">
          Enter a flop to see breakdown
        </div>
      )}
    </div>
  )
}

export function AnalyzerPage() {
  const {
    provider,
    potType,
    oopPosition,
    ipPosition,
    board,
    addCard,
    removeCard,
    clearBoard,
    setBoard,
    grouping,
    setGrouping,
  } = useAnalyzerStore()

  // Resolve ranges for both positions
  const resolvedRanges = useMemo(() => {
    return resolveRanges(provider, potType, oopPosition, ipPosition)
  }, [provider, potType, oopPosition, ipPosition])

  const potTypeLabel = potType === 'srp' ? 'Single Raised Pot' : '3bet Pot'

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Row: Controls + Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Range Selection */}
          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800/50 p-4">
            <h2 className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wide">
              Scenario
            </h2>
            <RangeSelector />
          </div>

          {/* Board Input */}
          <div className="lg:col-span-2 bg-neutral-900/50 rounded-xl border border-neutral-800/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
                Board
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500">
                  {potTypeLabel}: {oopPosition} vs {ipPosition}
                </span>
                <Select
                  value={grouping}
                  onValueChange={(v) => setGrouping(v as Grouping)}
                >
                  <SelectTrigger className="w-28 h-7 text-xs bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <BoardInput
              cards={board}
              onAddCard={addCard}
              onRemoveCard={removeCard}
              onClear={clearBoard}
              onSetBoard={setBoard}
            />
          </div>
        </div>

        {/* Error State */}
        {!resolvedRanges.isValid && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mb-6">
            <p className="text-red-400">{resolvedRanges.error}</p>
          </div>
        )}

        {/* Side-by-side Range Analysis */}
        {resolvedRanges.isValid && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OOP Analysis */}
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800/50 p-4">
              <RangeAnalysis
                title={`OOP: ${oopPosition}`}
                subtitle={resolvedRanges.oopDescription}
                chart={resolvedRanges.oopRange}
                board={board}
                grouping={grouping}
                color={OOP_COLOR}
              />
            </div>

            {/* IP Analysis */}
            <div className="bg-neutral-900/50 rounded-xl border border-neutral-800/50 p-4">
              <RangeAnalysis
                title={`IP: ${ipPosition}`}
                subtitle={resolvedRanges.ipDescription}
                chart={resolvedRanges.ipRange}
                board={board}
                grouping={grouping}
                color={IP_COLOR}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
