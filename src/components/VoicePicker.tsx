import { useState } from 'react'
import { Lock } from 'lucide-react'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'
import { VOICE_OPTIONS, getAllowedVoices, isVoicePromoActive } from '../lib/voiceTiers'
import type { Plan } from '../types'

interface Props {
  plan: Plan
  isA: boolean // true = giao diện tiếng Việt (chiều A), false = tiếng Anh (chiều B)
}

// Bộ chọn ĐẦY ĐỦ 14 giọng Chirp3-HD (7 nữ + 7 nam) — đặt ở trang Cài đặt/Hồ sơ. Lựa chọn lưu
// TOÀN CỤC (localStorage qua setVoicePref) nên áp dụng ngay cho mọi trang trong app (Chat,
// Luyện nói, Từ điển, Lộ trình...) — không cần chỉnh riêng từng nơi. Giọng ngoài quyền gói
// hiện mờ + khoá (nhưng vẫn hiện đủ 14 để biết có gì nếu nâng cấp).
export default function VoicePicker({ plan, isA }: Props) {
  const [voice, setVoice] = useState<Voice>(getVoicePref())
  const allowed = new Set(getAllowedVoices(plan))
  const promoActive = isVoicePromoActive()

  function choose(v: Voice) {
    if (!allowed.has(v)) return
    setVoice(v)
    setVoicePref(v)
  }

  const groups: { gender: 'female' | 'male'; label: string }[] = [
    { gender: 'female', label: isA ? 'Giọng nữ' : 'Female voices' },
    { gender: 'male', label: isA ? 'Giọng nam' : 'Male voices' },
  ]

  return (
    <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">
          {isA ? 'Giọng đọc (áp dụng cho cả app)' : 'Voice (applies app-wide)'}
        </span>
      </div>
      {promoActive && (
        <p className="text-xs text-emerald-400 mb-3">
          {isA
            ? '🎁 Miễn phí dùng đủ 14 giọng tới hết 31/12/2026'
            : '🎁 All 14 voices free until Dec 31, 2026'}
        </p>
      )}
      {groups.map(({ gender, label }) => (
        <div key={gender} className="mb-3 last:mb-0">
          <p className="text-xs text-zinc-400 mb-2">{label}</p>
          <div className="grid grid-cols-4 gap-2">
            {VOICE_OPTIONS.filter((v) => v.gender === gender).map((v) => {
              const isAllowed = allowed.has(v.id)
              const isSelected = voice === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v.id)}
                  disabled={!isAllowed}
                  title={
                    isAllowed
                      ? v.id
                      : isA
                        ? 'Nâng cấp gói để mở khoá giọng này'
                        : 'Upgrade your plan to unlock this voice'
                  }
                  aria-pressed={isSelected}
                  className={`relative flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border transition ${
                    isSelected
                      ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                      : isAllowed
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {!isAllowed && <Lock className="w-3 h-3 shrink-0" />}
                  {v.id}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
