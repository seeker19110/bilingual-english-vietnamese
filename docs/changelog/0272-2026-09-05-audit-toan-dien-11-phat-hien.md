# 0272 — 2026-09-05 — Audit toàn diện 12 nhóm: 12 phát hiện, vá hết trong một đợt

**PR:** #TBD · **Nhánh:** `chore/audit-toan-dien-2026-09-05`

## Bối cảnh

Người dùng yêu cầu "audit kỹ" → chạy AUDIT TOÀN DIỆN theo `AUDIT.md` (10 tầng vi mô) +
`docs/framework/QUY-TRINH-AUDIT.md`, rồi sửa hết trong MỘT PR theo yêu cầu.

## Kết quả quét (GIAI ĐOẠN 1 — chỉ đo, không sửa)

Mọi cổng cứng XANH, đo thật trên commit `91bdbf6b`:

- typecheck 0 lỗi (4 tsconfig) · lint 0 · format 0
- **12.152 test / 573 file pass 100%** · coverage **98,31 / 94,54 / 97,65 / 98,31** (sàn 97/93/96/97)
- build (client + server + hub) OK · bundle JS 128,44/140 kB · CSS 18,03/20 kB
- `npm audit --omit=dev` 0 · codemap cycles 0 · **E2E a11y 402/402 pass** (15 trang × 5 theme, A/AA + AAA)
- 0 SQL nối chuỗi · 0 `dangerouslySetInnerHTML` · 0 `any` trong mã · 0 catch rỗng · 0 rò connection
  pool · webhook SePay idempotent · `SKIP_AUTH` khoá kép · đủ 5 security header

Phát hiện đáng lo nhất KHÔNG nằm ở mã sản phẩm mà ở **lớp công cụ tự kiểm**: ba trong bốn mục
🟠 đều là "tài liệu/công cụ nói đang gác một thứ mà thực tế không gác".

## 12 phát hiện và cách xử lý

(11 từ lượt quét + F12 lộ ra trong lúc sửa F7.)

| #      | Phát hiện                                                                                                                                                         | Xử lý                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| F1 🟠  | `jsx-a11y` **chưa từng được cài** dù `CLAUDE.md` §4.5 và `AUDIT.md` đều nói có                                                                                    | Cài + bật `plugin:jsx-a11y/recommended`; **42 vi phạm** lộ ra, vá hết                                         |
| F2 🟠  | `.codemap/graph.json` ghi 18/08 (TRƯỚC cải tổ 23/08) vẫn được dùng im lặng → `orphans` trả về `api/`, `server.ts`, `apps/english/` đã bị xoá                      | Thêm `isGraphStale()` (+3 test): bản đồ cũ hơn mã nguồn thì tự quét lại (~12s)                                |
| F3 🟠  | `nginx/dhcb.conf` trùng `server_name` với `en-vi.conf` nhưng thiếu `/api/`, `@express`, cache tĩnh                                                                | Xoá `dhcb.conf`; đóng nợ kỹ thuật #1                                                                          |
| F4 🟡  | `ambientVisionService.ts` đọc `VITE_GEMINI_API_KEY` — đặt biến đó là Vite **nhúng khoá vào bundle client**                                                        | Bỏ nhánh dự phòng, chỉ còn `GEMINI_API_KEY`                                                                   |
| F5 🟡  | 5 chỗ dùng ngày UTC cho nghiệp vụ ngày VN (`Life.tsx` ×4, `history.ts`) → 00:00–07:00 giờ VN lệch sang hôm trước                                                  | Dùng `vnDateStr()` / `addDays()`                                                                              |
| F6 🟡  | `AUDIT.md` lệch thực tế (sàn coverage, ngân sách bundle, giới hạn AI) và **9 lệnh grep trỏ thư mục đã xoá** → chạy ra rỗng, dễ đọc nhầm là "sạch"                 | Sửa số + đường dẫn theo nguồn thật                                                                            |
| F7 🟢  | ESLint bỏ qua toàn bộ `scripts/` (kể cả script vận hành và test canh CI)                                                                                          | Bỏ khỏi `ignorePatterns`, mở rộng lint sang `.js/.mjs`, vá 34 lỗi lộ ra                                       |
| F8 🟢  | 1 lỗ hổng **high** `fast-uri` (dev)                                                                                                                               | `npm audit fix` → 0                                                                                           |
| F9 🟢  | Thư mục rỗng `apps/english/` sót sau cải tổ                                                                                                                       | Xoá                                                                                                           |
| F10 🟢 | Ngân sách CSS chỉ còn 1,97 kB, trái mô tả "ngân sách bundle nay rộng"                                                                                             | Ghi đúng lại trong `PROGRESS.md`, **không nới ngưỡng lần thứ hai**                                            |
| F12 🟡 | `.lintstagedrc.json` còn trỏ glob `api/**` (thư mục đã xoá 23/08) nên **`apps/server/src` không hề được ESLint kiểm lúc commit**, và `scripts/` chỉ chạy Prettier | Sửa glob sang `apps/server/src`, thêm `eslint` cho `scripts/`                                                 |
| F11 🟢 | Không có `docs/FEATURE-MAP.md` → Nhóm 12 thiếu nguồn đối chiếu                                                                                                    | Thêm `npm run gen:feature-map` **sinh tự động** từ `App.tsx` + `routes.ts` (104 route, 112 endpoint) + 5 test |

## Quyết định kèm theo

- **`FEATURE-MAP.md` sinh tự động, không chép tay.** Chính F6 vừa chứng minh tài liệu chép tay sẽ
  lệch khỏi code; một bản đồ tính năng viết tay sẽ lặp lại đúng lỗi đó.
- **7 chỗ `autoFocus` GIỮ NGUYÊN** (kèm `eslint-disable` có lý do): ô nhập chỉ hiện SAU thao tác
  người dùng (mở form / bấm "thêm") hoặc là ô duy nhất của trang đăng nhập — bỏ đi là hại UX bàn
  phím chứ không lợi.
- **4 chỗ `media-has-caption` GIỮ NGUYÊN**: đó là bản ghi của CHÍNH người dùng tự nghe lại.
- **`scripts/archive/` vẫn không lint** — script dùng một lần đã đóng băng, giữ làm lịch sử.

## Bằng chứng

Chạy lại toàn bộ cổng sau khi sửa — xem mô tả PR (mục Validation).
