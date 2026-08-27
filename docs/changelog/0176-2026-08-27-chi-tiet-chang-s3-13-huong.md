# feat(programming): chi tiết chặng S3 cho toàn bộ 13 hướng chuyên sâu (2026-08-27)

Làm dày **chặng S3 (nâng cao)** của cả 13 hướng từ mức _bản đồ_ (module + dự án, PR #712) lên mức
**thi hành và nghiệm thu được**. Đặc tả duyệt trước khi code: `docs/specs/2026-08-27-chang-s3-13-huong.md`.

**Vì sao S3, không phải S1/S2/S4:** S1–S2 là kiến thức giáo trình nào cũng có; S4 phụ thuộc bối
cảnh công ty nên không đặc tả chung được. S3 đúng là chỗ người học khựng lại — biết làm cho chạy
rồi nhưng không biết thế nào là "đủ tốt". Mà "đủ tốt" thì đo được, nên đặc tả được.

## Đã làm

- **Kiểu mới** `packages/subject-programming/specializations/stageDetailTypes.ts`:
  `SpecStageDetail` (`entryGate` · `moduleDrills` · `projectRubric` · `pitfalls` · `exitSignals` ·
  `nextStagePrep`) + `SpecModuleDrill` + `SpecRubricRow`.
- **Dữ liệu 13 hướng** `specializations/s3/*.ts` + `s3/registry.ts` (3 hàm tra cứu:
  `getStageDetail` · `countStageDetails` · `countDrills`). Tổng: **13 chi tiết chặng, 53 bài luyện
  (mỗi module một bài, có bằng chứng phải nộp), 54 dòng thang chấm dự án, 40 điều kiện vào chặng**.
- **Giao diện** `ProgrammingSpecializationPage.tsx`: mỗi module S3 hiện thêm "Bài luyện" + "Bằng
  chứng phải nộp"; cuối thẻ chặng S3 có khối điều kiện vào · thang chấm · bẫy · dấu hiệu qua chặng
  · chuẩn bị cho chặng sau. Chặng chưa soạn chi tiết thì **ẩn hẳn khối**, không hiện khung rỗng.
- **Sửa chữ sai đang có:** nút "Xem 12 hướng chuyên sâu" → 13 (dữ liệu đã 13 từ PR #712); comment
  danh sách route trong `e2e/a11y-aaa.spec.ts` cũng ghi nhầm 12.

## Quyết định kèm theo

1. **Mức ĐẠT của thang chấm bắt buộc là CON SỐ** — "nhanh hơn" không phải tiêu chí. Test canh gác
   bắt đỏ nếu một dòng `pass` không chứa chữ số. Đây không phải luật hình thức: soạn dữ liệu lần
   này test đã bắt được **2 ca thật** (`security-s3` "công bố có trách nhiệm", `desktop-s3` "ma
   trận nền tảng") viết bằng chữ chung chung, đã sửa thành ngưỡng đo được.
2. **Bài luyện phủ ĐÚNG tập module của chặng** (không thiếu, không thừa, không trùng) — thêm module
   vào chặng mà quên bài luyện là CI đỏ, không lặng lẽ thiếu.
3. **Không thêm route mới** — khối chi tiết nằm trong thẻ chặng của trang hướng sẵn có, nên không
   phải mở thêm cổng a11y trong cùng một PR.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ 0 cảnh báo | Format ✅ | Test ✅ 6811/6811 (485 file, +6 test mới)
a11y ✅ 30/30 (3 route × 5 theme × 2 cổng A/AA + AAA)
Bundle ✅ Initial JS 124,88/140 kB · CSS 16,21/18 kB
UI kiểm thật ✅ Playwright: trang /lap-trinh/huong/web hiện đủ 5 "Bài luyện" + 5 "Bằng chứng phải nộp"
codemap impact registry.ts ✅ 7 file — đều đã chạy lại test
```

## Còn để ngỏ (cố ý)

1. Chi tiết cho **S1/S2/S4** — khuôn `SpecStageDetail` đã dùng chung được, soạn thêm là đủ.
2. Chưa lưu **tiến độ chặng/bài luyện** xuống Postgres (giữ nguyên quyết định của PR #712).
3. Chưa soạn **bài học 8 bước** cho các hướng — tầng này vẫn là bản đồ, không phải nội dung chạy code.
