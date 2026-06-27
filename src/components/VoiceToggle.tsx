import { useState } from 'react'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'

// Pill toggle chọn giọng TOÀN CỤC — bấm vào đâu trên pill cũng đổi Nữ ↔ Nam.
export default function VoiceToggle() {
  const [voice, setVoice] = useState<Voice>(getVoicePref())

  function toggle() {
    const next: Voice = voice === 'female' ? 'male' : 'female'
    setVoice(next)
    setVoicePref(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Chọn giọng đọc (áp dụng cho cả app)"
      className="flex rounded-full bg-zinc-800 p-0.5 text-[11px] leading-none shrink-0 cursor-pointer"
    >
      <span className={`px-2 py-1 rounded-full transition ${
        voice === 'female' ? 'bg-accent-500/30 text-accent-300' : 'text-zinc-400'
      }`}>Nữ</span>
      <span className={`px-2 py-1 rounded-full transition ${
        voice === 'male' ? 'bg-accent-500/30 text-accent-300' : 'text-zinc-400'
      }`}>Nam</span>
    </button>
  )
}
