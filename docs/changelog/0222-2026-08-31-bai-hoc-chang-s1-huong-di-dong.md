# 0222 — Bài học 8 bước thật cho chặng mobile-s1 (hướng Di động)

**Ngày:** 2026-08-31 · **Nhánh:** `claude/new-development-direction-quj5ea`
**Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s1-huong-di-dong.md` (Approved for implementation)

## Việc đã làm

Soạn **5 bài học 8 bước** cho chặng `mobile-s1` ("App đầu tiên trên máy thật"). Đây là chặng
**đầu tiên của hướng Di động** có bài học thật — trước đợt này hướng chỉ có metadata module ở
`specializations/mobile.ts`, nên mọi chặng đều là trang trắng.

3 unit mới, phủ đủ 4 module gốc:

| Unit      | Module                                  | Bài                                                                                                                                                                                        |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `p6-u131` | `mobile-s1-m1` chọn nền tảng & đánh đổi | `l1` Vòng đời app — máy trạng thái `chua-tao / hien / nen / da-giet`, `hien → nen` là cơ hội ghi cuối cùng; native vs đa nền tảng                                                          |
| `p6-u132` | `mobile-s1-m2` giao diện khai báo       | `l1` UI là hàm của state — 4 trạng thái màn hình theo thứ tự ưu tiên (đang tải → lỗi → rỗng → có dữ liệu), hàm vẽ phải thuần · `l2` Ảo hoá danh sách — cửa sổ dựng + đệm, kẹp biên hai đầu |
| `p6-u133` | `mobile-s1-m3` + `m4` (gộp)             | `l1` Ngăn xếp điều hướng — push/pop/replace/popToRoot, deep link dựng lại cả ngăn xếp, cấm biến toàn cục · `l2` Migration kho cục bộ — ba tầng lưu trữ, bước nhảy đúng một bậc, lũy đẳng   |

## Quyết định kèm theo

1. **Làn ngôn ngữ `typescript`, không `kotlin`/`swift`.** Đo được: hiện **không bài học nào**
   trong repo khai `language: 'kotlin'` hay `'swift'` — `lessonsKotlin.test.ts` và
   `lessonsSwift.test.ts` mỗi file chỉ có 1 test, nên bộ mô phỏng `kotlinSim/` chưa được cổng CI
   nào chứng minh là chấm đúng bài mới. Làn `typescript` thì được `lessonsTs.test.ts` chấm bằng
   tsc thật + `node:vm`. Nguyên lý dạy ở cả 5 bài là nguyên lý chung cho Android/iOS/đa nền
   tảng, mô phỏng được bằng hàm thuần tất định — cố ý **không bịa API Compose/SwiftUI/RN cụ thể**.
2. **Gộp m3 + m4 vào `p6-u133`**, theo tiền lệ `web-s1`/`backend-s2..s4`/`data-s2`: cả hai cùng
   trả lời "cái gì phải sống sót, và sống sót ở đâu" (m3 trong một phiên, m4 qua các phiên).
3. **Dải mã `p6-u131..133`, bỏ trống `u129/u130` có chủ đích.** Đợt này chạy song song với hai
   đợt soạn bài khác trên cùng nhánh (`architecture-s3`, `data-s3`); dải `u126..128` đã bị đợt
   `data-s3` lấy giữa chừng, nên số unit được cấp cách quãng để không đụng nhau.

## Bằng chứng kiểm chứng

```
Build ✅ (npm run build — vite + hub + packages, 1823 modules)
Type  ✅ (npm run typecheck — 0 lỗi)
Lint  ✅ (npm run lint — 0 cảnh báo, max-warnings 0)
Format ✅ (npx prettier --check trên 6 file chạm tới)
Test  ✅ (npx vitest run packages/subject-programming + apps/dhcb/src/lib/lessonMarkdown.test.ts
          — 50 file, 3749/3749 test xanh)
```

Một lỗi thật do cổng bắt được trong lúc soạn: bài `p6-u133-l1` có phương án nhiễu `Home` là
**chuỗi con** của output thật `Home>Bill`, nên `lessonsTs.test.ts` đỏ ở bất biến "lựa chọn sai
không được khớp output". Sửa bằng cách in ngăn xếp trong dấu ngoặc vuông (`[Home>Bill]`) để bốn
phương án tách bạch hẳn nhau.

## Ảnh hưởng

Chỉ thêm dữ liệu học liệu tĩnh + 3 dòng đăng ký. Không đụng UI/route, schema DB, auth hay thanh
toán. Sau đợt này `specHasLessons('mobile')` trả `true`, nên danh sách hướng chuyên sâu gắn nhãn
"đã có bài" cho hướng Di động và nút "Vào học" ở chặng S1 trỏ tới nội dung thật.
