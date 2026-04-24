# Google OAuth — налаштування (ручні кроки)

Ці дії треба виконати один раз через браузер. Код уже готовий — після цих кроків кнопка "Увійти через Google" у застосунку запрацює.

## Дані проєкту Supabase

- Project ID: `lkorkbqvvjenveacmzxr`
- Project URL: `https://lkorkbqvvjenveacmzxr.supabase.co`
- Auth callback URL: `https://lkorkbqvvjenveacmzxr.supabase.co/auth/v1/callback`

## Крок 1 — Google Cloud OAuth client

1. Відкрити https://console.cloud.google.com/
2. Створити новий проєкт (або обрати наявний): назва `holostyak-tote`
3. **APIs & Services → OAuth consent screen**:
   - User Type: `External`
   - App name: `Холостяк Тоталізатор`
   - User support email: свій email
   - Developer contact: свій email
   - Authorized domains: `supabase.co`
   - Save → `Test users` → додати себе
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: `Web application`
   - Name: `Holostyak Tote Web`
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - (пізніше додати production-домен Cloudflare Pages)
   - Authorized redirect URIs:
     - `https://lkorkbqvvjenveacmzxr.supabase.co/auth/v1/callback`
   - Create → скопіювати **Client ID** і **Client Secret**

## Крок 2 — Увімкнути Google провайдера в Supabase

1. Відкрити https://supabase.com/dashboard/project/lkorkbqvvjenveacmzxr/auth/providers
2. Знайти `Google` → Enable
3. Вставити `Client ID` і `Client Secret` з попереднього кроку
4. Callback URL має бути: `https://lkorkbqvvjenveacmzxr.supabase.co/auth/v1/callback` — зіставити з тим, що в Google
5. Save

## Крок 3 — Redirect URLs у Supabase Auth

1. https://supabase.com/dashboard/project/lkorkbqvvjenveacmzxr/auth/url-configuration
2. **Site URL**: `http://localhost:5173` (потім змінити на prod-URL)
3. **Redirect URLs** (додати обидва, пізніше prod):
   - `http://localhost:5173/**`
   - `https://<prod-domain>/**`

## Крок 4 — Verify

Після Task 14 (Login page) відкрити `http://localhost:5173/login`, натиснути "Увійти через Google" — має з'явитися стандартний Google consent screen.
