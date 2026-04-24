import { z } from 'zod'

export const betOptionSchema = z.object({
  eventId: z.string().uuid(),
  customLabel: z.string().min(1).max(100),
  participantId: z.string().uuid().nullable().optional(),
  odds: z.coerce.number().min(1.01).max(100),
  orderIndex: z.coerce.number().int().min(0).optional(),
})

export type BetOptionFormValues = z.infer<typeof betOptionSchema>
