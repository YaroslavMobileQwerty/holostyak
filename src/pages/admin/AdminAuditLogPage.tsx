import { useState } from 'react'
import { useAdminAuditLog } from '@/hooks/admin/useAdminAuditLog'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminAuditLogPage() {
  const [action, setAction] = useState('')
  const [adminId, setAdminId] = useState('')
  const { data, isLoading } = useAdminAuditLog({ action, adminId })

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Журнал аудиту</h1>
      <div className="mt-4 flex max-w-2xl flex-col gap-2 sm:flex-row">
        <input
          placeholder="action"
          className="rounded border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <input
          placeholder="admin_id (uuid)"
          className="rounded border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
        />
      </div>
      {isLoading ? <Skeleton className="mt-6 h-64" /> : null}
      <div className="mt-6 overflow-x-auto">
        {data && data.length > 0 ? (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-rose-dust">
                <th className="px-2 py-2">Час</th>
                <th>Action</th>
                <th>Target</th>
                <th>ID</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-2 py-2 font-mono text-xs text-rose-dust">{r.created_at}</td>
                  <td>{r.action}</td>
                  <td>{r.target_type}</td>
                  <td className="max-w-[120px] truncate font-mono text-xs">{r.target_id ?? '—'}</td>
                  <td className="max-w-sm">
                    <pre className="max-h-32 overflow-x-auto overflow-y-auto text-[11px] text-rose-cream/90">
                      {r.payload == null ? '—' : JSON.stringify(r.payload, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isLoading ? null : (
          <p className="text-rose-dust">Порожньо</p>
        )}
      </div>
    </div>
  )
}
