// scripts/backup-system-to-r2.ts — Đóng gói (tar) + mã hoá cấu hình hệ thống VPS (Nginx +
// crontab + PM2 dump) rồi đẩy lên Cloudflare R2 (cùng bucket private với backup Postgres/.env,
// xem scripts/backup-pg-to-r2.ts).
//
// VÌ SAO CẦN: pg_dump chỉ backup DATABASE, backup-env-to-r2 chỉ backup .env — cả hai đều KHÔNG
// backup cấu hình hệ thống. Phát hiện 2026-07-31 khi chỉnh tay nhiều lần cấu hình Nginx lúc
// chuyển domain sang .org: nếu VPS hỏng, khôi phục xong DB + .env vẫn phải làm lại TAY:
//   - Nginx (/etc/nginx): routing theo domain, redirect .com→.org, SSL block
//   - crontab của user chạy backup (mặc định root, postgres) — chính là các dòng lệnh khiến
//     backup này TỰ CHẠY; mất cái này thì "có cơ chế backup nhưng không có gì tự backup nữa"
//   - PM2 dump (~/.pm2/dump.pm2, do `pm2 save` tạo) — để `pm2 resurrect` tự khởi động lại đúng
//     tiến trình sau khi VPS reboot/dựng lại, không phải gõ tay `pm2 start ecosystem.config.cjs`
//
// AN TOÀN: dùng lại encryptEnv() từ backup-env-to-r2.ts (AES-256-GCM, hàm thuần không đặc thù
// .env) để không lặp logic mã hoá. Cùng nguyên tắc: PASSPHRASE (biến ENV_BACKUP_PASSPHRASE,
// dùng CHUNG với backup:env) KHÔNG được lưu trong .env.
//
// Cách chạy (trên VPS, cần quyền đọc /etc/nginx + crontab của user khác — chạy bằng root/sudo):
//   ENV_BACKUP_PASSPHRASE="..." npm run backup:system
//   ENV_BACKUP_PASSPHRASE="..." npm run backup:system -- --dry-run
//
// Biến môi trường tuỳ chỉnh (không bắt buộc):
//   NGINX_CONFIG_DIR   — mặc định /etc/nginx
//   CRONTAB_USERS      — danh sách user cách nhau dấu phẩy, mặc định "root,postgres"
//   PM2_DUMP_PATH      — mặc định /root/.pm2/dump.pm2
//
// Khôi phục: xem scripts/restore-system-from-r2.ts

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { execFileSync } from 'node:child_process'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { encryptEnv } from './backup-env-to-r2'

dotenv.config()

const DRY_RUN = process.argv.includes('--dry-run')
const NGINX_DIR = process.env.NGINX_CONFIG_DIR || '/etc/nginx'
const CRONTAB_USERS = (process.env.CRONTAB_USERS || 'root,postgres')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)
const PM2_DUMP_PATH = process.env.PM2_DUMP_PATH || '/root/.pm2/dump.pm2'
export const KEY_PREFIX = 'system-backups/'

function fail(message: string): never {
  console.error(`[backup:system] ❌ ${message}`)
  process.exit(1)
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

/**
 * Gom Nginx + crontab (mỗi user 1 file, bỏ qua user không có crontab) + PM2 dump vào 1 thư mục
 * tạm rồi tar lại — cách đơn giản nhất để đóng gói nhiều nguồn khác nhau (thư mục, lệnh, file
 * đơn) thành 1 tarball duy nhất bằng lệnh `tar` có sẵn, không cần thư viện nén riêng.
 */
function stageAndTar(stagingDir: string): Buffer {
  if (fs.existsSync(NGINX_DIR)) {
    execFileSync('cp', ['-a', NGINX_DIR, path.join(stagingDir, 'nginx')])
  } else {
    console.log(`[backup:system] (bỏ qua) không thấy "${NGINX_DIR}"`)
  }

  const crontabDir = path.join(stagingDir, 'crontab')
  fs.mkdirSync(crontabDir, { recursive: true })
  for (const user of CRONTAB_USERS) {
    try {
      const output = execFileSync('crontab', ['-l', '-u', user], { encoding: 'utf8' })
      fs.writeFileSync(path.join(crontabDir, `${user}.txt`), output)
    } catch {
      console.log(`[backup:system] (bỏ qua) user "${user}" không có crontab`)
    }
  }

  if (fs.existsSync(PM2_DUMP_PATH)) {
    const pm2Dir = path.join(stagingDir, 'pm2')
    fs.mkdirSync(pm2Dir, { recursive: true })
    fs.copyFileSync(PM2_DUMP_PATH, path.join(pm2Dir, 'dump.pm2'))
  } else {
    console.log(
      `[backup:system] (bỏ qua) không thấy PM2 dump "${PM2_DUMP_PATH}" (chạy "pm2 save" trước)`,
    )
  }

  return execFileSync('tar', ['-czf', '-', '-C', stagingDir, '.'], {
    maxBuffer: 1024 * 1024 * 200, // 200MB — cấu hình hệ thống rất nhỏ, dư sức chứa
  })
}

async function main(): Promise<void> {
  const bucket = process.env.R2_BACKUP_BUCKET
  if (!bucket) {
    fail(
      'Thiếu R2_BACKUP_BUCKET — dùng chung bucket private với backup Postgres/.env (xem .env.example).',
    )
  }
  if (bucket === process.env.R2_BUCKET) {
    fail(
      `R2_BACKUP_BUCKET trùng R2_BUCKET ("${bucket}") — bucket audio là PUBLIC-READ, tuyệt đối không đẩy cấu hình hệ thống vào đó.`,
    )
  }

  const passphrase = process.env.ENV_BACKUP_PASSPHRASE
  if (!passphrase) {
    fail(
      'Thiếu ENV_BACKUP_PASSPHRASE — dùng CHUNG passphrase với backup:env, truyền qua biến môi ' +
        'trường lúc chạy lệnh (không đặt trong .env).',
    )
  }

  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'system-backup-'))
  let tarball: Buffer
  try {
    console.log(
      `[backup:system] Đóng gói Nginx + crontab (${CRONTAB_USERS.join(', ')}) + PM2 dump...`,
    )
    tarball = stageAndTar(stagingDir)
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true })
  }

  const encrypted = encryptEnv(tarball, passphrase)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const key = `${KEY_PREFIX}system_${dateStr}.tar.gz.enc`

  console.log(
    `[backup:system] Bucket: ${bucket} · Tarball: ${tarball.length} bytes → mã hoá ${encrypted.length} bytes`,
  )
  if (DRY_RUN) {
    console.log(`[backup:system] (dry-run) sẽ upload lên key "${key}"`)
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
  console.log(`[backup:system] ✅ Đã upload "${key}" (mã hoá, ${encrypted.length} bytes).`)
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  main().catch((err) => {
    console.error('[backup:system] ❌ Lỗi:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
