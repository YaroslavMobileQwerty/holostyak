import { z } from 'zod'

const ukrPhone = z.string().regex(/^\+380\d{9}$/, 'Формат телефону: +380 та 9 цифр')

export const deliveryFormBaseSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: ukrPhone,
  carrier: z.enum(['nova_poshta', 'ukr_poshta', 'manual']),
  city: z.string().max(120).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  branchNumber: z.string().max(32).optional().nullable(),
})

export type DeliveryFormValues = z.infer<typeof deliveryFormBaseSchema>

export const deliveryFormSchemaWithRefine = deliveryFormBaseSchema.superRefine((data, ctx) => {
  if (data.carrier === 'nova_poshta') {
    if (!data.city?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['city'], message: 'Вкажи місто для Нової Пошти' })
    }
    if (!data.branchNumber?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['branchNumber'],
        message: 'Вкажи номер відділення',
      })
    }
  } else if (data.carrier === 'ukr_poshta') {
    if (!data.address?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Повна адреса (індекс + відділення)' })
    }
  } else {
    if (!data.address?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Адреса для відправки' })
    }
  }
})

export function parseDeliveryToRpcJson(v: DeliveryFormValues) {
  return {
    first_name: v.firstName,
    last_name: v.lastName,
    phone: v.phone,
    carrier: v.carrier,
    address: v.address?.trim() ? v.address.trim() : null,
    city: v.city?.trim() ? v.city.trim() : null,
    branch_number: v.branchNumber?.trim() ? v.branchNumber.trim() : null,
  }
}
