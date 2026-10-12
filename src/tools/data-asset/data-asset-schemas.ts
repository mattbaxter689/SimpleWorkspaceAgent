import { z } from 'zod'


// Tool input types
export const getLatestDataAssetInputSchema = z.object({
    name: z.string().describe("The name of the data asset")
})

// Tool output types
export const listDataAssetOutputSchema = z.array(
    z.object({
        name: z.string().optional(),
        id: z.string().optional()
    })
)

export const getLatestDataAssetOutputSchema = z.object({
    version: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    dataType: z.string().optional(),
    createdAt: z.string().optional()
})

// Input Schemas for typing
export type GetLatestDataAssetInput = z.infer<typeof getLatestDataAssetInputSchema>

// Output schemas for typing
export type GetLatestDataAssetOutput = z.infer<typeof getLatestDataAssetOutputSchema>
export type ListDataAssetOutputSchema = z.infer<typeof listDataAssetOutputSchema>
