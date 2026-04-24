import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useNotifications } from '@/hooks/useNotifications'
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useSound } from '@/sound/useSound'

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: items = [], isFetched } = useNotifications()
  const unread = items.filter((n) => !n.is_read).length
  const markRead = useMarkNotificationRead()
  const { play } = useSound()
  const primedRef = useRef(false)
  const seenIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isFetched) return
    if (!primedRef.current) {
      for (const n of items) seenIdsRef.current.add(n.id)
      primedRef.current = true
      return
    }
    for (const n of items) {
      if (seenIdsRef.current.has(n.id)) continue
      seenIdsRef.current.add(n.id)
      if (n.type === 'achievement_unlocked' && !n.is_read) {
        play?.('achievement')
        toast.custom(
          () => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/30 bg-bg-card px-4 py-3 text-left shadow-lg"
            >
              <p className="text-xs uppercase tracking-wider text-primary-live">Досягнення</p>
              <p className="font-serif text-lg text-rose-cream">{n.title ?? 'Нове досягнення'}</p>
              {n.body ? <p className="mt-1 text-sm text-rose-dust">{n.body}</p> : null}
            </motion.div>
          ),
          { duration: 6000 },
        )
      }
    }
  }, [items, isFetched, play])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Сповіщення"
        className="relative rounded-lg border border-white/15 px-2 py-1.5 text-rose-dust hover:border-primary-live hover:text-primary-live"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <span aria-hidden>🔔</span>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <NotificationsDropdown
          items={items}
          onClose={() => setOpen(false)}
          onRead={(id) => {
            void markRead.mutateAsync(id)
          }}
        />
      ) : null}
    </div>
  )
}
