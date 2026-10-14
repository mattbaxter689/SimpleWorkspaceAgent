import type { AzureCtx } from "../types";
import type { GetLatestModelAsset, ListModelAsset, ModelAsset } from "./model-asset-schemas";

// Helper to detect auto-generated run IDs, UUIDs, or hashes
function shouldExcludeModel(name: string): boolean {
  // Exclude Azure ML / MLflow auto-logged run artifacts
  if (name.startsWith("azureml_") && (name.includes("mlflow") || name.includes("output"))) {
    return true;
  }

  // Exclude raw UUIDs or hex hashes
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(name);
}

// Fetches any named and registered model asset in the workspace
export async function handleListModelAssets(ctx: AzureCtx): Promise<ListModelAsset> {
  const latestModels: ListModelAsset = [];

  for await (const model of ctx.client.modelContainers.list(ctx.resourceGroup, ctx.workspaceName)) {
    const name = model?.name ?? "";

    if (shouldExcludeModel(name)) {
      continue;
    }

    latestModels.push({
      name: model?.name,
      latestVersion: model?.properties?.latestVersion,
      isArchived: model?.properties?.isArchived,
      tags: model?.properties?.tags,
      createdAt: model.systemData?.createdAt?.toISOString(),
    });
  }

  return latestModels;
}

// Fetches information on a single specified asset in the workspace
export async function handleGetLatestModelAsset(
  ctx: AzureCtx,
  params: GetLatestModelAsset,
): Promise<ModelAsset> {
  const model = await ctx.client.modelContainers.get(
    ctx.resourceGroup,
    ctx.workspaceName,
    params.name,
  );

  return {
    name: model?.name,
    latestVersion: model?.properties?.latestVersion,
    isArchived: model?.properties?.isArchived,
    tags: model?.properties?.tags,
    createdAt: model.systemData?.createdAt?.toISOString(),
  };
}

// TODO: implement function to fetch all versions for single specified asset
