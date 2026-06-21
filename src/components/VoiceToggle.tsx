import { useState } from 'react'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'

// Nút gạt chọn giọng đọc TOÀN CỤC (nữ/nam) cho mọi nút loa trong app.
// Lựa chọn được lưu vào localStorage (xem getVoicePref/setVoicePref trong lib/tts.ts),
// nên các nút loa (SpeakButton) đọc giá trị này lúc bấm — đổi 1 chỗ là áp dụng tất cả.
export default function VoiceToggle() {
  const [voice, setVoice] = useState<Voice>(getVoicePref())

  function choose(v: Voice) {
    setVoice(v)
    setVoicePref(v)
  }

  return (
    <div
      className="flex rounded-full bg-zinc-800 p-0.5 text-[10px] leading-none shrink-0"
      title="Chọn giọng đọc (áp dụng cho cả app)"
    >
      <button
        type="button"
        onClick={() => choose('female')}
        className={`px-2 py-1 rounded-full transition ${
          voice === 'female' ? 'bg-emerald-500/30 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Nữ
      </button>
      <button
        type="button"
        onClick={() => choose('male')}
        className={`px-2 py-1 rounded-full transition ${
          voice === 'male' ? 'bg-emerald-500/30 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Nam
      </button>
    </div>
  )
}
