import { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";
import { createDataAssetTools } from "./data-asset";
import { createModelAssetTools } from "./model-asset";

export interface AzureContext {
    client: AzureMachineLearningServicesManagementClient,
    resourceGroup: string,
    workspaceName: string
}

interface MegaToolFactoryDeps {
    azureCtx: AzureContext
}

export function createAllTools({ azureCtx }: MegaToolFactoryDeps) {
    return {
        ...createDataAssetTools(azureCtx),
        ...createModelAssetTools(azureCtx)
    }
}
