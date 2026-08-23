// apps/dhcb/src/lib/visionSolverApi.ts — Client API for Multimodal Vision STEM Solver.
import type { VisionSolveRequest, VisionSolveResponse } from '@dhcb/core-contracts/visionSolver'

export async function solveProblemImage(request: VisionSolveRequest): Promise<VisionSolveResponse> {
  const resp = await fetch('/api/vision-solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data.error || `Lỗi giải bài tập qua hình ảnh (${resp.status})`)
  }

  return resp.json()
}
