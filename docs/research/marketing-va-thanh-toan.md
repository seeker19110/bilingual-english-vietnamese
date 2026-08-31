# Tổng hợp Nghiên cứu: Marketing Va Thanh Toan

Tài liệu này gộp từ 4 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: chien-luoc-marketing-2026-07-25.md

_(Chi tiết nguồn gốc: `chien-luoc-marketing-2026-07-25.md`)_

# Chiến lược marketing & tăng trưởng — en-vi.donghanhcungban.com

> Ngày soạn: 2026-07-25 · Loại: tài liệu nghiên cứu (chưa phải kế hoạch đã duyệt)
> Người soạn: AI (vai trò quản lý dự án theo `CLAUDE.md` mục 0)
> **Đây là ĐỀ XUẤT để bạn quyết định** — chưa có dòng code nào được viết theo tài liệu này.

---

## 0. Tóm tắt trong 1 phút

| Câu hỏi               | Trả lời đề xuất                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Bán gì?               | KHÔNG bán. App miễn phí cho cộng đồng (quyết định 2026-07-11). "Gói" chỉ là **hạn mức chống cháy túi tiền API**. |
| Ai là người dùng gốc? | Học sinh/sinh viên Việt Nam luyện **nói** tiếng Anh, ngại nói với người thật, không đủ tiền học trung tâm.       |
| Câu chốt (hook)       | "Gia sư sửa lỗi cho bạn **bằng giọng tiếng Việt**" — điểm khác biệt không app nào có.                            |
| Kênh chính            | TikTok/Reels dạng "1 phút mỗi ngày" + Facebook Group ôn thi + giáo viên/trường (B2B2C).                          |
| Vòng lan truyền       | Thử thách tuần (`/challenge`) → ảnh khoe kết quả → mã mời bạn → cả hai được thưởng hạn mức.                      |
| Rủi ro lớn nhất       | **Viral thành công = hoá đơn AI tăng vọt.** Mọi chiến dịch phải gắn với trần chi phí.                            |

---

## 1. Bối cảnh thật của sản phẩm (đọc từ code, không phỏng đoán)

Trước khi bàn marketing, chốt lại những gì đang có thật:

- **Miễn phí, không thanh toán.** `CLAUDE.md` mục 13.3: dự án miễn phí vì cộng đồng, không làm
  thanh toán Pro cho tới khi bạn chủ động yêu cầu. Tài liệu này **tôn trọng quyết định đó** —
  phần "giới hạn gói" bên dưới bàn về _hạn mức kỹ thuật_, không phải bán hàng.
- **Đang trong khuyến mãi ra mắt tới `2027-01-01` (giờ VN).** `api/_lib/settings.ts`
  (`promoUntil`) + `src/lib/promo.ts`: mọi người dùng, kể cả Free, hiện được đối xử như **VIP** —
  không giới hạn lượt + đủ 14 giọng TTS. Nghĩa là **từ nay đến hết 2026 là cửa sổ vàng để quảng
  bá**: người mới vào không đụng tường "hết lượt".
- **Hạn mức thật sẽ áp từ 2027** (mặc định trong DB): Free 5 lượt/ngày mỗi chế độ
  (chat/writing/speaking/stt/pronounce), Pro 100, VIP ~không giới hạn. Admin chỉnh được **live**
  qua `/api/admin-settings` (bảng `app_settings`) — không cần deploy.
- **Cầu dao khẩn cấp có sẵn** (`aiCircuitBreaker`) — chặn toàn bộ lượt gọi AI trong 1 cú bấm khi
  chi phí bất thường. Đây là lưới an toàn bắt buộc phải bật sẵn trước mọi chiến dịch lớn.
- **Đã có sẵn chất liệu marketing trong sản phẩm**: lộ trình CEFR A1→C2, thử thách 1 phút/ngày
  theo tuần (`/challenge`), streak + confetti, sổ lỗi cá nhân, từ điển 12.073 mục 100% gắn nhãn
  CEFR, chấm điểm kiểu IELTS Speaking.
- **CHƯA có**: hệ thống mời bạn (referral), landing page bán hàng, analytics hành vi, email/thông
  báo giữ chân, chia sẻ kết quả ra mạng xã hội. Đây chính là các hạng mục kỹ thuật của kế hoạch.

---

## 2. Định vị & thông điệp

### 2.1 Điểm khác biệt phải nói to nhất

Sản phẩm cùng loại (ELSA, Duolingo, Cake, các bot ChatGPT) đều **giải thích lỗi bằng tiếng Anh**
hoặc chỉ bằng chữ. App này **nói lại lỗi cho bạn nghe bằng giọng tiếng Việt** (TTS hai giọng
riêng). Với người mất gốc, đây là khác biệt sống còn — họ hiểu được lời sửa.

**Câu định vị 1 dòng (dùng nhất quán mọi nơi):**

> "Nói tiếng Anh với AI — sai chỗ nào, được giảng lại bằng **tiếng Việt**. Miễn phí."

Biến thể theo kênh:

- TikTok/Reels: _"Nói sai tiếng Anh mà không ai sửa? App này sửa cho bạn bằng tiếng Việt luôn."_
- Facebook Group ôn thi: _"Luyện Speaking IELTS mỗi ngày, chấm band + chỉ lỗi bằng tiếng Việt, free."_
- Cho giáo viên: _"Giao bài luyện nói cho cả lớp, học sinh tự luyện, bạn xem tiến độ."_ (cần tính
  năng lớp học — xem §7, chưa có).
- Chiều B (người nước ngoài học tiếng Việt): _"Learn Vietnamese by speaking — corrections explained
  in English."_ Đây là **thị trường ngách gần như trống**, chi phí giành người dùng thấp, nên tách
  landing page tiếng Anh riêng.

### 2.2 Ba nhóm người dùng ưu tiên (theo thứ tự)

| #   | Nhóm                                    | Nỗi đau                                | Nơi họ ở                                            |
| --- | --------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| 1   | Sinh viên / người đi làm luyện Speaking | Ngại nói, không có ai sửa, học phí đắt | TikTok, Facebook Group IELTS/TOEIC, Threads         |
| 2   | Học sinh cấp 2–3 & phụ huynh            | Học ngữ pháp mà không nói được         | Qua **giáo viên/trường** (B2B2C), Zalo phụ huynh    |
| 3   | Người nước ngoài ở VN học tiếng Việt    | Tài liệu học tiếng Việt rất ít         | Reddit r/VietNam, r/learnvietnamese, Facebook expat |

Nhóm 2 tiếp cận qua giáo viên hiệu quả hơn nhiều so với quảng cáo trực tiếp: 1 giáo viên = 30–40
học sinh, chi phí giành người dùng gần bằng 0.

---

## 3. Chiến lược tăng trưởng: 3 vòng lặp, không phải 3 chiến dịch

Chiến dịch tắt là hết; vòng lặp tự chạy tiếp. Ưu tiên xây vòng lặp.

### Vòng 1 — Nội dung ngắn (thu hút người lạ)

Nhiên liệu chính, chi phí bằng 0 ngoài thời gian.

- **Format lõi: "1 phút mỗi ngày"** — bám đúng tính năng `/challenge` đã có. Mỗi video: 1 tình
  huống đời thường (gọi món, phỏng vấn, sân bay) → người thật nói → AI chỉ lỗi bằng tiếng Việt →
  CTA "làm thử ngay, free".
- **Series "Lỗi người Việt hay mắc"**: phát âm `-s`/`-ed` cuối từ, `th`, thì hiện tại hoàn thành.
  Lấy trực tiếp từ dữ liệu **Sổ lỗi cá nhân** (`/mistakes`) — nội dung có thật, không bịa.
- **Series "Từ vựng theo cấp"**: mỗi video 3 từ A2/B1 kèm ví dụ, lấy từ `src/data/cefr.ts`.
- Nhịp đề xuất: **5 video/tuần**, mỗi video dưới 30 giây, đăng đồng thời TikTok + Reels + YouTube
  Shorts. Đây là môn thể thao số lượng, không phải chất lượng cao siêu.

### Vòng 2 — Giới thiệu bạn (biến người dùng thành kênh)

**CHƯA CÓ — hạng mục kỹ thuật lớn nhất của kế hoạch này.** Thiết kế đề xuất:

- Mỗi người dùng có **mã mời** (6 ký tự) + link `?ref=MÃ`.
- Người mới đăng ký bằng link → **cả hai** được thưởng, nhưng thưởng bằng **hạn mức**, không
  bằng tiền: ví dụ +7 ngày "gói Pro" (100 lượt/ngày). Hợp với triết lý miễn phí và tận dụng
  đúng cột `plan` + `plan_expires_at` **đã có sẵn** trong bảng `profiles` → chi phí code thấp.
- Chống gian lận (bắt buộc, vì thưởng = tiền API thật): chỉ tính khi người được mời **hoàn thành
  1 phiên học thật** (không phải chỉ đăng ký), trần **tối đa 10 lượt mời được thưởng/tài khoản**,
  chặn tự mời chính mình, ghi log để rà.
- Vị trí hiển thị: sau màn ăn mừng streak / sau khi chấm điểm cuối phiên — lúc người dùng đang
  vui nhất.

### Vòng 3 — Khoe thành tích (lan truyền không cần lời mời)

- Nút **"Chia sẻ kết quả"** ở màn chấm điểm cuối phiên và ở tổng kết tuần Challenge: sinh 1 ảnh
  (canvas) gồm band điểm / streak / 7-ô-tuần + logo + link. Người dùng đăng lên story.
- **Không** tự động đăng bài hộ người dùng — chỉ tạo ảnh để họ tự chia sẻ.

---

## 4. "Quà tặng" — tặng cái gì cho đúng?

Nguyên tắc: **tặng hạn mức và nội dung, không tặng tiền mặt/voucher.** Vì (a) dự án không có
doanh thu, (b) hạn mức có giá vốn kiểm soát được, (c) người săn voucher không phải người học thật.

| Món quà                          | Đổi lấy                                   | Giá vốn thật               | Ưu tiên          |
| -------------------------------- | ----------------------------------------- | -------------------------- | ---------------- |
| +7 ngày Pro (100 lượt/ngày)      | Mời được 1 bạn học thật                   | Vài nghìn đồng tiền API    | ⭐ Cao           |
| +3 ngày Pro                      | Hoàn thành 7/7 ngày Challenge trong tuần  | Thấp, có sẵn `/challenge`  | ⭐ Cao           |
| Mở khoá đủ 14 giọng TTS          | Đăng nhập lần đầu / hoàn thành onboarding | Gần 0 (cache TTS đã có)    | Trung bình       |
| Huy hiệu + khung ảnh khoe streak | Mốc 7/30/100 ngày                         | 0                          | Trung bình       |
| PDF "500 từ A1–A2 kèm phiên âm"  | Nhập email / vào group                    | 0 (sinh từ từ điển sẵn có) | ⭐ Cao (mồi dẫn) |
| Gói "Lớp học": 30 tài khoản Pro  | Giáo viên đăng ký lớp                     | Trung bình — cần trần rõ   | Sau              |

**PDF quà tặng đáng làm sớm nhất**: dữ liệu đã có (12.073 mục có nhãn CEFR + phiên âm + tần
suất), chỉ cần 1 script xuất file, dùng được cho mọi kênh, không tốn tiền API.

---

## 5. "Giới hạn gói" — bàn cho đúng bản chất

Vì app miễn phí, **gói không phải công cụ bán hàng mà là van an toàn tài chính**. Nhưng nó cũng
là **công cụ marketing**: cái gì miễn phí vô hạn thì người ta không quý.

### 5.1 Hiện trạng và vấn đề

Hiện tại (khuyến mãi tới 2027-01-01) mọi người là VIP không giới hạn. Đến ngày `promoUntil` hết
hạn, **toàn bộ người dùng rơi thẳng từ không-giới-hạn xuống 5 lượt/ngày trong một đêm.** Đây là
rủi ro giữ chân nghiêm trọng và nên được xử lý _trước_ khi đổ tiền/công vào marketing — nếu không,
người dùng ta cực khổ kiếm về sẽ rời đi đúng lúc đông nhất.

**Đề xuất (cần bạn quyết):**

1. **Hạ dần, không cắt phựt.** Ví dụ 2026-11: hạ VIP-cho-tất-cả xuống mức Pro (100/ngày) và
   thông báo trước 30 ngày trong app; 2027-01: về mức Free thật. Cơ chế đã hỗ trợ sẵn — chỉ cần
   chỉnh `app_settings` qua `/api/admin-settings`, không cần deploy.
2. **Nâng trần Free từ 5 → 10–15 lượt/ngày cho chế độ Nói.** 5 lượt là chưa đủ một phiên học tử
   tế; người dùng mới sẽ bỏ trước khi kịp thấy giá trị. Chi phí thêm nên được ước lượng bằng số
   thật (xem §8) trước khi chốt.
3. **Phân biệt chi phí theo chế độ.** Chat/Writing (chỉ text) rẻ hơn nhiều so với STT+TTS. Nên
   nới rộng chat/writing và siết nói/STT, thay vì đặt cùng một con số 5 cho tất cả.
4. **Đặt "gói Pro" thành phần thưởng, không phải hàng bán.** Người dùng đạt được Pro bằng cách
   mời bạn hoặc giữ streak. Vừa tạo động lực, vừa không phá cam kết miễn phí.

### 5.2 Cách thông báo giới hạn (rất quan trọng cho giữ chân)

Thông điệp hiện tại khi hết lượt: _"Hết lượt miễn phí hôm nay. Thử lại ngày mai hoặc nâng cấp gói
Pro."_ — câu này **mời nâng cấp một thứ không bán được**. Cần đổi thành lời mời hành động miễn
phí, ví dụ: _"Hết lượt hôm nay rồi 👏 Mời 1 bạn cùng học để mở thêm 7 ngày không giới hạn — hoặc
quay lại vào ngày mai."_ Biến bức tường thành cửa vào Vòng 2.

---

## 6. Kênh & chiến thuật cụ thể (chi phí gần bằng 0)

1. **TikTok/Reels/Shorts** — trục chính, 5 video/tuần (§3 Vòng 1).
2. **Facebook Group** ôn thi IELTS/TOEIC, group sinh viên các trường: **không spam link**. Đăng
   nội dung có giá trị (bảng lỗi phát âm, list từ theo cấp) rồi để link ở bình luận đầu.
3. **Giáo viên & trường (B2B2C)** — đòn bẩy mạnh nhất cho nhóm 2. Cần một trang giới thiệu riêng
   cho giáo viên + gói lớp học. Tiếp cận: giáo viên tiếng Anh cấp 2–3 ở tỉnh, nơi ít trung tâm.
4. **Reddit/expat cho chiều B** — r/VietNam, r/learnvietnamese, group expat ở HCM/HN/Đà Nẵng.
   Đăng bằng tiếng Anh, thật thà: "tôi làm app miễn phí, mong góp ý".
5. **SEO** — dài hạn nhưng bền. `VITE_SITE_URL` + canonical đã có. Cần thêm: trang công khai cho
   mỗi từ/mỗi bài ngữ pháp (12.073 mục = 12.073 trang có nội dung thật, xem §7), sitemap, meta
   tiếng Việt. Đây là kênh **cực kỳ hợp** với dữ liệu sẵn có của dự án.
6. **Zalo OA / cộng đồng Zalo** — kênh người Việt bỏ quên, phù hợp phụ huynh.
7. **Product Hunt / cộng đồng dev VN (Viblo, J2Team)** — một đợt duy nhất, cho chiều B và uy tín.

**Không đề xuất chạy quảng cáo trả tiền** ở giai đoạn này: chưa có doanh thu, mỗi người dùng mới
làm tăng hoá đơn API — trả tiền để tăng chi phí là ngược.

---

## 7. Hạng mục kỹ thuật cần làm (xếp theo giá trị / công sức)

| #   | Hạng mục                                                    | Công sức | Giá trị       | Ghi chú                                                                |
| --- | ----------------------------------------------------------- | -------- | ------------- | ---------------------------------------------------------------------- |
| 1   | Sửa thông điệp "hết lượt" (bỏ mời nâng cấp Pro)             | Rất nhỏ  | Cao           | `api/_lib/usage.ts` — sửa được ngay hôm nay                            |
| 2   | Landing page thật (`/` cho người CHƯA đăng nhập)            | Nhỏ      | Rất cao       | Hiện chưa có trang bán ý tưởng; mọi kênh đều đổ về đây                 |
| 3   | Nút "Chia sẻ kết quả" sinh ảnh                              | Vừa      | Cao           | Vòng 3; gắn vào màn chấm điểm + tổng kết tuần                          |
| 4   | Hệ thống mời bạn (referral)                                 | Vừa–lớn  | Rất cao       | Vòng 2; tận dụng `plan` + `plan_expires_at` sẵn có; cần chống gian lận |
| 5   | PDF quà tặng "500 từ A1–A2"                                 | Nhỏ      | Cao           | 1 script xuất từ từ điển                                               |
| 6   | Trang SEO công khai cho từ điển / bài ngữ pháp              | Vừa–lớn  | Cao (dài hạn) | 12k trang nội dung thật, không cần đăng nhập                           |
| 7   | Analytics tối thiểu, tôn trọng riêng tư (Plausible/tự đếm)  | Nhỏ      | Cao           | Không đo thì không biết kênh nào hiệu quả                              |
| 8   | Kịch bản hạ dần hạn mức trước 2027-01-01 + banner báo trước | Nhỏ      | Cao           | Chỉ chỉnh `app_settings`, nhưng cần UI thông báo                       |
| 9   | Landing page tiếng Anh cho chiều B                          | Nhỏ      | Trung bình    | Ngách trống, chi phí thấp                                              |
| 10  | Gói "Lớp học" cho giáo viên                                 | Lớn      | Cao           | Để sau, sau khi 1–8 xong                                               |

Thứ tự khuyến nghị bắt tay: **1 → 2 → 5 → 7 → 3 → 4 → 8 → 6**.

---

## 8. Rủi ro & giới hạn (phải đọc trước khi chạy chiến dịch)

1. **🔴 Viral = hoá đơn AI.** Đây là rủi ro số một. Trước bất kỳ đợt đẩy nào: (a) bật sẵn quy
   trình dùng `aiCircuitBreaker`, (b) biết trước chi phí trung bình mỗi người dùng mỗi ngày —
   con số này **hiện chưa được đo**, (c) đặt trần chi tiêu/cảnh báo ở phía nhà cung cấp AI.
   Nghiên cứu này **không** đưa ra con số chi phí vì chưa đo được từ dữ liệu thật; cần đo trước
   khi chốt các mức hạn mức ở §5.
2. **Hạ tầng.** Một VPS chung với app khác. `docs/research/ke-hoach-scale-30k-concurrent.md` đã
   có kế hoạch, nhưng một video triệu view có thể đến trước khi kế hoạch được thi hành.
3. **Chưa đo được gì.** Không có analytics → không biết người dùng rơi ở bước nào, kênh nào hiệu
   quả. Làm marketing trước khi có đo lường là đốt công sức mù.
4. **Rào cản đăng nhập.** Hiện phải đăng nhập mới dùng được. Người từ TikTok rất ngại. Đáng cân
   nhắc chế độ **dùng thử 3 lượt không cần đăng nhập** (giới hạn theo IP + trần toàn cục) — nhưng
   đây là thay đổi đụng bảo mật/đếm lượt, cần bàn riêng, không tự làm.
5. **Cam kết miễn phí là lời hứa công khai.** Một khi đã quảng bá "miễn phí", việc siết hạn mức
   sau này sẽ bị nhìn như thất hứa. Nên nói rõ ngay từ đầu: _"miễn phí, có giới hạn lượt mỗi
   ngày để mọi người cùng dùng được"_ — thành thật ngay từ câu đầu tiên.
6. **Riêng tư & trẻ vị thành niên.** Nhắm học sinh cấp 2–3 nghĩa là xử lý dữ liệu trẻ em (ghi âm
   giọng nói!). Cần rà chính sách riêng tư trước khi đẩy mạnh kênh trường học.

---

## 9. Đề xuất 90 ngày (bản nháp, chờ bạn duyệt)

- **Tháng 1 — Chuẩn bị nền.** Hạng mục kỹ thuật 1, 2, 5, 7. Đo chi phí AI/người dùng. Dựng sẵn
  kho 20 video. Chưa đẩy mạnh.
- **Tháng 2 — Mở vòi từ từ.** Đăng đều 5 video/tuần. Vào 5–10 group Facebook. Bài Reddit cho
  chiều B. Theo dõi chi phí hằng ngày. Làm hạng mục 3 + 4.
- **Tháng 3 — Đẩy & bật vòng lặp.** Bật referral. Tiếp cận 10 giáo viên đầu tiên. Chuẩn bị kịch
  bản hạ dần hạn mức (hạng mục 8) trước mốc 2027-01-01.

**Chỉ số theo dõi** (chọn ít, đúng): số người học **≥ 2 ngày liên tiếp** (không phải lượt đăng
ký), số phiên nói hoàn thành/ngày, **chi phí AI / người dùng hoạt động / ngày**, tỉ lệ mời bạn
thành công.

---

## 10. Cần bạn quyết định

1. Có đồng ý hướng "miễn phí + hạn mức là phần thưởng, không bán" không?
2. Có làm **referral** (hạng mục 4) không — đây là việc lớn nhất và đụng tới `plan`/hạn mức?
3. Có nới trần Free (5 → 10–15 lượt) và **hạ dần thay vì cắt phựt** trước 2027-01-01 không?
4. Có mở chế độ **dùng thử không cần đăng nhập** không (đụng bảo mật, cần bàn riêng)?
5. Bạn tự làm nội dung video, hay cần tôi soạn sẵn kịch bản + trích dữ liệu từ app?

Sau khi bạn chốt, tôi sẽ tách thành các đặc tả nhỏ trong `PROGRESS.md` và làm từng việc một.

---

## [2] Tài liệu: dac-ta-marketing-trien-khai-2026-07-25.md

_(Chi tiết nguồn gốc: `dac-ta-marketing-trien-khai-2026-07-25.md`)_

# Đặc tả triển khai — hạng mục kỹ thuật marketing (M1)

> Ngày soạn: 2026-07-25 · Dựa trên `docs/research/chien-luoc-marketing-2026-07-25.md` §7
> Phạm vi: biến 8 hạng mục kỹ thuật thành đặc tả đủ để giao việc + code thật.
> **Chưa code gì** — đây là cổng đặc tả trước khi bắt tay (CLAUDE.md mục 3).

## Cách đọc file này

Mỗi hạng mục có: **Vì sao** → **Đặc tả** (schema/API/UI cụ thể) → **Tiêu chí chấp nhận** →
**Người làm** (theo CLAUDE.md mục 3, quyết định 2026-07-15: phức tạp→Opus, vừa→Sonnet
`standard-worker`, cơ học→Haiku `mechanical-worker`) → **Phụ thuộc**.

Thứ tự triển khai (đã sắp theo phụ thuộc + giá trị/công sức):

```
M1.1 (sửa thông điệp) ─┐
M1.5 (PDF quà tặng)    ├─ độc lập, làm song song được, không đụng schema
M1.7 (analytics)       ─┘
M1.2 (landing page)    ── phụ thuộc M1.7 (đo hiệu quả ngay khi ra mắt)
M1.3 (chia sẻ ảnh)     ── độc lập
M1.8 (hạ dần hạn mức)  ── độc lập, chỉ cấu hình + banner
M1.4 (referral)        ── phụ thuộc M1.7, đụng schema — làm SAU CÙNG, Opus tự làm
```

---

## M1.1 — Sửa thông điệp "hết lượt"

**Vì sao:** câu hiện tại mời "nâng cấp gói Pro" — nhưng dự án không bán Pro. Sai định hướng,
sửa nhanh, giá trị cao (§5.2 tài liệu chiến lược).

**Đặc tả:**

- File: `api/_lib/usage.ts`, hàm `limitMessage(plan)` (dòng ~35).
- Đổi nội dung, KHÔNG đổi chữ ký hàm hay logic quanh nó:
  - `free`: `'Hết lượt miễn phí hôm nay. Quay lại vào ngày mai nhé — hoặc mời một người bạn cùng học để nhận thêm lượt!'` (câu chính xác do người viết nội dung/bạn chốt — không hứa cơ chế mời bạn nếu M1.4 chưa xong; nếu M1.4 CHƯA triển khai, dùng: `'Hết lượt miễn phí hôm nay. Thử lại vào ngày mai nhé!'` — bỏ hẳn từ "Pro/nâng cấp").
  - `pro`/`vip`: giữ nguyên tinh thần cũ (đã ổn, không nhắc bán hàng).
- Tìm & xoá các chỗ khác trong `src/` có hiển thị "nâng cấp Pro" hướng tới thanh toán (grep
  `nâng cấp`, `upgrade`, `Pro` trong `src/components`, `src/pages`) — liệt kê ra để rà, không tự
  ý xoá nếu ngữ cảnh khác (vd trang Profile hiển thị gói hiện tại là hợp lệ, giữ nguyên).

**Tiêu chí chấp nhận:**

- Không còn câu nào trong luồng người dùng gợi ý "mua/nâng cấp" mà thực tế không mua được gì.
- `npm test` xanh (có thể có test snapshot cho `limitMessage` — kiểm tra `api/*.test.ts` liên quan `usage`).

**Người làm:** `mechanical-worker` (Haiku) — đổi chuỗi, không quyết định kiến trúc. Brief cần kèm
đúng câu chữ đã chốt (bạn duyệt trước).

**Phụ thuộc:** không.

---

## M1.5 — PDF quà tặng "500 từ A1–A2"

**Vì sao:** mồi dẫn (lead magnet) chi phí 0đ, dữ liệu đã có sẵn 100% (`src/data/cefr.ts` +
từ điển 12.073 mục đã gắn nhãn CEFR + phiên âm).

**Đặc tả:**

- Script mới: `scripts/gen-vocab-pdf.ts` (theo mẫu các script `scripts/gen-*` đã có, vd
  `scripts/gen-cefr-c1c2-vocab.ts` — đọc để bắt chước style/cách chạy bằng `tsx`).
- Input: lọc từ điển ở mức A1+A2 (dùng field `level` có sẵn), ưu tiên theo `freq` (tần suất
  thật đã gắn — xem CLAUDE.md mục 13 "Từ điển & dữ liệu"), lấy 500 từ đầu.
- Output: 1 file PDF tĩnh, đặt ở `public/downloads/500-tu-vung-a1-a2.pdf` (thư mục `public/`
  đã được Vite serve tĩnh — xác nhận bằng cách xem `vite.config.ts`/cấu trúc `public/` hiện có
  trước khi tạo thư mục mới).
- Layout PDF tối thiểu: từ tiếng Anh — phiên âm — nghĩa tiếng Việt — 1 câu ví dụ (lấy từ field
  ví dụ có sẵn trong dictionary nếu có), chia theo cấp A1/A2, có trang bìa với tên app + link.
- Thư viện PDF: kiểm tra `package.json` xem đã có lib PDF nào chưa (vd dùng trong `docs`/`pdf`
  skill ở máy dev, nhưng **trong runtime Node của app thì cần thêm dependency** — ưu tiên
  `pdf-lib` (nhẹ, không cần Chromium) hơn puppeteer/playwright để tránh phình node_modules server.
- Đây là file **build-time / chạy tay 1 lần**, không phải API — không tính vào chi phí AI/server.

**Tiêu chí chấp nhận:**

- Chạy `tsx scripts/gen-vocab-pdf.ts` ra đúng 1 file PDF, mở được, đúng 500 từ, không lỗi encoding
  tiếng Việt (dấu).
- File PDF được commit vào `public/downloads/` (hoặc build script chạy trong CI — bạn chọn,
  nhưng vì dữ liệu ít đổi, commit thẳng file đơn giản hơn).
- `npm run typecheck`/`lint`/`build` vẫn xanh.

**Người làm:** `standard-worker` (Sonnet) — đặc tả đã đủ rõ, ít phụ thuộc ngữ cảnh phiên hiện tại.
Brief cần kèm: đường dẫn field `level`/`freq`/ví dụ thật trong kiểu `DictEntry` (đọc `src/types.ts`
dòng ~37 trước khi giao), và yêu cầu đọc 1 script `gen-*` có sẵn làm mẫu phong cách code.

**Phụ thuộc:** không.

---

## M1.7 — Analytics tối thiểu, tôn trọng riêng tư

**Vì sao:** không đo thì không biết kênh nào hiệu quả — làm mọi hạng mục sau mà thiếu cái này
là làm mù.

**Đặc tả (đề xuất tự đếm, KHÔNG dùng script bên thứ 3 để tránh cookie/GDPR/CSP rắc rối, khớp
triết lý "không tin client" của dự án):**

- Bảng mới `postgres/migrations/00XX_analytics_events.sql` (số thứ tự = số tiếp theo sau file
  mới nhất trong `postgres/migrations/` — kiểm tra trước khi đặt tên):
  ```sql
  create table if not exists public.analytics_events (
    id         bigserial primary key,
    event      text not null,        -- 'landing_view' | 'signup' | 'first_session_done' | ...
    user_id    uuid references public.users(id) on delete set null,
    ref_code   text,                 -- mã giới thiệu nếu có (?ref=...), null nếu không
    utm_source text,
    path       text,
    created_at timestamptz not null default now()
  );
  create index if not exists analytics_events_event_idx on public.analytics_events(event, created_at);
  ```
- API mới `api/analytics.ts` (theo khuôn các handler edge hiện có — xem `api/challenge.ts` làm
  mẫu cấu trúc): `POST /api/analytics` nhận `{ event, refCode?, utmSource?, path? }`, validate
  bằng Zod (whitelist `event` là enum cố định, KHÔNG nhận chuỗi tự do — tránh spam bảng), rate
  limit theo IP giống các handler khác (`checkRateLimit`), auth **KHÔNG bắt buộc** (phải đo được
  người chưa đăng nhập) nhưng lấy `user_id` nếu có Bearer token hợp lệ.
- Client: hàm nhỏ `src/lib/analytics.ts` — `track(event, extra?)`, gọi `fetch('/api/analytics', ...)`
  kiểu "gửi rồi quên" (không block UI, nuốt lỗi).
- Sự kiện tối thiểu cần bắn: xem landing page, bấm "bắt đầu", đăng ký thành công, hoàn thành
  phiên học đầu tiên (chat/writing/speaking bất kỳ), quay lại ngày thứ 2.
- Trang xem số liệu: tận dụng `AdminSettings.tsx` (đã có, chỉ admin truy cập qua `isAdminEmail`)
  — thêm 1 tab/khối query đếm theo event + theo ngày, KHÔNG cần dashboard đẹp, bảng số là đủ.

**Tiêu chí chấp nhận:**

- Ghi được sự kiện cả khi chưa đăng nhập.
- Không lộ dữ liệu cá nhân ai khác qua endpoint (không có GET công khai trả danh sách user).
- Migration có thể chạy lại an toàn (`create table if not exists`), có trong
  `postgres/migrations/README.md`.
- Zod validate input đúng nguyên tắc kỹ thuật bất biến #1 (CLAUDE.md mục 4).

**Người làm:** `standard-worker` (Sonnet) cho phần API + client hook (đặc tả đủ kín). Migration
SQL nên để `complex-implementer`/Opus tự viết hoặc review kỹ vì đụng schema production — theo
CLAUDE.md mục 12 ("đụng bảo mật... breaking change" cần cẩn trọng, dù đây không phải destructive).
Đề xuất: Sonnet làm toàn bộ theo `route:standard`, Opus review diff trước khi merge (không tự
chạy migration lên production — đó là bước "cần làm tay" theo quy ước dự án).

**Phụ thuộc:** không (nhưng nên làm TRƯỚC M1.2/M1.3/M1.4 để có số liệu ngay).

---

## M1.2 — Landing page cho người chưa đăng nhập

**Vì sao:** mọi kênh (TikTok, Facebook, SEO) đều đổ traffic về một chỗ — hiện chưa có trang
"bán ý tưởng", chỉ có `/login`.

**Đặc tả:**

- Xác nhận trước: đọc `src/App.tsx` xem route `/` hiện trỏ đi đâu khi CHƯA đăng nhập (có thể đã
  redirect thẳng `/login`). Nếu vậy, cần tách: `/` = landing công khai (không cần đăng nhập),
  `/login` = form đăng nhập riêng, nút CTA trên landing trỏ sang `/login?mode=register`.
- Trang mới `src/pages/Landing.tsx`, nội dung theo câu định vị đã chốt trong tài liệu chiến lược
  §2.1: hook chính "sửa lỗi bằng giọng tiếng Việt", demo ngắn (ảnh chụp màn hình hoặc audio mẫu
  có sẵn — KHÔNG bịa số liệu người dùng/đánh giá giả), 3 nút CTA theo 3 chế độ, khối "miễn phí,
  có giới hạn lượt/ngày" (thành thật ngay từ đầu, theo §8.5 tài liệu chiến lược).
- Bắn sự kiện `landing_view` (M1.7) khi vào trang, `cta_click` khi bấm CTA.
- Đọc `utm_source`/`ref` từ query string (`useSearchParams`), lưu tạm (localStorage hoặc chuyển
  tiếp qua query sang `/login`) để gắn vào sự kiện `signup` — chuẩn bị sẵn chỗ cắm cho M1.4
  (referral) dù referral chưa code, tránh phải sửa lại 2 lần.
- SEO: `<title>`/`<meta description>` + canonical (đã có cơ chế `VITE_SITE_URL`, xem `src/App.tsx`
  cách trang khác đang set — làm nhất quán).
- Mobile-first, dùng design tokens `--a-*` có sẵn, KHÔNG hard-code màu (nguyên tắc #8).

**Tiêu chí chấp nhận:**

- Vào `/` khi chưa đăng nhập thấy landing, không bị ép đăng nhập ngay.
- Lighthouse/axe không tệ hơn baseline (bundle-size budget vẫn đạt — nguyên tắc #7).
- 4 theme đều đọc được (AA contrast).
- E2E Playwright: thêm 1 test mới cho luồng landing → bấm CTA → tới `/login`.

**Người làm:** `standard-worker` (Sonnet) — component UI rõ ràng, có đặc tả cụ thể.

**Phụ thuộc:** M1.7 (để bắn sự kiện ngay từ ngày ra mắt, không mất dữ liệu tuần đầu).

---

## M1.3 — Nút "Chia sẻ kết quả"

**Vì sao:** lan truyền không cần lời mời — người dùng tự khoe streak/band điểm.

**Đặc tả:**

- Vị trí gắn: màn "Kết thúc & chấm điểm" (Chat/Speaking — đã có, xem CLAUDE.md mục 13 dòng
  "Giọng điệu Chat/Speaking...") và màn tổng kết tuần Challenge (`src/pages/Challenge.tsx`).
- Cơ chế: vẽ 1 ảnh bằng `<canvas>` phía client (KHÔNG cần server) — gồm: điểm/band hoặc số ngày
  streak, logo/tên app, URL. Xuất ảnh bằng `canvas.toBlob()` → `navigator.share()` nếu trình
  duyệt hỗ trợ (mobile), fallback tải file PNG nếu không.
- Component mới `src/components/ShareResultCard.tsx` nhận props kết quả cần vẽ, tái dùng cho cả
  2 nơi gắn (không viết 2 lần — nguyên tắc DRY #4).
- Bắn sự kiện `share_click` (M1.7).
- **Không** tự động đăng hộ lên mạng xã hội nào — chỉ tạo ảnh/gọi Web Share API chuẩn của
  trình duyệt (người dùng tự chọn nơi đăng).

**Tiêu chí chấp nhận:**

- Hoạt động trên mobile Safari/Chrome (Web Share API) và fallback tải ảnh trên desktop.
- Ảnh xuất ra đọc được (không vỡ font tiếng Việt có dấu trên canvas — cần test kỹ, canvas dễ lỗi
  font khi chạy trong CI headless).
- Test unit cho logic vẽ (tách phần tính toán layout khỏi phần vẽ DOM để test được, theo nguyên
  tắc #9 chống lỗi logic — ca biên: streak = 0, band điểm null).

**Người làm:** `standard-worker` (Sonnet).

**Phụ thuộc:** không, nhưng nên làm sau M1.7 để đo được `share_click`.

---

## M1.8 — Kịch bản hạ dần hạn mức trước 2027-01-01

**Vì sao:** tránh cắt phựt từ không-giới-hạn xuống 5 lượt/ngày trong một đêm (rủi ro giữ chân
lớn nhất nêu ở §8 tài liệu chiến lược).

**Đặc tả — đây là việc admin/thao tác, không phải feature code lớn:**

1. **Cấu hình (không cần code mới):** `promoUntil` trong `app_settings` đổi qua `/api/admin-settings`
   theo 2 mốc — ví dụ đổi từ `2027-01-01` xuống mốc gần hơn khi muốn hạ dần, HOẶC (cách sạch
   hơn) giữ `promoUntil` cố định nhưng đổi `limits.vip` từ "gần vô hạn" xuống bằng `limits.pro`
   trước, rồi mới tắt hẳn promo. Bạn chọn 1 trong 2 cách — khuyến nghị cách 2 (đổi limits.vip)
   vì không cần đụng field `promoUntil` semantics.
2. **Banner báo trước (việc code duy nhất của mục này):** component nhỏ hiển thị khi
   `promoUntil` còn dưới N ngày (đọc qua `src/lib/appSettings.ts`/`src/lib/promo.ts` đã có) —
   "Từ [ngày] app sẽ áp hạn mức lượt dùng/ngày để duy trì lâu dài cho mọi người, cảm ơn bạn đã
   đồng hành". Đặt ở layout chung (`Home.tsx` hoặc component header dùng chung), tự ẩn sau khi
   đóng (localStorage), tự ẩn hẳn nếu còn > N ngày.
3. Cập nhật `docs/research/eval-tutor-baseline.md`? — KHÔNG liên quan, bỏ qua (chỉ áp dụng khi
   đổi prompt/model AI theo CLAUDE.md mục 8).

**Tiêu chí chấp nhận:**

- Banner đúng 4 theme, đóng được, không hiện lại trong ngày sau khi đóng.
- Không đụng logic `usage.ts`/`promo.ts` hiện có (chỉ đọc, không sửa).

**Người làm:** banner → `standard-worker`. Quyết định NGÀY cụ thể hạ hạn mức và cách chỉnh
`app_settings` → **bạn quyết + Opus thao tác tay qua `/api/admin-settings`**, không giao subagent
(đây là thao tác vận hành ảnh hưởng production, không phải code).

**Phụ thuộc:** không, làm bất kỳ lúc nào trước tháng 11/2026.

---

## M1.4 — Hệ thống giới thiệu bạn (referral)

**Vì sao:** vòng lặp tăng trưởng mạnh nhất, nhưng đụng `plan`/`plan_expires_at` (tiền API thật)
→ hạng mục rủi ro cao nhất, làm sau cùng, sau khi có M1.7 để đo hiệu quả và có M1.1 xong.

### Schema

`postgres/migrations/00XX_referral.sql` (số kế tiếp thật, kiểm tra lúc code):

```sql
-- Mỗi user có 1 mã mời cố định, sinh khi cần (không sinh sẵn cho toàn bộ user cũ trong migration
-- để tránh phải chọn thuật toán unique cho hàng loạt — sinh lười, xem hàm bên dưới).
alter table public.profiles add column if not exists referral_code text unique;

create table if not exists public.referrals (
  id            bigserial primary key,
  referrer_id   uuid not null references public.users(id) on delete cascade,
  referee_id    uuid not null references public.users(id) on delete cascade unique, -- 1 người chỉ được mời bởi 1 người, chỉ 1 lần
  rewarded_at   timestamptz,   -- null = chưa đủ điều kiện thưởng (chưa hoàn thành phiên đầu)
  created_at    timestamptz not null default now(),
  check (referrer_id <> referee_id)  -- chặn tự mời chính mình ở tầng DB, không chỉ ở code
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
```

### API

- `GET /api/referral` (cần đăng nhập): trả `referralCode` của user hiện tại (sinh lười nếu chưa
  có — random 6 ký tự chữ+số viết hoa, retry khi đụng unique constraint), số lượt mời đã thưởng,
  còn được thưởng bao nhiêu lượt (trần 10/tài khoản — đọc từ `app_settings` hoặc hằng số, ưu
  tiên đọc từ `app_settings` để admin chỉnh live giống các hạn mức khác).
- `POST /api/referral/claim` body `{ referralCode }`: gọi lúc đăng ký xong (hoặc lúc đăng nhập
  lần đầu) nếu có `ref=` trong URL lúc vào landing (M1.2 đã chuẩn bị chỗ đọc). Validate: mã tồn
  tại, không phải tự mời mình, `referee_id` chưa từng được ghi (constraint unique đã chặn ở DB,
  nhưng trả lỗi rõ ràng ở tầng API trước). Ghi `referrals` với `rewarded_at = null` (CHƯA thưởng
  ngay — chờ điều kiện).
- Điều kiện thưởng thật sự (chống gian lận — bắt buộc theo tài liệu chiến lược §3 Vòng 2): kích
  hoạt ở **đúng chỗ trong code hiện tại ghi nhận "hoàn thành 1 phiên học"** — cần tìm chỗ đó
  trước khi code (đọc `api/challenge.ts` hoặc nơi ghi `chat_sessions`/`speaking_sessions` — xác
  nhận sự kiện "hoàn thành phiên" nằm ở đâu, tránh đoán). Khi điều kiện đạt: set `rewarded_at`,
  cấp cho **cả referrer và referee** N ngày Pro bằng cách cập nhật `profiles.plan`/
  `plan_expires_at` — tái dùng đúng logic `resolvePlan`/cách `admin-grant-plan.ts` đang cấp
  (cộng dồn nếu user đã có Pro/VIP còn hạn, không ghi đè xuống thấp hơn — cần hàm helper riêng,
  đừng copy-paste logic từ `admin-grant-plan.ts`, factor ra `api/_lib/planGrant.ts` dùng chung
  cho cả 2 nơi).
- Trần chống lạm dụng: đếm `rewarded_at is not null` theo `referrer_id`, chặn ở ngưỡng 10 (đọc
  cấu hình), rate limit endpoint `claim` theo IP giống các handler khác.

### UI

- Trang/khối "Mời bạn" trong `Profile.tsx`: hiện mã + link `?ref=MÃ`, nút copy, đếm "đã mời
  X/10 lượt được thưởng".
- Landing page (M1.2) và trang đăng ký đọc `ref=` từ query, gọi `POST /api/referral/claim` NGAY
  SAU khi tạo tài khoản thành công (không phải trước).
- Thông điệp hết lượt (M1.1) trỏ sang trang mời bạn.

### Tiêu chí chấp nhận

- Test unit cho `planGrant` helper: cộng dồn đúng khi đã có Pro/VIP còn hạn; ca biên hết hạn
  đúng lúc; không cho âm ngày.
- Test cho `claim`: tự mời mình → lỗi; mời trùng người đã được người khác mời → lỗi; vượt trần
  10 → không ghi thêm nhưng không lỗi cứng (referee vẫn đăng ký được, chỉ referrer không được
  thưởng thêm).
- Không lộ được `referrer_id`/danh sách người bị mời của người khác qua bất kỳ endpoint công khai.
- Chi phí kiểm chứng: viết rõ trong PR — 1 lượt referral thành công tốn tối đa bao nhiêu (N ngày
  Pro × hạn mức Pro/ngày × giá vốn trung bình 1 lượt — cần số từ M1.7/đo thật, không bịa).

**Người làm:** **Opus tự làm** (route:complex theo CLAUDE.md mục 3) — đụng nhiều file liên quan
nhau (schema + 2 API + 2 nơi UI + logic chống gian lận + tiền thật), cần hiểu sâu ngữ cảnh
(đúng chỗ "hoàn thành phiên" nằm ở đâu trong code hiện tại). Có thể giao `spec-executor` CHỈ SAU
KHI Opus đã tự xác định chính xác điểm chạm "hoàn thành phiên" và viết đặc tả kín 100% (schema
DDL, API, điểm chạm code, tiêu chí chấp nhận đầy đủ — đúng định nghĩa route:spec).

**Phụ thuộc:** M1.1 (thông điệp trỏ đúng chỗ), M1.7 (đo hiệu quả), khuyến nghị làm sau khi
M1.2/M1.3 đã ổn định.

---

## Bảng chia việc tổng hợp

| #    | Hạng mục                | Người làm                           | Route      | Phụ thuộc          | Đụng schema?        |
| ---- | ----------------------- | ----------------------------------- | ---------- | ------------------ | ------------------- |
| M1.1 | Sửa thông điệp hết lượt | Haiku                               | mechanical | không              | không               |
| M1.5 | PDF quà tặng            | Sonnet                              | standard   | không              | không               |
| M1.7 | Analytics tối thiểu     | Sonnet (+Opus review)               | standard   | không              | có (bảng mới)       |
| M1.2 | Landing page            | Sonnet                              | standard   | M1.7               | không               |
| M1.3 | Chia sẻ kết quả         | Sonnet                              | standard   | M1.7 (khuyến nghị) | không               |
| M1.8 | Banner hạ dần hạn mức   | Sonnet (code) + bạn+Opus (vận hành) | standard   | không              | không               |
| M1.4 | Referral                | **Opus**                            | complex    | M1.1, M1.7         | có (cột + bảng mới) |

## Việc CẦN BẠN QUYẾT trước khi giao việc (không tự đoán)

1. Câu chữ chính xác cho thông điệp hết lượt (M1.1) — dùng câu có nhắc "mời bạn" (chờ M1.4)
   hay câu trung tính trước?
2. Route `/` landing (M1.2): tách riêng khỏi `/login` hay giữ chung nhưng đổi nội dung khi chưa
   đăng nhập? Ảnh hưởng cách định tuyến trong `App.tsx`.
3. Số ngày Pro thưởng khi referral thành công (đề xuất 7 ngày) + trần 10 lượt/tài khoản — chốt
   số trước khi Opus code.
4. Ngày cụ thể bắt đầu hạ hạn mức (M1.8) — đề xuất tháng 11/2026, cần bạn chốt.
5. Có triển khai `M1.4` (referral) đợt này không, hay dừng ở M1.1/M1.2/M1.3/M1.5/M1.7/M1.8 trước
   và đánh giá lại sau 4–6 tuần có số liệu?

Sau khi bạn trả lời, tôi sẽ tạo các nhánh/PR riêng cho từng hạng mục độc lập (M1.1, M1.5, M1.7
trước) và cập nhật `PROGRESS.md`.

---

## [3] Tài liệu: dac-ta-thanh-toan-2026-07-25.md

_(Chi tiết nguồn gốc: `dac-ta-thanh-toan-2026-07-25.md`)_

# Đặc tả triển khai — Thanh toán Pro/VIP (M2)

> **Cập nhật 2026-07-27 (lần 2 — CHỐT CUỐI, đã code xong):** đổi cấu trúc giá sang 3 chu kỳ
> (10 ngày / tháng / năm), số tiền khác hẳn bản nháp lần 1 cùng ngày. **Code M2 đã hoàn tất** —
> xem `PROGRESS.md` mục "M2 Thanh toán Pro/VIP qua SePay: CODE ĐÃ XONG" để biết chi tiết file/
> API/test. Mục này giữ nguyên làm tài liệu tham chiếu kiến trúc, phần "Bảng giá" bên dưới đã
> cập nhật theo số cuối cùng.
>
> Cập nhật 2026-07-27 (lần 1): chốt giá gói năm (Pro 500k / VIP 750k) và **đổi cổng thanh toán
> từ PayOS sang SePay** — PayOS đòi tư cách hộ kinh doanh, SePay chỉ cần tài khoản ngân hàng cá
> nhân. Mô hình SePay khác PayOS về bản chất (theo dõi sao kê thay vì cổng trung gian) nên các
> mục Kiến trúc / Schema / API / Bảo mật đã được viết lại theo tài liệu thật.
>
> Ngày soạn: 2026-07-25 · **Đảo ngược quyết định 2026-07-11** trong `CLAUDE.md` mục 13.3
> ("miễn phí, không làm thanh toán cho tới khi người dùng chủ động yêu cầu lại") — bạn đã chủ
> động yêu cầu hôm nay, quyết định mới **thay thế** quyết định cũ.

## Bảng giá đã chốt (CUỐI CÙNG, 2026-07-27)

> Thay bảng giá "Tháng/Năm" nháp trước đó cùng ngày — cấu trúc đổi sang **3 chu kỳ**, thêm gói
> 10 ngày (giá vào rẻ, dễ dùng thử thật thay vì chỉ dùng thử miễn phí 5 ngày).

| Gói  | 10 ngày | Tháng   | Năm                          |
| ---- | ------- | ------- | ---------------------------- |
| Free | —       | —       | 0đ (10 lượt/ngày mỗi chế độ) |
| Pro  | 20.000đ | 40.000đ | 360.000đ                     |
| VIP  | 30.000đ | 75.000đ | 500.000đ                     |

Lưu ở bảng `public.plan_prices` (migration `0014`) — đổi giá qua UPDATE trực tiếp hoặc endpoint
admin sau này, KHÔNG cần deploy. `CYCLE_DAYS` (`api/_lib/prices.ts`): `10day`=10,
`month`=30, `year`=365.

Bảng giá này là giá NIÊM YẾT. Dịp lễ/Tết sẽ giảm thêm — xem mục "Khuyến mãi dịp lễ" bên dưới.

**Dùng thử Pro 5 ngày (đã làm xong, PR #347):** xác thực email → tặng 5 ngày Pro, mỗi tài khoản
đúng 1 lần vĩnh viễn (`api/_lib/trial.ts`, cột `profiles.trial_granted_at`). Đây là bậc thang
trước khi mua — khi làm UI giá nhớ nối tiếp: người vừa hết hạn dùng thử là nhóm dễ chuyển đổi
nhất, nên chào giá đúng lúc đó.

## Khuyến mãi dịp lễ (quyết định 2026-07-27)

Giá lễ/Tết sẽ giảm sâu hơn giá niêm yết, thời điểm và mức giảm quyết định sau từng đợt. Yêu cầu
kỹ thuật rút ra từ đó — phải tính TRƯỚC khi code, không chắp vá sau:

1. **Giá nằm trong `app_settings`, KHÔNG hard-code** (đã ghi ở mục Schema) — đổi giá dịp lễ chỉ
   là gọi `/api/admin-settings`, **không cần deploy**. Đây là lý do chính không được nhét bảng
   giá vào code.
2. **Cần cả giá niêm yết lẫn giá khuyến mãi**, không chỉ một con số: UI muốn hiện "gạch giá cũ →
   giá mới" thì phải biết cả hai. Đề xuất mỗi gói/chu kỳ lưu `price_vnd` (niêm yết) +
   `sale_price_vnd` (nullable = không giảm) + `sale_until` (nullable).
3. **Đơn đã tạo giữ nguyên giá lúc tạo** — `payments.amount_vnd` đã chốt điều này (đọc lại bảng
   giá sau khi hết khuyến mãi sẽ ra số khác, tuyệt đối không làm vậy).
4. **Server tự đọc giá, không nhận giá từ client** — kể cả trong lúc khuyến mãi. Client gửi
   `plan` + `cycle`, server tự quyết trả bao nhiêu tiền (nguyên tắc bảo mật #2 bên dưới).
5. `app_settings` đã có sẵn `promoUntil` nhưng đó là **khuyến mãi HẠN MỨC LƯỢT DÙNG** (nới lượt
   miễn phí), khác hoàn toàn với giảm GIÁ BÁN. Đừng dùng lại cùng một trường cho hai việc — đặt
   trường riêng, nếu không sẽ có ngày nới lượt mà vô tình giảm giá theo (hoặc ngược lại).

Hạn mức Pro/VIP: giữ cấu hình hiện có trong `app_settings` (Pro 100 lượt/ngày/chế độ, VIP gần
không giới hạn) — chỉnh qua `/api/admin-settings`, không phải việc của đợt này.

**Free 5→10 lượt/ngày:** đổi qua `/api/admin-settings` (field `free_*_limit` trong bảng
`app_settings`) — **không cần deploy, làm được ngay**, độc lập với toàn bộ việc code thanh toán
bên dưới. Đề xuất làm việc này trước tiên, hôm nay.

## Cổng thanh toán: SePay (chốt 2026-07-27 — THAY PayOS)

> Mục này viết lại sau khi ĐỌC TÀI LIỆU THẬT của SePay (không suy đoán): `docs.sepay.vn`
> — [tích hợp webhook](https://docs.sepay.vn/tich-hop-webhooks.html) ·
> [lập trình webhook](https://docs.sepay.vn/lap-trinh-webhooks.html) ·
> [lập trình cổng thanh toán](https://sepay.vn/lap-trinh-cong-thanh-toan.html).

**Vì sao đổi:** PayOS yêu cầu tư cách hộ kinh doanh/doanh nghiệp (giấy tờ, MST) — điểm chặn thật
với dự án cá nhân. SePay chỉ cần **tài khoản ngân hàng cá nhân**.

**SePay hoạt động KHÁC HẲN PayOS — đây là chỗ dễ hiểu nhầm nhất, đọc kỹ:**

SePay **không phải cổng thanh toán trung gian**. Nó không giữ tiền, không có trang thanh toán,
**không có `checkoutUrl`, không có redirect trở về**. Nó chỉ **theo dõi tài khoản ngân hàng của
bạn** và bắn webhook mỗi khi có tiền vào. Tiền chảy thẳng từ người mua vào tài khoản của bạn.

Hệ quả kéo theo, phải thiết kế đúng ngay từ đầu:

1. **Khớp đơn bằng NỘI DUNG CHUYỂN KHOẢN**, không có mã đơn do cổng cấp. Ta tự sinh một mã
   thanh toán duy nhất (vd `ENVI7K2M9Q`), in vào nội dung chuyển khoản, rồi dò lại mã đó trong
   trường `content`/`code` của webhook.
2. **Không có redirect** → giao diện phải **tự hỏi lại server** (poll) xem đơn đã trả tiền chưa,
   thay vì chờ người dùng quay về từ trang cổng.
3. **Không cần gọi API tạo đơn phía SePay.** Mã QR chỉ là một URL ảnh dựng sẵn
   (`https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...`) — server ta tự dựng, không
   phụ thuộc API ngoài lúc tạo đơn. Ít điểm hỏng hơn PayOS đáng kể.
4. **Người dùng có thể gõ sai/thiếu nội dung chuyển khoản.** Tiền vẫn về tài khoản nhưng webhook
   không khớp được đơn nào → phải có đường xử lý tay (xem "Ca lệch" bên dưới). Đây là nhược điểm
   thật của mô hình này, KHÔNG được lờ đi.

**Casso** cùng mô hình (theo dõi sao kê + webhook). Chọn **SePay** vì tài liệu lập trình rõ hơn,
có sẵn dịch vụ ảnh VietQR, và nêu rõ cơ chế retry/chống trùng. Nếu sau này SePay có vấn đề, đổi
sang Casso chỉ phải sửa lớp `api/_lib/sepay.ts` — phần còn lại (bảng `payments`, `planGrant`)
dùng chung.

## Kiến trúc tổng quan

```
User bấm "Nâng cấp Pro/VIP" (Profile.tsx)
  → POST /api/checkout { plan: 'pro'|'vip', cycle: 'month'|'year' }
  → server đọc giá từ app_settings, sinh payment_code duy nhất,
    tạo bản ghi `payments` (status='pending')
  → trả về { paymentCode, amountVnd, qrUrl, bankAccount, bankName, expiresAt }
  → UI hiện mã QR + hướng dẫn chuyển khoản (KHÔNG rời khỏi app, không redirect)
  → người dùng quét QR, chuyển khoản
  → tiền về tài khoản ngân hàng → SePay bắn POST /api/payment-webhook
  → server xác thực header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`
  → lọc transferType === 'in', dò payment_code trong content/code
  → chống trùng theo SePay `id` (cột provider_txn_id, UNIQUE)
  → kiểm tra số tiền ĐỦ, cập nhật status='paid' + cấp gói qua grantPlanDays()
    (api/_lib/planGrant.ts — TÁI DÙNG, đã dùng cho referral + trial + admin cấp tay)
  → trả về {"success":true} (đúng dạng SePay chờ đợi)
  → UI đang poll GET /api/payment-status?code=... thấy 'paid' → báo thành công,
    fetch lại hồ sơ để hiện gói mới
```

## Schema

`postgres/migrations/00XX_payments.sql`:

```sql
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  plan          text not null check (plan in ('pro', 'vip')),
  cycle         text not null check (cycle in ('month', 'year')),
  amount_vnd    integer not null,          -- số tiền THẬT tại thời điểm tạo đơn (không đọc lại
                                            -- bảng giá sau này — giá có thể đổi, đơn cũ giữ giá cũ)
  provider      text not null default 'sepay',
  payment_code  text not null,             -- mã TA tự sinh, in vào nội dung chuyển khoản để
                                            -- webhook dò lại. Đây là khoá khớp đơn duy nhất.
  provider_txn_id text,                    -- trường `id` của SePay — khoá CHỐNG TRÙNG webhook
  status        text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,      -- đơn quá hạn coi như bỏ (mã QR không dùng nữa)
  paid_at       timestamptz
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);
-- Mã thanh toán PHẢI duy nhất tuyệt đối: hai đơn trùng mã = không biết tiền trả cho đơn nào.
create unique index if not exists payments_code_idx on public.payments(payment_code);
-- Chống trùng webhook ở TẦNG DB, không chỉ tầng code: SePay retry tới 7 lần trong 5 giờ.
create unique index if not exists payments_provider_txn_idx on public.payments(provider_txn_id)
  where provider_txn_id is not null;
```

**Sinh `payment_code`:** tiền tố cố định + phần ngẫu nhiên an toàn (`randomInt`/`randomBytes` của
`node:crypto`, KHÔNG `Math.random` — cùng nguyên tắc đã áp ở `emailVerification.ts`). Tiền tố cố
định để cấu hình lọc "tiền tố mã thanh toán" trên dashboard SePay, tránh webhook bắn cho mọi
giao dịch không liên quan trong tài khoản cá nhân. Tránh ký tự dễ đọc nhầm (0/O, 1/I/L) vì có
người sẽ **gõ tay** nội dung chuyển khoản thay vì quét QR.

Giá bán KHÔNG hard-code trong code — thêm vào `app_settings` (giống `limits`) để đổi giá không
cần deploy, đúng khuôn mẫu hiện có (`api/_lib/settings.ts`). Mỗi gói/chu kỳ cần 3 trường: giá
niêm yết, giá khuyến mãi (nullable), hạn khuyến mãi (nullable) — xem mục "Khuyến mãi dịp lễ".

## API cần thêm

1. `POST /api/checkout` (cần đăng nhập): validate `plan`∈{pro,vip}, `cycle`∈{month,year} bằng
   Zod; đọc giá từ `app_settings`; sinh `payment_code`; tạo `payments` row `pending` kèm
   `expires_at`; trả `{ paymentCode, amountVnd, qrUrl, bankAccount, bankName, expiresAt }`.
   **Không gọi API ngoài** — `qrUrl` chỉ là URL ảnh dựng chuỗi. Rate limit theo user (không phải
   chỉ IP — 1 user không cần bấm nâng cấp liên tục, và mỗi lần bấm là 1 dòng `payments` rác).
2. `POST /api/payment-webhook` (SePay gọi, KHÔNG có Bearer token của app):
   - Xác thực header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`, so sánh bằng
     **`timingSafeEqual`** (`node:crypto`), không phải `===`.
   - Bỏ qua `transferType !== 'in'` (tiền ra khỏi tài khoản không liên quan).
   - Dò `payment_code` trong `code` rồi tới `content` (regex theo tiền tố cố định, không phân
     biệt hoa thường — ngân hàng có thể viết hoa toàn bộ nội dung chuyển khoản).
   - **Chống trùng bằng DB**: ghi `provider_txn_id` = `id` của SePay với ràng buộc UNIQUE; lỗi
     `23505` (unique_violation) = webhook lặp → trả `{"success":true}` và DỪNG, không cấp lại.
     SePay retry tới **7 lần trong 5 giờ**, đây là ca chắc chắn xảy ra chứ không phải hiếm.
   - **Kiểm tra số tiền**: `transferAmount >= payments.amount_vnd`. Trả thiếu → **không cấp gói**,
     giữ `pending` + ghi log để xử lý tay (đừng tự cấp gói khi chưa đủ tiền, cũng đừng nuốt tiền
     im lặng).
   - Đủ điều kiện → `status='paid'`, `paid_at=now()`, gọi `grantPlanDays()` đúng số ngày theo
     `cycle` (30 hoặc 365), ghi `logSecurityEvent`.
   - **Luôn trả `{"success":true}`** khi đã xử lý xong (kể cả ca lặp) — đúng dạng SePay chờ đợi;
     trả khác sẽ khiến SePay retry vô ích.
3. `GET /api/payment-status?code=...` (cần đăng nhập): UI poll endpoint này vì **SePay không
   redirect người dùng về**. Chỉ trả đơn THUỘC VỀ user đang đăng nhập (kiểm `user_id` khớp token
   — nếu không, ai cũng dò được trạng thái đơn người khác). Poll thưa (vd 3–5 giây/lần) và tự
   dừng khi hết `expires_at`.
4. `GET /api/payment-history` (cần đăng nhập): trả lịch sử đơn của chính user đó (Profile hiển
   thị) — tự kiểm `user_id` khớp token, đúng nguyên tắc kỹ thuật #2.

## UI

- `Profile.tsx`: khối "Nâng cấp" hiển thị 2 gói × 2 chu kỳ + giá (gạch giá niêm yết nếu đang
  khuyến mãi) → gọi `/api/checkout`.
- **Màn hình chuyển khoản** (thay cho việc redirect sang cổng): ảnh QR + số tài khoản + số tiền +
  **nội dung chuyển khoản có nút sao chép** (bắt buộc — gõ tay là nguồn lỗi khớp đơn lớn nhất),
  đếm ngược tới `expires_at`, và trạng thái đang chờ. Poll `/api/payment-status` cho tới khi
  `paid` → báo thành công + fetch lại hồ sơ để hiện gói mới.
- Nhắc rõ ràng: "chuyển khoản đúng nội dung, nếu sai hãy liên hệ" — vì ca gõ sai nội dung là có
  thật và người dùng cần biết đường xử lý.
- Hiển thị lịch sử thanh toán + gói/hạn hiện tại (đã có sẵn phần hiển thị plan).

## Ca lệch (BẮT BUỘC có đường xử lý — mô hình sao kê không hoàn hảo)

1. **Chuyển đúng tiền, sai/thiếu nội dung** → webhook không khớp đơn nào. Tiền ĐÃ vào tài khoản.
   Xử lý: ghi log giao dịch không khớp, admin đối chiếu tay rồi cấp gói bằng
   `/api/admin-grant-plan` (đã có sẵn). Không tự đoán "chắc là của user này".
2. **Chuyển thiếu tiền** → giữ `pending`, admin xử lý tay (hoàn hoặc yêu cầu chuyển bù).
3. **Chuyển thừa tiền** → vẫn cấp gói (đủ điều kiện `>=`), phần thừa xử lý tay.
4. **Đơn quá hạn rồi tiền mới về** → vẫn nên cấp gói nếu khớp mã (người dùng đã trả tiền thật);
   `expires_at` chỉ để dọn UI, KHÔNG phải lý do từ chối tiền đã nhận.

## Bảo mật (mục bắt buộc đọc kỹ trước khi code — CLAUDE.md mục 12: đụng thanh toán phải cẩn trọng)

1. **Webhook phải xác thực** — không tin bất kỳ request nào tự xưng "SePay gọi tới". Bắt buộc:
   API Key đúng (so sánh `timingSafeEqual`). Nên thêm: whitelist IP SePay ở tầng Nginx. Ghi chú:
   danh sách IP do SePay công bố có thể đổi — whitelist là lớp bổ sung, **không thay thế** API
   Key, để tránh ngày SePay đổi IP thì mất sạch webhook.
2. **Không tin số tiền/plan từ client** — số tiền lấy từ `payments.amount_vnd` đã lưu lúc tạo đơn
   (server tự đọc giá từ `app_settings`). Webhook chỉ dùng để KIỂM TRA số tiền đủ hay không, không
   phải để quyết định giá.
3. **Idempotency ở tầng DB** (unique `provider_txn_id`), không chỉ kiểm `status` ở tầng code —
   hai webhook retry song song có thể cùng đọc thấy `status='pending'`.
4. **Log đầy đủ** mọi giao dịch — chỉ log mã đơn/trạng thái/số tiền, KHÔNG log
   `description`/`content` thô (chứa tên người chuyển = dữ liệu cá nhân).
5. **Số tài khoản ngân hàng đặt trong biến môi trường**, không hard-code — đổi tài khoản không
   phải sửa code, và tránh lộ trong repo công khai.
6. **Không có cổng thanh toán nào chạy trong CI/test thật** — viết test bằng cách giả lập webhook
   payload nội bộ (mock), không gọi PayOS thật trong `npm test`.
7. **Biến môi trường**: `SEPAY_WEBHOOK_API_KEY` (khoá tự đặt, khai trên dashboard SePay),
   `SEPAY_BANK_ACCOUNT` (số tài khoản nhận tiền), `SEPAY_BANK_CODE` (mã ngân hàng dùng cho URL
   ảnh QR) — thêm vào `.env.example` với giá trị GIẢ, KHÔNG commit giá trị thật (nguyên tắc #6).

## Việc CẦN BẠN LÀM TAY (ngoài khả năng AI, giống Sentry/branch protection đã ghi trong CLAUDE.md)

- Đăng ký tài khoản SePay + liên kết tài khoản ngân hàng nhận tiền (**chỉ cần tài khoản cá
  nhân**, không cần hộ kinh doanh/MST như PayOS).
- Trên dashboard SePay: tạo webhook trỏ về `https://en-vi.donghanhcungban.com/api/payment-webhook`,
  chọn chứng thực **API Key**, đặt khoá trùng `SEPAY_WEBHOOK_API_KEY` trong `.env` VPS, và **lọc
  theo tiền tố mã thanh toán** để webhook chỉ bắn cho giao dịch của app (tài khoản cá nhân còn
  nhiều giao dịch riêng — không lọc là mỗi lần ai chuyển tiền cho bạn đều gọi vào server).
- Cân nhắc nghĩa vụ thuế/hoá đơn khi bắt đầu có doanh thu thật — ngoài phạm vi kỹ thuật, nên hỏi
  người có chuyên môn (không phải việc AI tư vấn).
- **Lưu ý riêng của mô hình này:** tiền vào thẳng tài khoản cá nhân của bạn, không qua trung gian
  giữ hộ. Nên dùng một tài khoản ngân hàng RIÊNG cho app để đối chiếu sổ sách dễ, không lẫn với
  chi tiêu cá nhân.

### Bẫy thực tế đã gặp khi cấu hình (2026-07-30, chuyển khoản test bị "mất tích")

Chuyển khoản test vào đúng tài khoản, tiền báo có, nhưng đơn hàng không tự chuyển `paid`. Server
hoàn toàn không lỗi (curl thẳng vào `/api/payment-webhook` trả `success:true` bình thường) —
nguyên nhân nằm ở 2 chỗ cấu hình trên dashboard SePay, không phải code:

1. **Cấu hình chung → Cấu trúc mã thanh toán**: SePay có bước tự tách "mã thanh toán" ra khỏi nội
   dung chuyển khoản thô, dùng để lọc trước khi gọi webhook. Mẫu mặc định để trường **"Là"** ở
   **"Số nguyên"** — nhưng mã app sinh ra (`generatePaymentCode` trong `api/_lib/sepay.ts`) có cả
   chữ lẫn số (bảng ký tự `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, cố tình bỏ 0/O/1/I/L). Kết quả: SePay
   không nhận diện được mã (trường "MÃ THANH TOÁN" trong chi tiết giao dịch để trống `-`) dù nội
   dung có chứa `ENVIxxxxxxxx` rõ ràng → webhook bị bộ lọc "chỉ gửi khi có mã thanh toán" chặn
   ngay từ đầu, không hề gọi ra server (lịch sử webhook trống trơn, dễ nhầm là chưa cấu hình
   webhook). **Phải đổi "Là" sang "Số và chữ".**
2. **Webhook → tab Bảo mật → API Key**: dán key dài (chứa `+ / =`) vào ô input của SePay dễ bị
   dính khoảng trắng thừa ở giữa chuỗi (do UI tự ngắt dòng khi dán) → key không khớp
   `SEPAY_WEBHOOK_API_KEY` trên server → webhook gọi tới nơi nhưng bị `401 Unauthorized`. Xoá
   trắng ô rồi dán lại, kiểm tra kỹ không có khoảng trắng ẩn giữa chuỗi.

Cách chẩn đoán nhanh khi gặp lại: `pm2 logs english-tutor --lines 300 --nostream | grep -i sepay`
— nếu KHÔNG có dòng nào (kể cả `SEPAY_WEBHOOK_UNAUTHORIZED`), nghĩa là request chưa từng chạm
tới server → lỗi nằm ở cấu hình mã thanh toán (bẫy #1). Nếu thấy `SEPAY_WEBHOOK_UNAUTHORIZED`,
đó là bẫy #2. Vào SePay → mục Giao dịch → mở chi tiết giao dịch cần tra → xem trường "MÃ THANH
TOÁN" có bị trống không, và dùng nút "Gọi lại" (resend) để test lại không cần chuyển khoản mới.

## Tiêu chí chấp nhận

- Test unit cho `planGrant`: cộng dồn đúng ngày, không âm (đã có sẵn từ đợt referral/trial).
- Test webhook — **chống trùng**: 2 lần gọi cùng `id` của SePay → chỉ cấp gói 1 lần.
- Test webhook — **sai khoá**: thiếu/sai `Authorization` → 401, KHÔNG cấp gói.
- Test webhook — **thiếu tiền**: `transferAmount` < `amount_vnd` → không cấp gói, đơn giữ `pending`.
- Test webhook — **không khớp mã**: nội dung chuyển khoản không chứa mã nào → không cấp gói, không lỗi 500.
- Test webhook — **tiền ra**: `transferType='out'` → bỏ qua.
- Test Zod input `/api/checkout`: từ chối `plan`/`cycle` ngoài enum.
- Test `/api/payment-status`: user A KHÔNG xem được đơn của user B.
- Rà bảo mật riêng trước merge (không chỉ chạy CI): tự gửi webhook giả không có khoá hợp lệ →
  phải bị từ chối, không cấp gói.
- Cập nhật `CLAUDE.md` mục 13.3 (bỏ dòng "KHÔNG làm thanh toán") + `PROGRESS.md` mục nợ kỹ thuật
  #1 khi bắt đầu code thật.

## Người làm

**Opus tự làm (route:complex)** toàn bộ M2 — đụng tiền thật, bảo mật webhook, nhiều file liên
quan (schema + 4 API + UI + secrets), rủi ro cao nếu làm sai. Không giao subagent cho phần lõi
thanh toán/webhook. Có thể giao `standard-worker` riêng phần UI hiển thị giá/lịch sử ở
`Profile.tsx` SAU KHI API đã có đặc tả kín (route:spec).

## Thứ tự khuyến nghị

1. ~~Đổi Free 5→10 lượt/ngày qua `/api/admin-settings`~~ — độc lập, làm bất cứ lúc nào qua admin.
2. ~~Đọc tài liệu cổng thanh toán thật~~ **ĐÃ XONG 2026-07-27** (SePay, xem mục "Cổng thanh toán").
3. ~~Thêm bảng giá + migration `payments`~~ **ĐÃ XONG** — `plan_prices` (migration `0014`),
   `payments` (migration `0015`).
4. ~~`api/_lib/sepay.ts`~~ **ĐÃ XONG** — sinh mã, dựng URL QR, dò mã, xác thực API Key; 13 test.
5. ~~API `checkout`/`payment-webhook`/`payment-status`/`payment-history`/`plan-prices`~~
   **ĐÃ XONG** — 27 test handler-level phủ mọi ca ở mục "Tiêu chí chấp nhận" bên dưới.
6. ~~UI `Profile.tsx` + màn hình QR chuyển khoản~~ **ĐÃ XONG** — `UpgradeSection.tsx`.
7. ~~Cập nhật `CLAUDE.md`/`PROGRESS.md`~~ **ĐÃ XONG**.
8. **CÒN LẠI — việc tay của bạn:** đăng ký SePay + cấu hình `.env` VPS + webhook + lọc tiền tố
   → **chạy thử thanh toán thật số tiền nhỏ (vd 2.000đ) trước khi công bố rộng rãi.** Không có
   cách nào kiểm chứng đường tiền thật ngoài việc chuyển thật một lần. Nhớ `npm run migrate:pg`
   trước khi deploy (2 migration mới `0014`/`0015`).

## Quyết định 2026-07-27: theo đúng đề xuất, không hỏi lại

Người dùng chọn "làm theo đề xuất của bạn" cho 2 câu hỏi mở trước đó:

1. **Nhắc gia hạn:** trong app, KHÔNG gửi email (dự án chưa có hạ tầng email thật cho việc này).
   Hiện tại `/profile` đã hiện gói + `planExpiresAt` sẵn có qua `resolvePlan()` — chưa có banner
   nhắc riêng khi SẮP hết hạn; để ở đợt sau nếu thấy cần (không phải việc bắt buộc của M2).
2. **Downgrade/hoàn tiền:** KHÔNG hỗ trợ tự động. Ca hiếm xử lý tay qua `/api/admin-grant-plan`
   sẵn có — không cần viết thêm code cho M2.

---

## [4] Tài liệu: thu-thach-vlog-30-ngay.md

_(Chi tiết nguồn gốc: `thu-thach-vlog-30-ngay.md`)_

# Nghiên cứu & kế hoạch: Thử thách "English Vlog 1 phút/ngày" (30 ngày)

> Ngày: 2026-07-11 · Trạng thái: **ĐÃ TRIỂN KHAI XONG** (PR #230, #231, #233 + follow-up) — xem
> `PROGRESS.md`.
> **[2026-07-12] Lưu ý:** tính năng đã đổi tên "Vlog" → "Challenge" (route `/vlog` → `/challenge`,
> `vlogTopics.ts` → `challengeTopics.ts`, `lib/vlog.ts` → `lib/challenge.ts`...). Tài liệu này GIỮ
> NGUYÊN tên gọi/đường dẫn cũ vì là bản ghi nghiên cứu tại thời điểm thiết kế — đối chiếu tên file
> thật trong code khi cần.
> Nguồn ý tưởng: người dùng — "Mỗi ngày quay 1 video ngắn bằng tiếng Anh về một việc bạn làm. Ban
> đầu khó lắm nhưng tiến bộ cực nhanh."

## Bối cảnh & đề xuất

Thêm chế độ **"Vlog 1 phút" — thử thách 30 ngày**: mỗi ngày quay 1 video (trần **180 giây**, quyết
định người dùng 2026-07-11, nâng từ đề xuất ban đầu 60s) nói về đời sống theo chủ đề gợi ý, app
**tự nghe lại** (STT Whisper có sẵn) → **AI sửa lỗi + khen ngợi bằng tiếng Việt** (`/api/agent`) →
tô 1 ô trên bảng 30 ngày, huy hiệu mốc 3·7·14·21·30.

## Cơ sở sư phạm

Vlog trong EFL cho thấy tăng rõ độ trôi chảy/tự tin (91% sinh viên tự báo cáo cải thiện) và giảm
lo âu khi nói (82% giảm lo âu — rào cản số 1 của người Việt). **Nhưng độ chính xác không tự tăng**
nếu thiếu phản hồi sửa lỗi — đây chính là chỗ AI của app thêm giá trị (đúng "điểm khác biệt phải
giữ" ở CLAUDE.md mục 1). 30 ngày vì: streak ≥7 ngày trong 2 tuần đầu tăng mạnh khả năng duy trì đến
ngày 30; kết hợp streak + milestone giữ chân tốt hơn 35–60% so với 1 cơ chế đơn (nguồn: nghiên cứu
EFL vlog trên INATESOL/ResearchGate/BJET 2024; Duolingo blog về streak).

## 3 quyết định thiết kế quan trọng nhất (đều nghiêng về chi phí ≈ 0)

| #   | Quyết định                                                                        | Lý do                                                                                           |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Video KHÔNG upload lên server** — lưu trên máy (IndexedDB) + nút tải về         | 1 phút video ≈ 5–15MB; 30 ngày × nhiều người dùng sẽ vượt gói Storage miễn phí ngay             |
| 2   | **Chỉ gửi ÂM THANH lên server** để nhận diện (ghi song song 1 luồng audio-only)   | Tái dùng nguyên pipeline `/api/stt` (giới hạn ~6MB; audio opus ~1MB/phút → 180s ≈ 3MB, vẫn lọt) |
| 3   | **Không thêm cột đếm lượt mới** — 1 vlog tiêu 1 lượt `stt` + 1 lượt `chat` sẵn có | Free hiện 10 stt + 15 chat/ngày — thừa cho 1–2 vlog/ngày, không cần migration usage             |

## Thiết kế chính

- **Quay**: `getUserMedia` + 2 `MediaRecorder` song song (1 video, 1 audio-only gửi lên `/api/stt`).
- **Lưu video**: IndexedDB, giữ tối đa video ngày 1 + 7 video gần nhất (~100MB trần, dọn tự động),
  luôn có nút tải về trước khi bị dọn. Mất video khi xóa dữ liệu trình duyệt là đánh đổi chấp nhận
  được — transcript/feedback/tiến độ vẫn còn trên Supabase.
- **Server**: không thêm endpoint mới, tái dùng `/api/stt` + `/api/agent` (prompt riêng
  `src/prompts/vlog.ts`). Bảng mới `vlog_entries` (migration `0010`, RLS owner-only):
  `id · user_id · day (unique/user) · challenge_day · topic_id · transcript · feedback (jsonb) ·
duration_sec · word_count · created_at`.
- **Game hóa**: tái dùng pattern có sẵn — bảng 30 ô kiểu lịch, huy hiệu mốc, **vé nghỉ chung với
  streak** (1 ngày/tuần, không phát minh luật mới), màn tổng kết ngày 30 so sánh video ngày 1 vs 30.
- **30 chủ đề** sát đời sống Việt Nam (soạn tay, song ngữ, gợi ý — không ép buộc), dùng chung cho
  cả 2 chiều học qua `lib/direction.ts`.
- **Ràng buộc chất lượng**: lazy route/chunk riêng (ngân sách bundle hạn hẹp), mobile-first, 4
  theme, a11y AA, Zod validate, xử lý đủ nhánh lỗi (từ chối quyền camera → fallback audio-only, STT
  lỗi → hoàn lượt, mạng rớt → video vẫn còn local để nộp lại).

## Chi phí vận hành ước tính

STT + Claude feedback ≈ tương đương 1 lượt chat/ngày mỗi người; Supabase Storage = 0 (video không
upload); Supabase DB ~2–4KB text/người/ngày. Phù hợp định hướng "miễn phí cho cộng đồng".

## Rủi ro đã lưu ý

iOS Safari dùng codec video khác (mp4 không webm) → dò `isTypeSupported`; từ chối quyền camera →
fallback audio-only; ngại quay mặt → cho chọn audio-only từ đầu; nói quá ngắn để "điểm danh" →
yêu cầu ≥10s mới cho nộp; lạm dụng gọi AI nhiều lần/ngày → unique `user_id+day`, đếm lượt server.

## Câu hỏi đã chốt cùng người dùng (2026-07-11)

1. Lưu video local-only — ✅ đồng ý.
2. Tính lượt: 1 vlog = 1 lượt `stt` + 1 lượt `chat` sẵn có — ✅ đồng ý, không thêm cột.
3. Luật nghỉ dùng chung vé nghỉ streak — ✅ đồng ý.
4. Trần ghi hình nâng từ 60s lên **180 giây** — ✅ quyết định người dùng.

## Kết quả triển khai

PR #230 (nền tảng: data chủ đề, prompt AI, ghi hình + IndexedDB, migration 0010) → #231 (tự động
chạy migration khi deploy) → #233 (trang hoàn chỉnh: quay → nộp → feedback, bảng 30 ô, huy hiệu, vé
nghỉ, tổng kết) → follow-up (nhắc push, gate a11y 16 test). Còn ngoài phạm vi: i18n gộp từ điển
trung tâm, E2E cho luồng quay/nộp thật (cần mock `getUserMedia` sâu hơn).

---
