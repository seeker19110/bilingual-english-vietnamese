// specializations/stageDetails.ts — Sổ đăng ký CHI TIẾT CHẶNG + hàm tra cứu.
//
// Đợt đầu chỉ có chặng S2 của cả 13 hướng (xem docs/specs/2026-08-27-chang-s2-huong-chuyen-sau.md):
// S2 là chỗ đường của các hướng thật sự rẽ khỏi nhau, và là dự án đầu tiên đủ lớn để phải
// ĐẶC TẢ trước khi làm. Chặng chưa soạn thì `getSpecStageDetail` trả `undefined` — giao diện
// hiển thị phần bản đồ sẵn có, KHÔNG bịa nội dung.
//
// Thêm chặng mới: tạo file `details/<hướng>-<chặng>.ts` theo khuôn rồi thêm 1 import + 1 phần
// tử vào mảng dưới đây. Test `specStageDetails.test.ts` tự kiểm khuôn dạng.
import type { SpecStageDetail } from './stageDetailTypes.js'
import { WEB_S2_DETAIL } from './details/web-s2.js'
import { MOBILE_S2_DETAIL } from './details/mobile-s2.js'
import { BACKEND_S2_DETAIL } from './details/backend-s2.js'
import { DATA_S2_DETAIL } from './details/data-s2.js'
import { AI_S2_DETAIL } from './details/ai-s2.js'
import { DEVOPS_S2_DETAIL } from './details/devops-s2.js'
import { SECURITY_S2_DETAIL } from './details/security-s2.js'
import { SYSTEMS_S2_DETAIL } from './details/systems-s2.js'
import { GAME_S2_DETAIL } from './details/game-s2.js'
import { EMBEDDED_S2_DETAIL } from './details/embedded-s2.js'
import { DESKTOP_S2_DETAIL } from './details/desktop-s2.js'
import { ARCHITECTURE_S2_DETAIL } from './details/architecture-s2.js'
import { ALGO_S2_DETAIL } from './details/algo-s2.js'

export type {
  SpecStageDetail,
  SpecModuleDetail,
  SpecRubricItem,
  SpecSelfCheck,
  SpecBrief,
} from './stageDetailTypes.js'

export const SPEC_STAGE_DETAILS: SpecStageDetail[] = [
  WEB_S2_DETAIL,
  MOBILE_S2_DETAIL,
  BACKEND_S2_DETAIL,
  DATA_S2_DETAIL,
  AI_S2_DETAIL,
  DEVOPS_S2_DETAIL,
  SECURITY_S2_DETAIL,
  SYSTEMS_S2_DETAIL,
  GAME_S2_DETAIL,
  EMBEDDED_S2_DETAIL,
  DESKTOP_S2_DETAIL,
  ARCHITECTURE_S2_DETAIL,
  ALGO_S2_DETAIL,
]

const detailMap = new Map<string, SpecStageDetail>(SPEC_STAGE_DETAILS.map((d) => [d.stageId, d]))

/** Tra chi tiết một chặng ('web-s2'). `undefined` khi chưa soạn hoặc mã lạ — KHÔNG đoán bừa. */
export function getSpecStageDetail(stageId: string): SpecStageDetail | undefined {
  return detailMap.get(stageId.trim().toLowerCase())
}

/** Chi tiết của một module trong chặng, tra theo id module đầy đủ ('web-s2-m1'). */
export function getSpecModuleDetail(moduleId: string) {
  const id = moduleId.trim().toLowerCase()
  // 'web-s2-m1' → chặng 'web-s2'
  const stageId = id.split('-').slice(0, 2).join('-')
  return getSpecStageDetail(stageId)?.modules.find((m) => m.moduleId === id)
}

/**
 * Tổng số mục tiến độ đánh dấu được của một chặng (module + tiêu chí rubric).
 * Giao diện dùng để tính phần trăm hoàn thành mà không phải cộng tay.
 */
export function countStageProgressItems(detail: SpecStageDetail): number {
  return detail.modules.length + detail.rubric.length
}
