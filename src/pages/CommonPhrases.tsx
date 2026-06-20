import { useMemo, useState } from 'react'
import { Volume2, Search, X, Sparkles, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import { callClaude, parseJson } from '../lib/ai'
import { speak as speakTts } from '../lib/tts'
import phrasesData from '../data/phrases.json'
import type { Direction } from '../types'

// Cấu trúc 1 câu thông dụng — khớp src/data/phrases.json (1000+ câu, có IPA)
interface Phrase {
  id: number
  group: string
  en: string
  ipa: string
  vi: string
  note: string
}

const PHRASES = phrasesData as Phrase[]
const GROUPS = Array.from(new Set(PHRASES.map((p) => p.group)))

interface AiResult {
  ipa?: string
  explain_vi?: string
}

// Phát âm 1 câu bằng Google TTS chất lượng cao (tự fallback giọng trình duyệt nếu lỗi).
// Cụm từ là nội dung TĨNH nên cache = true → cùng 1 câu chỉ tạo audio 1 lần.
function speak(text: string, lang: 'en-US' | 'vi-VN') {
  void speakTts(text, lang === 'en-US' ? 'en' : 'vi', { cache: true })
}

export default function CommonPhrases() {
  const dir: Direction = getDirection()
  const isA = dir === 'A' // A: học tiếng Anh (đích=Anh) · B: học tiếng Việt (đích=Việt)
  const targetVoice: 'en-US' | 'vi-VN' = isA ? 'en-US' : 'vi-VN'
  const nativeVoice: 'en-US' | 'vi-VN' = isA ? 'vi-VN' : 'en-US'

  const [group, setGroup] = useState<string>(GROUPS[0])
  const [query, setQuery] = useState('')
  const [ai, setAi] = useState<Record<number, AiResult>>({})
  const [aiLoading, setAiLoading] = useState<number | null>(null)
  const [aiError, setAiError] = useState<number | null>(null)

  const q = query.trim().toLowerCase()

  const list = useMemo(() => {
    if (q) {
      return PHRASES.filter(
        (p) =>
          p.en.toLowerCase().includes(q) ||
          p.vi.toLowerCase().includes(q) ||
          p.group.toLowerCase().includes(q),
      ).slice(0, 80)
    }
    return PHRASES.filter((p) => p.group === group)
  }, [q, group])

  const groupNote = !q ? list[0]?.note : null

  async function refineWithAI(p: Phrase) {
    if (aiLoading !== null) return
    setAiError(null)
    setAiLoading(p.id)
    try {
      const targetName = isA ? 'English' : 'Vietnamese'
      const explainName = isA ? 'Vietnamese' : 'English'
      const learnText = isA ? p.en : p.vi
      const meaningText = isA ? p.vi : p.en
      const system =
        `Bạn là giáo viên phát âm ${targetName} cho người nói ${explainName}. Trả về DUY NHẤT một JSON ` +
        '{"ipa":"...","explain_vi":"..."}. ' +
        `"ipa" là phiên âm/hướng dẫn phát âm cho câu ${targetName} (đặt trong /.../). ` +
        `"explain_vi" là giải thích NGẮN (1–2 câu) bằng ${explainName}: khi nào dùng câu này + 1 lưu ý phát âm. Không thêm gì ngoài JSON.`
      const text = await callClaude(
        [{ role: 'user', content: `Câu (${targetName}): "${learnText}"\nNghĩa (${explainName}): ${meaningText}` }],
        system,
        300,
      )
      const res = parseJson<AiResult>(text)
      if (!res) throw new Error('parse')
      setAi((prev) => ({ ...prev, [p.id]: res }))
    } catch {
      setAiError(p.id)
      setTimeout(() => setAiError((cur) => (cur === p.id ? null : cur)), 2500)
    } finally {
      setAiLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout
        title={isA ? 'Câu thông dụng' : 'Common Phrases'}
        subtitle={`${PHRASES.length.toLocaleString('vi-VN')} câu · IPA · ${isA ? 'nghe & giải thích' : 'listen & explain'}`}
        back
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isA ? 'Tìm câu tiếng Anh hoặc nghĩa tiếng Việt...' : 'Search Vietnamese or English...'}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!q && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                  g === group
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {groupNote && (
          <div className="mb-3 rounded-xl bg-sky-500/10 border border-sky-500/25 p-3 text-xs text-sky-200/90 leading-relaxed">
            <strong className="text-sky-300">Cách dùng:</strong> {groupNote}
          </div>
        )}

        <p className="text-xs text-zinc-600 mb-2">
          {q ? `${list.length} kết quả${list.length === 80 ? '+ (80 đầu)' : ''}` : `${list.length} câu`}
        </p>

        <div className="space-y-2">
          {list.map((p) => {
            const aiRes = ai[p.id]
            const targetText = isA ? p.en : p.vi
            const meaningText = isA ? p.vi : p.en
            const ipaText = aiRes?.ipa ?? p.ipa
            return (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-[15px] font-semibold text-sky-300 leading-snug">{targetText}</p>
                  <button
                    onClick={() => speak(targetText, targetVoice)}
                    title={isA ? 'Nghe tiếng Anh' : 'Nghe tiếng Việt'}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-sky-400 hover:bg-zinc-800 active:scale-95 transition"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {ipaText && (
                  <p className="mt-1 text-xs font-mono text-emerald-400/90">
                    <span className="text-emerald-500/60">EN</span> {ipaText}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1.5">
                  <p className="flex-1 text-sm text-zinc-400 italic">{meaningText}</p>
                  <button
                    onClick={() => speak(meaningText, nativeVoice)}
                    title={isA ? 'Nghe nghĩa tiếng Việt' : 'Hear English meaning'}
                    className="shrink-0 p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 active:scale-95 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {aiRes?.explain_vi && (
                  <div className="mt-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-2.5 text-xs text-zinc-300 leading-relaxed">
                    <Sparkles className="w-3 h-3 text-amber-400 inline mr-1 -mt-0.5" />
                    {aiRes.explain_vi}
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => refineWithAI(p)}
                    disabled={aiLoading !== null}
                    className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition disabled:opacity-50 ${
                      aiError === p.id
                        ? 'border-red-500/40 text-red-400'
                        : 'border-amber-500/30 text-amber-300/90 hover:bg-amber-500/10'
                    }`}
                  >
                    {aiLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {aiError === p.id ? 'Lỗi, thử lại' : aiRes ? 'Tinh chỉnh lại' : 'AI: phát âm & giải thích'}
                  </button>
                </div>
              </div>
            )
          })}

          {list.length === 0 && (
            <p className="text-center text-sm text-zinc-600 py-8">Không tìm thấy câu nào phù hợp.</p>
          )}
        </div>
      </main>
    </div>
  )
}
