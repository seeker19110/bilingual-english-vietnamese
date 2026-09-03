# 0245 — 2026-09-03 — Cổng a11y chờ theo trạng thái, không theo thời gian

PR: (điền khi tạo) · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Trả món nợ 🔴 ghi ở đợt trước (`docs/changelog/0244-*`, `PROGRESS.md`). Cổng a11y —
`e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` — gọi `waitForTimeout(1000)` rồi mới quét axe.
Con số đó là một **canh bạc về tốc độ máy**, và nó hỏng theo kiểu im lặng: cổng vẫn chạy, vẫn
báo "0 vi phạm", chỉ là con số đó nói về một trang chưa render xong chứ không về trang người
dùng thấy.

Phát hiện khi chữa CI đỏ của PR #826: lỗi `aria-required-parent` trên 182 phần tử (mức
critical) mà CI bắt được thì chạy cục bộ **không tái hiện nổi** — vì lúc đó `/tien-do` sau 1
giây chưa render lịch (`gridcells: 0`), axe quét một trang gần như trống.

## Đo trước khi sửa

Đếm số phần tử DOM sau 1 giây, so với khi DOM thật sự ổn định, trên 21 trang (server đã
"nóng"):

| Trang               | Sau 1s  | Khi ổn định | Thiếu   |
| ------------------- | ------- | ----------- | ------- |
| **`/` (Trang chủ)** | **268** | **478**     | **44%** |
| 20 trang còn lại    | —       | —           | 0%      |

Chi tiết trang chủ — chia theo thứ mà luật a11y soi:

|                                            | Cổng cũ thấy | Thực tế | Tỉ lệ được soi |
| ------------------------------------------ | ------------ | ------- | -------------- |
| Tổng phần tử                               | 268          | 478     | 56%            |
| Chữ (`p`, `h1–h3`, `span`, `li`)           | 39           | 94      | 41%            |
| Phần tử tương tác (`a`, `button`, `input`) | 21           | 55      | **38%**        |

Tức cổng đang soi **38% số nút và link của trang quan trọng nhất**, rồi tuyên bố sạch.

Lưu ý quan trọng: đây là số đo lúc dev server đã nóng. Lần đo trước đó (server nguội) thì
`/tien-do` cũng chưa render. **Cùng một lệnh, cùng một commit, máy nguội và máy nóng cho hai
kết quả khác nhau** — nên không có con số chờ cứng nào đúng cho mọi lần chạy.

## Cách sửa

`waitForStableDom` trong `e2e/helpers/axe.ts`: đếm số phần tử trong DOM, coi là ổn định khi
con số đó không đổi qua 3 lần đo liên tiếp (200ms/lần).

- Chọn "đếm phần tử" thay vì `networkidle` vì phần lớn nội dung app render sau khi đọc
  `localStorage` — không có request mạng nào để mà chờ.
- **Hết giờ thì KHÔNG ném lỗi**, chỉ trả về. Trang có hoạt ảnh lặp vô hạn sẽ không bao giờ
  "đứng yên"; quét muộn vẫn tốt hơn quét sớm, còn ném lỗi ở đây chỉ đổi một cổng xanh giả lấy
  một cổng đỏ giả.
- Thay cả 2 chỗ `waitForTimeout(500)` ở nhóm test `/thu-thach` — chúng đã chờ đúng mốc trạng
  thái trước đó rồi mới chờ thêm 500ms, tức vẫn là đoán. Trang này có đồng hồ đếm ngược, nhưng
  đồng hồ chỉ đổi **chữ** chứ không đổi **số phần tử**, nên vẫn ổn định nhanh: 15 test chạy
  hết 26,7 giây, không có test nào chạm trần chờ.

## Kết quả: KHÔNG có vi phạm nào bị che

Chạy lại toàn bộ hai file cổng với cách chờ mới: **392/392 xanh**.

Cần nói thẳng: ở đợt trước tôi dự đoán "rất có thể sẽ lòi ra vi phạm đang bị che". **Dự đoán
đó sai** — app thật sự sạch, kể cả ở 44% nội dung trang chủ trước đây chưa từng bị soi. Giá
trị của đợt này vì thế không phải "vá được N lỗi", mà là: từ nay con số "0 vi phạm" nói về
trang thật, chứ không về một trang mới render nửa chừng.

## Chi phí: không có

|                                          | Bản cũ (chờ cứng 1000ms) | Bản mới (chờ trạng thái) |
| ---------------------------------------- | ------------------------ | ------------------------ |
| 49 test `a11y.spec.ts` (theme dark-blue) | 1,2 phút                 | 1,2 phút                 |

Chờ theo trạng thái không chậm hơn vì với trang render nhanh nó thoát sớm (3 × 200ms = 600ms),
bù lại phần chờ lâu hơn ở trang render chậm.

## Chống tái phát

`scripts/a11y-gate-policy.test.ts` — 4 test chặn CI, theo mẫu `ci-workflow-policy.test.ts` sẵn
có: hai file cổng phải dùng `waitForStableDom`, và không được có chờ cứng ≥500ms.

Ngưỡng 500ms là cố ý: chờ cứng NGẮN (như 100ms sau khi tắt animation trong `freezeAnimations`)
không thay thế việc chờ render nên vẫn cho phép; chỉ chặn các mốc dài, vốn luôn là "đoán xem
trang xong chưa".

**Test này đã chứng minh có tác dụng ngay khi viết**: nó bắt đúng 2 chỗ `waitForTimeout(500)`
mà tôi đã bỏ sót ở lần sửa đầu.

## Việc tiếp theo

Di trú dần 915 nút cũ sang `Button` dùng chung của đợt 1 — việc dọn dẹp, không gấp.
