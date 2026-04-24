import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

const ORDER = ['draft', 'open', 'locked', 'live', 'finalized'] as const
type EpiStatus = (typeof ORDER)[number]

function isEpiStatus(s: string): s is EpiStatus {
  return (ORDER as readonly string[]).includes(s)
}

export function EpisodeStatusControl({ episodeId, status }: { episodeId: string; status: string }) {
  const qc = useQueryClient()
  if (!isEpiStatus(status)) return null
  const idx = ORDER.indexOf(status)
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  const prev = idx > 0 ? ORDER[idx - 1] : null

  const go = async (s: EpiStatus) => {
    const { error } = await supabase.from('episodes').update({ status: s }).eq('id', episodeId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Статус оновлено')
    void qc.invalidateQueries({ queryKey: ['episode', episodeId] })
    void qc.invalidateQueries({ queryKey: ['adminEpisodes'] })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-rose-dust">Статус випуску: {status}</span>
      {next ? (
        <button
          type="button"
          onClick={() => void go(next)}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-sm text-rose-cream"
        >
          → {next}
        </button>
      ) : null}
      {prev && status !== 'finalized' ? (
        <button
          type="button"
          onClick={() => void go(prev)}
          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-rose-dust"
        >
          Назад: {prev}
        </button>
      ) : null}
    </div>
  )
}
