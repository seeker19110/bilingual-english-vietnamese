# 0156 — feat(ui): hiển thị markdown cho phần lý thuyết bài học môn Lập trình

- **Ngày:** 2026-08-26
- **PR:** #703 (cùng PR với đợt 0155)
- **Nhánh:** `claude/programming-lessons-tl3tbg`

## Bối cảnh

Phần lý thuyết (bước ② của khuôn 8 bước) dài 2.000–3.200 ký tự mỗi bài, nhưng
`ProgrammingLessonPage.tsx` in thẳng bằng `whitespace-pre-line`. Hệ quả: `**đậm**` hiện ra
nguyên dấu sao, danh sách chỉ là mấy dòng chữ chạy dài, ví dụ code lẫn vào văn xuôi — đúng chỗ
khó đọc nhất trên điện thoại.

## Việc đã làm

- `apps/dhcb/src/lib/lessonMarkdown.ts` — bộ đọc markdown **tối giản, tự viết**.
- `apps/dhcb/src/components/programming/LessonProse.tsx` — hiển thị, dùng lại `CodeSurface`
  cho khối code để giống mọi khối code khác trong môn (luật N2 đặc tả UI/UX).
- Nối vào `ProgrammingLessonPage.tsx` (thay đúng một khối JSX).

## Quyết định kèm theo

**Tự viết thay vì thêm thư viện.** Đếm thật trên cả 68 bài trước khi viết:

| Cấu trúc                | Số lần |
| ----------------------- | ------ |
| dòng thụt lề (code)     | 190    |
| gạch đầu dòng           | 118    |
| mục đánh số             | 110    |
| `**đậm**`               | 86     |
| `` `code` `` trong dòng | 13     |
| `*nghiêng*`             | 1      |

Sáu cấu trúc, không có bảng, không có khối ` `. Một thư viện markdown đầy đủ nặng vài chục
kB trong khi ngân sách Initial JS chỉ còn dư ~11%. Bộ đọc tự viết ~130 dòng, và **đo lại sau
khi build: Initial JS 124,01 kB — không đổi** (nó nằm trong chunk lười của môn, không vào
initial bundle).

**Hai luật rút từ chính dữ liệu, không phải từ đặc tả markdown:**

1. **Dòng thụt lề là CODE, cấm phân tích bên trong.** Code trong bài đầy ký tự trùng dấu
   markdown: `2 ** (lan - 1)`, `COUNT(*)`, `# ghi chú`, `` `Xin chao ${ten}` ``. Phân tích
   chúng như markdown là làm hỏng chính thứ học viên cần đọc đúng từng ký tự.
2. **`#` KHÔNG phải tiêu đề.** Cả 2 lần `#` đứng đầu dòng trong toàn bộ dữ liệu đều nằm trong
   khối code (bộ chọn CSS `#tieu-de`, comment Python `# ghi chú`).

**Không dùng lookbehind trong regex.** Safari chỉ hỗ trợ từ 16.4; regex sai cú pháp làm hỏng
cả bundle lúc nạp chứ không hỏng một chỗ. Nhánh chữ nghiêng thay bằng luật "nội dung không bắt
đầu/kết thúc bằng khoảng trắng".

**Màu chữ giữ nguyên `text-zinc-200`** (chữ đậm dùng `text-zinc-100`, sáng hơn): đây là NỘI
DUNG ĐỂ ĐỌC nên phải đạt WCAG AAA ≥ 7:1 (CLAUDE.md mục 4.5), và token đó đã qua cổng
`e2e/a11y-aaa.spec.ts`.

## Bằng chứng kiểm chứng

- `npm test` → **467 file, 6.360 test xanh** (exit 0) — tăng 221 test từ hai bộ test mới.
- `npm run lint` 0 lỗi · `npm run typecheck` sạch · `npm run build` xanh.
- `npm run budget` → Initial JS 124,01/140 kB, CSS 15,89/18 kB — **không đổi** so với trước PR.

Hai bộ test đều chạy trên **dữ liệu thật của cả 68 bài**, không chỉ chuỗi tự bịa:

- `lessonMarkdown.test.ts`: mọi bài phải "không mất chữ nào so với nguồn" và "không có khối
  code nào bị hiểu thành đoạn văn".
- `LessonProse.test.tsx`: mọi cặp `**đậm**` ở dòng chữ thường phải thành đúng một thẻ
  `<strong>` — lệch nghĩa là có dấu sao lọt nguyên ra màn hình.

Test bắt được hai ca thật trong lúc làm:

1. Phép nhân trong câu văn ("mỗi ngày 3 * 5 phút") suýt bị bôi nghiêng.
2. Bài `p5-u8-l1` có `***` là **nội dung thật** (che bí mật trong log), không phải dấu
   markdown — assertion đầu tiên quá chặt, đã đổi sang đối chiếu số cặp `**` với số thẻ
   `<strong>`.
