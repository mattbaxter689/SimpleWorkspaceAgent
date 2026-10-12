import type { AzureContext } from "../toolFactory";
import type { GetLatestDataAssetInput, GetLatestDataAssetOutput, ListDataAssetOutput } from "./data-asset-schemas";

// Fetches all data assets in the current workspace
export async function handleListDataAssets(ctx: AzureContext): Promise<ListDataAssetOutput> {
    const assets: ListDataAssetOutput = []
    for await (const a of ctx.client.dataContainers.list(ctx.resourceGroup, ctx.workspaceName)) {
        assets.push({ name: a.name, id: a.id })
    }
    return assets
}

// Fetches latest version for the specified data asset
export async function handleGetLatestDataAsset(
    ctx: AzureContext,
    params: GetLatestDataAssetInput
): Promise<GetLatestDataAssetOutput> {
    const versions = []

    for await (const version of ctx.client.dataVersions.list(ctx.resourceGroup, ctx.workspaceName, params.name)) {
        versions.push(version)
    }

    if (versions.length === 0) {
        throw new Error(`No versions found for data asset "${params.name}"`)
    }

    versions.sort((a, b) => {
        const timeA = new Date(a.systemData?.createdAt || a.systemData?.lastModifiedAt || 0).getTime()
        const timeB = new Date(b.systemData?.createdAt || b.systemData?.lastModifiedAt || 0).getTime()
        return timeB - timeA
    })

    const latest = versions[0]

    return {
        version: latest?.name!,
        name: params.name,
        description: latest?.properties.description,
        dataType: latest?.properties.dataType,
        createdAt: latest?.systemData?.createdAt?.toISOString()
    }
}

//TODO: implement fetch for all versions of named data asset
