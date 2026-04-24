# Coin Economy (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реалізувати повний цикл донат → заявка зі скрином → черга в адміна → approve/reject → append-only `coin_transactions` + синхронізований `profiles.balance`, плюс ручне нарахування/списання адміном, приватний Storage, публічні `/coins` і `/wallet`, та базовий `/admin/*` з чергою заявок.

**Architecture:** Supabase: нові таблиці `coin_purchase_requests`, `coin_transactions`, `admin_audit_log`, `app_settings`, мінімальна `notifications` (для approve/reject). Тригер після `INSERT` у `coin_transactions` перераховує `sum(delta)` і оновлює `profiles.balance` через `SECURITY DEFINER`-функцію, оскільки існуючий тригер `guard_profile_update` (фаза 1) забороняє зміну `balance` не-адмінам — без цього кроку RPC від імені користувача (майбутні ставки) не зможуть оновити баланс. Чотири `SECURITY DEFINER` RPC: `submit_purchase_request`, `approve_purchase_request`, `reject_purchase_request`, `grant_coins_manual`. Клієнт: React Hook Form + Zod, `react-dropzone` для фото, TanStack Query для даних, TanStack Table для ledger, toasts українською, `react-helmet-async` для `noindex` на `/admin/*`.

**Tech Stack:** Vite 8, React 19, TypeScript 6, TanStack Query 5, Zustand 4, Supabase JS v2, Tailwind 4, Vitest, Playwright, `zod`, `react-hook-form`, `@hookform/resolvers`, `react-dropzone`, `@tanstack/react-table`, `sonner`, `react-helmet-async`, Supabase pgTAP (`supabase test db` локально з Docker).

**Prereq (уже з Фази 1):** `holostyak-tote/`, `profiles` + `is_admin()`, RLS на каталозі, `src/lib/supabase.ts`, `src/hooks/useProfile.ts` (або аналог), `src/router.tsx`, CI `.github/workflows/ci.yml`.

**Workspace root (усі шляхи відносно):** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260425120000_coin_economy_core.sql` | Таблиці: `coin_purchase_requests`, `coin_transactions`, `admin_audit_log`, `app_settings`, `notifications`; індекси; унікальний індекс "один `purchase_approved` на `ref_id`"; FK на `profiles` |
| `supabase/migrations/20260425120100_profile_balance_from_ledger.sql` | Функція `apply_profile_balance_from_ledger`, тригер `trg_sync_balance_after_coin_tx`, корекція `guard_profile_update` або `SET LOCAL` в definer-оновленні (див. Task 2) |
| `supabase/migrations/20260425120200_coin_rls.sql` | RLS + політики для нових таблиць |
| `supabase/migrations/20260425120300_storage_screenshots.sql` | Бакет `screenshots` + RLS storage |
| `supabase/migrations/20260425120400_coin_rpc.sql` | RPC: submit / approve / reject / grant; сервісні допоміжні |
| `supabase/tests/coin_economy.test.sql` | pgTAP: баланс, RPC, idempotence approve |
| `src/lib/schemas/purchaseRequest.ts` | Zod |
| `src/hooks/useAppSettings.ts` | query `app_settings` |
| `src/hooks/usePurchaseRequests.ts` | own requests |
| `src/hooks/useSubmitPurchaseRequest.ts` | mutation |
| `src/hooks/useCoinTransactions.ts` | ledger |
| `src/hooks/useSignedScreenshotUrl.ts` | storage signed URL |
| `src/hooks/admin/*.ts` | admin queue, approve, reject, users list |
| `src/hooks/useIsAdmin.ts` | `useProfile` + `role === 'admin'` |
| `src/components/coins/*` | DonationInfoBlock, form, status cards, ZsuBanner |
| `src/components/wallet/*` | BalanceCard, LedgerList |
| `src/components/admin/*` | layout, route guard, table, modal |
| `src/pages/CoinsPage.tsx`, `WalletPage.tsx` | публічні маршрути |
| `src/pages/admin/AdminDashboardPage.tsx`, `AdminPurchasesPage.tsx`, `AdminUsersPage.tsx` | |
| `src/components/layout/PublicHeader.tsx` | лінк "Адмін" якщо admin |
| `src/router.tsx` | маршрути `/coins`, `/wallet`, `/admin/*` |
| `src/main.tsx` | `<Toaster />`, (опц.) `HelmetProvider` |
| `tests/unit/schemas/purchaseRequest.test.ts` | Zod |
| `tests/e2e/coin-economy.spec.ts` | сценарій з плану |
| `.github/workflows/ci.yml` | опц. `supabase test db` |
| `docs/phase-2-donations-rationale.md` | опційно: чому 100% — ЗСУ (необов'язково, лише якщо проситимуть) |

---

## Task 0: Перевірка якорів Фази 1

**Files:** —

- [ ] **Step 1: Клон/пул і гілка**

```bash
cd holostyak-tote
git checkout main
git pull
```

- [ ] **Step 2: Локальні тести зелені**

```bash
npm ci
npm run lint && npm run typecheck && npm run test -- --run && npm run build
```

Expected: all pass.

- [ ] **Step 3: Підтвердити `is_admin` у схемі**

У Supabase SQL Editor (або локально): `select public.is_admin();` — як anon має бути `false` (норм для неавторизованого). Документувати: адмін-роль далі вручну: `update public.profiles set role = 'admin' where id = '<uid>';`

---

## Task 1: Міграція `coin_economy_core` — таблиці та індекси

**Files:**
- Create: `supabase/migrations/20260425120000_coin_economy_core.sql`
- After apply: regenerate `src/lib/database.types.ts` (окремо в Task 8)

- [ ] **Step 1: Створити файл міграції з вмістом (узгоджено з [design §5.4–5.6](../../../2026-04-24-holostyak-tote-design.md))**

```sql
-- coin_purchase_requests: screenshot_url = path у бакеті, напр. :user_id/xxx.jpg
create table public.coin_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  requested_amount int not null check (requested_amount > 0),
  screenshot_url text not null,
  user_comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_amount int,
  admin_comment text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index coin_purchase_requests_user_id_idx on public.coin_purchase_requests (user_id);
create index coin_purchase_requests_status_created_idx on public.coin_purchase_requests (status, created_at desc);

create table public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta int not null,
  balance_after int not null,
  kind text not null check (
    kind in (
      'purchase_approved',
      'bet_placed',
      'bet_won',
      'bet_refund',
      'admin_grant',
      'admin_deduct'
    )
  ),
  ref_id uuid,
  admin_id uuid references public.profiles (id),
  note text,
  created_at timestamptz not null default now()
);
create index coin_transactions_user_id_created_idx on public.coin_transactions (user_id, created_at desc);
create index coin_transactions_kind_idx on public.coin_transactions (kind);

-- Один successful purchase credit на ref_id (запобігає double-approve)
create unique index coin_transactions_one_purchase_approved_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'purchase_approved' and ref_id is not null;

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_admin_created_idx on public.admin_audit_log (admin_id, created_at desc);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- Мінімальна таблиця для Фази 2 (специфіка §5.5; без зайвих полів)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_created_idx on public.notifications (user_id, created_at desc);
```

- [ ] **Step 2: Застосувати на remote (або `supabase db push` / MCP `apply_migration`)**

Очікування: міграція без помилок.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260425120000_coin_economy_core.sql
git commit -m "feat(db): coin economy tables, audit, app_settings, notifications"
```

---

## Task 2: Тригер балансу + `SECURITY DEFINER` (узгодження з `guard_profile_update`)

**Files:**
- Create: `supabase/migrations/20260425120100_profile_balance_from_ledger.sql`
- Modifies: логіку `public.guard_profile_update` (у тому ж файлі замінити функцію повністю) — джерело старого тексту: `supabase/migrations/20260424120200_catalog_rls.sql`

- [ ] **Step 1: Написати оновлений `guard_profile_update`**

Правило: дозволити зміну `balance` лише якщо воно викликане з `public.apply_profile_balance_from_ledger` (сесійна мітка), інакше логіка як у фазі 1.

```sql
-- Після існуючого guard, додати в початок BEFORE UPDATE:
-- IF current_setting('app.allow_balance_sync', true) = 'true' THEN
--   RETURN new;
-- END IF;
-- (або еквівалент: перевірка tg_argv — простіше через set_config)
```

Конкретна реалізація (мінімальна):

```sql
create or replace function public.guard_profile_update() returns trigger
language plpgsql as $$
begin
  if current_setting('app.allow_balance_sync', true) = 'on' then
    return new;
  end if;
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Cannot change role';
    end if;
    if new.balance is distinct from old.balance then
      raise exception 'Cannot change balance directly';
    end if;
    if new.total_won is distinct from old.total_won
       or new.total_bets is distinct from old.total_bets
       or new.correct_bets is distinct from old.correct_bets
       or new.streak_current is distinct from old.streak_current
       or new.streak_best is distinct from old.streak_best then
      raise exception 'Cannot change stats directly';
    end if;
  end if;
  return new;
end;
$$;
```

(Імпортуй повний напис зі своєї поточної міграції фази 1, не втрачай зайві перевірки якщо були додані.)

- [ ] **Step 2: Функція + тригер**

```sql
create or replace function public.apply_profile_balance_from_ledger() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  s int;
begin
  select coalesce(sum(ct.delta), 0) into s
  from public.coin_transactions ct
  where ct.user_id = new.user_id;

  perform set_config('app.allow_balance_sync', 'on', true);
  update public.profiles
  set balance = s
  where id = new.user_id;
  perform set_config('app.allow_balance_sync', 'off', true);
  return new;
end;
$$;

drop trigger if exists trg_sync_balance_after_coin_tx on public.coin_transactions;
create trigger trg_sync_balance_after_coin_tx
  after insert on public.coin_transactions
  for each row execute function public.apply_profile_balance_from_ledger();
```

- [ ] **Step 3: Примітка:** у тому ж insert RPC має виставляти `balance_after` на стороні SQL як `s` (після вставки рядка можна recalc у тій же RPC-транзакції) **або** додатково оновлювати `new.balance_after` в BEFORE INSERT — простіше рахувати `balance_after` у RPC після `sum` попередніх + `delta`. (У плані реалізації RPC у Task 5 обчислюй `v_new := v_old + delta` і вставляй у `coin_transactions.balance_after`.)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260425120100_profile_balance_from_ledger.sql
git commit -m "feat(db): sync profile balance from coin_transactions ledger"
```

---

## Task 3: RLS policies

**Files:**
- Create: `supabase/migrations/20260425120200_coin_rls.sql`

- [ ] **Step 1: Увімкнути RLS і політики (узгоджено з [design §6.3](../../../2026-04-24-holostyak-tote-design.md))**

Ключове: **прямий INSERT** у `coin_purchase_requests` — заборонений для `authenticated`; тільки RPC `submit_purchase_request`. `coin_transactions` — INSERT тільки через RPC (політика deny all default + немає грантів except service).

Шаблон (доповни grant на USAGE для `authenticated`):

```sql
alter table public.coin_purchase_requests enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.app_settings enable row level security;
alter table public.notifications enable row level security;

-- purchase requests: read own or admin
create policy "coin_purchase_requests_select"
  on public.coin_purchase_requests for select
  using (auth.uid() = user_id or public.is_admin());

-- deny direct insert — НЕ додавай policy "insert" для authenticated; RPC DEFINER обійде

-- coin_transactions: read own or admin
create policy "coin_transactions_select"
  on public.coin_transactions for select
  using (auth.uid() = user_id or public.is_admin());

-- app_settings: read all
create policy "app_settings_select" on public.app_settings for select using (true);
create policy "app_settings_write_admin" on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- admin_audit_log: admin only
create policy "admin_audit_log_select" on public.admin_audit_log for select
  using (public.is_admin());

-- notifications: own
create policy "notifications_select_own" on public.notifications for select
  using (auth.uid() = user_id);
```

Додай `admin_audit_log` insert через тригер або тільки RPC (рекомендовано: inserts виключно з `SECURITY DEFINER` RPC, без RLS-політики на insert для user — RLS default deny). Переконайся, що `grant` на `authenticated` coverить лише `select` де потрібно.

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(db): RLS for coin economy tables"
```

---

## Task 4: Storage: бакет `screenshots`

**Files:**
- Create: `supabase/migrations/20260425120300_storage_screenshots.sql`

- [ ] **Step 1: Storage SQL (Supabase)**

```sql
insert into storage.buckets (id, name, public)
  values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;
```

Storage policies (через `storage.objects`): upload тільки у префікс `auth.uid()::text || '/'` для `authenticated`; `select` для `authenticated` where owner path OR admin — для адміна: `is_admin()`.

(Supabase-специфічні policy на `storage.objects` — копіюй актуальний шаблон з [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control) для path prefix.)

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(db): private screenshots storage bucket and policies"
```

---

## Task 5: RPC-функції (submit, approve, reject, grant) + `admin_audit` + `notifications`

**Files:**
- Create: `supabase/migrations/20260425120400_coin_rpc.sql`

- [ ] **Step 1: `submit_purchase_request(requested_amount int, screenshot_path text, user_comment text default null) returns uuid`**

Логіка: `if auth.uid() is null then raise`, `if requested_amount <= 0 then raise`. `insert into coin_purchase_requests (user_id, requested_amount, screenshot_url, user_comment) values (auth.uid(), ...)`; `screenshot_path` нормалізуй (має бути `auth.uid() || '/...'`) — інакше `raise 'invalid path'`. Return `id`.

- [ ] **Step 2: `approve_purchase_request(request_id uuid, approved_amount int, admin_note text default null) returns void`**

`is_admin()`. `select ... for update` заявка `status = pending'`. `update` на `approved`, `approved_amount`, `reviewed_by`, `reviewed_at`, `admin_comment`. Вставка `coin_transactions` з `kind = purchase_approved`, `delta = approved_amount`, `ref_id = request_id`, `admin_id = auth.uid()`, `note = admin_note`, `balance_after` = (sum previous + delta). Insert `admin_audit_log`. Insert `notifications` для `user_id` заявки: type `purchase_approved`, українською заголовок/текст.

- [ ] **Step 3: `reject_purchase_request`**

Аналогічно без `coin_transactions`, зміна `status` на `rejected`, `notifications` + audit.

- [ ] **Step 4: `grant_coins_manual(target_user_id uuid, delta int, note text) returns void`**

`is_admin()`. Якщо `delta = 0` — raise. Перевірка: після `delta` баланс не < 0: `v := (select coalesce(sum(delta),0) from coin_transactions where user_id = target) + delta` (або read profile balance + delta у тій самій lock-транзакції). `kind` = `admin_grant` / `admin_deduct`. `admin_id` = `auth.uid()`. Audit. Notification опційно.

- [ ] **Step 5: `grant execute on function ... to authenticated`** для submit; approve/reject/grant **також** `to authenticated` (всередині `is_admin()` / `auth.uid()`).

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(db): purchase request and coin transfer RPCs"
```

---

## Task 6: pgTAP — `supabase/tests/coin_economy.test.sql`

**Files:**
- Create: `supabase/tests/coin_economy.test.sql`

- [ ] **Step 1: Приклад тесту (адаптуй під `pgTAP` і своїх helper users)**

```sql
begin;
select plan(3);
-- 1) insert coin_transactions від імені тестової ролі після виклику RPC-емуляції
-- 2) reject double approve
-- 3) balance equals sum
select * from finish();
rollback;
```

- [ ] **Step 2: Локальний прогін**

```bash
# З Docker: supabase start && supabase test db
```

Expected: tests pass. Якщо Docker недоступний — зафіксуй у README "pgTAP локально після `supabase start`".

- [ ] **Step 3: Commit**

```bash
git add supabase/tests/coin_economy.test.sql
git commit -m "test(db): pgTAP for coin economy"
```

---

## Task 7: Seed `app_settings`

**Files:**
- Create: `supabase/seed phase` SQL snippet або нова міграція `20260425120500_seed_app_settings.sql` (якщо seed.sql вже — append)

Використай значення з [phase-2 skeleton](../../../2026-04-24-phase-2-coin-economy.md#task-9-seed-`app_settings`):

- [ ] `insert into public.app_settings ...` (ключі: `donation_jar_url`, `donation_card`, `donation_disclaimer`, `donation_qr_url`, `bet_close_minutes`, `active_season_id`).

- [ ] **Commit** `chore(db): seed app_settings for donations`

---

## Task 8: Regenerate `database.types.ts`

- [ ] **Step 1**

```bash
export SUPABASE_PROJECT_ID=lkorkbqvvjenveacmzxr
npm run db:types
```

- [ ] **Step 2: Commit** `chore(types): regenerate Supabase types for phase 2`

---

## Task 9: Налаштування `npm` (форми, dropzone, table, toasts, helmet)

- [ ] **Step 1: Install**

```bash
npm install react-hook-form zod @hookform/resolvers react-dropzone @tanstack/react-table sonner react-helmet-async
```

- [ ] **Step 2: `src/main.tsx`** — додай `import { Toaster } from 'sonner'` і `<Toaster position="top-center" richColors />` всередині `QueryClientProvider`.

- [ ] **Step 3: Commit** `chore: add form, validation, and toast dependencies`

---

## Task 10: Zod + unit test (TDD)

**Files:**
- Create: `src/lib/schemas/purchaseRequest.ts`
- Create: `tests/unit/schemas/purchaseRequest.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest'
import { purchaseRequestSchema } from '@/lib/schemas/purchaseRequest'

describe('purchaseRequestSchema', () => {
  it('rejects file over 5MB', () => {
    const f = new File([new ArrayBuffer(6_000_000)], 'x.jpg', { type: 'image/jpeg' })
    const r = purchaseRequestSchema.safeParse({ amount: 100, userComment: '', screenshot: f })
    expect(r.success).toBe(false)
  })
})
```

Run: `npm run test -- --run purchaseRequest` → FAIL (schema missing).

- [ ] **Step 2: Реалізація** — скопіюй Zod з [skeleton task 11](../../../2026-04-24-phase-2-coin-economy.md#task-11-client--zod-схема-`purchaserequestts`); експортуй `purchaseRequestSchema`.

- [ ] **Step 3: PASS + commit** `test: purchase request zod schema`

---

## Task 11: `useAppSettings` hook + тест (mock supabase)

**Files:**
- Create: `src/hooks/useAppSettings.ts`
- Create: `tests/unit/hooks/useAppSettings.test.tsx` (копія підходу `useActiveSeason.test.tsx`)

- [ ] `useQuery` key `['appSettings']`, `queryFn`: `from('app_settings').select('key, value')`, поверни `Object.fromEntries(rows.map(r => [r.key, r.value]))` з типом `Record<string, unknown>`, `staleTime: 15 * 60 * 1000`.

- [ ] Commit: `feat(data): useAppSettings query`

---

## Task 12: Компоненти `DonationInfoBlock` + `ZsuBanner`

**Files:**
- `src/components/coins/DonationInfoBlock.tsx` — `useAppSettings`, кнопки копіювання (clipboard + `toast.success('Скопійовано')` українською)
- `src/components/coins/ZsuBanner.tsx` — компактний банер 🇺🇦

- [ ] Commit `feat(ui): donation info block and ZSU banner`

---

## Task 13: `PurchaseRequestForm` + `useSubmitPurchaseRequest`

**Files:**
- `src/hooks/useSubmitPurchaseRequest.ts` — `useMutation`, upload `supabase.storage.from('screenshots').upload(path, file, { contentType, upsert: false })` потім `supabase.rpc('submit_purchase_request', { ... })` **увага:** імена параметрів згенерованих match до SQL.
- `src/components/coins/PurchaseRequestForm.tsx` — RHF + zodResolver, dropzone, `onSuccess` → invalidate `['purchaseRequests']`, `toast` українською, `useNavigate` на `/wallet`

- [ ] **Commit** `feat(coins): purchase request form and submit mutation`

---

## Task 14: `usePurchaseRequests`, `useCoinTransactions`, `useSignedScreenshotUrl`, картки статусу

- [ ] `PurchaseStatusCard.tsx` — рендер по `status` кольором Cinematic Noir.
- [ ] `useCoinTransactions` — `order('created_at', { ascending: false })`, limit 50 + offset або cursor (YAGNI: offset ok).

- [ ] Commit `feat(coins): purchase requests and ledger hooks`

---

## Task 15: Сторінки `CoinsPage` + `WalletPage`

- [ ] `CoinsPage` — guest: `DonationInfoBlock` + CTA на `/login`; authed: donation + form + list cards.
- [ ] `WalletPage` — `BalanceCard` (баланс з `useProfile`), `LedgerList` (TanStack Table, фільтр по `kind` select), `refetchInterval: 30_000`.

- [ ] **Commit** `feat(pages): coins and wallet pages`

---

## Task 16: Admin layout, route guard, Helmet

**Files:**
- `src/components/admin/AdminRoute.tsx` — `useProfile`, `isLoading` skeleton, if `data?.role !== 'admin'` → `Navigate to="/" replace` + `toast.error('Немає доступу')` (тільки один раз, через `useRef` flag якщо треба)
- `src/components/admin/AdminLayout.tsx` — sidebar, `<Outlet />`, `<Helmet><meta name="robots" content="noindex" /></Helmet>`

- [ ] Wrap with `HelmetProvider` in `main.tsx`

- [ ] **Commit** `feat(admin): admin layout and route guard`

---

## Task 17: `useAdminPurchaseQueue` + `PurchaseQueueTable` + `PurchaseReviewModal`

- [ ] `useAdminPurchaseQueue` — `select * from coin_purchase_requests` where `status` filter, order `created_at`
- [ ] `PurchaseReviewModal` — signed URL for screenshot (`useSignedScreenshotUrl`), `approved_amount` default `requested_amount`, кнопки → `approve` / `reject` RPCs

- [ ] **Commit** `feat(admin): purchase review queue and modal`

---

## Task 18: `AdminUsersPage` + manual grant

- [ ] `useAdminUsers` — `from('profiles').select(...)` with search `ilike` on nickname (обмеж top 100 + debounce) — YAGNI: простий список
- [ ] Sheet/modal: `grant_coins_manual` з обов'язковим `note` (Zod: min 3 символи)

- [ ] **Commit** `feat(admin): users list and manual coin grant`

---

## Task 19: Роутер + невбирання публічного layout для admin

**Files:**
- Modify: `src/router.tsx`

- [ ] **Структура:** винести `Admin` routes **поза** `RootLayout` **або** дубль обгорток — вибір: `createBrowserRouter` з другою top-level гілкою `path: 'admin'`, `element: <AdminRoute><AdminLayout/></AdminRoute>`, `children: [...]`; публічні зарешту без змін.

- [ ] Додати лінк "Адмін" у `PublicHeader.tsx` якщо `useProfile().data?.role === 'admin'`.

- [ ] **Commit** `feat(ui): admin routes and header link`

---

## Task 20: E2E `tests/e2e/coin-economy.spec.ts`

- [ ] Сценарій (скорочено, як [skeleton task 20](../../../2026-04-24-phase-2-coin-economy.md#task-20-e2e-test)):

1. `test.setTimeout(120000)` для upload
2. Користувач: логін (якщо e2e може — через збережений state **або** `test.skip` крок логіна і документ "manual: seed session") — YAGNI: e2e для **guest** шляху `/coins` + перевірка CTA, окремо admin-only `test.skip(true)` до появи test users.

Прагматичний варіант Ph2:

- Тест 1: guest `/coins` бачить donation block
- Тест 2: guest `/wallet` → redirect... (у специфі wallet для authed) — **не редірект** якщо не захищено: обгорни `WalletPage` у requireAuth (як `ProfilePage`).

Додай **require auth** на `/wallet` (як profile): `Navigate` to login — тоді e2e: guest `wallet` → login URL.

- [ ] **Commit** `test(e2e): coin economy guest flows` (+ розширення коли з'являться test credentials)

---

## Task 21: CI (опційно pgTAP)

- [ ] Додай у `docs/phase-2-ci-notes.md` (1 файл у `docs/`) **або** коментар у `ci.yml`: job `db-test` with `if: false` + інструкція "увімкнути після `supabase start` on CI".

- [ ] Не ламай існуючий `npm test`.

- [ ] **Commit** `ci: document optional supabase db tests for phase 2`

---

## Task 22: Acceptance sweep + тег

- [ ] **Перевірка чек-листу** з [Acceptance Criteria](../../../2026-04-24-phase-2-coin-economy.md#acceptance-criteria-phase-2) — всі пункти

- [ ] **Git tag**

```bash
git tag phase-2-complete
git push origin phase-2-complete
```

- [ ] **Оновити** `README.md` Phase 2 [x]

---

## Self-review (internal checklist)

1. **Spec coverage:** Таблиці §5.4–5.6, Storage §6.4, RLS §6.3, admin SQL-only §6.2 — покрито завданнями 1–5, 4, 7–22.
2. **Placeholders:** Усі кроки з посиланням на наявні файли або повний SQL/TS-фрагмент; без "TBD".
3. **Type names:** `screenshot_url` в БД, параметр клієнта `screenshot_path` у RPC — узгодити в `database.types` після `db:types` і в викликах `supabase.rpc`.
4. **Ризик:** `guard_profile_update` + баланс — **Task 2 обов'язковий** перед e2e з реальними RPC.

---

**Plan complete and saved to** `docs/superpowers/plans/2026-04-24-coin-economy-phase-2.md`. **Two execution options:**

1. **Subagent-Driven (recommended)** — згідно з `superpowers:subagent-driven-development`, окремий субагент на кожен Task, рев'ю між задачами.

2. **Inline Execution** — `superpowers:executing-plans` у цій сесії з чекпойнтами.

**Which approach do you want?**
