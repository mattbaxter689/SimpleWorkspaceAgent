import type { ToolSet } from "ai";

import { createComputeNamingTools, createComputeReadTools, createComputeTools } from "./compute";
import { createDataAssetCreationTools, createDataAssetTools } from "./data-asset";
import { createJobTools } from "./jobs";
import { createModelAssetTools } from "./model-asset";
import { createSimilarityTools } from "./similarity";
import type { ToolDeps } from "./types";
import { createValidationTools } from "./validation";

export function createAllTools(deps: ToolDeps): ToolSet {
    return {
        ...createDataAssetTools(deps),
        ...createDataAssetCreationTools(deps),
        ...createModelAssetTools(deps),
        ...createComputeTools(deps),
        ...createComputeReadTools(deps),
        ...createComputeNamingTools(deps),
        ...createJobTools(deps),
        ...createSimilarityTools(deps),
        ...createValidationTools(deps),
    };
}
