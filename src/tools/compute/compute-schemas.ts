import { z } from "zod";

import { type Parsed, parseYaml, zodIssues } from "../../uploads/parse";
import type { UploadedFile } from "../../uploads/schemas";
import { type Validated, markValidated } from "../../uploads/validated";
import { ALLOWED_VM_SIZES, COMPUTE_NAME_REGEX, MAX_NODES } from "./compute-utils";

export const computeSummarySchema = z.object({
    found: z.boolean().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    state: z.string().optional(),
    vmSize: z.string().optional(),
    vmPriority: z.string().optional(),
    minNodes: z.number().optional(),
    maxNodes: z.number().optional(),
    currentNodes: z.number().optional(),
});
export const listComputeSummarySchema = z.array(computeSummarySchema);
export type ListComputeSummary = z.infer<typeof listComputeSummarySchema>;
export type ComputeSummary = z.infer<typeof computeSummarySchema>;

export const getComputeSchema = z.object({
    name: z.string().describe("The name of the compute target to fetch information for"),
});
export type GetComputeInput = z.infer<typeof getComputeSchema>;

// Final assessment result schema
export const computeReuseResultSchema = z.object({
    verdict: z.enum(["reuse_existing", "reuse_with_caveats", "create_new"]),
    nameTaken: z.boolean(),
    identicalAlreadyExists: z.boolean(),
    requested: z.object({
        name: z.string(),
        size: z.string(),
        tier: z.string(),
        maxNodes: z.number(),
    }),
    candidates: z
        .array(
            z.object({
                name: z.string(),
                match: z.enum(["exact", "partial"]),
                problems: z.array(z.string()),
                state: z.string().optional(),
                currentNodes: z.number().optional(),
                activeJobs: z.number().optional(),
            }),
        )
        .max(5),
    activeJobsKnown: z.boolean(),
});
export type ComputeReuseResult = z.infer<typeof computeReuseResultSchema>;

// Returns the final packaged result of the computeReuseResultSchema,
// along with possible errors when parsing the fields
export const computeAssessmentSchema = z.object({
    assessed: z.boolean(),
    error: z.string().optional(),
    result: computeReuseResultSchema.optional(),
});
export type ComputeAssessment = z.infer<typeof computeAssessmentSchema>;

// Schema to determine if the user has quota available
// to create the desired compute cluster type
export const computeQuotaCheckSchema = z.object({
    checked: z.boolean(),
    error: z.string().optional(),
    note: z.string().optional(),
    family: z.string().optional(),
    requiredCores: z.number().optional(),
    availableCores: z.number().optional(),
    sufficient: z.boolean().optional()
})
export type ComputeQuotaCheck = z.infer<typeof computeQuotaCheckSchema>

export const computeNameCheckSchema = z.object({
    checked: z.boolean(),
    error: z.string().optional(),
    name: z.string().optional(),
    formatValid: z.boolean().optional(),
    formatRule: z.string().optional(),
    exists: z.boolean().optional(),
    existing: z.object({
        type: z.string().optional(),
        vmSize: z.string().optional(),
        state: z.string().optional()
    }).optional(),
    suggestions: z.array(z.string().optional()).optional()
})
export type ComputeNameCheck = z.infer<typeof computeNameCheckSchema>

export const renameComputeSchema = z.object({
    renamed: z.boolean(),
    error: z.string().optional(),
    suggestions: z.array(z.string().optional()).optional(),
    name: z.string().optional(),
    note: z.string().optional()
})
export type RenameCompute = z.infer<typeof renameComputeSchema>

// The representation of yaml fields when creating a
// compute target in Azure ML
export const computeSpecSchema = z
    .object({
        $schema: z.string().optional(),
        name: z.string().regex(COMPUTE_NAME_REGEX),
        type: z.literal("amlcompute"),
        size: z.enum(ALLOWED_VM_SIZES),
        min_instances: z.number().int().min(0).default(0),
        max_instances: z.number().int().min(1).max(MAX_NODES),
        idle_time_before_scale_down: z.number().int().min(0).max(3600).default(120),
        tier: z.enum(["dedicated", "low_priority"]).default("dedicated"),
        description: z.string().max(500).optional(),
    })
    .strict()
    .refine((s) => s.min_instances <= s.max_instances, {
        message: "min_instances must be <= max_instances",
    });
export type ComputeSpec = z.infer<typeof computeSpecSchema>;
export type ValidatedComputeSpec = Validated<ComputeSpec>;

export function parseComputeSpec(
    spec?: UploadedFile,
    nameOverride?: string,
): Parsed<ValidatedComputeSpec> {
    const y = parseYaml(spec);
    if (!y.ok) return y;

    const raw =
        nameOverride && y.value && typeof y.value === "object"
            ? { ...(y.value as Record<string, unknown>), name: nameOverride }
            : y.value;

    const r = computeSpecSchema.safeParse(raw);

    // Return the validated symbol that we declared. Only the compute spec needed
    return r.success
        ? { ok: true, value: markValidated(r.data) }
        : { ok: false, error: zodIssues(r.error) };
}
