# Tính năng: Cache Phát Âm Từ Điển (TTS + Supabase)

## Mục tiêu

Khi user tìm một từ tiếng Anh:

- Lần đầu → gọi Google Cloud TTS tạo audio → lưu vào Supabase Storage + DB
- Lần sau → đọc thẳng từ cache, không gọi API nữa

---

## 1. Cấu trúc thư mục cần tạo

```
app/
  api/
    pronunciation/
      route.ts          ← API endpoint chính
lib/
  supabase.ts           ← Supabase client (đã có sẵn nếu dùng template)
  tts.ts                ← Wrapper gọi Google TTS
components/
  WordCard.tsx          ← UI hiển thị từ + nút phát âm
```

---

## 2. Supabase Setup

### 2a. Tạo bảng trong Supabase SQL Editor

```sql
create table pronunciations (
  id         uuid primary key default gen_random_uuid(),
  word       text not null unique,
  audio_url  text not null,
  lang       text not null default 'en-US',
  created_at timestamp with time zone default now()
);

-- Index để tìm nhanh theo từ
create index idx_pronunciations_word on pronunciations(word);
```

### 2b. Tạo Storage Bucket

Vào Supabase Dashboard → Storage → New Bucket:

- Name: `pronunciations`
- Public: **BẬT** (để audio_url có thể phát thẳng trên browser)

---

## 3. Environment Variables

Thêm vào file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Dùng để upload file server-side
GOOGLE_TTS_API_KEY=your_google_tts_key
```

> Lấy Google TTS API Key tại: https://console.cloud.google.com → APIs & Services → Text-to-Speech API

---

## 4. lib/tts.ts — Gọi Google Cloud TTS

```typescript
// lib/tts.ts

export async function generateAudioFromGoogle(word: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: word },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Journey-F', // Giọng tự nhiên nhất của Google
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9, // Hơi chậm để dễ nghe
          pitch: 0,
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Google TTS error: ${response.statusText}`)
  }

  const data = await response.json()
  // Google trả về base64, decode thành Buffer
  return Buffer.from(data.audioContent, 'base64')
}
```

---

## 5. app/api/pronunciation/route.ts — API Endpoint chính

```typescript
// app/api/pronunciation/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAudioFromGoogle } from '@/lib/tts'

// Dùng service role key để upload file (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const word = searchParams.get('word')?.toLowerCase().trim()

  if (!word) {
    return NextResponse.json({ error: 'Thiếu tham số word' }, { status: 400 })
  }

  // ── BƯỚC 1: Kiểm tra cache ──────────────────────────────────
  const { data: cached } = await supabase
    .from('pronunciations')
    .select('audio_url')
    .eq('word', word)
    .single()

  if (cached?.audio_url) {
    // Cache HIT → trả về luôn, không tốn token
    return NextResponse.json({ audio_url: cached.audio_url, cached: true })
  }

  // ── BƯỚC 2: Cache MISS → Gọi Google TTS ────────────────────
  let audioBuffer: Buffer
  try {
    audioBuffer = await generateAudioFromGoogle(word)
  } catch (err) {
    return NextResponse.json({ error: 'Không thể tạo audio' }, { status: 500 })
  }

  // ── BƯỚC 3: Upload lên Supabase Storage ────────────────────
  const fileName = `${word}.mp3`

  const { error: uploadError } = await supabase.storage
    .from('pronunciations')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: false, // Không ghi đè nếu đã có
    })

  if (uploadError && uploadError.message !== 'The resource already exists') {
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 })
  }

  // ── BƯỚC 4: Lấy public URL ─────────────────────────────────
  const { data: urlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)

  const audioUrl = urlData.publicUrl

  // ── BƯỚC 5: Lưu vào DB ─────────────────────────────────────
  await supabase.from('pronunciations').insert({
    word,
    audio_url: audioUrl,
    lang: 'en-US',
  })

  return NextResponse.json({ audio_url: audioUrl, cached: false })
}
```

---

## 6. components/WordCard.tsx — UI phát âm

```typescript
// components/WordCard.tsx
"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordCardProps {
  word: string;
  definition?: string;
}

export function WordCard({ word, definition }: WordCardProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function handlePlay() {
    setLoading(true);
    try {
      // Nếu đã có URL rồi thì phát luôn
      if (audioUrl) {
        playAudio(audioUrl);
        return;
      }

      // Lần đầu: gọi API để lấy URL (cache hoặc tạo mới)
      const res = await fetch(`/api/pronunciation?word=${encodeURIComponent(word)}`);
      const data = await res.json();

      if (data.audio_url) {
        setAudioUrl(data.audio_url);  // Lưu vào state để dùng lại
        playAudio(data.audio_url);
      }
    } catch (err) {
      console.error("Lỗi phát âm:", err);
    } finally {
      setLoading(false);
    }
  }

  function playAudio(url: string) {
    const audio = new Audio(url);
    audio.play();
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{word}</h2>
        {definition && (
          <p className="text-muted-foreground mt-1 text-sm">{definition}</p>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handlePlay}
        disabled={loading}
        title="Phát âm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

---

## 7. Cách dùng WordCard trong trang tìm kiếm

```typescript
// app/dictionary/page.tsx (ví dụ)
import { WordCard } from "@/components/WordCard";

export default function DictionaryPage() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <WordCard
        word="apple"
        definition="A round fruit with red or green skin"
      />
      <WordCard
        word="beautiful"
        definition="Pleasing the senses or mind aesthetically"
      />
    </div>
  );
}
```

---

## 8. Luồng hoạt động tổng thể

```
User click nút loa
       │
       ▼
GET /api/pronunciation?word=apple
       │
       ▼
  Có trong DB?
  ┌────┴────┐
 CÓ        KHÔNG
  │          │
  │          ▼
  │    Gọi Google TTS
  │          │
  │          ▼
  │    Upload mp3 → Supabase Storage
  │          │
  │          ▼
  │    Lưu audio_url → DB
  │          │
  └────┬─────┘
       │
       ▼
  Trả về audio_url
       │
       ▼
  Browser phát audio
```

---

## 9. Chi phí ước tính

| Giai đoạn                 | Lượt gọi TTS             | Chi phí                      |
| ------------------------- | ------------------------ | ---------------------------- |
| Tháng đầu (warm-up cache) | ~5,000 từ phổ biến       | Free (Google 1M ký tự/tháng) |
| Tháng 2+                  | Gần 0 (hầu hết đã cache) | ~$0                          |
| Từ hiếm, mới              | Rất ít                   | Không đáng kể                |

---

## 10. Mở rộng sau này (không cần làm ngay)

- [ ] Hỗ trợ nhiều giọng: US / UK / AU
- [ ] Phát âm theo câu, không chỉ từ đơn
- [ ] Rate limiting để tránh bị abuse
- [ ] Prefetch top 1000 từ phổ biến khi khởi động

```

```
