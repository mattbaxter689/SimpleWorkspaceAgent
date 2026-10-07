import { DefaultAzureCredential } from "@azure/identity";
import { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";
import type { Logger } from "pino";
import { config } from "./config/env_config";

export async function azureWorkspaceConnection(logger: Logger): Promise<AzureMachineLearningServicesManagementClient> {

    const log = logger.child({ module: "CredentialVerification" })

    log.info("Azure ML subscription id provided. Creating client connection")

    const credential = new DefaultAzureCredential()

    const client = new AzureMachineLearningServicesManagementClient(
        credential, config.AZURE_SUBSCRIPTION_ID
    )
    log.info("Client connection successful")

    //perform small ping test to ensure connection
    const workspace = await client.workspaces.get(config.AZURE_RESOURCE_GROUP, config.AZURE_WORKSPACE_NAME)
    log.info(`Connection to workspace successful: ${workspace.name}`)

    return client
}
