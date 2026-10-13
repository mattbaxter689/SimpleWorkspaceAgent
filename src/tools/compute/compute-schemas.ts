import { z } from 'zod'

export const computeSummaryOutputSchema = z.object({
    found: z.boolean().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    state: z.string().optional(),
    vmSize: z.string().optional(),
    vmPriority: z.string().optional(),
    minNodes: z.number().optional(),
    maxNodes: z.number().optional(),
    currentNodes: z.number().optional()
})
export const listComputeSummaryOutputSchema = z.array(computeSummaryOutputSchema)
export type ListComputeSummaryOutput = z.infer<typeof listComputeSummaryOutputSchema>
export type ComputeSummaryOutput = z.infer<typeof computeSummaryOutputSchema>

export const getComputeInputSchema = z.object({
    name: z.string().describe("The name of the compute target to fetch information for")
})
export type GetComputeInput = z.infer<typeof getComputeInputSchema>
