// packages/core-contracts/version.ts — Hạ tầng versioning dùng CHUNG cho mọi contract trong
// packages/core-contracts/.
//
// Phase 02 "Contract OS" (docs/phases/02-contract-os.md) mục 2: "Add schema versions and
// compatibility rules". Quy ước:
//   - Mỗi entity có 1 field bắt buộc `schemaVersion` (số nguyên, bắt đầu từ 1).
//   - Thêm field MỚI dạng optional vào version hiện tại → KHÔNG bump version (tương thích ngược).
//   - Đổi kiểu 1 field, xoá field bắt buộc, hoặc đổi ý nghĩa field → PHẢI bump version, và nơi đọc
//     dữ liệu cũ phải tự quyết: từ chối, hay viết hàm migrate rõ ràng (chưa cần tới bây giờ vì
//     đây là entity MỚI, chưa có dữ liệu cũ nào tồn tại — xem PROGRESS.md).
//   - `.strict()` trên mọi schema: field lạ bị TỪ CHỐI thay vì âm thầm bỏ qua — đúng tinh thần
//     "no business-critical AI output reaches persistence without validation" (Acceptance của
//     Phase 02): AI trả thừa field lạ (hallucination) phải lộ ra thành lỗi validate, không lọt
//     qua như dữ liệu hợp lệ.

import { z, type ZodRawShape } from 'zod'

/** Bọc 1 object shape thành schema có `schemaVersion` bắt buộc + từ chối field lạ (`.strict()`). */
export function versionedObject<Shape extends ZodRawShape>(shape: Shape, version: number) {
  return z
    .object({
      ...shape,
      schemaVersion: z.literal(version),
    })
    .strict()
}

/** `received` có nằm trong tập version mà nơi đọc hiện hỗ trợ không. */
export function isSupportedVersion(received: number, supported: readonly number[]): boolean {
  return supported.includes(received)
}
