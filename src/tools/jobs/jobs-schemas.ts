import { z } from 'zod'

export const jobSummarySchema = z.object({
    found: z.boolean().optional(),
    name: z.string().optional(),
    displayName: z.string().optional(),
    experimentName: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    compute: z.string().optional(),
    createdAt: z.string().optional()
})
export type JobSummary = z.infer<typeof jobSummarySchema>

export const listJobSummarySchema = z.array(jobSummarySchema)
export type ListJobSummary = z.infer<typeof listJobSummarySchema>

export const parsedJobListSchema = z.object({
    jobs: listJobSummarySchema,
    totalMatches: z.number(),
    scanned: z.number(),
    truncated: z.boolean()
})
export type ParsedJobList = z.infer<typeof parsedJobListSchema>

export const getJobSchema = z.object({
    name: z.string().describe("The name of the job to fetch information for")
})
export type GetJob = z.infer<typeof getJobSchema>


const STATUSES = [
    'NotStarted', 'Starting', 'Provisioning', 'Preparing', 'Queued', 'Running',
    'Finalizing', 'Completed', 'Failed', 'Canceled',
] as const

export const filterJobSchema = z.object({
    status: z.enum(STATUSES).optional(),
    compute: z.string().optional(),
    experiment: z.string().optional(),
    limit: z.number()
})
export type FilterJob = z.infer<typeof filterJobSchema>

export const jobCountByStatusSchema = z.record(z.string(), z.number())
export type JobCountByStatus = z.infer<typeof jobCountByStatusSchema>
