import { useMemo, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import type { Tables } from '@/lib/database.types'
import { useCoinTransactions } from '@/hooks/useCoinTransactions'
import { Skeleton } from '@/components/ui/Skeleton'

type Row = Tables<'coin_transactions'>

const KIND_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Усі типи' },
  { value: 'purchase_approved', label: 'Поповнення' },
  { value: 'admin_grant', label: 'Нарахування адміна' },
  { value: 'admin_deduct', label: 'Списання адміна' },
  { value: 'bet_placed', label: 'Ставка' },
  { value: 'bet_won', label: 'Виграш' },
  { value: 'bet_refund', label: 'Повернення' },
]

function kindLabel(kind: string): string {
  return KIND_OPTIONS.find((k) => k.value === kind)?.label ?? kind
}

const col = createColumnHelper<Row>()

export function LedgerList() {
  const [kind, setKind] = useState<string>('')
  const [page, setPage] = useState(0)
  const filterKind = kind || null
  const { data, isLoading } = useCoinTransactions(filterKind, page)

  const columns = useMemo(
    () => [
      col.accessor('created_at', {
        header: 'Дата',
        cell: (info) =>
          format(new Date(info.getValue()), 'd MMM yyyy, HH:mm', { locale: uk }),
      }),
      col.accessor('kind', {
        header: 'Тип',
        cell: (info) => kindLabel(info.getValue()),
      }),
      col.accessor('delta', {
        header: 'Зміна',
        cell: (info) => {
          const v = info.getValue()
          return (
            <span className={v >= 0 ? 'text-emerald-300' : 'text-rose-400'}>
              {v > 0 ? `+${v}` : v}
            </span>
          )
        },
      }),
      col.accessor('balance_after', {
        header: 'Після',
        cell: (info) => <span className="font-mono">{info.getValue()}</span>,
      }),
      col.accessor('note', {
        header: 'Примітка',
        cell: (info) => info.getValue() ?? '—',
      }),
    ],
    [],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table hook API
  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading && !data)
    return (
      <div className="mt-8 space-y-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-64" />
      </div>
    )

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-rose-cream">Історія операцій</h2>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value)
            setPage(0)
          }}
          className="rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-bg-elevated/80 text-xs uppercase tracking-wider text-rose-dust">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-rose-dust">
                  Поки що немає записів
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-rose-dust">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-rose-dust">
        <span>
          Сторінка {page + 1} з {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-white/15 px-3 py-1 disabled:opacity-40"
          >
            Назад
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/15 px-3 py-1 disabled:opacity-40"
          >
            Далі
          </button>
        </div>
      </div>
    </section>
  )
}
