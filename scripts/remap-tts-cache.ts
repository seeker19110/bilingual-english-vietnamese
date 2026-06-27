// scripts/remap-tts-cache.ts
// Đối chiếu và gán lại TTS cache: không gọi lại Google TTS API, chỉ re-encrypt.
//
// Vấn đề: scripts seed cũ băm (text+lang+voice) nhưng api/tts.ts băm
// (text+lang+voice+VOICE_VERSION) → cache seeded có hash sai, API không tìm thấy.
//
// Cách sửa không tốn tiền API:
//   1. Tải file cũ từ Storage (đã có sẵn)
//   2. Giải mã bằng key của oldHash
//   3. Re-encrypt bằng key của newHash
//   4. Upload lên path mới (lang/voice/newHash.mp3)
//   5. Upsert DB record mới với newHash
//
// Với entry không tìm thấy trong cache cũ → ghi vào missing-tts.json để
// chạy fresh TTS sau (ví dụ: lessons/patterns chưa bao giờ được seed).
//
// Chạy: npm run remap:tts-cache
// Ghi đè ngay cả khi newHash đã tồn tại: FORCE=1 npm run remap:tts-cache
// Giới hạn số lượng để test: LIMIT=50 npm run remap:tts-cache

import * as nodeCrypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { VOICE_IDS, VOICE_VERSION, type Lang, type VoiceId } from '../api/_lib/googleTts.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import { FOUNDATION } from '../src/data/curriculum.ts'
import { CEFR_LEVELS } from '../src/data/cefr.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const BASE_URL  = process.env.BASE_URL || ''
const FORCE     = process.env.FORCE === '1'
const LIMIT     = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
// Số hash tra DB một lần (Supabase .in() chấp nhận mảng lớn, nhưng giữ vừa phải)
const DB_BATCH  = 200
// Số entry re-encrypt song song
const REMAP_BATCH = 20

const MISSING_FILE = path.join(PROJECT_ROOT, 'scripts/missing-tts.json')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ── Hash ─────────────────────────────────────────────────────────────────────

function oldHashFn(text: string, lang: Lang, voice: VoiceId): string {
  return nodeCrypto.createHash('sha256').update(text + lang + voice).digest('hex').slice(0, 32)
}

function newHashFn(text: string, lang: Lang, voice: VoiceId): string {
  return nodeCrypto.createHash('sha256').update(text + lang + voice + VOICE_VERSION).digest('hex').slice(0, 32)
}

// ── Key derivation (giống ttsCrypto.ts nhưng dùng node:crypto) ───────────────
// Phải khớp hoàn toàn với api/_lib/ttsCrypto.ts — HMAC-SHA256 với master key.

function getMasterKeyBytes(): Uint8Array {
  const b64 = process.env.TTS_ENCRYPTION_MASTER_KEY
  if (!b64) throw new Error('Thiếu TTS_ENCRYPTION_MASTER_KEY trong .env')
  const buf = Buffer.from(b64, 'base64')
  if (buf.length !== 32) throw new Error('TTS_ENCRYPTION_MASTER_KEY phải là 32 byte base64')
  return new Uint8Array(buf)
}

function hmacSha256Node(keyBytes: Uint8Array, message: string): Uint8Array {
  const hmac = nodeCrypto.createHmac('sha256', Buffer.from(keyBytes))
  hmac.update(message)
  return new Uint8Array(hmac.digest())
}

function deriveKeyAndIv(hash: string): { keyBytes: Uint8Array; iv: Uint8Array } {
  const master = getMasterKeyBytes()
  const keyBytes = hmacSha256Node(master, `dek:${hash}`)
  const ivFull   = hmacSha256Node(master, `iv:${hash}`)
  return { keyBytes, iv: ivFull.slice(0, 12) }
}

// Giải mã AES-256-GCM bằng key của `hash` đã cho
async function decryptWithHash(cipherBuffer: ArrayBuffer, hash: string): Promise<ArrayBuffer> {
  const { keyBytes, iv } = deriveKeyAndIv(hash)
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt'])
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuffer)
}

// Mã hóa AES-256-GCM bằng key của `hash` đã cho
async function encryptWithHash(plain: ArrayBuffer, hash: string): Promise<ArrayBuffer> {
  const { keyBytes, iv } = deriveKeyAndIv(hash)
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt'])
  return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain)
}

// ── Thu thập tất cả (text, lang, voice) cần remap ────────────────────────────

interface Entry { text: string; lang: Lang; voice: VoiceId }

function collectAllEntries(): Entry[] {
  const entries: Entry[] = []
  const seen = new Set<string>()

  const add = (rawText: string, lang: Lang) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of VOICE_IDS) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) return
      seen.add(key)
      entries.push({ text, lang, voice })
    }
  }

  // 1. Curriculum
  for (const circle of FOUNDATION) {
    for (const { en } of circle.sentences) add(en, 'en-US')
    for (const entry of circle.words) {
      if (entry.ex_en) add(entry.ex_en, 'en-US')
      if (entry.ex_vi) add(entry.ex_vi, 'vi-VN')
    }
  }

  // 2. CEFR examples
  for (const level of CEFR_LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.grammar) {
        for (const { en, vi } of lesson.examples) {
          add(en, 'en-US')
          add(vi, 'vi-VN')
        }
      }
    }
  }

  // 3. Lessons — giống Lessons.tsx: mỗi turn chỉ 1 giọng đúng (voiceA hoặc voiceB)
  type LessonRaw = {
    speakerAGender?: 'female' | 'male' | null
    speakerBGender?: 'female' | 'male' | null
    turns?: Array<{ speaker: string; en: string; vi: string }>
  }
  const lessonDir = path.join(PROJECT_ROOT, 'public/data/lessons')
  for (const file of fs.readdirSync(lessonDir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()) {
    const chunks = JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8')) as LessonRaw[]
    for (const lesson of chunks) {
      const gA = lesson.speakerAGender ?? 'female'
      const gB = lesson.speakerBGender ?? 'male'
      const voiceA: VoiceId = gA === 'female' ? 'female' : 'male'
      const voiceB: VoiceId = gB === gA
        ? (gB === 'female' ? 'female2' : 'male2')
        : (gB === 'female' ? 'female' : 'male')

      for (const turn of lesson.turns ?? []) {
        const voice = turn.speaker === 'A' ? voiceA : voiceB
        if (turn.en) {
          const text = turn.en.trim(); if (!text) continue
          const key = `${text}|en-US|${voice}`
          if (!seen.has(key)) { seen.add(key); entries.push({ text, lang: 'en-US', voice }) }
        }
        if (turn.vi) {
          const text = turn.vi.trim(); if (!text) continue
          const key = `${text}|vi-VN|${voice}`
          if (!seen.has(key)) { seen.add(key); entries.push({ text, lang: 'vi-VN', voice }) }
        }
      }
    }
  }

  // 4. Patterns
  const patternDir = path.join(PROJECT_ROOT, 'public/data/patterns')
  for (const file of fs.readdirSync(patternDir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()) {
    const subjects = JSON.parse(fs.readFileSync(path.join(patternDir, file), 'utf8')) as Array<{ sentences: Array<{ en: string; vi: string }> }>
    for (const subj of subjects) {
      for (const { en, vi } of subj.sentences) {
        add(en, 'en-US')
        add(vi, 'vi-VN')
      }
    }
  }

  return entries
}

// ── Tra DB theo batch — trả Map<hash, audio_url> ─────────────────────────────

async function lookupHashes(hashes: string[]): Promise<Map<string, string>> {
  const supabase = getSupabaseAdmin()
  const result = new Map<string, string>()
  for (let i = 0; i < hashes.length; i += DB_BATCH) {
    const batch = hashes.slice(i, i + DB_BATCH)
    const { data } = await supabase
      .from('tts_cache')
      .select('hash, audio_url')
      .in('hash', batch)
    for (const row of data ?? []) {
      result.set((row as { hash: string; audio_url: string }).hash,
                 (row as { hash: string; audio_url: string }).audio_url)
    }
  }
  return result
}

// ── Re-encrypt 1 entry ────────────────────────────────────────────────────────

type RemapResult = 'remapped' | 'skipped' | 'missing' | 'error'

async function remapEntry(
  entry: Entry,
  oldAudioUrl: string,
): Promise<RemapResult> {
  const { text, lang, voice } = entry
  const oh = oldHashFn(text, lang, voice)
  const nh = newHashFn(text, lang, voice)
  const supabase = getSupabaseAdmin()

  try {
    // Tải file cũ (ciphertext)
    const res = await fetch(oldAudioUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${oldAudioUrl}`)
    const cipherBuffer = await res.arrayBuffer()

    // Giải mã bằng oldHash
    const plain = await decryptWithHash(cipherBuffer, oh)

    // Re-encrypt bằng newHash
    const newCipher = await encryptWithHash(plain, nh)

    // Upload lên path mới
    const fileName = `${lang}/${voice}/${nh}.mp3`
    const newUrl   = await saveAudio('tts-cache', fileName, newCipher, BASE_URL)

    // Upsert DB record mới
    const { error } = await supabase
      .from('tts_cache')
      .upsert({ hash: nh, lang, voice, audio_url: newUrl }, { onConflict: 'hash' })
    if (error) throw new Error(`DB upsert: ${error.message}`)

    return 'remapped'
  } catch (err) {
    console.error(`\n[remap error] "${text}" (${lang}/${voice}): ${err instanceof Error ? err.message : String(err)}`)
    return 'error'
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const missing = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_TTS_API_KEY', 'TTS_ENCRYPTION_MASTER_KEY',
  ].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    process.exit(1)
  }

  console.log('🔄 Bắt đầu remap TTS cache (re-encrypt, không gọi Google TTS)')
  console.log(`⚙️  DB batch: ${DB_BATCH} | Remap batch: ${REMAP_BATCH}${FORCE ? ' | FORCE' : ''}`)

  // ── Bước 1: Thu thập tất cả entries ────────────────────────────────────────
  process.stdout.write('📋 Đang thu thập dữ liệu nguồn...')
  const allEntries = collectAllEntries().slice(0, LIMIT)
  console.log(` ${allEntries.length.toLocaleString()} entries (${VOICE_IDS.length} giọng)`)

  // ── Bước 2: Tra DB song song — old hash và new hash ─────────────────────────
  process.stdout.write('🔍 Tra cứu DB (old hash + new hash)...')
  const oldHashes = allEntries.map((e) => oldHashFn(e.text, e.lang, e.voice))
  const newHashes = allEntries.map((e) => newHashFn(e.text, e.lang, e.voice))

  const [oldMap, newMap] = await Promise.all([
    lookupHashes(oldHashes),
    lookupHashes(newHashes),
  ])
  console.log(` xong (old found: ${oldMap.size}, new found: ${newMap.size})`)

  // ── Bước 3: Phân loại ────────────────────────────────────────────────────────
  const toRemap:   Array<{ entry: Entry; oldUrl: string }> = []
  const toSkip:    Entry[] = []
  const toMissing: Entry[] = []

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i]
    const nh = newHashes[i]
    const oh = oldHashes[i]

    if (!FORCE && newMap.has(nh)) {
      toSkip.push(entry)
    } else if (oldMap.has(oh)) {
      toRemap.push({ entry, oldUrl: oldMap.get(oh)! })
    } else {
      toMissing.push(entry)
    }
  }

  console.log(`\n📊 Phân loại:`)
  console.log(`   ✅ Đã đúng (newHash tồn tại) : ${toSkip.length.toLocaleString()}`)
  console.log(`   🔄 Cần remap (có oldHash)    : ${toRemap.length.toLocaleString()}`)
  console.log(`   ❌ Thiếu hoàn toàn           : ${toMissing.length.toLocaleString()} → cần seed mới`)

  if (toMissing.length > 0) {
    fs.writeFileSync(MISSING_FILE, JSON.stringify(
      toMissing.map(({ text, lang, voice }) => ({ text, lang, voice })), null, 2,
    ))
    console.log(`   → Đã lưu danh sách vào scripts/missing-tts.json`)
    console.log(`   → Chạy tiếp: npm run seed:all  (script sẽ bỏ qua những gì đã có)`)
  }

  if (toRemap.length === 0) {
    console.log('\n🎉 Không có gì cần remap!')
    return
  }

  // ── Bước 4: Re-encrypt theo batch ────────────────────────────────────────────
  console.log(`\n🔐 Bắt đầu re-encrypt ${toRemap.length.toLocaleString()} entries...`)

  const bar = new cliProgress.SingleBar({
    format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{remapped} ⏭{skipped} ✗{errors}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
  }, cliProgress.Presets.shades_classic)

  bar.start(toRemap.length, 0, { remapped: 0, skipped: 0, errors: 0 })

  let countRemapped = 0, countErrors = 0
  const failedEntries: Array<{ text: string; lang: Lang; voice: VoiceId }> = []

  for (let i = 0; i < toRemap.length; i += REMAP_BATCH) {
    const batch = toRemap.slice(i, i + REMAP_BATCH)
    const results = await Promise.all(
      batch.map(({ entry, oldUrl }) => remapEntry(entry, oldUrl)),
    )
    results.forEach((result, idx) => {
      if (result === 'remapped') countRemapped++
      else if (result === 'error') {
        countErrors++
        failedEntries.push(batch[idx].entry)
      }
    })
    bar.update(Math.min(i + REMAP_BATCH, toRemap.length), { remapped: countRemapped, skipped: 0, errors: countErrors })

    // Nghỉ ngắn để tránh quá tải Supabase Storage
    if (i + REMAP_BATCH < toRemap.length) await sleep(50)
  }

  bar.stop()
  console.log(`\n✅ Remap xong: ${countRemapped} thành công, ${countErrors} lỗi, ${toMissing.length} cần seed mới`)

  if (failedEntries.length > 0) {
    const errFile = path.join(PROJECT_ROOT, 'scripts/remap-errors.json')
    fs.writeFileSync(errFile, JSON.stringify(failedEntries, null, 2))
    console.log(`⚠️  ${failedEntries.length} lỗi → scripts/remap-errors.json`)
  }

  if (toMissing.length > 0) {
    console.log(`\n▶  Bước tiếp theo: npm run seed:all  (chỉ tạo audio cho ${toMissing.length} entry chưa có)`)
  } else {
    console.log('\n🎉 Toàn bộ cache đã được gán lại — không cần chạy seed:all!')
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
