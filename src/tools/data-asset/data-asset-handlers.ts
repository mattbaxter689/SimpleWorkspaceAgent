import type { Uploads } from "../../uploads/schemas";
import type { AzureCtx } from "../types";
import {
    type CreateDataAssetResult,
    type GetLatestDataAsset,
    type ListDataAsset,
    parseDataSpec,
} from "./data-asset-schemas";
import { createDataAssetFromUpload } from "./data-asset-utils";

// Fetches all data assets in the current workspace
export async function handleListDataAssets(ctx: AzureCtx): Promise<ListDataAsset> {
    const assets: ListDataAsset = [];
    for await (const a of ctx.client.dataContainers.list(ctx.resourceGroup, ctx.workspaceName)) {
        assets.push({ name: a.name, id: a.id });
    }
    return assets;
}

// Fetches latest version for the specified data asset
export async function handleGetLatestDataAsset(
    ctx: AzureCtx,
    name: string,
): Promise<GetLatestDataAsset> {
    const versions = [];

    for await (const version of ctx.client.dataVersions.list(
        ctx.resourceGroup,
        ctx.workspaceName,
        name,
    )) {
        versions.push(version);
    }

    if (versions.length === 0) {
        throw new Error(`No versions found for data asset "${name}"`);
    }

    versions.sort((a, b) => {
        const timeA = new Date(
            a.systemData?.createdAt || a.systemData?.lastModifiedAt || 0,
        ).getTime();
        const timeB = new Date(
            b.systemData?.createdAt || b.systemData?.lastModifiedAt || 0,
        ).getTime();
        return timeB - timeA;
    });

    const latest = versions[0];

    return {
        version: latest?.name!,
        name: name,
        description: latest?.properties.description,
        dataType: latest?.properties.dataType,
        createdAt: latest?.systemData?.createdAt?.toISOString(),
    };
}

export async function handleCreateDataAsset(
    ctx: AzureCtx,
    upload: Uploads,
): Promise<CreateDataAssetResult> {
    const parsed = parseDataSpec(upload.spec, upload.data);
    if (!parsed.ok) return { created: false, error: parsed.error };
    const to_upload = parsed.value;
    const { spec } = to_upload;

    await createDataAssetFromUpload(ctx, to_upload);
    return {
        created: true,
        name: spec.name,
        note: "Data asset created. Note that if this was an already existing asset, it has had it's version auto-incremented",
    };
}
