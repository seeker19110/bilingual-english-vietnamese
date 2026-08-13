// api/_lib/fileStorage.ts
// Lớp trừu tượng lưu file audio — tự chọn backend dựa vào biến môi trường:
//   STORAGE_DRIVER=local (hoặc không set) → lưu vào thư mục uploads/ trên VPS
//   STORAGE_DRIVER=r2      → Cloudflare R2 (Giai đoạn D — xem docs/migration-thoat-ly-supabase.md)
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

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

// Server chỉ chạy Node.js (Express/VPS, xem server.ts) — không còn deploy Vercel Edge, nên
// import thẳng 'fs/promises' + 'path' như bình thường. (Trước đây dùng `new Function('m',
// 'return import(m)')` để né esbuild bundle fs vào Edge bundle — chiêu này cũng khiến
// saveLocal() lỗi "A dynamic import callback was not specified" khi chạy dưới Vitest, vì
// dynamic import gọi từ 1 Function tạo bằng `new Function` không có host-defined module
// record để Node gắn importModuleDynamically callback vào.)

function isR2Mode(): boolean {
  return process.env.STORAGE_DRIVER === 'r2'
}

/**
 * URL này CÓ phát được với cấu hình lưu trữ hiện tại không?
 *
 * Dùng để chặn "cache HIT giả": bảng tts_cache/pronunciations lưu audio_url VĨNH VIỄN, nên một
 * dòng ghi từ thời STORAGE_DRIVER=local (hoặc từ nhánh fallback local cũ) vẫn nằm đó sau khi
 * chuyển sang R2 — trỏ tới /uploads/... mà file không còn. Server thấy có dòng thì coi là HIT,
 * client fetch ra 404, và vì đã "HIT" nên KHÔNG bao giờ sinh lại. Coi các URL đó là MISS để
 * chúng được sinh lại và ghi đè bằng URL R2 thật.
 *
 * Ở chế độ local thì mọi URL đều chấp nhận — không có gì để phân biệt.
 */
export function isServableUrl(url: string | null | undefined): boolean {
  if (!url) return false
  if (!isR2Mode()) return true
  const base = process.env.R2_PUBLIC_BASE_URL
  // Chưa cấu hình base URL → saveR2() cũng sẽ ném lỗi; đừng vội coi cache là hỏng, giữ nguyên
  // hành vi cũ để một biến môi trường thiếu không kích hoạt sinh lại TOÀN BỘ cache (đốt tiền API).
  if (!base) return true
  return url.startsWith(base.replace(/\/$/, '') + '/')
}

// Thư mục gốc chứa file upload — cùng cấp với server.ts
function getUploadsRoot(): string {
  // import.meta.url không có trong CJS, dùng process.cwd() thay thế
  return process.env.UPLOADS_DIR || `${process.cwd()}/uploads`
}

/**
 * Lưu file audio và trả về URL để trình duyệt tải về.
 * @param bucket  Tên prefix/thư mục con (vd "tts-cache", "pronunciations") — dùng làm tên
 *                bucket con trên R2 hoặc thư mục con dưới UPLOADS_DIR khi lưu local
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
  if (isR2Mode()) {
    // KHÔNG fallback sang local (quyết định 2026-08-13). Trước đây R2 lỗi thì ghi tạm xuống
    // ổ đĩa VPS, nhưng URL local đó lại được lưu VĨNH VIỄN vào tts_cache.audio_url → lần sau
    // server coi là cache HIT và trả URL /uploads/... mà file đã không còn ⇒ câu đó không bao
    // giờ phát được và không bao giờ tự sửa. Thà hỏng to còn hơn hỏng âm thầm: ném lỗi để
    // caller KHÔNG ghi dòng cache hỏng, client tự rơi về Web Speech API.
    return saveR2(bucket, fileName, data)
  }
  return saveLocal(bucket, fileName, data, baseUrl)
}

// ── Local storage ────────────────────────────────────────────────────────────

async function saveLocal(
  bucket: string,
  fileName: string,
  data: ArrayBuffer,
  baseUrl: string,
): Promise<string> {
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
    // Từ ~cuối 2024, @aws-sdk/client-s3 mặc định requestChecksumCalculation=WHEN_SUPPORTED
    // (tự gắn checksum CRC32 vào MỌI request PUT, kể cả không ai yêu cầu) — Cloudflare R2
    // không tương thích hoàn toàn với cơ chế checksum này của AWS S3 gốc, gây lỗi
    // "SignatureDoesNotMatch" dù key ĐÚNG (xác nhận thật khi chạy trên VPS 2026-07-20 —
    // đổi key mới vẫn lỗi y hệt, đọc thẳng mã nguồn SDK trong node_modules mới tìm ra).
    // WHEN_REQUIRED trả lại hành vi cũ: chỉ tính checksum khi API operation THẬT SỰ đòi hỏi.
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
  return r2Client
}

/** Bucket R2 hiện đang dùng public URL nào (trang admin cần để dựng key từ audio_url). */
export function getR2PublicBaseUrl(): string | undefined {
  return process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
}

export interface R2Object {
  key: string
  size: number
}

/**
 * Liệt kê TOÀN BỘ object trên R2 dưới một prefix (tự phân trang tới hết).
 *
 * CHẬM có chủ đích — bucket đang có hàng chục nghìn file. Chỉ gọi từ tác vụ CHẠY NỀN
 * (quét đối chiếu ở trang admin), TUYỆT ĐỐI không gọi trong đường phục vụ request người dùng.
 */
export async function listR2Objects(prefix: string): Promise<R2Object[]> {
  const r2Bucket = process.env.R2_BUCKET
  if (!r2Bucket) throw new Error('Server chưa cấu hình R2_BUCKET (STORAGE_DRIVER=r2)')

  const out: R2Object[] = []
  let token: string | undefined
  do {
    const res = await getR2Client().send(
      new ListObjectsV2Command({ Bucket: r2Bucket, Prefix: prefix, ContinuationToken: token }),
    )
    for (const o of res.Contents ?? []) {
      if (o.Key) out.push({ key: o.Key, size: o.Size ?? 0 })
    }
    // IsTruncated=false → hết; chỉ đi tiếp khi CÓ token, tránh vòng lặp vô hạn nếu R2 trả
    // IsTruncated=true mà quên NextContinuationToken.
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return out
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
