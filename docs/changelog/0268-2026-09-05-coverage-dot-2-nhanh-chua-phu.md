# 0268 — 2026-09-05 — Đợt 2 nâng coverage: viết test cho nhánh chưa phủ, siết sàn lên 96/93/95/96

## Việc đã làm

Tiếp mạch "nâng coverage lên 100%" của người dùng. **Đợt 1 (PR #852)** chỉ siết sàn theo số đo
sẵn có và phải để `branches` nguyên 90 vì biên độ chỉ còn 0,71 điểm. Đợt này **trả đúng chỗ mỏng
đó**: viết test nhắm thẳng vào từng NHÁNH chưa đi, thay vì viết test dàn trải cho có số.

**Cách chọn việc — đo trước, không đoán.** Chạy `vitest --coverage` với reporter `json` rồi đọc
`coverage-final.json`: với mỗi file, `b[id][i] === 0` cho biết vế thứ `i` của điểm rẽ chưa từng
chạy. Từ đó xếp hạng ra **18 file gom 586/1.461 nhánh chưa đi của cả repo** (40%), giao cho 8
subagent chạy song song, mỗi agent một nhóm file riêng để không tranh file.

Kết quả từng file (branch %, trước → sau):

| File nguồn                         | Trước | Sau       | Test thêm |
| ---------------------------------- | ----- | --------- | --------- |
| `kotlinSim/interpreter.ts`         | 88,97 | 96,94     | 99        |
| `swiftSim/interpreter.ts`          | 88,45 | **99,59** | 91        |
| `kotlinSim/parser.ts`              | 93,65 | 98,87     | 31        |
| `swiftSim/parser.ts`               | 92,61 | 99,26     | 24        |
| `gitSim.ts`                        | 87,47 | 97,21     | 39        |
| `openclawSim.ts`                   | 77,31 | 99,27     | 46        |
| `hermesSim.ts`                     | 87,21 | 97,91     | 15        |
| `vibeSim.ts`                       | 88,42 | 98,60     | 11        |
| `bashSim.ts`                       | 97,83 | 98,63     | 7         |
| `core-auth/authService.ts`         | 78,50 | 97,63     | 40        |
| `api/core/push.ts`                 | 80,00 | 99,17     | 40        |
| `core-ui/clientAuth.ts`            | 75,92 | 97,74     | 34        |
| `core-ai/geminiLiveService.ts`     | 67,39 | **100**   | 16        |
| `core-grading/chemistry.ts`        | 86,50 | 93,23     | 7         |
| `apps/dhcb/src/lib/cefrExam.ts`    | 81,33 | **100**   | 21        |
| `apps/dhcb/src/lib/mistakes.ts`    | 86,66 | **100**   | 11        |
| `core-location/locationService.ts` | 74,60 | **100**   | 25        |
| `apps/dhcb/src/lib/tts.ts`         | 89,47 | **100**   | 34        |

Toàn repo (đo thật, `npm run test:coverage` chạy trọn):

| Chỉ số     | Trước đợt | Sau đợt   | Sàn cũ | Sàn mới |
| ---------- | --------- | --------- | ------ | ------- |
| statements | 96,36     | **97,00** | 95     | **96**  |
| branches   | 90,71     | **94,06** | 90     | **93**  |
| functions  | 95,19     | **95,95** | 94     | **95**  |
| lines      | 96,36     | **97,00** | 95     | **96**  |

Test: **11.160 → 11.702** (542 test mới, 551 → 556 file). Sàn vẫn chừa ~1 điểm biên độ mỗi chỉ
số để không đỏ vì dao động giữa các lượt chạy. **Không sửa một dòng mã nguồn nào** — đợt này
thuần test.

## Nhánh còn lại: gần hết là mã phòng thủ không tới được

Các agent phải giải trình từng nhánh còn trống thay vì bỏ lửng. Đại đa số rơi vào một mẫu chung:
fallback `?? ''` / `?? null` / `?? 0` sau khi truy cập mảng hoặc `Map`, sinh ra do
`noUncheckedIndexedAccess` của TypeScript strict — vế phải **không thể chạy** vì bất biến ở nơi
gọi đã bảo đảm vế trái luôn có giá trị. Loại còn lại là `throw e` cho lỗi không phải lớp lỗi
riêng của module (lưới an toàn cho bug lập trình, không giả lập được từ input hợp lệ) và vài
`case`/nhánh bị lọc trước khi tới nơi. **Kết luận: 100% branch là mục tiêu không đạt được bằng
test hợp lệ** — muốn chạm phải viết test giả tạo hoặc dọn mã phòng thủ, cả hai đều đắt hơn giá
trị thu được.

## Ba nghi bug phát hiện trong lúc viết test (CHƯA sửa — việc của đợt sau)

Không nằm trong phạm vi đợt này (đợt này không đụng mã nguồn), ghi lại kèm bằng chứng:

1. **`bashSim.ts` — `lenhFind` cắt lệch 1 ký tự khi chạy `find /`.** Công thức
   `k.slice(pGoc.length + 1)` đúng cho mọi thư mục trừ gốc: `pGoc === '/'` vốn đã có sẵn dấu `/`
   nên `/home` bị cắt thành `ome`. Sửa: tách riêng nhánh `pGoc === '/'` dùng `k.slice(pGoc.length)`.
2. **`kotlinSim` — `associateWith` không khử trùng khoá.** `listOf(1, 1, 2).associateWith { it * 2 }`
   in `{1=2, 1=2, 2=4}` (hai cặp khoá `1` trong một Map) thay vì gộp như Kotlin thật;
   `mapOf`/`groupBy` đã khử trùng, riêng đường này thì không.
3. **`kotlinSim` — `println(theHienDataClass)` bỏ qua `override fun toString()`** trong khi gọi
   `.toString()` tường minh thì tôn trọng. Có thể là khác biệt cố ý chưa ghi vào tài liệu
   "KHÁC BIỆT", cần người quyết. (Kèm giới hạn đã biết: `object { val x get() = ... }` chưa hỗ trợ.)

Thêm một phát hiện về chính bộ test: một test cũ trong `mistakes.test.ts` (describe "Mistake Bank
— ca biên") ghi đè `Storage.prototype.setItem` để giả lập lỗi ghi, nhưng `localStorage` ở môi
trường test là thuộc tính riêng của instance nên **việc ghi đè đó không có tác dụng** — test vẫn
xanh mà không hề phủ nhánh `catch` nó tự nhận. Đợt này viết test mới dùng đúng cách
(`vi.spyOn(localStorage, 'setItem')`) để phủ nhánh đó thật; test cũ giữ nguyên, đã ghi chú tại chỗ.
Cùng loại bẫy: `sessionStorage`/`localStorage` của happy-dom là `Proxy`, `vi.spyOn` trên instance
không chặn được — phải `vi.stubGlobal` thay cả object.

## Bằng chứng kiểm chứng

Build ✅ · Type ✅ · Lint ✅ (0 cảnh báo) · Format ✅ · Test ✅ **11.702/11.702 (556/556 file)** ·
Coverage ✅ đạt sàn mới (số đo dán ở bảng trên, đo trực tiếp bằng `npm run test:coverage`).

## Việc còn lại

- Ba nghi bug ở trên — mỗi cái một PR nhỏ, có test đi kèm.
- Muốn siết sàn tiếp thì phải nhắm nhóm file phủ thấp kế tiếp (`core-personal/*`,
  `core-domains/*`, `api/domains/*`), không còn chỗ dễ nữa: 18 file dễ nhất đã xong ở đợt này.
