import { useState } from 'react'
import { Lock, Shuffle } from 'lucide-react'
import {
  getVoicePref,
  setVoicePref,
  getVoiceRandomPref,
  setVoiceRandomPref,
  reshuffleRandomVoice,
  type Voice,
} from '../lib/tts'
import {
  VOICE_OPTIONS,
  DEFAULT_SEED_VOICE_IDS,
  ELEVEN_VOICE_IDS,
  STUDIO_VOICE_IDS,
  getAllowedVoices,
  isVoicePromoActive,
} from '../lib/voiceTiers'
import type { Plan } from '../types'

interface Props {
  plan: Plan
  isA: boolean // true = giao diện tiếng Việt (chiều A), false = tiếng Anh (chiều B)
}

// Bộ chọn ĐẦY ĐỦ 14 giọng Chirp3-HD (7 nữ + 7 nam) — đặt ở trang Cài đặt/Hồ sơ. Lựa chọn lưu
// TOÀN CỤC (localStorage qua setVoicePref) nên áp dụng ngay cho mọi trang trong app (Chat,
// Luyện nói, Từ điển, Lộ trình...) — không cần chỉnh riêng từng nơi. Giọng ngoài quyền gói
// hiện mờ + khoá (nhưng vẫn hiện đủ 14 để biết có gì nếu nâng cấp). 8 giọng đã seed sẵn (⚡,
// DEFAULT_SEED_VOICE_IDS) hiện TRƯỚC trong mỗi hàng (đúng thứ tự VOICE_OPTIONS) và phát ngay
// lập tức; 6 giọng còn lại vẫn chọn được, chỉ chậm hơn 1 chút ở lần phát đầu tiên.
export default function VoicePicker({ plan, isA }: Props) {
  const [voice, setVoice] = useState<Voice>(getVoicePref())
  const [random, setRandom] = useState(getVoiceRandomPref())
  const allowed = new Set(getAllowedVoices(plan))
  const seeded = new Set(DEFAULT_SEED_VOICE_IDS)
  const eleven = new Set(ELEVEN_VOICE_IDS)
  const studio = new Set(STUDIO_VOICE_IDS)
  const promoActive = isVoicePromoActive()

  function choose(v: Voice) {
    if (!allowed.has(v)) return
    setVoice(v)
    setVoicePref(v)
  }

  function toggleRandom() {
    const next = !random
    setRandom(next)
    setVoiceRandomPref(next)
    if (next) reshuffleRandomVoice() // bật lên → bốc giọng mới ngay, không dùng lại giọng cũ
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
        <p className="text-xs text-emerald-400 theme-light:text-emerald-800 mb-3">
          {isA
            ? '🎁 Miễn phí dùng đủ 14 giọng tới hết 31/12/2026'
            : '🎁 All 14 voices free until Dec 31, 2026'}
        </p>
      )}

      {/* Chế độ giọng ngẫu nhiên — áp dụng TOÀN BỘ trang (Từ điển, Chat, Luyện nói, Cụm từ...),
          vẫn giữ nguyên 1 giọng xuyên suốt trong 1 phiên/hội thoại, chỉ đổi khi mở tab mới hoặc
          bấm "Đổi giọng khác". Giới tính (Nữ/Nam chọn bên dưới) không đổi, chỉ đổi giọng cụ thể. */}
      <div className="flex items-center justify-between gap-2 bg-zinc-950/50 border border-zinc-800/60 rounded-xl px-3 py-2.5 mb-3">
        <div className="min-w-0">
          <label htmlFor="voice-random-toggle" className="text-sm font-medium text-white block">
            {isA ? '🎲 Giọng ngẫu nhiên' : '🎲 Random voice'}
          </label>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isA
              ? 'Đổi giọng cụ thể mỗi phiên (giữ nguyên giới tính), áp dụng mọi trang'
              : 'Changes the specific voice each session (same gender), applies everywhere'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {random && (
            <button
              type="button"
              onClick={() => {
                reshuffleRandomVoice()
                setVoice(getVoicePref())
              }}
              title={
                isA ? 'Đổi sang giọng ngẫu nhiên khác ngay' : 'Reshuffle to a different voice now'
              }
              className="tap-44 flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          )}
          <button
            id="voice-random-toggle"
            type="button"
            role="switch"
            aria-checked={random}
            onClick={toggleRandom}
            className={`tap-44 relative w-11 h-6 rounded-full transition shrink-0 ${
              random ? 'bg-accent-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                random ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {groups.map(({ gender, label }) => (
        <div key={gender} className="mb-3 last:mb-0">
          <p className="text-xs text-zinc-400 mb-2">{label}</p>
          <div className="grid grid-cols-4 gap-2">
            {VOICE_OPTIONS.filter((v) => v.gender === gender).map((v) => {
              const isAllowed = allowed.has(v.id)
              const isSelected = voice === v.id
              const isSeeded = seeded.has(v.id)
              const isEleven = eleven.has(v.id)
              const isStudio = studio.has(v.id)
              const slowHint = isA ? ' (tạo lần đầu chậm hơn 1 chút)' : ' (slower on first play)'
              const elevenHint = isA ? ' — giọng đặc biệt VIP' : ' — special VIP voice'
              const studioHint = isA
                ? ' — giọng Studio cao cấp (VIP), chỉ tiếng Anh'
                : ' — premium Studio voice (VIP), English only'
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v.id)}
                  disabled={!isAllowed}
                  title={
                    !isAllowed
                      ? isA
                        ? 'Nâng cấp gói Pro/VIP để mở khoá giọng này'
                        : 'Upgrade to Pro/VIP to unlock this voice'
                      : isEleven
                        ? `${v.id}${elevenHint}`
                        : isStudio
                          ? `${v.id}${studioHint}`
                          : isSeeded
                            ? v.id
                            : `${v.id}${slowHint}`
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
                  {isSeeded && isAllowed && <span aria-hidden>⚡</span>}
                  {isEleven && isAllowed && (
                    <span aria-hidden title="VIP">
                      ✨
                    </span>
                  )}
                  {isStudio && isAllowed && (
                    <span aria-hidden title="Studio — VIP">
                      🎓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-zinc-400 mt-1">
        {isA
          ? '⚡ = giọng phát ngay lập tức. Giọng khác chậm hơn 1 chút ở lần phát đầu tiên.'
          : '⚡ = plays instantly. Other voices are slightly slower the first time.'}
      </p>
    </section>
  )
}
