import type { AzureCtx } from "../types";
import type { ListComputeSummary, ComputeSummary, GetComputeInput } from "./compute-schemas";

export async function handleListComputes(ctx: AzureCtx, max: number = 100): Promise<ListComputeSummary> {
    const computes: ListComputeSummary = []

    for await (const compute of ctx.client.computeOperations.list(ctx.resourceGroup, ctx.workspaceName)) {
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

export async function handleGetComputeState(ctx: AzureCtx, params: GetComputeInput): Promise<ComputeSummary> {
    try {
        const compute = await ctx.client.computeOperations.get(ctx.resourceGroup, ctx.workspaceName, params.name)
        const baseProps: any = compute.properties;
        const innerProps: any = baseProps?.properties; // Inner configuration payload

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
        }
    } catch (e: any) {
        if (e?.statusCode === 404) return { found: false as const, name: params.name }
        throw e
    }
}
