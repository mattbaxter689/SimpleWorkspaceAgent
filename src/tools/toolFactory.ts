import type { ToolSet } from "ai";

import { createComputeNamingTools, createComputeReadTools, createComputeTools } from "./compute";
import { createDataAssetTools, createDataAssetCreationTools } from "./data-asset";
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
        ...createComputeReadTools(deps),
        ...createComputeNamingTools(deps),
        ...createComputeTools(deps),
        ...createJobTools(deps),
        ...createSimilarityTools(deps),
        ...createValidationTools(deps),
    };
}
