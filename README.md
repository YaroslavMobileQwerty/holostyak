# Холостяк Тоталізатор

Віртуальний тоталізатор на шоу "Холостяк" (СТБ, сезон 15). 100% донатів → ЗСУ.

## Status

- [x] Phase 1: Foundation + Public pages
- [x] Phase 2: Coin Economy (застосуйте міграції на Supabase: `supabase db push` або через Dashboard)
- [x] Phase 3: Betting Core (застосуйте міграції: `2026042612*.sql` → `supabase db push` або Dashboard)
- [x] Phase 4: Live + Realtime (міграції `2026042712*.sql`, Edge `keep-alive`, Realtime publication вручну в Dashboard)
- [x] Phase 5: Social / Gamification (міграції `2026042812*.sql` → `supabase db push`; опційно `refresh_leaderboards()` за розкладом)
- [x] Phase 6: Admin Panel (full) — план: [Phase 6 — Admin (implementation)](docs/superpowers/plans/2026-04-25-admin-panel-phase-6.md); міграції `2026042912*.sql` → `supabase db push` або Dashboard
- [x] Phase 7: Season Prizes (міграції `2026043012*` → `supabase db push` або Dashboard; після — `npm run db:types`)
- [x] Phase 8: Motion / Polish (Framer Motion, GSAP hero, Howler + `public/sounds/*.wav` stubs, Sentry opt-in via `VITE_SENTRY_DSN`, Plausible script only in **production** build, lazy admin, Fontsource self-hosted fonts)

## Tech stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 (Cinematic Noir theme)
- Supabase (Postgres, Auth, Storage)
- TanStack Query + Zustand
- Vitest + Testing Library + Playwright
- Cloudflare Pages (deploy) + GitHub Actions (CI)

## Dev

```bash
npm install
cp .env.example .env.local  # заповнити Supabase URL + anon key
npm run dev                 # http://localhost:5173
```

**Перший акаунт з роллю `admin`:** тільки вручну в Supabase (SQL), напр. `update public.profiles set role = 'admin' where id = '…'`. Клієнт не може «призначити себе» адміном; подальше керування ролями — через `admin_set_role` (див. Phase 6 plan).

Корисні скрипти:

```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run test:e2e
npm run build
npm run db:types            # згенерувати типи з remote Supabase
```

## Docs

- [Design Spec](../2026-04-24-holostyak-tote-design.md)
- [Phase 1 Plan](../2026-04-24-phase-1-foundation.md)
- [Phase 2 Plan — Coin Economy (implementation)](docs/superpowers/plans/2026-04-24-coin-economy-phase-2.md)
- [Phase 3 Plan](docs/superpowers/plans/2026-04-24-betting-core-phase-3.md)
- [Phase 4 Plan — Live + Realtime (implementation)](docs/superpowers/plans/2026-04-24-live-realtime-phase-4.md)
- [Phase 5 Plan — Social / Gamification (implementation)](docs/superpowers/plans/2026-04-24-social-gamification-phase-5.md)
- [Phase 6 Plan — Admin Panel (implementation)](docs/superpowers/plans/2026-04-25-admin-panel-phase-6.md)
- [Phase 7 Plan — Season Prizes (implementation)](docs/superpowers/plans/2026-04-25-season-prizes-phase-7.md)
- [Phase 8 Plan — Motion / Polish (implementation)](docs/superpowers/plans/2026-04-25-phase-8-motion-polish.md)
- [Google OAuth setup](docs/google-oauth-setup.md)
- [Cloudflare Pages setup](docs/cloudflare-pages-setup.md)

## Environment variables

| Variable                 | Опис                             |
| ------------------------ | -------------------------------- |
| `VITE_SUPABASE_URL`      | URL Supabase проєкту             |
| `VITE_SUPABASE_ANON_KEY` | Публічний `anon` ключ Supabase   |
| `VITE_SENTRY_DSN`        | Опційно: DSN для Sentry browser SDK |
| `SUPABASE_PROJECT_ID`    | Project ID (для `npm run db:types`) |
