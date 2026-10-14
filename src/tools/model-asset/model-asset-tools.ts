import { tool } from "ai"
import { z } from 'zod'
import type { AzureCtx, ToolDeps } from "../types"
import { getLatestModelAssetSchema, listModelAssetSchema, modelAssetSchema } from "./model-asset-schemas"
import { handleGetLatestModelAsset, handleListModelAssets } from "./model-asset-handlers"

export const createModelAssetTools = ({ azureCtx }: ToolDeps) => ({
    listModelAssets: tool({
        description: `Lists registered model assets in the current workspace. Do not use this for data assets`,
        inputSchema: z.object({}),
        outputSchema: listModelAssetSchema,
        execute: () => handleListModelAssets(azureCtx)
    }),

    getLatestModelAsset: tool({
        description: `Fetches information for the specified model asset in the current workspace. Do not use this for model assets`,
        inputSchema: getLatestModelAssetSchema,
        outputSchema: modelAssetSchema,
        execute: (params) => handleGetLatestModelAsset(azureCtx, params)
    })
})

