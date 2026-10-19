import { z } from "zod";

import { type Parsed, isParquet, parseYaml, zodIssues } from "../../uploads/parse";
import type { UploadedFile } from "../../uploads/schemas";
import { type Validated, markValidated } from "../../uploads/validated";

// Tool input types
export const getLatestDataAssetName = z.object({
  name: z.string().describe("The name of the data asset"),
});

// Tool output types
export const listDataAssetSchema = z.array(
  z.object({
    name: z.string().optional(),
    id: z.string().optional(),
  }),
);

export const getLatestDataAssetSchema = z.object({
  version: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  dataType: z.string().optional(),
  createdAt: z.string().optional(),
});

// Input Schemas for typing
export type GetLatestDataAssetName = z.infer<typeof getLatestDataAssetName>;

// Output schemas for typing
export type GetLatestDataAsset = z.infer<typeof getLatestDataAssetSchema>;
export type ListDataAsset = z.infer<typeof listDataAssetSchema>;

// Everything here is specific to creating a data asset in Azure
export const dataSpecSchema = z
  .object({
    $schema: z.string().optional(),
    type: z.literal("uri_file"),
    name: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,254}$/),
    version: z
      .union([z.string(), z.number()])
      .transform(String)
      .pipe(z.string().regex(/^[A-Za-z0-9._-]{1,30}$/)),
    description: z.string().max(1000).optional(),
    tags: z.record(z.string(), z.string()).optional(),
    path: z.string(),
  })
  .strict();
export type DataSpec = z.infer<typeof dataSpecSchema>;

// Spec and file travel together so that file cannot be used without Spec
export type ValidatedDataUpload = Validated<{ spec: DataSpec; file: UploadedFile }>;

export function parseDataSpec(
  spec?: UploadedFile,
  data?: UploadedFile,
): Parsed<ValidatedDataUpload> {
  const y = parseYaml(spec);
  if (!y.ok) return y;

  const r = dataSpecSchema.safeParse(y.value);
  if (!r.success) return { ok: false, error: zodIssues(r.error) };

  if (!data) return { ok: false, error: "No Parquet file was attached" };
  if (!isParquet(data.bytes))
    return { ok: false, error: "The attached data file is not a valid Parquet file" };

  // `path` must refer to the attached file: no URLs, no parent directories
  const p = r.data.path;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p) || p.includes("..") || p.split("/").pop() !== data.name) {
    return { ok: false, error: `path must point to the attached file (${data.name})` };
  }

  // Return the validated symbol that we declared
  return { ok: true, value: markValidated({ spec: r.data, file: data }) };
}
