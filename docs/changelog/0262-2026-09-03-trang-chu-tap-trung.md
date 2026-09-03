# 0262 — 2026-09-03 — Đợt C thiết kế lại UI/UX: trang chủ tập trung vào việc học

**PR:** #845 · **Loại:** `refactor` — không thêm tính năng nghiệp vụ, chỉ đổi cách trình bày.
Tiếp nối đợt A+B (`0261`); người dùng duyệt phạm vi bằng "tiếp đợt C".

## Vì sao có đợt này

Trang chủ (`apps/dhcb/src/pages/core/Home.tsx` + `components/Home/HomeAiBriefingCard.tsx`) là
màn hình người học mở mỗi ngày, và nó đang là chỗ "landing page SaaS" đậm nhất trong app —
đối chiếu với 9 luật mục 9 của `.agents/skills/ui-ux-craftsman`:

| Dấu hiệu trên trang chủ TRƯỚC đợt C                                                                                              | Luật vi phạm |
| -------------------------------------------------------------------------------------------------------------------------------- | -----------: |
| 2 quầng sáng `blur-3xl`/`blur-2xl` + `shadow-xl shadow-accent-*`                                                                 |            5 |
| 5 ô icon `bg-gradient-to-br` kèm `shadow-lg shadow-<màu>-500/20`                                                                 |            5 |
| Chấm "đang trực tuyến" `animate-pulse` + icon Radio `animate-pulse` + `animate-ping` khi tải — chạy vĩnh viễn, không báo hiệu gì |            6 |
| 3 nhãn HOA nhỏ giãn chữ ("GIA SƯ ĐIỀU PHỐI AI", "CÁC KHÔNG GIAN & BỘ MÔN", mã cấp)                                               |            9 |
| 16 chỗ `text-[11px]` cho nút/nhãn có chức năng                                                                                   |            7 |
| Thẻ lồng thẻ: bản tin là thẻ con trong thẻ AI; 9 lối tắt là thẻ con trong 3 thẻ bộ môn                                           |            4 |
| **Ba** lối vào `/ban-dong-hanh` trên cùng một màn (header · nút "Live Studio" · banner "Bạn Đồng Hành AI Đa Miền")               |            — |
| Huy hiệu quảng cáo "Vision OCR" · "Life OS" · "Career Hub" · "Từ Điển 12k+"                                                      |            — |

## Đã làm

### `HomeAiBriefingCard` — viết lại phần trình bày, giữ nguyên hành vi

- Một bề mặt phẳng (`bg-zinc-900/90 border-zinc-800`), bên trong tách bằng khoảng cách + một
  đường kẻ. Gỡ quầng sáng, gradient, bóng màu, `backdrop-blur`.
- Tiêu đề thẻ là `h2` **"Bạn Đồng Hành AI"** (thay nhãn HOA "Gia Sư Điều Phối AI"), lời chào theo
  giờ thành câu phụ dưới tiêu đề — bỏ pill giờ có icon vì câu chào đã nói đủ. `e2e/v2-hubs.spec.ts`
  tìm heading `/Bạn Đồng Hành AI/` trên trang chủ nên vẫn xanh.
- Gỡ nút "Live Studio" (header đã có "Mở Bạn Đồng Hành AI" trên mọi trang).
- Trạng thái tải: hai thanh skeleton `animate-pulse` — chỗ **duy nhất** pulse hợp lệ (luật 6).
  Đã tải thì không còn chuyển động nào.
- Hai ô "việc tiếp theo" dùng chung MỘT chuỗi class (`ACTION_BUTTON`), bỏ viền màu + `shadow-sm`;
  mã cấp CEFR thành chữ thường "Học tiếp · A1" thay vì huy hiệu HOA. Câu dự phòng khi API lỗi
  tách ra hằng `FALLBACK_SUMMARY` (trước đây gõ hai lần, một cho hiển thị, một cho nút nghe).
- Bản tin có `read-measure` (tiện ích từ đợt A) để câu dài không kéo hết cột.

### `Home.tsx`

- **Gỡ banner "Bạn Đồng Hành AI Đa Miền"** — lối vào thứ ba tới cùng một trang.
- 3 thẻ bộ môn → **một danh sách phẳng** dựng từ mảng `spaces` (3 phần tử, cùng khuôn): mỗi
  dòng là icon phẳng + tiêu đề + một câu mô tả thật (bỏ buzzword), bấm cả dòng để vào; lối tắt
  là chữ thường gạch chân khi rê, không còn là thẻ con. Tiêu đề mục là `h2` chữ thường có
  `aria-labelledby`, bỏ bộ đếm "3 Không gian chuyên sâu".
- Trình tự thân trang nay: việc đầu tiên (người mới) → thẻ AI (một việc tiếp theo) → hỏi nhanh →
  quay lại sau nghỉ → bộ môn → tiến độ/lịch sử → khuyến mãi. `HomeUniversalAiBar`,
  `RewardTipBanner`, `PricePromoBanner` **không đụng** trong đợt này.

## Test canh gác mới

- `HomeAiBriefingCard.test.tsx` (render thật happy-dom, 3 ca): đang tải chỉ có skeleton, không
  `animate-ping`/`blur-`/`bg-gradient-`/`shadow-accent-`/`uppercase`; đã tải thì **không còn**
  `animate-pulse`; API lỗi vẫn có câu dự phòng; `h2` đúng là "Bạn Đồng Hành AI".
- `Home.design.test.ts` (đọc mã nguồn — `Home.tsx` kéo auth + cloud sync + loader nên render thật
  không đáng): 10 mẫu cấm + không còn `/ban-dong-hanh` trong thân trang + ba không gian phải
  dựng từ `spaces.map`. Lần chạy đầu đỏ 3 ca vì **chú thích** trong file nêu nguyên văn chuỗi
  cấm — test bắt đúng, đã sửa chú thích.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11146/11146, 550 file)
E2E ở máy: v2-hubs "Trang chủ" ✅ · a11y + a11y-aaa trang chủ 17/17 ✅ (lần đầu đỏ 8 ca: nút
"Xem tiến độ" `text-accent-400` rớt 1,97:1 ở 3 theme sáng → thêm `theme-light:text-accent-800`)
```

## Việc CHƯA làm (cố ý)

- **Đợt D** (giảm nhiễu thị giác toàn app, ~40 file) — chờ duyệt phạm vi.
- `HomeUniversalAiBar` còn nhãn HOA "Gợi ý" và modal có icon gradient — luật 9 chỉ chặn sinh
  mới, gỡ khi đụng tới ở đợt D.
- Chưa có ảnh chụp trước/sau; nếu người dùng muốn xem thì chạy `npm run dev` rồi mở `/`.
