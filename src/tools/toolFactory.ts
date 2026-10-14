import { createDataAssetTools } from "./data-asset";
import { createModelAssetTools } from "./model-asset";
import { createComputeReadTools } from "./compute";
import type { ToolDeps } from "./types";
import type { ToolSet } from "ai";
import { createJobTools } from "./jobs";


export function createAllTools(deps: ToolDeps): ToolSet {
    return {
        ...createDataAssetTools(deps),
        ...createModelAssetTools(deps),
        ...createComputeReadTools(deps),
        ...createJobTools(deps)
    }
}
