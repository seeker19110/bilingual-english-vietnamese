# Định vị DHCB: NỀN TẢNG NÂNG ĐỠ — nghiên cứu & nền móng cho tương lai (2026-08-24)

> **Tuyên bố của người dùng (2026-08-24):** _"định vị là nền tảng nâng đỡ mọi người, đồng hành
> với mọi người để nâng cao nền tảng của họ lên… để trình độ của họ càng ngày càng vượt trội…
> góp phần phát triển xã hội… nghiên cứu sâu rộng thêm để đề xuất cũng như đặt nền móng cho
> tương lai ấy."_
>
> Đây là **tài liệu định vị hợp nhất** — nó KHÔNG thay thế bộ 5 tài liệu năng lực/đồng hành
> 2026-08-23, mà đứng **trên** chúng: dịch tuyên bố định vị thành (1) một tuyên ngôn thành văn
> duy nhất, (2) bộ chỉ số "nâng đỡ" đo được, (3) các nguyên tắc hoà giải mâu thuẫn còn mở
> (miễn phí ↔ thương mại, cấm mạng xã hội ↔ vòng kèm cặp), và (4) lộ trình 3 chân trời **không
> phình phạm vi**. Trạng thái: **BẢN ĐỀ XUẤT — chờ người dùng duyệt** (CLAUDE.md mục 3).
>
> Đọc kèm: `dac-ta-kien-truc-platform-dhcb-2026-08-23.md` (kiến trúc thi hành) ·
> `dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` (8 luật + 4 cơ chế đóng góp) ·
> `luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md` (luật ngôn ngữ) ·
> `de-xuat-nang-cap-cai-to-2026-08-23.md` (bài học chống phình phạm vi).

---

## 0. Vấn đề tài liệu này giải quyết

Rà soát toàn bộ tài liệu hiện có (2026-08-24) cho thấy dự án đang có **ba lớp tuyên ngôn khác
nhau, chưa hợp nhất**:

1. Cấp nền tảng (`ke-hoach-nen-tang-donghanhcungban-2026-07-31.md` §1): _"người đồng hành của
   một người Việt suốt đời"_ — định vị theo **quan hệ**.
2. Cấp kiến trúc (`MASTER_SPEC.md`): _"Personal AI Companion Platform… một con người — một
   Companion — một Life Graph"_ — định vị theo **cấu trúc kỹ thuật**.
3. Cấp marketing (`chien-luoc-marketing-2026-07-25.md` §2.1): _"Nói tiếng Anh với AI — sai chỗ
   nào, được giảng lại bằng tiếng Việt. Miễn phí."_ — định vị theo **tính năng một môn**.

Cả ba đều đúng ở tầng của mình, nhưng **không lớp nào nói tại sao nền tảng tồn tại đối với xã
hội**. Cụm "miễn phí vì cộng đồng" chỉ là một dòng trong CLAUDE.md §13.3. Các khoảng trống đã
xác định được: chưa có tuyên ngôn sứ mệnh thành văn; chưa định nghĩa "nâng đỡ ai, đo bằng gì";
mâu thuẫn miễn phí ↔ thương mại chưa có nguyên tắc hoà giải; chưa có cam kết bền vững dài hạn;
chiều cộng đồng đang bị cấm 12 tháng trong khi cơ chế đóng góp mạnh nhất (vòng kèm cặp) cần
chính chiều đó; chính sách dữ liệu trẻ em và policy cho domain Life mới ở mức "một dòng rủi ro".

Tài liệu này lấp các khoảng trống đó. **Nó cố ý KHÔNG đề xuất tính năng mới nào cho quý này** —
bài học từ `de-xuat-nang-cap-cai-to-2026-08-23.md` (33/48 API mở rộng không có persistence, 8
service chết bị xoá 2.115 dòng) là: nền móng vững = nguyên tắc thành văn + hợp đồng (contract) +
chỉ số đo được, KHÔNG phải một đợt đẻ tính năng khi mới có 18 người dùng thật.

---

## 1. Tuyên ngôn định vị (đề xuất, chờ duyệt)

### 1.1 Câu định vị một đoạn

> **Đồng Hành Cùng Bạn là nền tảng nâng đỡ con người.** Nó đồng hành với mỗi người — từ học
> sinh đến người đi làm, ở thành phố hay vùng xa — để **nâng vững cái nền** (năng lực lõi theo
> độ tuổi, không ai bị bỏ lại dưới sàn), **mở lối lên đỉnh** (phát triển vượt bậc năng khiếu
> của riêng mỗi người), và khi người đó đã vững, **mời họ nâng đỡ người đi sau** — để sự phát
> triển của từng người cộng lại thành sự phát triển của xã hội.

### 1.2 Ba lời hứa (bản đối ngoại của các cam kết đã có)

| #   | Lời hứa                                        | Đã được thi hành bằng                                                       | Trạng thái                          |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------- |
| 1   | **Nâng NỀN** — không ai dưới sàn               | 30 năng lực lõi × 8 băng tuổi × thang 5 bậc; luồng người mới 5 câu → 1 việc | Đặc tả xong, chưa code (C1–C5)      |
| 2   | **Mở ĐỈNH** — vượt trội theo cách riêng        | Đường đỉnh tự chọn G1→G4, 5 tín hiệu, luật chuyển giao sang thầy người thật | Đặc tả xong, chưa code (C6)         |
| 3   | **Trả lại XÃ HỘI** — người vững nâng người sau | 4 cơ chế đóng góp (mục 3 dưới đây); vòng kèm cặp (C7)                       | Đặc tả sơ bộ — tài liệu này làm sâu |

### 1.3 Ba câu kiểm thử "KHÔNG phải"

Định vị chỉ sắc khi nói rõ mình không phải gì:

1. **Không phải máy chấm điểm người.** Luật số 1 giữ nguyên: kết quả chẩn đoán không bao giờ là
   màn hình chính; bảng từ cấm + 7 test bất biến T1–T7 chặn CI giữ nguyên hiệu lực.
2. **Không phải app tối ưu thời gian sử dụng.** Luật 8 + invariant #19 ("outcome learning
   outranks engagement") giữ nguyên: khi "tiến bộ đời thật" xung đột "phút trong app", chọn cái
   đầu.
3. **Không phải mạng xã hội.** Lệnh cấm 12 tháng trong kế hoạch nền tảng §1 giữ nguyên — mục 4
   dưới đây định nghĩa ranh giới để vòng kèm cặp KHÔNG vi phạm lệnh cấm này.

---

## 2. Nền móng lý thuyết & bằng chứng (nghiên cứu bổ sung 2026-08-24)

Định vị "nâng đỡ" không phải khẩu hiệu tự nghĩ — nó đứng trên bốn chân lý thuyết đã kiểm chứng,
mỗi chân trả lời một câu hỏi thiết kế:

### 2.1 Nâng đỡ nghĩa là mở NĂNG LỰC HÀNH ĐỘNG, không phải phát công cụ — Capability Approach (Amartya Sen)

Kinh tế học phát triển của Sen (nền của Chỉ số Phát triển Con người LHQ) phân biệt **phương
tiện** (cái app, cái khoá học) với **capability** — điều một người _thực sự làm được và trở
thành được_ nhờ phương tiện đó. Phát cho mỗi người một app là vô nghĩa nếu nó không đổi được
thành năng lực sống thật. Hệ quả thiết kế cho DHCB:

- Chỉ số thành công phải đo ở **đời thật của người dùng** (lên bậc nhờ rủi ro thật + phản hồi
  thật — đúng "luật vàng" thang 5 bậc đã có), không đo ở hoạt động trong app. Điều này khớp và
  củng cố Luật 8.
- "Tiếp cận công bằng" (cơ chế #2) không dừng ở "miễn phí": phải tính cả rào cản thiết bị, mạng,
  và **ngôn ngữ** — nguyên tắc "tiếng Việt là ngôn ngữ mẹ đẻ của trải nghiệm" chính là một quyết
  định capability, không phải quyết định UX đơn thuần.
- Sen nhấn mạnh **tự do lựa chọn** là một phần của phát triển — khớp Luật 1 (người dùng chốt mục
  tiêu) và luật "đường đỉnh luôn rút được".

### 2.2 Nâng NỀN bằng dạy kèm 1-1 là con đường có bằng chứng mạnh nhất — Bloom 2-sigma, có điều chỉnh trung thực

Bloom (1984): học sinh được kèm 1-1 theo mastery learning vượt ~2 độ lệch chuẩn so với lớp
thường — nhưng 1-1 người thật không thể phổ cập vì chi phí. Bằng chứng 2025–2026 về AI tutor:

- RCT tại Harvard (Kestin & Miller, Scientific Reports 2025): AI tutor thiết kế tốt **có thể
  ngang hoặc hơn** kèm 1-1 người thật trong phạm vi bài học có cấu trúc, với chi phí thấp hơn
  nhiều.
- Nhưng số liệu đại trà khiêm tốn hơn: RCT Khanmigo 2025 đo được **+0.34 SD** một học kỳ —
  khoảng 1/6 hiệu quả gia sư người thật. Education Next cảnh báo tách "science fiction" khỏi
  "science fact".

**Hệ quả cho DHCB — nói trung thực trong mọi tài liệu đối ngoại:** AI đồng hành là cách **rẻ
nhất để phổ cập** một phần đáng kể lợi ích của kèm 1-1, KHÔNG phải lời hứa "bằng gia sư người
thật ở mọi thứ". Đây chính là lý do tồn tại của **luật chuyển giao** (G2+ ở lĩnh vực cần thầy
thật → Companion nói thẳng giới hạn) — định vị nâng đỡ trung thực hơn, và vì thế bền hơn, mọi
định vị "AI thay thầy".

### 2.3 Trả lại XÃ HỘI có cơ sở nhận thức, không chỉ đạo đức — Protégé effect

Meta-analysis 65 nghiên cứu về tutoring (Cohen, Kulik & Kulik 1982) và chuỗi nghiên cứu
"learning by teaching" sau này: **người dạy kèm cũng học được** — hiểu sâu hơn, thái độ tích cực
hơn; hiệu ứng mạnh nhất khi thực sự dạy chứ không chỉ chuẩn bị dạy. Điều này biến cơ chế #1
(vòng kèm cặp) từ "việc thiện" thành **bước phát triển năng lực của chính người kèm** — đúng
nguyên tắc đã chốt: _"cách vững nhất để lên B4–B5 là dạy lại; người dùng đóng góp cho xã hội
TRONG LÚC phát triển bản thân, không phải sau khi phát triển xong."_ Vòng kèm cặp vì thế nằm
trên đường phát triển cá nhân (PRO-04), không phải tính năng cộng đồng gắn thêm.

### 2.4 Đồng hành lâu dài mà không gây lệ thuộc — SDT + scaffolding fading

Nghiên cứu SDT về AI companion 2025 (Frontiers in Psychology; BJET) xác nhận: AI đáp ứng được cả
ba nhu cầu tự chủ/năng lực/kết nối, NHƯNG rủi ro lớn nhất là **lệ thuộc** — người học dựa vào AI
thay vì xây năng lực tự điều chỉnh. Khung 8 luật đã chặn phần lớn rủi ro này; tài liệu này bổ
sung một nguyên tắc thành văn còn thiếu:

> **Nguyên tắc rút giàn giáo (scaffolding fading):** mục tiêu của Companion ở mỗi kỹ năng là
> **tự làm mình bớt cần thiết** ở kỹ năng đó. Thước đo: theo thời gian, tỷ lệ việc người dùng
> tự khởi xướng/tự hoàn thành phải tăng, tỷ lệ việc cần Companion nhắc phải giảm. Một Companion
> mà người dùng cần mãi ở cùng một mức là một Companion thất bại — dù chỉ số giữ chân rất đẹp.

Đây là hệ quả logic của Luật 8, nhưng cần thành văn riêng vì nó **đảo ngược** trực giác thương
mại thông thường (giữ chân = tốt) và sẽ chi phối thiết kế Companion về sau.

### 2.5 Bối cảnh Việt Nam — khoảng trống DHCB đứng vào

- Giai đoạn 2026–2030, chuyển đổi số giáo dục quốc gia ưu tiên nền tảng học tập thống nhất +
  học tập suốt đời, nhưng chính tài liệu ngành thừa nhận **hạ tầng và năng lực số chênh lệch
  vùng miền**; học sinh miền núi, vùng sâu thiếu thiết bị và mạng.
- Phong trào "Bình dân học vụ số" (ĐH Bách khoa HN + Bộ GD&ĐT) đạt >1,4 triệu học viên sau 1
  năm — chứng minh **nhu cầu học miễn phí quy mô lớn là có thật**, nhưng mô hình là khoá học
  đại trà (MOOC), không phải đồng hành cá nhân hoá.
- Khoảng trống DHCB đứng vào: **đồng hành cá nhân hoá, bằng tiếng Việt, chi phí gần 0 cho người
  học** — thứ MOOC không làm được (cá nhân hoá) và trung tâm tư nhân không làm được (giá).
  Chân dung gốc của marketing ("không đủ tiền học trung tâm", "giáo viên ở tỉnh nơi ít trung
  tâm") chính là đối tượng của định vị nâng đỡ — hai tài liệu khớp nhau sẵn, nay nói rõ ra.

---

## 3. "Trả lại xã hội" — làm sâu 4 cơ chế thành BẬC THANG ĐÓNG GÓP

Tài liệu F3 mục 9 đã đặt 4 cơ chế. Phần này làm sâu thành một **bậc thang** — mỗi bậc gắn vào
một mốc năng lực ĐÃ CÓ trong hệ 30 năng lực, để đóng góp là giai đoạn tự nhiên của lộ trình
(nguyên tắc đã chốt), không phải hệ thống điểm thưởng riêng:

| Bậc | Tên                  | Ai (mốc đã có)                         | Làm gì                                                               | Đo bằng                                         | Chân trời |
| --- | -------------------- | -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- | --------- |
| Đ0  | **Người học**        | Mọi người dùng                         | Học — sự tiến bộ của chính họ đã là đóng góp gốc                     | Chỉ số nâng đỡ (mục 5)                          | H1        |
| Đ1  | **Người để lại dấu** | Ngưỡng N2/N3 (sản phẩm công khai)      | Bài viết/ghi chú/mẹo học được chia sẻ công khai (cơ chế #3)          | Số sản phẩm công khai; lượt dùng lại            | H2        |
| Đ2  | **Người kèm**        | B3+ một mảng (PRO-04)                  | Được **mời** kèm 1 người đi sau, 30ph/tuần (cơ chế #1, vòng kèm cặp) | Số cặp hoạt động; số người lên bậc nhờ được kèm | H2–H3     |
| Đ3  | **Người mở đường**   | B4–B5 (dạy lại được, tạo tri thức mới) | Đóng góp lộ trình/tài liệu vào kho tri thức mở (cơ chế #4)           | Lượt dùng phần mở                               | H3        |

Cơ chế #2 (tiếp cận công bằng) không phải một bậc — nó là **mặt đất** dưới cả bậc thang, thành
nguyên tắc P1 ở mục 4.

**Ba luật giữ cho bậc thang không hỏng** (kế thừa + làm rõ):

1. **Mời, không ép** (luật cấm F3 §9 giữ nguyên): không nghĩa vụ, không chỉ tiêu, không điều
   kiện mở khoá. Không hiển thị "bậc đóng góp" như cấp bậc thành tích công khai — nếu không nó
   thành gamification ganh đua, vi phạm Luật 4 (không so với người khác).
2. **Chất lượng trước số lượng:** người kèm (Đ2) cần được xác nhận B3+ bằng bằng chứng E1–E3
   (không phải tự khai E4), và người được kèm luôn có quyền dừng/đổi. Kèm cặp là quan hệ 1–1 có
   khuôn (30ph/tuần, chủ đề rõ), KHÔNG phải chat tự do — đây là ranh giới với "mạng xã hội"
   (mục 4, P4).
3. **Đo tác động, không đo hoạt động:** chỉ số của Đ2 là "số người **lên bậc** nhờ được kèm",
   không phải "số giờ kèm". Nhất quán với capability approach: đo điều người ta làm được thêm,
   không đo lượng tương tác.

---

## 4. Năm nguyên tắc hoà giải các mâu thuẫn còn mở (đề xuất chốt)

Đây là phần "đặt nền móng" quan trọng nhất: các mâu thuẫn đã nêu ở mục 0 được hoà giải bằng
nguyên tắc thành văn, để mọi quyết định sau này có chỗ dựa.

**P1 — Tầng miễn phí đủ dùng thật, vĩnh viễn.** Hoà giải "miễn phí vì cộng đồng" ↔ "đã làm
thanh toán Pro/VIP": gói trả phí tồn tại để (a) làm van an toàn chi phí API và (b) người có
điều kiện **trợ giá chéo** cho người không có. Cam kết đo được: tầng miễn phí luôn đủ để một
người học nghiêm túc tiến bộ thật (đủ lượt cho nhịp học ngày), và **tỷ lệ người dùng hoạt động
thuộc nhóm miễn phí** là chỉ số sức khoẻ sứ mệnh (cơ chế #2), không phải chỉ số thất bại
chuyển đổi. Không bao giờ chuyển tính năng nâng đỡ lõi (nền, đỉnh, kèm cặp) thành paywall.

**P2 — Rẻ là năng lực chiến lược, không phải tình trạng tạm.** Kỷ luật chi phí hiện có (model
rẻ, cache TTS vĩnh viễn, VPS tự host, không quảng cáo trả tiền) chính là điều kiện tồn tại của
P1. Mọi tính năng mới phải trả lời "chi phí AI/người dùng là bao nhiêu và ai gánh" **trước khi**
code — bài học 5 đường AI không đếm lượt đã ghi ở `de-xuat-nang-cap-cai-to-2026-08-23.md` §2.1.

**P3 — Rút giàn giáo là mục tiêu, giữ chân là phương tiện** (mục 2.4). Khi thiết kế phải chọn
giữa "người dùng quay lại app" và "người dùng tự làm được không cần app", chọn cái sau.

**P4 — Ranh giới cộng đồng: quan hệ có khuôn, không phải dòng thời gian.** Lệnh cấm mạng xã hội
12 tháng giữ nguyên. Vòng kèm cặp KHÔNG vi phạm vì khác về bản chất: (a) 1–1, không công khai;
(b) có khuôn thời lượng + chủ đề; (c) không feed, không follow, không like, không xếp hạng;
(d) nền tảng ghép cặp và giữ an toàn, không tạo không gian đăng bài tự do. Nếu sau này một tính
năng cộng đồng vượt 4 tiêu chí đó → mặc định là mạng xã hội → cấm cho tới khi người dùng quyết
lại.

**P5 — An toàn cho người chưa thành niên đi trước tính năng.** Trước khi bất kỳ tính năng nào
cho băng tuổi 6–18 vượt khỏi phạm vi học một môn (ví dụ hồ sơ năng lực, kèm cặp có người thật):
phải có chính sách thành văn về (a) dữ liệu giọng nói + hồ sơ của trẻ (giữ tối thiểu, quyền xoá
đã có 2FA-free), (b) sự đồng ý của phụ huynh, (c) kèm cặp Đ2 với người chưa thành niên — mặc
định **không mở** cho tới khi có cơ chế an toàn riêng. Đây là nợ chính sách, ghi vào PROGRESS
như nợ kỹ thuật.

---

## 5. Đo cái đáng đo — bộ chỉ số NÂNG ĐỠ (đề xuất)

Khoảng trống lớn nhất của bộ tài liệu hiện tại: chỉ số đang đo (giữ chân, số phiên, chi phí
AI/người) đều là chỉ số **vận hành**, chưa có chỉ số **sứ mệnh**. Đề xuất — ít, đo được bằng dữ
liệu đã có hoặc sắp có, không cần hạ tầng mới:

**Chỉ số Bắc Đẩu (North Star):**

> **Số người LÊN BẬC thật mỗi quý** — lên bậc ở bất kỳ năng lực nào, với bằng chứng E1–E3
> (rủi ro thật + phản hồi thật), không tính tự khai E4.

Đây là con số duy nhất tóm được cả ba lời hứa: nền lên bậc, đỉnh lên giai đoạn, người được kèm
lên bậc. Nó miễn nhiễm với "đo hoạt động" vì bậc chỉ tăng theo luật vàng.

**Bốn chỉ số sứ mệnh phụ:**

| Chỉ số                                                       | Đo lời hứa | Nguồn dữ liệu                       |
| ------------------------------------------------------------ | ---------- | ----------------------------------- |
| Tỷ lệ người hoạt động thuộc nhóm miễn phí (P1)               | Trả lại XH | `profiles.plan` — đã có             |
| Thời gian quay lại sau gián đoạn (không phải độ dài streak)  | Nâng nền   | dữ liệu phiên — đã có, đổi cách đọc |
| Tỷ lệ việc tự khởi xướng / việc cần nhắc (P3, rút giàn giáo) | Nâng nền   | cần thêm khi làm C1+                |
| Số cặp kèm hoạt động + số người lên bậc nhờ được kèm         | Trả lại XH | khi làm C7                          |

**Anti-metrics — cấm dùng làm mục tiêu tối ưu** (được phép theo dõi để vận hành): tổng phút
trong app · độ dài streak · DAU vì chính nó · số thông báo đã gửi. Ghi thành văn để mọi phiên
làm việc sau không "tiện tay" tối ưu chúng.

---

## 6. Lộ trình 3 chân trời — đặt nền móng KHÔNG phình phạm vi

Nguyên tắc xếp: mỗi chân trời chỉ mở khi chân trời trước có **bằng chứng thật** (người dùng, số
đo), khớp nhịp cổng giai đoạn CLAUDE.md mục 3. Không mục nào ở đây là tính năng mới ngoài kế
hoạch C0–C7 đã đặc tả — tài liệu này chỉ **xếp thứ tự và gắn điều kiện mở**.

**H1 — Nền móng trên giấy + trong hợp đồng code (bây giờ → khi C0–C5 xong):**

- Chốt tuyên ngôn mục 1 + 5 nguyên tắc mục 4 + bộ chỉ số mục 5 (quyết định của người dùng).
- Đưa tuyên ngôn vào các tài liệu điều hành: CLAUDE.md mục 1 (một đoạn), trang giới thiệu
  `apps/hub` (khi có dịp sửa), `chien-luoc-marketing` (thông điệp nền tảng đặt cạnh thông điệp
  môn Anh).
- Thi hành C0 (hiến chương 8 luật thành ràng buộc kiểm được) → C1–C5 như đã đặc tả. Trong C1,
  dựng **contract rỗng cho vòng kèm cặp** (bảng + kiểu dữ liệu, chưa UI) như F3 §10.3 đã gợi ý
  — nền móng rẻ nhất cho H2.
- Trả nợ chính sách P5 (văn bản, không code).

**H2 — Bậc thang đóng góp Đ1 (khi C1–C5 chạy thật và có vài trăm người dùng thật):**

- Mở Đ1 (sản phẩm công khai) — chi phí hạ tầng gần 0, không có quan hệ người–người nên không
  đụng P4/P5.
- Bắt đầu đo 2 chỉ số sứ mệnh đầu tiên bằng dữ liệu thật; đánh giá lại tầng miễn phí theo P1.

**H3 — Vòng kèm cặp Đ2 + tri thức mở Đ3 (khi có đủ mật độ người dùng để ghép cặp — F3 đã ghi
rõ điều kiện này):**

- Bật C7 trên contract đã dựng ở H1; người lớn trước, chưa mở cho người chưa thành niên (P5).
- Kho tri thức mở (Đ3) cho người dùng B4–B5 — lúc đó mới có người đủ bậc để đóng góp.

**Điều KHÔNG làm ở mọi chân trời** (tái khẳng định): mạng xã hội/feed/xếp hạng công khai ·
marketplace gia sư · tối ưu chỉ số nghiện · hiển thị điểm năng lực lên UI (7 test bất biến giữ
nguyên) · tính năng mới không có persistence thật.

---

## 7. Rủi ro riêng của định vị "nâng đỡ"

| #   | Rủi ro                                                                            | Mức        | Xử lý                                                                                                                               |
| --- | --------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Định vị lớn, sản phẩm nhỏ** — nói "nâng đỡ mọi người" khi mới có 18 người dùng  | Cao        | Đối ngoại vẫn dẫn bằng thông điệp môn Anh cụ thể; tuyên ngôn nền tảng là kim chỉ nam nội bộ trước, công bố dần theo bằng chứng thật |
| R2  | **Đóng góp thành nghĩa vụ đạo đức ngầm** — người không kèm cặp cảm thấy thiếu sót | Cao        | Luật "mời, không ép" + không hiển thị bậc đóng góp như thành tích; giống luật "không có năng khiếu vẫn bình thường tuyệt đối"       |
| R3  | **Hứa 2-sigma quá lời** trong truyền thông                                        | Vừa        | Mục 2.2 là ngôn ngữ chuẩn: "phổ cập một phần đáng kể lợi ích kèm 1-1", kèm luật chuyển giao                                         |
| R4  | **Chỉ số Bắc Đẩu bị gian lận mềm** (nới lỏng tiêu chí lên bậc để số đẹp)          | Vừa        | Lên bậc chỉ nhận bằng chứng E1–E3; định nghĩa bậc nằm trong đặc tả F1, đổi phải qua PR có duyệt                                     |
| R5  | **An toàn kèm cặp** (người kèm không phù hợp)                                     | Cao khi H3 | Chỉ mở H3 khi có cơ chế: xác minh B3+, quyền dừng tức thì, kênh báo cáo; chưa có thì chưa bật                                       |

---

## 8. Việc đề xuất làm ngay (chờ người dùng duyệt)

1. **Duyệt tuyên ngôn mục 1** (hoặc sửa lời) — sau khi duyệt, tôi cập nhật CLAUDE.md mục 1 một
   đoạn ngắn dẫn về tài liệu này.
2. **Chốt 5 nguyên tắc P1–P5** — đặc biệt P1 (tầng miễn phí đủ dùng thật) vì nó ràng buộc giá.
3. **Chốt chỉ số Bắc Đẩu + anti-metrics** (mục 5).
4. Giữ nguyên kế hoạch C0–C7 đã có; chỉ bổ sung "contract rỗng vòng kèm cặp trong C1" (H1).
5. Ba câu hỏi mở của F3 §10.3 (C0 trước C1? · đường đỉnh mọi lứa tuổi? · C7 lúc nào?) vẫn chờ
   bạn — tài liệu này đề xuất: **có · mọi lứa tuổi · dựng contract ở C1, bật ở H3**.

---

## 9. Nguồn tham khảo ngoài (tra cứu 2026-08-24)

- Capability approach: Internet Encyclopedia of Philosophy — "Sen's Capability Approach"
  (iep.utm.edu/sen-cap); Oosterlaken & van den Hoven (eds.), _The Capability Approach,
  Technology and Design_, Springer 2012; "The place of technology in the Capability Approach",
  Oxford Development Studies 2017.
- Bloom 2-sigma & AI tutoring: Bloom (1984); Kestin & Miller, Scientific Reports 2025 (RCT
  Harvard); RCT Khanmigo 2025 (+0.34 SD, Educational Technology R&D); Education Next,
  "Two-Sigma Tutoring: Separating Science Fiction from Science Fact".
- Protégé effect / learning by teaching: Cohen, Kulik & Kulik 1982 (meta-analysis 65 nghiên
  cứu); Curiosity Notebook (arXiv:2108.09809); arXiv:2510.12944.
- SDT & AI companion: Frontiers in Psychology 2025 (fpsyg.2025.1568239); Pan, BJET 2025
  (bjet.70002); các nghiên cứu SDT-AI trên ScienceDirect 2025.
- Bối cảnh VN: Tạp chí Giáo dục — "Chuyển đổi số trong Giáo dục: định hướng 2026–2030";
  VietnamNet — nền tảng "Bình dân học vụ số" (>1,4 triệu học viên); Bộ KH&CN — "Giáo dục số".
