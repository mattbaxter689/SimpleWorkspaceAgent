import type { Uploads, UploadedFile } from "./schemas";
import { HTTPException } from 'hono/http-exception'

const MAX_SPEC_BYTES = 100 * 1024
const MAX_DATA_BYTES = 50 * 1024 * 1024
export const MAX_BODY_BYTES = 55 * 1024 * 1024

const safeName = (n: string) => n.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100)

async function toUpload(file: File | undefined, maxbytes: number): Promise<UploadedFile | undefined> {
    if (!file) return undefined
    if (file.size > maxbytes) throw new HTTPException(413, { message: `${file.name} is too large` })
    return {
        name: safeName(file.name),
        bytes: new Uint8Array(await file.arrayBuffer())
    }
}

export async function readUploads(files: { spec?: File, data?: File }): Promise<Uploads> {
    return {
        spec: await toUpload(files.spec, MAX_SPEC_BYTES),
        data: await toUpload(files.data, MAX_DATA_BYTES)
    }
}

// Function to tell the model the files exist but doesn't see the contents
export function describeUploads(u: Uploads): string {
    const lines: string[] = []
    if (u.spec) lines.push(`- YAML spec: ${u.spec.name}`)
    if (u.data) lines.push(`- Data file: ${u.data.name}`)
    if (!lines.length) return ''
    return `\n\n[Attached files. Contents are not shown to you; the tools read them directly.]\n${lines.join('\n')}`
} 
