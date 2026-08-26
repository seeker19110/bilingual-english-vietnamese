# refactor: PR-S2b — chốt tầm nhìn PLATFORM, đổi tên app chính thành `apps/dhcb` (2026-08-23)

**Quyết định người dùng (2026-08-23):** _"DHCB là nền tảng bao hàm tất cả các lĩnh vực mà cá
nhân cần thiết, english chỉ là 1 môn học như bao môn khác"_ + _"mọi cấu trúc và phát triển
phần mềm phải đúng tiêu chuẩn cao nhất của ngành"_. Đây là câu trả lời cho Q1 của bản đề xuất
nâng cấp — hướng PLATFORM. Đặc tả kiến trúc mới:
**`docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`** (mô hình khái niệm, khuôn
"thêm môn học mới" 5 mảnh, điều chỉnh S4: `subject-english` + `api/subjects/english/` thay vì
`core-english` + `api/english/`, danh sách tiêu chuẩn ngành đạt/thiếu).

**Đã làm trong PR này:**

1. `git mv apps/english → apps/dhcb`; gói `@dhcb/english` → **`@dhcb/app`** — app chính mang
   đúng tên nền tảng (nó chứa toàn bộ platform: companion, 4 trụ đời sống, admin, phòng học
   đa môn; phần riêng môn Anh chỉ là `src/pages/subjects/english/` + data/prompts).
2. Cập nhật MỌI chuỗi đường dẫn `apps/english` trong code/config đang sống (2 dạng:
   `apps/english` và `'apps', 'english'`): tsconfig 4 file, vite/vitest config, package.json,
   scripts/ (seed/gen/deploy), e2e, api/\_lib, codemap scanRoots, hub vite.config, CI không đổi.
3. **Xoá hẳn alias `@english/*`** (đo thật: 0 nơi import — không giữ khái niệm chết) khỏi
   tsconfig.base/vite/vitest; alias còn lại: `@dhcb/*` (workspace) + `@core` (core-ui).
4. CLAUDE.md viết lại mục 1 (định nghĩa platform DHCB, english = môn trong trụ Learning) +
   tiêu đề file + mục 6 đường dẫn. URL công khai/route/schema `english.*` KHÔNG đổi.

**Ghi chú trung thực:** tầm nhìn platform KHÔNG đổi thứ tự ưu tiên sửa lỗi — nhóm N1 (5 đường
AI không đếm lượt, auth `'u-default'`, REDIS_URL, scheduler ×3) và N3 (33 API in-memory →
Postgres, gộp referral/quest trùng) vẫn là việc phải làm thật trước khi thêm tính năng platform
mới. Xem mục 5 của đặc tả kiến trúc platform.
