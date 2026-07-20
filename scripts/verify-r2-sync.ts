// scripts/verify-r2-sync.ts
// Đối chiếu file audio trên Ổ ĐĨA VPS (uploads/) với Cloudflare R2 — dùng SAU KHI chạy
// scripts/sync-storage-to-r2.ts để xác nhận đã đồng bộ đủ trước khi xóa file local lấy
// lại dung lượng.
//
// Cách hoạt động:
//   1. Liệt kê TOÀN BỘ object trong R2 bucket (ListObjectsV2, phân trang) → Map<key, size>.
//   2. Quét đệ quy uploads/tts-cache + uploads/pronunciations trên ổ đĩa VPS.
//   3. Với mỗi file local, khoá R2 tương ứng là `${bucket}/${relPath}` (khớp saveR2() trong
//      api/_lib/fileStorage.ts) — kiểm tra: có mặt trên R2 không, và (mặc định) kích thước
//      có khớp không (phát hiện upload dở/hỏng).
//
// Cờ:
//   --skip-size-check   Chỉ kiểm tra CÓ MẶT, bỏ qua so kích thước (nhanh hơn).
//   --delete-verified    Sau khi đối chiếu, nếu 0 file thiếu/lệch → XOÁ các file local đã
//                         xác nhận khớp R2 (từng file một, KHÔNG rm -rf cả thư mục — file
//                         nào không khớp vẫn được GIỮ LẠI). Cần thêm --yes mới xoá thật.
//   --yes                Xác nhận thực sự xoá (đi cùng --delete-verified) — thiếu cờ này,
//                         --delete-verified chỉ in ra SẼ xoá bao nhiêu file, không đụng gì.
//
// Cách chạy trên VPS:
//   npm run verify:r2 -- --dry-run-check           # chỉ đối chiếu, in báo cáo
//   npm run verify:r2 -- --delete-verified          # xem trước sẽ xoá bao nhiêu (chưa xoá)
//   npm run verify:r2 -- --delete-verified --yes    # xoá thật file đã xác nhận an toàn

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import cliProgress from 'cli-progress'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const SKIP_SIZE_CHECK = process.argv.includes('--skip-size-check')
const DELETE_VERIFIED = process.argv.includes('--delete-verified')
const CONFIRM_YES = process.argv.includes('--yes')

const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')
const BUCKETS = ['tts-cache', 'pronunciations'] as const

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('❌ Thiếu R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY trong .env')
    process.exit(1)
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
}

// Liệt kê TOÀN BỘ key trong bucket R2 (phân trang 1000 key/lần) → Map<key, size byte>.
async function listAllR2Objects(): Promise<Map<string, number>> {
  const r2Bucket = process.env.R2_BUCKET
  if (!r2Bucket) {
    console.error('❌ Thiếu R2_BUCKET trong .env')
    process.exit(1)
  }
  const client = getR2Client()
  const result = new Map<string, number>()
  let continuationToken: string | undefined
  let pages = 0
  process.stdout.write('📥 Đang liệt kê object trên R2...')
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: r2Bucket,
        ContinuationToken: continuationToken,
      }),
    )
    for (const obj of res.Contents ?? []) {
      if (obj.Key) result.set(obj.Key, obj.Size ?? -1)
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
    pages++
    if (pages % 20 === 0)
      process.stdout.write(
        `\r📥 Đang liệt kê object trên R2... ${result.size.toLocaleString('vi-VN')} object`,
      )
  } while (continuationToken)
  console.log(`\r📥 R2 hiện có ${result.size.toLocaleString('vi-VN')} object.                    `)
  return result
}

async function walkMp3(root: string, dir = '', out: string[] = []): Promise<string[]> {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return out
  const entries = await fs.promises.readdir(full, { withFileTypes: true })
  for (const entry of entries) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) await walkMp3(root, rel, out)
    else if (entry.isFile() && entry.name.endsWith('.mp3')) out.push(rel)
  }
  return out
}

interface LocalFile {
  bucket: (typeof BUCKETS)[number]
  rel: string
  fullPath: string
  r2Key: string
}

async function main(): Promise<void> {
  if (DELETE_VERIFIED && !CONFIRM_YES) {
    console.log('ℹ️  Chế độ XEM TRƯỚC (--delete-verified không kèm --yes) — sẽ KHÔNG xoá gì.\n')
  }

  const r2Objects = await listAllR2Objects()

  const localFiles: LocalFile[] = []
  for (const bucket of BUCKETS) {
    const rels = await walkMp3(path.join(UPLOADS_ROOT, bucket))
    for (const rel of rels) {
      localFiles.push({
        bucket,
        rel,
        fullPath: path.join(UPLOADS_ROOT, bucket, rel),
        r2Key: `${bucket}/${rel}`,
      })
    }
  }
  console.log(
    `📁 Ổ đĩa VPS có ${localFiles.length.toLocaleString('vi-VN')} file .mp3 (2 thư mục cộng lại).\n`,
  )

  const missing: LocalFile[] = []
  const sizeMismatch: LocalFile[] = []
  const verified: LocalFile[] = []

  const bar = new cliProgress.SingleBar(
    {
      format: '  |{bar}| {percentage}% | {value}/{total}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(localFiles.length, 0)

  for (let i = 0; i < localFiles.length; i++) {
    const f = localFiles[i]!
    const r2Size = r2Objects.get(f.r2Key)
    if (r2Size === undefined) {
      missing.push(f)
    } else if (!SKIP_SIZE_CHECK) {
      const localSize = (await fs.promises.stat(f.fullPath)).size
      if (localSize !== r2Size) sizeMismatch.push(f)
      else verified.push(f)
    } else {
      verified.push(f)
    }
    if (i % 500 === 0) bar.update(i)
  }
  bar.update(localFiles.length)
  bar.stop()

  console.log('\n──────────────────────────────────────────────')
  console.log(`✅ Khớp R2 (an toàn): ${verified.length.toLocaleString('vi-VN')}`)
  console.log(`❌ THIẾU trên R2: ${missing.length.toLocaleString('vi-VN')}`)
  console.log(`⚠️  Kích thước LỆCH: ${sizeMismatch.length.toLocaleString('vi-VN')}`)

  if (missing.length > 0) {
    console.log('\n   Ví dụ file thiếu trên R2:')
    for (const f of missing.slice(0, 10)) console.log(`     • ${f.r2Key}`)
  }
  if (sizeMismatch.length > 0) {
    console.log('\n   Ví dụ file lệch kích thước:')
    for (const f of sizeMismatch.slice(0, 10)) console.log(`     • ${f.r2Key}`)
  }

  const allSafe = missing.length === 0 && sizeMismatch.length === 0
  if (allSafe) {
    console.log('\n🎉 TOÀN BỘ file local đã có bản khớp trên R2 — an toàn để xoá local.')
  } else {
    console.log(
      `\n⛔ CHƯA an toàn xoá toàn bộ — còn ${missing.length + sizeMismatch.length} file chưa khớp R2.` +
        ' Chạy lại `STORAGE_DRIVER=r2 npm run sync:r2` (không cần --force) để đồng bộ nốt rồi verify lại.',
    )
  }

  if (!DELETE_VERIFIED) {
    console.log(
      '\nℹ️  Muốn xoá file local đã xác nhận khớp R2: thêm --delete-verified (xem trước) rồi --yes (xoá thật).',
    )
    return
  }

  // Chỉ xoá TỪNG FILE đã verified — file missing/mismatch luôn được GIỮ LẠI dù dùng --delete-verified.
  if (verified.length === 0) {
    console.log('\nℹ️  Không có file nào để xoá (0 file đã xác nhận khớp R2).')
    return
  }
  if (!CONFIRM_YES) {
    console.log(
      `\n👀 XEM TRƯỚC: sẽ xoá ${verified.length.toLocaleString('vi-VN')} file local đã khớp R2 (chưa xoá — thêm --yes để xoá thật).`,
    )
    return
  }

  console.log(
    `\n🗑️  Đang xoá ${verified.length.toLocaleString('vi-VN')} file local đã xác nhận khớp R2...`,
  )
  let deleted = 0
  let deleteErrors = 0
  const delBar = new cliProgress.SingleBar(
    {
      format: '  |{bar}| {percentage}% | {value}/{total}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  delBar.start(verified.length, 0)
  for (let i = 0; i < verified.length; i++) {
    const f = verified[i]!
    try {
      await fs.promises.unlink(f.fullPath)
      deleted++
    } catch (err) {
      deleteErrors++
      console.error(
        `\n❌ Không xoá được ${f.fullPath}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
    if (i % 500 === 0) delBar.update(i)
  }
  delBar.update(verified.length)
  delBar.stop()
  console.log(
    `\n✅ Đã xoá ${deleted.toLocaleString('vi-VN')} file. ${deleteErrors > 0 ? `❌ Lỗi: ${deleteErrors}` : ''}`,
  )
  console.log('ℹ️  Chạy `du -sh uploads/` để xem dung lượng đã giải phóng.')
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
