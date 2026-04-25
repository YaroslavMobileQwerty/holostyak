# Cloudflare Pages — налаштування (ручні кроки)

Автоматизувати деплой через `wrangler` CLI без Cloudflare API токена не можна. Нижче — одноразові кроки через дашборд + підключення GitHub.

## Крок 1 — Pages Project через Git

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**
2. Авторизувати GitHub → обрати репо `YaroslavMobileQwerty/holostyak`
3. **Build settings:**
   - Project name: `holostyak-tote`
   - Production branch: `main`
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
4. **Deploy settings (важливо):**
   - Якщо поле **Deploy command** обов'язкове, використовуй:
     - `npx wrangler pages deploy dist --project-name=holostyak-tote`
   - Не використовуй `npx wrangler deploy` (це команда для Workers, не для Pages)
   - Переконайся, що токен у `CLOUDFLARE_API_TOKEN` має права для Pages (див. Troubleshooting нижче)

## Крок 2 — Environment Variables (Production + Preview)

- `VITE_SUPABASE_URL` = `https://lkorkbqvvjenveacmzxr.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_eUITPNqCua2fFaw84JOPkQ_Lds9QpHo`

Save → перший build запуститься автоматично.

## Крок 3 — Після першого успішного деплою

1. Скопіюй prod-домен (типу `holostyak-tote.pages.dev`)
2. У Supabase Dashboard → Auth → URL Configuration додай його в **Redirect URLs** та як **Site URL**
3. У Google Cloud → OAuth Client → додай prod-домен у **Authorized JavaScript origins**

## Крок 4 — GitHub Actions secrets

Для CI у GitHub → Settings → Secrets and variables → Actions → New repository secret:

- `VITE_SUPABASE_URL` = `https://lkorkbqvvjenveacmzxr.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_eUITPNqCua2fFaw84JOPkQ_Lds9QpHo`

## Verify

Після push у `main`:

1. GitHub Actions → workflow `CI` зелений
2. Cloudflare Pages → Deployment зелений
3. Prod URL відкривається, лендінг бачимо

## Troubleshooting

### Помилка: `Missing entry-point to Worker script or to assets directory`

Причина: був запущений `wrangler deploy` замість Pages-команди.

Що зробити:

1. У Cloudflare Pages відкрий **Settings → Builds & deployments**
2. Видали `npx wrangler deploy` з **Deploy command**
3. Перезапусти деплой

### Помилка: `Authentication error [code: 10000]` при `wrangler pages deploy`

Причина: у середовищі заданий `CLOUDFLARE_API_TOKEN`, але токен не має потрібних прав для Pages API.

Що зробити:

1. Якщо поле **Deploy command** required, залиш `npx wrangler pages deploy dist --project-name=holostyak-tote`
2. Створи новий API token з правами щонайменше:
   - `Account - Cloudflare Pages: Edit`
   - `Account - Workers Scripts: Edit` (опціонально, якщо використовуєш Workers)
   - `Zone - Zone: Read` (за потреби маршрутизації/доменів)
3. Онови `CLOUDFLARE_API_TOKEN` новим токеном і перезапусти деплой
