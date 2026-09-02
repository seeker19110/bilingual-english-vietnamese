# 0230 — Skill mới: `marketing-content-writer` cho nội dung marketing DHCB

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/social-media-skills-research-15a2ha`

## Bối cảnh

Người dùng muốn tạo nội dung marketing (Facebook/TikTok, LinkedIn) cho DHCB, tham khảo cách tổ
chức của bộ `charlie947/social-media-skills` (skill pack công khai cho Claude: voice profile
trước, nội dung theo layer sau). Quyết định (2026-09-02): **không** copy/cài bộ skill gốc đó vào
dự án (phụ thuộc Apify/Gemini API riêng, viết cho một cá nhân sáng tạo nội dung) — viết một skill
độc lập, gọn, đúng thực tế sản phẩm DHCB.

## Đã làm

- **Mới `.agents/skills/marketing-content-writer/SKILL.md`** — quy trình viết nội dung marketing:
  đọc voice profile trước → chọn kênh (Facebook/TikTok phổ thông vs LinkedIn song ngữ) → chọn 1-2
  trong 4 thông điệp cốt lõi → viết đúng giọng văn → tự kiểm chống bịa tính năng/số liệu chưa xác
  nhận. Không tự đăng bài, không đổi giá/tính năng thật để "nghe hay hơn".
- **Mới `.agents/skills/marketing-content-writer/references/dhcb-voice.md`** — hồ sơ giọng văn +
  định vị sản phẩm DHCB dùng làm nguồn sự thật cho nội dung sinh sau này: mô tả nền tảng (Learning
  đa môn — Anh + Lập trình + STEM đang mở rộng — cùng Career/Work/Startup/Life), chi tiết môn Anh
  (luyện nói song ngữ 2 giọng, lộ trình CEFR) và môn Lập trình (6 bậc + 11 hướng chuyên sâu), giá
  Pro/VIP thật, quy tắc giọng văn theo kênh, và 4 thông điệp cốt lõi.

## Chưa làm (cố ý)

Không tích hợp cơ chế gọi API ngoài (Apify crawl, Gemini sinh ảnh) như bộ gốc — skill này chỉ
sinh văn bản dựa trên thông tin đã có trong `CLAUDE.md`/`PROGRESS.md`, người dùng tự duyệt và
đăng bài.

## Bằng chứng

Đây là 2 file Markdown nội dung skill (không phải code chạy), không chạm `src`/`api`/test —
không cần build/typecheck/lint/test. Đã tự đọc lại nội dung đối chiếu `CLAUDE.md` mục 1 + 13 để
không bịa tính năng/giá.
