import { useState } from 'react'
import { toast } from 'sonner'
import { useGrantCoinsManual } from '@/hooks/admin/useGrantCoinsManual'
import { useAdminUserActions } from '@/hooks/admin/useAdminUserActions'
import type { AdminListUserRow } from '@/hooks/admin/useAdminListUsers'

const reasonMin = 3

export function UserActionsPanel({ user, isSelf }: { user: AdminListUserRow; isSelf: boolean }) {
  const { ban, unban, setRole, forceNickname } = useAdminUserActions(user.id)
  const grant = useGrantCoinsManual()
  const [reason, setReason] = useState('')
  const [nick, setNick] = useState(user.nickname ?? '')
  const [delta, setDelta] = useState('0')
  const [note, setNote] = useState('')

  if (isSelf) {
    return <p className="text-sm text-rose-dust">Мутації для власного акаунта вимкнено.</p>
  }

  return (
    <div className="space-y-6 text-sm text-rose-cream">
      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-xs uppercase text-rose-dust">Бан / розбан</p>
        <label className="mt-2 block text-xs">Причина (мін. {reasonMin} символи)</label>
        <textarea
          className="mt-1 w-full rounded border border-white/15 bg-bg-base px-2 py-2 text-rose-cream"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-red-800 px-3 py-1.5 text-white disabled:opacity-50"
            disabled={ban.isPending || user.is_banned}
            onClick={async () => {
              if (reason.trim().length < reasonMin) {
                toast.error('Вкажіть причину')
                return
              }
              try {
                await ban.mutateAsync({ p_target_id: user.id, p_reason: reason.trim() })
                toast.success('Акаунт обмежено')
                setReason('')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Забанити
          </button>
          <button
            type="button"
            className="rounded border border-white/20 px-3 py-1.5 disabled:opacity-50"
            disabled={unban.isPending || !user.is_banned}
            onClick={async () => {
              try {
                await unban.mutateAsync(user.id)
                toast.success('Обмеження знято')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Розбан
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-xs uppercase text-rose-dust">Роль</p>
        <p className="mt-1 text-rose-dust/80">Неможливо зняти останнього адміна.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-white/20 px-3 py-1.5"
            disabled={setRole.isPending}
            onClick={async () => {
              const next = user.role === 'admin' ? 'user' : 'admin'
              try {
                await setRole.mutateAsync({ p_target_id: user.id, p_role: next })
                toast.success('Роль оновлено')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            {user.role === 'admin' ? 'Зняти admin' : 'Надати admin'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-xs uppercase text-rose-dust">Нік (примусово)</p>
        <input
          className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 rounded bg-primary px-3 py-1.5 text-white"
          disabled={forceNickname.isPending}
          onClick={async () => {
            try {
              await forceNickname.mutateAsync({ p_target_id: user.id, p_nickname: nick })
              toast.success('Нік оновлено')
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Помилка')
            }
          }}
        >
          Зберегти нік
        </button>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="text-xs uppercase text-rose-dust">Бали (admin)</p>
        <input
          type="number"
          className="mt-2 w-32 rounded border border-white/15 bg-bg-base px-2 py-1 font-mono"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
        />
        <textarea
          className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
          rows={2}
          placeholder="Примітка (обовʼязкова)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 rounded bg-primary px-3 py-1.5 text-white disabled:opacity-50"
          disabled={grant.isPending}
          onClick={async () => {
            const d = Number.parseInt(delta, 10)
            if (d === 0 || Number.isNaN(d) || note.trim().length < 2) {
              toast.error('Ненульова сума і примітка')
              return
            }
            try {
              await grant.mutateAsync({ targetUserId: user.id, delta: d, note: note.trim() })
              toast.success('Готово')
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Помилка')
            }
          }}
        >
          Застосувати
        </button>
      </div>
    </div>
  )
}
