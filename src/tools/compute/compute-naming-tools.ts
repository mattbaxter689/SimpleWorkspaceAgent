import { tool } from 'ai'
import { z } from 'zod'
import type { ToolDeps } from '../types'
import { computeNameCheckSchema, renameComputeSchema } from './compute-schemas'
import { handleCheckComputeName, handleRenameComputeInSpec } from './compute-handlers'

export const createComputeNamingTools = ({ azureCtx, uploads }: ToolDeps) => ({
    checkComputeName: tool({
        description:
            'Check whether a compute name is valid and free. With no argument it checks the name in the attached spec ' +
            '(including any rename already applied). Returns free alternative names when the name is taken or invalid.',
        inputSchema: z.object({ name: z.string().optional() }),
        outputSchema: computeNameCheckSchema,
        execute: ({ name }) => handleCheckComputeName(azureCtx, uploads, name)
    }),

    renameComputeInSpec: tool({
        description:
            'Use a different name for the compute in the attached spec. Azure cannot rename an existing compute, so ' +
            'this only changes the name used when the new cluster is created. The new name is validated and must be free. ' +
            'Does not create anything. Call checkComputeName first to get free names.',
        inputSchema: z.object({ newName: z.string() }),
        outputSchema: renameComputeSchema,
        execute: ({ newName }) => handleRenameComputeInSpec(azureCtx, uploads, newName)
    }),
})
