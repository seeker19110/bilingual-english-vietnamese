# research: Năng lực cá nhân theo độ tuổi × bậc thành thạo × ngành nghề (2026-08-23)

**Yêu cầu người dùng:** "nghiên cứu năng lực cá nhân theo các độ tuổi, chia theo giới tính, thâm
niên các ngành nghề… liệt kê để xác định và hướng dẫn cá nhân ở độ tuổi đó đạt được những năng lực
và khả năng đó."

**Đã làm:** tài liệu nghiên cứu + đặc tả
`docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` (trụ LIFE + CAREER). Nội dung:
6 khung khoa học nền (Erikson · Havighurst · Super · CHC/Hartshorne–Germine 2015 · Dreyfus ·
Baltes SOC) đối chiếu WEF Future of Jobs 2025 + OECD PIAAC 2024; **30 năng lực lõi** mã hoá
`CAP-<nhóm>-<số>` theo 6 nhóm COG/SEL/TEC/PRO/FIN/WEL; **bảng chính 8 băng tuổi** (khớp đúng 8
`LifeStageType` đã có) × năng lực trọng tâm × dấu hiệu đạt quan sát được × hành động 90 ngày;
thang 5 bậc thành thạo thay cho "số năm kinh nghiệm"; 8 họ ngành nghề (đỉnh nghề, cửa sổ then
chốt, rủi ro tự động hoá, nhánh chuyển hướng); công thức chấm + xếp hạng khoảng cách; 4 loại bằng
chứng; 7 rủi ro; kế hoạch 5 PR (C1→C5).

**3 quyết định thiết kế quan trọng (cần người dùng biết):**

1. **Giới tính KHÔNG dùng làm trục kỳ vọng năng lực.** Bằng chứng: hình phạt làm mẹ giải thích
   ~80% khoảng cách thu nhập theo giới; chênh lệch bám vào sự kiện sinh con + định kiến tuyển
   dụng, không bám vào khả năng. Thay bằng biến **"vai trò chăm sóc & gián đoạn nghề"** (tuỳ chọn,
   mở cho mọi giới) + đo thâm niên bằng **tháng hoạt động nghề**. Giới tính chỉ dùng cho nội dung
   sức khoẻ (nhóm WEL) — chỗ nó thực sự có ý nghĩa y khoa.
2. **Thâm niên đo bằng BẬC (Dreyfus B1–B5), không bằng SỐ NĂM** — kèm cờ cảnh báo "đóng băng kinh
   nghiệm" (≥6 năm nghề mà vẫn B2).
3. **Tái dùng `LifeStageType` 8 giai đoạn đã có** trong `lifeMilestoneMasteryService.ts` — KHÔNG
   tạo hệ giai đoạn thứ hai (bài học nợ N3 "hợp nhất hệ trùng").

**Chờ người dùng chốt trước khi viết code (mục 12.2 của tài liệu):** làm tới đâu (C1–C3 nền hay đủ
C1–C5 có UI) · có hỏi giới tính không · 8 họ nghề đã đủ cho tệp VN chưa (thiếu nông nghiệp, du
lịch–NHKS, logistics?) · ưu tiên băng tuổi nào trước (đề xuất: 18–38).

**Bổ sung cùng ngày — 2 tài liệu nữa (người dùng thu hẹp phạm vi + nêu tầm nhìn sản phẩm):**

- `docs/research/nang-luc-10-40-chi-tiet-2026-08-23.md` — người dùng chốt quãng **10–40**. Chia
  **6 băng nhỏ N1–N6** (10–14 · 15–18 · 19–22 · 23–27 · 28–33 · 34–40), mỗi băng có ngưỡng đo
  được, 5 câu tự chẩn đoán, chương trình 12 tuần, biến thể theo họ nghề, đường bù khi chưa đạt;
  bảng **cửa sổ hẹp dần / cửa sổ mở rộng** theo tuổi (kèm luật chống định mệnh luận); bảng **tự
  chẩn đoán nhanh 23 câu**; cơ chế `tuổi_nghề_hiệu_dụng` cho người có gián đoạn chăm sóc.
- `docs/research/dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md` — người dùng nêu tầm nhìn:
  _"DHCB là bạn đồng hành… phát triển vượt bậc năng khiếu… góp phần phát triển xã hội"_. Tài liệu
  dịch tuyên bố thành 4 cam kết kiểm được + **8 luật hành xử của Companion** (nền SDT, cắm vào
  `MotivationDiagnostic` đã có) + **đường ĐỈNH năng khiếu** tách khỏi đường nền (mô hình Gagné DMGT
  - Talent Development Megamodel; 12 lĩnh vực với quỹ đạo riêng; 5 tín hiệu nhận diện; 6 luật chống
    dán nhãn; 4 giai đoạn G1–G4 kèm **luật chuyển giao sang thầy người thật**) + 4 cơ chế đóng góp xã
    hội đo được + 6 rủi ro riêng R8–R13.

**Căng thẳng đã nêu thẳng với người dùng:** hai tài liệu đầu nghiêng về chẩn đoán/ngưỡng — đúng cho
năng lực nền, nhưng bê nguyên sang quan hệ hằng ngày sẽ thành máy chấm điểm người. Giải bằng
**Luật số 1**: kết quả chẩn đoán không bao giờ là màn hình chính, chỉ là công cụ chọn việc.

**Kế hoạch PR cập nhật:** thêm **C0** (hiến chương đồng hành — 8 luật thành ràng buộc kiểm được
trong `SupremePrincipleCompliance` đã có, **làm TRƯỚC C1** vì chi phối toàn bộ giọng sản phẩm),
**C6** (đường đỉnh năng khiếu), **C7** (vòng kèm cặp). Thứ tự đề xuất: C0 → C1 → C2b (bảng chẩn
đoán) → C5 màn chẩn đoán → C2 → C3 → C4 → C6 → C7.

**Bổ sung đợt 3 — 2 tài liệu nữa (cùng ngày):**

- `docs/research/nang-luc-10-18-nen-tang-va-nang-khieu-2026-08-23.md` — đào sâu N1+N2 theo yêu cầu
  "10–18 tuổi phát triển năng khiếu và năng lực nền tảng: học hành, nghiên cứu, hiểu biết về mọi
  thứ". Tách rõ **3 trụ khác nhau** (học hành = nạp thứ đã có đáp án · nghiên cứu = tìm câu trả lời
  chưa ai đưa · hiểu biết rộng = móc để cái mới bám vào). Nội dung: bảng kỹ thuật học theo mức bằng
  chứng (Dunlosky 2013 — cao: tự kiểm tra + giãn cách; thấp: đọc lại/tô màu; "phong cách học tập"
  không có cơ sở); **thang nghiên cứu R1–R5** + khuôn dự án 12 tuần; **7 miền tri thức nền** + cơ
  chế rèn; năng khiếu chia **chế độ MỞ RỘNG 10–14** (thử 8–12 tuần/lĩnh vực, cấm chốt sớm) và
  **THU HẸP 15–18**; ngân sách 5 giờ/tuần ghép với mùa thi VN; 7 cạm bẫy; bảng "đo bằng gì / KHÔNG
  đo bằng gì".
- `docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md` — thi hành Luật số 1. Kiến trúc
  **3 lớp** (HỎI → HỒ SƠ ẨN → GỢI Ý), **5 câu ~90 giây** mỗi câu làm hai việc, hồ sơ dày lên bằng
  **hành vi** chứ không bằng thêm bài kiểm tra, **luật ngôn ngữ cấm/cho phép** (cấm điểm số, thang,
  "bạn thiếu…", biểu đồ radar trên trang chủ), luật trích lại lời người dùng khi giải thích "vì
  sao", xử lý trung thực khi người dùng hỏi "bạn có chấm điểm tôi không", 7 **test bất biến chặn
  CI** (T1: không con số năng lực nào rò lên UI).

**Phát hiện khi đọc code (định hình thiết kế):** `pages/core/Onboarding.tsx` nằm ở `core/` nhưng
thực chất là onboarding **MÔN TIẾNG ANH** (trình độ CEFR, mục tiêu IELTS/du lịch); chỉ `age_group`
là dữ liệu cấp nền tảng. Migration `0036_english_user_profile.sql` **đã lường trước** và tạo sẵn
bảng ngủ `english.user_profile`. ⇒ Onboarding nền tảng phải là **lớp MỚI chạy TRƯỚC**, giữ nguyên
màn hiện tại làm onboarding môn — thêm **PR C1b** (tách lớp + chuyển `age_group` lên platform,
hoàn tất bước 0036 để ngỏ; đụng màn onboarding của mọi user đang hoạt động nên cần test kỹ).

**Điểm tôi nói ngược lại yêu cầu (chờ người dùng chốt):** "không hiện cho người dùng biết" — tôi đề
xuất **ẩn ≠ giấu**: mặc định không bao giờ tự bật ra, không ở màn hình chính, nhưng **xem được khi
người dùng chủ động hỏi** và **xoá được**. Lý do: niềm tin, dữ liệu suy luận vẫn là dữ liệu cá nhân
(repo đã có `consentGrant`), nhất quán với Luật 6 của tư thế đồng hành, và phụ huynh trẻ vị thành
niên chắc chắn sẽ hỏi. Nếu người dùng vẫn muốn ẩn tuyệt đối thì làm theo, nhưng đề nghị giữ tối
thiểu nút "Xoá dữ liệu đánh giá về tôi".
