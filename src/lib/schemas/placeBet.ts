import { z } from 'zod'

export const placeBetSchema = z.object({
  amount: z.coerce.number().int().min(1),
})

export type PlaceBetFormValues = z.infer<typeof placeBetSchema>
