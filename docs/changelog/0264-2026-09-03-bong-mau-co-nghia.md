# 0264 — 2026-09-03 — Đợt D2 thiết kế lại UI/UX: bóng phát sáng màu chỉ còn khi có nghĩa

**PR:** (điền sau) · **Loại:** `refactor` — không thêm tính năng nghiệp vụ, chỉ đổi cách trình bày.
Phần thứ hai của đợt D (giảm nhiễu thị giác toàn app), tiếp sau D1 (`docs/changelog/0263-*.md`,
PR #846).

## Mâu thuẫn đã nêu và người dùng chốt

Luật 5 mục 9 (`.agents/skills/ui-ux-craftsman`) viết: _"chỗ cũ gỡ dần khi đụng tới, không mở
đợt quét riêng"_ — nghĩa là bản thân luật khuyên KHÔNG mở một đợt PR riêng để quét gỡ bóng màu
cũ. D2 chính là đợt quét riêng đó (154 chỗ, 57 file). Đã hỏi người dùng trước khi làm — **chốt:
vẫn làm D2 đầy đủ như đã đề xuất, ghi đè câu khuyến nghị "gỡ dần"** vì khối lượng nợ đo được quá
lớn để chờ gỡ tự nhiên.

## Phương pháp phân loại

Với từng trong 154 chỗ `shadow-<màu>-500/xx`, đọc ngữ cảnh xung quanh (element cha, có nằm
trong nhánh `? :` theo state hay không, tên biến điều kiện) rồi xếp vào một trong hai nhóm theo
đúng câu luật 5: _"Bóng màu chỉ hợp lệ khi mang nghĩa trạng thái — đang ghi âm, đang được chọn,
tiêu điểm bàn phím."_

**GIỮ (46 chỗ)** — mang đúng một trong các nghĩa trạng thái:

- **Đang được chọn/đang mở** (32 chỗ): tab đáy đang đứng route đó (`BottomNav`), tab/bộ lọc/cấp
  độ/simulator đang chọn (`StudioDialogue`, `WorkplaceHarvesterCard`, `AppliedKnowledge` 14 chỗ,
  `Subjects` 3 bộ lọc, `SubjectDetail` 2, `Chat`/`Speaking` cấp độ, `LifeGraph`, `Companion`,
  domain/kịch bản/âm vị/đoạn/nguồn đang chọn ở các thẻ `CompanionVoice`, cụm từ đang chọn
  `CollocationGraphExplorer`, hạng mục phản hồi đang chọn `FeedbackModal`, dòng hội thoại đang
  đọc `Lessons`).
- **Đang ghi âm/đang lắng nghe** (3 chỗ): nút "Dừng Ghi Âm" hiện khi `voice.state === 'recording'`
  (`StudioDialogue`), thanh hỏi nhanh khi `isListening` (`HomeUniversalAiBar`), nút mic khi
  `recording` (`Speaking`).
- **Vừa chấm đúng** (2 chỗ): phản hồi ngay sau khi trả lời (`MicroDrillModal`,
  `PvPBattlefieldModal`) — giữ theo tinh thần "màu ngữ nghĩa" đã có ở CLAUDE.md mục 4.8.
- **Đang trực tuyến** (1 chỗ): chấm trạng thái online (`PresenceDot`).

**GỠ (108 chỗ)** — trang trí thuần, không đổi theo tương tác: icon avatar tĩnh, CTA ở trạng thái
nghỉ (kể cả nhánh "sẵn sàng gửi"/`canSubmit` — "sẵn sàng" không nằm trong 3 nghĩa luật cho phép),
thẻ nội dung, huy hiệu streak, bong bóng chat theo người gửi (màu/vị trí đã đủ phân biệt, không
cần quầng sáng), nút bắt đầu ghi âm ở trạng thái CHƯA ghi (khác với nút "Dừng ghi âm" đang ghi —
xem `EchoShadowingCard`/`Challenge.tsx`), field `glow` trong `SUBJECT_COLORS` của `Subjects.tsx`
(áp lên mọi icon môn học không phân biệt trạng thái — xoá cả field lẫn nơi dùng, không chỉ xoá
giá trị).

**Ca biên đã cân nhắc riêng:**

- `Dashboard.tsx` cột biểu đồ 7 ngày: cờ `d.active` nghĩa là "ngày đó CÓ hoạt động" (dữ liệu quá
  khứ), không phải "hôm nay"/trạng thái tương tác đang diễn ra → GỠ.
- `MessageBubble.tsx`: bong bóng "tin nhắn của tôi" luôn cùng màu bất kể tương tác, không phải
  trạng thái → GỠ (giữ nguyên gradient nền phân biệt người gửi).
- `Speaking.tsx` nút mic 20×20: `recording ? 'shadow-red-500/40' : 'shadow-sky-500/30'` — chỉ
  GIỮ nhánh `recording=true` (đúng luật); nhánh chưa ghi âm gỡ quầng màu, dựa vào `shadow-xl`
  trung tính có sẵn trên khung ngoài.

## Cách thực hiện

Viết script Python đọc lại đúng 154 vị trí (file + số dòng) đã khảo sát, xoá token
`shadow-<màu>-<số>/<số>` khỏi 108 dòng đã xếp GỠ, giữ nguyên 46 dòng còn lại — không đụng tới
bất kỳ lớp khác trên cùng dòng (bóng trung tính `shadow-md`/`shadow-lg`/`shadow-xl` nếu có vẫn
giữ). `pages/learning/Subjects.tsx` sửa tay riêng vì field `glow` là thay đổi cấu trúc (bớt một
trường trong kiểu `SUBJECT_COLORS`), không phải xoá token trên một dòng.

## Test canh gác mới

Bổ sung vào `apps/dhcb/src/pages/core/UiNoise.design.test.ts` (đã có sẵn từ D1): một `describe`
riêng cho D2 — `ALLOWED_COLOR_SHADOW_COUNT` liệt kê ĐÚNG số bóng màu còn lại theo từng file kèm
lý do bằng một dòng comment, test so khớp **toàn bộ** map thay vì chỉ đếm tổng — thêm bóng màu ở
bất kỳ đâu (kể cả file đã có mặt trong danh sách) hay gỡ nhầm một chỗ đang hợp lệ đều làm test đỏ.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11148/11148, 551 file)
```

## Việc CHƯA làm (cố ý, để lại cho D3)

- **`animate-pulse`/`animate-ping` trang trí** (luật 6) — ~31+10 file. Có ca hợp lệ thật
  (Companion đang nghe/nói, đang ghi âm) cần rà từng chỗ như D2, không gỡ hàng loạt.
- Luật 5 mục 9 vẫn còn hiệu lực cho MỌI code viết MỚI sau đợt này: bóng màu chỉ thêm khi đúng
  ba nghĩa trên, không thêm tuỳ hứng — test allowlist ở trên sẽ tự bắt nếu quên.
