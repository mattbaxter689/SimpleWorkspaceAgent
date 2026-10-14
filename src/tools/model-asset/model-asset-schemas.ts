import { z } from "zod";

export const modelAssetSchema = z.object({
  name: z.string().optional(),
  latestVersion: z.string().optional(),
  isArchived: z.boolean().optional(),
  tags: z.record(z.string(), z.string().nullable()).optional(),
  createdAt: z.string().optional(),
});

// Tool output types
export const listModelAssetSchema = z.array(modelAssetSchema);

// Input Schemas for typing
export const getLatestModelAssetSchema = z.object({
  name: z.string().describe("The name of the model asset"),
});

// Input schemas for typing
export type GetLatestModelAsset = z.infer<typeof getLatestModelAssetSchema>;

// Output schemas for typing
export type ListModelAsset = z.infer<typeof listModelAssetSchema>;
export type ModelAsset = z.infer<typeof modelAssetSchema>;
