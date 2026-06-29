# Script: Seed 10,000 Từ Phát Âm (Bulk TTS Cache)

## Tổng quan

Script chạy 1 lần duy nhất trên máy local:

- Đọc danh sách 10,000 từ
- Bỏ qua từ đã có trong DB (resume được nếu bị dừng)
- Gọi Google TTS theo batch, tránh rate limit
- Upload mp3 lên Supabase Storage
- Hiển thị progress bar trong terminal
- Ghi log lỗi ra file để retry sau

---

## Cấu trúc file

```
scripts/
  seed-pronunciations.ts    ← Script chính
  words.json                ← Danh sách 10,000 từ của bạn
  seed-errors.json          ← Tự động tạo, chứa từ bị lỗi
```

---

## 1. Cài thêm dependencies

```bash
npm install tsx dotenv cli-progress @types/cli-progress
```

- `tsx` — chạy TypeScript trực tiếp không cần compile
- `dotenv` — đọc file .env.local
- `cli-progress` — progress bar trong terminal

---

## 2. scripts/words.json

```json
["apple", "beautiful", "challenge", "...10000 từ của bạn..."]
```

---

## 3. scripts/seed-pronunciations.ts

```typescript
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import cliProgress from 'cli-progress'

// Load .env.local
dotenv.config({ path: '.env.local' })

// ── Config ──────────────────────────────────────────────────────
const BATCH_SIZE = 5 // Số từ xử lý song song cùng lúc
const DELAY_MS = 300 // Nghỉ giữa các batch (tránh rate limit)
const LANG = 'en-US'
const VOICE = 'en-US-Journey-F' // Giọng tự nhiên nhất

const WORDS_FILE = path.join(__dirname, 'words.json')
const ERRORS_FILE = path.join(__dirname, 'seed-errors.json')

// ── Supabase Client ─────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Cần service role để upload
)

// ── Google TTS ──────────────────────────────────────────────────
async function generateAudio(word: string): Promise<Buffer> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: word },
        voice: { languageCode: LANG, name: VOICE },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
      }),
    },
  )

  if (!res.ok) throw new Error(`TTS API lỗi ${res.status}: ${res.statusText}`)
  const data = await res.json()
  return Buffer.from(data.audioContent, 'base64')
}

// ── Upload lên Supabase Storage ─────────────────────────────────
async function uploadAudio(word: string, buffer: Buffer): Promise<string> {
  const fileName = `${word}.mp3`

  const { error } = await supabase.storage.from('pronunciations').upload(fileName, buffer, {
    contentType: 'audio/mpeg',
    upsert: false, // Không ghi đè nếu đã có
  })

  // Bỏ qua lỗi "đã tồn tại"
  if (error && !error.message.includes('already exists')) {
    throw new Error(`Upload lỗi: ${error.message}`)
  }

  const { data } = supabase.storage.from('pronunciations').getPublicUrl(fileName)

  return data.publicUrl
}

// ── Lưu vào DB ──────────────────────────────────────────────────
async function saveToDb(word: string, audioUrl: string): Promise<void> {
  const { error } = await supabase
    .from('pronunciations')
    .upsert({ word, audio_url: audioUrl, lang: LANG }, { onConflict: 'word' })

  if (error) throw new Error(`DB lỗi: ${error.message}`)
}

// ── Xử lý 1 từ (TTS → Upload → DB) ────────────────────────────
async function processWord(word: string): Promise<'ok' | 'skip' | 'error'> {
  try {
    const buffer = await generateAudio(word)
    const audioUrl = await uploadAudio(word, buffer)
    await saveToDb(word, audioUrl)
    return 'ok'
  } catch (err) {
    return 'error'
  }
}

// ── Hàm chờ ────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── MAIN ────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Bắt đầu seed phát âm...\n')

  // 1. Đọc danh sách từ
  const allWords: string[] = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf-8'))
  console.log(`📋 Tổng số từ: ${allWords.length}`)

  // 2. Lấy từ đã có trong DB (để bỏ qua — resume được)
  const { data: existing } = await supabase.from('pronunciations').select('word')

  const done = new Set(existing?.map((r) => r.word) ?? [])
  const todo = allWords.filter((w) => !done.has(w.toLowerCase()))

  console.log(`✅ Đã có: ${done.size} từ`)
  console.log(`⏳ Cần tạo: ${todo.length} từ\n`)

  if (todo.length === 0) {
    console.log('🎉 Tất cả đã được cache rồi!')
    return
  }

  // 3. Setup progress bar
  const bar = new cliProgress.SingleBar(
    {
      format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} từ | ✓{ok} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )

  bar.start(todo.length, 0, { ok: 0, errors: 0 })

  // 4. Xử lý theo batch
  let countOk = 0
  let countError = 0
  const errorWords: string[] = []

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(batch.map((word) => processWord(word.toLowerCase())))

    results.forEach((result, idx) => {
      if (result === 'ok') {
        countOk++
      } else if (result === 'error') {
        countError++
        errorWords.push(batch[idx])
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, todo.length), {
      ok: countOk,
      errors: countError,
    })

    // Nghỉ giữa các batch
    if (i + BATCH_SIZE < todo.length) {
      await sleep(DELAY_MS)
    }
  }

  bar.stop()

  // 5. Ghi file lỗi để retry sau
  if (errorWords.length > 0) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorWords, null, 2))
    console.log(`\n⚠️  ${errorWords.length} từ bị lỗi → xem file: seed-errors.json`)
    console.log(
      `   Chạy lại với: WORDS_FILE=scripts/seed-errors.json npx tsx scripts/seed-pronunciations.ts`,
    )
  }

  console.log(`\n✅ Hoàn thành! Thành công: ${countOk} | Lỗi: ${countError}`)
}

main().catch(console.error)
```

---

## 4. Thêm lệnh vào package.json

```json
{
  "scripts": {
    "seed:pronunciation": "npx tsx scripts/seed-pronunciations.ts"
  }
}
```

---

## 5. Chạy script

```bash
# Lần đầu — seed toàn bộ
npm run seed:pronunciation

# Nếu bị dừng giữa chừng → chạy lại, script tự bỏ qua từ đã có
npm run seed:pronunciation

# Retry những từ bị lỗi
WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
```

---

## 6. Output trong terminal

```
🚀 Bắt đầu seed phát âm...

📋 Tổng số từ: 10000
✅ Đã có: 3200 từ
⏳ Cần tạo: 6800 từ

Tiến độ |████████░░░░░░░░| 48% | 3264/6800 từ | ✓3260 ✗4

✅ Hoàn thành! Thành công: 6795 | Lỗi: 5
⚠️  5 từ bị lỗi → xem file: seed-errors.json
```

---

## 7. Ước tính thời gian

| Số từ  | BATCH_SIZE=5 + delay 300ms | Thực tế  |
| ------ | -------------------------- | -------- |
| 1,000  | ~4 phút                    | ~5 phút  |
| 5,000  | ~20 phút                   | ~25 phút |
| 10,000 | ~40 phút                   | ~50 phút |

> Có thể tăng BATCH_SIZE lên 10 nếu mạng ổn định để chạy nhanh hơn.

---

## 8. Lưu ý quan trọng

- **Không đóng terminal** khi đang chạy — nếu lỡ đóng, chạy lại bình thường, script tự resume
- **Google TTS free tier**: 1 triệu ký tự/tháng — 10,000 từ trung bình ~5 ký tự/từ = 50,000 ký tự → **hoàn toàn free**
- **Supabase Storage free tier**: 1GB → 10,000 file mp3 ~30KB/file = ~300MB → **vừa đủ free**
