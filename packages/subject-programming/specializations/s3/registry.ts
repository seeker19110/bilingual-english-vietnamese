// s3/registry.ts — Sổ đăng ký CHI TIẾT CHẶNG S3 của 13 hướng + hàm tra cứu.
//
// Thêm hướng mới: tạo file `<id>.ts` theo khuôn (xem web.ts), rồi thêm 1 dòng import và 1 phần
// tử vào mảng dưới đây. Test `stageDetails.test.ts` tự kiểm khuôn dạng — trong đó có bất biến
// "đủ 13 hướng", nên quên đăng ký là CI đỏ chứ không lặng lẽ thiếu.
import type { SpecStageDetail } from '../stageDetailTypes.js'
import { WEB_S3_DETAIL } from './web.js'
import { MOBILE_S3_DETAIL } from './mobile.js'
import { BACKEND_S3_DETAIL } from './backend.js'
import { DATA_S3_DETAIL } from './data.js'
import { AI_S3_DETAIL } from './ai.js'
import { DEVOPS_S3_DETAIL } from './devops.js'
import { SECURITY_S3_DETAIL } from './security.js'
import { SYSTEMS_S3_DETAIL } from './systems.js'
import { GAME_S3_DETAIL } from './game.js'
import { EMBEDDED_S3_DETAIL } from './embedded.js'
import { DESKTOP_S3_DETAIL } from './desktop.js'
import { ARCHITECTURE_S3_DETAIL } from './architecture.js'
import { ALGO_S3_DETAIL } from './algo.js'

/** Thứ tự khớp `PROGRAMMING_SPECIALIZATIONS` để đọc song song hai sổ cho dễ đối chiếu. */
export const SPEC_STAGE_DETAILS: SpecStageDetail[] = [
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
]

const detailMap = new Map<string, SpecStageDetail>(SPEC_STAGE_DETAILS.map((d) => [d.stageId, d]))

/**
 * Tra chi tiết chặng theo id đầy đủ ('web-s3'). `undefined` nếu chặng đó chưa có chi tiết —
 * giao diện phải ẩn hẳn khối, KHÔNG đoán bừa chặng gần đúng.
 */
export function getStageDetail(stageId: string): SpecStageDetail | undefined {
  return detailMap.get(stageId.trim().toLowerCase())
}

/** Số chặng đã có chi tiết — dùng ở giao diện/tài liệu thay vì đếm tay. */
export function countStageDetails(): number {
  return SPEC_STAGE_DETAILS.length
}

/** Tổng số bài luyện của một chi tiết chặng (mỗi module một bài). */
export function countDrills(detail: SpecStageDetail): number {
  return detail.moduleDrills.length
}
