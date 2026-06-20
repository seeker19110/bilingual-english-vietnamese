import { useState } from 'react'
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import { PHRASE_CATEGORIES } from '../data/phrases'
import type { Direction } from '../types'

// Phát âm một cụm từ qua Web Speech API (không tốn API)
function speak(text: string, lang: 'en-US' | 'vi-VN') {
  if (!('speechSynthesis' in window)) return
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

export default function CommonPhrases() {
  const dir: Direction = getDirection()
  const [openId, setOpenId] = useState<string>(PHRASE_CATEGORIES[0].id)

  // Chiều A: học tiếng Anh → en là đích, vi là giải thích
  // Chiều B: học tiếng Việt → vi là đích, en là giải thích
  const targetLang = dir === 'A' ? 'en-US' : 'vi-VN'
  const nativeLang = dir === 'A' ? 'vi-VN' : 'en-US'

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout
        title={dir === 'A' ? 'Cụm từ thông dụng' : 'Common Phrases'}
        back
      />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">

        {/* Hướng dẫn ngắn */}
        <p className="text-xs text-zinc-500 mb-2">
          {dir === 'A'
            ? 'Nhấn 🔊 để nghe phát âm. Màu xanh = tiếng Anh (đích), màu xám = nghĩa tiếng Việt.'
            : 'Tap 🔊 to hear pronunciation. Blue = Vietnamese (target), gray = English meaning.'}
        </p>

        {PHRASE_CATEGORIES.map(cat => {
          const isOpen = openId === cat.id
          const title = dir === 'A' ? cat.titleA : cat.titleB

          return (
            <div key={cat.id}
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden">

              {/* Header — bấm để mở/đóng */}
              <button
                onClick={() => setOpenId(isOpen ? '' : cat.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="flex-1 font-semibold text-white text-[15px]">{title}</span>
                <span className="text-xs text-zinc-600">{cat.phrases.length} cụm từ</span>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
              </button>

              {/* Danh sách cụm từ */}
              {isOpen && (
                <ul className="divide-y divide-zinc-800/60">
                  {cat.phrases.map((ph, idx) => {
                    const target = dir === 'A' ? ph.en : ph.vi
                    const native = dir === 'A' ? ph.vi : ph.en
                    const note   = dir === 'A' ? ph.noteA : ph.noteB

                    return (
                      <li key={idx} className="px-4 py-3 flex items-start gap-3 group">

                        {/* Nội dung */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-sky-300 leading-snug">{target}</p>
                          <p className="text-sm text-zinc-400 mt-0.5">{native}</p>
                          {note && (
                            <p className="text-[11px] text-zinc-600 mt-1 italic">{note}</p>
                          )}
                        </div>

                        {/* Nút phát âm từ đích */}
                        <button
                          onClick={() => speak(target, targetLang)}
                          title={dir === 'A' ? 'Nghe phát âm tiếng Anh' : 'Nghe phát âm tiếng Việt'}
                          className="mt-0.5 p-1.5 rounded-lg text-zinc-600 hover:text-sky-400 hover:bg-zinc-800 active:scale-95 transition-all shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Nút phát âm tiếng mẹ đẻ (ẩn, chỉ hiện khi hover) */}
                        <button
                          onClick={() => speak(native, nativeLang)}
                          title={dir === 'A' ? 'Nghe nghĩa tiếng Việt' : 'Hear English meaning'}
                          className="mt-0.5 p-1.5 rounded-lg text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 active:scale-95 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
