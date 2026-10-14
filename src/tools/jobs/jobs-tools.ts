import { tool } from 'ai'
import type { ToolDeps } from '../types'
import { filterJobSchema, getJobSchema, jobSummarySchema, parsedJobListSchema } from './jobs-schemas'
import { handleGetJob, handleListJobs } from './jobs-handlers'

export const createJobTools = ({ azureCtx }: ToolDeps) => ({
    listJobs: tool({
        description:
            'List recent jobs, newest first. Optionally filter by status, compute name or experiment name. ' +
            'Returns metadata only (no logs or metrics).',
        inputSchema: filterJobSchema,
        outputSchema: parsedJobListSchema,
        execute: (filter) => handleListJobs(azureCtx, filter)
    }),

    getJobStatus: tool({
        description:
            'Get one job by its name (the job id, not the display name): status, type, experiment, compute, ' +
            'description and tags. To investigate a failure, follow up with getComputeStatus on the job\'s compute.',
        inputSchema: getJobSchema,
        outputSchema: jobSummarySchema,
        execute: (params) => handleGetJob(azureCtx, params)
    }),
})
