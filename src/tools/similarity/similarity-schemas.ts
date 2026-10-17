import { z } from 'zod'

export const similarityMatchSchema = z.object({
    name: z.string(),
    similarity: z.float32(),
    exactName: z.boolean().optional(),
    versionCount: z.number().optional(),
    latestVersions: z.array(z.string()).optional(),
    nextFreeVersion: z.string().optional()
})
export type SimilarityMatch = z.infer<typeof similarityMatchSchema>

export const detailedSimilarityMatchSchema = z.object({
    searched: z.string(),
    kind: z.string(),
    totalAssetNames: z.number(),
    matches: z.array(similarityMatchSchema),
    otherSimilarNames: z.array(similarityMatchSchema)
})
export type DetailedSimilarityMatch = z.infer<typeof detailedSimilarityMatchSchema>
