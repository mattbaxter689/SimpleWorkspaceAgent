import { tool } from "ai";
import { z } from 'zod'
import type { ToolDeps } from "../types";
import { handleListComputes, handleGetComputeState } from "./compute-handlers";
import { computeSummaryOutputSchema, getComputeInputSchema, listComputeSummaryOutputSchema } from "./compute-schemas";

export const createComputeReadTools = ({ azureCtx }: ToolDeps) => ({
    listComputes: tool({
        description: 'List the compute targets in the workspace with state, VM Size, priority, and not limits',
        inputSchema: z.object({}),
        outputSchema: listComputeSummaryOutputSchema,
        execute: () => handleListComputes(azureCtx)
    }),

    getComputeStatus: tool({
        description:
            'Get the current provisioning state of one compute target, including provisioning errors. ' +
            'Use after creation to verify it came up, or to diagnose a failure.',
        inputSchema: getComputeInputSchema,
        outputSchema: computeSummaryOutputSchema,
        execute: (params) => handleGetComputeState(azureCtx, params)
    })
})
