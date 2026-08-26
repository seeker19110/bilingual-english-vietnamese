# Đồng bộ định vị repo với hiện tại và đích V2 (2026-08-16)

`README.md` và `PROJECT.md` đã được chuẩn hoá thành hai lớp rõ ràng: **production hiện tại là
Learning/Gia sư Việt ⇄ Anh**; **đích active là Đồng Hành Platform V2 / Personal AI Companion đa
lĩnh vực**. Đã bỏ các mô tả lỗi thời “chưa có thanh toán/hoàn toàn miễn phí”, link clone repo cũ
và domain `.com`; ghi đúng hệ thống Free/Pro/VIP + VietQR/SePay đang có. Định hướng provider đã
chốt được ghi tách bạch: Gemini là engine chính mục tiêu cho hội thoại và voice mới, còn chuỗi
provider/STT/TTS hiện tại vẫn là production compatibility/fallback cho tới khi migration đạt
quality/cost/latency/rollback gate. Roadmap active vẫn là `docs/architecture-v2/21-ROADMAP.md`;
English Tutor OS v1 tiếp tục frozen.

GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
(https://en-vi.donghanhcungban.org — domain mặc định đổi từ `.com` sang `.org` ngày 2026-07-31, xem
`docs/doi-ten-mien-chinh-org.md`; `.com`/apex `.org` đều 301 redirect sang `www.donghanhcungban.org`).
Đã áp xong Lớp 1 (hàng rào: Prettier/ESLint/TS strict/husky/CI) và Lớp 2 (E2E Playwright + a11y AA
toàn site + coverage ratchet + bundle-size budget) của `docs/framework/AP-DUNG-vao-du-an-co-san.md`.
**Đã rời Supabase hoàn toàn (2026-07-19→20, Giai đoạn A→E) — xem
`docs/migration-thoat-ly-supabase.md`.** Production Learning không có hotfix bắt buộc đang mở;
chương trình phát triển active là Platform V2 theo `docs/architecture-v2/21-ROADMAP.md`. Còn một
số thao tác thủ công trên VPS và baseline latency/cost cần dữ liệu production thật.
