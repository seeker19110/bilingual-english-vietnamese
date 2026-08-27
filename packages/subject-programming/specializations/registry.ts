// specializations/registry.ts — Sổ đăng ký 12 HƯỚNG CHUYÊN SÂU + hàm tra cứu.
//
// Thêm hướng mới: tạo file `<id>.ts` theo khuôn (xem web.ts), rồi thêm 1 dòng import và 1 phần
// tử vào mảng dưới đây. Test `specializations.test.ts` sẽ tự kiểm khuôn dạng — không cần sửa
// test khi thêm hướng đúng chuẩn.
import type { ProgrammingSpecialization } from './types.js'
import { WEB_SPECIALIZATION } from './web.js'
import { MOBILE_SPECIALIZATION } from './mobile.js'
import { BACKEND_SPECIALIZATION } from './backend.js'
import { SYSTEMS_SPECIALIZATION } from './systems.js'
import { DATA_SPECIALIZATION } from './data.js'
import { AI_SPECIALIZATION } from './ai.js'
import { DEVOPS_SPECIALIZATION } from './devops.js'
import { SECURITY_SPECIALIZATION } from './security.js'
import { GAME_SPECIALIZATION } from './game.js'
import { EMBEDDED_SPECIALIZATION } from './embedded.js'
import { DESKTOP_SPECIALIZATION } from './desktop.js'
import { ALGO_SPECIALIZATION } from './algo.js'

export type {
  ProgrammingSpecialization,
  SpecializationId,
  SpecStage,
  SpecStageTier,
  SpecModule,
  SpecProject,
} from './types.js'

/**
 * Thứ tự hiển thị cố ý: các hướng phổ biến và dễ vào nghề nhất đứng trước, hướng nền tảng
 * bổ trợ (thuật toán) đứng cuối vì nó học SONG SONG chứ không phải chọn thay.
 */
export const PROGRAMMING_SPECIALIZATIONS: ProgrammingSpecialization[] = [
  WEB_SPECIALIZATION,
  MOBILE_SPECIALIZATION,
  BACKEND_SPECIALIZATION,
  DATA_SPECIALIZATION,
  AI_SPECIALIZATION,
  DEVOPS_SPECIALIZATION,
  SECURITY_SPECIALIZATION,
  SYSTEMS_SPECIALIZATION,
  GAME_SPECIALIZATION,
  EMBEDDED_SPECIALIZATION,
  DESKTOP_SPECIALIZATION,
  ALGO_SPECIALIZATION,
]

const specMap = new Map<string, ProgrammingSpecialization>(
  PROGRAMMING_SPECIALIZATIONS.map((s) => [s.id, s]),
)

/** Tra hướng theo id, không phân biệt hoa thường. undefined nếu id lạ — KHÔNG đoán bừa. */
export function getSpecialization(id: string): ProgrammingSpecialization | undefined {
  return specMap.get(id.trim().toLowerCase())
}

/** Tra một chặng theo id đầy đủ ('web-s2'). undefined nếu không có. */
export function getSpecStage(stageId: string) {
  const [specId] = stageId.trim().toLowerCase().split('-')
  const spec = specId ? getSpecialization(specId) : undefined
  return spec?.stages.find((s) => s.id === stageId.trim().toLowerCase())
}

/**
 * Hướng nào học viên VÀO ĐƯỢC với bậc xương sống đang có.
 * `levelId` là bậc CAO NHẤT đã hoàn thành ('p3'…'p6'); bậc lạ coi như chưa đủ điều kiện gì.
 */
export function specializationsOpenAt(levelId: string): ProgrammingSpecialization[] {
  const rank: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 6 }
  const have = rank[levelId.trim().toLowerCase()] ?? 0
  return PROGRAMMING_SPECIALIZATIONS.filter((s) => have >= (rank[s.prerequisite] ?? 99))
}

/** Tổng số dự án phải nộp của một hướng: 4 dự án chặng + 1 capstone. */
export function countSpecProjects(spec: ProgrammingSpecialization): number {
  return spec.stages.length + 1
}
