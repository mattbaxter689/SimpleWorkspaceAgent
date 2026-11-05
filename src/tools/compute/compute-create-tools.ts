import { tool } from "ai";
import { z } from "zod";

import type { ToolDeps } from "../types";
import { handleCreateComputeFromSpec } from "./compute-handlers";
import { computeCreateResultSchema } from "./compute-schemas";

export const createComputeTools = ({ azureCtx, uploads }: ToolDeps) => ({
    createComputeFromSpec: tool({
        description:
            "Create an Azure ML compute cluster from the attached YAML spec (including any rename already applied). " +
            "Takes no arguments; reads the attached file itself.",
        inputSchema: z.object({}),
        outputSchema: computeCreateResultSchema,
        execute: async () => handleCreateComputeFromSpec(azureCtx, uploads),
    }),
});
