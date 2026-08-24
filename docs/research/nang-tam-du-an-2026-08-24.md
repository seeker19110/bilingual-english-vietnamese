# Nghiên cứu: nâng tầm dự án DHCB (2026-08-24)

> **Loại tài liệu:** đề xuất — **ĐÃ ĐƯỢC CHỦ DỰ ÁN CHỐT 2026-08-24** (đáp án 4 câu hỏi ở §6).
> **Người viết:** phiên Claude Code, nhánh `claude/nang-tam-du-an-iiu2aj`.
> **Cách đọc:** §1 là số đo thật (không phải cảm tính), §2 là ba khoảng cách lớn nhất, §3 định nghĩa
> "nâng tầm" nghĩa là gì, §4 là lộ trình đề xuất, §5 nói rõ những gì **không** nên làm, §6 là câu hỏi chốt.

---

## 1. Chẩn đoán bằng số đo thật (đo ngày 2026-08-24)

Mọi con số dưới đây đo trực tiếp trên `main` tại thời điểm viết, không lấy lại từ tài liệu cũ:

| Chỉ số                               | Giá trị                                      | Lệnh đo                                      |
| ------------------------------------ | -------------------------------------------- | -------------------------------------------- |
| Dòng mã nguồn TS/TSX (không có test) | **145.404**                                  | `find apps packages -name "*.ts*"` + `wc -l` |
| File test                            | **401**                                      | `find … -name "*.test.ts*"`                  |
| Test case                            | 5.120 (theo lần chạy gần nhất, PR #650)      | `npm test`                                   |
| Route frontend                       | **80** (khai báo `path=`)                    | `grep -c 'path="' apps/dhcb/src/App.tsx`     |
| Trang thật                           | **50** file `.tsx` trong `pages/`            | `find apps/dhcb/src/pages -name "*.tsx"`     |
| Người dùng thật                      | **18** (số ghi nhận 2026-08-23, chưa đo lại) | —                                            |

**Con số đáng suy nghĩ nhất: ~8.000 dòng mã cho mỗi người dùng thật.** Đây không phải lời chê —
lõi sản phẩm (gia sư Anh⇄Việt 3 chế độ, CEFR A1–C2, SRS, thanh toán SePay, admin, backup kiểm chứng
hai chiều) là công trình tốt. Nhưng nó nói rõ: **nút thắt của dự án lúc này không nằm ở chỗ thiếu
tính năng.**

---

## 2. Ba khoảng cách lớn nhất

### 2.1. Bề rộng đã rất lớn, độ sâu chỉ có ở MỘT môn

Nền tảng khai báo 5 trụ (Learning · Career · Work · Startup · Life) + Companion. Đo thực tế:

- **Trụ Learning / môn English**: chín thật — lộ trình CEFR 6 cấp, 12.168 từ có nhãn CEFR, SRS,
  chấm điểm kiểu IELTS, TTS/STT thật, thư viện truyện nghe. Đây là sản phẩm.
- **4 trụ Career/Work/Startup/Life**: `apps/dhcb/src/pages/domains/` có **6.004 dòng giao diện**
  (Career 840 · Life 913 · LifeGraph 1.033 · Startup 925 · Work 930 …), nhưng phía server mỗi trụ
  chỉ có **2 chỗ chạm cơ sở dữ liệu** (`apps/server/src/api/domains/{career,work,startup,life}.ts`).
  Tỷ lệ giao diện/logic này là dấu hiệu kinh điển của **màn hình đẹp nhưng rỗng ruột bên dưới**.

### 2.2. Có chỗ giao diện đang **nói dối người dùng** (còn nguyên, chưa sửa)

Hai điểm này đã được nêu trong `de-xuat-nang-cap-cai-to-2026-08-23.md`; phiên này kiểm lại và
xác nhận **vẫn chưa được xử lý**:

1. **`apps/dhcb/src/pages/domains/life/LifeWheel.tsx:110`** — hàm `handleSaveAssessment()` chỉ gọi
   `toast.success('Đã lưu kết quả Đánh giá Bánh xe cuộc đời thành công! 🎉')` rồi kết thúc. **Không
   có một lệnh ghi nào** — không `fetch`, không API, không `localStorage`. Người dùng thấy chữ "Đã
   lưu thành công", tải lại trang là mất trắng.
2. **Sổ tay lỗi sai** (`apps/dhcb/src/lib/mistakes.ts`, 183 dòng) — lưu duy nhất vào `localStorage`
   theo khoá `et_mistakes_<uid>`. Grep toàn file: **0 lệnh `fetch`, 0 đường `/api/`**; grep toàn thư
   mục `postgres/`: **không có bảng nào tên `mistake`**. Đây là tài sản học tập riêng và giá trị
   nhất của từng người — đổi máy, xoá cache trình duyệt, hay dùng điện thoại thay máy tính là mất
   sạch, không có đường khôi phục.
3. **State trong bộ nhớ tiến trình** — còn 4 file API giữ `new Map` ở cấp module:
   `platform/agent-orchestrator.ts`, `platform/mesh-telemetry.ts`, `learning/stem-scratchpad.ts`,
   `learning/debate-arena.ts`. VPS đang chạy **PM2 cluster 3 instance**, nghĩa là 3 bản sao bộ nhớ
   riêng biệt: người dùng ghi ở instance 1, đọc lại có thể rơi vào instance 2 và thấy trống.

### 2.3. 80 route nhưng chỉ ~50 trang — mỗi trụ có tới 4 địa chỉ trùng nhau

Ví dụ đo được trong `App.tsx`: `/su-nghiep-cua-toi`, `/hoc-su-nghiep`, `/career`, `/su-nghiep` **cùng
render một component `<Career />`**, không có `<Navigate>` redirect, không có thẻ canonical riêng.
Mẫu này lặp cho cả 4 trụ (`work`, `startup`, `life`) và cho môn English (`/hoc-tieng-anh`,
`/tieng-anh`, `/english`), cho khu môn học (`/phong-hoc`, `/hoc-mon-hoc`, `/subjects`, `/mon-hoc`).

Hệ quả cụ thể, không phải lý thuyết: đây **đúng loại lỗi trùng nội dung mà dự án vừa mất công sửa ở
tầng domain** (PR #645 — apex và `www` cùng phục vụ một nội dung, phải thêm 301). Sửa xong ở tầng
domain nhưng tầng route trong ứng dụng vẫn còn nguyên vấn đề y hệt, chỉ khác quy mô: 1 trang giá trị
đang nằm ở 4 URL.

---

## 3. "Nâng tầm" nên hiểu là gì — ba cách hiểu, chỉ một cách đúng lúc này

**A. Nâng tầm HẠ TẦNG** (theo `ke-hoach-scale-30k-concurrent.md` và `lo-trinh-100k-200k-1trieu.md`:
PgBouncer, read-replica, BullMQ, Redis Cluster, sharding).
→ **Không khuyến nghị bây giờ.** Dự án có 993 dòng tài liệu bàn chuyện phục vụ 50.000–1.000.000
người, **chưa từng chạy một lần k6 nào**, trong khi thực tế là 18 người dùng. Hạ tầng hiện tại (3
vCPU, cluster 3 instance, Redis rate-limit) dư sức cho tới khoảng 1.000 người đồng thời. Đầu tư vào
đây lúc này là tối ưu cho một vấn đề chưa tồn tại.

**B. Nâng tầm SẢN PHẨM** — làm cho mọi thứ đang hiển thị trở thành thật, rồi khoét sâu một mũi nhọn
không ai bắt chước được.
→ **KHUYẾN NGHỊ.** Lý do ở §4.

**C. Nâng tầm PHẠM VI** — mở môn Toán/Lý/Hoá theo GĐ2/GĐ3 (kho kiến thức 4 môn đã soạn, đã đối chiếu
SGK thật, engine chấm `core-grading` đã viết xong 74 test).
→ **Chưa, cho tới khi B xong.** Nhưng phần chuẩn bị đã làm rất tốt và **không lãng phí** — nó nằm
sẵn chờ đúng thời điểm. Mở môn mới khi 4 trụ hiện có còn rỗng ruột sẽ nhân đôi đúng vấn đề §2.1.

> **Nguyên tắc đề xuất giữ xuyên suốt (kế thừa từ đề xuất 2026-08-23, nay xin nâng thành luật):**
> _Không thêm bất kỳ tính năng mới nào cho tới khi mọi tính năng đang hiển thị cho người dùng đều
> chạy thật — có lưu trữ bền, có đếm lượt, và đúng trong chế độ cluster._

---

## 4. Lộ trình đề xuất (phương án B) — ba đợt, mỗi đợt có cổng ra riêng

### Đợt 1 — "Không nói dối" (ưu tiên cao nhất, ước 3 PR)

Mục tiêu: **mọi nút bấm nói "đã lưu" thì phải lưu thật.** Đây là vấn đề chữ tín, không phải vấn đề
kỹ thuật — và nó rẻ.

- **PR 1.1 — Sổ tay lỗi sai lên server.** Thêm bảng Postgres + endpoint đồng bộ, giữ `localStorage`
  làm bộ đệm ngoại tuyến (không phá luồng đang chạy). Đây là dữ liệu quý nhất của người học và là
  món duy nhất trong danh sách này có nguy cơ **mất dữ liệu thật của người dùng thật**.
- **PR 1.2 — Bánh xe cuộc đời lưu thật**, hoặc — nếu chưa muốn làm — **gỡ nút "Lưu" đi**. Một trong
  hai, không được để nguyên trạng thái hiện tại.
- **PR 1.3 — 4 file API còn giữ `new Map`**: chuyển sang `platform.feature_state` (cơ chế đã có sẵn,
  migration 0058), hoặc ẩn tính năng khỏi giao diện nếu chưa ai dùng thật.

**Cổng ra:** grep toàn repo không còn `new Map` cấp module trong `apps/server/src/api/`; không còn
nút nào báo thành công mà không ghi gì.

### Đợt 2 — "Một mũi nhọn thật" (cần chủ dự án chọn, xem §6)

Chọn **đúng một** trong 4 trụ Career/Work/Startup/Life để làm sâu tới mức có người dùng thật quay
lại hằng tuần — giống cách môn English đã được làm. Ba trụ còn lại **ẩn khỏi điều hướng** (giữ code,
không xoá) cho tới khi trụ đầu tiên chứng minh được giá trị.
_(Chốt 2026-08-24: trụ được chọn là **CAREER**; riêng đề xuất "ẩn 3 trụ còn lại" chủ dự án quyết
**giữ nguyên**, không ẩn — xem §6.)_

Lý do phải chọn một: 4 trụ × 900 dòng giao diện đã có sẵn nhưng không trụ nào đủ sâu để giữ chân
người dùng. Chia đều nguồn lực cho 4 thứ dở còn tệ hơn dồn hết cho 1 thứ tốt.

**Cổng ra:** trụ được chọn có lưu trữ thật, có Companion tham gia được bằng dữ liệu thật của người
dùng, và có ít nhất 5 người dùng thật quay lại lần thứ hai.

**✅ [2026-08-24] Đợt 2 đã làm xong phần CODE** (cổng "5 người dùng quay lại" còn chờ đo thật):

- **Phòng Luyện Phỏng Vấn chạy AI thật.** Phát hiện khi khảo sát: `CareerInterview.tsx` là mô
  phỏng GIẢ HOÀN TOÀN — 3 câu hỏi cứng, `setTimeout(700)` giả vờ phân tích, rồi trả **điểm 8.5
  cứng** với nhận xét y hệt cho mọi câu trả lời của mọi người (gõ "abc" cũng được khen "cấu trúc
  rõ ràng theo mô hình STAR"). Đây đúng là "Live Voice giả lập" phiên bản Career. Nay câu hỏi
  sinh theo hồ sơ nghề nghiệp thật, câu trả lời được model thật chấm, có đếm lượt + hoàn lượt,
  và khi AI hỏng thì **nói thẳng** thay vì bịa điểm.
- **Bảng khoảng cách kỹ năng hết bịa "In Progress".** `analyzeCareerSkillGap` trước đây trả cứng
  `currentMastery: 'In Progress'`, `isFulfilled: false` cho **mọi** kỹ năng ngoài tiếng Anh — ai
  nhập mục tiêu gì cũng thấy y hệt một bảng vô nghĩa. Nay dùng thang **B1–B5** đã chốt ở đặc tả
  năng lực; tiếng Anh vẫn ưu tiên dữ liệu học thật, kỹ năng khác lấy bậc người dùng tự đánh giá,
  chưa đánh giá thì nói thật là chưa có dữ liệu.

### Đợt 3 — "Dọn nhà + kiểm chứng" (ước 2 PR)

- **PR 3.1 — Gom 80 route về ~50.** Mỗi trang giữ **một** URL chính thức (ưu tiên tiếng Việt, hợp
  với người dùng Việt), các URL còn lại đổi thành `<Navigate replace>` thay vì render trùng. Đây
  chính là bài học PR #645 áp dụng ở tầng ứng dụng.
- **PR 3.2 — Chạy k6 lần đầu tiên**, dù chỉ ở mức 200–500 người đồng thời. Mục đích không phải để
  scale, mà để **biết con số thật** — thay cho 993 dòng tài liệu đang dựa hoàn toàn vào ước lượng.

**✅ [2026-08-24] PR 3.1 đã làm xong.** ⚠️ **PR 3.2 chưa làm được trong phiên này** — xem §7.

---

## 5. Những gì đề xuất KHÔNG làm

- **Không** nâng React 18 / TypeScript 5.2 / Tailwind 3 / ESLint 8 (chính sách CLAUDE.md mục 6).
- **Không** đầu tư hạ tầng scale khi chưa vượt ~1.000 người đồng thời (§3.A).
- **Không** mở môn học mới trước khi xong Đợt 1 và Đợt 2 (§3.C).
- **Không** viết thêm đặc tả cho tính năng chưa có người dùng. Dự án hiện có nhiều tài liệu quy
  hoạch hơn là người dùng; thêm tài liệu lúc này làm vấn đề nặng thêm chứ không nhẹ đi.

---

## 6. Câu hỏi cần chủ dự án chốt — **ĐÃ CHỐT 2026-08-24**

1. **Có đồng ý phương án B** (nâng tầm sản phẩm) thay vì A (hạ tầng) hay C (thêm môn) không?
   → **✅ Đồng ý phương án B.**
2. **Chọn trụ nào cho Đợt 2?** → **✅ CAREER** là mũi nhọn.
3. **Ba trụ còn lại: ẩn khỏi điều hướng hay giữ nguyên?** → **✅ GIỮ NGUYÊN** (khác đề xuất ẩn —
   quyết định của chủ dự án; hệ quả: Work/Startup/Life vẫn hiển thị, nên các điểm "nói dối" ở
   chúng càng bắt buộc phải sửa trong Đợt 1, không được trì hoãn bằng cách ẩn đi).
4. **Bánh xe cuộc đời**: làm lưu thật hay gỡ nút "Lưu"? → **✅ LƯU THẬT.**

---

## 7. Nợ kỹ thuật đang chặn, cần xử lý song song (việc tay, AI không làm được)

Ba món này cần máy có khoá API thật / mạng thật / DB thật, đã ghi ở `PROGRESS.md` mục "Nợ kỹ
thuật còn mở":

1. **Model Gemini `gemini-3.6-flash` chưa được xác nhận hoạt động lần nào** (PR #647). Chạy trên VPS:
   `npm run eval:tutor -- --write-baseline`. Đây là lớp dự phòng thứ 3 của chat — hỏng âm thầm, chỉ
   lộ ra đúng lúc cần đến.
2. **Khoá gốc mã hoá dữ liệu người dùng (`USER_DATA_MASTER_KEY`) chưa chốt nơi cất.** Hạ tầng mã hoá
   đã viết xong và có 18 test, nhưng đang "ngủ". Lưu ý: bản dump PostgreSQL và backup trên Cloudflare
   R2 hiện **vẫn là văn bản thuần**.
3. **PR 3.2 (chạy k6 lần đầu) chưa làm được trong phiên sửa lỗi** — sandbox không có `k6` cài sẵn,
   không có `DATABASE_URL`/`REDIS_URL` thật, và không nối được tới VPS production. Kịch bản khởi
   điểm đã có sẵn (`scripts/load-test/k6-baseline.js`, 2 route nhẹ). **Việc cần làm trên VPS:**
   `k6 run scripts/load-test/k6-baseline.js` ở mức 200–500 VU trước, ghi lại p95/lỗi thật, rồi
   nới dần — đừng nhảy thẳng lên nghìn VU. Đây chính là điều kiện đóng PR 3.2 và đóng luôn cổng
   "biết con số thật" của Đợt 3.
