import type { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";

import type { Uploads } from "../uploads/schemas";

export interface AzureCtx {
  client: AzureMachineLearningServicesManagementClient;
  resourceGroup: string;
  workspaceName: string;
}

export interface ToolDeps {
  azureCtx: AzureCtx;
  uploads: Uploads;
}
