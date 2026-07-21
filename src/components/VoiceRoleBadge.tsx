import { useState } from 'react'
import { Check, Volume2 } from 'lucide-react'
import { setVoicePref, type Voice } from '../lib/tts'

interface Props {
  voice: Voice
  gender: 'female' | 'male'
  label: string // vd: "A" / "B" — vai đang nói giọng này
  isA: boolean
}

// Hiện TÊN giọng đang phát cho 1 vai (A/B) trong màn hội thoại 2 nhân vật + nút "Đặt làm mặc
// định" để lưu NGAY giọng đó làm pref toàn cục (setVoicePref) — dùng khi người dùng nghe thấy
// giọng ngẫu nhiên hay, muốn dùng lại giọng này ở Từ điển/Luyện nói/Cài đặt... Vì DialogueView/
// LessonView random giọng mỗi lần mở (xem pickRandomVoice trong voiceTiers.ts).
export default function VoiceRoleBadge({ voice, gender, label, isA }: Props) {
  const [justSet, setJustSet] = useState(false)

  function setDefault() {
    setVoicePref(voice)
    setJustSet(true)
    setTimeout(() => setJustSet(false), 1500)
  }

  return (
    <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
      <Volume2 className="w-3 h-3 shrink-0" />
      <span>
        {label}: <span className="text-zinc-300 font-medium">{voice}</span>{' '}
        <span className="text-zinc-600">
          ({gender === 'female' ? (isA ? 'Nữ' : 'F') : isA ? 'Nam' : 'M'})
        </span>
      </span>
      <button
        type="button"
        onClick={setDefault}
        title={
          isA ? 'Dùng giọng này làm mặc định cho cả app' : 'Use this voice as the app-wide default'
        }
        className={`px-1.5 py-0.5 rounded-full border transition ${
          justSet
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
        }`}
      >
        {justSet ? (
          <span className="flex items-center gap-0.5">
            <Check className="w-3 h-3" /> {isA ? 'Đã đặt' : 'Set'}
          </span>
        ) : isA ? (
          'Đặt mặc định'
        ) : (
          'Set default'
        )}
      </button>
    </div>
  )
}
