# Social / Gamification (Phase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реалізувати лідерборди (глобальний / сезонний / тижневий), публічні профілі за нікнеймом, **усі досягнення з [§17](../../../2026-04-24-holostyak-tote-design.md#17-список-досягнень--бейджів-стандартний-набір)** (у таблицях §17 — **22** рядки з умовами; заголовок «20» у скелеті застарілий), in-app сповіщення з дзвінком у хедері, порівняння «я vs інший» на публічному профілі, і єдину серверну функцію нарахування бейджів після змін стану.

**Architecture:** Таблиці `achievements` та `user_achievements` за [§5.5](../../../2026-04-24-holostyak-tote-design.md#55-соц-та-гейміфікація). Таблиця `notifications` **вже існує** (`20260425120000_coin_economy_core.sql`) з полями `type`, `title`, `body`, `is_read` — **не** `read_at`; додати опційні `action_url`, `metadata jsonb` для deep links. Єдина `SECURITY DEFINER` функція `evaluate_user_achievements(p_user_id uuid) returns text[]` повертає коди **щойно** виданих бейджів; кожен INSERT у `user_achievements` супроводжується INSERT у `notifications` (`type = 'achievement_unlocked'`). Виклики: після логіки в `resolve_bet_event`, `approve_purchase_request`, `grant_coins_manual`, `place_bet` (мінімум для `first_bet` / lightning), та тригер на `profiles` (для `profile_complete`). Матеріалізовані представлення для лідерборду + `REFRESH MATERIALIZED VIEW CONCURRENTLY` (унікальний індекс на `user_id`). Сезонні/тижневі бейджі `season_top1` / `season_top3` — окрема функція `award_season_leaderboard_achievements(p_season_id)` з тригера при `seasons.status` → `finished` (або виклик з адмінського флоу завершення сезону). **Продуктова нотка:** умови `donor_1000` / `donor_5000` у §17 у гривнях; у БД `coin_purchase_requests.approved_amount` у **балах** — у плані зафіксовано поріг у балах або окремий ключ `app_settings` після узгодження з замовником (див. Task 3).

**Tech Stack:** `holostyak-tote` (React 19, Vite 8, TanStack Query 5, Supabase JS v2, Tailwind 4, Vitest, Playwright), існуючі `src/lib/supabase.ts`, `PublicHeader.tsx`, `LeaderboardPage.tsx` (placeholder), `ProfilePage.tsx`, `router.tsx`, міграції у `supabase/migrations/`.

**Prereq:** Фази 2–4 накочені на середовище; `profiles`, `bets`, `bet_events`, `episodes`, `coin_purchase_requests`, `resolve_bet_event` існують.

**Spec delta:** Скелет [../../../2026-04-24-phase-5-social-gamification.md](../../../2026-04-24-phase-5-social-gamification.md) згадує `read_at` для notifications — у кодовій базі використовується **`is_read`**. Скелет називає `check_and_award_achievements` — у дизайні [§10/689](../../../2026-04-24-holostyak-tote-design.md) — **`evaluate_user_achievements`**; у плані використовуємо ім’я з дизайну. Поле `tier` у seed — для UI (кольори), узгоджене з категоріями §17.

**Workspace root:** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `supabase/migrations/20260428120000_achievements_core.sql` | `achievements`, `user_achievements`; `notifications` ALTER; індекси |
| `supabase/migrations/20260428120100_achievements_seed.sql` | INSERT 20 рядків з §17 |
| `supabase/migrations/20260428120200_leaderboard_matviews.sql` | `leaderboard_all_time`, `leaderboard_season`, `leaderboard_week` + UNIQUE indexes |
| `supabase/migrations/20260428120300_evaluate_achievements.sql` | `evaluate_user_achievements`, `award_season_leaderboard_achievements`, тригери |
| `supabase/migrations/20260428120400_achievements_rls.sql` | RLS `achievements`, `user_achievements`; policy `notifications` UPDATE own `is_read` |
| `supabase/migrations/20260428120500_leaderboard_refresh_notes.sql` | Коментарі / опційний pg_cron для REFRESH CONCURRENTLY |
| `supabase/migrations/20260428120600_integrate_evaluate_into_rpc.sql` | Зміни `resolve_bet_event`, `place_bet`, `approve_purchase_request`, `grant_coins_manual` |
| `supabase/tests/achievements_eval.test.sql` | pgTAP: наявність функцій / таблиць / race insert |
| `src/hooks/useLeaderboard.ts` | Таби all / season / week → запити до mat views через `.from()` якщо exposed, інакше RPC `get_leaderboard` |
| `src/hooks/usePublicProfile.ts` | Профіль за `nickname` + публічні поля |
| `src/hooks/useMyAchievements.ts` | Join `achievements` + `user_achievements` для поточного юзера |
| `src/hooks/useNotifications.ts` | Список + unread count |
| `src/hooks/useMarkNotificationRead.ts` | `update notifications set is_read = true` |
| `src/components/social/*` | Leaderboard, avatar, achievements grid |
| `src/components/notifications/*` | Bell, dropdown, item |
| `src/pages/LeaderboardPage.tsx` | Повна заміна placeholder |
| `src/pages/PublicProfilePage.tsx` | Маршрут `/@:nickname` або `/u/:nickname` |
| `src/pages/AchievementsPage.tsx` | `/achievements` |
| `src/pages/ProfilePage.tsx` | Preview + лінк на досягнення |
| `src/components/layout/PublicHeader.tsx` | `NotificationsBell` |
| `src/router.tsx` | Нові маршрути |
| `src/lib/formatAccuracy.ts` | Чиста функція для unit-тесту |
| `tests/unit/social/formatAccuracy.test.ts` | Unit |
| `tests/e2e/achievements-flow.spec.ts` | Скелет (skip до seed) |
| `src/lib/database.types.ts` | Після `npm run db:types` |
| `holostyak-tote/README.md` | Phase 5 `[x]` після приймання |

---

## Task 0: Верифікація гілки

**Files:** —

- [ ] **Step 1:** `cd holostyak-tote && npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build` — очікувано: зелене.

- [ ] **Step 2:** Переконатися, що `supabase db push` на staging містить міграції до `2026042712*` включно.

---

## Task 1: Міграція `achievements` + `user_achievements` + розширення `notifications`

**Files:**
- Create: `supabase/migrations/20260428120000_achievements_core.sql`

- [ ] **Step 1:** Додати таблиці та ALTER (узгоджено з [§5.5](../../../2026-04-24-holostyak-tote-design.md); `achievement_id` FK на `achievements.id`):

```sql
-- achievements: id = код з §17 (text PK)
create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text,
  icon_url text,
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  category text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index user_achievements_user_idx on public.user_achievements (user_id, unlocked_at desc);

alter table public.notifications
  add column if not exists action_url text,
  add column if not exists metadata jsonb;

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where is_read = false;
```

- [ ] **Step 2:** `supabase db push` (локально/staging), перевірка `\d public.achievements`.

- [ ] **Step 3:** Commit: `feat(db): achievements tables and notifications columns`

---

## Task 2: Seed — 20 досягнень §17

**Files:**
- Create: `supabase/migrations/20260428120100_achievements_seed.sql`

- [ ] **Step 1:** Вставити **22** рядки — повний перелік `id` з таблиць §17 (приклад нижче; узгодити `description` з копірайтом):

```sql
insert into public.achievements (id, title, description, icon, tier, category, sort_order) values
  ('first_bet', 'Перший крок', 'Зробити першу ставку', '🎯', 'bronze', 'onboarding', 1),
  ('first_win', 'Перша перемога', 'Виграти першу ставку', '🏆', 'bronze', 'onboarding', 2),
  ('profile_complete', 'Свій чоловік', 'Унікальний нік та аватар', '👤', 'bronze', 'onboarding', 3),
  ('donor_first', 'Підтримав ЗСУ', 'Перший підтверджений донат', '💛', 'bronze', 'onboarding', 4),
  ('total_bets_10', 'Активний', 'Зробити 10 ставок', '📊', 'silver', 'volume', 5),
  ('total_bets_50', 'Постійний', 'Зробити 50 ставок', '📈', 'silver', 'volume', 6),
  ('total_bets_100', 'Легенда', 'Зробити 100 ставок', '⭐', 'gold', 'volume', 7),
  ('loyal_full_season', 'Вірний фанат', 'Ставки на всі випуски сезону', '🎬', 'gold', 'volume', 8),
  ('streak_3', 'Запал', '3 виграшні ставки поспіль', '🔥', 'silver', 'streaks', 9),
  ('streak_5', 'На хвилі', '5 виграшних ставок поспіль', '🔥', 'gold', 'streaks', 10),
  ('streak_10', 'Непереможний', '10 виграшних ставок поспіль', '⚡', 'platinum', 'streaks', 11),
  ('underdog_winner', 'Темна конячка', 'Виграш з коефіцієнтом від 5.0', '🐎', 'gold', 'skill', 12),
  ('high_roller_1000', 'Ва-банк', 'Ставка від 1000 балів і виграш', '💰', 'gold', 'skill', 13),
  ('perfect_episode', 'Ясновидець', 'Усі ваші ставки у випуску виграшні', '🔮', 'platinum', 'skill', 14),
  ('lightning_first', 'Блискавка', 'Перша ставка на lightning-подію', '⚡', 'bronze', 'lightning', 15),
  ('lightning_won', 'Швидкі гроші', 'Виграшна lightning-ставка', '💸', 'silver', 'lightning', 16),
  ('lightning_hunter', 'Мисливець', '10 ставок на lightning-події', '🎯', 'gold', 'lightning', 17),
  ('season_winner_predicted', 'Пророк', 'Вгадано переможницю сезону', '👑', 'platinum', 'season', 18),
  ('season_top3', 'П''єдестал', 'Топ-3 сезонного лідерборду', '🥉', 'gold', 'season', 19),
  ('season_top1', 'Чемпіон', '1 місце сезонного лідерборду', '🥇', 'platinum', 'season', 20),
  ('donor_1000', 'Меценат', 'Сумарно 1000+ одиниць підтверджених донатів', '💎', 'gold', 'donor', 21),
  ('donor_5000', 'Філантроп', 'Сумарно 5000+ одиниць підтверджених донатів', '✨', 'platinum', 'donor', 22)
on conflict (id) do nothing;
```

**Увага:** приклад вище містить **22** `values` — відповідає сумі категорій у §17 (4+4+3+3+3+3+2). Перед комітом звірити дослівно з [§17](../../../2026-04-24-holostyak-tote-design.md#17-список-досягнень--бейджів-стандартний-набір).

- [ ] **Step 2:** `supabase db push`; `select count(*) from achievements;` очікувано **22**.

- [ ] **Step 3:** Commit: `feat(db): seed achievements from design §17`

---

## Task 3: Матеріалізовані представлення лідерборду

**Files:**
- Create: `supabase/migrations/20260428120200_leaderboard_matviews.sql`

- [ ] **Step 1:** `leaderboard_all_time` (як у скелеті фази 5), **UNIQUE (user_id)**:

```sql
drop materialized view if exists public.leaderboard_all_time;
create materialized view public.leaderboard_all_time as
select
  p.id as user_id,
  p.nickname,
  p.avatar_url,
  p.total_won,
  p.total_bets,
  p.correct_bets,
  case when p.total_bets > 0 then p.correct_bets::double precision / p.total_bets else 0 end as accuracy,
  p.streak_best,
  rank() over (order by p.total_won desc nulls last) as rank_by_won
from public.profiles p
where p.total_bets > 0;

create unique index leaderboard_all_time_user_id_uidx on public.leaderboard_all_time (user_id);
```

- [ ] **Step 2:** `leaderboard_season` — агрегати з `bets` + `bet_events` + `episodes` для `season_id = (select (value->>'id')::uuid from app_settings where key = 'active_season_id' limit 1)`; якщо ключа немає — порожній результат або fallback `seasons` з `status = 'active'`. Колонки: `user_id`, `nickname`, `avatar_url`, `season_total_won`, `season_bets`, `season_correct`, `accuracy`, `rank_by_won`. **UNIQUE (user_id)**.

- [ ] **Step 3:** `leaderboard_week` — ті самі агрегати, фільтр `coalesce(b.settled_at, b.placed_at)` у поточному ISO-тижні (`date_trunc('week', timestamptz 'now()')`). **UNIQUE (user_id)**.

- [ ] **Step 4:** Початковий `refresh materialized view public.leaderboard_all_time;` (без concurrently для першого прогону), потім документувати CONCURRENTLY після унікальних індексів.

- [ ] **Step 5:** Commit: `feat(db): leaderboard materialized views`

---

## Task 4: `evaluate_user_achievements` + сезонні нагороди

**Files:**
- Create: `supabase/migrations/20260428120300_evaluate_achievements.sql`

- [ ] **Step 1:** Реалізувати `public.evaluate_user_achievements(p_user_id uuid) returns text[]` — `security definer`, `set search_path = public`. Для кожного `achievements.id` перевірка умови §17; якщо виконано — `insert into user_achievements ... on conflict do nothing`; якщо **додано рядок** (`GET DIAGNOSTICS ... ROW_COUNT`) — `insert into notifications (user_id, type, title, body, metadata)` з `metadata = jsonb_build_object('achievement_id', ...)`. Додати до масиву результату `v_codes`.

- [ ] **Step 2:** Умови (мінімальний набір логіки; деталізувати в SQL):
  - `first_bet` / `first_win`: з `bets`
  - `total_bets_*`: `count(*)` з `bets`
  - `streak_*`: `profiles.streak_best`
  - `underdog_winner`: існує `bets` won з `odds_snapshot >= 5`
  - `high_roller_1000`: won bet з `amount >= 1000`
  - `lightning_*`: join `bet_events` де `type = 'lightning'`
  - `donor_first`, `donor_1000`, `donor_5000`: `coin_purchase_requests` status `approved`, сума `approved_amount`
  - `profile_complete`: `nickname is not null` та `avatar_url is not null` (і unique nickname вже в схемі)
  - `loyal_full_season`, `perfect_episode`, `season_winner_predicted`: окремі підзапити (епізоди сезону, події типу `season_winner`)

- [ ] **Step 3:** Функція `award_season_leaderboard_achievements(p_season_id uuid)` — після `REFRESH` сезонного MV або розрахунку rank у межах сезону присвоїти `season_top1`, `season_top3` користувачам з відповідними рангами; виклик з тригера `AFTER UPDATE OF status ON seasons WHEN NEW.status = 'finished'`.

- [ ] **Step 4:** Тригер `AFTER UPDATE OF nickname, avatar_url ON profiles` — `perform evaluate_user_achievements(new.id)`.

- [ ] **Step 5:** Commit: `feat(db): evaluate_user_achievements and season awards`

---

## Task 5: Інтеграція в існуючі RPC

**Files:**
- Create: `supabase/migrations/20260428120600_integrate_evaluate_into_rpc.sql`

- [ ] **Step 1:** У `resolve_bet_event` після циклу оновлення профілів для кожного `v_uid` що брав участь у події: `v_ach := evaluate_user_achievements(v_uid);` акумулювати в `jsonb` або повертати в `return jsonb_build_object(..., 'new_achievements', v_all_codes)`.

- [ ] **Step 2:** У `place_bet` перед `return v_bet_id`: `perform evaluate_user_achievements(v_uid);` (клієнт може опитати профіль / досягнення; опційно розширити return тип place_bet у наступній ітерації).

- [ ] **Step 3:** У `approve_purchase_request` після успішного нарахування: `perform evaluate_user_achievements(v_uid);`.

- [ ] **Step 4:** У `grant_coins_manual` після insert транзакції: `perform evaluate_user_achievements(target_user_id);`.

- [ ] **Step 5:** `grant execute` не змінювати для anon; перевірити, що `evaluate_user_achievements` **не** `grant` клієнту (лише внутрішній виклик).

- [ ] **Step 6:** Commit: `feat(db): wire evaluate_user_achievements into RPCs`

---

## Task 6: RLS та оновлення сповіщень

**Files:**
- Create: `supabase/migrations/20260428120400_achievements_rls.sql`

- [ ] **Step 1:** `alter table achievements enable row level security;` — policy `select` для `anon, authenticated` using `(true)`.

- [ ] **Step 2:** `user_achievements` — `select` для всіх `using (true)` (публічні профілі); **без** insert/update/delete для ролей клієнта.

- [ ] **Step 3:** `notifications` — додати policy `update` для `authenticated`: `using (auth.uid() = user_id) with check (auth.uid() = user_id and is_read = true)` або дозволити лише зміну `is_read` через `with check` обмеження (Supabase: два стовпці — використати RPC `mark_notification_read` якщо простіше).

- [ ] **Step 4:** Commit: `feat(db): RLS for achievements and notification read`

---

## Task 7: Опційний cron / RPC refresh лідербордів

**Files:**
- Create: `supabase/migrations/20260428120500_leaderboard_refresh_notes.sql`

- [ ] **Step 1:** Створити `public.refresh_leaderboards()` returns void — `security definer`, послідовно `refresh materialized view concurrently` для трьох view (у `exception` when others — fallback без concurrently для першого запуску).

- [ ] **Step 2:** Закоментовані рядки `pg_cron` (як у фазі 4).

- [ ] **Step 3:** Commit: `chore(db): leaderboard refresh helper and cron notes`

---

## Task 8: pgTAP тести

**Files:**
- Create: `supabase/tests/achievements_eval.test.sql`

- [ ] **Step 1:**

```sql
begin;
select plan(5);
select has_table('public'::name, 'achievements'::name);
select has_table('public'::name, 'user_achievements'::name);
select has_function('public'::name, 'evaluate_user_achievements', array['uuid']::name[]);
select has_materialized_view('public'::name, 'leaderboard_all_time'::name);
select ok(true, 'placeholder race test — розширити після імплементації');
select * from finish();
rollback;
```

- [ ] **Step 2:** Додати в CI документацію або існуючий `npm` скрипт, якщо `supabase db test` уже налаштований.

- [ ] **Step 3:** Commit: `test(db): achievements schema pgTAP`

---

## Task 9: Хуки даних клієнта

**Files:**
- Create: `src/hooks/useLeaderboard.ts`
- Create: `src/hooks/usePublicProfile.ts`
- Create: `src/hooks/useMyAchievements.ts`
- Create: `src/hooks/useNotifications.ts`
- Create: `src/hooks/useMarkNotificationRead.ts`

- [ ] **Step 1:** `useLeaderboard(scope: 'all' | 'season' | 'week')` — `from('leaderboard_all_time').select('*').order('rank_by_won').limit(100)` (імена mat view мають бути в `Database` types після `db:types`). Якщо PostgREST не експонує mat view без grant: `grant select on public.leaderboard_all_time to anon, authenticated` у міграції.

- [ ] **Step 2:** `usePublicProfile(nickname)` — `from('profiles').select('id, nickname, avatar_url, created_at, total_won, total_bets, correct_bets, streak_best').eq('nickname', nickname).maybeSingle()` — **не** вибирати `balance`, email.

- [ ] **Step 3:** `useMyAchievements` — для залогіненого: усі `achievements` left join `user_achievements`.

- [ ] **Step 4:** `useNotifications` — останні 20, `eq('user_id', user.id)`, `refetchInterval: 30000`.

- [ ] **Step 5:** `useMarkNotificationRead` — mutation update.

- [ ] **Step 6:** `npm run typecheck`

- [ ] **Step 7:** Commit: `feat(data): leaderboard, profile, achievements, notifications hooks`

---

## Task 10: Компоненти social + notifications

**Files:**
- Create: `src/components/social/LeaderboardTabs.tsx`
- Create: `src/components/social/LeaderboardRow.tsx`
- Create: `src/components/social/UserAvatar.tsx`
- Create: `src/components/social/AchievementBadge.tsx`
- Create: `src/components/social/AchievementsGrid.tsx`
- Create: `src/components/social/AchievementUnlockedToast.tsx` (обгортка над `sonner` + опційно `canvas-confetti`)
- Create: `src/components/notifications/NotificationsBell.tsx`
- Create: `src/components/notifications/NotificationsDropdown.tsx`
- Create: `src/components/notifications/NotificationItem.tsx`

- [ ] **Step 1:** `LeaderboardTabs` — три вкладки, стилі як у `AdminLayout` / існуючі кнопки.

- [ ] **Step 2:** `LeaderboardRow` — клік → `Link` на `/${nicknameEncoded}` або `/u/:nickname`.

- [ ] **Step 3:** `AchievementBadge` — `locked` сірий, tooltip через `title` або компонент з дизайн-системи.

- [ ] **Step 4:** `NotificationsBell` — badge з `unread` count, кліт відкриває dropdown.

- [ ] **Step 5:** Commit: `feat(ui): social and notification components`

---

## Task 11: Сторінки та роутер

**Files:**
- Modify: `src/pages/LeaderboardPage.tsx`
- Create: `src/pages/PublicProfilePage.tsx`
- Create: `src/pages/AchievementsPage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/components/layout/PublicHeader.tsx`

- [ ] **Step 1:** `LeaderboardPage` — завантажити топ-100; окремий запит «мій рядок»: якщо `rank > 100` показати текст «Ти на #N» (запит `where user_id = auth.uid()` до mat view або окремий RPC `get_my_leaderboard_rank`).

- [ ] **Step 2:** `PublicProfilePage` — параметр `nickname`; якщо не знайдено — «Користувача не знайдено»; блок порівняння для `useAuth().user.id !== profile.id` з порівнянням `total_won` / `correct_bets` (без балансу).

- [ ] **Step 3:** `AchievementsPage` — auth-only; grid з прогресом для складних бейджів (опційно спрощено: лише locked/unlocked до Task 12).

- [ ] **Step 4:** Router: `path: 'achievements'`, `path: 'u/:nickname'` **або** `path: '@:nickname'` — перевірити в браузері кодування; рекомендація плану: `u/:nickname` публічно, редірект з `@` у UI.

- [ ] **Step 5:** Header: вставити `NotificationsBell` ліворуч від лінка на профіль для auth.

- [ ] **Step 6:** Commit: `feat(pages): leaderboard, public profile, achievements`

---

## Task 12: Toast нових досягнень після resolve

**Files:**
- Modify: `src/components/admin/ResolveBetEventModal.tsx` або хук `useResolveBetEvent.ts`
- Modify: `src/hooks/admin/useResolveBetEvent.ts`

- [ ] **Step 1:** Після успішного RPC читати `data?.new_achievements` з відповіді `resolve_bet_event` (якщо додано в Task 5).

- [ ] **Step 2:** Для кожного коду показати `toast` + `AchievementUnlockedToast` послідовно (`for await` або черга).

- [ ] **Step 3:** Commit: `feat(admin): achievement toasts on resolve`

---

## Task 13: Профіль — preview досягнень

**Files:**
- Modify: `src/pages/ProfilePage.tsx`

- [ ] **Step 1:** Секція «Мої досягнення» з 4 останніми unlocked + `Link` на `/achievements`.

- [ ] **Step 2:** Commit: `feat(profile): achievements preview`

---

## Task 14: Unit-тест форматера accuracy

**Files:**
- Create: `src/lib/formatAccuracy.ts`
- Create: `tests/unit/social/formatAccuracy.test.ts`

- [ ] **Step 1:**

```ts
// src/lib/formatAccuracy.ts
export function formatAccuracy(correct: number, total: number): string {
  if (total <= 0) return '—'
  return `${Math.round((correct / total) * 1000) / 10}%`
}
```

- [ ] **Step 2:** Vitest: `(0,0)`, `(1,2)`, `(3,10)`.

- [ ] **Step 3:** `npm run test -- --run`

- [ ] **Step 4:** Commit: `test: formatAccuracy helper`

---

## Task 15: E2E скелет

**Files:**
- Create: `tests/e2e/achievements-flow.spec.ts`

- [ ] **Step 1:**

```ts
import { test } from '@playwright/test'

test('guest can open leaderboard', async ({ page }) => {
  await page.goto('/leaderboard')
  await page.getByRole('heading', { name: /Лідерборд/i }).waitFor()
})

// Повний сценарій streak_5 + notification — увімкнути після seed і test users
test.skip(true, 'achievements e2e needs seeded bets and admin resolve')
```

- [ ] **Step 2:** `npm run test:e2e`

- [ ] **Step 3:** Commit: `test(e2e): achievements flow skeleton`

---

## Task 16: Типи та README

**Files:**
- Modify: `src/lib/database.types.ts` (через `npm run db:types`)
- Modify: `holostyak-tote/README.md`

- [ ] **Step 1:** `SUPABASE_PROJECT_ID=... npm run db:types`

- [ ] **Step 2:** README Phase 5 → `[x]`, рядок у Docs на цей план.

- [ ] **Step 3:** Commit: `chore(types): regenerate for phase 5`

---

## Task 17: Realtime для notifications (опційно)

**Files:**
- Create: `src/hooks/realtime/useNotificationsRealtime.ts` (опційно)

- [ ] **Step 1:** Підписка `postgres_changes` на `notifications` з `filter: user_id=eq.${user.id}` лише якщо `getActiveChannelCount() < 100` (поріг з дизайну §6).

- [ ] **Step 2:** Інакше залишити polling 30–60 с з Task 9.

- [ ] **Step 3:** Увімкнути `notifications` у Realtime publication в Dashboard **тільки** якщо прийнятно для квоти.

- [ ] **Step 4:** Commit: `feat(realtime): optional notifications channel`

---

## Self-review (внутрішній чеклист)

1. **Spec coverage:** §5.5 таблиці, §17 бейджі, §6.3 RLS для notifications, лідерборд публічний, профіль публічний без витоку балансу — покрито задачами 1–13.
2. **Placeholder scan:** seed Task 2 містить повний набір §17 (**22**); скелет фази 5 з «20» не використовувати як ліміт.
3. **Type consistency:** `evaluate_user_achievements(uuid)`; `resolve_bet_event` повертає jsonb з ключем `new_achievements` — узгодити в Task 5 і Task 12.
4. **Gaps:** `season_prizes` (фаза 7) не входить у фазу 5. Адмін `/admin/settings` для редагування achievements — поза MVP фази 5 (дизайн §17); YAGNI.

---

**План збережено в** `docs/superpowers/plans/2026-04-24-social-gamification-phase-5.md`. **Два варіанти виконання:**

**1. Subagent-Driven (рекомендовано)** — окремий субагент на кожну Task, ревʼю між задачами (`superpowers:subagent-driven-development`).

**2. Inline Execution** — виконання пакетами в одній сесії з чекпойнтами (`superpowers:executing-plans`).

**Який варіант обираєте?**
