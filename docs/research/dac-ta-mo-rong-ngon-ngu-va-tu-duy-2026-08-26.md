# Mở rộng ngôn ngữ & tư duy môn Lập trình — hiến chương chương trình M (quyết định 2026-08-26)

> Hiến chương của **chương trình M** (Mở rộng), nối tiếp ba hiến chương bậc đã có:
> `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md` (luật ba làn) ·
> `dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md` (chấm bằng phép đếm) ·
> `dac-ta-bac-p6-bon-track-va-ranh-gioi-ngon-ngu-2026-08-26.md` (ranh giới ngôn ngữ chạy được).
> Mọi PR của chương trình M phải theo file này.

## 0. Yêu cầu gốc và điều đã cảnh báo với người dùng

Người dùng yêu cầu (2026-08-26), sau khi đã nghe phân tích hiện trạng:

- **Tầng 1** — bổ sung **dòng lệnh (`bash`)**.
- **Tầng 2** — bổ sung **Kotlin** và **Swift**.
- **Tầng 3** — bổ sung **PARADIGM** (không thêm ngôn ngữ), "để nâng cao tư duy, hệ thống".
- Ràng buộc chất lượng: **"theo tiêu chuẩn cao nhất cho học viên"**.

Ba điều đã nói thẳng với người dùng trước khi bắt tay, ghi lại để phiên sau không tưởng nhầm
là chưa cân nhắc:

1. **Thêm tên ngôn ngữ vào bảng là việc rẻ và vô ích.** Đếm thật trên 60 bài hiện có:
   Java 0 bài · C# 0 · Go 0 · C 0 · C++ 0 · Rust 0. Tức **6/8 ngôn ngữ mà đặc tả gốc đã liệt kê
   hiện chỉ tồn tại dưới dạng một dòng chữ trong bảng.** Chương trình M vì vậy **không được
   phép** dừng ở mức thêm tên: mỗi ngôn ngữ thêm vào phải kèm **bộ chạy chấm được** hoặc bị loại.
2. **Nội dung môn đang mỏng hơn đề cương gốc 4–5 lần** (đặc tả ghi P1 "~40 bài", thực có 10 bài;
   toàn môn 60 bài). Làm dày P1–P3 có lợi cho người học hơn là mở ngôn ngữ thứ 9, thứ 10. Người
   dùng đã nghe và vẫn chọn mở rộng — đây là **quyết định của người dùng**, không phải sơ suất.
   Hệ quả phải chấp nhận: môn sẽ RỘNG trước khi DÀY.
3. **P6 vẫn là bản mở đường** (hiến chương P6 §0): chưa có người học thật đi hết P1–P5. Nội dung
   chương trình M nằm phần lớn ở P6 nên thừa hưởng nguyên cảnh báo đó.

## 1. Vấn đề phải giải

Kotlin và Swift **không có engine nào của môn chạy được** — hệt Go và Rust. Nhưng khác Go/Rust ở
một điểm quyết định: **người dùng yêu cầu khoá Swift "từ cơ bản đến nâng cao, đầy đủ và chi
tiết"**, tức phải dạy được **CÚ PHÁP**, chứ không chỉ cơ chế.

Khuôn Go/Rust (mô hình bằng Python, cú pháp thật ở làn C) **không đáp ứng được yêu cầu đó**: nó
dạy cơ chế rất tốt và hoàn toàn trung thực, nhưng học viên đi hết track vẫn chưa từng gõ một
dòng Swift nào được chấm.

Nên câu phải trả lời: dạy cú pháp Kotlin/Swift **bằng cách nào** mà không vi phạm luật "không
giả vờ" đã theo từ P3-U10?

## 2. Quyết định 1 — Vẫn KHÔNG dựng judge server

Giữ nguyên kết luận hiến chương P5 §6 và P6 §2, vì ba lý do ở đó chưa thứ nào mất hiệu lực: VPS
3 vCPU / 3GB đang gánh web + Postgres + Redis + PM2 cluster 3 instance; chạy code người lạ trên
máy chủ của mình là bề mặt tấn công lớn nhất dự án có thể tự tạo; và chi phí thường xuyên trái
nguyên tắc "0đ hạ tầng thêm cho tới khi có doanh thu tương ứng".

Điều kiện mở lại vẫn là ba điều kiện của hiến chương P6 §2 (có người học thật yêu cầu ở quy mô
đủ lớn **VÀ** có ngân sách hạ tầng riêng **VÀ** có đặc tả cô lập được duyệt).

## 3. Quyết định 2 (TRỤ CỘT) — Bộ chạy TẬP CON viết bằng TypeScript, chạy trong Worker

Đây là cách thứ ba, nằm giữa "judge server" và "mô hình Python", và là cách duy nhất vừa dạy
được cú pháp vừa trung thực.

**Nguyên tắc:** viết một **trình thông dịch tập con** của Kotlin/Swift bằng TypeScript, chạy
trong Web Worker. Học viên gõ **cú pháp Swift/Kotlin thật**, bấm Chạy, và được **chấm bằng
test-case như mọi bài khác của môn**.

### 3.1 Vì sao TypeScript-trong-Worker, không phải Python-trong-Pyodide

Đã cân nhắc viết interpreter bằng Python để tái dùng engine Pyodide sẵn có. **Bác bỏ**, vì:

| Tiêu chí                           | Interpreter bằng TS (Worker)                    | Interpreter bằng Python (Pyodide)                         |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| Khởi động ở trình duyệt            | Tức thì (đã trong bundle Worker)                | Phải tải **~13MB Pyodide** trước                          |
| Cổng CI chấm code mẫu              | Chạy thẳng bằng `vitest`                        | Cần `python3` + nạp Pyodide                               |
| Rủi ro trôi giữa CI và trình duyệt | **Không có** — cùng một file TS chạy cả hai nơi | Có (đúng loại khe hở `lessonsPython.test.ts` đã cảnh báo) |
| Ngân sách bundle                   | Worker nạp lười, không đụng Initial JS          | Không đụng                                                |

Cột "rủi ro trôi" là cột quyết định. Hiến chương P6 §4 đã ghi một ca có thật: bài dùng
`threading` **xanh ở CI** (python3 chạy thread bình thường) nhưng **rớt trên máy học viên**
(Pyodide không tạo được thread) — cổng không bắt được vì cổng chạy đúng thứ bị hỏng ở nơi kia.
Interpreter viết bằng TS **triệt tiêu hẳn loại lỗi đó**: cổng CI và trình duyệt chạy **cùng một
đoạn mã**, không phải hai bản cài đặt của cùng một ngôn ngữ.

### 3.2 Tiền lệ trong repo — không phải phát minh mới

Cách này đã chạy thật ba lần trong môn:

- `gitSim.ts` (422 dòng) — mô phỏng Git, chấm 3 bài P3-U10/U11.
- `httpSimPrelude.ts` — module `requests` giả lập, làn B của P4.
- `apiSimPrelude.ts` — gói `fastapi` giả lập, 4 bài P4.

Chương trình M nâng cùng kỹ thuật đó lên một bậc: từ "giả lập một thư viện" thành "giả lập một
ngôn ngữ".

### 3.3 LUẬT TỰ KHAI (bắt buộc, không có ngoại lệ)

Kế thừa luật tự khai của hiến chương P4 và siết chặt hơn vì đối tượng giả lập lần này lớn hơn:

1. **Bộ chạy in một dòng khai báo ngay đầu mỗi lượt chạy**, ví dụ:
   `[GIA LAP] Bo chay Swift rut gon cua DHCB — khong phai swiftc.`
2. **Mỗi unit phải có mục "Bộ chạy này KHÔNG làm gì"**, liệt kê thẳng: không có thư viện chuẩn
   đầy đủ, không SwiftUI/UIKit/Foundation, không đa luồng thật, không quản lý bộ nhớ thật.
3. **CẤM câu chữ ngụ ý đang chạy trình biên dịch thật.** Không "swiftc của bạn báo lỗi…".
   Được phép nói "cú pháp này là cú pháp Swift thật" — vì đó là sự thật — nhưng phải kèm chỗ
   khác biệt khi có.
4. **Bước ⑦ (về nhà) luôn là làn C**: cài Swift/Xcode (hoặc Kotlin/Android Studio) thật, chạy
   đúng đoạn vừa viết, đối chiếu. **Không chấm hộ làn C** (luật 3 hiến chương P4).
5. Khi bộ chạy **cố ý khác** ngôn ngữ thật ở điểm nào, điểm đó phải nằm trong bảng "khác biệt đã
   biết" của đặc tả bộ chạy, và bài chạm tới nó phải nói ra.

### 3.4 Cổng chất lượng riêng của bộ chạy

Một interpreter sai âm thầm còn tệ hơn không có interpreter: nó **dạy sai cú pháp** cho người
mới, và người mới không có cách nào biết. Nên bắt buộc:

- **Bộ test đối chiếu (conformance)**: mỗi tính năng cú pháp có ≥ 1 ca kiểm chứng kết quả khớp
  ngữ nghĩa Swift/Kotlin thật. Ca đối chiếu phải được **chạy tay một lần trên trình biên dịch
  thật** và ghi lại kết quả vào đặc tả bộ chạy — không suy đoán từ trí nhớ.
- **Cổng nội dung**: code mẫu (`make.sampleSolution`) của MỌI bài phải chạy thật và đạt HẾT
  test-case, đúng khuôn `lessonsPython.test.ts` đang làm — thêm `lessonsSwift.test.ts` và
  `lessonsKotlin.test.ts`.
- **Lỗi phải NÓI ĐƯỢC**: thông báo lỗi của bộ chạy phải chỉ đúng **số dòng của học viên** và
  viết bằng tiếng Việt dễ hiểu. Đây là nơi bộ chạy tự viết **hơn hẳn** trình biên dịch thật với
  người mới, và là lý do sư phạm chính đáng thứ hai của quyết định này.

## 4. Quyết định 3 — Tầng 1: `bash` mô phỏng, KHÔNG dùng WASM

Shell là thao tác trên **hệ thống file**, tất định, không cần máy ảo. Nên `bash` đi theo đúng
khuôn `gitSim.ts`: mô phỏng bằng TypeScript, hệ thống file trong bộ nhớ, dựng lại từ đầu mỗi
lượt chạy (học viên `rm -rf` thoải mái để học, lượt sau vẫn sạch).

**Tập lệnh bắt buộc phủ:** `pwd cd ls mkdir rm cp mv cat echo head tail grep wc sort uniq cut
find chmod` · ống `|` · chuyển hướng `>` `>>` · biến và `$(...)` · `&&` `||` · mã thoát
(`exit code`) · vòng `for` · `if` · chạy script `.sh`.

**Không phủ (khai báo thẳng trong bài):** không mạng, không tiến trình nền, không `sudo`, không
quyền người dùng thật, không `sed`/`awk` đầy đủ (chỉ dạng cơ bản nếu cần).

**FS của `bash` tách riêng với FS của `gitSim`** ở giai đoạn đầu. Gộp hai thế giới lại (để dạy
"gõ `git` trong shell") là việc đáng làm nhưng là **PR riêng, sau khi cả hai chạy ổn** — gộp
sớm là cách chắc nhất để hỏng cả hai thứ đang chạy tốt.

## 5. Quyết định 4 — Tầng 3: PARADIGM, dạy bằng ngôn ngữ đã có

Không thêm ngôn ngữ nào cho tầng 3. C/C++ và Rust đã phủ mảng "hiểu máy tính"; thêm
Zig/Julia/Elixir là chạy theo hype và sẽ lại thành tên suông (xem §0.1). Tầng 3 mở theo **cách
nghĩ**, dạy bằng Python/TypeScript đã có bộ chạy.

Ba trụ, chọn vì đây đúng là thứ ngăn cách "người viết được code" với "kỹ sư":

| Trụ                                      | Dạy cái gì                                                                                                                                                             | Vì sao là tiêu chuẩn cao nhất                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F — Lập trình hàm**                    | Bất biến · hàm thuần · hàm bậc cao · `map/filter/reduce` · đệ quy · lười (generator) · kiểu tổng/tích · **tách hiệu ứng phụ ra khỏi lõi thuần**                        | Là nguồn gốc của gần hết cải tiến ngôn ngữ 15 năm qua; "lõi thuần + vỏ hiệu ứng" là kiến trúc dễ test nhất tồn tại                                    |
| **C — Đồng thời & phân tán**             | Mô hình xen kẽ tất định · tranh chấp · khoá & deadlock · actor/thông điệp · **idempotency** · at-least-once vs exactly-once · đồng hồ logic · retry + backoff + jitter | Mọi hệ thống thật đều phân tán từ lúc có 2 tiến trình; đây cũng là loại lỗi mà type-checker **không bao giờ** bắt được (đúng luật §4.9 của CLAUDE.md) |
| **S — Thiết kế hệ thống & tư duy kỹ sư** | Ước lượng số lớn · cache · hàng đợi · phân mảnh · bất biến & ca biên · quan sát được · **phân tích sự cố** · đọc code lạ · gọi tên đánh đổi                            | Là thứ phỏng vấn cấp cao hỏi và là thứ người tự học thiếu nhiều nhất                                                                                  |

Trụ C **kế thừa và mở rộng** mô hình xen kẽ tất định đã dựng ở `p6-u2` (track Go) — không viết
lại. Và tiếp tục **cấm tuyệt đối `threading`/`multiprocessing`** (hiến chương P6 §4, đã kiểm
chứng trên Pyodide 314.0.5).

## 6. Vị trí trong khung P1–P6 — KHÔNG đụng schema

Ràng buộc cứng phải tôn trọng: mã bài là `^p[1-6]-u\d+-l\d+$`, và mã này là **khoá tiến độ
trong Postgres**. Dựng hệ bậc song song (S1–S5 cho Swift) sẽ phải sửa regex, khoá tiến độ,
route, UI và toàn bộ test — thay đổi phá vỡ, nhiều PR, đổi lấy rất ít giá trị cho học viên.
**Bác bỏ.**

Xếp chỗ như sau:

| Nội dung          | Chỗ đặt                                         | Vì sao                                                                                                                                                        |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bash` (tầng 1)   | **Mở rộng `p3-u11` "Công cụ dev"** từ 1 → 4 bài | Unit đã có sẵn đúng chủ đề. **Không thêm unit mới vào P3** vì `p3-u12` là milestone cuối bậc, và `curriculum.test.ts` bắt unit cuối bậc phải có `projectStep` |
| Kotlin (tầng 2)   | **P6 unit u5–u7** (3 unit)                      | P4 đã đóng tròn với TypeScript; đổi P4 là thay đổi phá vỡ. Tầng 2 là "chọn 1 nhánh nghề" → đúng bản chất **track tự chọn** của P6                             |
| Swift (tầng 2)    | **P6 unit u8–u12** (5 unit)                     | Nhiều unit hơn Kotlin vì người dùng yêu cầu riêng khoá Swift "cơ bản → nâng cao, đầy đủ và chi tiết"                                                          |
| Paradigm (tầng 3) | **P6 unit u13–u15** (3 trụ F/C/S)               | Chuyên đề tự chọn — đúng định nghĩa P6                                                                                                                        |

**P6 giãn từ 4 → 15 unit.** Hệ quả cần xử ở PR giao diện: trang bậc P6 hiện bày 4 track ngang
hàng; 15 unit phải **gom nhóm theo track** chứ không đổ thành một danh sách dài.

**P6 vẫn KHÔNG có chặng dự án trục** (hiến chương P6 §7 — dự án trục kết thúc ở P5). Dự án của
chương trình M nằm **trong bài học**, xem §7.

## 7. Dự án lồng trong bài — luật riêng của chương trình M

Người dùng yêu cầu "lồng những dự án tốt vào trong bài học". Luật:

- **Mỗi unit kết bằng một mini-project chấm được**, dùng đúng kiến thức của unit, không phải bài
  tập rời rạc.
- **Mỗi track có một sản phẩm trục nhỏ tích luỹ qua các unit của track** (khác dự án trục T1 của
  P1–P5 — track P6 là hướng tự chọn, không bắt buộc tuần tự):
  - **Kotlin:** "Sổ chi tiêu" — model dữ liệu → null safety → collections/lambda → sealed class
    xử lý trạng thái. Làn C: dựng thành app Android thật.
  - **Swift:** "Sổ tay học tập" — value vs reference → Optional → protocol + generic → error
    handling → mô hình bất đồng bộ. Làn C: dựng thành app SwiftUI thật.
  - **Paradigm F:** refactor một đoạn code có hiệu ứng phụ thành "lõi thuần + vỏ hiệu ứng".
  - **Paradigm C:** dựng bộ mô phỏng lịch xen kẽ, tự tìm ra lỗi mất cập nhật, rồi tự sửa.
  - **Paradigm S:** phân tích một sự cố có thật (dùng ngay hồ sơ sự cố của chính dự án này —
    `docs/ke-hoach-khoi-phuc-su-co-server.md`) và viết post-mortem.
- **Phần "app thật" luôn ở làn C.** Không mô phỏng SwiftUI, không mô phỏng Android Studio — cùng
  lý do deploy không mô phỏng ở P5.

## 8. Thứ tự thi hành — 12 PR

Thứ tự này có chủ đích: **hạ tầng trước nội dung**, và **rẻ trước đắt**, để nếu phải dừng giữa
chừng thì thứ đã merge vẫn dùng được.

| PR          | Nội dung                                                                | Loại               |
| ----------- | ----------------------------------------------------------------------- | ------------------ |
| **M0**      | Hiến chương này                                                         | Đặc tả             |
| **M1**      | Hạ tầng `bash` (`bashSim.ts` + runner + test)                           | Hạ tầng            |
| **M2**      | Nội dung `p3-u11` mở rộng — 3 bài dòng lệnh                             | Nội dung           |
| **M3**      | Hạ tầng `swiftsim` — interpreter + bộ test đối chiếu                    | Hạ tầng (đắt nhất) |
| **M4–M6**   | Nội dung Swift `p6-u8`…`p6-u12` (5 unit)                                | Nội dung           |
| **M7**      | Hạ tầng `kotlinsim` — interpreter + bộ test đối chiếu                   | Hạ tầng            |
| **M8–M9**   | Nội dung Kotlin `p6-u5`…`p6-u7` (3 unit)                                | Nội dung           |
| **M10–M11** | Nội dung Paradigm `p6-u13`…`p6-u15` (3 trụ)                             | Nội dung           |
| **M12**     | Giao diện: gom nhóm 15 unit P6 theo track, nhãn ngôn ngữ mới, a11y, e2e | Giao diện          |

**Cổng giữa M3 và M4:** interpreter Swift phải qua bộ test đối chiếu **trước khi** soạn một bài
nội dung nào. Soạn nội dung trên một interpreter chưa kiểm chứng là cách chắc chắn nhất để phải
viết lại cả 20 bài.

## 9. Điều KHÔNG làm (ghi để phiên sau khỏi mở lại)

- **Không dựng judge server** (§2) — kể cả khi thêm 3 ngôn ngữ.
- **Không dựng hệ bậc song song S1–S5** (§6) — thay đổi phá vỡ, giá trị thấp.
- **Không thêm ngôn ngữ cho tầng 3** (§5) — tầng 3 mở theo paradigm.
- **Không mô phỏng SwiftUI / UIKit / Android Studio / Xcode** (§7) — làn C.
- **Không dùng `threading`/`multiprocessing`** trong bất cứ nội dung nào (hiến chương P6 §4).
- **Không gộp FS của `bash` với `gitSim`** ở giai đoạn đầu (§4).
- **Không hứa bộ chạy đầy đủ.** Bộ chạy là TẬP CON, và mỗi unit phải nói ra nó thiếu gì (§3.3).

## 10. Tiêu chí nghiệm thu của cả chương trình

1. Ba ngôn ngữ mới (`bash`, `swift`, `kotlin`) đều có **bộ chạy chấm được** — không ngôn ngữ nào
   chỉ tồn tại dưới dạng tên trong bảng (đây là bài học §0.1, và là tiêu chí quan trọng nhất).
2. Code mẫu của **mọi** bài mới chạy thật, đạt hết test-case, chặn CI.
3. Bộ test đối chiếu của `swiftsim`/`kotlinsim` xanh, và mỗi ca đối chiếu có ghi nguồn kết quả
   thật.
4. Mỗi unit mới có **mini-project chấm được** và **mục "bộ chạy không làm gì"**.
5. Mỗi bài mới có **2–4 thẻ SRS** (giữ chuẩn 195 thẻ hiện hành, `srsCards.test.ts` canh).
6. Trang bậc P6 bày 15 unit **gom theo track**, không phải danh sách dài.
7. Toàn bộ cổng của dự án xanh: build · typecheck · lint 0 cảnh báo · format · test · e2e ·
   a11y (A/AA 0 vi phạm + AAA cho nội dung/tiêu đề) · ngân sách bundle.
8. Không bài nào vi phạm luật tự khai §3.3 — rà bằng cách đọc lại, và bằng cổng nếu tự động hoá
   được.
