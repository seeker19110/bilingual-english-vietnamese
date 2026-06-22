// ──────────────────────────────────────────────────────────────────────────
// PRELOADER — tải trước từ điển, câu hội thoại và audio khi user mở app
//
// Luồng hoạt động:
//   1. Tải toàn bộ từ điển (loadCurriculum) và index bài học (static import)
//   2. Lấy 10% đầu của lộ trình học → danh sách audio cần warm-up
//   3. Chia thành các batch nhỏ 1% tổng, xen kẽ setTimeout để nhường main thread
//   4. Mỗi audio: gọi /api/tts → giải mã AES-256-GCM → lưu blob URL vào Map
//
// Khi tts.ts cần phát audio, kiểm tra Map này trước — nếu có thì phát ngay
// không cần gọi server nữa (tiết kiệm latency).
// ──────────────────────────────────────────────────────────────────────────

import { loadCurriculum, getLearningPath } from './curriculum'
import { supabase } from './supabase'
import { getVoicePref } from './tts'

// ── Cache blob URL đã giải mã (key: "lang:voice:text" → blob URL) ────────────
// Blob URL tồn tại trong session hiện tại; đóng tab thì bị giải phóng tự động.
export const audioPreloadCache = new Map<string, string>()

// Trạng thái — đảm bảo chỉ chạy 1 lần dù gọi nhiều lần
let _started = false

// Tiến độ preload (0–100) để UI có thể hiện nếu muốn
export let preloadProgress = 0

// ── Tạo key tra cứu cache ────────────────────────────────────────────────────
export function audioCacheKey(text: string, lang: string, voice: string): string {
  return `${lang}:${voice}:${text}`
}

// Lấy blob URL đã preload; trả null nếu chưa có
export function getPreloadedAudio(text: string, lang: string, voice: string): string | null {
  return audioPreloadCache.get(audioCacheKey(text, lang, voice)) ?? null
}

// ── Tiện ích giải mã (giống decryptCachedAudio trong tts.ts) ────────────────
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function fetchDecodeCache(
  text: string,
  lang: string,
  voice: string,
  token: string,
): Promise<void> {
  const key = audioCacheKey(text, lang, voice)
  if (audioPreloadCache.has(key)) return

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, lang, voice }),
    })
    if (!res.ok) return

    const { audio_url, key_b64, iv_b64 } = (await res.json()) as {
      audio_url: string
      key_b64: string
      iv_b64: string
    }

    // Tải file audio mã hoá từ Supabase Storage
    const cipherRes = await fetch(audio_url)
    if (!cipherRes.ok) return
    const cipherBuffer = await cipherRes.arrayBuffer()

    // Giải mã AES-256-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      base64ToBytes(key_b64) as BufferSource,
      'AES-GCM',
      false,
      ['decrypt'],
    )
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(iv_b64) as BufferSource },
      cryptoKey,
      cipherBuffer,
    )

    const blob = new Blob([plainBuffer], { type: 'audio/mpeg' })
    audioPreloadCache.set(key, URL.createObjectURL(blob))
  } catch {
    // Bỏ qua lỗi preload — không ảnh hưởng UX
  }
}

// Ngủ ngắn để nhường main thread (tránh đơ UI)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Hàm chính ────────────────────────────────────────────────────────────────
// Gọi 1 lần sau khi user đăng nhập (từ AuthProvider).
export async function startPreload(): Promise<void> {
  if (_started) return
  _started = true

  // Lấy JWT để gọi /api/tts
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) { _started = false; return }

  // Phase 1 — Tải toàn bộ từ điển (data, không có audio)
  // Lessons index đã được import tĩnh trong loader.ts — không cần tải thêm
  await loadCurriculum()

  // Phase 2 — Chuẩn bị danh sách audio
  const path = getLearningPath()
  const audioTarget = Math.ceil(path.length * 0.1) // 10% lộ trình học
  const items = path.slice(0, audioTarget)
  const voice = getVoicePref()

  // Kích thước batch = 1% tổng audio cần tải (tối thiểu 1)
  const batchSize = Math.max(1, Math.ceil(items.length * 0.01))
  const totalBatches = Math.ceil(items.length / batchSize)

  for (let b = 0; b < totalBatches; b++) {
    const start = b * batchSize
    const batch = items.slice(start, start + batchSize)

    // Tải tuần tự trong mỗi batch (tránh tạo quá nhiều request đồng thời)
    for (const entry of batch) {
      // Audio cho từ chính (tiếng Anh)
      await fetchDecodeCache(entry.word, 'en-US', voice, token)
    }

    // Cập nhật tiến độ (0–100)
    preloadProgress = Math.round(((b + 1) / totalBatches) * 100)

    // Nhường main thread giữa các batch (~100ms nghỉ)
    await sleep(100)
  }
}

// Reset cho phép chạy lại (dùng khi đăng xuất rồi đăng nhập lại)
export function resetPreload(): void {
  _started = false
  preloadProgress = 0
  // Giải phóng blob URLs cũ để tránh memory leak
  for (const url of audioPreloadCache.values()) URL.revokeObjectURL(url)
  audioPreloadCache.clear()
}
