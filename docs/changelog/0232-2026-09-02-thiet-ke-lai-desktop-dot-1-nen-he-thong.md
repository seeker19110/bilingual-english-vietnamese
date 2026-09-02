# 0232 — 2026-09-02 — Thiết kế lại desktop, đợt 1: nền hệ thống thiết kế

**PR:** (điền số PR sau khi tạo)
**Đặc tả:** `docs/specs/2026-09-02-thiet-ke-lai-desktop-toan-dien.md`

## Bối cảnh

Người dùng yêu cầu "thiết kế toàn diện lại giao diện web desktop, UI/UX phải hiện đại và thân
thiện, rõ ràng mạch lạc cho người học". Khảo sát trước khi làm (3 luồng rà soát song song + chụp
màn hình thật ở 1440×900) cho thấy **vấn đề mang tính hệ thống, không phải thẩm mỹ từng trang**:

| Triệu chứng                     | Số đo                                                      |
| ------------------------------- | ---------------------------------------------------------- |
| Không có khung trang dùng chung | **154 chỗ** tự đặt `max-w-*` (`max-w-lg` → `max-w-7xl`)    |
| Không có thang chữ              | `text-xs` **1348 lần** (~50% app), `text-base` chỉ 156 lần |
| Không có tầng desktop           | `lg:`+`xl:` **62 lần** vs `sm:` **302 lần**                |
| Không có token độ nổi           | `shadow-2xl` **41 chỗ**; shadow màu hardcode **14 chỗ**    |
| Bố cục 2 cột chép tay           | **6 bản sao**, bề rộng lệch nhau                           |

Nguyên nhân gốc: `Layout.tsx` mang tên "Layout" nhưng **chỉ là thanh header** — nó không bọc
`children`, nên không có chỗ nào áp được bề rộng/nhịp chung.

Người dùng chốt qua `AskUserQuestion`: cách làm = **nền hệ thống trước rồi áp theo đợt**; mức làm
mới diện mạo = **mạnh**.

## Việc đã làm (đợt 1)

**1. Công cụ đo tương phản — làm TRƯỚC khi thiết kế.**
`scripts/lib/contrast.ts` + `scripts/contrast-audit.ts` + `scripts/contrast-audit.test.ts`
(62 test, chạy 10ms). Đo WCAG mọi cặp (màu chữ × bề mặt) trên cả 5 theme. Phát hiện quyết định
toàn bộ thiết kế sau đó:

| Màu chữ         | Nền trang/thẻ | Bề mặt nổi (`z-800`)    | Kết luận              |
| --------------- | ------------- | ----------------------- | --------------------- |
| `z-100`–`z-300` | AAA           | **AAA** (≥7,06)         | dùng cho chữ nội dung |
| `z-400`         | AAA           | **6,40–7,24 → rớt AAA** | chỉ nhãn/phụ (AA)     |
| `z-600`         | 1,77–3,25     | 1,59–3,00               | **cấm làm màu chữ**   |

Tức là: thêm tầng bề mặt nổi mà vẫn để chữ `z-400` sẽ làm **vỡ cổng AAA một cách im lặng**.

**2. Token ngữ nghĩa** (`packages/core-ui/theme.css` + `apps/dhcb/tailwind.config.js`):
3 cấp bề mặt `surface-base/card/raised` + viền `line-subtle/strong` + màu chữ
`content/-secondary/-muted/-disabled`. Khai **một lần** ở `:root` dưới dạng bí danh trỏ vào
`--z-*` — CSS phân giải biến lười nên tự lấy đúng giá trị của theme đang bật, không phải chép 5
lần. Bề mặt phân lớp bằng **nền + viền, không shadow nặng** (đúng mục 6 skill `ui-ux-craftsman`).

**3. Thang chữ** (`apps/dhcb/src/index.css`, `@layer components`): 9 cấp
`t-display / t-h1 / t-h2 / t-h3 / t-body-lg / t-body / t-body-sm / t-label / t-caption`, **mỗi cấp
có bậc tăng ở ≥1024px** (ví dụ `t-body` 15px → 16px). Đây là thứ mà chỉ nới `max-width` không
giải quyết được. Đặt ở `components` chứ không `utilities` để class Tailwind tại chỗ vẫn ghi đè được.

**4. Khung trang dùng chung** (`packages/core-ui/`): `PageShell` (bề rộng theo LOẠI nội dung:
`reading`/`standard`/`wide`, khớp mép header) và `TwoPane` (gom 6 bản sao bố cục 2 cột).
`PageShell` có tham số `baseWidth` giữ nguyên bề rộng cũ dưới 1024px, để di trú là thay đổi
**thuần desktop**.

**5. Áp lên 3 trang chưa từng có tầng desktop:**

- `ProgrammingLessonPage` — trước: một cột `max-w-4xl`, gần 1/3 màn hình 1440px bỏ trống, không
  có gì cho biết đang ở bước nào. Nay có `StepRail` (component mới): cột dọc 6 bước, kèm chỉ báo
  "Bước 1/6", "Đã đạt 0/3 bài chấm" và tên pha (nạp · luyện tập · hoàn tất).
- `ProgrammingLevelPage` — tiến độ bậc + chặng dự án chuyển sang cột phải, danh sách unit bắt đầu
  ngay đầu trang thay vì bị đẩy xuống dưới hai thẻ tĩnh.
- `Profile` — danh tính + số liệu nhanh sang cột phải; các mục hành động được lên đầu.

## Quyết định kèm theo

- **Chưa đổi bảng màu (hue)** dù người dùng chọn "làm mới mạnh". Lý do từ số đo: accent là trục
  mong manh nhất (chỉ 1,35–2,89 trên 3 theme nền sáng), trong khi phần lớn cảm giác "cũ" đến từ
  chữ 12px và bề rộng lệch. Đổi chữ/khoảng thở/bề mặt cho thay đổi thị giác lớn nhất trên mỗi đơn
  vị rủi ro. Đổi hue để đợt riêng, có đo lại toàn bộ. **Đã nói rõ với người dùng.**
- **Bề mặt `raised` chỉ dùng cho lớp phủ** (modal/dropdown/toast), không làm thẻ nội dung — giữ
  chữ phụ luôn nằm nơi biên độ AAA rộng nhất (biên hẹp nhất đo được là 7,06 ở theme Nhi đồng).
- Không đổi bất cứ thứ gì dưới 1024px — đã kiểm bằng ảnh chụp 390×844 trước/sau.

## Lỗi tự phát hiện trong lúc làm

`useIsDesktopViewport()` ban đầu bị đặt **sau** hai lệnh `return` sớm trong
`ProgrammingLevelPage` — hook gọi có điều kiện, vi phạm Rules of Hooks (React khớp hook theo THỨ
TỰ gọi nên một lần render bỏ qua sẽ làm lệch toàn bộ state). Đã chuyển lên cùng nhóm hook đầu
component; cùng lỗi được kiểm và tránh ở `Profile` (trước `if (!user) return null`).

## Bằng chứng kiểm chứng

```
Build ✅ | Typecheck ✅ (4 project) | Lint ✅ (0 cảnh báo) | Format ✅
Test ✅ 536 file / 10.925 test — trong đó 62 test mới của contrast-audit
Ngân sách: JS 128,23/140 kB (91,6%) · CSS 17,35/20 kB (86,8%) — cả hai trong hạn
contrast-audit: 0 cặp token rớt ngưỡng, biên AAA hẹp nhất 7,06
```

Kiểm trình duyệt thật (Chromium 1440×900 và 390×844): trang bài học ở dark-blue và pink đều
render đúng cột phải, mobile giữ nguyên thanh bước ngang + BottomNav.

## Đợt sau (đã ghi trong đặc tả mục ⑦)

- Đợt 2 — trang lõi người học: Home, Tiến độ, Chat, Luyện nói, Luyện viết, CEFR.
- Đợt 3 — 10 trang Lập trình còn lại (hướng chuyên sâu, chặng, khoá học, dự án).
- Đợt 4 — phần còn lại + phủ breadcrumb cho `/lap-trinh/**` và các trang domain.
- Đợt riêng tuỳ chọn: đổi hue bảng màu nhấn, đo lại tương phản toàn bộ.
