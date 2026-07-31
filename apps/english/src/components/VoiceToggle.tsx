import { useState } from 'react'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'
import { VOICE_OPTIONS } from '../lib/voiceTiers'

function genderOf(voice: Voice): 'female' | 'male' {
  return VOICE_OPTIONS.find((v) => v.id === voice)?.gender ?? 'female'
}

// Pill toggle chọn NHANH giới tính giọng — bấm đổi Nữ ↔ Nam. Chỉ chuyển giữa 2 giọng mặc định
// (Kore/Puck); muốn chọn 1 trong 14 giọng cụ thể thì vào Cài đặt (Profile.tsx → VoicePicker).
export default function VoiceToggle() {
  const [voice, setVoice] = useState<Voice>(getVoicePref())
  const gender = genderOf(voice)

  function toggle() {
    const next: Voice = gender === 'female' ? 'Puck' : 'Kore'
    setVoice(next)
    setVoicePref(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Chọn giọng đọc (áp dụng cho cả app) — chọn giọng cụ thể ở trang Cài đặt"
      className="tap-44 flex rounded-full bg-zinc-800 p-0.5 text-[11px] leading-none shrink-0 cursor-pointer"
    >
      <span
        className={`px-2 py-1 rounded-full transition ${
          gender === 'female'
            ? 'bg-accent-500/30 text-accent-300 theme-light:text-accent-800'
            : 'text-zinc-400'
        }`}
      >
        Nữ
      </span>
      <span
        className={`px-2 py-1 rounded-full transition ${
          gender === 'male'
            ? 'bg-accent-500/30 text-accent-300 theme-light:text-accent-800'
            : 'text-zinc-400'
        }`}
      >
        Nam
      </span>
    </button>
  )
}
