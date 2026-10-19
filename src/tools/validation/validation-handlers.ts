import { parseDataSpec } from "../data-asset/data-asset-schemas";
import { parseComputeSpec } from "../compute/compute-schemas";
import type { Uploads } from "../../uploads/schemas";
import type { ValidationKind, ValidationResult } from './validation-schemas'

export async function handleParseAndValidate(
    uploads: Uploads,
    kind: ValidationKind,
): Promise<ValidationResult> {
    if (kind === 'compute') {
        const p = parseComputeSpec(uploads.spec, uploads.overrides?.computeName)
        return p.ok
            ? { valid: true, spec: p.value }
            : { valid: false, problems: p.error }
    }

    const p = parseDataSpec(uploads.spec, uploads.data)
    return p.ok
        ? {
            valid: true,
            spec: p.value.spec,
            file: { name: p.value.file.name, bytes: p.value.file.bytes.length },
        }
        : { valid: false, problems: p.error }
}
