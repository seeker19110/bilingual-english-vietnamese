# ĐẶC TẢ — Chi tiết chặng S4 cho TOÀN BỘ 13 hướng chuyên sâu (2026-08-27)

> Khuôn: `docs/templates/dac-ta-tinh-nang.md` (6 ô bắt buộc).
> Cơ sở: `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md` ·
> `docs/specs/2026-08-27-chang-s2-huong-chuyen-sau.md` (khuôn `SpecStageDetail`) ·
> `docs/specs/2026-08-27-chang-s3-13-huong.md` (đợt liền trước).

## 0. Một câu

Soạn **chi tiết thi hành được cho chặng S4 (bậc chuyên gia)** của cả 13 hướng, theo ĐÚNG khuôn
`SpecStageDetail` mà S2/S3 đang dùng — để 52 chặng của 13 hướng có chi tiết đủ **4/4 chặng**,
không còn hướng nào cụt ở đích.

**Vì sao làm S4 ngay sau S3, dù đặc tả S3 từng ghi "S4 phụ thuộc bối cảnh công ty nên không đặc
tả chung được":** nhận định đó đúng một nửa. Thứ KHÔNG đặc tả chung được là **quy mô và công cụ**
của từng nơi làm việc. Thứ đặc tả chung được — và cũng là thứ phân biệt chuyên gia với người
thạo việc — là **trách nhiệm**: nói được hệ thống chịu được bao nhiêu, hỏng thì ai làm gì, và
chứng minh bằng số nào. Nên chi tiết S4 ở đây cố ý bám vào **diễn tập, số đo và nghiệm thu**,
không bám vào tên công nghệ; ai học ở công ty một người hay công ty nghìn người đều áp được.

**Hệ quả về hình dạng nội dung:** phần lớn `practice` của S4 là **ĐO** và **DIỄN TẬP** (diễn tập
khôi phục, diễn tập sự cố, diễn tập chuyển vùng, cập nhật theo đợt có đường lui), không phải
"viết thêm tính năng". Đó là khác biệt chính so với S2/S3.

---

## ① Phạm vi

**LÀM:**

- Soạn 13 file `specializations/details/<hướng>-s4.ts` theo khuôn `SpecStageDetail` sẵn có.
- Đăng ký 13 mục vào `specializations/stageDetails.ts`.
- Siết test bất biến: thêm ca "mỗi hướng có đúng một chi tiết cho chặng S4".

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **Không** dựng khuôn dữ liệu thứ hai — dùng đúng `SpecStageDetail`, vì hai khuôn song song là
  nguồn xung đột và bắt giao diện phải xử lý hai nhánh.
- **Không** đụng giao diện: `ProgrammingSpecStagePage.tsx` render theo `stageId` nên thêm dữ liệu
  là tự hiện.
- **Không** soạn bài học 8 bước ở đợt này (tầng khác, đặc tả riêng:
  `docs/specs/2026-08-27-chang-s4-13-huong.md`), **không** thêm route, **không** migration,
  **không** sửa bản đồ hướng hay dữ liệu S1/S2/S3 đang có — id chặng và id module giữ nguyên để
  không phải di trú khoá tiến độ.

## ② Điểm chạm

| Việc | Đường dẫn file                                                 | Ghi chú                     |
| ---- | -------------------------------------------------------------- | --------------------------- |
| Thêm | `packages/subject-programming/specializations/details/*-s4.ts` | 13 file, mỗi hướng một      |
| Sửa  | `packages/subject-programming/specializations/stageDetails.ts` | thêm 13 import + 13 phần tử |
| Sửa  | `packages/subject-programming/specStageDetails.test.ts`        | thêm ca bất biến cho S4     |
| Thêm | `docs/specs/2026-08-27-chi-tiet-chang-s4-13-huong.md`          | chính file này              |

**Ảnh hưởng lan ra:** `stageDetails.ts` là cửa duy nhất; đợt này chỉ THÊM phần tử vào mảng nên
consumer (`ProgrammingSpecStagePage.tsx`, `apps/server/src/api/subjects/programming/progress.ts`)
không đổi hành vi. Số mục tiến độ của mỗi chặng S4 tăng lên đúng `modules.length + rubric.length`,
do `countStageProgressItems` tính từ dữ liệu chứ không ghi cứng.

## ③ Hợp đồng dữ liệu

Dùng nguyên `SpecStageDetail` (`specializations/stageDetailTypes.ts`): `stageId` · `modules[]`
(`moduleId` · `objective` · `practice` · `selfCheck` · `doneSignals`) · `rubric[]` (`id` · `text` ·
`howToProve`) · `specBrief` (6 ô, trong đó `scopeDont` phải nêu lý do).

**Ca lỗi (là một phần hợp đồng):**

| Tình huống                               | Test bắt được                     | Hành vi mong đợi                          |
| ---------------------------------------- | --------------------------------- | ----------------------------------------- |
| `moduleId` lệch với bản đồ hướng         | "module phủ ĐÚNG và ĐỦ"           | Sửa cho khớp id module trong `<hướng>.ts` |
| Chép mục tiêu hoặc rubric giữa hai hướng | "chống copy-paste giữa các hướng" | Viết lại theo đặc thù hướng đó            |
| `scopeDont` viết cho có, không nêu lý do | 'ô "KHÔNG làm" nêu được lý do'    | Thêm vế "vì …" hoặc dấu gạch giải thích   |
| Rubric thiếu `howToProve` hoặc quá ngắn  | "mọi tiêu chí có cách chứng minh" | Ghi lệnh chạy hoặc thao tác tái hiện được |
| Chặng chưa soạn mà khai vào sổ đăng ký   | "id chặng trỏ tới chặng có thật"  | Chỉ khai chặng có trong bản đồ hướng      |

## ④ Tiêu chí chấp nhận

- [ ] Đủ 13 file `<hướng>-s4.ts`, mỗi file phủ ĐÚNG các module của chặng S4 trong bản đồ hướng.
- [ ] Mỗi chặng ≥ 4 tiêu chí rubric, mỗi tiêu chí có cách chứng minh đo được — `npm test -- specStageDetails`
- [ ] Không mục tiêu module hay tiêu chí rubric nào trùng nguyên văn giữa hai hướng.
- [ ] Test bất biến có ca riêng cho S4; xoá một file S4 là CI đỏ.
- [ ] Trang `/lap-trinh/huong/<hướng>/chang/<hướng>-s4` hiện chi tiết cho cả 13 hướng.

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm test -- specStageDetails
```

> Đợt này KHÔNG chạm prompt/model AI nên không phải chạy `eval:tutor` / `eval:code-feedback`.

## ⑤ Bất biến không được phá

| Bất biến                                                         | Test nào canh nó           |
| ---------------------------------------------------------------- | -------------------------- |
| Id chặng và id module không bao giờ đổi (khoá tiến độ Postgres)  | `specStageDetails.test.ts` |
| Chi tiết phủ đúng và đủ module của chặng, không thừa không thiếu | `specStageDetails.test.ts` |
| Chặng chưa soạn trả `undefined`, giao diện không bịa nội dung    | `specStageDetails.test.ts` |
| Id tiêu chí rubric duy nhất toàn cục và đúng tiền tố chặng       | `specStageDetails.test.ts` |
| `packages/` không import `apps/` và không import `api/`          | ESLint (luật phụ thuộc)    |

## ⑥ Quy ước dự án liên quan

- Import nội bộ gói dùng đường tương đối **có đuôi `.js`**; import xuyên gói dùng `@dhcb/<gói>/<file>`.
- Toàn bộ nội dung tiếng Việt, ví dụ sát bối cảnh Việt Nam; dữ liệu là **hằng biên dịch** —
  không I/O, không `Date.now()`, không ngẫu nhiên.
- Comment đầu file ghi rõ chặng thuộc hướng nào và **đặc thù nào chi phối chặng đó** (phần người
  review đọc kỹ nhất).
- Tạo PR ở trạng thái ready + bật auto-merge (squash) ngay; kèm một file changelog mới trong
  `docs/changelog/`, không chồng mục vào `PROGRESS.md`.

---

## Ghi chú soạn nội dung (rút ra khi thi hành đợt này)

- **Hướng `security` có thêm ràng buộc đạo đức** và nó được ghi thẳng vào comment đầu file + ô
  `scopeDont`: chỉ tấn công hệ thống của chính mình hoặc môi trường được phép.
- **Hướng `systems` có lời khuyên chọn một đường** (ngôn ngữ HOẶC nhân) trong `scopeDont`, vì làm
  dở cả hai thì không chứng minh được gì.
- **Hướng `algo` là hướng nền** nên dự án S4 không phải sản phẩm mới mà là cải thiện đo được trên
  một hệ thống đang chạy; rubric chỉ có 4 tiêu chí thay vì 5, đúng mức tối thiểu của khuôn.
- **Hướng `web` đã có bài học 8 bước ở S4** (`p6-u22`…`p6-u24`): comment đầu file nói rõ hai tầng
  bổ sung nhau, để người học không tưởng chi tiết chặng là thứ thay thế bài học.

## Nghiệm thu (bên giao việc điền SAU khi nhận kết quả)

- Lệnh đã chạy + kết quả thật:
- Tiêu chí ④ đạt hết chưa; cái nào chưa và vì sao:
- Có phá bất biến ⑤ nào không:
- Còn để ngỏ:
