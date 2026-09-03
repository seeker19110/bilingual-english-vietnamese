# 0258 — 2026-09-03 — Chắt lọc 9 luật thiết kế từ `pbakaus/impeccable`, không cài công cụ

**PR:** (điền sau) · **Loại:** `docs` — bổ sung skill + ghi một món nợ kỹ thuật mới.

## Câu hỏi ban đầu

Người dùng hỏi: kho `github.com/pbakaus/impeccable` có giúp ích gì cho dự án không? Đó là một
"skill design" cho AI coding agent (bắt nguồn từ frontend-design skill của Anthropic): cài bằng
`npx impeccable install`, 23 lệnh `/impeccable <command>`, **61 luật phát hiện mẫu** chạy không
cần API key, Apache 2.0.

## Kết luận: KHÔNG cài, nhưng ĐÁNG đọc

Ba lý do không cài:

1. **Trùng lặp** với `.agents/skills/ui-ux-craftsman` đã có.
2. **Xung khắc luật bất biến §4.8** — công cụ chung sẽ đề xuất màu/hiệu ứng cụ thể; sửa theo là
   phá token và phá a11y ở 4 theme còn lại.
3. **Nó cài hook + `.impeccable/config.json` + đòi file `DESIGN.md` riêng** — dựng nguồn sự thật
   thứ hai bên cạnh `index.css` + `theme.ts`, đúng thứ ghi chú mục 5 của skill đã cấm.

Nên thay vì cài, đã **clone và đọc code thật** (`scripts/detector/registry/antipatterns.mjs`,
636 dòng, đủ 61 luật), rồi **đối chiếu bằng grep trên `apps/`** để chỉ giữ luật có bằng chứng.

## Bằng chứng đo được (grep `apps/`, 2026-09-03)

| Dấu hiệu                                                           | Số chỗ thật |
| ------------------------------------------------------------------ | ----------- |
| Bóng phát sáng màu (`shadow-accent-500/*`, `shadow-violet/cyan-*`) | ~70+        |
| Nhãn HOA nhỏ giãn chữ trên tiêu đề (kicker/eyebrow)                | 54 file     |
| `animate-pulse`                                                    | 29 file     |
| Màu Tailwind cứng ngoài token (`violet/purple/cyan/fuchsia-xxx`)   | **423**     |
| Giới hạn độ dài dòng đọc (`max-w-prose`)                           | chỉ 2       |
| `text-[11px]`                                                      | 560         |
| `border-l-4` màu · `bg-clip-text` · `radial-gradient`              | 3 · 3 · 2   |

## Đã làm

**Thêm mục 9 vào `.agents/skills/ui-ux-craftsman/SKILL.md`** — 9 luật, chia ba nhóm:

- **4 luật MỚI** lấp lỗ hổng V7.0 chưa nói tới: độ dài dòng ≤75ch · nhịp tiêu đề (khoảng TRÊN >
  khoảng DƯỚI) · line-height thân bài 1.5–1.7 · không lồng thẻ trong thẻ.
- **3 luật SIẾT LẠI** cái đã có: bóng phát sáng chỉ khi có nghĩa · `animate-pulse` chỉ cho thứ
  đang thay đổi thật · 11px là sàn tuyệt đối chứ không phải cỡ mặc định.
- **2 luật kỹ thuật**: chỉ animate `transform`/`opacity` · không thêm mới kicker/eyebrow.

Mục 9 ghi luôn **lý do loại 52 luật còn lại** để phiên sau khỏi bàn lại: nhóm copywriting landing
page SaaS tiếng Anh không áp được cho app học tiếng Việt; nhóm tương phản/cấp tiêu đề/cỡ chữ đã
có `e2e/a11y.spec.ts` + `a11y-aaa.spec.ts` + `jsx-a11y` bắt rồi; luật "bỏ font Inter" bị loại vì
đổi font toàn app đánh đổi CLS + bundle + chạy lại 2 cổng a11y × 15 trang × 5 theme.

Ba luật `line-length` · `heading-rhythm` · `nested-cards` là thứ skill V7.0 **chưa từng có** —
`heading-rhythm` giải thích được cảm giác "các mục dính vào nhau" mà thang `gap-*` không nói tới.

## Nợ mới ghi vào `PROGRESS.md`

**423 chỗ màu Tailwind cứng ngoài token.** Đây là phát hiện đáng giá nhất của đợt này: luật bất
biến §4.8 đang rò rỉ ở quy mô lớn mà chưa ai đo. Hai cổng a11y **không bắt được** — chúng đo cặp
nền/chữ thực tế render, không đo "màu này có thuộc hệ thống không". Cố ý **không sửa trong PR
này**: chạm hàng trăm file, phải tách đợt riêng và cần người dùng duyệt phạm vi.

## Bằng chứng kiểm chứng

Đợt này **chỉ sửa tài liệu** (`SKILL.md`, `PROGRESS.md`, changelog) — không đụng một dòng mã
nguồn nào, nên không có rủi ro hồi quy. Cổng chạy: Prettier + Markdown (xem mô tả PR).
