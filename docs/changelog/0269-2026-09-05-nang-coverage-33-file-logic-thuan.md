# 0269 — 2026-09-05 — Nâng coverage 33 file logic thuần + vá lỗi id trùng ở Memory Palace

**PR:** #856
**Nhánh:** `test/coverage-dot-1`

## Bối cảnh

Người dùng yêu cầu "quét lại dự án, nâng coverage 100%". Quét thật bằng
`npm run test:coverage` cho thấy điểm xuất phát: stmts 96,36 · branches 90,71 ·
funcs 95,19 · lines 96,36.

**Đã báo trước với người dùng rằng con số 100% tuyệt đối là không đạt được một cách
trung thực**, vì phần chưa phủ gồm hai loại mã mà unit test không chạm tới được:

1. **Nhánh phòng thủ chết** — `noUncheckedIndexedAccess` của TS strict bắt viết
   `?? ''` / `?? 0` sau khi truy cập phần tử mảng, trong khi bất biến của chính module
   bảo đảm giá trị luôn tồn tại. Không có đường đi hợp lệ nào chạm tới.
2. **Vỏ bọc WebSocket/mạng sống** (`wsCoLearningHandler`, `wsGeminiLiveHandler`,
   `clientAuth`…) — thuộc phạm vi E2E, test đơn vị chỉ kiểm chính cái mock vừa dựng.

Người dùng chốt hướng: nâng tối đa phần có ý nghĩa, không ép con số bằng test giả.

## Việc đã làm

Bổ sung test cho **33 file logic thuần**, chia 6 cụm:

- **5 bộ chạy mã** (`codeRunner`, `pythonRunner`, `jsRunner`, `sqlRunner`,
  `pageWorkerRunner`) — 64 test, cả 5 đạt 100% cả 4 chỉ số.
- **7 file lib tiến độ lập trình** (`programmingSpecProgress`, `programmingPathProgress`,
  `programmingPathArtifacts`, `friends`, `onboarding`, `subjectsHost`,
  `useProgrammingLesson`) — 108 test, cả 7 đạt 100%.
- **6 handler API trụ Learning** (`memory-palace`, `metacognitive-reflection`,
  `stem-scratchpad`, `debate-arena`, `socratic-diagnostics`, `vision-solve`) — 85 test,
  cả 6 đạt 100%.
- **4 file điều hướng/UI thuần** (`navPaths`, `cardStyles`, `useActiveSection`,
  `useQuizKeyboard`) — 55 test, cả 4 đạt 100%.
- **2 file dữ liệu hoá học** (`periodicTable`, `solubilityTable`) — 24 test, 100%.
- **5 trình mô phỏng** (`bashSim`, `gitSim`, `hermesSim`, `openclawSim`, `vibeSim`) —
  353 test. Stmts/Funcs/Lines đạt 100% cả 5; branches 92,87–98,84% (phần còn lại là
  mã chết, xem mục dưới).

Hai file test đổi đuôi `.ts` → `.tsx` vì thêm test hook dùng JSX:
`apps/dhcb/src/lib/onboarding.test.tsx`, `packages/core-ui/useQuizKeyboard.test.tsx`.

## Lỗi THẬT phát hiện được nhờ đợt này

`packages/core-ai/memoryPalaceService.ts` sinh id bằng `Date.now()`:

```
const roomId = `room-${params.theme}-${Date.now()}`
id: `locus-${params.theme}-${i + 1}-${Date.now()}`
```

Phòng mặc định và phòng người dùng vừa tạo có **cùng theme** và được tạo trong **cùng
một lời gọi handler**, nên rơi vào cùng một mili-giây là chuyện thường. Khi đó hai phòng
mang **id trùng nhau**, `find(r => r.id === roomId)` khớp nhầm phòng mặc định, và API trả
**404 "Locus anchor not found"** cho một locus có thật.

Đây là lỗi trong mã sản phẩm, không phải lỗi test. Nó ẩn được lâu vì chỉ lộ ra khi nhịp
thời gian đổi — test mới chỉ đỏ khi chạy dưới lớp đo coverage.

**Bản vá:** đổi sang `randomUUID()` từ `node:crypto`, đúng quy ước đã dùng ở các service
khác cùng gói (`audioCoLearningService`, `coLearningRoomService`,
`acousticPhoneticsService`…). Đã quét toàn repo, không còn chỗ nào khác dùng
`Date.now()` làm id.

## Mã chết phát hiện được (CHƯA xoá — cần người dùng quyết)

Các nhóm đã soát thủ công từng dòng và xác nhận là mã không thể chạm tới, thay vì viết
test giả để ép con số:

- `bashSim.ts`: dòng 95, 290, 560(×2), 569, 571, 1148, 1220, 1390
- `gitSim.ts`: 18 nhánh (110, 124, 215, 262, 296, 322-324, 374, 519, 533, 597, 606,
  800, 918-921, 1000…)
- `hermesSim.ts`: 122, 175, 357 · `openclawSim.ts`: 135, 168, 560 · `vibeSim.ts`: 111, 389
- Vài nhánh `?? ''` và `err instanceof Error ? … : String(err)` trong các handler API
  trụ Learning — chỉ phủ được bằng cách cấy dữ liệu hỏng thẳng vào mock, tức không có
  đường đi thật nào tạo ra trạng thái đó.

Xoá chúng làm code gọn hơn nhưng bỏ mất lưới an toàn nếu bất biến xung quanh đổi sau này.
**Đề xuất tách một đợt riêng để quyết**, không gộp vào đợt test này.

## Siết sàn coverage

`vitest.config.ts`: 95/90/94/95 → **97/93/96/97** (số chốt SAU khi gộp PR #855, chừa
1,3–1,7 điểm biên độ theo đúng quy ước "đo cao hơn sàn nhiều thì siết theo"). Kèm comment
ghi nhận cả ba đợt và giải thích vì sao KHÔNG đặt sàn 100.

## Xung đột với PR #855 và một test SAI bị bắt tại chỗ

Đợt này chạy **song song** với PR #855 (542 test nhắm 18 file phủ thấp nhất) trên hai
nhánh khác nhau. Khi gộp `main` có hai loại xung đột:

1. **Xung đột văn bản** ở `vitest.config.ts` — cả hai cùng siết ngưỡng. Giải bằng cách
   giữ comment ghi nhận cả ba đợt rồi **đo lại số thật sau khi gộp**, không chọn bừa số
   của bên nào.
2. **Xung đột NGỮ NGHĨA mà git không báo** — nguy hiểm hơn nhiều. Test
   `find ngay tại thư mục gốc "/"` của đợt này khẳng định `find /` chỉ trả về `/`. Nhưng
   đó là **hành vi LỖI**: bản cũ ghép tiền tố thành `//` nên không khoá nào khớp. PR #855
   đã vá đúng lỗi đó, nên test của đợt này đang **khoá một cái bug lại làm chuẩn**.

Nguyên nhân gốc: agent viết test cho `bashSim` đã liệt dòng 1220 vào danh sách "mã chết"
và suy ra hành vi quan sát được là bất biến đúng, thay vì đối chiếu xem nó CÓ ĐÚNG không.
**Bài học: "nhánh không chạm tới được" và "nhánh đúng" là hai chuyện khác nhau** — một
nhánh chết có thể chết chính vì mã quanh nó sai. Đã sửa test theo hành vi đúng
(`/
/home
/home/ban
`).

Điều này cũng có nghĩa danh sách mã chết ở mục trên **cần soát lại từng dòng trước khi
xoá**, không xoá hàng loạt.

## Bằng chứng kiểm chứng (đo thật, máy rảnh, TRÊN KẾT QUẢ ĐÃ GỘP `main`)

```
Test Files  573 passed (573)
Statements : 98.32% ( 121462/123535 )
Branches   : 94.53% (  15944/16866  )
Functions  : 97.69% (   2412/2469   )
Lines      : 98.32% ( 121462/123535 )
```

Số của riêng nhánh này trước khi gộp: 97,79 / 92,09 / 96,98 / 97,79
(xuất phát 96,36 / 90,71 / 95,19 / 96,36).

Cổng: Build ✅ · Typecheck ✅ · Lint ✅ (0 cảnh báo) · Format ✅ · Test ✅ (568/568).

## Ghi chú vận hành

Trong lúc làm, `npm run test:coverage` có lúc chết vì hết bộ nhớ (`FATAL ERROR:
AlignedAlloc`, `Channel closed`, `ENOENT coverage/.tmp`). **Đã truy nguyên: chỉ do 6
agent nền chạy song song tranh RAM, KHÔNG phải vấn đề của bộ test hay của CI.** Chạy lại
lúc máy rảnh với heap mặc định: xanh, exit 0. Vì vậy **không** đổi `NODE_OPTIONS`, không
thêm wrapper, không đụng `ci.yml`.
