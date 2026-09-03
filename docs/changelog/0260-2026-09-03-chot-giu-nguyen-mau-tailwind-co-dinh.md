# 0260 — 2026-09-03 — Chốt: giữ màu Tailwind cố định, KHÔNG token hoá ~4.100 chỗ

**PR:** (điền sau) · **Loại:** `docs` — ghi một quyết định, đóng một món nợ. Không đụng mã chạy.

## Câu hỏi

Sau PR #842 (vá 720 chỗ rớt tương phản), còn đúng một câu hỏi để ngỏ: có nên đổi các họ màu
Tailwind gốc — `amber` 763 · `emerald` 700 · `rose` 480 · `sky` 328 · `indigo` 277 lần… tổng
**~4.141 lần** — sang token vai trò (`--info-*`, `--warn-*`…) để chúng tự đổi theo theme như
`--z-*`/`--a-*` không?

Đây là **quyết định thiết kế, không phải lỗi**, nên PR #842 cố ý không tự làm mà ghi lại chờ
người dùng.

## Trả lời: KHÔNG — giữ nguyên (người dùng chốt)

Hai lý do:

1. **Chi phí và rủi ro thật.** Đổi là chạm >4.000 chỗ trong ~120 file, đổi lấy sự nhất quán về
   hình thức. Mỗi chỗ đổi là một cơ hội sai màu ngữ nghĩa.
2. **Lý do an toàn — thứ duy nhất đáng đánh đổi rủi ro đó — đã không còn.** PR #842 đã vá xong
   720 chỗ rớt tương phản và thêm cổng `scripts/fixed-color-contrast-audit.test.ts` đo **mọi**
   màu cứng dùng làm màu chữ, trên **cả 5 theme**, mỗi lần `npm test`.

Nói gọn: trước đây màu cứng nguy hiểm vì **không ai canh**; giờ đã có người canh, nên giữ cách
viết quen thuộc là lựa chọn rẻ hơn và không kém an toàn hơn.

## Luật thi hành cho code mới

Dùng màu Tailwind cố định làm màu chữ thì **phải kèm `theme-light:text-<họ>-800/900` ngay từ
đầu** — thang `zinc`/`accent`/`content` tự đảo ở 3 theme nền sáng, màu Tailwind gốc thì không.
Bậc chọn theo luật "bậc sáng nhất đạt AAA trên cả 3 theme sáng": `slate-700` ·
`blue/indigo/violet/purple-800` · còn lại `-900`. Quên thì cổng đỏ và chỉ luôn cách vá.

## Đã ghi ở đâu

- `PROGRESS.md` mục **"Quyết định quan trọng"** — quyết định + lý do + luật thi hành, kèm câu
  "đừng mở lại cuộc bàn này nếu không có dữ kiện mới".
- Món nợ tương ứng **cắt khỏi** mục "Nợ kỹ thuật còn mở", dán sang `docs/legacy/no-ky-thuat-da-dong.md`
  đúng quy ước (mở và đóng trong cùng một ngày).
- Mục 9 của `.agents/skills/ui-ux-craftsman/SKILL.md` — đổi ghi chú cuối từ "nợ chờ xử lý" thành
  quyết định đã chốt + luật thi hành, để phiên sau đọc skill là biết ngay, không phải tra lại.

## Bằng chứng kiểm chứng

Chỉ sửa tài liệu, không đụng mã nguồn. Cổng chạy: Prettier + `changelog.test.ts` +
`report-status.test.ts` (hook đầu phiên đọc thẳng mục nợ từ `PROGRESS.md`, nên việc cắt một khối
nợ phải không làm hỏng hook đó).
