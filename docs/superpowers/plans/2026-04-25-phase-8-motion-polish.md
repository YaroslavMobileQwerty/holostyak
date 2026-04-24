# Motion / Polish (Phase 8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реалізувати motion-систему (Framer Motion + GSAP), звук (Howler), Sentry, Plausible, bundle/fonts/зображення та perf-гейти з [скелету фази 8](../../../2026-04-24-phase-8-motion-polish.md); узгодити з існуючим `canvas-confetti` на `EpisodeDetailPage` (lightning win).

**Architecture:** Спільні варіанти в `src/motion/variants.ts` з урахуванням `useReducedMotion()`. Переходи сторінок — `AnimatePresence` + `useLocation` у публічному лейауті (ключ `location.pathname`). GSAP лише там, де потрібні timeline (hero landing). Звук — Howler + `SoundProvider` (preload після першого `pointerdown` / `keydown`, mute у `localStorage`). Sentry — окремий entry `init` до React render + `ErrorBoundary`. Plausible — `index.html` script + типізований хелпер `trackPlausible`. Admin-маршрути — `React.lazy` + `Suspense` у `router.tsx`, щоб не роздувати початковий чанк. Досягнення — toasts на основі таблиці `notifications` (`type = 'achievement_unlocked'`), бо окремого хука ще немає в `src/`.

**Tech Stack:** `holostyak-tote` (React 19, Vite 8, React Router 7, TanStack Query 5, Tailwind 4). Нові: `framer-motion`, `gsap`, `howler`, `@sentry/react`, `@sentry/vite-plugin` (dev). Вже є: `canvas-confetti` (^1.9.4), `@types/canvas-confetti`.

**Prereq:** Будь-яка попередня фаза з готовим UX; рекомендовано після фази 5+. Фаза 8 — overlay, можна паралельно іншим фазам.

**Spec:** [../../../2026-04-24-phase-8-motion-polish.md](../../../2026-04-24-phase-8-motion-polish.md)

**Workspace root:** `holostyak-tote/`

---

## File structure (new / modified)

| Path | Відповідальність |
|------|------------------|
| `src/motion/variants.ts` | Спільні `fade`, `page`, `cardHover`; зведення до opacity при reduced motion |
| `src/motion/PageTransition.tsx` | Обгортка `motion.div` + `AnimatePresence` (mode `wait`) |
| `src/motion/HeroText.tsx` | GSAP: слова + shimmer для рядка «На кохання.» |
| `src/motion/CountdownDigits.tsx` | Двоколонковий відлік (год/хв/сек) зі slide-up цифр |
| `src/motion/LightningPortal.tsx` | Spring-вхід для sticky-панелі блискавок (обгортка `aside`) |
| `src/motion/ShimmerOverlay.tsx` | Реюз градієнта з `--animate-shimmer` для тексту |
| `src/motion/CinematicCard.tsx` | Опційна обгортка `motion.article` / `motion(Link)` для lift-hover |
| `src/sound/sounds.ts` | Константи URL (без хардкоду домену — лише шляхи `/sounds/...`) |
| `src/sound/SoundProvider.tsx` | Context: mute, `play(key)`, preload, `unlockAudio()` |
| `src/sound/useSound.ts` | `useSoundContext()` + безпечний no-op fallback поза провайдером |
| `src/monitoring/sentry.ts` | `Sentry.init` + умовний експорт |
| `src/monitoring/ErrorBoundary.tsx` | `Sentry.ErrorBoundary` або клас з `componentDidCatch` |
| `src/analytics/plausible.ts` | `declare global`, `trackPlausible(event, props?)` |
| `src/lib/lazyRoutes.ts` | Експорт `lazy(() => import(...))` для admin pages |
| `src/hooks/usePrefersReducedMotion.ts` | Обгортка над `window.matchMedia('(prefers-reduced-motion: reduce)')` для юніт-тестів без framer у кожному тесті |
| `src/hooks/useAnimatedBalance.ts` | Лічильник 500ms + дельта для плашки «+N» |
| `src/hooks/useAchievementUnlockToasts.ts` | Query notifications + toast при нових `achievement_unlocked` |
| `src/components/layout/RootLayout.tsx` | `PageTransition` навколо `<Outlet />` |
| `src/components/layout/PublicHeader.tsx` | Кнопка mute + `aria-pressed` |
| `src/pages/LandingPage.tsx` | `HeroText` замість статичного `h1` |
| `src/components/betting/BetCountdown.tsx` | Використання `CountdownDigits` для майбутнього `closesAt` |
| `src/components/betting/BetOptionButton.tsx` | Ripple / `whileTap` |
| `src/components/betting/BetEventCard.tsx` | Обгортка картки в motion; інтеграція settle-анімацій для `MyBetChip` |
| `src/components/betting/MyBetChip.tsx` | Flip / fade / shake залежно від `bet.status` |
| `src/components/betting/PlaceBetModal.tsx` | Після успіху: `play('bet_placed')`, `trackPlausible` |
| `src/components/ui/ParticipantCard.tsx` | Lift-hover + scale фото |
| `src/components/ui/EpisodeCard.tsx` | Lift-hover |
| `src/components/ui/BachelorCard.tsx` | Lift-hover |
| `src/components/live/LiveStickyPanel.tsx` | `LightningPortal` |
| `src/components/wallet/BalanceCard.tsx` | `useAnimatedBalance`, плашка дельти |
| `src/pages/ProfilePage.tsx` | Анімований баланс; опційно виклик хука досягнень |
| `src/pages/EpisodeDetailPage.tsx` | Узгодити confetti (кольори), rose petals для `first_rose`, не дублювати win-логіку |
| `src/index.css` | Self-host `@font-face`; прибрати Google Fonts `@import` |
| `index.html` | Plausible script; `lang="uk"` |
| `vite.config.ts` | `manualChunks`, умовно `sentryVitePlugin` |
| `src/main.tsx` | `import './monitoring/sentry'`, `SoundProvider`, `ErrorBoundary`, achievement hook provider або виклик у `App` |
| `src/App.tsx` | Композиція провайдерів |
| `src/router.tsx` | `lazy` admin pages + `Suspense` fallback |
| `public/sounds/*.mp3` | Ассети (див. Task 12 — джерело файлу поза репо) |
| `public/images/petal.png` | 1 PNG для rose confetti shape |
| `public/fonts/*` | WOFF2 з fontsource або google-webfonts-helper |
| `tests/unit/motion/variants.test.ts` | Reduced-motion варіанти |
| `tests/unit/sound/sounds.test.ts` | Маніфест ключів |
| `tests/unit/hooks/useAnimatedBalance.test.ts` | Монотонна інтерполяція / edge cases |
| `tests/e2e/motion-smoke.spec.ts` | Перехід між `/` і `/show` без throw |
| `.github/workflows/lighthouse-ci.yml` | Budgets LCP / JS size (якщо репозиторій на GitHub) |
| `.lighthouserc.json` або inline CLI | Пороги з скелету |
| `package.json` / `package-lock.json` | Залежності |

---

## Task 0: Базова верифікація

**Files:** —

- [ ] **Step 1:** З кореня `holostyak-tote`: `npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build` — очікувано: усе зелене.

- [ ] **Step 2:** Commit не потрібен (перевірка лише).

---

## Task 1: Залежності

**Files:**
- Modify: `holostyak-tote/package.json`

- [ ] **Step 1:** Встановити runtime і dev (у корені `holostyak-tote`):

```bash
npm install framer-motion gsap howler @sentry/react
npm install -D @types/howler @sentry/vite-plugin
```

**Примітка:** `canvas-confetti` уже в `dependencies` — не дублювати.

- [ ] **Step 2:** `npm run typecheck` — очікувано: без помилок.

- [ ] **Step 3:** Commit:

```bash
git add package.json package-lock.json
git commit -m "chore: add motion, sound, and Sentry dependencies for phase 8"
```

---

## Task 2: `variants.ts` + reduced motion

**Files:**
- Create: `src/motion/variants.ts`
- Create: `tests/unit/motion/variants.test.ts`

- [ ] **Step 1: Написати тест для factory**

```ts
// tests/unit/motion/variants.test.ts
import { describe, expect, it } from 'vitest'
import { pageTransitionVariants } from '@/motion/variants'

describe('pageTransitionVariants', () => {
  it('uses full motion when reducedMotion is false', () => {
    const v = pageTransitionVariants(false)
    expect(v.initial).toEqual({ opacity: 0, y: 20 })
    expect(v.animate).toEqual({ opacity: 1, y: 0 })
    expect(v.exit).toEqual({ opacity: 0, y: -20 })
  })

  it('uses opacity-only when reducedMotion is true', () => {
    const v = pageTransitionVariants(true)
    expect(v.initial).toEqual({ opacity: 0 })
    expect(v.animate).toEqual({ opacity: 1 })
    expect(v.exit).toEqual({ opacity: 0 })
    expect(v.transition).toMatchObject({ duration: expect.any(Number) })
  })
})
```

- [ ] **Step 2:** Запустити тест (очікувано FAIL: module missing).

```bash
cd holostyak-tote && npm run test -- --run tests/unit/motion/variants.test.ts
```

- [ ] **Step 3: Мінімальна реалізація**

```ts
// src/motion/variants.ts
import type { Transition, Variants } from 'framer-motion'

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1]

export const pageTransition = {
  duration: 0.4,
  ease,
} satisfies Transition

export function pageTransitionVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    }
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: pageTransition,
  }
}

export function cardLiftProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0.2 },
    }
  }
  return {
    whileHover: {
      y: -4,
      boxShadow: '0 20px 40px rgba(213,0,50,0.3)',
    },
    transition: { duration: 0.3 },
  }
}
```

- [ ] **Step 4:** `npm run test -- --run tests/unit/motion/variants.test.ts` — очікувано: PASS.

- [ ] **Step 5:** Commit:

```bash
git add src/motion/variants.ts tests/unit/motion/variants.test.ts
git commit -m "feat(motion): page transition variants with reduced motion"
```

---

## Task 3: `PageTransition` + `RootLayout`

**Files:**
- Create: `src/motion/PageTransition.tsx`
- Modify: `src/components/layout/RootLayout.tsx`

- [ ] **Step 1: Реалізація**

```tsx
// src/motion/PageTransition.tsx
import { useReducedMotion } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import { pageTransitionVariants } from '@/motion/variants'

export function PageTransition() {
  const location = useLocation()
  const reduced = !!useReducedMotion()
  const variants = pageTransitionVariants(reduced)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="contents"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
```

**Примітка:** `className="contents"` залишає поведінку flex/grid батьків (`main`) без зайвого wrapper-відступу.

- [ ] **Step 2:** У `RootLayout.tsx` замінити сирий `<Outlet />` на `<PageTransition />` всередині `<main>`:

```tsx
import { PageTransition } from '@/motion/PageTransition'
// ...
<main className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 pb-24 md:pb-8">
  <PageTransition />
</main>
```

- [ ] **Step 3:** `npm run typecheck && npm run lint`

- [ ] **Step 4:** Commit:

```bash
git add src/motion/PageTransition.tsx src/components/layout/RootLayout.tsx
git commit -m "feat(motion): AnimatePresence page transitions in RootLayout"
```

---

## Task 4: E2E smoke для переходу

**Files:**
- Create: `tests/e2e/motion-smoke.spec.ts`

- [ ] **Step 1:**

```ts
// tests/e2e/motion-smoke.spec.ts
import { test, expect } from '@playwright/test'

test('public routes navigate without error', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('link', { name: 'Про шоу' }).click()
  await expect(page).toHaveURL(/\/show/)
  expect(errors, errors.join('\n')).toEqual([])
})
```

- [ ] **Step 2:** `npm run test:e2e -- tests/e2e/motion-smoke.spec.ts` — очікувано: PASS.

- [ ] **Step 3:** Commit:

```bash
git add tests/e2e/motion-smoke.spec.ts
git commit -m "test(e2e): motion smoke navigation"
```

---

## Task 5: `HeroText` (GSAP) + `LandingPage`

**Files:**
- Create: `src/motion/HeroText.tsx`
- Create: `src/motion/ShimmerOverlay.tsx`
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Shimmer span**

```tsx
// src/motion/ShimmerOverlay.tsx
export function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-rose-cream via-primary-live to-rose-cream bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: HeroText** (cleanup timeline on unmount; поважати reduced motion через optional prop з батька):

```tsx
// src/motion/HeroText.tsx
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { ShimmerText } from '@/motion/ShimmerOverlay'

const LINE1 = 'Зроби свою ставку.'

export function HeroText({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return
    const words = rootRef.current.querySelectorAll<HTMLElement>('[data-word]')
    const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power2.out' } })
    tl.from(words, { opacity: 0, y: 12, stagger: 0.1 })
    return () => {
      tl.kill()
    }
  }, [reducedMotion])

  const wordsLine1 = LINE1.split(' ').map((w, i) => (
    <span key={`${i}-${w}`} data-word className="inline-block whitespace-nowrap">
      {w}&nbsp;
    </span>
  ))

  return (
    <h1 ref={rootRef} className="font-serif text-5xl leading-none md:text-7xl">
      {reducedMotion ? (
        <>
          {LINE1} <br />
          <em className="text-primary-live">На кохання.</em>
        </>
      ) : (
        <>
          {wordsLine1}
          <br />
          <em className="not-italic">
            <ShimmerText className="text-5xl md:text-7xl">На кохання.</ShimmerText>
          </em>
        </>
      )}
    </h1>
  )
}
```

- [ ] **Step 3:** У `LandingPage.tsx` імпортувати `useReducedMotion` з `framer-motion` та `HeroText`; замінити існуючий блок `h1` (рядки з «Зроби свою ставку») на `<HeroText reducedMotion={!!useReducedMotion()} />`.

- [ ] **Step 4:** `npm run lint && npm run typecheck`

- [ ] **Step 5:** Commit:

```bash
git add src/motion/HeroText.tsx src/motion/ShimmerOverlay.tsx src/pages/LandingPage.tsx
git commit -m "feat(motion): GSAP hero word stagger and shimmer tagline"
```

---

## Task 6: Cinematic lift — картки

**Files:**
- Create: `src/motion/CinematicCard.tsx` (експорт `MotionArticle`, `MotionLink` з однаковими hover props)
- Modify: `src/components/ui/ParticipantCard.tsx`
- Modify: `src/components/ui/EpisodeCard.tsx`
- Modify: `src/components/ui/BachelorCard.tsx`
- Modify: `src/components/betting/BetEventCard.tsx` (зовнішня обгортка `rounded-2xl`)

- [ ] **Step 1: Обгортка**

```tsx
// src/motion/CinematicCard.tsx
import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { Link, type LinkProps } from 'react-router-dom'
import { cardLiftProps } from '@/motion/variants'

const MotionLink = motion.create(Link)

export function CinematicArticle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const reduced = !!useReducedMotion()
  const lift = cardLiftProps(reduced)
  return (
    <motion.article className={className} {...lift}>
      {children}
    </motion.article>
  )
}

export function CinematicLink(props: LinkProps & { className?: string }) {
  const reduced = !!useReducedMotion()
  const lift = cardLiftProps(reduced)
  return <MotionLink {...props} {...lift} />
}
```

- [ ] **Step 2:** У `ParticipantCard` замінити `<article>` на `<CinematicArticle className={...}>`; на внутрішній `div` з фото додати `className="... transition-transform duration-300 group-hover:scale-[1.02]"` та `className="group ..."` на article — **або** обгорнути фото в `motion.div` з `whileHover={{ scale: 1.02 }}` якщо не використовуєте group (достатньо `motion.div` з `className="aspect-square ..."`).

- [ ] **Step 3:** `EpisodeCard`: замінити `Link` на `CinematicLink` з тими ж `to` / `className`.

- [ ] **Step 4:** `BachelorCard`: `<CinematicArticle>`.

- [ ] **Step 5:** `BetEventCard`: найзовніший `div` замінити на `motion.div` з `cardLiftProps(useReducedMotion())` (імпорт `motion` + hook), щоб не ламати вкладену структуру модалки.

- [ ] **Step 6:** `npm run typecheck`

- [ ] **Step 7:** Commit:

```bash
git add src/motion/CinematicCard.tsx src/components/ui/ParticipantCard.tsx src/components/ui/EpisodeCard.tsx src/components/ui/BachelorCard.tsx src/components/betting/BetEventCard.tsx
git commit -m "feat(motion): cinematic lift hover on cards"
```

---

## Task 7: `BetOptionButton` — ripple + tap

**Files:**
- Modify: `src/components/betting/BetOptionButton.tsx`
- Modify: `src/index.css` (keyframes ripple)

- [ ] **Step 1:** Додати в `@layer utilities` або в кінець `index.css`:

```css
@keyframes bet-ripple {
  0% {
    transform: scale(0);
    opacity: 0.35;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.animate-bet-ripple {
  animation: bet-ripple 0.55s ease-out forwards;
}
```

- [ ] **Step 2:** Реалізувати кнопку як `motion.button` з `whileTap={{ scale: 0.985 }}` (якщо не `useReducedMotion`), `relative overflow-hidden`, і стан `ripples: Array<{ id: number; x: number; y: number }>` на `pointerdown` (координати відносно `currentTarget.getBoundingClientRect()`), рендер span `absolute rounded-full bg-primary-live/30 pointer-events-none animate-bet-ripple` з `left/top` у px, видалення після `animationend`.

- [ ] **Step 3:** `npm run lint`

- [ ] **Step 4:** Commit:

```bash
git add src/components/betting/BetOptionButton.tsx src/index.css
git commit -m "feat(motion): bet option ripple on press"
```

---

## Task 8: `CountdownDigits` + `BetCountdown`

**Files:**
- Create: `src/motion/CountdownDigits.tsx`
- Modify: `src/components/betting/BetCountdown.tsx`

- [ ] **Step 1: CountdownDigits**

```tsx
// src/motion/CountdownDigits.tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

function DigitCol({ value, label }: { value: string; label: string }) {
  const reduced = !!useReducedMotion()
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider text-rose-dust/80">{label}</span>
      <div className="relative h-8 min-w-[2ch] overflow-hidden font-mono text-lg tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduced ? false : { y: 16, opacity: 0 }}
            animate={reduced ? undefined : { y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: -16, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function CountdownDigits({ closesAt, now }: { closesAt: string; now: number }) {
  const end = new Date(closesAt).getTime()
  const left = Math.max(0, end - now)
  const totalSec = Math.floor(left / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    <div className="flex items-end gap-3">
      <DigitCol value={pad(h)} label="год" />
      <DigitCol value={pad(m)} label="хв" />
      <DigitCol value={pad(s)} label="сек" />
    </div>
  )
}
```

- [ ] **Step 2:** У `BetCountdown.tsx` під існуючою логікою `urgencyClass`, якщо `end > now`, рендерити під/поруч з текстом `formatDistanceToNow` блок `<CountdownDigits closesAt={closesAt} now={now} />` (наприклад `flex flex-col gap-1 items-end`), щоб зберегти український «через X» **і** цифровий ролап.

- [ ] **Step 3:** Commit:

```bash
git add src/motion/CountdownDigits.tsx src/components/betting/BetCountdown.tsx
git commit -m "feat(motion): animated countdown digits"
```

---

## Task 9: `LightningPortal` + `LiveStickyPanel`

**Files:**
- Create: `src/motion/LightningPortal.tsx`
- Modify: `src/components/live/LiveStickyPanel.tsx`

- [ ] **Step 1:**

```tsx
// src/motion/LightningPortal.tsx
import { motion, useReducedMotion } from 'framer-motion'

export function LightningPortal({ children }: { children: React.ReactNode }) {
  const reduced = !!useReducedMotion()
  return (
    <motion.aside
      id="lightning-panel"
      initial={reduced ? { opacity: 0 } : { y: '100%', opacity: 0, scale: 0.8 }}
      animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { type: 'spring', stiffness: 300, damping: 25 }
      }
      className="fixed bottom-0 left-0 right-0 z-40 max-h-[42vh] overflow-y-auto border-t border-primary/25 bg-bg-card/95 p-4 backdrop-blur lg:bottom-auto lg:left-auto lg:right-4 lg:top-24 lg:mt-8 lg:max-h-[calc(100vh-8rem)] lg:w-80 lg:rounded-2xl lg:border lg:border-primary/25 lg:bg-bg-card/90 lg:p-4 lg:shadow-lg"
    >
      {children}
    </motion.aside>
  )
}
```

- [ ] **Step 2:** У `LiveStickyPanel.tsx` замінити сирий `<aside id="lightning-panel" className=...>` на `<LightningPortal>` з тим самим вмістом всередині (класи перенесені в компонент — прибрати дубль `id` / `className` з дочірнього).

- [ ] **Step 3:** Commit:

```bash
git add src/motion/LightningPortal.tsx src/components/live/LiveStickyPanel.tsx
git commit -m "feat(motion): lightning sticky panel spring entrance"
```

---

## Task 10: Win / lose — `MyBetChip`, confetti, settle

**Files:**
- Modify: `src/components/betting/MyBetChip.tsx`
- Modify: `src/pages/EpisodeDetailPage.tsx`

- [ ] **Step 1:** Розширити `MyBetChip` до `motion.span` / картки: для `won` — `animate={{ rotateY: [0, 180] }}` або CSS `transition` з `data-status="won"` та overlay «+{payout} б.»; для `lost` — `opacity: 0.5` + клас `animate-lost-shake` (додати keyframes `translateX` ±2px 0.12s ease-in-out 4 цикли в `index.css`).

- [ ] **Step 2:** Винести в `src/motion/confettiTheme.ts` функцію `celebrationConfetti()` з кольорами `#d50032`, `#f5e6d3`, `#ffd700` для реюзу.

- [ ] **Step 3:** У `EpisodeDetailPage.tsx` поруч з існуючим `useEffect` для lightning (рядки ~64–80) додати **другий** `useRef<Map>` для звичайних `bet_events` (не `is_lightning` / `type !== 'lightning'`) або розширити цикл: для кожного `ev` з `betEvents` при переході в `resolved` викликати той самий confetti + `play('win')` / `play('lost')` (через `useSound`, див. Task 12) якщо `mine` існує.

- [ ] **Step 4:** Commit:

```bash
git add src/components/betting/MyBetChip.tsx src/pages/EpisodeDetailPage.tsx src/motion/confettiTheme.ts src/index.css
git commit -m "feat(motion): bet result chip animations and shared win confetti"
```

---

## Task 11: Баланс — roll-up + плашка

**Files:**
- Create: `src/hooks/useAnimatedBalance.ts`
- Create: `tests/unit/hooks/useAnimatedBalance.test.ts`
- Modify: `src/components/wallet/BalanceCard.tsx`

- [ ] **Step 1: Тест логіки інтерполяції** (чиста функція в тому ж файлі або `src/lib/animateNumber.ts`):

```ts
// tests/unit/hooks/useAnimatedBalance.test.ts
import { describe, expect, it } from 'vitest'
import { lerpInt } from '@/hooks/useAnimatedBalance'

describe('lerpInt', () => {
  it('interpolates toward target', () => {
    expect(lerpInt(0, 100, 0.5)).toBe(50)
    expect(lerpInt(100, 0, 1)).toBe(0)
  })
})
```

Експортуйте `lerpInt` з хука або винесіть у `lib`.

- [ ] **Step 2:** Реалізувати `useAnimatedBalance(current: number | undefined)` → `{ display, delta, clearDelta }` з `requestAnimationFrame` протягом ~500ms при зміні `current`; якщо `current` зростає, встановити `delta` для плашки.

- [ ] **Step 3:** `BalanceCard` приймає опційно `animated?: boolean` (default true) і показує `motion.span` для числа + абсолютно позиціонований `+N` на 1.5s (`AnimatePresence`).

- [ ] **Step 4:** Commit:

```bash
git add src/hooks/useAnimatedBalance.ts tests/unit/hooks/useAnimatedBalance.test.ts src/components/wallet/BalanceCard.tsx
git commit -m "feat(motion): animated balance rollup and delta chip"
```

---

## Task 12: Rose petals (`first_rose`)

**Files:**
- Create: `public/images/petal.png` (плейсхолдер 32×32 PNG у репо **або** документувати генерацію; якщо бінарник не комітити — додати README у `public/images/` з інструкцією)
- Modify: `src/pages/EpisodeDetailPage.tsx`

- [ ] **Step 1:** Додати утиліту `fireRosePetals()` у `src/motion/roseConfetti.ts`:

```ts
import confetti from 'canvas-confetti'

export function fireRosePetals(originY = 0.15) {
  const petal = document.createElement('img')
  petal.src = '/images/petal.png'
  void petal.decode().catch(() => undefined)
  const defaults = { spread: 360, ticks: 200, gravity: 0.7, decay: 0.94, startVelocity: 25, shapes: ['image'] as confetti.Shape[], scalar: 1.2 }
  void confetti({
    ...defaults,
    particleCount: 6,
    origin: { x: 0.2, y: originY },
    flat: true,
  })
  void confetti({
    ...defaults,
    particleCount: 6,
    origin: { x: 0.5, y: originY },
    flat: true,
  })
  void confetti({
    ...defaults,
    particleCount: 6,
    origin: { x: 0.8, y: originY },
    flat: true,
  })
}
```

Перед викликом: `confetti.create` з custom shape — узгодити з API `canvas-confetti` v1.9 (перевірити тип `Shape[]`; для image shape потрібен `shapeFromPath` або `scalar` + `shapes: [petal]` згідно документації пакета — **підлаштувати під фактичний API** під час імплементації).

- [ ] **Step 2:** У циклі settle на `EpisodeDetailPage`, якщо `ev.type === 'first_rose'` і `mine?.status === 'won'`, викликати `fireRosePetals()` + `play('achievement')`.

- [ ] **Step 3:** Commit (якщо PNG не в git — закомітити лише код + README):

```bash
git add src/motion/roseConfetti.ts src/pages/EpisodeDetailPage.tsx public/images/README.md
git commit -m "feat(motion): rose petal confetti on first_rose win"
```

---

## Task 13: Sound system

**Files:**
- Create: `src/sound/sounds.ts`
- Create: `src/sound/SoundProvider.tsx`
- Create: `src/sound/useSound.ts`
- Create: `tests/unit/sound/sounds.test.ts`
- Create: `public/sounds/README.md` (список файлів; самі mp3 — з ліцензійних джерел / synth)
- Modify: `src/main.tsx` або `App.tsx`
- Modify: `src/components/layout/PublicHeader.tsx`

- [ ] **Step 1: Тест маніфесту**

```ts
// tests/unit/sound/sounds.test.ts
import { describe, expect, it } from 'vitest'
import { SOUND_KEYS } from '@/sound/sounds'

describe('SOUND_KEYS', () => {
  it('includes core gameplay sounds', () => {
    expect(SOUND_KEYS).toEqual(
      expect.arrayContaining([
        'bet_placed',
        'win',
        'lost',
        'lightning',
        'achievement',
        'notification',
        'balance_up',
      ]),
    )
  })
})
```

- [ ] **Step 2: sounds.ts**

```ts
export const SOUNDS = {
  bet_placed: '/sounds/bet_placed.mp3',
  win: '/sounds/win.mp3',
  lost: '/sounds/lost.mp3',
  lightning: '/sounds/lightning.mp3',
  achievement: '/sounds/achievement.mp3',
  notification: '/sounds/notification.mp3',
  balance_up: '/sounds/balance_up.mp3',
} as const

export type SoundId = keyof typeof SOUNDS
export const SOUND_KEYS = Object.keys(SOUNDS) as SoundId[]
```

- [ ] **Step 3:** `SoundProvider` зберігає `muted` у `localStorage` ключ `holostyak-sound-muted`, default `true`. На `pointerdown` на `document` один раз викликати preload Howl instances. Якщо `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — не вмикати автоматично; залишити mute until user toggles.

- [ ] **Step 4:** Обгорнути дерево в `SoundProvider` у `main.tsx` всередині `QueryClientProvider`.

- [ ] **Step 5:** У `PublicHeader` додати кнопку «🔈/🔇» з `aria-label="Звук"` та `onClick` toggle.

- [ ] **Step 6:** `PlaceBetModal` після успіху: `play('bet_placed')`.

- [ ] **Step 7:** Commit:

```bash
git add src/sound public/sounds/README.md src/main.tsx src/components/layout/PublicHeader.tsx src/components/betting/PlaceBetModal.tsx tests/unit/sound/sounds.test.ts
git commit -m "feat(sound): Howler provider, mute toggle, bet placed SFX"
```

---

## Task 14: Sentry

**Files:**
- Create: `src/monitoring/sentry.ts`
- Create: `src/monitoring/ErrorBoundary.tsx`
- Modify: `src/main.tsx`
- Modify: `vite.config.ts`
- Create: `.env.example` (якщо немає) з `VITE_SENTRY_DSN=`

- [ ] **Step 1: sentry.ts**

```ts
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
  })
}

export { Sentry }
```

- [ ] **Step 2:** Перший рядок у `main.tsx` (перед іншими side-effect imports): `import './monitoring/sentry'`.

- [ ] **Step 3:** `ErrorBoundary` обгортає `<App />` і рендерить український fallback «Щось пішло не так» + кнопка reload.

- [ ] **Step 4:** `vite.config.ts`: якщо `process.env.SENTRY_AUTH_TOKEN` заданий, додати `sentryVitePlugin({ org: '...', project: '...' })` — значення брати з існуючого Sentry проєкту (не вигадувати в коді; винести в env).

- [ ] **Step 5:** Перевірка: тимчасово `throw new Error('sentry test')` у dev під прапором — видалити перед merge.

- [ ] **Step 6:** Commit:

```bash
git add src/monitoring vite.config.ts src/main.tsx .env.example
git commit -m "feat(monitoring): Sentry React SDK and error boundary"
```

---

## Task 15: Plausible

**Files:**
- Create: `src/analytics/plausible.ts`
- Modify: `index.html`
- Modify: `src/components/betting/PlaceBetModal.tsx`
- Modify: `src/hooks/useSubmitPurchaseRequest.ts` (або форма донату) для `donation_submitted`

- [ ] **Step 1:** У `<head>` додати:

```html
<script defer data-domain="tote.holostyak.ua" src="https://plausible.io/js/script.js"></script>
```

- [ ] **Step 2:**

```ts
// src/analytics/plausible.ts
export function trackPlausible(event: string, opts?: { props?: Record<string, string | number | boolean> }) {
  const w = window as unknown as { plausible?: (e: string, o?: { props: Record<string, unknown> }) => void }
  w.plausible?.(event, opts?.props ? { props: opts.props } : undefined)
}
```

- [ ] **Step 3:** Після успішної ставки: `trackPlausible('bet_placed', { props: { amount: safeAmount, odds: oddsN } })`.

- [ ] **Step 4:** Після відправки заявки на донат: `trackPlausible('donation_submitted')`.

- [ ] **Step 5:** Commit:

```bash
git add index.html src/analytics/plausible.ts
git commit -m "feat(analytics): Plausible script and helpers"
```

---

## Task 16: Bundle — `manualChunks` + lazy admin

**Files:**
- Create: `src/lib/lazyRoutes.ts`
- Modify: `src/router.tsx`

- [ ] **Step 1: lazyRoutes.ts**

```ts
import { lazy } from 'react'

export const LazyAdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
export const LazyAdminPurchasesPage = lazy(() => import('@/pages/admin/AdminPurchasesPage'))
export const LazyAdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
export const LazyAdminEpisodesPage = lazy(() => import('@/pages/admin/AdminEpisodesPage'))
export const LazyAdminEpisodeEditPage = lazy(() => import('@/pages/admin/AdminEpisodeEditPage'))
export const LazyAdminResolutionPage = lazy(() => import('@/pages/admin/AdminResolutionPage'))
export const LazyAdminLivePage = lazy(() => import('@/pages/admin/AdminLivePage'))
```

- [ ] **Step 2:** У `router.tsx` прибрати прямі імпорти admin pages; імпортувати `lazy` компоненти; обгорнути `element` адмінських маршрутів у `<Suspense fallback={...}>` на рівні батька `AdminLayout` (один fallback з `Skeleton`).

- [ ] **Step 3:** `vite.config.ts`:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('react-router')) {
          return 'react-vendor'
        }
        if (id.includes('@supabase')) return 'supabase'
        if (id.includes('@tanstack/react-query')) return 'query'
        if (id.includes('framer-motion') || id.includes('gsap')) return 'motion'
      },
    },
  },
},
```

- [ ] **Step 4:** `npm run build` — перевірити розміри у `dist/assets/*.js` (gzip вручну `gzip -c` або `vite-plugin-compression` — опційно).

- [ ] **Step 5:** Commit:

```bash
git add src/lib/lazyRoutes.ts src/router.tsx vite.config.ts
git commit -m "perf: lazy-load admin routes and manual chunks"
```

---

## Task 17: Шрифти self-host

**Files:**
- Modify: `src/index.css`
- Add: `public/fonts/*.woff2`

- [ ] **Step 1:** Завантажити WOFF2 для **Playfair Display** (400,600,700 + italic за потреби), **Inter** (400–700), **JetBrains Mono** (400–600) з [google-webfonts-helper](https://gwfh.mranftl.com/fonts) або `@fontsource` пакетів у `npm` + копіювати з `node_modules` у `public/fonts` скриптом — **не** залишати production на fonts.googleapis.com.

- [ ] **Step 2:** Прибрати рядок `@import url('https://fonts.googleapis.com/...')` з `index.css`.

- [ ] **Step 3:** Додати `@font-face` для кожної ваги з `font-display: swap`.

- [ ] **Step 4:** Commit:

```bash
git add public/fonts src/index.css
git commit -m "perf: self-host Playfair, Inter, JetBrains Mono"
```

---

## Task 18: Зображення (WebP + lazy)

**Files:**
- Modify: компоненти з фото: `ParticipantCard`, `BachelorCard`, `EpisodeCard` (якщо з’явиться image), адмін upload (за наявності) — `src/components/admin/*` з upload

- [ ] **Step 1:** Для `ParticipantCard` / `BachelorCard`: якщо `photoUrl` — рендерити `<picture><source type="image/webp" srcSet={photoUrl} />` **лише якщо** URL вже `.webp`; інакше залишити поточний background-image до появи pipeline конвертації.

- [ ] **Step 2:** Додати `loading="lazy"` для нативних `<img>` нижче fold.

- [ ] **Step 3:** У адмінському завантаженні (де використовується `react-dropzone`) після вибору файлу — canvas resize + `toBlob('image/webp', 0.75)` перед `upload` у Storage (окрема функція `src/lib/imageUploadWebp.ts`).

- [ ] **Step 4:** Commit:

```bash
git add src/components/ui/ParticipantCard.tsx src/lib/imageUploadWebp.ts
git commit -m "perf: webp upload helper and lazy images where applicable"
```

---

## Task 19: Lighthouse CI

**Files:**
- Create: `.github/workflows/lighthouse-ci.yml`

- [ ] **Step 1:** Workflow: checkout, `npm ci`, `npm run build`, `npm run preview &`, `npx @lhci/cli autorun` з конфігом URL `http://localhost:4173` (або preview порт Vite 4173). Assertions: `largest-contentful-paint` max 2500ms; `cumulative-layout-shift` max 0.1; `total-blocking-time` max 200ms; `script` resource size budget — налаштувати через `lighthouserc` під gzip estimate.

- [ ] **Step 2:** Документувати в `holostyak-tote/README.md` один рядок «Phase 8: Lighthouse CI» — лише якщо README вже очікує оновлення статусу фаз; інакше YAGNI.

- [ ] **Step 3:** Commit:

```bash
git add .github/workflows/lighthouse-ci.yml .lighthouserc.json
git commit -m "ci: Lighthouse budgets for LCP and bundle"
```

---

## Task 20: Accessibility — axe у Playwright

**Files:**
- Modify: `package.json` devDependencies `@axe-core/playwright`
- Create: `tests/e2e/a11y-landing.spec.ts`

- [ ] **Step 1:**

```ts
// tests/e2e/a11y-landing.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('landing has no serious a11y violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
})
```

- [ ] **Step 2:** Додати `focus-visible:ring-2 focus-visible:ring-amber-400` для інтерактивних елементів хедера, якщо axe скаржиться на контраст outline.

- [ ] **Step 3:** Commit:

```bash
git add package.json package-lock.json tests/e2e/a11y-landing.spec.ts
git commit -m "test(a11e): axe landing page"
```

---

## Task 21: Досягнення — cinematic toast

**Files:**
- Create: `src/hooks/useAchievementUnlockToasts.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1:** `useQuery` з `queryKey: ['notifications-unread-achievements', user?.id]`, `enabled: !!user`, `queryFn`: `supabase.from('notifications').select('id,title,body,metadata').eq('type','achievement_unlocked').eq('is_read', false).limit(5)`.

- [ ] **Step 2:** При появі нових `id` порівняно з `useRef` Set — `toast.custom((t) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>…</motion.div>, { duration: 6000 })` + `play('achievement')`.

- [ ] **Step 3:** Після показу — `update notifications set is_read = true` (якщо policy дозволяє) або залишити до ручного прочитання — узгодити з RLS.

- [ ] **Step 4:** Commit:

```bash
git add src/hooks/useAchievementUnlockToasts.ts src/App.tsx
git commit -m "feat(ui): cinematic toasts for achievement notifications"
```

---

## Task 22: PWA (опційно)

**Files:**
- Modify: `vite.config.ts`, `package.json`

- [ ] **Step 1:** `npm install -D vite-plugin-pwa` + базовий manifest (іконки з `public/`).

- [ ] **Step 2:** Offline fallback HTML «Нема інтернету».

- [ ] **Step 3:** Commit окремою гілкою або прапором `feat(pwa): vite-plugin-pwa offline shell`.

---

## Task 23: Фінальний QA + тег

**Files:** —

- [ ] **Step 1:** Повний `npm run test:e2e` на staging build.

- [ ] **Step 2:** Перевірка `prefers-reduced-motion` у Safari + Chrome.

- [ ] **Step 3:** Перевірка mute / unmute + autoplay policy на мобільному Safari.

- [ ] **Step 4:** `git tag phase-8-complete` після merge в main.

---

## Self-review (внутрішня перевірка плану)

1. **Покриття скелету:** Tasks 1–23 відповідають Tasks 1–21 скелету + розбиття на тести / achievement / PWA. `LightningPortal` покриває slide + звук `lightning` (Task 13 sound). `BalanceCard` + invalidate `profile` покриває rollup.  
2. **Placeholder scan:** Немає TBD; Sentry org/project брати з env; PNG/mp3 — явні README шляхи.  
3. **Узгодженість типів:** `SoundId` / `SOUNDS` / `play(id: SoundId)`; `bet_events.type === 'first_rose'` узгоджено з `database.types.ts` полем `type: string`.

---

**План збережено в `holostyak-tote/docs/superpowers/plans/2026-04-25-phase-8-motion-polish.md`. Два варіанти виконання:**

1. **Subagent-Driven (рекомендовано)** — окремий субагент на кожен Task, рев’ю між задачами. **Обов’язковий субскіл:** `superpowers:subagent-driven-development`.

2. **Inline Execution** — виконувати задачі в цій сесії пакетами з чекпойнтами. **Обов’язковий субскіл:** `superpowers:executing-plans`.

**Який варіант обираєте?**
