# feat(programming): bài học 8 bước cho chặng S1 hướng Backend (2026-08-27)

**Nhánh:** `claude/check-next-tasks-5ia6r2`

## Bối cảnh

`stageUnits.ts` mới nối **3/52 chặng** với bài học thật (`web-s1`, `architecture-s1`, `web-s4`).
Đợt này thêm chặng thứ tư: **`backend-s1`**, phủ đủ **4/4 module** của chặng bằng 6 bài học 8
bước trong 3 unit mới.

## Việc phát sinh CHẶN NGAY TỪ ĐẦU — dải mã unit chưa được cấp

Bắt tay soạn bài đầu tiên thì không biết đặt mã unit nào, vì bảng "CHỐT CỨNG" của
`docs/specs/2026-08-27-chang-s4-13-huong.md` chia hết dải mà **quên chỗ cho S1 của 11 hướng
còn lại**:

| Dải             | Dùng cho                                       |
| --------------- | ---------------------------------------------- |
| `p6-u5…u15`     | CHƯƠNG TRÌNH M giữ chỗ                         |
| `p6-u16…u21`    | S1 của **chỉ hai hướng** `web`, `architecture` |
| `p6-u22…u60`    | S4 của **cả 13 hướng**                         |
| `p6-u61` trở đi | ghi "để dành cho **S2/S3**"                    |

Không dải nào cho S1 của 11 hướng kia. Đây là thiếu sót của bảng gốc, chỉ lộ ra khi soạn bài
thật — đúng loại lỗi mà một đặc tả tự nhận "chốt cứng" dễ mắc: nó chốt phần đang làm và quên
phần chưa làm.

**Đã vá:** `p6-u61…u93` là S1 của 11 hướng còn lại (11 × 3), **S2/S3 dời xuống `p6-u94`**.
Đặc tả mới: `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`; dòng lạc hậu trong đặc
tả S4 đã đính chính tại chỗ. **Không mã nào đã phát hành bị đổi**, nên không khoá tiến độ
Postgres nào bị ảnh hưởng — dải `u61+` trước đó mới chỉ được ĐỂ DÀNH chứ chưa unit nào dùng.

## Đã làm

**Sáu bài học 8 bước, làn `typescript`** (hợp đồng API là chuyện kiểu dữ liệu, nên để trình
biên dịch tham gia dạy là đúng chỗ; cổng `lessonsTs.test.ts` chạy tsc thật nên code mẫu không
trôi được):

| Unit     | Bài                                                | Module                 |
| -------- | -------------------------------------------------- | ---------------------- |
| `p6-u61` | l1 Mã trạng thái HTTP · l2 Phân trang bằng con trỏ | `backend-s1-m1`        |
| `p6-u62` | l1 Kiểm ở biên · l2 Lũy đẳng và tiền số nguyên     | `backend-s1-m2`        |
| `p6-u63` | l1 Ba nhóm lỗi và log lần ra được · l2 Tắt êm      | `backend-s1-m3` · `m4` |

Mỗi bài đủ tám bước: móc thực tế · lý thuyết · ví dụ mẫu chạy được · Predict · Parsons · Make
(4 ca chấm, có ca ẩn) · bài về nhà · 4 thẻ SRS. Tổng **24 thẻ SRS** mới.

Nối chặng: `stageUnits.ts` thêm `'backend-s1': ['p6-u61','p6-u62','p6-u63']` — trang chi tiết
hướng nay hiện khối "Vào học chặng này" cho `backend-s1`.

## Quyết định nội dung đáng ghi

- **Mỗi bài bám vào một cách hỏng CÓ THẬT, không bám danh mục khái niệm.** l1-u61 là "giám sát
  báo 0% lỗi trong khi người dùng kêu"; l2-u61 là "một mục hiện hai lần, một mục biến mất";
  l2-u62 là "bấm hai lần trừ tiền hai lần". Học viên nhớ được câu chuyện trước rồi mới nhớ luật.
- **Bài log dạy RANH GIỚI trước, cú pháp sau.** Phần khó của log không phải định dạng JSON mà là
  câu hỏi "ai bị đánh thức". Bài Predict dựng đúng cảnh 4.000 dòng người-dùng-gõ-sai làm nổ cảnh
  báo và khiến đội trực tắt nó đi — hậu quả thật, không phải lời khuyên chung.
- **Bài tắt êm dạy `conSong()` phải trả `true` TRONG LÚC đang tắt.** Đây là chỗ trực giác đánh
  lừa mạnh nhất: viết `=== "chay"` trông hợp lý nhưng làm bộ điều phối giết tiến trình đúng lúc
  nó đang chờ việc dở xong. Ca chấm ẩn canh đúng điểm đó.
- **Che dữ liệu nhạy cảm đặt TẠI HÀM GHI LOG**, và bài nói thẳng lý do: trông vào việc mỗi người
  gọi tự nhớ thì sẽ có người quên.

## Bài học kỹ thuật (đều là lỗi tôi tự dính rồi tự sửa)

1. **Làn TypeScript KHÔNG có `input()`.** Bài TS lấy dữ liệu từ hằng trong chính code, mỗi ca
   chấm soi một dòng output khác nhau — khác hẳn làn JavaScript/Python. Bản đầu tôi bê khuôn
   `input()` sang và tsc báo `TS2552 Cannot find name 'input'`.
2. **Lựa chọn Predict không được là TIỀN TỐ của đáp án đúng.** Cổng kiểm "không lựa chọn sai nào
   khớp output", mà `"...: 12"` thì chứa `"...: 1"`. Tôi đã tự nhắc mình điều này rồi vẫn dính ở
   bài cuối — cổng bắt được.
3. **`srsCards` tối đa 4 thẻ** (Zod), bản đầu viết 5.

## Bằng chứng kiểm chứng

- `npm test` — **497 file, 7.487 test, toàn bộ xanh**.
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run format:check` · `npm run build` — sạch.
- Coverage: Stmts 95,18% · **Branch 90,29%** (sàn 90, không đổi so với trước đợt) · Funcs 95,34%.
- `npm run budget`: Initial JS 124,86/140 kB · CSS 16,23/18 kB.
- Cổng `lessonsTs.test.ts` chạy **tsc thật** trên cả 6 code mẫu và cả 6 đoạn Predict.

## Việc để ngỏ (cố ý)

- **10 hướng còn lại trong bảng dải mới chưa soạn bài nào** (`data-s1` là mục kế tiếp).
- Bốn hướng `game`, `embedded`, `desktop` và phần lớn `systems` **không có bộ chạy trong trình
  duyệt** — sẽ cần quyết định riêng về làn trước khi soạn, cố ý xếp cuối bảng và không hứa trước.
- Chưa nối tiến độ chặng với tiến độ bài học (đánh dấu chặng vẫn là thao tác tay).
