# Tổng hợp Nghiên cứu: Mon Lap Trinh

Tài liệu này gộp từ 6 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: dac-ta-mon-lap-trinh-2026-08-24.md

_(Chi tiết nguồn gốc: `dac-ta-mon-lap-trinh-2026-08-24.md`)_

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

---

## [2] Tài liệu: dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md

_(Chi tiết nguồn gốc: `dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md`)_

# Đặc tả bổ sung — DỰ ÁN XUYÊN SUỐT môn Lập trình (2026-08-24)

> Bổ sung cho `dac-ta-mon-lap-trinh-2026-08-24.md` theo yêu cầu người dùng cùng ngày:
> _"nghiên cứu tạo dự án hoàn chỉnh và dạy trên đó, để khi hoàn thành là hoàn thành luôn dự án."_
>
> Tinh thần: giáo trình không kết thúc bằng chứng chỉ, mà kết thúc bằng **một sản phẩm THẬT
> đang chạy trên Internet, do chính học viên xây từ dòng code đầu tiên** — vừa là bằng chứng
> năng lực (portfolio xin việc), vừa là công cụ dùng được cho chính họ.
>
> Trạng thái: **ĐẶC TẢ — chưa code.** Đọc kèm đặc tả gốc; tài liệu này chỉ ĐIỀU CHỈNH cách tổ
> chức nội dung (mục 4 gốc) và bổ sung cơ chế "workspace dự án", KHÔNG đổi thang P1–P6, khuôn
> bài 8 bước, bộ ngôn ngữ hay phương án sandbox đã chốt.

## 1. Nghiên cứu mô hình — vì sao "một dự án xuyên suốt" và giới hạn của nó

### 1.1 Căn cứ (mô hình đã kiểm chứng, không tự bịa)

- **Project-based learning (PBL):** hiệu quả cao về động lực và khả năng chuyển giao kỹ năng
  sang việc thật — nhưng nghiên cứu CS education cũng chỉ rõ điểm yếu: người mới học bằng dự
  án THUẦN TUÝ dễ quá tải nhận thức và hổng khái niệm nền. Kết luận ngành: **kết hợp** — bài
  luyện có cấu trúc (worked example/Parsons/bài nhỏ) để nạp khái niệm, dự án để lắp ráp.
- **Spiral curriculum (Bruner):** cùng MỘT sản phẩm được quay lại nhiều vòng, mỗi vòng nâng
  độ phức tạp — đúng bản chất nghề phần mềm thật (không ai viết app một lần là xong; refactor
  chính là bài học).
- **Tiền lệ đã chạy đại trà:** CS50 (bài tập dẫn tới final project bắt buộc), The Odin
  Project (chuỗi capstone nối nhau tới full-stack deploy thật), sách "Automate the Boring
  Stuff" (mỗi chương một công cụ dùng được ngay). Mô hình "một app tiến hoá qua toàn khoá"
  chính là cách nhiều bootcamp thu phí cao đang bán — DHCB làm bản tiếng Việt, giá rẻ.

### 1.2 Kết luận thiết kế — mô hình "2 làn"

Mỗi unit của giáo trình gốc giữ nguyên khuôn 8 bước, nhưng bước cuối tách thành 2 làn:

- **Làn LUYỆN (giữ nguyên):** bài Predict/Parsons/Make nhỏ chấm test-case — nạp khái niệm,
  không sợ sai, không ảnh hưởng dự án.
- **Làn DỰ ÁN (mới, thay cho "dự án mini" rời rạc):** mỗi unit kết thúc bằng **một bước xây
  tiếp DỰ ÁN TRỤC** — cùng một sản phẩm lớn dần từ P1 đến P5. "Dự án mini" trong đặc tả gốc
  không bỏ đi mà được **sắp lại thành các chặng của chính dự án trục** (mục 3).

Tỷ lệ thời lượng đề xuất: P1 ~70% luyện / 30% dự án (người mới cần nền) → P5 đảo lại ~30% /
70% (kỹ năng lắp ráp là thứ cần luyện nhất ở cuối). Đây là đường dốc chuẩn của PBL có đỡ.

## 2. Chọn DỰ ÁN TRỤC — tiêu chí và phương án

### 2.1 Tiêu chí (rút từ mục 1)

1. **Thật sự dùng được** cho chính học viên hoặc gia đình họ khi hoàn thành (không phải đồ chơi).
2. **Trải đủ P1→P5 tự nhiên:** có phiên bản CLI đơn giản (P1–P2), lên web (P3), có backend +
   CSDL + test (P4), deploy chạy thật (P5) — không chặng nào gượng ép.
3. **Bối cảnh Việt Nam,** dữ liệu quen thuộc, giải thích được cho người thân ("con làm cái này").
4. **Phạm vi khống chế được:** lõi nghiệp vụ ~5–7 thực thể dữ liệu, không cần realtime/thanh
   toán thật ở bản học.
5. **Cá nhân hoá được** (đổi tên, đổi dữ liệu, thêm tính năng riêng) → mỗi học viên ra một
   sản phẩm KHÔNG giống hệt nhau — chống chép bài và tăng sở hữu (ownership, đúng SDT).

### 2.2 Ba phương án dự án trục (học viên CHỌN 1 lúc vào môn — cùng khung chặng, khác chủ đề)

| Mã     | Dự án                                                                                     | Cho ai hợp                                        | Lõi dữ liệu                                        |
| ------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| **T1** | **"Cửa hàng của tôi"** — quản lý bán hàng nhỏ (menu, đơn, kho, doanh thu, trang đặt hàng) | Mặc định; gia đình buôn bán nhỏ rất phổ biến ở VN | món hàng · đơn · khách · phiếu nhập · báo cáo      |
| T2     | "Quỹ lớp / Chi tiêu nhà mình" — thu chi, thành viên, báo cáo, trang minh bạch quỹ         | Học sinh, người quản lý quỹ nhóm                  | khoản thu/chi · thành viên · hạng mục · kỳ báo cáo |
| T3     | "Sổ học tập của tôi" — quản lý môn học, deadline, điểm, thẻ ôn, trang chia sẻ tài liệu    | Học sinh–sinh viên                                | môn · nhiệm vụ · điểm · thẻ ôn · tài liệu          |

Ba phương án **đồng hình về kỹ thuật** (đều là CRUD + báo cáo + trang public), nên nội dung
hướng dẫn viết MỘT lần theo T1, T2/T3 chỉ đổi lớp dữ liệu/đề bài — chi phí soạn thêm thấp.
MVP có thể chỉ ship T1, mở T2/T3 sau khi khuôn chạy ổn.

## 3. Bản đồ tiến hoá dự án trục theo P1→P5 (ví dụ theo T1 "Cửa hàng của tôi")

Mỗi chặng ánh xạ đúng unit của đặc tả gốc — cột "Unit gốc" chỉ chỗ kiến thức được nạp trước
khi dùng vào dự án. Nguyên tắc: **không bước dự án nào dùng kiến thức chưa dạy.**

### Chặng P1 — "Máy tính tiền" (console, chạy trong sandbox trình duyệt)

| Bước | Xây gì                                                               | Unit gốc (P1) |
| ---- | -------------------------------------------------------------------- | ------------- |
| 1    | In menu quán cố định, chào theo tên chủ quán (cá nhân hoá đầu tiên)  | U1–U2         |
| 2    | Nhập món + số lượng → tính tiền, tiền thừa                           | U3            |
| 3    | Giảm giá theo hoá đơn (if bậc thang — tái dùng tư duy tiền điện EVN) | U4            |
| 4    | Vòng lặp bán nhiều đơn liên tiếp, tổng doanh thu phiên               | U5–U7         |
| 5    | **Milestone P1:** máy bán hàng console hoàn chỉnh (thay dự án U10)   | U8–U10        |

### Chặng P2 — "Sổ sách tử tế" (hàm, dữ liệu, file)

Tách thành hàm (`tinh_tien`, `in_hoa_don`) · menu là list/dict sửa được (thêm/bớt món) ·
lưu đơn ra CSV, đọc lại lịch sử, báo cáo doanh thu theo ngày · chống nhập bậy (try/except) ·
chia 3 file giao diện/logic/lưu trữ. **Milestone P2:** phần mềm quản lý bán hàng console dùng
được thật, dữ liệu bền qua file (thay dự án U10 gốc "quán cà phê" — chính là nó).

### Chặng P3 — "Lên web" (HTML/CSS/JS + SQL + Git)

Trang giới thiệu cửa hàng (HTML/CSS, mobile-first) · trang đặt hàng chạy JS trong trình
duyệt, giỏ hàng localStorage · chuyển kho dữ liệu CSV → SQLite (sql.js), viết các truy vấn
báo cáo (JOIN/GROUP BY trên chính dữ liệu bán hàng của mình) · đưa toàn bộ lên GitHub, README
tử tế. **Milestone P3:** web tĩnh của cửa hàng chạy được + kho dữ liệu SQL + repo GitHub công
khai (thay dự án U12 gốc).

### Chặng P4 — "Có xương sống" (OOP, API, test, TypeScript)

Mô hình hoá lại bằng class (Order/Menu/Inventory/Report) — bài refactor THẬT trên code cũ của
chính mình (giá trị sư phạm lớn nhất chặng này) · backend API CRUD (FastAPI mức khái niệm) ·
frontend fetch API thay localStorage · viết test cho logic tiền/kho (ca biên giảm giá, âm
kho) · port phần JS sang TypeScript, để type bắt lỗi thật. **Milestone P4:** full-stack mini
chạy local, có test, Git history sạch (thay dự án U12 gốc).

### Chặng P5 — "Ra Internet" (capstone = CHÍNH dự án này)

Thiết kế lại schema tử tế (chuẩn hoá, index, transaction cho đơn hàng) · đăng nhập chủ quán
(hash mật khẩu, session — nhập môn OWASP trên chính app của mình) · deploy free-tier + biến
môi trường + HTTPS · đo và sửa 1 điểm chậm (big-O nhìn thấy được: báo cáo trên 10.000 đơn) ·
viết trang "Về dự án" kể lại hành trình. **Milestone P5 = HOÀN THÀNH MÔN:** sản phẩm chạy
thật trên Internet, repo GitHub đầy đủ lịch sử từ P1 — đúng nghĩa "hoàn thành là hoàn thành
luôn dự án". (Ba đề capstone rời trong đặc tả gốc P5 trở thành **tuỳ chọn làm THÊM** cho ai
muốn sản phẩm thứ hai.)

## 4. Cơ chế kỹ thuật — "workspace dự án" (bổ sung vào khuôn 5 mảnh)

Đây là phần kỹ thuật MỚI so với đặc tả gốc (sandbox chạy từng bài đã có; nay cần **trạng thái
code bền theo học viên** xuyên bài học):

1. **Workspace dự án per-user:** cây file ảo (nhiều file .py/.html/.js/.sql + file dữ liệu)
   lưu Postgres `programming.project_files` (user_id, path, content, updated_at), cache
   localStorage để mở tức thì; sandbox Pyodide/iframe mount cây file này thay vì 1 ô code.
   Dung lượng khống chế: quota ~2MB text/học viên (đủ rất xa cho dự án học).
2. **Bước dự án = bài có "điểm neo":** mỗi bước cho trước diff-mục-tiêu dạng đặc tả (làm gì,
   file nào, tiêu chí) + bộ **milestone check** chạy trên workspace (test-case gọi hàm của học
   viên / kiểm tra output / kiểm tra file tồn tại). Qua check → mở bước sau. Không chấm
   "giống code mẫu" — chấm HÀNH VI, để mỗi người tự do cá nhân hoá.
3. **Kẹt thì có phao, không có "làm hộ":** mỗi bước kèm code mẫu tham chiếu (mở ra bị đánh
   dấu "đã xem mẫu" — chỉ để Companion biết mà kèm sát hơn, KHÔNG trừ điểm, đúng tư thế đồng
   hành); nút "Companion xem giúp" đi qua mode `code_feedback` đếm lượt như đặc tả gốc.
4. **Snapshot theo milestone:** hoàn thành mỗi chặng → snapshot toàn workspace (bảng
   `programming.project_snapshots`) — học viên xem lại "cửa hàng của mình hồi P1" (động lực
   nhìn thấy tiến bộ), và là điểm khôi phục nếu vọc hỏng.
5. **Xuất ra ngoài từ P3:** nút "Tải dự án (.zip)" + hướng dẫn push GitHub trong bài Git —
   từ P3 trở đi **repo GitHub của học viên là bản chính**, workspace trong app đồng bộ chiều
   xuất; DHCB không tự ý ghi lên GitHub học viên (chỉ hướng dẫn, học viên tự thao tác — không
   đụng OAuth scope ghi).
6. **P5 deploy:** hướng dẫn từng bước lên nền tảng free-tier (chạy ngoài DHCB — đúng nguyên
   tắc 0đ hạ tầng cho mình); milestone check cuối = học viên dán URL sản phẩm + app kiểm tra
   URL sống (fetch HEAD từ server, có rate-limit).

Điểm cần kiểm chứng khi code (ghi để không "ảo giác"): hiệu năng mount nhiều file vào
Pyodide FS; giới hạn iframe sandbox khi dự án web nhiều file (dựng blob URL/`srcdoc` từ cây
file); milestone check cho HTML/CSS (dùng kiểm DOM qua iframe + vài luật, không chấm pixel).

## 5. Điều chỉnh đặc tả gốc (delta — phần còn lại giữ nguyên)

1. **Mục 4 gốc (đề cương):** cột "dự án mini" của các unit được thay bằng "bước dự án trục"
   theo bản đồ mục 3 ở trên; bài luyện nhỏ trong unit giữ nguyên.
2. **Mục 6.1 gốc (5 mảnh):** schema `programming.*` thêm 2 bảng `project_files`,
   `project_snapshots` + cột chọn phương án dự án (T1/T2/T3) trong tiến độ.
3. **Mục 7 gốc (phân đợt PR):** chèn **PR-L3b — Workspace dự án + engine milestone check +
   chặng P1 của T1** (sau PR-L3, trước PR-L4); PR-L4 (nội dung P1) soạn bài theo mô hình 2
   làn ngay từ đầu — tránh soạn xong lại sửa.
4. **DoD MVP (mục 8 gốc) thêm:** học xong P1 phải có "máy tính tiền" chạy được trong
   workspace của chính mình + snapshot milestone P1.

## 6. Rủi ro riêng của mô hình dự án xuyên suốt

1. **Học viên bỏ ngang giữa chặng → dự án dở dang gây nản:** mỗi chặng kết thúc ở trạng thái
   DÙNG ĐƯỢC (P1 đã là máy tính tiền chạy được), không có trạng thái "đập ra chưa lắp lại"
   kéo dài quá 1 unit; bài refactor P4 thiết kế theo từng lát nhỏ chạy được.
2. **Workspace hỏng do vọc:** snapshot milestone + nút "khôi phục về milestone gần nhất".
3. **Lệch nhịp 2 làn** (lười luyện, chỉ muốn làm dự án): bước dự án khoá bằng hoàn thành các
   bài luyện then chốt của unit (không khoá 100% bài — tránh lê thê).
4. **Chép code mẫu tràn lan:** chấm hành vi + Predict xen kẽ về chính code nộp (cơ chế đặc tả
   gốc 6.3) + cá nhân hoá dữ liệu khiến mẫu không dán nguyên được.
5. **Ba phương án T1–T3 phình phạm vi soạn:** MVP chỉ T1; T2/T3 chỉ mở khi T1 đo được tỷ lệ
   hoàn thành chặng P1 > ngưỡng đặt sau.

## 7. Việc tiếp theo ngay

1. Người dùng duyệt: mô hình 2 làn (mục 1.2) · dự án trục T1 làm mặc định, T2/T3 để sau
   (mục 2.2) · cơ chế workspace + milestone check (mục 4) · delta phân đợt PR (mục 5).
2. Nếu duyệt → thứ tự làm không đổi: PR-L1 (khung môn) trước; đặc tả này ảnh hưởng từ PR-L3b
   trở đi. Nếu muốn thấy trước: soạn kịch bản chữ hoàn chỉnh CHẶNG P1 (5 bước × khuôn bài)
   để duyệt trải nghiệm trước khi code.

---

## [3] Tài liệu: dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md

_(Chi tiết nguồn gốc: `dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md`)_

# Đặc tả: 12 HƯỚNG CHUYÊN SÂU của môn Lập trình (2026-08-27)

> Nguồn thi hành: `packages/subject-programming/specializations/`.
> Đọc kèm: `docs/research/dac-ta-mon-lap-trinh-2026-08-24.md` (thang P1–P6, xương sống) và
> `docs/research/dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md` (mô hình 2 làn).

## 1. Vấn đề

Môn Lập trình hiện có xương sống P1→P5 và một bậc P6 "Chuyên sâu" chỉ gồm 4 dòng mô tả
(`curriculum.ts`). Người học đi hết P5 sẽ hỏi đúng một câu mà app chưa trả lời được: **"giờ tôi
đi đâu tiếp?"**

P1–P5 dạy được "lập trình được". Nhưng **"chuyên gia" thì không có đường chung**: người làm web
app, người làm nhúng, người làm nhân hệ điều hành đi ba con đường khác hẳn nhau — khác ngôn ngữ,
khác công cụ, khác cả tiêu chuẩn "thế nào là giỏi". Gộp chúng vào một bậc là nói dối người học.

## 2. Quyết định

Thêm **tầng HƯỚNG CHUYÊN SÂU** song song với xương sống, gồm **13 hướng** — 11 hướng sản
phẩm (chọn MỘT) và 2 hướng nền cắt ngang (học song song):

| #   | Hướng                          | Mã         | Vào từ bậc | Thời lượng  |
| --- | ------------------------------ | ---------- | ---------- | ----------- |
| 1   | Lập trình Web                  | `web`      | P4         | 9–14 tháng  |
| 2   | Ứng dụng di động               | `mobile`   | P4         | 9–14 tháng  |
| 3   | Backend & Hệ phân tán          | `backend`  | P4         | 10–16 tháng |
| 4   | Dữ liệu & Phân tích            | `data`     | P3         | 9–14 tháng  |
| 5   | Trí tuệ nhân tạo & Học máy     | `ai`       | P4         | 12–18 tháng |
| 6   | DevOps, Cloud & SRE            | `devops`   | P4         | 9–14 tháng  |
| 7   | An toàn thông tin              | `security` | P5         | 12–18 tháng |
| 8   | Lập trình hệ thống             | `systems`  | P5         | 12–18 tháng |
| 9   | Lập trình Game                 | `game`     | P4         | 10–16 tháng |
| 10  | Nhúng & IoT                    | `embedded` | P4         | 10–16 tháng |
| 11  | Ứng dụng Desktop & Công cụ     | `desktop`  | P4         | 8–12 tháng  |
| 12  | Thuật toán & Giải quyết vấn đề | `algo`     | P3         | 6–12 tháng  |

### 2.1. Khuôn chung — mọi hướng giống hệt nhau về CẤU TRÚC

Cấu trúc đồng nhất là điều kiện để so sánh được các hướng với nhau và để test kiểm được khuôn
dạng thay vì kiểm từng chữ:

- **Đúng 4 chặng** `S1` (căn bản) → `S2` (vững tay) → `S3` (nâng cao) → `S4` (chuyên gia).
- Mỗi chặng: `canDo` đo được, thời lượng, **3–5 module** kiến thức, và **1 dự án** có tiêu chí
  chấp nhận đo được.
- Mỗi hướng còn có: **capstone** (sản phẩm tốt nghiệp hướng), `expertSignals` (dấu hiệu chuyên
  gia), `careers`, `pitfalls`, `resources`.
- **Bản đồ kiến trúc bắt buộc** (`architecture`, xem §2.4) — 5 ô: module · hợp đồng · quyết định
  phải chốt sớm · NFR · checklist đặc tả.
- Tổng: **5 sản phẩm phải nộp mỗi hướng** (4 dự án chặng + capstone) — nghĩa là **65 dự án** cho
  toàn bộ 13 hướng (52 chặng, 211 module học, 263 mục kiến trúc).

### 2.2. Ba luật nội dung

1. **Dự án là đơn vị hoàn thành, không phải bài học.** Chặng chỉ tính là xong khi có sản phẩm
   đạt đủ tiêu chí chấp nhận. Tiêu chí phải đo được ("giữ ≥ 60 FPS trên máy mục tiêu"), không
   được là cảm tính ("làm game mượt").
2. **`expertSignals` là HÀNH VI quan sát được, không phải số năm kinh nghiệm.** Đây là hệ quả
   trực tiếp của luật trong `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`: thang đo là
   bậc thành thạo, không phải thâm niên.
3. **Không hướng nào "xịn hơn" hướng nào.** Không có xếp hạng, không có nhãn "hot". Mỗi hướng
   nói rõ _hợp với ai_ và _không hợp với ai_ để người học tự chọn có thông tin — đúng luật số 1
   của sản phẩm: đây là công cụ chọn việc, không phải bảng chấm điểm con người.

### 2.4. Lát cắt KIẾN TRÚC — bắt buộc ở mọi hướng (bổ sung 2026-08-27)

**Lý do bổ sung (người dùng nêu):** phần lớn việc về sau là _đặc tả kiến trúc cho AI code_, chứ
không phải tự gõ từng dòng. Bản đầu của tầng này chỉ có "học gì" và "làm dự án gì" — thiếu đúng
thứ người đặc tả cần. Bốn lỗ hổng cụ thể khi đặc tả thiếu kiến trúc:

| Thiếu                          | Hệ quả khi giao cho AI/người khác thi hành      |
| ------------------------------ | ----------------------------------------------- |
| Ranh giới module               | Bên thi hành tự bịa cấu trúc, mỗi lượt một kiểu |
| Hợp đồng giữa module           | Hai phần viết xong không ghép được              |
| Yêu cầu phi chức năng (NFR)    | Code chạy được nhưng chậm / không an toàn       |
| Tiêu chí nghiệm thu + bất biến | Không có cách chứng minh bên thi hành làm đúng  |

Vì vậy **mọi hướng** phải khai đủ `SpecArchitecture` (5 ô, `types.ts`):

1. **`modules`** — module điển hình của hệ thống trong hướng đó, mỗi module ghi **trách nhiệm duy
   nhất** _và_ việc nó **không được làm**. Test canh: `role` phải > 25 ký tự để loại ô chỉ chép
   lại tên module.
2. **`contracts`** — cái gì đi qua ranh giới và ràng buộc phải giữ (schema, tiến hoá không phá,
   idempotency, mã lỗi).
3. **`keyDecisions`** — quyết định phải chốt SỚM vì đổi về sau rất đắt, kèm đánh đổi. Chốt xong
   ghi thành ADR có nêu **phương án bị loại** — nếu không, phiên sau sẽ đề xuất lại đúng nó.
4. **`nfrs`** — yêu cầu phi chức năng đặc trưng, viết thành **số**. NFR không đo được là NFR
   không tồn tại.
5. **`specChecklist`** — thứ phải viết rõ trong đặc tả thì bên thi hành mới làm đúng ngay lượt
   đầu.

### 2.5. Hướng `architecture` — sáu ô bắt buộc của một đặc tả kín

Hướng thứ 13 dạy chính kỹ năng này. Khuôn **đặc tả kín** mà nó dùng (chặng S3):

1. **Phạm vi** — làm gì _và KHÔNG làm gì_ (ô "không làm" quan trọng ngang ô "làm").
2. **Điểm chạm** — đường dẫn file cụ thể, không nói chung chung "sửa phần backend".
3. **Hợp đồng** — kiểu dữ liệu vào/ra viết hẳn ra, kèm ca lỗi.
4. **Tiêu chí chấp nhận** — đo được, kèm lệnh chạy để chứng minh.
5. **Bất biến** không được phá + test nào canh nó.
6. **Quy ước dự án** liên quan — bên thi hành không thấy được hội thoại trước đó.

Bốn chặng của hướng: **S1 ranh giới & module** → **S2 hợp đồng & mô hình miền** → **S3 đặc tả
thi hành được & nghiệm thu code mình không tự gõ** → **S4 tiến hoá kiến trúc và dẫn dắt nhiều
bên thi hành**. Điều kiện vào là **P4, cố ý không mở sớm hơn**: chưa tự tay làm hỏng thứ gì thì
đặc tả chỉ là chữ đẹp (có test canh điều kiện này).

### 2.3. Điều kiện đầu vào và thứ tự

- `prerequisite` là bậc xương sống tối thiểu. Hai hướng vào sớm nhất từ P3: **dữ liệu** (chỉ cần
  SQL + Python) và **thuật toán** (chỉ cần cấu trúc dữ liệu nền).
- **`algo` là hướng BỔ TRỢ, học song song, không thay thế một hướng sản phẩm.** Ghi rõ trong
  `forWho` và trong hướng dẫn chọn ở trang danh sách.
- Khuyến nghị: đi một hướng chính tới hết S3 rồi mới mở hướng thứ hai.

## 3. Điểm chạm code

| Thành phần           | Đường dẫn                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Kiểu dữ liệu         | `packages/subject-programming/specializations/types.ts`                                                   |
| 12 file nội dung     | `packages/subject-programming/specializations/<mã>.ts`                                                    |
| Sổ đăng ký + hàm tra | `packages/subject-programming/specializations/registry.ts`                                                |
| Test bất biến        | `packages/subject-programming/specializations.test.ts`                                                    |
| Trang danh sách      | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializations.tsx` — `/lap-trinh/huong`            |
| Trang chi tiết       | `apps/dhcb/src/pages/subjects/programming/ProgrammingSpecializationPage.tsx` — `/lap-trinh/huong/:specId` |
| Lối vào              | Khối ⑥ trong `ProgrammingHome.tsx`                                                                        |

**Tên file KHÔNG được là `index.ts`.** Rollup đặt tên chunk theo tên file, nên `index.ts` sinh ra
`dist/js/index-*.js` — trùng glob `"Initial JS"` của `.size-limit.json` và làm ngân sách bundle
đội thêm ~27 kB dù dữ liệu chỉ nạp ở route lười. Đây là lỗi đã dính thật trong đợt này, đổi tên
thành `registry.ts` là hết.

## 4. Tiêu chí chấp nhận

- [x] 13 hướng, id duy nhất, mỗi hướng đúng 4 chặng theo thứ tự S1→S4.
- [x] **Mọi hướng có đủ 5 ô kiến trúc** (≥4 module, ≥3 hợp đồng/quyết định/NFR/checklist); mỗi
      module nêu trách nhiệm thật, không chỉ chép lại tên.
- [x] Hai hướng nền tách nhóm đúng; `productSpecializations()` + `crossCuttingSpecializations()`
      luôn phủ kín danh sách, không chồng lấn.
- [x] Id module duy nhất toàn bộ và đúng tiền tố chặng; không ô văn bản nào rỗng.
- [x] Mọi chặng có dự án ≥ 2 tiêu chí chấp nhận; capstone ≥ 3 tiêu chí.
- [x] `getSpecialization` / `getSpecStage` trả `undefined` với mã lạ — **không đoán bừa**.
- [x] Ba route mới qua cả hai cổng a11y (A/AA và AAA) trên 5 theme.
- [x] Ngân sách bundle không đội: 124,35 kB / 140 kB (baseline trước đợt: 124,08 kB).

## 4.1. Khuôn dùng được ngay trong repo

Sáu ô của §2.5 đã thành file điền được, không phải đọc lại đặc tả rồi tự nhớ:

- `docs/templates/dac-ta-tinh-nang.md` — khuôn đặc tả giao việc (6 ô + ô nghiệm thu).
- `docs/templates/adr.md` — khuôn ADR, có ô **"vì sao loại các phương án kia"** và ô **"điều kiện
  xem lại"** (hai ô hay bị bỏ nhất, và là hai ô khiến ADR còn giá trị sau vài tháng).

## 5. Việc còn để ngỏ (cố ý)

1. ~~**Chưa có bài học 8 bước cho các hướng.**~~ Hai đợt bổ sung trong cùng ngày 2026-08-27,
   **hai tầng khác nhau, không đè nhau**:
   - **Bài học 8 bước** — chặng `web-s1` (7 bài, `p6-u16…u18`) và `architecture-s1`
     (6 bài, `p6-u19…u21`). Hai luật rút ra, áp cho mọi chặng sau: mã unit của nội dung hướng
     **bắt đầu từ `p6-u16`** (dải `p6-u5…u15` thuộc CHƯƠNG TRÌNH M, mã unit là khoá tiến độ
     Postgres nên không được lấn); chặng nào đã có bài phải khai vào
     `specializations/stageUnits.ts` thì giao diện mới hiện lối "Vào học" — cổng
     `stageUnits.test.ts` kiểm chéo.
   - **Chi tiết chặng (đợt 0179)** — **S2 của cả 13 hướng**: mỗi module có mục tiêu · bài luyện
     tay · câu tự kiểm · dấu hiệu đã nắm; mỗi chặng có rubric nghiệm thu (kèm cách chứng minh)
     và **đặc tả mẫu 6 ô** theo §2.5. Dữ liệu `specializations/details/<hướng>-s2.ts` + sổ đăng
     ký `stageDetails.ts`; trang `/lap-trinh/huong/:specId/:stageId`.
     **Cố ý KHÔNG làm bài học 8 bước cho cả 13 hướng**: 9/13 hướng không có bộ chạy trong trình
     duyệt, ép khuôn Predict/Parsons/Make lên chúng sẽ đẻ ra nội dung giả — tầng này là bản đồ
     và nghiệm thu, chấm code tự động vẫn thuộc xương sống P1–P5.
     Còn lại: chi tiết cho S1/S3/S4 và bài học cho các chặng khác — khuôn đã sẵn ở cả hai tầng.
2. ~~**Chưa lưu tiến độ hướng xuống Postgres.**~~ **[Xong 2026-08-27]** Hai mức, bổ sung cho nhau:
   **mức CHẶNG** — bảng `programming.spec_enrollment` + `spec_stage_progress` (migration `0071`,
   endpoint `/api/programming/specialization`): đang theo hướng nào, chặng nào đã xong.
   **Mức MỤC trong chặng (đợt 0179)** — từng module và từng tiêu chí rubric đánh dấu được qua
   `/api/programming/progress` với khoá `web-s2-m1` / `web-s2-r3`, dùng chung bảng
   `programming.lesson_progress`, không cần migration.
   Ghi chú cũ giữ lại: id chặng và
   id module đã đặt ổn định từ bây giờ để làm khoá tiến độ sau này không phải di trú.
3. **Chưa có gợi ý hướng theo hồ sơ người học.** Cố ý: gợi ý sai còn tệ hơn không gợi ý. Muốn làm
   thì phải bám `dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` và tuyệt đối không hiện con
   số năng lực lên giao diện.

---

## [4] Tài liệu: dac-ta-uiux-mon-lap-trinh-2026-08-26.md

_(Chi tiết nguồn gốc: `dac-ta-uiux-mon-lap-trinh-2026-08-26.md`)_

# Đặc tả UI/UX môn LẬP TRÌNH — 2026-08-26

> **Loại tài liệu:** đặc tả thiết kế (chưa thi hành). Nguồn nội dung:
> `dac-ta-mon-lap-trinh-2026-08-24.md` (thang P1–P6, khuôn 8 bước) +
> `dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md` (dự án trục).
> Tài liệu này KHÔNG sửa nội dung giáo trình — nó quyết định **cách trình bày** giáo trình đó.
>
> **Trạng thái nội dung tại thời điểm viết (đo bằng lệnh trên `origin/main` 666ce3e):**
> **60 bài, 57 unit, KHÔNG unit nào rỗng** — P1: 10 · P2: 10 · P3: 15 · P4: 12 · P5: 9 · P6: 4.
> Môn đã mở trọn P1→P6. Cái chưa có không phải nội dung, mà là **người học thật**: chưa ai đi
> hết môn, chưa có đợt hiệu chỉnh nào theo dữ liệu thật; riêng P6 là bản mở đường soạn trước
> mốc "P1–P5 chạy thật với người học". Phân biệt này quyết định luật N1 và §6 khối 6.

---

## 1. Chẩn đoán hiện trạng

### 1.1. Cái đã có

6 trang thật, 1.748 dòng, đều đã vào cổng a11y (15 trang × 5 theme) và có 3 file e2e:

| Trang                    | Route                    | Dòng | Vai trò hiện tại                                  |
| ------------------------ | ------------------------ | ---- | ------------------------------------------------- |
| `ProgrammingHome`        | `/lap-trinh`             | 132  | Tổng quan: 2 nút tắt, dự án trục, danh sách 6 bậc |
| `ProgrammingLevelPage`   | `/lap-trinh/:levelId`    | 149  | Đề cương unit của một bậc + thanh tiến độ         |
| `ProgrammingLessonPage`  | `/lap-trinh/bai-hoc/:id` | 643  | Khuôn 8 bước, gộp thành 6 màn                     |
| `ProgrammingProjectPage` | `/lap-trinh/du-an`       | 487  | Dự án trục, workspace nhiều file                  |
| `ProgrammingPlayground`  | `/lap-trinh/chay-thu`    | 174  | Sandbox chạy tự do                                |
| `ProgrammingReview`      | `/lap-trinh/on-tap`      | 163  | Ôn thẻ SRS                                        |

Hạ tầng thị giác đã đúng và **không được phá**: `zinc-*` đã map sang token `--z-*`
(`tailwind.config.js`) nên 5 theme chạy được; `CodeEditor` cố ý dùng nền tối cố định
`#0a0a0a` ở mọi theme với bảng màu syntax đã kiểm AA — đây là quyết định đúng, giữ nguyên.

### 1.2. Cái thiếu — 8 vấn đề đo được

**V1 — Không có "Học tiếp".** `ProgrammingHome` không đọc tiến độ (`fetchProgress` chỉ được
gọi trong `ProgrammingLevelPage`). Học viên quay lại sau 3 ngày phải tự nhớ mình đang ở
bài nào, tự bấm 3 lần mới tới nơi. Môn English có thẻ "Học tiếp"; môn Lập trình thì không.
Đây là khiếm khuyết nặng nhất về giữ chân người học.

**V2 — Nút Quay lại đi sai chỗ.** `ProgrammingLessonPage:180` ghi cứng
`nav('/lap-trinh/p1')`. Học bài `p3-u9-l1` xong bấm quay lại thì rơi về bậc P1. Lỗi thật,
sửa được trong một dòng (suy bậc từ `lesson.id`).

**V3 — Giao diện không cho thấy tầm vóc thật của môn.** Nay 60 bài đã mở trọn, vấn đề đảo
chiều so với dự đoán ban đầu: không còn là "hứa quá" mà là **bán hụt**. Trang chủ môn hiện ra
như một danh mục kỹ thuật — không chỗ nào nói đây là gần một năm học dẫn tới một sản phẩm chạy
thật trên Internet. Người dùng phải bấm vào từng bậc mới tự ráp được bức tranh đó. Đồng thời
vẫn còn một sự thật phải nói: **chưa ai học hết môn này**, nội dung chưa hiệu chỉnh theo người
học thật. Nói tầm vóc mà giấu điều đó thì lại thành hứa quá theo kiểu khác.

**V4 — Không có trang mô tả khoá học.** Người dùng chưa từng lập trình vào `/lap-trinh` chỉ
thấy một danh sách kỹ thuật (bậc, unit, ngôn ngữ). Không có chỗ nào trả lời ba câu hỏi
quyết định việc họ bắt đầu hay bỏ đi: _học xong tôi có gì? · mất bao lâu? · tôi có hợp không?_
Đây là phần user yêu cầu — đặc tả nguyên văn ở §6.

**V5 — Thanh 6 bước không kể được câu chuyện.** Cả 6 bước hiện là 6 nút bằng nhau, không
phân biệt bước "nạp" (đọc) với bước "trả" (làm), không thấy còn bao xa tới đích. Trong khi
`stepDone()` đã tính sẵn trạng thái từng bước mà UI **không dùng để hiển thị**.

**V6 — Chưa có component dùng chung.** Không có `components/programming/`. Hệ quả:
`ProgrammingLessonPage` phình 643 dòng, khối "chạy code + xem output" bị chép lại ở
Lesson/Playground/Project với ba biến thể khác nhau.

**V7 — Ngôn ngữ bài không hiện ra.** Schema có `language` 7 giá trị (python, javascript,
sql, html, dom, fetch, git) nhưng UI không hiển thị. Học viên bấm vào bài không biết sắp
viết Python hay SQL — trong khi đó là thông tin định khung kỳ vọng mạnh nhất.

**V8 — Không thấy dự án trục lớn lên.** Trang dự án tồn tại nhưng ở Home nó chỉ là một thẻ
mô tả tĩnh. Điểm bán hàng lớn nhất của môn ("một sản phẩm lớn dần qua 5 chặng") không được
thể hiện bằng hình ảnh tiến triển nào.

### 1.3. Ràng buộc phải tôn trọng

1. **Ngân sách bundle còn 0,3%** (nợ kỹ thuật #7). Mọi thiết kế dưới đây **không thêm thư
   viện nào**: chỉ Tailwind + `lucide-react` (đã có) + SVG viết tay. Component tách ra ở
   PR-UX2 phải **giảm** tổng dòng, không tăng.
2. **Cổng a11y tuyệt đối** — nội dung/tiêu đề AAA (≥ 7:1), phần còn lại AA, 0 vi phạm,
   15 trang × 5 theme. Route mới phải vào `e2e/a11y.spec.ts` ngay trong cùng PR.
3. **Không hard-code màu.** Dùng `zinc-*`/`accent-*`. Ngoại lệ duy nhất đã có tiền lệ đúng:
   bề mặt code giữ nền tối cố định ở mọi theme.
4. **Vùng chạm ≥ 44px** (`tap-44`), chữ input 16px.
5. **Luật "không giả vờ"** của môn áp cho cả giao diện, không riêng bộ chạy code — xem N1.

---

## 2. Bảy nguyên tắc thiết kế của môn

Môn Lập trình **không phải** môn English mặc áo khác. Khác biệt gốc: ở English, đơn vị học
là _từ_ (nhỏ, nhiều, ôn lặp); ở Lập trình, đơn vị học là _một chương trình chạy được_ (lớn,
ít, xây chồng). Bảy luật dưới đây rút từ khác biệt đó.

**N1 — Giao diện nói đúng trạng thái thật.** Nội dung nay đủ 60 bài, nên luật này không còn
nhắm vào số bài mà vào **mức độ đã kiểm chứng**: trang giới thiệu phải tự nói rằng chưa ai đi
hết môn và mọi mốc thời lượng là ước tính; bậc P6 mang nhãn thật "bản mở đường". Cấm mọi con
số viết tay — số bài, số unit, phần trăm đều sinh từ dữ liệu (tiêu chí A11). Đây là luật số 1
vì nó chính là thói quen tư duy #5 mà môn đang dạy: biết mình đang chạy thật hay đang mô
phỏng. Sản phẩm phải cư xử đúng thứ nó dạy.

**N2 — Code là nhân vật chính, không phải minh hoạ.** Trên mobile, khối code được ưu tiên
chiều rộng tuyệt đối: tràn viền `-mx-4` ra sát mép, cuộn ngang riêng, không bao giờ bị bọc
trong thẻ có padding lớn. Chữ code 16px, không nhỏ hơn.

**N3 — Một bài học có nhịp NẠP → TRẢ.** 6 bước chia hai pha rõ rệt bằng thị giác: pha NẠP
(Khái niệm, Ví dụ) nền mềm, đọc là xong; pha TRẢ (Dự đoán, Xếp code, Tự viết) có chấm, có
trạng thái đạt/chưa. Bước "Về nhà" là hạ cánh. Học viên phải nhìn thanh bước là biết mình
đang đọc hay đang bị kiểm tra.

**N4 — Chạy code luôn trả lời trong 3 trạng thái, không bao giờ im lặng.** Mọi lần chạy chỉ
có: _đang chạy_ (có spinner + nút Dừng) → _xong_ (output, kể cả rỗng thì ghi rõ "chương
trình không in gì") → _lỗi/quá giờ_ (thông báo tiếng Việt + dòng lỗi gốc). Cấm trạng thái
thứ tư "không thấy gì xảy ra". Đây là luật a11y lẫn luật sư phạm: lỗi im lặng là thứ môn
này dạy phải sợ.

**N5 — Thất bại là bước bình thường, không phải sự cố.** Test không đạt hiển thị màu hổ
phách (`amber`), **không phải đỏ**; đỏ chỉ dành cho lỗi hệ thống (worker chết, mất mạng).
Kèm ngay lối đi tiếp: gợi ý bậc thang → hỏi AI → xem phao. Không dùng biểu tượng ✗ to.

**N6 — Dự án trục hiện diện ở mọi màn.** Mỗi bậc, mỗi unit có `projectStep` đều nhắc "việc
này xây tiếp cái gì trong sản phẩm của bạn". Đây là thứ giữ người học qua 5 chặng.

**N7 — Mobile-first thật sự.** Bố cục một cột mặc định. Editor + output **xếp dọc** trên
mobile (không chia đôi màn hình), chỉ tách hai cột từ `lg:`. Thanh hành động của bài (Chạy /
Nộp) dính đáy trong tầm ngón cái.

---

## 3. Bản đồ màn hình

```
/mon-hoc  ──►  /lap-trinh                    ①  Trang môn (tổng chỉ huy)
                  │
                  ├─►  /lap-trinh/gioi-thieu ②  MỚI — mô tả khoá học & mục tiêu (§6)
                  ├─►  /lap-trinh/:levelId   ③  Trang một bậc P1–P6
                  │        └─► /lap-trinh/bai-hoc/:lessonId  ④  Bài học 6 màn
                  ├─►  /lap-trinh/du-an      ⑤  Dự án trục
                  ├─►  /lap-trinh/chay-thu   ⑥  Sandbox
                  └─►  /lap-trinh/on-tap     ⑦  Ôn thẻ SRS
```

Chỉ **thêm một route** (`/lap-trinh/gioi-thieu`). Luật quay lại: mỗi trang lùi đúng một cấp
theo cây trên — bài học lùi về **bậc của chính nó** (sửa V2), không phải P1 cố định.

---

## 4. Hệ thống thị giác riêng của môn

### 4.1. Ba bề mặt

| Bề mặt           | Dùng cho                                      | Quy cách                                                                                                                    |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Giấy**         | Chữ để đọc: hook, lý thuyết, đề bài           | `bg-zinc-900/80 border-zinc-800 rounded-3xl p-5`, chữ `text-zinc-200`, `leading-relaxed`. Theo theme. AAA.                  |
| **Bảng đen**     | Mọi thứ là code: ví dụ, editor, output        | Nền tối cố định `#0a0a0a` ở **mọi theme**, `rounded-2xl`, font mono 16px, cuộn ngang riêng. Không theo theme — như mọi IDE. |
| **Bàn làm việc** | Vùng thao tác: Parsons, chọn đáp án, thẻ test | Giữa hai loại trên: nền `zinc-950`, viền `zinc-800`, phần tử bấm được `tap-44`.                                             |

Luật ranh giới: **không trộn**. Chữ giải thích không đặt trên nền bảng đen; code không đặt
trên nền giấy. Học viên phân biệt "đang đọc" với "đang nhìn máy nói" chỉ bằng nền.

### 4.2. Bảng màu ngữ nghĩa (cố định toàn môn)

| Ý nghĩa                     | Màu                 | Dùng ở                                     |
| --------------------------- | ------------------- | ------------------------------------------ |
| Đạt / đúng                  | `emerald`           | Test pass, bài hoàn thành, thanh tiến độ   |
| Chưa đạt — _bình thường_    | `amber`             | Test fail, dự đoán sai, Parsons sai thứ tự |
| Lỗi hệ thống — _bất thường_ | `red`               | Worker chết, quá thời gian, mất mạng       |
| Đang chạy                   | `accent` + spinner  | Nút Chạy/Nộp khi busy                      |
| Chưa mở (lưới an toàn)      | `zinc` + `Lock`     | Không ca nào dùng tới — xem §5.2           |
| Dự án trục                  | `accent` + `Hammer` | Mọi nhắc tới bước dự án                    |

`amber` ≠ `red` là quyết định sư phạm (N5), phải giữ nhất quán tuyệt đối.

### 4.3. Huy hiệu ngôn ngữ (ĐÃ THI HÀNH ở PR-UX1 — vá V7)

**11** giá trị `language` (không phải 7 như bản nháp đầu — bậc P4 đã thêm 4 làn mới), mỗi cái
một huy hiệu nhỏ hiện ở **danh sách bài** và **đầu bài học**:

| Mã           | Nhãn              | Mô phỏng?                          |
| ------------ | ----------------- | ---------------------------------- |
| `python`     | Python            | —                                  |
| `pytest`     | Python · pytest   | ✔ bộ chạy tự viết                  |
| `httpsim`    | Python · gọi API  | ✔ `requests.py` nằm sẵn trong máy  |
| `apisim`     | Python · dựng API | ✔ gói `fastapi/` nằm sẵn trong máy |
| `typescript` | TypeScript        | — (biên dịch thật)                 |
| `javascript` | JavaScript        | —                                  |
| `sql`        | SQL               | — (SQLite WASM thật)               |
| `html`       | HTML/CSS          | —                                  |
| `dom`        | JS trên trang     | —                                  |
| `fetch`      | JS gọi API        | ✔                                  |
| `git`        | Git               | ✔                                  |

Quy cách: pill `text-[11px]`, nền `zinc-950`, viền `zinc-700`, chữ `zinc-300`, kèm chấm màu
`aria-hidden` — **màu không bao giờ là kênh thông tin duy nhất**, tên ngôn ngữ luôn hiện bằng
chữ. Làn mô phỏng **bắt buộc** kèm "· mô phỏng" (luật "không giả vờ").

Danh sách ngôn ngữ khai một chỗ (`LESSON_LANGUAGES` trong `lessonTypes.ts`) và `LangBadge.test.tsx`
duyệt qua chính hằng đó — thêm ngôn ngữ mà quên nhãn thì **CI đỏ**, không lặng lẽ render huy
hiệu trống.

### 4.4. Thanh tiến trình bậc — hình dạng "leo dốc"

Thay 6 thẻ phẳng bằng một cột mốc dọc: mỗi bậc là một nút trên đường thẳng đứng, có vòng
tiến độ nhỏ (SVG viết tay, không thư viện) hiện `x/y` bài đã xong; bậc chưa soạn để trống
với nhãn thật. Đường nối giữa các mốc tô đậm dần theo tiến độ — người học thấy mình đang ở
đâu trên gần một năm học.

---

## 5. Đặc tả từng màn

### 5.1. ① `/lap-trinh` — Trang môn

Thứ tự khối, từ trên xuống (mỗi khối trả lời một câu hỏi của người dùng):

1. **Thẻ "Học tiếp"** _(mới — vá V1)_. Chiếm vị trí đầu, to nhất. Hiện: tên bài đang dở
   hoặc bài kế tiếp, huy hiệu ngôn ngữ, bậc, và một nút duy nhất **"Học tiếp →"**.
   - _Chưa đăng nhập / chưa học bài nào_ → biến thành **"Bắt đầu từ bài 1"** + liên kết
     phụ "Khoá học này là gì?" trỏ `/lap-trinh/gioi-thieu`.
   - Nguồn dữ liệu: `fetchProgress` (đã có) + thứ tự bài suy từ `PROGRAMMING_LEVELS`.
   - Đây là thay đổi có tác động lớn nhất trong toàn đặc tả.
2. **Dải tiến độ môn**: `x/60 bài của bạn` + 6 chấm bậc tô dần theo tiến độ **của học viên**
   (nội dung nay đã 60/60, nên thanh này đo người học chứ không đo việc soạn bài) + streak.
3. **Dự án của tôi**: thẻ dự án trục hiện **chặng đang ở** và sản phẩm hiện tại là gì, kèm
   thanh 5 chặng. Không còn là thẻ mô tả tĩnh (vá V8).
4. **Ba nút tắt**: Chạy thử · Ôn thẻ · Giới thiệu khoá học.
5. **Lộ trình 6 bậc** theo dạng cột mốc §4.4.

### 5.2. ③ `/lap-trinh/:levelId` — Trang một bậc

Giữ cấu trúc hiện có (đang tốt), sửa 4 điểm:

- Thẻ chặng dự án lên **đầu trang**, ngay dưới tiêu đề — nó là mục tiêu của cả bậc.
- Mỗi unit hiện **huy hiệu ngôn ngữ** của các bài trong unit.
- Unit đã hoàn thành **tự thu gọn** (như môn English), bấm để mở lại.
- Nhãn "Sắp mở" nay **không còn ca nào dùng tới** (0 unit rỗng). Giữ nhánh code đó làm lưới an
  toàn cho nội dung tương lai, nhưng không được để nó là hình dạng mặc định người dùng thấy.
- Riêng **P6** hiện một dòng nhãn thật: _"Bản mở đường — soạn trước khi có dữ liệu người học,
  dễ được sửa hơn P1–P5."_ Đây là ca N1 duy nhất còn lại ở trang bậc.

### 5.3. ④ `/lap-trinh/bai-hoc/:lessonId` — Bài học

**Thanh bước (vá V5).** Chia hai pha bằng một vạch ngăn:

```
 NẠP                         TRẢ
 ①② Khái niệm  ③ Ví dụ  │  ④ Dự đoán  ⑤ Xếp code  ⑥ Tự viết  │  ⑦ Về nhà
```

- Bước đã đạt: dấu `✓` emerald. Bước hiện tại: nền `accent`. Bước chưa tới: `zinc`.
  Dùng đúng `stepDone()` đã có sẵn — chỉ là hiển thị nó ra.
- Cuộn ngang trên mobile, bước hiện tại tự cuộn vào tầm nhìn.
- `aria-current="step"` giữ nguyên; thêm `aria-label` nêu trạng thái đạt/chưa.

**Đầu trang**: tiêu đề bài + huy hiệu ngôn ngữ + bậc/unit (bấm được, lùi đúng bậc — vá V2).

**Màn ⑥ Tự viết** — màn quan trọng nhất, bố cục dọc trên mobile:

```
[ đề bài — bề mặt Giấy ]
[ danh sách ca chấm: nhãn + trạng thái, ca ẩn ghi rõ "ca ẩn" ]
[ editor — bề mặt Bảng đen, tràn sát mép ]
[ kết quả chấm ]
[ thang trợ giúp: Gợi ý (bậc n/3) → Hỏi AI → Xem phao (cảnh báo đánh dấu) ]
─────────────────────────
[ thanh dính đáy: ⟨Chạy thử⟩  ⟨Nộp bài⟩ ]
```

- Thang trợ giúp **mở dần**, không hiện hết cùng lúc: đúng cơ chế `hintsShown`/`aiLevel` đã
  có. "Xem phao" luôn kèm cảnh báo rằng việc xem sẽ được ghi nhận.
- Đạt đủ test → dải mừng emerald + nêu rõ **thẻ SRS đã vào vòng ôn** (đang xảy ra thật
  trong `gradeMake` nhưng UI không nói).

**Màn ⑦ Về nhà**: bài tập ứng dụng + nút "Bài tiếp theo" + nhắc bước dự án nếu unit có.

### 5.4. ⑤⑥⑦ Ba màn còn lại

- **Dự án**: thanh 5 chặng ở đầu, chặng chưa mở nói thật. Workspace nhiều file dùng chung
  component editor với bài học.
- **Sandbox**: giữ tối giản. Thêm dòng nhắc "đây là nơi thử tự do, không tính điểm".
- **Ôn thẻ**: màn rỗng phải hữu ích — "Chưa có thẻ nào. Thẻ được tạo khi bạn đạt một bài
  Tự viết." + nút về bài đang dở.

---

## 6. Nội dung trang ② `/lap-trinh/gioi-thieu` — Mô tả khoá học & mục tiêu

> Đây là **nguyên văn** để bê thẳng vào code. Viết cho người chưa từng lập trình.
> Mọi con số đều là **ước tính trong đặc tả, chưa ai đi hết môn** — luật N1 buộc trang này
> phải tự nói điều đó, và nó nói ở khối 6.

---

### Khối 1 — Tiêu đề

**Lập trình — từ số 0 tới một sản phẩm chạy thật trên Internet**

Không phải một khoá học 60 video rồi bạn tự xoay xở. Đây là một sản phẩm **của bạn**, lớn
dần qua 5 chặng, và mỗi bài học là một viên gạch xây tiếp nó.

### Khối 2 — Học xong bạn cầm được gì trên tay

Không phải chứng chỉ. Là **hai thứ**:

1. **Một sản phẩm chạy thật trên Internet** — có địa chỉ https, người khác vào dùng được.
2. **Một repo GitHub có lịch sử từ dòng `print` đầu tiên** — cho người tuyển dụng thấy bạn
   đi từ đâu tới. Cái đó thuyết phục hơn mọi dòng CV, vì nó không giả được.

Sản phẩm ấy lớn lên như sau:

| Chặng | Sản phẩm của bạn lúc đó                                                              |
| ----- | ------------------------------------------------------------------------------------ |
| P1    | Máy tính tiền chạy chữ trong cửa sổ đen                                              |
| P2    | Phần mềm quản lý bán hàng, dữ liệu còn nguyên sau khi tắt máy                        |
| P3    | Trang web của cửa hàng + kho dữ liệu SQL + repo GitHub công khai                     |
| P4    | Backend API có test tự động, code chia lớp gọn gàng                                  |
| P5    | **Chạy thật trên Internet**: đăng nhập an toàn, CSDL có ràng buộc, báo cáo đã tối ưu |

### Khối 3 — Năng lực nghề bạn sẽ có

**Ngôn ngữ** — Python thành thạo · JavaScript và TypeScript cơ bản · SQL · Git và dòng lệnh.

**Làm backend** — thiết kế cơ sở dữ liệu có khoá ngoại, ràng buộc, index; giao dịch; API
đầy đủ bốn thao tác; trả đúng mã lỗi (422 / 404 / 409); và luật quan trọng nhất: **không
tin dữ liệu từ phía người dùng**.

**Chất lượng** — viết test tự động; nghĩ ca biên **trước** khi viết code; sửa cấu trúc mà
không đổi hành vi; lỗi có mã và có nhật ký.

**Nền khoa học máy tính** — big-O; tìm kiếm và sắp xếp; stack, queue, hash, đệ quy; cây và
đồ thị (BFS/DFS).

**An toàn nhập môn** — SQL injection, băm mật khẩu có muối, XSS ở mức nhận biết.

**Vận hành** — cấu hình bằng biến môi trường, bí mật không nằm trong code, deploy miễn phí.

Theo thang nghề SFIA, đây tương đương **bậc 3 — lập trình viên làm việc độc lập**, tức đủ
để nhận việc thật ở mức junior.

### Khối 4 — Thứ chúng tôi cho là giá trị nhất: sáu thói quen tư duy

Kiến thức thì tra được. Sáu thói quen này thì không — và chúng được cài rải khắp 60 bài
chứ không nằm gọn ở bài nào:

1. **Phân biệt "đúng" với "đúng và rẻ".** Cùng một kết quả, có cách tốn một triệu thao tác
   và có cách tốn mười nghìn.
2. **Đo trước khi sửa, đo lại sau khi sửa.** Bước _đo lại_ là bước hay bị bỏ nhất.
3. **Sợ đúng thứ đáng sợ: lỗi im lặng.** Tìm nhị phân trên danh sách chưa sắp xếp trả sai
   rất tự tin. Chương trình vẫn chạy êm — chỉ dữ liệu là sai.
4. **Đặt ràng buộc ở chỗ mọi đường vào đều phải đi qua.** Cái `if` trong một hàm không cứu
   bạn vào ngày bạn viết thêm một script nhập liệu.
5. **Biết mình đang chạy thật hay đang mô phỏng.** Ở đây chỗ nào giả lập thì ghi rõ
   `[GIẢ LẬP]`; chỗ nào không kiểm chứng được thì không chấm hộ bạn.
6. **Hỏi cho rõ đề trước khi gõ dòng đầu tiên.**

### Khối 5 — Nói thẳng: thứ bạn sẽ KHÔNG có

Chúng tôi thà mất một học viên còn hơn để bạn học một năm rồi mới biết:

- **Chưa viết được Go, Rust hay C.** Bậc P6 dạy _cơ chế_ (đồng thời, quyền sở hữu bộ nhớ)
  bằng mô hình chạy được; cú pháp thật bạn phải tự học tiếp.
- **Chưa có kinh nghiệm làm việc nhóm.** Không code review, không xung đột merge thật,
  không phải đọc code người khác, không có code cũ để bảo trì. Đây là khoảng trống lớn
  nhất và bài tập không dạy được.
- **Chưa gặp quy mô thật.** Không tải cao, không dữ liệu bẩn ngoài đời, không trực sự cố.
  Mười nghìn đơn sinh bằng công thức khác hẳn mười nghìn đơn của người thật.
- **Frontend còn mỏng** — JavaScript thuần và DOM, chưa có React hay framework nào.
- **Docker, CI/CD, giám sát** mới ở mức việc về nhà, không chấm.

### Khối 6 — Cái giá, và trạng thái thật của khoá học

Ước tính trong đặc tả: **10 + 12 + 20 + 24 + 28 tuần ≈ gần một năm** học đều đặn.
Đây không phải bootcamp ba tháng, và chúng tôi không bán nó như vậy.

> **Trạng thái thật hôm nay:** nội dung đã đủ — **60 bài, cả sáu bậc P1→P6 đều mở**, không bậc
> nào còn chỗ trống. Nhưng **chưa có ai đi hết môn này**: toàn bộ vừa soạn xong, chưa hiệu chỉnh
> theo một người học thật nào. Bậc P6 còn là bản mở đường, soạn trước cả mốc dự kiến. Nghĩa là
> mọi con số ở trên — kể cả "gần một năm" — là **thiết kế đầu ra, không phải kết quả đã đo
> được**. Bạn sẽ nằm trong nhóm đầu tiên đi qua nó.

_(Khối này bắt buộc hiển thị. Con số 60 đọc từ dữ liệu, không viết tay — xem §7 A11.)_

### Khối 7 — Hợp và không hợp

**Hợp với bạn nếu:** bạn muốn đổi nghề một cách nghiêm túc, hoặc là học sinh / sinh viên
muốn một cái nền vững chứ không phải mẹo vặt.

**Không hợp nếu:** bạn cần một công việc trong ba tháng.

### Khối 8 — Hành động

**[ Bắt đầu bài đầu tiên ]** · Hoặc _xem thử bài học trông thế nào_ → mở `p1-u4-l1`.

---

## 7. Cổng nghiệm thu

| #   | Tiêu chí                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------ |
| A1  | `/lap-trinh/gioi-thieu` vào `e2e/a11y.spec.ts`, 0 vi phạm ở cả hai cổng A/AA và AAA                                            |
| A2  | Không thêm dependency; `npm run budget` còn dư sau khi build                                                                   |
| A3  | Không có mã màu hex mới ngoài bề mặt "Bảng đen" đã có tiền lệ                                                                  |
| A4  | Mọi vùng bấm `tap-44`; editor giữ 16px                                                                                         |
| A5  | Thẻ "Học tiếp" đúng ở cả 3 ca: chưa đăng nhập · chưa học bài nào · đang dở bài                                                 |
| A6  | Nút quay lại từ bài `p3-*` về `/lap-trinh/p3` (test e2e chặn V2 tái phát)                                                      |
| A7  | `ProgrammingLessonPage` **giảm** xuống dưới 400 dòng sau khi tách component                                                    |
| A8  | P6 mang nhãn "bản mở đường"; nhãn "Sắp mở" không xuất hiện ở bất kỳ bậc nào (0 unit rỗng)                                      |
| A9  | Test fail hiển thị `amber`; `red` chỉ xuất hiện khi lỗi hệ thống                                                               |
| A10 | Mọi lần chạy code kết thúc ở đúng 1 trong 3 trạng thái của N4, kể cả output rỗng                                               |
| A11 | Mọi con số (60 bài · 57 unit · x/y mỗi bậc) sinh từ dữ liệu (`getLessonsByUnit` + `PROGRAMMING_LEVELS`), có unit test khoá lại |
| A12 | 5 theme × trang mới: không khối chữ nào mất tương phản                                                                         |

---

## 8. Kế hoạch thi hành — ĐÃ XONG CẢ 5 ĐỢT (2026-08-26)

| PR      | Nội dung                                                                           | Trạng thái |
| ------- | ---------------------------------------------------------------------------------- | ---------- |
| **UX0** | Đặc tả này                                                                         | ✅         |
| **UX1** | Vá V2 (nút quay lại sai bậc) + V7 (huy hiệu ngôn ngữ)                              | ✅         |
| **UX2** | Tách 7 component `components/programming/`; `ProgrammingLessonPage` 662 → 378 dòng | ✅         |
| **UX3** | Trang `/lap-trinh/gioi-thieu` (công khai)                                          | ✅         |
| **UX4** | Dựng lại `/lap-trinh`: thẻ Học tiếp, tiến độ thật, cột mốc bậc, dự án động         | ✅         |
| **UX5** | Luật N3 (thanh 2 pha) · N4 (3 trạng thái chạy) · N5 (amber/red)                    | ✅         |

**Bốn lỗi thật bị phát hiện trong lúc thi hành** — không cái nào nằm trong danh sách 8 vấn đề
ban đầu, tất cả lộ ra khi đọc kỹ code hoặc khi một cổng đỏ:

1. **V2 có HAI ca, không phải một.** Ngoài `Layout onBack`, nút "Về trang bậc P1" ở màn ⑦ cũng
   ghi cứng. Vá một chỗ mà tưởng xong là cách lỗi sống sót.
2. **Có 11 ngôn ngữ, không phải 7** (bậc P4 thêm `pytest`/`httpsim`/`apisim`/`typescript`).
   Typecheck bắt được nhờ `Record<Lang, …>` đòi đủ khoá — nếu dùng `Partial` thì đã lọt.
3. **Ca N4 ở trang bài học:** `{output && <pre>…}` nên chương trình chạy đúng mà không in gì
   thì màn hình trống trơn.
4. **Ca N4 ở sandbox, tệ hơn:** chạy xong quay về `idle` nên hiện lại câu _"Bấm Chạy để xem kết
   quả"_ — không phải im lặng mà là **nói dối rằng chưa chạy lần nào**.

**Một bài học về ranh giới a11y:** cùng một cặp class `text-accent-300 theme-light:text-accent-800`
đạt AAA khi nằm trong `<button>` nhưng TRƯỢT khi nằm trong `<p>` hoặc `<li>` — vì cổng AAA chỉ
soi nội dung/tiêu đề, và `li` không nằm trong danh sách "chrome" của `e2e/a11y-aaa.spec.ts`.
Copy class từ một nút sang một đoạn văn là đủ để làm đỏ CI.

## 9. Ba quyết định đã chốt (người dùng duyệt 2026-08-26)

1. **Câu "chưa ai đi hết môn" chỉ xuất hiện ở trang giới thiệu** (§6 khối 6) — nói một lần cho
   rõ, không rải lên trang môn hay trang bậc; nhắc nhiều lần thành tự bôi xấu. Ngoại lệ duy
   nhất: nhãn "bản mở đường" của P6, vì đó là cảnh báo có hệ quả thực tế cho người đang học.
2. **`/lap-trinh/gioi-thieu` mở cho người CHƯA đăng nhập.** Đây là trang bán hàng của môn; bắt
   đăng nhập mới xem là tự chặn người mới. Thi hành: đặt route NGOÀI `RequireAuth` (khác 6 route
   còn lại của môn). Hệ quả phải xử lý ở PR-UX3: trang không được gọi API cần token, và nút hành
   động cuối trang phải dẫn qua đăng nhập rồi mới vào bài.
3. **Giữ nguyên thứ tự 5 PR** ở §8: sửa lỗi thật trước → dọn nền → thêm trang mới → dựng lại
   trang môn → màn bài học.

---

## [5] Tài liệu: dac-ta-bo-chay-kotlin-2026-08-27.md

_(Chi tiết nguồn gốc: `dac-ta-bo-chay-kotlin-2026-08-27.md`)_

# Đặc tả BỘ CHẠY KOTLIN của DHCB (kotlinSim) — PR-M7, 2026-08-27

> Hiến chương ràng buộc: `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`
> (chương trình M) — §3 quyết định trụ cột · §3.3 luật tự khai · §3.4 cổng chất lượng của bộ
> chạy · §8 thứ tự thi hành.
>
> File này là "đặc tả bộ chạy" mà §3.4 yêu cầu: nơi ghi bảng khác biệt đã biết và kết quả đối
> chiếu với trình biên dịch thật.

## 0. Trạng thái — ĐỌC TRƯỚC KHI SOẠN NỘI DUNG

| Việc                                                    | Trạng thái     |
| ------------------------------------------------------- | -------------- |
| Interpreter tập con chạy được, chấm được bằng test-case | ✅ xong        |
| Bộ ca đối chiếu (48 ca) xanh trên bộ chạy DHCB          | ✅ xong        |
| **48 ca đã chạy trên `kotlinc` THẬT và khớp**           | ❌ **CHƯA**    |
| Cổng §3.4 (được phép soạn nội dung Kotlin chưa?)        | ❌ **CHƯA MỞ** |

**Vì sao chưa:** máy dựng PR-M7 không có Kotlin toolchain (`kotlin`/`kotlinc` không có sẵn,
proxy chặn tải). Hiến chương §3.4 cấm suy đoán kết quả từ trí nhớ, nên mọi ca giữ
`daDoiChieu: false` cho tới khi có người chạy thật.

**Cách đóng cổng này (một lệnh, trên máy có Kotlin):**

```bash
npm run kotlin:conformance
```

Script `scripts/kotlin-conformance.ts` sinh một file `.kt` gồm đúng 48 ca, chạy bằng `kotlin`
(hoặc `kotlinc` + `java`), so từng ca với cả kết quả kỳ vọng lẫn output của bộ chạy DHCB, rồi
in ra ca nào lệch. Xong thì:

1. Đặt `daDoiChieu: true` cho các ca đã khớp trong
   `packages/subject-programming/kotlinSim/conformance.ts`.
2. Ghi phiên bản đã dùng (`kotlin -version`) vào mục 4 của file này.
3. Ca nào lệch thì **sửa bộ chạy** (hoặc sửa kỳ vọng nếu kỳ vọng sai), không được bỏ qua.

Cổng `conformance.test.ts` tự canh điều này: hễ còn ca chưa đối chiếu mà đã có bài
`language: 'kotlin'` trong `lessons.ts` thì CI đỏ. Tức là **không thể lỡ tay soạn nội dung
trước**.

## 1. Bộ chạy này LÀ GÌ

Trình thông dịch một **tập con** của Kotlin, viết thuần TypeScript, chạy chung một đoạn mã ở
cổng CI lẫn trình duyệt (hiến chương §3.1 — triệt tiêu loại lỗi "xanh ở CI, rớt ở máy học viên"
mà mạch Python python3-vs-Pyodide từng dính).

Bốn file, mỗi file một việc:

| File             | Việc                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `lexer.ts`       | Tách từ; hiểu nội suy `$ten` và `${…}`, chú thích lồng nhau, tên Unicode |
| `ast.ts`         | Khai kiểu cây cú pháp — **cái gì không có ở đây là bộ chạy không làm**   |
| `parser.ts`      | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                         |
| `interpreter.ts` | Duyệt cây, tính-null theo khai báo, smart cast, lớp/data/sealed/enum     |

Điểm vào: `chayKotlin(src)` trong `kotlinSim/chayKotlin.ts`.

> **Vì sao không đặt tên `index.ts`** (khác `swiftSim`): Rollup đặt tên chunk theo tên file, và
> `index-*.js` trùng glob "Initial JS" của `.size-limit.json` — đã dính thật một lần và làm ngân
> sách đội 27 kB. `swiftSim/index.ts` là tàn dư trước bài học đó.

## 2. Quyết định thiết kế đáng nhớ nhất — TÍNH NULL THEO KHAI BÁO, không theo giá trị

`swiftSim` bọc Optional tường minh được vì Swift in ra `Optional("Lan")`. **Kotlin không bọc:**
`val s: String? = "hi"; println(s)` in ra đúng `hi`. Nên không mượn được cách đó.

Nhưng thứ Kotlin dạy nằm ở chỗ khác: `s.length` với `s: String?` là **lỗi biên dịch, kể cả khi
s đang có giá trị**. Nếu bộ chạy chỉ hỏi "giá trị lúc này có null không" thì `s.length` sẽ chạy
ngon lành mỗi khi s khác null — và **dạy sai thói quen cho đúng nhóm người dễ sai nhất**.

Nên: ô biến khai kiểu `T?` mang cờ `coTheNull`, và truy cập `.` không an toàn lên ô đó là lỗi
**ngay**, kèm ba cách sửa (`?.` · `?:` · `!!`) — tái hiện đúng thông điệp của trình biên dịch
thật.

**Hệ quả bắt buộc: phải làm SMART CAST.** Không có nó thì `if (s != null) { s.length }` báo lỗi
oan trong khi Kotlin thật cho phép, mà đó lại là mẫu đầu tiên học viên gặp ở bài null safety.
Phạm vi đã làm: nhánh `then` của `if (x != null)` (kèm `&&`), nhánh `else` của `if (x == null)`,
và `is Kieu` trong `when`.

Null safety là trụ cột mà hiến chương §7 xếp vào track Kotlin, nên nó phải đúng chứ không xấp xỉ.

## 3. Khác biệt ĐÃ BIẾT so với Kotlin thật

Nguồn thi hành là hằng `KHAC_BIET` trong `kotlinSim/chayKotlin.ts` (để nội dung đọc được bằng
code, không chép tay). Bảng dưới đây là bản người đọc:

| Điểm                    | Bộ chạy DHCB                                                                     | Kotlin thật                                         | Vì sao chấp nhận                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Thời điểm bắt lỗi kiểu  | Lúc CHẠY — lỗi hiện khi dòng đó thực thi                                         | Lúc BIÊN DỊCH — sai kiểu thì không chạy dòng nào    | Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng; đổi lại lỗi ở đây chỉ đúng dòng và bằng tiếng Việt |
| Tính null của biến      | Theo KIỂU KHAI BÁO — ô khai `T?` dùng thẳng `.` là lỗi dù giá trị đang khác null | **Y HỆT** — chỗ bộ chạy cố ý bám sát                | Đây là trụ cột của ngôn ngữ, xấp xỉ là dạy sai (xem mục 2)                                           |
| Phạm vi smart cast      | Chỉ từ `x != null` / `x == null` (kèm `&&`) và `is Kieu` trong `when`            | Rộng hơn nhiều, gồm cả sau `return`/`throw` và `?:` | Suy sai còn tệ hơn không suy; bài cần mẫu ngoài phạm vi thì viết `!!` hoặc `?:` cho tường minh       |
| Thứ tự duyệt Map        | Sắp theo khoá, tất định                                                          | Giữ THỨ TỰ CHÈN (LinkedHashMap)                     | Bài học phải chấm được. **Hệ quả bắt buộc: không bài nào được dạy rằng Map giữ thứ tự chèn**         |
| Thuộc tính tính `get()` | Tính MỘT LẦN lúc tạo đối tượng                                                   | Tính LẠI mỗi lần đọc                                | Đủ cho mọi bài của khoá; bài cần tính lại theo trạng thái đổi thì phải dùng hàm                      |
| Tràn số nguyên          | Số của JavaScript — số rất lớn mất độ chính xác                                  | Int 32-bit tràn vòng, Long 64-bit                   | Bài học không đụng ngưỡng đó; nếu có thì phải nói ra                                                 |

**Luật §3.3 số 5: bài nào chạm tới một điểm trong bảng này thì PHẢI nói ra điểm đó.**

## 4. Bộ ca đối chiếu

48 ca, phủ mỗi tính năng cú pháp ít nhất một lần — dữ liệu ở
`packages/subject-programming/kotlinSim/conformance.ts`, cổng ở `conformance.test.ts`.

Nhóm ca: cơ bản (val/var, chia Int, Double in `.0`, nội suy `$`/`${}`, chuỗi ba nháy) · null
safety (in nullable không bọc, `?.`, `?:`, smart cast, `toIntOrNull`, Map trả null) · điều khiển
(`if` là biểu thức, `when` có/không chủ đề, `in` khoảng, `..`/`until`/`downTo`/`step`,
while/do-while/break/continue, for trên danh sách và chuỗi) · hàm (một biểu thức, tham số mặc
định, tham số theo tên, gọi trước khai báo) · lớp (hàm dựng chính, `init`, `open`/`override`,
data class với toString/`==`/copy, huỷ cấu trúc, lớp thường so tham chiếu, thuộc tính `get()`,
interface có hàm mặc định, `object`, sealed + `when is`, enum với `name`/`ordinal`/`values`/tham
số, companion object) · bộ sưu tập và lambda (`listOf`/`mutableListOf`, `map`/`filter` với `it`,
`fold`/`sumOf`/`any`/`all`/`count`, `sortedBy`/`joinToString`, lambda nhiều tham số, Map) ·
chuỗi · ngoại lệ (`try`/`catch`/`finally`) · tên tiếng Việt có dấu · `is`/`!is` · Boolean không
tự suy từ số.

**Phiên bản Kotlin đã đối chiếu:** _(chưa có — điền sau khi chạy `npm run kotlin:conformance`
trên máy có Kotlin)_

## 5. Bộ chạy này KHÔNG làm gì

Nguồn thi hành: hằng `KHONG_LAM_GI` trong `kotlinSim/chayKotlin.ts`. Mỗi unit Kotlin phải có một
mục nói lại đúng danh sách này (§3.3 luật 2):

- không thư viện chuẩn đầy đủ: không `java.*`, không `kotlinx`, không Android SDK;
- không giao diện, không ứng dụng thật — phần đó ở **làn C** (Android Studio trên máy học viên);
- không đa luồng thật: không coroutine, không `suspend`, không `Flow`, không `Thread`;
- không file, không mạng, không đồng hồ (cố ý — để bài học luôn cho cùng kết quả);
- không generic tự viết, không extension function, không toán tử tự định nghĩa, không delegate
  (`by lazy`…);
- không lớp lồng trong lớp — đưa lớp bên trong ra mục cao nhất.

## 6. Hai trần cứng chống treo trình duyệt

- **200.000 bước** thực thi mỗi lượt chạy (chặn `while (true)`);
- **200.000 ký tự** output (chặn vòng lặp in ra hàng MB).

Cả hai đều có test, và thông báo khi chạm trần nói rõ phải kiểm lại vòng lặp.

## 7. Việc còn lại của chương trình M sau PR này

1. **Chạy `npm run kotlin:conformance` trên máy có Kotlin** — đóng cổng §3.4 (mục 0).
2. **Chạy `npm run swift:conformance` trên máy có Swift** — cổng cứng §8, vẫn đang chặn PR-M4.
3. PR-M8…M9: nội dung Kotlin `p6-u5`…`p6-u7` (3 unit) — chỉ được bắt đầu sau bước 1.
4. Khi có bài Kotlin đầu tiên: thêm **test trình duyệt** cho mạch Kotlin, đúng bài học của PR-M2
   (cổng CI xanh KHÔNG chứng minh đường đi trong giao diện đúng).

## 8. Ghi chú thứ tự thi hành — vì sao M7 làm TRƯỚC M4

Hiến chương §8 xếp M4–M6 (nội dung Swift) trước M7 (hạ tầng Kotlin), lý do là "rẻ trước đắt".
Lý do đó **đã đảo chiều**: M4 bị cổng cứng §8 chặn cho tới khi có người chạy đối chiếu Swift
trên máy có Xcode, còn M7 là **bộ chạy khác, không đi qua cổng đó** — `conformance.test.ts` của
Swift chỉ đỏ khi có bài `language: 'swift'`, mà M7 không thêm bài nào.

Nên đổi thứ tự để mạch M không đứng im chờ một việc tay. Cổng cứng giữa M3 và M4 **vẫn nguyên
vẹn**: PR này không mở nó, không chạm vào nó, và không soạn một bài Swift nào.

---

## [6] Tài liệu: dac-ta-bo-chay-swift-2026-08-27.md

_(Chi tiết nguồn gốc: `dac-ta-bo-chay-swift-2026-08-27.md`)_

# Đặc tả BỘ CHẠY SWIFT của DHCB (swiftSim) — PR-M3, 2026-08-27

> Hiến chương ràng buộc: `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`
> (chương trình M) — §3 quyết định trụ cột · §3.3 luật tự khai · §3.4 cổng chất lượng của bộ
> chạy · §8 thứ tự thi hành và cổng cứng giữa M3 và M4.
>
> File này là "đặc tả bộ chạy" mà §3.4 yêu cầu: nơi ghi bảng khác biệt đã biết và kết quả đối
> chiếu với trình biên dịch thật.

## 0. Trạng thái — ĐỌC TRƯỚC KHI SOẠN NỘI DUNG

| Việc                                                    | Trạng thái     |
| ------------------------------------------------------- | -------------- |
| Interpreter tập con chạy được, chấm được bằng test-case | ✅ xong        |
| Bộ ca đối chiếu (41 ca) xanh trên bộ chạy DHCB          | ✅ xong        |
| **41 ca đã chạy trên `swift` THẬT và khớp**             | ❌ **CHƯA**    |
| Cổng cứng §8 (được phép soạn nội dung Swift chưa?)      | ❌ **CHƯA MỞ** |

**Vì sao chưa:** máy dựng PR-M3 không có Swift toolchain (`swift`/`swiftc` không có sẵn; proxy
chặn tải từ swift.org — đã thử, trả 403). Hiến chương §3.4 cấm suy đoán kết quả từ trí nhớ, nên
mọi ca giữ `daDoiChieu: false` cho tới khi có người chạy thật.

**Cách đóng cổng này (một lệnh, trên máy có Xcode hoặc Swift toolchain):**

```bash
npm run swift:conformance
```

Script `scripts/swift-conformance.ts` sinh một file `.swift` chứa đúng 41 ca, chạy bằng `swift`,
so từng ca với cả kết quả kỳ vọng lẫn output của bộ chạy DHCB, rồi in ra ca nào lệch. Xong thì:

1. Đặt `daDoiChieu: true` cho các ca đã khớp trong `packages/subject-programming/swiftSim/conformance.ts`.
2. Ghi phiên bản đã dùng (`swift --version`) vào mục 4 của file này.
3. Ca nào lệch thì **sửa bộ chạy** (hoặc sửa kỳ vọng nếu kỳ vọng sai), không được bỏ qua.

Cổng `conformance.test.ts` tự canh điều này: hễ còn ca chưa đối chiếu mà đã có bài
`language: 'swift'` trong `lessons.ts` thì CI đỏ. Tức là **không thể lỡ tay soạn nội dung trước**.

## 1. Bộ chạy này LÀ GÌ

Trình thông dịch một **tập con** của Swift, viết thuần TypeScript, chạy chung một đoạn mã ở cổng
CI lẫn trình duyệt (hiến chương §3.1 — triệt tiêu loại lỗi "xanh ở CI, rớt ở máy học viên" mà
mạch Python python3-vs-Pyodide từng dính).

Bốn file, mỗi file một việc:

| File             | Việc                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `lexer.ts`       | Tách từ; hiểu chuỗi nội suy `\(…)`, chú thích lồng nhau, tên Unicode   |
| `ast.ts`         | Khai kiểu cây cú pháp — **cái gì không có ở đây là bộ chạy không làm** |
| `parser.ts`      | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                       |
| `interpreter.ts` | Duyệt cây, ngữ nghĩa giá trị/tham chiếu, Optional bọc tường minh       |

Điểm vào: `chaySwift(src)` trong `swiftSim/index.ts`.

## 2. Quyết định thiết kế đáng nhớ nhất — Optional BỌC TƯỜNG MINH

Một giá trị `String?` trong bộ chạy là `{k:'tuyChon'}` **bọc quanh** chuỗi, không phải chuỗi
trần. Nhờ vậy bộ chạy làm đúng ba việc mà người mới học Swift vấp nhiều nhất:

- `print(ten)` với `ten: String?` in ra `Optional("Lan")` — y như Swift thật, chứ không im lặng
  in `Lan` rồi để học viên ngã ngửa khi gặp trình biên dịch thật;
- dùng thẳng một Optional vào phép tính thì báo lỗi **đúng chỗ**, kèm **ba** cách mở gói
  (`if let` · `??` · `!`);
- `!` mở gói một `nil` thì dừng với thông điệp nói rõ đây chính là crash kinh điển.

Optional là trụ cột mà hiến chương §7 xếp vào track Swift, nên nó phải đúng chứ không xấp xỉ.

## 3. Khác biệt ĐÃ BIẾT so với Swift thật

Nguồn thi hành là hằng `KHAC_BIET` trong `swiftSim/index.ts` (để nội dung đọc được bằng code,
không chép tay). Bảng dưới đây là bản người đọc:

| Điểm                    | Bộ chạy DHCB                                               | Swift thật                                       | Vì sao chấp nhận                                                                                     |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Thời điểm bắt lỗi kiểu  | Lúc CHẠY — lỗi hiện khi dòng đó thực thi                   | Lúc BIÊN DỊCH — sai kiểu thì không chạy dòng nào | Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng; đổi lại lỗi ở đây chỉ đúng dòng và bằng tiếng Việt |
| Thứ tự duyệt từ điển    | Sắp theo khoá, tất định                                    | KHÔNG bảo đảm thứ tự                             | Bài học phải chấm được. **Hệ quả bắt buộc: không bài nào được dạy rằng từ điển có thứ tự**           |
| Đóng (closure) một dòng | Trả về biểu thức cuối kể cả khi thân dài hơn một biểu thức | Chỉ suy ra ngầm khi thân đúng một biểu thức      | Nới cho người mới; bài học vẫn nên viết `return`                                                     |
| Tràn số nguyên          | Số của JavaScript — số rất lớn mất độ chính xác            | Int 64-bit, tràn là dừng chương trình            | Bài học không đụng ngưỡng đó; nếu có thì phải nói ra                                                 |

**Luật §3.3 số 5: bài nào chạm tới một điểm trong bảng này thì PHẢI nói ra điểm đó.**

## 4. Bộ ca đối chiếu

41 ca, phủ mỗi tính năng cú pháp ít nhất một lần — dữ liệu ở
`packages/subject-programming/swiftSim/conformance.ts`, cổng ở `conformance.test.ts`.

Nhóm ca: cơ bản (let/var, chia Int, Double in `.0`, nội suy) · Optional (in `Optional(…)`,
`if let`, `??`, `Int(String)`, `guard let`, `?.`) · điều khiển (if/else, khoảng đóng và nửa mở,
while, repeat-while, switch không rơi tầng, `where`, break/continue) · hàm (nhãn tham số, mặc
định, `_`) · kiểu (struct là giá trị, class là tham chiếu, memberwise init, `mutating`, thuộc
tính tính, kế thừa) · enum (đơn giản, rawValue, associated values) · protocol · generic · lỗi
(`throws`/`do-catch`/`try?`) · bộ sưu tập (mảng, `map/filter/reduce`, `sorted`, từ điển trả
Optional, `first`) · chuỗi · tên Unicode tiếng Việt.

**Phiên bản Swift đã đối chiếu:** _(chưa có — điền sau khi chạy `npm run swift:conformance` trên
máy có Swift)_

## 5. Bộ chạy này KHÔNG làm gì

Nguồn thi hành: hằng `KHONG_LAM_GI` trong `swiftSim/index.ts`. Mỗi unit Swift phải có một mục
nói lại đúng danh sách này (§3.3 luật 2):

- không thư viện chuẩn đầy đủ: không Foundation, không SwiftUI, không UIKit;
- không giao diện, không ứng dụng thật — phần đó ở **làn C** (Xcode trên máy học viên);
- không đa luồng thật: không `async/await`, không `Task`, không `actor`;
- không quản lý bộ nhớ thật: không ARC, không `weak`/`unowned`;
- không file, không mạng, không đồng hồ (cố ý — để bài học luôn cho cùng kết quả);
- cú pháp chỉ phủ tập con: không `extension`, không subscript tự viết, không toán tử tự định
  nghĩa, không generic ràng buộc phức tạp.

## 6. Hai trần cứng chống treo trình duyệt

- **200.000 bước** thực thi mỗi lượt chạy (chặn `while true`);
- **200.000 ký tự** output (chặn vòng lặp in ra hàng MB).

Cả hai đều có test, và thông báo khi chạm trần nói rõ phải kiểm lại vòng lặp.

## 7. Việc còn lại của chương trình M sau PR này

1. **Chạy `npm run swift:conformance` trên máy có Swift** — đóng cổng cứng §8 (mục 0).
2. PR-M4…M6: nội dung Swift `p6-u8`…`p6-u12` (5 unit) — chỉ được bắt đầu sau bước 1.
3. Khi có bài Swift đầu tiên: thêm **test trình duyệt** cho mạch Swift, đúng bài học của PR-M2
   (cổng CI xanh KHÔNG chứng minh đường đi trong giao diện đúng).

---
