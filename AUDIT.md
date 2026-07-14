# AUDIT.md — Lịch sử audit (tóm tắt)

> Gộp toàn bộ các đợt audit (bảo mật, logic, bản dịch, kiểm thử) đã chạy trên dự án. **Gần như
> mọi phát hiện đều đã RESOLVED** — file này giữ lại làm bằng chứng lịch sử + tra cứu nhanh, đã
> rút gọn mạnh (bỏ bảng chi tiết/checklist dài dòng, giữ phát hiện + cách vá). Chi tiết đầy đủ
> hơn (nếu cần) nằm trong lịch sử git tại các PR liên quan.

## Trạng thái hiện tại (2026-07-14)

**Không có phát hiện nào đang mở (OPEN).** Mọi Critical/High/Medium đã vá và có test hồi quy.
Hạ tầng kiểm thử hiện tại (đã vượt xa yêu cầu ban đầu của audit v2 — xem PHẦN A §6 cũ):
Vitest (unit, coverage ratchet), Playwright E2E + quét a11y bằng axe (0 critical/serious ở mọi
route chính × 4 theme, gồm cả màn kết quả AI), CI gate (lint/typecheck/test/build/format/E2E)
trên mọi PR. Số lượng test tăng dần theo thời gian — xem `PROGRESS.md` cho số hiện tại.

## PHẦN E — Audit toàn diện tính năng mới (2026-07-14)

Rà 3 lớp (bảo mật / logic-correctness / chất lượng code+a11y) tập trung vào các tính năng thêm
sau đợt audit 2026-07-13 chưa được audit sâu: Challenge 1 phút/30 ngày (+ migration tự động khi
deploy), Sổ lỗi cá nhân, bài thi cuối cấp CEFR, gamification streak. **Bảo mật: sạch, không phát
hiện nào** (RLS `challenge_entries` đúng, video Challenge chỉ lưu IndexedDB không upload, không
endpoint nào thiếu `validateAuth`, rate-limit/đếm lượt server-side không bypass được). 9 phát
hiện logic/chất lượng, đã vá hết cùng đợt:

- **Medium:** `Challenge.tsx` nộp lại sau khi AI chấm lỗi sẽ chạy lại STT tốn oan lượt — vá bằng
  cache transcript (`transcriptCacheRef`), chỉ nhận diện lại khi có bản ghi mới.
- **Low:** `submitEntry` có thể chạy 2 lần đồng thời do double-click trước khi React re-render —
  vá bằng khóa `submittingRef` (đồng bộ, không phụ thuộc state).
- **Low:** màn ăn mừng streak có thể hiện lại trong ngày nếu rời trang giữa chừng — vá bằng đánh
  dấu `markStreakCelebrated` ngay khi hiện màn, không đợi đóng.
- **Medium × 3 (chất lượng code):** `api/push.ts` dùng `as any[]` ở 3 chỗ (vi phạm luật "không
  any") → thay bằng interface hàng DB; `challengeCloud.ts` có hàm `mergeChallengeEntries` chết
  (không ai gọi, trùng `mergeCloudEntries` đang dùng thật) → xóa; `challenge.ts` tự viết lại
  helper ngày trùng `storage.ts` → gom về `src/lib/date.ts` dùng chung.
- **Low × 3:** thiếu `aria-label` cho textarea gõ tay ở Challenge; thiếu `tap-44` ở vài nút
  MistakeBank; sót chữ lặp "challenge challenge" trong prompt sau đổi tên Vlog→Challenge.

Cổng chất lượng sau vá: build/typecheck/lint(0 cảnh báo)/format/test (320/320) đều xanh.

## PHẦN D — Audit bản dịch toàn dự án (2026-07-06)

Quét tự động ~22.000 cặp Anh-Việt (từ điển 12.073 mục, hội thoại, curriculum, CEFR, i18n) +
đọc tay ~380 mục trải khắp mọi cấp độ/loại nội dung. **Kết luận: chất lượng dịch rất cao, không
có lỗi dịch sai nghĩa nào.** Mọi cờ tự động (35 cờ) đều là báo nhầm hợp lệ (động từ bất quy tắc,
số viết chữ vs số, từ mượn...). Đã vá 3 điểm nhỏ: số liệu quảng bá "40 đoạn/bài" sai thực tế →
sửa "10-20 đoạn"; nhãn "Bài học" bất đối xứng vi/en → đồng nhất; thuật ngữ `actuary` không nhất
quán giữa `vi`/`ex_vi` → sửa khớp. Ghi nhận (không phải lỗi dịch, để dọn dữ liệu sau nếu cần):
vài nhãn CEFR trông thấp so với độ khó (`opera`=A1); một số dạng chia (`killed`, `grown`) tồn
tại như mục từ điển riêng thay vì liên kết về từ gốc.

## PHẦN A00 — Rà logic/đồng nhất (2026-07-03)

3 phát hiện, đã vá hết:

- **G1 (High):** `computeLockedMap` tính % mở khóa cấp CEFR SỐNG trên tổng từ vựng hiện tại —
  tăng từ vựng khiến người dùng đã đạt ngưỡng trước đó bị khóa lại. Vá bằng cơ chế grandfather
  (`cefr_unlocked`, migration `0008`, `computeLockedMapPersisted`).
- **G2 (Medium):** ranh giới "ngày" tính theo UTC ở 9 chỗ thay vì giờ VN (UTC+7) → hoạt động
  0h-7h sáng bị tính nhầm sang hôm trước. Vá bằng helper dùng chung `vnDateStr()`
  (`src/lib/date.ts` + `api/_lib/date.ts`).
- **G3 (Medium):** `openaiStt.ts` không throw khi HTTP 200 nhưng thiếu/sai kiểu trường `text` →
  không hoàn lượt dù lỗi từ provider. Vá bằng validate kiểu trước khi coi là "im lặng thật".

## PHẦN A0 — Rà bổ sung (2026-07-02)

6 phát hiện (F1-F6), đã vá hết trong 1 PR: mất lượt khi Groq trả 200 nhưng body hỏng (không
hoàn lượt) → gom parse + hoàn lượt mọi nhánh lỗi; bảng `pronunciations` production thiếu RLS →
thêm RLS + vào `schema.sql`; Google TTS fetch không timeout → thêm 30s timeout; `text` TTS
không giới hạn độ dài → chặn 4000 ký tự; icon push notification trỏ file không tồn tại → sửa;
CSP lặp code + whitelist domain thừa → gom 1 hằng, dọn domain không dùng.

## PHẦN A — Audit source code v2 (2026-06-28) & PHẦN B — v1 (2026-06-20)

Audit toàn diện đầu tiên theo OWASP Top 10, ISO/IEC 25010, WCAG AA. **Mọi phát hiện Critical/
High của v1 (H1-H10: đếm lượt không atomic, fetch không timeout, CORS lỏng, bàn phím ảo che
input, lỗi thầm lặng...) đã RESOLVED** — đối chiếu bằng chứng cụ thể trong code lúc audit v2.
10 lỗi cụ thể phát hiện khi đọc tay sâu (BUG-1 → BUG-10: nhãn UI dư chữ, mất lượt khi provider
lỗi, spinner nhấp nháy, streak lệch biểu đồ, SRS "Quên" không ôn lại trong phiên, mic không
dừng khi rời trang...) đều đã FIXED, kèm test hồi quy.

Quy trình audit đa lớp (Backend → Data → Frontend logic → UI/A11y → Build) dùng lại cho các
đợt sau — checklist đầy đủ xem lịch sử git của file này trước lần rút gọn 2026-07-13 nếu cần
tham khảo chi tiết từng bước.

## PHẦN C — Audit bản dịch & đồng bộ từ vựng (2026-06-27)

Audit sơ bộ trước PHẦN D — cùng kết luận chất lượng dịch tốt, không có lỗi hệ thống. Phát hiện
1 vấn đề thiết kế dữ liệu: `ipa_vi` (phiên âm tiếng Việt cho từ tiếng Anh) chỉ ghi 1 âm tiết cho
từ đa âm tiết — đã ghi nhận, chưa cần xử lý gấp (không ảnh hưởng chức năng chính).

## Cách chạy lại audit dịch thuật

```bash
python3 scratchpad/audit.py       # quét tự động toàn bộ cặp Anh-Việt → findings.txt
python3 scratchpad/semantic.py    # nhất quán nghĩa + trích mẫu đọc tay
```

(Script nằm trong scratchpad phiên đã chạy audit — cần viết lại nếu chạy audit dịch thuật mới.)
