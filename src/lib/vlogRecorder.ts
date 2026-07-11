// src/lib/vlogRecorder.ts — Ghi hình vlog cho thử thách "Vlog 1 phút — 30 ngày"
// (docs/research/thu-thach-vlog-30-ngay.md, mục 4.1).
//
// Chạy SONG SONG 2 MediaRecorder trên CÙNG 1 stream:
//   (a) recorder VIDEO  — lưu local (IndexedDB, src/lib/vlogVideo.ts), KHÔNG upload;
//   (b) recorder AUDIO-only — blob nhỏ (~1 MB/phút) gửi lên /api/stt như pipeline sẵn có.
// Nhờ vậy video không bao giờ rời máy người dùng, còn âm thanh vẫn vừa giới hạn ~6 MB
// của /api/stt (trần 180 giây ≈ 3 MB webm/opus).
//
// Khi người dùng từ chối camera (hoặc chủ động chọn chỉ-âm-thanh), gọi lại với
// `{ video: false }` — chỉ xin mic và chỉ chạy recorder audio.

// ── Hằng số thời lượng (UI dùng chung, không "số ma thuật") ──────────────────
// Trần ghi hình: tự dừng khi chạm mốc này.
export const MAX_VLOG_SEC = 180
// Sàn thời lượng: UI chặn nộp khi vlog ngắn hơn mốc này (tránh "điểm danh" 5 giây).
export const MIN_VLOG_SEC = 10

// ── Mã lỗi (message của Error) — UI so sánh để hiện hướng dẫn phù hợp ────────
// Người dùng từ chối quyền camera/mic → UI gợi ý bật quyền hoặc fallback chỉ-âm-thanh.
export const VLOG_ERR_PERMISSION = 'vlog-permission-denied'
// Trình duyệt không hỗ trợ ghi hình (thiếu getUserMedia/MediaRecorder).
export const VLOG_ERR_UNSUPPORTED = 'vlog-recording-unsupported'

// Trình duyệt có đủ đồ nghề để quay vlog không (cần getUserMedia + MediaRecorder).
export function isVlogRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

// Kết quả 1 lần quay: video (null khi chế độ chỉ-âm-thanh) + audio + thời lượng.
export interface VlogRecording {
  videoBlob: Blob | null
  videoMime: string | null
  audioBlob: Blob
  audioMime: string
  durationSec: number
}

// Handle điều khiển phiên quay đang chạy.
export interface VlogRecorderHandle {
  // Dừng quay + trả kết quả. Nếu đã tự dừng ở MAX_VLOG_SEC thì trả kết quả đã chốt.
  stop: () => Promise<VlogRecording>
  // Hủy quay: dừng + nhả camera/mic, KHÔNG trả kết quả (bỏ dữ liệu đã ghi).
  cancel: () => void
  // Stream đang quay — UI gắn vào <video muted> để người dùng thấy mình lúc quay.
  stream: MediaStream
}

// Độ rộng khung hình lý tưởng (≤ 720 đủ nét cho vlog tự xem, nhẹ bộ nhớ máy).
const VIDEO_IDEAL_WIDTH = 720

// Chọn mime đầu tiên trình duyệt hỗ trợ trong danh sách ưu tiên; '' = để mặc định.
function pickSupportedMime(candidates: string[]): string {
  for (const c of candidates) {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return ''
}

// Mime VIDEO theo thứ tự ưu tiên: iOS Safari chỉ có mp4; Chrome/Firefox dùng webm.
function pickVideoMime(): string {
  return pickSupportedMime(['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'])
}

// Mime AUDIO — GIỮ ĐÚNG danh sách của pickMime() trong src/lib/sttServer.ts (file đó
// không export hàm này nên phải lặp lại; nếu sửa bên đó, nhớ sửa cả đây) để blob audio
// đi vào /api/stt y hệt luồng ghi âm hiện có.
function pickAudioMime(): string {
  return pickSupportedMime(['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'])
}

// Dừng 1 MediaRecorder và gom chunks thành Blob (an toàn khi recorder đã dừng sẵn).
function stopRecorder(rec: MediaRecorder, chunks: Blob[], fallbackMime: string): Promise<Blob> {
  const toBlob = () => new Blob(chunks, { type: rec.mimeType || fallbackMime })
  return new Promise((resolve) => {
    if (rec.state === 'inactive') {
      resolve(toBlob())
      return
    }
    rec.onstop = () => resolve(toBlob())
    try {
      rec.stop() // ondataavailable bắn nốt chunk cuối trước onstop
    } catch {
      resolve(toBlob()) // đã dừng rồi (race với auto-stop) — dùng chunks hiện có
    }
  })
}

// Bắt đầu quay vlog. `video: false` = chế độ chỉ-âm-thanh (fallback khi từ chối camera
// hoặc người dùng ngại quay mặt). Ném Error có message:
//   VLOG_ERR_UNSUPPORTED — máy không hỗ trợ ghi hình;
//   VLOG_ERR_PERMISSION  — người dùng từ chối quyền camera/mic.
export async function startVlogRecording(opts: { video: boolean }): Promise<VlogRecorderHandle> {
  if (!isVlogRecordingSupported()) {
    throw new Error(VLOG_ERR_UNSUPPORTED)
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia(
      opts.video
        ? {
            // Camera trước, khung ≤ 720px — đủ cho vlog tự xem, không phình IndexedDB.
            video: { facingMode: 'user', width: { ideal: VIDEO_IDEAL_WIDTH } },
            audio: true,
          }
        : { audio: true },
    )
  } catch (e) {
    // NotAllowedError (chuẩn) / PermissionDeniedError (Chrome cũ) / SecurityError:
    // đều là "bị chặn quyền" → gom về 1 mã cho UI dễ xử lý.
    if (
      e instanceof DOMException &&
      (e.name === 'NotAllowedError' ||
        e.name === 'PermissionDeniedError' ||
        e.name === 'SecurityError')
    ) {
      throw new Error(VLOG_ERR_PERMISSION)
    }
    throw e instanceof Error ? e : new Error(String(e))
  }

  // Recorder AUDIO-only: tách track âm thanh ra stream riêng (video không rời máy,
  // audio nhỏ gọn gửi /api/stt). Luôn chạy ở cả 2 chế độ.
  const audioMime = pickAudioMime()
  const audioStream = new MediaStream(stream.getAudioTracks())
  const audioRec = new MediaRecorder(audioStream, audioMime ? { mimeType: audioMime } : undefined)
  const audioChunks: Blob[] = []
  audioRec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) audioChunks.push(e.data)
  }

  // Recorder VIDEO: chỉ chạy khi có quyền camera.
  const videoMime = opts.video ? pickVideoMime() : null
  const videoRec = opts.video
    ? new MediaRecorder(stream, videoMime ? { mimeType: videoMime } : undefined)
    : null
  const videoChunks: Blob[] = []
  if (videoRec) {
    videoRec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) videoChunks.push(e.data)
    }
  }

  audioRec.start()
  videoRec?.start()
  const startedAt = Date.now()

  // Nhả camera + mic (tắt đèn báo của trình duyệt) — PHẢI gọi ở mọi lối ra.
  const releaseTracks = () => {
    stream.getTracks().forEach((t) => t.stop())
  }

  // Chốt kết quả ĐÚNG 1 LẦN: stop() thủ công và auto-stop 180s đều đi qua đây,
  // gọi lần 2 trả lại promise đã có (idempotent — không dừng đúp, không mất blob).
  let finalized: Promise<VlogRecording> | null = null
  const finalize = (): Promise<VlogRecording> => {
    if (finalized) return finalized
    clearTimeout(autoStopTimer)
    const durationSec = Math.min(MAX_VLOG_SEC, Math.round((Date.now() - startedAt) / 1000))
    finalized = (async () => {
      try {
        const [audioBlob, videoBlob] = await Promise.all([
          stopRecorder(audioRec, audioChunks, 'audio/webm'),
          videoRec ? stopRecorder(videoRec, videoChunks, 'video/webm') : Promise.resolve(null),
        ])
        return {
          videoBlob,
          videoMime: videoBlob ? videoBlob.type || videoMime : null,
          audioBlob,
          audioMime: audioBlob.type || audioMime || 'audio/webm',
          durationSec,
        }
      } finally {
        releaseTracks() // dù gom blob lỗi hay không, camera/mic vẫn phải được nhả
      }
    })()
    return finalized
  }

  // Tự dừng khi chạm trần MAX_VLOG_SEC (180 giây) — kể cả khi UI quên gọi stop().
  const autoStopTimer = setTimeout(() => {
    void finalize()
  }, MAX_VLOG_SEC * 1000)

  return {
    stream,
    stop: () => finalize(),
    cancel() {
      clearTimeout(autoStopTimer)
      if (!finalized) {
        // Đánh dấu đã chốt (kết quả rỗng, không ai đọc) để stop() gọi sau không ghi tiếp.
        finalized = Promise.resolve({
          videoBlob: null,
          videoMime: null,
          audioBlob: new Blob([], { type: audioMime || 'audio/webm' }),
          audioMime: audioMime || 'audio/webm',
          durationSec: 0,
        })
      }
      try {
        if (audioRec.state !== 'inactive') audioRec.stop()
      } catch {
        /* đã dừng rồi */
      }
      try {
        if (videoRec && videoRec.state !== 'inactive') videoRec.stop()
      } catch {
        /* đã dừng rồi */
      }
      releaseTracks()
    },
  }
}
