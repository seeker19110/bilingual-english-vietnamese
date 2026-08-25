# Đặc tả nghiên cứu — Môn LẬP TRÌNH (trụ Learning) — 2026-08-24

> Tài liệu research-first (KHUNG 3) cho môn học mới **Lập trình** trong trụ Learning của nền
> tảng DHCB. Yêu cầu người dùng (2026-08-24): _"nghiên cứu môn học lập trình, trang bị đầy đủ
> giáo trình, hướng dẫn từ A→Z, ví dụ ứng dụng ngay vào thực tế, bài học từ đơn giản đến phức
> tạp, cấu trúc tiêu chuẩn, dạy những ngôn ngữ trong 10 năm tới vẫn còn dùng ở mức cao."_
>
> Trạng thái: **ĐẶC TẢ — chưa code.** Môn mới phải cắm vào khuôn 5 mảnh của
> `dac-ta-kien-truc-platform-dhcb-2026-08-23.md` mục 4, KHÔNG được đòi sửa nền tảng.

## 0. Nguyên tắc bám sát

1. **Bám khuôn platform:** Lập trình là MỘT MÔN như english/math — dùng lại auth, usage
   (đếm lượt theo mode), billing Pro/VIP, SRS, TTS/AI gateway, theme/a11y. Không tự chế lại.
2. **Tiếng Việt là ngôn ngữ giảng dạy.** Giải thích khái niệm bằng tiếng Việt, thuật ngữ giữ
   tiếng Anh kèm giải nghĩa (vì tài liệu ngành + tên hàm đều tiếng Anh — học viên phải quen).
3. **Ưu tiên miễn phí / chi phí thấp:** chạy code phía TRÌNH DUYỆT trước (không tốn server),
   AI chỉ dùng cho phản hồi/giải thích và có đếm lượt.
4. **Chuẩn ngành làm xương sống, không tự bịa giáo trình:** đối chiếu ACM/IEEE **CS2023**
   (chương trình đại học CS), **K-12 Computer Science Framework** (phổ thông Mỹ), **SFIA 9**
   (khung kỹ năng nghề ICT), Chương trình GDPT 2018 môn Tin học (Việt Nam), và các giáo trình
   mở đã được kiểm chứng đại trà (CS50, freeCodeCamp, The Odin Project, MDN Curriculum).
5. **Luật sản phẩm số 1 vẫn áp dụng:** kết quả chẩn đoán trình độ KHÔNG bao giờ là màn hình
   chính — chỉ dùng để chọn bài kế tiếp.

## 1. Vì sao môn Lập trình, cho ai

- Khớp trụ Learning ("nhiều môn") và trụ Career/Work: lập trình là năng lực nghề có cầu cao
  nhất trong 8 họ nghề của đặc tả năng lực cá nhân; môn này nối thẳng sang lộ trình Career.
- Đối tượng: (a) học sinh 10–18 học tư duy lập trình nền tảng (khớp tài liệu năng lực 10–18);
  (b) sinh viên/người đi làm muốn chuyển nghề hoặc nâng bậc (khớp thang 5 bậc thành thạo);
  (c) người đi làm ngoài IT cần "biết đủ dùng" (tự động hoá Excel/số liệu bằng Python, SQL).
- Khác biệt phải giữ (giống môn English): **giải thích bằng tiếng Việt sát đời sống VN**,
  ví dụ ứng dụng NGAY vào thực tế Việt Nam (tính tiền điện bậc thang EVN, quản lý quán cà
  phê, đọc file Excel lương…), giá rẻ, có Companion đồng hành thay vì bảng điểm phán xét.

## 2. Chọn ngôn ngữ dạy — tiêu chí "10 năm tới vẫn dùng ở mức cao"

### 2.1 Căn cứ nghiên cứu (không đoán)

Đối chiếu chéo 4 nguồn xếp hạng nhiều năm (TIOBE, Stack Overflow Developer Survey, IEEE
Spectrum, RedMonk) + 3 tín hiệu độ bền:

- **Khối lượng hệ thống đang chạy (installed base):** ngôn ngữ có hàng tỷ dòng code production
  không thể biến mất trong 10 năm (bài học COBOL — 60 năm vẫn chạy ngân hàng).
- **Nguồn nuôi (steward) sống khoẻ:** có công ty/foundation lớn đứng sau và dùng nội bộ.
- **Vị trí không thể thay thế trong stack:** ngôn ngữ "độc quyền" một tầng (JS với trình
  duyệt, SQL với dữ liệu quan hệ, C với nhân hệ điều hành) bền hơn ngôn ngữ phải cạnh tranh.

### 2.2 Kết luận chọn — 3 tầng

| Tầng                        | Ngôn ngữ                    | Lý do bền ≥ 10 năm                                                                                                            | Vai trò trong giáo trình                                       |
| --------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **1 — Lõi (bắt buộc)**      | **Python**                  | #1 TIOBE/IEEE nhiều năm liên tiếp; độc quyền mảng AI/data — mảng đang tăng trưởng mạnh nhất; cú pháp dễ nhất cho người mới    | Ngôn ngữ HỌC ĐẦU TIÊN, dạy tư duy lập trình + ứng dụng thực tế |
| **1 — Lõi (bắt buộc)**      | **JavaScript + TypeScript** | Độc quyền trình duyệt (mọi web đều chạy JS); TS là chuẩn de-facto của JS chuyên nghiệp (chính repo này dùng)                  | Nhánh WEB — thứ học viên "nhìn thấy được" sớm nhất             |
| **1 — Lõi (bắt buộc)**      | **SQL**                     | Chuẩn ISO từ 1987, mọi ngành đều có dữ liệu quan hệ; kỹ năng "ai cũng cần" kể cả ngoài IT                                     | Môn nền dữ liệu, dạy song song từ bậc P3                       |
| **2 — Nghề (chọn 1 nhánh)** | **Java**                    | Installed base doanh nghiệp/ngân hàng khổng lồ + Android; tuyển dụng VN rất cao                                               | Nhánh backend doanh nghiệp                                     |
| **2 — Nghề (chọn 1 nhánh)** | **C#**                      | Microsoft nuôi, .NET hiện đại, game (Unity), doanh nghiệp                                                                     | Nhánh backend/.NET/game                                        |
| **2 — Nghề (chọn 1 nhánh)** | **Go**                      | Google nuôi; độc quyền hạ tầng cloud (Docker/Kubernetes viết bằng Go); cú pháp nhỏ dễ dạy                                     | Nhánh backend cloud hiện đại                                   |
| **3 — Nâng cao (tự chọn)**  | **C/C++**                   | Nhân HĐH, nhúng, game engine — không thể thay trong 10 năm; nền để HIỂU máy tính                                              | Chuyên đề "hiểu sâu bộ nhớ/hiệu năng"                          |
| **3 — Nâng cao (tự chọn)**  | **Rust**                    | Tăng trưởng bền 8 năm liền "most admired" (SO Survey); được nhận vào Linux kernel, Windows, Android — tín hiệu 10 năm rõ nhất | Chuyên đề hệ thống an toàn bộ nhớ                              |

**KHÔNG dạy làm lõi:** framework mau đổi (dạy React/Express ở tầng DỰ ÁN, không phải tầng
giáo trình — giáo trình dạy khái niệm component/HTTP/API để framework nào cũng học lại nhanh);
ngôn ngữ đang thoái trào rõ (Perl, Objective-C) hoặc quá hẹp thị trường VN.

**Trình tự mặc định cho người mới:** Python (P1–P3) → HTML/CSS/JS (P2–P3 song song nếu chọn
hướng web) → SQL (P3) → TypeScript hoặc 1 ngôn ngữ tầng 2 (P4) → tầng 3 (P5+, tự chọn).

## 3. Cấu trúc tiêu chuẩn — thang bậc P1→P6 (tương tự CEFR A1→C2)

Tái dùng đúng khuôn "mỗi cấp 1 trang riêng" của English (`CefrLevelPage`). Thang bậc ánh xạ
chuẩn ngành: P1–P2 ≈ K-12 CS Framework + Tin học GDPT 2018; P3–P4 ≈ lõi CS2023 mức nhập môn
(SDF/AL cơ bản); P5 ≈ SFIA bậc 3 (developer làm việc độc lập); P6 ≈ SFIA bậc 4–5.

| Bậc    | Tên                       | Can-do (mục tiêu đầu ra đo được)                                                                                     | Ước lượng  |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| **P1** | Nhập môn tư duy           | Đọc-hiểu và viết chương trình tuần tự: biến, kiểu, nhập/xuất, if, vòng lặp; trace được code trên giấy                | 4–6 tuần   |
| **P2** | Nền tảng vững             | Hàm, danh sách/chuỗi, dict, file; chia bài toán thành hàm nhỏ; debug bằng đọc lỗi + print                            | 6–8 tuần   |
| **P3** | Làm được việc thật        | Dự án nhỏ hoàn chỉnh (CLI/web tĩnh); SQL cơ bản; Git; đọc tài liệu thư viện tự dùng thư viện mới                     | 8–10 tuần  |
| **P4** | Lập trình có cấu trúc lớn | OOP, module hoá, xử lý lỗi chuẩn, test tự động, gọi/dựng API HTTP, TypeScript hoặc ngôn ngữ tầng 2                   | 10–12 tuần |
| **P5** | Kỹ sư tập sự              | CTDL & giải thuật nền (big-O, tìm kiếm/sắp xếp, cây/đồ thị cơ bản), CSDL thiết kế schema, dự án full-stack có deploy | 12–16 tuần |
| **P6** | Chuyên sâu                | Chuyên đề tự chọn: hệ thống (C/Rust), phân tán/cloud (Go), AI ứng dụng (Python), phỏng vấn thuật toán                | mở         |

**Cấu trúc CHUẨN của một bài học** (mọi bài đều đúng khuôn này — "cấu trúc tiêu chuẩn"):

1. **Móc thực tế (≤ 3 câu):** vấn đề đời thật VN mà bài này giải được.
2. **Khái niệm (giải thích tiếng Việt):** ngắn, có hình/sơ đồ khi cần, thuật ngữ Anh kèm nghĩa.
3. **Ví dụ mẫu chạy được (worked example):** code + giải thích TỪNG DÒNG, nút "Chạy thử".
4. **Dự đoán trước khi chạy (PRIMM — Predict):** cho code, hỏi "in ra gì?" rồi mới cho chạy.
5. **Sửa/xếp code (Parsons problem):** kéo-thả xếp dòng đúng thứ tự hoặc sửa 1 lỗi cài sẵn —
   giảm tải nhận thức trước khi bắt viết từ đầu (chuẩn sư phạm CS đã kiểm chứng).
6. **Tự viết (Make):** đề bài + bộ test-case chấm tự động + gợi ý bậc thang (Socratic hints,
   tái dùng tư duy `stem-science-reasoning-master`).
7. **Ứng dụng ngay:** biến thể "về nhà" gắn đời thật (đổi dữ liệu thành hoá đơn/điểm số thật
   của chính học viên).
8. **Thẻ ôn SRS:** 2–4 thẻ khái niệm/đọc-code vào hàng đợi SRS chung của app.

## 4. Giáo trình A→Z — đề cương chi tiết P1→P5 (Python làm trục)

Mỗi bậc chia **unit** (① khái niệm → ② luyện tập → ③ dự án mini), đúng nhịp ①②③ của
`CefrLevelPage`. Dưới đây là đề cương đầy đủ để soạn nội dung; mỗi bài sẽ soạn theo khuôn 8
bước ở mục 3.

### P1 — Nhập môn tư duy (10 unit, ~40 bài)

| Unit | Nội dung                                                     | Ví dụ ứng dụng thực tế (dự án mini)                               |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1    | Máy tính làm gì; chương trình là gì; chạy dòng lệnh đầu tiên | "Máy chào bạn": in lời chào theo tên nhập vào                     |
| 2    | Biến, kiểu số/chuỗi, phép toán                               | Đổi tiền USD⇄VND theo tỷ giá nhập tay                             |
| 3    | Nhập/xuất, f-string, làm tròn                                | Máy tính chia tiền ăn nhóm (kèm tip, chia đều)                    |
| 4    | Rẽ nhánh if/elif/else, so sánh, boolean                      | **Tính tiền điện bậc thang EVN** (6 bậc thật)                     |
| 5    | Vòng lặp while                                               | Trò đoán số 1–100, đếm số lần đoán                                |
| 6    | Vòng lặp for, range                                          | Bảng cửu chương; tính tổng tiết kiệm gửi đều mỗi tháng            |
| 7    | Lồng nhau: if trong loop                                     | Lọc điểm đậu/rớt cả lớp nhập tay                                  |
| 8    | Trace code trên giấy, lỗi thường gặp                         | "Bác sĩ code": cho 5 đoạn code lỗi kinh điển, chẩn đoán           |
| 9    | Số ngẫu nhiên, import module đầu tiên                        | Oẳn tù tì với máy, tính tỷ lệ thắng                               |
| 10   | **Dự án tổng kết P1**                                        | Máy bán nước tự động: menu → chọn món → tính tiền → trả tiền thừa |

### P2 — Nền tảng vững (10 unit, ~45 bài)

| Unit | Nội dung                                      | Dự án mini thực tế                                                   |
| ---- | --------------------------------------------- | -------------------------------------------------------------------- |
| 1    | Hàm: def, tham số, return, phạm vi biến       | Tách bài P1 thành hàm: `tinh_tien_dien(kwh)`                         |
| 2    | Danh sách: index, slice, thêm/xoá, duyệt      | Danh sách việc cần làm (to-do) trong bộ nhớ                          |
| 3    | Chuỗi chuyên sâu: split/join/strip/format     | Chuẩn hoá họ tên tiếng Việt (viết hoa đúng, bỏ khoảng trắng thừa)    |
| 4    | Dict & tuple                                  | Sổ điểm: tên → list điểm, tính trung bình, xếp loại                  |
| 5    | List comprehension, sort có key               | Lọc & xếp hạng chi tiêu tháng theo hạng mục                          |
| 6    | Đọc/ghi file text + CSV                       | **Sổ chi tiêu cá nhân lưu file CSV** (thêm/xem/tổng kết theo tháng)  |
| 7    | Xử lý lỗi try/except, kiểm dữ liệu nhập       | Làm sổ chi tiêu "không thể sập" dù nhập bậy                          |
| 8    | Module chuẩn hay dùng: datetime, math, random | Đếm ngược ngày thi/Tết; tính lãi kép                                 |
| 9    | Chia chương trình nhiều file, `main()`        | Tách sổ chi tiêu thành 3 file: giao diện / logic / lưu trữ           |
| 10   | **Dự án tổng kết P2**                         | Quản lý quán cà phê mini: menu, order, hoá đơn, doanh thu ngày (CSV) |

### P3 — Làm được việc thật (12 unit, ~55 bài)

Song song 3 mạch: Python nâng cao · Web nhập môn (HTML/CSS/JS) · SQL + Git.

| Unit | Mạch      | Nội dung                                        | Dự án mini                                                         |
| ---- | --------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| 1    | Python    | Cài thư viện pip, đọc tài liệu thư viện         | Dùng `requests` lấy tỷ giá/thời tiết từ API công khai              |
| 2    | Python    | JSON: đọc/ghi/lồng nhau                         | Lưu sổ chi tiêu bằng JSON thay CSV                                 |
| 3    | Python    | Xử lý dữ liệu bảng (csv → pandas mức dùng được) | Đọc file Excel điểm/lương, thống kê, vẽ 1 biểu đồ                  |
| 4    | Web       | HTML: cấu trúc trang, thẻ, form                 | Trang giới thiệu bản thân (CV tĩnh)                                |
| 5    | Web       | CSS: box model, flex, responsive mobile-first   | Làm đẹp trang CV, xem tốt trên điện thoại                          |
| 6    | Web       | JS: DOM, sự kiện, thao tác trang                | Máy tính tiền điện CHẠY TRÊN WEB (port bài P1-4)                   |
| 7    | Web       | JS: fetch API, render danh sách                 | Trang tra thời tiết 63 tỉnh thành                                  |
| 8    | SQL       | SELECT/WHERE/ORDER/LIMIT trên SQLite            | Truy vấn kho dữ liệu bán hàng mẫu                                  |
| 9    | SQL       | JOIN, GROUP BY, INSERT/UPDATE/DELETE            | Báo cáo doanh thu theo tháng/món từ 3 bảng                         |
| 10   | Công cụ   | Git: commit/branch/merge, GitHub, README        | Đưa mọi dự án đã làm lên GitHub                                    |
| 11   | Công cụ   | Dòng lệnh cơ bản, môi trường ảo, cấu trúc dự án | Chuẩn hoá repo dự án theo khuôn                                    |
| 12   | **Dự án** | **Tổng kết P3**                                 | Web sổ chi tiêu: form nhập → lưu localStorage → thống kê + biểu đồ |

### P4 — Lập trình có cấu trúc lớn (12 unit, ~55 bài)

| Unit  | Nội dung                                                               | Dự án mini                                                      |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1–3   | OOP: class, thuộc tính/phương thức, kế thừa, khi nào KHÔNG dùng OOP    | Mô hình hoá quán cà phê P2 bằng class (Order, Menu, Report)     |
| 4     | Xử lý lỗi chuẩn: exception tự định nghĩa, logging                      | Thêm log + lỗi nghiệp vụ rõ ràng cho dự án quán cà phê          |
| 5–6   | Test tự động: unittest/pytest, nghĩ ca biên trước                      | Viết test cho `tinh_tien_dien` — bắt đúng lỗi ca biên bậc thang |
| 7     | HTTP & API: request/response, REST, JSON API                           | Gọi API thật có key (đăng ký free tier)                         |
| 8–9   | Dựng backend nhỏ (Flask/FastAPI mức khái niệm)                         | API sổ chi tiêu: 4 endpoint CRUD + SQLite                       |
| 10–11 | TypeScript: type, interface, generic cơ bản; vì sao type cứu dự án lớn | Port máy tính tiền điện web sang TS, bắt 3 bug bằng type        |
| 12    | **Dự án tổng kết P4**                                                  | Full-stack mini: backend API + frontend fetch + test + Git      |

### P5 — Kỹ sư tập sự (12 unit, ~60 bài)

CTDL-GT nền (big-O trực quan bằng thí nghiệm đo thời gian thật, tìm kiếm nhị phân, sort, stack/
queue, hash, cây & đồ thị cơ bản, đệ quy) · thiết kế CSDL (chuẩn hoá, index, transaction) ·
bảo mật nhập môn (OWASP top 3: injection/XSS/auth — dạy bằng chính ví dụ vá lỗi) · deploy
(VPS/PaaS free tier, biến môi trường, HTTPS) · **Dự án capstone**: 1 trong 3 đề (web bán hàng
nhỏ có đăng nhập · bot Telegram tra cứu · dashboard dữ liệu công khai VN), bắt buộc: Git
history sạch, test, deploy chạy thật, README — đây chính là **portfolio xin việc**.

### P6 — Chuyên sâu (mở, theo nhánh tự chọn)

4 track: **AI ứng dụng** (Python: gọi LLM API, RAG cơ bản, đúng nghề tương lai) · **Backend
cloud** (Go: goroutine, Docker, CI/CD) · **Hệ thống** (C nền tảng bộ nhớ → Rust ownership) ·
**Luyện phỏng vấn thuật toán** (LeetCode-style có Socratic hints). Soạn sau khi P1–P5 chạy thật.

## 5. Phương pháp sư phạm (đối chiếu nghiên cứu CS education)

- **PRIMM** (Predict–Run–Investigate–Modify–Make): khuôn 8 bước ở mục 3 chính là PRIMM + SRS.
  Người mới ĐỌC và SỬA code trước khi VIẾT — giảm bỏ cuộc, đã kiểm chứng ở quy mô lớp học.
- **Worked examples + Parsons problems:** giảm tải nhận thức giai đoạn đầu (cognitive load) —
  lý do nhiều người bỏ học lập trình ở tuần 2–3.
- **Dự án gắn đời thật VN mỗi unit:** động lực kiểu "học xong dùng được ngay" — đúng điểm khác
  biệt của DHCB; dữ liệu ví dụ dùng bối cảnh VN (VND, EVN, Tết, 63 tỉnh…).
- **SRS cho khái niệm + đọc code:** tái dùng hạ tầng SRS sẵn có; thẻ dạng "đoạn code này in
  gì?" hiệu quả hơn thẻ định nghĩa suông.
- **Companion đồng hành, không phán xét:** theo 8 luật SDT của
  `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md`; sai test-case → gợi ý bậc thang (nhắc
  khái niệm → chỉ vùng lỗi → cho ví dụ tương tự → cho đáp án kèm giải thích), KHÔNG chê.
- **Chẩn đoán đầu vào ẩn:** 5–7 câu (~2 phút) xếp vào P1–P4, theo đúng luật "luồng người mới
  hồ sơ ẩn" — gợi ý ĐÚNG MỘT bài bắt đầu, không hiện điểm số.

## 6. Kỹ thuật — cắm vào khuôn 5 mảnh (research-first)

### 6.1 Khuôn 5 mảnh

| Mảnh                | Chỗ đứng                                    | Ghi chú                                                                  |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| Khai báo môn        | `subjectRegistry` (`core-learner`)          | id `programming`, cắm cạnh english + 4 môn STEM                          |
| UI môn              | `apps/dhcb/src/pages/subjects/programming/` | Tái dùng khuôn `CefrLevelPage` (trang từng bậc P1–P6, nhịp ①②③, tab học) |
| Logic + dữ liệu môn | `packages/subject-programming/`             | curriculum data, runner adapter, chấm test-case, Parsons engine          |
| API môn             | `api/subjects/programming/` (apps/server)   | chấm AI feedback, lưu tiến độ, sinh gợi ý Socratic                       |
| Dữ liệu bền         | Postgres schema `programming.*`             | tiến độ bài/unit/bậc, kết quả nộp bài, thẻ SRS môn                       |

### 6.2 Chạy code ở đâu — quyết định quan trọng nhất

So sánh 3 phương án (đã nghiên cứu, chọn theo tiêu chí chi phí thấp + bảo mật):

| Phương án                                                                                                                                                                                                        | Chi phí         | Bảo mật                    | Đánh giá                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------- | -------------------------------------------------------------------------------- |
| **A. Chạy trong TRÌNH DUYỆT** — Python qua **Pyodide** (CPython biên dịch WebAssembly, dự án chính chủ, đang bảo trì tích cực); JS/TS chạy trong **Web Worker + iframe sandbox**; SQL qua **sql.js/SQLite-WASM** | **0đ server**   | Sandbox trình duyệt sẵn có | ✅ **CHỌN cho P1–P4.** Không tốn VPS, không lo code độc phá server, offline được |
| B. Judge server tự host (Judge0/isolate trên VPS)                                                                                                                                                                | RAM/CPU đáng kể | Phải cô lập cẩn thận       | Chỉ cân nhắc ở P5–P6 (chấm Java/Go/C — chưa chạy được trên WASM ổn định)         |
| C. API chấm code bên thứ ba                                                                                                                                                                                      | Trả theo lượt   | Gửi code ra ngoài          | ❌ Loại — đắt + phụ thuộc                                                        |

Hệ quả phạm vi: **MVP chỉ cần Python + JS/HTML/CSS + SQL — cả ba đều chạy client-side, chi
phí hạ tầng = 0.** Đúng luôn 3 ngôn ngữ tầng 1 ở mục 2. Ngôn ngữ tầng 2/3 để giai đoạn sau
(cần phương án B). Lưu ý kỹ thuật đã xác minh cần kiểm chứng lại khi code: Pyodide tải
~10–15MB lần đầu → phải lazy-load + cache (service worker/HTTP cache), chỉ tải khi vào bài có
chạy Python; chạy trong Web Worker để không đơ UI; đặt timeout ngắt vòng lặp vô hạn.

### 6.3 Chấm bài & AI

- **Chấm tự động bằng test-case (không AI, 0đ):** mỗi bài "Tự viết" kèm bộ test (input →
  output mong đợi) chạy ngay trong sandbox trình duyệt; kết quả pass/fail hiện từng ca (ca ẩn
  chỉ hiện pass/fail, không lộ input). Đây là đường chấm CHÍNH.
- **AI chỉ cho phản hồi chất lượng** (đọc code góp ý đặt tên/cách làm hay hơn, giải thích lỗi
  khó bằng tiếng Việt, Socratic hints): **mode đếm lượt mới `code_feedback`** (thêm cột usage
  — theo đúng luật "mọi lệnh gọi AI phải đếm lượt").
  **[Cập nhật 2026-08-25 — thi hành PR-L5, ĐỔI so với câu trên]** KHÔNG đi qua `/api/agent` và
  prompt KHÔNG nằm ở `apps/dhcb/src/prompts/`. Hai lý do phát hiện khi đọc lại code:
  (a) `/api/agent` chèn cứng `SYSTEM_GUARDRAIL` "Bạn là trợ lý GIA SƯ NGÔN NGỮ… việc ngoài phạm
  vi học ngôn ngữ thì lịch sự từ chối" (`core-ai/aiConfig.ts`) — hỏi nó về Python là đúng cái nó
  được dặn từ chối; (b) `/api/agent` chỉ nhận mode `chat|writing|speaking` (chặn có chủ ý) nên
  không có đường đếm vào `code_feedback`. Thay bằng endpoint riêng
  `POST /api/programming/feedback`, prompt dựng HOÀN TOÀN Ở SERVER
  (`packages/subject-programming/feedbackPrompt.ts`) — client chỉ gửi mã bài + code, không gửi
  được prompt tuỳ ý. Hạn mức vẫn theo luật chung: Free tiêu kho lượt cửa sổ trượt, Pro/VIP tính
  vào hạn mức TỔNG/ngày (không có hạn mức riêng cho môn).
- Chống gian lận nhẹ nhàng đúng tư thế đồng hành: không "bắt phạt", chỉ thỉnh thoảng hỏi lại
  1 câu Predict về chính code học viên vừa nộp ("dòng 5 đổi thành X thì in gì?").

### 6.4 Dữ liệu curriculum

Soạn dạng data file có type chặt (giống `src/data/cefr.ts`): `packages/subject-programming/
curriculum/p1.ts … p5.ts`, Zod schema validate lúc build. Mỗi bài = object theo khuôn 8 bước
(mục 3) gồm: lý thuyết (markdown), worked example (code + chú thích từng dòng), câu Predict,
Parsons (dòng xáo trộn + đáp án), đề Make (đề + starter code + test-cases), thẻ SRS.

## 7. Phân đợt PR (đề xuất — chờ người dùng duyệt mới làm)

| PR     | Nội dung                                                                                                                              | Cổng nghiệm thu                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| PR-L0  | Đặc tả này + cập nhật PROGRESS/CLAUDE                                                                                                 | Người dùng duyệt đặc tả                                            |
| PR-L1  | Khung môn: subjectRegistry + schema `programming.*` (migration) + trang tổng quan P1–P6 + trang bậc rỗng                              | Route chạy, migration idempotent, a11y pass                        |
| PR-L2  | Sandbox chạy code: Pyodide lazy-load trong Worker + editor (CodeMirror 6 — nhẹ hơn Monaco, phù hợp mobile-first) + nút Chạy + timeout | Chạy được 10 bài mẫu P1 trên mobile thật, bundle budget không vỡ   |
| PR-L3  | Engine bài học 8 bước: Predict + Parsons + Make chấm test-case + tiến độ lưu DB                                                       | Test ca biên chấm; luồng 1 bài end-to-end                          |
| PR-L4  | Nội dung P1 đầy đủ (10 unit ~40 bài) + thẻ SRS                                                                                        | Người thật học thử hết P1; eval nội dung                           |
| PR-L5  | AI feedback + Socratic hints (mode `code_feedback` đếm lượt) + Companion tích hợp — **XONG 2026-08-25**                               | Đếm lượt đúng free/pro; eval prompt (`npm run eval:code-feedback`) |
| PR-L6+ | Nội dung P2 → P3 (thêm JS sandbox + SQL WASM ở P3), chẩn đoán đầu vào ẩn                                                              | Từng đợt như P1                                                    |

Mỗi PR nhỏ, tự kiểm được, theo đúng nhịp "chia nhỏ" của CLAUDE.md mục 3.

## 8. Definition of Done — MVP môn Lập trình (hết PR-L5)

- Học viên mới: vào môn → chẩn đoán ẩn ~2 phút → được gợi ý ĐÚNG MỘT bài → học bài theo khuôn
  8 bước → code chạy thật trong trình duyệt → chấm test-case tức thì → thẻ SRS vào hàng ôn.
- P1 trọn vẹn 10 unit; tiến độ bền qua Postgres, đồng bộ đa thiết bị như English.
- 0đ chi phí hạ tầng thêm cho phần chạy code; AI feedback có đếm lượt, không đường gọi AI nào
  không giới hạn.
- Toàn bộ cổng chất lượng hiện có pass: typecheck/lint/test/build/a11y (trang mới vào danh
  sách quét a11y) + bundle budget (Pyodide/editor phải lazy-load, không vào bundle chính).

## 9. Rủi ro & đối sách

1. **Pyodide nặng lần đầu (~10–15MB):** lazy-load + cache + màn hình chờ có nội dung học
   (đọc lý thuyết trong lúc tải); đo thật trên 4G trước khi phát hành.
2. **Soạn nội dung là khối lượng lớn nhất** (~250 bài P1–P5): làm theo đợt (P1 trước), khuôn
   dữ liệu chặt để giao subagent soạn từng unit theo brief + người dùng duyệt mẫu 1 unit trước
   khi soạn hàng loạt.
3. **Chạy code trên mobile màn nhỏ:** editor phải mobile-first (font 16px, nút chạy ≥ 44px);
   Parsons kéo-thả hợp mobile hơn gõ code — dùng nhiều ở P1.
4. **Vòng lặp vô hạn/đơ máy:** Worker + hard timeout + nút dừng; không chạy trên main thread.
5. **Học viên dán code AI làm hộ:** chấp nhận một phần (thực tế nghề), đối sách là câu Predict
   xen kẽ về chính bài nộp (mục 6.3) — kiểm tra HIỂU chứ không kiểm tra GÕ.
6. **Phạm vi phình sang tầng 2/3:** khoá cứng MVP = Python/JS/SQL client-side; Java/Go/C#/
   Rust chỉ mở khi có quyết định riêng về judge server (phương án B).

## 10. Ngoài phạm vi đặc tả này (ghi nhận, không làm)

- Judge server đa ngôn ngữ (Java/Go/C/C#/Rust) — cần đặc tả riêng khi P4+ chạy thật.
- Chấm đồ án bằng AI toàn diện, phỏng vấn giả lập, chứng chỉ — để P6.
- Lớp học realtime/pair-programming — thuộc nhóm C persistence đa người dùng (PROGRESS).
- Nội dung video/giọng nói cho bài giảng — cân nhắc tái dùng TTS sau khi text chạy ổn.

## 11. Việc tiếp theo ngay

1. Người dùng duyệt đặc tả (đặc biệt: chốt thang P1–P6, bộ 3 ngôn ngữ MVP, phương án sandbox
   trình duyệt, khuôn bài 8 bước).
2. Nếu duyệt → PR-L1 (khung môn). Nếu muốn xem trước nội dung → soạn MẪU trọn 1 unit (P1-U4
   "Tính tiền điện EVN") để duyệt khuôn trước khi làm hàng loạt.
