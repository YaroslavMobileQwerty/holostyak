import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { LandingPage } from '@/pages/LandingPage'
import { AboutShowPage } from '@/pages/AboutShowPage'
import { SeasonPage } from '@/pages/SeasonPage'
import { EpisodesPage } from '@/pages/EpisodesPage'
import { EpisodeDetailPage } from '@/pages/EpisodeDetailPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallback } from '@/components/auth/AuthCallback'
import { NotFoundPage } from '@/pages/NotFoundPage'

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
      { path: 'profile', element: <ProfilePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
