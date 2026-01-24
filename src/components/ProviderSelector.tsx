import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChartStore } from '@/stores/chartStore'
import { PROVIDER_CONFIGS, type Provider } from '@/types/poker'

export function ProviderSelector() {
  const { provider, setProvider } = useChartStore()

  return (
    <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
      <SelectTrigger size="sm" className="w-[140px] bg-neutral-900/50 border-neutral-800">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROVIDER_CONFIGS.map((config) => (
          <SelectItem key={config.id} value={config.id}>
            {config.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
