import { tool } from 'ai'
import { z } from 'zod'
import type { ToolDeps } from '../types'
import { handleCreateDataAsset } from './data-asset-handlers'
import { createDataAssetResultSchema } from './data-asset-schemas'

export const createDataAssetCreationTools = ({ azureCtx, uploads }: ToolDeps) => ({
    createDataAssetFromSpec: tool({
        description:
            'Upload the attached Parquet file and register it as a data asset using the attached YAML spec. ' +
            'Takes no arguments; reads the attached files itself.',
        inputSchema: z.object({}),
        outputSchema: createDataAssetResultSchema,
        execute: async () => handleCreateDataAsset(azureCtx, uploads)
    }),
})
