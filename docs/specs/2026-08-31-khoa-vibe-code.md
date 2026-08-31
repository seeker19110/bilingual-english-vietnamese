# Đặc tả: KHOÁ RIÊNG "Vibe Code — từ số 0 đến chuyên gia" (khoá ngắn thứ ba)

> Ngày 2026-08-31. Khoá ngắn thứ ba của môn Lập trình, LÀM ĐÚNG THEO TIỀN LỆ khoá Hermes
> (`docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`): dạy TƯ DUY — QUY TRÌNH — LƯỚI AN
> TOÀN — BẬC CHUYÊN GIA của cách lập trình bằng mô tả (vibe coding), chấm bằng bộ mô phỏng
> tất định `vibeSim` (khuôn `gitSim`/`hermesSim`), làm thật để ở homework.
> Khuôn: `docs/templates/dac-ta-tinh-nang.md`.

## 0. Một câu

Khoá học ĐỘC LẬP **"Vibe Code — từ số 0 đến chuyên gia"** (`/lap-trinh/khoa-hoc/vibe`,
20 bài / 4 chương) dạy người CHƯA TỪNG code cách xây phần mềm bằng cách MÔ TẢ cho tác tử AI
— và dạy người đã biết cách đó trở thành chuyên gia: mô tả như một bản đặc tả, xem diff trước
khi nhận, dựng lưới an toàn (test · mốc · hoàn tác), và biết khi nào KHÔNG vibe code — chấm
bài bằng bộ mô phỏng tất định `vibeSim`, không gọi AI thật, không mạng thật khi chấm.

## 1. Nghiên cứu đầu vào

### 1.1. Vibe coding là gì (tra cứu thật, không đoán)

**Vibe coding** — thuật ngữ Andrej Karpathy đặt (2/2025): xây phần mềm bằng cách mô tả ý
định cho AI bằng ngôn ngữ tự nhiên rồi lặp — mô tả → AI viết code → xem kết quả → mô tả
tiếp — thay vì tự gõ từng dòng. Từ đó ngành đã tách rõ HAI mức:

- **Vibe coding ngây thơ** (nghĩa gốc của Karpathy — "quên luôn code tồn tại"): nhận mọi
  thứ AI đưa mà không đọc. Nhanh cho đồ chơi cuối tuần; **nguy hiểm cho sản phẩm thật** —
  các sự cố được ghi nhận rộng rãi đều cùng khuôn: lộ API key trong code, không có test nên
  hỏng không biết, không có mốc quay lại nên AI sửa một chỗ phá ba chỗ.
- **AI-assisted engineering** (cách các đội chuyên nghiệp đã hội tụ về, 2025–2026): vẫn lập
  trình bằng mô tả, nhưng có KỶ LUẬT — đặc tả rõ trước khi giao, xem diff trước khi nhận,
  test làm trọng tài, mốc (commit) trước thay đổi lớn, secret không bao giờ vào prompt,
  và biết vùng cấm (thanh toán, bảo mật, dữ liệu người dùng phải HIỂU code mới đụng).

**Khoá này dạy đường đi từ mức 1 lên mức 2** — đúng nghĩa "từ số 0 đến chuyên gia": số 0
là chưa từng code, chuyên gia là người điều khiển AI viết code CÓ KỶ LUẬT. Đây cũng chính
là bộ kỷ luật DHCB tự vận hành hằng ngày (CLAUDE.md mục 3–11: đặc tả 6 ô, cổng commit,
review diff, conventional commits) — khoá chưng cất nó cho người học.

### 1.2. Vì sao đáng dạy — và dạy KHÁC khoá Hermes/Git chỗ nào

Khoá Hermes dạy **giao việc văn phòng** cho một trợ lý AI (lăng kính điều phối, sản phẩm là
email/báo cáo). Khoá Git dạy **công cụ quản phiên bản** cho người tự viết code. Khoá Vibe
Code đứng giữa và khác cả hai: sản phẩm là **PHẦN MỀM**, người làm **không tự viết code** —
năng lực đích là "tôi mô tả được phần mềm mình muốn chính xác tới mức AI xây đúng, và tôi
đủ kỷ luật để thứ được xây ra không sập". Bài trùng khái niệm (mốc/hoàn tác trùng ý Git,
duyệt việc trùng ý Hermes) NHẮC LẠI có chủ đích với công cụ khác — đúng tinh thần SRS.

**Trọng tâm sư phạm riêng của khoá này: KỶ LUẬT TRƯỚC TỐC ĐỘ.** Bốn luật nạp thẳng vào máy
mô phỏng (xem §③) để học viên VA VÀO chứ không chỉ đọc: mô tả mơ hồ thì agent hỏi lại chứ
không đoán; code chưa xem diff thì không nhận được; test chưa xanh thì không deploy được;
secret dán vào mô tả thì bị từ chối thẳng.

### 1.3. Đối tượng

- **Người chưa từng lập trình** muốn tự xây công cụ/web nhỏ cho mình bằng AI — vào thẳng,
  không cần biết cú pháp ngôn ngữ nào.
- **Người đã "vibe code" theo bản năng** (đã dùng Cursor/Claude Code/Lovable…) muốn lên
  bậc: sản phẩm không sập, không lộ secret, sửa được sáu tháng sau.
- `prerequisites: []` — vào thẳng; mọi lệnh gõ trong terminal giả lập của bài học.

### 1.4. Hiện trạng hạ tầng (đo thật từ mã nguồn 2026-08-31)

| Thứ                                        | Số thật hôm nay                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Tầng khoá ngắn `courses/`                  | ĐÃ CÓ: khoá `git` + `hermes`; đăng ký khoá mới = 1 file + 1 dòng registry         |
| Trang khoá `/lap-trinh/khoa-hoc/:courseId` | ĐÃ CÓ, data-driven — khoá mới tự hiện ở `ProgrammingHome`                         |
| Khuôn bài 8 bước + SRS                     | ĐÃ CÓ (`lessonTypes.ts`)                                                          |
| Khuôn "máy ảo tí hon tất định"             | ĐÃ CÓ ×3: `bashSim` · `gitSim` · `hermesSim` — `vibeSim` là con thứ tư cùng khuôn |
| Khuôn runner không worker                  | ĐÃ CÓ (`gitRunner.ts`/`hermesRunner.ts`)                                          |
| Regex `lessonId`                           | `^(p[1-6]-u\d+-l\d+\|(git\|hermes)-u\d+-l\d+)$` ở 4 chỗ — nới thêm `vibe-`        |
| Bài dùng lại được                          | 0 — 20/20 bài mới                                                                 |

## ② Phạm vi

**LÀM:**

- **Bộ mô phỏng `vibeSim.ts`** — mô phỏng MỘT TÁC TỬ AI VIẾT CODE kiểu CLI (khái quát hoá
  Claude Code/Cursor/aider — không nhại thương hiệu nào): máy ảo tí hon thuần TypeScript,
  tất định tuyệt đối, in dòng tự khai `[GIA LAP]` mỗi lượt. Bộ lệnh đóng (xem ③). "Code AI
  sinh ra" là văn bản đóng hộp tất định (bản tóm tắt diff), không sinh ngẫu nhiên.
- **Ngôn ngữ bài học mới `'vibe'`** trong `LESSON_LANGUAGES` + `vibeRunner.ts` (khuôn
  `hermesRunner.ts`, không worker) + nhãn `LangBadge` ("Tác tử AI code · mô phỏng") +
  nhánh `laBaiDongLenh`.
- **Khoá `vibe` 4 chương / 20 bài** (id `vibe-uN-lM`, unit ảo `vibe-uN`):

  | Chương                      | Bài | Danh sách bài                                                                                                                                                                                                                                                                |
  | --------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | C1 Tư duy & vòng lặp        | 6   | Vibe code là gì — lập trình bằng mô tả & bảng trạng thái · Mô tả rõ ràng (mơ hồ thì agent hỏi lại) · Kế hoạch trước, code sau (`kehoach`) · Xem diff — không nhận code chưa đọc (`xemdiff`) · Nhận & yêu cầu sửa — vòng phản hồi (`nhan`/`sua`) · Hỏi cho hiểu (`giaithich`) |
  | C2 Lưới an toàn             | 5   | `kiemtra` — test là trọng tài · Ca biên — AI hay quên ca rỗng/số 0 · Secret không bao giờ vào mô tả · `luu`/`lichsu` — mốc trước thay đổi lớn · `quaylai` — hoàn tác không sợ hãi                                                                                            |
  | C3 Từ bản nháp đến sản phẩm | 4   | `trienkhai` — cổng deploy chỉ mở khi test xanh · Chuỗi đầy đủ mô tả→xem→nhận→kiểm→lưu→deploy · Sửa lỗi trên sản phẩm đang chạy · Tính năng lớn = chia thành nhiều mô tả nhỏ                                                                                                  |
  | C4 Bậc chuyên gia           | 5   | Đặc tả có mục "KHÔNG làm" · Tiêu chí chấp nhận đo được TRƯỚC khi mô tả · Mỗi tính năng một mốc — nhịp làm việc chuyên gia · Khi nào KHÔNG vibe code (vùng cấm) · Tổng kết: checklist chuyên gia trọn vòng đời                                                                |

- **Luật soạn bài cho công cụ thật** (đúng luật khoá Hermes): bước ①–⑥ chỉ dùng bộ lệnh
  đóng của `vibeSim`; công cụ thật ngoài đời (Cursor, Claude Code, Lovable, v0…) chỉ được
  nhắc ở lý thuyết/homework, KHÔNG xuất hiện trong code chạy. Cổng `lessonsVibe.test.ts`
  canh bằng regex cấm (`cursor|claude|npm|docker|curl|git\b`…).
- **Cổng CI**: `vibeSim.test.ts` (đơn vị máy mô phỏng — 4 luật sư phạm mỗi luật ≥ 1 test)
  - `lessonsVibe.test.ts` (khuôn `lessonsHermes.test.ts`: sampleSolution đạt 100% ca,
    starterCode không tự đạt, tất định 2 lượt, không lệnh ngoài đời).
- Nới regex `lessonId` thêm nhánh `vibe-` ở 4 chỗ: `lessonTypes.ts` (id + unitId),
  `apps/server/src/api/subjects/programming/feedback.ts`, `…/progress.ts`; nới
  `lessons.test.ts` công nhận unit ảo `vibe-u*` qua SHORT_COURSES.

**KHÔNG làm:**

- KHÔNG gọi AI thật, không mạng, không chạy code thật khi chấm — "phần mềm được xây" chỉ
  tồn tại dưới dạng bảng trạng thái + diff đóng hộp của mô phỏng.
- KHÔNG dạy cú pháp ngôn ngữ lập trình (đó là việc của xương sống P1–P6) — khoá dạy QUY
  TRÌNH điều khiển AI; bài nào chạm code chỉ đọc diff tóm tắt tiếng Việt.
- KHÔNG nhại giao diện/lệnh của một sản phẩm thương mại cụ thể; homework mới trỏ tới công
  cụ thật để học viên tự chọn.
- KHÔNG đổi khuôn bài 8 bước, không đổi hạ tầng chấm (grading.ts), không thêm bảng DB —
  tiến độ đi qua đúng đường `learning_progress` hiện có nhờ nới regex.

## ③ Hợp đồng vào-ra: bộ lệnh đóng của `vibeSim`

Điểm vào duy nhất `chayLenhVibe(script, lenhChuanBi)` — trình duyệt và CI gọi chung (khuôn
`chayLenhHermes`). Trạng thái dựng mới mỗi lượt; không `Date`, không ngẫu nhiên.

| Lệnh                  | Làm gì                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `vibe`                | Bảng trạng thái: dự án, số tính năng đã nhận, bản nháp chờ xem, trạng thái test, mốc gần nhất                                      |
| `mota "<yêu cầu>"`    | Giao AI xây tính năng → tạo bản nháp `vN` trạng thái `cho-xem`. Mơ hồ (luật 1) hoặc chứa secret (luật 4) thì TỪ CHỐI, không tạo gì |
| `kehoach "<yêu cầu>"` | Chế độ kế hoạch: AI in các bước ĐỊNH làm, không đụng code — cùng phép kiểm mơ hồ/secret                                            |
| `xemdiff <id>`        | In tóm tắt diff của bản nháp (dòng `+`), đánh dấu ĐÃ XEM                                                                           |
| `giaithich <id>`      | AI giải thích bản nháp/tính năng bằng lời thường                                                                                   |
| `nhan <id>`           | Nhận bản nháp → `da-nhan`. Luật 2: CHƯA `xemdiff` thì từ chối. Sau khi nhận, test về `chua-chay`                                   |
| `sua <id> "<góp ý>"`  | Yêu cầu AI sửa theo góp ý → quay về `cho-xem`, phải xem diff lại                                                                   |
| `kiemtra`             | Chạy bộ test trên các tính năng đã nhận. Tính năng nào mô tả/góp ý CHƯA nhắc ca biên → ra `1 do … quen ca bien`; đủ thì `xanh het` |
| `luu "<tên mốc>"`     | Ghi mốc (checkpoint) trạng thái hiện tại                                                                                           |
| `lichsu`              | Liệt kê các mốc đã lưu                                                                                                             |
| `quaylai`             | Quay về mốc gần nhất: bỏ mọi tính năng nhận SAU mốc; chưa có mốc thì từ chối kèm lời khuyên                                        |
| `trienkhai`           | Luật 3: test chưa `xanh` (chưa chạy, hoặc đỏ, hoặc đã nhận thêm sau lần kiểm cuối) → TỪ CHỐI; xanh thì in URL giả lập              |

**Bốn luật sư phạm nạp thẳng vào máy** (điểm ăn tiền của khoá — học viên VA vào, không chỉ đọc):

1. **Mơ hồ thì hỏi lại** — nội dung `mota`/`kehoach` quá ngắn (< 25 ký tự sau khi bỏ dấu
   và cắt khoảng trắng) → agent in 3 câu hỏi làm rõ và KHÔNG xây gì. (Đời thật agent đo độ
   mơ hồ bằng ngữ nghĩa; mô phỏng phải tất định nên đo bằng độ dài — bài học nói rõ điều
   này, đúng luật thật thà.)
2. **Không nhận code chưa đọc** — `nhan` khi chưa `xemdiff` bản nháp đó → từ chối kèm giải
   thích. `sua` xong phải xem lại (cờ đã-xem bị xoá).
3. **Test chưa xanh thì không deploy** — `trienkhai` đòi `kiemtra` xanh SAU lần `nhan` cuối
   cùng; nhận thêm tính năng là phải kiểm lại.
4. **Secret không vào mô tả** — mô tả chứa chuỗi dạng khoá API/mật khẩu (`sk-…`,
   `mat khau la…`, `token: …`) → từ chối thẳng, chỉ đường đúng (biến môi trường).

**Cơ chế ca biên (bài C2)**: bản nháp mang cờ `quenCaBien = true` trừ khi mô tả gốc hoặc
một lần `sua` có nhắc từ khoá ca biên (`rong`, `so 0`, `khong co`, `am`, `qua dai`,
`gioi han`, `loi`). `kiemtra` gặp tính năng quên ca biên → báo 1 test đỏ nêu đích danh.
Đây là bài học lớn nhất của vibe coding ngoài đời — AI viết ca chính rất giỏi và quên ca
biên rất đều — nén thành cơ chế tất định chấm được.

## ③b Đề cương chi tiết 20 bài (nguồn thi hành — code phải bám đúng bảng này)

> Mỗi bài theo khuôn 8 bước (`lessonTypes.ts`). Cột "Bài Make chấm gì" là hợp đồng với
> `lessonsVibe.test.ts`: sampleSolution phải đạt 100% ca, starterCode không tự đạt.
> `lenhChuanBi` (dựng cảnh) đi qua `make.testCases[].stdinLines` — đúng cơ chế bài Git/Hermes.

### C1 — Tư duy & vòng lặp (unit ảo `vibe-u1`, 6 bài)

| id           | Tiêu đề                                    | Dạy gì (khái niệm + lệnh)                                                                                                                                              | Bài Make chấm gì                                                                                         |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `vibe-u1-l1` | Vibe code là gì — lập trình bằng mô tả     | Định nghĩa vibe coding (Karpathy 2/2025), hai mức ngây thơ vs kỷ luật, vòng lặp mô tả→xem→nhận; đọc bảng trạng thái `vibe`. Luật thật thà: đây là mô phỏng `[GIA LAP]` | Gõ `vibe` từ dự án trống → output chứa `tinh nang da nhan: 0` và `test: chua-chay`                       |
| `vibe-u1-l2` | Mô tả như đặc tả — mơ hồ thì agent hỏi lại | `mota "…"`; luật 1: mô tả mơ hồ → 3 câu hỏi làm rõ, không xây gì; công thức mô tả tốt: ai dùng · vào/ra · ca đặc biệt                                                  | Giao một mô tả ĐỦ RÕ (có đủ 3 vế) → chứa `cho-xem` và `ban nhap v1`; predict: `mota "lam web"` → hỏi lại |
| `vibe-u1-l3` | Kế hoạch trước, code sau                   | `kehoach "…"` — bắt AI trình bày các bước TRƯỚC khi đụng code; khi nào cần (việc lớn/mờ), khi nào bỏ qua (việc bé rõ)                                                  | `kehoach` một việc đủ rõ → chứa `Ke hoach cho:` và `Chua dung vao code`                                  |
| `vibe-u1-l4` | Xem diff — không nhận code chưa đọc        | `xemdiff <id>`; luật 2 (mặt cấm ở predict); đọc diff tóm tắt: dòng `+` là gì, để ý dòng cảnh báo thiếu ca biên                                                         | Cảnh có sẵn bản nháp v1 → `xemdiff v1` → chứa `diff cua v1` và `DA XEM`                                  |
| `vibe-u1-l5` | Nhận & yêu cầu sửa — vòng phản hồi         | `nhan <id>` · `sua <id> "…"`; góp ý cụ thể thì AI sửa trúng; bản sửa là bản MỚI phải đọc lại (cờ đã-xem bị xoá)                                                        | Cảnh có v1 đã xem → `sua v1 "…"` → `xemdiff v1` → `nhan v1` → chứa `ban sua la ban MOI` và `Da nhan v1`  |
| `vibe-u1-l6` | Hỏi cho hiểu — `giaithich`                 | `giaithich <id>` — không hiểu thì hỏi, "không cần biết code" ≠ "không cần hiểu hệ thống"; hỏi tiếp: vì sao chọn cách này, đổi chỗ nào ảnh hưởng gì                     | Cảnh có v1 → `giaithich v1` → chứa `Giai thich v1 bang loi thuong`                                       |

### C2 — Lưới an toàn (unit ảo `vibe-u2`, 5 bài)

| id           | Tiêu đề                                 | Dạy gì                                                                                                                       | Bài Make chấm gì                                                                                                                          |
| ------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `vibe-u2-l1` | `kiemtra` — test là trọng tài           | Test là bằng chứng, "chắc chạy được" không phải bằng chứng; nhịp: nhận xong là kiểm; nhận thêm là test về `chua-chay`        | Cảnh v1 đã nhận (mô tả có ca biên) → `kiemtra` → chứa `xanh het`                                                                          |
| `vibe-u2-l2` | Ca biên — AI hay quên ca rỗng/số 0      | Cơ chế ca biên của mô phỏng = thói quen thật của AI ngoài đời; danh sách ca biên phải rà: rỗng · 0 · âm · quá dài · lỗi mạng | Cảnh v1 đã nhận (mô tả KHÔNG nhắc ca biên) → `kiemtra` đỏ → `sua v1` kèm góp ý ca biên → xem lại → nhận lại → `kiemtra` → chứa `xanh het` |
| `vibe-u2-l3` | Secret không bao giờ vào mô tả          | Luật 4; vì sao (log, lịch sử chat, màn hình chia sẻ); đường đúng: biến môi trường, kho secret                                | Mô tả việc gọi API mà KHÔNG kèm khoá (nói "khoa lay tu bien moi truong") → chứa `cho-xem`; predict: kèm `sk-…` → từ chối                  |
| `vibe-u2-l4` | `luu`/`lichsu` — mốc trước thay đổi lớn | Mốc = commit của dân vibe code; lưu KHI NÀO: trước mỗi thay đổi lớn, sau mỗi lần xanh; tên mốc phải tự giải thích            | Cảnh v1 đã nhận + kiểm xanh → `luu "<tên>"` + `lichsu` → chứa tên mốc và `(1 tinh nang)`                                                  |
| `vibe-u2-l5` | `quaylai` — hoàn tác không sợ hãi       | Quay về mốc gần nhất: tính năng nhận sau mốc về `cho-xem` (không mất); vì sao có mốc thì dám cho AI thử mạnh tay             | Cảnh: v1 nhận → lưu mốc → v2 nhận → `quaylai` + `vibe` → chứa `tinh nang da nhan: 1`                                                      |

### C3 — Từ bản nháp đến sản phẩm (unit ảo `vibe-u3`, 4 bài)

| id           | Tiêu đề                                    | Dạy gì                                                                                                     | Bài Make chấm gì                                                                                                           |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `vibe-u3-l1` | `trienkhai` — cổng chỉ mở khi test xanh    | Luật 3; deploy = đưa cho người khác dùng = trách nhiệm; nhận thêm sau lần kiểm cuối là phải kiểm lại       | Cảnh v1 đã nhận → `kiemtra` + `trienkhai` → chứa `Da trien khai`; predict: `trienkhai` ngay → từ chối                      |
| `vibe-u3-l2` | Chuỗi đầy đủ — một tính năng trọn vòng đời | Ghép toàn bộ C1+C2: mô tả→xem→nhận→kiểm→lưu→deploy thành MỘT nhịp tay                                      | Từ dự án trống, tự đi trọn chuỗi 6 lệnh → chứa `xanh het` và `Da trien khai`                                               |
| `vibe-u3-l3` | Sửa lỗi trên sản phẩm đang chạy            | Người dùng báo lỗi ca biên → tái hiện bằng `kiemtra`, sửa bằng `sua` kèm mô tả lỗi, kiểm lại, deploy lại   | Cảnh v1 (quên ca biên) đã nhận → học viên: kiểm (đỏ) → sửa → xem → nhận → kiểm (xanh) → `trienkhai` → chứa `Da trien khai` |
| `vibe-u3-l4` | Tính năng lớn = nhiều mô tả nhỏ            | Chia việc: mỗi mô tả một việc kiểm được; nhận từng phần, kiểm giữa chừng — không giao "làm cả app" một câu | Hai lần `mota` nhỏ, nhận cả hai, kiểm → chứa `tinh nang da nhan: 2` và `xanh het`                                          |

### C4 — Bậc chuyên gia (unit ảo `vibe-u4`, 5 bài)

| id           | Tiêu đề                                       | Dạy gì                                                                                                                                                               | Bài Make chấm gì                                                                                                        |
| ------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `vibe-u4-l1` | Đặc tả có mục "KHÔNG làm"                     | Khuôn đặc tả 6 ô của DHCB (docs/templates/dac-ta-tinh-nang.md) chưng cất cho vibe code; mục "không làm" chặn phình phạm vi                                           | `mota` một mô tả có vế "khong lam: …" → chứa `cho-xem`; predict về phạm vi phình                                        |
| `vibe-u4-l2` | Tiêu chí chấp nhận đo được TRƯỚC khi mô tả    | "Xong" phải đo được; viết tiêu chí trước → `kehoach` đối chiếu → rồi mới `mota`                                                                                      | `kehoach` rồi `mota` cùng một việc → chứa `Ke hoach cho:` và `cho-xem`                                                  |
| `vibe-u4-l3` | Mỗi tính năng một mốc — nhịp chuyên gia       | Nhịp: mô tả→xem→nhận→kiểm→LƯU, lặp; `lichsu` là nhật ký dự án đọc được                                                                                               | Hai tính năng, mỗi cái một mốc sau khi xanh → `lichsu` chứa `2.`                                                        |
| `vibe-u4-l4` | Khi nào KHÔNG vibe code — vùng cấm            | Vùng phải HIỂU code mới đụng: thanh toán, mật khẩu/phiên đăng nhập, dữ liệu người dùng thật, xoá không hoàn tác; công cụ giảm rủi ro: `giaithich` + hỏi tiếp         | Cảnh v1 (việc chạm dữ liệu) → `giaithich v1` → `xemdiff v1` → `nhan v1` → chứa `Giai thich` và `Da nhan v1`             |
| `vibe-u4-l5` | Tổng kết — checklist chuyên gia trọn vòng đời | Checklist: mô tả đủ 3 vế · kế hoạch việc lớn · luôn xem diff · test trọng tài · mốc mỗi tính năng · secret ở env · vùng cấm phải hiểu; so mức ngây thơ vs chuyên gia | Capstone: 2 tính năng (1 quên ca biên phải cứu), mốc từng cái, deploy → chứa `xanh het`, `2.` (lichsu), `Da trien khai` |

**Homework xuyên khoá** (bước ⑦, không chấm): mỗi bài trỏ sang làm thật với MỘT công cụ thật
học viên tự chọn (Claude Code, Cursor, Lovable, v0, Replit…) — cùng bài tập nhưng trên công
cụ thật, kèm checklist tự kiểm. Bài l1 các chương có thêm việc đọc: bài gốc của Karpathy,
tài liệu best-practice của công cụ đã chọn.

**Thẻ SRS**: 2–4 thẻ/bài, tuân `srsCards.test.ts` (một ý/thẻ, đáp ≥ 40 ký tự, không lộ đáp
trong câu hỏi).

## ④ Tiêu chí chấp nhận (đo được)

1. `npm test` xanh toàn bộ, trong đó: `vibeSim.test.ts` phủ 4 luật sư phạm (mỗi luật ≥ 1
   test dương + 1 test âm) và cơ chế ca biên; `lessonsVibe.test.ts` xác nhận đúng 20 bài,
   sampleSolution đạt 100% test-case, starterCode không tự đạt, tất định, không lệnh ngoài
   bộ lệnh đóng.
2. `npm run typecheck` + `npm run lint` (0 cảnh báo) + `npm run build` xanh.
3. Vào `/lap-trinh` thấy thẻ khoá "Vibe Code…"; vào `/lap-trinh/khoa-hoc/vibe` thấy 4
   chương / 20 bài; mở bài đầu chạy được lệnh `vibe` ra bảng trạng thái có dòng `[GIA LAP]`.
4. Bài học không phá 2 khoá cũ: `courses.test.ts` + `lessonsGit/Hermes.test.ts` vẫn xanh.

## ⑤ Bất biến + test canh

- Cùng script → cùng output tuyệt đối (test tất định 2 lượt cho mọi sampleSolution).
- Mỗi lượt chạy in `DONG_TU_KHAI_VIBE` dòng đầu (luật tự khai).
- `cho-xem` → `da-nhan` CHỈ qua `nhan` sau `xemdiff`; test `xanh` CHỈ qua `kiemtra`;
  deploy CHỈ khi test xanh và không nhận thêm sau đó.
- Khoá `vibe` không tham chiếu bài của khoá khác, không sửa bài cũ nào (diff không chạm
  `lessons/gitu*.ts`, `lessons/hermesu*.ts`, `courses/git.ts`, `courses/hermes.ts` ngoài
  registry).

## ⑥ Quy ước dự án liên quan

Comment tiếng Việt trong code · output mô phỏng KHÔNG dấu (quy ước gitSim/bashSim) · import
xuyên gói `@dhcb/subject-programming/vibeSim` (không đuôi `.js`), nội bộ gói có đuôi `.js` ·
conventional commit `feat(programming): …` · PR đủ 4 bước bắt buộc (CLAUDE.md mục 11).

## Nghiệm thu

Điền sau khi PR xanh: số PR, kết quả cổng, bằng chứng chạy thử bài đầu tiên trên trình duyệt.
