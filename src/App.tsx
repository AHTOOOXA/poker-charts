import { useChartStore } from '@/stores/chartStore'

function App() {
  const { position, setPosition } = useChartStore()

  const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">Poker Charts</h1>
      <div className="flex gap-2 mb-4">
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setPosition(pos)}
            className={`px-4 py-2 rounded-md transition-colors ${
              position === pos
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground">
        Selected position: <span className="font-semibold text-foreground">{position}</span>
      </p>
    </div>
  )
}

export default App
