# Betting Core (Phase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реалізувати повний цикл ставок: адмін створює події та опції на випуск, користувач робить одну ставку на подію, адмін закриває прийом і резолвить (або void) — баланс і статистика профілю оновлюються через існуючий ledger `coin_transactions` і тригер балансу з Фази 2.

**Architecture:** Нові таблиці `bet_events`, `bet_options`, `bets` за [design §5.3](../../../2026-04-24-holostyak-tote-design.md) з невеликими розширеннями для денормалізованої статистики (суми ставок на подію/опцію). Усі зміни балансу — лише `INSERT` у `public.coin_transactions` з `kind` з множини, яка вже зашита в `20260425120000_coin_economy_core.sql`: **`bet_placed`** (мінус ставка), **`bet_won`** (плюс виплата), **`bet_refund`** (повернення при void). Окремі `bet_stake` / `bet_payout` у БД **не** додаємо — у скелеті фази 3 це було б несумісно з продакшен-міграцією. Статуси **`bet_events`**: `scheduled` → `open` → `closed` → `resolved` | `void` (термін «locked» зі скелету = **`closed`** — прийом ставок зупинено). RPC: `place_bet`, `resolve_bet_event`, `void_bet_event`, допоміжні `lock_bet_event` (ручне закриття), `delete_bet_option` (якщо ставок ще немає), `auto_lock_expired_events()` (без pg_cron до Фази 4). Оновлення `profiles.total_bets`, `correct_bets`, `total_won`, `streak_*` всередині `resolve_bet_event` / `void_bet_event` через розширення `guard_profile_update` (аналог `app.allow_balance_sync` — наприклад `app.allow_profile_stats_sync`).

**Tech Stack:** Існуючий стек `holostyak-tote` (React 19, Vite 8, TanStack Query 5, Supabase JS v2, Tailwind 4, Zod, RHF, `@tanstack/react-table`, sonner, react-helmet-async). pgTAP у `supabase/tests/`. Vitest + Playwright.

**Prereq:** Фази 1–2 застосовані на тій самій БД; `profiles`, `episodes`, `coin_transactions`, `guard_profile_update`, `is_admin()`, RLS-каталог, адмін-роути в `src/router.tsx`.

**Workspace root:** `holostyak-tote/`

**Узгодження з існуючим кодом:** `EpisodeDetailPage.tsx` зараз показує заглушку «Ставки скоро» — замінити на список подій. `useEpisode` вже тягне `episodes` + `seasons`; для ставок додати окремі хуки. `AdminLayout` / `PublicHeader` / `MobileBottomNav` — додати маршрути фази 3. `LedgerList` уже містить види `bet_placed`, `bet_won`, `bet_refund` у фільтрі — після імплементації транзакції зʼявляться в UI.

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260426120000_betting_tables.sql` | `bet_events`, `bet_options`, `bets`; індекси; unique `(user_id, event_id)`; денорм. лічильники; partial unique на `coin_transactions` для `bet_placed`/`bet_won` на `ref_id` |
| `supabase/migrations/20260426120100_betting_guard_stats.sql` | Розширити `guard_profile_update`: дозвіл зміни stats при `app.allow_profile_stats_sync = on` |
| `supabase/migrations/20260426120200_betting_triggers.sql` | `episodes` — оновлення `status_changed_at` при зміні `status`; тригер заборони зміни `bet_options.odds` якщо є ставки на подію |
| `supabase/migrations/20260426120300_betting_rls.sql` | RLS `bet_events`, `bet_options`, `bets` |
| `supabase/migrations/20260426120400_betting_rpc.sql` | `place_bet`, `resolve_bet_event`, `void_bet_event`, `lock_bet_event`, `delete_bet_option`, `auto_lock_expired_events` |
| `supabase/tests/betting_core.test.sql` | pgTAP: place / resolve / void / unique / odds lock |
| `src/lib/database.types.ts` | Після `npm run db:types` або ручне доповнення типів |
| `src/lib/schemas/betEvent.ts`, `betOption.ts`, `placeBet.ts` | Zod |
| `src/lib/betting/payout.ts` | `floorPayout(amount, odds)` — один модуль для UI + тестів |
| `src/hooks/useEpisodeBetEvents.ts`, `useBetEvent.ts`, `usePlaceBet.ts`, `useMyBets.ts` | Дані юзера |
| `src/hooks/admin/useCreateBetEvent.ts`, `useUpdateBetEvent.ts`, `useCreateBetOption.ts`, `useDeleteBetOption.ts`, `useResolveBetEvent.ts`, `useVoidBetEvent.ts`, `useLockBetEvent.ts`, `useAutoLockBetEvents.ts`, `useAdminEpisodes.ts`, `useAdminBetEventsForResolution.ts` | Адмін |
| `src/components/betting/*` | Картки, модалка, бейджі |
| `src/components/admin/BetEventsTable.tsx`, `BetEventForm.tsx`, `BetOptionsEditor.tsx`, `ResolveBetEventModal.tsx`, `EpisodeStatusControl.tsx` | Адмін UI |
| `src/pages/MyBetsPage.tsx` | `/my-bets` |
| `src/pages/admin/AdminEpisodesPage.tsx`, `AdminEpisodeEditPage.tsx`, `AdminResolutionPage.tsx` | Адмін сторінки |
| `src/pages/EpisodeDetailPage.tsx` | Інтеграція ставок |
| `src/router.tsx` | Маршрути |
| `src/components/admin/AdminLayout.tsx` | Пункти навігації |
| `src/components/layout/PublicHeader.tsx`, `MobileBottomNav.tsx` | Лінк «Мої ставки» |
| `tests/unit/betting/payout.test.ts` | Округлення |
| `tests/unit/schemas/betEvent.test.ts` (і ін.) | Zod |
| `tests/e2e/betting-lifecycle.spec.ts` | Повний цикл (див. Task 22) |
| `README.md` | Оновити чекбокс Phase 3 |

---

## Task 0: Перевірка гілки та зелених тестів

**Files:** —

- [ ] **Step 1:** `cd holostyak-tote && npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build`

Expected: усе зелене.

- [ ] **Step 2:** Переконатися, що на цільовій БД застосовані міграції фази 2 (`coin_transactions.kind` містить `bet_placed`, `bet_won`, `bet_refund`).

- [ ] **Step 3:** Commit немає (лише верифікація).

---

## Task 1: Міграція таблиць ставок

**Files:**
- Create: `supabase/migrations/20260426120000_betting_tables.sql`

- [ ] **Step 1:** Додати SQL (узгоджено з §5.3; тип події — як у дизайні; для UI додано лічильники):

```sql
-- bet_events: closes_at = кінець прийому ставок (аналог lock_time зі скелету)
create table public.bet_events (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  type text not null check (type in (
    'eliminated', 'first_rose', 'tete_a_tete', 'season_winner', 'custom', 'lightning'
  )),
  bachelor_id uuid references public.bachelors(id) on delete set null,
  title text not null,
  description text,
  opens_at timestamptz not null default now(),
  closes_at timestamptz not null,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'open', 'closed', 'resolved', 'void'
  )),
  is_live boolean not null default false,
  is_multi_choice boolean not null default false,
  winning_option_ids uuid[] not null default '{}',
  max_bet_amount int check (max_bet_amount is null or max_bet_amount >= 1),
  total_staked int not null default 0,
  total_bets int not null default 0,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index bet_events_episode_status_idx on public.bet_events (episode_id, status);
create index bet_events_closes_at_idx on public.bet_events (closes_at desc);

create table public.bet_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.bet_events(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  custom_label text not null,
  odds numeric(6, 2) not null check (odds >= 1.01 and odds <= 100),
  order_index int not null default 0,
  is_winning boolean not null default false,
  option_total_staked int not null default 0,
  option_bets_count int not null default 0
);
create index bet_options_event_id_idx on public.bet_options (event_id);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.bet_events(id) on delete cascade,
  option_id uuid not null references public.bet_options(id) on delete restrict,
  amount int not null check (amount > 0),
  odds_snapshot numeric(6, 2) not null,
  potential_payout int not null,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'void')),
  payout int not null default 0,
  placed_at timestamptz not null default now(),
  settled_at timestamptz,
  unique (user_id, event_id)
);
create index bets_user_created_idx on public.bets (user_id, placed_at desc);
create index bets_event_option_idx on public.bets (event_id, option_id);
```

- [ ] **Step 2:** Додати partial unique indexes на ledger (запобігти подвійному списанню/виплаті на один bet):

```sql
create unique index coin_transactions_one_bet_placed_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'bet_placed' and ref_id is not null;

create unique index coin_transactions_one_bet_won_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'bet_won' and ref_id is not null;
```

- [ ] **Step 3:** `supabase db push` (або локально `supabase migration up`).

- [ ] **Step 4:** Commit

```bash
git add supabase/migrations/20260426120000_betting_tables.sql
git commit -m "feat(db): betting tables and ledger uniqueness for bets"
```

---

## Task 2: Розширення guard_profile_update для статистики

**Files:**
- Create: `supabase/migrations/20260426120100_betting_guard_stats.sql`
- Вихідний зразок: `supabase/migrations/20260425120100_profile_balance_from_ledger.sql`

- [ ] **Step 1:** Замінити тіло `public.guard_profile_update` так, щоб на початку (після перевірки `app.allow_balance_sync`) було:

```sql
if coalesce(current_setting('app.allow_profile_stats_sync', true), '') = 'on' then
  return new;
end if;
```

(Порядок: спочатку `allow_balance_sync`, потім `allow_profile_stats_sync`, потім перевірки для не-адмінів.)

- [ ] **Step 2:** У RPC оновлення статистики (Task 5–6) викликати:

```sql
perform set_config('app.allow_profile_stats_sync', 'on', true);
update public.profiles set ... where id = ...;
perform set_config('app.allow_profile_stats_sync', 'off', true);
```

- [ ] **Step 3:** Commit `feat(db): allow stats sync from betting RPCs`

---

## Task 3: Тригери епізоду та заморозка коефіцієнтів

**Files:**
- Create: `supabase/migrations/20260426120200_betting_triggers.sql`

- [ ] **Step 1:** `episodes` — перед оновленням, якщо `status` змінився, виставити `status_changed_at = now()`:

```sql
create or replace function public.touch_episode_status_changed_at() returns trigger
language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_episode_status_changed on public.episodes;
create trigger trg_episode_status_changed
  before update on public.episodes
  for each row execute function public.touch_episode_status_changed_at();
```

- [ ] **Step 2:** Заборона зміни `odds` / `custom_label` / `participant_id` у `bet_options`, якщо існує хоча б одна ставка на **подію** цього рядка:

```sql
create or replace function public.prevent_bet_option_change_if_staked() returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from public.bets b where b.event_id = old.event_id
  ) then
    if new.odds is distinct from old.odds
       or new.custom_label is distinct from old.custom_label
       or new.participant_id is distinct from old.participant_id then
      raise exception 'Cannot change option fields after bets exist on this event';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bet_options_no_change_if_staked on public.bet_options;
create trigger trg_bet_options_no_change_if_staked
  before update on public.bet_options
  for each row execute function public.prevent_bet_option_change_if_staked();
```

- [ ] **Step 3:** Commit `feat(db): episode status timestamp and bet option odds freeze`

---

## Task 4: RLS для ставок

**Files:**
- Create: `supabase/migrations/20260426120300_betting_rls.sql`

- [ ] **Step 1:**

```sql
alter table public.bet_events enable row level security;
alter table public.bet_options enable row level security;
alter table public.bets enable row level security;

-- Публічне читання каталогу подій і опцій
create policy "bet_events_select_all"
  on public.bet_events for select using (true);

create policy "bet_options_select_all"
  on public.bet_options for select using (true);

create policy "bet_events_admin_write"
  on public.bet_events for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "bet_options_admin_write"
  on public.bet_options for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Ставки: лише свої або адмін; прямий INSERT заборонено (немає policy insert)
create policy "bets_select_own_or_admin"
  on public.bets for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());
```

- [ ] **Step 2:** Не додавати `insert`/`update` policy на `bets` для `authenticated` — тільки SECURITY DEFINER RPC.

- [ ] **Step 3:** Commit `feat(db): RLS for betting tables`

---

## Task 5: RPC place_bet

**Files:**
- Create: `supabase/migrations/20260426120400_betting_rpc.sql` (частина 1)

Документоване округлення виплати при **показі** в UI: `potential_payout = floor(amount * odds)` (int). У БД `potential_payout` зберігаємо з тим самим правилом.

- [ ] **Step 1:** Реалізувати `place_bet(p_event_id uuid, p_option_id uuid, p_amount int) returns uuid`:

1. `auth.uid()` not null.
2. `p_amount >= 1`.
3. `select * from bet_events where id = p_event_id for update` — має існувати, `status = 'open'`, `now() >= opens_at`, `now() < closes_at`.
4. `select * from bet_options where id = p_option_id and event_id = p_event_id` — існує.
5. Перевірка `not exists (select 1 from bets where user_id = auth.uid() and event_id = p_event_id)`.
6. `v_balance := coalesce((select sum(delta) from coin_transactions where user_id = auth.uid()), 0)`; якщо `v_balance < p_amount` — exception.
7. `v_max :=` з `bet_events.max_bet_amount`; якщо not null і `p_amount > v_max` — exception.
8. `v_odds := bet_options.odds`; `v_payout := floor(p_amount * v_odds)::int`.
9. `insert into bets (...)` returning `id` into `v_bet_id`.
10. `insert into coin_transactions (user_id, delta, balance_after, kind, ref_id)` — `delta = -p_amount`, `kind = 'bet_placed'`, `ref_id = v_bet_id`; `balance_after` обчислити як `v_balance - p_amount`.
11. Оновити денорм: `bet_events.total_staked += p_amount`, `total_bets += 1`; `bet_options.option_total_staked += p_amount`, `option_bets_count += 1`.
12. `return v_bet_id`.

- [ ] **Step 2:** `grant execute on function public.place_bet(uuid, uuid, int) to authenticated;`

- [ ] **Step 3:** Commit або продовжити в тому ж файлі наступні RPC (Task 6) одним комітом `feat(db): place_bet RPC` — на вибір команди; у плані окремі task для читабельності.

---

## Task 6: RPC resolve_bet_event

**Files:**
- Modify: `supabase/migrations/20260426120400_betting_rpc.sql`

- [ ] **Step 1:** Сигнатура: `resolve_bet_event(p_event_id uuid, p_winning_option_ids uuid[]) returns jsonb`.

Перевірки:
- `is_admin()`.
- Масив не порожній; якщо `not bet_events.is_multi_choice` — `cardinality(p_winning_option_ids) = 1`.
- Усі id з масиву належать опціям цього `event_id`.
- `bet_events.status in ('open', 'closed')` (опційно заборонити `open`, якщо продукт вимагає спочатку `closed`; зафіксувати в коді одне правило — рекомендація: дозволити resolve лише з `closed` після MVP-уточнення).

Логіка:
1. `select * from bet_events where id = p_event_id for update`.
2. Для кожного `bet` на подію `for update`:
   - Якщо `option_id = any(p_winning_option_ids)` (або для multi — множина): `status = 'won'`, `payout = floor(amount * odds_snapshot)::int`, `insert coin_transactions (bet_won, +payout, ref_id = bet.id)`.
   - Інакше: `status = 'lost'`, `payout = 0`.
3. `update bet_events set status = 'resolved', winning_option_ids = p_winning_option_ids, resolved_by = auth.uid(), resolved_at = now()`; опції: `is_winning = (id = any(...))`.
4. Для кожного `user_id`, що мав ставки на подію: оновити `profiles`: `total_bets += 1` за кожну ставку користувача на цю подію (фактично 1 на юзера через unique); `correct_bets += 1` якщо won; `total_won += payout` якщо won; `streak_current` / `streak_best` (після всіх ставок події: для кожного юзера один раз — якщо його ставка won, `streak_current := streak_current + 1`, інакше `0`; `streak_best := greatest(streak_best, streak_current)`).
5. `admin_audit_log` + `notifications` для переможців (мінімальний текст українською).

Повернути `jsonb_build_object('winners_count', ..., 'total_paid', ...)`.

- [ ] **Step 2:** `grant execute ... to authenticated`.

---

## Task 7: RPC void_bet_event та допоміжні

**Files:**
- Modify: `supabase/migrations/20260426120400_betting_rpc.sql`

- [ ] **Step 1:** `void_bet_event(p_event_id uuid, p_reason text) returns void`
- `is_admin()`, `reason` not empty.
- Подія не в `resolved` / `void`.
- Для кожного `bet` з `status = 'pending'`: `insert coin_transactions (bet_refund, +amount, ref_id = bet.id)`, оновити `bet.status = 'void'`, `payout = 0` або зберегти amount у note.
- `bet_events.status = 'void'`.
- Stats: не інкрементувати `total_bets` / streak як за звичайний resolve (void не рахується як зіграна ставка для streak — зафіксувати в бізнес-правилі: **void не змінює streak**; `total_bets` також не збільшувати при void, оскільки settle не відбувся). Якщо продукт вимагає інакше — змінити в одному місці в RPC.

- [ ] **Step 2:** `lock_bet_event(p_event_id uuid) returns void` — `is_admin()`, `update bet_events set status = 'closed' where id = p_event_id and status = 'open'`.

- [ ] **Step 3:** `delete_bet_option(p_option_id uuid) returns void` — `is_admin()`; видалити рядок тільки якщо `not exists (select 1 from bets where option_id = p_option_id)`.

- [ ] **Step 4:** `auto_lock_expired_events() returns int` — `security definer`; `update bet_events set status = 'closed' where status = 'open' and closes_at <= now()`; повернути кількість оновлених.

- [ ] **Step 5:** `grant execute` на всі нові функції для `authenticated` де потрібно.

- [ ] **Step 6:** Commit `feat(db): resolve, void, lock, delete option, auto-lock betting RPCs`

---

## Task 8: pgTAP betting_core.test.sql

**Files:**
- Create: `supabase/tests/betting_core.test.sql`

- [ ] **Step 1:** У `begin; select plan(N); ... rollback;` додати тести з використанням тестових користувачів через `auth.users` + `profiles` (як у документації Supabase для pgTAP) **або** мінімальні тести наявності функцій + один інтеграційний сценарій під суперкористувачем. Мінімальний обовʼязковий набір:
- `has_function('place_bet', ...)`
- place_bet: insufficient balance → exception
- place_bet: double bet same event → unique violation / exception
- resolve: 3 bets, 1 win → баланси та `bet_won` транзакції
- void: refund equals original stake sum

- [ ] **Step 2:** `supabase test db` локально.

- [ ] **Step 3:** Commit `test(db): pgTAP for betting core`

---

## Task 9: Регенерація TypeScript типів

**Files:**
- Modify: `src/lib/database.types.ts`

- [ ] **Step 1:** `export SUPABASE_PROJECT_ID=... && npm run db:types`

- [ ] **Step 2:** Перевірити, що `Functions` містить `place_bet`, `resolve_bet_event`, `void_bet_event`, тощо.

- [ ] **Step 3:** Commit `chore(types): regenerate Supabase types for phase 3`

---

## Task 10: Zod + payout helper + Vitest

**Files:**
- Create: `src/lib/schemas/betEvent.ts`, `betOption.ts`, `placeBet.ts`
- Create: `src/lib/betting/payout.ts`
- Create: `tests/unit/betting/payout.test.ts`, `tests/unit/schemas/betEvent.test.ts`

- [ ] **Step 1 (failing test):** `payout.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { floorPayout } from '@/lib/betting/payout'

describe('floorPayout', () => {
  it('matches documented rule', () => {
    expect(floorPayout(100, 2.5)).toBe(250)
    expect(floorPayout(100, 2.55)).toBe(255)
    expect(floorPayout(99, 1.01)).toBe(Math.floor(99 * 1.01))
  })
})
```

Run: `npm run test -- --run payout` → FAIL.

- [ ] **Step 2:** Реалізація `floorPayout(amount: number, odds: number): number`:

```ts
export function floorPayout(amount: number, odds: number): number {
  return Math.floor(amount * odds)
}
```

- [ ] **Step 3:** Zod-схеми (поля узгодити з БД: `type` замість `category`; `closesAt` ISO string; `customLabel`):

```ts
// betEvent.ts — приклад
import { z } from 'zod'

export const betEventSchema = z.object({
  episodeId: z.string().uuid(),
  type: z.enum(['eliminated', 'first_rose', 'tete_a_tete', 'season_winner', 'custom', 'lightning']),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  bachelorId: z.string().uuid().nullable(),
  opensAt: z.string().datetime({ offset: true }).optional(),
  closesAt: z.string().datetime({ offset: true }),
  maxBetAmount: z.coerce.number().int().min(1).optional(),
})
```

```ts
// betOption.ts
export const betOptionSchema = z.object({
  eventId: z.string().uuid(),
  customLabel: z.string().min(1).max(100),
  participantId: z.string().uuid().nullable(),
  odds: z.coerce.number().min(1.01).max(100),
  orderIndex: z.coerce.number().int().min(0).optional(),
})
```

```ts
// placeBet.ts
export const placeBetSchema = z.object({
  amount: z.coerce.number().int().min(1),
})
```

- [ ] **Step 4:** Commit `test: betting schemas and payout helper`

---

## Task 11: Хуки даних (користувач)

**Files:**
- Create: `src/hooks/useEpisodeBetEvents.ts`, `useBetEvent.ts`, `usePlaceBet.ts`, `useMyBets.ts`

- [ ] **Step 1:** `useEpisodeBetEvents(episodeId)` — `from('bet_events').select('*, bet_options(*)').eq('episode_id', id).order('closes_at')`, `enabled: !!id`. Фільтр для гостя: показувати лише `status in ('open','closed','resolved','void')` згідно продукту (рекомендація: приховати `scheduled` від публіки).

- [ ] **Step 2:** `useBetEvent(eventId)` — деталь + опції + `useAuth` + `from('bets').select('*').eq('event_id', id).eq('user_id', user.id).maybeSingle()` для `MyBetChip`.

- [ ] **Step 3:** `usePlaceBet()` — `useMutation`, `supabase.rpc('place_bet', { p_event_id, p_option_id, p_amount })` (імена параметрів узгодити згенерованими типами — якщо Postgres без префікса `p_`, використати фактичні імена з `database.types.ts`). Після успіху: `invalidateQueries` для `episodeBetEvents`, `betEvent`, `profile`, `coinTransactions`, `myBets`.

- [ ] **Step 4:** `useMyBets(filters)` — пагінація `range`, фільтр по `bets.status`, join до `bet_events` / `episodes` для заголовків (через nested select).

- [ ] **Step 5:** Commit `feat(data): betting hooks for episode and user`

---

## Task 12: Хуки адміна

**Files:**
- Create under `src/hooks/admin/`: `useCreateBetEvent.ts`, `useUpdateBetEvent.ts`, `useCreateBetOption.ts`, `useDeleteBetOption.ts`, `useLockBetEvent.ts`, `useResolveBetEvent.ts`, `useVoidBetEvent.ts`, `useAutoLockBetEvents.ts`, `useAdminEpisodes.ts`, `useAdminBetEventsForResolution.ts`

- [ ] **Step 1:** CRUD подій/опцій: або прямі `insert`/`update`/`delete` під RLS адміна, або окремі RPC — YAGNI: прямі запити, крім `delete_bet_option` (RPC уже є).

- [ ] **Step 2:** `useAdminEpisodes(seasonId?)` — список епізодів з фільтром сезону; `useAdminBetEventsForResolution()` — `status in ('closed','open')` і `closes_at <= now()` для черги (узгодити з продуктом).

- [ ] **Step 3:** Mutations викликають odповідні RPC для lock/resolve/void/auto_lock.

- [ ] **Step 4:** Commit `feat(data): admin betting hooks`

---

## Task 13: Компоненти betting (UI)

**Files:**
- Create: `src/components/betting/BetEventCard.tsx`, `BetOptionButton.tsx`, `PlaceBetModal.tsx`, `MyBetChip.tsx`, `BetCountdown.tsx`, `LockedBadge.tsx`, `ResolvingBadge.tsx`

- [ ] **Step 1:** `BetCountdown` — `closes_at` vs `now()`; кольори: >1h зелений, 10хв–1h жовтий, <10хв червоний (класи Tailwind як у темі Cinematic Noir).

- [ ] **Step 2:** `PlaceBetModal` — слайдер від 1 до `min(balance, maxBetAmount ?? balance)`; превʼю `floorPayout(amount, odds)`; помилки українською (`toast.error`).

- [ ] **Step 3:** Якщо `balance === 0` — кнопка ставки одразу `toast` «Поповни бали» + посилання `/coins` (без відкриття модалки).

- [ ] **Step 4:** Commit `feat(ui): betting cards, modal, badges`

---

## Task 14: Компоненти адміна для ставок

**Files:**
- Create: `src/components/admin/BetEventsTable.tsx`, `BetEventForm.tsx`, `BetOptionsEditor.tsx`, `ResolveBetEventModal.tsx`, `EpisodeStatusControl.tsx`

- [ ] **Step 1:** `BetEventForm` — RHF + zodResolver + поля, що відповідають `betEventSchema`; submit → insert/update `bet_events`.

- [ ] **Step 2:** `BetOptionsEditor` — список опцій, додавання, видалення через `delete_bet_option` RPC при відсутності ставок.

- [ ] **Step 3:** `ResolveBetEventModal` — для `is_multi_choice` чекбокси; інакше radio; підсумок «Буде виплачено X балів» з попереднім підрахунком на клієнті (або легкий preview RPC — YAGNI: клієнт `floorPayout`).

- [ ] **Step 4:** `EpisodeStatusControl` — оновлення `episodes.status` з дозволених переходів (`draft`→`open`→`locked`→`live`→`finalized`); узгодити з тим, чи дозволено ставки при `episode.status` (рекомендація: приймати ставки лише коли `episode.status in ('open','live')` і `bet_event.status = 'open'` — додати перевірку в `place_bet`).

- [ ] **Step 5:** Додати перевірку епізоду в `place_bet` у міграції (якщо ще не зроблено): `join episodes` — якщо `episodes.status` не дозволяє — exception.

- [ ] **Step 6:** Commit `feat(admin): bet event forms and resolution modal`

---

## Task 15: Сторінки та router

**Files:**
- Create: `src/pages/MyBetsPage.tsx`, `src/pages/admin/AdminEpisodesPage.tsx`, `src/pages/admin/AdminEpisodeEditPage.tsx`, `src/pages/admin/AdminResolutionPage.tsx`
- Modify: `src/router.tsx`, `src/pages/EpisodeDetailPage.tsx`

- [ ] **Step 1:** `router.tsx` — додати:
  - `{ path: 'my-bets', element: <MyBetsPage /> }` під `RootLayout`
  - `{ path: 'episodes', ... }` вже є; переконатися в унікальності шляхів
  - під `/admin`: `episodes`, `episode/:id`, `resolution`

```tsx
// приклад фрагмента children адміна
{ path: 'episodes', element: <AdminEpisodesPage /> },
{ path: 'episode/:id', element: <AdminEpisodeEditPage /> },
{ path: 'resolution', element: <AdminResolutionPage /> },
```

- [ ] **Step 2:** `MyBetsPage` — auth gate як `WalletPage`; порожній стан + CTA на `/episodes`.

- [ ] **Step 3:** `EpisodeDetailPage` — замінити заглушку на `useEpisodeBetEvents(episode.id)` + список `BetEventCard`; якщо масив порожній — «Ставки ще не опубліковано»; для `episode.status === 'finalized'` показувати результати (resolved/void) і чіпи won/lost.

- [ ] **Step 4:** Commit `feat(pages): my bets, admin episodes, episode betting integration`

---

## Task 16: Навігація (AdminLayout, Header, BottomNav)

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`, `src/components/layout/PublicHeader.tsx`, `src/components/layout/MobileBottomNav.tsx`

- [ ] **Step 1:** У `AdminLayout` додати посилання: «Випуски», «Резолв».

- [ ] **Step 2:** У хедері та мобільній навігації — «Мої ставки» (`/my-bets`) для авторизованих.

- [ ] **Step 3:** Commit `feat(ui): nav links for betting and admin episodes`

---

## Task 17: Playwright E2E (повний цикл)

**Files:**
- Create: `tests/e2e/betting-lifecycle.spec.ts`

- [ ] **Step 1:** Якщо немає стабільного шляху створити юзера з балансом у E2E — використати `test.skip` з коментарем **або** `beforeAll` що виконує SQL через локальний `supabase db execute` (складно в CI). Прагматичний MVP тест у репозиторії:
  - Гість: `EpisodeDetailPage` показує список подій або порожній стан (без помилок).
  - Авторизований сценарій — закоментований шаблон з кроками з `2026-04-24-phase-3-betting-core.md` Task 16, увімкнути після test credentials.

- [ ] **Step 2:** Додати мінімум один тест: відкрити `/episode/:id` з відомим id з seed (`seed.sql` не містить uuid епізодів — згенерувати стабільний uuid у seed для одного епізоду або брати перший з API). Найпростіше: у тесті `goto('/episodes')`, клік по першому лінку випуску, очікувати заголовок без крешу.

- [ ] **Step 3:** Commit `test(e2e): betting smoke navigation`

---

## Task 18: README та тег

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Phase 3 позначити `[x]` після виконання acceptance на staging.

- [ ] **Step 2:** Після мерджу: `git tag phase-3-complete` (опційно анотовано **MVP FROZEN** згідно скелету).

---

## Self-review (внутрішній чеклист)

1. **Покриття скелету фази 3:** таблиці, place/resolve/void, RLS, адмін-сторінки, юзер UI, інтеграція `EpisodeDetailPage`, `/my-bets`, авто-lock функція, обмеження однієї ставки на подію, округлення `floor`, freeze odds — усі мають задачі.
2. **Розбіжності зі скелетом усунені в тексті плану:** `bet_stake`/`bet_payout` → `bet_placed`/`bet_won`; `locked` → `closed`; `placed` → `pending` для рядка `bets`; `category` → `type`; `lock_time` → `closes_at`; `label` → `custom_label`.
3. **Залежність від Фази 2:** partial unique на `coin_transactions` узгоджений з існуючим ledger; тригер балансу не змінюємо; додаємо лише stats bypass.
4. **Порожні місця (placeholder):** немає — усі задачі з посиланнями на файли та фрагменти коду або чіткі SQL/RPC кроки.

---

**План збережено в** `docs/superpowers/plans/2026-04-24-betting-core-phase-3.md`. **Два варіанти виконання:**

**1. Subagent-Driven (рекомендовано)** — окремий субагент на кожну Task, ревʼю між задачами (`superpowers:subagent-driven-development`).

**2. Inline Execution** — виконання пакетами в одній сесії з чекпойнтами (`superpowers:executing-plans`).

**Який варіант обираєте?**
