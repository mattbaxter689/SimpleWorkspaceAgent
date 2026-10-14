import { tool } from "ai";
import { z } from "zod";

import type { ToolDeps } from "../types";
import { handleGetComputeState, handleListComputes } from "./compute-handlers";
import {
  computeSummarySchema,
  getComputeSchema,
  listComputeSummarySchema,
} from "./compute-schemas";

export const createComputeReadTools = ({ azureCtx }: ToolDeps) => ({
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
});
