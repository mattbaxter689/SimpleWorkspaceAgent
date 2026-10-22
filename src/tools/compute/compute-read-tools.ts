import { tool } from "ai";
import { z } from "zod";

import type { ToolDeps } from "../types";
import {
    handleAssessComputeReuse,
    handleCheckComputeQuota,
    handleGetComputeState,
    handleListComputes,
} from "./compute-handlers";
import {
    computeAssessmentSchema,
    computeQuotaCheckSchema,
    computeSummarySchema,
    getComputeSchema,
    listComputeSummarySchema,
} from "./compute-schemas";

export const createComputeReadTools = ({ azureCtx, uploads }: ToolDeps) => ({
    listComputes: tool({
        description:
            "List the compute targets in the workspace with state, VM Size, priority, and not limits",
        inputSchema: z.object({}),
        outputSchema: listComputeSummarySchema,
        execute: () => handleListComputes(azureCtx),
    }),

    getComputeStatus: tool({
        description:
            "Get the current provisioning state of one compute target, including provisioning errors. " +
            "Use after creation to verify it came up, or to diagnose a failure.",
        inputSchema: getComputeSchema,
        outputSchema: computeSummarySchema,
        execute: (params) => handleGetComputeState(azureCtx, params),
    }),
    assessComputeReuse: tool({
        description:
            "Compare the attached compute spec with existing clusters and decide whether one can be reused instead of " +
            "creating a new one. Returns a verdict (reuse_existing, reuse_with_caveats, create_new), whether the name " +
            "is taken, and candidate clusters with reasons and active job counts. Takes no arguments.",
        inputSchema: z.object({}),
        outputSchema: computeAssessmentSchema,
        execute: () => handleAssessComputeReuse(azureCtx, uploads),
    }),
    checkComputeQuota: tool({
        description: "Check whether the workspace region has enough core quota for the attached compute spec",
        inputSchema: z.object({}),
        outputSchema: computeQuotaCheckSchema,
        execute: () => handleCheckComputeQuota(azureCtx, uploads)
    })
});
