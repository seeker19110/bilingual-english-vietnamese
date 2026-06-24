import { useMemo, useState } from 'react'
import {
  ChevronRight, ChevronLeft, BookOpen, GraduationCap, Check,
  Sparkles, CheckCircle2, Layers, X,
} from 'lucide-react'
import KaraokeText from './KaraokeText'
import WordCard from './WordCard'
import { CEFR_LEVELS, countGrammar } from '../data/cefr'
import type { CefrLevel, CefrUnit, GrammarLesson } from '../data/cefr'
import { FOUNDATION } from '../data/curriculum'
import type { Circle } from '../data/curriculum'
import type { DictEntry } from '../types'
import { getLearnedWords, markLearned } from '../lib/vocab'
import { addToSRS } from '../lib/srs'
import { bumpDailyLearned } from '../lib/curriculum'

// ── Bảng màu nhấn cho từng cấp (Tailwind cần class tĩnh, không ghép động) ─────
const ACCENT: Record<CefrLevel['accent'], {
  active: string; bar: string; text: string; soft: string; ring: string
}> = {
  emerald: { active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', bar: 'bg-emerald-500', text: 'text-emerald-300', soft: 'bg-emerald-500/10', ring: 'border-emerald-500/30' },
  sky:     { active: 'bg-sky-500/20 text-sky-300 border-sky-500/50',             bar: 'bg-sky-500',     text: 'text-sky-300',     soft: 'bg-sky-500/10',     ring: 'border-sky-500/30' },
  violet:  { active: 'bg-violet-500/20 text-violet-300 border-violet-500/50',    bar: 'bg-violet-500',  text: 'text-violet-300',  soft: 'bg-violet-500/10',  ring: 'border-violet-500/30' },
  amber:   { active: 'bg-amber-500/20 text-amber-300 border-amber-500/50',       bar: 'bg-amber-500',   text: 'text-amber-300',   soft: 'bg-amber-500/10',   ring: 'border-amber-500/30' },
}

// Tra cứu nhanh vòng từ vựng theo id (FOUNDATION là dữ liệu tĩnh — không cần
// chờ tải từ điển, nên tab Lộ trình dùng được ngay).
const CIRCLE_BY_ID: Record<string, Circle> = Object.fromEntries(
  FOUNDATION.map(c => [c.id, c]),
)

// Đếm số từ trong 1 vòng đã thuộc (so cả bản gốc lẫn chữ thường).
function circleDone(circle: Circle, learned: Set<string>): number {
  return circle.words.filter(w => learned.has(w.word) || learned.has(w.word.toLowerCase())).length
}

// ── Tab Lộ trình ──────────────────────────────────────────────────────────────
export default function RoadmapTab({ uid, isA, onProgress }: {
  uid: string; isA: boolean; onProgress: () => void
}) {
  const [levelId, setLevelId] = useState<CefrLevel['id']>('A1')
  const [lesson, setLesson]   = useState<GrammarLesson | null>(null)
  const [circle, setCircle]   = useState<Circle | null>(null)

  const level = CEFR_LEVELS.find(l => l.id === levelId)!
  const accent = ACCENT[level.accent]

  // Màn flashcard cho 1 vòng từ vựng
  if (circle) {
    return <VocabFlash circle={circle} isA={isA} uid={uid}
      onProgress={onProgress} onBack={() => setCircle(null)} />
  }

  // Màn chi tiết 1 bài ngữ pháp
  if (lesson) {
    return <GrammarDetail lesson={lesson} isA={isA} accent={accent}
      onBack={() => setLesson(null)} />
  }

  return (
    <div className="animate-fade-in">
      {/* Chọn cấp độ CEFR */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {CEFR_LEVELS.map(l => {
          const a = ACCENT[l.accent]
          const on = l.id === levelId
          return (
            <button key={l.id} onClick={() => setLevelId(l.id)}
              className={`py-2 rounded-xl text-sm font-bold border transition ${on ? a.active : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}>
              {l.id}
            </button>
          )
        })}
      </div>

      {/* Thẻ tổng quan cấp độ */}
      <div className={`glass rounded-2xl p-5 mb-4 border ${accent.ring}`}>
        <div className="flex items-start gap-3">
          <GraduationCap className={`w-6 h-6 shrink-0 ${accent.text}`} />
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight">
              {isA ? level.titleVi : level.titleEn}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{level.subtitleVi}</p>
            <p className="text-sm text-zinc-300 mt-2 leading-snug">{level.goalVi}</p>
            <div className="flex gap-3 mt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {level.units.length} {isA ? 'bài' : 'units'}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {countGrammar(level)} {isA ? 'điểm ngữ pháp' : 'grammar points'}</span>
            </div>
          </div>
        </div>

        {/* Mục tiêu "Tôi có thể…" */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${accent.text}`} />
            {isA ? 'Học xong cấp này bạn có thể:' : 'After this level you can:'}
          </p>
          <ul className="space-y-1.5">
            {level.canDo.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${accent.text}`} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Danh sách unit */}
      <div className="space-y-3">
        {level.units.map(unit => (
          <UnitCard key={unit.id} unit={unit} isA={isA} uid={uid} accent={accent}
            onOpenLesson={setLesson} onOpenCircle={setCircle} />
        ))}
      </div>
    </div>
  )
}

// ── Thẻ 1 unit ────────────────────────────────────────────────────────────────
function UnitCard({ unit, isA, uid, accent, onOpenLesson, onOpenCircle }: {
  unit: CefrUnit; isA: boolean; uid: string
  accent: typeof ACCENT[keyof typeof ACCENT]
  onOpenLesson: (l: GrammarLesson) => void
  onOpenCircle: (c: Circle) => void
}) {
  const learned = useMemo(() => getLearnedWords(uid), [uid])

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{unit.emoji}</span>
        <h4 className="font-semibold text-white">{isA ? unit.titleVi : unit.titleEn}</h4>
      </div>

      {/* Bài ngữ pháp */}
      <div className="space-y-1.5 mb-3">
        {unit.grammar.map(g => (
          <button key={g.id} onClick={() => onOpenLesson(g)}
            className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 transition">
            <BookOpen className={`w-4 h-4 shrink-0 ${accent.text}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{isA ? g.titleVi : g.titleEn}</p>
              <p className="text-xs text-zinc-500 font-mono truncate">{g.structure}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
          </button>
        ))}
      </div>

      {/* Chủ đề từ vựng liên kết */}
      {unit.vocabCircleIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unit.vocabCircleIds.map(id => {
            const c = CIRCLE_BY_ID[id]
            if (!c) return null
            const done = circleDone(c, learned)
            const full = done >= c.words.length
            return (
              <button key={id} onClick={() => onOpenCircle(c)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition hover:border-zinc-500 ${full ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/70 border-zinc-800 text-zinc-300'}`}>
                <span>{c.emoji}</span>
                <span>{isA ? c.titleVi : c.titleEn}</span>
                <span className={full ? accent.text : 'text-zinc-500'}>
                  {full ? <Check className="w-3.5 h-3.5" /> : `${done}/${c.words.length}`}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Chi tiết 1 bài ngữ pháp ───────────────────────────────────────────────────
function GrammarDetail({ lesson, isA, accent, onBack }: {
  lesson: GrammarLesson; isA: boolean
  accent: typeof ACCENT[keyof typeof ACCENT]
  onBack: () => void
}) {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-3">
        <ChevronLeft className="w-4 h-4" /> {isA ? 'Quay lại lộ trình' : 'Back to roadmap'}
      </button>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white text-lg">{isA ? lesson.titleVi : lesson.titleEn}</h3>

        {/* Công thức */}
        <div className={`mt-3 px-4 py-3 rounded-xl ${accent.soft} border ${accent.ring}`}>
          <p className="text-xs text-zinc-500 mb-1">{isA ? 'Cấu trúc' : 'Structure'}</p>
          <p className={`font-mono text-sm font-semibold ${accent.text}`}>{lesson.structure}</p>
        </div>

        {/* Giải thích tiếng Việt */}
        <div className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {lesson.explainVi}
        </div>

        {/* Ví dụ có nghe */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 mb-2">{isA ? 'Ví dụ' : 'Examples'}</p>
          <div className="space-y-2">
            {lesson.examples.map((e, i) => (
              <div key={i} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3">
                <KaraokeText text={e.en} lang="en-US"
                  textClass={`font-medium text-[15px] leading-snug ${accent.text}`}
                  buttonClass="w-full" />
                <p className="text-sm text-zinc-400 mt-1 pl-6">{e.vi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Flashcard cho 1 vòng từ vựng (gắn vào lộ trình) ───────────────────────────
function VocabFlash({ circle, isA, uid, onProgress, onBack }: {
  circle: Circle; isA: boolean; uid: string
  onProgress: () => void; onBack: () => void
}) {
  // Lọc ra các từ CHƯA thuộc để học trước; nếu đã thuộc hết thì ôn lại cả vòng.
  const [cards] = useState<DictEntry[]>(() => {
    const learned = getLearnedWords(uid)
    const todo = circle.words.filter(w => !learned.has(w.word) && !learned.has(w.word.toLowerCase()))
    return todo.length > 0 ? todo : circle.words
  })
  const [idx, setIdx] = useState(0)
  const card = cards[idx]
  const done = idx >= cards.length

  function learn() {
    if (!card) return
    markLearned(uid, card.word)
    addToSRS(uid, card.word)
    bumpDailyLearned(uid)
    onProgress()
    setIdx(i => i + 1)
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-3">
        <ChevronLeft className="w-4 h-4" /> {isA ? 'Quay lại lộ trình' : 'Back to roadmap'}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2">
        <span>{circle.emoji}</span>
        <span>{isA ? circle.titleVi : circle.titleEn}</span>
      </div>

      {done ? (
        <div className="glass rounded-xl p-8 text-center space-y-3">
          <Check className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="text-white font-semibold">{isA ? 'Xong bộ từ này!' : 'Set complete!'}</p>
          {circle.sentences.length > 0 && (
            <div className="text-left pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {isA ? 'Câu thông dụng' : 'Common sentences'}
              </p>
              {circle.sentences.map((s, i) => (
                <div key={i} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3">
                  <KaraokeText text={s.en} lang="en-US"
                    textClass="font-medium text-[15px] leading-snug text-teal-300" buttonClass="w-full" />
                  <p className="text-sm text-zinc-400 mt-1 pl-6">{s.vi}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={onBack}
            className="w-full mt-2 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition">
            {isA ? 'Về lộ trình' : 'Back to roadmap'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span>{isA ? 'Từ' : 'Word'} {idx + 1}/{cards.length}</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full mb-4">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(idx / cards.length) * 100}%` }} />
          </div>

          <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onProgress} />

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setIdx(i => i + 1)}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition py-3 rounded-xl text-sm font-medium">
              <X className="w-4 h-4" /> {isA ? 'Để sau' : 'Later'}
            </button>
            <button onClick={learn}
              className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition py-3 rounded-xl text-sm font-medium">
              <Check className="w-4 h-4" /> {isA ? 'Đã thuộc' : 'Got it'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
