# Nghiên cứu: Cải tiến UI/UX toàn app

> Ngày: 2026-07-04 · Trạng thái: **U-1 → U-5 ĐÃ TRIỂN KHAI** (xác nhận lại trong
> `dac-ta-cai-tien-uiux-2026-07-13.md`: bottom-nav `BottomNav.tsx` 4 tab đã có từ đợt này).
> Phương pháp: lái app thật bằng Playwright khổ mobile 375×812 (12 trang chính + các luồng tương
> tác), đo bằng máy (cuộn ngang, kích thước vùng chạm), đối chiếu checklist
> `docs/framework/BO-SUNG-chat-luong-Nhom-2.md`. Mọi phát hiện đều có bằng chứng đo/chụp thật.

## Bối cảnh

Nền UI tốt hơn mặt bằng chung: không cuộn ngang ở 12 trang, a11y 0 lỗi critical/serious 4 theme,
có `prefers-reduced-motion`/safe-area, input chat 16px không gây zoom iOS. Vấn đề tập trung ở
**luồng sử dụng hằng ngày**:

| # | Vấn đề | Tác động |
| - | ------ | -------- |
| U1 | Trang chủ là menu tĩnh — không có "Học tiếp", không hiện SRS đến hạn/mục tiêu ngày | 🔴 Ma sát mỗi ngày |
| U2 | Không có bottom-nav — đổi chế độ phải quay về Home (2–3 chạm) | 🔴 Ma sát mỗi ngày |
| U3 | Onboarding hỏi 3 câu nhưng KHÔNG dùng câu trả lời | 🔴 Mất niềm tin |
| U4 | Chat: hàng nhập tràn 15px ở 375px, nút gửi dính mép (thiếu `min-w-0`) | 🟡 Bug layout thật |
| U5 | Chat: chờ cưỡng bức 10s giữa MỖI tin nhắn — gãy nhịp hội thoại | 🟡 Ma sát tính năng chính |
| U6 | Lỗi kỹ thuật tiếng Anh phơi nguyên văn ra UI | 🟡 Thiếu chuyên nghiệp |
| U7 | Trang cấp CEFR: nội dung học bị đẩy xuống ~600px, "Tổng đã thuộc 0/10199" gây nản | 🟡 |
| U8 | 350 bài hội thoại/300 chủ đề câu: danh sách phẳng, không dấu vết đã học | 🟡 |
| U9 | Vài nút dùng thường xuyên < 44px (avatar header 28×28, nút Nữ/Nam 75×23...) | 🟢 |
| U10 | Copy quá đát/không nhất quán (số từ điển 3 nơi 3 số khác nhau, copy "riêng tư" sai từ khi có sync) | 🟢 |
| U11 | Vài empty state thiếu nút hành động | 🟢 |

## Những cái đang làm đúng (giữ nguyên)

Không cuộn ngang, a11y 68/68 E2E xanh, safe-area đúng, input chat không gây zoom, ô tìm kiếm ghim
đáy màn (đúng vùng ngón cái), thẻ từ (WordCard) rõ ràng ≥44px, khối "Nhận xét" trong chat tách
bong bóng riêng, màn thiết lập Chat/Speaking gọn, Onboarding UI đẹp (vấn đề ở U3 là dữ liệu không
được dùng, không phải UI).

## Kế hoạch theo đợt (đã triển khai U-1 → U-5)

| Đợt | Nội dung | Vấn đề |
| --- | -------- | ------ |
| U-1 | Vá nhanh: `min-w-0` input chat, thông điệp lỗi thân thiện + nút thử lại, vùng chạm ≥44px, copy (login/badge/số từ), CTA empty state | U4 U6 U9 U10 U11 |
| U-2 | Thẻ "Học tiếp" đầu trang Home (mục kế tiếp + SRS due + mục tiêu ngày) | U1 |
| U-3 | Nối onboarding → mặc định app (level→độ khó Chat/Nói + gợi ý test-out; phút/ngày→tốc độ 5/10/20) | U3 |
| U-4 | Gọn header 4 tab học trang cấp + đổi "0/10199" → tiến độ của cấp + bỏ QuickActions ở màn học | U7 |
| U-5 | Bottom tab bar (Trang chủ·Lộ trình·Luyện tập·Tiến độ) + dời QuickActions + đánh dấu "đã xem" Lessons/Phrases | U2 U8 |
| _(rời)_ | Giảm throttle chat 10s → 3s (cần chốt UX; không tăng trần chi phí vì lượt/ngày đã cap riêng) | U5 |

## Chi tiết kỹ thuật đáng nhớ (U3, U4)

- **U3**: `saveOnboarding()` ghi câu trả lời lên Supabase nhưng không nơi nào đọc lại. Nối:
  `level` → mặc định độ khó Chat/Speaking + gợi ý test-out nếu ≥ Trung cấp; `dailyMinutes` → map
  sang tốc độ 5/10/20 (`setDailySpeed`); `goal` → chọn card đề xuất đầu Home.
- **U4**: nguyên nhân là `<input>` flex item có `min-width:auto` mặc định không co xuống dưới bề
  rộng nội tại, đẩy cả hàng vượt container ở 375px — fix bằng thêm `min-w-0`.

## Bằng chứng khảo sát

Ảnh chụp 12 trang + 6 luồng (khổ 375×812, DPR 2, không commit vào repo để khỏi phình); đo hàng
nhập chat cho thấy tràn 15px ở viewport 375px; grep xác nhận U3 (0 chỗ đọc lại data onboarding) và
U8 (Lessons/CommonPhrases không có state đã xem).
