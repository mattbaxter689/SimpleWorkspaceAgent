import type { JobCountByStatus } from '../jobs'
import type { ValidatedComputeSpec, ListComputeSummary, ComputeReuseResult } from './compute-schemas'

export type ReuseVerdict = 'reuse_existing' | 'reuse_with_caveats' | 'create_new'

export interface ReuseCandidate {
    name: string
    match: 'exact' | 'partial'
    problems: string[]
    state?: string
    currentNodes?: number
    activeJobs?: number
}

//Only same-VM-size clusters are candidates. Different hardware is not
export function assessReuse(
    spec: ValidatedComputeSpec,
    existing: ListComputeSummary,
    activeJobs?: JobCountByStatus
): ComputeReuseResult {
    const wantedPriority = spec.tier === 'low_priority' ? 'LowPriority' : 'Dedicated'
    const nameTaken = existing.some(c => c.name?.toLowerCase() === spec.name.toLowerCase())

    const candidates: ReuseCandidate[] = []
    for (const c of existing) {
        if (c.type !== 'AmlCompute' || !c.name) continue
        if (c.vmSize?.toLowerCase() !== spec.size.toLowerCase()) continue

        const problems: string[] = []
        const priority = c.vmPriority ?? 'Dedicated'
        if (priority.toLowerCase() !== wantedPriority.toLowerCase()) {
            problems.push(`priority is ${priority}, spec wants ${wantedPriority}`)
        }
        if ((c.maxNodes ?? 0) < spec.max_instances) {
            problems.push(`max nodes is ${c.maxNodes ?? 'unknown'}, spec wants ${spec.max_instances}`)
        }
        if (c.state && c.state !== 'Succeeded') problems.push(`provisioning state is ${c.state}`)

        candidates.push({
            name: c.name,
            match: problems.length === 0 ? 'exact' : 'partial',
            problems,
            state: c.state,
            currentNodes: c.currentNodes,
            activeJobs: activeJobs?.get(c.name) ?? (activeJobs ? 0 : undefined),
        })
    }

    candidates.sort((a, b) =>
        (a.match === b.match ? 0 : a.match === 'exact' ? -1 : 1) ||
        (a.activeJobs ?? 0) - (b.activeJobs ?? 0))

    const verdict: ReuseVerdict =
        candidates.some(c => c.match === 'exact') ? 'reuse_existing'
            : candidates.length > 0 ? 'reuse_with_caveats'
                : 'create_new'

    return {
        verdict,
        nameTaken,
        identicalAlreadyExists: candidates.some(c => c.match === 'exact' && c.name.toLowerCase() === spec.name.toLowerCase()),
        requested: { name: spec.name, size: spec.size, tier: spec.tier, maxNodes: spec.max_instances },
        candidates: candidates.slice(0, 5),
        activeJobsKnown: activeJobs !== undefined,
    }
}
