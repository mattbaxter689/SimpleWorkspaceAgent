import { z } from "zod";

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
