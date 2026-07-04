// ──────────────────────────────────────────────────────────────────────────
// PRELOADER trang HỌC — nạp TOÀN BỘ từ điển (~560KB, cho lộ trình) + preload audio
// batch "hôm nay" (kích thước = tốc độ học đã chọn, 5/10/20). CHỈ trang cấp CEFR
// (/learning-path/a1…b2 — nơi có tab "Hôm nay")
// import file này → curriculum + dữ liệu FOUNDATION (~100KB) KHÔNG lọt vào bundle
// khởi động (chỉ nằm trong chunk của trang đó).
// Việc nạp trước chunk Bài học/Cụm từ (nhẹ) tách sang preloadBrowse.ts.
//
// Audio lưu IndexedDB (bền qua lần đóng/mở tab) nên lần sau khỏi tải lại.
// ──────────────────────────────────────────────────────────────────────────

import { loadCurriculum, getTodayBatch, getDailyGoal } from './curriculum'
import { getLearnedWords } from './vocab'
import { getAccessToken } from './authHeader'
import { getVoicePref } from './tts'
import { audioCacheKey, getAudioBuffer, setAudioBuffer } from './audioCache'
import { preloadFlags } from './preloadState'

// ── Tải + giải mã 1 audio rồi lưu vào IndexedDB ──────────────────────────────
// Nếu đã có trong IndexedDB thì bỏ qua (không tải lại).
async function prefetchAudio(
  text: string,
  lang: string,
  voice: string,
  token: string,
): Promise<void> {
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
      audio_url: string
      key_b64: string
      iv_b64: string
    }

    // Tải file audio mã hoá
    const cipherRes = await fetch(audio_url)
    if (!cipherRes.ok) return
    const cipherBuffer = await cipherRes.arrayBuffer()

    // Giải mã AES-256-GCM
    const toBytes = (b64: string) => {
      const bin = atob(b64)
      const out = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
      return out
    }
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      toBytes(key_b64) as BufferSource,
      'AES-GCM',
      false,
      ['decrypt'],
    )
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBytes(iv_b64) as BufferSource },
      cryptoKey,
      cipherBuffer,
    )

    // Lưu ArrayBuffer (đã giải mã) vào IndexedDB
    await setAudioBuffer(key, plain)
  } catch {
    // Bỏ qua lỗi preload — không ảnh hưởng UX
  }
}

// Ngủ để nhường main thread
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Trang Học: từ điển đầy đủ + audio 20 từ hôm nay ──────────────────────────
// GỌI KHI VÀO /learn (idle), KHÔNG gọi lúc đăng nhập.
export async function preloadLearnData(userId: string): Promise<void> {
  if (preloadFlags.learn) return
  preloadFlags.learn = true

  // Tải toàn bộ từ điển (data, không audio) — cần cho lộ trình học.
  await loadCurriculum()

  // Lấy JWT để gọi /api/tts
  const token = await getAccessToken()
  if (!token) {
    preloadFlags.learn = false
    return
  }

  // Preload audio cho Today batch (20 từ hôm nay) — tuần tự, chậm, kick-off không await.
  const learned = getLearnedWords(userId)
  const todayWords = getTodayBatch(learned, getDailyGoal(userId))
  const voice = getVoicePref()
  void (async () => {
    for (const entry of todayWords) {
      await Promise.all([
        prefetchAudio(entry.word, 'en-US', voice, token),
        entry.ex_en ? prefetchAudio(entry.ex_en, 'en-US', voice, token) : Promise.resolve(),
      ])
      await sleep(80)
    }
  })()
}
