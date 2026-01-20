import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChartStore } from '@/stores/chartStore'
import { getValidScenarios, getValidVillains, SCENARIOS, type Position, type Scenario } from '@/types/poker'

export function ContextBar() {
  const { position, scenario, villain, setScenario, setVillain, reset } = useChartStore()

  const validScenarios = getValidScenarios(position)
  const validVillains = getValidVillains(position, scenario)
  const currentScenarioConfig = SCENARIOS.find(s => s.id === scenario)

  const handleScenarioChange = (value: string) => {
    setScenario(value as Scenario)
  }

  const handleVillainChange = (value: string) => {
    setVillain(value as Position)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {/* Back button */}
      <button
        onClick={reset}
        className="h-9 px-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm font-medium transition-all duration-200 border border-neutral-700/50 hover:border-neutral-600 backdrop-blur-sm"
      >
        <span className="mr-1">←</span> Back
      </button>

      {/* Position display */}
      <div className="h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold flex items-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
        {position}
      </div>

      {/* Scenario selector */}
      <Select value={scenario} onValueChange={handleScenarioChange}>
        <SelectTrigger className="w-[130px] h-9 bg-neutral-800/80 border-neutral-700/50 text-neutral-200 rounded-lg backdrop-blur-sm hover:border-neutral-600 transition-colors">
          <SelectValue placeholder="Scenario" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-800/95 border-neutral-700/50 backdrop-blur-md rounded-lg">
          {validScenarios.map(s => (
            <SelectItem
              key={s.id}
              value={s.id}
              className="text-neutral-200 focus:bg-neutral-700 focus:text-white rounded-md"
            >
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Villain selector (only if scenario requires it) */}
      {currentScenarioConfig?.requiresVillain && validVillains.length > 0 && (
        <>
          <span className="text-neutral-600 text-sm font-medium">vs</span>
          <Select value={villain || ''} onValueChange={handleVillainChange}>
            <SelectTrigger className="w-[90px] h-9 bg-neutral-800/80 border-neutral-700/50 text-neutral-200 rounded-lg backdrop-blur-sm hover:border-neutral-600 transition-colors">
              <SelectValue placeholder="Villain" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800/95 border-neutral-700/50 backdrop-blur-md rounded-lg">
              {validVillains.map(v => (
                <SelectItem
                  key={v}
                  value={v}
                  className="text-neutral-200 focus:bg-neutral-700 focus:text-white rounded-md"
                >
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  )
}
