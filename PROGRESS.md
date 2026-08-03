# PROGRESS.md — Trạng thái dự án

> AI đọc file này để biết đang ở đâu. Chi tiết tính năng: `PROJECT.md`. Lịch sử đầy đủ từng PR:
> `git log`/PR đã merge trên GitHub — file này chỉ giữ **tóm tắt** + việc còn mở + quyết định lớn.
>
> **Nhịp làm việc theo giới hạn giờ (CLAUDE.md mục 3):** ≥ 70% usage → hoàn tất việc đang làm, tạo
> PR rồi DỪNG chờ duyệt. < 70% → sau khi PR merge, tự động tiếp tục mục kế tiếp.

## Giai đoạn hiện tại

GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
(https://en-vi.donghanhcungban.org — domain mặc định đổi từ `.com` sang `.org` ngày 2026-07-31, xem
`docs/doi-ten-mien-chinh-org.md`; `.com`/apex `.org` đều 301 redirect sang `www.donghanhcungban.org`).
Đã áp xong Lớp 1 (hàng rào: Prettier/ESLint/TS strict/husky/CI) và Lớp 2 (E2E Playwright + a11y AA
toàn site + coverage ratchet + bundle-size budget) của `docs/framework/AP-DUNG-vao-du-an-co-san.md`.
**Đã rời Supabase hoàn toàn (2026-07-19→20, Giai đoạn A→E) — xem
`docs/migration-thoat-ly-supabase.md`.** Không có việc code nào đang mở; còn vài thao tác THỦ CÔNG
trên VPS (xem "Cần làm tay").

## GĐ2 (nền tảng đa môn) — đang chuẩn bị nội dung & engine

**[2026-08-01] Đặc tả GĐ2 + kho kiến thức 4 môn + ENGINE CHẤM đã có code chạy.**

- **Phạm vi GĐ2 mở rộng theo yêu cầu người dùng:** không chỉ lớp 6-9 mà đủ **mầm non → cấp 3**.
  Vì đây đúng rủi ro 🔴 cao nhất của kế hoạch tổng ("phình phạm vi"), chia **4 đợt có cổng ra
  riêng**: 2a cấp 2 → 2b cấp 1 → 2c mầm non → 2d cấp 3. Đợt sau chỉ mở khi đợt trước đạt cổng.
  Đặc tả: `docs/research/dac-ta-gd2-mon-toan-2026-08-01.md` (9 PR cho đợt 2a).
- **Kho kiến thức 4 môn** (bám GDPT 2018, chưa duyệt chuyên môn — **cổng bắt buộc trước khi đưa
  vào `data/`**): `kho-kien-thuc-{toan,ly,hoa,sinh}-gdpt2018.md`.
- **SGK thống nhất toàn quốc từ năm học 2026-2027** — bộ "Kết nối tri thức với cuộc sống". Đổi
  giả định theo hướng TỐT hơn: trước phải viết trung lập giữa 3 bộ sách, nay bám được đúng thứ tự
  bài học sinh học trên lớp. AI **không tải được SGK** (proxy sandbox chặn `taphuan.nxbgd.vn` —
  `CONNECT tunnel failed 403`). Đối chiếu thực hiện ở **PHIÊN LOCAL** — PDF chép vào `tai-lieu-sgk/`
  (đã có trong `.gitignore`, không lọt lên GitHub). Quy trình: `docs/research/huong-dan-doi-chieu-sgk.md`.
  **✅ [2026-08-01] Đã đối chiếu xong Toán lớp 6-9 (PR #411, merged)** — PDF là ảnh scan không có
  text layer nên phải OCR (`tesseract-ocr` + gói tiếng Việt, script tái dùng ở `scripts/ocr-sgk.py`).
  Kết quả: mục lục thật 4 lớp ở `docs/research/muc-luc-sgk/toan-{6,7,8,9}.md`; đối chiếu với
  `kho-kien-thuc-toan-gdpt2018.md` phát hiện **24 mục lệch** (21 thiếu `[+]`, 2 sai vị trí `[≠]`,
  1 nghi vấn `[−]`, ghi ở §8 Nhật ký đối chiếu của file đó) — đáng chú ý nhất: thiếu hẳn chương
  bất đẳng thức/bất phương trình bậc nhất lớp 9, căn bậc hai dạy từ lớp 7 (không phải lớp 9), thiếu
  chương tam giác đồng dạng (L8) và đường tròn nội/ngoại tiếp (L9). 12 chủ đề đợt 2a đã chốt lại
  theo mục lục thật ở `dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a (trước đó là phỏng đoán).
  **✅ [2026-08-01, đợt đối chiếu LẠI] Người dùng thay bộ PDF cũ bằng bộ ẢNH SCAN ấn bản CHÍNH
  THỨC** (8 thư mục PNG `tai-lieu-sgk/SGK-Toan/Toan 6-1/` … `Toan 9-2/`, OCR bằng script mới
  `scripts/ocr-images.py`). Kết quả: **cả 4 lớp 6-9 KHÔNG đổi cấu trúc chương/bài** — 4 file mục
  lục giữ nguyên bảng, chỉ thêm ghi chú xác nhận. **Bản Toán 9 KHÔNG còn là bản mẫu thẩm định**
  (bìa không còn watermark "Bản mẫu"; Toán 6 ghi "Tái bản lần thứ năm") và 32 bài trùng khít bản
  mẫu cũ ⇒ nghi ngờ "bản mẫu có thể khác bản in chính thức" **đã loại trừ**. Số mục lệch: **24 →
  25** (thêm `[+]` hệ thức cạnh–góc lớp 9). Điểm cần giáo viên duyệt: **5 → 4** — điểm về **hệ
  thức lượng tam giác vuông** đã giải quyết dứt điểm: chương IV Toán 9 KNTT chỉ dạy tỉ số lượng
  giác + hệ thức cạnh–góc, **không dạy** `h² = b'·c'`, `b² = a·b'`, `a·h = b·c` (đã bỏ khỏi kho
  kiến thức). Còn treo: ảnh hưởng TT 17/2025, thứ tự dạy mạch TK lớp 8, độ sâu căn bậc hai lớp 7,
  việc loại các bài chứng minh hình học khỏi MVP.
  **✅ [2026-08-01] Đã đối chiếu xong KHTN 6-9** (ảnh scan `tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng
  `scripts/ocr-images.py`; mục lục 2 cột đọc thêm bằng script mới `scripts/ocr-crop.py`). Mục lục
  thật ở `docs/research/muc-luc-sgk/khtn-{6,7,8,9}.md` — **có thêm cột `Branch`** (LÝ/HOÁ/SINH/
  chung) so với mẫu Toán, vì KHTN là **một sách tích hợp**. Quy mô: L6 10 chương/55 bài · L7 10
  chương/42 bài · L8 8 chương/47 bài · L9 14 chương/51 bài.
  **Số mục lệch phát hiện:** Hoá **15** (`[+]`5 `[≠]`7 `[−]`3) · Lý **18** (`[+]`8 `[≠]`6 `[−]`4)
  · Sinh **15** (`[+]`10 `[≠]`5 `[−]`0) — ghi ở mục "Nhật ký đối chiếu" cuối mỗi file kho kiến thức.
  **Hai điểm nghi ngờ then chốt đều đã XÁC MINH trên nội dung bài học (không chỉ mục lục):**
  - 🔴 **`n = V/24` là SAI, `n = V/22,4` cũng sai — SGK KHTN 8 dùng `n = V(L)/24,79 (L/mol)`**
    ở điều kiện chuẩn **1 bar, 25 °C** (khung Mục tiêu Bài 3, `SGK-KHTN/8/page_0017.png`). Dùng 24
    lệch **≈3,3%**, **vượt ngưỡng dung sai 1% thật của môn Hoá** (`chemistry: 1%` trong
    `DEFAULT_TOLERANCE_BY_SUBJECT`, không phải 3% — đó là ngưỡng riêng của Lý) ⇒ đã xử lý:
    **✅ [2026-08-01] `STANDARD_MOLAR_VOLUME_L_PER_MOL = 24.79` đã thêm vào
    `packages/core-grading/chemistry.ts`** kèm test canh gác (`grading.test.ts`) chứng minh dùng
    nhầm 24 hoặc 22,4 sẽ bị chấm sai (lệch 3,3%/10,7%, vượt dung sai 1%). Chưa có logic mol↔thể
    tích khí thật trong engine — hằng số này chỉ chờ sẵn cho khi PR-1 GĐ3 Hoá viết dạng bài đó.
  - **`g = 10` hay `9,8`: SGK dùng CẢ HAI, hai vai trò khác nhau** — Bảng 43.1 KHTN 6 nêu 1 kg có
    trọng lượng **9,8 N** (giá trị vật lí thật, để so Mặt Trăng/Hoả tinh), còn kết luận tính toán
    của Bài 43 ghi `P` (N) **gần bằng 10 lần** `m` (kg) ⇒ công thức làm bài là **`P ≈ 10·m`**.
    Ngưỡng dung sai 3% hiện có **vừa đủ nhưng sát mép**; khuyến nghị ghi rõ `g` trong đề.
  - **Bonus, xác nhận PA C là đúng:** KHTN 9 vẫn là MỘT cuốn tích hợp nhưng 14 chương gom thành 3
    khối liền mạch theo phân môn (I-V Lý → VI-X Hoá → XI-XIV Sinh) ⇒ môn cha `khtn` + cột `branch`
    diễn tả đủ, **không cần tách 3 môn riêng ở THCS**.
    **Lệch đáng chú ý khác:** Lý — **công & công suất KHÔNG dạy ở lớp 8** mà ở lớp 9 (Bài 4), kho cũ
    xếp nhầm; thiếu hẳn chương "Năng lượng cơ học" L9 và chương "Trái Đất và bầu trời" L6; bỏ lực
    điện từ/quy tắc bàn tay trái/máy ảnh-mắt (không có ở KNTT L9). Hoá — thiếu hẳn chương II lớp 7
    (phân tử, liên kết, **hoá trị & CTHH** — phần tính toán hoá học đầu tiên) và chương X lớp 9
    (khai thác tài nguyên vỏ Trái Đất, chu trình carbon); bỏ acetylene. Sinh — **0 mục `[−]`**, mọi
    nội dung đã ghi đều có thật, chỉ ghi quá sơ lược; đổi thuật ngữ **ADN/ARN → DNA/RNA**, `G = X`
    → `G = C`; **di truyền liên kết dạy ngay lớp 9** (kho cũ xếp lớp 12).
    **Điểm cần giáo viên chuyên môn duyệt:** Hoá 4 · Lý 6 · Sinh 4 (chi tiết ở §6.3 / §6.3 / §5.3
    của từng file). Đáng chú ý: lực đẩy Archimedes & moment lực L8 định tính hay định lượng; công
    thức thấu kính `1/f = 1/d + 1/d'` L9; Joule–Lenz L9; ăn mòn kim loại L9 (Hoá).
    **Còn thiếu:** Toán 10-12 (đợt 2d), **THPT của Hoá và Sinh** (§3 của 2 file
    kho kiến thức vẫn là bản thảo chưa kiểm chứng) — sách CHƯA có trong `tai-lieu-sgk/`, chờ người
    dùng bổ sung. **Vật lí THPT và Toán 1-5 đã xong — xem hai mục ngay dưới.**
    **✅ [2026-08-01] Đã đối chiếu xong TOÁN 1-5 (TIỂU HỌC) — đợt 2b** — phần §3 của
    `kho-kien-thuc-toan-gdpt2018.md` trước đây chưa từng đối chiếu (đợt 2a chỉ làm lớp 6-9), nay đã
    kiểm chứng bằng ảnh scan `tai-lieu-sgk/SGK-Toan/1-1/ … 5-2/`. Mục lục thật ở
    `docs/research/muc-luc-sgk/toan-{1,2,3,4,5}.md`. SGK tiểu học tổ chức theo **chủ đề** (không
    dùng "chương"). Quy mô: **L1 10 chủ đề/41 bài · L2 14/75 · L3 16/81 · L4 13/73 · L5 12/75**
    (tổng 65 chủ đề / 345 bài).
    **Số mục lệch phần tiểu học: 54** (`[+]`42 · `[≠]`9 · `[−]`3) — ghi ở §8.4 của file kho kiến
    thức Toán, tách rõ khỏi 25 mục của cấp 2 (§8.1). Tổng toàn file: **79 mục lệch**.
    **Bốn phát hiện quan trọng (kho kiến thức trước đây ghi sai):**
  - 🔴 **Dấu hiệu chia hết cho 2, 3, 5, 9 KHÔNG dạy ở lớp 4** (Toán 4 KNTT chỉ có "Số chẵn, số lẻ")
    — nội dung này ở **lớp 6** (Toán 6 Bài 9). Đã bỏ khỏi §3 lớp 4.
  - 🔴 **Diện tích hình bình hành `S = a×h` và hình thoi `S = (d₁×d₂)/2` KHÔNG dạy ở lớp 4** — Bài 31
    chỉ nhận dạng hình; hai công thức ở **lớp 6** (Toán 6 Bài 20). Đã bỏ khỏi §3 lớp 4.
  - **Mạch TK bắt đầu từ LỚP 2, và có yếu tố XÁC SUẤT ngay từ lớp 2** ("chắc chắn – có thể – không
    thể"), rồi liên tục L3 (khả năng xảy ra), L4 (số lần xuất hiện), L5 (tỉ số số lần lặp lại →
    tiền đề xác suất thực nghiệm L6). Lớp 1 không có. Kho cũ bỏ sót hoàn toàn nhánh xác suất tiểu học.
  - **Bảng nhân/chia: lớp 2 CHỈ có bảng 2 và 5**; bảng 3, 4 nằm ở **lớp 3** cùng 6, 7, 8, 9 (kho cũ
    ghi "2-5" ở lớp 2 và "6-9" ở lớp 3 — sai cả hai).
    Lệch đáng chú ý khác: lớp 1 đã có hình khối + xem giờ/lịch; lớp 3 đã có làm tròn số, chữ số La
    Mã, biểu thức số, trung điểm đoạn thẳng, cm², nhiệt độ °C; lớp 4 đã có góc & đơn vị đo góc và
    các tính chất giao hoán/kết hợp/phân phối; lớp 5 có thêm hỗn số, phân số thập phân, diện tích
    xung quanh/toàn phần hình khối, số đo thời gian, máy tính cầm tay; **biểu đồ tranh chỉ ở lớp 2**
    (kho cũ ghi cả lớp 3); **số trung bình cộng thuộc mạch SO** chứ không phải TK.
    **Điểm cần giáo viên Toán duyệt — thêm 5 mục cho tiểu học** (§8.4.3): hai kết luận `[−]` ở trên
    rút từ **mục lục**, chưa đọc hết nội dung bài; ảnh hưởng TT 17/2025; cách phân mạch các bài đo
    lường (HINH hay SO); và việc loại toàn bộ bài "Thực hành và trải nghiệm" khỏi MVP.
    **✅ [2026-08-01] Đã đối chiếu xong VẬT LÍ 10-12 (THPT)** — phần §3 của
    `kho-kien-thuc-ly-gdpt2018.md` trước đây chưa từng đối chiếu, nay đã kiểm chứng bằng ảnh scan
    `tai-lieu-sgk/SGK-Ly/10..12/` (mục lục 2 cột, OCR bằng `scripts/ocr-crop.py`). Mục lục thật ở
    `docs/research/muc-luc-sgk/ly-{10,11,12}.md`. Quy mô: **L10 7 chương/34 bài · L11 4 chương/26 bài
    · L12 4 chương/25 bài** (tổng 15 chương / 85 bài).
    **Số mục lệch phần THPT: 17** (`[+]`13 · `[≠]`2 · `[−]`2) — ghi ở §6.4 của file kho kiến thức Lý,
    tách rõ khỏi 18 mục của cấp 2 (§6.1). Tổng toàn file: **35 mục lệch**.
    **Bốn kết luận cấu trúc quan trọng (khác chương trình cũ):**
  - **Nhiệt học + khí lí tưởng nằm ở LỚP 12**, Vật lí 10 hoàn toàn không có nhiệt học.
  - **Từ trường + cảm ứng điện từ nằm ở LỚP 12**, không phải lớp 11.
  - **Đã bỏ hẳn:** dòng điện xoay chiều/mạch RLC, sóng ánh sáng, lượng tử ánh sáng, mẫu Bohr,
    thuyết tương đối; quang hình đã chuyển xuống KHTN 9.
  - **Công/công suất/cơ năng dạy ở CẢ hai cấp** (KHTN 9 và Vật lí 10 chương IV), khác độ sâu:
    lớp 10 thêm `cos α` trong `A = F·s·cos α`, thêm dạng `P = F·v`, và có **bài riêng** cho định
    luật bảo toàn cơ năng (Bài 26) lẫn **hiệu suất** (Bài 27). ⇒ **Không xoá nội dung cấp 2**, ghi
    rõ 2 layer. Điều này cũng chốt được nghi vấn "hiệu suất dạy ở đâu" còn treo từ đợt cấp 2.
  - **Định luật bảo toàn động lượng chỉ có ở Vật lí 10** (chương V), không có ở cấp 2.
    **Điểm cần giáo viên Lý duyệt — thêm 9 mục cho cấp 3** (§6.5). Đáng chú ý: giá trị `g` dùng
    trong bài tập cấp 3 (`9,8` hay `10` — ảnh hưởng trực tiếp ngưỡng dung sai 3% của engine chấm);
    **lực Lorentz** có còn trong chương trình không (mục lục Vật lí 12 không có bài nào); con lắc lò
    xo/con lắc đơn ở lớp 11 (chương I không có bài riêng); và **bảng đơn vị hệ SI đầu SGK Vật lí 10**
    cần bản đầy đủ chính xác để chuẩn hoá danh mục đơn vị hợp lệ của engine chấm (OCR bảng bị vỡ,
    chưa đủ tin cậy — **không đoán, không chép vào kho**).
- **Căn cứ pháp lý đã tra được (2026-08-01):** TT 32/2018 → sửa bởi TT 20/2021, TT 13/2022 và
  **TT 17/2025/TT-BGDĐT** (mới nhất); **QĐ 3588/QĐ-BGDĐT** (26/12/2025) chọn bộ "Kết nối tri thức
  với cuộc sống" dùng chung toàn quốc; SGK chỉnh sửa áp dụng từ năm học 2026-2027.
  ⚠️ **AI CHƯA đọc được nội dung chi tiết TT 17/2025** (`vanban.chinhphu.vn` cũng trả 403) nên
  **chưa biết môn Toán/KHTN bị sửa cụ thể những gì**. Bộ SGK Toán trong tay nay đã là **ấn bản
  chính thức** (không còn bản mẫu 2023), nhưng vẫn chưa có bản đối chứng của SGK chỉnh sửa theo
  TT 17/2025 — xem điểm cần giáo viên duyệt ở trên.
- **✅ `packages/core-grading` — ENGINE CHẤM DÙNG CHUNG, ĐÃ VIẾT XONG + 74 test** (99% câu lệnh,
  90,6% nhánh — cao hơn ngưỡng chung của repo vì chấm sai làm mất niềm tin người học ngay).
  Đặc tả: `docs/research/dac-ta-engine-cham-dung-chung.md`. Không có AI trong luồng chấm; hàm
  thuần, tất định, dùng chung cả client lẫn server.
  - Đơn vị mô hình hoá bằng **vector thứ nguyên SI** → phân biệt được `WRONG_UNIT` (tính đúng, ghi
    nhầm đơn vị) với `WRONG_DIMENSION` (hiểu sai đại lượng). Nhiệt độ có **độ lệch gốc** (°C→K).
  - Chuẩn hoá số **theo lối viết Việt Nam**: `0,5`, `1.000` = một nghìn, `1,5.10^3`.
  - So khớp biểu thức bằng **thăm dò số ngẫu nhiên seed cố định** thay vì CAS — nhẹ bundle, tất định.
  - **Cân bằng PTHH** kiểm bằng vector nguyên tố + điện tích + tối giản, nêu đích danh nguyên tố lệch.
  - **Bài học đo được bằng số:** ngưỡng dung sai môn Lý đặt 2% ở bản đặc tả đầu là SAI —
    `10/9,8 − 1 = 2,04%` nên sẽ chấm oan học sinh dùng `g = 10`. Đã nâng lên **3%**, có test canh
    gác chống đặt lại. Đúng lý do đặc tả bắt "đo bằng test thật, không đoán".
- **3 quyết định kiến trúc đã chốt (người dùng duyệt 2026-08-01):**
  1. **Mô hình `subject` cho KHTN: PA C** — môn cha `khtn` + cột `branch`
     (`physics`/`chemistry`/`biology`). Lý/Hoá/Sinh KHÔNG là môn riêng ở THCS mà nằm trong môn tích
     hợp KHTN, chỉ tách ở THPT → `subject` phẳng hiện tại không diễn tả được. **Thi hành khi bắt
     đầu GĐ3**, không migration sớm.
  2. **Thứ tự GĐ3: Hoá → Lý → Sinh** (không phải "Lý–Hoá" theo thói quen) — Hoá trước vì cân bằng
     PTHH chấm chính xác tuyệt đối, tạo giá trị thấy ngay.
  3. **Môn Sinh: PA B** — trắc nghiệm + SRS, KHÔNG xây engine chấm mới. Sinh chỉ ~15% dạng bài chấm
     tự động được (Toán ~95%); bản chất gần với học từ vựng hơn là với Toán → tái dùng engine SRS
     đã chạy tốt cho tiếng Anh.
  4. **[2026-08-01, người dùng chốt] Hình minh hoạ bài học — kết hợp 2 nguồn theo môn:**
     **SVG tự vẽ bằng code** cho Toán/Lý/Hoá (hình học, sơ đồ mạch điện, ống nghiệm/phản ứng —
     miễn phí, nhẹ, sắc nét mọi kích thước, đổi theo theme sáng/tối); **AI sinh ảnh** cho Sinh
     (động vật, tế bào, hệ sinh thái — cần tả thực, SVG không hợp). ⚠️ **KHÔNG chép hình vẽ từ
     SGK** — chỉ dùng SGK để biết "minh hoạ ý gì" (đúng ranh giới bản quyền §0.1
     `huong-dan-doi-chieu-sgk.md`), hình phải tự vẽ/tự sinh mới hoàn toàn. Ảnh AI cần duyệt thủ
     công tránh sai kiến thức khoa học + tốn phí API (nên cache lại, không sinh lại mỗi lần xem
     — có thể theo mô hình cache TTS mã hoá đã có ở `packages/core-ai/fileStorage.ts`).
     **Áp dụng khi viết PR-1** (bài học mẫu), chưa làm ngay — ghi lại quyết định trước để không
     quên khi tới lúc.
- **Việc kế tiếp:** 12 chủ đề đợt 2a đã chốt theo SGK thật → PR-1 (soạn 1 bài học mẫu, có áp dụng
  quyết định hình minh hoạ ở trên, để duyệt định dạng) → PR-2 scaffold `apps/math`. Các điểm cần
  giáo viên duyệt (§8.3 kho-kien-thuc-toan) nên xử lý trước hoặc song song, không chặn PR-1.

## Đã xong — tóm tắt theo mảng

**Lõi sản phẩm (MVP → v2):** đăng nhập Supabase Auth · 3 chế độ Chat/Viết/Nói song ngữ (STT
Groq-OpenAI + TTS Google Cloud 2 giọng, cache mã hoá AES-256-GCM) · đếm lượt/ngày atomic
(RPC `consume_usage`/`refund_usage`) tách riêng theo mode (chat/writing/speaking/stt) · mở
chiều B (dạy Việt qua Anh) · deploy VPS (PM2 + Nginx + Let's Encrypt) sau Cloudflare · nút
"Kết thúc & chấm điểm" cuối phiên Chat/Speaking · trang cá nhân `/profile`.

**Lộ trình học:** vòng từ vựng nền tảng theo chủ đề, tốc độ 5/10/20 từ/ngày tự chọn · lộ trình
chuẩn CEFR **A1→C2 đầy đủ 6 cấp** (mỗi cấp 1 trang riêng, thứ tự Từ vựng→Ngữ pháp→Hội thoại,
4 tab Hôm nay/Ôn SRS/Từ khó/Kiểm tra lọc theo cấp) · bài thi cuối cấp chặn lên cấp (≥70%) ·
SRS toàn cục (cap phiên, leech, vé nghỉ streak) · xen kẽ từ vựng↔ngữ pháp · quiz ngữ pháp ·
Sổ lỗi cá nhân (Mistake Bank, `/mistakes`) · gamification (flashcard lật 3D, màn ăn mừng
streak/confetti, vòng cung phiên học nối lộ trình↔Chat/Speaking qua `targetWords`).

**Từ điển & dữ liệu:** 12.073 mục, **100% đã gắn nhãn CEFR** (A1-C2, qua CEFR-J/Octanove/
Words-CEFR-Dataset + AI cho phần còn thiếu) · dạng biến thể từ (`WordForms`, 8.740 từ, 200 bất
quy tắc) kèm ví dụ song ngữ cho ~391 ô bất quy tắc · tần suất từ thật (SUBTLEX-US, 9.540/10.006
từ) dùng để sắp "Mở rộng" theo độ thông dụng thay vì alphabet.

**Hạ tầng/chất lượng:** CI gate (lint/typecheck/test/build/format/E2E) trên mọi PR · coverage
ratchet + bundle-size budget (`size-limit`, thay Lighthouse CI) · a11y AA toàn site qua axe
(kể cả màn kết quả AI, 4 theme) — **đã đóng nợ a11y** · Zod validate input toàn bộ `api/*.ts` ·
Sentry error tracking (**đã bật thật trên VPS, 2026-07-27** — DSN đã điền, đã xác nhận lỗi test
ghi nhận được) · CI/CD tự deploy + tự chạy migration Postgres khi merge vào `main`
(`npm run migrate:pg` trong pipeline deploy, không cần chạy tay) · audit bảo mật/logic nhiều đợt
(RLS theo cột chặn tự nâng Pro/bypass lượt, timeout fetch, refund lượt khi provider lỗi, ranh
giới ngày theo giờ VN — chi tiết `AUDIT.md`) · **deploy zero-downtime (2026-07-20)**: PM2
chuyển cluster mode (1 instance) + `wait_ready` (`server.ts` gửi `process.send('ready')` sau
`app.listen` + graceful shutdown SIGINT/SIGTERM) — trước đó fork mode `pm2 reload` = tắt cũ
rồi mới bật mới → app chết ~10s mỗi lần deploy (thấy trong log deploy: 9 lần curl
"Couldn't connect"); logic reload + health check gom về `scripts/pm2-reload.sh` (cả
`deploy.yml`/`deploy.sh`/`scripts/deploy.sh` cùng gọi, tự phát hiện fork mode cũ để
delete+start MỘT lần vì PM2 không đổi được exec_mode qua reload) — đã kiểm chứng bằng PM2
thật trong sandbox: 3.766 request liên tục xuyên 2 lần reload, 0 request rớt.

**Tính năng mới:** Thử thách "Challenge 1 phút/ngày" (`/challenge`) — từ 2026-07-15 chạy
**CHU KỲ TUẦN** Thứ 2→CN (bảng 7 ô, tổng kết tuần vào CN, ăn mừng 7/7; bỏ vòng 30 ngày/vé
nghỉ/mốc — huy hiệu sẽ quay lại ở M2). ~~Migration `0010_challenge_entries.sql` chưa chạy trên
production~~ **hết hiệu lực (2026-07-20)** — ghi chú từ thời Supabase; sau khi rời hẳn sang
Postgres tự host, bảng `challenge_entries` đã có sẵn trong `postgres/schema.sql` (baseline khi
khởi tạo DB mới) nên tự động có qua `npm run migrate:pg`, không cần chạy riêng.

**i18n/UX:** song ngữ toàn site kể cả `/login` · bottom-nav mobile (Trang chủ/Lộ trình/Luyện
tập/Tiến độ) · thẻ "Học tiếp" ở Home · karaoke (sáng chữ theo giọng đọc) áp dụng mọi TTS >1 từ ·
chuẩn hoá vị trí nút loa/micro + vùng chạm ≥44px.

**Giọng TTS 14 giọng + gói VIP + admin cấu hình (2026-07-21, nhánh
`claude/chirp-3-hd-voice-upgrade-c06eds`, CHƯA MERGE — xem "Cần làm tay"):** mở rộng từ 4 → 14
giọng Chirp3-HD thật (7 nữ/7 nam, xác minh qua Google TTS `voices.list`) cho cả en-US/vi-VN ·
mọi user tự chọn giọng ở trang Hồ sơ (`VoicePicker`), lưu toàn cục áp dụng mọi trang · thêm gói
`vip` (bên cạnh free/pro) · **quyết định người dùng 2026-07-21:** hạn mức free=5/pro=100/
vip=không giới hạn (lượt/tính năng/ngày), khuyến mãi ra mắt hiện đang bật (mọi user = VIP tới
hết 31/12/2026, cấu hình được) · trang `/admin-settings` (admin xác thực qua `ADMIN_EMAILS`
trong `.env`) cho chỉnh 15 hạn mức + bật/tắt khuyến mãi lưu trong bảng `app_settings` — server
(`usage.ts`/`voiceAccess.ts`, cache 30s) và client (`src/lib/appSettings.ts`, đồng bộ lúc mở
app qua ETag/If-None-Match, không fetch thừa khi chưa đổi gì) đều đọc từ đây, không còn hard-
code trong nhiều file rời rạc.

**Quản trị VIP/gói (2026-07-28):** Danh sách VIP whitelist (thêm/xoá email → tự cấp/hạ VIP vĩnh
viễn, kể cả người chưa đăng ký) + Ma trận tính năng theo gói Free/Pro/VIP (admin bật/tắt từng
tính năng, thêm/xoá tính năng mới) — 2 tab mới trong `/admin`, xem chi tiết trong "Tiếp theo" và
`docs/` liên quan nếu cần đào sâu.

**Trang Nghe `/listening` — thư viện nghe song ngữ (2026-08-01, PR #434, đang bổ sung nội dung
theo đợt):** trang mới gom 4 mục để NGHE (không chấm điểm, khác `/phrases` và tab "Nghe" trong
`/practice`): câu thông dụng + hội thoại (tái dùng dữ liệu sẵn có, đổi cách trình bày) và **truyện
song ngữ MỚI** (`ft-*`/`fb-*`/... theo 6 thể loại `fairy-tale`/`fable`/`vn-folk`/`myth`/`humor`/
`children`, xem `docs/research/danh-muc-truyen-nghe-2026-08-01.md` — chốt 120 truyện, làm dần mỗi
đợt ~10 truyện/PR). Hạ tầng: `data/stories/{index.ts,loader.ts,raw/*.json}` +
`scripts/gen-stories-json.mjs` (`npm run gen:stories`, nối vào `build`) sinh
`public/data/stories/`; UI `pages/Listening.tsx` (tab đồng bộ URL) + `pages/StoryReader.tsx` (đọc
truyện, tự cuộn theo câu, ghi nguồn bắt buộc) + `components/StoryCard.tsx`. Bản tiếng Anh **bắt
buộc tải thật từ Project Gutenberg** (không gõ từ trí nhớ — CLAUDE.md §5), tiếng Việt Opus dịch
tay chất lượng văn học. Migration `0032` bật feature `listening` cho mọi gói.
**Tiến độ nội dung [cập nhật 2026-08-02, đóng fable]:** ✅ **`fairy-tale` XONG 20/20** · ✅
**`vn-folk` XONG 20/20** · ✅ **`fable` XONG 20/20** — ba thể loại đã hoàn tất trọn vẹn.
`myth`/`humor`/`children` chưa bắt đầu. **Tổng 60/120 truyện — đúng nửa danh mục.**
⚠️ Cách cập nhật con số này: **đếm file thật** (`ls apps/english/src/data/stories/raw/ft-*.json |
wc -l`), đừng cộng nhẩm — ghi chú trước đó từng ghi `fairy-tale` "12/20" trong khi thực tế mới có
11 file.

## Tiếp theo

> Mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (CLAUDE.md mục 3).

- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `fable` 20/20 (14 truyện Jataka).** Soạn nốt toàn
  bộ phần còn lại của thể loại ngụ ngôn từ **Jataka Tales** (PG 62514, Babbitt 1912) và **More
  Jataka Tales** (PG 7518, Babbitt 1922): Rùa tự cứu mình · Rùa nói nhiều · Con ngỗng vàng · Con
  Bò thắng cược · Cái cày bị mất trộm · Chim gõ kiến, Rùa và Hươu · Con đường cát · Cuộc cãi vã
  của bầy chim cút · Chú Thỏ nhút nhát dại dột · Vua Hươu cây Đa · Cua và Sếu · Ba con Cá · Con
  Khỉ tham lam · Hoàng tử Độc Ác và những con vật biết ơn.
  **Thay 4 mục trong danh mục** (đã cập nhật `docs/research/danh-muc-truyen-nghe-2026-08-01.md`):
  3 truyện Aesop quá ngắn (`fb-boys-frogs`/`fb-walnut-tree`/`fb-charcoal-fuller`, đều < 200 từ)
  đổi sang Jataka ≥ 489 từ; và **`fb-cruel-crane` bị loại vì TRÙNG NỘI DUNG với `fb-crab-crane`**
  — "The Cruel Crane Outwitted" (Jacobs, PG 7128) và "The Crab and the Crane" (Babbitt, PG 62514)
  là **cùng một tích Jataka**, chỉ khác người kể lại. Thay bằng `fb-prince-wicked` (1.692 từ).
  ⚠️ **Bài học cho các thể loại sau:** khi lấy truyện từ nhiều tuyển tập cùng một truyền thống
  (Jataka, Grimm/Lang, Andersen nhiều bản dịch) phải **đối chiếu NỘI DUNG, không chỉ đối chiếu
  tên** — tên khác nhau vẫn có thể là cùng một truyện.
  Độ dài thể loại: 9.789 từ EN, trung bình 489 từ/truyện (bản Aesop cũ chỉ ~94 từ/truyện, quá
  ngắn cho thư viện nghe). `fb-prince-wicked` có cảnh đám đông giết vua bằng tên và đá — nguyên
  văn public domain, giữ nguyên, nhưng nên lưu ý khi gắn nhãn độ tuổi.
- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `vn-folk` 20/20 (đợt 2, 7 truyện cuối).** Soạn nốt
  #14–20: Lưu Bình — Dương Lễ · Sự tích con muỗi · Người con gái Nam Xương · Sự tích cây vú sữa ·
  Sự tích chim quốc · Ba điều ước · Trí khôn của ta đây. Cả 20 truyện `vn-folk` đạt 497–709 từ EN,
  22–37 câu. Người con gái Nam Xương (B2) là truyện dài nhất và khó nhất thể loại — giữ trọn chi
  tiết cái bóng trên vách và đoạn kết trên bến Hoàng Giang.
  **Sửa thêm 2 mã id sai trong danh mục:** #15 `vn-tam-that-quy` (vô nghĩa so với nội dung) →
  `vn-su-tich-con-muoi`; #17 `vn-hai-chi-em-cay-vu-sua` ("hai chị em" — truyện thực ra là mẹ và
  con trai, không có chị em nào) → `vn-su-tich-cay-vu-sua`.
  **Còn lại 4 thể loại (`fable` 14 truyện, `myth`/`humor`/`children` mỗi thứ 20) đều PHỤ THUỘC
  Project Gutenberg** → không làm được cho tới khi network policy mở `gutenberg.org`.

- **[2026-08-02] Trang Nghe — đợt `vn-folk` #4–13 (10 truyện, `vn-folk` lên 13/20).** Soạn: Sự
  tích quả dưa hấu · Ăn khế trả vàng · Cây tre trăm đốt · Thạch Sanh · Sự tích Hồ Gươm · Chú Cuội
  cung trăng · Sọ Dừa · Con Rồng cháu Tiên · Sự tích trầu cau · Trạng Quỳnh. Mỗi truyện 497–689
  từ EN (đều vượt ngưỡng ≥400 từ đã chốt), 27–37 câu song ngữ, Opus tự kể + tự dịch theo nguyên
  tắc §1.3 của danh mục (truyện dân gian VN không có bản PD tiếng Anh).
  **⚠️ Vì sao KHÔNG làm `fable` như kế hoạch đã ghi:** 14 truyện `fable` còn lại đều cần nguyên
  văn Project Gutenberg, nhưng **network policy của phiên chặn `gutenberg.org`** (CONNECT trả
  403; đã thử cả `aleph.gutenberg.org`, `gutenberg.pglaf.org`, archive.org, wikisource — hỏng
  hết). CLAUDE.md §5 cấm gõ từ trí nhớ nên `fable`/`myth`/`humor`/`children` **bị chặn cứng**,
  chỉ `vn-folk` làm được. **Việc cho chủ dự án:** nếu muốn tiếp 4 thể loại kia thì cần mở network
  policy cho `gutenberg.org` ở môi trường Claude Code web.
  **Sửa lỗi danh mục:** mục #10 cũ `vn-mai-an-tiem` **trùng nội dung** với #4 `vn-su-tich-dua-hau`
  (Mai An Tiêm chính là nhân vật sự tích dưa hấu) → đã thay #10 bằng `vn-so-dua` (Sọ Dừa), giữ
  nguyên tổng 20. Xem `docs/research/danh-muc-truyen-nghe-2026-08-01.md` §5.
  Đã rút kinh nghiệm đợt trước: chạy script kiểm chỉ số `p` **ngay sau khi viết file**, trước khi
  chạy test — cả 10 file đạt ngay từ lần đầu.

- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `fairy-tale` 20/20.** Phiên này thêm 6 truyện cuối:
  Jacobs PG 7439 (Jack và cây đậu thần 96 câu · Ba chú lợn con 57 câu · Ba chú gấu 64 câu) +
  Ozaki PG 4018 (Chim sẻ bị cắt lưỡi 115 câu · Urashima Taro 148 câu · Momotaro 174 câu) — nguyên
  văn đã `curl` về thật, dịch tay đầy đủ từng câu. Trước đó cùng ngày đã merge 3 truyện Perrault
  (PR #441).
  **Bẫy kỹ thuật gặp phải, ghi lại để đợt sau tránh:** hai truyện Ozaki có **chú thích cuối trang**
  xen giữa các đoạn (`[1] An alcove where…`, `[2] "All right"…`). Khi bỏ đoạn chú thích ra khỏi
  bản dịch, chỉ số `p` bị **nhảy cóc**, vi phạm ràng buộc "p tăng dần không nhảy cóc" ở
  `stories.test.ts` — lỗi này KHÔNG lộ ra khi đọc file bằng mắt, chỉ script kiểm mới bắt được.
  Đã sửa bằng cách đánh số lại `p` tuần tự. Đợt sau soạn nguồn có chú thích (Ozaki, Bulfinch) phải
  chạy script kiểm `p` ngay sau khi viết file, đừng đợi tới lúc chạy test.
  Cũng như lô Perrault, các bản Jacobs này là **bản gốc chưa làm mềm**: hai chú lợn đầu bị sói ăn
  thịt, con sói bị luộc chín; Ba chú gấu kết bằng việc bà lão nhảy khỏi cửa sổ, người kể bỏ ngỏ
  chuyện bà có gãy cổ hay không. Cấp CEFR gán theo **độ khó ngôn ngữ**, không phải độ tuổi phù hợp
  — nếu sau này muốn lọc theo tuổi thì phải thêm trường riêng, đừng dùng lại cấp CEFR.
  **Đợt kế tiếp:** `fable` (14 truyện còn lại, ưu tiên nguồn dài ≥400 từ theo nguyên tắc đã chốt ở
  §4 của `docs/research/danh-muc-truyen-nghe-2026-08-01.md`).
  **Lưu ý phối hợp:** `vn-folk` do phiên khác làm (PR #440) — tránh trùng. Ghi chú trong file chỉ
  có tác dụng nếu phiên kia đọc trước khi bắt đầu; nếu chạy song song, nên chốt trước ai giữ
  thể loại nào (PR #440 đã phải huỷ bỏ 2 truyện Andersen vì soạn trùng PR #437).

- **[2026-07-31] Backup cấu hình hệ thống (Nginx + crontab + PM2 dump) lên R2 — ĐÃ THÊM.** Phát
  hiện lỗ hổng khi chỉnh tay Nginx nhiều lần lúc chuyển domain `.org`: `pg_dump`/`backup:env` chỉ
  backup DB/`.env`, không backup Nginx/crontab/PM2 dump — VPS hỏng thì khôi phục xong DB+`.env`
  vẫn phải cấu hình lại Nginx từ đầu bằng trí nhớ, và mất luôn crontab (chính là các dòng lệnh
  khiến backup TỰ CHẠY). Thêm `scripts/backup-system-to-r2.ts`/`restore-system-from-r2.ts` (lệnh
  `npm run backup:system`/`restore:system`) — đóng gói tar + mã hoá AES-256-GCM (dùng lại
  `encryptEnv`/`decryptEnv` của `backup:env`, không lặp logic), đẩy cùng bucket R2 private. Chi
  tiết cron + cách khôi phục từng phần: `docs/setup-postgresql-vps.md` mục 7.4. **ĐÃ XÁC NHẬN
  chạy thật trên VPS 2026-07-31**: `backup:system --dry-run` rồi chạy thật đều thành công (upload
  `system-backups/system_20260731.tar.gz.enc`). **[Cập nhật cùng ngày]** Đã gộp cron: thay vì 3
  dòng cron riêng ở 2 user (`postgres`: `backup:r2`; `root`: `backup:system`; `backup:env` từng bị
  bỏ sót, chưa có cron) → tạo `/root/backup-all.sh` (root-only, `chmod 700`, chứa passphrase tạo
  bằng `openssl rand -base64 32`) gọi cả `backup:r2`+`backup:env`+`pm2 save`+`backup:system` trong
  1 lệnh, 1 dòng cron `root` duy nhất (`10 3 * * *`, sau `pg_dump` của `postgres` lúc `0 3 * * *`).
  Đã xoá dòng `backup:r2` trùng lặp khỏi crontab `postgres` (giữ lại `pg_dump` + `verify-pg-backup`
  chủ nhật). Chi tiết: `docs/setup-postgresql-vps.md` mục 7.6. Thêm `scripts/restore-all-from-r2.ts`
  (`npm run restore:all`) gộp cả 3 lệnh khôi
  phục (Postgres/`.env`/hệ thống) thành 1 lệnh cho tình huống dựng lại VPS từ đầu — mặc định chỉ
  TẢI VỀ (an toàn), chỉ thực sự ghi đè Postgres khi truyền `--restore-into <db> --yes`. **[Cập
  nhật 2026-08-01] ĐÃ XÁC NHẬN chạy thật `restore:all` (chế độ tải về, không ghi đè gì) trên VPS**:
  `.env.restored` khớp 100% với `.env` thật (`diff` không lệch dòng nào), `system-restored.tar.gz`
  đủ cấu trúc `nginx/` (gồm `sites-available/default`+`en-vi`) + `crontab/root.txt`+`postgres.txt`
  - `pm2/dump.pm2`, file `.sql.gz` Postgres tải về nguyên vẹn (`gunzip -t` qua). Lưu ý khi test:
    chạy qua `npm --prefix <dir> run restore:all` thì file tải về nằm trong `<dir>` (theo cwd của
    script con), KHÔNG phải thư mục đang đứng — muốn cô lập file test phải `cd` vào thư mục đó rồi
    chạy `npm run` thường, không dùng `--prefix`. Bộ 3 backup + restore giờ đã kiểm chứng đầy đủ cả
    2 chiều.

- **[2026-07-31] Đổi domain chính sang `.org` — ĐÃ HOÀN TẤT.** `en-vi.donghanhcungban.org` giờ là
  domain mặc định (biến `SITE_URL`/`VITE_SITE_URL`/`EN_VI_HOSTNAME`/`VITE_ENGLISH_APP_URL` trên
  VPS đã trỏ `.org`); `.com`/`www.donghanhcungban.com` 301 redirect sang `www.donghanhcungban.org`
  (Nginx, việc tay). Đã xác nhận thật: đăng nhập Google + 1 giao dịch SePay (tiền tố mới `DHCB`)
  chạy đúng trên `.org`. **Quyết định đi kèm:** tạm hoãn thêm domain `.org` vào Facebook Developer/
  Apple Developer (Services ID)/Microsoft Azure — 3 nền tảng này tạm báo lỗi khi đăng nhập trên
  `.org` cho tới khi làm sau; Google + email/password vẫn dùng bình thường. Chi tiết + lịch sử đầy
  đủ: `docs/doi-ten-mien-chinh-org.md`. Trong lúc thi hành phát hiện + sửa 2 lỗi thật (đã merge,
  xem PR #403/#404): (1) `apps/hub/vite.config.ts` thiếu `envDir` nên Vite đọc nhầm `.env` ở
  `apps/hub/` thay vì gốc repo → nút "Đăng nhập"/"Học ngay" của hub luôn rơi về `.com` dù đã đặt
  đúng `VITE_ENGLISH_APP_URL`; (2) `server.ts` (`distDirForHost`) chỉ khớp đúng 1 hostname với
  `EN_VI_HOSTNAME` nên trong lúc chạy song song 2 domain, mọi request tới `.org` (kể cả `/login`)
  bị phục vụ nhầm bằng `apps/hub/dist` — nay `EN_VI_HOSTNAME` nhận danh sách nhiều host phân cách
  dấu phẩy.

- **[2026-07-31] Kế hoạch nền tảng đa lĩnh vực — ĐÃ CHỐT, CHƯA THI HÀNH.** Chủ dự án muốn
  `donghanhcungban.com` thành nền tảng đồng hành đa lĩnh vực (học hành trước: Anh → Toán → Lý →
  Hoá; sau đó nuôi dạy con, nghề nghiệp). Toàn bộ quyết định kiến trúc đã chốt và ghi tại
  `docs/adr/0001-nen-tang-da-linh-vuc.md` (ADR, có lịch sử các lần đổi ý trong ngày — đọc kỹ trước
  khi động vào hạn mức/schema) + đặc tả thi hành đầy đủ tại
  `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md` (8 PR) và bản kế hoạch tổng
  `docs/research/ke-hoach-nen-tang-donghanhcungban-2026-07-31.md`. Tóm tắt các điểm dễ quên:
  - Subdomain mỗi môn (`en-vi.`/`math.`/…), **CHỈ MỘT tiến trình PM2** dùng chung cho tới khi chạm
    ngưỡng nâng cấp (một môn > 50% CPU · cần deploy độc lập · lên VPS nhiều core).
  - Monorepo npm workspaces: `packages/core-*` + `apps/english|hub|math`.
  - Dữ liệu học tách theo **schema riêng từng môn** (`english`, `math`…); `core` chỉ giữ
    users/payments/usage — không phải bảng học nào.
  - Cơ chế ôn tập/SRS **tách riêng từng môn**, không đưa vào lõi (chấp nhận nhân bản có chủ đích).
  - Tiền tố SePay đổi sang `DHCB` dùng chung mọi môn — **webhook phải chấp nhận cả `DHCB` và
    `ENVI` vĩnh viễn**, không được bỏ tiền tố cũ.
  - Hạn mức lượt AI: **mỗi môn đếm/trừ riêng** (không cộng gộp), nhưng **cùng một con số** hạn
    mức/ngày với tiếng Anh — hết lượt Anh không ảnh hưởng lượt Toán trong cùng ngày.
  - Trang chủ hub: mục tiêu chung → hoạt động dự án (số thật) → tab riêng từng môn → giá chung;
    lần đầu chọn một môn thì hỏi onboarding y như app tiếng Anh, lưu riêng theo `(user_id, subject)`.
  - **Việc kế tiếp trước khi mở PR-1:** ~~ghi mốc `npm run test:e2e` đang xanh~~ **ĐÃ XONG
    (2026-07-31).** · ~~bổ sung E2E (hoặc danh sách kiểm tra tay) cho thanh toán + đăng nhập
    Google~~ **ĐÃ XONG (2026-07-31).** · ~~backup DB và xác minh restore chạy được~~ **ĐÃ XONG
    (2026-07-31).** → **CẢ 3 VIỆC CHUẨN BỊ ĐÃ XONG, có thể mở PR-1 (alias đường dẫn).**
  - **[2026-07-31] Vá lỗ hổng test: `api/auth.ts` (417 dòng, xử lý đăng ký/đăng nhập/OAuth
    Google-Facebook-Apple-Microsoft/logout) CHƯA TỪNG có file test.** Đã thêm `api/auth.test.ts`
    (10 test, tập trung đăng nhập Google `action: 'google'`/`'google-token'` — luồng GĐ1 sẽ đụng
    khi tách `packages/core-auth`), mock `authService`/`security`/`emailVerification`/`trial` theo
    đúng pattern `checkout.test.ts`. Phần không tự động hoá an toàn được (chuyển khoản SePay thật,
    popup Google OAuth thật) chuyển thành danh sách kiểm tra tay:
    `docs/kiem-tra-tay-thanh-toan-google-login.md` — chạy trước mỗi lần deploy PR-4/PR-5 của GĐ1.
  - **[2026-07-31] PR-1 (GĐ1, alias đường dẫn) — XONG.** Sửa phạm vi lúc thi hành: alias **chỉ áp
    dụng cho `src/`** — `api/` được `tsc` biên dịch thành JS thật chạy trực tiếp bằng `node`
    (không qua bundler), `tsc` không tự rewrite alias lúc build nên sẽ crash production; khi
    `api/_lib/*` chuyển sang `packages/core-*` (PR-3/4/5) sẽ dùng import package thật qua npm
    workspaces, không cần alias trung gian. Đã thêm `resolve.alias` (`vite.config.ts`) +
    `paths` (`tsconfig.json`): `@core/*`/`@english/*` tạm thời cùng trỏ `src/*`. Quét thấy chỉ
    **10 file** có import sâu ≥2 cấp trong `src/` (nhỏ hơn nhiều so với ước lượng ban đầu do cấu
    trúc `src/` khá phẳng) — làm trực tiếp thay vì giao subagent (không đáng chi phí điều phối).
    Build + `build:server` + typecheck + lint + 947 unit test đều xanh, `git diff` chỉ có dòng
    import.
  - **[2026-07-31] PR-2 (GĐ1, bật npm workspaces + dời `src/` vào `apps/english/src/`) — XONG.**
    Chỉ dời `src/` (224 file, `git mv` giữ lịch sử) — **`api/` KHÔNG dời** ở bước này (đợi
    PR-3/4/5 tách thẳng vào `packages/core-*` qua workspace thật). `package.json` thêm
    `"workspaces": ["packages/*", "apps/*"]`. Sửa đường dẫn: `index.html`, `vite.config.ts`
    (alias trỏ `apps/english/src`), `tsconfig.json`, `vitest.config.ts`, `tailwind.config.js`.
    **Phát hiện ngoài phạm vi đặc tả ban đầu:** 19 file trong `scripts/` (data-gen tooling:
    dictionary/lessons/curriculum/cefr/prompts…) import trực tiếp từ `src/` — đặc tả gốc chỉ
    liệt kê `vite.config.ts`/`tsconfig*`/`vitest.config.ts`/`playwright.config.ts`/`size-limit`/
    `gen-data-manifest.mjs`, thiếu cụm này. Đã sửa cả 19 file, xác nhận bằng typecheck
    (`tsconfig.api.json` bao `scripts/`). **Phát hiện thứ hai:** `.lintstagedrc.json` pattern
    `{src,api}/**/*.{ts,tsx}` khớp 0 file sau khi dời — lint-staged **âm thầm ngừng lint/format**
    phần lớn codebase mỗi lần commit (khớp 0 file không phải lỗi, không ai biết trừ khi để ý kỹ
    log `[SKIPPED]`). Đã sửa thành `{apps/english/src,api}/**/*.{ts,tsx}`, xác minh bằng
    `micromatch` + `npx lint-staged --debug`.
    **Nghiệm thu:** `npm ci` sạch từ đầu · tsc (3 project) + eslint sạch · build + `build:server`
    - 947 unit test xanh · dev server khởi động thật, `/apps/english/src/main.tsx` trả về HTTP 200
      (xác nhận alias hoạt động thật, không chỉ qua typecheck).
    - **[2026-07-31] PR-3 (GĐ1, tách `packages/core-db` + `packages/core-ai`) — XONG.** 21 file
      dời (giữ lịch sử): `core-db` = `pgPool`/`date`/`base64`/`concurrencyLimiter`/`settings`;
      `core-ai` = `tts`/`stt`/`ai` (**route handler thật**, mounted `/api/tts`·`/api/stt`·`/api/agent`
      — tính năng trả phí) + `aiConfig`/`aiCost`/`openaiStt`/`elevenLabsTts`/`azurePronounce`/
      `fileStorage`. Sửa import ở ~50 file `api/`+`api/_lib/`+`scripts/` (độ sâu khác nhau tuỳ vị
      trí file — không phải sed một mẫu chung được, phải soát từng file) + `server.ts` (route
      registration) + `vite.config.ts` (bảng `API_ROUTES` dev middleware). Mở rộng include:
      `tsconfig.server.json`/`tsconfig.api.json` (`packages/`), `vitest.config.ts`,
      `.lintstagedrc.json` (tránh lặp lỗ hổng "khớp 0 file" đã gặp ở PR-2). Cập nhật `CLAUDE.md` §6
      — vài đường dẫn (`api/_lib/pgPool.ts`, `api/_lib/aiConfig.ts`, `src/prompts/*`) đã lạc hậu sau
      PR-2/3, có thể khiến phiên AI sau tìm nhầm chỗ.
      **Nghiệm thu cao hơn PR-1/2** (đụng route trả phí, rút kinh nghiệm bài học alias ở PR-1 —
      không tin typecheck không thôi): tsc (3 project) + eslint sạch · build + `build:server` +
      947 unit test xanh · `node --check dist-server/server.js` + import trực tiếp cả 2 package đã
      biên dịch (xác nhận resolve runtime thật) · dev server thật: `OPTIONS /api/tts`↦204,
      `POST /api/agent` không auth ↦ 401 đúng logic (KHÔNG phải 500 "cannot find module").
  - **[2026-07-31] PR-4 (GĐ1, tách `packages/core-auth`) — XONG. ⚠️ PR nhạy cảm nhất.** 12 file
    dời (giữ lịch sử): `auth.ts` (**route handler thật**, mounted `/api/auth`) + `authService`,
    `adminAuth`, `security` (**34 file phụ thuộc — blast radius lớn nhất từ đầu GĐ1**),
    `emailVerification`, `changeEmail` + 6 file test.
    **Bài học quan trọng cho PR-5 trở đi:** các file đã sửa đường dẫn liên-package ở PR-3 (khi
    còn ở `api/_lib/`, trỏ `core-db` bằng `../../packages/core-db/...`) giờ CHÍNH BẢN THÂN CŨNG
    dời sang `packages/core-auth/` — độ sâu tới `packages/core-db` đổi (từ xuyên qua `api/` thành
    anh em cùng cấp `packages/`). Phát hiện 9 chỗ `../../packages/` sai, phải sửa thành
    `../core-db/`. **Mỗi lần một package tiếp tục dời tiếp, PHẢI rà lại toàn bộ path liên-package
    của nó, không chỉ path trỏ ra `api/`.** Sửa import ở ~33 file `api/*.ts` + 2 `api/_lib/*.ts` +
    3 `packages/core-ai/*.ts` (vì `ai`/`stt`/`tts` đều cần `security.ts`) + hàng loạt `vi.mock()`
    trong test (phải khớp CHÍNH XÁC specifier, không chỉ sửa import thật) + `server.ts` (route
    `/api/auth` + `warnIfClusterWithoutRedis`) + `vite.config.ts` (`API_ROUTES`).
    **Nghiệm thu:** tsc (3 project) + eslint sạch **ngay lần đầu chạy** (nhờ rà kỹ trước, không
    phải sửa-chạy-sửa lặp lại) · build + `build:server` + 947 unit test xanh · `node --check` +
    import trực tiếp cả 6 module core-auth đã biên dịch · dev server thật: `OPTIONS /api/auth`↦204,
    `GET ?action=me` không token↦401, `POST register` thiếu field↦400 Zod, `POST google` idToken
    rác chạy sâu tới `verifyGoogleIdToken` thật (báo thiếu `GOOGLE_CLIENT_ID` trong sandbox — đúng
    hành vi, không phải lỗi module).
  - **[2026-07-31] PR #395 mở trên GitHub cho nhánh này** — xung đột với `main` (4 PR mới merge:
    #391 admin-users panel, #392 gộp trang Luyện tập, #393 fix route admin-users, #394 avatar
    viseme timeline thật) đã xử lý bằng merge commit. 2 conflict rõ (git tự báo): `Practice.tsx`
    (file mới của main, git tự đặt đúng `apps/english/src/pages/` nhờ rename-detection, chỉ cần
    xác nhận) và `packages/core-ai/tts.ts` (gộp import `visemeTimeline` mới của main với đường dẫn
    package đã đổi ở PR-3). **Quan trọng hơn — lỗi ÂM THẦM git không báo conflict:**
    `api/_lib/visemeTimeline.ts`/`.test.ts` (file MỚI của main) import `elevenLabsTts.js` bằng
    đường dẫn cũ (file đó đã dời sang `packages/core-ai/` ở PR-3) — build vẫn "thành công" về mặt
    git merge nhưng sẽ vỡ ở typecheck. **Bài học: sau mỗi merge từ `main` trong lúc làm GĐ1, PHẢI
    tsc toàn bộ 3 project, không chỉ tin git báo hết conflict.** Cũng vá `api/routes-registered.test.ts`
    (test canh gác "mọi handler phải có route" — chỉ quét thư mục `api/`, sau PR-3/4 không còn thấy
    `tts`/`stt`/`ai`/`auth` vì đã dời sang `packages/`) để tiếp tục canh đúng 4 route đó, không chỉ
    merge cho qua. Nghiệm thu: tsc (3 project) + eslint sạch · build + `build:server` xanh ·
    92 file/1029 test xanh (bao gồm 73 test route-gate).
  - **[2026-07-31] CI đỏ trên PR #395 do TỰ MÌNH sai quy trình — đã sửa.** Sau khi phát hiện lỗi
    độ sâu đường dẫn (`'../packages/'` sai → `'../../packages/'` đúng), sửa bằng `sed` NHƯNG
    file đã `git add` từ TRƯỚC lần sửa đó — quên `git add` lại sau khi sửa. Hook `lint-staged`
    lúc commit stash/restore unstaged changes nên `tsc` chạy sau đó vẫn "sạch" (đọc working tree),
    khiến tưởng nhầm đã đúng, nhưng bản **đã commit** (git index lúc đó) vẫn là bản sai — CI bắt
    đúng lỗi này. **Bài học ghi nhớ: sau khi sửa file bằng sed/Edit RỒI `git add` sớm, phải chạy
    lại `git diff --cached` đối chiếu working tree trước khi commit — `tsc` chạy sau luôn đọc
    working tree, KHÔNG phải staged index, nên không đủ để xác nhận commit đúng.** Đã sửa bằng
    `git add` lại + `git diff --cached` xác nhận khớp working tree trước khi commit (thay vì chỉ
    tin `tsc` chạy sau).
  - **[2026-07-31] PR-5 Part A (tách `packages/core-billing`) — XONG.** 18 file di dời
    (`checkout.ts`, `payment-webhook.ts`, `payment-status.ts`, `payment-history.ts`,
    `plan-prices.ts`, `plan-features.ts`, `plan-marketing.ts`, `promo.ts`, `usage.ts`, `plan.ts` +
    test đi kèm). Sửa gap sweep `vi.mock('./promo', ...)` trong `api/_lib/voiceAccess.test.ts` (mock
    kiểu sibling-path bị sweep regex trước đó bỏ sót). 1015 test pass.
  - **[2026-07-31] PR-5 Part B (migration `subject` cho quota + đổi tiền tố SePay) — XONG.**
    Migration `postgres/migrations/0029_platform_subject.sql`: thêm cột `subject` (mặc định
    `'english'`) vào `daily_usage` + `free_daily_credit`, đổi khoá chính sang
    `(user_id, day, subject)`, cập nhật các hàm `consume_usage`/`refund_usage`/
    `consume_usage_total`/`grant_daily_bonus_rolling`/`consume_rolling_credit`/
    `refund_rolling_credit` nhận thêm `p_subject` (default `'english'`), thêm bảng
    `subject_limits`. Theo ADR-0001 mục 8: mỗi môn đếm lượt riêng, hạn mức bằng nhau.
    `packages/core-billing/usage.ts` + `api/progress.ts` truyền `DEFAULT_SUBJECT='english'` vào
    SQL — CHƯA đổi chữ ký hàm export để tránh đụng ~15 file gọi (Toán/GĐ2 sẽ cần luồng subject
    tường minh hơn — nợ kỹ thuật, ghi ở mục "Nợ kỹ thuật còn mở"). `api/_lib/sepay.ts`: đổi
    `PAYMENT_CODE_PREFIX` → `'DHCB'`, thêm `ACCEPTED_PAYMENT_PREFIXES = ['DHCB', 'ENVI']` — giữ
    `'ENVI'` VĨNH VIỄN để giao dịch/nội dung chuyển khoản cũ vẫn khớp. Nợ kỹ thuật CHƯA xử lý (chỉ
    1 môn nên chưa ảnh hưởng hành vi thật): `api/usage-summary.ts`, `api/admin-usage-stats.ts` cần
    lọc theo `subject` khi có môn thứ 2; UI admin bật/tắt `subject_limits.enforced` chưa xây. Xác
    thực: `tsc --noEmit` + `tsc -p tsconfig.api.json` sạch, `npm run build` + `build:server` sạch,
    `node --check` các file compile qua, `vitest run` 92 file/1017 test pass. Commit `6f37f38`.
    **Việc tay còn nợ: chạy `docs/kiem-tra-tay-thanh-toan-google-login.md` mục B (đặc biệt B6/B7 —
    test giao dịch ENVI cũ vẫn khớp + bật thêm bộ lọc DHCB trên dashboard SePay) sau khi deploy
    thật lên VPS. Mục A (Google login) cũng nên chạy vì PR-4 vừa đụng `core-auth`.**
  - **[2026-07-31] PR-5b (chuyển bảng dữ liệu học tiếng Anh sang schema `english`) — XONG.**
    Migration `postgres/migrations/0030_schema_english.sql`: `alter table ... set schema english`
    cho 7 bảng (`chat_sessions`, `writing_submissions`, `speaking_sessions`, `learning_progress`,
    `pronunciations`, `challenge_entries`, `tutor_feedback`) + view compat `public.<bảng>` trỏ
    sang `english.<bảng>` (xoá ở PR sau khi xác nhận hết truy vấn dùng tên không gắn schema).
    `tts_cache`/`daily_usage`/`free_daily_credit` ở lại `public` — hạ tầng dùng chung mọi môn.
    Sửa 8 file gọi SQL (`api/history.ts`, `_lib/quests.ts`, `push.ts`, `progress.ts`,
    `pronunciation.ts`, `challenge.ts`, `leaderboard.ts`, `tutor-feedback.ts` + test) sang gọi
    thẳng `english.<bảng>`. `schema.sql` giữ nguyên (baseline tạo ở `public`, migration set schema
    sau — đúng quy ước mọi migration trước). Commit `9e45145`, merge PR #395.
  - **[2026-07-31] PR-6 (tách `packages/core-ui`) — XONG, phạm vi ĐÃ THU HẸP so với đặc tả gốc,
    lý do phát hiện lúc thi hành.** Chuyển được ngay (thuần, không phụ thuộc gì đặc thù app):
    `theme.ts`, `themeContext.ts`, `useTheme.ts`, `ThemeProvider.tsx`, `authHeader.ts`,
    `ToastProvider.tsx`. **Phát hiện:** `ThemeProvider.tsx` bản gốc tự gọi `useAuth()` +
    `useOnboarding()` để tính `locked` (khoá cứng theme cho nhóm tuổi Nhi đồng) — phụ thuộc
    ngược vào nghiệp vụ app tiếng Anh, không tách nguyên trạng được như đặc tả giả định. Đã viết
    lại `ThemeProvider` (core-ui) nhận `locked`/`settled` qua PROP thuần; tạo
    `apps/english/src/context/AppThemeProvider.tsx` làm lớp bọc tự tính `locked` từ
    auth/onboarding riêng app rồi truyền xuống — giữ nguyên hành vi cũ kể cả ca biên "đang tải
    onboarding thì chưa ép đổi theme" (thêm cờ `settled`). **CHƯA tách** (khác đặc tả gốc,
    quyết định tại chỗ theo nguyên tắc "không trừu tượng hoá sớm"):
    `ThemeToggle.tsx`/`LangProvider`/`useLang` — phụ thuộc thẳng từ điển dịch `i18n.ts` riêng nội
    dung app tiếng Anh, chỉ tách khi Toán thật cần và thiết kế được cách truyền nhãn dịch;
    `types.ts` — giữ nguyên ở app (chứa nhiều type nghiệp vụ: `DictEntry`, `ChatSession`, …),
    riêng `Plan` (3 panel admin dùng) trỏ thẳng sang `packages/core-billing/plan.ts` có sẵn thay
    vì tạo bản sao. Alias `@core/*` (vite.config.ts/tsconfig.json/vitest.config.ts) đổi từ trỏ
    tạm vào `apps/english/src` sang trỏ THẬT vào `packages/core-ui`; `tsconfig.api.json`/
    `tsconfig.server.json` loại trừ `packages/core-ui` (component React/JSX, không chạy Node).
    Xác thực: tsc sạch (frontend+api+e2e), build+build:server sạch (`dist-server` không chứa
    `core-ui`), lint 0 cảnh báo, vitest 92 file/1017 test pass, `npm run dev` khởi động + serve
    200 OK. Commit `d355f98`.
  - **[2026-07-31] PR-7 (scaffold `apps/hub` + server.ts phục vụ đa app theo Host) — XONG,
    phạm vi ĐÃ THU HẸP so với đặc tả gốc.** Hỏi người dùng chọn mức độ (chỉ scaffold / làm trọn
    SSO+onboarding_profiles / dừng hẳn) — không có phản hồi, chọn nhánh rủi ro thấp nhất theo
    quy tắc mặc định an toàn. **Đã làm:** `apps/hub/` — Vite app độc lập (workspace mới, không
    dùng chung `vite.config.ts` gốc), trang 1 màn hình đúng §7.1: mở đầu → hoạt động chung (số
    liệu THẬT qua `/api/hub-stats` mới, không bịa) → tab từng môn (tiếng Anh dùng dữ liệu thật,
    Toán/Lý/Hoá "sắp ra mắt" có nội dung thật, không tab rỗng) → bảng giá chung + nút đăng
    nhập/đăng ký. `api/hub-stats.ts`: endpoint công khai, cache 5 phút trong process, tổng
    `public.users` + tổng `english.chat_sessions/writing_submissions/speaking_sessions` — không
    PII, 3 test. `server.ts`: thay đường dẫn tĩnh cứng `dist/` bằng bảng chọn theo
    `req.hostname` (`EN_VI_HOSTNAME`, mặc định đúng domain production hiện tại nên KHÔNG đổi
    hành vi nếu không đặt biến môi trường mới) — smoke test bằng `node dist-server/server.js`
    thật + `curl -H "Host: ..."` khác nhau, xác nhận đúng 2 app khác nhau được phục vụ.
    **CHƯA làm** (đụng phiên đăng nhập thật đang chạy, để dành PR sau khi có môn thứ hai):
    cookie domain chung `.donghanhcungban.com` (SSO thật giữa hub và subdomain), bảng
    `onboarding_profiles(user_id, subject, ...)` hỏi trình độ riêng theo môn. Nút "Học
    ngay"/"Đăng nhập" ở hub tạm điều hướng thẳng sang `en-vi.donghanhcungban.com`, người dùng
    đăng nhập lại ở đó. Theme hub đơn giản hoá (Tailwind zinc/emerald mặc định), chưa nối vào
    hệ token `--a-*` của app tiếng Anh (ghi nợ kỹ thuật trong `apps/hub/tailwind.config.js`).
    Hạ tầng thật CHƯA làm — `docs/nginx-hub-apex.md` (mới) ghi rõ việc tay cần làm: trỏ DNS
    apex/www, thêm Nginx server block, `certbot --expand`. `package.json`: `build` gộp thêm
    `npm run build --workspace=hub`, `typecheck` gộp thêm `apps/hub/tsconfig.json`.
    `.lintstagedrc.json`: thêm `apps/hub/src` vào glob (bài học từ PR-2 — glob thiếu khiến
    lint/format-on-commit im lặng bỏ qua thư mục mới). Xác thực: tsc sạch (frontend+api+e2e+hub),
    build sạch (`dist/`+`dist-server/`+`apps/hub/dist/`), lint 0 cảnh báo, vitest 93 file/1022
    test pass. Commit `bbab7e5`. **2 lần sửa CI sau khi mở PR #399:** `d688c62` — thiếu
    `npm install` sau khi thêm `apps/hub/package.json` khiến `package-lock.json` không đồng bộ
    (`npm ci` fail EUSAGE) + `prettier --write server.ts` (format:check fail, quên chạy
    `npm run format` trước khi commit, chỉ chạy `lint`); `8dbfde1` — coverage ratchet tụt
    (branches 86.9% < sàn 87%) vì `packages/core-ui/{theme,themeContext,useTheme}.ts` dời từ
    PR-6 chưa có test nào (0% coverage) — sửa bằng THÊM TEST (`theme.test.ts`,
    `useTheme.test.tsx` dùng `renderToStaticMarkup`, đúng nguyên tắc ratchet — không hạ ngưỡng).
    **Đã merge PR #399 (squash `6f9e40d`).**
  - **GĐ1 (tách lõi monorepo) coi như HOÀN TẤT ở mức phạm vi đã thu hẹp qua PR-1..7** (còn nợ kỹ
    thuật đã liệt kê rõ ở từng mục trên: PR-5b view compat chưa xoá, PR-6 theme/LangProvider
    chưa tách, PR-7 SSO/onboarding_profiles/hạ tầng Nginx thật chưa làm). Việc tiếp theo hợp lý:
    chờ môn Toán (GĐ2) THẬT SỰ bắt đầu rồi mới quay lại xử lý các nợ kỹ thuật này theo nhu cầu
    thật, tránh trừu tượng hoá sớm dựa trên phỏng đoán (nguyên tắc đã chốt trong đặc tả GĐ1).
  - **[2026-07-31] Hub ĐÃ LÊN PRODUCTION THẬT.** Người dùng tự làm việc tay trên VPS (DNS, SSL,
    Nginx), Claude hướng dẫn từng bước qua chat + chẩn đoán khi gặp sự cố. Đã xong: DNS A record
    cho `donghanhcungban.com`/`www`/`donghanhcungban.org`/`www.org` → VPS `103.81.87.174`; SSL mở
    rộng (`certbot --expand`) phủ cả 6 domain (`en-vi.com`, apex `.com`, `www.com`, `en-vi.org`,
    apex `.org`, `www.org`) trong CÙNG 1 cert; build `apps/hub` trên VPS
    (`npm run build` đã tự gồm `--workspace=hub` từ PR-7); sửa Nginx để 4 domain
    (`donghanhcungban.com`/`.org` + `www.` cả hai) proxy đúng vào Express (port 3001),
    `en-vi.donghanhcungban.com` giữ nguyên không đổi. **Xác nhận qua 3 lớp:** gọi thẳng Express
    (Host header) → đúng; gọi thẳng IP VPS bỏ qua Cloudflare (`--resolve`) → đúng; qua Cloudflare
    thật → 200 OK, đúng trang hub.
    **Sự cố thật gặp phải + đã xử lý** (chi tiết đầy đủ, bẫy cụ thể ở `docs/nginx-hub-apex.md`
    mục "⚠️ Bẫy thật đã gặp"): (1) thiếu DNS `www.` ban đầu → certbot NXDOMAIN, phải thêm DNS
    trước; (2) **Certbot không tạo vhost riêng cho domain chưa có server block khớp — tự chèn
    thẳng vào `/etc/nginx/sites-available/default`**, tạo ra file có **2 block `location /`
    giống hệt nhau về text** (1 ở `server_name _;` gốc vô hại, 1 ở block Certbot vừa chèn —
    block THẬT SỰ phục vụ HTTPS domain mới); tìm bằng `nano` + `Ctrl+W` search text bị nhảy
    nhầm vào bản sao đầu (sai), khiến domain vẫn ra "Welcome to nginx!" dù `nginx -t` xanh và
    gọi thẳng Express đã đúng — **dễ nhầm tưởng lỗi Cloudflare cache**. Chẩn đoán đúng bằng
    `cat -n` toàn bộ file thay vì tìm text, xác định đúng block theo `server_name` + `listen 443
ssl`, sửa bằng `perl -0777 -pi -e 's/.../.../ '` một dòng duy nhất (tránh lỗi dán nhiều dòng —
    xem bài học paste bên dưới) áp đúng vào block còn lại (lúc này pattern cũ chỉ còn 1 chỗ vì
    block kia đã sửa trước đó). (3) File `donghanhcungban-hub` riêng ban đầu tạo ra bị
    "conflicting server name" vì trùng domain với block Certbot đã chèn — xoá file đó, sửa
    thẳng trong `default` thay vì tạo file mới.
    **Bài học paste qua chat:** terminal của người dùng chèn thêm ký tự `$ ` lạ vào đầu heredoc/
    khối nhiều dòng khi dán (không rõ do client SSH/clipboard nào), khiến `bash` chạy từng dòng
    riêng lẻ thay vì nhận cả khối — chuyển hẳn sang lệnh MỘT DÒNG DUY NHẤT (kể cả sed/perl phức
    tạp) cho mọi thao tác từ xa qua chat, tránh hẳn heredoc/nano-paste nhiều dòng.
    `docs/nginx-hub-apex.md` đã viết lại đầy đủ từ "bản nháp" thành "đã triển khai thật", ghi rõ
    bẫy + cách chẩn đoán 3 lớp (Express trực tiếp / bỏ qua Cloudflare / qua Cloudflare thật) để
    dùng lại khi dựng VPS khác hoặc thêm domain mới.
  - **[2026-07-31] Mốc E2E trước GĐ1 — 111/119 passed trên VPS (~15 phút, sau khi cài
    `npx playwright install chromium` + `install-deps` lần đầu, cả hai đều chưa từng chạy trên VPS
    trước đó).** 8 fail đều timeout `toBeVisible 5000ms` (tab Nghe "Chọn nghĩa" ×6, banner comeback
    ×2) — nhiều khả năng do VPS **1 vCPU** chạy `npm run dev` + Chromium headless cùng lúc, tranh
    nhau 1 core, không phải hồi quy thật (CI GitHub Actions nhiều core hơn nên bình thường xanh cả
    119). **Dùng CI (GitHub Actions) làm mốc đối chiếu chính thức cho GĐ1, không dùng số chạy trên
    VPS** — VPS chỉ để xác nhận suite chạy được, không đại diện cho baseline chuẩn.
  - **[2026-07-31] Backup DB — PHÁT HIỆN VÀ VÁ: chưa từng có backup tự động nào chạy.**
    `sudo -u postgres crontab -l` trống trơn (chỉ có template mặc định) — cả 3 cron job ở
    `docs/setup-postgresql-vps.md` §7 (dump local · đẩy R2 · test restore hàng tuần) **chưa từng
    được thêm vào crontab từ trước tới giờ**, dù tài liệu đánh dấu "BẮT BUỘC". Đã thêm đủ 3 dòng
    cron cho user `postgres` (xác nhận qua `crontab -l`). Backup tay đầu tiên: `pg_dump` **phải
    chạy bằng quyền `postgres`** (chạy bằng `root` báo lỗi `role "root" does not exist` và tạo ra
    file `.sql.gz` gần như rỗng — 20 byte — mà `backup:r2` vẫn coi là "thành công" vì chỉ kiểm tra
    upload xong, không kiểm nội dung; đã xoá bản rỗng, dump lại đúng quyền ra 30.2 MB, xác minh
    bằng `scripts/verify-pg-backup.sh` đọc được dữ liệu thật (`users` 5 dòng, `profiles` 5,
    `app_settings` 1), rồi mới upload R2). **Rủi ro đã tồn tại từ trước, không phải mới phát sinh
    hôm nay** — nên rà lại các dự án tương tự khác (nếu có) đã setup theo cùng runbook.
  - **[2026-07-31] Cảnh giác:** chạy `npm run backup:r2` in ra dòng quảng cáo xoay vòng của gói
    `dotenv` (`// tip: … for agents […]`), một lần trỏ domain lạ `vestauth.com` chưa xác minh, lần
    khác trỏ `dotenvx.com` (domain chính chủ). Gói này tự chèn quảng cáo bên thứ ba vào output —
    không phải lỗi, nhưng nên tắt bằng `DOTENV_CONFIG_QUIET=true` trong `.env` (VIỆC TAY, chưa
    làm) để tránh nhiễu log/nhầm lẫn với mã độc thật về sau.

- **[2026-07-28] Danh sách VIP whitelist + Ma trận tính năng theo gói (Free/Pro/VIP) trong
  `/admin` — ĐÃ XONG, ĐÃ MERGE (PR #357).** 2 tính năng quản trị mới, tự chạy migration qua CI/CD
  (`npm run migrate:pg` trong pipeline deploy, không cần chạy tay):
  - **Danh sách VIP** (tab "Danh sách VIP") — bảng `vip_whitelist` (migration `0023`), admin
    thêm/xoá email. Thêm email → cấp VIP vĩnh viễn ngay nếu user đã có tài khoản, hoặc tự cấp lúc
    người đó đăng ký sau này (`ensureProfileRow`, `api/_lib/authService.ts`). Xoá → hạ về Free
    ngay (chỉ áp dụng cho VIP vĩnh viễn do whitelist cấp, không đụng VIP đã mua qua thanh toán có
    hạn). API: `api/admin-vip-whitelist.ts`.
  - **Ma trận tính năng theo gói** (tab "Tính năng theo gói") — 2 bảng mới `feature_catalog` +
    `plan_feature_flags` (migration `0024`): danh mục tính năng × 3 gói, mỗi ô bật/tắt độc lập,
    admin thêm/xoá tính năng được. Seed mặc định khớp đúng hành vi cũ (không đổi trải nghiệm ai):
    10 tính năng bật cho cả 3 gói (chat/writing/speaking/learning_path/dictionary/lessons/
    phrases/mistake_bank/challenge/quests) + `dialogue_roleplay` chỉ Pro/VIP (khớp gate `isPro`
    cũ ở `CefrLessonViews.tsx`, nay đọc động từ ma trận). API: `api/plan-features.ts` (public,
    ETag, cùng pattern `app-settings.ts`) + `api/admin-plan-features.ts` (admin). Client:
    `src/lib/planFeatures.ts` (đồng bộ cùng nhịp `app-settings`) + `FeatureGate.tsx` bọc quanh
    route — khoá + hiện màn "Nâng cấp gói" nếu admin tắt tính năng đó cho gói của user. Đây là
    khoá phía UI/trải nghiệm (giống voice tiers/role-play cũ) — KHÔNG phải chống gian lận; hạn
    mức lượt AI/ngày vẫn enforce riêng ở `api/_lib/usage.ts`, không đổi.
  - Ẩn link "Cấu hình hệ thống (Admin)" khỏi trang Hồ sơ với user thường — chỉ hiện khi
    `user.isAdmin` (cờ mới, server tính từ `ADMIN_EMAILS`, trả qua `/api/auth?action=me`). Chỉ ẩn
    UI; mọi API admin vẫn tự kiểm quyền phía server như cũ (`isAdminEmail`).
  - CI ban đầu đỏ 3 lần (typecheck 2 lỗi kiểu, format Prettier 2 file, CSS bundle vượt ngân sách
    10kB đúng 31 byte do class `accent-accent-500` mới chưa dùng ở đâu khác) — đã sửa cả 3, CI
    xanh (quality + e2e) trước khi merge.

- **[2026-07-28] FIX: streak/từ đã thuộc hiện 0 trên thiết bị mới dù đã đồng bộ server — ĐÃ
  XONG.** Người dùng báo Dashboard hiện "0 ngày liên tiếp"/"0 từ đã thuộc" dù đã học trên máy
  khác. Điều tra qua đọc code (không đoán): luồng kéo dữ liệu server→localStorage
  (`useCloudSync` → `pullUserData`/`pullProgress`, `src/lib/cloud.ts`/`progressSync.ts`) HOÀN
  TOÀN ĐÚNG — server trả đủ `daily_usage`/`learning_progress`, merge đúng. **Lỗi thật nằm ở
  RENDER**: `useCloudSync(user?.id)` được gọi mà bỏ qua giá trị trả về (`version`, tăng lên
  sau khi kéo dữ liệu xong) ở `Dashboard.tsx` và `Home.tsx` — các `useMemo` đọc localStorage
  (`stats`, `examMap`, `learned`, `doneGrammar`, `examPassed`...) có mảng deps KHÔNG chứa
  `version`, nên dù component re-render sau khi đồng bộ xong, `useMemo` vẫn trả về giá trị đã
  cache TỪ TRƯỚC lúc kéo dữ liệu (0/rỗng trên thiết bị mới) — không bao giờ tính lại cho tới
  khi có lý do khác khiến deps đổi.
  - `src/lib/useCloudSync.ts` — viết lại chú thích, cảnh báo RÕ RÀNG: bắt buộc dùng giá trị
    trả về (`const version = useCloudSync(...)`) và thêm vào deps của MỌI `useMemo` đọc dữ
    liệu qua localStorage, nếu không tái diễn đúng lỗi này ở trang khác sau này.
  - `Dashboard.tsx` — `examMap`, `stats`, và effect nạp lại tiến độ CEFR nay có `syncVersion`
    trong deps.
  - `Home.tsx` — `learned`/`doneGrammar`/`examPassed` (từ đó kéo theo `lockedMap`/
    `continueLevel` đúng dây chuyền) nay có `syncVersion` trong deps.
  - Đã rà toàn bộ 7 trang gọi `useCloudSync` (`Home`/`Dashboard`/`Chat`/`Writing`/`Speaking`/
    `Profile`/`History`) — CHỈ 2 trang trên có `useMemo` bị ảnh hưởng; các trang còn lại đọc
    localStorage trực tiếp trong thân hàm render (không `useMemo`) nên tự làm mới đúng khi
    component re-render sau đồng bộ, không cần sửa.
  - **Chưa test được trên trình duyệt thật** (cần tài khoản + Postgres thật để tái hiện đúng
    kịch bản "thiết bị mới") — đã xác minh chắc chắn qua đọc code (cơ chế `useMemo` deps của
    React), cổng build/type/lint/test đều xanh.

- **[2026-07-27] Dashboard "Sử dụng & chi phí" trong /admin — ĐÃ XONG (nhánh
  `claude/feature-usage-dashboard-378z5q`).** Tab mới (mặc định) ở `/admin` trả lời 3 câu hỏi
  vận hành: tính năng nào đáng giữ · chi phí AI bao nhiêu · doanh thu có bù nổi không.
  - `api/admin-usage-stats.ts` (mới) — 11 truy vấn gộp: người dùng (tổng/mới/DAU/WAU/MAU/quay
    lại/phân bổ gói hiệu lực) · lượt dùng + số người dùng THẬT của từng tính năng · lượt dùng
    chia theo gói · doanh thu `payments` theo trạng thái/gói/chu kỳ/ngày · sức khoẻ kho lượt
    tuần gói Free · top 10 người dùng nhiều nhất. Chỉ admin (`ADMIN_EMAILS`).
  - `api/_lib/aiCost.ts` (mới) — đơn giá ƯỚC TÍNH USD/lượt cho từng chế độ, ghi đè được bằng
    biến môi trường `AI_COST_*_USD` + `USD_VND_RATE` (đổi đơn giá KHÔNG cần deploy). Giá trị
    rác/≤0 → giữ mặc định, KHÔNG rơi về 0 (số 0 trông như "miễn phí" → quyết định sai).
  - **Vá lỗ hổng dữ liệu quan trọng:** gói Free tiêu lượt qua kho tuần (`weekly_ai_credit`) nên
    trước đây KHÔNG hề ghi vào `daily_usage` → thống kê theo tính năng mù phần lớn người dùng.
    `api/_lib/usage.ts` giờ ghi thêm vào `daily_usage` CHỈ ĐỂ THỐNG KÊ (hạn mức int4 max, không
    bao giờ chặn; refund cũng trừ lại). Không đổi hành vi chặn lượt của bất kỳ gói nào.
  - Khác `/api/analytics-summary` (phễu marketing từ `analytics_events`) — file mới đọc dữ liệu
    vận hành thật. Lỗi DB → trả 500, KHÔNG fail-open thành số 0.
  - **Còn mở:** đơn giá hiện là ước tính theo độ dài prompt điển hình. Khi có hoá đơn thật từ
    Anthropic/Groq/Google, chia (tiền tháng ÷ lượt tháng) rồi điền vào `.env` trên VPS. Chi phí
    TTS chưa tính (theo ký tự + có cache dùng chung, không tỉ lệ với số lượt).

- **[2026-07-27, CHỐT LẠI 2026-07-28 — lần 3] Trial Pro 14 ngày (cùng nhánh
  `claude/feature-usage-dashboard-378z5q`).** Thay cho phương án mở khuyến mãi Pro cho TOÀN
  BỘ user hiện có (rủi ro: chi phí AI tăng ~x20 cho cả user cũ vốn không cần khuyến mãi mới ở
  lại). Lịch sử quyết định (đổi 3 lần trong cùng ngày 2026-07-28, chốt bản CUỐI): (1) cấp ngay
  lúc đăng ký → (2) đổi sang chỉ cấp sau khi xác thực email cho MỌI kênh → (3) **CHỐT: tách
  theo kênh** — 4 kênh OAuth (Google/Facebook/Apple/Microsoft) coi như đã xác thực nên cấp
  NGAY ở lần đăng nhập đầu tiên; riêng email/password PHẢI xác thực mã 6 số trước mới được
  cấp (chống lạm dụng email rác tạo hàng loạt để cày trial — OAuth không cày kiểu này được vì
  cần tài khoản Google/Facebook/Apple/Microsoft thật).
  - `postgres/migrations/0019_signup_trial.sql` — cột `profiles.signup_trial_granted_at`.
    `trial_granted_at` (0013, quà xác thực email 5 ngày cũ) giữ nguyên không xoá (dữ liệu lịch
    sử), chỉ ngừng ghi — hàm `grantEmailVerifyTrial()` cũ đã XOÁ khỏi `api/_lib/trial.ts`.
  - `api/_lib/trial.ts` — chỉ còn 1 hàm `grantSignupTrial()` (`SIGNUP_TRIAL_DAYS = 14`), cơ chế
    "giành quyền nhận 1 lần" atomic, dùng lại `grantPlanDays()`.
  - `api/auth.ts` — `register` (email/password) KHÔNG cấp ngay, chỉ gửi mã xác thực;
    `verify-email` gọi `grantSignupTrial()` sau khi xác thực đúng mã (response
    `trialGranted`/`trialDays`, `EmailVerifySection.tsx` hiện lại đúng số ngày 14 — sửa luôn
    dòng copy tĩnh "5 ngày" sót lại từ bản rất cũ). 4 kênh OAuth cấp NGAY khi `isNew` qua hàm
    dùng chung `oauthLoginResponse()`.
  - ~~Còn mở: UI nhắc "còn X ngày dùng thử"~~ **ĐÃ LÀM (2026-07-28)** — xem mục "Banner còn X
    ngày dùng gói Pro/VIP" ngay dưới.

- **[2026-07-28] Banner "còn X ngày dùng gói Pro/VIP" (cùng nhánh trên).** Cùng khuôn mẫu
  `PromoEndingBanner.tsx` đã có (hàm thuần tách riêng để test ca biên ngày tháng, component chỉ
  lo hiển thị) — nhưng đọc HẠN GÓI CỦA TỪNG USER (`profiles.plan_expires_at`) thay vì mốc
  khuyến mãi toàn site. Dùng chung cho CẢ 2 trường hợp (cùng 1 cột DB): trial 14 ngày mới cấp
  lẫn gói trả phí sắp hết hạn — không phân biệt được nguồn gốc (trial hay gia hạn) vì
  `grantPlanDays()` gộp chung, nhưng banner "còn X ngày, gia hạn ngay" đúng cho cả 2 trường hợp.
  - **Vá lỗ hổng dữ liệu:** `plan_expires_at` trước đây được server QUERY nhưng KHÔNG BAO GIỜ
    trả ra ngoài — `api/_lib/authService.ts` (`ProfileInfo`/`ensureProfileRow()`) và
    `api/auth.ts` (`authResponse()` + `GET ?action=me`) nay trả thêm `planExpiresAt` (null nếu
    Free hoặc gói vĩnh viễn — tránh hiểu nhầm "Free sắp hết hạn" từ giá trị cột cũ sót lại).
  - `src/lib/planExpiryBanner.ts` (mới, hàm thuần + test) + `src/components/PlanExpiryBanner.tsx`
    (mới) — cửa sổ cảnh báo 5 ngày, đóng thì ẩn hết ngày hôm đó (giờ VN), hôm sau hiện lại nếu
    vẫn còn hạn. Bấm "Gia hạn ngay" điều hướng tới `/profile` (nơi có `UpgradeSection`).
  - Gắn vào `RequireAuth` trong `App.tsx` (cạnh `PromoEndingBanner`) — hiện ở MỌI trang đã đăng
    nhập + đã onboard (rộng hơn yêu cầu ban đầu "Dashboard/Profile", nhất quán với cách
    `PromoEndingBanner` đã làm).

- **[2026-07-28] Đăng nhập Facebook + Apple + Microsoft (cùng nhánh trên).** Thêm 3 kênh OAuth
  mới cạnh Google đã có, dùng chung hạ tầng `findOrCreateOAuthUser()` (refactor
  `findOrCreateGoogleUser` thành hàm generic theo cột `google_id`/`facebook_id`/`apple_id`/
  `microsoft_id`).
  - `postgres/migrations/0020_facebook_apple_login.sql` — cột `users.facebook_id`/`apple_id`;
    `0022_microsoft_login.sql` — cột `users.microsoft_id` (cùng khuôn mẫu `google_id`).
  - `api/_lib/authService.ts` — `verifyFacebookAccessToken()` (verify qua Graph API
    `debug_token` + `/me`, cần `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`); `verifyAppleIdToken()`
    và `verifyMicrosoftIdToken()` (verify chữ ký JWT qua JWKS công khai bằng thư viện `jose`
    mới thêm — KHÔNG cần Client Secret/private key vì không dùng luồng đổi authorization code
    phía server). Microsoft dùng authority `common` (chấp nhận cả tài khoản công ty/trường lẫn
    cá nhân outlook.com/hotmail.com) nên issuer chứa tenant id động — verify bằng REGEX thay vì
    so khớp chuỗi cố định như Apple/Google.
  - `src/lib/auth.ts` — `loginWithFacebook()`/`loginWithApple()`/`loginWithMicrosoft()` (tải SDK
    động — Facebook JS SDK, Sign in with Apple JS, MSAL.js — mở popup, gửi token về
    `/api/auth`). `src/pages/Login.tsx` — 3 nút mới cạnh nút Google.
  - `server.ts` — CSP `script-src` thêm `connect.facebook.net`, `appleid.cdn-apple.com`,
    `alcdn.msauth.net`.
  - **Lưu ý Apple:** email/tên CHỈ được gửi ở LẦN ĐẦU người dùng đồng ý chia sẻ — client PHẢI
    gửi kèm ngay lúc đó (đã làm), các lần đăng nhập sau id_token vẫn có email (kể cả địa chỉ
    ẩn danh `@privaterelay.appleid.com`) nhưng không có tên.
  - **VIỆC TAY BẮT BUỘC (ngoài khả năng AI) trước khi 3 nút này hoạt động:** tạo Facebook App
    tại developers.facebook.com (lấy `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`) + tạo Apple
    Services ID tại developer.apple.com (cần tài khoản Apple Developer Program TRẢ PHÍ, lấy
    `APPLE_CLIENT_ID`) + tạo App registration tại portal.azure.com (lấy `MICROSOFT_CLIENT_ID`,
    chọn loại "any organizational directory and personal Microsoft accounts") — điền vào
    `.env` trên VPS. Xem `.env.example` để biết chi tiết từng bước. Chưa điền thì nút vẫn hiện
    nhưng bấm vào sẽ báo lỗi kết nối (fail rõ ràng, không vỡ trang).
  - **Chưa chạy migration `npm run migrate:pg`** — cần chạy trước khi deploy (gồm cả `0019`-
    `0022` — xem mục nhiệm vụ ngay dưới).

- **[2026-07-28] Nhiệm vụ (quest) cho user — mở đầu bằng "Chia sẻ công khai" (cùng nhánh
  trên).** Nghiên cứu hạ tầng sẵn có (challenge/referral/weekly credit) rồi dựng bảng generic
  `quest_claims` (khoá theo `user_id` + `quest_key` + thời gian hồi) để MỞ THÊM nhiệm vụ mới
  sau này chỉ cần thêm hằng số, không cần migration mới — xem `api/_lib/quests.ts`.
  - `postgres/migrations/0021_quest_claims.sql` — bảng `quest_claims` + hàm SQL atomic
    `claim_quest_if_ready(user_id, quest_key, cooldown_days)`.
  - Nhiệm vụ đầu tiên: **"Chia sẻ công khai"** — bấm "Chia sẻ kết quả" (màn chấm điểm Chat/
    Challenge, `ShareResultCard.tsx`) và Web Share API xác nhận đã chọn nơi chia sẻ (không huỷ)
    → thưởng **+1 ngày gói Pro**, hồi sau **7 ngày** (khớp cửa sổ trượt gói Free) — API
    `POST /api/quests { action: 'claim-share' }`.
  - ⚠️ **CẢNH BÁO ĐÃ CHỦ ĐỘNG NÊU (chưa xin thêm xác nhận, đã triển khai với rate-limit là lớp
    phòng thủ duy nhất):** Web Share API KHÔNG cho server biết người dùng có thật sự đăng công
    khai hay không — chỉ biết họ đã mở hộp thoại chia sẻ hệ điều hành và không bấm huỷ. Về mặt
    lý thuyết một tài khoản có thể tự thưởng cho mình 1 ngày Pro mỗi 7 ngày mà không cần chia
    sẻ thật (mở hộp thoại rồi chọn "Sao chép liên kết" gửi cho chính mình). Đã chấp nhận rủi ro
    này ở QUY MÔ HIỆN TẠI (giá trị thấp — 1 ngày Pro/7 ngày, không đáng để cày công phu). Nếu
    sau này phát hiện lạm dụng thật: cân nhắc thêm `device_hash` như referral (migration 0008)
    hoặc đổi thưởng sang phi tiền tệ (huy hiệu...).
- **[2026-07-28] 3 nhiệm vụ verify server-side ĐÃ LÀM (tiếp Phần 4 ở trên, cùng nhánh).** Cả 3
  đều tính lại TỪ DB, không tin số liệu client gửi lên trực tiếp.
  1. **"Học liên tiếp 5 ngày"** (`streak_5`) — `getCurrentStreak()` đếm streak NGAY TỪ SERVER
     dựa trên `free_daily_credit.bonus_earned` (bảng này được `api/progress.ts` ghi mỗi khi
     phát hiện tiến độ học TĂNG THẬT — learned/hard/cefrGrammar/cefrDialogues dài ra so với
     bản lưu trước — áp dụng cho MỌI gói, không riêng Free). Thưởng +1 ngày Pro, hồi sau 7
     ngày. `POST /api/quests { action: 'claim-streak' }`.
  2. **"Thi đạt cấp CEFR"** (`cefr_exam_<LEVEL>`) — đọc `learning_progress.cefr_exams[level].
passed` (đã có sẵn từ trước, đồng bộ qua `/api/progress` khi thi). Cùng MỨC TIN CẬY với
     luật mở khoá cấp tiếp theo app đã dùng từ trước — không phải lỗ hổng mới do nhiệm vụ này
     tạo ra. Thưởng +1 ngày Pro/cấp, một lần duy nhất mãi mãi mỗi cấp (mô phỏng bằng cooldown
     36.500 ngày, tái dùng đúng 1 cơ chế `claim_quest_if_ready`, không thêm bảng riêng).
     `POST /api/quests { action: 'claim-cefr-exam', level }`. `src/components/CefrExam.tsx`
     tự động gọi ngay sau khi thi đạt (chờ `pushProgressAsync()` đẩy xong lên server TRƯỚC —
     hàm mới thêm vào `progressSync.ts`, bản awaitable của `pushProgress()` fire-and-forget cũ
     — để tránh claim đọc phải dữ liệu cũ chưa kịp đồng bộ).
  3. **"Mời bạn xác thực"** — gộp số liệu vào `GET /api/quests` để hiện chung 1 nơi.
  - **Trang mới `/quests`** (`src/pages/Quests.tsx`) — hub duy nhất liệt kê cả 4 nhiệm vụ
    (gồm cả "Chia sẻ công khai" ở Phần 4), đọc `GET /api/quests` (`getQuestsStatus()`). Link
    vào từ Hồ sơ (`Profile.tsx`, thẻ "Nhiệm vụ" trước mục Nâng cấp Pro).
  - `postgres/migrations` — KHÔNG cần thêm migration mới (tái dùng bảng `quest_claims` của
    Phần 4, đúng mục tiêu thiết kế generic ban đầu).
  - **[Chỉnh 2026-07-28] Thang thưởng chốt theo yêu cầu người dùng:** Chia sẻ công khai = 1
    ngày Pro · Học liên tiếp 5 ngày = 1 ngày Pro (2 mục này giữ nguyên) · **Thi đạt cấp CEFR
    tăng từ 1 → 3 ngày Pro** (`CEFR_EXAM_QUEST_REWARD_DAYS`, `api/_lib/quests.ts`) · **Mời bạn
    xác thực giảm từ 7 → 3 ngày Pro/bên** (`REFERRAL_REWARD_DAYS`, `api/_lib/referral.ts`) —
    UI (`Quests.tsx`, `ReferralSection.tsx`) đọc số ngày động từ API, không cần sửa thêm.

- **[Kế hoạch 2026-07-22] Giao diện + nội dung theo độ tuổi** — nhánh
  `claude/ui-redesign-age-groups-rk71g8`. Ý tưởng: app đổi giao diện thị giác và giọng điệu nội
  dung theo nhóm tuổi người dùng, đặc biệt nhóm Nhi đồng cần giao diện vui nhộn hơn hẳn. Đã
  nghiên cứu code thật (`src/lib/theme.ts`, `postgres/schema.sql`, `src/pages/Onboarding.tsx`,
  `src/pages/Profile.tsx`, `api/auth.ts`, `api/profile.ts`, `src/prompts/index.ts`) và **chốt
  cùng người dùng** các quyết định sau:
  - **4 nhóm tuổi:** Nhi đồng (<10) · Thiếu niên (10–15) · Thanh niên (16–22) · Người lớn (23+).
  - **Cả giao diện lẫn nội dung** đổi theo tuổi (không chỉ 1 trong 2).
  - **Lấy nhóm tuổi bằng cách hỏi lúc đăng ký/hồ sơ** — cột `age_group` trong `profiles`, KHÔNG
    hỏi ngày sinh thật, chỉ cho chọn thẳng nhóm (tránh thu thập dữ liệu nhạy cảm trẻ em).
  - **Nhóm Nhi đồng sẽ bị khoá cứng vào theme vui nhộn riêng** (GĐ 2, chưa làm) — không cho tự
    đổi sang 4 theme người lớn hiện có.
  - **4 giai đoạn nhỏ, mỗi giai đoạn 1 PR, dừng xin duyệt ở mỗi cổng.**

  **GĐ 1 (nền tảng thu thập nhóm tuổi) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
  format/test 613/613/size xanh — người dùng cần chạy migration thật để dùng được):**
  - `postgres/migrations/0002_age_group.sql` (mới) — cột `profiles.age_group` (text, check 4
    giá trị, cho phép NULL — user cũ chưa chọn tự fallback `'nguoi_lon'` ở code, KHÔNG ép migrate
    ngược). Rollback: `alter table profiles drop column if exists age_group`.
  - `api/profile.ts` — `GET` trả thêm `ageGroup` (NULL → `'nguoi_lon'`); `POST` mở rộng 2 action:
    `onboarding` (nhận thêm `ageGroup` optional, giữ nguyên giá trị cũ nếu không gửi — dùng
    `coalesce`) và action MỚI **`set-age-group`** (chỉ đổi đúng 1 cột — quyết định người dùng:
    tách riêng khỏi action `onboarding` thay vì tái dùng, giống pattern `setDailySpeed`/
    `setWeeklyGoal` chỉ đổi 1 giá trị). **Xác nhận sửa lại so với đề xuất ban đầu:** KHÔNG đụng
    `api/auth.ts` action `register` — level/goal/dailyMinutes vốn không lưu lúc đăng ký mà lưu
    sau đó qua `POST /api/profile` (từ bước cuối Onboarding), nhóm tuổi theo đúng luồng này.
  - `src/types.ts` — thêm `export type AgeGroup`.
  - `src/lib/onboarding.ts` — mở rộng `OnboardingData`/cache/`fetchOnboarding` theo đúng pattern
    2 tầng (cache localStorage → server) đã có; thêm `pushAgeGroup()` (bắn-rồi-quên, dùng cho
    Profile.tsx) + `isValidAgeGroup()`.
  - `src/pages/Onboarding.tsx` — **thêm bước chọn nhóm tuổi làm BƯỚC ĐẦU TIÊN** (quyết định người
    dùng: trước bước Trình độ, vì nhóm tuổi có thể ảnh hưởng giọng điệu các bước sau) — luồng
    onboarding từ 3 → 4 bước, progress bar + số thứ tự các bước sau đã dịch lại đúng.
  - `src/pages/Placement.tsx` — hàm `applyResultNow` (đổi trình độ từ trang Hồ sơ) giữ nguyên
    `ageGroup` đã có khi ghi đè lại profile (không vô tình xoá về mặc định).
  - `src/pages/Profile.tsx` — section mới "Nhóm tuổi" (pattern giống section tốc độ học/mục
    tiêu tuần đã có), gọi action `set-age-group` riêng qua `pushAgeGroup()`.
  - `src/lib/onboarding.test.ts` — cập nhật 3 test cũ theo field mới + 3 test mới (ageGroup lạ
    → fallback, server trả ageGroup hợp lệ → giữ đúng giá trị).
  - **Việc người dùng cần làm:** `npm run migrate:pg` trên VPS (hoặc máy dev) để tạo cột
    `age_group` trước khi deploy — thiếu cột này thì `api/profile.ts` sẽ lỗi SQL ngay.
    **GĐ 2 (theme "Nhi đồng" vui nhộn) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
    format/test 613/613/size xanh):**
  - `src/lib/theme.ts` — thêm `Theme = 'kid'` + hằng `KID_THEME` **tách riêng khỏi mảng
    `THEMES`** (không lọt vào vòng lặp cycle của `ThemeToggle` — theme này bị khoá, không phải
    lựa chọn tự do).
  - `src/index.css` — bảng màu `[data-theme='kid']` (nền kem ấm `#FFFBEB`-ish + nhấn cam chuẩn
    Tailwind orange-50..900). **Đã kiểm tương phản WCAG AA bằng tính toán thực tế** (script Node
    dùng đúng công thức luminance/contrast ratio W3C, không đoán): text chính (`--c-white`)
    ~16:1, text phụ (`--z-400`) ~6:1 trên nền thẻ/trang, nút `accent-500` nền cam + chữ đen
    ~7.5:1, `accent-800` (dùng cho `theme-light:text-accent-800`) ~6.7-7:1 — đều vượt xa ngưỡng
    AA 4.5:1 cho chữ thường.
  - `tailwind.config.js` — thêm `[data-theme="kid"] &` vào biến thể `theme-light:` (trước chỉ
    Blue sky/Pink) — **bắt buộc**, nếu không mọi chỗ đã sửa AA cho 2 theme sáng cũ sẽ KHÔNG áp
    dụng cho theme mới (mù màu cố định amber/rose/sky/teal... trên nền sáng).
  - `src/context/ThemeProvider.tsx` — đọc `age_group` qua `useOnboarding()` (đã có từ GĐ 1), tự
    áp theme `kid` khi `ageGroup==='nhi_dong'` và chặn `setTheme()` (khoá cứng). **Chủ ý dùng
    `applyTheme()` (chỉ đổi DOM hiển thị) thay vì `setTheme()`/`persistTheme()` khi khoá** —
    KHÔNG ghi đè `localStorage(ui_theme)` để giữ nguyên lựa chọn theme thật của user; đổi nhóm
    tuổi sau này (ra khỏi Nhi đồng) tự quay lại đúng theme đã chọn trước, không bị mất. Trong
    lúc `useOnboarding` đang tải (chưa biết chắc `ageGroup`) KHÔNG ép đổi theme — tránh giật
    theme mỗi lần load trang trước khi dữ liệu về.
  - `src/components/ThemeToggle.tsx` — ẩn hẳn nút đổi giao diện khi `locked` (không hiện dạng
    disabled, đơn giản hơn vì không có gì để đổi).
  - `.size-limit.json` — CSS budget 9.5→9.7kB (đo thật: thêm theme thứ 5 tốn +0.08kB brotli,
    ngân sách cũ chỉ còn dư 0.07kB nên chắc chắn vượt dù tối ưu).
  - `e2e/a11y.spec.ts` + `e2e/helpers/auth.ts` — thêm 2 test a11y riêng cho theme `kid` (Home +
    Profile, seed thẳng `localStorage.ui_theme='kid'` qua `mockLogin()` vì E2E không mock được
    `/api/profile` để giả lập `age_group` thật — theme vẫn render y hệt, chỉ khác cách được áp).
    **Phát hiện qua chạy E2E thật nhiều lần (không chỉ soát code), tìm đúng gốc rễ sau khi loại
    trừ các nghi ngờ sai:** ban đầu nghi "flaky do timing" (banner tĩnh "Xin chào" hiện gần như
    ngay lập tức nên `expect().toBeVisible()`/`waitForTimeout` ngắn không đủ chờ thẻ "Học tiếp"
    tính từ curriculum OFFLINE phía client render xong) — đã thử tăng chờ lên 1000ms/2000ms, dời
    vị trí test ra sau (tránh lúc dev server "nguội"), thêm tự-retry trong test: **vẫn fail y hệt
    1 lần trong mỗi lần chạy đủ 97 test**, chứng tỏ KHÔNG PHẢI flaky. Thêm log debug in chi tiết
    node/màu vi phạm khi fail → lộ đúng gốc rễ: `theme-light:text-accent-700` (badge "4 cách
    học"/"Nói" ở Home, dùng chung code cho cả Blue sky/Pink/kid) chỉ đạt **4.17:1** trên nền
    `bg-accent-500/15` của theme kid — THIẾU đúng 0.33 so với ngưỡng AA 4.5:1, một lỗi CONTRAST
    THẬT (không phải trạng thái thoáng qua) mà bước tính tay ban đầu bỏ sót vì không kiểm hết
    MỌI tổ hợp text/nền dùng `theme-light:`. Sửa bằng cách đổi `--a-700` (kid) sang giá trị
    orange-800 (154 52 18) → đạt ~5.9:1. Xác nhận: **97/97 test a11y xanh** sau khi sửa (trước
    đó luôn có đúng 1 fail, dù thử đủ cách chờ/retry). Bài học: KHÔNG vội kết luận "flaky do
    timing" khi 1 test fail lặp lại nhiều lần với cùng 1 nội dung lỗi giống hệt nhau — phải in
    chi tiết vi phạm ra để xác nhận trước khi chọn hướng sửa.
  - **Đã KHÔNG làm ở GĐ 2 này** (đúng phạm vi đã chốt, tránh phình việc): không thêm component
    đặc thù (nút to tròn, hiệu ứng confetti) hay theme riêng cho 3 nhóm tuổi còn lại — chỉ
    Nhi đồng có theme riêng, phần UI component lớn hơn để ngỏ nếu người dùng muốn làm thêm sau.
    **GĐ 3 (giọng điệu AI theo tuổi) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
    format/test 618/618/size xanh):**
  - `src/prompts/index.ts` — hàm mới `ageGroupToneBlock(ageGroup, dir)`: **CHỈ đổi giọng
    điệu/ví dụ minh hoạ, KHÔNG lọc lại kho từ vựng/chủ đề** (chủ đề hội thoại vẫn theo
    `situation` học viên tự chọn, đúng phạm vi đã chốt). Trả về khối hướng dẫn riêng cho
    `nhi_dong` (câu ngắn, nhiều emoji, ví dụ trường học/gia đình/thú cưng/trò chơi, tránh ví dụ
    người lớn) và `thieu_nien` (giọng trẻ trung ngang hàng, ví dụ bạn bè/học tập/sở thích/mạng
    xã hội) — mỗi nhóm 1 đoạn riêng bằng cả tiếng Việt (chiều A) lẫn tiếng Anh (chiều B).
    **`thanh_nien`/`nguoi_lon`/`undefined` (fallback mặc định của user cũ chưa từng chọn nhóm
    tuổi) trả về CHUỖI RỖNG — giữ NGUYÊN 100% hành vi prompt hiện có**, không đổi baseline eval
    cho phần lớn người dùng hiện tại (có test xác nhận `prompt(undefined) === prompt('nguoi_lon')
=== prompt('thanh_nien')`).
  - Thêm tham số `ageGroup?: AgeGroup` (optional, cuối danh sách tham số — không phá chữ ký cũ)
    vào `chatSystemPrompt`, `speakingSystemPrompt`, `writingSystemPrompt`; chèn `${tone}` ngay
    sau đoạn tình huống/giọng điệu sẵn có ở cả 2 chiều A/B của mỗi hàm.
  - `src/pages/Chat.tsx`/`Speaking.tsx` — tái dùng `onboarding` (hook `useOnboarding(user.id)`
    đã có sẵn từ trước, dùng để lấy trình độ mặc định) truyền thêm `onboarding?.ageGroup` vào cả
    2 điểm gọi (bắt đầu phiên + gửi tin nhắn) mỗi trang.
  - `src/pages/Writing.tsx` — **thêm mới** `useOnboarding(user.id)` (trang này trước đó chưa
    dùng hook này) để lấy `ageGroup`, truyền vào `writingSystemPrompt`.
  - `src/prompts/index.test.ts` (mới) — 5 test: mặc định không đổi (undefined/nguoi_lon/
    thanh_nien cho ra prompt GIỐNG HỆT nhau), nhi_dong/thieu_nien thêm đúng khối riêng (không
    lẫn nội dung 2 khối), cả speaking lẫn writing đều nhận đúng tham số.
  - **⚠️ CẦN NGƯỜI CÓ KEY AI CHẠY (sandbox không có key):** theo CLAUDE.md §8, mọi PR sửa
    `src/prompts/*` PHẢI chạy lại `npm run eval:tutor` và dán bảng so sánh với
    `docs/research/eval-tutor-baseline.md` vào mô tả PR trước khi merge. Vì `thanh_nien`/
    `nguoi_lon`/`undefined` cho prompt Y HỆT trước đây (đã có test xác nhận), **baseline không
    nên đổi cho các nhóm này** — nhưng vẫn cần chạy để xác nhận đúng theo quy trình đã định,
    và để có số liệu cho 2 nhóm mới (nhi_dong/thieu_nien) nếu muốn đánh giá riêng.
    **GĐ 4 (ẩn vòng không phù hợp trẻ em khỏi luồng học) — CODE XONG, cổng commit đã đạt
    (build/typecheck/lint/format/test 628/628/size/E2E a11y 97/97 xanh):**
  - **Phát hiện qua nghiên cứu (trước khi code, đã báo lại người dùng và xác nhận vẫn làm):**
    `lib/curriculum.ts` cache TOÀN CỤC (`_circlesCache`/`_pathCache`, không tham số) dùng
    CHUNG cho mọi người dùng — để lọc theo nhóm tuổi phải đổi cache sang **Map theo nhóm
    tuổi** (chỉ 2 khoá thực tế: `'nhi_dong'` và `'default'` — mọi nhóm khác hành xử y hệt
    trước đây) và nối tham số `ageGroup` xuyên suốt **6 file tiêu thụ**: `CefrExam.tsx`,
    `StudyPanel.tsx`, `CefrLevelPage.tsx`, `Placement.tsx`, `Dashboard.tsx`, `preloader.ts`
    (+ `Learn.tsx`/`Dictionary.tsx` truyền prop xuống `StudyPanel`). `StudyTabs.tsx` **KHÔNG
    cần sửa** — chỉ tiêu thụ `pool: DictEntry[]` đã được lọc sẵn từ trang cha, và
    `findCircleOfWord`/`getCircleProgress` tra cứu metadata của 1 từ ĐÃ CÓ trong pool nên
    dùng danh sách đầy đủ (mặc định) để tra là an toàn, không ảnh hưởng nội dung hiển thị.
  - `src/data/curriculum.ts` — thêm `Circle.notForKids?: boolean`; gắn `true` cho **12 vòng**
    chủ đề không phù hợp trẻ em (rà tay theo tiêu đề, không đoán): `business`, `workplace`,
    `money-finance`, `business-extended` (kinh doanh/công sở/tài chính) · `medical-advanced`,
    `mental-health` (y tế nâng cao/sức khỏe tinh thần) · `social-issues`, `law-justice`,
    `politics-government`, `economy-global` (vấn đề xã hội/luật pháp/chính trị/kinh tế) ·
    `abstract-concepts` (khái niệm trừu tượng) · `relationships-b1` (có từ "breakup" — chủ đề
    tình cảm). **KHÔNG gắn cờ** cho các vòng auto-sinh C1/C2 (`cefrC1C2Vocab.ts`) — không ai
    ở tốc độ học của trẻ em chạm mức C1/C2 trong thời gian ngắn, và các vòng đó không có tên
    chủ đề thủ công để phân loại đáng tin cậy.
  - `src/lib/curriculum.ts` — `getCircles(ageGroup?)`/`getLearningPath(ageGroup?)` lọc bỏ
    vòng `notForKids` khi `ageGroup==='nhi_dong'`; nối `ageGroup?` (optional, mặc định
    undefined = y hệt hành vi cũ) qua `getLevelWords`/`getBeyondCefrWords`/`getTodayBatch`/
    `getPathProgress`/`collectPathWords`. Từ của vòng bị ẩn **CHỦ Ý** không lọt sang phần
    "Mở rộng" (dùng `FOUNDATION` đầy đủ — không phải bản đã lọc — để tính tập từ cần loại
    khỏi "Mở rộng", đúng ý định "ẩn hẳn" chứ không phải "chuyển chỗ").
  - **⚠️ Phát hiện quan trọng khi test:** `FOUNDATION` trong `src/data/curriculum.ts` (TypeScript
    nguồn) KHÔNG được dùng trực tiếp lúc chạy — `lib/curriculumLoader.ts` nạp từ file JSON
    tĩnh đã sinh sẵn `public/data/curriculum.json` (qua `scripts/gen-curriculum-json.ts`, vì
    lý do hiệu năng — Vite tách thành chunk riêng, không cần bundle 9000+ dòng TS). Sửa
    `notForKids` trong file nguồn KHÔNG tự động phản ánh ra JSON — phải chạy lại
    `npx tsx scripts/gen-curriculum-json.ts` (an toàn chạy lại, ghi đè) để đồng bộ. **Việc
    người dùng cần làm khi deploy:** đảm bảo bước build/deploy có chạy lại script này (kiểm
    tra `scripts/deploy.sh`/`package.json` xem đã tự động hay chưa — nếu chưa, chạy tay 1 lần
    trước khi deploy nhánh này; nếu quên, `notForKids` sẽ không có tác dụng trên production
    dù code đã đúng).
  - `src/lib/curriculum.test.ts` — 11 test mới: xác nhận có ≥1 vòng gắn `notForKids` trong dữ
    liệu thật (không phải test rỗng), mặc định/`thanh_nien`/`nguoi_lon` không lọc gì,
    `nhi_dong` ẩn đúng và đủ 12 vòng, từ vòng ẩn không lọt qua cả lộ trình lẫn phần "Mở rộng",
    `getPathProgress`/`getTodayBatch`/`getLevelWords` phản ánh đúng số liệu đã lọc (dùng
    'workplace' — vòng thật nằm trong lộ trình CEFR chính thức qua `cefr.ts` — để xác nhận
    cấp chứa nó có ít từ hơn cho nhi_dong), cache theo nhóm tuổi vẫn giữ đúng tham chiếu.
  - Đã chạy lại `npx tsx scripts/gen-curriculum-json.ts` để đồng bộ JSON — diff chỉ thêm đúng
    12 field `"notForKids":true` (216 byte), không đổi/mất dữ liệu khác (đã xác nhận qua
    `git diff --stat`, kích thước gzip build không đổi vì file này tải lazy, không nằm trong
    bundle chính).

- **Rời Supabase (2026-07-19→20, xem `docs/migration-thoat-ly-supabase.md`)**: GĐ A (Postgres 16
  tự host trên VPS) + GĐ B (auth tự viết Bearer token thay Supabase Auth) + GĐ C lõi
  (profiles/daily_usage/learning_progress qua `/api/profile`/`/api/progress`) + GĐ D (Cloudflare
  R2 thay storage) **ĐÃ CUTOVER + XÁC NHẬN trên production**. **GĐ C phần còn lại ĐÃ CODE XONG
  (2026-07-19, 2 nhánh):** (1) PR #274 — `tts_cache`/`pronunciations`/`push_subscriptions` sang
  `pgPool`; (2) nhánh `claude/dong-bo-tiep-tuc-rr5ghs` (đã merge nhánh #274 vào cho đồng bộ) —
  route mới `/api/history` (lịch sử chat/viết/nói + learn_count, thay `cloud.ts` query Supabase),
  `/api/challenge` (thay `challengeCloud.ts`), `/api/tutor-feedback` (thay `tutorFeedback.ts`),
  `api/leaderboard.ts` sang `pgPool`, XÓA `src/lib/supabase.ts` (client hết sạch Supabase),
  thêm 6 route mới vào dev proxy `vite.config.ts`. **GĐ E (dọn dẹp) ĐÃ XONG (2026-07-20,
  cùng phiên):** gỡ `@supabase/supabase-js` khỏi `package.json`, xóa `api/_lib/supabaseAdmin.ts`
  - nhánh driver `supabase` trong `fileStorage.ts` (mặc định còn `local`/`r2`), xóa biến
    `SUPABASE_*`/`VITE_SUPABASE_*` khỏi `.env.example`/`vite-env.d.ts`/`vitest.setup.ts`/
    `playwright.config.ts`, xóa thư mục `supabase/` (schema cũ còn trong git history) — sửa
    3 script seed còn gọi Supabase trực tiếp sang `pgPool`+`saveAudio()`
    (`scripts/seed-pronunciations.ts`, `scripts/prefetch-tts-patterns.ts`, `scripts/seed-all.ts`),
    xóa 2 công cụ di trú 1 lần đã hết tác dụng sau GĐ D
    (`scripts/check-supabase-audio.ts`, `scripts/sync-storage-to-vps.ts`) + script migration
    Supabase cũ (`scripts/run-migrations.ts`, đã có `run-pg-migrations.ts` thay thế). **Phát
    hiện + vá 1 lỗi nghiêm trọng lúc dọn dẹp:** `deploy.sh`, `scripts/deploy.sh` (2 script deploy
    khác nhau, xem ghi chú dưới) và `.github/workflows/deploy.yml` đều gọi `npm run migrate`
    (script Supabase cũ vừa xóa) — nếu không sửa thì **deploy tiếp theo sẽ crash ngay bước
    migration** (`set -e`). Đã đổi cả 3 chỗ sang `npm run migrate:pg`. Cập nhật
    `CLAUDE.md` mục 4+6, `docs/deploy-vps-ubuntu.md` (viết lại Bước 0 + khối `.env` mẫu +
    troubleshooting), `docs/DEPLOY.md`, `docs/seed-guide.md`, `DEPLOY_QUICK_GUIDE.md`,
    `DEPLOY_STEPS.md`, `BILINGUAL_SYSTEM.md`. Xóa 4 doc gốc đã hoàn toàn lỗi thời
    (`SUPABASE_SYNC_SETUP.md`, `AUTH_SETUP.md`, `PRONUNCIATION_CACHE_SETUP.md`,
    `TTS_CACHE_SETUP.md`, `PRONUNCIATION_CACHE_SPEC.md` — 2 file cuối tự ghi "có thể xóa" sẵn
    trong nội dung). Build/typecheck/lint/format/size/test xanh trước khi commit (xem PR).
    **Bổ sung cùng PR (2026-07-20, theo yêu cầu "copy hết dữ liệu TTS từ VPS, cache qua R2"):**
    `scripts/sync-storage-to-r2.ts` (`npm run sync:r2`) — đẩy audio ĐÃ CACHE TRƯỚC KHI bật R2
    lên Cloudflare R2 qua `saveAudio()` rồi cập nhật `audio_url`; an toàn chạy lại, có
    `--dry-run`/`--force`/`BUCKET`/`LIMIT`. **Bản đầu SAI — đã sửa (2026-07-20, người dùng chạy
    thử trên VPS thật báo "0 dòng" ở cả 2 bucket):** bản đầu đọc danh sách file cần đồng bộ TỪ
    DB (`select ... from tts_cache`), nhưng quyết định 2026-07-19 "bỏ qua migrate dữ liệu người
    dùng cũ" khiến Postgres tự host khởi động RỖNG — DB không có dòng nào dù `uploads/` trên VPS
    vẫn còn hàng nghìn file audio cache từ trước cutover, nên script cũ luôn thấy "0 dòng" và
    không đẩy được gì (bug thật, không phải môi trường thiếu dữ liệu). **Đã viết lại:** quét
    THẲNG ổ đĩa (`uploads/tts-cache/**/*.mp3`, `uploads/pronunciations/*.mp3`), suy
    hash/lang/voice (tts-cache) hoặc word/voice (pronunciations) từ TÊN FILE, upload lên R2 rồi
    `INSERT ... ON CONFLICT` tái tạo dòng DB — không cần dòng DB có sẵn. An toàn 100% cho
    tts-cache (VOICE_VERSION nằm trong hash, hash cũ tự động không khớp nếu giọng đã đổi); với
    pronunciations phải GIẢ ĐỊNH `voice_version = VOICE_VERSION hiện tại` (không suy được từ tên
    file, ghi rõ trong code — rủi ro thấp vì hằng số này chưa từng đổi). **Bug thứ 2 phát hiện
    khi chạy thật trên VPS (2026-07-20, sau khi merge bản quét ổ đĩa):** bucket `tts-cache` có
    quá nhiều file (bằng chứng thật — VPS báo lỗi) khiến `walkMp3()` crash
    `RangeError: Maximum call stack size exceeded` — nguyên nhân: `out.push(...(await
walkMp3(...)))` dùng spread để gộp mảng con vào `out`, mà spread truyền MỖI phần tử thành 1
    đối số riêng cho `.push()` → tràn giới hạn số đối số của V8 khi thư mục có hàng chục nghìn
    file. Sửa: đổi `walkMp3` sang nhận `out` làm tham số TRUYỀN QUA THAM CHIẾU (gom bằng
    `out.push(rel)` từng phần tử, không spread mảng con) — đã tự kiểm bằng cách tạo 150.000 file
    giả trong sandbox và chạy hàm mới, xác nhận không lỗi (bản cũ chắc chắn crash ở quy mô này).
    **VẪN CHƯA CHẠY THẬT TRÊN VPS SAU BẢN VÁ NÀY** (chỉ soát code + tự kiểm hàm quét file,
    build/typecheck/lint/test xanh) — việc người dùng cần làm: SSH vào VPS, `git pull`,
    `STORAGE_DRIVER=r2 npm run sync:r2 -- --dry-run` xem trước → bỏ `--dry-run` chạy thật — xem
    `docs/migration-thoat-ly-supabase.md` mục 10 bước 7.

- **Nâng cấp 5 hạng mục sư phạm còn thua app lớn** — ĐẶC TẢ ĐÃ VIẾT + người dùng ĐÃ CHỐT cả 4
  quyết định (2026-07-15: theo thứ tự ưu tiên · LÀM Azure · LÀM giải đấu tuần M5 · THAY Challenge
  bằng giải đấu tuần M5b) → theo bảng ưu tiên 17 PR mà làm:
  `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md` (① chấm phát âm 2 giai đoạn · ② động
  lực duy trì (kể cả giải đấu tuần) · ③ nghe đa dạng · ④ placement test · ⑤ eval độ tin cậy AI).
  Tài liệu này KẾ THỪA các đề xuất D/H và V-4/V-5 bên dưới — khi làm theo nó thì đánh dấu mục
  trùng ở dưới. **Đã xong:** PR #1 (`lib/placement.ts` thuật toán bậc thang), PR #2 (trang
  `/placement` + nối onboarding) — PR #239, đã merge 2026-07-15. PR #3 (tốc độ phát TTS, ③ N1)
  — `RateToggle` toàn cục + `getRatePref`/`setRatePref` (`lib/tts.ts`) + `preservesPitch` +
  nối vào CefrLessonViews/Lessons/KaraokeText/Speaking/CommonPhrases/Dictionary — PR #240, đã
  merge 2026-07-15. PR #4 (xoay giọng nghe, ③ N2) — random giọng câu Nghe bài thi/placement
  (`ExamQuestion.audioVoice`) + `WordVoiceCycleButton` ở flashcard (xoay 4 giọng); hội thoại
  CEFR đã tự khác giọng theo vai A/B từ trước, không cần sửa — PR #241, đã merge 2026-07-15.
  PR #5 (golden set + eval baseline, ⑤ T1) — `scripts/eval-tutor-fixtures.json` (~60 câu),
  `scripts/eval-tutor.ts` (`npm run eval:tutor`, gọi đúng prompt+model+guardrail production qua
  `api/_lib/aiConfig.ts` mới tách), logic chấm thuần `scripts/lib/evalScoring.ts` + test (vào CI),
  luật eval khi đổi prompt/model ghi ở CLAUDE.md §8 — ĐÃ MERGE (PR #242, 2026-07-15). ⚠️ Số baseline
  (`docs/research/eval-tutor-baseline.md`) CẦN NGƯỜI CÓ KEY chạy `npm run eval:tutor -- --write-baseline`
  (sandbox Claude không có key AI). PR #6 (trap phát âm Việt + coach tip, ① G1) — đã merge
  (PR #244, 2026-07-15). PR #7 (mục tiêu tuần, ② M1) — `lib/weeklyGoal.ts` (3/5/7 ngày/tuần,
  tuần từ Thứ 2 giờ VN, cùng luật "ngày có học" với streak) + chọn ở `/profile` + vòng tiến độ
  `GoalRing` ở Dashboard + màn ăn mừng 1 lần/tuần (`WeeklyGoalCelebration`, nối sau màn streak
  trong StudyTabs) + đồng bộ cột `weekly_goal` (migration `0012`, hợp nhất updatedAt mới hơn
  thắng) — ĐÃ MERGE (PR #246, 2026-07-15), CÙNG PR đó: Challenge chuyển CHU KỲ TUẦN (xem quyết
  định mới bên dưới). PR #8 (huy hiệu, ② M2) — `src/data/achievements.ts` (~19 huy hiệu tĩnh,
  5 nhóm: streak 7/30/100/365 · từ vựng 100/500/1000 · qua cấp CEFR A1-C2 (6) · kỹ năng 10 phiên
  nói/10 bài viết đã chấm · challenge 10/30/100 bài + tuần trọn vẹn 7/7) + `src/lib/achievements.ts`
  (`checkNewAchievements` — CHỈ so dữ liệu ĐÃ CÓ SẴN, không thêm tracking mới; "chỉ cộng thêm",
  không thu hồi) — gọi ở 5 điểm chạm (học từ mới StudyTabs, nộp challenge, chấm bài viết, luyện
  nói, thi cuối cấp) + toast khi vừa đạt + lưới huy hiệu ở `/profile` (backfill huy hiệu cũ khi
  mở trang). ⚠️ KHÔNG làm "điểm phát âm ≥90 lần đầu" như đặc tả gốc — `pronounceScore.ts` chưa
  lưu lịch sử điểm, thêm tracking mới sẽ vượt phạm vi 1 PR nhỏ; thay bằng nhóm kỹ năng/challenge
  hiện có. Đồng bộ cột `achievements` (migration `0013`, hợp union) — ĐÃ MERGE (PR #247,
  2026-07-16). PR #9 (bài luyện nghe dictation, ③ N3) — tab thứ 6 "Nghe" ở trang cấp CEFR
  (`components/StudyTabs.tsx` `ListeningTab`, `pages/CefrLevelPage.tsx`), 2 chế độ: "Chọn nghĩa"
  (tái dùng `buildListeningQuestions` của `cefrExam.ts` — xuất khẩu thêm, cùng engine phần Nghe
  đề thi cuối cấp, tái dùng `ExamQuestionCard`) + "Gõ lại" (dictation — `lib/listening.ts` dựng
  câu từ hội thoại/ví dụ từ điển của cấp, chấm bằng `scorePronunciation`/`scoreWords` đã có).
  Tốc độ mặc định theo cấp (A1-A2 0.9× · B1-B2 1× · C1-C2 1.1×, `LISTENING_RATE_BY_LEVEL`) —
  nới kiểu `rate` của `speak()`/`speakBilingual()` từ `Rate` (0.75/1/1.25) sang `number` để nhận
  giá trị này (RateToggle không đổi) — ĐÃ MERGE (PR #248, 2026-07-16). PR #10 (vá prompt theo
  eval, ⑤ T2) BỊ CHẶN — cần baseline T1 trước (`npm run eval:tutor -- --write-baseline`, cần
  người có key AI, sandbox không có) → **bỏ qua tạm, làm PR #11 (comeback + Home "Hôm nay", ② M4)
  trước**. PR #11 — `lib/comeback.ts` (bỏ ≥3 ngày → banner "Mừng bạn quay lại" + phiên rút gọn
  5 thẻ SRS/3 từ mới qua `?tab=srs&cap=5`/`?tab=today&cap=3` mới thêm ở `TodayLesson`/`SRSReview`
  — CHỈ giới hạn batch/due list phiên đó, KHÔNG đổi tốc độ đã lưu) + `storage.daysSinceLastActivity`
  (mới) + `vocab.getRecentlyLearnedWords` (mới, cho gợi ý "Luyện nói với từ vừa học" ở Home —
  nối đề xuất B đã có CTA sẵn ở StudyTabs, đây là lối vào từ Home cho người không đang giữa
  phiên học) — ĐÃ MERGE (PR #249, 2026-07-16). PR #12 (nhắc thông minh, ② M3) — **PHẠM VI ĐÃ
  CHỐT VỚI NGƯỜI DÙNG (2026-07-16): chỉ làm phần NỘI DUNG xoay theo ngữ cảnh, KHÔNG làm "giờ
  nhắc thông minh"** (server tự chọn giờ gửi cần thêm tracking GIỜ hoạt động — `daily_usage`
  hiện chỉ có NGÀY — là đổi schema/thêm theo dõi, người dùng chọn không làm). Đã làm:
  `api/_lib/reminderContent.ts` (mới, hàm thuần) — `pickReminderMessage()` chọn 1 trong 5 mức
  ưu tiên: streak sắp mất (loss-aversion mạnh nhất) → SRS đến hạn → gần đạt mục tiêu tuần (còn
  đúng 1 ngày) → đang tham gia challenge (giữ nguyên) → chung chung (fallback cũ); `computeStreakAtRisk`/
  `computeWeeklyDaysDone` tính từ `daily_usage` 14 ngày gần nhất (không vé nghỉ streak — ước
  lượng nới tay chỉ để chọn nội dung, không phải số hiển thị chính thức). `api/push.ts`
  `sendReminders()` gọi các hàm này (Supabase query mới: `daily_usage` mở rộng 14 ngày +
  `learning_progress.srs`/`weekly_goal`), fail-open nếu lỗi. `api/_lib/date.ts` thêm
  `addDays`/`weekStartOf` (mirror `src/lib/date.ts`, đúng quy ước "api/\_lib không import từ
  src/lib" đã có từ trước). Giờ nhắc vẫn do người dùng tự chọn như cũ (`remind_hour`) — ĐÃ
  MERGE (PR #250, 2026-07-16). PR #13 (nút 👍/👎 + bảng `tutor_feedback`, ⑤ T3) — migration
  `0014` + `lib/tutorFeedback.ts` + nút vote cạnh mỗi khối "✅ Nhận xét" ở Chat.tsx/Speaking.tsx
  (👎 lưu `{userInput, aiFeedback}`, 👍 chỉ đổi UI không ghi DB, vote 1 lần/tin nhắn) — ĐÃ MERGE
  (PR #252, 2026-07-16). PR #14 (giải đấu tuần: migration + tính điểm tuần + `/api/leaderboard`,
  ② M5 phần 1/3) — migration `0015_league.sql` (cột `profiles.nickname`/`league_opt_in`,
  unique index không phân biệt hoa thường, khoá quyền ghi client như cột `plan` — chỉ server
  ghi được qua API mới); `api/_lib/leaderboard.ts` (hàm thuần: `currentWeekRange` tái dùng
  `weekStartOf` của `api/_lib/date.ts`, tính điểm tuần **1 điểm/lượt học từ-ôn SRS
  (`daily_usage.learn_count` — gộp chung vì app không tách 2 việc này thành 2 cột riêng) · 5
  điểm/phiên Chat-Viết-Nói · 15 điểm/challenge nộp**, `rankEntries` dense-rank, validate
  nickname 3-20 ký tự + lọc từ bậy cơ bản CHECK THEO TỪ NGUYÊN VẸN — tránh dương tính giả kiểu
  "Adam"/"Vladimir" chứa chuỗi con "dm"/"vl") + 24 unit test ca biên (tuần Thứ2/CN, cột null,
  đồng điểm, dương tính giả từ bậy). `api/leaderboard.ts` (mới, đăng ký ở `server.ts`): `GET`
  trả `{week, me, top}` (cache in-memory 5 phút theo tuần, chỉ tính điểm cho user đã opt-in);
  `POST {action:'set-nickname'|'opt-out'}` — trùng tên dựa vào unique index DB (bắt lỗi
  Postgres `23505` trả 409 thân thiện) thay vì tự query kiểm tra trước (tránh race condition).
  Điểm tính HOÀN TOÀN ở server từ dữ liệu server-side sẵn có (daily_usage/challenge_entries),
  client không gửi điểm lên (CLAUDE.md §4.2) — ĐÃ MERGE (PR #253, 2026-07-16). PR #15 (trang
  Giải đấu tuần + opt-in nickname, ② M5 phần 2/3) — thêm `LeagueSection` (mới,
  `src/components/LeagueSection.tsx`) vào NGAY trang `/challenge` hiện có thay vì tách route
  riêng (challenge = hoạt động ghi điểm cao nhất của giải, gộp chung 1 trang hợp lý hơn tách
  đôi — giữ đúng tinh thần "quay challenge vẫn dùng được không cần vào giải" của đặc tả): gọi
  `/api/leaderboard` qua `src/lib/leaderboardApi.ts` (mới) — chưa opt-in thì hiện ô nhập
  nickname + nút "Tham gia"; đã opt-in thì hiện hạng/điểm của mình + nút "Rời giải"; luôn hiện
  top bảng xếp hạng (kể cả chưa tham gia, để tạo động lực). Phát hiện qua E2E: nút "Thử lại"
  thiếu biến thể `theme-light:text-accent-800` → contrast 1.97 trên nền sáng (theme Blue
  sky/Pink), đã vá — bài học: MỌI màu `accent-400`/`red-400`... đặt trực tiếp trên nền
  `zinc-900` (tự đổi sáng/tối theo theme) đều phải kèm `theme-light:` tương ứng, không suy đoán
  từ các đoạn code khác trông giống — phải tự chạy `npx playwright test e2e/a11y.spec.ts` để
  bắt được lỗi này (không thấy qua build/lint/unit test). `vite.config.ts` thêm
  `/api/leaderboard` vào `API_ROUTES` (dev server proxy — thiếu dòng này thì trang gọi API mới
  sẽ 404 im lặng lúc `npm run dev`/E2E). ĐÃ MERGE (PR #254, 2026-07-16). **PR #16 KHÔNG CÒN VIỆC
  GÌ ĐỂ LÀM** (rà lại đặc tả sau khi #14+#15 merge, 2026-07-16): "gọn logic 30 ngày → chu kỳ
  tuần" đã xong ở PR #246, "huy hiệu M2" đã xong ở PR #247, và trang giải đấu ở PR #15 KHÔNG
  tách route riêng (gộp vào `/challenge` có sẵn) nên không có "đường cũ" nào cần redirect →
  ② M5/M5b (Giải đấu tuần) coi như ĐÃ XONG HẲN sau PR #14+#15, bỏ qua PR #16. **Tiếp theo:**
  PR #17 (Azure Pronunciation Assessment, ① G2 — người dùng đã chốt làm 2026-07-15) hoặc quay
  lại PR #10 (vá prompt theo eval) nếu có người chạy được baseline T1
  (`npm run eval:tutor -- --write-baseline`, cần key AI thật, sandbox không có). Cả 2 việc còn
  lại trong bảng ưu tiên đều cần MỘT bước của người dùng trước khi làm tiếp: PR #17 cần tự tạo
  `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` (chỉ cần lúc DEPLOY THẬT, code viết được ngay không
  cần key) — sandbox vẫn research pricing/API hiện hành trước khi code theo đúng KHUNG 3; PR
  #10 cần người có key AI chạy baseline trước.
- PR #17 (Azure Pronunciation Assessment — SERVER, ① Giai đoạn 2 phần 1/2): research-first
  (KHUNG 3) trước khi code — xác nhận lại free tier F0 (5h audio/tháng), REST API
  "recognition/conversation" (KHÔNG SDK), header `Pronunciation-Assessment` base64 JSON
  (`ReferenceText`/`GradingSystem`/`Granularity`/`Dimension`/`PhonemeAlphabet`), response
  `NBest[].PronunciationAssessment`/`Words[].Phonemes[]` — nguồn: Microsoft Learn + Q&A
  (link trong lịch sử chat phiên này). Migration `0016_pronounce_usage.sql` — cột
  `daily_usage.pronounce_count` + mở rộng danh sách cột hợp lệ của RPC
  `consume_usage`/`refund_usage` (0001/0004) — free 10/ngày, pro 100/ngày
  (`api/_lib/usage.ts` thêm mode `'pronounce'`, `src/types.ts` LIMITS đồng bộ). Thư viện mới
  `api/_lib/azurePronounce.ts`: hàm THUẦN `parseAzurePronounceResponse` (parse response Azure
  → shape rút gọn `{overall,accuracy,fluency,completeness,words:[{word,score,errorType,
phonemes:[{phoneme,score}]}]}` — chọn `PhonemeAlphabet:'IPA'` thay mặc định SAPI để khớp ký
  hiệu IPA đã có sẵn trong `src/data/pronunciationTraps.ts`, PR client sau map thẳng không cần
  bảng chuyển đổi) tách riêng khỏi `assessPronunciation` (gọi mạng) để test bằng fixture, không
  cần key thật — 12 test. Handler `api/pronounce-assess.ts` (đăng ký `server.ts` + parser JSON
  riêng 5MB do audio base64 lớn hơn giới hạn mặc định 64kb, giống `/api/stt`; `vite.config.ts`
  API_ROUTES cho dev) — chưa cấu hình `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` → 503
  `{fallback:true}` NGAY, KHÔNG trừ lượt (client PR sau tự rơi về Giai đoạn 1 miễn phí); lỗi
  Azure sau khi đã trừ lượt → hoàn lượt (đúng nguyên tắc "đường đi của tiền" của `/api/agent`)
  — 9 test. **Tác dụng phụ phát hiện được khi làm việc này:** `isUsageMode()` (dùng để validate
  `mode` gửi lên `/api/agent`) trước đó chấp nhận CẢ `'stt'` (và giờ sẽ chấp nhận cả
  `'pronounce'` nếu không sửa) — cho phép client gửi `mode:'stt'`/`'pronounce'` lên
  `/api/agent` để đếm nhầm sang cột khác, né giới hạn chat. Đã vá: `api/ai.ts` giờ dùng
  `CHAT_ENDPOINT_MODES` riêng (chỉ `chat`/`writing`/`speaking`) thay vì tái dùng `isUsageMode`
  dùng chung — thêm 5 test ca biên (`mode` lạ/số/null đều rơi về `'chat'`). **Chưa làm ở PR
  này (để PR sau):** client WAV convert (`src/lib/wav.ts`) + UI điểm âm vị chi tiết + fallback
  Giai đoạn 1 khi hết lượt/lỗi/chiều B. ĐÃ MERGE (PR #255, 2026-07-16). PR #17 phần 2/2
  (client): `src/lib/wav.ts` — hàm THUẦN `toMonoPcm16kHz` (downmix nhiều kênh + resample nội
  suy tuyến tính) + `encodeWavPcm16` (đóng gói header RIFF/WAVE/fmt/data 44 byte + PCM16) tách
  khỏi `blobToWav16kMono` (wrapper gọi `AudioContext.decodeAudioData` — CHỈ chạy được ở trình
  duyệt thật, không test bằng vitest/jsdom) — 10 test cho 2 hàm thuần (mono passthrough,
  downmix stereo, upsample/downsample đúng tỉ lệ, clamp biên độ, lượng tử hoá đúng int16).
  `src/lib/audioRecorder.ts` (mới, KHÔNG dùng lại `challengeRecorder.ts` — module đó gắn chặt
  hằng số/luồng dành cho Challenge quay video 180s, dùng chung sẽ lẫn ngữ nghĩa): ghi âm
  NGẮN chỉ-âm-thanh, trần mặc định 15s, cùng kiểu mã lỗi permission/unsupported như
  `challengeRecorder.ts` để nhất quán. `src/lib/pronounceAssessApi.ts`: convert WAV rồi gọi
  `/api/pronounce-assess`, phân biệt `fallback:true` (chưa cấu hình/hết lượt → nên rơi về
  Giai đoạn 1) với lỗi cứng (audio hỏng/mạng lỗi → báo thử lại) — 6 test (mock `blobToWav16kMono`
  - `fetch`). UI: `src/components/DetailedPronunciationCheck.tsx` (mới) — nút "Chấm chi tiết
    bằng AI (beta)" ghi âm → chấm → hiện overall/accuracy/fluency/completeness + chip màu theo
    điểm từng từ (bấm để xem từng âm vị, cùng ngưỡng màu 85/65/40 với `pronounceFeedback` của
    Giai đoạn 1 cho nhất quán cảm nhận) — nối vào `PronunciationCheck.tsx`, CHỈ hiện khi
    `lang==='en'` (Azure chưa hỗ trợ vi-VN). **Phát hiện qua E2E a11y (đã vá TRƯỚC KHI commit):**
    nút "Chấm chi tiết..." dùng `text-violet-300` không kèm `theme-light:` → lặp đúng lỗi contrast
    đã gặp ở PR #254 — lần này áp `theme-light:` cho MỌI màu cố định (violet/emerald/lime/amber/
    rose) ngay từ đầu thay vì để a11y test bắt sau. Đã tự xác nhận nút thực sự render trong DOM
    lúc quét (không phải quét "trúng" 1 trang không hiện component) trước khi tin cậy kết quả
    xanh. **Không tự map phoneme → tip tiếng Việt của bảng trap Giai đoạn 1** như đặc tả gốc dự
    kiến — Azure chấm theo `referenceText` mình cung cấp (không phải transcript độc lập như STT),
    nên logic "spoken khác target → tra bảng trap" của Giai đoạn 1 không áp dụng trực tiếp được;
    UI Giai đoạn 2 hiện điểm âm vị trực tiếp, việc map tip cụ thể để ngỏ cho đợt sau nếu cần. Code
    xong (build/typecheck/lint/size xanh, test 534/534, E2E 117/117 gồm quét a11y `/dictionary`
    xác nhận nút mới không vỡ contrast), chờ merge.
- **Quy tắc phân việc theo độ phức tạp** (CLAUDE.md mục 3, quyết định 2026-07-15): đọc đặc tả
  trước khi giao việc; việc phức tạp Opus tự làm, việc vừa giao subagent Sonnet, việc cơ học
  giao subagent Haiku — áp dụng cho mọi PR tiếp theo của mục trên.
- **Cải tiến sư phạm** (`docs/research/danh-gia-tien-trien-hoc-2026-07-07.md`, đề xuất A→H —
  bảng trạng thái trong tài liệu đó đã CŨ, rà lại 2026-07-16 theo việc thực đã merge): A (Sổ
  lỗi cá nhân) đã xong. B đã xong — nút "Luyện ngay N từ này bằng hội thoại" có sẵn ở màn
  batch-done (`StudyTabs.tsx`, `?words=`) TỪ TRƯỚC; PR #11 (M4) bổ sung lối vào từ Home. **C
  (sản xuất chủ động, gõ chính tả) + D (nghe hiểu) đã xong** — PR #248 (③ N3, tab "Nghe" ở
  trang cấp CEFR) làm đúng cả 2: "Chọn nghĩa" (D) + "Gõ lại"/dictation (C). **G (chấm phát âm
  cấp âm vị) đã xong** — PR #255/#256 (Azure Pronunciation Assessment, ① Giai đoạn 2). **E (ngữ
  pháp có vòng ôn lặp theo mastery) ĐÃ XONG (2026-07-16, "thêm tất cả" — người dùng chọn trộn
  vào tab Kiểm tra sẵn có thay vì làm màn ôn riêng)**: tận dụng LẠI engine SM-2 có sẵn
  (`src/lib/srs.ts`) thay vì viết engine mới — thêm 3 hàm mỏng `addGrammarToSRS`/
  `reviewGrammar`/`getDueGrammarLessonIds`, dùng tiền tố khoá `grammar:<lessonId>` để chia sẻ
  chung kho `srs_${uid}` với thẻ từ vựng mà KHÔNG đụng namespace (có test xác nhận 1 lessonId
  trùng tên 1 từ tiếng Anh vẫn tách biệt hoàn toàn 2 lịch ôn). `cefrProgress.ts`
  `markGrammarDone()` tự vào vòng ôn khi đánh dấu "đã học xong". `StudyTabs.tsx` `buildQuiz()`
  (tab Kiểm tra) nay ưu tiên chọn bài ngữ pháp ĐẾN HẠN trước (hết bài due mới rơi về ngẫu
  nhiên như cũ); trả lời đúng/sai tự suy ra đánh giá 'good'/'again' cập nhật lịch ôn tiếp theo
  (không hỏi người dùng tự chấm như thẻ từ vựng). `CefrLevelPage.tsx` thêm badge số đỏ trên
  tab "Kiểm tra" hiện số bài ngữ pháp đến hạn (cùng kiểu badge với tab "Ôn SRS"). Không cần
  bảng Supabase mới (đồng bộ qua `pushProgress` như mọi state SRS/grammar khác). 5 test mới
  (`srs.test.ts`), build/typecheck/lint/size xanh, test 551/551. **H (SM-2 → FSRS) ĐÃ XONG
  (2026-07-16, research-first theo KHUNG 3 trước — xem
  `docs/research/sm2-den-fsrs-2026-07-16.md`)**: thay ruột `src/lib/srs.ts` dùng thư viện
  `ts-fsrs@5.4.1` (FSRS-6, MIT, xác nhận field thật qua `node_modules/ts-fsrs/dist/index.d.ts`
  thay vì đoán) với `enable_short_term: false` (bỏ bước học theo PHÚT kiểu Anki mặc định, giữ
  đúng nhịp học theo NGÀY của app) — giữ NGUYÊN mọi chữ ký hàm public
  (`addToSRS`/`reviewWord`/`getDueWords`/`getSRSStats`/`getNextReview`/`getLeechWords`/
  `addToSRSKnown` + 3 hàm ngữ pháp ở trên) nên KHÔNG phải sửa `StudyTabs.tsx`/`Flashcard.tsx`/
  `Challenge.tsx`/`cefrProgress.ts`, áp dụng tự động cho CẢ từ vựng lẫn ngữ pháp (dùng chung 1
  engine từ đề xuất E). **Quyết định người dùng (2 điểm hỏi trước khi code):** làm NGAY + hướng
  chuyển đổi **"cắt hẳn, đặt lại từ New"** (khác khuyến nghị "chuyển dần" của tôi) — mọi thẻ SRS
  cũ (từ vựng + ngữ pháp) coi như học lại từ đầu, thực hiện tự nhiên qua đổi shape lưu
  `localStorage` (dữ liệu SM-2 cũ không còn khớp field mới). **Phát hiện qua test thật (không
  suy đoán công thức, chạy `node --input-type=module` trực tiếp `ts-fsrs` trước khi viết
  assertion):** `lapses` (leech/tab Từ khó) giờ chỉ tăng khi trượt SAU KHI đã học được — không
  tính lần trượt đầu tiên lúc thẻ còn mới (ngữ nghĩa hợp lý hơn SM-2 cũ); tie-break độ ưu tiên ôn
  đổi "ease thấp nhất" → "difficulty cao nhất" trước (cùng ý định: thẻ khó hơn ôn trước).
  **Bundle vượt ngân sách 5.71kB (116→121.71kB brotli, đo thật bằng `npm run size`)** — người
  dùng chọn nâng `.size-limit.json` lên 123kB thay vì huỷ, chấp nhận đổi ~5% bundle đầu lấy lợi
  ích giảm 20-30% lượt ôn. Build/typecheck/lint/format/size xanh, test 551/551. **F** (giữ
  chân) — streak freeze đã có từ trước; "tổng kết tuần" nay có thể coi là đã phủ một phần qua
  mục tiêu tuần (`weeklyGoal.ts`, PR #246) + màn ăn mừng, dù không phải 1 màn "tổng kết" riêng.
- **Gộp thẻ Home (2026-07-16, theo yêu cầu người dùng)**: 2 thẻ riêng "Các bài hội thoại mẫu"
  (`/lessons`) + "Các câu thông dụng" (`/phrases`) gộp thành 1 thẻ "Hội thoại và các câu thông
  dụng" (`src/pages/Home.tsx`), dùng lại đúng kiểu thẻ "group" đã có sẵn cho thẻ gia sư AI (1
  header + nút con) — sửa `ModeCard` type + render để chấp nhận lưới 2 HOẶC 3 nút con (trước
  chỉ cứng `grid-cols-3`). Khối "💡 Mẹo" (gợi ý bắt đầu từ Câu thông dụng rồi sang Luyện nói)
  chuyển từ đứng riêng ở CUỐI trang Home vào NGAY trong thẻ gộp này (field `showTip` mới trên
  kiểu `group`). Thêm i18n `dialoguesPhrasesTitleA/B`, `dialoguesPhrasesDescA/B`,
  `tagDialoguesPhrases` (cả 2 ngôn ngữ giao diện, giữ nguyên các key cũ vì `Lessons.tsx`/
  `CommonPhrases.tsx` không đổi, 2 trang đó vẫn còn nguyên). Build/typecheck/lint/size xanh,
  test 551/551, E2E 117/117 (a11y Home cả 4 theme).
- **Gộp tiếp thành nút "Nghe" trong thẻ gia sư AI (2026-07-16, theo yêu cầu người dùng)**: thẻ
  "Hội thoại và các câu thông dụng" ở trên bị XÓA hẳn — gộp thành 1 nút con "Nghe" (icon
  `Headphones`) NGAY trong thẻ "Học cùng gia sư AI" (nay 4 nút: Nghe · Chat · Nói · Viết, lưới
  2×2). **Quyết định người dùng khi hỏi trước khi code:** bấm "Nghe" mở 1 màn chọn nhỏ (modal,
  style giống hộp chọn giờ nhắc học ở `QuickActions.tsx`) cho chọn tiếp "Các bài hội thoại mẫu"
  (`/lessons`) hay "Các câu thông dụng" (`/phrases`), KHÔNG vào thẳng 1 trang cố định. State
  `showListenPicker` mới trong `Home.tsx`; sub-item "Nghe" dùng path giả `LISTEN_PICKER_PATH`
  để phân biệt với nav() bình thường trong `onClick` chung của mọi nút con nhóm. Khối "💡 Mẹo"
  đổi chữ tham chiếu "Câu thông dụng" → "Nghe" cho khớp nút mới (`tipPhrases`). Xóa hẳn các key
  i18n `dialoguesPhrasesTitleA/B`/`dialoguesPhrasesDescA/B`/`tagDialoguesPhrases` (không còn
  dùng ở đâu, xác nhận bằng grep trước khi xóa) — thêm `listen`/`listenDescA/B`/
  `listenPickerTitle`. Đã tự xác nhận bằng Playwright chụp ảnh thật (không chỉ đọc code): thẻ
  gộp hiện đúng 4 nút, bấm "Nghe" mở đúng modal 2 lựa chọn. Build/typecheck/lint/format/size
  xanh, test 551/551, E2E a11y Home 8/8 (cả 4 theme, không lỗi mới).
- **Bổ sung dạng biến thể từ điển** (`docs/research/bo-sung-dang-bien-the-tu-dien.md`) — **Bước
  2 + Bước 4 ĐÃ XONG (2026-07-16, "thêm tất cả")**:
  - **Bước 2 (gắn `base`)**: rà toàn bộ `IRREGULAR_VERBS`/`IRREGULAR_PLURALS`/
    `IRREGULAR_COMPARATIVES` (`src/data/irregularForms.ts`) so với từ điển, có kiểm tra **khớp
    pos** trước khi động vào (phát hiện vài từ đồng âm khác nghĩa mà từ điển chỉ lưu 1 nghĩa —
    vd "bear" chỉ có nghĩa danh từ "con gấu" dù bảng động từ bất quy tắc có "bear→borne"; tương
    tự "ring/spring/speed/dream/mistake" chỉ có nghĩa danh từ, "echo" chỉ có nghĩa động từ dù
    bảng số nhiều bất quy tắc kỳ vọng danh từ — **14 dạng bị BỎ QUA có chủ đích** vì lệch pos,
    không tự suy đoán/gộp nghĩa). 138 entry ĐÃ CÓ trong từ điển được gắn thêm `base` (vd
    went/gone→go, children→child, better/best→good). 95 entry CÒN THIẾU hẳn (64 dạng động từ +
    31 số nhiều bất quy tắc, vd hid/geese/appendices) được soạn tay theo đúng quy ước có sẵn
    (`vi`: "đã... (quá khứ/phân từ của X)" hoặc "những... (số nhiều của X)") và thêm vào 10 file
    `public/data/dictionary/chunk-*.json` (round-robin, tổng 12.073→12.168 từ) — `pos`/`level`
    lấy nguyên từ entry gốc, `ipa_vi` KHÔNG tự bịa mà tái dùng đúng phiên âm đã xác minh của
    "đã"/"những" (mọi `vi` mới đều cố tình bắt đầu bằng 1 trong 2 từ này). **7 dạng bị bỏ qua**
    vì từ gốc còn thiếu hẳn trong từ điển (louse/elf/parenthesis/fungus/memorandum/vertex/
    torpedo) — để dành đợt bổ sung từ điển sau. ~~**Nợ kỹ thuật MỚI phát hiện (chưa sửa)**:
    entry "played" có trường `forms` tự tham chiếu vô nghĩa~~ **ĐÃ TRẢ XONG (2026-07-17, xem
    mục "Dọn forms rác từ điển" bên dưới)**.
  - **Bước 4 (search hiểu biến thể)**: `src/lib/dictionaryApi.ts` xây `formsIndexCache` (dạng
    biến thể QUY TẮC từ trường `forms` đã tính sẵn → từ gốc) 1 lần rồi tái dùng; `searchDictionary`
    trả thêm `matchedForm` khi query khớp đúng 1 dạng KHÔNG có entry riêng (vd "books"/"played")
    và bản thân query đó CHƯA PHẢI 1 headword thật (tránh gợi ý nhầm khi 1 dạng biến thể trùng
    với 1 từ độc lập khác, có test riêng cho ca này). `src/pages/Dictionary.tsx` hiện dòng gợi ý
    `"books" là 1 dạng của "book"` ngay trên dải chip lọc loại từ. 7 test mới
    (`src/lib/dictionaryApi.test.ts`, mock `loadDictionary`). Build/typecheck/lint/size xanh,
    test 546/546. **Chưa xác nhận được qua trình duyệt thật** (môi trường phiên này không có
    `.env`/khoá Supabase nên `/dictionary` không load được để chạy Playwright sống) — đã bù bằng
    kiểm tra JSON hợp lệ + đếm entry đúng 12.168 bằng script + 7 unit test bao phủ đủ ca biên.
- **Dọn forms rác từ điển (2026-07-17, trả nợ kỹ thuật "played" ở trên — rà TOÀN BỘ 12.168
  entry)**: 3 lớp rác cùng gốc rễ (script `gen-word-forms.ts` tin quy tắc mù quáng):
  - **194 entry là dạng chia QUY TẮC của từ khác** (played/buying/goes/has/is/causes… + danh từ
    gentlemen/pajamas) từng bị coi như từ gốc → sinh forms chồng đuôi ("playedded"). Sửa TRONG
    generator (idempotent, chạy lại không tái nhiễm): thêm lượt 1 lập chỉ mục "dạng chia → từ
    gốc" (kể cả dạng chia ĐỘNG TỪ GIẢ ĐỊNH cho danh từ/tính từ gốc — bắt "displayed" dù
    "display" mang pos n; ưu tiên từ gốc là động từ thật nên "does"→do chứ không →doe); lượt 2
    bỏ forms + gắn `base` trỏ về từ gốc cho các entry này (194 base mới — search/UI "Xem từ
    gốc" dùng được ngay). Guard chống bắt oan: không đụng động từ bất quy tắc GỐC (feed ← fee),
    không tính khoá comparative ("flatter" động từ ≠ so sánh của flat), danh từ gerund
    (building/meeting) giữ nguyên số nhiều hợp lệ.
  - **Tính từ phân từ đuôi -ied** (fried/dried) bị sinh "frieder/friedest" → chặn trong
    `comparativeForms` ("red" 1 âm tiết thật vẫn có redder/reddest).
  - **Số nhiều vô nghĩa/SAI NGHĨA cho danh từ đặc biệt** — nặng nhất `corps→"corpses"` (= xác
    chết!), axis→"axises", oasis→"oasises", alumnus→"alumnuses", tennis→"tennises",
    sunglasses→"sunglasseses", jesus→"jesuses"… Bổ sung danh sách ngoại lệ ở
    `src/data/irregularForms.ts`: 10 bất quy tắc Hy Lạp/Latin (axes/oases/emphases/alumni/
    genera…), 8 bất biến (corps/chassis/headquarters/offspring…), 16 không đếm được (bệnh/môn
    chơi: diabetes/tennis/chess…), 29 chỉ-có-số-nhiều (sunglasses/amenities + số nhiều mà SỐ ÍT
    chưa có entry: cubs/lads/babes…), và set MỚI `NO_PLURAL_NOUNS` (danh từ riêng/ký hiệu:
    jesus/gps/les… — không chia, không hiện gì).
  - **Quyết định kèm theo**: entry biến thể (có `base`) bị LOẠI khỏi bộ chọn từ của vòng học
    (`gen-cefr-c1c2-vocab.ts` + `gen-a1b2-extra-vocab.ts` thêm filter `!e.base`) — biến thể để
    TRA CỨU, không thành thẻ học riêng (tránh trùng thẻ "played"/"goes" với thẻ play/go trong
    SRS; ~324 thẻ biến thể rút khỏi vòng A1-B2, 5 khỏi C1/C2). Tiến độ người học KHÔNG mất —
    lưu theo TỪ (`et_learned_`), vòng chỉ là suy diễn. Đã tái sinh chuỗi dữ liệu đủ thứ tự:
    dictionary → cefrC1C2Vocab → cefrA1B2ExtraVocab → curriculum.json → learn → form-examples.
  - Xác minh: quét script không còn chuỗi rác ở MỌI file data; Playwright sống trên
    `/dictionary` (5 kịch bản: "played" hiện nút Xem từ gốc, "books" gợi ý dạng của book,
    "playeds" hết gợi ý rác, "corps" hiện "corps (không đổi)", "axis"→axes + "sunglasses" không
    chip số nhiều). 9 unit test mới (`wordForms.test.ts`). ~~**Nợ nhỏ còn lại**: số nhiều kiểu
    "smokings/computings" của gerund không đếm được~~ **ĐÃ TRẢ (2026-07-17, xem mục ngay dưới)**.
- **Dọn nợ gerund plural (2026-07-17, tiếp nối mục "Dọn forms rác từ điển" ở trên)**: rà tay 206
  ứng viên danh từ đuôi "-ing" có `forms.plural` — LOẠI các từ không thật sự là gerund (king,
  ring, spring, thing, morning, darling, duckling, pudding… trùng đuôi ngẫu nhiên, không liên
  quan động từ, số nhiều vốn đúng) và các gerund CÓ số nhiều hợp lệ theo ngữ cảnh riêng
  (findings/warnings/meetings/buildings/trainings/hostings/mailings/sailings/bearings… — CỐ Ý
  không đụng, tiếng Anh thật sự dùng số nhiều những từ này). Chỉ chặn **62 từ có độ tin cậy
  cao**: thể thao/sở thích/lĩnh vực hoạt động thuần túy KHÔNG BAO GIỜ chia số nhiều trong tiếng
  Anh chuẩn (smoking, computing, swimming, boxing, camping, jogging, hiking, cycling, gambling,
  gardening, marketing, parking, shopping, wrestling… đủ 62 từ, xem `src/data/irregularForms.ts`
  → `UNCOUNTABLE_NOUNS`). Thêm vào set có sẵn (không tạo type mới) — tái sinh đủ chuỗi dữ liệu.
  Xác minh diff: ĐÚNG 62 entry đổi `forms` (plural→uncountable), không tác dụng phụ. 3 unit test
  mới (`wordForms.test.ts`) + Playwright sống trên `/dictionary` (smoking/computing/swimming
  hiện "không đếm được"; meeting/building VẪN giữ số nhiều — xác nhận không chặn oan). Build/
  typecheck/lint/format/size xanh, test 556/556, E2E 117/117.
- Gamification: **V-4 (mốc + huy hiệu) đã xong** (PR #8/#247, `src/data/achievements.ts`) và
  **V-5 (Home "Hôm nay") đã xong** (PR #11/#249, comeback + gợi ý luyện nói) — dòng cũ ghi
  "chưa làm" đã LỖI THỜI. **V-6 (âm UI) ĐÃ XONG (2026-07-16, người dùng chọn "thêm tất cả"
  3 việc còn lại):** `src/lib/sound.ts` (mới) — tổng hợp beep bằng Web Audio API (oscillator),
  KHÔNG tải file audio nào ($0 chi phí); `sound.correct()`/`sound.wrong()` (nốt cao/trầm ngắn)
  gọi cặp với `haptics.success()`/nhánh rung sai đã có sẵn ở mọi nơi chấm đúng/sai (quiz trắc
  nghiệm × 3 chỗ trong `StudyTabs.tsx`, dictation, đánh giá SRS, `Flashcard.tsx`, nộp
  `Challenge.tsx`); `sound.milestone()` (hợp âm 3 nốt tăng dần) gọi trong `Celebration.tsx`
  (dùng chung cho màn ăn mừng streak/mục tiêu tuần/huy hiệu/tuần trọn vẹn — không cần sửa
  từng nơi gọi `<Celebration>`). Toggle bật/tắt ở `/profile` (`isSoundEnabled`/
  `setSoundEnabled`, mặc định BẬT, tự phát thử 1 tiếng khi bật) — 5 test cho phần thuần
  (bật/tắt + xác nhận không bao giờ throw kể cả khi jsdom không có `AudioContext`, đúng nhánh
  "trình duyệt không hỗ trợ" thật). E2E a11y `/profile` + `/learning-path/a1` (nơi
  `StudyTabs`/`Flashcard` render) đều xanh ở cả 4 theme.
- **Hạ tầng hạn dùng gói Pro/VIP (2026-07-24)** — chuẩn bị kỹ thuật cho thanh toán, CHƯA nối
  cổng thanh toán thật/CHƯA chốt giá (xem "Quyết định quan trọng"): migration
  `0004_plan_expires_at.sql` (cột `profiles.plan_expires_at`, nullable = vĩnh viễn) ·
  `resolvePlan()` (`api/_lib/plan.ts`) coi Pro/VIP hết hạn là Free NGAY LÚC ĐỌC (áp ở
  `usage.ts`/`authService.ts`/`api/profile.ts`, không phụ thuộc job chạy đúng giờ) · job dọn
  dữ liệu `downgradeExpiredPlans()` (`api/_lib/planExpiry.ts`) chạy 1 lần/ngày trong
  `server.ts` (theo mẫu `startReminderScheduler` có sẵn) · endpoint
  `POST/GET /api/admin-grant-plan` (admin cấp/gia hạn Pro/VIP thủ công theo email + số ngày —
  dùng tạm trong lúc chưa có cổng thanh toán tự động, admin xác nhận chuyển khoản tay rồi gọi
  endpoint này).
- **Dùng thử Pro 5 ngày khi xác thực email (2026-07-27)** — hạ rào quyết định mua trước khi
  có cổng thanh toán thật: migration `0013_email_verify_trial.sql` (cột
  `profiles.trial_granted_at`) · `grantEmailVerifyTrial()` (`api/_lib/trial.ts`) cấp 5 ngày Pro
  qua `grantPlanDays()` dùng chung, **mỗi tài khoản đúng 1 lần vĩnh viễn** · nối vào nhánh
  `verify-email` của `api/auth.ts`, trả `{ trialGranted, trialDays }` cho UI
  (`EmailVerifySection.tsx`) khoe quà. **Vì sao cần cột riêng:** `changeEmail()` đặt lại
  `users.email_verified = null`, nếu chỉ dựa vào cờ đó thì đổi email → xác thực lại → nhận thêm
  quà, lặp vô hạn. Lỗi cấp quà bị nuốt có chủ đích — không được làm hỏng việc xác thực email.
  **Deploy kế tiếp cần `npm run migrate:pg`** (tự chạy trong `scripts/deploy.sh`).

> ~~🔴 KHẨN CẤP — Auto deploy lỗi liên tục (thiếu `SUPABASE_DB_URL`, phát hiện 2026-07-15)~~
> **ĐÃ HẾT HIỆU LỰC (2026-07-20)** — production đã rời hẳn Supabase (Giai đoạn A→E), deploy
> giờ dùng `DATABASE_URL` (Postgres tự host) + `npm run migrate:pg`, không còn phụ thuộc
> `SUPABASE_DB_URL`. Xem `docs/migration-thoat-ly-supabase.md`.

## ⚠️ Cần làm tay (không cần PR)

- **Migration `0028_tts_viseme_timeline.sql` — CHẠY TRƯỚC KHI DEPLOY đợt avatar timing.**
  Thêm cột `viseme_timeline jsonb` vào `tts_cache` (nullable, không phá dữ liệu cache cũ).
  Lệnh: `npm run migrate:pg` (đã nằm trong `scripts/deploy.sh`). Rollback nếu cần:
  `alter table public.tts_cache drop column viseme_timeline;`
  Muốn thấy hiệu quả thật cần `ELEVENLABS_API_KEY` trên VPS + chọn giọng VIP "Rachel";
  giọng Google Chirp3-HD không có timestamp nên vẫn chạy đường ước lượng như cũ.

- ~~Backup R2~~ **ĐÃ XONG (2026-07-29, người dùng xác nhận).** Phát hiện qua báo cáo "backup tự
  động lên R2 có nhưng không thấy chạy": cron `backup:r2` (Postgres → R2) chưa từng được thêm dù
  code/docs mục 7.2 đã có từ trước (chỉ có cron `pg_dump` local). Đã sửa: cấp quyền bucket
  `english-tutor-pg-backups` cho token R2, thêm `R2_BACKUP_BUCKET` vào `.env` VPS, upload 9 file
  backup tồn đọng, thêm cron `backup:r2`. Trong lúc rà soát phát hiện thêm lỗ hổng: `.env`
  (API key/secret) trước giờ KHÔNG được backup ở đâu cả — thêm mới `scripts/backup-env-to-r2.ts`
  - `scripts/restore-env-from-r2.ts` (mã hoá AES-256-GCM, dùng chung `R2_BACKUP_BUCKET`, xem
    `docs/setup-postgresql-vps.md` mục 7.3, PR #369 đã merge). VPS hiện có đủ **3 dòng cron**
    (`pg_dump` 5h03, `backup:r2` 3h10, `backup:env` 3h10) chạy hàng ngày, đã xác nhận upload thành
    công cả 2 loại. `ENV_BACKUP_PASSPHRASE` đã tạo mạnh (qua `openssl rand -base64 24`), lưu ở
    password manager, KHÔNG đặt trong `.env`.
- **Kế hoạch scale 50k concurrent (2026-07-25) — GĐ1-5 phần code/config/docs ĐÃ XONG
  (PR #321-#326), còn lại là việc hạ tầng thật cần người dùng tự làm:**
  1. **Mua thêm VPS** (khuyến nghị: tách Postgres/Redis ra 1 VPS riêng 6-8 vCPU trước tiên —
     xem runbook `docs/deploy-vps-ubuntu.md` mục "GĐ2"), sau đó thêm 2-3 VPS app khi k6 xác
     nhận cần (đo trước, đừng mua hết 1 lần).
  2. **Chạy `bash scripts/verify-pg-backup.sh`** trên VPS ít nhất 1 lần để xác nhận backup
     cron hiện có thật sự restore được (chưa từng kiểm chứng).
  3. **Cài k6 + chạy `npm run loadtest:k6`** (`BASE_URL=... VU_TARGET=... k6 run
scripts/load-test/k6-baseline.js`) nhắm staging/production — tăng dần VU_TARGET, KHÔNG
     nhảy thẳng lên 50k. Đây là bước đo THẬT còn thiếu — mọi con số vCPU trong kế hoạch hiện
     vẫn là ước lượng lý thuyết.
  4. Xem `docs/rollback-runbook.md` nếu có sự cố khi triển khai các bước trên.
  5. Xem `docs/research/ke-hoach-scale-30k-concurrent.md` (tên file cũ, nội dung đã cập nhật
     mục tiêu 50k) để biết đầy đủ bối cảnh/ngân sách/quyết định đã chốt.
- **Hạ tầng hạn dùng gói Pro/VIP (2026-07-24):** deploy kế tiếp cần `npm run migrate:pg` trên
  VPS để áp `postgres/migrations/0004_plan_expires_at.sql` (script deploy tự chạy, không cần
  làm tay riêng nếu deploy qua `scripts/deploy.sh` như bình thường). Cách cấp Pro/VIP thủ công
  (trong lúc chưa có cổng thanh toán thật): admin gọi
  `POST /api/admin-grant-plan` body `{ "email": "...", "plan": "pro", "days": 30 }` (Bearer
  token của admin, `days: null` = vĩnh viễn).
- **Nâng cấp giọng TTS 14 giọng + gói VIP + admin cấu hình (nhánh
  `claude/chirp-3-hd-voice-upgrade-c06eds`, chưa merge — 2026-07-21):**
  1. `npm run migrate:pg` trên VPS để tạo bảng `app_settings`
     (`postgres/migrations/0001_app_settings.sql`).
  2. Thêm `ADMIN_EMAILS=donghanhcungban.org@gmail.com` vào `.env` VPS (xác thực trang
     `/admin-settings`, xem `api/_lib/adminAuth.ts`).
  3. **QUAN TRỌNG:** toàn bộ code nhánh này viết trong sandbox KHÔNG có `node_modules`
     cài sẵn nên CHƯA từng chạy `npm run build`/`typecheck`/`lint`/`test`/`test:e2e` thật —
     PHẢI chạy đủ cổng mục 8 CLAUDE.md trước khi merge/deploy, đừng tin chỉ vì đã review
     code bằng mắt.
- ~~`SENTRY_DSN`/`VITE_SENTRY_DSN`~~ **ĐÃ XONG (2026-07-27, người dùng xác nhận)** — đã điền
  trên VPS, đã thấy lỗi test được ghi nhận trên Sentry. Không còn no-op.
- `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) trên VPS nếu chưa có — cần cho STT.
- `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` — TÙY CHỌN, chỉ cần khi muốn bật chấm phát âm chi
  tiết qua Azure (① Giai đoạn 2, PR #17). Tạo resource "Speech service" (free tier F0, 5h
  audio/tháng) ở Azure Portal → Keys and Endpoint, điền vào `.env` VPS. Thiếu 2 biến này thì
  `/api/pronounce-assess` tự trả lỗi "chưa cấu hình" (client rơi về Giai đoạn 1 miễn phí),
  KHÔNG làm vỡ app — không bắt buộc phải làm ngay.

## Quyết định quan trọng

- **[2026-07-31] Mở rộng thành nền tảng đa lĩnh vực — ĐÃ CHỐT.** Xem mục "Tiếp theo" ở trên +
  `docs/adr/0001-nen-tang-da-linh-vuc.md` (nguồn sự thật, đừng chép lại chi tiết ra đây kẻo lệch
  khi ADR được bổ sung sau này).

- **Bảng xếp hạng (LeagueSection trong `/challenge`) TẠM TẮT (2026-07-27).** Lý do: ở quy mô
  ít người dùng, bảng gần trống/chỉ vài người khiến người mới thấy app "vắng vẻ" và bỏ đi —
  phản tác dụng với mục tiêu giữ chân. Làm thành **cầu dao trong `app_settings`**
  (`leaderboardEnabled`, migration `0018_leaderboard_toggle.sql`) thay vì comment code, để admin
  tự bật lại qua `/admin-settings` KHÔNG cần deploy khi đủ đông người dùng hoạt động/tuần (đề
  xuất mốc tham khảo ~200). Component `LeagueSection.tsx` + `api/leaderboard.ts` giữ nguyên
  không xoá. Client đọc qua `isLeaderboardEnabled()` (`src/lib/appSettings.ts`), dùng ở
  `Challenge.tsx` giống cách `getLimits()` đã dùng (đọc trực tiếp lúc render, không qua context).
- **Challenge 30 ngày → nhập vào Giải đấu tuần (2026-07-15, quyết định người dùng).** Khi làm
  M5/M5b của `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md`: route `/challenge` thành
  trang Giải đấu tuần (redirect giữ link cũ), quay challenge = hoạt động ghi điểm (+15/ngày),
  bỏ khung 30 ngày chuyển chu kỳ tuần; dữ liệu `challenge_entries` + huy hiệu cũ giữ nguyên.
  **[Bổ sung 2026-07-15, làm cùng PR #7]** Người dùng yêu cầu "Challenge tính theo tuần luôn
  cho đồng bộ" (với mục tiêu tuần vừa làm) → phần "gọn challenge → chu kỳ tuần" (mục 16 bảng
  ưu tiên) ĐÃ LÀM NGAY, không đợi tới giải đấu (mục 14–15): bảng 7 ô Thứ 2→CN thay bảng 30 ô
  (dùng chung luật tuần `weekStartOf` của `lib/date.ts` với mục tiêu tuần), bỏ vé nghỉ/resume/
  restart/mốc 30 ngày, chủ đề xoay vòng theo tổng số bài đã nộp, tổng kết TUẦN vào Chủ nhật
  (so video đầu↔cuối tuần), ăn mừng "tuần trọn vẹn 7/7". Schema `challenge_entries` GIỮ NGUYÊN
  (cột `challenge_day`/`round` để nguyên — dữ liệu cũ không mất; prompt AI KHÔNG sửa để khỏi
  phải chạy lại eval). Phần bảng xếp hạng/điểm giải vẫn ở mục 14–15 như cũ.

- **Thanh toán Pro: KHÔNG làm (2026-07-11)** → **[Cập nhật 2026-07-24]** người dùng chủ động
  yêu cầu chuẩn bị TRƯỚC phần hạ tầng kỹ thuật (hạn dùng gói + cấp Pro thủ công qua admin —
  xem mục "Đã xong"), **CHƯA quyết định giá/cổng thanh toán/có siết hạn mức Free hay không**.
  App vẫn miễn phí như cũ, chưa có trang giá nào hiển thị cho người dùng thường. Việc còn lại
  khi quyết định thu phí thật: chọn cổng (khuyến nghị Casso/SePay — chỉ cần tài khoản ngân
  hàng cá nhân, KHÔNG cần hộ kinh doanh/MST như PayOS), chốt mức giá, trang `/upgrade` +
  webhook thanh toán thật gọi `admin-grant-plan` (hoặc endpoint tương đương) tự động thay vì
  admin gõ tay.
- **Giá gói ĐÃ CHỐT LẦN CUỐI (2026-07-27, thay bảng giá nháp cùng ngày):** Pro **20.000đ/10
  ngày · 40.000đ/tháng · 360.000đ/năm**; VIP **30.000đ/10 ngày · 75.000đ/tháng · 500.000đ/năm**.
  Đây là giá NIÊM YẾT — **dịp lễ/Tết sẽ giảm thêm**, mức và thời điểm quyết định sau từng đợt.
- **M2 Thanh toán Pro/VIP qua SePay: CODE ĐÃ XONG (2026-07-27)** — thay PayOS (PayOS đòi tư
  cách hộ kinh doanh/MST, SePay chỉ cần tài khoản ngân hàng cá nhân). **SePay KHÁC PayOS về bản
  chất:** không phải cổng trung gian, không giữ tiền, không có `checkoutUrl`, không redirect —
  chỉ theo dõi tài khoản ngân hàng và bắn webhook khi tiền về. Đã triển khai đúng mô hình đó:
  - **Schema:** migration `0014_plan_prices.sql` (bảng `plan_prices` — 3 chu kỳ `10day`/`month`/
    `year`, có `sale_price_vnd`/`sale_until` cho khuyến mãi dịp lễ sau này, ĐỘC LẬP với
    `promoUntil` sẵn có trong `app_settings` — trường đó là hạn mức lượt dùng, khác hẳn giá bán)
    · `0015_payments.sql` (bảng `payments`, UNIQUE `payment_code` + UNIQUE `provider_txn_id`
    chống trùng webhook ở TẦNG DB).
  - **Lib thuần (test kỹ, không đụng DB):** `api/_lib/prices.ts` (đọc giá + cache 30s + tính giá
    hiệu lực khi có khuyến mãi) · `api/_lib/sepay.ts` (sinh mã `ENVI` + 8 ký tự tránh nhầm
    0/O/1/I/L, dựng URL ảnh QR không gọi API ngoài, dò mã trong nội dung chuyển khoản không
    phân biệt hoa/thường, xác thực API Key bằng `timingSafeEqual`).
  - **API:** `GET /api/plan-prices` (công khai) · `POST /api/checkout` (tạo đơn, tự sinh mã, tự
    retry nếu trùng) · `POST /api/payment-webhook` (SePay gọi — chống trùng bằng
    `UPDATE ... WHERE status='pending'` + bắt lỗi `23505` cho ca hiếm hơn, kiểm tra đủ tiền mới
    cấp gói qua `grantPlanDays()` dùng chung, luôn trả `{"success":true}` khi đã xử lý xong để
    SePay không retry vô ích) · `GET /api/payment-status` (UI poll vì SePay không redirect) ·
    `GET /api/payment-history`.
  - **UI:** `UpgradeSection.tsx` trong `/profile` — chọn gói/chu kỳ → hiện QR + số tài khoản +
    nội dung chuyển khoản (nút sao chép) + đếm ngược 30 phút, tự poll tới khi `paid`. Ẩn hẳn nếu
    đã VIP.
  - **Test:** 40 test mới (unit thuần cho sepay/prices + handler-level cho 5 API), phủ đủ ca
    biên: sai khoá, tiền ra không liên quan, không khớp mã, thiếu tiền, webhook lặp, 2 webhook
    song song, UNIQUE violation, đúng số ngày theo từng chu kỳ.
  - **Còn lại là VIỆC TAY** (không phải code): đăng ký SePay + liên kết ngân hàng, điền
    `SEPAY_WEBHOOK_API_KEY`/`SEPAY_BANK_ACCOUNT`/`SEPAY_BANK_CODE` trên VPS, tạo webhook trỏ
    `/api/payment-webhook` + BẬT lọc tiền tố "ENVI", chạy `npm run migrate:pg` trước khi deploy,
    và nên chạy thử chuyển khoản thật số tiền nhỏ trước khi công bố rộng rãi.
  - Có đường xử lý tay cho ca người dùng gõ sai nội dung chuyển khoản (tiền vào nhưng không
    khớp đơn nào) — dùng `/api/admin-grant-plan` sẵn có, xem mục "Ca lệch" trong đặc tả.
  - Chi tiết đầy đủ: `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- **Đánh giá lại chi phí/hạn mức sau khi có giá bán thật (2026-07-27)** — phát hiện qua đọc
  code (không đoán): (1) `app_settings.promo_until` mặc định 2027-01-01 khiến `effectivePlan()`
  nâng MỌI gói lên 1 bậc — trong lúc bật, Pro/VIP nhận y hệt hạn mức + giọng, và Free được nâng
  lên hạn mức Pro. **Phải tắt khuyến mãi trong `/admin-settings` để giá bán mới có ý nghĩa.**
  (2) Giọng "Studio" ($24/1 triệu ký tự, KHÔNG có hạn mức miễn phí — đắt gấp 12 lần Chirp3-HD
  $2/1 triệu ký tự có 1 triệu miễn phí/tháng) đã **rút khỏi Pro, chỉ còn VIP**
  (`api/_lib/voiceAccess.ts`, `src/lib/voiceTiers.ts` — 2 nơi phải khớp tay, không share code
  api/↔src/). (3) Gói Free giới hạn còn 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon, đều đã
  seed sẵn nên phát ngay). Giá Google Cloud TTS xác nhận qua tài liệu thật, không suy đoán.
- **Hạn mức Pro/VIP đổi sang 1 số TỔNG lượt/ngày (2026-07-27, thay "5 số riêng theo chế độ")**
  — migration `0016_daily_total_limit.sql`: cột `app_settings.pro_daily_limit`/`vip_daily_limit`
  (mặc định Pro 30, VIP 300 — ĐÂY LÀ TỔNG, không nhân theo 5 chế độ) + hàm SQL
  `consume_usage_total` (SUM cả 5 cột `daily_usage` so với hạn mức, vẫn tăng đúng cột theo mode
  để giữ breakdown thống kê). Xoá 15 cột cũ (5 free đã CHẾT từ trước + 5 pro + 5 vip theo chế
  độ). `AdminLimitsPanel.tsx` viết lại: mỗi gói Pro/VIP chỉ còn 1 ô nhập, không còn hàng Free
  (Free không đọc `app_settings`, hiện ô đó chỉ gây hiểu nhầm).
- **Hạn mức Free đổi từ "tuần lịch" sang CỬA SỔ TRƯỢT 7 ngày liền kề thật (2026-07-27)** — quyết
  định chủ động để công bằng hơn với người học dồn cuối tuần (mô hình cũ 0012 reset cứng về 0
  mỗi thứ Hai, mất công tích luỹ nếu học nhiều vào thứ Bảy/Chủ nhật). Migration
  `0017_free_rolling_credit.sql`: bảng `free_daily_credit` (1 dòng/ngày/user, `bonus_earned` +
  `credits_spent`) + hàm `grant_daily_bonus_rolling`/`consume_rolling_credit`/
  `refund_rolling_credit` — "còn bao nhiêu lượt hôm nay" = tổng +5 nhận trong 7 ngày gần nhất
  trừ lượt đã dùng trong chính 7 ngày đó, trần tự nhiên vẫn 35 (không có cơ chế dồn bù ngày bỏ
  lỡ nên không cần cột cap riêng). `consume_rolling_credit` KHOÁ CÁC DÒNG trong cửa sổ bằng
  `SELECT ... FOR UPDATE` TRƯỚC rồi mới SUM (Postgres không cho `FOR UPDATE` cùng hàm gộp) —
  chống 2 request song song cùng đọc "còn lượt" rồi cùng trừ vượt quá số thật. Bảng
  `weekly_ai_credit` (0012) GIỮ NGUYÊN, không xoá — code đã ngừng đọc/ghi, dọn ở migration sau
  khi xác nhận mô hình mới chạy ổn trên production.
- **Giữ nguyên phiên bản:** Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — không nâng v4/flat config.
- **Bundle-size budget (`size-limit`) thay Lighthouse CI** — Lighthouse không đo được trong môi
  trường sandbox/CI hiện có (`NO_FCP` ở mọi cấu hình). Cân nhắc lại nếu có runner thật sau này.
- **Zod validate input** đã rollout xong toàn bộ `api/*.ts` (đợt cuối `ai.ts`, dùng Zod v4).
- **Nhiều phiên làm việc có thể chạy song song** trên cùng repo — kiểm tra PR đang mở trên
  GitHub trước khi bắt đầu 1 kế hoạch lớn đã có sẵn trong `docs/research/`, tránh trùng công sức.
- **Gộp mọi script audio cache về 1 file `scripts/seed-all.ts` (2026-07-20, theo yêu cầu người
  dùng).** Trước đó có 3 script rời: `seed-all.ts` (seed nội dung), `sync-storage-to-r2.ts`
  (đẩy audio local → R2), `verify-r2-sync.ts` (đối chiếu R2 thật + xoá local an toàn). Đã gộp
  2 script sau vào `seed-all.ts` dưới dạng menu "s"/"v" (tương tác) hoặc cờ
  `--sync-r2`/`--verify-r2` (CI/cron) — xóa hẳn 2 file cũ + 2 dòng `package.json`
  (`sync:r2`/`verify:r2`). Không đổi logic bên trong (copy nguyên hàm, chỉ đổi tên biến/hàm
  tránh trùng namespace) — chưa tự chạy được trong sandbox này (không cài `node_modules`) nên
  CHỈ xác nhận bằng: không trùng định danh (grep), ngoặc cân bằng toàn file, và `prettier
--write` parse thành công không lỗi cú pháp. Cập nhật `docs/seed-guide.md` mục 5+7 +
  `docs/migration-thoat-ly-supabase.md` bước 7 theo lệnh mới. **Việc người dùng cần làm:** SSH
  VPS, `git pull`, thử `STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run` xác nhận
  chạy đúng trước khi tin tưởng hoàn toàn (chưa test bằng máy thật).

- **Đợt tối ưu `scripts/seed-all.ts` — remap/verify/dọn orphan (2026-07-23→24, PR #308–#315,
  đã merge hết).** Từ thực tế chạy thật trên VPS (bảng `tts_cache` phình tới ~1,25 triệu dòng
  sau đợt mở rộng 14 giọng Chirp3-HD), phát hiện + sửa liền một mạch:
  - #308: `verifyDb()` từng coi câu pattern hợp lệ (đúng giọng/version, chỉ đơn giản ngoài
    top-N `seed-index.json`) là "orphan" → xoá nhầm cache còn dùng được; remap-only ("m")
    trước đó chỉ quét top-N nên cache giọng cũ của các câu ngoài top-N không bao giờ được
    remap. Sửa: bảo vệ hash pattern hợp lệ khỏi bị tính orphan + remap-only quét ĐỦ 100/100
    câu/chủ thể (remap không tốn API nên quét hết không sao) — seed thật (tốn phí) vẫn giữ
    nguyên top-N (mặc định 20/100, `TOP_N` khi chạy `npm run rank:patterns`).
  - #310: nhánh remap gọi `verifyDb()` quét lặp lại 2 lần tập hash pattern đầy đủ (~1,6
    triệu) → OOM. Thêm cờ `patternsAreFull` để bỏ bước quét dư thừa.
  - #311: log Postgres xác nhận VPS bị **restart ngoài ý muốn** (nghi cập nhật hệ điều hành
    tự động) giữa lúc script chạy hàng giờ → lỗi `57P01` làm crash toàn bộ tiến trình. Thêm
    `withDbRetry()` (backoff 1s/3s/8s) cho các vòng đọc/xoá dài.
  - #312: `cleanOrphans()` chạy im lặng suốt vòng xoá (có thể hàng trăm nghìn dòng) — thêm
    progress bar (`cli-progress`).
  - #313: vòng xoá orphan vốn TUẦN TỰ (1 dòng/lần, mỗi dòng 1 round-trip network) — đổi
    sang chạy song song có giới hạn (`DELETE_CONCURRENCY = 12`, khớp pool DB `max: 10`).
  - #314: `getR2Client()` tạo `S3Client` MỚI mỗi lần gọi (rò rỉ handle/socket) — cache lại 1
    instance dùng chung, sửa OOM khi xoá nhiều orphan liên tục.
  - #315: `fetchAllRows()` dùng LIMIT/OFFSET — mỗi trang phải quét & bỏ qua toàn bộ dòng
    trước đó (O(n²)), ở bảng >1 triệu dòng thành "treo" thật sự. Đổi sang **keyset
    pagination** (`where (khóa) > khóa_cuối`, dùng index). Đồng thời `verifyDb()` từng gom
    CẢ bảng `tts_cache` (kèm `audio_url`) vào 1 mảng trong RAM cùng lúc với nhiều Set lớn —
    đổi sang **stream từng trang** (`streamRows()`), bỏ hẳn mảng đầy đủ.
  - Kết quả người dùng xác nhận: hết treo, hết OOM, tốc độ xoá orphan "cải thiện rất nhanh".

## Nợ kỹ thuật còn mở

- **[Rà soát tự động 2026-08-03]** Chạy lại đầy đủ cổng commit sau `npm ci` sạch: build ✅ ·
  typecheck ✅ (4 tsconfig: gốc/api/e2e/`apps/hub`) · lint ✅ (0 cảnh báo) · test ✅ (**103 file /
  1683 test**). Không có lỗi code mới. `npm audit`: **5 lỗ hổng (4 high, 1 low)** — khớp đúng dự
  đoán ở mục nâng cấp react-router bên dưới (2 high cũ `postcss`/`brace-expansion` + 1 high mới
  `react-router` CSRF RSC Mode + 1 low `esbuild`), không phát sinh gì ngoài dự kiến. Phát hiện 1
  tài liệu lỗi thời: `.claude/report-status.sh` dòng nợ kỹ thuật #1 vẫn ghi react-router "chưa
  nâng cấp" dù đã nâng lên v7.18.2 từ 2026-08-02 — đã sửa lại đúng hiện trạng (hết 2 CVE moderate
  cũ, chấp nhận 1 cảnh báo high mới vì app không dùng RSC Mode). E2E Playwright vẫn KHÔNG chạy
  được trong sandbox này (không có `.env`/Postgres thật) — như các lượt rà soát trước.

- **[2026-08-02] react-router: ĐÃ NÂNG LÊN v7 (phương án 1 bước), package.json đổi
  `react-router-dom` `^6.24.1` → `^7.18.2`.** Cổng commit đạt đủ: build ✅ · typecheck ✅ (4
  tsconfig) · lint ✅ (0 cảnh báo) · test ✅ (103 file / 1473 test) · dev server khởi động sạch
  (HTTP 200, không lỗi console). Không sửa file nào khác ngoài `package.json`/`package-lock.json`
  — đúng như dự đoán trong đặc tả (Declarative Mode, không data router/loader/action/`<Outlet>`).
  **Lưu ý audit:** `npm audit` hết 2 CVE moderate cũ, nhưng phát sinh 1 cảnh báo **high** MỚI
  (`GHSA-qwww-vcr4-c8h2`, CSRF trong **RSC Mode** — React Server Components, dải
  `>=7.12.0 <8.3.0`) — **chưa có bản vá nào** (react-router v8 chưa phát hành trên npm tính đến
  2026-08-02). App này **không dùng RSC Mode** (không `react-router.config.ts`, không action
  route) nên không khai thác được thực tế — chấp nhận cảnh báo audit này, sẽ tự hết khi có bản vá
  phát hành và nâng tiếp. **Chưa chạy E2E Playwright** (cần Postgres thật, sandbox không có) — cần
  chạy trước khi merge như cổng merge CLAUDE.md mục 9 yêu cầu. Kế hoạch gốc + đánh giá "chuyển
  sang data router/loader/action/SSR" (đã đề xuất KHÔNG làm — chi phí lớn, lợi ích nhỏ vì app hầu
  hết sau đăng nhập, VPS 1 vCPU không nên tăng tải server-render) ở
  `docs/research/dac-ta-nang-cap-react-router-v7-2026-08-02.md`. Trước đó
  chọn phương án trước khi làm.
- **[2026-08-02] `restore:r2 -- --restore-into`: đã viết runbook kiểm thử, CHỜ BẠN TỰ CHẠY TRÊN
  VPS.** Sandbox Claude Code web không có Docker daemon/mạng tới VPS nên không tự test được nhánh
  phá huỷ dữ liệu tại đây. Đã soạn quy trình 7 bước an toàn (dùng database TẠM
  `english_tutor_restore_test`, không đụng `english_tutor` production) ở
  `docs/kiem-thu-restore-into-staging.md` — gồm đối chiếu số liệu trước/sau, dọn dẹp, và lý do cố
  tình KHÔNG tự động hoá thành 1 script (cần người đọc log/phán đoán chênh lệch số liệu).
- **[Audit toàn diện 2026-08-01 — phát hiện mới]** Tầng 1–6 theo `docs/framework/QUY-TRINH-AUDIT.md`
  đều đạt (build/typecheck/lint/format/1033 test/bundle-size ✅, 0 secret hardcode, 0 high/critical
  `npm audit`, coverage 52.94/87.02/79.93/52.94% vượt sàn 48/87/76/48). Nợ còn lại:
  - 🟡 `react-router`: 2 lỗ hổng **moderate** (CVE-2025-68470 bypass + arbitrary constructor
    injection qua `deserializeErrors()`), có fix qua `npm audit fix` — chưa nâng cấp, cần kiểm tra
    không phá route trước khi merge (đổi major/minor react-router-dom).
  - 🟡 `restore:all`/`restore:system`/`restore:r2`: mới kiểm chứng nhánh AN TOÀN (tải về, xác nhận
    2026-08-01). Nhánh `--restore-into <db> --yes` (DROP + tạo lại database thật) CHƯA test thật —
    chỉ nên chạy lần đầu trên database phụ/staging, không thử trực tiếp trên `english_tutor` production.
  - Đã sửa 2 lỗi tài liệu lỗi thời tìm thấy: `.claude/report-status.sh` (hardcode text cũ báo sai
    Sentry/thanh toán Pro/branch protection/migration Supabase "chưa xong" dù đã xong từ lâu) và
    `docs/framework/QUY-TRINH-AUDIT.md` (ngưỡng CSS bundle ghi 9.7kB thật là 11kB, ngưỡng coverage
    ghi số đo 2026-07-02 đã lỗi thời so với `vitest.config.ts` hiện tại).
  - 2 test a11y (`/progress`, `/profile` theme blue-sky) fail 1 lần do "Execution context destroyed"
    (Playwright flaky khi nhiều test a11y chạy song song dội rate-limit) — chạy lại riêng cả 24 test
    theme blue-sky đều pass, không phải lỗi a11y thật, không cần xử lý thêm.

- **[Rà soát tự động 2026-08-01, phiên sau]** Chạy lại đầy đủ cổng commit: build ✅ · typecheck ✅
  (4 tsconfig: gốc/api/e2e/`apps/hub`) · lint ✅ (0 cảnh báo) · test ✅ (**103 file / 1249 test** — tăng
  từ 1033 vì nội dung Nghe + đối chiếu SGK mới thêm sau ngày ghi audit ở trên). Không có lỗi code mới.
  **Đính chính `npm audit`:** dòng "0 high/critical" ở mục audit toàn diện phía trên **đã lỗi thời** —
  chạy lại `npm audit` ngay bây giờ ra **5 lỗ hổng: 2 high, 2 moderate, 1 low** (advisory database
  npm cập nhật liên tục trong ngày, không phải do code đổi):
  - 🔴 `postcss` (phụ thuộc TRỰC TIẾP qua Tailwind, high, `GHSA-r28c-9q8g-f849`) — Path Traversal khi
    tự nạp source map (`sourceMappingURL`) lộ file `.map` tuỳ ý. Chỉ chạy lúc BUILD, không lọt vào
    bundle chạy trên trình duyệt người dùng — rủi ro thực tế thấp nhưng nên nâng khi có bản vá
    tương thích Tailwind 3.
  - 🔴 `brace-expansion` (gián tiếp qua `eslint`/`glob`, high) — DoS bộ nhớ, chỉ ảnh hưởng tool dev,
    không chạy trên server production.
  - 🟢 `esbuild` (gián tiếp qua Vite, low) — chỉ ảnh hưởng dev server chạy trên Windows.
  - `react-router`/`react-router-dom` (moderate) — vẫn là mục đã biết ở trên, chưa đổi.
  - `npm audit fix` (không `--force`) KHÔNG giải quyết dứt điểm 2 mục high vì bản vá nằm sâu trong
    cây phụ thuộc của `eslint`/`tailwindcss`/`vite` — cần nâng major các gói này mới hết, trái quy
    tắc "GIỮ NGUYÊN PHIÊN BẢN" (CLAUDE.md mục 6) nên CHƯA tự làm, cần người dùng quyết định trước.
  - E2E (Playwright) KHÔNG chạy trong lượt rà soát này (môi trường phiên không có `.env`/Postgres để
    kết nối) — chỉ xác nhận cổng commit, chưa phải cổng merge đầy đủ.

- **PM2 cluster mode: ĐÃ XÁC NHẬN chạy đúng cơ chế trên VPS thật (2026-07-25),
  nhưng hiệu quả bị giới hạn bởi phần cứng — xem cuối mục.** (nhánh
  `claude/project-100k-active-users-8292zf`, đặc tả `docs/research/dac-ta-gd1-scale-30k.md`
  Việc A + fix PR #322.) Bối cảnh: PM2 cluster mode ĐÃ ROLLBACK
  về fork mode (2026-07-20, PR #285) vì PR #283/#284 làm worker crash im lặng khi chạy thật
  trên VPS (Node `cluster` module không tương thích loader ESM `--import tsx`). Lần này gỡ
  ĐÚNG nguyên nhân: thêm `tsconfig.server.json` + script `build:server` (`npm run build` gọi
  kèm) biên dịch `server.ts` + `api/**/*.ts` sang JS thật ở `dist-server/` (ESM/NodeNext,
  đã phải thêm đuôi `.js` vào ~150 import tương đối trong `api/` cho đúng chuẩn Node ESM).
  `ecosystem.config.cjs` đổi `script: './dist-server/server.js'` (bỏ `interpreter: tsx`),
  `instances: 'max'`, `exec_mode: 'cluster'`. Phát hiện thêm khi build thật: `server.ts` +
  `api/_lib/dictionaryData.ts` dùng `__dirname`/`import.meta.url` để tìm `dist/` (frontend),
  `uploads/`, `public/data/dictionary/` — các đường dẫn này SẼ SAI khi tính từ vị trí file đã
  biên dịch (nằm trong `dist-server/`), đã sửa sang `process.cwd()` (ổn định vì PM2 luôn cwd
  = gốc repo). **Đã kiểm chứng trong sandbox dev**: `node dist-server/server.js` chạy
  standalone, `/api/health` 200, `/api/dictionary` đọc đúng 12.168 từ.

  **[Cập nhật 2026-07-25, xác nhận trên VPS thật]** Deploy đầu tiên sau merge PR #321 phát hiện
  `pm2 reload` không đổi được `exec_mode` của process đang chạy (log vẫn `ids: [ 1 ]`, cluster
  mode chưa hề áp dụng) — đã vá bằng PR #322 (`scripts/pm2-reload.sh` tự phát hiện lệch
  exec_mode → `pm2 delete` + `pm2 start`; đồng thời bật `wait_ready`/`kill_timeout` cho
  zero-downtime thật). Deploy tiếp theo (commit `d801a8e`, run
  [30154933490](https://github.com/seeker19110/bilingual-english-vietnamese/actions/runs/30154933490))
  xác nhận log đúng như thiết kế: phát hiện đổi `fork_mode → cluster_mode`, xoá + start lại,
  health check OK sau 1s.

  **NHƯNG: log PM2 báo `App [english-tutor] launched (1 instances)`** — dù cấu hình
  `instances: 'max'`, chỉ có **đúng 1 tiến trình** được tạo. Kết luận gần như chắc chắn: **VPS
  hiện tại chỉ có 1 vCPU** (`'max'` = số core thật của máy). Cơ chế cluster mode ĐÃ ĐÚNG và chạy
  ổn định, nhưng **không có lợi ích song song thật** cho tới khi máy có nhiều hơn 1 core — đây
  là bằng chứng cụ thể xác nhận GĐ2 (thêm VPS, tách máy khỏi app "xboss" dùng chung) là điều
  kiện BẮT BUỘC, không phải tuỳ chọn, để kế hoạch scale 50k concurrent
  (`docs/research/ke-hoach-scale-30k-concurrent.md`) có ý nghĩa thực tế. Nợ kỹ thuật này coi là
  **đã đóng về mặt cơ chế** (không cần sửa code thêm), còn mở về mặt **phần cứng** (chuyển sang
  GĐ2).

  Cũng cần đặt `REDIS_URL` (xem mục ngay bên dưới — rate limit chuyển sang Redis) trước khi bật
  cluster mode nhiều tiến trình thật (sau khi thêm VPS ở GĐ2), không thì rate limit lỏng hơn N
  lần (N = số tiến trình).

- **Rate limit chuyển từ `Map` in-memory sang Redis khi có `REDIS_URL` (2026-07-25, Việc B
  cùng đặc tả trên).** `api/_lib/security.ts` `checkRateLimit()` giờ là async: có
  `REDIS_URL` → đếm atomic qua Lua script (INCR + PEXPIRE có điều kiện) dùng chung mọi tiến
  trình/máy; không có (hoặc Redis lỗi) → fallback `Map` in-memory y hệt hành vi cũ
  (FAIL-OPEN, không bắt buộc — dev/local không cần Redis). Đã thêm dependency `ioredis`.
  **Chưa kiểm chứng** bằng Redis thật nhiều tiến trình (sandbox không có Redis server) — cần
  xác nhận trên VPS cùng lúc với cluster mode ở trên.
- ~~**E2E `mockLogin` không còn khớp luồng đăng nhập thật**~~ **ĐÃ TRẢ XONG (PR #282,
  2026-07-20)** — `e2e/helpers/auth.ts` nay gieo đúng key Bearer token
  (`gsa_session_token_v1`) VÀ dùng `page.route()` chặn `GET /api/auth?action=me` trả profile
  giả. Dòng cũ ghi "chưa làm" đã lỗi thời (viết trước PR #282, xác nhận lại 2026-07-20 khi
  quét toàn diện nợ kỹ thuật).
- ~~**2 script deploy trùng lặp**~~ **ĐÃ GỘP (2026-07-20, người dùng xác nhận giữ
  `scripts/deploy.sh`)** — xóa hẳn `deploy.sh` gốc repo (kém đầy đủ hơn); `.github/workflows/
deploy.yml` không còn tự inline các bước, nay gọi thẳng `bash scripts/deploy.sh` (1 nguồn
  chân lý duy nhất cho cả thủ công lẫn tự động). Đã cập nhật mọi doc còn nhắc `deploy.sh` gốc
  (`docs/DEPLOY.md`, `docs/deploy-vps-ubuntu.md`, `DEPLOY_STEPS.md`, `CLAUDE.md`).
- **[Ý tưởng, 2026-07-30] Phòng chat cho bạn bè cùng luyện tập** — chưa làm, mới bàn sơ bộ.
  2 hướng: (1) chat đơn giản lưu tin nhắn qua PostgreSQL + polling định kỳ, tận dụng hạ tầng
  `api/` hiện có — nhẹ, làm được ngay; (2) chat real-time thật (WebSocket, typing indicator,
  online status) — nặng hơn nhiều, cần thêm WebSocket server và sẽ vướng scale vì VPS hiện
  chỉ có 1 vCPU + chưa có Redis dùng chung giữa các tiến trình (xem nợ kỹ thuật cluster mode ở
  trên). Cần người dùng chọn hướng trước khi làm.
- Không còn hạng mục a11y/kiểm thử lớn nào mở. Xem "Tiếp theo" ở trên cho việc sản phẩm còn dở.
- `docs/research/thu-thach-vlog-30-ngay.md` dùng tên cũ "Vlog" (tính năng đã đổi tên thành
  "Challenge" — route `/challenge`, bảng `challenge_entries`) — tài liệu đó là ghi chép lịch sử
  tại thời điểm merge, cố ý giữ nguyên tên cũ, không phải lỗi.
- **Kế hoạch khôi phục sự cố server (2026-07-25).** Thêm
  `docs/ke-hoach-khoi-phuc-su-co-server.md` — quy trình ứng phó tổng thể khi server sập/gặp sự
  cố (chẩn đoán nhanh, phân loại theo triệu chứng, xử lý từng kịch bản: VPS không phản hồi, PM2
  crash, hết ổ đĩa, Postgres lỗi, restore backup, SSL hết hạn, quá tải/DDoS, nghi bị xâm nhập —
  kèm checklist xác minh + mẫu post-mortem). Khác `docs/DEPLOY.md` (deploy + fix nhanh) và
  `docs/rollback-runbook.md` (rollback cấu hình theo PR cụ thể) — 3 file bổ sung nhau, không
  trùng. Đã liệt kê "cải tiến nên cân nhắc" cần người dùng quyết định (chưa tự làm): uptime
  monitoring tự động, điền DSN Sentry, tăng tần suất backup Postgres, và điền thông tin liên hệ
  khẩn/nhà cung cấp VPS vào bảng đầu file (việc duy nhất người dùng cần tự điền tay).
