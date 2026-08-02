# Danh mục truyện cho trang NGHE — 6 thể loại × 20 truyện · 2026-08-01

> Bổ sung cho `docs/research/dac-ta-trang-nghe-2026-08-01.md` (đặc tả kỹ thuật vẫn giữ nguyên).
> Chốt phạm vi ngày 2026-08-01: **6 thể loại, mỗi thể loại 20 truyện = 120 truyện**.
> Nhịp làm: **mỗi PR ~10 truyện**.

## 1. Nguyên tắc nội dung (chốt 2026-08-01)

1. **Bản tiếng Anh lấy NGUYÊN VĂN** từ bản public domain đã tải thật về từ Project Gutenberg —
   không diễn đạt lại, không rút gọn, không gõ từ trí nhớ. Chỉ được phép: tách câu và gom câu
   thành đoạn (`p`), chuẩn hoá dấu nháy cong → thẳng.
2. **Bản tiếng Việt do Opus dịch tay, chất lượng văn học cao nhất** — dịch nghĩa trọn vẹn, giữ
   giọng kể cổ tích, không dịch máy, không chép bản dịch đang lưu hành (còn bản quyền).
3. Truyện dân gian Việt Nam: không có bản PD tiếng Anh → Opus kể lại bằng lời văn riêng theo cốt
   truyện dân gian rồi tự dịch sang tiếng Anh.
4. Mỗi truyện ghi rõ `source.en` (tên sách + người dịch + năm) và `source.enUrl` (URL Gutenberg
   đã tải thật) — nghĩa vụ ghi công, hiển thị trong màn đọc truyện.

## 2. Kho nguồn public domain — ĐÃ TẢI VÀ KIỂM CHỨNG THẬT (2026-08-01)

Tất cả các ID dưới đây đã `curl` về HTTP 200 và **đã đọc mục lục thật** trong phiên này.

| PG ID   | Sách                                                                          | Người dịch / kể       | Năm     | Dùng cho thể loại   |
| ------- | ----------------------------------------------------------------------------- | --------------------- | ------- | ------------------- |
| `21`    | Aesop's Fables (Three Hundred Aesop's Fables)                                 | George Fyler Townsend | 1867    | Ngụ ngôn            |
| `62514` | Jataka Tales                                                                  | Ellen C. Babbitt      | 1912    | Ngụ ngôn            |
| `7518`  | More Jataka Tales                                                             | Ellen C. Babbitt      | 1922    | Ngụ ngôn            |
| `7128`  | Indian Fairy Tales                                                            | Joseph Jacobs         | 1892    | Ngụ ngôn / Cổ tích  |
| `5314`  | Household Tales (Grimm)                                                       | Margaret Hunt         | 1884    | Cổ tích             |
| `27200` | Fairy Tales of Hans Christian Andersen                                        | H. P. Paull           | 1872    | Cổ tích             |
| `1597`  | Andersen's Fairy Tales                                                        | H. P. Paull           | 1872    | Cổ tích             |
| `503`   | The Blue Fairy Book                                                           | Andrew Lang           | 1889    | Cổ tích             |
| `7439`  | English Fairy Tales                                                           | Joseph Jacobs         | 1890    | Cổ tích             |
| `4018`  | Japanese Fairy Tales                                                          | Yei Theodora Ozaki    | 1903    | Cổ tích             |
| `3327`  | Bulfinch's Mythology: The Age of Fable                                        | Thomas Bulfinch       | 1855    | Thần thoại          |
| `24737` | The Children of Odin                                                          | Padraic Colum         | 1920    | Thần thoại          |
| `677`   | The Heroes; or, Greek Fairy Tales                                             | Charles Kingsley      | 1856    | Thần thoại          |
| `16244` | The Turkish Jester (Nasr-Eddin Hoja)                                          | George Borrow         | 1884    | Truyện cười         |
| `2781`  | Just So Stories                                                               | Rudyard Kipling       | 1902    | Thiếu nhi kinh điển |
| Potter  | 14838 · 14407 · 14872 · 14814 · 14837 · 15137 · 15077 · 14220 · 17089 · 15284 | Beatrix Potter        | 1902–18 | Thiếu nhi kinh điển |

> ⚠️ **Lưu ý đã phát hiện khi kiểm chứng:**
>
> - `The Monkey and the Crocodile` **KHÔNG** nằm trong Indian Fairy Tales của Jacobs (đặc tả cũ
>   ghi sai). Nguồn đúng: **PG 62514, truyện I** — đã xác nhận trong mục lục.
> - `The Ugly Duckling` **KHÔNG** có trong PG 1597. Nguồn đúng: **PG 27200** (cùng người dịch
>   H. P. Paull) — đã xác nhận ở dòng 177 mục lục.
> - Không dùng `Uncle Remus` (Joel Chandler Harris): văn bản viết theo phương ngữ nặng
>   (eye-dialect), sai chính tả có chủ ý → hại cho người học nghe và cho TTS. Loại khỏi danh mục.

## 3. Thể loại 1 — Truyện cổ tích (`kind: "fairy-tale"`)

> ## ✅ **HOÀN TẤT 20/20 (2026-08-02)** — thể loại `fairy-tale` đã soạn xong toàn bộ.
>
> Đợt cuối bổ sung #15–20: Jacobs PG 7439 (Jack và cây đậu thần, Ba chú lợn con, Ba chú gấu) +
> Ozaki PG 4018 (Chim sẻ bị cắt lưỡi, Chàng Urashima Taro, Momotaro).
>
> ⚠️ **Đính chính (2026-08-02):** ghi chú trước đó ghi "12/20" là SAI — đếm thật lúc ấy chỉ có 11
> file `ft-*.json`. Từ nay khi cập nhật tiến độ phải **đếm file thật** (`ls raw/ft-*.json | wc -l`)
> chứ không cộng nhẩm.

| #   | id                      | Tiếng Anh                                    | Tiếng Việt                  | Nước        | Nguồn        | Cấp |
| --- | ----------------------- | -------------------------------------------- | --------------------------- | ----------- | ------------ | --- |
| 1   | `ft-tam-cam`            | Tam and Cam                                  | Tấm Cám                     | 🇻🇳 Việt Nam | Opus kể/dịch | B1  |
| 2   | `ft-hansel-gretel`      | Hansel and Grethel                           | Hansel và Gretel            | 🇩🇪 Đức      | PG 5314      | B1  |
| 3   | `ft-cinderella`         | Cinderella                                   | Cô bé Lọ Lem                | 🇩🇪 Đức      | PG 5314      | B1  |
| 4   | `ft-little-red-cap`     | Little Red-Cap                               | Cô bé quàng khăn đỏ         | 🇩🇪 Đức      | PG 5314      | A2  |
| 5   | `ft-snow-white`         | Little Snow-white                            | Nàng Bạch Tuyết             | 🇩🇪 Đức      | PG 5314      | B1  |
| 6   | `ft-rumpelstiltzkin`    | Rumpelstiltzkin                              | Chàng lùn tinh quái         | 🇩🇪 Đức      | PG 503       | B1  |
| 7   | `ft-ugly-duckling`      | The Ugly Duckling                            | Chú vịt con xấu xí          | 🇩🇰 Đan Mạch | PG 27200     | B1  |
| 8   | `ft-little-mermaid`     | The Little Mermaid                           | Nàng tiên cá                | 🇩🇰 Đan Mạch | PG 27200     | B2  |
| 9   | `ft-thumbelina`         | Little Tiny or Thumbelina                    | Cô bé tí hon                | 🇩🇰 Đan Mạch | PG 27200     | B1  |
| 10  | `ft-emperor-clothes`    | The Emperor's New Clothes                    | Bộ quần áo mới của hoàng đế | 🇩🇰 Đan Mạch | PG 1597      | A2  |
| 11  | `ft-match-girl`         | The Little Match Girl                        | Cô bé bán diêm              | 🇩🇰 Đan Mạch | PG 1597      | A2  |
| 12  | `ft-sleeping-beauty`    | The Sleeping Beauty in the Wood              | Người đẹp ngủ trong rừng    | 🇫🇷 Pháp     | PG 503       | B1  |
| 13  | `ft-puss-in-boots`      | The Master Cat; or, Puss in Boots            | Mèo đi hia                  | 🇫🇷 Pháp     | PG 503       | B1  |
| 14  | `ft-beauty-beast`       | Beauty and the Beast                         | Người đẹp và quái vật       | 🇫🇷 Pháp     | PG 503       | B2  |
| 15  | `ft-jack-beanstalk`     | Jack and the Beanstalk                       | Jack và cây đậu thần        | 🇬🇧 Anh      | PG 7439      | A2  |
| 16  | `ft-three-little-pigs`  | The Story of the Three Little Pigs           | Ba chú lợn con              | 🇬🇧 Anh      | PG 7439      | A2  |
| 17  | `ft-three-bears`        | The Story of the Three Bears                 | Ba chú gấu                  | 🇬🇧 Anh      | PG 7439      | A2  |
| 18  | `ft-momotaro`           | Momotaro, or the Story of the Son of a Peach | Momotaro — cậu bé quả đào   | 🇯🇵 Nhật     | PG 4018      | B1  |
| 19  | `ft-urashima-taro`      | The Story of Urashima Taro                   | Chàng Urashima Taro         | 🇯🇵 Nhật     | PG 4018      | B1  |
| 20  | `ft-tongue-cut-sparrow` | The Tongue-Cut Sparrow                       | Chim sẻ bị cắt lưỡi         | 🇯🇵 Nhật     | PG 4018      | A2  |

## 4. Thể loại 2 — Truyện ngụ ngôn (`kind: "fable"`)

> ## ✅ **HOÀN TẤT 20/20 (2026-08-02)** — thể loại `fable` đã soạn xong toàn bộ.
>
> Đợt cuối bổ sung 14 truyện Jataka (PG 62514 + PG 7518). Tổng độ dài EN của thể loại: 9.789 từ,
> trung bình 489 từ/truyện (bản Aesop cũ chỉ ~94 từ/truyện).

> **📌 Ghi chú độ dài — chốt 2026-08-01 sau khi đo độ dài thật:**
>
> Đã đo 7 truyện đầu tiên: ngụ ngôn Aesop nguyên văn CỰC NGẮN — `fb-fox-grapes` 56 từ (~20 giây
> nghe), `fb-boy-cried-wolf` 98 từ, `fb-tortoise-hare` 128 từ. Đây là ĐÚNG bản Townsend 1867,
> không phải lỗi — nhưng quá ngắn cho một "thư viện nghe".
>
> **Chủ dự án đã chốt: ƯU TIÊN NGUỒN DÀI HƠN.** Nguyên tắc cho mọi đợt sau:
>
> 1. Mỗi truyện nên **≥ 400 từ tiếng Anh** (~1,5 phút nghe trở lên). Dưới 200 từ thì cân nhắc bỏ.
> 2. Ưu tiên Jataka (PG 62514 / 7518, ~400–800 từ), Grimm (PG 5314), Andersen (PG 27200),
>    Just So Stories (PG 2781), Beatrix Potter — đều dài hơn Aesop nhiều lần.
> 3. Giảm tỷ trọng Aesop (PG 21) xuống, **chỉ giữ các truyện Aesop DÀI**.
>
> **✅ ĐÃ XỬ LÝ 2026-08-02.** Đã `curl` mục lục thật PG 62514 / 7518 / 7128, đo `wc -w` từng
> truyện rồi thay 4 mục (bảng dưới đã cập nhật):
>
> | Mục cũ                       | Lý do bỏ                           | Mục mới thay vào                      | Từ EN |
> | ---------------------------- | ---------------------------------- | ------------------------------------- | ----- |
> | `fb-boys-frogs` (Aesop)      | quá ngắn (< 200 từ)                | `fb-ox-won-forfeit` (PG 62514)        | 504   |
> | `fb-walnut-tree` (Aesop)     | quá ngắn (< 200 từ)                | `fb-stolen-plow` (PG 7518)            | 489   |
> | `fb-charcoal-fuller` (Aesop) | quá ngắn (< 200 từ)                | `fb-woodpecker-turtle-deer` (PG 7518) | 717   |
> | `fb-cruel-crane` (PG 7128)   | **TRÙNG NỘI DUNG** `fb-crab-crane` | `fb-prince-wicked` (PG 7518)          | 1.692 |
>
> Lưu ý cho phiên sau: "The Cruel Crane Outwitted" (Jacobs, PG 7128) và "The Crab and the Crane"
> (Babbitt, PG 62514) là **cùng một tích Jataka**, chỉ khác người kể lại — khi chọn truyện từ
> nhiều tuyển tập Jataka phải đối chiếu nội dung, không chỉ đối chiếu tên.
>
> Ngoài ra `ft-tam-cam` đã được viết lại dày hơn (976 → ~2.100 từ EN) vì bản đầu kể quá gọn.

| #   | id                          | Tiếng Anh                              | Tiếng Việt                               | Nước        | Nguồn    | Cấp |
| --- | --------------------------- | -------------------------------------- | ---------------------------------------- | ----------- | -------- | --- |
| 1   | `fb-frog-in-well`           | The Frog in the Well                   | Ếch ngồi đáy giếng                       | 🇻🇳 Việt Nam | Opus     | A2  |
| 2   | `fb-blind-men-elephant`     | The Blind Men and the Elephant         | Thầy bói xem voi                         | 🇻🇳 Việt Nam | Opus     | A2  |
| 3   | `fb-tortoise-hare`          | The Hare and the Tortoise              | Rùa và Thỏ                               | 🇬🇷 Hy Lạp   | PG 21    | A2  |
| 4   | `fb-boy-cried-wolf`         | The Shepherd's Boy and the Wolf        | Cậu bé chăn cừu và con sói               | 🇬🇷 Hy Lạp   | PG 21    | A2  |
| 5   | `fb-fox-grapes`             | The Fox and the Grapes                 | Cáo và chùm nho                          | 🇬🇷 Hy Lạp   | PG 21    | A2  |
| 6   | `fb-ox-won-forfeit`         | The Ox Who Won the Forfeit             | Con Bò thắng cược                        | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 7   | `fb-stolen-plow`            | The Stolen Plow                        | Cái cày bị mất trộm                      | 🇮🇳 Ấn Độ    | PG 7518  | A2  |
| 8   | `fb-woodpecker-turtle-deer` | The Woodpecker, Turtle, and Deer       | Chim gõ kiến, Rùa và Hươu                | 🇮🇳 Ấn Độ    | PG 7518  | A2  |
| 9   | `fb-monkey-crocodile`       | The Monkey and the Crocodile           | Khỉ và Cá sấu                            | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 10  | `fb-turtle-saved-life`      | How the Turtle Saved His Own Life      | Rùa tự cứu mình                          | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 11  | `fb-talkative-turtle`       | The Turtle Who Couldn't Stop Talking   | Rùa nói nhiều                            | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 12  | `fb-sandy-road`             | The Sandy Road                         | Con đường cát                            | 🇮🇳 Ấn Độ    | PG 62514 | B1  |
| 13  | `fb-quarrel-quails`         | The Quarrel of the Quails              | Cuộc cãi vã của bầy chim cút             | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 14  | `fb-timid-rabbit`           | The Foolish, Timid Rabbit              | Chú Thỏ nhút nhát dại dột                | 🇮🇳 Ấn Độ    | PG 62514 | A2  |
| 15  | `fb-banyan-deer`            | The Banyan Deer                        | Vua Hươu cây Đa                          | 🇮🇳 Ấn Độ    | PG 62514 | B1  |
| 16  | `fb-crab-crane`             | The Crab and the Crane                 | Cua và Sếu                               | 🇮🇳 Ấn Độ    | PG 62514 | B1  |
| 17  | `fb-golden-goose`           | The Golden Goose                       | Con ngỗng vàng                           | 🇮🇳 Ấn Độ    | PG 7518  | A2  |
| 18  | `fb-three-fishes`           | The Three Fishes                       | Ba con Cá                                | 🇮🇳 Ấn Độ    | PG 7518  | A2  |
| 19  | `fb-penny-wise-monkey`      | The Penny-Wise Monkey                  | Con Khỉ tham lam                         | 🇮🇳 Ấn Độ    | PG 7518  | A2  |
| 20  | `fb-prince-wicked`          | Prince Wicked and the Grateful Animals | Hoàng tử Độc Ác và những con vật biết ơn | 🇮🇳 Ấn Độ    | PG 7518  | B1  |

## 5. Thể loại 3 — Truyện dân gian Việt Nam (`kind: "vn-folk"`)

Không có bản PD tiếng Anh → **Opus kể lại bằng lời văn riêng + tự dịch sang tiếng Anh**.
Không chép sách giáo khoa hay bản của bất kỳ NXB nào.

> ## ✅ **HOÀN TẤT 20/20 (2026-08-02)** — thể loại `vn-folk` đã soạn xong toàn bộ.
>
> #1–3 soạn ở PR #440; #4–13 và #14–20 soạn trong hai đợt ngày 2026-08-02.
> Độ dài: 497–709 từ EN mỗi truyện (đều vượt ngưỡng ≥400 từ đã chốt ở §4), 22–37 câu song ngữ.
>
> ⚠️ **Đính chính danh mục (2026-08-02) — 3 chỗ sai đã sửa trong bảng dưới:**
>
> 1. Mục #10 cũ `vn-mai-an-tiem` ("Mai An Tiêm on the Island") **trùng nội dung** với #4
>    `vn-su-tich-dua-hau` — Mai An Tiêm chính là nhân vật của sự tích quả dưa hấu, hai dòng là
>    cùng một truyện. Đã **thay bằng `vn-so-dua` (Sọ Dừa)**, giữ nguyên tổng số 20.
> 2. Mục #15 id cũ `vn-tam-that-quy` **không mang nghĩa gì** so với nội dung (Sự tích con muỗi,
>    nhân vật là Ngọc Tâm — Nhan Diệp). Đổi thành `vn-su-tich-con-muoi`.
> 3. Mục #17 id cũ `vn-hai-chi-em-cay-vu-sua` ("hai chị em") **mô tả sai truyện** — đây là chuyện
>    một người mẹ và đứa con trai, không có hai chị em nào. Đổi thành `vn-su-tich-cay-vu-sua`.
>
> 📌 **Vì sao đợt này làm `vn-folk` chứ không phải `fable` như kế hoạch:** 14 truyện `fable` còn
> lại đều cần **nguyên văn Project Gutenberg**, nhưng network policy của phiên chặn
> `gutenberg.org` (403 ở CONNECT, mọi mirror đã thử đều hỏng). CLAUDE.md §5 cấm gõ từ trí nhớ →
> `fable`/`myth`/`humor`/`children` bị chặn cứng. `vn-folk` là thể loại duy nhất không phụ thuộc
> nguồn ngoài (Opus tự kể + tự dịch, theo đúng nguyên tắc §1.3 ở trên).

| #   | id                               | Tiếng Việt              | Tiếng Anh                            | Cấp |
| --- | -------------------------------- | ----------------------- | ------------------------------------ | --- |
| 1   | `vn-son-tinh-thuy-tinh`          | Sơn Tinh — Thủy Tinh    | The Mountain God and the Water God   | B1  |
| 2   | `vn-banh-chung-banh-giay`        | Bánh chưng bánh giầy    | The Square Cake and the Round Cake   | A2  |
| 3   | `vn-thanh-giong`                 | Thánh Gióng             | The Boy Hero of Phu Dong             | B1  |
| 4   | `vn-su-tich-dua-hau`             | Sự tích quả dưa hấu     | The Legend of the Watermelon         | A2  |
| 5   | `vn-cay-khe`                     | Ăn khế trả vàng         | The Star-Fruit Tree                  | A2  |
| 6   | `vn-cay-tre-tram-dot`            | Cây tre trăm đốt        | The Hundred-Knot Bamboo              | A2  |
| 7   | `vn-thach-sanh`                  | Thạch Sanh              | Thach Sanh the Woodcutter            | B1  |
| 8   | `vn-su-tich-ho-guom`             | Sự tích Hồ Gươm         | The Legend of the Returned Sword     | B1  |
| 9   | `vn-chu-cuoi`                    | Chú Cuội cung trăng     | The Man in the Moon                  | A2  |
| 10  | `vn-so-dua`                      | Sọ Dừa                  | So Dua, the Coconut Boy              | B1  |
| 11  | `vn-con-rong-chau-tien`          | Con Rồng cháu Tiên      | Children of the Dragon and the Fairy | B1  |
| 12  | `vn-trau-cau`                    | Sự tích trầu cau        | The Legend of the Betel and Areca    | B1  |
| 13  | `vn-tro-cuoi-trang-quynh`        | Trạng Quỳnh             | The Clever Scholar Quynh             | B1  |
| 14  | `vn-luu-binh-duong-le`           | Lưu Bình — Dương Lễ     | Two Friends, Luu Binh and Duong Le   | B1  |
| 15  | `vn-su-tich-con-muoi`            | Sự tích con muỗi        | The Legend of the Mosquito           | A2  |
| 16  | `vn-nguoi-con-gai-nam-xuong`     | Người con gái Nam Xương | The Woman of Nam Xuong               | B2  |
| 17  | `vn-su-tich-cay-vu-sua`          | Sự tích cây vú sữa      | The Legend of the Milk-Fruit Tree    | A2  |
| 18  | `vn-su-tich-chim-quoc`           | Sự tích chim quốc       | The Legend of the Quoc Bird          | A2  |
| 19  | `vn-anh-nong-dan-va-ba-dieu-uoc` | Ba điều ước             | The Three Wishes                     | A2  |
| 20  | `vn-tri-khon-cua-ta-day`         | Trí khôn của ta đây     | Here Is My Wisdom                    | A2  |

## 6. Thể loại 4 — Thần thoại (`kind: "myth"`)

> **📌 SỬA DANH MỤC 2026-08-02 — 3 mục Kingsley quá dài, đã tách theo PART.**
>
> Đo nguyên văn PG 677: `my-perseus` **12.068 từ**, Argonauts và Theseus còn dài hơn. Một thẻ
> nghe 12.000 từ ≈ 45–50 phút audio — không dùng được. Danh mục có sàn ≥400 từ (§4) nhưng
> **thiếu trần**, nên chỗ này lọt lưới. Chủ dự án chốt: **tách theo PART có sẵn của Kingsley**
> (không cắt giữa chừng, mỗi PART vốn là một chương trọn vẹn), lấy tiêu đề PART thật trong mục lục.
>
> Số đo từng PART (`wc -w` thật): Perseus I 1.336 · II 3.124 · III 2.709 · IV 3.530 · V 1.367 ·
> Argonauts I 2.699 · II 2.769 · III 1.192 · IV 7.363 · V 7.465 · VI 845 ·
> Theseus I 1.319 · II 7.353 · III 1.522 · IV **789**.
>
> ⚠️ **Đính chính 2026-08-02 (đợt Theseus):** số đo T-IV ghi lần đầu là "3.768 từ" **SAI** — T-IV
> là phần cuối sách nên phép đo đã gộp cả chú thích cuối sách + toàn bộ giấy phép Project
> Gutenberg vào. Nội dung truyện thật chỉ **789 từ** (vẫn trên sàn 400). Bài học: khi đo phần
> CUỐI một sách Gutenberg phải cắt bỏ boilerplate trước, không đo tới hết file.
>
> **Loại** A-IV, A-V, T-II (đều >7.000 từ) và A-VI (845 từ, hụt so với mạch truyện).
> Kingsley chiếm **8 slot** (Perseus trọn 5 phần + Theseus 3 phần I/III/IV — vẫn thành một mạch
> liền: nhấc tảng đá → giết Minotaur → chết vì kiêu ngạo). Argonauts bị bỏ khỏi PG 677 vì các
> phần cốt lõi đều quá dài. Còn lại 12 slot cho Bulfinch (8) + Colum (4).
>
> ⚠️ Hệ quả: **8 thần thoại Bulfinch trong bảng cũ phải cắt** để giữ tổng 20. Nếu chủ dự án muốn
> giữ đủ 16 mục Bulfinch thì phải nâng thể loại `myth` lên >20 truyện — cần quyết định riêng.
>
> Lỗi bản quét đã sửa khi soạn (ghi rõ trong `source.en` từng file): `flail` → `frail` (Perseus I),
> `Perseuss` → `Perseus` (Perseus IV). Các dòng `[Picture: ...]` là chú thích tranh, đã bỏ vì TTS
> sẽ đọc lên thành lời truyện.

| #   | id                    | Tiếng Anh                                                    | Tiếng Việt                             | Nước      | Nguồn   | Cấp | TT  |
| --- | --------------------- | ------------------------------------------------------------ | -------------------------------------- | --------- | ------- | --- | --- |
| 1   | `my-perseus-1`        | Perseus, Part I: How Perseus and His Mother Came to Seriphos | Perseus I: Hai mẹ con dạt vào Seriphos | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 2   | `my-perseus-2`        | Perseus, Part II: How Perseus Vowed a Rash Vow               | Perseus II: Lời thề nông nổi           | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 3   | `my-perseus-3`        | Perseus, Part III: How Perseus Slew the Gorgon               | Perseus III: Chém quái vật Medusa      | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 4   | `my-perseus-4`        | Perseus, Part IV: How Perseus Came to the Æthiops            | Perseus IV: Cứu nàng Andromeda         | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 5   | `my-perseus-5`        | Perseus, Part V: How Perseus Came Home Again                 | Perseus V: Ngày trở về                 | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 6   | `my-theseus-1`        | Theseus, Part I: How Theseus Lifted the Stone                | Theseus I: Nhấc tảng đá                | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 7   | `my-theseus-3`        | Theseus, Part III: How Theseus Slew the Minotaur             | Theseus III: Giết quái vật Minotaur    | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 8   | `my-theseus-4`        | Theseus, Part IV: How Theseus Fell by His Pride              | Theseus IV: Ngã vì kiêu ngạo           | 🇬🇷 Hy Lạp | PG 677  | B2  | ✅  |
| 9   | `my-prometheus`       | Prometheus and Pandora                                       | Prometheus và chiếc hộp Pandora        | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |
| 10  | `my-proserpine`       | Pluto and Proserpine                                         | Pluto và nàng Proserpine               | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |
| 11  | `my-midas`            | Midas                                                        | Vua Midas và bàn tay vàng              | 🇬🇷 Hy Lạp | PG 3327 | B1  | ✅  |
| 12  | `my-daedalus-icarus`  | Daedalus and Icarus                                          | Daedalus và Icarus                     | 🇬🇷 Hy Lạp | PG 3327 | B1  | ✅  |
| 13  | `my-orpheus-eurydice` | Orpheus and Eurydice                                         | Orpheus và Eurydice                    | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |
| 14  | `my-narcissus-echo`   | Echo and Narcissus                                           | Tiếng vọng và chàng Narcissus          | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |
| 15  | `my-cupid-psyche`     | Cupid and Psyche                                             | Cupid và Psyche                        | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |
| 16  | `my-arachne`          | Arachne                                                      | Nàng Arachne dệt vải                   | 🇬🇷 Hy Lạp | PG 3327 | B2  | ⏳  |

| 17 | `my-building-wall` | The Building of the Wall | Bức tường thành Asgard | 🇮🇸 Bắc Âu | PG 24737 | B1 | ⏳ |
| 18 | `my-iduna-apples` | Iduna and Her Apples | Nàng Iduna và những quả táo | 🇮🇸 Bắc Âu | PG 24737 | B1 | ⏳ |
| 19 | `my-sif-golden-hair` | Sif's Golden Hair | Mái tóc vàng của Sif | 🇮🇸 Bắc Âu | PG 24737 | B1 | ⏳ |
| 20 | `my-thor-thrym` | How Thor and Loki Befooled Thrym | Thor và Loki lừa gã khổng lồ Thrym | 🇮🇸 Bắc Âu | PG 24737 | B1 | ⏳ |

**5 mục Bulfinch đã CẮT** để giữ tổng 20 sau khi Kingsley chiếm 8 slot (xem cảnh báo ở trên):
`my-apollo-daphne` · `my-pyramus-thisbe` · `my-phaeton` · `my-baucis-philemon` · `my-pygmalion`.
Nếu chủ dự án muốn giữ lại thì phải nâng `myth` lên >20 truyện.

## 7. Thể loại 5 — Truyện cười / trí khôn dân gian (`kind: "humor"`)

Nasreddin (Thổ Nhĩ Kỳ) trong PG 16244 là **mẩu chuyện rất ngắn, không có tiêu đề** → khi soạn,
mỗi mẩu lấy nguyên văn và **đặt tiêu đề mô tả** (ghi rõ tiêu đề do Opus đặt trong `source.en`).
15 mẩu Nasreddin + 5 truyện cười dân gian Việt Nam (Opus kể).

| #    | id                            | Nội dung                                                | Nước          | Nguồn    | Cấp |
| ---- | ----------------------------- | ------------------------------------------------------- | ------------- | -------- | --- |
| 1–15 | `hm-nasreddin-01…15`          | 15 mẩu Nasreddin Hoja chọn lọc (nguyên văn Borrow 1884) | 🇹🇷 Thổ Nhĩ Kỳ | PG 16244 | A2  |
| 16   | `hm-vn-lon-cuoi`              | Lợn cưới áo mới                                         | 🇻🇳 Việt Nam   | Opus     | A2  |
| 17   | `hm-vn-tam-dai-con-ga`        | Tam đại con gà                                          | 🇻🇳 Việt Nam   | Opus     | A2  |
| 18   | `hm-vn-treo-bien`             | Treo biển                                               | 🇻🇳 Việt Nam   | Opus     | A2  |
| 19   | `hm-vn-thay-boi-xem-voi-cuoi` | Đẽo cày giữa đường                                      | 🇻🇳 Việt Nam   | Opus     | A2  |
| 20   | `hm-vn-mua-kinh`              | Mua kính                                                | 🇻🇳 Việt Nam   | Opus     | A2  |

## 8. Thể loại 6 — Thiếu nhi kinh điển ngắn (`kind: "children"`)

| #   | id                     | Tiếng Anh                         | Tiếng Việt                   | Nguồn    | Cấp |
| --- | ---------------------- | --------------------------------- | ---------------------------- | -------- | --- |
| 1   | `ch-whale-throat`      | How the Whale Got His Throat      | Vì sao cá voi có cổ họng hẹp | PG 2781  | B1  |
| 2   | `ch-camel-hump`        | How the Camel Got His Hump        | Vì sao lạc đà có bướu        | PG 2781  | B1  |
| 3   | `ch-rhinoceros-skin`   | How the Rhinoceros Got His Skin   | Vì sao tê giác có da nhăn    | PG 2781  | B1  |
| 4   | `ch-leopard-spots`     | How the Leopard Got His Spots     | Vì sao báo có đốm            | PG 2781  | B1  |
| 5   | `ch-old-man-kangaroo`  | The Sing-Song of Old Man Kangaroo | Bài ca của lão Kangaroo      | PG 2781  | B1  |
| 6   | `ch-armadillos`        | The Beginning of the Armadillos   | Nguồn gốc loài ta-tu         | PG 2781  | B2  |
| 7   | `ch-first-letter`      | How the First Letter Was Written  | Bức thư đầu tiên             | PG 2781  | B1  |
| 8   | `ch-alphabet`          | How the Alphabet Was Made         | Bảng chữ cái ra đời thế nào  | PG 2781  | B2  |
| 9   | `ch-crab-played-sea`   | The Crab That Played with the Sea | Con cua đùa với biển         | PG 2781  | B2  |
| 10  | `ch-cat-walked`        | The Cat That Walked by Himself    | Con mèo đi một mình          | PG 2781  | B2  |
| 11  | `ch-butterfly-stamped` | The Butterfly That Stamped        | Con bướm giậm chân           | PG 2781  | B2  |
| 12  | `ch-peter-rabbit`      | The Tale of Peter Rabbit          | Chú thỏ Peter                | PG 14838 | A2  |
| 13  | `ch-benjamin-bunny`    | The Tale of Benjamin Bunny        | Chú thỏ Benjamin             | PG 14407 | A2  |
| 14  | `ch-squirrel-nutkin`   | The Tale of Squirrel Nutkin       | Chú sóc Nutkin               | PG 14872 | A2  |
| 15  | `ch-jemima-puddleduck` | The Tale of Jemima Puddle-Duck    | Cô vịt Jemima                | PG 14814 | A2  |
| 16  | `ch-tom-kitten`        | The Tale of Tom Kitten            | Chú mèo con Tom              | PG 14837 | A2  |
| 17  | `ch-mrs-tiggy-winkle`  | The Tale of Mrs. Tiggy-Winkle     | Bà nhím Tiggy-Winkle         | PG 15137 | A2  |
| 18  | `ch-jeremy-fisher`     | The Tale of Mr. Jeremy Fisher     | Ông ếch Jeremy Fisher        | PG 15077 | A2  |
| 19  | `ch-flopsy-bunnies`    | The Tale of the Flopsy Bunnies    | Đàn thỏ con Flopsy           | PG 14220 | A2  |
| 20  | `ch-johnny-town-mouse` | The Tale of Johnny Town-Mouse     | Chuột thành phố Johnny       | PG 15284 | A2  |

## 9. Thay đổi kỹ thuật so với đặc tả gốc

Đặc tả gốc chỉ có 2 `kind` (`fairy-tale` | `fable`). Nay cần **6**:

```ts
export type StoryKind = 'fairy-tale' | 'fable' | 'vn-folk' | 'myth' | 'humor' | 'children'
```

Kéo theo:

- `apps/english/src/data/stories/index.ts` — mở rộng union `StoryKind`.
- `apps/english/src/pages/Listening.tsx` — thanh tab hiện có 4 tab, cần thành **8 tab**
  (Câu thông dụng · Hội thoại · 6 thể loại truyện). Trên màn hình nhỏ 8 tab không đủ chỗ →
  **đổi sang tab cuộn ngang** hoặc gom truyện thành 1 tab "Truyện" có bộ lọc thể loại dạng chip.
  **Cần quyết định UI trước khi làm đợt nội dung thứ 2.**
- `apps/english/src/data/stories/stories.test.ts` — ràng buộc `moralEn`/`moralVi` bắt buộc hiện
  chỉ áp cho `kind === 'fable'`; giữ nguyên, các kind mới không bắt buộc có bài học.
- `scripts/gen-stories-json.mjs` — không đổi (đã lặp theo thư mục `raw/`).

## 10. Kế hoạch theo đợt (mỗi đợt ~1 PR — đã điều chỉnh so với dự kiến ban đầu theo tiến độ thật)

| Đợt   | Nội dung                                                                                                                                                                              | Trạng thái                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 0     | Hạ tầng + UI trang Nghe + `StoryKind` 6 loại + 3 truyện VN + 6 ngụ ngôn (Aesop/Jataka nguyên văn) + 4 cổ tích Grimm/Andersen (Hansel/Gretel, Khăn đỏ, Áo mới hoàng đế, Bán diêm)      | ✅ xong — PR #434                   |
| 1     | 3 truyện cổ tích Grimm (Lọ Lem, Bạch Tuyết, Chàng lùn tinh quái)                                                                                                                      | ✅ xong — PR #435                   |
| 2     | 3 truyện cổ tích Andersen còn lại (Vịt xấu xí, Cô bé tí hon, Nàng tiên cá — PG 27200)                                                                                                 | ✅ xong — PR #437                   |
| 2b    | 3 truyện dân gian VN đầu tiên (Sơn Tinh Thuỷ Tinh, Thánh Gióng, Bánh chưng bánh giầy)                                                                                                 | ✅ xong — PR #440 (phiên khác)      |
| 3     | 3 truyện Perrault qua Andrew Lang, PG 503 (Người đẹp ngủ trong rừng, Mèo đi hia, Người đẹp và quái vật)                                                                               | ✅ xong — PR #441                   |
| 4     | 6 truyện cổ tích cuối: Jacobs PG 7439 (Jack và cây đậu thần, Ba chú lợn con, Ba chú gấu) · Ozaki PG 4018 (Chim sẻ bị cắt lưỡi, Urashima Taro, Momotaro) — **đóng `fairy-tale` 20/20** | ✅ xong — phiên 2026-08-02 (PR này) |
| 5–6   | 14 ngụ ngôn còn lại (ưu tiên nguồn ≥400 từ — §4)                                                                                                                                      | ⏳ tiếp theo                        |
| 7–8   | 17 truyện dân gian VN còn lại                                                                                                                                                         | chưa                                |
| 9–10  | 20 thần thoại                                                                                                                                                                         | chưa                                |
| 11–12 | 20 truyện cười                                                                                                                                                                        | chưa                                |
| 13–14 | 20 thiếu nhi kinh điển                                                                                                                                                                | chưa                                |

Tổng: ~14 đợt. Chi phí lớn nhất nằm ở **dịch tay tiếng Việt**, không phải ở code.
