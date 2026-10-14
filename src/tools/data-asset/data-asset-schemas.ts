import { z } from 'zod'


// Tool input types
export const getLatestDataAssetName = z.object({
    name: z.string().describe("The name of the data asset")
})

// Tool output types
export const listDataAssetSchema = z.array(
    z.object({
        name: z.string().optional(),
        id: z.string().optional()
    })
)

export const getLatestDataAssetSchema = z.object({
    version: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    dataType: z.string().optional(),
    createdAt: z.string().optional()
})

// Input Schemas for typing
export type GetLatestDataAssetName = z.infer<typeof getLatestDataAssetName>

// Output schemas for typing
export type GetLatestDataAsset = z.infer<typeof getLatestDataAssetSchema>
export type ListDataAsset = z.infer<typeof listDataAssetSchema>
