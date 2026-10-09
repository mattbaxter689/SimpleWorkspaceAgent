import { z } from 'zod'

const envSchema = z.object({
    AZURE_SUBSCRIPTION_ID: z.string().min(1, "Subscription ID is required"),
    AZURE_RESOURCE_GROUP: z.string().min(1, "Resource Group is required"),
    AZURE_WORKSPACE_NAME: z.string().min(1, "Workspace Name is rquired"),
    GEMINI_API_KEY: z.string().min(1, "The Google API key")
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
    const formattedErrors = z.treeifyError(result.error)
    console.error(JSON.stringify(formattedErrors, null, 2))

    process.exit(1)
}

export type EnvConfig = z.infer<typeof envSchema>
export const envConfig = result.data
