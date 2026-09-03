# 0261 — 2026-09-03 — Đợt A+B thiết kế lại UI/UX: khoảng đọc cho thân bài + header chế độ tập trung

**PR:** (điền sau) · **Loại:** `refactor` — không thêm tính năng nghiệp vụ, chỉ đổi cách trình bày.

## Vì sao có đợt này

Người dùng yêu cầu đánh giá lại UI/UX với hai tiêu chí: **hiện đại** và **tập trung cho việc
học**. Rà bằng grep trên `apps/dhcb/src` (73 trang, 171 component) cho ra bức tranh: giao diện
đang hiện đại theo kiểu **landing page SaaS**, chưa hiện đại theo kiểu **app học tập**.

| Dấu hiệu đo được (2026-09-03) | Số chỗ |
| ----------------------------- | -----: |
| `text-[11px]`                 |    554 |
| `max-w-prose`                 |  **2** |
| `rounded-2xl`/`3xl`           |    729 |
| `bg-gradient-*`               |    152 |
| `shadow-<màu>-500/xx`         |    161 |
| `backdrop-blur`               |     77 |
| `animate-pulse` + `ping`      | 49 + 8 |

Đã trình bày 5 vấn đề và 4 đợt PR đề xuất; người dùng chốt **làm A + B trước**.

## Đợt A — khoảng đọc cho thân bài

**Đo trước khi sửa** (trang bài học Lập trình ở 1440px): cột chữ rộng ~830px với `text-sm` →
**~118 ký tự/dòng**, gần gấp đôi ngưỡng 75ch mà `.agents/skills/ui-ux-craftsman` mục 9 vừa chốt
ở đợt 0258. Đây là chỗ người học ngồi lâu nhất.

Điểm mấu chốt: **không sửa bằng `max-w-*` của Tailwind**. Thang đó tính bằng `rem` (con số cố
định), còn độ dài dòng dễ đọc phụ thuộc **cỡ chữ đang render**. Nên thêm hai tiện ích vào
`apps/dhcb/src/index.css`:

- `.read-measure` — `max-width: 66ch`, đơn vị `ch` nên đúng ~66 ký tự bất kể thân bài 14px hay 16px.
- `.read-body` — 15px / line-height 1.65. 14px (`text-sm`) là cỡ cho **nhãn và nút**, không phải
  cho đoạn văn 2.000–3.000 ký tự; 1.65 nằm giữa khoảng 1.5–1.7 của luật mục 9.

Áp vào: `LessonProse` (thân lý thuyết môn Lập trình), 4 khối chữ dài của
`ProgrammingLessonPage` (móc thực tế, đề bài tự viết, ứng dụng về nhà, hướng dẫn đọc ví dụ), và
2 khối giải thích tiếng Việt của `CefrLessonViews` (bài ngữ pháp môn Anh).

**Quyết định có chủ đích:** `read-measure` áp lên **từng khối chữ**, KHÔNG lên thẻ bọc — khối
code phải được rộng trọn cột, dòng code dài mà bị bó 66ch thì phải cuộn ngang liên tục. Có test
canh đúng cả hai chiều.

## Đợt B — header chế độ tập trung

Header (`Layout.tsx`) mang **8 khe trong 56px**: Back · Studio · breadcrumb · title · streak ·
`extra` · nút AI · đổi giao diện · avatar. Trên trang tra cứu thì chấp nhận được; trên trang ngồi
học lâu thì hai trong số đó không phục vụ việc đang làm.

Thêm prop `focus?: boolean` cho `Layout`. Bật thì ẩn **đúng hai thứ**: bộ chuyển Studio (đi sang
miền khác) và huy hiệu streak (điểm số, thuộc về `/tien-do`). **KHÔNG ẩn** Back/breadcrumb (đường
lùi), nút Bạn Đồng Hành (trợ giúp ngay trong lúc học), đổi giao diện (a11y), avatar. Đã bật cho
`ProgrammingLessonPage` và `StoryReader`.

Ba việc dọn kèm theo, áp cho **mọi trang** chứ không riêng chế độ tập trung:

1. **Gỡ chấm `animate-ping`** ở nút "Đồng Hành AI". Nó chạy vĩnh viễn trên mọi trang mà không báo
   hiệu bất cứ thay đổi nào — không tin nhắn mới, không tác vụ đang chạy. Đây là điểm chuyển động
   duy nhất luôn nằm trong tầm mắt lúc ngồi học. Vi phạm đúng luật `animate-pulse` của mục 9.
2. **Gỡ `animate-pulse`** trên emoji 🔥 của huy hiệu streak — cùng lý do (streak không đổi trong
   lúc người dùng nhìn nó).
3. **Gộp hai bản sao huy hiệu streak.** Trước đây khối này viết hai lần gần như giống hệt (12
   dòng JSX trùng nhau, một bản inline, một bản căn giữa tuyệt đối); nay nội dung tách ra một
   hằng số, chỉ còn lớp bọc là khác.

`⌘K` được bịt ở chế độ tập trung: menu không được dựng thì mở nó chỉ tạo trạng thái bật mà không
có gì hiện ra, và Escape sau đó cũng không có menu nào để đóng.

## Test canh gác mới

- `LessonProse.test.tsx` +2 ca: mọi khối chữ (`<p>`/`<ul>`/`<ol>`) phải có `read-measure`; khối
  code thì **không** được có. (Ca thứ hai lúc đầu viết sai cú pháp — khối code trong bài học đánh
  dấu bằng **thụt lề ≥2 dấu cách**, không phải dấu ```; test đỏ đã bắt được chỗ đó.)
- `Layout.test.tsx` (file mới) 4 ca: canh **cả hai chiều** — `focus` bật thì ẩn, `focus` TẮT thì
  vẫn còn. Chỉ canh chiều "ẩn" thì một `Layout` hỏng hẳn cũng qua được. Thêm ca canh header không
  còn `animate-ping`/`animate-pulse`.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11131/11131, 548 file)
```

## Việc CHƯA làm trong đợt này (cố ý)

- **Đợt C** (thiết kế lại trang chủ cho tập trung) và **đợt D** (giảm nhiễu thị giác toàn app,
  ~40 file) — đã trình bày, chờ người dùng duyệt phạm vi.
- `ProgrammingSpecStagePage` / `ProgrammingPathStagePage` còn nhiều đoạn `text-sm leading-relaxed`
  chưa áp khoảng đọc: phần lớn là mục danh sách ngắn nằm trong thẻ, bó 66ch ở đó rủi ro thị giác
  cao hơn lợi ích — để lại cho đợt sau khi có ảnh chụp trước/sau.
- Nợ **423 màu Tailwind cứng ngoài token** (ghi ở đợt 0258) vẫn nguyên, cố ý không trộn vào đây.
