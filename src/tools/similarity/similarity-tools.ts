
import { tool } from 'ai'
import type { ToolDeps } from '../types'
import { handleFindSimilarAssets } from './similarity-handlers'
import { detailedSimilarityMatchSchema, getSimilaritySearchSchema } from './similarity-schemas'

// TODO: this will require updating when we are parsing the specifications
export const createSimilarityTools = ({ azureCtx }: ToolDeps) => ({
    findSimilarAssets: tool({
        description:
            'Find existing data or model assets whose names match or resemble a name, with their versions and the next ' +
            'free version number. Use before creating a data asset to avoid duplicates, or when the user is unsure of an ' +
            'exact asset name. For kind "data" with no name given, uses the name from the attached YAML spec.',
        inputSchema: getSimilaritySearchSchema,
        outputSchema: detailedSimilarityMatchSchema,
        execute: (params) => handleFindSimilarAssets(azureCtx, params)
    }),
})
