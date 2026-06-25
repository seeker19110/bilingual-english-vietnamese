// src/lib/dataPrecache.ts — Tải DẦN toàn bộ dữ liệu tĩnh (/data/*.json) về máy để dùng
// OFFLINE, và TỰ CẬP NHẬT khi server đổi.
//
// Cách hoạt động:
//  1. Tải public/data/manifest.json (luôn lấy bản mới — service worker không cache file này).
//     Manifest liệt kê mọi file + hash nội dung (xem scripts/gen-data-manifest.mjs).
//  2. So với "bản đồ đã tải" lưu trong localStorage: file nào MỚI hoặc ĐỔI HASH thì xếp hàng.
//  3. Tải DẦN từng file một, ưu tiên lúc CPU rảnh (requestIdleCallback) để không giật khi
//     người dùng đang nghe hội thoại / thao tác. Ghi thẳng vào Cache Storage của service
//     worker (cùng tên 'gia-su-data') nên lần sau mở offline là có ngay.
//  4. Lưu tiến độ sau MỖI file → đóng/mở lại app vẫn tải tiếp chỗ dang dở cho tới khi xong.
//
// Chỉ chạy ở bản build thật (PROD) vì cần service worker để cache bền. Dev không cần offline.

const MANIFEST_URL = '/data/manifest.json'
// PHẢI khớp tên DATA_CACHE trong public/sw.js (cache dữ liệu KHÔNG bị xoá mỗi lần deploy).
const DATA_CACHE = 'gia-su-data'
const MAP_KEY = 'et_data_cached_v1'       // { [path]: hash } các file đã tải xong
const DONE_KEY = 'et_data_precache_done'  // version đã tải đủ toàn bộ

interface ManifestFile { path: string; hash: string; size: number }
interface Manifest { version: string; totalBytes: number; files: ManifestFile[] }

let started = false

// ── Bản đồ "đã tải" trong localStorage ──────────────────────────────────────
function loadMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(MAP_KEY) || '{}') } catch { return {} }
}
function saveMap(map: Record<string, string>): void {
  try { localStorage.setItem(MAP_KEY, JSON.stringify(map)) } catch { /* hết quota — bỏ qua */ }
}

// ── Tiến độ (cho UI tuỳ chọn) ───────────────────────────────────────────────
export interface PrecacheProgress { done: number; total: number; bytesDone: number; bytesTotal: number }
let progress: PrecacheProgress = { done: 0, total: 0, bytesDone: 0, bytesTotal: 0 }
export function getPrecacheProgress(): PrecacheProgress { return progress }
function emitProgress() {
  window.dispatchEvent(new CustomEvent('data-precache-progress', { detail: { ...progress } }))
}

// Chờ tới lúc CPU rảnh (hoặc tối đa `timeout`ms) — giúp tải nền không tranh tài nguyên.
function idle(timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
    if (ric) ric(() => resolve(), { timeout })
    else setTimeout(resolve, 300)
  })
}

// Chờ có mạng trở lại (khi đang offline thì dừng tải, online lại thì tiếp).
function waitOnline(): Promise<void> {
  if (navigator.onLine) return Promise.resolve()
  return new Promise((resolve) => {
    const on = () => { window.removeEventListener('online', on); resolve() }
    window.addEventListener('online', on)
  })
}

// Bắt đầu tải nền (gọi 1 lần lúc mở app). Idempotent.
export async function startDataPrecache(): Promise<void> {
  if (started) return
  started = true
  // Cần Cache Storage (service worker) để lưu bền. Không có thì bỏ qua.
  if (!('caches' in window)) return
  try {
    await runPrecache()
  } catch {
    // Lỗi mạng/khác — lần mở app sau sẽ thử lại tiếp từ chỗ dang dở.
  }
}

async function runPrecache(): Promise<void> {
  // Lấy manifest MỚI (no-store + bỏ qua service worker cache).
  const res = await fetch(MANIFEST_URL, { cache: 'no-store' })
  if (!res.ok) return
  const manifest = (await res.json()) as Manifest

  const map = loadMap()
  const cache = await caches.open(DATA_CACHE)

  // Xếp hàng các file MỚI hoặc ĐỔI HASH. File đã đúng hash + còn trong cache → bỏ qua.
  const queue: ManifestFile[] = []
  for (const f of manifest.files) {
    const url = '/' + f.path
    if (map[f.path] === f.hash && (await cache.match(url))) continue
    queue.push(f)
  }

  progress = {
    done: manifest.files.length - queue.length,
    total: manifest.files.length,
    bytesDone: manifest.totalBytes - queue.reduce((s, f) => s + f.size, 0),
    bytesTotal: manifest.totalBytes,
  }
  emitProgress()

  if (queue.length === 0) {
    localStorage.setItem(DONE_KEY, manifest.version)
    return
  }

  // Tải DẦN từng file (tuần tự, nhẹ nhàng).
  for (const f of queue) {
    await waitOnline()
    await idle()
    const url = '/' + f.path
    try {
      // Nếu file ĐỔI: xoá bản cũ để service worker (cache-first) buộc lấy bản mới từ mạng.
      if (map[f.path] && map[f.path] !== f.hash) await cache.delete(url)
      // Ghi thẳng bản mạng vào cache để chắc chắn đúng nội dung (không qua bản cũ của SW).
      const fileRes = await fetch(url, { cache: 'no-store' })
      if (fileRes.ok) {
        await cache.put(url, fileRes.clone())
        // Đọc & bỏ body để giải phóng stream (mỗi lần chỉ 1 file ~vài trăm KB).
        await fileRes.arrayBuffer().catch(() => {})
        map[f.path] = f.hash
        saveMap(map)
        progress = { ...progress, done: progress.done + 1, bytesDone: progress.bytesDone + f.size }
        emitProgress()
      }
    } catch {
      // 1 file lỗi — bỏ qua, tiếp file sau; lần mở app sau sẽ thử lại file còn thiếu.
    }
  }

  // Tải đủ toàn bộ version hiện tại.
  if (progress.done >= progress.total) localStorage.setItem(DONE_KEY, manifest.version)
}
