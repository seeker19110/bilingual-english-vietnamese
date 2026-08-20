---
name: multimodal-realtime-voice-master
description: 'Kỹ năng Nghiệp vụ Âm học & Đàm thoại Thời gian thực Đa phương thức (Multimodal Realtime Voice, Full-Duplex WebRTC, Audio DSP Worker, 3D Viseme Morphing, Acoustic GOP, Echo Shadowing). Kích hoạt khi xử lý truyền phát âm thanh hai chiều, ngắt lời tức thì, nhận diện cao độ giọng nói, biến hình khẩu hình 3D, đo đạc GOP và luyện nhại âm.'
---

# MULTIMODAL REALTIME VOICE & ACOUSTIC MASTER V7.0

Bộ quy chuẩn xử lý âm thanh thời gian thực, đàm thoại song công toàn phần (Full-Duplex), biến hình khẩu hình 3D và phân tích âm học chuyên sâu trong hệ sinh thái Đồng Hành.

---

## 1. ĐÀM THOẠI SONG CÔNG TOÀN PHẦN (FULL-DUPLEX WEBRTC & REALTIME STREAMING)

Kiến trúc đàm thoại liên tục độ trễ siêu thấp (`packages/core-ai/realtimeMultimodalService.ts`, `api/realtime-multimodal.ts`):

```
[User Mic Stream] ──(PCM 16kHz Chunk)──► [VAD: Voice Activity Detector]
                                                 │ (Barge-in < 50ms)
                                                 ▼
[WebSocket Relay Mesh] ◄──(Audio / Text Stream)──► [Gemini Live / OpenAI Realtime]
         │ (Latency < 250ms)
         ▼
[Browser Audio Output + Viseme Morphing + 3D Gaze Tracking]
```

### Tiêu Chuẩn Kỹ Thuật Bắt Buộc:

- **Độ Trễ Phản Hồi (Round-Trip Latency):** $\le 250$ms.
- **Khả Năng Ngắt Lời (Barge-in Latency):** $\le 50$ms. Ngay khi phát hiện người dùng cất giọng khi AI đang nói, lập tức dừng phát audio AI và hủy context sinh thừa để tiết kiệm token.
- **Voice Activity Detection (VAD):** Tự động phát hiện khoảng lặng và kết thúc câu mà không cần bấm giữ nút.

---

## 2. XỬ LÝ ÂM THANH NGOÀI TIẾN TRÌNH CHÍNH (OFF-THREAD WEB AUDIO DSP WORKER)

`apps/english/src/lib/audioDspWorker.ts`, `apps/english/src/lib/useAudioDsp.ts`:

- **Cô Lập Hoàn Toàn (Thread Isolation):** Toàn bộ thuật toán toán học nặng được chuyển vào Web Worker, giữ Main UI Thread đạt chuẩn **60 FPS** ổn định.
- **Thuật Toán Tự Tương Quan Phát Hiện Cao Độ (Autocorrelation $F_0$):**
  $$r(\tau) = \sum_{n=0}^{N-1-\tau} x(n) \cdot x(n+\tau)$$
  Xác định chính xác tần số cơ bản của giọng nói $F_0$ trong dải $50\text{Hz} - 500\text{Hz}$.
- **Trích Xuất Phổ Formant ($F_1, F_2$):** Tính toán độ mở miệng (Formant $F_1$) và vị trí tiến/lùi của lưỡi (Formant $F_2$) qua phân tích LPC (Linear Predictive Coding).

---

## 3. BIẾN HÌNH KHẨU HÌNH 3D & 15 VISEMES OCULUS (3D VISEME MORPHING)

`packages/core-ai/visemeMorphingService.ts`, `apps/english/src/components/Companion3D/CyberTutorAvatar3D.tsx`:

1. **Chuẩn 15 Visemes Oculus:**
   - Ánh xạ trực tiếp từ ký hiệu ngữ âm IPA sang 15 hình thái khẩu hình: `sil`, `PP`, `FF`, `TH`, `DD`, `kk`, `CH`, `SS`, `nn`, `RR`, `aa`, `E`, `ih`, `oh`, `ou`.
2. **Bộ Lọc Làm Mượt Chuyển Động (EMA Filter):**
   - Áp dụng bộ lọc Exponential Moving Average: $V_t = \alpha \cdot V_{\text{target}} + (1 - \alpha) \cdot V_{t-1}$ với $\alpha = 0.35$ để loại bỏ rung giật khẩu hình.
3. **Interactive Gaze Tracking & Micro-expressions:**
   - Đồng tử mắt robot 3D dõi theo vị trí con trỏ chuột/chạm tay của người học.
   - Mô phỏng nhịp thở hình sin và chớp mắt ngẫu nhiên tự nhiên (2.5s – 4.5s/lần).

---

## 4. ĐO LƯỜNG ÂM HỌC GOP & PHÒNG LAB NGỮ ÂM (ACOUSTIC GOP & PHONETICS LAB)

`packages/core-ai/acousticPhoneticsService.ts`, `apps/english/src/components/CompanionVoice/AcousticPhoneticsLab.tsx`:

- **Goodness of Pronunciation (GOP):**
  $$GOP(p) = \frac{1}{|p|} \log \frac{P(O | p)}{\max_{q} P(O | q)}$$
- Đánh giá chi tiết từng âm vị: Độ chính xác âm vị (Phoneme Accuracy), Độ trôi chảy (Fluency), Độ hoàn thiện âm đuôi (Final Consonant Articulation).
- Hiển thị trực quan bảng so sánh Formant người học vs Bản ngữ chuẩn kèm mẹo định vị cơ miệng và hướng dẫn luồng hơi.

---

## 5. HUẤN LUYỆN PHẢN XẠ NHẠI ÂM 3 PHA (REAL-TIME ECHO SHADOWING)

`packages/core-ai/echoShadowingService.ts`, `api/echo-shadowing.ts`:

1. **Phase 1 (Articulatory Mapping):** Nghe mẫu chuẩn + trực quan hóa khẩu hình 3D.
2. **Phase 2 (Delayed Echo):** Nói đuổi theo mẫu với độ trễ 0.4s–0.8s, đo lường độ lệch âm học (`AcousticDrift`) và điểm hòa nhịp thở.
3. **Phase 3 (Independent Production):** Thu âm độc lập, chấm điểm căn chỉnh âm vị và xuất báo cáo sửa lỗi.
