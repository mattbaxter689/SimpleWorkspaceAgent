import { BlobServiceClient } from "@azure/storage-blob";

import { getCredential } from "../../credentials";
import type { AzureCtx } from "../types";
import type { ValidatedDataUpload } from "./data-asset-schemas";

export async function createDataAssetFromUpload(
    ctx: AzureCtx,
    { spec, file }: ValidatedDataUpload,
) {
    const ds = await ctx.client.datastores.get(
        ctx.resourceGroup,
        ctx.workspaceName,
        "workspaceblobstore",
    );
    const { accountName, containerName } = ds.properties as {
        accountName?: string;
        containerName?: string;
    };
    if (!accountName || !containerName)
        throw new Error("Default datastore is not an Azure Blob datastore");

    const blobPath = `LocalUpload/agent/${spec.name}/${spec.version}/${file.name}`;
    const blobs = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        getCredential(),
    );
    await blobs
        .getContainerClient(containerName)
        .getBlockBlobClient(blobPath)
        .uploadData(file.bytes, { conditions: { ifNoneMatch: "*" } }); // never overwrite

    await ctx.client.dataVersions.createOrUpdate(
        ctx.resourceGroup,
        ctx.workspaceName,
        spec.name,
        spec.version,
        {
            properties: {
                dataType: "uri_file",
                dataUri: `azureml://datastores/workspaceblobstore/paths/${blobPath}`,
                description: spec.description,
                tags: spec.tags,
            },
        },
    );
}
