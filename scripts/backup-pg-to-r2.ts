// scripts/backup-pg-to-r2.ts — Đẩy file backup Postgres (.sql.gz do cron `pg_dump` tạo) lên
// Cloudflare R2, để backup KHÔNG nằm cùng ổ đĩa với database gốc.
//
// VÌ SAO CẦN: cron `pg_dump` hiện tại (docs/setup-postgresql-vps.md mục 7) chỉ ghi vào
// /var/backups TRÊN CHÍNH máy chạy Postgres. Ổ đĩa/VPS đó hỏng → mất CẢ database gốc LẪN toàn
// bộ backup cùng lúc. Nguyên tắc backup cơ bản: bản sao phải nằm ở "vùng hỏng" (failure domain)
// khác với dữ liệu gốc.
//
// THIẾT KẾ: script này CHỈ upload file đã có sẵn, KHÔNG tự chạy pg_dump — tách bạch 2 việc:
// nếu R2 lỗi (mạng, hết quota, sai key) thì backup local vẫn được tạo bình thường, không ảnh
// hưởng gì. Chạy script này NGAY SAU cron pg_dump (xem hướng dẫn cron trong docs).
// Chạy lại nhiều lần an toàn: file đã có trên R2 (cùng tên + cùng kích thước) sẽ được bỏ qua,
// nên nếu R2 lỗi vài ngày, lần chạy kế tiếp tự động bù các ngày còn thiếu.
//
// ⚠️ BUCKET BACKUP PHẢI ĐỂ PRIVATE — khác hoàn toàn bucket audio (`R2_BUCKET`, bắt buộc
// public-read để trình duyệt phát audio, xem api/_lib/fileStorage.ts). File backup chứa TOÀN BỘ
// database: email người dùng, mật khẩu đã băm, session token. Để public = lộ sạch dữ liệu.
// Dùng BUCKET RIÊNG (`R2_BACKUP_BUCKET`), KHÔNG dùng chung bucket với audio.
//
// Cách chạy:
//   npm run backup:r2                    # upload các file trong BACKUP_DIR còn thiếu trên R2
//   npm run backup:r2 -- --dry-run       # xem trước, không upload/xoá gì
//
// Biến môi trường (xem .env.example):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY  — dùng chung với audio
//   R2_BACKUP_BUCKET   — BẮT BUỘC, bucket RIÊNG cho backup (private!)
//   BACKUP_DIR         — thư mục chứa .sql.gz (mặc định /var/backups)
//   BACKUP_KEEP_DAYS   — số ngày giữ backup trên R2 (mặc định 30; 0 = không tự xoá)

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'

dotenv.config()

const DRY_RUN = process.argv.includes('--dry-run')
const BACKUP_DIR = process.env.BACKUP_DIR || '/var/backups'
const KEY_PREFIX = 'pg-backups/'
const KEEP_DAYS = (() => {
  const v = Number(process.env.BACKUP_KEEP_DAYS)
  return Number.isFinite(v) && v >= 0 ? v : 30
})()

function fail(message: string): never {
  console.error(`[backup:r2] ❌ ${message}`)
  process.exit(1)
}

// ── Logic quyết định (hàm THUẦN, tách riêng để test được — xem backup-pg-to-r2.test.ts) ──

export interface LocalFile {
  name: string
  size: number
}

/**
 * Lọc ra những file cần upload: chưa có trên R2, HOẶC đã có nhưng kích thước khác (dấu hiệu lần
 * trước upload dở dang → phải đẩy lại, nếu không sẽ tưởng đã backup xong mà file trên R2 hỏng).
 */
export function filesNeedingUpload(
  local: LocalFile[],
  remote: Map<string, number>,
  keyPrefix: string,
): LocalFile[] {
  return local.filter((f) => remote.get(`${keyPrefix}${f.name}`) !== f.size)
}

/**
 * Key của backup cũ hơn `keepDays` (dựa vào LastModified do R2 ghi, KHÔNG dựa tên file — tên do
 * cron đặt, có thể đổi định dạng). keepDays = 0 → không xoá gì.
 */
export function keysToPrune(
  objects: Array<{ key: string; lastModified: Date }>,
  keepDays: number,
  now: number,
): string[] {
  if (keepDays === 0) return []
  const cutoff = now - keepDays * 24 * 60 * 60 * 1000
  return objects.filter((o) => o.lastModified.getTime() < cutoff).map((o) => o.key)
}

function getClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    fail('Thiếu R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY trong .env')
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    // Giống api/_lib/fileStorage.ts: R2 không tương thích cơ chế checksum mặc định mới của
    // AWS SDK (gây SignatureDoesNotMatch dù key đúng) — xem comment chi tiết ở file đó.
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
}

// Danh sách object đã có trên R2: key → size (dùng size để phát hiện file upload dở lần trước)
async function listRemote(client: S3Client, bucket: string): Promise<Map<string, number>> {
  const found = new Map<string, number>()
  let token: string | undefined
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: KEY_PREFIX, ContinuationToken: token }),
    )
    for (const obj of res.Contents ?? []) {
      if (obj.Key) found.set(obj.Key, obj.Size ?? -1)
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return found
}

async function uploadOne(
  client: S3Client,
  bucket: string,
  filePath: string,
  key: string,
  size: number,
): Promise<void> {
  // Dùng stream + ContentLength thay vì đọc cả file vào RAM: backup có thể lên hàng trăm MB khi
  // dữ liệu lớn dần, đọc hết vào Buffer sẽ ăn RAM vô ích trên máy DB đang phục vụ production.
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentLength: size,
      ContentType: 'application/gzip',
    }),
  )
}

// Xoá backup cũ hơn KEEP_DAYS trên R2 (quyết định bằng keysToPrune() — hàm thuần, có test).
async function pruneRemote(client: S3Client, bucket: string): Promise<number> {
  if (KEEP_DAYS === 0) return 0
  const objects: Array<{ key: string; lastModified: Date }> = []

  let token: string | undefined
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: KEY_PREFIX, ContinuationToken: token }),
    )
    for (const obj of res.Contents ?? []) {
      if (obj.Key && obj.LastModified)
        objects.push({ key: obj.Key, lastModified: obj.LastModified })
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)

  const stale = keysToPrune(objects, KEEP_DAYS, Date.now())
  if (stale.length === 0) return 0
  if (DRY_RUN) {
    console.log(`[backup:r2] (dry-run) sẽ xoá ${stale.length} backup cũ hơn ${KEEP_DAYS} ngày`)
    return stale.length
  }

  // DeleteObjects giới hạn 1000 key/lần
  for (let i = 0; i < stale.length; i += 1000) {
    const batch = stale.slice(i, i + 1000)
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })) },
      }),
    )
  }
  return stale.length
}

async function main(): Promise<void> {
  const bucket = process.env.R2_BACKUP_BUCKET
  if (!bucket) {
    fail(
      'Thiếu R2_BACKUP_BUCKET — PHẢI là bucket RIÊNG, để PRIVATE (khác R2_BUCKET của audio vốn ' +
        'public-read). File backup chứa toàn bộ dữ liệu người dùng, xem comment đầu file.',
    )
  }
  if (bucket === process.env.R2_BUCKET) {
    fail(
      `R2_BACKUP_BUCKET trùng R2_BUCKET ("${bucket}") — bucket audio là PUBLIC-READ, đẩy backup ` +
        'vào đó sẽ LỘ TOÀN BỘ dữ liệu người dùng ra Internet. Tạo bucket riêng, để private.',
    )
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fail(
      `Không thấy thư mục backup "${BACKUP_DIR}" — đặt lại BACKUP_DIR hoặc kiểm tra cron pg_dump.`,
    )
  }

  const localFiles = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.sql.gz'))
    .sort()

  if (localFiles.length === 0) {
    fail(
      `Thư mục "${BACKUP_DIR}" không có file .sql.gz nào — cron pg_dump đã chạy chưa? ` +
        '(xem docs/setup-postgresql-vps.md mục 7)',
    )
  }

  const client = getClient()
  console.log(`[backup:r2] Bucket: ${bucket} · Thư mục: ${BACKUP_DIR} · Giữ ${KEEP_DAYS} ngày`)
  if (DRY_RUN) console.log('[backup:r2] CHẾ ĐỘ DRY-RUN — không upload/xoá gì.')

  const remote = await listRemote(client, bucket)
  const localWithSize: LocalFile[] = localFiles.map((name) => ({
    name,
    size: fs.statSync(path.join(BACKUP_DIR, name)).size,
  }))
  const toUpload = filesNeedingUpload(localWithSize, remote, KEY_PREFIX)
  const skipped = localWithSize.length - toUpload.length

  let uploaded = 0
  for (const { name, size } of toUpload) {
    const filePath = path.join(BACKUP_DIR, name)
    const key = `${KEY_PREFIX}${name}`

    if (DRY_RUN) {
      console.log(`[backup:r2] (dry-run) sẽ upload ${name} (${(size / 1e6).toFixed(1)} MB)`)
      uploaded++
      continue
    }

    process.stdout.write(`[backup:r2] Upload ${name} (${(size / 1e6).toFixed(1)} MB)... `)
    await uploadOne(client, bucket, filePath, key, size)
    console.log('xong.')
    uploaded++
  }

  const pruned = await pruneRemote(client, bucket)

  console.log(
    `[backup:r2] ✅ Hoàn tất — upload ${uploaded}, bỏ qua ${skipped} (đã có), xoá cũ ${pruned}.`,
  )
}

// Chỉ tự chạy main() khi file này được CHẠY TRỰC TIẾP (npm run backup:r2) — KHÔNG chạy khi bị
// import (backup-pg-to-r2.test.ts import filesNeedingUpload/keysToPrune để test). Thiếu guard
// này thì mỗi lần chạy test, main() sẽ tự thực thi (thiếu R2 credentials) và gọi process.exit(1)
// giữa lúc Vitest đang chạy — làm nhiễu kết quả test dù các assertion vẫn đúng.
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main().catch((err) => {
    // In lỗi rõ ràng + thoát mã khác 0 để cron/giám sát biết mà cảnh báo — backup lỗi âm thầm là
    // tình huống nguy hiểm nhất (tưởng có backup nhưng thật ra không).
    console.error('[backup:r2] ❌ Lỗi:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
