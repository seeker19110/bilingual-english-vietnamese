# fix: trả nốt các phát hiện audit F2·F4·F6·F7·F9 trong một lượt (2026-08-24)

Tiếp PR #644 — gom mọi phát hiện còn lại của audit 2026-08-24 mà AI tự xử lý được.

**F2 — 2 test flaky: cả hai đã diệt tận gốc, và một cái hoá ra là LỖI GAME THẬT.**

- `pvp-arena.test.ts`: truy tiếp bằng mô phỏng đúng tham số của handler (lượt trước mô phỏng
  bằng tham số đoán nên ra 0/200.000). Nguyên nhân KHÔNG phải test: handler truyền
  `match.player1.winStreak` (chuỗi THẮNG TRẬN sự nghiệp — người mới luôn 0 → hệ số ×1,0) cho
  người chơi, nhưng truyền cứng `currentStreak = 1` cho Ghost (→ thành streak 2, hệ số ×1,2).
  Kết quả đo 200.000 trận: người chơi trả lời **đúng 100% và nhanh nhất vẫn thua/hoà 2,25%** —
  vừa bất công trong game thật, vừa làm test đỏ ngẫu nhiên. Vá: thêm
  `trailingCorrectStreak()` (chuỗi đúng liên tiếp TRONG TRẬN, đúng ngữ nghĩa tham số `streak`
  của `calculatePoints`) vào `pvpArenaService.ts`, handler dùng nó cho **cả hai bên**. Đo lại
  200.000 trận sau vá: **0 thua, 0 hoà**. Kèm 7 test mới cho hàm này (ca biên rỗng, chuỗi đứt
  giữa, hai bên đếm độc lập, bất biến "cùng chuỗi thì ai nhanh hơn điểm cao hơn").
- `requestId.test.ts`: sửa TEST, không sửa hàm (hàm chỉ dùng nối log, không cam kết duy nhất
  tuyệt đối). Khẳng định cũ `1000 ID không trùng` fail ~1/8.600 lượt theo nghịch lý sinh nhật
  (không gian 2³²) — đổi thành `≥ 999/1000` (chỉ đỏ khi ≥ 2 cặp trùng cùng lượt, xác suất
  ~7e-9), kèm chú thích giải thích đầy đủ trong file test.

**F4 — hook đầu phiên + doc deploy hết nói sai thực tế.** `.claude/report-status.sh` mục 4 đổi
từ "VPS 1 vCPU nên chưa có lợi ích song song thật" thành đúng hiện trạng 3 vCPU / 3 instance
(đã chạy thử hook, output đúng). `docs/deploy-vps-ubuntu.md` GĐ2 cũng sửa cùng chỗ.

**F6 — xoá 201 dòng code chết** (xác nhận lại 0 tham chiếu ngay trước khi xoá):
`RealtimeCostTelemetryBadge.tsx` (55) · `PosFilter.tsx` (36) · `coLearningAudioApi.ts` (110).
Lưu ý khi rà lại: `grep "PosFilter"` ra 8 dòng nhưng toàn bộ là biến state `setPosFilter` của
`Dictionary.tsx` (trang này tự dựng UI lọc riêng) — 0 nơi import component.

**F7 — QUYẾT ĐỊNH KHÁC đề xuất ban đầu: KHÔNG đổi tên 3 cặp migration trùng số.** Lý do đã
kiểm chứng: `run-pg-migrations.ts` theo dõi migration đã áp bằng TÊN FILE trong
`public._schema_migrations` — đổi tên file đã chạy trên production khiến runner tưởng chưa chạy
và CHẠY LẠI trên dữ liệu thật. Rủi ro đó không đáng đổi lấy con số đẹp. Thay vào đó thêm 2 test
chốt chặn vào `scripts/migrations-readme-coverage.test.ts`: cấm số trùng MỚI (3 số cũ 0026/0027/
0059 ghi nhận grandfather) + cấm số nhảy cóc. Đã chứng minh chốt hoạt động: tạo file
`0062_gia_lap_trung_so.sql` giả → test đỏ đúng thông báo → xoá → xanh lại.

**F9 — 2 điểm gia cố bảo mật:**

- CORS fail-safe (`packages/core-auth/security.ts`): production mà quên `ALLOWED_ORIGINS` thì
  trước đây lặng lẽ mở `*`; nay `NODE_ENV=production` không có biến sẽ rơi về
  `DEFAULT_ALLOWED_ORIGINS` (danh sách domain chính thức). Dev giữ `*` như cũ.
- `personErasureService.deleteScoped()`: chặn định danh SQL không khớp `^[a-z_][a-z0-9_]*$`
  trước khi nối chuỗi — mọi lời gọi hiện tại đều hằng số nên không đổi hành vi, nhưng sửa sai
  sau này sẽ NỔ NGAY thay vì thành SQL injection im lặng.

**Còn lại — ngoài khả năng AI, cần người dùng:**

- **F3:** chạy `npm run eval:tutor` với key AI thật rồi cập nhật
  `docs/research/eval-tutor-baseline.md` (baseline 2026-08-20 cũ hơn model đổi 2026-08-22).
- **F8:** bundle sát trần (JS 120,73/123 kB = 98,2%) — cần quyết: nâng ngưỡng `.size-limit.json`
  hay đặt mục tiêu tách bundle. Chưa chạm ngưỡng nên chưa gấp, nhưng tính năng lớn kế tiếp sẽ vướng.

**Cổng:** build ✅ · typecheck ✅ · lint ✅ · format ✅ · test ✅ **5120/5120 × 3 lượt liên tiếp**
(Tầng 1b) · coverage 93,27 / 90,14 / 96,48 / 93,27 (sàn 90) ✅ · size JS 120,73/123 kB ✅ ·
E2E chạy kèm trong PR #644.

**⚠️ Đổi hành vi người dùng thấy (mục 5.3 quy trình audit):** vá F2 làm Ghost mất lợi thế hệ số
×1,2 bất công — người chơi PvP từ nay thắng dễ hơn đúng theo thiết kế "trả lời đúng và nhanh
hơn thì thắng". Elo/thống kê cũ không bị sửa lại.
