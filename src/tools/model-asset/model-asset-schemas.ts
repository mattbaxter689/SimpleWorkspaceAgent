import { z } from 'zod'

export const modelAssetOutputSchema = z.object({
    name: z.string().optional(),
    latestVersion: z.string().optional(),
    isArchived: z.boolean().optional(),
    tags: z.record(z.string(), z.string().nullable()).optional(),
    createdAt: z.string().optional()
})


// Tool output types
export const listModelAssetOutputSchema = z.array(modelAssetOutputSchema)


// Input Schemas for typing
export const getLatestModelAssetInputSchema = z.object({
    name: z.string().describe("The name of the model asset")
})


// Input schemas for typing
export type GetLatestModelAssetInput = z.infer<typeof getLatestModelAssetInputSchema>

// Output schemas for typing
export type ListModelAssetOutput = z.infer<typeof listModelAssetOutputSchema>
export type ModelAssetOutput = z.infer<typeof modelAssetOutputSchema>

