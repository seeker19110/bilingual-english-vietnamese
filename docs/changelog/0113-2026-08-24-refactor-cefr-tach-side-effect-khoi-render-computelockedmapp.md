# refactor(cefr): tách side effect khỏi render — computeLockedMapPersisted thành hàm thuần (2026-08-24)

Trả món nợ vừa ghi ở PR #657: `computeLockedMapPersisted` (`apps/dhcb/src/lib/cefrProgress.ts`)
trước đây GHI localStorage + `pushProgress` ngay trong lúc render (gọi từ useMemo/render của 4
trang). Nay tách đôi: compute THUẦN (giữ nguyên tên + kết quả y hệt — grandfather vẫn đúng) và
`persistUnlockedLevels()` mới đảm nhận phần ghi nhớ cấp vừa mở (idempotent — không đổi thì không
ghi/không push), gọi từ `useEffect` ở cả 4 nơi dùng: `RoadmapTab`, `CefrLevelPage`, `Home`,
`EnglishHome`. Test `cefrProgress.test.ts` cập nhật theo hợp đồng mới (23/23 xanh) — thêm khẳng
định compute không tự ghi. Cổng: lint · typecheck · test 5181/5181 · build (bundle không đổi).
