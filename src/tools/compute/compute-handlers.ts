import type { Uploads } from "../../uploads/schemas";
import type { JobCountByStatus } from "../jobs";
import { handleCountActiveJobsByCompute } from "../jobs/jobs-handlers";
import type { AzureCtx } from "../types";
import { assessReuse } from "./compute-assessment";
import {
    type ComputeAssessment,
    type ComputeSummary,
    type GetComputeInput,
    type ListComputeSummary,
    parseComputeSpec,
} from "./compute-schemas";

export async function handleListComputes(
    ctx: AzureCtx,
    max: number = 100,
): Promise<ListComputeSummary> {
    const computes: ListComputeSummary = [];

    for await (const compute of ctx.client.computeOperations.list(
        ctx.resourceGroup,
        ctx.workspaceName,
    )) {
        const baseProps: any = compute.properties;
        const innerProps: any = baseProps?.properties; // Inner configuration payload

        // Extract vmSize safely across different compute variants
        const vmSize = innerProps?.vmSize || baseProps?.vmSize;

        computes.push({
            name: compute.name || "",
            type: baseProps?.computeType,
            state: baseProps?.provisioningState,
            vmSize: vmSize,
            vmPriority: innerProps?.vmPriority,
            minNodes: innerProps?.scaleSettings?.minNodeCount,
            maxNodes: innerProps?.scaleSettings?.maxNodeCount,
            currentNodes: innerProps?.currentNodeCount,
        });

        if (computes.length >= max) {
            break;
        }
    }

    return computes;
}

export async function handleGetComputeState(
    ctx: AzureCtx,
    params: GetComputeInput,
): Promise<ComputeSummary> {
    try {
        const compute = await ctx.client.computeOperations.get(
            ctx.resourceGroup,
            ctx.workspaceName,
            params.name,
        );
        const baseProps: any = compute.properties;
        const innerProps: any = baseProps?.properties;

        // Extract vmSize safely across different compute variants
        const vmSize = innerProps?.vmSize || baseProps?.vmSize;

        return {
            found: true as const,
            name: compute.name || "",
            type: baseProps?.computeType,
            state: baseProps?.provisioningState,
            vmSize: vmSize,
            vmPriority: innerProps?.vmPriority,
            minNodes: innerProps?.scaleSettings?.minNodeCount,
            maxNodes: innerProps?.scaleSettings?.maxNodeCount,
            currentNodes: innerProps?.currentNodeCount,
        };
    } catch (e: any) {
        if (e?.statusCode === 404) return { found: false as const, name: params.name };
        throw e;
    }
}

export async function handleAssessComputeReuse(
    ctx: AzureCtx,
    upload: Uploads,
): Promise<ComputeAssessment> {
    const parsed = parseComputeSpec(upload.spec, upload.overrides?.computeName);
    if (!parsed.ok) return { assessed: false, error: parsed.error };

    const existing = await handleListComputes(ctx, 200);
    let activeJobs: JobCountByStatus | undefined;

    try {
        activeJobs = await handleCountActiveJobsByCompute(ctx);
    } catch {}

    return {
        assessed: true,
        result: assessReuse(parsed.value, existing, activeJobs),
    };
}
