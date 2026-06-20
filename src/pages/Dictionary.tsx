import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, BookText, Layers } from 'lucide-react'
import Layout from '../components/Layout'
import PronounceButton from '../components/PronounceButton'
import SpeakButton from '../components/SpeakButton'
import VocabMilestone from '../components/VocabMilestone'
import WordOfTheDay from '../components/WordOfTheDay'
import PosFilter from '../components/PosFilter'
import Flashcard from '../components/Flashcard'
import dictionaryData from '../data/dictionary.json'
import type { DictEntry } from '../types'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { POS_LABEL, POS_COLOR } from '../lib/pos'

const ENTRIES = dictionaryData as DictEntry[]

// Giới hạn số kết quả hiển thị cùng lúc để tránh render quá nhiều phần tử
const MAX_RESULTS = 100

type Tab = 'search' | 'flashcard'

export default function Dictionary() {
  const { user } = useAuth()
  const dir = getDirection()
  const isA = dir === 'A'
  const [tab, setTab] = useState<Tab>('search')
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState('')          // loại từ đang lọc ('' = tất cả)
  const [learnedKey, setLearnedKey] = useState(0) // đổi để buộc thanh mốc tính lại

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
    <div className="min-h-screen bg-zinc-950">
      <Layout
        title={isA ? 'Từ điển' : 'Dictionary'}
        subtitle={`${ENTRIES.length.toLocaleString('vi-VN')} ${isA ? 'từ thông dụng' : 'common words'}`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Mốc từ vựng — luôn hiển thị trên cùng */}
        <VocabMilestone userId={user.id} refreshKey={learnedKey} />

        {/* Từ vựng hôm nay */}
        <WordOfTheDay entries={ENTRIES} />

        {/* Chuyển tab: Tra cứu / Flashcard */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
              tab === 'search'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}>
            <BookText className="w-4 h-4" /> {isA ? 'Tra từ' : 'Search'}
          </button>
          <button onClick={() => setTab('flashcard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
              tab === 'flashcard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}>
            <Layers className="w-4 h-4" /> Flashcard
          </button>
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
                    {/* Badge loại từ — bấm vào để xem giải thích "Danh từ là gì?", "Động từ là gì?"... */}
                    <Link
                      to={`/parts-of-speech#${e.pos}`}
                      title={`${POS_LABEL[e.pos] || e.pos} là gì?`}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition hover:brightness-125 hover:underline underline-offset-2 ${POS_COLOR[e.pos] ?? 'bg-zinc-700 text-zinc-300'}`}
                    >
                      {POS_LABEL[e.pos] || e.pos}
                    </Link>
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

                  {/* Câu ví dụ + nút đọc nguyên câu */}
                  {e.ex_en && (
                    <div className="mt-2 pl-3 border-l-2 border-zinc-700 space-y-1">
                      {/* Câu tiếng Anh + nút đọc */}
                      <div className="flex items-start gap-1.5">
                        <SpeakButton text={e.ex_en} lang="en-US" title="Nghe câu tiếng Anh" size="xs" />
                        <p className="text-xs text-zinc-400 italic leading-relaxed">{e.ex_en}</p>
                      </div>
                      {/* Câu tiếng Việt + nút đọc */}
                      {e.ex_vi && (
                        <div className="flex items-start gap-1.5">
                          <SpeakButton text={e.ex_vi} lang="vi-VN" title="Nghe câu tiếng Việt" size="xs" />
                          <p className="text-xs text-zinc-500 leading-relaxed">{e.ex_vi}</p>
                        </div>
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
        ) : (
          /* Tab Flashcard */
          <Flashcard
            entries={ENTRIES}
            userId={user.id}
            onLearnedChange={() => setLearnedKey(k => k + 1)}
          />
        )}
      </main>
    </div>
  )
}
