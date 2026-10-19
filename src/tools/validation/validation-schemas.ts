import { z } from 'zod'
import { dataSpecSchema } from '../data-asset'
import { computeSpecSchema } from '../compute'

export const validationKindSchema = z.enum(['compute', 'data_asset'])
export type ValidationKind = z.infer<typeof validationKindSchema>

export const validComputeSchema = z.object({
    valid: z.literal(true),
    spec: computeSpecSchema,
})
export type ValidComputeYaml = z.infer<typeof validComputeSchema>

export const validDataAssetSchema = z.object({
    valid: z.literal(true),
    spec: dataSpecSchema,
    file: z.object({
        name: z.string(),
        bytes: z.number(),
    }),
})
export type ValidDataAssetYaml = z.infer<typeof validDataAssetSchema>

export const invalidYamlSchema = z.object({
    valid: z.literal(false),
    problems: z.string(),
})
export type InvalidYaml = z.infer<typeof invalidYamlSchema>

export const validationResultSchema = z.union([
    validComputeSchema,
    validDataAssetSchema,
    invalidYamlSchema,
])
export type ValidationResult = z.infer<typeof validationResultSchema>
