# 0194 — Companion: giấu khối câu hỏi bị cắt cụt · mở khoá select text desktop

- **Ngày:** 2026-08-28
- **PR:** #733

## Đã làm

Hai lỗi nhỏ, độc lập, gộp chung một PR theo yêu cầu người dùng trong phiên.

### 1. Companion hiện JSON thô khi khối câu hỏi tick chọn bị cắt cụt

Người dùng chụp màn hình bắt được lỗi: `/ban-dong-hanh` hiện nguyên khối
` ```dhcb-questions ` dở dang thay vì render nút tick chọn.

**Nguyên nhân:** `synthesizeCompanionReply` (`packages/core-personal/companionRuntime.ts`)
gọi cả 3 nhà cung cấp AI (Groq/Anthropic/Gemini) với `max_tokens = 1024`. Khi câu trả lời +
khối câu hỏi vượt giới hạn, LLM bị cắt cụt giữa chừng — khối mở (` ```dhcb-questions `) nhưng
không có dấu đóng. `extractInteractiveQuestions` (`packages/core-contracts/interactiveQuestion.ts`)
chỉ khớp khi có cả mở lẫn đóng, không khớp thì coi như "không có khối nào" và trả nguyên văn —
lộ JSON thô ra giao diện.

**Sửa:**

- Tăng `max_tokens` 1024 → 2048 cho cả 3 nhà cung cấp, giảm khả năng bị cắt cụt.
- Thêm phòng thủ ở `extractInteractiveQuestions`: có dòng mở khối nhưng không có dấu đóng thì
  cắt bỏ toàn bộ nội dung từ điểm mở khối trở đi thay vì hiện nguyên văn JSON dở dang.
- Test mới cho ca khối bị cắt cụt (`interactiveQuestion.test.ts`).

### 2. Mở khoá bôi đen/copy text trên web desktop

Quy tắc chặn bôi đen/copy (chốt 2026-08-01, `apps/dhcb/src/index.css`) áp cho **toàn app** kể
cả web desktop — gây bất tiện khi dùng chuột. Người dùng yêu cầu: mở khoá cho desktop, **giữ
khoá cho mobile**.

**Sửa:** bọc quy tắc `user-select: none` cũ (áp cho `body`, trừ input/textarea/contenteditable/
code/pre/`.select-text`) trong `@media (pointer: coarse)` — chỉ còn hiệu lực trên thiết bị cảm
ứng. Desktop (`pointer: fine`, dùng chuột) chọn/copy bình thường như trước 2026-08-01.

## Bằng chứng

```
npx vitest run packages/core-contracts packages/core-personal → 105 file / 798 test xanh
npm run typecheck → sạch
npx eslint (3 file đã sửa) → sạch, 0 cảnh báo
npx prettier --check apps/dhcb/src/index.css → đạt
npm run build → thành công (client + server + hub)
```

CI trên PR #733: `quality` ✅, `e2e` ✅, `metadata` ✅ (sau khi sửa tiêu đề PR — lần đầu dính
dấu phẩy trong scope `fix(companion,ui): …` không khớp regex Conventional Commits, đổi lại
`fix(companion): …` là qua). Đã merge (squash).
