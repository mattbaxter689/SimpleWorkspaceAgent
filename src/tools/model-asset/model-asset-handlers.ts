import type { AzureContext } from "../toolFactory";
import type { ListModelAssetOutput } from "./model-asset-schemas";

export async function handleListModelAssets(ctx: AzureContext): Promise<ListModelAssetOutput> {
    const latestModels: ListModelAssetOutput = []

    for await (const model of ctx.client.modelContainers.list(ctx.resourceGroup, ctx.workspaceName)) {
        latestModels.push({
            name: model?.name,
            latestVersion: model?.properties?.latestVersion,
            isArchived: model?.properties?.isArchived,
            tags: model?.properties?.tags,
            createdAt: model.systemData?.createdAt?.toISOString()
        })
    }

    return latestModels
}
