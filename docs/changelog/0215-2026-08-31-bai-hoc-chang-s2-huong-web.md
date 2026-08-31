# 0215 — Bài học 8 bước thật cho chặng web-s2 (1 PR)

- **Ngày:** 2026-08-31
- **PR:** #
- **Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s2-huong-web.md`

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `web-s2` "Full-stack — có backend của mình" của hướng
chuyên sâu Web (`specializations/web.ts`, 5 module — nhiều hơn 4 module như các chặng trước), ở
3 unit mới, làn `typescript`:

- `p6-u111` (module m1 "API HTTP tử tế"): chọn đúng mã trạng thái theo hành động + kết quả (2xx
  thành công không luôn là 200; 4xx lỗi phía người gọi; 5xx lỗi phía server); phân trang;
  Idempotency-Key chống tạo trùng khi client gửi lại yêu cầu vì mất mạng.
- `p6-u112` (gộp module m2 "CSDL quan hệ" + m3 "Xác thực & phiên"): toàn vẹn tham chiếu qua
  kiểm khoá ngoại trước khi ghi (góc khác hẳn khoá lạc quan/composite index đã dạy ở
  `backend-s2`, không dạy trùng); so mật khẩu đã băm (mô phỏng, nhấn mạnh cấm so plaintext) +
  chọn cơ chế phiên (session-cookie ưu tiên khi cần thu hồi ngay, JWT khi cần phân tán).
- `p6-u113` (gộp module m4 "Tải dữ liệu ở client" + m5 "Deploy và môi trường"): huỷ phản hồi cũ
  khi gõ tìm kiếm (race condition — phản hồi chậm của yêu cầu cũ không được đè kết quả mới); kiểm
  biến môi trường bắt buộc trước khi khởi động + kiểm thứ tự migration không lỗ hổng/trùng số.

Đăng ký cầu nối `specializations/stageUnits.ts`: `'web-s2': ['p6-u111', 'p6-u112', 'p6-u113']`.

## Quyết định kèm theo

- 5 module gộp thành 3 unit — tỉ lệ gộp khác các chặng trước (thường 4→3, gộp 2 module cuối) vì
  `web-s2` có 5 module; gộp m2+m3 (cả hai "phía server: dữ liệu & định danh") và m4+m5 (cả hai
  "vận hành ứng dụng chạy thật"), giữ m1 riêng vì là trọng tâm của chặng.
- `p6-u111` tự soạn trực tiếp; `p6-u112`/`p6-u113` giao 2 subagent song song với brief chi tiết
  (kèm cảnh báo lặp lại về bẫy substring-collision và giới hạn 12 dòng của `parsons.lines` đã
  dính ở các đợt trước).
- Sửa `specializations/stageUnits.test.ts`: ca kiểm "chặng chưa soạn bài" đổi ví dụ minh hoạ từ
  `web-s2` (nay đã có bài) sang `web-s3` (vẫn chưa có bài) — không đổi ý nghĩa của test, phát
  hiện qua chạy lại `npx vitest run packages/subject-programming` sau khi đăng ký `web-s2`.

## Bằng chứng kiểm chứng

- `npx tsc -b packages/subject-programming` sạch.
- `npx vitest run packages/subject-programming`: 49/49 file, 2938/2938 test xanh (bao gồm
  `lessonsTs.test.ts`, `lessons.test.ts`, `srsCards.test.ts`, `specializations/stageUnits.test.ts`).
- `npm run typecheck` sạch (cả 4 tsconfig).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công (app + server + hub).
- `npm run budget`: Initial JS 127,36/140 kB (còn 12,64 kB), CSS 16,79/18 kB (còn 1,21 kB) — vẫn
  trong hạn mức.
