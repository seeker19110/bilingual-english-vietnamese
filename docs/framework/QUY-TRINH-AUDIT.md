# QUY TRÌNH AUDIT TOÀN DIỆN

> Đặc tả quy trình rà soát toàn diện dự án **Gia sư tiếng Anh AI** (bilingual-english-vietnamese).
> Mục tiêu: khi ai đó (người dùng, Claude, hoặc subagent) yêu cầu "audit toàn diện / rà soát toàn bộ",
> có **một chuẩn lặp lại được** — không thiếu bước, không đoán, kết quả so sánh được giữa các lần.
>
> Quan hệ với các tài liệu khác:
>
> - Mục **8–10** trong `CLAUDE.md` = cổng **commit/merge** cho MỘT thay đổi. File này = quy trình
>   **audit ĐỊNH KỲ** cho TOÀN dự án (rộng hơn: bảo mật, độ phủ test, đối chiếu tài liệu, phân loại việc).
> - `docs/framework/HUONG-DAN-cau-hinh-precommit-CI.md` = cấu hình công cụ (Prettier/ESLint/CI). File này
>   = **cách dùng** các công cụ đó thành một lượt audit hoàn chỉnh.

---

## 0. Khi nào chạy audit này

- Người dùng yêu cầu trực tiếp ("rà soát toàn bộ", "audit toàn diện").
- **Cổng giữa các giai đoạn** (KHUNG-1): trước khi chuyển giai đoạn hoặc trước thay đổi lớn.
- Định kỳ (khuyến nghị: trước mỗi đợt deploy production, hoặc mỗi cuối tuần làm việc).
- Sau khi merge một loạt PR liên quan nhau, để chắc không có tương tác ngoài ý muốn.

> Audit ≠ cổng commit. Cổng commit chạy cho từng diff nhỏ; audit chạy cho **trạng thái toàn repo**
> ở một thời điểm, kể cả khi working tree sạch (không có diff nào).

---

## 1. Nguyên tắc

1. **Chạy thật, đọc output thật** — không đoán kết quả lệnh (mục 5 CLAUDE.md).
2. **Không sửa trong lúc audit** — audit là ĐỌC + BÁO CÁO. Nếu phát hiện lỗi: ghi vào báo cáo, phân loại
   (tự sửa được / cần người dùng), rồi mới tách việc sửa thành thay đổi riêng có PR. Không trộn "phát hiện"
   với "sửa" trong cùng một lượt — trừ khi người dùng yêu cầu sửa luôn.
3. **Phân loại việc rõ ràng** — mỗi phát hiện phải nói **AI tự làm được** hay **cần người dùng thao tác tay**
   (VD: điền secret trên VPS, chạy migration Supabase production, bật branch protection — AI không có quyền).
4. **Đối chiếu, không tin trí nhớ** — trạng thái thật đọc từ repo/lệnh, KHÔNG lấy từ hook đầu phiên hay
   ghi chú cũ (chúng có thể lỗi thời — đã từng xảy ra với trạng thái migration).

---

## 2. Bảy tầng audit

Chạy tuần tự. Mỗi tầng ghi rõ: **lệnh**, **tiêu chí đạt**, **nếu fail thì làm gì**, **ai xử lý**.

### Tầng 1 — Cổng tự động (bắt buộc, luôn chạy)

| Mục         | Lệnh                   | Tiêu chí đạt                                                       |
| ----------- | ---------------------- | ------------------------------------------------------------------ |
| Build       | `npm run build`        | Thoát 0, không lỗi vite/tsc                                        |
| Typecheck   | `npm run typecheck`    | 0 lỗi (gộp `tsconfig` + `tsconfig.api.json` + `tsconfig.e2e.json`) |
| Lint        | `npm run lint`         | 0 cảnh báo (`--max-warnings 0`)                                    |
| Format      | `npm run format:check` | "All matched files use Prettier code style"                        |
| Unit test   | `npm test`             | 100% pass; ghi số `X/Y`                                            |
| Bundle size | `npm run size`         | JS ≤ 123 kB · CSS ≤ 9.4 kB (brotli)                                |

- **Nếu fail:** dừng, ghi lỗi cụ thể vào báo cáo. Đây là fail chặn (blocking).
- **Ai xử lý:** AI tự sửa được (lỗi code/format).
- **Lưu ý stderr "giả":** `src/lib/ai.test.ts` in log lỗi có chủ đích (test nhánh xử lý lỗi). Đó KHÔNG phải
  test fail — chỉ đọc dòng `Test Files … passed` / `Tests … passed` để kết luận.

### Tầng 2 — Bảo mật

| Mục                     | Cách kiểm                                                                           | Tiêu chí đạt                                           |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Secret hardcode         | Quét `sk-…`, `AIza…`, `api_key=…` trong `src`/`api`/`server.ts` (trừ `*.test.*`)    | 0 khớp                                                 |
| `.env` bị track         | `git ls-files \| grep -E "^\.env($\|\.)"`                                           | chỉ `.env.example`                                     |
| Lỗ hổng dependency      | `npm audit --omit=dev`                                                              | 0 mức high/critical (low/moderate: ghi nhận, cân nhắc) |
| Logic nhạy cảm ở server | Rà `api/` + `server.ts`: kiểm quyền (`validateAuth`), đếm lượt, gọi AI đều ở server | không có logic nhạy cảm chạy ở client                  |
| RLS Supabase            | Đối chiếu `supabase/schema.sql` — bảng có dữ liệu người dùng đều bật RLS            | mọi bảng người dùng có policy                          |

- **Nếu fail:** secret lộ = fail chặn, xử lý NGAY (xoay key nếu đã đẩy lên remote). `npm audit` high/critical =
  ghi vào báo cáo + đề xuất nâng phiên bản.
- **Ai xử lý:** AI rà + đề xuất; xoay key thật / cập nhật secret trên VPS = **người dùng**.

### Tầng 3 — Vệ sinh code

| Mục                     | Cách kiểm                               | Tiêu chí đạt                                                   |
| ----------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `console.log` rác       | Quét `src`/`api` (trừ `*.test.*`)       | 0 (log khởi động chủ đích trong `server.ts` KHÔNG tính là rác) |
| TODO/FIXME/XXX sót      | Quét `src`/`api`/`server.ts` (trừ test) | 0, hoặc mỗi cái có issue/ghi chú trong PROGRESS                |
| `any` lọt lưới          | Quét `: any` / `as any` ngoài test      | 0 mới (mục 4.1 CLAUDE.md)                                      |
| Code chết / import thừa | Lint đã bắt phần lớn (`no-unused-vars`) | không còn cảnh báo                                             |

- **Ai xử lý:** AI tự sửa được.

### Tầng 4 — Chất lượng AI (chỉ khi liên quan)

- **Kích hoạt khi:** audit chạy sau khi có thay đổi `src/prompts/*` hoặc `api/_lib/aiConfig.ts` kể từ lần
  eval gần nhất.
- **Lệnh:** `npm run eval:tutor` (cần key AI trong `.env`).
- **Tiêu chí đạt:** recall/precision **không tụt** so với `docs/research/eval-tutor-baseline.md`.
- **Nếu fail:** không được merge thay đổi prompt/model; dán bảng so sánh vào báo cáo (mục 8 CLAUDE.md).
- **Ai xử lý:** AI chạy được nếu có key; nếu không có key trong môi trường audit → ghi "cần chạy tay có key".

### Tầng 5 — Độ phủ test (coverage) + rà vùng thiếu test

Đây là phần đi xa hơn cổng commit: không chỉ "test có xanh không" mà "test có ĐỦ không".

**5a. Coverage gate (định lượng):**

- **Lệnh:** `npm run test:coverage`.
- **Tiêu chí đạt:** vượt ngưỡng SÀN trong `vitest.config.ts` (cơ chế "ratchet" — không tệ hơn hiện tại).
  Ngưỡng hiện tại (đo 2026-07-02): statements 18 · branches 81 · functions 52 · lines 18. Chỉ đo LOGIC THUẦN
  (`src/lib/**`, `api/**`), không đo UI.
- **Khi thêm test mới:** NÂNG DẦN các ngưỡng này (đừng để trôi xuống). Ghi mốc mới vào PROGRESS.

**5b. Rà vùng thiếu test (định tính — theo mục 9 CLAUDE.md "chống lỗi logic"):**

Mở báo cáo coverage HTML (`coverage/index.html`) và soi các file `src/lib/**` + `api/**` có nhánh chưa phủ.
Với mỗi hàm logic phức tạp, đối chiếu checklist:

- [ ] **Ca biên / rỗng:** mảng rỗng, chuỗi rỗng, `undefined`, giá trị 0.
- [ ] **`null` vs 0:** phân biệt "chưa có" và "bằng không" (đếm lượt, điểm, streak).
- [ ] **Async race / idempotency:** gọi 2 lần, gọi song song, retry — đặc biệt đếm lượt (`api/_lib/usage.ts`)
      và hoàn lượt (`0004_refund_usage`).
- [ ] **Thời gian UTC:** ranh giới ngày, đổi múi giờ, reset lượt theo ngày.
- [ ] **Nhánh lỗi:** mọi thao tác mạng/DB/AI có test cho nhánh thất bại.

**Tiêu chí đạt:** mỗi nhánh logic phức tạp có ≥ 1 test ca biên. Vùng thiếu → **ghi danh sách đề xuất bổ sung
test** vào báo cáo (KHÔNG tự viết test trong lượt audit — đó là việc tách riêng, trừ khi người dùng yêu cầu).

**5c. E2E + a11y:**

- **Lệnh:** `npm run test:e2e` (Playwright + axe).
- **Tiêu chí đạt:** mọi flow chính xanh; axe không có vi phạm WCAG AA mới.
- **Ai xử lý:** AI chạy được nếu môi trường có Chromium (`/opt/pw-browsers`).

### Tầng 6 — Đối chiếu tài liệu & hạ tầng

| Mục                      | Cách kiểm                                                                       | Tiêu chí đạt                                                            |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Git vs nhánh chính       | `git fetch origin main && git rev-list --left-right --count origin/main...HEAD` | biết rõ ahead/behind; nếu behind → cân nhắc rebase                      |
| Working tree             | `git status -sb`                                                                | sạch, hoặc mọi thay đổi có chủ đích                                     |
| PROGRESS.md khớp thực tế | Đọc PROGRESS + đối chiếu code/migration thật                                    | không có mục "đã xong" mà code chưa có (và ngược lại)                   |
| Migration Supabase       | Đọc `supabase/migrations/README.md` — cột "Đã chạy production?"                 | biết migration nào chưa áp; **đọc file thật, không tin hook đầu phiên** |
| Nợ kỹ thuật              | Đối chiếu danh sách nợ trong CLAUDE.md/PROGRESS với thực tế                     | mỗi nợ còn đúng, phân loại ai xử lý                                     |

- **Ai xử lý:** AI đối chiếu + báo cáo; chạy migration production / rebase = cần người dùng xác nhận.

### Tầng 7 — Báo cáo & phân loại

Xuất báo cáo theo **mẫu mục 10 CLAUDE.md**, rồi thêm phần phân loại việc (xem §3).

---

## 3. Mẫu báo cáo audit

```
=== BÁO CÁO AUDIT TOÀN DIỆN — <ngày giờ UTC> · nhánh <tên> ===

TẦNG 1 — Cổng tự động
Build ✅/❌ | Type ✅/❌ (lỗi:..) | Lint ✅/❌ (cảnh báo:..) | Format ✅/❌ | Test ✅/❌ (X/Y) | Size ✅/❌ (JS ../123kB · CSS ../9.4kB)

TẦNG 2 — Bảo mật
Secret hardcode ✅/❌ | .env sạch ✅/❌ | npm audit (high/critical: ..) | RLS ✅/❌

TẦNG 3 — Vệ sinh code
console.log rác ✅/❌ | TODO/FIXME ✅/❌ | any lọt lưới ✅/❌

TẦNG 4 — Chất lượng AI
(Chạy nếu đụng prompt/model) eval:tutor ✅/❌ vs baseline | hoặc "N/A — không đổi prompt/model"

TẦNG 5 — Độ phủ test
Coverage gate ✅/❌ (stmts/branches/funcs/lines) | E2E+a11y ✅/❌ | Vùng thiếu test đề xuất: [..]

TẦNG 6 — Đối chiếu tài liệu
Git: ahead X / behind Y | Working tree ✅/❌ | PROGRESS khớp ✅/❌ | Migration chưa áp: [..] | Nợ kỹ thuật: [..]

--- PHÂN LOẠI VIỆC ---
AI tự làm được: [..]
Cần người dùng thao tác tay: [.. VD: điền SENTRY_DSN/SUPABASE_DB_URL trên VPS, chạy migration production ..]

Rủi ro/ảnh hưởng: ..
Góp ý cải tiến: ..
KẾT LUẬN: Sẵn sàng / Cần xử lý: [..]
```

Bất kỳ mục ❌ ở Tầng 1–2 (chặn) → nêu rõ trong kết luận là "Cần xử lý", không kết luận "Sẵn sàng".

---

## 4. Ghi chú vận hành

- **Cài dependency trước:** môi trường sạch cần `npm ci` trước khi chạy các tầng (kiểm `node_modules` tồn tại).
- **Song song hóa:** các lệnh độc lập (typecheck / lint / format:check) có thể chạy song song để nhanh hơn;
  build + size phải chạy tuần tự (size đọc `dist/`).
- **Không cần key:** Tầng 1, 2, 3, 5a, 6 chạy được offline không cần secret. Tầng 4 (eval) và một số E2E cần key/mạng.
- **Lịch định kỳ:** có thể dùng `send_later` / trigger để tự hẹn chạy lại audit (đã dùng trong thực tế).
- **Không tự thêm CI/script trong đặc tả này** (quyết định phạm vi 2026-07-17: chỉ tài liệu). Nếu sau này muốn
  gộp Tầng 1–3 thành `npm run audit` hoặc job CI hàng tuần → mở thay đổi riêng, cập nhật file này.
