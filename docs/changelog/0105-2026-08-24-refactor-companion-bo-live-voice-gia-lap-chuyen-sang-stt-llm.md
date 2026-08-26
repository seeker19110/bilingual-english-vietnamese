# refactor(companion): bỏ "Live Voice" giả lập, chuyển sang STT → LLM → TTS thật (2026-08-24)

**Phát hiện:** chế độ "Đàm thoại Trực tiếp (Live Voice)" của Bạn Đồng Hành (`/companion`,
`StudioDialogue.tsx`) **chưa từng chạy thật** — `useRealtimeVoice.ts` mở WebSocket tới
`/ws/voice-companion`, nhưng route này **không tồn tại** ở `apps/server` (grep xác nhận 0 kết
quả). `RealtimeMultimodalLiveOrb.tsx` là UI giả lập hoàn toàn: độ trễ/âm lượng/trạng thái
"Gemini 2.0 Live" đều sinh bằng `Math.random()`/`setTimeout`, không gọi API thật — bấm "Bật
Live Duplex" chỉ hiện toast giả, không có audio nào thật sự chạy.

**Sửa:** thay bằng pipeline **STT → LLM → TTS** thật, dùng lại đúng hạ tầng đã chạy production
ở `Speaking.tsx` (môn Anh): ghi âm qua `sttServer.ts` (`MediaRecorder` → `/api/stt` Whisper) →
gửi văn bản qua `sendCompanionMessageStream` (API `/api/companion` đã có) → đọc câu trả lời
bằng `speak()` (`/api/tts` Google TTS). Không còn WebSocket "live"/full-duplex/barge-in nào.

- Xoá hẳn `lib/useRealtimeVoice.ts` (WebSocket tới route không tồn tại) và
  `components/CompanionVoice/RealtimeMultimodalLiveOrb.tsx` (mock).
- `pages/companion/Companion.tsx`: thêm state machine `CompanionVoiceState` (`idle` →
  `recording` → `transcribing` → `thinking` → `speaking` → `idle`), tái dùng
  `startRecording`/`isRecordingSupported` (`sttServer.ts`) + `speak`/`stopSpeaking` (`tts.ts`);
  `handleSend` nhận thêm cờ `viaVoice` để đọc to câu trả lời khi tới từ chế độ giọng nói.
- `components/CompanionStudios/StudioDialogue.tsx`: bỏ hẳn panel "Live Voice"/barge-in, thay
  bằng panel ghi âm-nghe-trả lời tuần tự (nút mic bấm-nói kiểu `Speaking.tsx`, hiển thị câu
  vừa nói + câu trả lời gần nhất lấy thẳng từ `messages`).
- `CompanionLiveOrb.tsx` (canvas vẽ quả cầu theo state) **giữ lại** — vốn chỉ nhận state từ
  ngoài, không phụ thuộc gì WebSocket giả, nay ăn theo state pipeline thật (`orbStateFor`).
  Embodiment mode `live_orb` (`AvatarEmbodimentSelector.tsx`) đổi nhãn "Full-Duplex" → "Voice"
  cho đúng thực tế.
- Cùng đợt: đây cũng là toàn bộ phần giọng nói của Bạn Đồng Hành (không có tính năng "live"
  nào khác tách riêng) — người dùng xác nhận "Agent-Bạn-Đồng-Hành cũng vậy" nghĩa là đã nằm
  trong phạm vi sửa này.

Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Test ✅ (5120/5120, chạy sau `npm ci` để khớp
lockfile). Không đổi schema, không đổi endpoint `/api/companion`/`/api/stt`/`/api/tts` — chỉ đổi
client gọi pipeline nào cho chế độ giọng nói.
