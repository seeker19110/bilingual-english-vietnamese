# 0268 — 2026-09-05 — Sửa 2 mock `localStorage` CÂM trong test (ghi đè `Storage.prototype` vô tác dụng)

## Việc đã làm

Hai test giả lập "localStorage hết dung lượng" bằng cách can thiệp vào `Storage.prototype.setItem`.
Cách này **không có tác dụng** trong môi trường test của dự án (Vitest + happy-dom trên Node): đối
tượng `localStorage` ở đây có `setItem` là **thuộc tính RIÊNG của instance**, không kế thừa từ
`Storage.prototype`. Đo trực tiếp trong một test tạm:

- `Object.getPrototypeOf(localStorage) === Storage.prototype` → `false`
- `hasOwnProperty(localStorage, 'setItem')` → `true`

Hậu quả: `setItem` thật vẫn chạy bình thường, nhánh `catch` của hàm ghi **chưa từng được thực
thi** qua các test này. Test vẫn "pass" nên lỗi im lặng — assertion chỉ kiểm tra "không ném lỗi",
điều đó vẫn đúng ngay cả khi mock không hoạt động.

Đã grep toàn repo (`Storage.prototype`) và sửa cả **hai** chỗ dính:

1. `apps/dhcb/src/lib/mistakes.test.ts` — gán trực tiếp `Storage.prototype.setItem = ...` (test
   "localStorage het dung luong ... addMistake khong nem ra ngoai").
2. `apps/dhcb/src/lib/progressSync.test.ts` — `vi.spyOn(Storage.prototype, 'setItem')`, cùng một
   nguyên nhân nên cũng câm (test "localStorage đầy khi ghi bản hợp nhất").

Cả hai đổi sang `vi.spyOn(localStorage, 'setItem').mockImplementation(...)` + `mockRestore()`,
kèm comment tiếng Việt giải thích vì sao **không** được spy ở tầng prototype, để lần sau không ai
viết lại đúng lỗi này.

Không đụng `packages/core-ui/authHeader.test.ts`: file đó chỉ **nhắc tới** pattern trong comment
và đã cố ý dùng `Object.defineProperty` thay `window.localStorage` (lý do liên quan v8 coverage,
ghi rõ trong comment sẵn có).

## Bằng chứng kiểm chứng

- Mock nay chạy THẬT: thêm tạm `expect(setItem.mock.calls.length).toBeGreaterThan(0)` vào test đã
  sửa → **xanh**; cùng assertion đó với bản `Storage.prototype` cũ cho **0 lần gọi**. Đã gỡ
  assertion tạm sau khi đo.
- Type ✅ (`tsc -p tsconfig.json --noEmit`) · Lint ✅ (0 cảnh báo) · Format ✅ (`prettier --write`)
- Test ✅ 63/63 trên hai file đã sửa.

## Việc còn lại

Không. Đây là sửa test, không đổi hành vi mã sản phẩm.
