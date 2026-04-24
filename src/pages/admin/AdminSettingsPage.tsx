import { useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppSettings } from '@/hooks/useAppSettings'
import { uploadParticipantPhoto } from '@/lib/adminUploadPhoto'
import type { Json } from '@/lib/database.types'
import { Skeleton } from '@/components/ui/Skeleton'

const KEYS = [
  'donation_jar_url',
  'donation_card',
  'donation_disclaimer',
  'donation_qr_url',
  'bet_close_minutes',
  'active_season_id',
] as const

const labels: Record<(typeof KEYS)[number], string> = {
  donation_jar_url: 'Посилання банка (JAR URL)',
  donation_card: 'Карта (текст)',
  donation_disclaimer: 'Дисклеймер',
  donation_qr_url: 'QR-зображення (URL після upload)',
  bet_close_minutes: 'Хвилин до закриття ставок',
  active_season_id: 'ID активного сезону (обережно!)',
}

function asFormValue(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && v && 'toString' in v) return String(v)
  return JSON.stringify(v)
}

export function AdminSettingsPage() {
  const { data: all, isLoading } = useAppSettings()
  const qc = useQueryClient()
  const [confirmSeason, setConfirmSeason] = useState(false)
  const save = useMutation({
    mutationFn: async (args: { key: (typeof KEYS)[number]; value: Json }) => {
      const { error } = await supabase.rpc('admin_update_app_setting', {
        p_key: args.key,
        p_value: args.value,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['appSettings'] })
    },
  })
  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Налаштування</h1>
      <p className="mt-1 text-sm text-rose-dust">Значення пишуться в app_settings (JSON) через RPC.</p>
      <div className="mt-6 max-w-2xl space-y-4">
        {KEYS.map((key) => {
          const val = asFormValue(all?.[key] ?? null)
          return (
            <div key={key} className="rounded border border-white/10 p-4">
              <label className="text-xs text-rose-dust">{labels[key]}</label>
              {key === 'active_season_id' ? (
                <p className="mb-1 text-xs text-amber-300/90">
                  Зміна ID сезону може зламати лідерборди. Потрібне друге натискання.
                </p>
              ) : null}
              {key === 'donation_qr_url' ? (
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      try {
                        const url = await uploadParticipantPhoto(f)
                        const j = url as unknown as Json
                        await save.mutateAsync({ key, value: j })
                        toast.success('QR URL збережено')
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Помилка')
                      }
                    }}
                  />
                </div>
              ) : null}
              {key === 'active_season_id' ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    className="w-full rounded border border-white/15 bg-bg-base px-2 py-1 font-mono text-sm"
                    defaultValue={val}
                    id={`field-${key}`}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded border border-amber-500/50 px-2 py-1 text-xs"
                    onClick={() => setConfirmSeason((c) => !c)}
                  >
                    {confirmSeason ? 'Скасувати' : 'Увімкнути збереження'}
                  </button>
                </div>
              ) : (
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-bg-base px-2 py-1 text-sm"
                  defaultValue={val}
                  id={`field-${key}`}
                />
              )}
              {key === 'active_season_id' ? (
                <button
                  type="button"
                  disabled={!confirmSeason || save.isPending}
                  className="mt-2 rounded bg-amber-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  onClick={async () => {
                    const el = document.getElementById(`field-${key}`) as HTMLInputElement
                    if (!el) return
                    const s = el.value.trim()
                    if (s.length < 1) {
                      toast.error('Порожнє')
                      return
                    }
                    try {
                      await save.mutateAsync({ key, value: s as unknown as Json })
                      toast.success('Збережено')
                      setConfirmSeason(false)
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Помилка')
                    }
                  }}
                >
                  Підтвердити ID сезону
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-2 rounded bg-primary px-3 py-1.5 text-sm text-white"
                  disabled={save.isPending}
                  onClick={async () => {
                    const el = document.getElementById(`field-${key}`) as HTMLInputElement
                    if (!el) return
                    const raw = el.value
                    const value: Json =
                      key === 'bet_close_minutes'
                        ? (Number.parseInt(raw, 10) as unknown as Json)
                        : (raw as unknown as Json)
                    if (key === 'bet_close_minutes' && Number.isNaN(Number(value))) {
                      toast.error('Число')
                      return
                    }
                    try {
                      await save.mutateAsync({ key, value })
                      toast.success('Збережено')
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Помилка')
                    }
                  }}
                >
                  Зберегти
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
