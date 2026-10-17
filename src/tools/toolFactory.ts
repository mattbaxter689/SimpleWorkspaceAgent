import type { ToolSet } from "ai";

import { createComputeReadTools } from "./compute";
import { createDataAssetTools } from "./data-asset";
import { createJobTools } from "./jobs";
import { createModelAssetTools } from "./model-asset";
import { createSimilarityTools } from "./similarity";
import type { ToolDeps } from "./types";

export function createAllTools(deps: ToolDeps): ToolSet {
    return {
        ...createDataAssetTools(deps),
        ...createModelAssetTools(deps),
        ...createComputeReadTools(deps),
        ...createJobTools(deps),
        ...createSimilarityTools(deps)
    };
}
