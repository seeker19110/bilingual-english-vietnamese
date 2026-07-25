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
