import { lazy } from 'react'

export const LazyAdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
export const LazyAdminPurchasesPage = lazy(() =>
  import('@/pages/admin/AdminPurchasesPage').then((m) => ({ default: m.AdminPurchasesPage })),
)
export const LazyAdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
export const LazyAdminEpisodesPage = lazy(() =>
  import('@/pages/admin/AdminEpisodesPage').then((m) => ({ default: m.AdminEpisodesPage })),
)
export const LazyAdminEpisodeEditPage = lazy(() =>
  import('@/pages/admin/AdminEpisodeEditPage').then((m) => ({ default: m.AdminEpisodeEditPage })),
)
export const LazyAdminResolutionPage = lazy(() =>
  import('@/pages/admin/AdminResolutionPage').then((m) => ({ default: m.AdminResolutionPage })),
)
export const LazyAdminLivePage = lazy(() =>
  import('@/pages/admin/AdminLivePage').then((m) => ({ default: m.AdminLivePage })),
)
export const LazyAdminSeasonsPage = lazy(() =>
  import('@/pages/admin/AdminSeasonsPage').then((m) => ({ default: m.AdminSeasonsPage })),
)
export const LazyAdminBachelorsPage = lazy(() =>
  import('@/pages/admin/AdminBachelorsPage').then((m) => ({ default: m.AdminBachelorsPage })),
)
export const LazyAdminParticipantsPage = lazy(() =>
  import('@/pages/admin/AdminParticipantsPage').then((m) => ({ default: m.AdminParticipantsPage })),
)
export const LazyAdminUserDetailPage = lazy(() =>
  import('@/pages/admin/AdminUserDetailPage').then((m) => ({ default: m.AdminUserDetailPage })),
)
export const LazyAdminAuditLogPage = lazy(() =>
  import('@/pages/admin/AdminAuditLogPage').then((m) => ({ default: m.AdminAuditLogPage })),
)
export const LazyAdminBroadcastPage = lazy(() =>
  import('@/pages/admin/AdminBroadcastPage').then((m) => ({ default: m.AdminBroadcastPage })),
)
export const LazyAdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)
export const LazyAdminPrizesPage = lazy(() =>
  import('@/pages/admin/AdminPrizesPage').then((m) => ({
    default: m.AdminPrizesPage,
  })),
)
