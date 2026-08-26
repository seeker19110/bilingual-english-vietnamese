# refactor: PR-S5+S6 — dọn mồ côi đã kiểm chứng + archive scripts + ADR (2026-08-23)

**QUYẾT ĐỊNH PHẠM VI S5 (chủ động góp ý, ghi để phiên sau không làm lại):** phân tích đồ thị
import (classifier theo nhóm pages) cho thấy các cụm components/lib "mồ côi/không phân loại
được" trùng ĐÚNG các cụm gamification thuộc diện GỘP/XOÁ ở N3 (PvPArena, DailyQuests,
ReferralVip, StemScratchpad, DebateArena…). Dời 250 file bây giờ rồi xoá một nửa ở N3 là làm
hai lần → **S5 thu hẹp về phần chắc chắn; regroup toàn bộ components/lib theo trụ HOÃN đến
sau N3** (đã ghi vào ADR-0004 mục 6).

**Đã làm (S5 thu hẹp):**

1. Xoá 48 shim `pages/*.tsx` + `pages/index.ts` + 2 barrel mồ côi
   (`components/english/index.ts`, `lib/english/index.ts`).
2. Xoá dead code đã kiểm chứng 0 nơi import (grep cả pattern Worker URL):
   `components/CoLearningRoom/` (350 dòng), `lib/geminiLiveApi.ts`, `lib/useAudioDsp.ts`,
   `lib/audioDspWorker.ts` (+test), `data/patterns.ts`. Vòng import SRS: đã được cắt từ
   trước (xác nhận codemap cycles = 0, không còn việc).

**Đã làm (S6):**

3. **Archive 24 script one-off** vào `scripts/archive/` (gen-_, ocr-_, patch-_, split-_,
   codex-cloud-\*…) — sửa import/đường dẫn theo độ sâu mới, 4 npm script trỏ theo
   (`gen:word-forms`, `gen:form-examples`, `extract:words-cefr`, `rank:patterns`).
   `scripts/` giờ chỉ còn script vận hành thật.
4. **ADR-0004** (`docs/adr/0004-cai-to-cau-truc-platform-2026-08.md`): ghi trọn bộ quyết định
   cải tổ S1→S6 + 2 bất biến hạ tầng + quyết định hoãn regroup.
5. Gate CI cycles/audit/boot-check đã vào từ PR #625 — S6 không cần thêm gate mới.

**Cổng đã chạy:** typecheck ✅ · lint ✅ · vite build + size ✅ (JS 120.69/123 · CSS
15.74/16) · test+coverage ✅ (số ở commit/PR).

**Lộ trình cải tổ cấu trúc S1→S6: HOÀN TẤT.** Việc lớn còn lại theo đặc tả platform mục 5:
N3 (hợp nhất referral/quest/leaderboard + persistence nhóm C + Elo ra Postgres), N4
(observability chi phí AI theo token thật), việc tay của người dùng (required status check).
