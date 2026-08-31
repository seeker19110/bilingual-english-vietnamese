// learningPaths/registry.ts — Sổ đăng ký LỘ TRÌNH MỤC TIÊU + hàm tra cứu.
//
// Thêm lộ trình mới: tạo file `<id>.ts` theo khuôn (xem principal-ai.ts), thêm 1 dòng import
// và 1 phần tử vào mảng dưới đây. Test `learningPaths.test.ts` tự kiểm khuôn dạng — không cần
// sửa test khi thêm lộ trình đúng chuẩn.
import type { LearningPath, PathPhase, PathStageRef } from './types.js'
import { PRINCIPAL_AI_PATH } from './principal-ai.js'

export type { LearningPath, LearningPathId, PathPhase, PathStageRef } from './types.js'

export const LEARNING_PATHS: LearningPath[] = [PRINCIPAL_AI_PATH]

const pathMap = new Map<string, LearningPath>(LEARNING_PATHS.map((p) => [p.id, p]))

/** Tra lộ trình theo id, không phân biệt hoa thường. undefined nếu id lạ — KHÔNG đoán bừa. */
export function getLearningPath(id: string): LearningPath | undefined {
  return pathMap.get(id.trim().toLowerCase())
}

/** Toàn bộ tham chiếu chặng của lộ trình, phẳng theo đúng thứ tự giai đoạn rồi thứ tự chặng. */
export function pathStageRefs(path: LearningPath): PathStageRef[] {
  return path.phases.flatMap((phase) => phase.stages)
}

/** Tổng số chặng đã lắp vào lộ trình (giai đoạn đang soạn đóng góp 0). */
export function countPathStages(path: LearningPath): number {
  return pathStageRefs(path).length
}

/** Giai đoạn này đã có nội dung để học chưa — rỗng nghĩa là ĐANG SOẠN, UI phải nói rõ. */
export function isPhaseDrafting(phase: PathPhase): boolean {
  return phase.stages.length === 0
}
