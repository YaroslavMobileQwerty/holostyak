import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { useEpisode } from '@/hooks/useEpisode'
import { useProfile } from '@/hooks/useProfile'
import { useEpisodeBetEvents } from '@/hooks/useEpisodeBetEvents'
import { useMyBetsForEpisode } from '@/hooks/useMyBetsForEpisode'
import { useLightningEvents } from '@/hooks/useLightningEvents'
import { useAuth } from '@/hooks/useAuth'
import { useEpisodeRealtime } from '@/hooks/realtime/useEpisodeRealtime'
import { useLightningRealtime } from '@/hooks/realtime/useLightningRealtime'
import { useLiveEpisodePolling } from '@/hooks/useLiveEpisodePolling'
import { Skeleton } from '@/components/ui/Skeleton'
import { BetEventCard, type BetEventWithOptions } from '@/components/betting/BetEventCard'
import { LiveModeBanner } from '@/components/live/LiveModeBanner'
import { LiveStickyPanel } from '@/components/live/LiveStickyPanel'
import { LightningEventToast } from '@/components/live/LightningEventToast'
import { useSound } from '@/sound/useSound'

export function EpisodeDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { play } = useSound()
  const { data: episode, isLoading: le } = useEpisode(id)
  const { data: profile } = useProfile()
  const { data: betEvents, isLoading: lb } = useEpisodeBetEvents(id)
  const { data: myMap } = useMyBetsForEpisode(id)

  const isLive = episode?.status === 'live'
  const realtimeErrCount = useRef(0)
  const [wsFailed, setWsFailed] = useState(false)
  const [toastEvId, setToastEvId] = useState<string | null>(null)

  const { data: lightning, isLoading: lLightning } = useLightningEvents(id, {
    refetchIntervalMs: !user && isLive ? 30_000 : false,
  })

  const onRealtimeErr = useCallback(() => {
    realtimeErrCount.current += 1
    if (realtimeErrCount.current >= 3) {
      console.warn('[realtime] switching to polling fallback')
      setWsFailed(true)
    }
  }, [])

  const onNewLightning = useCallback((evId: string) => setToastEvId(evId), [])

  useEpisodeRealtime(id, { onChannelError: onRealtimeErr })
  useLightningRealtime(isLive ? id : undefined, {
    onChannelError: onRealtimeErr,
    onNewLightning,
  })

  useLiveEpisodePolling({
    episodeId: id,
    episodeIsLive: !!isLive,
    wsFailed: !!user && wsFailed,
  })

  const toastEv =
    toastEvId && lightning
      ? lightning.find((e) => e.id === toastEvId && e.status === 'open')
      : undefined

  const prevStatusByEventId = useRef<Map<string, string>>(new Map())
  useEffect(() => {
    if (!myMap) return
    const byId = new Map<string, BetEventWithOptions>()
    for (const e of betEvents ?? []) byId.set(e.id, e as BetEventWithOptions)
    for (const e of lightning ?? []) byId.set(e.id, e as BetEventWithOptions)
    void (async () => {
      const confetti = (await import('canvas-confetti')).default
      const { celebrationConfetti } = await import('@/motion/confettiTheme')
      const { fireRosePetals } = await import('@/motion/roseConfetti')
      for (const ev of byId.values()) {
        const was = prevStatusByEventId.current.get(ev.id)
        prevStatusByEventId.current.set(ev.id, ev.status)
        if (!was || was === 'resolved' || ev.status !== 'resolved') continue
        const mine = myMap.get(ev.id)
        if (!mine) continue
        if (mine.status === 'won') {
          confetti(celebrationConfetti())
          play?.('win')
          if (ev.type === 'first_rose') fireRosePetals()
        } else if (mine.status === 'lost') {
          play?.('lost')
        }
      }
    })()
  }, [betEvents, lightning, myMap, play])

  if (le) {
    return (
      <div className="py-10">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!episode) {
    return <p className="py-20 text-center text-rose-dust">Випуск не знайдено</p>
  }

  const seasonTitle =
    episode.season && typeof episode.season === 'object' && 'title' in episode.season
      ? (episode.season as { title: string }).title
      : 'Сезон'
  const balance = profile?.balance ?? 0
  const finalized = episode.status === 'finalized'

  return (
    <article className={`py-10 ${isLive ? 'pb-48 lg:pb-10 lg:pr-[22rem]' : ''}`}>
      {toastEv ? (
        <LightningEventToast
          title={toastEv.title}
          closesAt={toastEv.closes_at}
          onDismiss={() => setToastEvId(null)}
          onOpenBet={() => {
            document.getElementById('lightning-panel')?.scrollIntoView({ behavior: 'smooth' })
            setToastEvId(null)
          }}
        />
      ) : null}

      {isLive ? <LiveModeBanner /> : null}

      <p className="text-xs uppercase tracking-[0.3em] text-primary-live">
        {seasonTitle} · Випуск {episode.number}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{episode.title ?? `Випуск ${episode.number}`}</h1>
      {episode.airs_at && (
        <p className="mt-2 text-rose-dust">
          Ефір: {format(new Date(episode.airs_at), "d MMMM yyyy 'о' HH:mm", { locale: uk })}
        </p>
      )}

      <section className="mt-10">
        {lb ? <Skeleton className="h-32 w-full" /> : null}
        {!lb && !betEvents?.length ? (
          <div className="rounded-2xl border border-white/10 bg-bg-card p-8 text-center">
            <p className="font-serif text-2xl text-rose-dust">Ставки ще не опубліковано</p>
            <p className="mt-2 text-sm text-rose-dust/70">Слідкуйте за оновленнями випуску.</p>
          </div>
        ) : null}
        {!lb && betEvents?.length ? (
          <div className="space-y-6">
            {betEvents.map((ev) => {
              const b = myMap?.get(ev.id) ?? null
              return (
                <BetEventCard
                  key={ev.id}
                  ev={ev as BetEventWithOptions}
                  episodeStatus={episode.status}
                  balance={balance}
                  myBet={b}
                />
              )
            })}
          </div>
        ) : null}
        {finalized && betEvents?.length ? (
          <p className="mt-4 text-sm text-rose-dust">Випуск завершено — показано підсумки ставок.</p>
        ) : null}
      </section>

      {isLive ? (
        <LiveStickyPanel
          isLoading={lLightning}
          events={lightning as BetEventWithOptions[] | undefined}
          episodeStatus={episode.status}
          balance={balance}
          myMap={myMap}
        />
      ) : null}
    </article>
  )
}
