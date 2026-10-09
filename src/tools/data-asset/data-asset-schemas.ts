import { z } from 'zod'

export const listDataAssetOutputSchema = z.array(
    z.object({
        name: z.string().optional(),
        id: z.string().optional()
    })
)
