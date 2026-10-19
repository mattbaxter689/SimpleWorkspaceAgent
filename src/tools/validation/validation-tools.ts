import { tool } from "ai";
import { z } from "zod";

import type { ToolDeps } from "../types";
import { handleParseAndValidate } from "./validation-handlers";
import { validationKindSchema, validationResultSchema } from "./validation-schemas";

export const createValidationTools = ({ uploads }: ToolDeps) => ({
    validateSpec: tool({
        description:
            "Validate the attached YAML spec (and Parquet file for data assets) without creating anything. " +
            "Returns the parsed spec or a description of the problems. Always call before any create tool.",
        inputSchema: z.object({ kind: validationKindSchema }),
        outputSchema: validationResultSchema,
        execute: ({ kind }) => handleParseAndValidate(uploads, kind),
    }),
});
