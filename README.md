# Холостяк Тоталізатор

Віртуальний тоталізатор на шоу "Холостяк" (СТБ, сезон 15). 100% донатів → ЗСУ.

## Status

- [x] Phase 1: Foundation + Public pages
- [ ] Phase 2: Coin Economy
- [ ] Phase 3: Betting Core
- [ ] Phase 4: Live + Realtime
- [ ] Phase 5: Social / Gamification
- [ ] Phase 6: Admin Panel (full)
- [ ] Phase 7: Season Prizes
- [ ] Phase 8: Motion / Polish

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
- [Google OAuth setup](docs/google-oauth-setup.md)
- [Cloudflare Pages setup](docs/cloudflare-pages-setup.md)

## Environment variables

| Variable                 | Опис                             |
| ------------------------ | -------------------------------- |
| `VITE_SUPABASE_URL`      | URL Supabase проєкту             |
| `VITE_SUPABASE_ANON_KEY` | Публічний `anon` ключ Supabase   |
| `SUPABASE_PROJECT_ID`    | Project ID (для `npm run db:types`) |
