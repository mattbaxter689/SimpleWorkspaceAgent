import type { AzureContext } from "../types";

export async function handleListDataAssets(ctx: AzureContext) {
    const assets = []
    for await (const a of ctx.client.dataContainers.list(ctx.resourceGroup, ctx.workspaceName)) {
        assets.push({ name: a.name, id: a.id })
    }
    return assets
}
