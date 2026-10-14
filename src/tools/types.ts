import type { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";

export interface AzureCtx {
  client: AzureMachineLearningServicesManagementClient;
  resourceGroup: string;
  workspaceName: string;
}

export interface ToolDeps {
  azureCtx: AzureCtx;
}
