# 0231 — Sửa trạng thái môn STEM trong voice profile marketing

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/social-media-skills-research-stem-fix` (tiếp nối PR #811)

## Vấn đề

Khi viết nội dung marketing cho môn STEM theo yêu cầu người dùng, phát hiện
`.agents/skills/marketing-content-writer/references/dhcb-voice.md` (thêm ở PR #811) mô tả sai:
ghi Toán/Lý/Hoá/Sinh là "đang mở rộng sang" trong khi đối chiếu code
(`apps/dhcb/src/data/stemCurriculum.ts` + `Subjects.tsx`) cho thấy cả 4 môn đã có chương trình
bám khung GDPT 2018 và đã hiển thị thật trong app.

## Đã làm

- Sửa mục "Trụ Learning hiện có" trong `dhcb-voice.md`: STEM giờ ghi đúng là đã có (không phải
  sắp có), kèm chú thích chưa xác nhận có chấm bài AI riêng như môn Anh/Lập trình.
- Thêm mục "Môn STEM (Toán/Lý/Hoá/Sinh)" mô tả ngắn gọn, có cảnh báo không nhắc "chấm bài kiểu
  IELTS"/eval riêng cho STEM trong nội dung quảng bá vì chưa xác nhận có.

## Chưa làm (cố ý)

Không thêm chi tiết tính năng STEM khác (SRS, chấm điểm...) — chưa xác minh có thật, để tránh
lặp lại lỗi bịa tính năng mà skill này vốn được viết ra để chặn.

## Bằng chứng

Chỉ sửa 1 file Markdown tài liệu skill, đã chạy `npx prettier --check` qua — xanh. Không chạm
`src`/`api`/test nên không cần build/typecheck/lint/test.
