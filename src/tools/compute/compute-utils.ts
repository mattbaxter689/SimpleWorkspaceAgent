export const ALLOWED_VM_SIZES = ["Standard_DS3_v2", "Standard_DS4_v2"] as const;
export const MAX_NODES = 8;
export const COMPUTE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{1,23}$/;
export const VM_INFO: Record<(typeof ALLOWED_VM_SIZES)[number], { family: string; cores: number }> = {
    Standard_DS3_v2: { family: 'standardDSv2Family', cores: 4 },
    Standard_DS4_v2: { family: 'standardDSv2Family', cores: 8 },
}

export const sanitizeName = (n: string) => {
    const s = n.replace(/[^a-zA-Z0-9-]/g, '-').replace(/^[^a-zA-Z]+/, '')
    return (s || 'compute').slice(0, 21)
}

export function suggestFreeNames(base: string, taken: Set<string>, count = 3): string[] {
    const lower = new Set([...taken].map(n => n.toLowerCase()))
    const root = base.replace(/-\d+$/, '')
    const out: string[] = []
    for (let i = 2; out.length < count && i < 100; i++) {
        const suffix = `-${i}`
        const candidate = root.slice(0, 24 - suffix.length) + suffix
        if (!lower.has(candidate.toLowerCase()) && COMPUTE_NAME_REGEX.test(candidate)) out.push(candidate)
    }
    return out
}
