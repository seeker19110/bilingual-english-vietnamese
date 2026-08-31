# Đặc tả: dải mã unit cho chặng S1 của 11 hướng còn lại

> Ngày 2026-08-27 · Vá một thiếu sót của `docs/specs/2026-08-27-chang-s4-13-huong.md`

## 1. Vấn đề

Bảng cấp mã unit của đặc tả S4 tự nhận là **"CHỐT CỨNG, không được đổi"** và chia như sau:

| Dải             | Dùng cho                                           |
| --------------- | -------------------------------------------------- |
| `p6-u1…u4`      | Dẫn nhập hướng chuyên sâu                          |
| `p6-u5…u15`     | CHƯƠNG TRÌNH M giữ chỗ (Kotlin · Swift · paradigm) |
| `p6-u16…u21`    | **S1 của hai hướng** `web` và `architecture`       |
| `p6-u22…u60`    | **S4 của cả 13 hướng** (3 unit mỗi hướng)          |
| `p6-u61` trở đi | "để dành cho **S2/S3**"                            |

**Không dải nào dành cho S1 của 11 hướng còn lại.** S1 của `web` và `architecture` được soạn
trước (u16…u21), rồi bảng nhảy thẳng sang S4 — mảng S1 của `backend`, `data`, `mobile`, `ai`,
`devops`, `security`, `systems`, `game`, `embedded`, `desktop`, `algo` bị bỏ quên.

Thiếu sót này chỉ lộ ra khi bắt tay soạn bài đầu tiên cho `backend-s1` và không biết đặt mã nào.

## 2. Quyết định

**S1 của 11 hướng còn lại dùng `p6-u61…p6-u93`** (11 hướng × 3 unit = 33 mã), theo thứ tự
thi hành dưới đây. **Dải để dành cho S2/S3 dời xuống `p6-u102` trở đi** (đã dời thêm một lần nữa: `p6-u94…p6-u101`
dùng cho 4 chặng RIÊNG của lộ trình "Kỹ Sư Trưởng AI" P5 "Tầm trưởng", không phải S2/S3 của
hướng nào — xem `docs/specs/2026-08-31-dot-4-p5-tam-truong.md`).

| #   | Hướng      | Mã chặng      | Unit                           | Trạng thái |
| --- | ---------- | ------------- | ------------------------------ | ---------- |
| 1   | `backend`  | `backend-s1`  | `p6-u61` · `p6-u62` · `p6-u63` | ✅ đã soạn |
| 2   | `data`     | `data-s1`     | `p6-u64` · `p6-u65` · `p6-u66` |            |
| 3   | `mobile`   | `mobile-s1`   | `p6-u67` · `p6-u68` · `p6-u69` |            |
| 4   | `ai`       | `ai-s1`       | `p6-u70` · `p6-u71` · `p6-u72` |            |
| 5   | `devops`   | `devops-s1`   | `p6-u73` · `p6-u74` · `p6-u75` |            |
| 6   | `security` | `security-s1` | `p6-u76` · `p6-u77` · `p6-u78` |            |
| 7   | `algo`     | `algo-s1`     | `p6-u79` · `p6-u80` · `p6-u81` |            |
| 8   | `systems`  | `systems-s1`  | `p6-u82` · `p6-u83` · `p6-u84` |            |
| 9   | `game`     | `game-s1`     | `p6-u85` · `p6-u86` · `p6-u87` |            |
| 10  | `embedded` | `embedded-s1` | `p6-u88` · `p6-u89` · `p6-u90` |            |
| 11  | `desktop`  | `desktop-s1`  | `p6-u91` · `p6-u92` · `p6-u93` |            |

### Vì sao chọn cách này

- **Không mã nào đã phát hành bị đổi.** Mã unit là khoá tiến độ trong Postgres
  (`programming.lesson_progress`), nên đổi mã cũ là mất tiến độ của người học. Dải `u61+` mới
  chỉ ĐƯỢC ĐỂ DÀNH chứ chưa unit nào dùng nên dời được tự do; đã dời hai lần: trước xuống `u94`,
  rồi `u94…u101` bị chiếm bởi 4 chặng P5 của lộ trình mục tiêu (đợt 4), nên dải để dành nay ở
  `u102` trở đi.
- **Đặt S1 ngay sau S4 thay vì cuối bảng.** Phương án khác là nhét S1 xuống sau S2/S3
  (`u139+`). Bỏ vì S1 là chặng sẽ được soạn TRƯỚC S2/S3 trong thực tế — người học vào hướng
  mới cần chặng nhập môn trước — nên để nó gần là hợp với thứ tự làm việc thật.
- **Thứ tự 11 hướng** ưu tiên các hướng có bộ chạy sẵn trong trình duyệt (`backend`, `data`,
  `ai` dùng được làn TypeScript/Python/SQL), để bài học chấm được bằng test-case ngay. Bốn
  hướng cuối (`game`, `embedded`, `desktop`, và phần lớn `systems`) không có bộ chạy nên sẽ
  cần quyết định riêng về làn — **cố ý xếp cuối, không hứa trước**.

## 3. Điểm chạm file

| File                                                         | Việc                         |
| ------------------------------------------------------------ | ---------------------------- |
| `packages/subject-programming/curriculum.ts`                 | khai 3 unit mới `p6-u61…u63` |
| `packages/subject-programming/lessons/p6u61…63.ts`           | 6 bài học 8 bước             |
| `packages/subject-programming/lessons.ts`                    | đăng ký 3 mảng bài           |
| `packages/subject-programming/specializations/stageUnits.ts` | nối `backend-s1` → 3 unit    |

## 4. Bất biến + test canh

| Bất biến                                                      | Test canh                                |
| ------------------------------------------------------------- | ---------------------------------------- |
| Mọi `unitId` tồn tại thật trong curriculum                    | `lessons.test.ts`                        |
| Mã bài đúng khuôn `p6-uN-lM` và duy nhất                      | `lessons.test.ts` (Zod + ca id duy nhất) |
| Code mẫu đạt HẾT test-case, chạy qua tsc thật                 | `lessonsTs.test.ts`                      |
| Đáp án Predict là output THẬT, và KHÔNG lựa chọn sai nào khớp | `lessonsTs.test.ts`                      |
| Chặng khai trong `stageUnits` có unit tồn tại                 | `stageUnits.test.ts`                     |

## 5. Việc để ngỏ

- Dải `p6-u102` trở đi để dành cho S2/S3 (cập nhật 2026-08-31: `u94…u101` đã dùng cho P5 của
  lộ trình "Kỹ Sư Trưởng AI", xem `docs/specs/2026-08-31-dot-4-p5-tam-truong.md`); đặc tả S4
  (mục "Bảng cấp mã unit") cần sửa dòng nói `u61 trở đi` — đã sửa trong PR này.
- 10 hướng còn lại của bảng mục 2 chưa soạn bài nào.
