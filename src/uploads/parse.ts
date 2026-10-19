import { parse } from 'yaml'
import type { z } from 'zod'
import type { UploadedFile, YamlValidated } from './schemas'

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string }

export const zodIssues = (e: z.ZodError) =>
    e.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')

export function parseYaml(file?: UploadedFile): Parsed<YamlValidated> {
    if (!file) return { ok: false, error: 'No YAML spec file was attached' }
    try {
        return { ok: true, value: parse(Buffer.from(file.bytes).toString('utf8')) }
    } catch (e) {
        return { ok: false, error: `Invalid YAML: ${(e as Error).message}` }
    }
}

// The raw name from the yaml, even if it's invalid
export function rawSpecName(file?: UploadedFile): string | undefined {
    const y = parseYaml(file)
    const n = y.ok && y.value && typeof y.value === 'object' ? (y.value as Record<string, unknown>).name : undefined
    return typeof n === 'string' ? n : undefined
}

const MAGIC = [0x50, 0x41, 0x52, 0x31] // "PAR1" at both ends of every Parquet file
export const isParquet = (b: Uint8Array) =>
    b.length > 12 && MAGIC.every((m, i) => b[i] === m && b[b.length - 4 + i] === m)
