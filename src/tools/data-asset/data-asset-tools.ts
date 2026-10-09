import { tool } from "ai"
import { z } from 'zod'
import type { AzureContext } from "../toolFactory"
import { listDataAssetOutputSchema } from "./data-asset-schemas"
import { handleListDataAssets } from "./data-asset-handlers"

export const createDataAssetTools = (ctx: AzureContext) => ({
    listDataAssets: tool({
        description: "Lists registered data assets in the workspace",
        inputSchema: z.object({}),
        outputSchema: listDataAssetOutputSchema,
        execute: () => handleListDataAssets(ctx)
    })
})
