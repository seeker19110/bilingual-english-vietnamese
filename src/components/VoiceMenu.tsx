import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Lock } from 'lucide-react'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'
import { VOICE_OPTIONS, DEFAULT_SEED_VOICE_IDS, getAllowedVoices } from '../lib/voiceTiers'
import type { Plan } from '../types'

interface Props {
  plan: Plan
  isA: boolean // true = giao diện tiếng Việt (chiều A), false = tiếng Anh (chiều B)
}

function genderOf(voice: Voice): 'female' | 'male' {
  return VOICE_OPTIONS.find((v) => v.id === voice)?.gender ?? 'female'
}

// Thay thế cặp VoiceToggle + RateToggle cũ trên header (Dictionary/CommonPhrases/Lessons):
// pill Nữ/Nam đổi GIỚI TÍNH giọng, kèm nút mũi tên mở menu chọn ĐÚNG 1 trong 7 giọng của
// giới tính đang chọn — khoá theo gói (Free/Pro/VIP, xem voiceTiers.ts). Lựa chọn lưu TOÀN
// CỤC (setVoicePref) nên đồng bộ với VoicePicker đầy đủ ở trang Cài đặt (Profile.tsx).
export default function VoiceMenu({ plan, isA }: Props) {
  const nav = useNavigate()
  const [voice, setVoice] = useState<Voice>(getVoicePref())
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const gender = genderOf(voice)
  const allowed = new Set(getAllowedVoices(plan))
  const seeded = new Set(DEFAULT_SEED_VOICE_IDS)
  const voicesOfGender = VOICE_OPTIONS.filter((v) => v.gender === gender)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function choose(v: Voice) {
    if (!allowed.has(v)) return
    setVoice(v)
    setVoicePref(v)
    setOpen(false)
  }

  function toggleGender() {
    // Đổi giới tính: chọn giọng đầu tiên của giới tính kia (ưu tiên giọng gói hiện tại được
    // dùng), rồi mở menu luôn để người dùng chọn cụ thể nếu muốn.
    const nextGender = gender === 'female' ? 'male' : 'female'
    const candidates = VOICE_OPTIONS.filter((v) => v.gender === nextGender)
    const first = candidates.find((v) => allowed.has(v.id)) ?? candidates[0]
    if (first) choose(first.id)
  }

  return (
    <div ref={rootRef} className="relative flex items-center shrink-0">
      <div
        role="group"
        title={
          isA
            ? 'Chọn giới tính giọng đọc (áp dụng cho cả app)'
            : 'Choose voice gender (applies app-wide)'
        }
        className="tap-44 flex rounded-full bg-zinc-800 p-0.5 text-[11px] leading-none shrink-0"
      >
        <button
          type="button"
          onClick={() => gender !== 'female' && toggleGender()}
          className={`px-2 py-1 rounded-full transition cursor-pointer ${
            gender === 'female'
              ? 'bg-accent-500/30 text-accent-300 theme-light:text-accent-800'
              : 'text-zinc-400'
          }`}
        >
          {isA ? 'Nữ' : 'Female'}
        </button>
        <button
          type="button"
          onClick={() => gender !== 'male' && toggleGender()}
          className={`px-2 py-1 rounded-full transition cursor-pointer ${
            gender === 'male'
              ? 'bg-accent-500/30 text-accent-300 theme-light:text-accent-800'
              : 'text-zinc-400'
          }`}
        >
          {isA ? 'Nam' : 'Male'}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={isA ? 'Chọn giọng cụ thể' : 'Choose specific voice'}
          title={isA ? `Giọng đang dùng: ${voice}` : `Current voice: ${voice}`}
          className="tap-44 flex items-center justify-center pl-1 pr-1.5 text-zinc-400 hover:text-white transition"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl p-2 shadow-xl animate-fade-in">
          <p className="text-[11px] text-zinc-500 px-1 pb-1.5">
            {isA
              ? gender === 'female'
                ? 'Giọng nữ'
                : 'Giọng nam'
              : gender === 'female'
                ? 'Female voices'
                : 'Male voices'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {voicesOfGender.map((v) => {
              const isAllowed = allowed.has(v.id)
              const isSelected = voice === v.id
              const isSeeded = seeded.has(v.id)
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v.id)}
                  disabled={!isAllowed}
                  title={
                    !isAllowed
                      ? isA
                        ? 'Nâng cấp gói để mở khoá giọng này'
                        : 'Upgrade your plan to unlock this voice'
                      : v.id
                  }
                  aria-pressed={isSelected}
                  className={`relative flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isSelected
                      ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                      : isAllowed
                        ? 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        : 'bg-zinc-950/20 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {!isAllowed && <Lock className="w-3 h-3 shrink-0" />}
                  {v.id}
                  {isSeeded && isAllowed && <span aria-hidden>⚡</span>}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              nav('/profile')
            }}
            className="block w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 mt-2 pt-1.5 border-t border-zinc-800/60 transition"
          >
            {isA ? 'Xem đủ 14 giọng ở Cài đặt →' : 'See all 14 voices in Settings →'}
          </button>
        </div>
      )}
    </div>
  )
}
