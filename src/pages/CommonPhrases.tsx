import { useState, useMemo } from 'react'
import { Volume2, Search, X, ChevronRight, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import { useLang } from '../context/useLang'
import { speak as speakTts } from '../lib/tts'
import SUBJECTS from '../data/patterns'
import type { Direction } from '../types'

// Phát âm qua Google TTS (fallback giọng trình duyệt nếu lỗi)
function speak(text: string, lang: 'en-US' | 'vi-VN') {
  void speakTts(text, lang === 'en-US' ? 'en' : 'vi')
}

const CAT_COLORS: Record<string, string> = {}
SUBJECTS.forEach(s => { CAT_COLORS[s.category] = s.color })

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg:'bg-emerald-500/10', text:'text-emerald-400', border:'border-emerald-500/25', badge:'bg-emerald-500/20 text-emerald-300' },
  sky:     { bg:'bg-sky-500/10',     text:'text-sky-400',     border:'border-sky-500/25',     badge:'bg-sky-500/20 text-sky-300' },
  violet:  { bg:'bg-violet-500/10',  text:'text-violet-400',  border:'border-violet-500/25',  badge:'bg-violet-500/20 text-violet-300' },
  amber:   { bg:'bg-amber-500/10',   text:'text-amber-400',   border:'border-amber-500/25',   badge:'bg-amber-500/20 text-amber-300' },
  pink:    { bg:'bg-pink-500/10',    text:'text-pink-400',    border:'border-pink-500/25',    badge:'bg-pink-500/20 text-pink-300' },
  teal:    { bg:'bg-teal-500/10',    text:'text-teal-400',    border:'border-teal-500/25',    badge:'bg-teal-500/20 text-teal-300' },
  rose:    { bg:'bg-rose-500/10',    text:'text-rose-400',    border:'border-rose-500/25',    badge:'bg-rose-500/20 text-rose-300' },
  indigo:  { bg:'bg-indigo-500/10',  text:'text-indigo-400',  border:'border-indigo-500/25',  badge:'bg-indigo-500/20 text-indigo-300' },
  orange:  { bg:'bg-orange-500/10',  text:'text-orange-400',  border:'border-orange-500/25',  badge:'bg-orange-500/20 text-orange-300' },
  cyan:    { bg:'bg-cyan-500/10',    text:'text-cyan-400',    border:'border-cyan-500/25',    badge:'bg-cyan-500/20 text-cyan-300' },
  slate:   { bg:'bg-slate-500/10',   text:'text-slate-400',   border:'border-slate-500/25',   badge:'bg-slate-500/20 text-slate-300' },
  purple:  { bg:'bg-purple-500/10',  text:'text-purple-400',  border:'border-purple-500/25',  badge:'bg-purple-500/20 text-purple-300' },
  lime:    { bg:'bg-lime-500/10',    text:'text-lime-400',    border:'border-lime-500/25',    badge:'bg-lime-500/20 text-lime-300' },
  yellow:  { bg:'bg-yellow-500/10',  text:'text-yellow-400',  border:'border-yellow-500/25',  badge:'bg-yellow-500/20 text-yellow-300' },
  stone:   { bg:'bg-stone-500/10',   text:'text-stone-400',   border:'border-stone-500/25',   badge:'bg-stone-500/20 text-stone-300' },
  fuchsia: { bg:'bg-fuchsia-500/10', text:'text-fuchsia-400', border:'border-fuchsia-500/25', badge:'bg-fuchsia-500/20 text-fuchsia-300' },
  red:     { bg:'bg-red-500/10',     text:'text-red-400',     border:'border-red-500/25',     badge:'bg-red-500/20 text-red-300' },
}

function getColor(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP['slate']
}

export default function CommonPhrases() {
  const dir: Direction = getDirection()
  const { T } = useLang()
  const targetLang = dir === 'A' ? 'en-US' : 'vi-VN'

  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null)

  const categories = useMemo(() => [...new Set(SUBJECTS.map(s => s.category))], [])

  const filtered = useMemo(() => {
    let list = SUBJECTS
    if (activeCat) list = list.filter(s => s.category === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.starter.toLowerCase().includes(q) ||
        s.sentences.some(sent => sent.en.toLowerCase().includes(q) || sent.vi.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeCat, search])

  const selectedSubject = selectedStarter ? SUBJECTS.find(s => s.starter === selectedStarter) : null

  if (selectedSubject) {
    const c = getColor(selectedSubject.color)
    return (
      <div className="min-h-screen bg-zinc-950">
        <Layout title={selectedSubject.starter} back />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedStarter(null)}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> {T.phrasesBack}
          </button>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${c.bg} ${c.text} ${c.border}`}>
            {selectedSubject.category}
          </div>

          <div className="space-y-2">
            {selectedSubject.sentences.map((sent, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-start gap-3 group">
                <span className="text-xs text-zinc-600 w-5 shrink-0 mt-1">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-[15px] leading-snug ${c.text}`}>{sent.en}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{sent.vi}</p>
                </div>
                <button
                  onClick={() => speak(dir === 'A' ? sent.en : sent.vi, targetLang)}
                  className="mt-0.5 p-1.5 rounded-lg text-zinc-600 hover:text-sky-400 hover:bg-zinc-800 active:scale-95 transition-all shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title={T.phrasesPageTitle} subtitle={T.phrasesPageSub} back />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={T.phrasesSearch}
            className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCat(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              activeCat === null
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {T.phrasesAll}
          </button>
          {categories.map(cat => {
            const color = CAT_COLORS[cat] ?? 'slate'
            const c = getColor(color)
            const isActive = activeCat === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(isActive ? null : cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isActive ? `${c.bg} ${c.text} ${c.border}` : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-zinc-600">
          {filtered.length} {T.phrasesSubjects} · {filtered.reduce((s, x) => s + x.sentences.length, 0)} {T.phrasesSentences}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(subj => {
            const c = getColor(subj.color)
            return (
              <button
                key={subj.starter}
                onClick={() => setSelectedStarter(subj.starter)}
                className={`text-left bg-zinc-900/80 border rounded-xl p-3 hover:bg-zinc-800/60 active:scale-[0.98] transition-all group ${c.border}`}
              >
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-2 font-medium ${c.badge}`}>
                  {subj.category}
                </div>
                <p className={`font-bold text-[17px] ${c.text} leading-tight`}>{subj.starter}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-zinc-600">{subj.sentences.length} {T.phrasesSentences}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition" />
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-600 text-sm">
            {T.phrasesNoResult}
          </div>
        )}
      </main>
    </div>
  )
}
