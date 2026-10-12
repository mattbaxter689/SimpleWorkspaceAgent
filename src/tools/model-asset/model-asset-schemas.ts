import { z } from 'zod'


// Tool output types
export const listModelAssetOutputSchema = z.array(
    z.object({
        name: z.string().optional(),
        latestVersion: z.string().optional(),
        isArchived: z.boolean().optional(),
        tags: z.record(z.string(), z.string().nullable()).optional(),
        createdAt: z.string().optional()
    }))


// Input Schemas for typing


// Output schemas for typing
export type ListModelAssetOutput = z.infer<typeof listModelAssetOutputSchema>
