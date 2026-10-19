import { z } from "zod";

export const similarityMatchSchema = z.object({
  name: z.string(),
  similarity: z.float32(),
  exactName: z.boolean().optional(),
  versionCount: z.number().optional(),
  latestVersions: z.array(z.string()).optional(),
  nextFreeVersion: z.string().optional(),
});
export type SimilarityMatch = z.infer<typeof similarityMatchSchema>;

export const detailedSimilarityMatchSchema = z.object({
  searched: z.string(),
  kind: z.string(),
  totalAssetNames: z.number(),
  matches: z.array(similarityMatchSchema),
  otherSimilarNames: z.array(similarityMatchSchema),
});
export type DetailedSimilarityMatch = z.infer<typeof detailedSimilarityMatchSchema>;

export const getSimilaritySearchSchema = z.object({
  kind: z.enum(["data", "model"]),
  name: z.string().describe("The name of the asset to search for similarities"),
});
export type GetSimilaritySearch = z.infer<typeof getSimilaritySearchSchema>;
