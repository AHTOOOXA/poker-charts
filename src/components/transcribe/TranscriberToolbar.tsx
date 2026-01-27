import { cn } from '@/lib/utils'
import { ACTION_COLORS } from '@/constants/poker'
import { PROVIDERS, type Action, type Provider } from '@/types/poker'

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

export { SCENARIO_ACTIONS, ACTION_LABELS, type ScenarioType }

interface TranscriberToolbarProps {
  provider: Provider
  setProvider: (p: Provider) => void
  scenario: ScenarioType
  isSplitMode: boolean
  setIsSplitMode: (v: boolean) => void
  action1: Action
  setAction1: (a: Action) => void
  action2: Action
  setAction2: (a: Action) => void
  filledCharts: number
  totalCharts: number
  onClear: () => void
  onCopy: () => void
  copied: boolean
}

export function TranscriberToolbar({
  provider,
  setProvider,
  scenario,
  isSplitMode,
  setIsSplitMode,
  action1,
  setAction1,
  action2,
  setAction2,
  filledCharts,
  totalCharts,
  onClear,
  onCopy,
  copied,
}: TranscriberToolbarProps) {
  const actions = SCENARIO_ACTIONS[scenario]
  const labels = ACTION_LABELS[scenario]

  const brushPreview = isSplitMode ? (
    <div className="w-8 h-8 relative rounded overflow-hidden border border-neutral-600">
      <div className={cn('absolute inset-0 h-1/2', ACTION_COLORS[action2])} />
      <div className={cn('absolute inset-0 top-1/2 h-1/2', ACTION_COLORS[action1])} />
    </div>
  ) : (
    <div className={cn('w-8 h-8 rounded border border-neutral-600', ACTION_COLORS[action1])} />
  )

  return (
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

        {/* Action 1 */}
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

        {/* Action 2 - only in split mode */}
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

        {brushPreview}

        <div className="flex-1" />

        <span className="text-neutral-500 text-sm">{filledCharts}/{totalCharts}</span>

        <button onClick={onClear} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
          Clear
        </button>
        <button onClick={onCopy} className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm font-medium">
          {copied ? 'Copied!' : 'Copy TS'}
        </button>
      </div>

      <div className="text-xs text-neutral-600 mt-2">
        Keys: 1-4 = action · S = toggle split · Drag to paint
      </div>
    </div>
  )
}
