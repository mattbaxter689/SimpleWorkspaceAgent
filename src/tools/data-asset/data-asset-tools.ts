import { tool } from "ai"
import { z } from 'zod'
import type { ToolDeps } from "../types"
import { getLatestDataAssetInputSchema, getLatestDataAssetOutputSchema, listDataAssetOutputSchema } from "./data-asset-schemas"
import { handleGetLatestDataAsset, handleListDataAssets } from "./data-asset-handlers"

export const createDataAssetTools = ({ azureCtx }: ToolDeps) => ({
    listDataAssets: tool({
        description: "Lists registered data assets in the workspace and their id",
        inputSchema: z.object({}),
        outputSchema: listDataAssetOutputSchema,
        execute: () => handleListDataAssets(azureCtx)
    }),

    getLatestDataAsset: tool({
        description: "Fetches the latest version for a specific data asset in the workspace",
        inputSchema: getLatestDataAssetInputSchema,
        outputSchema: getLatestDataAssetOutputSchema,
        execute: (params) => handleGetLatestDataAsset(azureCtx, params)
    })
})
