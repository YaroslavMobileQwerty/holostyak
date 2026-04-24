# Season Prizes (Phase 7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Система призів сезону для топ-3: записи `season_prizes`, RPC `finalize_season` за зведеним рейтингом сезону, in-app нотифікації переможцям, публічна `/prizes` + форма доставки, адмін `/admin/prizes` зі статусами доставки та `admin_mark_prize_shipped`, модалка фіналізації сезону.

**Architecture:** Таблиця `season_prizes` **створюється в Phase 7** (у поточних міграціях `holostyak-tote` таблиці ще **немає**; дизайн у `2026-04-24-holostyak-tote-design.md` — орієнтир). Топ-3 **не** читаються з `leaderboard_season` materialized view напряму: view у `20260428120200_leaderboard_matviews.sql` прив’язаний до *одного* `season_id` (active / app_settings). `finalize_season(p_season_id)` повинен **перераховувати** агрегати `bets` + `episodes` для **конкретного** `p_season_id` тією ж логікою, що й MV (сума `payout` за `won`, кількості ставок/влучних, `accuracy` з `profiles.streak_best` + `created_at` для тайбрейку), у транзакції. Усі мутації `season_prizes` — **SECURITY DEFINER** RPC + `admin_audit_log`. Клієнтські форми: існуючий стек RHF + Zod (як `src/components/coins/PurchaseRequestForm.tsx` + `src/lib/schemas/purchaseRequest.ts`).

**Tech Stack:** React 19, Vite, TanStack Query, Supabase, Tailwind, Framer Motion (вже в проєкті), `react-hook-form` + `@hookform/resolvers` + `zod`, `sonner`, `vitest`, pgTAP у `supabase/tests/`, Playwright.

**Prereq:** Phase 5-6 змерджено; `refresh_leaderboards()` існує (`20260428120500`); `notifications` з `type`, `action_url`.

**Source specs:** [Phase 7 skeleton](/2026-04-24-phase-7-season-prizes.md) (repo root), [design §5/§6 season_prizes](/2026-04-24-holostyak-tote-design.md).

**Workspace root:** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260430120000_season_prizes_table.sql` | ENUM-типи, таблиця `season_prizes`, індекси, FK, унікальність `(season_id, place)` |
| `supabase/migrations/20260430120100_season_prizes_rpcs.sql` | `finalize_season`, `submit_delivery_form`, `admin_mark_prize_shipped`, `admin_set_secret_prize_description` (або винести в окремий timestamp-файл) |
| `supabase/migrations/20260430120200_season_prizes_rls.sql` | RLS-політики: SELECT owner/admin; ніяких прямих INSERT/UPDATE з клієнта |
| `supabase/tests/season_prizes.test.sql` | pgTAP: has_table, has_function, smoke |
| `src/lib/schemas/deliveryForm.ts` | Zod-схема + тип для JSON у RPC |
| `src/hooks/useMyPrizes.ts` | `from('season_prizes').select(...)` + профіль |
| `src/hooks/useSubmitDeliveryForm.ts` | `supabase.rpc('submit_delivery_form', …)` |
| `src/hooks/admin/useSeasonPrizes.ts` | admin list + filters |
| `src/hooks/admin/useFinalizeSeason.ts` | `finalize_season` |
| `src/hooks/admin/useMarkPrizeShipped.ts` | RPC shipped |
| `src/hooks/admin/useSetSecretPrizeDescription.ts` | RPC опис секрету |
| `src/components/prizes/TrophyBadge.tsx` | зол/сріб/бронза + анімації |
| `src/components/prizes/PrizeCard.tsx` | картка одного призу |
| `src/components/prizes/SecretPrizeRevealCard.tsx` | blur до `delivered` |
| `src/components/prizes/DeliveryFormModal.tsx` | RHF + Zod, умовні поля |
| `src/components/admin/SeasonFinalizeModal.tsx` | confirm «ФІНАЛ», preview топ-3 (RPC preview або read-only) |
| `src/components/admin/PrizesTable.tsx` | таблиця + фільтри |
| `src/components/admin/DeliveryAddressViewer.tsx` | копі в буфер, формат адреси |
| `src/pages/MyPrizesPage.tsx` | `/prizes` |
| `src/pages/admin/AdminPrizesPage.tsx` | заміна `AdminPrizesPlaceholderPage` |
| `src/pages/admin/AdminSeasonsPage.tsx` | кнопка «Фіналізувати» для `active` |
| `src/router.tsx` | маршрут `/prizes`, lazy admin |
| `src/lib/lazyRoutes.ts` | lazy `MyPrizesPage`, `AdminPrizesPage` |
| `src/lib/database.types.ts` | `npm run db:types` після push |
| `src/components/admin/AdminLayout.tsx` | посилання (без змін, якщо вже `/admin/prizes`) |
| `README.md` | Phase 7 `[x]`, нотатка `db push` + міграції `2026043012*` |
| `tests/e2e/season-prizes.spec.ts` | гість / smoke; admin — `test.fixme` + секрети |

---

## Топ-3: детерміноване сортування (усе в `finalize_season`)

База для ранжування (узгоджено з [Acceptance](/2026-04-24-phase-7-season-prizes.md) та agregat у MV):

- Первинно: `season_total_won` (сума `payout` для `bets.status = 'won'` у епізодах цього `season_id`).
- Тай: `accuracy` = `season_correct / season_bets` (як у MV, `0` якщо `season_bets = 0`).
- Далі: `profiles.streak_best` DESC, NULLS LAST.
- Далі: `profiles.created_at` ASC (стабільний тайбрейк).

**Узгодження з skeleton (Task 2):** якщо написано «accuracy → streak_best» без `total_won`, приймати acceptance criteria: **first key is season_total_won** (той самий показник, що й «total_won» у лідерборді).

**Edge case:** якщо в сезоні **менше ніж 3** користувачі з `bets` (won/lost), вставляти **N** рядків, `N = min(3, <кількість у агрегаті>)`. Якщо **0** рядків — `raise exception 'no_eligible_players'`.

**Re-finalize:** опційний параметр `p_force boolean default false`. Якщо `p_force` і вже існують `season_prizes` для `season_id` — `delete from season_prizes where season_id = p_season_id` перед вставкою (або `raise` без force). Ако сезон вже `finished` без `force` — `raise exception 'season_already_finalized'`.

---

## Task 0: Верифікація бази та гілки

**Files:** —

- [ ] **Step 1:** `cd holostyak-tote && npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build` — зелене.

- [ ] **Step 2:** Переконатися, що `grep -R "season_prizes" supabase/migrations` **не** знаходить таблицю (зараз — очікувано порожньо, окрім плану).

- [ ] **Step 3:** Прочитати `supabase/migrations/20260428120200_leaderboard_matviews.sql` (рядки 23–57) — зафіксувати поля `agg` / join до `profiles` для копі в RPC.

- [ ] **Step 4 (опційно):** Commit: `chore: verify baseline before phase 7`

---

## Task 1: Міграція — типи, таблиця `season_prizes`

**Files:**
- Create: `holostyak-tote/supabase/migrations/20260430120000_season_prizes_table.sql`

- [ ] **Step 1:** Створити enum-типи (або `text` + `check` — YAGNI; enum чистіше):

```sql
do $$ begin
  create type public.delivery_carrier as enum ('nova_poshta', 'ukr_poshta', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.prize_shipping_status as enum (
    'pending', 'awaiting_delivery', 'shipped', 'delivered'
  );
exception when duplicate_object then null; end $$;
```

- [ ] **Step 2:** Таблиця (ім’я колонок узгодити з [skeleton Task 1](/2026-04-24-phase-7-season-prizes.md) + `trophy_title` + FK):

```sql
create table public.season_prizes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  place int not null check (place in (1, 2, 3)),
  trophy_title text not null,
  delivery_first_name text,
  delivery_last_name text,
  delivery_phone text,
  delivery_carrier public.delivery_carrier,
  delivery_address text,
  delivery_city text,
  delivery_branch_number text,
  delivery_submitted_at timestamptz,
  shipping_status public.prize_shipping_status not null default 'pending',
  shipping_tracking_number text,
  secret_prize_description text, -- внутрішня нотатка адміна, не для гравця до delivered (див. UI)
  created_at timestamptz not null default now(),
  unique (season_id, place),
  unique (season_id, user_id)
);
create index season_prizes_user_idx on public.season_prizes (user_id);
create index season_prizes_season_idx on public.season_prizes (season_id);
```

- [ ] **Step 3:** `supabase db push` (локально) / застосувати на staging; перевірка `\d season_prizes`.

- [ ] **Step 4:** Commit: `feat(db): season_prizes table and enums`

---

## Task 2: RPC `finalize_season(p_season_id uuid, p_force boolean default false)`

**Files:**
- Create: `holostyak-tote/supabase/migrations/20260430120100_finalize_season_rpc.sql` (або злити з Task 3 у один файл `20260430120100_season_prizes_rpcs.sql` — DRY, один коміт RLS у Task 3 окремо)

- [ ] **Step 1:** Тіло функції: `is_admin()`; існування сезону; якщо `not p_force` і `exists (select 1 from season_prizes where season_id = p_season_id)` — exception; якщо `p_force` — `delete` існуючих рядків для сезону. Якщо `seasons.status = 'finished'` і не `p_force` — exception.

- [ ] **Step 2:** Оперативна вибірка топ-3 (копія агрегації з MV, фільтр `ep.season_id = p_season_id`):

```sql
-- у plpgsql, після "begin" та перевірок:
  perform public.refresh_leaderboards();  -- optional: оновити MV для публічного лідерборду; не для читання топу

  with agg as (
    select
      b.user_id,
      coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0)::bigint as season_total_won,
      count(*)::bigint as season_bets,
      count(*) filter (where b.status = 'won')::bigint as season_correct
    from public.bets b
    inner join public.bet_events be on be.id = b.event_id
    inner join public.episodes ep on ep.id = be.episode_id
    where ep.season_id = p_season_id
      and b.status in ('won', 'lost')
    group by b.user_id
  )
  select
    a.user_id,
    a.season_total_won,
    case
      when a.season_bets > 0
      then a.season_correct::double precision / a.season_bets::double precision
      else 0
    end as acc,
    p.streak_best,
    p.created_at
  from agg a
  inner join public.profiles p on p.id = a.user_id
  order by
    a.season_total_won desc,
    (case when a.season_bets > 0
          then a.season_correct::double precision / a.season_bets::double precision
          else 0 end) desc,
    p.streak_best desc nulls last,
    p.created_at asc
  limit 3;
```

Петля по результатах: `place := row_number 1..3`, `trophy_title` з констант:

| place | `trophy_title` |
|-------|----------------|
| 1 | `Чемпіон сезону` |
| 2 | `Срібний прогнозист` |
| 3 | `Бронзовий призер` |

- [ ] **Step 3:** `insert into season_prizes (...)`; `update seasons set status = 'finished', ends_at = coalesce(ends_at, now()) where id = p_season_id`.

- [ ] **Step 4:** Для кожного з топ-3: `insert into notifications (user_id, type, title, body, action_url) values (..., 'season_prize_won', '...', '...', '/prizes')` (тексти українською, як у проєкті).

- [ ] **Step 5:** Нотифікації всім admin: `insert into notifications` для кожного `id` з `profiles where role = 'admin'`, `type` напр. `admin_prize_season_finalized` з `jsonb` у `body` / окремо поле `metadata` — якщо `metadata` вже є в таблиці з Phase 5, використати його; інакше короткий `body` + `action_url` `/admin/prizes`.

- [ ] **Step 6:** `insert into admin_audit_log (admin_id, action, target_type, target_id, payload)` — `action = 'season_finalized'`, `target_id = p_season_id`, `payload` з масивом `user_id` + `place`.

- [ ] **Step 7:** `returns jsonb` — `jsonb_build_object('prizes', jsonb_agg_row...)`.

- [ ] **Step 8:** `grant execute` на `authenticated`.

- [ ] **Step 9:** `commit` + `db push` + Commit: `feat(db): finalize_season rpc`

**Примітка (транзакції):** `create or replace function ... language plpgsql` — одна транзакція на виклик. Для `SERIALIZABLE` / explicit lock — опційно `set transaction isolation level serializable;` **не** з функції; краще `lock table season_prizes in exclusive mode` (коротко) — лише якщо ловите race; YAGNI — почати з default isolation.

---

## Task 2b: RPC `preview_finalize_season(p_season_id uuid) returns jsonb` (тільки admin)

**Files:** same migration file, перед або після `finalize_season`

- [ ] **Step 1:** Копія `select` з топ-3 **без** вставок; `returns` JSON масиву `{ user_id, nickname, place_preview }` (place_preview = 1..3 order).

- [ ] **Step 2:** Використати в `SeasonFinalizeModal` для прев’ю. Commit у той самий, що `finalize` або: `chore(db): preview_finalize_season`

---

## Task 3: RPC `submit_delivery_form` та `admin_mark_prize_shipped` (+ опис секрету)

**Files:**
- Create / append: `holostyak-tote/supabase/migrations/20260430120100_season_prizes_rpcs.sql` (або `20260430120300_...` якщо split)

- [ ] **Step 1 — `submit_delivery_form(p_prize_id uuid, p_form jsonb)` security definer:**

  - `auth.uid() = season_prizes.user_id`
  - `delivery_submitted_at is null` (інакше exception `delivery_already_submitted`)
  - Розпакувати `p_form` (ключі фіксовані — нижче в Zod) у колонки `delivery_*`, `shipping_status` → `awaiting_delivery`, `delivery_submitted_at = now()`
  - `insert notifications` — усім `admin` з `type = 'prize_delivery_submitted'`, `action_url` `/admin/prizes`
  - `admin_audit_log` `action = 'prize_delivery_submitted'`, `target_id = p_prize_id`

- [ ] **Step 2 — `admin_mark_prize_shipped(p_prize_id uuid, p_tracking text)` security definer:**

  - `is_admin()`
  - `update season_prizes set shipping_status = 'shipped', shipping_tracking_number = nullif(trim(p_tracking),''), ...` (якщо потрібно `shipped_at timestamptz` — додати колонку в Task 1 або пропустити YAGNI)
  - `insert into notifications` для `user_id` власника: `type = 'prize_shipped'`, body з tracking, `action_url` `/prizes`
  - audit

- [ ] **Step 3 — `admin_set_secret_prize_description(p_prize_id uuid, p_description text)` security definer:**

  - `is_admin()`; `update season_prizes set secret_prize_description = left(trim(p_description), 2000) where id = p_prize_id`; audit

- [ ] **Step 4 (опційно) — `admin_set_prize_delivered(p_prize_id uuid)`** — `shipping_status = 'delivered'`, notif user **«секретний приз розкрито»**; якщо YAGNI — кнопка в адмін-UI лише `shipped` + юзер бачить track; `delivered` виставляє адмін після доставки.

- [ ] **Step 5:** `grant execute` всіх нових RPC до `authenticated`.

- [ ] **Step 6:** Commit: `feat(db): delivery and shipping prize rpcs`

JSON ключі `p_form` (узгодити з `deliveryFormSchema` в Task 7):

```json
{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "carrier": "nova_poshta | ukr_poshta | manual",
  "address": "string or null",
  "city": "string or null",
  "branch_number": "string or null"
}
```

---

## Task 4: RLS `season_prizes`

**Files:**
- Create: `holostyak-tote/supabase/migrations/20260430120200_season_prizes_rls.sql`

- [ ] **Step 1:** `alter table public.season_prizes enable row level security;`

- [ ] **Step 2:** Політики:
  - `select`: `(user_id = auth.uid()) or public.is_admin()`
  - **немає** `insert` / `update` / `delete` для `authenticated` — лише `service_role` (не видавайте клієнту `service_role`)

- [ ] **Step 3:** Commit: `feat(db): season_prizes rls policies`

**Тест (концепт):** pgTap або вручну: anon не читає чужі рядки; користувач — лише свої; admin — усі.

---

## Task 5: pgTAP

**Files:**
- Create: `holostyak-tote/supabase/tests/season_prizes.test.sql`

- [ ] **Step 1:** `has_table('season_prizes')`, `has_function` для `finalize_season`, `submit_delivery_form`, `admin_mark_prize_shipped`, `preview_finalize_season` (якщо додали).

- [ ] **Step 2:** Commit: `test(db): season_prizes pgtap smoke`

**Примітка:** Повна інтеграційна pgtap з тест-даними (3 профілі + bets) — окремо тяжка; винести в `supabase/tests/season_prizes_finalize.test.sql` з `begin;` / `rollback;` + seed, якщо команда дозволяє `supabase test db` у CI.

---

## Task 6: Клієнт — Zod + `useMyPrizes` + `useSubmitDeliveryForm`

**Files:**
- Create: `holostyak-tote/src/lib/schemas/deliveryForm.ts`
- Create: `holostyak-tote/src/hooks/useMyPrizes.ts`
- Create: `holostyak-tote/src/hooks/useSubmitDeliveryForm.ts`

- [ ] **Step 1:** Zod (умовна валідація як у [Task 7 skeleton](/2026-04-24-phase-7-season-prizes.md)):

```ts
// holostyak-tote/src/lib/schemas/deliveryForm.ts
import { z } from 'zod'

const ukrPhone = z.string().regex(/^\+380\d{9}$/, 'Формат +380…')

export const deliveryFormBaseSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: ukrPhone,
  carrier: z.enum(['nova_poshta', 'ukr_poshta', 'manual']),
  city: z.string().min(1).max(120).optional().nullable(),
  address: z.string().min(1).max(500).optional().nullable(),
  branchNumber: z.string().max(32).optional().nullable(),
})

export type DeliveryFormValues = z.infer<typeof deliveryFormBaseSchema>

export function parseDeliveryToRpcJson(v: DeliveryFormValues) {
  return {
    first_name: v.firstName,
    last_name: v.lastName,
    phone: v.phone,
    carrier: v.carrier,
    address: v.address ?? null,
    city: v.city ?? null,
    branch_number: v.branchNumber ?? null,
  }
}
```

Додайте `superRefine` / `refine`: якщо `nova_poshta` — потрібні `city` + `branchNumber`; `ukr_poshta` — `address` (повна) + (опц.) index у `address`; `manual` — `address` (довільний текст) — **уточнити** в кроці 1 і **закодити** у schema.

- [ ] **Step 2:** `useMyPrizes` — `supabase.from('season_prizes').select('*, seasons(number, title)')` або join `.eq('user_id', user.id)`; увімкнути `enabled: !!user`.

- [ ] **Step 3:** `useSubmitDeliveryForm` — `supabase.rpc('submit_delivery_form', { p_prize_id, p_form })` + `queryClient.invalidateQueries({ queryKey: ['myPrizes'] })`

- [ ] **Step 4:** `npm run typecheck`

- [ ] **Step 5:** Commit: `feat: hooks and schema for season prizes delivery`

---

## Task 7: UI компоненти — TrophyBadge, PrizeCard, SecretPrizeRevealCard, DeliveryFormModal

**Files:**
- Create under `src/components/prizes/`

- [ ] **Step 1:** `TrophyBadge.tsx` — props `place: 1|2|3`; Tailwind: gold/silver/bronze; Framer `motion` — легке `shimmer` / `rotate` on hover (як [Task 11 skeleton](/2026-04-24-phase-7-season-prizes.md)); без нових пакетів, якщо `motion` вже в bundle.

- [ ] **Step 2:** `SecretPrizeRevealCard` — до `shipping_status === 'delivered'`: плейсхолдер «🎁» + blur; після: показати `secret_prize_description` (якщо політика — показ **лише** після `delivered`; **не** показуйте `secret` до достав — то внутрішнє; для гравця після `delivered` адмін вже ввів зміст) — **узгодити** з product: варіант A: опис після `delivered` в UI; варіант B: суто UI «текст отримаш у посиланні» — вибрати A для acceptance «Секретний приз».

- [ ] **Step 3:** `DeliveryFormModal` — RHF, `zodResolver(deliveryFormSchemaWithRefine)`, `Dialog` (якщо є shadcn dialog — перевір `src/components/ui`); `onSubmit` виклик `useSubmitDeliveryForm` + `toast` українською (як `PurchaseRequestForm`).

- [ ] **Step 4:** `PrizeCard` — складає TrophyBadge + заголовок + CTA + статус; проп `onOpenDelivery`.

- [ ] **Step 5:** Сторінка (див. Task 8) — підключити.

- [ ] **Step 6:** Commit: `feat(ui): prize components and delivery modal`

---

## Task 8: Сторінка `/prizes` + маршрут

**Files:**
- Create: `holostyak-tote/src/pages/MyPrizesPage.tsx`
- Modify: `holostyak-tote/src/router.tsx` (публічні children під `RootLayout` — **auth gate** для вмісту: як `ProfilePage` / `useAuth` + `Navigate`); якщо гість — заклик залогінитись, як `AchievementsPage`
- Modify: `holostyak-tote/src/lib/lazyRoutes.ts`

- [ ] **Step 1:** `MyPrizesPage` — `useMyPrizes`; пусто: «Ще немає призів»; список `PrizeCard`.

- [ ] **Step 2:** Додати лінк у хедер/меню, якщо в дизайні є пункт «Призи» — **перевір** `src/components/layout` header nav; додайте `to="/prizes"` лише для `authenticated` або завжди з редіректом на логін (узгодити з UX Phase 1–6).

- [ ] **Step 3:** `npm run build`

- [ ] **Step 4:** Commit: `feat: my prizes page at /prizes`

---

## Task 9: Адмін — `AdminPrizesPage` + `PrizesTable` + `DeliveryAddressViewer` + `SeasonFinalizeModal` + `AdminSeasonsPage`

**Files:**
- Create: `holostyak-tote/src/pages/admin/AdminPrizesPage.tsx` (заміна `AdminPrizesPlaceholderPage`)
- Create: `src/components/admin/PrizesTable.tsx`, `DeliveryAddressViewer.tsx`, `SeasonFinalizeModal.tsx`
- Create: `src/hooks/admin/useSeasonPrizes.ts`, `useMarkPrizeShipped.ts`, `useSetSecretPrizeDescription.ts`, `useFinalizeSeason.ts` / `usePreviewFinalizeSeason`
- Modify: `src/lib/lazyRoutes.ts` (lazy імпорт нової сторінки, видалити placeholder)
- Modify: `src/pages/admin/AdminSeasonsPage.tsx` — кнопка + модалка (лише для `season.status === 'active'`)
- Modify: `src/components/admin/AdminLayout.tsx` — без змін, якщо path той самий

- [ ] **Step 1:** `useSeasonPrizes` — `from('season_prizes').select('*, user:profiles!season_prizes_user_id_fkey(nickname), season:seasons!…')` — підставити **реальні** FK-імена з `database.types` після `db:types` або `.select` з явним join як у PostgREST.

- [ ] **Step 2:** `PrizesTable` — фільтри: `season` (select з `useAdminSeasons` або `from('seasons')`), `place`, `shipping_status`.

- [ ] **Step 3:** `DeliveryAddressViewer` — форматування рядка адреси + `navigator.clipboard.writeText` + `toast('Скопійовано')`.

- [ ] **Step 4:** `Drawer` / `Dialog` на клік: поля + `Textarea` для `secret_prize_description` (RPC) + `Input` tracking + кнопка «Відправлено» (`admin_mark_prize_shipped`) + опц. «Доставлено» (`admin_set_prize_delivered`).

- [ ] **Step 5:** `SeasonFinalizeModal` — `useQuery` на `preview_finalize_season` (якщо додана); **обов’язкове** підтвердження: `window.prompt` або `input` з точним `ФІНАЛ` (як skeleton Task 9); `mutate` `finalize_season({ p_season_id, p_force: false })` — аргументи **snake_case** для supabase.

- [ ] **Step 6:** Help-блок (Task 13 skeleton) — чеклист на сторінці `AdminPrizesPage`.

- [ ] **Step 7:** `npm run lint` + `npm run typecheck`

- [ ] **Step 8:** Commit: `feat(admin): prizes table, delivery viewer, season finalize`

---

## Task 10: Типи + README

**Files:**
- `holostyak-tote/src/lib/database.types.ts` (реген: `SUPABASE_PROJECT_ID=… npm run db:types` після `db push`)
- `holostyak-tote/README.md`

- [ ] **Step 1:** Після `db push` на проєкт з усіма міграціями: `db:types`.

- [ ] **Step 2:** README: Phase 7 `[x]`; рядок `supabase db push` і міграції `2026043012*`.

- [ ] **Step 3:** Commit: `chore: types and readme for phase 7`

---

## Task 11: E2E + тег (опційно)

**Files:**
- `holostyak-tote/tests/e2e/season-prizes.spec.ts`

- [ ] **Step 1:** Тест: гість `/prizes` → логін або публічна заглушка (узгодити з Task 8).

- [ ] **Step 2:** `test.fixme` — повний сценарій з [Task 12 skeleton](/2026-04-24-phase-7-season-prizes.md) + коментар «потрібні test admin + seed».

- [ ] **Step 3:** `npx playwright test` — зелене локально.

- [ ] **Step 4:** Commit: `test(e2e): season prizes smoke`

- [ ] **Step 5 (опційно):** `git tag phase-7-complete` після мерду в `main` (як [Acceptance](/2026-04-24-phase-7-season-prizes.md)).

---

## Task 12 (post-MVP / optional): Resend + Edge

**Files:** (не додавати, доки не затверджено)

- [ ] **Step 1:** Supabase Edge Function, тригер на `notifications` або `webhook` — **лише** якщо є `VITE_` / secrets Resend. Документувати в `docs/resend-*.md` (не створювати випадково, якщо user не просив).

- [ ] **Step 2:** Коли in-app OK — **YAGNI**.

---

## Task 13: Plausible (фаза 8 зауважка)

- [ ] **Step 1:** Подія `plausible('prize_won', { props: { place }})` після **зчитання** `season_prizes` на `MyPrizesPage` (або один раз per mount) — **або** відкласти на Phase 8 згідно [phase-8 plan](holostyak-tote/docs/superpowers/plans/2026-04-25-phase-8-motion-polish.md). Не дублювати, якщо Phase 8 вже додає `prize_won` глобально.

---

## Self-review

1. **Spec coverage (skeleton + design + acceptance):** `season_prizes` (створення + доставка + RLS) → Tasks 1–4; `finalize` + нотифікації + audit → Task 2; `submit` + `shipped` → Task 3; публічна `/prizes` + CTA + статус + секрет після `delivered` → Tasks 6–8; admin таблиця + копі + tracking + secret → Task 9; тайбрейк → в Task 2 SQL; `ties` + `delivered` + tracking notif → Tasks 2–3; E2E/docs/tag → Task 11; Resend → optional Task 12; кнопка фіналізації в `/admin/seasons` → Task 9.
2. **Placeholder scan:** Усі кроки з прикладами SQL/TS; RLS/edge cases (N&lt;3, force, 0 bettors) зазначено.
3. **Type consistency:** JSON ключі `p_form` = snake_case в RPC; Zod = camelCase + `parseDeliveryToRpcJson` — один mapping у Task 6.
4. **Gap виправлено:** Таблиця **не** існувала в міграціях — план явно **створює** її, а не тільки «enhancements».

---

## Execution handoff

**Plan complete and saved to** `holostyak-tote/docs/superpowers/plans/2026-04-25-season-prizes-phase-7.md`. **Two execution options:**

1. **Subagent-Driven (recommended)** — окремий субагент на кожну Task, рев’ю між задачами (`superpowers:subagent-driven-development`).

2. **Inline Execution** — виконання пакетами в одній сесії з чекпойнтами (`superpowers:executing-plans`).

**Which approach?**

---

## Рекомендований порядок комітів (коротко)

1. `feat(db): season_prizes table and enums`  
2. `feat(db): finalize_season rpc` + preview (опц. окремо)  
3. `feat(db): delivery and shipping prize rpcs`  
4. `feat(db): season_prizes rls`  
5. `test(db): season pgtap`  
6. `feat: hooks, schema, /prizes, prize components`  
7. `feat(admin): replace prizes placeholder, finalize modal`  
8. `chore: types, readme, e2e`  
9. `tag phase-7-complete` (на гілці main після review)
