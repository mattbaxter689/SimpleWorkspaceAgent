import type { AzureCtx } from "../types";
import { type DetailedSimilarityMatch, type GetSimilaritySearch, type SimilarityMatch } from "./similarity-schemas";

type AssetKind = 'data' | 'model'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')

// Similarity scoring
function levenshtein(a: string, b: string) {
    const prev = Array.from({ length: b.length + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i++) {
        let diag = prev[0]
        prev[0] = i
        for (let j = 1; j <= b.length; j++) {
            const tmp = prev[j]
            prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
            diag = tmp
        }
    }
    return prev[b.length]
}

export function similarity(a: string, b: string): number {
    const x = norm(a), y = norm(b)
    if (!x || !y) return 0
    if (x === y) return 1
    const ratio = 1 - levenshtein(x, y) / Math.max(x.length, y.length)
    const contained = Math.min(x.length, y.length) >= 4 && (x.includes(y) || y.includes(x)) ? 0.85 : 0
    return Math.max(ratio, contained)
}

// Helper to allow us to execute listing different assets without creating multiples of the same function
async function collectNames(iter: AsyncIterable<{ name?: string }>, max: number) {
    const out: string[] = []
    for await (const item of iter) {
        if (item.name) out.push(item.name)
        if (out.length >= max) break
    }
    return out
}

const containerNames = (ctx: AzureCtx, kind: AssetKind): Promise<string[]> => {
    return collectNames(
        kind === 'data'
            ? ctx.client.dataContainers.list(ctx.resourceGroup, ctx.workspaceName)
            : ctx.client.modelContainers.list(ctx.resourceGroup, ctx.workspaceName),
        500,
    )
}

const versionNames = (ctx: AzureCtx, kind: AssetKind, name: string) =>
    collectNames(
        kind === 'data'
            ? ctx.client.dataVersions.list(ctx.resourceGroup, ctx.workspaceName, name)
            : ctx.client.modelVersions.list(ctx.resourceGroup, ctx.workspaceName, name),
        200,
    )

const isNum = (v: string) => /^\d+$/.test(v)
const sortVersions = (vs: string[]) =>
    [...vs].sort((a, b) => (isNum(a) && isNum(b) ? Number(b) - Number(a) : b.localeCompare(a, undefined, { numeric: true })))
const nextFree = (vs: string[]) =>
    vs.length === 0 ? '1' : vs.every(isNum) ? String(Math.max(...vs.map(Number)) + 1) : undefined


export async function handleFindSimilarAssets(ctx: AzureCtx, search: GetSimilaritySearch): Promise<DetailedSimilarityMatch> {
    const names = await containerNames(ctx, search.kind)
    const matches = names
        .map(n => ({ n, score: similarity(search.name, n) }))
        .filter(m => m.score >= 0.6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    const detailed: SimilarityMatch[] = []
    for (const m of matches.slice(0, 3)) {
        const vs = sortVersions(await versionNames(ctx, search.kind, m.n))
        detailed.push({
            name: m.n,
            similarity: Math.round(m.score * 100) / 100,
            exactName: m.n.toLowerCase() === search.name.toLowerCase(),
            versionCount: vs.length,
            latestVersions: vs.slice(0, 5),
            nextFreeVersion: nextFree(vs),
        })
    }

    return {
        searched: search.name,
        kind: search.kind,
        totalAssetNames: names.length,
        matches: detailed,
        otherSimilarNames: matches.slice(3).map(m => ({ name: m.n, similarity: Math.round(m.score * 100) / 100 })),
    }
}

