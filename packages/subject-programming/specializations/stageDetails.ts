// specializations/stageDetails.ts — Sổ đăng ký CHI TIẾT CHẶNG + hàm tra cứu.
//
// Đã soạn: ĐỦ BỐN CHẶNG S1→S4 của cả 13 hướng (52 chặng). S1
// (docs/specs/2026-08-27-chi-tiet-chang-s1-13-huong.md), S2
// (docs/specs/2026-08-27-chang-s2-huong-chuyen-sau.md), S3
// (docs/specs/2026-08-27-chang-s3-13-huong.md) và S4
// (docs/specs/2026-08-27-chi-tiet-chang-s4-13-huong.md). S1 là chặng nhập môn, đo bằng "làm
// được cái đầu tiên và tự giải thích được"; S2 là chỗ đường của các hướng thật sự rẽ khỏi nhau;
// S3 là chỗ người học khựng lại vì "chạy được" không còn là đủ tốt, mà "đủ tốt" thì đo được nên
// đặc tả được; S4 bám vào trách nhiệm — diễn tập, số đo và nghiệm thu.
// Mã chặng lạ thì `getSpecStageDetail` trả `undefined` — giao diện hiển thị phần bản đồ sẵn có,
// KHÔNG bịa nội dung.
//
// Thêm chặng mới: tạo file `details/<hướng>-<chặng>.ts` theo khuôn rồi thêm 1 import + 1 phần
// tử vào mảng dưới đây. Test `specStageDetails.test.ts` tự kiểm khuôn dạng.
import type { SpecStageDetail } from './stageDetailTypes.js'
import { WEB_S1_DETAIL } from './details/web-s1.js'
import { MOBILE_S1_DETAIL } from './details/mobile-s1.js'
import { BACKEND_S1_DETAIL } from './details/backend-s1.js'
import { DATA_S1_DETAIL } from './details/data-s1.js'
import { AI_S1_DETAIL } from './details/ai-s1.js'
import { DEVOPS_S1_DETAIL } from './details/devops-s1.js'
import { SECURITY_S1_DETAIL } from './details/security-s1.js'
import { SYSTEMS_S1_DETAIL } from './details/systems-s1.js'
import { GAME_S1_DETAIL } from './details/game-s1.js'
import { EMBEDDED_S1_DETAIL } from './details/embedded-s1.js'
import { DESKTOP_S1_DETAIL } from './details/desktop-s1.js'
import { ARCHITECTURE_S1_DETAIL } from './details/architecture-s1.js'
import { ALGO_S1_DETAIL } from './details/algo-s1.js'
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
import { WEB_S3_DETAIL } from './details/web-s3.js'
import { MOBILE_S3_DETAIL } from './details/mobile-s3.js'
import { BACKEND_S3_DETAIL } from './details/backend-s3.js'
import { DATA_S3_DETAIL } from './details/data-s3.js'
import { AI_S3_DETAIL } from './details/ai-s3.js'
import { DEVOPS_S3_DETAIL } from './details/devops-s3.js'
import { SECURITY_S3_DETAIL } from './details/security-s3.js'
import { SYSTEMS_S3_DETAIL } from './details/systems-s3.js'
import { GAME_S3_DETAIL } from './details/game-s3.js'
import { EMBEDDED_S3_DETAIL } from './details/embedded-s3.js'
import { DESKTOP_S3_DETAIL } from './details/desktop-s3.js'
import { ARCHITECTURE_S3_DETAIL } from './details/architecture-s3.js'
import { ALGO_S3_DETAIL } from './details/algo-s3.js'
import { WEB_S4_DETAIL } from './details/web-s4.js'
import { MOBILE_S4_DETAIL } from './details/mobile-s4.js'
import { BACKEND_S4_DETAIL } from './details/backend-s4.js'
import { DATA_S4_DETAIL } from './details/data-s4.js'
import { AI_S4_DETAIL } from './details/ai-s4.js'
import { DEVOPS_S4_DETAIL } from './details/devops-s4.js'
import { SECURITY_S4_DETAIL } from './details/security-s4.js'
import { SYSTEMS_S4_DETAIL } from './details/systems-s4.js'
import { GAME_S4_DETAIL } from './details/game-s4.js'
import { EMBEDDED_S4_DETAIL } from './details/embedded-s4.js'
import { DESKTOP_S4_DETAIL } from './details/desktop-s4.js'
import { ARCHITECTURE_S4_DETAIL } from './details/architecture-s4.js'
import { ALGO_S4_DETAIL } from './details/algo-s4.js'

export type {
  SpecStageDetail,
  SpecModuleDetail,
  SpecRubricItem,
  SpecSelfCheck,
  SpecBrief,
} from './stageDetailTypes.js'

export const SPEC_STAGE_DETAILS: SpecStageDetail[] = [
  // Chặng S1 — soạn 2026-08-27 (docs/specs/2026-08-27-chi-tiet-chang-s1-13-huong.md).
  WEB_S1_DETAIL,
  MOBILE_S1_DETAIL,
  BACKEND_S1_DETAIL,
  DATA_S1_DETAIL,
  AI_S1_DETAIL,
  DEVOPS_S1_DETAIL,
  SECURITY_S1_DETAIL,
  SYSTEMS_S1_DETAIL,
  GAME_S1_DETAIL,
  EMBEDDED_S1_DETAIL,
  DESKTOP_S1_DETAIL,
  ARCHITECTURE_S1_DETAIL,
  ALGO_S1_DETAIL,
  // Chặng S2 — soạn 2026-08-27 (docs/specs/2026-08-27-chang-s2-huong-chuyen-sau.md).
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
  // Chặng S3 — soạn 2026-08-27 (docs/specs/2026-08-27-chang-s3-13-huong.md).
  WEB_S3_DETAIL,
  MOBILE_S3_DETAIL,
  BACKEND_S3_DETAIL,
  DATA_S3_DETAIL,
  AI_S3_DETAIL,
  DEVOPS_S3_DETAIL,
  SECURITY_S3_DETAIL,
  SYSTEMS_S3_DETAIL,
  GAME_S3_DETAIL,
  EMBEDDED_S3_DETAIL,
  DESKTOP_S3_DETAIL,
  ARCHITECTURE_S3_DETAIL,
  ALGO_S3_DETAIL,
  // Chặng S4 — soạn 2026-08-27 (docs/specs/2026-08-27-chi-tiet-chang-s4-13-huong.md).
  WEB_S4_DETAIL,
  MOBILE_S4_DETAIL,
  BACKEND_S4_DETAIL,
  DATA_S4_DETAIL,
  AI_S4_DETAIL,
  DEVOPS_S4_DETAIL,
  SECURITY_S4_DETAIL,
  SYSTEMS_S4_DETAIL,
  GAME_S4_DETAIL,
  EMBEDDED_S4_DETAIL,
  DESKTOP_S4_DETAIL,
  ARCHITECTURE_S4_DETAIL,
  ALGO_S4_DETAIL,
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
