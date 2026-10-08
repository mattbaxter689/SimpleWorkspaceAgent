import { DefaultAzureCredential } from "@azure/identity";
import { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";
import type { Logger } from "pino";
import { config } from "./config/env_config";

let clientInstance: AzureMachineLearningServicesManagementClient | null = null


/**
 * Initializes and validates the Azure ML client
 * Performs a ping test against the workspace. Should be called once during server bootstrap
 */
export async function initAzureWorkspaceConnection(logger: Logger): Promise<AzureMachineLearningServicesManagementClient> {

    if (clientInstance) {
        return clientInstance
    }

    const log = logger.child({ module: "CredentialVerification" })
    log.info("Azure ML subscription id provided. Creating client connection")

    const credential = new DefaultAzureCredential()
    const client = new AzureMachineLearningServicesManagementClient(
        credential, config.AZURE_SUBSCRIPTION_ID
    )

    log.info("Client connection successful")

    //perform small ping test to ensure connection
    const workspace = await client.workspaces.get(config.AZURE_RESOURCE_GROUP, config.AZURE_WORKSPACE_NAME)
    log.info({ workspaceName: workspace.name }, "Workspace ping test successful");

    clientInstance = client;
    return clientInstance;
}

/**
 * Retrieves the cached Azure ML client instance.
 * Throws an error if called before bootstrap initialization.
 */
export function getAzureClient(): AzureMachineLearningServicesManagementClient {
    if (!clientInstance) {
        throw new Error("Azure ML Client accessed before initialization. Call initAzureWorkspaceConnection during app bootstrap")
    }
    return clientInstance
}
