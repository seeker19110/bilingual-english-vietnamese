## Tóm tắt

<!-- Đổi gì, tại sao. 2-3 gạch đầu dòng -->

-
-

## Loại thay đổi

- [ ] feat (tính năng mới)
- [ ] fix (sửa lỗi)
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore
- [ ] Breaking change (ảnh hưởng tính năng khác — mô tả rõ bên dưới)

## Cổng trước khi COMMIT/MERGE (CLAUDE.md mục 8-9)

- [ ] Build `npm run build` ✅
- [ ] Type `npm run typecheck` ✅
- [ ] Lint `npm run lint` (0 cảnh báo) ✅
- [ ] Format `npm run format` ✅
- [ ] Test `npm test` ✅ (X/Y)
- [ ] Đã tự đọc lại diff, không sửa nhầm chỗ khác
- [ ] Không bí mật (API key, mật khẩu...) trong code
- [ ] Mọi input/thao tác có thể lỗi đã được xử lý
- [ ] `npm run codemap -- impact <file>` đã soát cho từng file sửa — không phá tính năng khác
- [ ] Nếu đổi schema DB: có migration có phiên bản, rollback được
- [ ] Nếu sửa prompt/model AI (`apps/english/src/prompts/*`, `packages/core-ai/aiConfig.ts`): đã chạy `npm run eval:tutor` và dán bảng so sánh baseline bên dưới

## Test plan

<!-- Cách kiểm tra thủ công / tự động -->

-

## Rủi ro / ảnh hưởng

<!-- Phần nào có thể bị ảnh hưởng, cách rollback nếu cần -->
