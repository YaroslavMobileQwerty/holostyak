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
