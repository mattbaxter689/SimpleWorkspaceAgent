import { DefaultAzureCredential } from "@azure/identity";
import { AzureMachineLearningServicesManagementClient } from "@azure/arm-machinelearning";
import type { Logger } from "pino";

export function azureWorkspaceConnection(logger: Logger): AzureMachineLearningServicesManagementClient | undefined {

    const log = logger.child({ module: "CredentialVerification" })

    const subscriptionId: string | undefined = process.env.AZURE_SUBSCRIPTION_ID

    if (subscriptionId !== undefined) {
        log.info("Azure ML subscription id provided. Creating client connection")

        const credential = new DefaultAzureCredential()

        const client = new AzureMachineLearningServicesManagementClient(
            credential, subscriptionId
        )
        log.info("Client connection successful")

        return client
    }
    else {
        log.error("Azure ML Connection failed. Missing subscription id required to connect")
        return
    }

}
