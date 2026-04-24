import { z } from 'zod'

const isoDatetime = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Некоректна дата')

export const betEventSchema = z.object({
  episodeId: z.string().uuid(),
  type: z.enum(['eliminated', 'first_rose', 'tete_a_tete', 'season_winner', 'custom', 'lightning']),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  bachelorId: z.string().uuid().nullable().optional(),
  opensAt: isoDatetime.optional(),
  closesAt: isoDatetime,
  maxBetAmount: z.coerce.number().int().min(1).optional().nullable(),
  isMultiChoice: z.boolean().optional(),
})

export type BetEventFormValues = z.infer<typeof betEventSchema>
