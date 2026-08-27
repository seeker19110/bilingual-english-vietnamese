# Khuôn ĐẶC TẢ TÍNH NĂNG (giao cho AI hoặc người khác thi hành)

> Copy file này thành `docs/specs/<ngày>-<slug>.md` rồi điền. Sáu ô dưới đây là **bắt buộc** —
> thiếu ô nào thì bên thi hành sẽ tự đoán, và thường đoán sai.
> Cơ sở: `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md` §2.5 (hướng
> `architecture`, chặng S3).
>
> **Luật số 1 của khuôn này:** viết ô ④ (tiêu chí chấp nhận) TRƯỚC ô mô tả giải pháp. Không viết
> được tiêu chí đo được nghĩa là mình chưa hiểu rõ việc mình đang giao.

---

## 0. Một câu

<!-- Việc này làm gì, cho ai. Một câu, không dài hơn. -->

## ① Phạm vi

**LÀM:**

- <!-- gạch đầu dòng, mỗi dòng một việc quan sát được -->

**KHÔNG LÀM (quan trọng ngang mục trên):**

- <!-- cái gì cố ý để ngoài đợt này, và vì sao -->
- <!-- cái gì TUYỆT ĐỐI không được đụng tới (file, bảng, luồng) -->

## ② Điểm chạm

| Việc | Đường dẫn file | Ghi chú |
| ---- | -------------- | ------- |
| Sửa  | `...`          |         |
| Thêm | `...`          |         |

<!-- Không viết "sửa phần backend". Chạy `npm run codemap -- impact <file>` để biết sửa file này
     còn gãy chỗ nào, rồi liệt kê luôn vào đây. -->

**Ảnh hưởng lan ra (theo codemap):**

- <!-- danh sách file/luồng bị ảnh hưởng -->

## ③ Hợp đồng dữ liệu

**Vào:**

```ts
// kiểu/schema cụ thể, không viết "object chứa thông tin đơn hàng"
```

**Ra:**

```ts

```

**Ca lỗi (là một phần hợp đồng, không phải phụ lục):**

| Tình huống | Mã lỗi | Hành vi mong đợi |
| ---------- | ------ | ---------------- |
|            |        |                  |

## ④ Tiêu chí chấp nhận

<!-- Đo được. Mỗi dòng phải trả lời: chạy lệnh nào thì biết là đạt. -->

- [ ] <!-- ví dụ: gửi lại cùng khoá idempotency không tạo đơn thứ hai — `npm test -- xxx` -->
- [ ] <!-- ví dụ: p95 < 300ms ở 1.000 bản ghi — lệnh đo: ... -->

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build
# + lệnh riêng của tính năng này
```

## ⑤ Bất biến không được phá

| Bất biến                                 | Test nào canh nó    |
| ---------------------------------------- | ------------------- |
| <!-- ví dụ: tồn kho không bao giờ âm --> | `path/to/x.test.ts` |

<!-- Chưa có test canh thì VIẾT TEST TRƯỚC khi giao việc. Đây là cách duy nhất chứng minh bên thi
     hành không phá thứ đang chạy. -->

## ⑥ Quy ước dự án liên quan

<!-- Bên thi hành KHÔNG thấy hội thoại trước đó. Nhắc lại đúng những quy ước đợt này chạm tới. -->

- <!-- ví dụ: import xuyên gói dùng `@dhcb/<gói>/<file>` không đuôi `.js` -->
- <!-- ví dụ: mọi handler API tự kiểm `user_id` qua `validateAuth()` -->
- <!-- ví dụ: chữ nội dung phải đạt AAA; màu lấy từ token `--a-*`, không ghi cứng -->

---

## Nghiệm thu (bên giao việc điền SAU khi nhận kết quả)

- Lệnh đã chạy + kết quả thật: <!-- dán output, không viết "chạy ok" -->
- Tiêu chí ④ đạt hết chưa; cái nào chưa và vì sao:
- Có phá bất biến ⑤ nào không:
- Có mở rộng ngoài phạm vi ① không (nếu có: bỏ ra hay giữ lại, vì sao):
- Còn để ngỏ:
