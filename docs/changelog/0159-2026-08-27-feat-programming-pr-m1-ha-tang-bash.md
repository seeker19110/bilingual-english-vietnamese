# feat(programming): PR-M1 — hạ tầng dòng lệnh `bash` (bashSim + runner + cổng chấm) (2026-08-27)

**Đặc tả:** `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md` §4 · §3.3 · §3.4
(hiến chương chương trình M, PR-M0 = đợt 0158)

Đợt này là **PR-M1**, PR hạ tầng đầu tiên của chương trình M: dựng bộ chạy dòng lệnh để tầng 1
có **bộ chạy chấm được** trước khi soạn một bài nội dung nào (PR-M2 mới soạn `p3-u11`). Thứ tự
này là chủ đích của hiến chương §8 — hạ tầng trước nội dung, rẻ trước đắt.

## Đã làm

- **`packages/subject-programming/bashSim.ts` (1.414 dòng)** — máy ảo shell thuần TypeScript:
  hệ thống file trong bộ nhớ, thư mục hiện tại, biến, mã thoát. Đúng khuôn `gitSim.ts` đã chạy
  thật từ PR-L9, kể cả cơ chế `lenhChuanBi` (dựng bối cảnh đề bài, chạy im lặng).
  - **Đủ tập lệnh hiến chương §4 bắt buộc phủ**: `pwd cd ls mkdir rm cp mv cat echo head tail
grep wc sort uniq cut find chmod` · ống `|` · chuyển hướng `>` `>>` · biến và `$(...)` ·
    `&&` `||` · mã thoát `$?` · vòng `for` · `if`/`elif`/`else` · chạy script `.sh`. Thêm
    `touch`, `test`/`[`, `true`, `false`, `exit`, `bash`/`sh` vì `if` và `.sh` không dạy được
    nếu thiếu.
  - **Tất định tuyệt đối**: không `Date.now()`, không random, không đồng hồ (`date` bị từ chối
    KÈM lý do — chính vì phải tất định mới chấm được).
  - **Hai trần cứng** chặn treo trình duyệt: 20.000 lệnh/lượt và 200.000 ký tự output.
- **`apps/dhcb/src/lib/bashRunner.ts`** — không cần Worker, cùng lý do với `gitRunner`: không
  có code học viên được thực thi, chỉ duyệt một cây lệnh hữu hạn đã có trần.
- **Đăng ký ngôn ngữ `bash`** ở đúng bốn chỗ một ngôn ngữ mới phải có mặt: `LESSON_LANGUAGES`
  (schema Zod), `codeRunner.ts` (điểm vào duy nhất chọn bộ chạy), `LangBadge.tsx` (huy hiệu,
  có cờ `simulated`), và trang bài học (nhãn "Chạy thử các lệnh" / "Ô gõ lệnh bài tự viết").
  Hai chỗ sau trước đây hard-code `=== 'git'`; nay dùng chung `laBaiDongLenh()` để ngôn ngữ thứ
  ba không phải đi sửa lại từng chỗ.
- **`bashSim.test.ts` (93 test)** — canh ba nhóm bất biến: tất định + sạch giữa các lượt · tự
  khai · đủ tập lệnh.
- **`lessonsBash.test.ts`** — cổng nội dung dựng SẴN, tuy PR này chưa có bài nào. Lý do ở ngay
  đầu file: hiến chương §0.1 ghi rằng 6/8 ngôn ngữ của đặc tả gốc chỉ tồn tại dưới dạng một
  dòng chữ **vì không có cổng nào chấm chúng**. Dựng cổng trước thì bài đầu tiên của PR-M2 bị
  chấm ngay từ commit đầu.

## Quyết định kèm theo

**Lệnh lỗi giữa chừng KHÔNG dừng script** — khác `gitSim` (ở đó gõ sai là dừng hẳn, vì các lệnh
git sau đó vô nghĩa). Bash thật chạy tiếp, và tầng 1 dạy chính `$?`/`&&`/`||` nên phải giữ đúng
ngữ nghĩa đó. Bù lại: `error` của kết quả chỉ được đặt khi **mã thoát CUỐI CÙNG khác 0** — đúng
nghĩa "script này thất bại", và đó là thứ bộ chấm dùng.

**FS của `bash` tách riêng với FS của `gitSim`** (hiến chương §4, §9) — `git` trong bộ chạy bash
bị từ chối kèm lời chỉ sang đúng unit P3-U10/U11. Gộp hai thế giới là PR riêng, sau khi cả hai
chạy ổn.

**Luật tự khai (§3.3) đã cài vào engine, không để nội dung tự nhớ**: mỗi lượt chạy in dòng
`[GIA LAP] Bo chay bash rut gon cua DHCB — khong phai bash that.` ở dòng đầu, và mọi lệnh không
mô phỏng được (`sudo curl wget ssh sed awk ps kill date man`) đều **nói thẳng vì sao không chạy
được kèm nó làm gì ngoài đời**, thay vì giả vờ thành công hay báo "không tìm thấy lệnh".

**Thông báo lỗi kèm SỐ DÒNG của học viên và viết bằng tiếng Việt** (§3.4) — đây là chỗ bộ chạy
tự viết hơn hẳn shell thật với người mới. Ví dụ thật: `rm -rf /` không im lặng từ chối mà giải
thích ngoài đời lệnh đó phá huỷ cả máy; `./chao.sh` chưa `chmod +x` thì nhắc đúng lệnh cần gõ.

## Khác biệt đã biết so với bash thật (ghi ở đầu `bashSim.ts`, §3.3 luật 5)

1. `grep` dùng regex kiểu JavaScript, không phải BRE/ERE của GNU grep (pattern hỏng thì lùi về
   so khớp chuỗi con).
2. `wc` in các số cách nhau một dấu cách, không căn lề theo cột.
3. Script `.sh` chạy chung biến với shell gọi nó (bash thật tạo tiến trình con).
4. Thông báo lỗi bằng tiếng Việt kèm số dòng — cố ý khác, vì lý do sư phạm ở trên.

Bài nào chạm tới bốn điểm này (PR-M2 trở đi) phải nói ra, đúng luật.

## Bằng chứng kiểm chứng (chạy thật trong phiên này)

| Cổng                     | Kết quả                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`      | ✅ xanh (4 project)                                                                                                          |
| `npm run lint`           | ✅ 0 cảnh báo                                                                                                                |
| `npx prettier --check .` | ✅ All matched files use Prettier code style                                                                                 |
| `npm test`               | ✅ **467 file / 6.140 test** xanh (trong đó 93 test mới của `bashSim`)                                                       |
| `npm run build`          | ✅ xanh (app + hub + server)                                                                                                 |
| `npm run budget`         | ✅ Initial JS 124,03/140 kB · CSS 15,87/18 kB — **không đổi** (bộ chạy nằm trong chunk trang bài học, không đụng Initial JS) |
| `npm run test:coverage`  | ✅ branches **90,72%** / sàn 90 — **cao hơn trước PR** (90,17%)                                                              |

**Ghi lại vì đây là chỗ suýt làm CI đỏ:** bản test đầu tiên (56 ca) chỉ phủ 82,5% nhánh của
`bashSim.ts`, kéo branches TOÀN DỰ ÁN xuống **89,69% — dưới sàn 90**. Đúng thứ nợ kỹ thuật số 7
ở `PROGRESS.md` đã cảnh báo (biên coverage chỉ còn 0,17 điểm). Đã bù bằng 37 ca biên nữa (mỗi ca
là một đường học viên thật đi: gõ thiếu tham số, nhầm file với thư mục, cờ viết dạng khác), đưa
file lên **97,81% nhánh** và biên chung lên 0,72 điểm.

## Việc tiếp theo

**PR-M2** — nội dung `p3-u11` mở rộng từ 1 → 4 bài dòng lệnh (hiến chương §6). Cổng
`lessonsBash.test.ts` đã chờ sẵn; mỗi bài mới phải có mục "bộ chạy này KHÔNG làm gì" và 2–4 thẻ
SRS (`srsCards.test.ts` canh chuẩn 195 thẻ).
