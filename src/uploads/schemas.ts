import { z } from 'zod'

export const uploadedFileSchema = z.object({
    name: z.string(),
    bytes: z.instanceof(Uint8Array)
})
export type UploadedFile = z.infer<typeof uploadedFileSchema>

export const uploadOverrideSchema = z.object({
    computeName: z.string().optional()
})

export const uploadsSchema = z.object({
    spec: uploadedFileSchema.optional(),
    data: uploadedFileSchema.optional(),
    overrides: uploadOverrideSchema.optional()
})
export type Uploads = z.infer<typeof uploadsSchema>

export const yamlValidatedSchema = z.object({
    ok: z.boolean(),
    value: z.any()
})
export type YamlValidated = z.infer<typeof yamlValidatedSchema>
