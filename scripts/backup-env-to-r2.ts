// scripts/backup-env-to-r2.ts — Mã hoá file .env rồi đẩy lên Cloudflare R2 (cùng bucket private
// với backup Postgres, xem scripts/backup-pg-to-r2.ts).
//
// VÌ SAO CẦN: pg_dump chỉ backup DATABASE, không backup .env. Nếu VPS hỏng, khôi phục xong
// database vẫn KHÔNG chạy được app vì thiếu API key (AI, TTS/STT, R2, SEPAY_WEBHOOK_API_KEY...).
//
// AN TOÀN: .env chứa TOÀN BỘ secret sống của app — không được lưu dạng chữ thường (plaintext)
// ở đâu ngoài chính VPS. Script này MÃ HOÁ (AES-256-GCM, khoá suy ra từ passphrase qua scrypt)
// trước khi upload — kể cả nếu bucket R2 bị lộ, kẻ tấn công vẫn cần đúng passphrase mới đọc được.
//
// ⚠️ PASSPHRASE (biến ENV_BACKUP_PASSPHRASE) BẮT BUỘC KHÔNG được lưu trong chính file .env —
// nếu VPS mất cả .env lẫn passphrase thì bản backup mã hoá này vô dụng (không giải mã được).
// Lưu passphrase ở nơi KHÁC: password manager (1Password/Bitwarden), hoặc ghi tay ra giấy cất
// riêng. Chỉ cần nhớ 1 passphrase — dùng lại cho mọi lần backup/khôi phục.
//
// Cách chạy:
//   ENV_BACKUP_PASSPHRASE="..." npm run backup:env
//   ENV_BACKUP_PASSPHRASE="..." npm run backup:env -- --dry-run
//
// Khôi phục: xem scripts/restore-env-from-r2.ts

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

dotenv.config()

const DRY_RUN = process.argv.includes('--dry-run')
const ENV_FILE = process.env.ENV_FILE_PATH || path.join(process.cwd(), '.env')
export const KEY_PREFIX = 'env-backups/'
const SALT_LENGTH = 16
const IV_LENGTH = 12 // 96 bit — chuẩn khuyến nghị cho AES-GCM
const SCRYPT_KEY_LENGTH = 32 // AES-256

function fail(message: string): never {
  console.error(`[backup:env] ❌ ${message}`)
  process.exit(1)
}

/**
 * Mã hoá AES-256-GCM: khoá suy ra từ passphrase bằng scrypt (salt ngẫu nhiên mỗi lần, tránh
 * cùng passphrase luôn ra cùng khoá). Gói salt + iv + authTag + ciphertext vào 1 buffer để
 * restore chỉ cần đúng passphrase, không cần lưu gì thêm.
 */
export function encryptEnv(plaintext: Buffer, passphrase: string): Buffer {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = crypto.scryptSync(passphrase, salt, SCRYPT_KEY_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([salt, iv, authTag, encrypted])
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
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
}

async function main(): Promise<void> {
  const bucket = process.env.R2_BACKUP_BUCKET
  if (!bucket) {
    fail(
      'Thiếu R2_BACKUP_BUCKET — dùng chung bucket private với backup Postgres (xem .env.example).',
    )
  }
  if (bucket === process.env.R2_BUCKET) {
    fail(
      `R2_BACKUP_BUCKET trùng R2_BUCKET ("${bucket}") — bucket audio là PUBLIC-READ, tuyệt đối không đẩy .env vào đó.`,
    )
  }

  const passphrase = process.env.ENV_BACKUP_PASSPHRASE
  if (!passphrase) {
    fail(
      'Thiếu ENV_BACKUP_PASSPHRASE — PHẢI truyền qua biến môi trường lúc chạy lệnh (không đặt ' +
        'trong .env, vì nếu mất .env thì passphrase cũng mất theo). Xem comment đầu file.',
    )
  }

  if (!fs.existsSync(ENV_FILE)) {
    fail(`Không thấy file "${ENV_FILE}" — đặt lại ENV_FILE_PATH nếu .env không ở thư mục gốc.`)
  }

  const plaintext = fs.readFileSync(ENV_FILE)
  const encrypted = encryptEnv(plaintext, passphrase)

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const key = `${KEY_PREFIX}env_${dateStr}.enc`

  console.log(`[backup:env] Bucket: ${bucket} · File: ${ENV_FILE} (${plaintext.length} bytes)`)
  if (DRY_RUN) {
    console.log(`[backup:env] (dry-run) sẽ mã hoá + upload lên key "${key}"`)
    return
  }

  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: encrypted,
      ContentType: 'application/octet-stream',
    }),
  )
  console.log(`[backup:env] ✅ Đã upload "${key}" (mã hoá, ${encrypted.length} bytes).`)
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main().catch((err) => {
    console.error('[backup:env] ❌ Lỗi:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
