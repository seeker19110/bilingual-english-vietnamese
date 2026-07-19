// api/_lib/fileStorage.ts
// Lớp trừu tượng lưu file audio — tự chọn backend dựa vào biến môi trường:
//   STORAGE_DRIVER=local   → lưu vào thư mục uploads/ trên VPS
//   STORAGE_DRIVER=r2      → Cloudflare R2 (Giai đoạn D — xem docs/migration-thoat-ly-supabase.md)
//   STORAGE_DRIVER không set hoặc =supabase → dùng Supabase Storage (mặc định cũ)
//
// Giao diện dùng: saveAudio(bucket, fileName, data) → trả về URL công khai
// Code gọi không cần biết đang lưu ở đâu.
//
// LƯU Ý BẢO MẬT (đọc kỹ trước khi đổi bucket sang private): client (src/lib/preloader.ts)
// `fetch(audio_url)` TRỰC TIẾP, không gắn header xác thực nào — audio_url trả về PHẢI là
// URL public-read. Bảo mật thật nằm ở khóa giải mã AES-256-GCM (chỉ trả cho request đã
// validateAuth — xem api/tts.ts), KHÔNG nằm ở việc chặn tải file thô (file `pronunciations`
// còn không hề mã hóa — vốn thiết kế public-read từ đầu, xem comment bảng trong
// postgres/schema.sql). Để bucket R2 private sẽ làm vỡ hoàn toàn việc phát audio.

import { getSupabaseAdmin } from './supabaseAdmin'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

function isR2Mode(): boolean {
  return process.env.STORAGE_DRIVER === 'r2'
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
  if (isR2Mode()) {
    return saveR2(bucket, fileName, data)
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

// ── Cloudflare R2 (Giai đoạn D) ─────────────────────────────────────────────
// R2 tương thích API S3 → dùng thẳng @aws-sdk/client-s3, chỉ đổi endpoint.
// Bucket PHẢI bật "Public access" (r2.dev subdomain hoặc custom domain) — xem ghi chú bảo
// mật đầu file. Biến môi trường: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
// R2_BUCKET, R2_PUBLIC_BASE_URL (vd https://pub-xxxxxxxx.r2.dev hoặc domain riêng đã gắn).

let r2Client: S3Client | null = null
function getR2Client(): S3Client {
  if (r2Client) return r2Client
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Server chưa cấu hình R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY (STORAGE_DRIVER=r2)',
    )
  }
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return r2Client
}

async function saveR2(bucket: string, fileName: string, data: ArrayBuffer): Promise<string> {
  const r2Bucket = process.env.R2_BUCKET
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL
  if (!r2Bucket || !publicBaseUrl) {
    throw new Error('Server chưa cấu hình R2_BUCKET/R2_PUBLIC_BASE_URL (STORAGE_DRIVER=r2)')
  }

  // Giữ nguyên "bucket" logic cũ (tts-cache/pronunciations) làm tiền tố key trong CÙNG 1
  // R2 bucket thật — không cần tạo nhiều bucket Cloudflare, chỉ phân vùng bằng key prefix.
  const key = `${bucket}/${fileName}`
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: Buffer.from(data),
      ContentType: 'audio/mpeg',
    }),
  )

  return `${publicBaseUrl.replace(/\/$/, '')}/${key}`
}

// ── Supabase Storage ─────────────────────────────────────────────────────────

async function saveSupabase(bucket: string, fileName: string, data: ArrayBuffer): Promise<string> {
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
