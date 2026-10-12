import { tool } from "ai"
import { z } from 'zod'
import type { AzureContext } from "../toolFactory"
import { getLatestModelAssetInputSchema, listModelAssetOutputSchema, modelAssetOutputSchema } from "./model-asset-schemas"
import { handleGetLatestModelAsset, handleListModelAssets } from "./model-asset-handlers"

export const createModelAssetTools = (ctx: AzureContext) => ({
    listModelAssets: tool({
        description: `Lists registered model assets in the current workspace. Do not use this for data assets`,
        inputSchema: z.object({}),
        outputSchema: listModelAssetOutputSchema,
        execute: () => handleListModelAssets(ctx)
    }),

    getLatestModelAsset: tool({
        description: `Fetches information for the specified model asset in the current workspace. Do not use this for model assets`,
        inputSchema: getLatestModelAssetInputSchema,
        outputSchema: modelAssetOutputSchema,
        execute: (params) => handleGetLatestModelAsset(ctx, params)
    })
})

