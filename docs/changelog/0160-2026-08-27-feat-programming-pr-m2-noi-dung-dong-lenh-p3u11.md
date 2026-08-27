# feat(programming): PR-M2 — ba bài dòng lệnh cho `p3-u11` (2026-08-27)

**Đặc tả:** `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md` §4 · §6 · §7 · §3.3
(hiến chương chương trình M) · nối tiếp PR-M1 (đợt 0159)

Đợt này là **PR-M2**: đổ nội dung lên bộ chạy `bash` mà PR-M1 vừa dựng. Unit `p3-u11` "Công cụ
dev" **từ 1 → 4 bài**, đúng chỗ hiến chương §6 đã xếp (không thêm unit mới vào P3 vì `p3-u12` là
milestone cuối bậc và `curriculum.test.ts` bắt unit cuối bậc phải có `projectStep`).

## Ba bài mới

| Bài         | Dạy gì                                                                                                | Kết bằng                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `p3-u11-l2` | Đi trong cây thư mục: `pwd cd ls mkdir -p cp mv rm -r find` + ký tự đại diện `*`                      | Dựng bộ khung thư mục dự án rồi kiểm bằng `find -type f` / `-type d`                           |
| `p3-u11-l3` | Ống `\|` — dây chuyền lọc: `grep sort uniq -c wc head tail cut`, và **công thức "cái gì nhiều nhất"** | Trả lời ba câu hỏi về một file nhật ký, mỗi câu một dòng lệnh                                  |
| `p3-u11-l4` | Script tự động: biến, `$(...)`, mã thoát `$?`, `&&` `\|\|`, `if`, `for`, `chmod +x`, `$1`             | **MINI-PROJECT của unit** (§7): viết `bao_cao.sh` phân tích nhật ký, cấp quyền chạy rồi gọi nó |

Mỗi bài đủ khuôn 8 bước, có **mục "BỘ CHẠY NÀY KHÔNG LÀM GÌ"** trong phần khái niệm (§3.3 luật
2), bước ⑦ về nhà luôn là **làn C** (gõ đúng chuỗi lệnh đó trên máy thật, và nói rõ máy thật
khác chỗ nào), và **3 thẻ SRS**. Tổng thẻ SRS của môn: 195 → 204.

## Lỗi thiết kế của PR-M1 mà đợt này tìm ra và sửa

Đây là phần đáng ghi nhất của đợt việc.

PR-M1 chốt: "`error` được đặt khi **mã thoát cuối cùng khác 0**" — nghe rất đúng ngữ nghĩa shell.
Nhưng **test trình duyệt của PR-M2 chỉ ra hậu quả thật**: `TestResultList.tsx` coi mọi ca có
`error` là **LỖI HỆ THỐNG** — tô đỏ và **chỉ in `error`, giấu hẳn output**. Mà với bộ chạy bash,
output CHÍNH LÀ chỗ chứa câu tiếng Việt chỉ cách sửa. Học viên gõ `rm bao_cao` (quên `-r`) thì
đáng lẽ đọc được:

> `dong 2: rm: "bao_cao" la thu muc — them "-r" de xoa ca ben trong`

nhưng thực tế chỉ thấy ô đỏ `Script ket thuc voi ma thoat 1`. Vừa **giấu đi thứ đáng giá nhất
của bộ chạy** (§3.4 "lỗi phải nói được" — lý do sư phạm chính đáng thứ hai của cả quyết định tự
viết interpreter), vừa **sai luật N5** của đặc tả UI/UX ("thất bại là bước học bình thường, KHÔNG
phải sự cố; đỏ chỉ dành cho thứ học viên không tự sửa được").

**Đã sửa:** `error` nay CHỈ mang **lỗi động cơ** — cú pháp không phân tích nổi, vượt trần chống
treo, bối cảnh đề bài sai. Mã thoát khác 0 trả về ở `exitCode`, không còn là "sự cố". Bù lại chỗ
nghiêm ngặt bị mất: cổng nội dung thêm luật **code mẫu phải kết thúc với mã thoát 0** — một code
mẫu kết thúc bằng lệnh thất bại gần như luôn là lỗi người soạn, và nó dạy học viên đúng thói quen
xấu là bỏ qua mã thoát.

Bài học cho các PR hạ tầng sau (M3 `swiftsim`, M7 `kotlinsim`): **cổng CI xanh không chứng minh
đường đi trong trình duyệt đúng.** Chỉ có test trình duyệt thật mới bắt được loại lỗi này.

## Đã làm

- `packages/subject-programming/lessons/p3u11.ts` — thêm 3 bài `language: 'bash'`.
- `packages/subject-programming/bashSim.ts` + `apps/dhcb/src/lib/bashRunner.ts` — sửa ngữ nghĩa
  `error` như trên, kèm ghi chú giải thích vì sao đổi.
- `packages/subject-programming/lessonsBash.test.ts` — thêm cổng "mã thoát 0" cho code mẫu.
- `packages/subject-programming/bashSim.test.ts` — thay test cũ bằng hai test chốt ranh giới mới
  (lệnh gõ sai ≠ lỗi hệ thống · lỗi động cơ thì vẫn đặt `error`).
- `e2e/programming-lesson.spec.ts` — **2 test trình duyệt** cho mạch bash, đúng tiền lệ bài Git:
  code mẫu đạt hết test-case + huy hiệu tự khai "mô phỏng"; và gõ sai thì thông báo dạy được
  **tới được mắt học viên** (chính test này bắt ra lỗi ở trên).

## Bằng chứng kiểm chứng (chạy thật trong phiên này)

| Cổng                                      | Kết quả                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| `npm run typecheck`                       | ✅ xanh (4 project)                                           |
| `npm run lint`                            | ✅ 0 cảnh báo                                                 |
| `npx prettier --check .`                  | ✅ All matched files use Prettier code style                  |
| `npm test`                                | ✅ **6.202 test** xanh (6.177 → 6.202)                        |
| `npm run test:e2e` (2 ca mới, chạy riêng) | ✅ 2 passed (10,9s)                                           |
| `npm run build`                           | ✅ app + hub + server                                         |
| `npm run budget`                          | ✅ Initial JS 124,03/140 kB · CSS 15,87/18 kB — **không đổi** |
| `npm run test:coverage`                   | ✅ branches 90,72% / sàn 90                                   |

## Việc tiếp theo

**PR-M3** — hạ tầng `swiftsim` (interpreter tập con Swift + bộ test đối chiếu). Đây là PR **đắt
nhất** của chương trình M, và có **cổng cứng §8**: interpreter phải qua bộ test đối chiếu TRƯỚC
khi soạn bài nội dung nào. Nhớ bài học ở trên: kèm test trình duyệt ngay từ PR hạ tầng nếu đã có
bài để chạy, đừng đợi PR nội dung mới phát hiện đường đi hỏng.
