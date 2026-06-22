import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, X, BookText, Layers, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import VoiceToggle from '../components/VoiceToggle'
import PronounceButton from '../components/PronounceButton'
import VocabMilestone from '../components/VocabMilestone'
import WordOfTheDay from '../components/WordOfTheDay'
import KaraokeText from '../components/KaraokeText'
import Flashcard from '../components/Flashcard'
import WordIllustration from '../components/WordIllustration'
import { EXTRA_EXAMPLES } from '../data/extra-examples'
import type { DictEntry } from '../types'
import { loadDictionary } from '../data/dictionary/loader'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { POS_LABEL, POS_COLOR, POS_LIST } from '../lib/pos'

const PAGE_SIZE = 3
type Tab = 'search' | 'flashcard' | 'pos'

export default function Dictionary() {
  const { user } = useAuth()
  const dir = getDirection()
  const isA = dir === 'A'
  const [tab, setTab]         = useState<Tab>('search')
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(0)
  const [learnedKey, setLearnedKey] = useState(0)
  const [jumpPos, setJumpPos] = useState<string | null>(null)
  const posRefs    = useRef<Record<string, HTMLElement | null>>({})
  const touchStart = useRef({ x: 0, y: 0 })

  const [entries, setEntries] = useState<DictEntry[]>([])
  const [ready, setReady]     = useState(false)
  useEffect(() => {
    loadDictionary().then(data => { setEntries(data); setReady(true) })
  }, [])

  // reset trang khi gõ từ mới
  useEffect(() => { setPage(0) }, [query])

  useEffect(() => {
    if (tab !== 'pos' || !jumpPos) return
    const el = posRefs.current[jumpPos]
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setJumpPos(null) }
  }, [tab, jumpPos])

  function openPos(posCode: string) { setJumpPos(posCode); setTab('pos') }

  // Tất cả kết quả khớp với query
  const allMatches = useMemo((): DictEntry[] => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const starts: DictEntry[] = []
    const contains: DictEntry[] = []
    for (const e of entries) {
      if (e.word.startsWith(q)) starts.push(e)
      else if (e.word.includes(q)) contains.push(e)
    }
    return [...starts, ...contains]
  }, [query, entries])

  const totalPages = Math.max(1, Math.ceil(allMatches.length / PAGE_SIZE))
  const results    = allMatches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // chuyển trang chỉ khi vuốt bắt đầu từ cạnh màn hình (40px đầu/cuối)
  function handleSwipe(startX: number, deltaX: number, deltaY: number) {
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return
    const w = window.innerWidth
    const fromLeft  = startX < 40
    const fromRight = startX > w - 40
    if (deltaX > 50  && fromLeft  && page > 0)              setPage(p => p - 1)
    if (deltaX < -50 && fromRight && page < totalPages - 1) setPage(p => p + 1)
  }

  if (!user) return null

  if (!ready) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout title={isA ? 'Từ điển' : 'Dictionary'} subtitle={isA ? 'Đang tải…' : 'Loading…'} extra={<VoiceToggle />} />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="glass rounded-xl p-8 text-center animate-fade-in">
            <p className="text-zinc-400 text-sm">{isA ? 'Đang tải từ điển…' : 'Loading dictionary…'}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={isA ? 'Từ điển' : 'Dictionary'}
        subtitle={`${entries.length.toLocaleString('vi-VN')} ${isA ? 'từ thông dụng' : 'common words'}`}
        extra={<VoiceToggle />}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">

        <VocabMilestone userId={user.id} refreshKey={learnedKey} />
        <WordOfTheDay entries={entries} />

        {/* Tab bar */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'search',    icon: BookText,      label: isA ? 'Tra từ'   : 'Search'    },
            { key: 'flashcard', icon: Layers,         label: 'Flashcard'                    },
            { key: 'pos',       icon: GraduationCap, label: isA ? 'Loại từ' : 'Word Types' },
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
            <div className="relative mb-4 animate-fade-in">
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

            {query ? (
              allMatches.length > 0 ? (
                <>
                  {/* Phân trang: 2 thẻ bấm 30% + thông tin giữa 40% */}
                  {totalPages > 1 && (
                    <div className="flex items-stretch gap-2 mb-3 text-xs">
                      <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                        className="w-[30%] flex items-center justify-center gap-1 glass rounded-xl py-2.5 text-zinc-400 hover:text-white disabled:opacity-25 transition active:bg-zinc-700/50">
                        <ChevronLeft className="w-4 h-4" />
                        {isA ? 'Trước' : 'Prev'}
                      </button>
                      <div className="flex-1 flex items-center justify-center text-zinc-500">
                        {page + 1} / {totalPages} ({allMatches.length} {isA ? 'từ' : 'words'})
                      </div>
                      <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}
                        className="w-[30%] flex items-center justify-center gap-1 glass rounded-xl py-2.5 text-zinc-400 hover:text-white disabled:opacity-25 transition active:bg-zinc-700/50">
                        {isA ? 'Sau' : 'Next'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* 5 thẻ từ — vuốt trái/phải để chuyển trang */}
                  <div
                    className="space-y-2 animate-fade-up"
                    onTouchStart={e => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
                    onTouchEnd={e => handleSwipe(
                      touchStart.current.x,
                      e.changedTouches[0].clientX - touchStart.current.x,
                      e.changedTouches[0].clientY - touchStart.current.y,
                    )}
                  >
                    {results.map(e => (
                      <div key={e.word} className="glass rounded-xl p-4 hover:bg-zinc-800/60 transition">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-bold text-white text-base">{e.word}</span>
                          <button type="button" onClick={() => openPos(e.pos)}
                            title={`${POS_LABEL[e.pos] || e.pos} là gì?`}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition hover:brightness-125 ${POS_COLOR[e.pos] ?? 'bg-zinc-700 text-zinc-300'}`}>
                            {POS_LABEL[e.pos] || e.pos}
                          </button>
                          <PronounceButton word={e.word} />
                        </div>

                        {e.ipa_en && <p className="text-xs text-emerald-400/70 font-mono mb-1.5">{e.ipa_en}</p>}
                        <p className="text-sm text-zinc-200 font-medium mb-1">{e.vi}</p>
                        {e.ipa_vi && <p className="text-xs text-zinc-500 font-mono mb-2">{e.ipa_vi}</p>}

                        <WordIllustration word={e.word} />

                        {e.ex_en && (
                          <div className="mt-2 rounded-lg border border-zinc-800 divide-y divide-zinc-800/60 overflow-hidden">
                            <KaraokeText text={e.ex_en} lang="en-US"
                              textClass="text-xs text-emerald-300/80 italic leading-relaxed"
                              buttonClass="w-full px-3 py-2 hover:bg-emerald-500/5 active:bg-emerald-500/10 text-left" />
                            {e.ex_vi && (
                              <KaraokeText text={e.ex_vi} lang="vi-VN"
                                textClass="text-xs text-zinc-400 leading-relaxed"
                                buttonClass="w-full px-3 py-2 hover:bg-sky-500/5 active:bg-sky-500/10 text-left" />
                            )}
                          </div>
                        )}

                        {/* Ví dụ bổ sung (2 câu thêm, chỉ có với từ phổ biến) */}
                        {EXTRA_EXAMPLES[e.word.toLowerCase()] && (
                          <div className="mt-2 space-y-1.5">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wide px-0.5">
                              {isA ? 'Ví dụ thêm' : 'More examples'}
                            </p>
                            {EXTRA_EXAMPLES[e.word.toLowerCase()].map((ex, idx) => (
                              <div key={idx} className="rounded-lg border border-zinc-800/60 divide-y divide-zinc-800/40 overflow-hidden">
                                <KaraokeText text={ex.en} lang="en-US"
                                  textClass="text-xs text-emerald-300/70 italic leading-relaxed"
                                  buttonClass="w-full px-3 py-1.5 hover:bg-emerald-500/5 active:bg-emerald-500/10 text-left" />
                                <KaraokeText text={ex.vi} lang="vi-VN"
                                  textClass="text-xs text-zinc-500 leading-relaxed"
                                  buttonClass="w-full px-3 py-1.5 hover:bg-sky-500/5 active:bg-sky-500/10 text-left" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {totalPages > 1 && (
                      <p className="text-[10px] text-zinc-700 text-center pt-1">
                        {isA ? '← Vuốt để xem thêm kết quả →' : '← Swipe for more results →'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <p className="text-zinc-500 text-sm">{isA ? 'Không tìm thấy từ phù hợp' : 'No matching words found'}</p>
                  <p className="text-zinc-600 text-xs mt-1">{isA ? 'Thử từ khóa khác' : 'Try a different keyword'}</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-zinc-600 text-sm">
                {isA ? 'Gõ từ tiếng Anh để tra nghĩa' : 'Type a word to look it up'}
              </div>
            )}
          </>
        ) : tab === 'flashcard' ? (
          <Flashcard entries={entries} userId={user.id} onLearnedChange={() => setLearnedKey(k => k + 1)} />
        ) : (
          /* Tab Loại từ */
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
              <section key={p.code} id={`pos-${p.code}`}
                ref={el => { posRefs.current[p.code] = el }}
                className="glass rounded-xl p-4 scroll-mt-20">
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
