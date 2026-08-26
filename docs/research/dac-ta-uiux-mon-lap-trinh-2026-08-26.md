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
