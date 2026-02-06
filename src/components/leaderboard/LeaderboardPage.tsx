import { Link, Outlet } from '@tanstack/react-router'
import { PlayerSearch } from '@/components/players/PlayerSearch'
import { LeaderboardArchive as LeaderboardArchiveView } from './LeaderboardArchive'
import { RakebackAnalysis } from './RakebackAnalysis'
import { cn } from '@/lib/utils'
import { getDatesCovered } from '@/data/players'

function TabLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        'text-neutral-400 hover:text-neutral-200'
      )}
      activeProps={{
        className: 'bg-neutral-700 text-white',
      }}
    >
      {label}
    </Link>
  )
}

export function LeaderboardPage() {
  const dates = getDatesCovered()
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  return (
    <div className="flex flex-col h-full">
      {/* View mode toggle + date range */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 p-1 bg-neutral-900/50 rounded-lg w-fit">
          <TabLink to="/leaderboard" label="Player Search" exact />
          <TabLink to="/leaderboard/archive" label="Results Archive" />
          <TabLink to="/leaderboard/rakeback" label="Rakeback" />
        </div>
        <span className="text-xs text-neutral-500">
          {firstDate} — {lastDate} · Data from public Natural8 leaderboards
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export function LeaderboardPlayers() {
  return <PlayerSearch />
}

export { LeaderboardArchiveView as LeaderboardArchive }

export function LeaderboardRakeback() {
  return <RakebackAnalysis />
}
