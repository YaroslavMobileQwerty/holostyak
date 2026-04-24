import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { LandingPage } from '@/pages/LandingPage'
import { AboutShowPage } from '@/pages/AboutShowPage'
import { SeasonPage } from '@/pages/SeasonPage'
import { EpisodesPage } from '@/pages/EpisodesPage'
import { EpisodeDetailPage } from '@/pages/EpisodeDetailPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'
import { AchievementsPage } from '@/pages/AchievementsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { CoinsPage } from '@/pages/CoinsPage'
import { WalletPage } from '@/pages/WalletPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallback } from '@/components/auth/AuthCallback'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { MyBetsPage } from '@/pages/MyBetsPage'
import { MyPrizesPage } from '@/pages/MyPrizesPage'
import {
  LazyAdminDashboardPage,
  LazyAdminPurchasesPage,
  LazyAdminUsersPage,
  LazyAdminEpisodesPage,
  LazyAdminEpisodeEditPage,
  LazyAdminResolutionPage,
  LazyAdminLivePage,
  LazyAdminSeasonsPage,
  LazyAdminBachelorsPage,
  LazyAdminParticipantsPage,
  LazyAdminUserDetailPage,
  LazyAdminAuditLogPage,
  LazyAdminBroadcastPage,
  LazyAdminSettingsPage,
  LazyAdminPrizesPage,
} from '@/lib/lazyRoutes'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'show', element: <AboutShowPage /> },
      { path: 'season', element: <SeasonPage /> },
      { path: 'episodes', element: <EpisodesPage /> },
      { path: 'episode/:id', element: <EpisodeDetailPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'u/:nickname', element: <PublicProfilePage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'coins', element: <CoinsPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'my-bets', element: <MyBetsPage /> },
      { path: 'prizes', element: <MyPrizesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <LazyAdminDashboardPage /> },
      { path: 'purchases', element: <LazyAdminPurchasesPage /> },
      { path: 'users', element: <LazyAdminUsersPage /> },
      { path: 'episodes', element: <LazyAdminEpisodesPage /> },
      { path: 'episode/:id', element: <LazyAdminEpisodeEditPage /> },
      { path: 'resolution', element: <LazyAdminResolutionPage /> },
      { path: 'live/:episodeId', element: <LazyAdminLivePage /> },
      { path: 'seasons', element: <LazyAdminSeasonsPage /> },
      { path: 'bachelors', element: <LazyAdminBachelorsPage /> },
      { path: 'participants', element: <LazyAdminParticipantsPage /> },
      { path: 'user/:id', element: <LazyAdminUserDetailPage /> },
      { path: 'audit', element: <LazyAdminAuditLogPage /> },
      { path: 'broadcast', element: <LazyAdminBroadcastPage /> },
      { path: 'settings', element: <LazyAdminSettingsPage /> },
      { path: 'prizes', element: <LazyAdminPrizesPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
