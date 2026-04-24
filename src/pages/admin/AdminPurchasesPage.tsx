import { PurchaseQueueTable } from '@/components/admin/PurchaseQueueTable'

export function AdminPurchasesPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Заявки на поповнення</h1>
      <p className="mt-2 text-sm text-rose-dust">Перегляньте скріншот і підтвердіть або відхиліть заявку.</p>
      <div className="mt-8">
        <PurchaseQueueTable />
      </div>
    </div>
  )
}
