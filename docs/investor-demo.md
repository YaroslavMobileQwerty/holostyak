# Investor / staging demo (season 14)

## Files

- [demo/season-14.demo.json](demo/season-14.demo.json) — назви та сценарій (джерело істини для контенту).
- [supabase/seed_investor_demo.sql](supabase/seed_investor_demo.sql) — накат у **хмарний** або **локальний** Supabase (одним скриптом у SQL Editor).

## Без Supabase (лише `npm run dev`)

Якщо не хочете Docker, хмарного проєкту й взагалі мережі до бекенду: у **`.env.local`** додайте `VITE_DEMO_MODE=true` (у dev це **не** підтягується на прод, якщо не збираєте з цією змінною). `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` не обов’язкові: UI показує ті ж UUID/дані, що в `seed_investor_demo.sql`, у пам’яті. Ставки, заявки на коїни та адмін-RPC **не** виконуються. Опційно: `VITE_DEV_MOCK_USER_ID` = UUID демо-користувача (див. розділ [нижче](#uuid-демо-користувачів-для-vite_dev_mock_user_id)) + `VITE_DEV_MOCK_ADMIN` — ніби залогінений демо-користувач. Портрети: Тарас — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Taras_Tsymbaliuk.jpg); учасниці в демо — сток Unsplash (по одному знімку в `src/lib/demoPublicData.ts`), не кадри STB; для публікації замініть `photo_url` на погоджені медіа.

## Тільки локально (хмарний проєкт не чіпаємо)

Щоб **не** завантажувати демо-дані в production/staging: працюйте з Docker і локальним Supabase. Хмарний `project ref` **не** потрібен для цього сценарію.

1. [Docker](https://docs.docker.com/get-docker/) запущений; [Supabase CLI](https://supabase.com/docs/guides/cli) встановлено.
2. У корені репо: `supabase start` — піднімає API, Postgres, Studio.
3. Схема (міграції) має вже бути в локальній БД: `supabase db reset` (скине локальні дані й застосує всі міграції з `supabase/migrations/`). Якщо локальна БД вже оновлена — крок опційно.
4. Сид демо: `npm run db:seed:demo` (викликає `supabase db query -f supabase/seed_investor_demo.sql --local`). Альтернатива: **Studio** на адресі з `supabase status` → **SQL** → вставити вміст `seed_investor_demo.sql` → **Run**.
5. Фронт: у **`.env.local`** підставте `VITE_SUPABASE_URL` і `VITE_SUPABASE_ANON_KEY` з виводу `supabase status` (локальні `API URL` і `anon key`), **не** з хмарного Dashboard.
6. `npm run dev` — додаток стукає лише в локальний кластер.

> Якщо випадково додасте `supabase link` і `db query --linked` / `db push` — ціле може піти в remote. Для демо-сиду тримайте **локальний** контур: `--local` (це дефолт для `db query` у цьому скрипті).

## Що отримаєш

- Сезон **14** (титул, холостяк, учасниці, фото-URL з [picsum.photos](https://picsum.photos) — **не** зі СТБ; заміни на погоджені кадри перед публікацією).
- 6 випусків, події ставок: зокрема **завершені** (резолв) та **відкрита** ставка в 3 випуску.
- 5 демо-користувачів (один з роллю `admin`), лідерборд після `refresh_leaderboards()`.
- Пароль для email-логіна (якщо увімкнете Email у Auth): `InvestorDemo2026!` (змініть / видаліть після демо).

## Як накатити (Supabase Cloud)

1. **Dashboard** → **SQL** → New query.
2. Вставте весь вміст `supabase/seed_investor_demo.sql` → **Run**.
3. Помилка на `auth.users` / `auth.identities`: див. розділ [Нижче](#auth-shipped). Схема Auth інколи відрізняється за версією.
4. Оновіть `app_settings` при потребі: `active_season_id` вже виставляється скриптом на id сезону 14.

## Фронт

- [README: Environment variables](../README.md) — `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` вказують на той самий проєкт, куди накатили seed.
- **Логін у UI** зараз лише **Google** ([`LoginPage`](../src/pages/LoginPage.tsx)). Email/пароль з seed **не** підключені до кнопки «Увійти». Для перегляду **приватних** маршрутів локально:
  - або увімкніть [Email provider](https://supabase.com/docs/guides/auth/auth-email) і згенеруйте magic link в Dashboard на `demo-*@holostyak-investor.local`;
  - або тимчасово використайте `VITE_DEV_MOCK_USER_ID` + (опційно) `VITE_DEV_MOCK_ADMIN` у `npm run dev` (лише Vite dev, див. README).
- Публічні сторінки (сезон, випуски, лідерборд) працюють **без** логіну.

## Права на зображення

Портрети в seed — **плейсхолдери** (picsum) зі сталими `seed=…`. Імена героя та учасниць взяті з **публічних** анонсів/преси; **не** копіюйте фото STB у репозиторій без ліцензії.

## Деплой для лінка інвестору

- Фронт: [Cloudflare Pages](cloudflare-pages-setup.md) (або аналог) зі зборки `npm run build`.
- Бек: той самий **Supabase**; **не** вмикайте `VITE_DEV_MOCK_*` на продакшн-збірці.

## Усунення проблем: Auth {#auth-shipped}

- `auth.instances` порожня — скрипт не Supabase-Auth (рідкісно).
- Помилка `INSERT INTO auth.identities` — закоментуйте блок `do $ident$` у SQL і додайте `identities` вручну через [доки Auth](https://supabase.com/docs/guides/auth/managing-user-data) або увімкніть **Email** sign-up в Dashboard.
- `extensions.crypt` / `pgcrypto` — увімкніть `pgcrypto` в Database → Extensions.

## UUID демо-користувачів (для `VITE_DEV_MOCK_USER_ID`)

| Роль  | `id` (UUID)                          | Email (seed)                    |
| ----- | ------------------------------------ | ------------------------------- |
| admin | `b1111111-1111-4111-8111-111111111101` | demo-admin@holostyak-investor.local |
| user  | `b1111111-1111-4111-8111-111111111102` | demo-anna@holostyak-investor.local  |

(Решта: `...103` … `...105` — див. SQL.)

## Перевірка після сиду

- `select public.refresh_leaderboards();` вже викликано в кінці `seed_investor_demo.sql` (див. хвилі з помилкою `CONCURRENTLY` — нормальне fallback у функції).
- `select count(*) from public.leaderboard_all_time;` — > 0.
- `select * from public.app_settings where key = 'active_season_id';` — id сезону 14.
- UI: `Головна` → `Випуски` → `Топ` (лідерборд) → випуск 1/2/3: події зі ставками; без логіну — публічний перегляд; з `VITE_DEV_MOCK_USER_ID` — приватні маршрути для рев’ю.
