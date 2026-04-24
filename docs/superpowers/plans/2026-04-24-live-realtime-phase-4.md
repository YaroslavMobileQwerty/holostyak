# Live + Realtime (Phase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Додати швидкі lightning-ставки під час ефіру, live-UI на `EpisodeDetailPage`, обмежений Supabase Realtime (лише `episodes` + `bet_events` у Replication), стриманий polling як fallback, pg_cron для `auto_lock_expired_events` і keep-alive, та адмін-сторінку `/admin/live/:episodeId`.

**Architecture:** У коді після фази 3 події вже мають `type` (у т.ч. `'lightning'`) і `closes_at` / `is_live` в `public.bet_events` — **немає колонки `category`** (скелет [../../../2026-04-24-phase-4-live-realtime.md](../../../2026-04-24-phase-4-live-realtime.md) писав про `category`: у всіх задачах використовуйте `type = 'lightning'`). Вікно прийому для блискавок задається **через `opens_at` / `closes_at`** (різниця = `lock_time_seconds`); це вже погоджується з `place_bet` у `supabase/migrations/20260426120400_betting_rpc.sql`. Нові RPC: `create_lightning_event` (транзакція: `bet_event` + `bet_options`, лише `episodes.status = 'live'`), `quick_resolve_lightning` (закриває подію, якщо треба, викликом `lock_bet_event`, потім `resolve_bet_event` — без дублювання логіки виплат). Realtime: максимум **2 `postgres_channels`** на клієнта для публічного епізоду (episodes, bet_events з фільтром `type=lightning`); **гість не підключає** Realtime — економія згідно скелету. Третій «логічний» канал для лічильників адміна: **не окреме підключення** — `refetchInterval` у `AdminLivePage` (наприклад 10–15с) замість `admin:counters` Realtime, щоб не витрачати квоту. Опційно пізніше: Broadcast/Presence. Keep-alive: пріоритет `pg_cron` у міграції, якщо на проєкті увімкнено; інакше Edge Function з `supabase/functions/keep-alive/index.ts` + зовнішній cron (як у скелеті).

**Tech Stack:** `holostyak-tote` (React 19, Vite 8, TanStack Query 5, `@supabase/supabase-js` v2 **включає Realtime**), `canvas-confetti`, Tailwind 4, Vitest, Playwright, існуючі `src/lib/supabase.ts` (`createClient<Database>`), `src/pages/EpisodeDetailPage.tsx`, `src/components/betting/*`, `src/router.tsx`, `src/hooks/admin/*`.

**Prereq:** Міграції фази 3 застосовані; `place_bet`, `lock_bet_event`, `resolve_bet_event` існують; `episodes.status` у т.ч. `live`, `finalized`.

**Spec delta:** [../../../2026-04-24-phase-4-live-realtime.md](../../../2026-04-24-phase-4-live-realtime.md) — цей план виправляє ймення полів і прив’язку до `closes_at`.

**Workspace root:** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260427120000_lightning_db.sql` | Generated `is_lightning`, partial index `where type = 'lightning'` |
| `supabase/migrations/20260427120100_lightning_rpcs.sql` | `create_lightning_event`, `quick_resolve_lightning` (security definer) |
| `supabase/migrations/20260427120200_pg_cron_optional.sql` | `pg_cron` + jobs (умовно: обгорнути `if exists` / закоментовані інструкції для free tier) |
| `supabase/functions/keep-alive/index.ts` | Edge Function пінг (як у скелеті) + `supabase/config.toml` якщо потрібно |
| `src/hooks/realtime/useEpisodeRealtime.ts` | Підписка на `episodes` за `id` |
| `src/hooks/realtime/useLightningRealtime.ts` | Підписка на `bet_events` (lightning) за `episode_id` |
| `src/hooks/realtime/realtimeHealth.ts` | Модуль лічильника активних channel subscriptions (для `useRealtimeHealth`) |
| `src/hooks/useLightningEvents.ts` | Query: lightning для епізоду (TanStack) |
| `src/hooks/useLivePolling.ts` (або `useEpisodePollingFallback`) | Polling 10s/30s при WS-фейлі |
| `src/hooks/admin/useCreateLightningEvent.ts` | RPC-мутація |
| `src/hooks/admin/useQuickResolveLightning.ts` | RPC-мутація |
| `src/components/live/*` | LiveModeBanner, LightningEventToast, LightningEventCard, LiveStickyPanel |
| `src/components/admin/LightningControlPanel.tsx` | Форма + список + resolve |
| `src/components/admin/LiveDashboardWidget.tsx` | Картка на `AdminDashboardPage` (лічильник + лінк на live) |
| `src/pages/admin/AdminLivePage.tsx` | Маршрут `live/:episodeId` |
| `src/pages/EpisodeDetailPage.tsx` | Банер, панель, toasts, підписки (умовно) |
| `src/pages/admin/AdminDashboardPage.tsx` | `useRealtimeHealth` + підказка квоти |
| `src/router.tsx` | `admin/live/:episodeId` |
| `src/components/admin/AdminLayout.tsx` | Пункт «Ефір» (посилання-шаблон або на список епізодів) |
| `src/lib/database.types.ts` | Після `npm run db:types` |
| `tests/unit/realtime/fallback.test.ts` | Логіка retry → polling |
| `tests/unit/live/*.test.ts` | Countdown/queue (за потреби) |
| `tests/e2e/live-lightning.spec.ts` | 2 context: admin + user (коли stable seed) |
| `package.json` | `canvas-confetti` + типи |
| `holostyak-tote/README.md` | Після релізу: Phase 4 у **Status** → `[x]`; посилання в **Docs** вже додане в рамках планування |

---

## Task 0: Верифікація гілки

**Files:** —

- [ ] **Step 1:** `cd holostyak-tote && npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build` — очікувано: все зелене.
- [ ] **Step 2:** Переконатися, що `bet_events.type` у БД дозволяє `'lightning'` (див. `20260426120000_betting_tables.sql`).

---

## Task 1: Міграція `is_lightning` + partial index

**Files:**
- Create: `supabase/migrations/20260427120000_lightning_db.sql`

- [ ] **Step 1:** Додати згенеровану колонку та індекс (Postgres 12+; `stored` на PG 12+):

```sql
-- Узгоджено з існуючим полем type (не category)
alter table public.bet_events
  add column if not exists is_lightning boolean
  generated always as (type = 'lightning') stored;

create index if not exists bet_events_lightning_episode_status_idx
  on public.bet_events (episode_id, status, closes_at)
  where type = 'lightning';
```

- [ ] **Step 2:** `supabase db push` (або apply на staging), потім `npm run db:types` з `SUPABASE_PROJECT_ID` у середовищі.

- [ ] **Step 3:** Commit: `git add supabase/migrations/20260427120000_lightning_db.sql && git commit -m "feat(db): is_lightning column and index for lightning bet_events"`

---

## Task 2: RPC `create_lightning_event`

**Files:**
- Create: `supabase/migrations/20260427120100_lightning_rpcs.sql` (частина 1)

- [ ] **Step 1:** Реалізувати публічну функцію (security definer, `search_path = public` як у `20260425120400_coin_rpc.sql`):

  - Сигнатура: `p_episode_id uuid, p_title text, p_description text default null, p_bachelor_id uuid default null, p_lock_time_seconds int default 120, p_options jsonb` — де `p_options` = `[{"custom_label": "…", "participant_id": null, "odds": 2.5}, ...]` (мінімум 2 опції для UX; перевіряти `jsonb_array_length` ≥ 2).
  - `auth.uid()` is admin (`public.is_admin()`).
  - `select status from episodes where id = p_episode_id` → має бути `'live'`, інакше `raise exception`.
  - `v_closes := now() + (p_lock_time_seconds::text || ' seconds')::interval` (обмежити `p_lock_time_seconds` between 30 and 600).
  - `insert into bet_events` з `type = 'lightning'`, `opens_at = now()`, `closes_at = v_closes`, `status = 'open'`, `is_live = true`, `is_multi_choice = false` (MVP), `max_bet_amount` optional param або null.
  - Для кожного елемента масиву `insert into bet_options` з `order_index` по індексу.
  - `return` uuid нового `bet_events.id`.
  - `grant execute` на `authenticated` не потрібен для `anon`; як у інших admin RPC: `grant execute to authenticated` (роль перевіряється в тілі).

- [ ] **Step 2:** Оновити `src/lib/database.types.ts` у секції `Functions` вручну або через `db:types`.

- [ ] **Step 3:** Commit: `feat(db): create_lightning_event RPC`

---

## Task 3: RPC `quick_resolve_lightning`

**Files:**
- Modify: `supabase/migrations/20260427120100_lightning_rpcs.sql` (частина 2)

- [ ] **Step 1:** `quick_resolve_lightning(p_event_id uuid, p_winning_option_id uuid) returns void`

  - `is_admin()`.
  - `select * from bet_events where id = p_event_id for update` → `type = 'lightning'`, `episode_id` валідний.
  - Якщо `status = 'open'` і `now() >= closes_at` (або якщо продукт дозволяє ранній resolve — зафіксуйте **один** варіант: рекомендація: дозволити лише коли `now() >= closes_at` **або** після lock): для узгодження з `resolve_bet_event` (потрібен `status = 'closed'`) виконати `perform public.lock_bet_event(p_event_id)` **лише** якщо `status = 'open'`; якщо `lock_bet_event` падає через «не open» — вже `closed` → пропустити.
  - Виклик `select public.resolve_bet_event(p_event_id, array[p_winning_option_id]::uuid[])` — **існуюча** функція з `20260426120400_betting_rpc.sql`.
  - Додати `admin_audit_log` action `lightning_resolved` (опційно, якщо `resolve` вже логірує — не дублювати; інакше один рядок).

- [ ] **Step 2:** `grant execute on function public.quick_resolve_lightning(...)` to `authenticated` (як у фазі 3).

- [ ] **Step 3:** Commit у той самий PR або `feat(db): quick_resolve_lightning wrapper`

---

## Task 4: Supabase Dashboard — Replication (manual)

**Files:** — (документація в цьому плані; орієнтир: Supabase Docs → Realtime → Postgres Changes; опційно окремий `docs/…` **лише за явним запитом**)

- [ ] **Step 1:** У Dashboard → Database → **Publication** (Realtime): увімкнути реплікацію **тільки** для `public.episodes` та `public.bet_events`. Не вмикати `bets`, `coin_transactions`, `profiles` (див. скелет).
- [ ] **Step 2:** Перевірити, що RLS дозволяє `select` гостю для `episodes` і `bet_events` (у проєкті `bet_events` уже `for select using (true)` з `20260426120300_betting_rls.sql`).

---

## Task 5: `useEpisodeRealtime`

**Files:**
- Create: `src/hooks/realtime/useEpisodeRealtime.ts`
- Create: `src/hooks/realtime/realtimeHealth.ts` (мінімальний `increment`/`decrement` при subscribe/unsubscribe)

- [ ] **Step 1:** Реалізувати хук:

```ts
// useEpisodeRealtime.ts — схема
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { bumpChannels } from './realtimeHealth'
import { toast } from 'sonner'

export function useEpisodeRealtime(episodeId: string | undefined) {
  const qc = useQueryClient()
  const { user } = useAuth()
  const prev = useRef<string | null>(null)

  useEffect(() => {
    if (!episodeId || !user) return
    const ch = supabase
      .channel(`episode-status-${episodeId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'episodes', filter: `id=eq.${episodeId}` }, (p) => {
        const next = (p.new as { status: string }).status
        if (prev.current !== 'live' && next === 'live') toast('Ефір розпочався!')
        prev.current = next
        void qc.invalidateQueries({ queryKey: ['episode', episodeId] })
        void qc.invalidateQueries({ queryKey: ['episodeBetEvents', episodeId] })
        void qc.invalidateQueries({ queryKey: ['lightning', episodeId] })
      })
      .subscribe()
    bumpChannels(1)
    return () => {
      void supabase.removeChannel(ch)
      bumpChannels(-1)
    }
  }, [episodeId, user, qc])
}
```

(Точні типи `payload` взяти з `RealtimePostgresChangesPayload` у проєкті; `prev` ініціалізувати з поточного `useEpisode` при першому рендері опційно.)

- [ ] **Step 2:** `npx tsc --noEmit` + lint.

- [ ] **Step 3:** Commit: `feat(realtime): episode status channel for authenticated users`

---

## Task 6: `useLightningRealtime` + гість без WS

**Files:**
- Create: `src/hooks/realtime/useLightningRealtime.ts`
- Modify: `src/hooks/realtime/realtimeHealth.ts`

- [ ] **Step 1:** Підписка:

```ts
// фільтр: episode_id=eq.X — і в application layer ще фільтрувати new.type === 'lightning'
event: 'INSERT', table: 'bet_events', filter: `episode_id=eq.${episodeId}`
event: 'UPDATE', table: 'bet_events', filter: `episode_id=eq.${episodeId}`
```

- [ ] **Step 2:** Підписка **тільки якщо** `user` (як у скелету): `if (!user) return` в `useEffect` cleanup без subscribe.

- [ ] **Step 3:** На INSERT/UPDATE: `invalidateQueries` для `['episodeBetEvents', episodeId]`, `['lightning', episodeId]`, `['betEvent', ...]`; показ `LightningEventToast` через callback prop або зуланд store — не всередині хука бізнес-логіку UI (передати `onNewLightning?: (id: string) => void`).

- [ ] **Step 4:** Commit: `feat(realtime): lightning bet_events channel`

---

## Task 7: `useLightningEvents` (query) + `useLightningStatusUrl`

**Files:**
- Create: `src/hooks/useLightningEvents.ts`

- [ ] **Step 1:**

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLightningEvents(episodeId: string | undefined) {
  return useQuery({
    queryKey: ['lightning', episodeId],
    enabled: !!episodeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bet_events')
        .select('*, bet_options(*)')
        .eq('episode_id', episodeId!)
        .eq('type', 'lightning')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}
```

- [ ] **Step 2:** У `useEpisodeBetEvents.ts` (опційно) додати окреме відображення або залишити агрегат — **не** дублювати запити: або розширити `useEpisodeBetEvents` параметром `includeLightningOnly`, **або** на сторінці викликати `useLightningEvents` + існуючий список; у плані рекомендація: `EpisodeDetailPage` використовує `useLightningEvents` для sticky-панелі, `useEpisodeBetEvents` — для не-lightning (фільтр `neq('type','lightning')` у `useEpisodeBetEvents` **або** клієнтський filter — виконайте **один** варіант у Task 9).

- [ ] **Step 3:** Commit: `feat(data): useLightningEvents query`

---

## Task 8: Polling fallback

**Files:**
- Create: `src/hooks/useLiveEpisodePolling.ts`

- [ ] **Step 1:** Хук приймає `enabled: boolean, episodeId, intervalMs = 10_000`. `useEffect` + `setInterval` → `invalidateQueries` ті ж ключі, що й Realtime, коли `enabled` (WS failed).

- [ ] **Step 2:** Обгортка `useRealWithFallback` (опційно): лічильник `failures` з `useEpisodeRealtime` не доступний — простіше: **окремий** `useWebsocketErrorBoundary` state у батьківському: при трьох помилках `CHANNEL_ERROR` з `supabase.getChannels()` — set `usePolling = true` (таймер 10s/30s залежно від `episodes.status === 'live'`).

- [ ] **Step 3:** Unit test: `tests/unit/realtime/fallback.test.ts` — чиста функція `decideInterval(isLive, wsFailed): number`.

- [ ] **Step 4:** Commit: `feat(realtime): polling fallback for live episode`

---

## Task 9: `canvas-confetti` + `useRealtimeHealth`

**Files:**
- Modify: `package.json`
- Create: `src/hooks/realtime/useRealtimeHealth.ts`
- Modify: `src/pages/admin/AdminDashboardPage.tsx`

- [ ] **Step 1:** `npm install canvas-confetti` та `@types/canvas-confetti` як dev (якщо потрібно).

- [ ] **Step 2:** `realtimeHealth.ts` експортує `getActiveChannelCount(): number` та `bumpChannels(delta: number)`.

- [ ] **Step 3:** `useRealtimeHealth()` читає count; якщо `> 150` (поріг з скелету) — `toast.warning` один раз / або банер тільки в адмінці (не спам).

- [ ] **Step 4:** На `AdminDashboardPage` показати рядок: «Active Realtime channel subscriptions: N» (лише admin).

- [ ] **Step 5:** Commit: `feat(admin): realtime health + confetti dep`

---

## Task 10: UI — `LiveModeBanner` + `LightningEventToast` + `LiveStickyPanel` + `LightningEventCard`

**Files:**
- Create: `src/components/live/LiveModeBanner.tsx`
- Create: `src/components/live/LightningEventToast.tsx`
- Create: `src/components/live/LightningEventCard.tsx`
- Create: `src/components/live/LiveStickyPanel.tsx`

- [ ] **Step 1:** `LiveModeBanner` — `episode.status === 'live'`, `Link` / кнопка `scrollIntoView` на `id="lightning-panel"`.

- [ ] **Step 2:** `LightningEventToast` — `sonner` custom або `fixed bottom` div; props: `title`, `closesAt`, `onOpenBet`, `onDismiss`; countdown через `date-fns` + `setInterval` 1s.

- [ ] **Step 3:** `LightningEventCard` — тонка обгортка над полями `BetEventCard` **або** копія зі скороченим layout; **перевага:** перевикористати `PlaceBetModal` + `usePlaceBet` з `src/hooks/usePlaceBet.ts` без дубляжу.

- [ ] **Step 4:** `LiveStickyPanel` — `className` desktop: `lg:fixed lg:right-4 lg:top-24 lg:w-80`; mobile: `fixed bottom-0` з max-height. Вміст: `useLightningEvents` → мапа на `LightningEventCard` для `status in ('open','closed')` з countdown з `BetCountdown` у `src/components/betting/BetCountdown.tsx`.

- [ ] **Step 5:** Після `resolve` на клієнті: `import('canvas-confetti').then(m => m.default())` у обробнику `INSERT` bet row win — краще: у `useLightningRealtime` **не**; у `useMyBets` invalidate **або** в `useLightningRealtime` при UPDATE `bet_events` status resolved перевірити `useMyBetsForEpisode` — спростити: при отриманні `postgres_changes` UPDATE resolved на lightning → викликати `confetti` якщо `user` had bet (запит `bets` на цей event) — **окремий** маленький `useEffect` у `EpisodeDetailPage` на зміну `myMap` + `event status`. YAGNI: confetti після `toast.success` з `usePlaceBet` не підходить — лише після resolve. **Мінімум:** confetti в `useLightningRealtime` після `UPDATE` якщо `new.status === 'resolved'` && локальна перевірка виграшу через refetch `myBetsForEpisode`.

- [ ] **Step 6:** Commit: `feat(ui): live components for episode page`

---

## Task 11: Інтеграція `EpisodeDetailPage`

**Files:**
- Modify: `src/pages/EpisodeDetailPage.tsx`

- [ ] **Step 1:** Для `user`: викликати `useEpisodeRealtime`, `useLightningRealtime` (коли `episode?.status === 'live'`), `useLightningEvents`.

- [ ] **Step 2:** Рендер `LiveModeBanner` + `div id="lightning-panel"` з `LiveStickyPanel`.

- [ ] **Step 3:** Для `guest`: без Realtime; `refetchInterval` на `useLightningEvents` 30_000 **лише** якщо `status === 'live'` (паралельно `useQuery` `refetchInterval`).

- [ ] **Step 4:** Відфільтрувати `betEvents` з `useEpisodeBetEvents`: виключити `type === 'lightning'` з основного списку, якщо lightning показується в панелі (уникнути дубляжу).

- [ ] **Step 5:** Commit: `feat(pages): episode live layout and lightning split`

---

## Task 12: Адмін — `useCreateLightningEvent` + `useQuickResolveLightning`

**Files:**
- Create: `src/hooks/admin/useCreateLightningEvent.ts`
- Create: `src/hooks/admin/useQuickResolveLightning.ts`

- [ ] **Step 1:** `supabase.rpc('create_lightning_event', { ... })` з типами з `database.types.ts`.

- [ ] **Step 2:** Invalidate `['lightning', episodeId]`, `['episodeBetEvents', episodeId]`, `['betEventsByEpisode', episodeId]`, `['adminBetEventsResolution']` після create.

- [ ] **Step 3:** `quick_resolve_lightning` — invalidate ті ж + `profile`, `coinTransactions`, `myBets` як `useResolveBetEvent`.

- [ ] **Step 4:** Commit: `feat(data): admin lightning mutations`

---

## Task 13: `LightningControlPanel` + `AdminLivePage`

**Files:**
- Create: `src/components/admin/LightningControlPanel.tsx`
- Create: `src/pages/admin/AdminLivePage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1:** `AdminLivePage` — `useParams().episodeId`, `useEpisode(episodeId)` для заголовка, кнопка `EpisodeStatusControl` вже в `src/components/admin/EpisodeStatusControl.tsx` (імпортувати) для переходу `→ live` / `→ finalized`.

- [ ] **Step 2:** `LightningControlPanel` — quick presets 60/120/180 (сек), поле title, `useCreateLightningEvent`, список з `useLightningEvents` + resolve через radio + `useQuickResolveLightning` (кнопка «Підсумок»). Історія: resolved/void внизу (sort `created_at desc`).

- [ ] **Step 3:** Роут:

```tsx
{ path: 'live/:episodeId', element: <AdminLivePage /> },
```

(імпорти в `src/router.tsx` додати поруч з існуючими admin-сторінками.)

- [ ] **Step 4:** `AdminLayout` — `Link to="/admin/episodes"`-підказка «оберіть випуск, потім Ефір» **або** `Link` на `/admin/live` без id не існує — додати тільки текст у docs; у наві: «Ефір» → `to="/admin/episodes"` з підзаголовком. **Конкретно:** додати пункт `{ to: '/admin/episodes', label: 'Випуски (ефір з картки)' }` вже є — додайте `AdminEpisodesPage` кнопку «Ефір» в рядок таблиці веде на `/admin/live/${id}` (окремий мікро-Task 13b).

- [ ] **Step 4b:** У `src/pages/admin/AdminEpisodesPage.tsx` додати `Link` «Ефір» на `/admin/live/${ep.id}`.

- [ ] **Step 5:** Commit: `feat(admin): live episode control page`

---

## Task 14: `LiveDashboardWidget`

**Files:**
- Create: `src/components/admin/LiveDashboardWidget.tsx`
- Modify: `src/pages/admin/AdminDashboardPage.tsx`

- [ ] **Step 1:** Віджет: кількість епізодів у `status = 'live'` (запит `from('episodes').select('id', { count: 'exact' }).eq('status','live')`) + лінк на перший / на `AdminEpisodesPage`.

- [ ] **Step 2:** Показ `useRealtimeHealth` біля віджету.

- [ ] **Step 3:** Commit: `feat(admin): live widget on dashboard`

---

## Task 15: `pg_cron` + keep-alive (міграції)

**Files:**
- Create: `supabase/migrations/20260427120200_pg_cron_optional.sql`

- [ ] **Step 1:** Вміст (як у скелету), обгорнути в коментар `BEGIN` / інструкцію: якщо `create extension pg_cron` падає на free tier — застосувати **лише** Edge keep-alive (Task 16).

```sql
-- create extension if not exists pg_cron;  -- увімкнути вручну на проєктах, де дозволено
-- select cron.schedule('auto-lock-expired-events', '* * * * *', $$ select public.auto_lock_expired_events(); $$);
-- select cron.schedule('keep-alive', '0 3 */4 * *', $$ select count(*)::int from public.profiles $$);
```

(Точні рядки без `create extension` в одному коміті, якщо невпевнені — **порожній** файл + README note.)

- [ ] **Step 2:** Перевірити, що `public.auto_lock_expired_events()` вже існує (фаза 3, `20260426120400_betting_rpc.sql`).

- [ ] **Step 3:** Commit: `chore(db): optional pg_cron schedule notes for phase 4`

---

## Task 16: Edge Function `keep-alive`

**Files:**
- Create: `supabase/functions/keep-alive/index.ts`
- Modify: `supabase/config.toml` (якщо відсутній — створити мінімальний `project_id` / `[functions]`)

- [ ] **Step 1:** Код з скелету `2026-04-24-phase-4-live-realtime.md` (рядки 142–149), `createClient` з `SERVICE_ROLE_KEY`.

- [ ] **Step 2:** Опис keep-alive (edge URL + зовнішній cron) додати в існуючу документацію за потреби (наприклад Cloudflare) — **не** створювати новий `.md` без запиту; мінімум: коментар у `index.ts` Edge Function.

- [ ] **Step 3:** `supabase functions serve keep-alive` локально (опційно).

- [ ] **Step 4:** Commit: `feat(functions): keep-alive edge function`

---

## Task 17: Unit + E2E тести

**Files:**
- Create: `tests/unit/realtime/fallback.test.ts`
- Create: `tests/e2e/live-lightning.spec.ts`

- [ ] **Step 1:** Unit: `decideInterval` / pure helpers 100% покриті мінімум 3 кейсами.

- [ ] **Step 2:** E2E: структура як `holostyak-tote/tests/e2e/betting-lifecycle.spec.ts` — `test.skip` з коментарем «потрібні 2 user + seed + live episode», плюс «smoke: guest відкриває episode без крешу» (якщо ще не в `smoke.spec.ts`).

- [ ] **Step 3:** `npm run test -- --run && npm run test:e2e`

- [ ] **Step 4:** Commit: `test: phase 4 live fallback and e2e skeleton`

---

## Task 18: README + тег (після staging)

**Files:**
- Modify: `holostyak-tote/README.md`

- [ ] **Step 1:** Після successful acceptance: у `README.md` розділ **Status** — Phase 4 → `[x]`. Рядок у **Docs** з посиланням на цей план доданий заздалегідь; дубль не вставляти.

- [ ] **Step 2:** `git tag phase-4-complete` (анотовано за бажанням).

---

## Self-review (внутрішній чеклист)

1. **Spec coverage:** скелетні Tasks 1–16 з [../../../2026-04-24-phase-4-live-realtime.md](../../../2026-04-24-phase-4-live-realtime.md) — відображені з виправленням `type`/`closes_at` та інтеграцією з `resolve_bet_event` / `lock_bet_event`.
2. **Placeholder scan:** усі посилання на файли існують або явно `create`; немає «TBD» у кроках коду; pg_cron має escape hatch.
3. **Type consistency:** `type = 'lightning'`, `create_lightning_event` → `is_live = true`, `quick_resolve` → `resolve_bet_event` з масивом довжини 1.
4. **Gaps:** Supabase **Presence** і «3 канали admin:counters» зведені до polling; якщо продукт вимагатиме строгих 3 WS — додати Task 19: тонка таблиця `public.realtime_pings` + INSERT → postgres_changes (після погодження).
5. **Sentry** з скелету (fallback log) — `console.warn` + TODO коментар `// Sentry: phase 8`, без SDK у цьому плані.

---

**План збережено в** `docs/superpowers/plans/2026-04-24-live-realtime-phase-4.md`. **Два варіанти виконання:**

**1. Subagent-Driven (рекомендовано)** — окремий субагент на кожну Task, ревʼю між задачами (`superpowers:subagent-driven-development`).

**2. Inline Execution** — виконання пакетами в одній сесії з чекпойнтами (`superpowers:executing-plans`).

**Який варіант обираєте?**
