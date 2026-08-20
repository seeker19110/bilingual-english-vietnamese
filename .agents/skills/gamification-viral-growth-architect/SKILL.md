---
name: gamification-viral-growth-architect
description: 'Kỹ năng Nghiệp vụ Gamification Đỉnh cao, Đấu trường Đối kháng 1v1 PvP, Thuật toán Xếp hạng Elo FIDE, AI Ghost Rival Matchmaking, Hệ thống Giới thiệu Bạn bè VIP và Lan tỏa Mạng Xã hội. Kích hoạt khi xây dựng hoặc tối ưu các tính năng đấu trường 1v1, tính điểm xếp hạng Elo, bắt cặp đối thủ AI, nhiệm vụ ngày, rương chuỗi streak và tạo thẻ chia sẻ Story Canvas.'
---

# GAMIFICATION, 1V1 PVP ARENA & VIRAL GROWTH ARCHITECT V7.0

Bộ quy chuẩn thiết kế và vận hành các cơ chế Gamification đỉnh cao, Đấu trường Đối kháng thời gian thực 1v1 và Động cơ Lan tỏa Tăng trưởng VIP cho hệ sinh thái Đồng Hành.

---

## 1. ĐẤU TRƯỜNG ĐỐI KHÁNG 1V1 PVP & AI GHOST RIVAL MATCHMAKING

Hệ thống thi đấu đối kháng thời gian thực (`packages/core-ai/pvpArenaService.ts`, `api/pvp-arena.ts`):

```
[Người Học Nhấn Tìm Trận]
           │
           ▼
[Matchmaking Pool] ──(Có người chơi cùng rank online)──► [Ghép Cặp Real Player]
           │ (Không có ai sau 2.5s)
           ▼
[AI Ghost Rival Matchmaker]
  ├── 1. Chọn AI Ghost có Elo tương đương (Elo ± 35)
  ├── 2. Gán Avatar, Tên & Quốc gia ngẫu nhiên
  ├── 3. Mô phỏng thời gian suy nghĩ người thật (1.4s – 3.8s)
  └── 4. Tỷ lệ trả lời đúng theo trình độ rank (60% - 92%)
           │
           ▼
[1v1 Battlefield Arena 60 FPS]
```

### 3 Chế Độ Thi Đấu Chuyên Sâu:

1. **Đấu Tốc Độ Từ Vựng 5s (Speed Vocab):** Phản xạ từ vựng và nghĩa tiếng Việt trong 5 giây/câu.
2. **Đấu Bắt Lỗi Ngữ Pháp (Grammar Hunt):** Tìm và sửa nhanh lỗi ngữ pháp trong câu văn bản ngữ.
3. **Tranh Biện Toulmin Phản Xạ (Speed Debate):** Chọn phản đề và bằng chứng logic chính xác trong 8 giây.

---

## 2. THUẬT TOÁN XẾP HẠNG ELO RATING CHUẨN FIDE ($K=32$)

- Tính toán kỳ vọng chiến thắng của người chơi A trước đối thủ B:
  $$E_A = \frac{1}{1 + 10^{(R_B - R_A) / 400}}$$
- Cập nhật điểm Elo sau trận đấu:
  $$R'_A = R_A + K \cdot (S_A - E_A)$$
  Trong đó: $K = 32$, $S_A = 1$ (Thắng), $0.5$ (Hòa), $0$ (Thua).
- **Hệ Thống 6 Bậc Rank:**
  - 🥉 **Bronze:** 0 – 1199
  - 🥈 **Silver:** 1200 – 1399
  - 🥇 **Gold:** 1400 – 1599
  - 💎 **Platinum:** 1600 – 1799
  - 👑 **Diamond:** 1800 – 1999
  - 🏆 **Master:** 2000+

---

## 3. ĐỘNG CƠ GIỚI THIỆU BẠN BÈ VIP & LỘ TRÌNH MỐC THƯỞNG (REFERRAL VIP ENGINE)

`packages/core-personal/referralVipService.ts`, `api/referral-vip.ts`:

1. **Cơ chế Thưởng Song Phương (Bilateral 7-Day VIP):**
   - Người mời và người được mời đều nhận **7 ngày VIP**.
   - **Chống Gian Lận (Anti-Sybil Guard):** Thưởng chỉ được kích hoạt khi tài khoản được mời hoàn thành bài học đầu tiên (`hasCompletedFirstLesson`). CẤM tự mời chính mình (`referrerId === refereeId`).
2. **Lộ Trình Mốc Thưởng 4 Tầng (Milestone Road):**
   - **1 Bạn bè:** +7 Ngày VIP + Huy hiệu Pioneer
   - **3 Bạn bè:** +14 Ngày VIP + Avatar Frame Vàng
   - **5 Bạn bè:** +30 Ngày VIP + Vé Đóng băng Chuỗi Vĩnh viễn
   - **10 Bạn bè:** +90 Ngày VIP + Danh hiệu Diamond Ambassador
3. **Cộng Dồn Thời Hạn (Stackable Expiry):** Hạn VIP mới = `max(current_expiry, now) + bonus_days`.

---

## 4. NHIỆM VỤ HÀNG NGÀY & RƯƠNG BÍ ẨN STREAK VAULT

`packages/core-personal/dailyQuestsService.ts`, `api/daily-quests.ts`:

1. **Bộ 3 Nhiệm Vụ Ngày Tự Động:**
   - Nhiệm vụ Từ vựng (VD: Học 10 từ mới / Ôn 15 từ SRS).
   - Nhiệm vụ Đối kháng (VD: Thắng 1 trận 1v1 PvP Arena).
   - Nhiệm vụ Hội thoại (VD: Trò chuyện 3 lượt với Bạn Đồng Hành AI).
2. **Mở Rương Bí Ẩn (Mystery Streak Vault):**
   - Hoàn thành đủ 3 nhiệm vụ trong ngày $\to$ Mở rương nhận 01 Vé Đóng Băng Chuỗi (Streak Freeze).
   - Hệ thống tự động kích hoạt vé đóng băng khi người dùng bỏ lỡ 1 ngày học để bảo toàn chuỗi streak.

---

## 5. TRÌNH TẠO ẢNH THẺ STORY CANVAS ĐỘ PHÂN GIẢI CAO (VIRAL SHARE CARD)

`apps/english/src/components/ViralShareCardGenerator.tsx`:

- Kết xuất trực tiếp đồ họa độ phân giải cao ($1080 \times 1920\text{px}$ chuẩn Instagram/Zalo Story) qua HTML5 Canvas API.
- Hiển thị đầy đủ: Thành tựu chuỗi Streak, Cấp độ Rank Elo, Mã QR mời bạn bè và Link giới thiệu độc quyền.
- Hỗ trợ tải ảnh về máy và nút chia sẻ 1-chạm lên Zalo, Facebook, Messenger và Telegram.
