# Tổng hợp Nghiên cứu: Kho Kien Thuc Mon Hoc

Tài liệu này gộp từ 5 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: dac-ta-gd2-mon-toan-2026-08-01.md

_(Chi tiết nguồn gốc: `dac-ta-gd2-mon-toan-2026-08-01.md`)_

# Đặc tả GĐ2 — Môn thứ hai: TOÁN (mầm non → cấp 3)

> Ngày: 2026-08-01 · Căn cứ: `docs/adr/0001-nen-tang-da-linh-vuc.md` +
> `docs/research/ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §4 GĐ2
> Trạng thái: **đặc tả, chưa thi hành** · Phạm vi đã MỞ RỘNG 2026-08-01 (mầm non → cấp 3, xem §2)
> — chia 4 đợt (2a-2d), đợt này (đặc tả chi tiết) chỉ phủ **đợt 2a: cấp 2, 6-8 tuần, 9 PR**.
> Đợt 2b/2c/2d sẽ có đặc tả con riêng, viết sau khi 2a đạt cổng.
> Điều kiện tiên quyết: **GĐ1 đã HOÀN TẤT** (PR-1..7, xem PROGRESS.md) — `apps/hub` đã lên
> production, `packages/core-*` đã tách, cột `subject` đã có ở `daily_usage`/`free_daily_credit`
> (migration `0029`), schema `english` đã tách (migration `0030`).

---

## 0. Nguyên tắc bám sát

- **MVP hẹp, không ôm hết.** Lớp 6–9, mỗi lớp 3 chủ đề (12 chủ đề tổng — chọn ở §2.1). Không làm
  lớp 10-12, không làm Lý/Hoá (GĐ3).
- **Chấm bằng thuật toán, KHÔNG để AI phán đúng/sai.** AI chỉ sinh lời giải thích/gợi ý — theo
  đúng rủi ro đã ghi ở kế hoạch tổng §6 ("AI chấm sai Toán"). So khớp đáp án bằng chuẩn hoá
  số/biểu thức, không gọi AI để chấm.
- **Bản quyền:** đề bài **tự sinh theo tham số** (template + random trong khoảng hợp lệ), bám
  **chương trình GDPT 2018** (văn bản nhà nước) làm khung chủ đề — không chép đề/sách giáo khoa
  thương mại nào.
- **Tái dùng packages/core-\* tối đa**, chỉ viết mới phần Toán thật sự khác (packages/core-math,
  apps/math). Không sửa `packages/core-auth`/`core-billing`/`core-ai`/`core-ui` trừ khi phát hiện
  chỗ hard-code riêng tiếng Anh cần tổng quát hoá (ví dụ tên bảng, không phải hành vi).
- **Không đụng app tiếng Anh đang chạy** — mọi PR ở GĐ2 phải giữ `apps/english` nguyên hành vi
  (E2E xanh trước & sau mỗi PR, giống kỷ luật GĐ1).

---

## 1. Trạng thái xuất phát (đã đọc repo, không đoán)

| Thành phần            | Hiện tại                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/`               | `english/` (đủ tính năng), `hub/` (trang giới thiệu, tab "Toán" đang hiện "sắp ra mắt")                     |
| `packages/`           | `core-auth`, `core-billing`, `core-ai`, `core-db`, `core-ui` — đã tách ở GĐ1                                |
| Đếm lượt              | `daily_usage`/`free_daily_credit` đã có cột `subject` (mặc định `'english'`, migration `0029`)              |
| Schema DB             | `core` (dùng chung) + `english` (dữ liệu học tiếng Anh, migration `0030`) — chưa có schema `math`           |
| Render công thức toán | **Chưa có** — chưa dùng KaTeX/MathJax ở đâu trong repo                                                      |
| Sinh đề có tham số    | **Chưa có** — chưa có cơ chế tương tự                                                                       |
| SRS                   | Đã có cho từ vựng tiếng Anh (`apps/english/src/lib/srs.ts`) — thuật toán chung tái dùng được, dữ liệu không |

---

## 2. Phạm vi — MỞ RỘNG theo yêu cầu 2026-08-01: mầm non → cấp 3

> **Quyết định 2026-08-01:** thay vì chỉ lớp 6-9, người dùng yêu cầu làm đủ **mầm non → cấp 1 →
> cấp 2 → cấp 3** ngay trong GĐ2. Đây là phình phạm vi lớn so với bản gốc — đúng rủi ro **🔴 cao
> nhất** mà chính kế hoạch tổng đã cảnh báo ("phình phạm vi, không môn nào tới nơi", §6). Để
> không rơi vào rủi ro đó, GĐ2 **KHÔNG làm 4 cấp cùng lúc** — chia thành 4 đợt con
> (2a → 2b → 2c → 2d), **mỗi đợt có cổng ra riêng, đợt sau chỉ mở khi đợt trước đạt cổng** (đúng
> nguyên tắc CLAUDE.md mục 3 "cổng giữa các giai đoạn" + kế hoạch tổng §6 "cấm mở môn mới khi
> môn trước chưa đạt cổng" — áp tương tự cho cấp học). Thứ tự đề xuất **cấp 2 trước** (giữ nguyên
> §2.1 gốc, đã có đặc tả kỹ thuật sẵn — chấm tự động dễ nhất) rồi tới cấp 1, mầm non, cấp 3 —
> **xin xác nhận thứ tự này hoặc đổi lại** trước khi mở PR-1.

### 2.1 Bản đồ 4 đợt (2a–2d)

| Đợt | Cấp học          | Phạm vi lớp/độ tuổi                                                                      | Đặc điểm khác biệt cần lưu ý                                                                                                                                                                                      |
| --- | ---------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2a  | Cấp 2 (THCS)     | Lớp 6-9, 3 chủ đề/lớp (12 chủ đề — bảng §2.1a)                                           | Đã có đặc tả kỹ thuật đầy đủ (KaTeX, sinh đề, chấm) — làm trước để kiểm chứng kiến trúc                                                                                                                           |
| 2b  | Cấp 1 (Tiểu học) | Lớp 1-5, 2-3 chủ đề/lớp                                                                  | Không cần KaTeX phức tạp (số học cơ bản); giao diện to, ít chữ, nhiều hình ảnh/màu; phụ huynh có thể là người dùng chính (theo dõi hộ con), không phải học sinh tự thao tác hết                                   |
| 2c  | Mầm non          | 3-6 tuổi, không chia "lớp" mà chia theo kỹ năng (đếm số, nhận biết hình, so sánh lớn/bé) | **Khác hẳn cấu trúc "chấm đúng/sai"** — trẻ mầm non không đọc viết thạo, cần tương tác bằng giọng nói/chạm/kéo-thả, không phải nhập đáp số. Đây là thiết kế UI/UX RIÊNG, không tái dùng khung luyện tập của 2a/2b |
| 2d  | Cấp 3 (THPT)     | Lớp 10-12, chủ đề chọn lọc chấm tự động được (đại số, lượng giác cơ bản)                 | Kiến thức khó hơn — rủi ro AI soạn nháp sai kiến thức cao hơn (§7), cần người có chuyên môn duyệt kỹ hơn cấp 2                                                                                                    |

> **Mầm non (2c) là đợt khác biệt lớn nhất kỹ thuật lẫn UX** — không phải "Toán nhưng dễ hơn" mà
> gần như một sản phẩm con riêng (tương tác giọng nói/chạm, không có "đáp số" theo nghĩa nhập
> liệu). Đề xuất làm **sau cùng** hoặc tách thành nhánh nghiên cứu UX riêng trước khi cam kết lịch
> — không đoán trước cách làm ở đặc tả này, sẽ viết đặc tả con riêng cho đợt 2c khi tới lượt.

### 2.1a Đợt 2a — 12 chủ đề cấp 2 (**CHỐT theo SGK thật, 2026-08-01**)

> ✅ **Không còn là phỏng đoán.** Danh sách dưới đây chọn lại sau khi trích mục lục thật của 8 tập
> SGK "Kết nối tri thức" (Toán 6-9) — xem `docs/research/muc-luc-sgk/toan-6..9.md` và nhật ký đối
> chiếu ở `kho-kien-thuc-toan-gdpt2018.md` §8.

Tiêu chí chọn (theo `huong-dan-doi-chieu-sgk.md` Bước 4): (1) **chấm tự động được** — cột ✅ ở mục
lục; (2) là **trọng tâm** của lớp theo SGK (chiếm cả một chương, nhiều bài luyện tập chung);
(3) có **`prerequisites` rõ ràng**.

| Lớp | 3 chủ đề đợt 2a                                                                            | Chương tương ứng trong SGK             |
| --- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| 6   | Số tự nhiên & phép tính · Số nguyên · Phân số                                              | I + II · III · VI                      |
| 7   | Số hữu tỉ · Tỉ lệ thức & đại lượng tỉ lệ · Đa thức một biến                                | I · VI · VII                           |
| 8   | Hằng đẳng thức đáng nhớ · Phương trình bậc nhất một ẩn · Hàm số bậc nhất                   | II · VII (Bài 25-26) · VII (Bài 27-29) |
| 9   | Căn bậc hai & căn bậc ba · Hệ phương trình bậc nhất hai ẩn · Phương trình bậc hai và Viète | III (T1) · I (T1) · VI (T2)            |

**Thay đổi so với bản phỏng đoán cũ** (2 mục):

| Lớp | Cũ                                 | Mới                                                                      | Lý do theo SGK                                                                                                                                                                 |
| --- | ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7   | Biểu thức đại số đơn giản          | **Đa thức một biến**                                                     | Chương VII dành **5 bài** cho đa thức một biến (Bài 25-28 + luyện tập), chỉ **1 bài** cho biểu thức đại số → đa thức mới là trọng tâm; biểu thức đại số trở thành prerequisite |
| 9   | Phương trình bậc hai · Căn bậc hai | **Phương trình bậc hai và định lí Viète** · **Căn bậc hai & căn bậc ba** | SGK dành hẳn Bài 20 cho **định lí Viète**, và Bài 10 cho **căn bậc ba** — mở rộng phạm vi cho khớp trọn chương                                                                 |

Thứ tự trong bảng đã sắp **theo đúng trình tự dạy trên lớp** (tập một trước tập hai) để dựng lộ
trình khớp bài học sinh đang học.

> Danh sách chủ đề của 2b/2c/2d **để ngỏ, chốt khi tới lượt từng đợt** — tránh soạn trước nội dung
> rồi phải sửa lại khi đợt 2a đúc kết bài học thật. Với 2b/2d còn phải đối chiếu SGK Toán 1-5 và
> 10-12 (chưa có trong `tai-lieu-sgk/`).

### 2.2 Tính năng MVP (theo đúng khung ở kế hoạch tổng §4 GĐ2)

1. **Lộ trình theo chương** — cây 4 lớp → 3 chủ đề/lớp → bài học trong chủ đề, tương tự cấu trúc
   CEFR của tiếng Anh nhưng KHÔNG dùng lại code CEFR (khác domain hoàn toàn — số lớp/chủ đề cố
   định, không phải cấp độ ngôn ngữ).
2. **Bài giảng ngắn (chữ, không video ở MVP)** — giải thích khái niệm + 2-3 ví dụ có lời giải
   từng bước, viết tay (không AI sinh hàng loạt để tránh sai kiến thức toán — AI chỉ hỗ trợ soạn
   nháp, người dùng duyệt lại trước khi đưa vào `data/`).
3. **Luyện tập sinh đề theo tham số** — mỗi bài học có 1+ template đề (xem §3.2), sinh ngẫu nhiên
   trong khoảng tham số hợp lệ, không lặp đề y hệt lần liền trước.
4. **Giải thích từng bước** — mỗi đề sinh ra kèm lời giải từng bước tính SẴN từ template (không
   gọi AI real-time để tránh sai số học) — AI chỉ dùng khi học sinh hỏi thêm ("tại sao bước này
   làm vậy") qua ô hỏi tự do, giống chat hỗ trợ, không phải nguồn chấm điểm.
5. **SRS công thức** — tái dùng thuật toán SRS hiện có (`srs.ts` interval/ease) nhưng tách bảng dữ
   liệu riêng cho môn Toán (công thức/dạng bài thay vì từ vựng).
6. **Chấm & thống kê** — so khớp đáp số/biểu thức đã chuẩn hoá (§3.3), lưu lịch sử làm bài, thống
   kê % đúng theo chủ đề.

### 2.3 Ngoài phạm vi GĐ2 (ghi nhận, không làm ở bất kỳ đợt nào 2a-2d)

Hình học chứng minh, video bài giảng, AI chấm tự luận, thi thử theo đề thi thật, bảng xếp hạng
riêng môn Toán (dùng chung cơ chế `challenge` sẵn có nếu cần, không viết mới).

---

## 3. Kỹ thuật mới cần nghiên cứu trước khi code (research-first, theo KHUNG 3)

### 3.1 Render công thức — KaTeX

- Thư viện đề xuất: `katex` (nhanh hơn MathJax, không cần render server, license MIT). Cần xác
  nhận **phiên bản ổn định hiện hành thật** (không đoán) trước khi thêm vào `package.json` —
  tra npm lúc thi hành PR, không hard-code số phiên bản vào đặc tả này.
- Bundle size: KaTeX core ~23kB gzip + font — kiểm tra có vượt ngân sách bundle-size CI hiện có
  không (đã có gate ở GĐ trước). Nếu vượt, cân nhắc lazy-load KaTeX chỉ khi vào trang có công thức.
- Nhập công thức trên mobile: MVP dùng **bàn phím số + vài nút ký hiệu hay dùng** (`x`, `²`, `√`,
  `/`, `π`) thay vì bộ gõ LaTeX đầy đủ — học sinh THCS không quen cú pháp LaTeX. Chấm điểm parse
  chuỗi nhập (§3.3), không yêu cầu nhập đúng cú pháp KaTeX.

### 3.2 Sinh đề có tham số

- Mỗi đề = 1 template (chuỗi có placeholder `{a}`, `{b}`,...) + hàm sinh tham số theo ràng buộc
  (ví dụ: phương trình bậc hai phải có nghiệm đẹp, không sinh số vô tỉ ở lớp 6-7) + hàm tính đáp
  án đúng từ đúng bộ tham số vừa sinh (không tính lại bằng cách khác — một nguồn sự thật duy
  nhất, tránh lệch giữa đề hiển thị và đáp án chấm).
- Đề xuất cấu trúc dữ liệu tương tự `apps/english/src/data/*` (file JSON/TS tĩnh) — mỗi chủ đề
  một file `templates.ts` khai báo mảng `MathTemplate[]`.

### 3.3 Chấm bằng so khớp chuẩn hoá (không AI)

- Đáp số: chuẩn hoá số (rút gọn phân số, làm tròn theo yêu cầu đề, chấp nhận cả `1/2` và `0.5`
  nếu đề không ép định dạng) rồi so bằng dung sai (`epsilon`) cho số thập phân.
- Biểu thức đại số: chuẩn hoá bằng cách **rút gọn ký hiệu** (sắp xếp lại đơn thức, gộp hạng tử
  đồng dạng) — cần chọn thư viện parser đại số nhẹ (nghiên cứu `mathjs` hay tự viết parser tối
  giản cho phạm vi MVP — biểu thức bậc nhất/bậc hai một ẩn, không cần CAS đầy đủ). **Quyết định
  cụ thể (dùng thư viện hay tự viết) để dành cho lúc thi hành PR liên quan, sau khi so sánh
  bundle size + độ chính xác thật — không chốt trước trong đặc tả.**
- Không dùng AI để phán đúng/sai ở bất kỳ bước nào trong luồng chấm chính.

---

## 4. Kiến trúc — đích đến sau GĐ2

```
apps/
  math/                        ← MỚI: Vite app riêng, cấu trúc giống apps/english
    src/
      pages/                   ← Lộ trình, Bài học, Luyện tập, Kết quả
      components/              ← MathInput (bàn phím ký hiệu), KaTeXRender, StepSolution
      data/                    ← 4 lớp × 3 chủ đề: templates.ts, lessons.ts
      lib/                     ← genProblem.ts, gradeAnswer.ts, mathSrs.ts (dùng thuật toán chung
                                  của core-ui hoặc copy nhỏ — KHÔNG import ngược từ apps/english)
packages/
  core-math/                   ← CHỈ tách nếu Lý/Hoá (GĐ3) thật sự cần dùng lại — MVP GĐ2 để hết
                                  trong apps/math/src/lib theo đúng quy tắc "chưa cần thì chưa tách"
                                  (đã ghi rõ ở dac-ta-gd1 §1)
api/
  math-*.ts                    ← handler riêng môn Toán: math-progress.ts, math-attempt.ts,
                                  math-srs.ts — dùng chung validateAuth()/usage.ts của core-auth/
                                  core-billing, KHÔNG viết lại cơ chế đếm lượt
postgres/
  migrations/003x_schema_math.sql   ← tạo schema `math`, bảng math.attempts, math.srs_cards,
                                       math.lesson_progress (theo mẫu schema `english` ở 0030)
```

**Điểm nối duy nhất giữa schema `math` và `core`:** khoá ngoại `user_id` → `core.users(id)`,
đúng nguyên tắc đã chốt ở ADR-0001 §5.

**Routing theo Host:** thêm `math.donghanhcungban.org`/`.com` vào bảng tra `distDirForHost()`
trong `server.ts` (PR-7 đã dựng sẵn cơ chế "một dòng vào bảng tra Host" — không đụng logic hub
hay english). Nginx: thêm `server_name` mới trỏ cùng Express port 3001 (việc tay, giống hub).

---

## 5. Danh sách 9 PR — chỉ cho ĐỢT 2a (cấp 2)

> 9 PR dưới đây chỉ mở đủ điều kiện cấp 2 (đợt 2a). Đợt 2b (cấp 1), 2c (mầm non), 2d (cấp 3) mỗi
> đợt sẽ có **đặc tả con riêng** viết sau khi 2a đạt cổng ở §6 — không liệt kê PR trước vì nội
> dung/kỹ thuật của 2b-2d còn phụ thuộc bài học rút ra từ 2a (đặc biệt là PR-5: thuật toán chấm).

1. **PR-1 — Chốt 12 chủ đề + soạn nội dung mẫu 1 bài học đầy đủ (không code app).** Người dùng
   duyệt nội dung 1 bài mẫu (ví dụ "Phân số — lớp 6, bài 1") theo đúng định dạng dự kiến trước
   khi nhân rộng ra 12 chủ đề — tránh viết sai định dạng rồi phải sửa lại hàng loạt.
2. **PR-2 — Scaffold `apps/math`** (Vite app rỗng, layout + theme dùng chung `core-ui`, route
   khung, chưa có nội dung Toán thật). Thêm `math.` vào `distDirForHost()` + workspace root.
3. **PR-3 — Migration schema `math`** (`math.attempts`, `math.srs_cards`, `math.lesson_progress`)
   - handler API cơ bản (`math-progress.ts` đọc/ghi tiến độ, dùng `validateAuth()`/`usage.ts` có
     sẵn, subject=`'math'`).
4. **PR-4 — KaTeX + MathInput component** (nghiên cứu + tích hợp theo §3.1, có story/demo trang
   riêng để duyệt UI trước khi gắn vào luồng thật).
5. **PR-5 — Sinh đề theo tham số + chấm chuẩn hoá** (§3.2 + §3.3) cho **1 chủ đề thử nghiệm**
   (đề xuất: "Phương trình bậc nhất một ẩn" — lớp 8, đủ đại diện phép biến đổi + kiểm chứng thuật
   toán chấm trước khi nhân ra 11 chủ đề còn lại).
6. **PR-6 — Nhân rộng 11 chủ đề còn lại** dùng lại khung PR-5 đã kiểm chứng (việc lặp lại theo
   mẫu — phù hợp giao subagent mechanical/standard theo CLAUDE.md §3, không phải việc Opus tự làm).
7. **PR-7 — SRS công thức** (bảng `math.srs_cards`, tái dùng thuật toán interval/ease đã có,
   UI ôn tập riêng).
8. **PR-8 — Bảng thống kê + lịch sử làm bài** (theo chủ đề, theo lớp).
9. **PR-9 — Bật tab "Toán" thật ở hub** (bỏ trạng thái "sắp ra mắt"), onboarding lần đầu theo
   luồng đã dựng ở GĐ1 (hỏi lớp đang học/mục tiêu), nối luồng thanh toán chung (gói mua 1 lần
   dùng mọi môn — đã có sẵn từ `core-billing`, không viết lại).

**Nghiệm thu cao hơn bình thường ở PR-5** (thuật toán chấm sai sẽ ảnh hưởng trực tiếp trải
nghiệm học — học sinh bị chấm sai đề sẽ mất niềm tin ngay) — cần test ca biên kỹ: đáp án đúng
nhưng viết khác định dạng (`1/2` vs `0.5` vs `0,5`), đáp án gần đúng do sai số làm tròn, đáp án
để trống, ký tự thừa (khoảng trắng, dấu `=` thừa).

---

## 6. Cổng ra — đợt 2a (Definition of Done, chỉ cấp 2)

Đúng như kế hoạch tổng: **50 người dùng thật học Toán 1 tuần, chi phí AI/người ≤ mức của môn
Anh.** Đo cụ thể:

- Tab "Toán" ở hub bấm vào học được thật, không lỗi luồng chính (lộ trình → bài học → luyện tập
  → chấm → thống kê).
- Chấm đúng ≥ 99% trên bộ test ca biên đã liệt kê ở §5 PR-5 (test tự động, không phải ước lượng).
- Chi phí AI/người/tháng cho môn Toán ≤ chi phí AI/người/tháng môn Anh hiện tại (vì AI chỉ dùng
  cho soạn nháp bài giảng + trả lời câu hỏi tự do, KHÔNG dùng để chấm — chi phí per-request thấp
  hơn hẳn chat luyện nói).
- `apps/english` không hồi quy (E2E xanh, số lượng test bằng hoặc nhiều hơn trước GĐ2).
- CI xanh (quality + e2e), bundle-size KaTeX không vượt ngân sách đã đặt.

**Chỉ khi đợt 2a đạt đủ cổng trên mới viết đặc tả con cho đợt 2b (cấp 1)** — đúng nguyên tắc
"cấm mở cấp học mới khi cấp trước chưa đạt cổng" đã chốt ở §2.

---

## 7. Rủi ro riêng GĐ2 (bổ sung ngoài bảng rủi ro chung ở kế hoạch tổng §6)

| Rủi ro                                                                    | Mức     | Giảm thiểu                                                                                                                                  |
| ------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Thuật toán chấm chuẩn hoá bỏ sót định dạng đáp án hợp lệ                  | 🔴 cao  | Bộ test ca biên bắt buộc ở PR-5 trước khi nhân rộng (PR-6); thu thập log đáp án bị chấm sai để vá                                           |
| Nội dung bài giảng sai kiến thức toán (AI soạn nháp có thể sai)           | 🔴 cao  | Người dùng (hoặc người có chuyên môn) duyệt thủ công từng bài trước khi đưa vào `data/`, không tự động hoá bước này                         |
| Bàn phím nhập công thức trên mobile khó dùng, học sinh bỏ cuộc giữa chừng | 🟡 vừa  | Test tay trên điện thoại thật trước PR-9 (bắt buộc theo CLAUDE.md mục "UI/frontend"), ưu tiên bàn phím số đơn giản hơn cú pháp LaTeX đầy đủ |
| 12 chủ đề chọn sai trọng tâm (không khớp nhu cầu thật)                    | 🟢 thấp | PR-1 xin duyệt danh sách chủ đề trước khi viết code, dễ đổi hướng sớm với chi phí thấp                                                      |

---

## 8. Việc tiếp theo ngay (nếu người dùng duyệt đặc tả này)

1. Xác nhận thứ tự 4 đợt ở §2.1 (đề xuất: 2a cấp 2 → 2b cấp 1 → 2c mầm non → 2d cấp 3) hoặc đổi lại.
2. Duyệt/chỉnh danh sách 12 chủ đề đợt 2a ở §2.1a.
3. Duyệt định dạng 1 bài học mẫu (PR-1) trước khi mở PR-2 (scaffold app).
4. Từ PR-2 trở đi: mỗi PR làm xong tự báo cáo theo mẫu KHUNG (báo cáo xác thực CLAUDE.md mục 10),
   xin xác nhận cổng trước khi mở PR tiếp theo — không dồn nhiều PR cùng lúc.
5. Sau khi đợt 2a đạt cổng ở §6: viết đặc tả con riêng cho đợt 2b (cấp 1) — không soạn trước ở
   đây vì cần dựa vào bài học kỹ thuật rút ra thật từ 2a.

---

## [2] Tài liệu: kho-kien-thuc-hoa-gdpt2018.md

_(Chi tiết nguồn gốc: `kho-kien-thuc-hoa-gdpt2018.md`)_

# Kho kiến thức môn HOÁ HỌC — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3** (Lý + Hoá) trong `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §4
> Đọc trước: `kho-kien-thuc-toan-gdpt2018.md` §0 (nguồn gốc, ranh giới bản quyền, cổng duyệt
> chuyên môn — áp dụng y hệt) và `kho-kien-thuc-ly-gdpt2018.md` §0 (**vấn đề môn KHTN tích hợp,
> áp dụng y hệt cho Hoá**).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. Vị trí môn Hoá trong GDPT 2018 (giống Vật lí)

| Cấp          | Hoá học nằm ở đâu                                                          |
| ------------ | -------------------------------------------------------------------------- |
| Tiểu học 1-3 | Tự nhiên và Xã hội — không có nội dung hoá học đúng nghĩa                  |
| Tiểu học 4-5 | Môn **Khoa học** — sự biến đổi chất ở mức quan sát (nước, không khí, cháy) |
| THCS 6-9     | **Trong môn KHTN** (phân môn Hoá) — không tách riêng                       |
| THPT 10-12   | **Hoá học là môn riêng**, nhóm môn **lựa chọn**                            |

> Quyết định mô hình `subject` (PA A/B/C) đã nêu ở `kho-kien-thuc-ly-gdpt2018.md` §0.1 — **áp
> dụng chung cho cả Lý, Hoá, Sinh**, chốt một lần cho cả ba.

---

## 1. TIỂU HỌC (lớp 4-5) — quan sát, chưa có công thức

Nước (3 thể, vòng tuần hoàn) · không khí (thành phần, vai trò của oxygen với sự cháy) · sự biến
đổi của chất (hoà tan, đông đặc, nóng chảy) · an toàn khi dùng chất tẩy rửa.
**Không có công thức, không có phương trình hoá học** → dạng bài trắc nghiệm/quan sát.

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §6** cuối file.

### Lớp 6 — Chất quanh ta (chương II-IV, 9 bài) `[✓]`

Chất và vật thể · ba thể của chất, sự chuyển thể · **oxygen** (tính chất, vai trò với sự cháy) ·
**thành phần không khí** (≈78% N₂, ≈21% O₂, ~1% còn lại) · ô nhiễm không khí · một số vật liệu,
nhiên liệu, nguyên liệu, lương thực – thực phẩm · `[+]` **hỗn hợp** (chất tinh khiết/hỗn hợp,
dung dịch – huyền phù – nhũ tương) · **tách chất** (lọc, cô cạn, chiết).

> Chưa có công thức tính toán → chấm bằng trắc nghiệm.

### Lớp 7 — Nguyên tử, nguyên tố, bảng tuần hoàn, phân tử & liên kết (chương I-II, 6 bài)

| Nội dung                   | Kiến thức cốt lõi                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Nguyên tử `[✓]`            | Cấu tạo: hạt nhân (proton `p⁺`, neutron `n`) + vỏ electron (`e⁻`) · **số p = số e** (nguyên tử trung hoà điện) |
| Nguyên tố hoá học `[✓]`    | Kí hiệu hoá học · **số hiệu nguyên tử Z = số proton** · khối lượng nguyên tử (amu)                             |
| Bảng tuần hoàn `[✓]`       | Ô, chu kì, nhóm · sắp xếp theo **chiều tăng dần điện tích hạt nhân** · kim loại / phi kim / khí hiếm           |
| **Phân tử** `[+]`          | Đơn chất – hợp chất · **khối lượng phân tử = tổng khối lượng các nguyên tử** (Bài 5)                           |
| **Liên kết hoá học** `[+]` | Liên kết ion, liên kết cộng hoá trị ở mức giới thiệu (Bài 6)                                                   |
| **Hoá trị & CTHH** `[+]`   | **Quy tắc hoá trị `x·a = y·b`** · lập CTHH · **`%X = (x·M_X / M) × 100%`** (Bài 7)                             |

> `[+]` Cả chương II (Bài 5-7) trước đây **thiếu hoàn toàn** trong kho kiến thức. Đây là phần
> **tính toán hoá học đầu tiên** của chương trình (quy tắc hoá trị, phần trăm khối lượng nguyên
> tố) — chấm tự động được, nên đưa vào phạm vi GĐ3.

### Lớp 8 — Mol, phương trình hoá học, dung dịch, acid–base

Đây là lớp **bắt đầu tính toán hoá học** — quan trọng nhất về mặt kỹ thuật (cần chấm số + đơn vị).

| Nội dung                                | Công thức cốt lõi                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mol** `[≠]`                           | **`n = m / M`** (mol) · **`n = V(L) / 24,79 (L/mol)`** — điều kiện chuẩn **1 bar, 25 °C**. ⚠️ **KHÔNG phải 24, cũng không phải 22,4** — xác minh trên Bài 3 SGK KHTN 8, xem §6.2                    |
| Khối lượng mol `[✓]`                    | `M` (g/mol) · **tỉ khối `d_A/B = M_A / M_B`** · `d_A/kk = M_A / 29`                                                                                                                                 |
| **Định luật bảo toàn khối lượng** `[✓]` | Tổng khối lượng chất tham gia = tổng khối lượng sản phẩm                                                                                                                                            |
| Phương trình hoá học `[✓]`              | Lập PTHH, **cân bằng số nguyên tử mỗi nguyên tố hai vế** · tính theo PTHH                                                                                                                           |
| **Hiệu suất** `[✓]`                     | **`H = (lượng thực tế / lượng lí thuyết) × 100%`** (nằm trong Bài 6 "Tính theo phương trình hoá học")                                                                                               |
| Nồng độ dung dịch `[≠]`                 | **`C% = (m_ct / m_dd) × 100%`** · **`C_M = n / V`** (mol/L) — SGK dạy ở **Bài 4**, tức TRƯỚC định luật bảo toàn khối lượng (Bài 5) và tính theo PTHH (Bài 6) ⇒ `prerequisites` phải theo thứ tự này |
| Acid – base – oxide – muối `[✓]`        | Tính chất hoá học, thang **pH** (pH < 7 acid, = 7 trung tính, > 7 base) · phản ứng trung hoà · **bảng tính tan**                                                                                    |
| **Phân bón hoá học** `[+]`              | Phân đạm / lân / kali · tính %N, %P₂O₅, %K₂O (Bài 12)                                                                                                                                               |
| Tốc độ phản ứng `[✓]`                   | Các yếu tố ảnh hưởng: nồng độ, nhiệt độ, diện tích bề mặt, chất xúc tác (định tính)                                                                                                                 |

> `[−]` Kho kiến thức cũ xếp acid–base–oxide–muối chung một dòng; SGK tách thành **5 bài riêng**
> (Bài 8 Acid, Bài 9 Base & thang pH, Bài 10 Oxide, Bài 11 Muối, Bài 12 Phân bón) ⇒ khi soạn nội
> dung phải tách theo bài, không gộp.

### Lớp 9 — Kim loại, hữu cơ, tài nguyên vỏ Trái Đất (chương VI-X, 18 bài)

| Nội dung                                       | Kiến thức cốt lõi                                                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kim loại `[✓]`                                 | Tính chất chung · **dãy hoạt động hoá học của kim loại** (K, Na, Ca, Mg, Al, Zn, Fe, Pb, H, Cu, Ag, Au) · tách kim loại, hợp kim (gang, thép)                                                          |
| Phi kim `[≠]`                                  | SGK **không có chương phi kim riêng** — chỉ có Bài 21 "Sự khác nhau cơ bản giữa phi kim và kim loại". `[−]` Bỏ "sơ lược bảng tuần hoàn nâng cao" (không có)                                            |
| Hữu cơ `[≠]`                                   | Khái niệm hợp chất hữu cơ · **hydrocarbon**: **alkane `CₙH₂ₙ₊₂`** (Bài 23), **alkene `CₙH₂ₙ`** (Bài 24) · nguồn nhiên liệu. `[−]` Bỏ **acetylene `C₂H₂`** — KHTN 9 KNTT không dạy                      |
| Dẫn xuất `[≠]`                                 | **Ethylic alcohol `C₂H₅OH`** (SGK dùng tên này, không phải "ethanol") · **acetic acid `CH₃COOH`** · **phản ứng ester hoá** (trong Bài 27)                                                              |
| Lipid – carbohydrate – protein – polymer `[≠]` | SGK dành hẳn **chương IX, 5 bài** chứ không phải "giới thiệu": Lipid (28) · Glucose & saccharose (29) · Tinh bột & cellulose `(C₆H₁₀O₅)ₙ` (30) · Protein (31) · Polymer (32)                           |
| **Khai thác tài nguyên từ vỏ Trái Đất** `[+]`  | **Chương X, 3 bài — kho kiến thức trước đây THIẾU HOÀN TOÀN**: sơ lược hoá học vỏ Trái Đất · khai thác đá vôi, công nghiệp silicate · nhiên liệu hoá thạch, **chu trình carbon và sự ấm lên toàn cầu** |

> 🟡 `[−]` **Ăn mòn kim loại** — kho kiến thức cũ có, nhưng mục lục KHTN 9 KNTT **không có bài
> riêng** về ăn mòn. Có thể nằm lồng trong Bài 18/20. **Cần giáo viên xác nhận**, chưa xoá.

---

## 3. THPT (lớp 10-12) — Hoá học là môn riêng

### Lớp 10 — Cấu tạo nguyên tử, liên kết, phản ứng oxi hoá – khử

| Chủ đề               | Kiến thức cốt lõi                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Cấu tạo nguyên tử    | Lớp, phân lớp, **cấu hình electron** · orbital · nguyên tố s, p, d, f · đồng vị, **nguyên tử khối trung bình `M̄ = Σ(Aᵢxᵢ)/100`**      |
| Bảng tuần hoàn       | **Định luật tuần hoàn** · biến đổi tuần hoàn bán kính nguyên tử, độ âm điện, tính kim loại/phi kim · hoá trị cao nhất với O           |
| Liên kết hoá học     | **Liên kết ion** · **liên kết cộng hoá trị** (có cực / không cực) · quy tắc octet · liên kết hydrogen, tương tác van der Waals        |
| Phản ứng oxi hoá–khử | **Số oxi hoá** · chất khử / chất oxi hoá · **cân bằng PTHH bằng phương pháp thăng bằng electron**                                     |
| Năng lượng hoá học   | **Enthalpy `ΔᵣH°₂₉₈`** · phản ứng toả nhiệt (`ΔH < 0`) / thu nhiệt (`ΔH > 0`) · tính `ΔᵣH` theo nhiệt tạo thành / năng lượng liên kết |
| Tốc độ phản ứng      | **`v = k·C_A^a · C_B^b`** · hệ số nhiệt độ Van't Hoff `γ`                                                                             |
| Nhóm halogen         | Tính chất F, Cl, Br, I · hydrogen halide, hydrohalic acid                                                                             |

### Lớp 11 — Cân bằng, nitrogen–sulfur, đại cương hữu cơ

| Chủ đề                             | Kiến thức cốt lõi                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cân bằng hoá học**               | **`K_C = [C]^c[D]^d / ([A]^a[B]^b)`** · **nguyên lí chuyển dịch cân bằng Le Chatelier**                                                                 |
| Điện li                            | Acid–base theo **Brønsted–Lowry** · **`pH = −log[H⁺]`**, `[H⁺][OH⁻] = 10⁻¹⁴` (25 °C) · chuẩn độ acid–base                                               |
| Nitrogen – Sulfur                  | `N₂`, `NH₃`, muối ammonium · `HNO₃` · `SO₂`, `H₂SO₄` · mưa acid                                                                                         |
| Đại cương hữu cơ                   | Công thức phân tử / **công thức đơn giản nhất** · **đồng phân, đồng đẳng** · phương pháp tách và tinh chế · phổ khối lượng, phổ hồng ngoại (giới thiệu) |
| Hydrocarbon                        | **Alkane `CₙH₂ₙ₊₂`** · **Alkene `CₙH₂ₙ`** · **Alkyne `CₙH₂ₙ₋₂`** · **Arene** (benzene và đồng đẳng) · phản ứng thế, cộng, tách, trùng hợp               |
| Dẫn xuất halogen, alcohol, phenol  | `R–X` · **Alcohol `CₙH₂ₙ₊₁OH`** · phenol · phản ứng thế, tách nước, oxi hoá                                                                             |
| Hợp chất carbonyl, carboxylic acid | Aldehyde, ketone · **carboxylic acid `R–COOH`** · phản ứng tráng bạc, ester hoá                                                                         |

### Lớp 12 — Ester–lipid, carbohydrate, polymer, kim loại

| Chủ đề                            | Kiến thức cốt lõi                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ester – Lipid                     | **`RCOOR′`** · phản ứng thuỷ phân, **xà phòng hoá** · chất béo, chỉ số xà phòng hoá                                                                |
| Carbohydrate                      | **Glucose/Fructose `C₆H₁₂O₆`** · **Saccharose `C₁₂H₂₂O₁₁`** · **Tinh bột, cellulose `(C₆H₁₀O₅)ₙ`** · phản ứng tráng bạc, thuỷ phân                 |
| Hợp chất chứa nitrogen            | Amine · **amino acid** (lưỡng tính) · **peptide, protein**, phản ứng màu biuret                                                                    |
| Polymer                           | Phản ứng **trùng hợp** / **trùng ngưng** · chất dẻo, tơ, cao su, keo dán                                                                           |
| Pin điện & điện phân              | **Thế điện cực chuẩn `E°`** · **suất điện động pin `E°_pin = E°_катot − E°_anot`** · **định luật Faraday `m = (A·I·t)/(n·F)`** (`F = 96500 C/mol`) |
| Đại cương kim loại                | Tính chất chung · **dãy điện hoá** · ăn mòn và chống ăn mòn · điều chế kim loại (nhiệt luyện, thuỷ luyện, điện phân)                               |
| Nguyên tố nhóm IA, IIA, phức chất | Kim loại kiềm, kiềm thổ · nước cứng · **sơ lược phức chất** và liên kết trong phức chất                                                            |

---

## 4. Hệ quả kỹ thuật — Hoá KHÓ chấm tự động hơn Toán và Lý

Đây là phần quan trọng nhất về mặt kỹ thuật, cần đọc kỹ trước khi cam kết phạm vi GĐ3.

| Dạng bài                          | Chấm tự động được?                      | Cách làm                                                            |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Tính theo PTHH (ra số + đơn vị)   | ✅ Được, giống Lý                       | So khớp số + quy đổi đơn vị + dung sai (như `kho-kien-thuc-ly` §4)  |
| Nồng độ, pH, hiệu suất, mol       | ✅ Được                                 | Như trên                                                            |
| **Cân bằng phương trình hoá học** | ✅ Được, nhưng **cần thuật toán riêng** | Xem §4.1 — không so khớp chuỗi được                                 |
| Viết công thức cấu tạo, đồng phân | 🟡 Khó                                  | Cần chuẩn hoá SMILES hoặc giới hạn ở trắc nghiệm chọn đáp án        |
| Chuỗi phản ứng, nhận biết chất    | ❌ Rất khó                              | **Loại khỏi phạm vi MVP** hoặc chuyển thành trắc nghiệm             |
| Giải thích hiện tượng             | ❌ Không (tự luận)                      | **Loại** — nếu làm buộc phải để AI chấm, vi phạm nguyên tắc đã chốt |

### 4.1 Cân bằng phương trình hoá học — thuật toán, KHÔNG dùng AI

Học sinh nhập hệ số, app phải kiểm **đúng về mặt bảo toàn nguyên tố**, không phải so khớp với một
đáp án cố định (vì bội số của một bộ hệ số đúng cũng đúng về mặt toán học, dù thường yêu cầu bộ
số nguyên tối giản).

Cách kiểm đúng, chạy hoàn toàn bằng thuật toán:

1. Phân tích mỗi chất thành vector số nguyên tử theo từng nguyên tố (`H₂SO₄` → `{H:2, S:1, O:4}`).
2. Nhân với hệ số học sinh nhập, cộng theo vế.
3. **Đúng ⟺ vector hai vế bằng nhau** ở mọi nguyên tố (và với phản ứng ion: **bảo toàn điện tích**).
4. Thêm kiểm **tối giản**: chia hệ số cho ƯCLN, yêu cầu ƯCLN = 1.

> Đây là điểm sáng: cân bằng PTHH **chấm chính xác tuyệt đối bằng thuật toán**, không cần AI, và
> lại là dạng bài học sinh luyện nhiều nhất. Rất hợp làm tính năng "đinh" của môn Hoá.

### 4.2 Dữ liệu nền cần có trước

- **Bảng tuần hoàn** dạng dữ liệu (Z, kí hiệu, tên, nguyên tử khối, nhóm, chu kì) — dữ liệu khoa
  học công khai, tự lập được, không vướng bản quyền.
- **Bảng tính tan**, **dãy hoạt động hoá học**, **dãy điện hoá** — cũng là dữ liệu khoa học.
- Parser công thức hoá học (`Fe₂(SO₄)₃` → vector nguyên tố) — cần viết, có xử lý ngoặc lồng nhau
  và chỉ số. Đây là việc gọn, dễ test ca biên, hợp giao subagent.

---

## 5. Việc tiếp theo

1. ~~Chốt PA A/B/C mô hình `subject`~~ **✅ ĐÃ CHỐT: PA C** (2026-08-01), chung cho Lý/Hoá/Sinh.
2. ~~Người có chuyên môn (giáo viên Hoá) duyệt §2, đối chiếu SGK — đặc biệt lưu ý `n = V/24`~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** với SGK KHTN 6-9 KNTT — xem §6. Điểm `n = V/24`
   **đã xác minh và ĐÃ SỬA thành `n = V/24,79`**. **§3 (THPT 10-12) vẫn CHƯA đối chiếu** — chưa
   có SGK Hoá 10-12 trong `tai-lieu-sgk/`. Vẫn cần giáo viên Hoá duyệt lần cuối (§6.3).
3. Chốt phạm vi chấm tự động theo bảng §4 — **loại sớm** các dạng phải chấm tự luận, đừng để tới
   lúc code mới phát hiện không chấm được.
4. Lập dữ liệu nền §4.2 (bảng tuần hoàn, bảng tính tan) — việc cơ học, giao subagent được.
5. **Phần cân bằng PTHH (§4.1) ĐÃ CÓ CODE CHẠY** — `packages/core-grading/chemistry.ts`, kiểm bảo
   toàn nguyên tố + điện tích + tối giản, có test. Không phải chờ tới GĐ3 mới viết.

> ### ✅ ĐÃ CHỐT 2026-08-01 (người dùng duyệt): thứ tự GĐ3 là **HOÁ → LÝ → SINH**.
>
> **Làm HOÁ trước, LÝ sau.** Ngược với tên gọi quen thuộc "Lý–Hoá", nhưng có
> lý do kỹ thuật: cân bằng PTHH (§4.1) là tính năng chấm-tuyệt-đối-chính-xác, độc đáo, dễ tạo giá
> trị thấy được ngay; còn Lý phụ thuộc nặng vào engine đơn vị/dung sai (§4 file Lý) nên nên làm
> sau khi engine đó đã chín qua Toán + Hoá. **Cần người dùng xác nhận.**

---

## 6. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức" (4 thư mục ảnh trong
`tai-lieu-sgk/SGK-KHTN/6..9/`, trích mục lục bằng OCR tiếng Việt `scripts/ocr-images.py`, ảnh 2
cột đọc thêm bằng `scripts/ocr-crop.py`). Mục lục đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Chưa đối chiếu:** §1 (tiểu học 4-5), §3 (THPT 10-12) — chưa có sách trong `tai-lieu-sgk/`.

### 6.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                                                                                                        | Đã làm gì                                                                                                            |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 6   | `[+]`   | Hỗn hợp: chất tinh khiết/hỗn hợp, dung dịch – huyền phù – nhũ tương (Bài 16)                                                                                                    | Bổ sung vào §2 lớp 6 — SGK có hẳn chương IV                                                                          |
| 7   | `[+]`   | **Phân tử – Đơn chất – Hợp chất**; khối lượng phân tử (Bài 5)                                                                                                                   | Bổ sung — kho cũ **thiếu hoàn toàn chương II**                                                                       |
| 7   | `[+]`   | **Giới thiệu về liên kết hoá học** (Bài 6)                                                                                                                                      | Bổ sung                                                                                                              |
| 7   | `[+]`   | **Hoá trị và công thức hoá học**: `x·a = y·b`, `%X = (x·M_X/M)·100%` (Bài 7)                                                                                                    | Bổ sung — đây là **phần tính toán hoá học đầu tiên** của chương trình, chấm tự động được                             |
| 8   | `[≠]`   | **`n = V/24` → `n = V(L)/24,79 (L/mol)`**, đkc **1 bar, 25 °C**                                                                                                                 | **SỬA.** Xác minh trực tiếp trên khung Mục tiêu Bài 3 (`SGK-KHTN/8/page_0017.png`). Xem §6.2 — ảnh hưởng engine chấm |
| 8   | `[≠]`   | Thứ tự dạy: Dung dịch & nồng độ (Bài 4) đứng **trước** ĐLBT khối lượng (Bài 5) và tính theo PTHH (Bài 6)                                                                        | Ghi rõ thứ tự vào §2 để dựng `prerequisites` đúng                                                                    |
| 8   | `[+]`   | **Phân bón hoá học** (Bài 12)                                                                                                                                                   | Bổ sung vào §2 lớp 8                                                                                                 |
| 8   | `[≠]`   | Acid/base/oxide/muối gộp 1 dòng → SGK tách **5 bài riêng** (Bài 8-12)                                                                                                           | Ghi rõ phải tách theo bài khi soạn nội dung                                                                          |
| 9   | `[−]`   | **Acetylene `C₂H₂`**                                                                                                                                                            | **BỎ** — KHTN 9 KNTT chỉ dạy alkane (Bài 23) và alkene (Bài 24)                                                      |
| 9   | `[−]`   | "Sơ lược bảng tuần hoàn nâng cao" ở phần phi kim                                                                                                                                | **BỎ** — không có trong mục lục lớp 9                                                                                |
| 9   | `[≠]`   | "Phi kim: tính chất chung, một số phi kim tiêu biểu"                                                                                                                            | Sửa — SGK chỉ có **Bài 21 "Sự khác nhau cơ bản giữa phi kim và kim loại"**, không có chương phi kim riêng            |
| 9   | `[≠]`   | "Ethanol" → **"Ethylic alcohol"**                                                                                                                                               | Sửa thuật ngữ theo SGK (tên chương VIII)                                                                             |
| 9   | `[≠]`   | Lipid/carbohydrate/protein/polymer "(giới thiệu)" → **hẳn chương IX, 5 bài**                                                                                                    | Nâng mức — đây là phần nội dung lớn, không phải phần giới thiệu                                                      |
| 9   | `[+]`   | **Chương X "Khai thác tài nguyên từ vỏ Trái Đất"** (3 bài): hoá học vỏ Trái Đất, đá vôi & công nghiệp silicate, nhiên liệu hoá thạch, **chu trình carbon & sự ấm lên toàn cầu** | Bổ sung — kho cũ **thiếu hoàn toàn**. Cũng là phần liên quan nội dung mới về phát triển bền vững                     |
| 9   | `[−]`   | **Ăn mòn kim loại** — 🟡 giữ tạm, cần giáo viên xác nhận                                                                                                                        | Không xoá; mục lục không có bài riêng, có thể lồng trong Bài 18/20                                                   |

**Tổng cộng: 15 mục** — `[+]` 5 · `[≠]` 7 · `[−]` 3 · phần còn lại `[✓]` giữ nguyên.

### 6.2 ⚠️ Kết luận điểm nghi ngờ số 1: `n = V/24` hay `n = V/22,4`?

**CẢ HAI ĐỀU SAI. SGK dùng `n = V(L) / 24,79 (L/mol)`.**

Bằng chứng (xác minh trên **nội dung bài học**, không chỉ mục lục): khung "Mục tiêu" của Bài 3
"Mol và tỉ khối chất khí", SGK KHTN 8 KNTT, trang in 16 — ảnh
`tai-lieu-sgk/SGK-KHTN/8/page_0017.png`:

- "Nêu được khái niệm thể tích mol của chất khí ở **áp suất 1 bar và 25 °C**."
- "Sử dụng được công thức **n (mol) = V(L) / 24,79 (L/mol)** để chuyển đổi giữa số mol và thể
  tích chất khí ở điều kiện chuẩn: áp suất 1 bar ở 25 °C."

**Hệ quả kỹ thuật — cần xử lý TRƯỚC khi mở GĐ3 môn Hoá** (ghi thành mục riêng, không sửa code
trong PR tài liệu này):

- Dùng 24 thay vì 24,79 gây sai lệch **≈ 3,3%**, **vượt ngưỡng dung sai 3%** hiện có của
  `packages/core-grading` ⇒ mọi bài chuyển đổi mol ↔ thể tích khí sẽ bị chấm sai nếu để nguyên.
- Đề nghị: đưa **24,79 L/mol thành hằng số có tên** trong dữ liệu môn Hoá (không để "số ma
  thuật"), và cân nhắc dung sai riêng cho dạng bài này.

### 6.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Hoá) duyệt lần cuối

1. **Ăn mòn kim loại có được dạy ở KHTN 9 KNTT không?** Mục lục không có bài riêng — cần xác nhận
   để quyết định giữ hay bỏ khỏi §2 lớp 9.
2. **Mức độ định lượng của Bài 6 "Tính theo phương trình hoá học"** — hiệu suất `H` có được dạy ở
   lớp 8 hay chỉ ở THPT? Chưa xác minh trên nội dung bài.
3. **§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu** — chưa có SGK Hoá 10-12 trong `tai-lieu-sgk/`.
   Toàn bộ §3 vẫn là **bản thảo theo hiểu biết chung**, chưa được kiểm chứng.
4. **Ảnh hưởng của Thông tư 17/2025** lên nội dung KHTN — không có bản đối chứng để so. **Không
   đoán.** Riêng chương X lớp 9 (chu trình carbon, ấm lên toàn cầu) có thể là phần được tăng
   thời lượng, nhưng chưa xác nhận được.

---

## [3] Tài liệu: kho-kien-thuc-ly-gdpt2018.md

_(Chi tiết nguồn gốc: `kho-kien-thuc-ly-gdpt2018.md`)_

# Kho kiến thức môn VẬT LÍ — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3** (Lý + Hoá) trong `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §4
> Cùng cấu trúc với `kho-kien-thuc-toan-gdpt2018.md` — đọc §0 của file đó trước (nguồn gốc, ranh
> giới bản quyền, cổng duyệt chuyên môn đều áp dụng y hệt, không lặp lại ở đây).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. ⚠️ PHÁT HIỆN CẤU TRÚC — ảnh hưởng trực tiếp tới KIẾN TRÚC app, phải xử lý trước khi code

Đây là điểm quan trọng nhất của file này, quan trọng hơn cả danh sách công thức bên dưới.

**Trong GDPT 2018, "Vật lí" KHÔNG tồn tại như một môn riêng ở mọi cấp:**

| Cấp              | Vật lí nằm ở đâu                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Tiểu học lớp 1-3 | Trong môn **Tự nhiên và Xã hội** (chung cả tự nhiên lẫn xã hội) — không có công thức                           |
| Tiểu học lớp 4-5 | Trong môn **Khoa học** (chung Lý + Hoá + Sinh) — mô tả hiện tượng, chưa có công thức ký hiệu                   |
| THCS lớp 6-9     | **Trong môn KHOA HỌC TỰ NHIÊN (KHTN)** — một môn tích hợp gồm 3 phân môn Lý + Hoá + Sinh, **KHÔNG tách riêng** |
| THPT lớp 10-12   | **Vật lí là môn riêng**, thuộc nhóm môn **lựa chọn** (học sinh có thể không chọn học)                          |

### 0.1 Hệ quả kỹ thuật — mô hình `subject` hiện tại KHÔNG đủ

Kiến trúc hiện tại (ADR-0001, migration `0029`) giả định `subject` là chuỗi phẳng
(`'english'`, `'math'`). Giả định đó **đúng với Toán** (Toán là môn riêng xuyên suốt lớp 1-12)
nhưng **sai với Lý/Hoá/Sinh**:

- Học sinh lớp 8 học "KHTN", không học "Vật lí". Nếu app hiện môn "Vật lí" cho lớp 8 thì **lệch
  với thực tế trên lớp** — mất đúng lợi thế "khớp bài đang học" mà SGK thống nhất 2026 mang lại.
- Học sinh lớp 11 thì lại học "Vật lí" đúng nghĩa môn riêng.
- Cùng một mảng kiến thức, **tên môn đổi theo cấp**.

**Ba phương án, cần chốt TRƯỚC khi code GĐ3** (không tự quyết, thuộc diện "đụng kiến trúc" phải
hỏi theo CLAUDE.md mục 12):

| PA  | Cách làm                                                                                       | Ưu                                                       | Nhược                                                                       |
| --- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| A   | `subject = 'khtn'` cho lớp 6-9, `subject = 'physics'` cho 10-12 (2 môn riêng trong hệ thống)   | Khớp đúng thực tế trường học                             | Tiến độ/SRS bị đứt đoạn khi lên lớp 10; người dùng thấy như 2 môn khác nhau |
| B   | `subject = 'physics'` xuyên suốt, chỉ đổi **nhãn hiển thị** theo lớp                           | Dữ liệu liền mạch, SRS/tiến độ nối từ lớp 6 lên 12       | Lớp 6-9 hiện "Vật lí" trong khi trên lớp gọi "KHTN" — dễ gây bối rối        |
| C   | `subject = 'khtn'` là môn CHA, `physics/chemistry/biology` là phân môn con (thêm cột `branch`) | Đúng nhất về mặt mô hình hoá; hiện đúng tên ở cả hai cấp | Tốn thêm 1 migration + sửa mọi truy vấn đếm lượt đang có                    |

> ### ✅ ĐÃ CHỐT 2026-08-01: **PA C** (người dùng duyệt)
>
> Môn cha `khtn` + cột `branch` (`physics`/`chemistry`/`biology`). Thi hành **khi thật sự bắt đầu
> GĐ3**, không migration sớm: PA A/B đều tạo nợ kỹ thuật phải trả đúng lúc đông người dùng nhất,
> còn PA C chỉ đắt thêm một lần ngay lúc dữ liệu Lý/Hoá còn trống — rẻ nhất để đổi.
> Áp dụng chung cho cả Lý, Hoá, Sinh.

---

## 1. TIỂU HỌC (lớp 1-5) — chưa có công thức

Chỉ mô tả hiện tượng, **không có công thức ký hiệu nào** → nếu làm, đây là dạng "khám phá/quan
sát", chấm bằng trắc nghiệm chọn đáp án, không cần KaTeX, không cần thuật toán chuẩn hoá biểu thức.

| Lớp | Nội dung liên quan Vật lí                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1-3 | (Tự nhiên và Xã hội) Bầu trời ngày/đêm · thời tiết · vật liệu quanh ta · an toàn điện                                        |
| 4   | (Khoa học) **Ánh sáng** (nguồn sáng, bóng tối) · **Âm thanh** · **Nhiệt** (nóng, lạnh, dẫn nhiệt)                            |
| 5   | (Khoa học) **Năng lượng** (mặt trời, gió, nước, chất đốt) · **Điện** (mạch điện đơn giản, vật dẫn/cách điện) · biến đổi chất |

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> Nhắc lại §0: học sinh gọi đây là **KHTN**, không gọi "Vật lí".
>
> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §6** cuối file.

### Lớp 6 — Lực, năng lượng, Trái Đất và bầu trời (chương VIII-X, 16 bài)

| Nội dung                       | Công thức / kiến thức cốt lõi                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Đo lường `[≠]`                 | Đo chiều dài, khối lượng, thời gian, nhiệt độ — SGK xếp ở **chương I (kĩ năng KHTN dùng chung)**, không thuộc riêng phân môn Lý          |
| Lực `[✓]`                      | Lực tiếp xúc / không tiếp xúc · biểu diễn lực bằng mũi tên · biến dạng, biến đổi chuyển động                                             |
| **Biến dạng của lò xo** `[+]`  | Độ dãn `Δl = l − l₀`, tỉ lệ với lực (định tính) — Bài 42                                                                                 |
| Trọng lực `[✓]`                | **`P ≈ 10·m`** (P: N; m: kg) — xác minh trên nội dung Bài 43, xem §6.2                                                                   |
| Lực ma sát `[≠]`               | Ma sát trượt, ma sát nghỉ. `[−]` **Bỏ "ma sát lăn"** — mục tiêu Bài 44 chỉ nêu ma sát trượt và ma sát nghỉ                               |
| **Lực cản của nước** `[+]`     | Lực cản của chất lưu (định tính) — Bài 45                                                                                                |
| Năng lượng `[✓]`               | Các dạng năng lượng · **định luật bảo toàn năng lượng** (định tính) · năng lượng hao phí, năng lượng tái tạo, tiết kiệm năng lượng       |
| **Trái Đất và bầu trời** `[+]` | **Chương X, 4 bài — kho cũ THIẾU HOÀN TOÀN**: chuyển động nhìn thấy của Mặt Trời & thiên thể · các pha Mặt Trăng · Hệ Mặt Trời · Ngân Hà |

### Lớp 7 — Tốc độ, âm, ánh sáng, từ (chương III-VI, 13 bài)

| Nội dung                      | Công thức / kiến thức cốt lõi                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tốc độ `[✓]`                  | **`v = s / t`** · **đo tốc độ** (Bài 9) · đồ thị quãng đường – thời gian · an toàn giao thông (khoảng cách dừng xe)                                                 |
| Âm thanh `[✓]`                | Nguồn âm, dao động · **biên độ** ↔ độ to; **tần số** ↔ độ cao (`f` đo bằng Hz) · phản xạ âm, tiếng vang, chống ô nhiễm tiếng ồn                                     |
| **Năng lượng ánh sáng** `[+]` | Tia sáng, chùm sáng · bóng tối / bóng nửa tối — Bài 15                                                                                                              |
| Ánh sáng `[✓]`                | **Định luật phản xạ ánh sáng**: tia phản xạ nằm trong mặt phẳng tới, **góc phản xạ = góc tới** (`i' = i`) · ảnh qua gương phẳng (ảnh ảo, đối xứng, cùng kích thước) |
| Từ `[✓]`                      | Nam châm, từ trường, từ phổ · **la bàn**, từ trường Trái Đất (trong Bài 19) · **nam châm điện**                                                                     |

### Lớp 8 — Khối lượng riêng, áp suất, moment, điện, nhiệt (chương III-VI, 17 bài)

| Nội dung                  | Công thức / kiến thức cốt lõi                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khối lượng riêng `[✓]`    | **`D = m / V`** (kg/m³) · thực hành xác định khối lượng riêng (Bài 14)                                                                                                                    |
| Áp suất `[✓]`             | **`p = F / S`** (Pa = N/m²) · áp suất chất lỏng theo độ sâu · áp suất khí quyển                                                                                                           |
| Lực đẩy Archimedes `[≠]`  | 🟡 Mục tiêu Bài 17 chỉ nêu **điều kiện ĐỊNH TÍNH** vật nổi/chìm + định luật Archimedes; **không thấy công thức `F_A = d·V`** trong khung mục tiêu ⇒ hạ mức, cần giáo viên xác nhận (§6.3) |
| Đòn bẩy, moment `[✓]`     | 🟡 Moment lực (Bài 18) · điều kiện cân bằng đòn bẩy (Bài 19) — chưa xác minh SGK có cho công thức `M = F·d` hay chỉ định tính                                                             |
| ~~Công, công suất~~ `[−]` | **BỎ KHỎI LỚP 8** — KHTN 8 KNTT **không có bài nào về công/công suất**; nội dung này ở **lớp 9, Bài 4**                                                                                   |
| Điện `[✓]`                | Hiện tượng nhiễm điện do cọ xát · dòng điện, nguồn điện · **mạch điện đơn giản** (Bài 22) · tác dụng của dòng điện · **`I`** (A), **`U`** (V), đo bằng ampe kế/vôn kế                     |
| Nhiệt `[≠]`               | `[+]` **Năng lượng nhiệt và nội năng** (Bài 26 — kho cũ thiếu khái niệm **nội năng**) · truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt · sự nở vì nhiệt                                   |

### Lớp 9 — Năng lượng cơ học, ánh sáng, điện, điện từ (chương I-V, 16 bài)

| Nội dung                       | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Năng lượng cơ học** `[+]`    | **Chương I, 3 bài — kho cũ THIẾU HOÀN TOÀN ở lớp 9**: **động năng `W_đ = ½mv²`**, **thế năng `W_t = P·h`** (Bài 2) · **cơ năng `W = W_đ + W_t`** (Bài 3) · **công `A = F·s`, công suất `P = A/t`** (Bài 4 — chuyển từ lớp 8 sang)                                                                          |
| Ánh sáng `[≠]`                 | **Khúc xạ ánh sáng** (Bài 5) · `[+]` **phản xạ toàn phần** (Bài 6) · `[+]` **lăng kính, tán sắc** (Bài 7) · thấu kính hội tụ/phân kì, tiêu cự (Bài 8) · `[+]` **kính lúp** (Bài 10). 🟡 Công thức thấu kính `1/f = 1/d + 1/d'` **chưa xác minh**. `[−]` **Bỏ "máy ảnh, mắt"** — không có trong KHTN 9 KNTT |
| **Định luật Ohm** `[✓]`        | **`I = U / R`** · điện trở dây dẫn **`R = ρ·l / S`**                                                                                                                                                                                                                                                       |
| Đoạn mạch `[✓]`                | **Nối tiếp:** `I = I₁ = I₂`, `U = U₁ + U₂`, `R = R₁ + R₂` · **Song song:** `U = U₁ = U₂`, `I = I₁ + I₂`, `1/R = 1/R₁ + 1/R₂`                                                                                                                                                                               |
| Công, công suất điện `[≠]`     | **`P = U·I`** · **`A = P·t = U·I·t`** · điện năng tiêu thụ (kWh) — Bài 13. 🟡 `P = I²R = U²/R` và **định luật Joule–Lenz `Q = I²Rt`** chưa xác minh có dạy ở KNTT lớp 9 không                                                                                                                              |
| Điện từ `[≠]`                  | **Hiện tượng cảm ứng điện từ**, nguyên tắc tạo dòng điện xoay chiều (Bài 14) · tác dụng của dòng điện xoay chiều (Bài 15). `[−]` **Bỏ lực điện từ, quy tắc bàn tay trái, máy phát điện & máy biến áp thành bài riêng** — không có trong mục lục                                                            |
| Năng lượng với cuộc sống `[≠]` | **Vòng năng lượng trên Trái Đất, năng lượng hoá thạch** (Bài 16) · **năng lượng tái tạo** (Bài 17). 🟡 Hiệu suất `H = A_ích/A_toàn phần` không có bài riêng — chưa xác minh                                                                                                                                |

---

## 3. THPT (lớp 10-12) — Vật lí là môn riêng (nhóm môn lựa chọn)

> **✅ ĐÃ ĐỐI CHIẾU SGK 2026-08-01** — bộ "Kết nối tri thức", `tai-lieu-sgk/SGK-Ly/10..12/`.
> Mục lục đầy đủ: `docs/research/muc-luc-sgk/ly-10.md` · `ly-11.md` · `ly-12.md`.
> Ký hiệu trong bảng: `[✓]` khớp SGK · `[≠]` khác lớp/khác mức · `[+]` bổ sung theo SGK ·
> `[−]` bỏ vì SGK không dạy. Nhật ký đầy đủ ở §6.4.

**Cấu trúc chương thật của 3 cuốn (căn cứ mục lục):**

| Lớp | Số chương | Số bài | Các chương                                                                                                                                                                |
| --- | --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | 7         | 34     | I. Mở đầu · II. Động học · III. Động lực học · IV. Năng lượng, công, công suất · V. Động lượng · VI. Chuyển động tròn đều · VII. Biến dạng của vật rắn. Áp suất chất lỏng |
| 11  | 4         | 26     | I. Dao động · II. Sóng · III. Điện trường · IV. Dòng điện. Mạch điện                                                                                                      |
| 12  | 4         | 25     | I. Vật lí nhiệt · II. Khí lí tưởng · III. Từ trường · IV. Vật lí hạt nhân                                                                                                 |

### Lớp 10 — Cơ học (7 chương · 34 bài)

| Chương SGK                                | Chủ đề                               | Công thức cốt lõi                                                                             | Đối chiếu                                                  |
| ----------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| I. Mở đầu                                 | Phương pháp & sai số                 | sai số tuyệt đối/tương đối, cách ghi kết quả đo (Bài 3)                                       | `[+]` kho cũ thiếu hoàn toàn                               |
| II. Động học                              | Chuyển động thẳng                    | **`v = v₀ + at`** · **`d = v₀t + ½at²`** · **`v² − v₀² = 2ad`** · rơi tự do · chuyển động ném | `[✓]`                                                      |
| II                                        | Độ dịch chuyển vs quãng đường        | phân biệt **`d`** (vector) và **`s`** (vô hướng); đồ thị `d–t`                                | `[+]` kho cũ gộp làm một                                   |
| III. Động lực học                         | Ba định luật Newton                  | **I** (quán tính) · **II `F⃗ = m·a⃗`** · **III `F⃗₁₂ = −F⃗₂₁`**                               | `[✓]`                                                      |
| III                                       | Các lực                              | `P = mg` · **`F_ms = μN`** · lực căng dây · lực cản, lực nâng                                 | `[+]` bổ sung lực căng, lực cản/lực nâng (Bài 17, 19)      |
| III                                       | Moment lực                           | **`M = F·d`** · cân bằng của vật rắn (Bài 21)                                                 | `[+]` kho cũ thiếu — mức định lượng cần giáo viên xác nhận |
| IV. Năng lượng, công, công suất           | Công & công suất                     | **`A = F·s·cos α`** · **`P = A/t = F·v`**                                                     | `[✓]` (xem §6.4 về phân tầng với lớp 9)                    |
| IV                                        | Cơ năng                              | **`W_đ = ½mv²`** · **`W_t = mgh`** · **`W = W_đ + W_t`**, bảo toàn khi chỉ có lực thế         | `[✓]`                                                      |
| IV                                        | Hiệu suất                            | **`H = A_ích/A_toàn phần · 100%`** (Bài 27 — bài riêng)                                       | `[+]` kho cũ không có ở lớp 10                             |
| V. Động lượng                             | Động lượng                           | **`p⃗ = m·v⃗`** · **ĐLBT động lượng** · xung lượng `Δp⃗ = F⃗·Δt` · va chạm                    | `[✓]`                                                      |
| VI. Chuyển động tròn đều                  | Chuyển động tròn                     | **`ω = 2π/T = 2πf`** · **`v = ωr`** · **`a_ht = v²/r = ω²r`** · **`F_ht = mv²/r = mω²r`**     | `[✓]`                                                      |
| VII. Biến dạng vật rắn. Áp suất chất lỏng | Biến dạng                            | **định luật Hooke `F = k·                                                                     | Δl                                                         | `** (Bài 33) | `[≠]` kho cũ xếp chung mục "Các lực"; SGK để thành **chương riêng cuối sách** |
| VII                                       | Khối lượng riêng & áp suất chất lỏng | **`ρ = m/V`** · **`p = ρgh`** (Bài 34)                                                        | `[+]` kho cũ thiếu ở lớp 10 (chỉ có ở KHTN 8)              |

**Không có ở Vật lí 10 (khác chương trình cũ):** nhiệt học, chất khí, thuyết động học phân tử —
đã chuyển xuống **lớp 12**.

### Lớp 11 — Dao động, sóng, điện trường, dòng điện (4 chương · 26 bài)

| Chương SGK               | Chủ đề                                                    | Công thức cốt lõi                                               | Đối chiếu                                                                       |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| I. Dao động              | Dao động điều hoà                                         | **`x = A·cos(ωt + φ)`** · `v = −ωA·sin(ωt+φ)` · **`a = −ω²x`**  | `[✓]`                                                                           |
| I                        | Năng lượng dao động                                       | `W_đ`, `W_t`, cơ năng dao động bảo toàn (Bài 5, 7)              | `[+]` kho cũ thiếu                                                              |
| I                        | Con lắc lò xo `T = 2π√(m/k)` · con lắc đơn `T = 2π√(l/g)` | —                                                               | `[≠]` 🟡 **không có bài riêng trong mục lục** — giữ tạm, cần giáo viên xác nhận |
| I                        | Tắt dần, cưỡng bức, cộng hưởng                            | (định tính)                                                     | `[✓]`                                                                           |
| II. Sóng                 | Sóng cơ                                                   | **`v = λf = λ/T`** · sóng ngang/dọc · giao thoa · sóng dừng     | `[✓]`                                                                           |
| II                       | Sóng điện từ                                              | thang sóng điện từ · `c = 3·10⁸ m/s`                            | `[✓]`                                                                           |
| II                       | Sóng âm                                                   | đo tần số sóng âm, đo tốc độ truyền âm (Bài 10, 15 — thực hành) | `[+]`                                                                           |
| III. Điện trường         | Định luật Coulomb                                         | **`F = k·                                                       | q₁q₂                                                                            | /(εr²)`**, `k = 9·10⁹ N·m²/C²` | `[✓]` |
| III                      | Cường độ điện trường                                      | **`E = F/q`** · **điện trường đều `E = U/d`**                   | `[+]` bổ sung điện trường đều (Bài 18)                                          |
| III                      | Thế năng điện, điện thế                                   | thế năng điện (Bài 19) · **`V = A/q`**, `U = A/q`               | `[+]` bổ sung thế năng điện                                                     |
| III                      | Tụ điện                                                   | **`C = Q/U`** · năng lượng tụ điện                              | `[✓]`                                                                           |
| IV. Dòng điện. Mạch điện | Dòng điện & điện trở                                      | **`I = q/t`** · **`R = U/I`** (định luật Ohm) · điện trở suất   | `[✓]`                                                                           |
| IV                       | Nguồn điện                                                | **`ξ`**, **`r`** · **Ohm toàn mạch `I = ξ/(R + r)`**            | `[✓]`                                                                           |
| IV                       | Ghép nguồn (nối tiếp/song song)                           | —                                                               | `[−]` **không thấy trong mục lục** — bỏ, hoặc chờ giáo viên xác nhận            |
| IV                       | Năng lượng & công suất điện                               | **`A = UIt`** · **`P = UI`**                                    | `[✓]`                                                                           |

**Không có ở Vật lí 11 (khác chương trình cũ):** quang hình (khúc xạ, thấu kính, mắt — đã ở
**KHTN 9**), từ trường & cảm ứng điện từ (đã lên **lớp 12**), dòng điện trong các môi trường,
dòng điện xoay chiều & mạch RLC.

### Lớp 12 — Nhiệt, khí, từ, hạt nhân (4 chương · 25 bài)

| Chương SGK          | Chủ đề                                                                                       | Công thức cốt lõi                                                           | Đối chiếu                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| I. Vật lí nhiệt     | Cấu trúc chất, sự chuyển thể                                                                 | mô hình động học phân tử, 3 thể (Bài 1)                                     | `[+]` kho cũ thiếu                                         |
| I                   | Nội năng & nguyên lí I                                                                       | **`ΔU = A + Q`**                                                            | `[✓]`                                                      |
| I                   | Thang nhiệt độ                                                                               | **`T(K) = t(°C) + 273,15`** (Bài 3)                                         | `[+]` kho cũ thiếu                                         |
| I                   | Nhiệt lượng                                                                                  | **`Q = mcΔt`** · **`Q = λm`** (nóng chảy) · **`Q = Lm`** (hoá hơi)          | `[✓]`                                                      |
| II. Khí lí tưởng    | Ba định luật chất khí                                                                        | **Boyle `pV = const`** · **Charles `V/T = const`** · `p/T = const`          | `[✓]`                                                      |
| II                  | Phương trình trạng thái                                                                      | **`pV/T = const`** · **`pV = nRT`**                                         | `[✓]`                                                      |
| II                  | Mô hình vi mô                                                                                | **`p = ⅓·μ·v̄²`** · **`W̄_đ = (3/2)kT`** (Bài 12)                             | `[+]` kho cũ thiếu — mức định lượng cần giáo viên xác nhận |
| III. Từ trường      | Lực từ                                                                                       | **`F = BIl·sin α`** · cảm ứng từ `B` (T)                                    | `[✓]`                                                      |
| III                 | Lực Lorentz `f =                                                                             | q                                                                           | vB·sin α`                                                  | —   | `[−]` 🟡 **không có bài nào trong mục lục** — nghi thừa theo chương trình cũ, cần giáo viên xác nhận trước khi xoá |
| III                 | Từ thông & cảm ứng điện từ                                                                   | **`Φ = BS·cos α`** · **`e_c = −ΔΦ/Δt`** (Faraday) · Lenz                    | `[✓]`                                                      |
| III                 | Máy phát điện xoay chiều · ứng dụng cảm ứng điện từ · điện từ trường và mô hình sóng điện từ | (Bài 17, 18, 19)                                                            | `[+]` kho cũ thiếu cả 3 bài                                |
| IV. Vật lí hạt nhân | Cấu trúc hạt nhân                                                                            | **`_Z^A X`** · proton, neutron, đồng vị                                     | `[✓]`                                                      |
| IV                  | Năng lượng liên kết                                                                          | **`Δm = Zm_p + (A−Z)m_n − m_hn`** · **`E = Δm·c²`** · phân hạch, nhiệt hạch | `[✓]`                                                      |
| IV                  | Phóng xạ                                                                                     | tia α, β, γ · **`N = N₀·2^(−t/T)`**                                         | `[✓]` (dạng `e^(−λt)` chưa xác minh)                       |
| IV                  | Công nghiệp hạt nhân                                                                         | nhà máy điện hạt nhân, an toàn phóng xạ (Bài 24)                            | `[+]` kho cũ thiếu                                         |

**Không có ở Vật lí 12 (khác chương trình cũ):** dao động & sóng cơ (đã ở **lớp 11**), dòng điện
xoay chiều & mạch RLC, sóng ánh sáng & giao thoa ánh sáng, lượng tử ánh sáng, mẫu nguyên tử Bohr,
thuyết tương đối hẹp.

---

## 4. Hệ quả cho việc chấm tự động (nguyên tắc "không để AI phán đúng/sai" vẫn giữ)

Vật lí **thuận lợi hơn Toán ở một điểm, khó hơn ở một điểm**:

| Thuận lợi                                                               | Khó hơn                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Đa số bài ra **đáp số có đơn vị** → chấm bằng so khớp số + dung sai, dễ | **Phải kiểm ĐƠN VỊ**, không chỉ kiểm số — `10 N` khác `10 kg` dù số giống nhau |
| Ít biểu thức đại số phức tạp hơn Toán                                   | Cần chấp nhận **sai số làm tròn** rộng hơn (vd `g = 9,8` vs `10`)              |

**Yêu cầu bổ sung cho thuật toán chấm ở GĐ3** (ngoài phần đã đặc tả cho Toán ở GĐ2 §3.3):

1. Đáp án Lý là cặp **(giá trị, đơn vị)**, không phải số trần.
2. Phải **quy đổi đơn vị** trước khi so khớp (`1 km = 1000 m`, `1 kWh = 3,6·10⁶ J`) — học sinh
   trả lời đúng nhưng khác đơn vị vẫn phải được tính đúng.
3. **Dung sai cấu hình được theo từng đề** — bài dùng `g = 10` và bài dùng `g = 9,8` ra kết quả
   lệch vài %, không được chấm sai.
4. Ghi rõ trong đề nếu bắt buộc đơn vị cụ thể; nếu không ghi thì phải chấp nhận mọi đơn vị tương đương.

---

## 5. Việc tiếp theo

1. ~~Chốt PA A/B/C ở §0.1~~ **✅ ĐÃ CHỐT: PA C** (2026-08-01). Thi hành khi bắt đầu GĐ3.
2. ~~Người có chuyên môn (giáo viên Lý) duyệt nội dung §2-§3, đối chiếu SGK "Kết nối tri thức".~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §6. **✅ §3 (THPT 10-12) CŨNG ĐÃ ĐỐI CHIẾU
   2026-08-01** (SGK Vật lí 10, 11, 12 KNTT) — xem §6.4. Vẫn cần giáo viên Lý duyệt lần cuối —
   xem §6.3 (cấp 2) và §6.5 (cấp 3). Còn lại **§1 (tiểu học) chưa đối chiếu**.
3. ~~Bổ sung yêu cầu **đơn vị + quy đổi + dung sai** (§4) vào đặc tả thuật toán chấm~~
   **✅ ĐÃ XONG 2026-08-01** — `packages/core-grading/` đã viết và có test đầy đủ, thiết kế ngay
   từ GĐ2 đúng như khuyến nghị. Xem `docs/research/dac-ta-engine-cham-dung-chung.md`.

> Điểm 3 là góp ý quan trọng: nếu GĐ2 làm engine chấm chỉ biết "số trần", tới GĐ3 sẽ phải đập đi
> làm lại. Rẻ hơn nhiều nếu ngay từ đầu thiết kế kiểu đáp án là **(giá trị, đơn vị tuỳ chọn)** —
> Toán để đơn vị rỗng, Lý/Hoá điền vào.

---

## 6. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức"
(`tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng `scripts/ocr-images.py` + `scripts/ocr-crop.py`). Mục lục
đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Phần THPT (§3) được đối chiếu ở đợt sau, cùng ngày** — ghi riêng ở **§6.4** và **§6.5** bên dưới
để phân biệt rõ với phần cấp 2 (§6.1-§6.3).
**Chưa đối chiếu:** §1 (tiểu học) — chưa có sách trong `tai-lieu-sgk/`.

### 6.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                                   | Đã làm gì                                                                                                      |
| --- | ------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 6   | `[≠]`   | Đo lường (chiều dài, khối lượng, thời gian, nhiệt độ)                                                      | Ghi rõ SGK xếp ở **chương I — kĩ năng KHTN dùng chung**, không thuộc riêng phân môn Lý                         |
| 6   | `[+]`   | **Biến dạng của lò xo** (Bài 42)                                                                           | Bổ sung vào §2 lớp 6                                                                                           |
| 6   | `[−]`   | **Ma sát lăn**                                                                                             | **BỎ** — mục tiêu Bài 44 chỉ nêu ma sát trượt và ma sát nghỉ                                                   |
| 6   | `[+]`   | **Lực cản của nước** (Bài 45)                                                                              | Bổ sung                                                                                                        |
| 6   | `[+]`   | **Chương X "Trái Đất và bầu trời"** (4 bài): Mặt Trời & thiên thể, Mặt Trăng, Hệ Mặt Trời, Ngân Hà         | Bổ sung — kho cũ **thiếu hoàn toàn**                                                                           |
| 7   | `[+]`   | **Đo tốc độ** (Bài 9)                                                                                      | Bổ sung                                                                                                        |
| 7   | `[+]`   | **Năng lượng ánh sáng. Tia sáng, vùng tối** (Bài 15)                                                       | Bổ sung                                                                                                        |
| 8   | `[−]`   | **Công `A = F·s` và công suất `P = A/t`**                                                                  | **CHUYỂN SANG LỚP 9** (Bài 4). KHTN 8 KNTT không có bài nào về công/công suất — **lệch lớn nhất của file này** |
| 8   | `[≠]`   | Lực đẩy Archimedes `F_A = d·V`                                                                             | 🟡 Hạ mức xuống định tính — mục tiêu Bài 17 chỉ nêu điều kiện định tính, cần giáo viên xác nhận                |
| 8   | `[+]`   | **Nội năng** (Bài 26 "Năng lượng nhiệt và nội năng")                                                       | Bổ sung — kho cũ thiếu khái niệm nội năng                                                                      |
| 8   | `[+]`   | Mạch điện đơn giản (Bài 22)                                                                                | Bổ sung                                                                                                        |
| 9   | `[+]`   | **Chương I "Năng lượng cơ học"** (3 bài): `W_đ = ½mv²`, `W_t = P·h`, `W = W_đ + W_t`, `A = F·s`, `P = A/t` | Bổ sung — kho cũ **thiếu hoàn toàn ở lớp 9**                                                                   |
| 9   | `[+]`   | **Phản xạ toàn phần** (Bài 6) · **Lăng kính, tán sắc** (Bài 7) · **Kính lúp** (Bài 10)                     | Bổ sung vào mảng Ánh sáng                                                                                      |
| 9   | `[−]`   | **Máy ảnh, mắt**                                                                                           | **BỎ** — không có trong mục lục KHTN 9 KNTT                                                                    |
| 9   | `[−]`   | **Lực điện từ, quy tắc bàn tay trái, máy phát điện & máy biến áp**                                         | **BỎ** — chương IV chỉ có Bài 14 (cảm ứng điện từ, dòng xoay chiều) và Bài 15 (tác dụng dòng xoay chiều)       |
| 9   | `[≠]`   | Công/công suất điện: `P = I²R = U²/R`, Joule–Lenz `Q = I²Rt`                                               | 🟡 Giữ tạm nhưng đánh dấu chưa xác minh — Bài 13 chỉ ghi "Năng lượng của dòng điện và công suất điện"          |
| 9   | `[≠]`   | Công thức thấu kính `1/f = 1/d + 1/d'`                                                                     | 🟡 Giữ tạm — Bài 10 có "Bài tập thấu kính" nhưng chưa xác minh có công thức hay chỉ dựng ảnh                   |
| 9   | `[≠]`   | Hiệu suất `H = A_ích / A_toàn phần`                                                                        | 🟡 Giữ tạm — không có bài riêng trong mục lục                                                                  |

**Tổng cộng: 18 mục** — `[+]` 8 · `[≠]` 6 · `[−]` 4 · phần còn lại `[✓]` giữ nguyên.

### 6.2 Kết luận các điểm ĐÃ ĐÁNH DẤU NGHI NGỜ

| Chỗ nghi ngờ                                       | Kết luận                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hệ số `g = 10` hay `9,8`?**                      | ✅ **ĐÃ XÁC MINH trên nội dung Bài 43 KHTN 6.** SGK dùng **cả hai, ở hai vai trò khác nhau**: (a) Bảng 43.1 nêu vật 1 kg có "trọng lượng" **9,8 N** trên Trái Đất — giá trị vật lí thật, để so với Mặt Trăng 1,7 N và Hoả tinh 3,6 N; (b) kết luận tính toán ghi số đo `P` (N) **gần bằng 10 lần** số đo `m` (kg) ⇒ **công thức làm bài là `P ≈ 10·m`**, tức `g = 10 N/kg`. Ảnh: `SGK-KHTN/6/page_0155.png` và `page_0157.png` (trang in 155, 156). |
| **Phân môn KHTN tách/gộp thế nào ở lớp 9?**        | ✅ **ĐÃ KẾT LUẬN.** KHTN 9 KNTT vẫn là **MỘT cuốn tích hợp**, nhưng 14 chương được gom thành **3 khối liền mạch theo phân môn** (I-V Lý → VI-X Hoá → XI-XIV Sinh), rõ hơn hẳn lớp 6-8. ⇒ **Quyết định kiến trúc PA C (môn cha `khtn` + cột `branch`) là đúng và đủ**, không cần tách 3 môn riêng ở THCS.                                                                                                                                            |
| **Nội dung STEM / chuyển đổi số mới (TT 17/2025)** | 🟡 **Chưa kết luận được — CẦN GIÁO VIÊN XÁC NHẬN.** Không có bản đối chứng SGK chỉnh sửa theo TT 17/2025 để so. **Không đoán.**                                                                                                                                                                                                                                                                                                                     |

**Hệ quả cho ngưỡng dung sai của engine chấm (điểm nghi ngờ này vốn đặt ra để quyết định dung
sai):** vì SGK dùng song song `9,8` và `10`, bài Lý THCS phải chấp nhận sai lệch **≈ 2%** giữa
hai quy ước. Ngưỡng **3% hiện có là vừa đủ nhưng sát mép** — khuyến nghị **ghi rõ trong đề** giá
trị `g` phải dùng, thay vì trông cậy vào dung sai. Ghi thành mục riêng, không sửa
`packages/core-grading` trong PR tài liệu này.

### 6.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Lý) duyệt lần cuối

1. **Lực đẩy Archimedes lớp 8** — SGK có cho công thức `F_A = d·V` (định lượng) hay chỉ dừng ở
   định tính? Quyết định có ra đề tính `F_A` hay không.
2. **Moment lực lớp 8** — có công thức `M = F·d` không, hay chỉ định tính?
3. **Công thức thấu kính lớp 9** (`1/f = 1/d + 1/d'`) — Bài 10 có dạy hay chỉ dựng ảnh hình học?
4. **Công suất điện lớp 9** — `P = I²R = U²/R` và định luật Joule–Lenz có thuộc phạm vi lớp 9
   KNTT không?
5. **Chương X lớp 6 "Trái Đất và bầu trời"** thuộc branch nào? Tài liệu này tạm xếp `physics`
   theo Chương trình GDPT 2018, nhưng đây là **quy ước**, cần xác nhận.
6. ~~**§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu**~~ **✅ ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §6.4.
   Danh sách cần duyệt riêng cho cấp 3 ở **§6.5**.

---

### 6.4 Nhật ký đối chiếu — phần THPT (§3, lớp 10-12) · 2026-08-01

**Phạm vi:** SGK **Vật lí 10, 11, 12** bộ "Kết nối tri thức với cuộc sống"
(`tai-lieu-sgk/SGK-Ly/10..12/`, mục lục ở `page_0005.png` của mỗi cuốn, OCR bằng
`scripts/ocr-crop.py` vì mục lục trình bày 2 cột). Mục lục đầy đủ:
`docs/research/muc-luc-sgk/ly-10.md` · `ly-11.md` · `ly-12.md`.
Thư mục con `cd/` trong mỗi lớp là đĩa tài nguyên đính kèm SGK, **không phải trang sách** — bỏ qua.

**Quy mô sách:** Vật lí 10 = 7 chương / 34 bài · Vật lí 11 = 4 chương / 26 bài ·
Vật lí 12 = 4 chương / 25 bài. **Tổng 15 chương / 85 bài.**

#### Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]` của phần THPT

| Lớp | Ký hiệu | Nội dung                                                                                                                  | Đã làm gì                                                                                                   |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 10  | `[+]`   | **Sai số phép đo** (Bài 3 — chương I Mở đầu)                                                                              | Bổ sung — kho cũ thiếu hoàn toàn chương I                                                                   |
| 10  | `[+]`   | **Phân biệt độ dịch chuyển `d` (vector) và quãng đường `s`** · đồ thị `d–t` (Bài 4, 7)                                    | Bổ sung — kho cũ gộp làm một                                                                                |
| 10  | `[+]`   | **Lực căng dây** (Bài 17) · **lực cản, lực nâng** (Bài 19)                                                                | Bổ sung vào mục "Các lực"                                                                                   |
| 10  | `[+]`   | **Moment lực `M = F·d`. Cân bằng của vật rắn** (Bài 21)                                                                   | Bổ sung — mức định lượng cần giáo viên xác nhận                                                             |
| 10  | `[+]`   | **Hiệu suất `H = A_ích/A_toàn phần`** (Bài 27 — có **bài riêng**)                                                         | Bổ sung — trước đây chỉ treo nghi vấn ở lớp 9 (§6.1); nay xác định lớp 10 là nơi dạy chính                  |
| 10  | `[+]`   | **Khối lượng riêng `ρ = m/V`, áp suất chất lỏng `p = ρgh`** (Bài 34)                                                      | Bổ sung — kho cũ chỉ có ở KHTN 8, tưởng cấp 3 không học lại                                                 |
| 10  | `[≠]`   | **Định luật Hooke `F = k·\|Δl\|`**                                                                                        | Chuyển từ mục "Các lực" sang **chương VII riêng "Biến dạng của vật rắn"** (Bài 33) — SGK để cuối sách       |
| 11  | `[≠]`   | **Con lắc lò xo `T = 2π√(m/k)` · con lắc đơn `T = 2π√(l/g)`**                                                             | 🟡 Giữ tạm, đánh dấu chưa xác minh — chương I **không có bài riêng nào** về con lắc                         |
| 11  | `[+]`   | **Năng lượng trong dao động điều hoà** (Bài 5, 7 — 2 bài)                                                                 | Bổ sung — kho cũ thiếu                                                                                      |
| 11  | `[+]`   | **Điện trường đều `E = U/d`** (Bài 18) · **thế năng điện** (Bài 19)                                                       | Bổ sung                                                                                                     |
| 11  | `[+]`   | **Sóng âm** — đo tần số sóng âm (Bài 10), đo tốc độ truyền âm (Bài 15)                                                    | Bổ sung                                                                                                     |
| 11  | `[−]`   | **Ghép nguồn điện (nối tiếp / song song)**                                                                                | **BỎ** — không có dấu vết trong mục lục chương IV (5 bài)                                                   |
| 12  | `[+]`   | **Cấu trúc của chất. Sự chuyển thể** (Bài 1) · **Thang nhiệt độ `T(K) = t(°C) + 273,15`** (Bài 3)                         | Bổ sung — kho cũ thiếu 2 bài đầu chương I                                                                   |
| 12  | `[+]`   | **Áp suất khí theo mô hình động học phân tử `p = ⅓μv̄²`** · **`W̄_đ = (3/2)kT`** (Bài 12)                                   | Bổ sung — mức định lượng cần giáo viên xác nhận                                                             |
| 12  | `[+]`   | **Máy phát điện xoay chiều** (Bài 17) · **Ứng dụng cảm ứng điện từ** (Bài 18) · **Điện từ trường, sóng điện từ** (Bài 19) | Bổ sung — kho cũ thiếu cả 3 bài của chương III                                                              |
| 12  | `[+]`   | **Công nghiệp hạt nhân** (Bài 24)                                                                                         | Bổ sung                                                                                                     |
| 12  | `[−]`   | **Lực Lorentz `f = \|q\|vB·sin α`**                                                                                       | 🟡 Đánh dấu nghi thừa — chương III chỉ có Bài 15 "Lực từ tác dụng lên **dây dẫn mang dòng điện**". Chưa xoá |

**Tổng cộng phần THPT: 17 mục** — `[+]` 13 · `[≠]` 2 · `[−]` 2 · phần còn lại `[✓]` giữ nguyên.
(Cộng với 18 mục của cấp 2 ở §6.1 ⇒ **35 mục lệch trên toàn file**.)

#### Kết luận các điểm nghi ngờ ĐÃ XÁC MINH ĐƯỢC ở cấp 3

| Điểm nghi ngờ                                                       | Kết luận                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Công / công suất / hiệu suất / cơ năng dạy ở lớp nào?**           | ✅ **DẠY Ở CẢ HAI CẤP, khác độ sâu — KHÔNG xoá nội dung cấp 2.** KHTN 9 chương I: `A = F·s`, `P = A/t`, `W_đ = ½mv²`, `W_t = P·h`. Vật lí 10 chương IV: `A = F·s·cos α` (thêm góc), `P = A/t = F·v` (thêm dạng `F·v`), **định luật bảo toàn cơ năng thành bài riêng** (Bài 26), **hiệu suất thành bài riêng** (Bài 27). ⇒ Ghi rõ 2 layer trong kho, giữ nguyên cả hai. |
| **Định luật bảo toàn động lượng dạy ở lớp nào?**                    | ✅ **CHỈ Ở VẬT LÍ 10** (chương V, Bài 28-30). Không có ở cấp 2 — mục lục KHTN 6-9 không có bài nào về động lượng. Kho kiến thức đã xếp đúng.                                                                                                                                                                                                                           |
| **Nhiệt học & chất khí ở lớp 10 hay lớp 12?**                       | ✅ **LỚP 12** (chương I "Vật lí nhiệt", chương II "Khí lí tưởng"). Vật lí 10 KNTT **hoàn toàn không có nhiệt học** — khác hẳn chương trình cũ. Kho kiến thức đã xếp đúng ở lớp 12.                                                                                                                                                                                     |
| **Từ trường & cảm ứng điện từ ở lớp 11 hay lớp 12?**                | ✅ **LỚP 12** (chương III). Vật lí 11 KNTT chỉ có điện trường + dòng điện một chiều. Kho kiến thức đã xếp đúng.                                                                                                                                                                                                                                                        |
| **Quang hình (thấu kính, mắt) có ở cấp 3 không?**                   | ✅ **KHÔNG.** Không xuất hiện trong mục lục cả 3 lớp — đã chuyển hẳn xuống **KHTN 9**. Củng cố quyết định ở §6.1 (bỏ "máy ảnh, mắt" khỏi lớp 9 là do SGK KHTN 9 không có bài riêng, chứ không phải vì chuyển lên cấp 3).                                                                                                                                               |
| **Dòng điện xoay chiều / mạch RLC / quang phổ / lượng tử ánh sáng** | ✅ **KHÔNG CÓ ở bất kỳ lớp nào 10-12.** Chương trình 2018 đã bỏ. Kho kiến thức vốn không ghi ⇒ đúng, không cần sửa.                                                                                                                                                                                                                                                    |
| **Đơn vị & ký hiệu chuẩn hệ SI**                                    | 🟡 **XÁC MINH ĐƯỢC SỰ TỒN TẠI, chưa đọc trọn bảng.** Vật lí 10 có mục riêng đầu sách "Bảng đơn vị đo lường thuộc hệ SI dùng trong SGK Vật lí 10": 7 đơn vị cơ bản + bảng đơn vị dẫn xuất + ghi chú vận dụng theo bài. OCR bảng bị vỡ (nhiều ô nhỏ), chỉ đọc chắc vài dòng (rad/s, rad/s², m³, Hz, N, N·m). **Không chép bảng vào kho** — xem §6.5 mục 5.               |

### 6.5 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Lý) duyệt — riêng phần THPT

1. **Vật lí 10, Bài 21 (Moment lực)** — SGK có nêu công thức `M = F·d` định lượng hay chỉ định
   tính? (Câu hỏi song song với mục 2 của §6.3 ở lớp 8.)
2. **Vật lí 10, Bài 34** — bài này có nhắc lại **nguyên lí Pascal** và **lực đẩy Archimedes** ở
   mức định lượng không? Tên bài chỉ ghi "Khối lượng riêng. Áp suất chất lỏng".
3. **Giá trị `g` dùng trong bài tập Vật lí 10** — `9,8 m/s²` hay `10 m/s²`? Ở KHTN 6 đã xác minh
   SGK dùng `P ≈ 10·m`; **chưa xác minh cho cấp 3**. Ảnh hưởng trực tiếp ngưỡng dung sai engine chấm.
4. **Vật lí 11 — con lắc lò xo / con lắc đơn** có được dạy (dù không có bài riêng) không? Nếu có
   thì `T = 2π√(m/k)`, `T = 2π√(l/g)` có thuộc phạm vi ra đề không?
5. **Vật lí 10 — bảng đơn vị hệ SI đầu sách:** cần bản đầy đủ, chính xác để chuẩn hoá danh mục đơn
   vị hợp lệ của engine chấm (yêu cầu §4 "đáp án là cặp (giá trị, đơn vị)"). OCR hiện chưa đủ tin cậy.
6. **Vật lí 12 — lực Lorentz** có nằm trong Bài 15 không, hay CT 2018 đã bỏ hẳn?
7. **Vật lí 12, Bài 12** — mức định lượng của `p = ⅓μv̄²` và `W̄_đ = (3/2)kT`.
8. **Vật lí 12, Bài 23** — định luật phóng xạ viết dạng `N = N₀·2^(−t/T)`, `N = N₀·e^(−λt)`, hay cả hai?
9. **Vật lí 12 không có bài thực hành nào trong mục lục** (khác lớp 10 và 11) — đúng vậy hay thực
   hành được gộp trong bài? Chưa kết luận.

---

## [4] Tài liệu: kho-kien-thuc-sinh-gdpt2018.md

_(Chi tiết nguồn gốc: `kho-kien-thuc-sinh-gdpt2018.md`)_

# Kho kiến thức môn SINH HỌC — tiểu học → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: **GĐ3+** — hoàn thiện bộ ba KHTN (Lý · Hoá · Sinh)
> Đọc trước: `kho-kien-thuc-toan-gdpt2018.md` §0 (nguồn gốc, ranh giới bản quyền, cổng duyệt) và
> `kho-kien-thuc-ly-gdpt2018.md` §0 (**vấn đề môn KHTN tích hợp — áp dụng y hệt cho Sinh**).
> Trạng thái: **bản thảo kỹ thuật — CHƯA DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/*/src/data/`**

---

## 0. Vị trí môn Sinh + ⚠️ CẢNH BÁO PHẠM VI

| Cấp          | Sinh học nằm ở đâu                                    |
| ------------ | ----------------------------------------------------- |
| Tiểu học 1-3 | Tự nhiên và Xã hội (cây cối, con vật, cơ thể người)   |
| Tiểu học 4-5 | Môn **Khoa học**                                      |
| THCS 6-9     | **Trong môn KHTN** (phân môn Sinh) — không tách riêng |
| THPT 10-12   | **Sinh học là môn riêng**, nhóm môn **lựa chọn**      |

### 0.1 ⚠️ Sinh học KHÁC HẲN Toán/Lý/Hoá về khả năng chấm tự động — đọc kỹ trước khi cam kết

Đây là kết luận quan trọng nhất của file này:

**Sinh học chủ yếu là kiến thức MÔ TẢ, không phải tính toán.** Ước lượng thô tỉ lệ dạng bài:

| Môn  | Bài ra đáp số/biểu thức chấm được bằng thuật toán | Bài mô tả/giải thích (không chấm tự động được) |
| ---- | ------------------------------------------------- | ---------------------------------------------- |
| Toán | ~95%                                              | ~5%                                            |
| Hoá  | ~60%                                              | ~40%                                           |
| Lý   | ~70%                                              | ~30%                                           |
| Sinh | **~15%**                                          | **~85%**                                       |

**Hệ quả thẳng thắn:** engine chấm (`dac-ta-engine-cham-dung-chung.md`) — thứ tạo ra phần lớn giá
trị cho Toán/Lý/Hoá — **gần như vô dụng với Sinh học**. Phần tính toán được của Sinh chỉ gồm
di truyền (tỉ lệ phân li), năng lượng sinh thái, và vài công thức ADN (§3).

**Ba lựa chọn, cần chốt trước khi làm Sinh:**

| PA  | Cách làm                                               | Đánh giá                                                                                      |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A   | **Không làm Sinh** ở giai đoạn này                     | Trung thực nhất với thế mạnh sản phẩm (chấm chính xác không cần AI)                           |
| B   | Làm Sinh nhưng **chỉ trắc nghiệm + thẻ ghi nhớ (SRS)** | ✅ **Khuyến nghị** — SRS vốn là thứ app đã làm tốt cho từ vựng tiếng Anh, tái dùng được thẳng |
| C   | Làm đủ, dùng AI chấm phần tự luận                      | ❌ **Vi phạm nguyên tắc đã chốt** "không để AI phán đúng/sai" + đội chi phí AI                |

> ### ✅ ĐÃ CHỐT 2026-08-01 (người dùng duyệt): **PA B** — trắc nghiệm + SRS.
>
> **PA B**, và đây là chỗ có mối nối bất ngờ: **Sinh học về bản chất gần với HỌC TỪ
> VỰNG hơn là với Toán** — đều là "nhớ nhiều khái niệm, ôn lặp lại ngắt quãng". App đã có sẵn
> engine SRS chạy tốt cho tiếng Anh (`apps/english/src/lib/srs.ts`) → **tái dùng cho Sinh rẻ hơn
> nhiều so với xây engine chấm mới**. Cần người dùng xác nhận.

---

## 1. TIỂU HỌC (lớp 1-5)

Thực vật, động vật quanh ta · **cơ thể người** (các giác quan, cơ quan tiêu hoá, hô hấp, tuần
hoàn ở mức nhận biết) · dinh dưỡng, vệ sinh, an toàn · **chuỗi thức ăn** đơn giản · môi trường và
bảo vệ môi trường. **Không có công thức** → trắc nghiệm/ghép nối/quan sát.

---

## 2. THCS (lớp 6-9) — trong môn KHTN

> ✅ **§2 đã được đối chiếu với SGK KHTN 6-9 "Kết nối tri thức" ngày 2026-08-01** — xem
> `docs/research/muc-luc-sgk/khtn-6..9.md` và **Nhật ký đối chiếu §5** cuối file.

| Lớp     | Nội dung phân môn Sinh                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6 `[✓]` | **Tế bào** (đơn vị cơ bản của sự sống, cấu tạo, phân chia) · phân loại thế giới sống · `[+]` **khoá lưỡng phân** · virus, vi khuẩn, nguyên sinh vật, nấm, thực vật, động vật · đa dạng sinh học · `[+]` **từ tế bào đến cơ thể** (cơ thể đơn bào/đa bào, tế bào → mô → cơ quan → hệ cơ quan)                                                                                                                                                                                                                       |
| 7 `[✓]` | **Trao đổi chất và chuyển hoá năng lượng ở sinh vật**: quang hợp, hô hấp tế bào · `[+]` **trao đổi khí ở sinh vật** · trao đổi nước & chất dinh dưỡng ở thực vật và động vật · **cảm ứng ở sinh vật** · sinh trưởng, phát triển · sinh sản · `[+]` **cơ thể sinh vật là một thể thống nhất** (Bài 42)                                                                                                                                                                                                              |
| 8 `[≠]` | **Cơ thể người** (11 bài): hệ vận động, tiêu hoá, tuần hoàn, hô hấp, bài tiết, `[+]` **điều hoà môi trường trong**, thần kinh & giác quan, nội tiết, `[+]` **da và điều hoà thân nhiệt**, sinh sản · **Sinh vật và môi trường** (7 bài): nhân tố sinh thái, `[+]` **quần thể**, `[+]` **quần xã**, hệ sinh thái, `[+]` **sinh quyển**, `[+]` **cân bằng tự nhiên**, `[+]` **bảo vệ môi trường**                                                                                                                    |
| 9 `[≠]` | **Di truyền học**: `[≠]` **DNA / RNA** (SGK dùng tên quốc tế, không phải ADN/ARN), nucleic acid & gene, tái bản – phiên mã – dịch mã, nhiễm sắc thể · **quy luật Mendel** · nguyên phân, giảm phân · `[+]` **NST giới tính & cơ chế xác định giới tính** · `[+]` **di truyền liên kết** (dạy ngay ở lớp 9, không phải chờ lớp 12) · đột biến gene, đột biến NST · di truyền ở người, `[+]` **ứng dụng công nghệ di truyền** · **tiến hoá** (khái niệm & chọn lọc, cơ chế tiến hoá, phát sinh & phát triển sự sống) |

### 2.1 Phần TÍNH TOÁN được ở THCS (ít, nhưng có)

| Nội dung                     | Công thức                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Quy luật Mendel `[✓]`        | Lai một cặp tính trạng: F₂ phân li **3 trội : 1 lặn** (kiểu hình), **1 : 2 : 1** (kiểu gene) |
| Lai hai cặp tính trạng `[✓]` | F₂ phân li **9 : 3 : 3 : 1**                                                                 |
| Nguyên phân `[✓]`            | Từ 1 tế bào qua `k` lần nguyên phân → **`2^k`** tế bào con (đã có mầm ở lớp 6, Bài 20)       |
| Giảm phân `[✓]`              | 1 tế bào sinh dục chín → 4 tế bào con, bộ NST giảm một nửa (`2n → n`)                        |
| **Cấu trúc DNA** `[+]`       | **`A = T`, `G = C`** · `N = 2A + 2G` (Bài 38 — kho cũ chỉ nêu ở lớp 12)                      |
| **Tái bản DNA** `[+]`        | Qua `k` lần → **`2^k`** phân tử (Bài 39)                                                     |
| **Dịch mã** `[+]`            | Số bộ ba mã hoá `= N/6` (Bài 40)                                                             |
| **Xác định giới tính** `[+]` | XX / XY · tỉ lệ phân li giới tính **1 : 1** (Bài 44)                                         |
| **Mật độ quần thể** `[+]`    | Số cá thể / đơn vị diện tích (hoặc thể tích) — KHTN 8 Bài 42                                 |

> **Nhận xét quan trọng cho phạm vi GĐ3:** phần tính toán của Sinh ở THCS **nhiều hơn ước lượng
> ban đầu** — chương XI-XII lớp 9 (di truyền phân tử + NST) có tới 5 nhóm công thức chấm tự động
> được, thay vì chỉ 4 dòng như bản thảo cũ. Tuy vậy kết luận §0.1 (Sinh ~15% chấm được) vẫn giữ:
> 5 nhóm này nằm gọn trong 2/14 chương của lớp 9.

---

## 3. THPT (lớp 10-12) — Sinh học là môn riêng

### Lớp 10 — Sinh học tế bào & vi sinh vật

Thành phần hoá học của tế bào (nước, carbohydrate, lipid, protein, nucleic acid) · cấu trúc tế
bào nhân sơ / nhân thực · **vận chuyển qua màng** (khuếch tán, thẩm thấu, vận chuyển chủ động) ·
**chuyển hoá năng lượng**: enzyme, hô hấp tế bào, quang hợp · **chu kì tế bào**, nguyên phân,
giảm phân · công nghệ tế bào · vi sinh vật, virus, ứng dụng.

### Lớp 11 — Sinh học cơ thể

Trao đổi nước và khoáng ở thực vật · quang hợp và năng suất cây trồng · hô hấp ở thực vật ·
tiêu hoá, hô hấp, tuần hoàn, bài tiết ở động vật · **cân bằng nội môi** · cảm ứng ở thực vật và
động vật · sinh trưởng và phát triển · sinh sản · ứng dụng trong nông nghiệp và y học.

### Lớp 12 — Di truyền, tiến hoá, sinh thái

| Chủ đề             | Kiến thức cốt lõi                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Di truyền phân tử  | ADN, **nhân đôi ADN**, phiên mã, dịch mã · **mã di truyền** (bộ ba, tính thoái hoá) · điều hoà biểu hiện gene                   |
| Di truyền NST      | Quy luật Mendel · liên kết gene, hoán vị gene · di truyền liên kết giới tính · đột biến gene, đột biến NST                      |
| Di truyền quần thể | **Định luật Hardy–Weinberg**: `p² + 2pq + q² = 1`, `p + q = 1` · cấu trúc di truyền quần thể tự phối / ngẫu phối                |
| Ứng dụng           | Di truyền y học · công nghệ gene · tư vấn di truyền                                                                             |
| Tiến hoá           | Bằng chứng tiến hoá · học thuyết Darwin, thuyết tiến hoá tổng hợp hiện đại · **các nhân tố tiến hoá** · hình thành loài         |
| Sinh thái          | Quần thể, quần xã, **hệ sinh thái** · chuỗi và lưới thức ăn · **tháp sinh thái** · chu trình sinh địa hoá · phát triển bền vững |

### 3.1 Phần TÍNH TOÁN được ở THPT — danh sách đầy đủ

Đây là **toàn bộ** những gì engine chấm dùng được cho Sinh học:

| Nội dung                       | Công thức                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Cấu trúc ADN                   | **`A = T`, `G = X`** · tổng nucleotide `N = 2A + 2G` · **chiều dài `L = (N/2) × 3,4 Å`**               |
| Liên kết hydrogen              | **`H = 2A + 3G`**                                                                                      |
| Nhân đôi ADN                   | Qua `k` lần → **`2^k`** phân tử; số nucleotide môi trường cung cấp `= N(2^k − 1)`                      |
| Phiên mã / dịch mã             | Số bộ ba mã hoá `= N/6` · số amino acid trong chuỗi polypeptide `= N/6 − 1`                            |
| Nguyên phân / giảm phân        | Số tế bào con, số NST qua các kì                                                                       |
| **Hardy–Weinberg**             | `p² + 2pq + q² = 1` — tính tần số allele, tần số kiểu gene                                             |
| Quy luật Mendel & hoán vị gene | Tỉ lệ phân li kiểu hình/kiểu gene · **tần số hoán vị gene `f = (số cá thể tái tổ hợp / tổng) × 100%`** |
| Hiệu suất sinh thái            | **`H = (năng lượng bậc sau / năng lượng bậc trước) × 100%`** (thường ~10%)                             |

> Nhận xét: các công thức trên **đều ra đáp số thuần** (số nguyên, phần trăm, chiều dài có đơn
> vị) → engine chấm hiện có **dùng được ngay, không cần bổ sung gì**. Nghĩa là nếu làm Sinh theo
> PA B, phần tính toán này chi phí gần như bằng 0.

---

## 4. Kết luận & khuyến nghị

1. ~~Chốt PA A/B/C ở §0.1~~ **✅ ĐÃ CHỐT: PA B** (2026-08-01) — trắc nghiệm + SRS, cộng phần
   tính toán §3.1 dùng engine chấm sẵn có (`packages/core-grading`, đã viết xong).
2. Sinh học **không cần engine chấm mới** — nó cần **engine SRS**, thứ app đã có và đã chạy tốt
   cho từ vựng tiếng Anh suốt thời gian qua. Đây là chỗ tái dùng rẻ nhất trong toàn bộ kế hoạch
   đa môn.
3. ~~Thứ tự đề xuất cho GĐ3~~ **✅ ĐÃ CHỐT: Hoá → Lý → Sinh** (2026-08-01): — Hoá trước vì cân bằng PTHH chấm chính xác tuyệt đối (tính năng "đinh"),
   Lý sau vì phụ thuộc engine đơn vị/dung sai, Sinh cuối vì mô hình học khác hẳn (SRS chứ không
   phải chấm) nên nên tách ra làm riêng, không trộn nhịp với hai môn kia.
4. ~~Người có chuyên môn (giáo viên Sinh) duyệt §2-§3 đối chiếu SGK "Kết nối tri thức".~~
   **✅ §2 (THCS) ĐÃ ĐỐI CHIẾU 2026-08-01** — xem §5. **§3 (THPT 10-12) vẫn CHƯA đối chiếu** (chưa
   có SGK Sinh học 10-12 trong `tai-lieu-sgk/`). Vẫn cần giáo viên Sinh duyệt lần cuối — xem §5.3.

---

## 5. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §2 — THCS lớp 6-9, môn KHTN bộ "Kết nối tri thức"
(`tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng `scripts/ocr-images.py` + `scripts/ocr-crop.py`). Mục lục
đầy đủ: `docs/research/muc-luc-sgk/khtn-6..9.md`.
**Chưa đối chiếu:** §1 (tiểu học), §3 (THPT 10-12) — chưa có sách trong `tai-lieu-sgk/`.

**Phần Sinh chiếm tỉ trọng lớn nhất trong KHTN THCS:** 22/55 bài lớp 6 · 22/42 bài lớp 7 ·
18/47 bài lớp 8 · 16/51 bài lớp 9. Riêng lớp 7 phần Sinh chiếm **hơn nửa sách**.

### 5.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                                    | Đã làm gì                                                                                                          |
| --- | ------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 6   | `[+]`   | **Khoá lưỡng phân** (Bài 26)                                                                | Bổ sung vào §2 lớp 6                                                                                               |
| 6   | `[+]`   | **Từ tế bào đến cơ thể** (chương VI): cơ thể đơn bào/đa bào, tổ chức cơ thể đa bào          | Bổ sung — kho cũ gộp vào "tế bào", SGK có chương riêng                                                             |
| 7   | `[+]`   | **Trao đổi khí ở sinh vật** (Bài 28)                                                        | Bổ sung                                                                                                            |
| 7   | `[+]`   | **Cơ thể sinh vật là một thể thống nhất** (Bài 42)                                          | Bổ sung — bài tổng kết của cả sách, kho cũ thiếu                                                                   |
| 8   | `[+]`   | **Điều hoà môi trường trong của cơ thể người** (Bài 36)                                     | Bổ sung — khái niệm cân bằng nội môi xuất hiện sớm hơn kho cũ ghi (kho xếp ở lớp 11)                               |
| 8   | `[+]`   | **Da và điều hoà thân nhiệt ở người** (Bài 39)                                              | Bổ sung                                                                                                            |
| 8   | `[≠]`   | "Môi trường và hệ sinh thái" gộp 1 dòng → SGK có **chương VIII, 7 bài riêng**               | Chi tiết hoá: nhân tố sinh thái, quần thể, quần xã, hệ sinh thái, sinh quyển, cân bằng tự nhiên, bảo vệ môi trường |
| 8   | `[+]`   | **Mật độ quần thể** — công thức chấm tự động được (Bài 42)                                  | Bổ sung vào §2.1                                                                                                   |
| 9   | `[≠]`   | **"ADN / ARN" → "DNA / RNA"**; **`G = X` → `G = C`**                                        | **SỬA thuật ngữ** — SGK KNTT dùng tên quốc tế (chương XI, Bài 38)                                                  |
| 9   | `[+]`   | **Nucleic acid & gene; tái bản DNA; phiên mã; dịch mã; mối quan hệ gene → tính trạng**      | Chi tiết hoá — kho cũ gộp thành "ADN, gene". SGK dành 4 bài (38-41)                                                |
| 9   | `[+]`   | **Cấu trúc DNA `A = T`, `G = C`, `N = 2A + 2G`; `2^k` phân tử sau tái bản; số bộ ba `N/6`** | Bổ sung vào **§2.1** — kho cũ chỉ nêu các công thức này ở **lớp 12** (§3.1)                                        |
| 9   | `[+]`   | **NST giới tính và cơ chế xác định giới tính** (Bài 44) — tỉ lệ 1 : 1                       | Bổ sung, kể cả vào §2.1 (chấm tự động được)                                                                        |
| 9   | `[≠]`   | **Di truyền liên kết** — kho cũ xếp ở lớp 12                                                | **CHUYỂN xuống lớp 9** (Bài 45). SGK dạy ngay ở THCS                                                               |
| 9   | `[+]`   | **Ứng dụng công nghệ di truyền vào đời sống** (Bài 48)                                      | Bổ sung                                                                                                            |
| 9   | `[≠]`   | "Nguồn gốc sự sống"                                                                         | Sửa tên theo SGK: **"Sự phát sinh và phát triển sự sống trên Trái Đất"** (Bài 51)                                  |

**Tổng cộng: 15 mục** — `[+]` 10 · `[≠]` 5 · `[−]` 0 · phần còn lại `[✓]` giữ nguyên.
Không có mục `[−]` nào: **mọi nội dung kho kiến thức ghi cho THCS đều thật sự có trong SGK**;
vấn đề duy nhất là ghi **quá sơ lược** so với dung lượng thật của sách.

### 5.2 Kết luận cho quyết định PA B (trắc nghiệm + SRS)

Đối chiếu **củng cố PA B**, không làm lung lay:

- Tỉ lệ bài mô tả rất cao đúng như dự đoán — ví dụ lớp 7 có 22 bài Sinh thì 6 bài là **thực hành**
  (không chấm tự động được) và phần lớn còn lại là mô tả cơ chế.
- Nhưng có một **điều chỉnh nhỏ**: phần chấm tự động được ở THCS **nhiều hơn bản thảo cũ ghi** —
  chương XI-XII lớp 9 (DNA, tái bản, dịch mã, NST, giới tính) cho 5 nhóm công thức, cộng mật độ
  quần thể ở lớp 8. Vẫn nằm trong ngưỡng ~15% nên **không cần đổi PA**.

### 5.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN (Sinh) duyệt lần cuối

1. **Mức độ định lượng của chương XI-XII lớp 9** — SGK có ra bài tập tính `N`, `A/T/G/C`, số bộ
   ba, hay chỉ dừng ở mô tả cơ chế? Quyết định phạm vi bài tập chấm tự động được.
2. **Di truyền liên kết ở lớp 9** — mức độ sâu tới đâu so với lớp 12, để đặt `prerequisites` đúng
   và tránh dạy trùng.
3. **Thuật ngữ DNA/RNA vs ADN/ARN** — xác nhận SGK KNTT dùng nhất quán tên quốc tế ở mọi bài
   (đối chiếu này chỉ đọc mục lục chương XI, chưa đọc toàn bộ nội dung).
4. **§3 (THPT lớp 10-12) hoàn toàn chưa đối chiếu** — vẫn là bản thảo theo hiểu biết chung.

---

## [5] Tài liệu: kho-kien-thuc-toan-gdpt2018.md

_(Chi tiết nguồn gốc: `kho-kien-thuc-toan-gdpt2018.md`)_

# Kho kiến thức môn TOÁN — mầm non → lớp 12 (bám Chương trình GDPT 2018)

> Ngày: 2026-08-01 · Phục vụ: `docs/research/dac-ta-gd2-mon-toan-2026-08-01.md`
> Trạng thái: **bản thảo kỹ thuật — CHƯA ĐƯỢC DUYỆT CHUYÊN MÔN, chưa được đưa vào `apps/math/src/data/`**

---

## 0. NGUỒN GỐC & GIỚI HẠN — đọc trước khi dùng file này

### 0.00 Căn cứ pháp lý — chuỗi văn bản đã tra cứu (2026-08-01)

| Văn bản                                    | Vai trò                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| **Thông tư 32/2018/TT-BGDĐT** (26/12/2018) | Ban hành Chương trình GDPT 2018 — văn bản GỐC                             |
| Thông tư 20/2021/TT-BGDĐT                  | Sửa đổi, bổ sung                                                          |
| Thông tư 13/2022/TT-BGDĐT                  | Sửa đổi, bổ sung                                                          |
| **Thông tư 17/2025/TT-BGDĐT**              | **Sửa đổi, bổ sung MỚI NHẤT** — chương trình chỉnh sửa                    |
| **Quyết định 3588/QĐ-BGDĐT** (26/12/2025)  | Chọn bộ **"Kết nối tri thức với cuộc sống"** làm SGK dùng chung toàn quốc |

Bộ GD&ĐT tổ chức tập huấn giáo viên về chương trình chỉnh sửa, rà soát chỉnh sửa SGK một số lớp
cho phù hợp; **SGK chỉnh sửa thực hiện từ năm học 2026-2027**.

> ⚠️ **Điều AI CHƯA biết và KHÔNG được đoán:** nội dung chi tiết Thông tư 17/2025 sửa những gì
> **cụ thể** với môn Toán/KHTN. Đã thử đọc bản gốc trên `vanban.chinhphu.vn` → **HTTP 403**, cùng
> tình trạng với mọi nguồn Việt Nam khác (§0.1). Vì vậy toàn bộ nội dung §2-§5 dưới đây bám khung
> chương trình theo hiểu biết chung, **chưa đối chiếu với bản chỉnh sửa mới nhất** — đây chính là
> việc phải làm khi có SGK thật (xem `huong-dan-doi-chieu-sgk.md`).

### 0.0 ⚠️ CẬP NHẬT LỚN 2026-08-01 — SGK thống nhất toàn quốc từ năm học 2026-2027

Phát hiện qua kiểm chứng (người dùng nêu, AI tra cứu xác nhận):

- Bộ **"Kết nối tri thức với cuộc sống"** (NXB Giáo dục Việt Nam) được chọn làm **bộ SGK thống
  nhất dùng chung toàn quốc từ năm học 2026-2027**. Bộ GD&ĐT không biên soạn sách mới (cần 2-3
  năm) mà chọn 1 trong 3 bộ hiện hành, dựa trên tham vấn các sở GD + chuyên gia.
- Chương trình được **tinh chỉnh**: tăng thời lượng khoa học công nghệ, đổi mới sáng tạo, STEM,
  chuyển đổi số, **giáo dục trí tuệ nhân tạo (AI)**; hiệu chỉnh Lịch sử/Địa lý/GDCD theo địa giới
  hành chính + mô hình chính quyền địa phương hai cấp.

**Hệ quả cho dự án — ĐỔI GIẢ ĐỊNH, theo hướng TỐT hơn:**

| Trước (giả định cũ)                                            | Sau (thực tế 2026-2027)                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 3 bộ SGK song song → app phải viết trung lập, không bám bộ nào | **Một bộ duy nhất** → app bám đúng thứ tự chương/bài của "Kết nối tri thức"       |
| Lộ trình chỉ bám được khung mạch kiến thức chung của GDPT 2018 | Lộ trình khớp **đúng bài học sinh đang học trên lớp** → khác biệt cạnh tranh thật |

> Ghi chú về mức độ ảnh hưởng tới môn TOÁN cụ thể: các điều chỉnh được nêu tập trung vào thời
> lượng STEM/AI/chuyển đổi số và nhóm môn xã hội — **chưa có căn cứ nào cho thấy công thức/định
> lý Toán thay đổi** (bản chất chúng là sự thật khoa học, không đổi theo văn bản). Phần có thể
> xê dịch là **thứ tự và phạm vi bài theo từng lớp**. Vì vậy vẫn phải đối chiếu SGK thật (§0.3),
> nhưng phần công thức ở §3-§5 giữ nguyên giá trị.

### 0.1 Việc đã thử và KHÔNG làm được (ghi trung thực, không tô hồng)

Phiên AI này chạy trong sandbox có **chặn kết nối mạng ra ngoài theo danh sách cho phép**. Đã thử
thật và thất bại:

| Nguồn                                            | Kết quả thật                                              |
| ------------------------------------------------ | --------------------------------------------------------- |
| `taphuan.nxbgd.vn`                               | HTTP 403 qua WebFetch · `curl` trả `000` (không nối được) |
| `hanhtrangso.nxbgd.vn`                           | `curl` trả `000`                                          |
| `sachgiaokhoa.edu.vn`                            | `curl` trả `000`                                          |
| `moet.gov.vn`                                    | `curl` trả `000`                                          |
| `thuvienphapluat.vn` (bản CT GDPT 2018 môn Toán) | HTTP 403                                                  |

**Nguyên nhân đã xác định chính xác** (không phải trang chặn): `curl` tới
`taphuan.nxbgd.vn/tap-huan/chi-tiet-sach/toan-5-tap-mot-...` trả về
`curl: (56) CONNECT tunnel failed, response 403` — tức **proxy của sandbox từ chối mở đường ra
host đó**. DNS phân giải bình thường (Cloudflare, chung hạ tầng `taphuan.olm.vn`). Máy người dùng
truy cập bình thường; chỉ môi trường AI bị chặn.

**Kết luận: AI KHÔNG tự tải được sách giáo khoa hay bản gốc Thông tư 32.** Mọi nội dung dưới đây
viết từ **kiến thức toán học phổ quát** (công thức/định lý là sự thật khoa học, không thuộc bản
quyền ai) và **khung mạch kiến thức GDPT 2018 theo hiểu biết chung**, KHÔNG phải trích từ SGK.

#### Cách cung cấp nội dung SGK cho AI — KHÁC NHAU theo nơi AI chạy

**✅ CHỐT 2026-08-01: sẽ làm việc này ở PHIÊN LOCAL** (Claude Code chạy trên máy người dùng), nên
`tai-lieu-sgk/` là **đường chính thức**.

| Nơi AI chạy                            | Cách đưa SGK vào                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local** (máy người dùng) — ĐANG DÙNG | ✅ Chép PDF vào `tai-lieu-sgk/`, AI đọc trực tiếp. Nhận được cả bộ, không giới hạn dung lượng chat.                                                                               |
| Từ xa (web/app, container cloud)       | Đính kèm vào khung chat, hoặc chỉ gửi Mục lục. **Không** chép vào `tai-lieu-sgk/` được — container tạm thời, người dùng không truy cập được thư mục đó và file mất khi hết phiên. |

**`tai-lieu-sgk/` đã có trong `.gitignore`** — SGK có bản quyền, repo đẩy lên GitHub, **tuyệt đối
không commit sách vào git**. Dòng ignore này là hàng rào cứng: kể cả AI ở phiên sau lỡ `git add`
thì cũng không lên được GitHub.

**Ưu tiên nội dung cần:** **Toán 6-9 bộ "Kết nối tri thức"** (đợt 2a làm cấp 2 trước). Quy trình
đối chiếu chi tiết: xem **`docs/research/huong-dan-doi-chieu-sgk.md`**.

**Có SGK KHÔNG đồng nghĩa được chép nội dung.** Dùng sách để biết đúng _thứ tự bài, phạm vi từng
lớp, danh mục công thức_ (sự thật + khung chương trình → dùng được). Đề bài và ví dụ trong app
**vẫn phải tự soạn mới** (§0.2). Đọc sách ≠ được quyền sao chép sách.

### 0.2 Vì sao cách này lại ĐÚNG về bản quyền (không chỉ là giải pháp chữa cháy)

Trùng khớp với rủi ro 🔴 cao đã ghi ở `ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §6:

| Được dùng thoải mái                                                                 | TUYỆT ĐỐI KHÔNG                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Công thức, định lý, định luật (sự thật khoa học — không ai độc quyền)               | Chép nguyên văn đề bài / lời văn / hình vẽ trong SGK        |
| Tên gọi chuẩn của định lý ("định lý Pythagore", "hằng đẳng thức đáng nhớ")          | Chép cách diễn đạt đặc trưng, cách trình bày riêng của SGK  |
| Trình tự/phạm vi kiến thức theo lớp (bám Chương trình GDPT 2018 — văn bản nhà nước) | Sao chép cấu trúc chương/mục chi tiết của một bộ SGK cụ thể |
| Ví dụ **tự soạn mới**, cùng dạng công thức giải                                     | Đổi vài con số trong đề SGK rồi coi là "đề mới"             |

> Ranh giới thực hành: **"cùng công thức giải, đề khác hẳn"** — không phải "cùng đề, khác số".
> Đề trong app do **template sinh theo tham số** (xem đặc tả GĐ2 §3.2), không lấy từ nguồn nào.

### 0.3 Cổng bắt buộc trước khi dùng

File này **chưa được phép** đưa vào `apps/math/src/data/`. Phải qua **duyệt chuyên môn bởi người
thật** (giáo viên Toán hoặc người có chuyên môn) — đối chiếu từng mục với SGK/chương trình hiện
hành, vì AI không tự xác minh được (xem §0.1). Đây đúng là biện pháp giảm rủi ro "Nội dung bài
giảng sai kiến thức toán" đã ghi ở đặc tả GĐ2 §7 (🔴 cao).

---

## 1. Cách tổ chức dữ liệu — 3 loại bản ghi

Kho kiến thức không phải văn bản trôi mà là **dữ liệu có cấu trúc** để app dùng được (sinh đề,
chấm, SRS công thức). Ba loại:

### 1.1 `Formula` — công thức / định lý / định luật (đơn vị KIẾN THỨC)

```ts
type Formula = {
  id: string //  vd: 'm8.hdt.binh-phuong-tong'  (môn.chủ đề.tên)
  grade: Grade //  'mn' | 1..12
  strand: Strand //  mạch kiến thức, xem §1.4
  name: string //  'Bình phương của một tổng'
  statement: string //  phát biểu, dạng KaTeX: '(a+b)^2 = a^2 + 2ab + b^2'
  conditions?: string //  điều kiện áp dụng, vd 'a ≥ 0' — RẤT quan trọng, hay bị bỏ sót
  prerequisites: string[] //  id các Formula phải biết trước → dựng được đồ thị lộ trình
  srsEligible: boolean //  có đưa vào SRS công thức không (định nghĩa thì không, công thức thì có)
}
```

> `prerequisites` là thứ biến danh sách phẳng thành **lộ trình học thật**: app tự biết muốn học
> "phương trình bậc hai" thì phải xong "căn bậc hai" + "hằng đẳng thức" trước.

### 1.2 `ProblemTemplate` — khuôn sinh đề (đơn vị LUYỆN TẬP)

Gắn với ≥1 `Formula`. Cấu trúc chi tiết đã đặc tả ở GĐ2 §3.2 — không lặp lại ở đây. Điểm bắt
buộc: **đề tự soạn 100%**, tham số sinh ngẫu nhiên trong khoảng hợp lệ, đáp án tính từ đúng bộ
tham số vừa sinh (một nguồn sự thật duy nhất).

### 1.3 `Lesson` — bài giảng ngắn (đơn vị DẠY)

Gồm: dẫn nhập → phát biểu công thức → 2-3 ví dụ mẫu có lời giải từng bước → liên kết tới các
`ProblemTemplate` để luyện. **Ví dụ mẫu do người soạn/duyệt, không sinh tự động** (rủi ro sai
kiến thức, §0.3).

### 1.4 Mạch kiến thức (`Strand`) — theo GDPT 2018

Chương trình GDPT 2018 môn Toán tổ chức theo **3 mạch xuyên suốt** (cấu trúc tuyến tính kết hợp
"đồng tâm xoáy ốc"):

| Mã     | Mạch                                  |
| ------ | ------------------------------------- |
| `SO`   | Số, Đại số và Một số yếu tố giải tích |
| `HINH` | Hình học và Đo lường                  |
| `TK`   | Thống kê và Xác suất                  |

---

## 2. MẦM NON (3-6 tuổi) — làm quen, KHÔNG phải "Toán"

> ⚠️ Cấp này **không có công thức nào**. Đây là **làm quen với toán** (số lượng, hình dạng, so
> sánh), theo Chương trình Giáo dục Mầm non (văn bản riêng, không thuộc GDPT 2018 phổ thông).
> Vì vậy đợt 2c trong đặc tả GĐ2 được đánh dấu là **thiết kế riêng, không tái dùng khung luyện
> tập của các cấp trên** — trẻ chưa đọc viết thạo, không nhập được đáp số.

Kỹ năng (thay cho "công thức"), chia theo độ tuổi:

| Độ tuổi | Kỹ năng                                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 3-4     | Đếm 1-5 · nhận biết hình tròn/vuông · so sánh to-nhỏ, nhiều-ít · ghép đôi tương ứng 1-1                                                  |
| 4-5     | Đếm 1-10 · nhận biết hình tam giác/chữ nhật · so sánh dài-ngắn, cao-thấp · xếp thứ tự 3 đối tượng                                        |
| 5-6     | Đếm 1-20, nhận mặt chữ số · tách-gộp nhóm trong phạm vi 10 · nhận biết khối cầu/trụ/vuông · định hướng không gian (trên-dưới, trước-sau) |

**Hệ quả kỹ thuật:** tương tác phải là **chạm / kéo-thả / chọn hình / giọng nói**, không có ô nhập
đáp án. Chấm = so khớp lựa chọn, không cần thuật toán chuẩn hoá biểu thức.

---

## 3. CẤP 1 — TIỂU HỌC (lớp 1-5)

> Đặc điểm: rất ít "công thức" theo nghĩa ký hiệu; chủ yếu là **quy tắc tính** và **thuật toán
> đặt tính**. Hầu như **không cần KaTeX** (trừ phân số lớp 4-5) → nhẹ hơn cấp 2/3 nhiều.
>
> ✅ **§3 ĐÃ ĐỐI CHIẾU SGK THẬT ngày 2026-08-01 (đợt 2b)** — nguồn: 10 thư mục ảnh scan bộ "Kết
> nối tri thức" (Toán 1-5, mỗi lớp 2 tập) trong `tai-lieu-sgk/SGK-Toan/`, trích mục lục bằng OCR.
> Mục lục đầy đủ: `docs/research/muc-luc-sgk/toan-1..5.md`. Ký hiệu `[✓] [≠] [+] [−]` theo
> `huong-dan-doi-chieu-sgk.md` §Bước 2; toàn bộ thay đổi liệt kê ở **§8.4 Nhật ký đối chiếu —
> phần tiểu học**. SGK tiểu học chia theo **chủ đề** (số 1, 2, 3…) thay vì "chương".

### Lớp 1

_(10 chủ đề · 41 bài + "Tiết học đầu tiên")_

| Mạch | Nội dung                                                                                                                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` Số 0-10 rồi 0-100 · `[✓]` cộng, trừ trong phạm vi 10 rồi phạm vi 100 (**không nhớ**) · `[✓]` so sánh `>`, `<`, `=` · `[+]` tách/gộp số ("mấy và mấy")                                                                                                                       |
| HINH | `[✓]` hình vuông, tròn, tam giác, chữ nhật · `[≠]` đo độ dài bằng **xăng-ti-mét thật** (không dừng ở đơn vị tự quy ước), có ước lượng · `[+]` **khối lập phương, khối hộp chữ nhật; vị trí, định hướng trong không gian** · `[+]` **xem giờ đúng, các ngày trong tuần, xem lịch** |
| TK   | `[✓]` (chưa có — xác nhận bằng mục lục thật)                                                                                                                                                                                                                                      |

### Lớp 2

_(14 chủ đề · 75 bài)_

| Mạch | Nội dung                                                                                                                                                                                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` số đến 1 000 · `[✓]` cộng trừ **có nhớ** (phạm vi 100 và 1 000) · `[+]` cộng, trừ **qua 10 trong phạm vi 20** (bảng cộng/bảng trừ qua 10) · `[≠]` **bảng nhân, bảng chia CHỈ 2 và 5** (không phải 2-5) · `[✓]` thừa số × thừa số = tích; số bị chia : số chia = thương · `[+]` tia số, số liền trước/liền sau · `[+]` **tiền Việt Nam** |
| HINH | `[✓]` điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng · `[+]` **đường gấp khúc, hình tứ giác** · `[+]` **khối trụ, khối cầu** · `[≠]` đơn vị đo: cm, dm, m **và ki-lô-mét**; kg; lít · `[≠]` thời gian dạy **ngày–giờ, giờ–phút, ngày–tháng** (không phải "giờ đúng, giờ rưỡi")                                                 |
| TK   | `[✓]` biểu đồ tranh · `[+]` **thu thập, phân loại, kiểm đếm số liệu** · `[+]` **XÁC SUẤT: "chắc chắn – có thể – không thể"** (mạch xác suất bắt đầu ngay từ lớp 2)                                                                                                                                                                            |

### Lớp 3

_(16 chủ đề · 81 bài)_

| Mạch | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` số đến 10 000 rồi 100 000 · `[≠]` bảng nhân/chia **3, 4** _và_ **6, 7, 8, 9** (kho cũ chỉ ghi 6-9) · `[✓]` nhân/chia số có nhiều chữ số cho số có 1 chữ số · `[✓]` **phép chia có dư** `a = b×q + r` (0 ≤ r < b) · `[+]` **một phần mấy** `1/n` · `[+]` **chữ số La Mã** · `[+]` **làm tròn số** đến hàng chục/trăm/nghìn/chục nghìn · `[+]` **biểu thức số & tính giá trị biểu thức** · `[+]` gấp/giảm một số lên/đi một số lần; so sánh số lớn gấp mấy lần số bé · `[+]` bài toán giải bằng hai bước tính |
| HINH | `[✓]` **chu vi HCN** `P = (a+b)×2` · `[✓]` **chu vi hình vuông** `P = a×4` · `[✓]` **diện tích HCN** `S = a×b` · `[✓]` **diện tích hình vuông** `S = a×a` · `[✓]` góc vuông, góc không vuông · `[+]` **chu vi hình tam giác, hình tứ giác** · `[+]` **khái niệm diện tích + xăng-ti-mét vuông** · `[+]` **điểm ở giữa, trung điểm đoạn thẳng** · `[+]` **hình tròn: tâm, bán kính, đường kính** (`d = 2r`) · `[+]` khối lập phương, khối hộp chữ nhật · `[+]` đơn vị **mm, gam, ml, độ C**                        |
| TK   | `[✓]` bảng số liệu (thu thập, phân loại, ghi chép) · `[−]` **biểu đồ tranh KHÔNG dạy ở lớp 3** (chỉ có ở lớp 2) · `[+]` **khả năng xảy ra của một sự kiện**                                                                                                                                                                                                                                                                                                                                                       |

### Lớp 4

_(13 chủ đề · 73 bài)_

| Mạch | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` số có nhiều chữ số, hàng và lớp (đến lớp triệu) · `[−]` **KHÔNG có "dấu hiệu chia hết cho 2, 3, 5, 9" ở lớp 4 KNTT** — chuyển sang lớp 6 (Toán 6 Bài 9) · `[+]` **số chẵn, số lẻ** · `[+]` **biểu thức chứa chữ** · `[+]` làm quen dãy số tự nhiên; làm tròn đến hàng trăm nghìn · `[+]` tính chất **giao hoán, kết hợp** (cộng & nhân), **phân phối** `a(b+c) = ab + ac` · `[+]` **tìm hai số biết tổng và hiệu** · `[≠]` **số trung bình cộng thuộc mạch SO** (chủ đề Phép nhân & phép chia), không thuộc TK · `[+]` bài toán rút về đơn vị · `[✓]` **phân số**: khái niệm, tính chất cơ bản, rút gọn, quy đồng, so sánh, cộng trừ nhân chia, tìm phân số của một số |
| HINH | `[−]` **KHÔNG có công thức diện tích hình bình hành `S = a×h` và hình thoi `S = (d₁×d₂)/2` ở lớp 4 KNTT** — Bài 31 chỉ nhận dạng; hai công thức này dạy ở lớp 6 (Toán 6 Bài 20) · `[✓]` hai đường thẳng vuông góc, song song · `[≠]` đơn vị đo diện tích là **dm², m², mm²** (cm² đã học ở lớp 3) · `[+]` **góc và đơn vị đo góc; góc nhọn, góc tù, góc bẹt** · `[+]` **yến, tạ, tấn; giây, thế kỉ**                                                                                                                                                                                                                                                                         |
| TK   | `[✓]` **biểu đồ cột** · `[+]` dãy số liệu thống kê · `[+]` **số lần xuất hiện của một sự kiện**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### Lớp 5

_(12 chủ đề · 75 bài)_

| Mạch | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **số thập phân**: khái niệm, so sánh, làm tròn, 4 phép tính, nhân/chia với 10; 100; 0,1; 0,01 · `[✓]` **tỉ số phần trăm** (tìm tỉ số % của hai số, tìm giá trị % của một số) · `[✓]` **toán chuyển động đều** `v = s/t`, `s = v×t`, `t = s/v` · `[+]` **phân số thập phân, hỗn số, cộng trừ hai phân số khác mẫu** · `[+]` **tỉ lệ bản đồ** · `[+]` tìm hai số biết tổng (hiệu) và tỉ số · `[+]` **máy tính cầm tay** · `[+]` **cộng, trừ, nhân, chia số đo thời gian**                                   |
| HINH | `[✓]` **diện tích tam giác** `S = (a×h)/2` · `[✓]` **diện tích hình thang** `S = ((a+b)×h)/2` · `[✓]` **chu vi hình tròn** `C = d×3,14` · `[✓]` **diện tích hình tròn** `S = r×r×3,14` · `[✓]` **thể tích HHCN** `V = a×b×c` · `[≠]` **thể tích hình lập phương viết `V = a×a×a`**, chưa dùng luỹ thừa `a³` (luỹ thừa vào lớp 6) · `[+]` **diện tích xung quanh & toàn phần HHCN và hình lập phương** · `[+]` **hình khai triển** của hình lập phương, HHCN, hình trụ · `[+]` **km², héc-ta**; **cm³, dm³, m³** |
| TK   | `[✓]` **biểu đồ hình quạt tròn** · `[≠]` phần "khả năng xảy ra của sự kiện" ở lớp 5 thực chất là **tỉ số của số lần lặp lại một sự kiện so với tổng số lần thực hiện** (tiền đề xác suất thực nghiệm lớp 6) · `[+]` thu thập, phân loại, sắp xếp số liệu                                                                                                                                                                                                                                                        |

---

## 4. CẤP 2 — THCS (lớp 6-9) — đợt 2a, làm TRƯỚC

> ✅ **§4 ĐÃ ĐỐI CHIẾU SGK THẬT ngày 2026-08-01** — nguồn: 8 file PDF bộ "Kết nối tri thức" (Toán
> 6-9, mỗi lớp 2 tập) trong `tai-lieu-sgk/`, trích mục lục bằng OCR. Mục lục đầy đủ:
> `docs/research/muc-luc-sgk/toan-6..9.md`. Ký hiệu `[✓] [≠] [+] [−]` theo
> `huong-dan-doi-chieu-sgk.md` §Bước 2; toàn bộ thay đổi liệt kê ở **§8 Nhật ký đối chiếu**.
>
> §3 (lớp 1-5) **ĐÃ đối chiếu ngày 2026-08-01** (đợt 2b — xem §8.4). §5 (lớp 10-12) **CHƯA đối
> chiếu** — chưa có SGK cấp đó trong `tai-lieu-sgk/`.

### Lớp 6

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` Số tự nhiên, luỹ thừa: `aᵐ · aⁿ = aᵐ⁺ⁿ`, `aᵐ : aⁿ = aᵐ⁻ⁿ` (m ≥ n, a ≠ 0) · `[✓]` **ƯCLN, BCNN** · `[✓]` **số nguyên** (quy tắc dấu, quy tắc dấu ngoặc) · `[✓]` **phân số** (tử/mẫu nguyên) · `[+]` **số thập phân** (âm, làm tròn & ước lượng) · `[+]` **tỉ số và tỉ số phần trăm** · `[+]` dấu hiệu chia hết, số nguyên tố |
| HINH | `[✓]` Hình học trực quan: tam giác đều, lục giác đều, hình thoi, hình bình hành, hình thang cân · `[✓]` điểm, đường thẳng, đoạn thẳng, trung điểm · `[✓]` góc và số đo góc · `[+]` **chu vi & diện tích các tứ giác đã học** · `[+]` **tính đối xứng** (trục đối xứng, tâm đối xứng) — cả một chương riêng (V)                    |
| TK   | `[✓]` Thu thập, phân loại dữ liệu · `[✓]` biểu đồ cột kép · `[✓]` xác suất thực nghiệm · `[+]` biểu đồ tranh, bảng thống kê                                                                                                                                                                                                       |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Số tự nhiên & phép tính · Phân số · Số nguyên _(giữ
nguyên — cả ba là chương I-III và VI của sách, đều ✅ chấm tự động)_

### Lớp 7

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **Số hữu tỉ** ℚ · `[✓]` luỹ thừa số hữu tỉ · `[✓]` **tỉ lệ thức** `a/b = c/d ⟺ ad = bc` · `[✓]` **dãy tỉ số bằng nhau** · `[✓]` đại lượng tỉ lệ thuận `y = kx`, tỉ lệ nghịch `y = a/x` · `[✓]` biểu thức đại số, đa thức một biến (cộng, trừ, nhân, chia) · `[+]` **số thực ℝ**: số thập phân vô hạn tuần hoàn, **số vô tỉ, căn bậc hai số học `√a`**, giá trị tuyệt đối                                                                                                              |
| HINH | `[✓]` Góc ở vị trí đặc biệt (kề bù, đối đỉnh), tia phân giác · `[✓]` tiên đề Euclid về đường thẳng song song · `[✓]` **tổng ba góc trong tam giác = 180°** · `[✓]` các trường hợp bằng nhau của tam giác · `[✓]` **quan hệ giữa góc và cạnh đối diện** · `[✓]` **bất đẳng thức tam giác** `\|b − c\| < a < b + c` · `[✓]` các đường đồng quy trong tam giác · `[+]` **hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác/tứ giác** (chương X — thể tích, diện tích xung quanh) |
| TK   | `[✓]` Biểu đồ đoạn thẳng, biểu đồ hình quạt tròn · `[✓]` biến cố, xác suất của biến cố · `[+]` thu thập và phân loại dữ liệu (bài mở đầu chương V)                                                                                                                                                                                                                                                                                                                                          |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Số hữu tỉ · Tỉ lệ thức & đại lượng tỉ lệ · Đa thức một
biến _(`[≠]` đổi "Biểu thức đại số đơn giản" → **Đa thức một biến**: chương VII của sách dành 5
bài cho đa thức một biến, chỉ 1 bài cho biểu thức đại số → đa thức mới là trọng tâm)_

### Lớp 8

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **7 hằng đẳng thức đáng nhớ** (xem §4.1) · `[✓]` phân tích đa thức thành nhân tử · `[✓]` phân thức đại số (4 phép tính) · `[✓]` **phương trình bậc nhất một ẩn** `ax + b = 0` (a ≠ 0) ⟹ `x = −b/a` · `[✓]` **hàm số bậc nhất** `y = ax + b`, hệ số góc `a` · `[+]` **đơn thức, đa thức nhiều biến** (chương I — 5 bài, nền cho hằng đẳng thức) · `[+]` giải bài toán bằng cách lập phương trình                                                                                       |
| HINH | `[✓]` **Định lý Pythagore** `a² + b² = c²` và định lý đảo (SGK đặt ở tập hai, trong chương IX Tam giác đồng dạng) · `[✓]` tứ giác: hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông · `[✓]` **định lý Thalès** trong tam giác · `[✓]` hình chóp tam giác/tứ giác đều · `[+]` **đường trung bình của tam giác**, **tính chất đường phân giác** (cùng chương IV với Thalès) · `[+]` **tam giác đồng dạng** (3 trường hợp đồng dạng, hình đồng dạng) — cả một chương riêng |
| TK   | `[✓]` Thu thập & phân tích dữ liệu · `[✓]` xác suất lý thuyết vs thực nghiệm · `[+]` `P(A) = n(A)/n(Ω)` — cách tính xác suất bằng tỉ số (bài riêng)                                                                                                                                                                                                                                                                                                                                         |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Hằng đẳng thức đáng nhớ · Phương trình bậc nhất một ẩn ·
Hàm số bậc nhất _(giữ nguyên — cả ba là chương II và VII của sách; chỉ đổi thứ tự để đúng trình tự
dạy: hằng đẳng thức ở tập một, phương trình/hàm số ở tập hai)_

#### 4.1 Bảy hằng đẳng thức đáng nhớ (lớp 8) — bản ghi mẫu đầy đủ

Đây là **ví dụ mẫu về độ chi tiết mà mọi mục khác cần đạt** khi soạn thật vào `data/`:

| #   | Tên                      | Phát biểu (KaTeX)                     |
| --- | ------------------------ | ------------------------------------- |
| 1   | Bình phương của một tổng | `(a+b)^2 = a^2 + 2ab + b^2`           |
| 2   | Bình phương của một hiệu | `(a-b)^2 = a^2 - 2ab + b^2`           |
| 3   | Hiệu hai bình phương     | `a^2 - b^2 = (a-b)(a+b)`              |
| 4   | Lập phương của một tổng  | `(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3` |
| 5   | Lập phương của một hiệu  | `(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3` |
| 6   | Tổng hai lập phương      | `a^3 + b^3 = (a+b)(a^2 - ab + b^2)`   |
| 7   | Hiệu hai lập phương      | `a^3 - b^3 = (a-b)(a^2 + ab + b^2)`   |

### Lớp 9

| Mạch | Công thức / kiến thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | `[✓]` **Căn bậc hai** `√(A²) = \|A\|`, `√(ab) = √a·√b` (a,b ≥ 0), `√(a/b) = √a/√b` (a ≥ 0, b > 0) · `[✓]` **hệ phương trình bậc nhất hai ẩn** (thế, cộng đại số) · `[✓]` **phương trình bậc hai** `ax² + bx + c = 0`: `Δ = b² − 4ac`, `x = (−b ± √Δ)/(2a)` · `[✓]` **định lý Viète** `x₁ + x₂ = −b/a`, `x₁·x₂ = c/a` (SGK dành hẳn 1 bài) · `[✓]` hàm số `y = ax²` (a ≠ 0) · `[+]` **căn bậc ba và căn thức bậc ba** · `[+]` **bất đẳng thức và bất phương trình bậc nhất một ẩn** (cả một chương — II) · `[+]` phương trình quy về bậc nhất (phương trình tích, chứa ẩn ở mẫu)                                                                                                                                                                                                                                                                                                                                                              |
| HINH | `[✓]` **Tỉ số lượng giác góc nhọn**: `sin α = đối/huyền`, `cos α = kề/huyền`, `tan α = đối/kề`, `cot α = kề/đối`; `sin²α + cos²α = 1` · `[✓]` **đường tròn**: `C = 2πR`, `S = πR²`; góc nội tiếp = ½ góc ở tâm cùng chắn cung · `[✓]` hình trụ, hình nón, hình cầu (`S_cầu = 4πR²`, `V_cầu = (4/3)πR³`) · `[+]` **hệ thức giữa cạnh và góc trong tam giác vuông** (Bài 12): cạnh góc vuông = cạnh huyền × sin góc đối = cạnh huyền × cos góc kề; cạnh góc vuông = cạnh góc vuông kia × tan góc đối = × cot góc kề · `[−]` **hệ thức về hình chiếu `h² = b'·c'`, `b² = a·b'`, `a·h = b·c`** — **ĐÃ BỎ**: xác nhận trên nội dung sách 2026-08-01, chương IV lớp 9 KNTT không dạy nhóm hệ thức này (xem §8) · `[+]` **độ dài cung, diện tích hình quạt tròn, hình vành khuyên** · `[+]` **vị trí tương đối** của đường thẳng–đường tròn và của hai đường tròn · `[+]` **tứ giác nội tiếp**, **đa giác đều**, đường tròn ngoại/nội tiếp tam giác |
| TK   | `[✓]` Bảng tần số, tần số tương đối · `[✓]` xác suất của biến cố · `[+]` **tần số & tần số tương đối GHÉP NHÓM** + biểu đồ tương ứng · `[+]` phép thử ngẫu nhiên, không gian mẫu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**3 chủ đề MVP đợt 2a (chốt theo SGK):** Căn bậc hai & căn bậc ba · Hệ phương trình bậc nhất hai ẩn ·
Phương trình bậc hai và định lí Viète _(giữ nguyên 3 chủ đề, mở rộng phạm vi cho khớp chương III và
chương VI của sách)_

---

## 5. CẤP 3 — THPT (lớp 10-12) — đợt 2d

> ⚠️ Cấp này kiến thức nặng, rủi ro sai nội dung cao nhất → yêu cầu duyệt chuyên môn kỹ hơn cấp
> dưới (đặc tả GĐ2 §7). Ngoài ra **không phải chủ đề nào cũng chấm tự động được** — phần chứng
> minh/khảo sát hàm số cần lời giải tự luận, nằm ngoài phạm vi MVP (§2.3 đặc tả GĐ2). Ở đợt 2d
> chỉ chọn chủ đề có **đáp số/biểu thức chấm được**.

> ✅ **ĐÃ ĐỐI CHIẾU SGK ngày 2026-08-03 (đợt 2d)** — xem nhật ký §8.5 và mục lục đầy đủ ở
> `docs/research/muc-luc-sgk/toan-10.md`, `toan-11.md`, `toan-12.md`.
>
> 🔴 **Ba điều phải nhớ ở cấp 3:**
>
> 1. **Số phức đã BỎ HOÀN TOÀN** khỏi chương trình 2018 (OCR toàn bộ 3 tập Toán 12: 0 kết quả).
> 2. **Mũ – lôgarit ở lớp 11**, không phải lớp 12. **Tổ hợp – xác suất cổ điển ở lớp 10**, không
>    phải lớp 11. **Xác suất có điều kiện ở lớp 12**, không phải lớp 11.
> 3. Mỗi lớp còn có **"Chuyên đề học tập"** riêng (`10-3`, `11-3`, `12-3`) — sách **TỰ CHỌN**,
>    KHÔNG bắt buộc. Bảng dưới đây **chỉ liệt kê nội dung SGK chính**; nội dung chuyên đề nằm ở
>    §5.1, không được trộn vào lộ trình chuẩn.

### Lớp 10

**SGK: 9 chương · 27 bài** (tập một chương I–V / Bài 1–14 · tập hai chương VI–IX / Bài 15–27).

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | Mệnh đề, tập hợp · bất phương trình & hệ bất phương trình bậc nhất hai ẩn · **hàm số, hàm số bậc hai** `y = ax²+bx+c` (đỉnh `(−b/2a; −Δ/4a)`) · **dấu tam thức bậc hai** · phương trình quy về bậc hai (chứa căn thức) · **nhị thức Newton** `(a+b)ⁿ = Σ Cₙᵏaⁿ⁻ᵏbᵏ` (SGK chính chỉ n = 4, 5)                                                                                                                                                                                                                                                                |
| HINH | **Giá trị lượng giác của góc từ 0° đến 180°** · **định lí cosin** `a² = b² + c² − 2bc·cos A` · **định lí sin** `a/sin A = b/sin B = c/sin C = 2R` · **diện tích tam giác**: `S = ½ab·sin C`, `S = abc/(4R)`, `S = pr`, **Heron** `S = √(p(p−a)(p−b)(p−c))` · **vectơ trong mặt phẳng** (tổng, hiệu, tích với một số, toạ độ, tích vô hướng `a⃗·b⃗ = \|a⃗\|·\|b⃗\|·cos θ`) · phương trình đường thẳng, khoảng cách `d(M,Δ) = \|ax₀+by₀+c\|/√(a²+b²)`, đường tròn `(x−a)²+(y−b)² = R²` · **ba đường conic** (elip, hypebol, parabol — phương trình chính tắc) |
| TK   | Số gần đúng, sai số · các số đặc trưng của **mẫu số liệu KHÔNG ghép nhóm**: xu thế trung tâm (trung bình, trung vị, tứ phân vị, mốt) và độ phân tán (khoảng biến thiên, khoảng tứ phân vị, phương sai, độ lệch chuẩn, giá trị ngoại lệ) · quy tắc đếm (cộng, nhân), hoán vị `Pₙ = n!`, chỉnh hợp `Aₙᵏ = n!/(n−k)!`, tổ hợp `Cₙᵏ = n!/(k!(n−k)!)` · **xác suất cổ điển `P(A) = n(A)/n(Ω)`**, `P(Ā) = 1 − P(A)`                                                                                                                                               |

### Lớp 11

**SGK: 9 chương · 33 bài** (tập một chương I–V / Bài 1–17 · tập hai chương VI–IX / Bài 18–33).

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SO   | **Lượng giác**: góc lượng giác & radian, công thức cộng, nhân đôi, hạ bậc, biến đổi tổng↔tích · hàm số lượng giác · phương trình lượng giác cơ bản · **dãy số, cấp số cộng** `uₙ = u₁ + (n−1)d`, `Sₙ = n(u₁+uₙ)/2` · **cấp số nhân** `uₙ = u₁·qⁿ⁻¹`, `Sₙ = u₁(1−qⁿ)/(1−q)` (q ≠ 1) · giới hạn dãy số/hàm số (kể cả **tổng cấp số nhân lùi vô hạn** `S = u₁/(1−q)`), hàm số liên tục · **luỹ thừa với số mũ thực, lôgarit** `log(ab) = log a + log b`, `log(a/b) = log a − log b`, `log aⁿ = n·log a`, đổi cơ số `log_b a = log_c a / log_c b` · **hàm số mũ & hàm số lôgarit**, phương trình và bất phương trình mũ – lôgarit · **đạo hàm**: định nghĩa & ý nghĩa, quy tắc `(uv)' = u'v + uv'`, `(u/v)' = (u'v − uv')/v²`, đạo hàm hàm hợp, bảng đạo hàm cơ bản, **đạo hàm cấp hai** |
| HINH | Quan hệ song song trong không gian (đường–mặt, hai mặt song song, **định lí Thalès trong không gian**, **phép chiếu song song**) · quan hệ vuông góc (**định lí ba đường vuông góc**, phép chiếu vuông góc) · **góc giữa đường thẳng và mặt phẳng**, **góc nhị diện** · khoảng cách (điểm–mặt, hai mặt song song, hai đường chéo nhau) · **thể tích khối lăng trụ** `V = S·h`, **khối chóp** `V = ⅓S·h`, khối chóp cụt đều                                                                                                                                                                                                                                                                                                                                                           |
| TK   | Các số đặc trưng đo **xu thế trung tâm của mẫu số liệu GHÉP NHÓM** (trung bình, trung vị, tứ phân vị, mốt) · biến cố hợp/giao/xung khắc/độc lập · **công thức cộng xác suất** `P(A∪B) = P(A) + P(B) − P(A∩B)` · **công thức nhân cho hai biến cố độc lập** `P(A∩B) = P(A)·P(B)`. ⚠️ **Xác suất có điều kiện KHÔNG ở lớp 11** — xem lớp 12.                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Lớp 12

**SGK: 6 chương · 19 bài** — lớp có ít bài nhất cấp THPT.

| Mạch | Công thức cốt lõi                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SO   | **Ứng dụng đạo hàm**: đơn điệu, cực trị, GTLN–GTNN, **tiệm cận ngang/đứng/xiên**, khảo sát & vẽ đồ thị (hàm bậc ba và hai dạng phân thức), bài toán tối ưu thực tiễn · **nguyên hàm, tích phân**: `∫xⁿdx = xⁿ⁺¹/(n+1) + C` (n ≠ −1), **Newton–Leibniz** `∫ₐᵇf(x)dx = F(b) − F(a)`; ứng dụng tính **diện tích hình phẳng**, **thể tích khối tròn xoay** `V = π∫ₐᵇf²(x)dx`. ⚠️ **Mũ – lôgarit KHÔNG ở lớp 12** — đã chuyển sang lớp 11. ⚠️ **KHÔNG có số phức.** |
| HINH | **Vectơ trong không gian** (phép toán, tích vô hướng) · **hệ trục toạ độ Oxyz**, biểu thức toạ độ `a⃗·b⃗ = a₁b₁ + a₂b₂ + a₃b₃` · **phương trình mặt phẳng** `Ax + By + Cz + D = 0` (dùng **tích có hướng** tìm vectơ pháp tuyến), khoảng cách từ điểm đến mặt phẳng · **phương trình đường thẳng** (tham số, chính tắc) · **công thức tính góc trong không gian** · **phương trình mặt cầu** `(x−a)² + (y−b)² + (z−c)² = R²`                                   |
| TK   | Các số đặc trưng đo **mức độ phân tán của mẫu số liệu GHÉP NHÓM**: khoảng biến thiên, khoảng tứ phân vị `Δ_Q = Q₃ − Q₁`, phương sai, độ lệch chuẩn · **xác suất có điều kiện** `P(A\|B) = P(A∩B)/P(B)` · **công thức xác suất toàn phần** và **công thức Bayes** (nội dung mới hoàn toàn so với chương trình cũ)                                                                                                                                               |

### 5.1 Chuyên đề học tập (TỰ CHỌN — KHÔNG bắt buộc)

Mỗi lớp 10, 11, 12 còn có một cuốn **"Chuyên đề học tập"** riêng, 35 tiết/năm, học sinh **chọn
theo định hướng nghề nghiệp**. ⚠️ **Không được đưa vào lộ trình chuẩn của app** — nếu trộn lẫn sẽ
ép học sinh học phần không bắt buộc. Xếp thành nhánh nâng cao tuỳ chọn.

| Lớp | Chuyên đề (số bài)                                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | CĐ1 Hệ phương trình bậc nhất **ba ẩn** (phương pháp Gauss) · CĐ2 **Phương pháp quy nạp toán học**, nhị thức Newton (n tổng quát) · CĐ3 Ba đường conic và ứng dụng — **8 bài**                                              |
| 11  | CĐ1 **Phép biến hình trong mặt phẳng** (tịnh tiến, đối xứng trục/tâm, quay, dời hình, vị tự, đồng dạng) · CĐ2 **Lí thuyết đồ thị** (Euler, Hamilton, đường đi tối ưu) · CĐ3 Một số yếu tố vẽ kĩ thuật — **12 bài**         |
| 12  | CĐ1 **Biến ngẫu nhiên rời rạc** (kì vọng, phương sai, **phân bố nhị thức**) · CĐ2 Bài toán tối ưu (**quy hoạch tuyến tính**, tối ưu bằng đạo hàm) · CĐ3 **Toán tài chính** (lãi đơn/lãi kép, tín dụng, đầu tư) — **7 bài** |

> Đáng chú ý: **phép biến hình** (tịnh tiến, quay, vị tự…) — vốn là nội dung bắt buộc lớp 11 của
> chương trình cũ — nay **chỉ còn ở chuyên đề tự chọn**. Tương tự, **phương pháp quy nạp toán học**
> và **kì vọng/phương sai của biến ngẫu nhiên** cũng đã rời khỏi phần bắt buộc.

---

## 6. Hệ quả cho kế hoạch GĐ2 — điều chỉnh đề xuất

Sau khi lập kho kiến thức, **thứ tự 4 đợt ở đặc tả GĐ2 §2.1 vẫn hợp lý**, và có thêm căn cứ kỹ
thuật cụ thể để giữ nguyên:

| Đợt | Cấp     | Độ khó KỸ THUẬT (không phải độ khó kiến thức)                                                                |
| --- | ------- | ------------------------------------------------------------------------------------------------------------ |
| 2a  | Cấp 2   | **Vừa** — cần KaTeX + chấm biểu thức, nhưng chủ đề gọn, chấm tự động rõ ràng → kiểm chứng kiến trúc tốt nhất |
| 2b  | Cấp 1   | **Dễ nhất** — hầu như không cần KaTeX, đáp án là số → tái dùng thẳng khung 2a, ít việc mới                   |
| 2c  | Mầm non | **Khó khác loại** — không có đáp số, phải làm UI chạm/kéo-thả/giọng nói riêng → cần đặc tả UX riêng          |
| 2d  | Cấp 3   | **Khó nhất** — nhiều chủ đề không chấm tự động được (chứng minh, khảo sát hàm), rủi ro sai nội dung cao nhất |

> Ghi chú quan trọng cho 2d: phải **lọc chủ đề chấm được** trước khi cam kết phạm vi — nếu ôm cả
> khảo sát hàm số/chứng minh hình không gian thì buộc phải dùng AI chấm tự luận, **vi phạm nguyên
> tắc "không để AI phán đúng/sai"** đã chốt. Đề xuất 2d chỉ nhận: giải phương trình/bất phương
> trình, tính đạo hàm/nguyên hàm/tích phân, tính toán vectơ-toạ độ, xác suất-tổ hợp — đều ra đáp
> số hoặc biểu thức chuẩn hoá được.

---

## 7. Việc tiếp theo

1. **Người có chuyên môn duyệt file này** (đối chiếu SGK/chương trình thật) — cổng bắt buộc §0.3.
2. Chốt danh sách chủ đề đợt 2a (§4, đã đề xuất sẵn 12 chủ đề).
3. Chuyển các mục ở §4 (cấp 2) thành bản ghi `Formula` có cấu trúc theo §1.1 — bắt đầu từ lớp 8
   (hằng đẳng thức, §4.1 đã có sẵn bảng đầy đủ làm mẫu).
4. Từ `Formula` mới viết `ProblemTemplate` (đề tự sinh) và `Lesson`.

> Các môn **Lý, Hoá** (định luật, phương trình phản ứng, bảng tuần hoàn) thuộc **GĐ3** theo kế
> hoạch tổng — sẽ có file kho kiến thức riêng, cùng cấu trúc file này, viết khi tới lượt. Không
> soạn trước để tránh phình phạm vi (rủi ro 🔴 cao đã ghi ở kế hoạch tổng §6).

---

## 8. Nhật ký đối chiếu SGK (2026-08-01)

**Phạm vi đã đối chiếu:** §4 — cấp 2, lớp 6-9 (§8.1-8.3, đợt 2a) **và** §3 — cấp 1, lớp 1-5
(§8.4, đợt 2b), bộ "Kết nối tri thức" (18 tập trong `tai-lieu-sgk/SGK-Toan/`, trích mục lục bằng
OCR tiếng Việt).
**[Cập nhật 2026-08-03 — đợt 2d]** Đã đối chiếu thêm **§5 — cấp 3, lớp 10-12** (nhật ký ở **§8.5**).
⇒ **Môn Toán nay đã đối chiếu ĐỦ lớp 1 → 12.**
**Chưa đối chiếu:** §2 (mầm non) — chưa có sách trong `tai-lieu-sgk/` (mầm non không có SGK).

> **§8.1 – §8.3 dưới đây CHỈ nói về cấp 2 (lớp 6-9).** Phần tiểu học nằm riêng ở **§8.4**.

> **Đợt đối chiếu lại — 2026-08-01 (bộ ảnh scan mới).** Nguồn tài liệu đã đổi từ 8 file PDF sang
> 8 thư mục ảnh PNG (`Toan 6-1/` … `Toan 9-2/`), OCR bằng `scripts/ocr-images.py` (thêm bước OCR
> riêng nửa trái/nửa phải ảnh để tách đúng mục lục trình bày 2 cột). Kết quả:
>
> - **Cả 4 lớp 6, 7, 8, 9 đều KHÔNG đổi cấu trúc chương/bài** so với lần đối chiếu trước → 4 file
>   `docs/research/muc-luc-sgk/toan-6..9.md` giữ nguyên bảng, chỉ thêm ghi chú xác nhận.
> - **Bản Toán 9 không còn là bản mẫu thẩm định** — bìa `Toan 9-1/page_0001.png` không còn
>   watermark "Bản mẫu"/"BanMau"; Toán 6 ghi "Tái bản lần thứ năm". 32 bài của Toán 9 trùng khít
>   bản mẫu cũ ⇒ bản in chính thức không đổi cấu trúc.
> - **Điểm nghi vấn §8.3 mục 1 (hệ thức lượng) đã giải quyết** — xem bảng §8.1 và §8.3.
> - **Thêm 1 mục lệch mới** (mục 25 ở §8.1): nhóm hệ thức **cạnh–góc** của Bài 12 mà kho kiến thức
>   trước đây không ghi. Ngoài mục này, không phát hiện thêm lệch nào so với 24 mục cũ.

### 8.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]`

| Lớp | Ký hiệu | Nội dung                                                                        | Đã làm gì                                                                                                                                                                                                                                                                                        |
| --- | ------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6   | `[+]`   | Số thập phân (âm), làm tròn & ước lượng                                         | Bổ sung vào mạch SO — SGK có hẳn chương VII                                                                                                                                                                                                                                                      |
| 6   | `[+]`   | Tỉ số và tỉ số phần trăm                                                        | Bổ sung vào mạch SO (Bài 31)                                                                                                                                                                                                                                                                     |
| 6   | `[+]`   | Dấu hiệu chia hết, số nguyên tố                                                 | Bổ sung vào mạch SO (chương II)                                                                                                                                                                                                                                                                  |
| 6   | `[+]`   | Chu vi & diện tích các tứ giác đã học                                           | Bổ sung vào mạch HINH (Bài 20)                                                                                                                                                                                                                                                                   |
| 6   | `[+]`   | Tính đối xứng (trục / tâm đối xứng)                                             | Bổ sung vào mạch HINH — SGK có hẳn chương V                                                                                                                                                                                                                                                      |
| 6   | `[+]`   | Biểu đồ tranh, bảng thống kê                                                    | Bổ sung vào mạch TK (Bài 39)                                                                                                                                                                                                                                                                     |
| 7   | `[+]`   | Số thực ℝ, số vô tỉ, **căn bậc hai số học `√a`**, số thập phân vô hạn tuần hoàn | Bổ sung vào mạch SO — chương II tập một. Kho cũ chỉ nhắc căn bậc hai ở lớp 9                                                                                                                                                                                                                     |
| 7   | `[+]`   | Hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng                          | Bổ sung vào mạch HINH — chương X tập hai                                                                                                                                                                                                                                                         |
| 7   | `[+]`   | Thu thập và phân loại dữ liệu                                                   | Bổ sung vào mạch TK (Bài 17)                                                                                                                                                                                                                                                                     |
| 7   | `[≠]`   | Chủ đề MVP "Biểu thức đại số đơn giản"                                          | **Đổi thành "Đa thức một biến"** — SGK dành 5 bài cho đa thức một biến, chỉ 1 bài cho biểu thức đại số                                                                                                                                                                                           |
| 8   | `[+]`   | Đơn thức, đa thức nhiều biến (chương I, 5 bài)                                  | Bổ sung vào mạch SO — là tiền đề của hằng đẳng thức                                                                                                                                                                                                                                              |
| 8   | `[+]`   | Giải bài toán bằng cách lập phương trình                                        | Bổ sung vào mạch SO (Bài 26)                                                                                                                                                                                                                                                                     |
| 8   | `[+]`   | Đường trung bình của tam giác; tính chất đường phân giác                        | Bổ sung vào mạch HINH — cùng chương IV với Thalès                                                                                                                                                                                                                                                |
| 8   | `[+]`   | Tam giác đồng dạng (3 trường hợp, hình đồng dạng)                               | Bổ sung vào mạch HINH — SGK có hẳn chương IX                                                                                                                                                                                                                                                     |
| 8   | `[+]`   | `P(A) = n(A)/n(Ω)` — tính xác suất bằng tỉ số                                   | Bổ sung vào mạch TK (Bài 31)                                                                                                                                                                                                                                                                     |
| 8   | `[≠]`   | Vị trí định lí Pythagore                                                        | Ghi rõ: SGK đặt ở **tập hai, chương IX (Tam giác đồng dạng)**, không nằm cùng chương tứ giác                                                                                                                                                                                                     |
| 9   | `[+]`   | Bất đẳng thức và **bất phương trình bậc nhất một ẩn**                           | Bổ sung vào mạch SO — SGK có hẳn chương II. Kho cũ **thiếu hoàn toàn** nội dung này ở mọi lớp cấp 2                                                                                                                                                                                              |
| 9   | `[+]`   | Căn bậc ba và căn thức bậc ba                                                   | Bổ sung vào mạch SO (Bài 10)                                                                                                                                                                                                                                                                     |
| 9   | `[+]`   | Phương trình quy về bậc nhất (phương trình tích, chứa ẩn ở mẫu)                 | Bổ sung vào mạch SO (Bài 4)                                                                                                                                                                                                                                                                      |
| 9   | `[+]`   | Độ dài cung tròn, diện tích hình quạt tròn & hình vành khuyên                   | Bổ sung vào mạch HINH (Bài 15)                                                                                                                                                                                                                                                                   |
| 9   | `[+]`   | Vị trí tương đối đường thẳng–đường tròn; hai đường tròn                         | Bổ sung vào mạch HINH (Bài 16-17)                                                                                                                                                                                                                                                                |
| 9   | `[+]`   | Tứ giác nội tiếp, đa giác đều, đường tròn ngoại/nội tiếp tam giác               | Bổ sung vào mạch HINH — chương IX tập hai                                                                                                                                                                                                                                                        |
| 9   | `[+]`   | Tần số & tần số tương đối **ghép nhóm**                                         | Bổ sung vào mạch TK (Bài 24)                                                                                                                                                                                                                                                                     |
| 9   | `[+]`   | Phép thử ngẫu nhiên, không gian mẫu                                             | Bổ sung vào mạch TK (Bài 25)                                                                                                                                                                                                                                                                     |
| 9   | `[−]`   | Hệ thức lượng `h² = b'·c'`, `b² = a·b'`, `a·h = b·c`                            | ✅ **Đã xác nhận trên nội dung sách (2026-08-01) — KHÔNG dạy ở lớp 9 KNTT.** Chương IV chỉ có Bài 11 (tỉ số lượng giác) và Bài 12 (hệ thức giữa cạnh và góc); đọc hết ảnh `Toan 9-1/page_0069.png` → `page_0081.png` không thấy nhóm hệ thức về hình chiếu. Bỏ khỏi mạch HINH lớp 9 (§8.3 mục 1) |

| 9 | `[+]` | Hệ thức giữa **cạnh và góc** trong tam giác vuông (Bài 12) | Bổ sung vào mạch HINH — phát hiện ở đợt đối chiếu lại 2026-08-01, đây mới là nhóm hệ thức thật sự được dạy ở chương IV lớp 9 (thay cho nhóm hệ thức hình chiếu đã bỏ ở dòng trên) |

**Tổng cộng: 25 mục** — `[+]` 22 · `[≠]` 2 · `[−]` 1 · phần còn lại `[✓]` giữ nguyên.
(24 mục ở đợt đối chiếu 2026-08-01 lần đầu + 1 mục bổ sung ở đợt đối chiếu lại với bộ ảnh scan mới.)

### 8.2 Kết luận cho các điểm ĐÃ ĐÁNH DẤU NGHI NGỜ (Bước 3 của quy trình)

| Chỗ nghi ngờ                                                       | Kết luận sau khi đọc mục lục thật                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thống kê & Xác suất dạy từ lớp mấy**                             | ✅ **Đã kết luận được.** Mạch TK có mặt ở **cả 4 lớp 6-9**, mỗi lớp ít nhất một chương riêng: L6 chương IX (dữ liệu + xác suất thực nghiệm) · L7 chương V (thu thập, biểu diễn) + chương VIII (biến cố, xác suất) · L8 chương V (dữ liệu, biểu đồ) + chương VIII (xác suất) · L9 chương VII (tần số) + chương VIII (xác suất). Kho kiến thức cũ ghi đúng mốc lớp, nhưng **ghi thiếu chi tiết** — đã bổ sung ở §8.1.                                                                                                                            |
| Nội dung **STEM / chuyển đổi số** mới                              | 🟡 **Chưa kết luận được — CẦN GIÁO VIÊN XÁC NHẬN.** Mục lục cho thấy mọi tập đều có "Hoạt động thực hành trải nghiệm" dùng **GeoGebra** (L6-L9) và **Excel** (L9 tập hai). Nhưng **không xác định được** phần nào là do Thông tư 17/2025 thêm vào — bộ ảnh scan mới (2026-08-01) là **ấn bản chính thức** (không còn watermark bản mẫu, Toán 6 "Tái bản lần thứ năm") nhưng vẫn không có bản đối chứng của SGK chỉnh sửa theo TT 17/2025 để so. **Không đoán.**                                                                                |
| **Hệ thức lượng trong tam giác vuông (lớp 9)**                     | ✅ **Đã kết luận được (2026-08-01, bộ ảnh scan mới).** Chương IV lớp 9 KNTT dạy **tỉ số lượng giác góc nhọn** (Bài 11) và **hệ thức giữa cạnh và góc** (Bài 12); đọc toàn bộ nội dung chương (`Toan 9-1/page_0069.png` → `page_0081.png`) **không thấy** nhóm hệ thức về hình chiếu `h² = b'·c'`, `b² = a·b'`, `a·h = b·c` ở bất kỳ khung kiến thức trọng tâm nào. Bài tập 4.15 tuy có dùng chân đường cao `H` với `HB`, `HC` nhưng hướng giải là tỉ số lượng giác, không phải hệ thức hình chiếu. ⇒ **Đã bỏ nhóm hệ thức này khỏi §4 lớp 9.** |
| `n = V/24` hay `V/22,4` · `g = 10` hay `9,8` · phân môn KHTN lớp 9 | Ngoài phạm vi phiên này (thuộc `kho-kien-thuc-hoa` / `kho-kien-thuc-ly`) — chưa có SGK KHTN trong `tai-lieu-sgk/`, **chưa đối chiếu**.                                                                                                                                                                                                                                                                                                                                                                                                         |

### 8.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN duyệt lần cuối

1. ~~**Hệ thức lượng trong tam giác vuông (lớp 9)**~~ — ✅ **ĐÃ GIẢI QUYẾT 2026-08-01**, không còn
   cần giáo viên duyệt. Bằng chứng: OCR toàn bộ chương IV trên bộ ảnh scan mới
   (`tai-lieu-sgk/SGK-Toan/Toan 9-1/page_0069.png` → `page_0081.png`) — chương chỉ gồm Bài 11
   (tỉ số lượng giác góc nhọn) và Bài 12 (hệ thức giữa cạnh và góc), **không dạy** `h² = b'·c'`,
   `b² = a·b'`, `a·h = b·c`. Kho kiến thức §4 lớp 9 đã bỏ nhóm hệ thức hình chiếu và bổ sung nhóm
   hệ thức cạnh–góc.
2. **Ảnh hưởng của Thông tư 17/2025 lên môn Toán** — 🟡 **VẪN CẦN XÁC NHẬN** (đã thu hẹp).
   Bộ ảnh scan mới (2026-08-01) là **ấn bản chính thức**, không còn watermark "Bản mẫu" như PDF
   cũ (Toán 6 ghi "Tái bản lần thứ năm"), và cấu trúc 32 bài của Toán 9 **trùng khít** bản mẫu
   thẩm định theo QĐ 1551/QĐ-BGDĐT 05/6/2023 ⇒ phần "bản mẫu có thể khác bản in" **đã loại trừ**.
   Còn lại: cần người có bản SGK **chỉnh sửa theo TT 17/2025** áp dụng từ năm học 2026-2027 xác
   nhận thứ tự chương/bài không đổi. **Không đoán.**
3. **Phân bố mạch TK lớp 8** — SGK chia làm hai chương ở hai tập (V và VIII); cần xác nhận thứ tự
   dạy thực tế trên lớp có theo đúng thứ tự sách không (ảnh hưởng `prerequisites`).
4. **Toán 7 — vị trí căn bậc hai số học.** SGK dạy `√a` ngay từ lớp 7 (Bài 6). Cần xác nhận mức độ
   sâu ở lớp 7 so với lớp 9 để đặt `prerequisites` đúng, tránh dạy trùng.
5. **Các bài ❌ (chứng minh hình học)** — Toán 7 chương IV, Toán 8 chương IX. Cần xác nhận việc
   **loại khỏi MVP** là chấp nhận được về mặt sư phạm (học sinh vẫn phải học phần này trên lớp).

---

## 8.4 Nhật ký đối chiếu SGK — PHẦN TIỂU HỌC (§3, lớp 1-5) · đợt 2b, 2026-08-01

**Phạm vi:** §3 — cấp 1, lớp 1-5, bộ "Kết nối tri thức với cuộc sống". Nguồn: 10 thư mục ảnh scan
`tai-lieu-sgk/SGK-Toan/1-1/ … 5-2/`, trích mục lục bằng OCR (`scripts/ocr-images.py`,
`scripts/ocr-crop.py`) và đọc trực tiếp trang mục lục khi OCR không tách được cột.
Mục lục đầy đủ: `docs/research/muc-luc-sgk/toan-1.md` … `toan-5.md`.

**Quy mô sách:** L1 10 chủ đề/41 bài · L2 14/75 · L3 16/81 · L4 13/73 · L5 12/75.
SGK tiểu học tổ chức theo **chủ đề** (đánh số liên tục qua hai tập), không dùng "chương".

### 8.4.1 Bảng thay đổi — tất cả mục `[≠]` `[+]` `[−]` (phần tiểu học)

| Lớp | Ký hiệu | Nội dung                                                                     | Đã làm gì                                                                                                 |
| --- | ------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | `[+]`   | Tách/gộp số trong phạm vi 10 ("mấy và mấy")                                  | Bổ sung mạch SO (Bài 5) — nền tảng của cộng/trừ qua 10 ở lớp 2                                            |
| 1   | `[≠]`   | Đo độ dài                                                                    | Sửa: lớp 1 đã dạy **xăng-ti-mét thật** + ước lượng (chủ đề 7), không dừng ở "đơn vị tự quy ước"           |
| 1   | `[+]`   | Khối lập phương, khối hộp chữ nhật; vị trí, định hướng trong không gian      | Bổ sung mạch HINH — SGK có hẳn chủ đề 4                                                                   |
| 1   | `[+]`   | Xem giờ đúng, các ngày trong tuần, xem lịch                                  | Bổ sung mạch HINH (chủ đề 9) — kho cũ xếp nhầm phần "xem đồng hồ" sang lớp 2                              |
| 2   | `[+]`   | Cộng, trừ **qua 10 trong phạm vi 20**; bảng cộng/bảng trừ qua 10             | Bổ sung mạch SO — SGK dành hẳn chủ đề 2                                                                   |
| 2   | `[≠]`   | **Bảng nhân, bảng chia ở lớp 2**                                             | Sửa "2-5" → **chỉ bảng 2 và bảng 5** (Bài 39, 40, 43, 44). Bảng 3, 4 chuyển sang lớp 3                    |
| 2   | `[+]`   | Tia số; số liền trước, số liền sau                                           | Bổ sung mạch SO (Bài 2)                                                                                   |
| 2   | `[+]`   | Tiền Việt Nam                                                                | Bổ sung mạch SO (Bài 56)                                                                                  |
| 2   | `[+]`   | Đường gấp khúc; hình tứ giác                                                 | Bổ sung mạch HINH (Bài 26)                                                                                |
| 2   | `[+]`   | Khối trụ, khối cầu                                                           | Bổ sung mạch HINH (chủ đề 9)                                                                              |
| 2   | `[≠]`   | Đơn vị đo độ dài lớp 2                                                       | Bổ sung **ki-lô-mét** vào danh sách cm, dm, m (Bài 55)                                                    |
| 2   | `[≠]`   | Nội dung thời gian lớp 2                                                     | Sửa "giờ đúng, giờ rưỡi" → **ngày–giờ, giờ–phút, ngày–tháng** (chủ đề 6)                                  |
| 2   | `[+]`   | Thu thập, phân loại, kiểm đếm số liệu                                        | Bổ sung mạch TK (Bài 64)                                                                                  |
| 2   | `[+]`   | **Xác suất: "chắc chắn – có thể – không thể"**                               | Bổ sung mạch TK (Bài 66) — **mốc bắt đầu thật của mạch xác suất trong CT 2018 là lớp 2**                  |
| 3   | `[≠]`   | Bảng nhân/chia ở lớp 3                                                       | Sửa "6-9" → **3, 4 và 6, 7, 8, 9** (Bài 5, 6 + chủ đề 2)                                                  |
| 3   | `[+]`   | **Một phần mấy** `1/n`                                                       | Bổ sung mạch SO (Bài 14) — tiền đề trực tiếp của phân số lớp 4                                            |
| 3   | `[+]`   | Chữ số La Mã                                                                 | Bổ sung mạch SO (Bài 47)                                                                                  |
| 3   | `[+]`   | Làm tròn số đến hàng chục, trăm, nghìn, chục nghìn                           | Bổ sung mạch SO (Bài 48, 61) — kho cũ để làm tròn tới tận lớp 6                                           |
| 3   | `[+]`   | Biểu thức số & tính giá trị của biểu thức số                                 | Bổ sung mạch SO (Bài 38) — tiền đề của "thứ tự thực hiện phép tính" lớp 6                                 |
| 3   | `[+]`   | Gấp/giảm một số lên (đi) một số lần; so sánh số lớn gấp mấy lần số bé        | Bổ sung mạch SO (Bài 24, 27, 39)                                                                          |
| 3   | `[+]`   | Bài toán giải bằng hai bước tính                                             | Bổ sung mạch SO (Bài 28)                                                                                  |
| 3   | `[+]`   | Chu vi hình tam giác, hình tứ giác                                           | Bổ sung mạch HINH (Bài 50) — kho cũ chỉ có chu vi HCN và hình vuông                                       |
| 3   | `[+]`   | Khái niệm **diện tích của một hình** + **xăng-ti-mét vuông**                 | Bổ sung mạch HINH (Bài 51) — kho cũ để cm² tới lớp 4                                                      |
| 3   | `[+]`   | Điểm ở giữa, trung điểm của đoạn thẳng                                       | Bổ sung mạch HINH (Bài 16) — kho cũ để trung điểm tới lớp 6                                               |
| 3   | `[+]`   | Hình tròn: tâm, bán kính, đường kính (`d = 2r`)                              | Bổ sung mạch HINH (Bài 17)                                                                                |
| 3   | `[+]`   | Khối lập phương, khối hộp chữ nhật (đỉnh, cạnh, mặt)                         | Bổ sung mạch HINH (Bài 21)                                                                                |
| 3   | `[+]`   | Đơn vị mi-li-mét, gam, mi-li-lít, **độ C**                                   | Bổ sung mạch HINH (chủ đề 5) — nhiệt độ là nội dung kho cũ thiếu hoàn toàn ở mọi lớp tiểu học             |
| 3   | `[−]`   | Biểu đồ tranh ở lớp 3                                                        | **Bỏ** — biểu đồ tranh chỉ dạy ở **lớp 2** (Bài 65); lớp 3 dùng **bảng số liệu**                          |
| 3   | `[+]`   | Khả năng xảy ra của một sự kiện                                              | Bổ sung mạch TK (Bài 74)                                                                                  |
| 4   | `[−]`   | **Dấu hiệu chia hết cho 2, 3, 5, 9**                                         | **Bỏ khỏi lớp 4** — SGK Toán 4 KNTT không có bài này; nội dung dạy ở **lớp 6** (Toán 6 Bài 9)             |
| 4   | `[+]`   | Số chẵn, số lẻ                                                               | Bổ sung mạch SO (Bài 3) — đây mới là nội dung "chia hết" thật sự của lớp 4                                |
| 4   | `[+]`   | Biểu thức chứa chữ                                                           | Bổ sung mạch SO (Bài 4) — tiền đề của biểu thức đại số lớp 7                                              |
| 4   | `[+]`   | Làm quen dãy số tự nhiên; làm tròn đến hàng trăm nghìn                       | Bổ sung mạch SO (Bài 13, 15)                                                                              |
| 4   | `[+]`   | Tính chất **giao hoán, kết hợp** (cộng & nhân), **phân phối** `a(b+c)=ab+ac` | Bổ sung mạch SO (Bài 24, 40, 42) — kho cũ chỉ ghi các tính chất này ở lớp 6                               |
| 4   | `[+]`   | Tìm hai số biết tổng và hiệu của hai số đó                                   | Bổ sung mạch SO (Bài 25)                                                                                  |
| 4   | `[≠]`   | **Số trung bình cộng**                                                       | Chuyển từ mạch TK sang **mạch SO** — SGK đặt ở Bài 46, chủ đề "Phép nhân và phép chia"                    |
| 4   | `[+]`   | Bài toán liên quan đến rút về đơn vị                                         | Bổ sung mạch SO (Bài 47)                                                                                  |
| 4   | `[−]`   | **Diện tích hình bình hành `S = a×h`, hình thoi `S = (d₁×d₂)/2`**            | **Bỏ khỏi lớp 4** — Bài 31 chỉ nhận dạng hình; hai công thức dạy ở **lớp 6** (Toán 6 Bài 20)              |
| 4   | `[≠]`   | Đơn vị đo diện tích lớp 4                                                    | Sửa "cm², m²" → **dm², m², mm²** (Bài 18); cm² đã học từ **lớp 3**                                        |
| 4   | `[+]`   | **Góc và đơn vị đo góc; góc nhọn, góc tù, góc bẹt**                          | Bổ sung mạch HINH — SGK có hẳn chủ đề 2; kho cũ để phần góc tới lớp 6                                     |
| 4   | `[+]`   | Yến, tạ, tấn; giây, thế kỉ                                                   | Bổ sung mạch HINH (Bài 17, 19)                                                                            |
| 4   | `[+]`   | Dãy số liệu thống kê                                                         | Bổ sung mạch TK (Bài 49)                                                                                  |
| 4   | `[+]`   | Số lần xuất hiện của một sự kiện                                             | Bổ sung mạch TK (Bài 51)                                                                                  |
| 5   | `[+]`   | Phân số thập phân; hỗn số; cộng, trừ hai phân số khác mẫu số                 | Bổ sung mạch SO (chủ đề 1) — kho cũ coi phân số kết thúc ở lớp 4                                          |
| 5   | `[+]`   | Tỉ lệ bản đồ và ứng dụng                                                     | Bổ sung mạch SO (Bài 37)                                                                                  |
| 5   | `[+]`   | Tìm hai số khi biết tổng (hiệu) và tỉ số của hai số đó                       | Bổ sung mạch SO (Bài 38, 39)                                                                              |
| 5   | `[+]`   | Máy tính cầm tay                                                             | Bổ sung mạch SO (Bài 42, 43) — phần "chuyển đổi số" đã có sẵn ở tiểu học                                  |
| 5   | `[+]`   | Cộng, trừ, nhân, chia **số đo thời gian**                                    | Bổ sung mạch SO (Bài 57, 58) — tiền đề trực tiếp của toán chuyển động đều                                 |
| 5   | `[≠]`   | Thể tích hình lập phương                                                     | Sửa `V = a³` → **`V = a × a × a`** — tiểu học chưa dùng luỹ thừa (luỹ thừa vào lớp 6, Toán 6 Bài 6)       |
| 5   | `[+]`   | Diện tích **xung quanh & toàn phần** HHCN và hình lập phương                 | Bổ sung mạch HINH (Bài 50, 51) — kho cũ chỉ có thể tích                                                   |
| 5   | `[+]`   | Hình khai triển của hình lập phương, HHCN, hình trụ                          | Bổ sung mạch HINH (Bài 49)                                                                                |
| 5   | `[+]`   | Ki-lô-mét vuông, héc-ta; xăng-ti-mét khối, đề-xi-mét khối, mét khối          | Bổ sung mạch HINH (Bài 15, 46, 47)                                                                        |
| 5   | `[≠]`   | "Làm quen khả năng xảy ra của sự kiện" ở lớp 5                               | Sửa cho đúng tên nội dung: **tỉ số của số lần lặp lại một sự kiện so với tổng số lần thực hiện** (Bài 65) |
| 5   | `[+]`   | Thu thập, phân loại, sắp xếp các số liệu                                     | Bổ sung mạch TK (Bài 63)                                                                                  |

**Tổng cộng phần tiểu học: 54 mục** — `[+]` 42 · `[≠]` 9 · `[−]` 3 · phần còn lại `[✓]` giữ nguyên.
(Theo lớp: L1 4 · L2 10 · L3 15 · L4 14 · L5 11.)

Cộng cả hai đợt: **79 mục lệch** (25 ở cấp 2 §8.1 + 54 ở tiểu học §8.4.1).

### 8.4.2 Kết luận cho các điểm ĐÃ ĐÁNH DẤU NGHI NGỜ (phần tiểu học)

| Chỗ nghi ngờ                                      | Kết luận sau khi đọc mục lục thật                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thống kê & Xác suất dạy từ lớp mấy (tiểu học)** | ✅ **Đã kết luận.** Mạch TK **bắt đầu từ lớp 2** (chủ đề 13 "Làm quen với yếu tố thống kê, xác suất") và có mặt liên tục ở **lớp 2, 3, 4, 5**; **lớp 1 KHÔNG có**. Quan trọng: **yếu tố xác suất có ngay từ lớp 2** ("chắc chắn – có thể – không thể"), rồi lớp 3 (khả năng xảy ra), lớp 4 (số lần xuất hiện), lớp 5 (tỉ số số lần lặp lại). Kho cũ ghi đúng mốc lớp 1 (chưa có) nhưng **bỏ sót hoàn toàn nhánh xác suất ở lớp 2, 3, 4**. |
| **Thứ tự dạy 4 phép tính qua các lớp**            | ✅ **Đã kết luận.** Cộng/trừ phạm vi 10 → 100 (không nhớ) ở **lớp 1**; cộng/trừ **có nhớ** phạm vi 20, 100, 1 000 + **mở nhân/chia** (bảng 2, 5) ở **lớp 2**; bảng nhân/chia **3, 4, 6, 7, 8, 9** + chia có dư ở **lớp 3**; nhân/chia số có nhiều chữ số + các tính chất phép tính ở **lớp 4**. Kho cũ đặt bảng 3, 4 nhầm vào lớp 2.                                                                                                      |
| **Phạm vi số học theo lớp**                       | ✅ **Đã kết luận.** L1: 10 → 100 · L2: 1 000 · L3: 10 000 → 100 000 · L4: lớp triệu (số có nhiều chữ số) · L5: không mở rộng số tự nhiên nữa, chuyển sang số thập phân. Kho cũ ghi lớp 3 "đến 100 000" là đúng nhưng bỏ qua chặng trung gian 10 000.                                                                                                                                                                                      |
| **Thời điểm bắt đầu phân số / số thập phân**      | ✅ **Đã kết luận.** Mầm mống phân số là **"một phần mấy" ở lớp 3** (Bài 14); **phân số chính thức ở lớp 4** (chủ đề 10-12, gồm cả nhân/chia phân số); **số thập phân ở lớp 5** (chủ đề 2, 4); **hỗn số & phân số thập phân cũng ở lớp 5** (Bài 4, 7). Kho cũ đúng ở mốc lớp 4/lớp 5 nhưng thiếu bước đệm lớp 3 và thiếu hỗn số.                                                                                                           |
| Nội dung **STEM / chuyển đổi số** ở tiểu học      | 🟡 **Chưa kết luận được — CẦN GIÁO VIÊN XÁC NHẬN.** Mục lục cho thấy mỗi chủ đề đo lường đều có bài "Thực hành và trải nghiệm", và lớp 5 có **máy tính cầm tay** (Bài 42, 43). Nhưng **không xác định được** phần nào do Thông tư 17/2025 thêm vào — không có bản đối chứng SGK chỉnh sửa theo TT 17/2025. **Không đoán.**                                                                                                                |

### 8.4.3 Danh sách cần GIÁO VIÊN CHUYÊN MÔN duyệt lần cuối (phần tiểu học)

1. **Dấu hiệu chia hết cho 2, 3, 5, 9 — lớp 4 hay lớp 6?** Mục lục Toán 4 KNTT **không có** bài
   này (chỉ có "Số chẵn, số lẻ"), còn Toán 6 có hẳn Bài 9 "Dấu hiệu chia hết". Đã bỏ khỏi §3 lớp 4.
   Cần giáo viên xác nhận không có trường hợp dạy lồng trong bài luyện tập chung.
2. **Diện tích hình bình hành / hình thoi — lớp 4 hay lớp 6?** Toán 4 KNTT Bài 31 theo mục lục chỉ
   là "Hình bình hành, hình thoi"; công thức diện tích xuất hiện ở Toán 6 Bài 20. Đã bỏ khỏi §3
   lớp 4. **Đây là kết luận rút từ MỤC LỤC, chưa đọc hết nội dung bài** — cần giáo viên xác nhận.
3. **Ảnh hưởng của Thông tư 17/2025 lên môn Toán tiểu học** — 🟡 vẫn cần xác nhận, cùng lý do đã
   ghi ở §8.3 mục 2 (không có bản SGK chỉnh sửa theo TT 17/2025 để đối chứng).
4. **Ranh giới mạch của các bài đo lường.** File này xếp toàn bộ đo lường (độ dài, khối lượng,
   thời gian, tiền) vào mạch **HINH** theo cách gộp "Hình học và Đo lường" của CT 2018, riêng
   "tiền Việt Nam" và "số đo thời gian" (lớp 5) xếp vào **SO** vì bản chất là phép tính. Cần giáo
   viên xác nhận cách phân mạch này trước khi dựng `prerequisites`.
5. **Bài "Thực hành và trải nghiệm" (mọi lớp)** — đều gắn ❌ (không chấm tự động được). Cần xác
   nhận việc loại khỏi MVP là chấp nhận được về mặt sư phạm.

---
