// api/_lib/fileStorage.ts
// Lớp trừu tượng lưu file audio — tự chọn backend dựa vào biến môi trường:
//   STORAGE_DRIVER=local   → lưu vào thư mục uploads/ trên VPS
//   STORAGE_DRIVER không set hoặc =supabase → dùng Supabase Storage (mặc định cũ)
//
// Giao diện dùng: saveAudio(bucket, fileName, data) → trả về URL công khai
// Code gọi không cần biết đang lưu ở đâu.

import { getSupabaseAdmin } from './supabaseAdmin'

// Chỉ import fs khi chạy trên Node.js (VPS) — không chạy được trên Vercel Edge.
// Dùng `new Function` để esbuild không phân tích static và không bundle fs vào Edge bundle.
let fsPromises: typeof import('fs/promises') | null = null
let pathModule: typeof import('path') | null = null

async function getNodeModules() {
  if (!fsPromises) {
    const dynImport = new Function('m', 'return import(m)') as (m: string) => Promise<unknown>
    fsPromises = (await dynImport('fs/promises')) as typeof import('fs/promises')
    pathModule = (await dynImport('path')) as typeof import('path')
  }
  return { fs: fsPromises, path: pathModule! }
}

function isLocalMode(): boolean {
  return process.env.STORAGE_DRIVER === 'local'
}

// Thư mục gốc chứa file upload — cùng cấp với server.ts
function getUploadsRoot(): string {
  // import.meta.url không có trong CJS, dùng process.cwd() thay thế
  return process.env.UPLOADS_DIR || `${process.cwd()}/uploads`
}

/**
 * Lưu file audio và trả về URL để trình duyệt tải về.
 * @param bucket  Tên bucket Supabase (hoặc tên thư mục con khi dùng local)
 * @param fileName  Đường dẫn file, ví dụ: "en-US/female/abc123.mp3"
 * @param data  Nội dung file dạng ArrayBuffer
 * @param baseUrl  URL gốc của server (chỉ cần khi local mode), ví dụ: "https://yourdomain.com"
 */
export async function saveAudio(
  bucket: string,
  fileName: string,
  data: ArrayBuffer,
  baseUrl = '',
): Promise<string> {
  if (isLocalMode()) {
    return saveLocal(bucket, fileName, data, baseUrl)
  }
  return saveSupabase(bucket, fileName, data)
}

// ── Local storage ────────────────────────────────────────────────────────────

async function saveLocal(
  bucket: string,
  fileName: string,
  data: ArrayBuffer,
  baseUrl: string,
): Promise<string> {
  const { fs, path } = await getNodeModules()

  // Ví dụ: /root/bilingual-english-vietnamese/uploads/tts-cache/en-US/female/abc.mp3
  const fullPath = path.join(getUploadsRoot(), bucket, fileName)
  const dir = path.dirname(fullPath)

  // Tạo thư mục nếu chưa có (như mkdir -p)
  await fs.mkdir(dir, { recursive: true })

  await fs.writeFile(fullPath, Buffer.from(data))

  // URL công khai: https://yourdomain.com/uploads/tts-cache/en-US/female/abc.mp3
  const publicPath = `/uploads/${bucket}/${fileName}`
  return baseUrl ? `${baseUrl}${publicPath}` : publicPath
}

// ── Supabase Storage ─────────────────────────────────────────────────────────

async function saveSupabase(
  bucket: string,
  fileName: string,
  data: ArrayBuffer,
): Promise<string> {
  const supabase = getSupabaseAdmin()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, data, { contentType: 'audio/mpeg', upsert: true })

  if (uploadError) {
    throw new Error(`Upload Supabase thất bại: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return urlData.publicUrl
}
