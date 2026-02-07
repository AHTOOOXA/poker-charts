/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createRouter, createRootRoute, createRoute, Link, Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'
import { HandGrid } from '@/components/chart/HandGrid'
import { ChartControls } from '@/components/ChartControls'
import { Legend } from '@/components/Legend'
import { ProviderSelector } from '@/components/ProviderSelector'
import { getCellWithCascadedWeight } from '@/data/ranges'
import { useChartStore } from '@/stores/chartStore'
import { POSITIONS, SCENARIOS, type Position, type Scenario } from '@/types/poker'

// Lazy-loaded route components
const LeaderboardPage = lazy(() => import('@/components/leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const LeaderboardPlayers = lazy(() => import('@/components/leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardPlayers })))
const LeaderboardArchive = lazy(() => import('@/components/leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardArchive })))
const LeaderboardRakeback = lazy(() => import('@/components/leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardRakeback })))
const AnalyzerPage = lazy(() => import('@/components/analyze/AnalyzerPage').then(m => ({ default: m.AnalyzerPage })))
const DisclaimerPage = lazy(() => import('@/components/DisclaimerPage').then(m => ({ default: m.DisclaimerPage })))

// Root layout component
function RootLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-3 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-wide">
            <span className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Poker Lab
            </span>
          </h1>

          {/* Navigation tabs */}
          <nav aria-label="Main navigation" className="flex gap-1">
            <NavLink to="/" label="Preflop Ranges" exact />
            <NavLink to="/leaderboard" label="GG Leaderboards" />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 p-4 flex flex-col overflow-auto">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-3 border-t border-neutral-800/50 text-center text-xs text-neutral-600">
        Off-the-table study tool only. Not for use during live play. Not affiliated with GGPoker or Natural8.
        {' '}<Link to="/disclaimer" className="underline underline-offset-2 hover:text-neutral-400">Disclaimer</Link>
      </footer>
    </div>
  )
}

function NavLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        'text-neutral-500 hover:text-neutral-300'
      )}
      activeProps={{
        className: 'bg-neutral-800/50 text-white',
        'aria-current': 'page',
      }}
    >
      {label}
    </Link>
  )
}

// Get available scenarios for a hero/villain pair
function getAvailableScenarios(hero: string, villain: string | null): Scenario[] {
  const heroIdx = POSITIONS.indexOf(hero as Position)
  const villainIdx = villain ? POSITIONS.indexOf(villain as Position) : -1

  const scenarios: Scenario[] = []

  if (hero !== 'BB') {
    scenarios.push('RFI')
  }

  if (villain) {
    const villainBefore = villainIdx < heroIdx
    const villainAfter = villainIdx > heroIdx

    if (villainBefore) {
      scenarios.push('vs-open')
    }

    if (villainAfter) {
      scenarios.push('vs-3bet')
    }

    if (hero === 'BB' && villainBefore) {
      scenarios.push('vs-4bet')
    }
  }

  return scenarios
}

// Charts page component
function ChartsPage() {
  const { provider, position, villain } = useChartStore()
  const availableScenarios = getAvailableScenarios(position, villain)

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col items-center gap-4">
        <ProviderSelector />
        <ChartControls />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {availableScenarios.map(scenarioId => {
          const config = SCENARIOS.find(s => s.id === scenarioId)
          const scenarioVillain = config?.requiresVillain ? villain : undefined
          return (
            <HandGrid
              key={scenarioId}
              getCell={(hand: string) =>
                getCellWithCascadedWeight(provider, position, scenarioId, hand, scenarioVillain || undefined)
              }
              compact
              title={config?.label}
              subtitle={config?.description}
            />
          )
        })}
      </div>

      <Legend />
    </div>
  )
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ChartsPage,
})

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
})

const leaderboardIndexRoute = createRoute({
  getParentRoute: () => leaderboardRoute,
  path: '/',
  component: LeaderboardPlayers,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || '',
  }),
})

const leaderboardArchiveRoute = createRoute({
  getParentRoute: () => leaderboardRoute,
  path: '/archive',
  component: LeaderboardArchive,
  validateSearch: (search: Record<string, unknown>) => ({
    stake: (search.stake as string) || '',
    game: (search.game as string) || '',
    date: (search.date as string) || '',
  }),
})

const leaderboardRakebackRoute = createRoute({
  getParentRoute: () => leaderboardRoute,
  path: '/rakeback',
  component: LeaderboardRakeback,
  validateSearch: (search: Record<string, unknown>) => ({
    game: (search.game as string) || '',
    stake: (search.stake as string) || '',
    hph: search.hph ? String(search.hph) : '',
  }),
})

const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disclaimer',
  component: DisclaimerPage,
})

const analyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analyze',
  component: AnalyzerPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  leaderboardRoute.addChildren([
    leaderboardIndexRoute,
    leaderboardArchiveRoute,
    leaderboardRakebackRoute,
  ]),
  analyzeRoute,
  disclaimerRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
