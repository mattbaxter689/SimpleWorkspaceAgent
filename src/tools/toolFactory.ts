import type { ToolSet } from "ai";

import { createComputeNamingTools, createComputeReadTools } from "./compute";
import { createDataAssetTools } from "./data-asset";
import { createJobTools } from "./jobs";
import { createModelAssetTools } from "./model-asset";
import { createSimilarityTools } from "./similarity";
import type { ToolDeps } from "./types";
import { createValidationTools } from "./validation";

export function createAllTools(deps: ToolDeps): ToolSet {
    return {
        ...createDataAssetTools(deps),
        ...createModelAssetTools(deps),
        ...createComputeReadTools(deps),
        ...createComputeNamingTools(deps),
        ...createJobTools(deps),
        ...createSimilarityTools(deps),
        ...createValidationTools(deps),
    };
}
