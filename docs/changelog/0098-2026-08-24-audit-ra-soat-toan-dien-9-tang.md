# audit: rà soát toàn diện 9 tầng (2026-08-24)

Chạy theo `docs/framework/QUY-TRINH-AUDIT.md` trên nhánh `claude/project-audit-hdvwk2`
(= `origin/main`, ahead 0 / behind 0, working tree sạch). **Không sửa code** — đúng nguyên
tắc mục 1.2 của quy trình (audit = đọc + báo cáo).

**Tầng 1–3, 5, 6 đều ĐẠT:** build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ ·
size JS 120,72/123 kB + CSS 15,72/16 kB ✅ · npm audit 0 lỗ hổng (cả prod lẫn dev) ✅ ·
coverage 93,27% stmts / 90,17% branches / 96,48% funcs / 93,27% lines (sàn 90) ✅ ·
E2E + a11y **355/355 pass** ✅ · 0 chu trình import ✅ · 0 secret hardcode · 0 `any` ·
0 TODO/FIXME · 0 `dangerouslySetInnerHTML` · 0 query nối chuỗi.

**Kiểm chứng vượt mức thường lệ (dựng Postgres 16 thật trong container):**

- Đường **cài mới** chạy sạch: `schema.sql` + **65/65 migration** trên DB rỗng → 99 bảng / 9 schema.
- **Lũy đẳng**: chạy lần 2 báo "đã áp dụng đủ 65 migration", không đụng gì thêm.
- `dist-server/server.js` boot thật với DB đó → `/api/health` 200, `/api/health/deep` "healthy".
- Đối chiếu vi sai `vnDateStr`/`weekStartOf`/`addDays` **client vs server**: 250.000 mẫu, **0 lệch**.
- Dữ liệu từ điển: 12.168 từ · 0 nhãn CEFR sai/thiếu · 619 thiếu `freq` (5,1%) · 0 trùng lặp —
  **khớp chính xác** con số ghi trong CLAUDE.md mục 13.

#### Phát hiện (xếp theo mức độ)

**F1 🔴 Trộn đáp án thiên lệch — đáp án đúng đoán được theo vị trí.**
`[đúng, ...sai].sort(() => Math.random() - 0.5)` KHÔNG cho phân bố đều. Đo 400.000 lượt:
với 4 lựa chọn, đáp án đúng rơi vào **vị trí 1 (36,0%)** hoặc **vị trí 4 (31,2%)** — tổng
**67%** thay vì 50%; vị trí 2 chỉ 17,2% (kỳ vọng 25%). Người học bấm luôn ô đầu được **36%
thay vì 25%**. Chỗ dính: `apps/dhcb/src/components/StudyTabs.tsx` (tab Kiểm tra) và
`apps/dhcb/src/components/CefrLessonViews.tsx` (test-out cuối vòng) → làm **sai điểm** cả
hai đường chấm này. Trớ trêu: dự án **đã có** Fisher–Yates đúng ở `apps/dhcb/src/lib/cefrExam.ts:162`
và `listening.ts:55` (nhưng bị nhân bản 2 lần, không export dùng chung). Cách vá: tách 1 hàm
`shuffle()` dùng chung, thay hết 18 chỗ `sort(() => Math.random() - 0.5)`.

**F2 🟡 Hai test không ổn định (flaky) — làm CI đỏ ngẫu nhiên.** 10 lượt chạy full suite:
8 lượt 5106/5106 xanh, 2 lượt đỏ (mỗi lượt một test khác nhau, đều xanh khi chạy riêng).

- `packages/core-db/requestId.test.ts` — khẳng định 1000 ID 8 ký tự hex không trùng. Không gian
  chỉ 2³² → nghịch lý sinh nhật cho ~0,012%/lượt (đo 2000 vòng: 0; lý thuyết khớp). Bản thân
  `createRequestId()` **không sai** (chỉ dùng để nối log). Sửa **test**, đừng sửa hàm.
- `apps/server/src/api/platform/pvp-arena.test.ts` — "completes a full match". Đã loại giả thuyết
  "thua Ghost do ngẫu nhiên": mô phỏng 200.000 trận bằng chính service → người chơi **luôn** thắng
  (0/200.000 không thắng), và `totalRounds = questions.length` nên không tràn mảng. **Chưa xác định
  được nguyên nhân** — 8 lượt sau không tái hiện, không bắt được thông báo assertion.

**F3 🟡 Baseline eval gia sư ĐÃ CŨ so với model đang chạy.** `packages/core-ai/aiConfig.ts` đổi model
mặc định Groq → `openai/gpt-oss-120b` ngày **2026-08-22** (#620, do Groq gỡ `llama-3.3-70b-versatile`),
nhưng `docs/research/eval-tutor-baseline.md` mới nhất là **2026-08-20**. Theo CLAUDE.md mục 8 lẽ ra
phải chạy lại `npm run eval:tutor`. → **Chất lượng sửa lỗi của gia sư trên model hiện tại chưa được đo.**
Container audit không có `.env`/key AI nên **không chạy được ở đây** — cần chạy tay có key.

**F4 🟡 Hook đầu phiên nói sai thực tế.** `.claude/report-status.sh:38` ghi cứng "VPS 1 vCPU nên chưa
có lợi ích song song thật", trong khi CLAUDE.md mục 13 ghi VPS **đã nâng 3 vCPU / 3GB** (xác nhận
2026-08-21) và PM2 chạy thật 3 instance. Đây là dòng **mọi phiên đọc đầu tiên** → sai lệch lan sang
mọi phiên sau. `docs/deploy-vps-ubuntu.md:642` cũng còn nói 1 vCPU.

**F5 🟡 Chính đặc tả audit trỏ đường dẫn đã chết → cho kết quả ÂM TÍNH GIẢ.**
`apps/english/` đã đổi tên thành `apps/dhcb/` (PR-S2b) nhưng `docs/framework/QUY-TRINH-AUDIT.md`
còn **8** chỗ `apps/english` + **3** chỗ `api/_lib`; CLAUDE.md còn 1 + 5 chỗ. Hậu quả cụ thể: lệnh
Tầng 2b #3 `grep -rn "dangerouslySetInnerHTML" apps/english/src` và #14 `grep process.env apps/english/src`
sẽ trả **0 dòng vì thư mục không tồn tại**, rồi bị chấm "✅ đạt". Lượt audit này đã chạy lại bằng
đường dẫn thật nên kết quả trên vẫn đúng. Ngoài ra `apps/hub/` (app thứ 3, có `vite.config` + build
riêng trong `npm run build`) **không được nhắc ở đâu trong CLAUDE.md**.

**F6 🟢 201 dòng code chết** (0 nơi tham chiếu, xác nhận bằng grep + codemap):
`components/MeshTelemetry/RealtimeCostTelemetryBadge.tsx` (55) · `components/PosFilter.tsx` (36 —
`Dictionary.tsx` tự quản state `posFilter` riêng, không dùng component này) ·
`lib/coLearningAudioApi.ts` (110).

**F7 🟢 Đánh số migration trùng:** `0026`, `0027`, `0059` mỗi số có 2 file (65 file / 62 số).
**KHÔNG gây bỏ sót** — `scripts/run-pg-migrations.ts` theo dõi theo **tên file** (đã kiểm chứng
bằng lượt chạy thật ở trên), và 3 cặp đều chạm bảng rời nhau nên thứ tự alphabet vô hại. Nhưng
quy ước đã vỡ: lần sau hai file trùng số CÓ phụ thuộc nhau thì thứ tự thành may rủi.

**F8 🟢 Ngân sách bundle gần chạm trần:** JS 98,1% (120,72/123 kB) · CSS 98,3% (15,72/16 kB) —
còn ~2,3 kB JS. Một tính năng nhỏ nữa là CI đỏ vì size.

**F9 🟢 Hai điểm gia cố (không phải lỗ hổng đang khai thác được):**

- `packages/core-auth/security.ts:24` — thiếu `ALLOWED_ORIGINS` thì CORS về `*` **im lặng**
  (có `Allow-Credentials` thì không, nên chưa khai thác được). Production quên biến này =
  tự nới CORS mà không có cảnh báo nào. Đề xuất: fail-safe khi `NODE_ENV=production`.
- `packages/core-personal/personErasureService.ts:338` — `DELETE FROM ${schema}.${table}` nối
  chuỗi. **Đã xác minh 100% lời gọi truyền chuỗi hằng** → không phải SQLi. Đề xuất phòng xa:
  cho định danh qua danh sách trắng.

#### Đã rà và KHÔNG có lỗi (ghi lại để lần sau khỏi rà lại)

Kiểm quyền: 105 handler, chỉ 6 handler không gọi `validateAuth` — 5 handler GET công khai có chủ
đích kèm comment giải thích (`app-settings`, `plan-marketing`, `plan-features`, `plan-prices`,
`subjects`) + `payment-webhook` xác minh chữ ký riêng và **idempotent** (`status === 'paid'` chặn
cộng gói lần 2). 0 handler admin thiếu `requireAdmin`. `friends.ts:82` nhận `userId` từ query nhưng
`removeFriend(auth.userId, otherUserId)` neo theo token → **không phải IDOR**. 0 chỗ log token.
0 chỗ trả `.stack` ra client. 0 `process.env` phi-`VITE_` trong code client. `/api/health/deep` trả
bản rút gọn cho người lạ, chi tiết chỉ cho admin — **đúng thiết kế, không phải thiếu sót**.
`reportRedisStatusAtStartup()` im khi không có `REDIS_URL` là đúng — đã có
`warnIfClusterWithoutRedis()` lo nhánh đó. 0 script mồ côi (mọi file `scripts/*.ts` ngoài
`package.json` đều là `*.test.ts` hoặc `scripts/archive/`). `postgres/migrations/README.md` liệt
kê đủ 65/65 file. `schema.sql` không chứa bảng của migration 0055–0062 **không phải drift** —
runner áp `schema.sql` trước rồi mới tới toàn bộ migration nên cài mới vẫn hội tụ (đã chạy thật).

#### Phân loại việc

- **AI tự làm được:** F1 (hàm `shuffle()` dùng chung + thay 18 chỗ), F2 (sửa 2 test flaky),
  F4 (sửa hook + doc), F5 (cập nhật đường dẫn trong CLAUDE.md/QUY-TRINH-AUDIT.md + bổ sung
  `apps/hub`), F6 (xoá code chết — **cần người dùng xác nhận trước khi xoá**), F7 (đổi tên file),
  F9 (gia cố CORS + danh sách trắng định danh).
- **Cần người dùng:** F3 — chạy `npm run eval:tutor` với key AI thật rồi cập nhật baseline.
  F8 — quyết định nâng ngưỡng size hay tách bundle.

**KẾT LUẬN: Không có lỗi chặn.** Mọi cổng bắt buộc đều xanh. Cần xử lý theo thứ tự
**F1 → F2 → F3** (F1 đang làm sai điểm người học ngay lúc này).
