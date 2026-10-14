import { jobCountByStatusSchema, type FilterJob, type GetJob, type JobCountByStatus, type JobSummary, type ListJobSummary, type ParsedJobList } from "./jobs-schemas";
import type { AzureCtx } from "../types";
import type { JobBase } from "@azure/arm-machinelearning";

const MAX_SCAN = 100
const ACTIVE = new Set(['Starting', 'Provisioning', 'Preparing', 'Queued', 'Running', 'Finalizing'])

const lastSegment = (id?: string) => id?.split("/").filter(Boolean).pop()

function summarizeJob(job: JobBase): JobSummary {
    const baseProps: any = job.properties
    return {
        name: job.name,
        displayName: baseProps.displayName,
        experimentName: baseProps.experimentName,
        type: baseProps.jobType,
        status: baseProps.status,
        compute: lastSegment(baseProps.computeId),
        createdAt: job.systemData?.createdAt?.toISOString()
    }

}

export async function handleGetJob(ctx: AzureCtx, params: GetJob): Promise<JobSummary> {
    try {
        const job = await ctx.client.jobs.get(ctx.resourceGroup, ctx.workspaceName, params.name)

        let summary = summarizeJob(job)
        return summary
    } catch (e: any) {
        if (e?.statusCode === 404) return { found: false as const, name: params.name }
        throw e
    }
}

export async function handleCountActiveJobsByCompute(ctx: AzureCtx): Promise<JobCountByStatus> {
    let counts = new Map<string, number>()
    let scanned = 0

    for await (const job of ctx.client.jobs.list(ctx.resourceGroup, ctx.workspaceName)) {
        if (++scanned > MAX_SCAN) break

        const summary = summarizeJob(job)
        if (summary.compute && summary.status && ACTIVE.has(summary.status)) counts.set(summary.compute, (counts.get(summary.compute) ?? 0) + 1)
    }
    const computeCounts: JobCountByStatus = jobCountByStatusSchema.parse(counts)
    return computeCounts
}

export async function handleListJobs(ctx: AzureCtx, filter: FilterJob): Promise<ParsedJobList> {
    const matches: ListJobSummary = []
    let scanned = 0
    let truncated = false

    for await (const job of ctx.client.jobs.list(ctx.resourceGroup, ctx.workspaceName)) {
        if (++scanned > MAX_SCAN) { truncated = true; break }

        const summary = summarizeJob(job)
        if (filter.status && summary.status !== filter.status) continue
        if (filter.compute && summary.compute?.toLowerCase() !== filter.compute.toLowerCase()) continue
        if (filter.experiment && summary.experimentName?.toLowerCase() !== filter.experiment.toLowerCase()) continue
        matches.push(summary)
    }

    matches.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return { jobs: matches.slice(0, filter.limit), totalMatches: matches.length, scanned, truncated }
}
