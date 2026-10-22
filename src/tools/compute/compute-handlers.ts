import { rawSpecName } from "../../uploads/parse";
import type { Uploads } from "../../uploads/schemas";
import type { JobCountByStatus } from "../jobs";
import { handleCountActiveJobsByCompute } from "../jobs/jobs-handlers";
import type { AzureCtx } from "../types";
import { assessReuse } from "./compute-assessment";
import {
    type ComputeAssessment,
    type ComputeNameCheck,
    type ComputeQuotaCheck,
    type ComputeSummary,
    type GetComputeInput,
    type ListComputeSummary,
    parseComputeSpec,
    type RenameCompute,
} from "./compute-schemas";
import { COMPUTE_NAME_REGEX, VM_INFO, suggestFreeNames, sanitizeName } from "./compute-utils";

interface QuotaCheck {
    used: number,
    limit: number
}

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

export async function getFamilyUsage(ctx: AzureCtx, family: string): Promise<QuotaCheck | undefined> {
    const ws = await ctx.client.workspaces.get(ctx.resourceGroup, ctx.workspaceName)
    for await (const u of ctx.client.usages.list(ws.location!)) {
        if (u.name?.value === family) return { used: u.currentValue ?? 0, limit: u.limit ?? 0 }
    }
    return undefined
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
    } catch { }

    return {
        assessed: true,
        result: assessReuse(parsed.value, existing, activeJobs),
    };
}

export async function handleCheckComputeQuota(ctx: AzureCtx, uploads: Uploads): Promise<ComputeQuotaCheck> {
    const parsed = parseComputeSpec(uploads.spec, uploads.overrides?.computeName)
    if (!parsed.ok) return { checked: false, error: parsed.error }
    const spec = parsed.value

    if (spec.tier === "low_priority") {
        return { checked: false, note: 'low_priority compute clusters are not supported in this iteration of the agent' }
    }

    const { family, cores } = VM_INFO[spec.size]
    const required = spec.max_instances * cores
    const usage = await getFamilyUsage(ctx, family)

    if (!usage) return { checked: false, note: "No quota information available for this family" }
    const available = usage.limit - usage.used

    return {
        checked: true,
        family,
        requiredCores: required,
        availableCores: available,
        sufficient: available >= required
    }
}

export async function handleCheckComputeName(ctx: AzureCtx, uploads: Uploads, name: string | undefined): Promise<ComputeNameCheck> {
    const candidate = name ?? (uploads.overrides?.computeName ?? rawSpecName(uploads.spec))
    if (!candidate) return { checked: false, error: "No name given, and none found in the attached spec" }

    const computes = await handleListComputes(ctx, 200)
    const taken = new Set(computes.map(c => c.name).filter((n): n is string => !!n))
    const existing = computes.find(c => c.name?.toLowerCase() === candidate.toLowerCase())
    const formatValid = COMPUTE_NAME_REGEX.test(candidate)

    return {
        checked: true,
        name: candidate,
        formatValid,
        formatRule: formatValid ? undefined : 'Must start with a letter; letters, digits and hyphens only; 2 to 24 characters',
        exists: !!existing,
        existing: existing ? { type: existing.type, vmSize: existing.vmSize, state: existing.state } : undefined,
        suggestions: !formatValid || existing ? suggestFreeNames(sanitizeName(candidate), taken) : [],
    }
}

export async function handleRenameComputeInSpec(ctx: AzureCtx, uploads: Uploads, newName: string): Promise<RenameCompute> {
    if (!uploads.spec) return { renamed: false, error: 'No YAML spec attached' }

    // same schema as the original, so format rules and every other rule still apply
    const trial = parseComputeSpec(uploads.spec, newName)
    if (!trial.ok) return { renamed: false, error: trial.error }

    const computes = await handleListComputes(ctx, 200)
    const taken = new Set(computes.map(c => c.name).filter((n): n is string => !!n))
    if ([...taken].some(n => n.toLowerCase() === newName.toLowerCase())) {
        return { renamed: false, error: `'${newName}' already exists`, suggestions: suggestFreeNames(sanitizeName(newName), taken) }
    }

    uploads.overrides = { ...uploads.overrides, computeName: newName }
    return {
        renamed: true,
        name: newName,
        note: 'The create step will use this name. The uploaded YAML file itself is unchanged.',
    }
}
