# 0270 — 2026-09-05 — Nhập tri thức `Nutlope/hallmark` vào skill UI/UX (mục 10)

**PR:** #857 · **Loại:** `docs(ui-ux)` · **File chạm:** `.agents/skills/ui-ux-craftsman/SKILL.md`

## Việc đã làm

Nghiên cứu `Nutlope/hallmark` (Together AI, MIT) — skill "chống UI kiểu AI" cho Claude Code/Cursor:
`skills/hallmark/SKILL.md` (67 KB) + ~130 file `references/`, lõi là `references/slop-test.md`
(**57 gate + tự phê bình 6 trục**) và `references/verbs/audit.md` (khuôn rà soát).

Đối chiếu toàn bộ 57 gate với `ui-ux-craftsman` V7.0 rồi thêm **mục 10** gồm:

- **6 luật MỚI** (A.1–A.6): cấm `transition-all` · không rải chung `hover:scale-*` ·
  bắt buộc nhánh `prefers-reduced-motion` · focus ring hiện tức thì + viền ô nhập không đổi độ
  dày · ô nhập chừa sẵn chỗ dòng lỗi · không toast báo thành công cho việc đã thấy bằng mắt.
- **Khuôn báo cáo audit UI 4 ô** (B): Lỗi / Ở đâu / Mức / Sửa, nhóm theo mức, kết bằng
  `N critical · M major · K minor`; kèm thang `critical`/`major`/`minor` hiệu chỉnh cho DHCB.

## Quyết định kèm theo

1. **KHÔNG cài hallmark vào repo** (`npx skills add`). Nó sinh landing page HTML/CSS thuần một
   file kèm 21 theme + 21 macrostructure + `design.md` riêng → dựng nguồn sự thật thứ hai bên
   cạnh `index.css` + `tailwind.config.js` + `core-ui/theme.ts`. Cùng lý do đã từ chối
   `pbakaus/impeccable` ở mục 9. Chỉ nhập tri thức, diễn đạt lại bằng token DHCB.
2. **Phần bị loại có lý do, ghi thẳng vào skill để phiên sau không bàn lại:** 21 theme +
   21 macrostructure + fingerprint nav/hero/footer (DHCB là app điều hướng cố định, không phải
   trang tiếp thị); copywriting landing page SaaS tiếng Anh; nhóm tương phản/typography/
   prose-width/token đã có ở mục 2·6·9 **và** đã có cổng chặn CI — nhập vào là dựng cổng thứ hai.
3. **Không mở đợt quét sửa hàng loạt.** 6 luật áp cho code MỚI và code đang sửa; chỗ cũ gỡ dần
   khi đụng tới — cùng lập luận với mục 9.5.
4. **Chưa dựng cổng lint/test cho luật `prefers-reduced-motion`** — để dạng luật đọc trước, đo
   mức tuân thủ sau vài đợt rồi mới quyết có tự động hoá không.

## Bằng chứng đo (grep trên `apps/`, 2026-09-05)

| Luật                                                          | Số đo          |
| ------------------------------------------------------------- | -------------- |
| `transition-all` (A.1)                                        | **197** chỗ    |
| `hover:scale-10x` (A.2)                                       | **56** chỗ     |
| file có `prefers-reduced-motion`/`motion-reduce` (A.3)        | chỉ **5** file |
| `bg-clip-text` (gate gradient text — đã sạch, không cần luật) | 3 chỗ          |

Lý do có khuôn báo cáo ở B: ba đợt rà UI gần nhất (`docs/changelog/0206`, `0207`, `0208`) mỗi
đợt tự chế một định dạng khác nhau → không so sánh được giữa các đợt.

## Kiểm chứng

Thay đổi chỉ chạm một file tài liệu skill (`.agents/`), không chạm mã nguồn, không chạm cấu hình
build/CI. Cổng commit chạy theo diện tài liệu: `npm run format` (Prettier trên file đã sửa).
