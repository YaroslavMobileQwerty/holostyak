import { z } from 'zod'

export const purchaseRequestSchema = z.object({
  amount: z.coerce.number().int().min(1, 'Мінімум 1 грн'),
  userComment: z.string().max(500).optional(),
  screenshot: z
    .instanceof(File, { message: 'Додай скрін' })
    .refine((f) => f.size < 5_000_000, 'Максимум 5 МБ')
    .refine((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type), 'Лише JPG/PNG/WebP'),
})

export type PurchaseRequestFormValues = z.infer<typeof purchaseRequestSchema>
