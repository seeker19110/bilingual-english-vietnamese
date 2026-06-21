import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, X, BookText, Layers, GraduationCap } from 'lucide-react'
import Layout from '../components/Layout'
import PronounceButton from '../components/PronounceButton'
import VocabMilestone from '../components/VocabMilestone'
import WordOfTheDay from '../components/WordOfTheDay'
import KaraokeText from '../components/KaraokeText'
import PosFilter from '../components/PosFilter'
import Flashcard from '../components/Flashcard'
import dictionaryData from '../data/dictionary.json'
import type { DictEntry } from '../types'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { POS_LABEL, POS_COLOR, POS_LIST } from '../lib/pos'

const ENTRIES = dictionaryData as DictEntry[]
const MAX_RESULTS = 100
type Tab = 'search' | 'flashcard' | 'pos'

export default function Dictionary() {
  const { user } = useAuth()
  const dir = getDirection()
  const isA = dir === 'A'
  const [tab, setTab]           = useState<Tab>('search')
  const [query, setQuery]       = useState('')
  const [pos, setPos]           = useState('')
  const [learnedKey, setLearnedKey] = useState(0)
  const [jumpPos, setJumpPos]   = useState<string | null>(null)   // pos cần scroll khi mở tab Từ loại
  const posRefs = useRef<Record<string, HTMLElement | null>>({})

  // Khi chuyển sang tab 'pos', scroll tới mục cần xem (nếu có)
  useEffect(() => {
    if (tab !== 'pos' || !jumpPos) return
    const el = posRefs.current[jumpPos]
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setJumpPos(null) }
  }, [tab, jumpPos])

  function openPos(posCode: string) {
    setJumpPos(posCode)
    setTab('pos')
  }

  // Lọc + sắp xếp kết quả: theo từ khóa và loại từ
  const { results, totalMatches } = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Lọc theo loại từ trước
    const base = pos ? ENTRIES.filter(e => e.pos === pos) : ENTRIES

    if (!q) {
      return { results: base.slice(0, MAX_RESULTS), totalMatches: base.length }
    }
    const starts: DictEntry[] = []
    const contains: DictEntry[] = []
    for (const e of base) {
      if (e.word.startsWith(q)) starts.push(e)
      else if (e.word.includes(q)) contains.push(e)
    }
    const all = [...starts, ...contains]
    return { results: all.slice(0, MAX_RESULTS), totalMatches: all.length }
  }, [query, pos])

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={isA ? 'Từ điển' : 'Dictionary'}
        subtitle={`${ENTRIES.length.toLocaleString('vi-VN')} ${isA ? 'từ thông dụng' : 'common words'}`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Mốc từ vựng — luôn hiển thị trên cùng */}
        <VocabMilestone userId={user.id} refreshKey={learnedKey} />

        {/* Từ vựng hôm nay */}
        <WordOfTheDay entries={ENTRIES} />

        {/* Chuyển tab: Tra từ / Flashcard / Từ loại */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'search',    icon: BookText,      label: isA ? 'Tra từ'   : 'Search'    },
            { key: 'flashcard', icon: Layers,         label: 'Flashcard'                    },
            { key: 'pos',       icon: GraduationCap, label: isA ? 'Từ loại' : 'Word Types' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
                tab === key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'search' ? (
          <>
            {/* Ô tìm kiếm */}
            <div className="relative mb-3 animate-fade-in">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isA ? 'Gõ từ tiếng Anh cần tra...' : 'Type an English word to look up...'}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500/60 focus:bg-zinc-900 transition"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition p-0.5">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lọc theo loại từ */}
            <PosFilter value={pos} onChange={setPos} />

            {(query || pos) && (
              <p className="text-xs text-zinc-500 mb-3">
                {isA
                  ? `Tìm thấy ${totalMatches.toLocaleString('vi-VN')} từ${totalMatches > results.length ? ` — hiển thị ${results.length} từ đầu` : ''}`
                  : `Found ${totalMatches.toLocaleString('en-US')} word${totalMatches !== 1 ? 's' : ''}${totalMatches > results.length ? ` — showing first ${results.length}` : ''}`
                }
              </p>
            )}

            {/* Danh sách kết quả */}
            <div className="space-y-2 animate-fade-up">
              {results.map(e => (
                <div key={e.word}
                  className="glass rounded-xl p-4 hover:bg-zinc-800/60 transition">

                  {/* Header: từ + badge + phát âm */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-bold text-white text-base">{e.word}</span>
                    {/* Badge loại từ — bấm để chuyển sang tab Từ loại và scroll tới đúng mục */}
                    <button
                      type="button"
                      onClick={() => openPos(e.pos)}
                      title={`${POS_LABEL[e.pos] || e.pos} là gì?`}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition hover:brightness-125 ${POS_COLOR[e.pos] ?? 'bg-zinc-700 text-zinc-300'}`}
                    >
                      {POS_LABEL[e.pos] || e.pos}
                    </button>
                    <PronounceButton word={e.word} />
                  </div>

                  {/* Phiên âm tiếng Anh */}
                  {e.ipa_en && (
                    <p className="text-xs text-emerald-400/70 font-mono mb-1.5">{e.ipa_en}</p>
                  )}

                  {/* Nghĩa tiếng Việt */}
                  <p className="text-sm text-zinc-200 font-medium mb-1">{e.vi}</p>

                  {/* Phiên âm tiếng Việt */}
                  {e.ipa_vi && (
                    <p className="text-xs text-zinc-500 font-mono mb-2">{e.ipa_vi}</p>
                  )}

                  {/* Câu ví dụ — karaoke highlight từng chữ khi nghe */}
                  {e.ex_en && (
                    <div className="mt-2 space-y-1 pl-3 border-l-2 border-zinc-700">
                      <KaraokeText
                        text={e.ex_en} lang="en-US"
                        textClass="text-xs text-zinc-400 italic leading-relaxed"
                        buttonClass="w-full hover:opacity-80"
                      />
                      {e.ex_vi && (
                        <KaraokeText
                          text={e.ex_vi} lang="vi-VN"
                          textClass="text-xs text-zinc-500 leading-relaxed"
                          buttonClass="w-full hover:opacity-80"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(query || pos) && results.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-zinc-500 text-sm">
                  {isA ? 'Không tìm thấy từ phù hợp' : 'No matching words found'}
                </p>
                <p className="text-zinc-600 text-xs mt-1">
                  {isA ? 'Thử từ khóa hoặc bộ lọc khác' : 'Try a different keyword or filter'}
                </p>
              </div>
            )}
          </>
        ) : tab === 'flashcard' ? (
          <Flashcard
            entries={ENTRIES}
            userId={user.id}
            onLearnedChange={() => setLearnedKey(k => k + 1)}
          />
        ) : (
          /* Tab Từ loại */
          <div className="space-y-3 animate-fade-in">
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong className="text-white">{isA ? 'Loại từ' : 'Parts of speech'}</strong>
                {isA
                  ? ' giúp bạn biết từ đó đóng vai trò gì trong câu — dùng đúng chỗ, ghép câu chính xác hơn.'
                  : ' tell you the role each word plays in a sentence — use words in the right position.'}
              </p>
            </div>
            {POS_LIST.map(p => (
              <section
                key={p.code}
                id={`pos-${p.code}`}
                ref={el => { posRefs.current[p.code] = el }}
                className="glass rounded-xl p-4 scroll-mt-20"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="font-bold text-white text-base">{p.label}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.color}`}>{p.labelEn}</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-3">{p.definition}</p>
                <div className="space-y-1.5">
                  {p.examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm pl-3 border-l-2 border-zinc-700">
                      <span className="text-zinc-200 italic">{ex.en}</span>
                      <span className="text-zinc-500">—</span>
                      <span className="text-zinc-400">{ex.vi}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
