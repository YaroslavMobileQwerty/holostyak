# Admin Panel (Phase 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести операційну адмінку до повного циклу з [§8 дизайну](../../../2026-04-24-holostyak-tote-design.md#8-адмін-частина) та скелету [../../../2026-04-24-phase-6-admin-panel.md](../../../2026-04-24-phase-6-admin-panel.md): бан/розбан, роль (з обмеженнями), примусовий нік, broadcast-сповіщення з лімітом, редактор `app_settings`, розширений дашборд, CRUD учасниць/холостяків/сезонів, детальна картка користувача, журнал аудиту, мобільна адаптація shell; усі мутації через **SECURITY DEFINER** RPC з записом у `admin_audit_log`.

**Architecture:** Клієнт лише викликає RPC і читає таблиці дозволеним SELECT. Нова колонка `profiles.is_banned`; на початку `place_bet` і `submit_purchase_request` — перевірка бану з винятком тексту `user_banned`. Broadcast: таблиця `admin_broadcast_log` + RPC `admin_broadcast_notification` + `admin_broadcast_preview_count` для UI. Налаштування: `admin_update_app_setting(key, value jsonb)` з allowlist ключів і забороною небезпечних змін без підтвердження в UI. Дашборд: одна RPC `admin_dashboard_stats() returns jsonb` щоб зібрати метрики без дроблення прав. **Узгодження з дизайном §321:** перший користувач з `role = 'admin'` задається лише через SQL у Supabase; RPC `admin_set_role` не може призначити адміна, якщо викликач не є вже `admin`, і **не дозволяє** змінити власну роль або зняти останнього адміна (див. Task 3). **Фаза 5 (вже в коді):** `achievements`, `user_achievements`, `notifications` з `achievement_unlocked`, `evaluate_user_achievements` — на `/admin/user/:id` показати сітку бейджів (read-only). **Фаза 7:** таблиці `season_prizes` ще немає — маршрут `/admin/prizes` у Phase 6 лише заглушка з текстом «Phase 7» (щоб покрити навігацію §8.6 без дублювання scope).

**Tech Stack:** `holostyak-tote` — React 19, Vite 8, TanStack Query 5, Supabase JS v2, Tailwind 4, Zod, RHF (за наявності форм), sonner, react-helmet-async (вже в `AdminLayout`). Тести: Vitest (де логіка на клієнті), pgTAP у `supabase/tests/`, Playwright e2e.

**Prereq:** Фази 1–5 накочені; існують `admin_audit_log`, `app_settings`, `is_admin()`, `grant_coins_manual`, `AdminLayout`, `AdminRoute`, сторінки dashboard/purchases/users/episodes/resolution/live.

**Workspace root:** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260429120000_profiles_ban.sql` | `profiles.is_banned`, індекс; оновлення `place_bet` / `submit_purchase_request` |
| `supabase/migrations/20260429120100_admin_user_rpcs.sql` | `admin_ban_user`, `admin_unban_user`, `admin_set_role`, `admin_force_set_nickname` |
| `supabase/migrations/20260429120200_admin_broadcast.sql` | `admin_broadcast_log`, `admin_broadcast_preview_count`, `admin_broadcast_notification` |
| `supabase/migrations/20260429120300_admin_settings_rpc.sql` | `admin_update_app_setting` |
| `supabase/migrations/20260429120400_admin_dashboard_rpc.sql` | `admin_dashboard_stats` |
| `supabase/migrations/20260429120500_admin_catalog_rpcs.sql` | CRUD RPC для `seasons`, `bachelors`, `participants` (або підмножина з audit) |
| `supabase/tests/admin_phase6.test.sql` | pgTAP: наявність RPC, бан блокує ставку (smoke через exception) |
| `src/components/admin/AdminLayout.tsx` | Розширити `links`, бургер-меню на `md:` |
| `src/router.tsx` | Маршрути `participants`, `bachelors`, `seasons`, `user/:id`, `audit`, `broadcast`, `settings`, `prizes` |
| `src/pages/admin/AdminDashboardPage.tsx` | Метрики з RPC + швидкі дії |
| `src/pages/admin/AdminParticipantsPage.tsx`, `AdminBachelorsPage.tsx`, `AdminSeasonsPage.tsx` | Нові |
| `src/pages/admin/AdminUserDetailPage.tsx` | Вкладки overview / ledger / bets / purchases / actions / audit |
| `src/pages/admin/AdminAuditLogPage.tsx`, `AdminBroadcastPage.tsx`, `AdminSettingsPage.tsx`, `AdminPrizesPlaceholderPage.tsx` | Нові |
| `src/pages/admin/AdminUsersPage.tsx` | Фільтри, CSV, лінк на деталку |
| `src/components/admin/*.tsx` | `DashboardMetricCard`, таблиці, форми, `AuditLogTable`, `BroadcastForm`, `SettingsEditor`, тощо |
| `src/hooks/admin/*.ts` | Хуки під кожен RPC / запит |
| `src/lib/database.types.ts` | Після `npm run db:types` |
| `tests/e2e/admin-phase6.spec.ts` | Критичні шляхи |

---

## Task 0: Базова верифікація гілки

**Files:** —

- [ ] **Step 1:** `cd holostyak-tote && npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build` — очікувано зелене.

- [ ] **Step 2:** Переконатися, що на staging застосовані міграції до `20260428120600_*` включно (Фаза 5).

- [ ] **Step 3:** Commit: `chore: verify baseline before phase 6` (якщо були лише локальні зміни — пропустити).

---

## Task 1: Колонка `is_banned` і блокування ставок / заявок

**Files:**
- Create: `supabase/migrations/20260429120000_profiles_ban.sql`
- Modify (у тому ж файлі через `create or replace`): виклики з `20260426120400_betting_rpc.sql` / `20260425120400_coin_rpc.sql` — скопіювати повні тіла функцій і додати перевірку

- [ ] **Step 1:** Додати колонку та індекс:

```sql
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

create index if not exists profiles_is_banned_idx on public.profiles (is_banned) where is_banned = true;
```

- [ ] **Step 2:** На початку тіла `place_bet` (після `v_uid := auth.uid()`):

```sql
if exists (select 1 from public.profiles p where p.id = v_uid and p.is_banned) then
  raise exception 'user_banned';
end if;
```

- [ ] **Step 3:** На початку `submit_purchase_request` (після `v_uid := auth.uid()`):

```sql
if exists (select 1 from public.profiles p where p.id = v_uid and p.is_banned) then
  raise exception 'user_banned';
end if;
```

- [ ] **Step 4:** `supabase db push` локально; перевірити `\d profiles`.

- [ ] **Step 5:** Commit: `feat(db): profile ban flag and blocked betting flows`

---

## Task 2: RPC `admin_ban_user` / `admin_unban_user`

**Files:**
- Create: `supabase/migrations/20260429120100_admin_user_rpcs.sql` (частина 1)

- [ ] **Step 1:** Реалізувати:

```sql
create or replace function public.admin_ban_user(p_target_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_target_id = auth.uid() then raise exception 'Cannot ban self'; end if;
  if p_reason is null or length(trim(p_reason)) < 3 then raise exception 'Reason required'; end if;

  update public.profiles set is_banned = true where id = p_target_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'user_banned', 'profile', p_target_id, jsonb_build_object('reason', p_reason));

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    p_target_id, 'admin_message', 'Обмеження акаунта',
    'Ваш акаунт обмежено. Деталі: ' || left(trim(p_reason), 500),
    '/profile'
  );
end;
$$;

create or replace function public.admin_unban_user(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  update public.profiles set is_banned = false where id = p_target_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'user_unbanned', 'profile', p_target_id, '{}'::jsonb);
end;
$$;

grant execute on function public.admin_ban_user(uuid, text) to authenticated;
grant execute on function public.admin_unban_user(uuid) to authenticated;
```

- [ ] **Step 2:** `db push`; pgTAP або ручна перевірка виклику під адміном.

- [ ] **Step 3:** Commit: `feat(db): admin ban and unban RPCs`

---

## Task 3: RPC `admin_set_role`

**Files:**
- Modify: `supabase/migrations/20260429120100_admin_user_rpcs.sql` (додати в кінець файлу новою міграцією не треба — той самий файл, якщо ще не закомічений; інакше новий timestamp-файл)

- [ ] **Step 1:** Реалізувати з захистом «останній адмін»:

```sql
create or replace function public.admin_set_role(p_target_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_count int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_role not in ('user', 'admin') then raise exception 'Invalid role'; end if;
  if p_target_id = auth.uid() then raise exception 'Cannot change own role'; end if;

  if p_role = 'user' and exists (select 1 from public.profiles p where p.id = p_target_id and p.role = 'admin') then
    select count(*) into v_admin_count from public.profiles where role = 'admin';
    if v_admin_count <= 1 then raise exception 'Cannot demote last admin'; end if;
  end if;

  update public.profiles set role = p_role where id = p_target_id;
  if not found then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'role_changed', 'profile', p_target_id, jsonb_build_object('role', p_role));
end;
$$;

grant execute on function public.admin_set_role(uuid, text) to authenticated;
```

- [ ] **Step 2:** Документувати в README Phase 6: перший адмін як і раніше через SQL (дизайн §321).

- [ ] **Step 3:** Commit: `feat(db): admin_set_role RPC`

---

## Task 4: RPC `admin_force_set_nickname`

**Files:**
- Modify: той самий файл міграції користувацьких RPC

- [ ] **Step 1:**

```sql
create or replace function public.admin_force_set_nickname(p_target_id uuid, p_nickname text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trim text := trim(p_nickname);
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if v_trim is null or length(v_trim) < 2 then raise exception 'Invalid nickname'; end if;

  update public.profiles set nickname = v_trim where id = p_target_id;
  if not found then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'nickname_forced', 'profile', p_target_id, jsonb_build_object('nickname', v_trim));
exception
  when unique_violation then
    raise exception 'Nickname already taken';
end;
$$;

grant execute on function public.admin_force_set_nickname(uuid, text) to authenticated;
```

- [ ] **Step 2:** Commit: `feat(db): admin_force_set_nickname RPC`

---

## Task 5: Broadcast — таблиця логу, preview, відправка

**Files:**
- Create: `supabase/migrations/20260429120200_admin_broadcast.sql`

- [ ] **Step 1:** Таблиця + індекс для rate limit:

```sql
create table public.admin_broadcast_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id),
  title text not null,
  body text not null,
  filter jsonb not null,
  recipient_count int not null,
  created_at timestamptz not null default now()
);
create index admin_broadcast_log_created_idx on public.admin_broadcast_log (created_at desc);

alter table public.admin_broadcast_log enable row level security;
create policy "admin_broadcast_log_select"
  on public.admin_broadcast_log for select to authenticated
  using (public.is_admin());
```

- [ ] **Step 2:** Функція підрахунку отримувачів (елементи фільтра обробляти послідовно):

  - `{"all": true}` — усі рядки `profiles` де `is_banned = false`.
  - `{"active_bettors": true}` — `distinct user_id` з `bets` де `placed_at >= now() - interval '24 hours'`.
  - `{"season_id": "<uuid>", "participated": true}` — користувачі з ≥1 ставкою на подію в епізоді цього сезону (`join bet_events` → `episodes`).

  Якщо кілька ключів `true` в одному JSON — об’єднати через **UNION** (унікальні `user_id`).

```sql
create or replace function public.admin_broadcast_preview_count(p_filter jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;

  select count(*)::int into v_count
  from (
    select p.id as user_id from public.profiles p
    where not p.is_banned
      and coalesce((p_filter->>'all')::boolean, false)
    union
    select distinct b.user_id from public.bets b
    where b.placed_at >= now() - interval '24 hours'
      and coalesce((p_filter->>'active_bettors')::boolean, false)
    union
    select distinct b.user_id
    from public.bets b
    inner join public.bet_events e on e.id = b.event_id
    inner join public.episodes ep on ep.id = e.episode_id
    where coalesce((p_filter->>'participated')::boolean, false)
      and ep.season_id = (p_filter->>'season_id')::uuid
  ) u;

  return coalesce(v_count, 0);
end;
$$;

revoke all on function public.admin_broadcast_preview_count(jsonb) from public;
grant execute on function public.admin_broadcast_preview_count(jsonb) to authenticated;
```

- [ ] **Step 3:** `admin_broadcast_notification(p_title text, p_body text, p_filter jsonb) returns int` — перевірка `is_admin()`; **глобальний** rate limit: `if exists (select 1 from admin_broadcast_log where created_at > now() - interval '1 hour') then raise exception 'broadcast_rate_limited'; end if;`; далі `insert into notifications (user_id, type, title, body) select u.user_id, 'admin_message', p_title, p_body from (<той самий union підзапит що в preview, додати стовпець user_id>) u` (уникати дублювання — винести union у `WITH recipients AS (...)`); `insert into admin_broadcast_log (...)`; `insert into admin_audit_log`; повернути `GET DIAGNOSTICS` або `select count(*)` з вставлених рядків.

- [ ] **Step 4:** `grant execute` тільки `authenticated` (внутрішня перевірка `is_admin()`).

- [ ] **Step 5:** Commit: `feat(db): admin broadcast RPC and log`

---

## Task 6: RPC `admin_update_app_setting`

**Files:**
- Create: `supabase/migrations/20260429120300_admin_settings_rpc.sql`

- [ ] **Step 1:**

```sql
create or replace function public.admin_update_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed text[] := array[
    'donation_jar_url', 'donation_card', 'donation_disclaimer', 'donation_qr_url',
    'bet_close_minutes', 'active_season_id'
  ];
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if not (p_key = any (v_allowed)) then raise exception 'Key not editable via RPC'; end if;

  insert into public.app_settings (key, value, updated_by, updated_at)
  values (p_key, p_value, auth.uid(), now())
  on conflict (key) do update set
    value = excluded.value,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'app_setting_updated', 'app_settings', null,
    jsonb_build_object('key', p_key, 'value', p_value)
  );
end;
$$;

grant execute on function public.admin_update_app_setting(text, jsonb) to authenticated;
```

- [ ] **Step 2:** UI для `active_season_id`: попередження «змінити лише коли впевнені» + підтвердження другою кнопкою (без окремого RPC).

- [ ] **Step 3:** Commit: `feat(db): admin_update_app_setting RPC`

---

## Task 7: RPC `admin_dashboard_stats`

**Files:**
- Create: `supabase/migrations/20260429120400_admin_dashboard_rpc.sql`

- [ ] **Step 1:** Повернути `jsonb` з ключами (мінімум):

```json
{
  "pending_purchases": 0,
  "pending_resolutions": 0,
  "active_bettors_24h": 0,
  "total_staked_24h": 0,
  "signups_24h": 0
}
```

  - `pending_purchases`: `count(*) filter (status='pending')` з `coin_purchase_requests`.
  - `pending_resolutions`: `count(*)` з `bet_events` де `status = 'closed'`.
  - `active_bettors_24h`: `count(distinct user_id)` з `bets` за `placed_at`.
  - `total_staked_24h`: `sum(amount)` з тих же ставок за добу.
  - `signups_24h`: `count(*)` з `profiles` де `created_at >= now() - interval '24 hours'`.

```sql
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  return jsonb_build_object(
    'pending_purchases', (select count(*)::int from coin_purchase_requests where status = 'pending'),
    'pending_resolutions', (select count(*)::int from bet_events where status = 'closed'),
    'active_bettors_24h', (
      select count(distinct user_id)::int from bets
      where placed_at >= now() - interval '24 hours'
    ),
    'total_staked_24h', (
      select coalesce(sum(amount), 0)::int from bets
      where placed_at >= now() - interval '24 hours'
    ),
    'signups_24h', (
      select count(*)::int from profiles
      where created_at >= now() - interval '24 hours'
    )
  );
end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated;
```

- [ ] **Step 2:** Commit: `feat(db): admin_dashboard_stats RPC`

---

## Task 8: Каталогові RPC (сезони / холостяки / учасниці)

**Files:**
- Create: `supabase/migrations/20260429120500_admin_catalog_rpcs.sql`

**Примітка:** У дизайні [§8.5](../../../2026-04-24-holostyak-tote-design.md#85-користувачі-adminusers) та скелеті вимагається audit на кожну мутацію. Навіть якщо зараз RLS дозволяє адміну прямий `insert` у `participants`, Phase 6 **замінює** публічні мутації з клієнта на RPC для єдиного журналу.

- [ ] **Step 1:** Для кожної операції: `admin_create_season`, `admin_update_season`, `admin_set_season_status` (переходи `upcoming` → `active` → `finished` з перевіркою «не більше одного `active`»), `admin_create_bachelor`, `admin_update_bachelor`, `admin_create_participant`, `admin_update_participant` (поля згідно `20260424120000_initial_schema.sql`: `season_id`, `name`, `status`, `current_bachelor_id`, `eliminated_episode_id`, фото URL після upload). Кожен виклик — `insert into admin_audit_log` з `payload` (без великих base64).

- [ ] **Step 2:** Завантаження фото: клієнт використовує існуючий патерн Storage (як `screenshots`) — окремий публічний бакет `photos` або існуючий з `20260425120300_storage_screenshots.sql` — **перевірити** наявний bucket у міграціях; якщо лише `screenshots`, додати міграцію `storage` для `participant-photos` з policy «автентифікований адмін може upload».

- [ ] **Step 3:** `grant execute` на всі каталогові RPC для `authenticated`.

- [ ] **Step 4:** pgTAP: `has_function` для кожної нової функції (короткий файл).

- [ ] **Step 5:** Commit: `feat(db): admin catalog RPCs for seasons bachelors participants`

---

## Task 9: Компонент `DashboardMetricCard` і оновлення дашборду

**Files:**
- Create: `src/components/admin/DashboardMetricCard.tsx`
- Modify: `src/pages/admin/AdminDashboardPage.tsx`
- Create: `src/hooks/admin/useAdminDashboardStats.ts`

- [ ] **Step 1:** Хук:

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_dashboard_stats')
      if (error) throw error
      return data as Record<string, number>
    },
  })
}
```

- [ ] **Step 2:** Сітка карток + швидкі лінки: `/admin/purchases`, `/admin/resolution`, `/admin/live/:id` (остання live-епізод — окремий запит або спростити лінком на `/admin/episodes`).

- [ ] **Step 3:** Опційно: Realtime channel `admin_dashboard` — **YAGNI** у першому проході; достатньо `refetchInterval` як у дизайні §9.1 «раз на хвилину».

- [ ] **Step 4:** `npm run typecheck`

- [ ] **Step 5:** Commit: `feat(admin): dashboard metrics from RPC`

---

## Task 10: Сторінки `/admin/seasons`, `/admin/bachelors`, `/admin/participants`

**Files:**
- Create: `src/pages/admin/AdminSeasonsPage.tsx`, `AdminBachelorsPage.tsx`, `AdminParticipantsPage.tsx`
- Create: `src/components/admin/SeasonForm.tsx`, `BachelorForm.tsx`, `ParticipantForm.tsx`, `ParticipantsTable.tsx` (або об’єднати де доречно)
- Modify: `src/components/admin/AdminLayout.tsx`, `src/router.tsx`

- [ ] **Step 1:** `AdminSeasonsPage`: таблиця сезонів + створення/редагування; кнопка «Активувати» викликає `admin_set_season_status` з підтвердженням.

- [ ] **Step 2:** `AdminBachelorsPage`: фільтр за `season_id` (dropdown активного сезону з `app_settings` або список сезонів).

- [ ] **Step 3:** `AdminParticipantsPage`: таблиця + форма; dropdown холостяка; статуси `active`/`eliminated`/`winner`/`runner_up`; `eliminated_episode_id` — select епізодів сезону.

- [ ] **Step 4:** Підключити хуки `useMutation` + `toast` українською.

- [ ] **Step 5:** Commit: `feat(admin): seasons bachelors participants pages`

---

## Task 11: Розширення `/admin/users` і CSV

**Files:**
- Modify: `src/pages/admin/AdminUsersPage.tsx`
- Modify: `src/hooks/admin/useAdminUsers.ts` або створити `useAdminUsersFiltered.ts`
- Create: `src/lib/exportUsersCsv.ts` (чиста функція + unit-тест)

- [ ] **Step 1:** Якщо потрібен email у таблиці — додати RPC `admin_list_users(p_filters jsonb)` що повертає `setof` з полями `id, nickname, role, is_banned, balance, total_bets, correct_bets, created_at, email text` з `auth.users` через `security definer` (дозволено лише `is_admin()`). **Не** експонувати email у публічному REST без RPC.

```sql
-- приклад сигнатури (деталі реалізації — у міграції)
create or replace function public.admin_list_users(
  p_search text default null,
  p_role_filter text default null,
  p_banned boolean default null,
  p_limit int default 200
)
returns table (
  id uuid,
  nickname text,
  email text,
  role text,
  is_banned boolean,
  balance int,
  total_bets int,
  correct_bets int,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.nickname, u.email::text, p.role, p.is_banned, p.balance, p.total_bets, p.correct_bets, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
    and (p_search is null or p.nickname ilike '%' || p_search || '%')
    and (p_role_filter is null or p.role = p_role_filter)
    and (p_banned is null or p.is_banned = p_banned)
  order by p.created_at desc
  limit least(p_limit, 500);
$$;
```

- [ ] **Step 2:** Фільтри в UI: роль, бан, діапазон `balance` (клієнтський фільтр після завантаження або додати в RPC `p_min_balance`, `p_max_balance`).

- [ ] **Step 3:** Кнопка «Експорт CSV»: `exportUsersCsv(rows)` — заголовки українською або англійською (узгодити один раз).

- [ ] **Step 4:** Рядок таблиці → `Link` на `/admin/user/:id`.

- [ ] **Step 5:** Commit: `feat(admin): users list filters and CSV export`

---

## Task 12: Сторінка `/admin/user/:id`

**Files:**
- Create: `src/pages/admin/AdminUserDetailPage.tsx`
- Create: `src/components/admin/UserActionsPanel.tsx` (ban, unban, role, force nickname, grant через існуючий `useGrantCoinsManual`)
- Create: `src/hooks/admin/useAdminUserDetail.ts` (або кілька хуків: ledger, bets, purchases)

- [ ] **Step 1:** Вкладки: **Огляд** (stats + `useMyAchievements`/`user_achievements` для цього `user_id` read-only), **Гаманець** (`coin_transactions`), **Ставки** (`bets` + join подій), **Заявки** (`coin_purchase_requests`), **Дії** (панель), **Аудит** (фільтр `admin_audit_log` де `target_id = user` або `payload->>'user_id'`).

- [ ] **Step 2:** Мутації: виклики `supabase.rpc('admin_ban_user', ...)`, тощо; після успіху `invalidateQueries`.

- [ ] **Step 3:** Commit: `feat(admin): user detail page`

---

## Task 13: `/admin/audit`

**Files:**
- Create: `src/pages/admin/AdminAuditLogPage.tsx`
- Create: `src/components/admin/AuditLogTable.tsx`
- Create: `src/hooks/admin/useAdminAuditLog.ts`

- [ ] **Step 1:** Запит: `from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)` з фільтрами `action`, `admin_id`, діапазон дат (клієнт або RPC `admin_audit_search` якщо потрібні складні фільтри).

- [ ] **Step 2:** Відображення `payload`: `<pre className="text-xs overflow-x-auto">` + `JSON.stringify(payload, null, 2)` (без зовнішньої highlight-бібліотеки у першому проході — YAGNI; якщо додати `shiki` — окремий коміт).

- [ ] **Step 3:** Commit: `feat(admin): audit log page`

---

## Task 14: `/admin/broadcast`

**Files:**
- Create: `src/pages/admin/AdminBroadcastPage.tsx`
- Create: `src/components/admin/BroadcastForm.tsx`
- Create: `src/hooks/admin/useAdminBroadcast.ts`

- [ ] **Step 1:** Форма: title, body, чекбокси фільтрів → збір у `p_filter` jsonb; Zod/UX: мінімум один з `all` / `active_bettors` / (`participated` + валідний `season_id`); інакше `toast.error` без RPC. Кнопка «Порахувати» → `admin_broadcast_preview_count`; показ числа; Confirm → `admin_broadcast_notification`.

- [ ] **Step 2:** Таблиця історії: `from('admin_broadcast_log').select('*')` (admin only RLS).

- [ ] **Step 3:** Commit: `feat(admin): broadcast page`

---

## Task 15: `/admin/settings`

**Files:**
- Create: `src/pages/admin/AdminSettingsPage.tsx`
- Create: `src/components/admin/SettingsEditor.tsx`
- Modify: `src/hooks/useAppSettings.ts` (якщо є) або читати напряму

- [ ] **Step 1:** Список ключів з allowlist Task 6; для `donation_qr_url` — file upload у Storage + збереження URL у jsonb; для `active_season_id` — окремий блок з попередженням.

- [ ] **Step 2:** Збереження через `admin_update_app_setting`.

- [ ] **Step 3:** Редагування **achievements** з дизайну §17 — **поза** Phase 6 (як у Phase 5 self-review); не додавати без окремого ТЗ.

- [ ] **Step 4:** Commit: `feat(admin): settings page`

---

## Task 16: Заглушка `/admin/prizes`

**Files:**
- Create: `src/pages/admin/AdminPrizesPlaceholderPage.tsx`
- Modify: `src/router.tsx`, `AdminLayout.tsx`

- [ ] **Step 1:** Текст: «Призи сезону та доставка — Phase 7» + лінк на кореневий план Phase 7 у репозиторії.

- [ ] **Step 2:** Commit: `chore(admin): prizes placeholder for phase 7`

---

## Task 17: Навігація AdminLayout (mobile)

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1:** Додати в `links` усі нові маршрути: `seasons`, `bachelors`, `participants`, `audit`, `broadcast`, `settings`, `prizes`.

- [ ] **Step 2:** На вузьких екранах: кнопка «Меню», `details/summary` або state для drawer; таблиці на сторінках — `overflow-x-auto` (вже частково є).

- [ ] **Step 3:** Commit: `feat(admin): sidebar and mobile nav`

---

## Task 18: Оновлення `database.types.ts` і документації

**Files:**
- Modify: `src/lib/database.types.ts` (через `npm run db:types`)
- Modify: `holostyak-tote/README.md`

- [ ] **Step 1:** `SUPABASE_PROJECT_ID=... npm run db:types`

- [ ] **Step 2:** README: Phase 6 позначити `[x]` після приймання; рядок про міграції `2026042912*` та `db push`.

- [ ] **Step 3:** Commit: `chore(types): regenerate for phase 6`

---

## Task 19: E2E Playwright

**Files:**
- Create: `tests/e2e/admin-phase6.spec.ts`

- [ ] **Step 1:** Тест «не-адмін не бачить адмінку» (вже частково в `AdminRoute` — розширити перевіркою одного з нових шляхів):

```ts
import { test, expect } from '@playwright/test'

test('non-admin cannot open admin audit page', async ({ page }) => {
  await page.goto('/admin/audit')
  await expect(page).toHaveURL(/\/(\?|$)/) // очікується редірект на головну або логін — узгодити з AdminRoute
})
```

  Підлаштувати під фактичну поведінку `AdminRoute` (редірект на `/`).

- [ ] **Step 2:** Тест з адмін-сесією **не** робити в CI без секретів; залишити `test.fixme` або `test.skip` з коментарем «потрібні тестові креденшли».

- [ ] **Step 3:** `npm run test:e2e`

- [ ] **Step 4:** Commit: `test(e2e): admin phase 6 smoke`

---

## Task 20 (опційно, post-MVP): Reauthentication

**Files:** нові компоненти `src/components/admin/ReauthModal.tsx` та зміни в `UserActionsPanel.tsx`, `AdminBroadcastPage.tsx`, `AdminUsersPage.tsx` (лише після перевірки підтримки `supabase.auth.reauthenticate()` у вашій версії `@supabase/supabase-js`)

- [ ] **Step 1:** Обгорнути виклики `admin_ban_user`, `admin_set_role`, `admin_broadcast_notification`, `grant_coins_manual` (якщо `abs(delta) > 10000`) у клієнтську модалку «Підтвердь акаунт» згідно скелету Phase 6 Task 16.

- [ ] **Step 2:** Не блокувати Phase 6 без цього кроку.

---

## Self-review

1. **Покриття §8:** 8.1 дашборд (Task 7, 9); 8.2/8.3 вже є episode/resolution — лише лінки з дашборду; 8.4 purchases — існує; 8.5 users — Task 11–12; 8.6 prizes — заглушка Task 16 до Phase 7; 8.7 settings — Task 15; 8.8 принципи — RPC + audit у всіх нових задачах; broadcast/audit/ban додатково зі скелету Phase 6.
2. **Плейсхолдери:** Немає «TBD» у критичних RPC; `admin_broadcast_notification` у Task 5 Step 3 описано алгоритмом (CTE + insert).
3. **Типи:** `admin_list_users` використовує `p_role_filter` замість `p_role`.
4. **Відомі зміни після Phase 5:** `notifications.metadata`, `mark_notification_read`, матеріалізовані лідерборди — після бану/масових подій за потреби викликати `refresh_leaderboards()` у RPC (опційно, окремий підпункт у broadcast після великих подій — YAGNI).

---

**План збережено в** `docs/superpowers/plans/2026-04-25-admin-panel-phase-6.md`. **Два варіанти виконання:**

**1. Subagent-Driven (рекомендовано)** — окремий субагент на кожну Task, ревʼю між задачами (`superpowers:subagent-driven-development`).

**2. Inline Execution** — виконання пакетами в одній сесії з чекпойнтами (`superpowers:executing-plans`).

**Який варіант обираєте?**
