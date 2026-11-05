import type { AzureCtx } from "../types";
import { type ValidatedComputeSpec } from "./compute-schemas";

export const ALLOWED_VM_SIZES = ["Standard_DS3_v2", "Standard_E4ds_v4"] as const;
export const MAX_NODES = 8;
export const COMPUTE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{1,23}$/;
export const VM_INFO: Record<(typeof ALLOWED_VM_SIZES)[number], { family: string; cores: number }> =
    {
        Standard_DS3_v2: { family: "standardDSv2Family", cores: 4 },
        Standard_E4ds_v4: { family: "standardEdsv4Family", cores: 4 },
    };

export interface QuotaCheck {
    used: number;
    limit: number;
}

export const sanitizeName = (n: string) => {
    const s = n.replace(/[^a-zA-Z0-9-]/g, "-").replace(/^[^a-zA-Z]+/, "");
    return (s || "compute").slice(0, 21);
};

export function suggestFreeNames(base: string, taken: Set<string>, count = 3): string[] {
    const lower = new Set([...taken].map((n) => n.toLowerCase()));
    const root = base.replace(/-\d+$/, "");
    const out: string[] = [];
    for (let i = 2; out.length < count && i < 100; i++) {
        const suffix = `-${i}`;
        const candidate = root.slice(0, 24 - suffix.length) + suffix;
        if (!lower.has(candidate.toLowerCase()) && COMPUTE_NAME_REGEX.test(candidate))
            out.push(candidate);
    }
    return out;
}

export async function getFamilyUsage(
    ctx: AzureCtx,
    family: string,
): Promise<QuotaCheck | undefined> {
    const ws = await ctx.client.workspaces.get(ctx.resourceGroup, ctx.workspaceName);
    for await (const u of ctx.client.usages.list(ws.location!)) {
        if (u.name?.value === family) return { used: u.currentValue ?? 0, limit: u.limit ?? 0 };
    }
    return undefined;
}

// Moving the below functions to utils. Trying to clean up what is in the handlers file
export async function checkComputeExists(ctx: AzureCtx, name: string): Promise<boolean> {
    try {
        await ctx.client.computeOperations.get(ctx.resourceGroup, ctx.workspaceName, name);
        return true;
    } catch (e: any) {
        if (e?.statusCode === 404) return false;
        throw e;
    }
}

function secondsToIsoDuration(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    let out = "PT";
    if (h) out += `${h}H`;
    if (m) out += `${m}M`;
    if (s || out === "PT") out += `${s}S`;
    return out;
}

export async function startComputeCreation(
    ctx: AzureCtx,
    spec: ValidatedComputeSpec,
): Promise<string | undefined> {
    const ws = await ctx.client.workspaces.get(ctx.resourceGroup, ctx.workspaceName);

    // await ctx.client.computeOperations.beginCreateOrUpdate(ctx.resourceGroup, ctx.workspaceName, spec.name, {
    //     location: ws.location,
    //     properties: {
    //         computeType: "AmlCompute",
    //         description: spec?.description,
    //         properties: {
    //             vmSize: spec?.size,
    //             vmPriority: spec?.tier === "low_priority" ? "LowPriority" : "Dedicated",
    //             scaleSettings: {
    //                 minNodeCount: spec?.min_instances,
    //                 maxNodeCount: spec?.max_instances,
    //                 nodeIdleTimeBeforeScaleDown: spec?.idle_time_before_scale_down != null
    //                     ? secondsToIsoDuration(spec.idle_time_before_scale_down)
    //                     : undefined
    //             }
    //         }
    //     }
    // })

    return "Creation would have happened but it's commented out to test";
}
