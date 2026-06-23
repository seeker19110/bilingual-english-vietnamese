// ──────────────────────────────────────────────────────────────────────────
// PRELOADER — tải trước dữ liệu và audio khi user mở app
//
// Chiến lược (tốt hơn tải 10% toàn bộ từ điển):
//   Phase 1 — Data: loadCurriculum() để có từ điển + lộ trình học
//             (lessons index đã static import sẵn trong loader.ts)
//   Phase 2 — Audio: chỉ preload 20 từ của "Today batch" (hôm nay học gì thì
//             tải trước cái đó) + câu ví dụ của mỗi từ
//
// Audio được lưu vào IndexedDB (persistent qua lần đóng/mở tab) nên
// lần sau mở app không cần tải lại — chỉ cần tạo blob URL từ buffer đã có.
//
// Toàn bộ chạy nền, không block UI.
// ──────────────────────────────────────────────────────────────────────────

import { loadCurriculum, getTodayBatch } from './curriculum'
import { getLearnedWords } from './vocab'
import { supabase } from './supabase'
import { getVoicePref } from './tts'
import { audioCacheKey, getAudioBuffer, setAudioBuffer } from './audioCache'

let _started = false

// Reset để cho phép chạy lại (dùng khi đăng xuất)
export function resetPreload(): void {
  _started = false
}

// ── Tải + giải mã 1 audio rồi lưu vào IndexedDB ──────────────────────────────
// Nếu đã có trong IndexedDB thì bỏ qua (không tải lại).
async function prefetchAudio(text: string, lang: string, voice: string, token: string): Promise<void> {
  if (!text.trim()) return
  const key = audioCacheKey(text, lang, voice)

  // Đã cache → bỏ qua
  if (await getAudioBuffer(key)) return

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, lang, voice }),
    })
    if (!res.ok) return

    const { audio_url, key_b64, iv_b64 } = (await res.json()) as {
      audio_url: string; key_b64: string; iv_b64: string
    }

    // Tải file audio mã hoá
    const cipherRes = await fetch(audio_url)
    if (!cipherRes.ok) return
    const cipherBuffer = await cipherRes.arrayBuffer()

    // Giải mã AES-256-GCM
    const toBytes = (b64: string) => {
      const bin = atob(b64); const out = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
      return out
    }
    const cryptoKey = await crypto.subtle.importKey(
      'raw', toBytes(key_b64) as BufferSource, 'AES-GCM', false, ['decrypt'],
    )
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBytes(iv_b64) as BufferSource }, cryptoKey, cipherBuffer,
    )

    // Lưu ArrayBuffer (đã giải mã) vào IndexedDB
    await setAudioBuffer(key, plain)
  } catch {
    // Bỏ qua lỗi preload — không ảnh hưởng UX
  }
}

// Ngủ để nhường main thread
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Hàm chính ────────────────────────────────────────────────────────────────
export async function startPreload(userId: string): Promise<void> {
  if (_started) return
  _started = true

  // Phase 1 — Tải toàn bộ từ điển (data, không audio)
  await loadCurriculum()

  // Lấy JWT để gọi /api/tts
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) { _started = false; return }

  // Phase 2 — Preload audio cho Today batch (20 từ hôm nay)
  const learned = getLearnedWords(userId)
  const todayWords = getTodayBatch(learned)
  const voice = getVoicePref()

  // Phase 2 — TTS audio (tuần tự, chậm ~5s) — kick-off, không await
  void (async () => {
    for (const entry of todayWords) {
      // Từ + câu ví dụ đồng thời
      await Promise.all([
        prefetchAudio(entry.word, 'en-US', voice, token),
        entry.ex_en ? prefetchAudio(entry.ex_en, 'en-US', voice, token) : Promise.resolve(),
      ])
      await sleep(80)
    }
  })()

  // Phase 3 — Preload data chunks hay dùng (nhanh ~500ms, không cần chờ Phase 2 xong)
  // Dynamic import để không bundle vào main chunk.
  // Vite tự tách loader + index.json thành shared chunk → khi user vào trang đó: cache hit.
  void (async () => {
    const [lessonsLoader, patternsLoader] = await Promise.all([
      import('../data/lessons/loader').catch(() => null),
      import('../data/patterns/loader').catch(() => null),
    ])
    await Promise.all([
      lessonsLoader?.loadChunk(0) ?? Promise.resolve(),  // 10 bài học đầu
      patternsLoader?.loadChunk(0) ?? Promise.resolve(), // 8 chủ đề cụm từ đầu
    ])
  })()
}
