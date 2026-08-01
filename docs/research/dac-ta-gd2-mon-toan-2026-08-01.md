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

| Thành phần            | Hiện tại                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `apps/`                | `english/` (đủ tính năng), `hub/` (trang giới thiệu, tab "Toán" đang hiện "sắp ra mắt")                |
| `packages/`            | `core-auth`, `core-billing`, `core-ai`, `core-db`, `core-ui` — đã tách ở GĐ1                           |
| Đếm lượt               | `daily_usage`/`free_daily_credit` đã có cột `subject` (mặc định `'english'`, migration `0029`)        |
| Schema DB              | `core` (dùng chung) + `english` (dữ liệu học tiếng Anh, migration `0030`) — chưa có schema `math`      |
| Render công thức toán | **Chưa có** — chưa dùng KaTeX/MathJax ở đâu trong repo                                                 |
| Sinh đề có tham số     | **Chưa có** — chưa có cơ chế tương tự                                                                  |
| SRS                    | Đã có cho từ vựng tiếng Anh (`apps/english/src/lib/srs.ts`) — thuật toán chung tái dùng được, dữ liệu không |

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

| Đợt | Cấp học    | Phạm vi lớp/độ tuổi                          | Đặc điểm khác biệt cần lưu ý                                                                 |
| --- | ---------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2a  | Cấp 2 (THCS) | Lớp 6-9, 3 chủ đề/lớp (12 chủ đề — bảng §2.1a) | Đã có đặc tả kỹ thuật đầy đủ (KaTeX, sinh đề, chấm) — làm trước để kiểm chứng kiến trúc         |
| 2b  | Cấp 1 (Tiểu học) | Lớp 1-5, 2-3 chủ đề/lớp                     | Không cần KaTeX phức tạp (số học cơ bản); giao diện to, ít chữ, nhiều hình ảnh/màu; phụ huynh có thể là người dùng chính (theo dõi hộ con), không phải học sinh tự thao tác hết |
| 2c  | Mầm non    | 3-6 tuổi, không chia "lớp" mà chia theo kỹ năng (đếm số, nhận biết hình, so sánh lớn/bé) | **Khác hẳn cấu trúc "chấm đúng/sai"** — trẻ mầm non không đọc viết thạo, cần tương tác bằng giọng nói/chạm/kéo-thả, không phải nhập đáp số. Đây là thiết kế UI/UX RIÊNG, không tái dùng khung luyện tập của 2a/2b |
| 2d  | Cấp 3 (THPT) | Lớp 10-12, chủ đề chọn lọc chấm tự động được (đại số, lượng giác cơ bản) | Kiến thức khó hơn — rủi ro AI soạn nháp sai kiến thức cao hơn (§7), cần người có chuyên môn duyệt kỹ hơn cấp 2 |

> **Mầm non (2c) là đợt khác biệt lớn nhất kỹ thuật lẫn UX** — không phải "Toán nhưng dễ hơn" mà
> gần như một sản phẩm con riêng (tương tác giọng nói/chạm, không có "đáp số" theo nghĩa nhập
> liệu). Đề xuất làm **sau cùng** hoặc tách thành nhánh nghiên cứu UX riêng trước khi cam kết lịch
> — không đoán trước cách làm ở đặc tả này, sẽ viết đặc tả con riêng cho đợt 2c khi tới lượt.

### 2.1a Đợt 2a — 12 chủ đề cấp 2 (giữ nguyên bản gốc, đã chốt kỹ thuật)

Bám khung chương trình GDPT 2018 môn Toán THCS, ưu tiên chủ đề **chấm tự động được bằng đáp số/biểu thức** (loại các chủ đề cần chứng minh hình học dài dòng ở đợt này):

| Lớp | 3 chủ đề đợt 2a                                                            |
| --- | -------------------------------------------------------------------------- |
| 6   | Số tự nhiên & phép tính · Phân số · Số nguyên                             |
| 7   | Số hữu tỉ · Biểu thức đại số đơn giản · Tỉ lệ thức                        |
| 8   | Phương trình bậc nhất một ẩn · Hằng đẳng thức đáng nhớ · Hàm số bậc nhất  |
| 9   | Phương trình bậc hai · Hệ phương trình bậc nhất hai ẩn · Căn bậc hai      |

> Chốt danh sách này với người dùng trước khi viết template đề (§2.2) — có thể đổi thứ tự/chủ đề
> nếu người dùng có ưu tiên khác. Danh sách chủ đề của 2b/2c/2d **để ngỏ, chốt khi tới lượt từng
> đợt** — tránh soạn trước nội dung rồi phải sửa lại khi đợt 2a đúc kết bài học thật.

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
   + handler API cơ bản (`math-progress.ts` đọc/ghi tiến độ, dùng `validateAuth()`/`usage.ts` có
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

| Rủi ro                                                              | Mức    | Giảm thiểu                                                                                       |
| --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| Thuật toán chấm chuẩn hoá bỏ sót định dạng đáp án hợp lệ              | 🔴 cao | Bộ test ca biên bắt buộc ở PR-5 trước khi nhân rộng (PR-6); thu thập log đáp án bị chấm sai để vá   |
| Nội dung bài giảng sai kiến thức toán (AI soạn nháp có thể sai)        | 🔴 cao | Người dùng (hoặc người có chuyên môn) duyệt thủ công từng bài trước khi đưa vào `data/`, không tự động hoá bước này |
| Bàn phím nhập công thức trên mobile khó dùng, học sinh bỏ cuộc giữa chừng | 🟡 vừa | Test tay trên điện thoại thật trước PR-9 (bắt buộc theo CLAUDE.md mục "UI/frontend"), ưu tiên bàn phím số đơn giản hơn cú pháp LaTeX đầy đủ |
| 12 chủ đề chọn sai trọng tâm (không khớp nhu cầu thật)                | 🟢 thấp | PR-1 xin duyệt danh sách chủ đề trước khi viết code, dễ đổi hướng sớm với chi phí thấp             |

---

## 8. Việc tiếp theo ngay (nếu người dùng duyệt đặc tả này)

1. Xác nhận thứ tự 4 đợt ở §2.1 (đề xuất: 2a cấp 2 → 2b cấp 1 → 2c mầm non → 2d cấp 3) hoặc đổi lại.
2. Duyệt/chỉnh danh sách 12 chủ đề đợt 2a ở §2.1a.
3. Duyệt định dạng 1 bài học mẫu (PR-1) trước khi mở PR-2 (scaffold app).
4. Từ PR-2 trở đi: mỗi PR làm xong tự báo cáo theo mẫu KHUNG (báo cáo xác thực CLAUDE.md mục 10),
   xin xác nhận cổng trước khi mở PR tiếp theo — không dồn nhiều PR cùng lúc.
5. Sau khi đợt 2a đạt cổng ở §6: viết đặc tả con riêng cho đợt 2b (cấp 1) — không soạn trước ở
   đây vì cần dựa vào bài học kỹ thuật rút ra thật từ 2a.
