import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { betEventSchema } from '@/lib/schemas/betEvent'
import { useCreateBetEvent } from '@/hooks/admin/useCreateBetEvent'
import { toast } from 'sonner'

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Fv = {
  type: 'eliminated' | 'first_rose' | 'tete_a_tete' | 'season_winner' | 'custom' | 'lightning'
  title: string
  description: string
  closesAt: string
  maxBet: string
  isMultiChoice: boolean
}

export function BetEventForm({ episodeId, onCreated }: { episodeId: string; onCreated?: () => void }) {
  const create = useCreateBetEvent()
  const [defaultValues] = useState<Fv>(() => ({
    type: 'custom',
    title: '',
    description: '',
    closesAt: toLocalInput(new Date(Date.now() + 86_400_000)),
    maxBet: '',
    isMultiChoice: false,
  }))
  const form = useForm<Fv>({
    defaultValues,
  })

  return (
    <form
      className="rounded-xl border border-white/10 bg-bg-elevated/50 p-4"
      onSubmit={form.handleSubmit(async (raw) => {
        const parsed = betEventSchema.safeParse({
          episodeId,
          type: raw.type,
          title: raw.title,
          description: raw.description || undefined,
          closesAt: new Date(raw.closesAt).toISOString(),
          isMultiChoice: raw.isMultiChoice,
          maxBetAmount: raw.maxBet.trim() === '' ? undefined : Number(raw.maxBet),
        })
        if (!parsed.success) {
          toast.error('Перевірте поля форми')
          return
        }
        const v = parsed.data
        try {
          await create.mutateAsync({
            episode_id: v.episodeId,
            type: v.type,
            title: v.title,
            description: v.description ?? null,
            bachelor_id: v.bachelorId ?? null,
            opens_at: new Date().toISOString(),
            closes_at: v.closesAt,
            status: 'open',
            is_multi_choice: v.isMultiChoice ?? false,
            max_bet_amount: v.maxBetAmount ?? null,
          })
          toast.success('Подію створено')
          form.reset(defaultValues)
          onCreated?.()
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Помилка')
        }
      })}
    >
      <p className="font-medium text-rose-cream">Нова подія</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="text-rose-dust">Тип</span>
          <select
            className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2"
            {...form.register('type')}
          >
            <option value="custom">Custom</option>
            <option value="eliminated">Виліт</option>
            <option value="first_rose">Перша троянда</option>
            <option value="tete_a_tete">Побачення</option>
            <option value="season_winner">Переможець сезону</option>
            <option value="lightning">Несподіванка</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-rose-dust">Закриває прий</span>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2"
            {...form.register('closesAt')}
          />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-rose-dust">Назва</span>
        <input
          className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2"
          {...form.register('title')}
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-rose-dust">Max ставка (порожньо = без ліміту)</span>
        <input className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2" {...form.register('maxBet')} />
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm text-rose-dust">
        <input type="checkbox" {...form.register('isMultiChoice')} />
        Кілька переможців
      </label>
      <button
        type="submit"
        disabled={create.isPending}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Створити і відкрити прий
      </button>
    </form>
  )
}
