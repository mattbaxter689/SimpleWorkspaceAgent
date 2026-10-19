import { z } from "zod";

import { type Parsed, parseYaml, zodIssues } from "../../uploads/parse";
import type { UploadedFile } from "../../uploads/schemas";
import { type Validated, markValidated } from "../../uploads/validated";

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

// Everything below is specific to creating a compute cluster in Azure
// Restrict to allowed vm's to reduce errors and simplify
export const ALLOWED_VM_SIZES = ["Standard_DS3_v2", "Standard_DS4_v2"] as const;
export const MAX_NODES = 8;
export const COMPUTE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{1,23}$/;

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
