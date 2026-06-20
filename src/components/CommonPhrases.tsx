import { useMemo, useState } from 'react'
import { Search, Sparkles, Loader2, X } from 'lucide-react'
import SpeakButton from './SpeakButton'
import { callClaude, parseJson } from '../lib/ai'
import { dirConfig } from '../lib/direction'
import phrasesData from '../data/phrases.json'

// Cấu trúc 1 câu thông dụng — khớp dữ liệu trong src/data/phrases.json
interface Phrase {
  id: number
  group: string   // nhãn nhóm mẫu câu, vd "I'm + tính từ"
  en: string      // câu tiếng Anh
  ipa: string     // phiên âm IPA (sinh sẵn, offline)
  vi: string      // nghĩa tiếng Việt
  note: string    // giải thích ngữ pháp của cả nhóm
}

const PHRASES = phrasesData as Phrase[]

// Danh sách các nhóm (giữ đúng thứ tự xuất hiện trong dữ liệu)
const GROUPS = Array.from(new Set(PHRASES.map(p => p.group)))

// Kết quả AI tinh chỉnh cho 1 câu
interface AiResult {
  ipa?: string
  explain_vi?: string
}

export default function CommonPhrases() {
  const dir = dirConfig() // chiều học: quyết định câu nào là "câu học" và giọng nghe
  // Nhóm đang chọn (mặc định nhóm đầu tiên). null = đang tìm kiếm toàn bộ.
  const [group, setGroup] = useState<string>(GROUPS[0])
  const [query, setQuery] = useState('')

  // Bộ nhớ kết quả AI theo id câu, + trạng thái đang tải / lỗi theo id
  const [ai, setAi] = useState<Record<number, AiResult>>({})
  const [aiLoading, setAiLoading] = useState<number | null>(null)
  const [aiError, setAiError] = useState<number | null>(null)

  const q = query.trim().toLowerCase()

  // Lọc câu: nếu có từ khóa thì tìm trên toàn bộ (cắt còn 80 kết quả cho nhẹ);
  // nếu không, hiển thị các câu thuộc nhóm đang chọn.
  const list = useMemo(() => {
    if (q) {
      return PHRASES.filter(
        p => p.en.toLowerCase().includes(q) || p.vi.toLowerCase().includes(q) || p.group.toLowerCase().includes(q),
      ).slice(0, 80)
    }
    return PHRASES.filter(p => p.group === group)
  }, [q, group])

  // Ghi chú ngữ pháp của nhóm hiện tại (chỉ hiện khi không tìm kiếm)
  const groupNote = !q ? list[0]?.note : null

  // Gọi AI tinh chỉnh IPA + giải thích cách dùng cho 1 câu cụ thể
  async function refineWithAI(p: Phrase) {
    if (aiLoading !== null) return
    setAiError(null)
    setAiLoading(p.id)
    try {
      // Câu "đích" (đang học) và câu "nghĩa" tùy theo chiều học
      const learnText = dir.targetLang === 'en' ? p.en : p.vi
      const meaningText = dir.targetLang === 'en' ? p.vi : p.en
      const system =
        `Bạn là giáo viên phát âm ${dir.targetName} cho người nói ${dir.explainName}. Trả về DUY NHẤT một JSON ` +
        '{"ipa":"...","explain_vi":"..."}. ' +
        `"ipa" là phiên âm/hướng dẫn phát âm cho câu ${dir.targetName} (đặt trong /.../). ` +
        `"explain_vi" là giải thích NGẮN (1–2 câu) bằng ${dir.explainName}: khi nào dùng câu này và 1 lưu ý phát âm. Không thêm gì ngoài JSON.`
      const text = await callClaude(
        [{ role: 'user', content: `Câu (${dir.targetName}): "${learnText}"\nNghĩa (${dir.explainName}): ${meaningText}` }],
        system,
        300,
      )
      const res = parseJson<AiResult>(text)
      if (!res) throw new Error('parse')
      setAi(prev => ({ ...prev, [p.id]: res }))
    } catch {
      setAiError(p.id)
      setTimeout(() => setAiError(cur => (cur === p.id ? null : cur)), 2500)
    } finally {
      setAiLoading(null)
    }
  }

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm câu tiếng Anh hoặc nghĩa tiếng Việt..."
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chip chọn nhóm (ẩn khi đang tìm kiếm) */}
      {!q && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-thin">
          {GROUPS.map(g => (
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

      {/* Ghi chú ngữ pháp của nhóm */}
      {groupNote && (
        <div className="mb-3 rounded-xl bg-sky-500/10 border border-sky-500/25 p-3 text-xs text-sky-200/90 leading-relaxed">
          <strong className="text-sky-300">Cách dùng:</strong> {groupNote}
        </div>
      )}

      {/* Số kết quả */}
      <p className="text-xs text-zinc-600 mb-2">
        {q ? `${list.length} kết quả${list.length === 80 ? '+ (hiển thị 80 đầu)' : ''}` : `${list.length} câu`}
      </p>

      {/* Danh sách câu */}
      <div className="space-y-2">
        {list.map(p => {
          const aiRes = ai[p.id]
          // Câu đang HỌC (đích) và câu NGHĨA, đảo theo chiều học
          const learnText = dir.targetLang === 'en' ? p.en : p.vi
          const meaningText = dir.targetLang === 'en' ? p.vi : p.en
          // IPA offline chỉ có cho tiếng Anh; chiều B chỉ hiện khi AI tạo hướng dẫn
          const ipaText = aiRes?.ipa ?? (dir.targetLang === 'en' ? p.ipa : '')
          return (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
              {/* Câu đang học + nút nghe (giọng ngôn ngữ đích) */}
              <div className="flex items-start gap-2">
                <p className="flex-1 text-[15px] font-semibold text-white leading-snug">{learnText}</p>
                <SpeakButton text={learnText} lang={dir.targetLang} title={`Nghe câu ${dir.targetLabelVi}`} />
              </div>

              {/* IPA / hướng dẫn phát âm */}
              {ipaText && <p className="mt-1 text-xs font-mono text-emerald-400/90">{ipaText}</p>}

              {/* Nghĩa + nút nghe (giọng mẹ đẻ) */}
              <div className="flex items-center gap-2 mt-1.5">
                <p className="flex-1 text-sm text-zinc-400 italic">{meaningText}</p>
                <SpeakButton text={meaningText} lang={dir.explainLang} size="xs" title={`Nghe nghĩa ${dir.explainLabelVi}`} />
              </div>

              {/* Giải thích AI (nếu đã tải) */}
              {aiRes?.explain_vi && (
                <div className="mt-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-2.5 text-xs text-zinc-300 leading-relaxed">
                  <Sparkles className="w-3 h-3 text-amber-400 inline mr-1 -mt-0.5" />
                  {aiRes.explain_vi}
                </div>
              )}

              {/* Nút AI tinh chỉnh */}
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
                  {aiLoading === p.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {aiError === p.id ? 'Lỗi, thử lại' : aiRes ? 'Tinh chỉnh lại' : `AI: phát âm & giải thích ${dir.explainLabelVi}`}
                </button>
              </div>
            </div>
          )
        })}

        {list.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-8">Không tìm thấy câu nào phù hợp.</p>
        )}
      </div>
    </div>
  )
}
