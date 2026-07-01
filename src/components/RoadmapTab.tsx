import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Check,
  Sparkles,
  CheckCircle2,
  Layers,
  X,
  Lightbulb,
  AlertTriangle,
  PencilLine,
  MessageCircle,
  Lock,
  Play,
  Pause,
  Square,
  Volume2,
} from 'lucide-react'
import {
  speak,
  stopSpeaking,
  pauseCurrentAudio,
  resumeCurrentAudio,
  unlockAudio,
  prefetchSpeech,
} from '../lib/tts'
import type { Voice } from '../lib/tts'
import KaraokeText from './KaraokeText'
import WordCard from './WordCard'
import { InlinePronounce } from '../pages/Lessons'
import type { CefrLevel, CefrUnit, GrammarLesson, QuizItem } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import type { Dialogue } from '../data/dialogues'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import { getDialogues } from '../data/dialoguesLoader'

function countGrammar(level: CefrLevel): number {
  return level.units.reduce((sum, u) => sum + u.grammar.length, 0)
}

// Đếm tổng số từ trong tất cả vòng vocab của 1 cấp
function countLevelWords(level: CefrLevel): number {
  const ids = level.units.flatMap((u) => u.vocabCircleIds)
  return ids.reduce((sum, id) => sum + (CIRCLE_BY_ID[id]?.words.length ?? 0), 0)
}

// Đếm số từ đã thuộc trong tất cả vòng vocab của 1 cấp
function countLevelLearned(level: CefrLevel, learned: Set<string>): number {
  const ids = level.units.flatMap((u) => u.vocabCircleIds)
  return ids.reduce((sum, id) => {
    const c = CIRCLE_BY_ID[id]
    if (!c) return sum
    return sum + circleDone(c, learned)
  }, 0)
}
import type { DictEntry } from '../types'
import { getLearnedWords, markLearned } from '../lib/vocab'
import { addToSRS } from '../lib/srs'
import { bumpDailyLearned } from '../lib/curriculum'
import { markStudiedToday } from '../lib/storage'

// ── Bảng màu nhấn cho từng cấp (Tailwind cần class tĩnh, không ghép động) ─────
const ACCENT: Record<
  CefrLevel['accent'],
  {
    active: string
    bar: string
    text: string
    soft: string
    ring: string
  }
> = {
  emerald: {
    active: 'bg-accent-500/20 text-accent-300 border-accent-500/50',
    bar: 'bg-accent-500',
    text: 'text-accent-300',
    soft: 'bg-accent-500/10',
    ring: 'border-accent-500/30',
  },
  sky: {
    active: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    bar: 'bg-sky-500',
    text: 'text-sky-300',
    soft: 'bg-sky-500/10',
    ring: 'border-sky-500/30',
  },
  violet: {
    active: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
    bar: 'bg-violet-500',
    text: 'text-violet-300',
    soft: 'bg-violet-500/10',
    ring: 'border-violet-500/30',
  },
  amber: {
    active: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    bar: 'bg-amber-500',
    text: 'text-amber-300',
    soft: 'bg-amber-500/10',
    ring: 'border-amber-500/30',
  },
}

// CIRCLE_BY_ID được khởi tạo rỗng, điền vào sau khi FOUNDATION tải xong.
let CIRCLE_BY_ID: Record<string, Circle> = {}

// Đếm số từ trong 1 vòng đã thuộc (so cả bản gốc lẫn chữ thường).
function circleDone(circle: Circle, learned: Set<string>): number {
  return circle.words.filter((w) => learned.has(w.word) || learned.has(w.word.toLowerCase())).length
}

// ── Tab Lộ trình ──────────────────────────────────────────────────────────────
export default function RoadmapTab({
  uid,
  isA,
  onProgress,
}: {
  uid: string
  isA: boolean
  onProgress: () => void
}) {
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([])
  const [levelId, setLevelId] = useState<CefrLevel['id']>('A1')
  const [lesson, setLesson] = useState<GrammarLesson | null>(null)
  const [circle, setCircle] = useState<Circle | null>(null)
  const [dialogue, setDialogue] = useState<Dialogue | null>(null)
  const [foundationReady, setFoundationReady] = useState(false)

  useEffect(() => {
    loadCefr().then(setCefrLevels)
    loadFoundation().then((f) => {
      CIRCLE_BY_ID = Object.fromEntries(f.map((c) => [c.id, c]))
      setFoundationReady(true)
    })
  }, [])

  const learned = useMemo(() => getLearnedWords(uid), [uid, foundationReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const level = cefrLevels.find((l) => l.id === levelId) ?? cefrLevels[0]
  if (!level) return null
  const accent = ACCENT[level.accent]

  // Kiểm tra cấp độ có bị khóa không (A1 luôn mở, các cấp sau cần hoàn thành ≥70% vocab cấp trước)
  function isLevelLocked(l: CefrLevel): boolean {
    const idx = cefrLevels.findIndex((x) => x.id === l.id)
    if (idx <= 0) return false
    const prev = cefrLevels[idx - 1]
    if (!prev) return false // idx>0 nên prev luôn có; guard để TS narrow kiểu
    const total = countLevelWords(prev)
    if (total === 0) return false
    const done = countLevelLearned(prev, learned)
    return done / total < 0.7
  }

  const locked = isLevelLocked(level)

  // Màn xem 1 cuộc hội thoại
  if (dialogue) {
    return (
      <DialogueView
        dialogue={dialogue}
        isA={isA}
        accent={accent}
        onBack={() => setDialogue(null)}
      />
    )
  }

  // Màn flashcard cho 1 vòng từ vựng
  if (circle) {
    return (
      <VocabFlash
        circle={circle}
        isA={isA}
        uid={uid}
        onProgress={onProgress}
        onBack={() => setCircle(null)}
        onOpenDialogue={setDialogue}
      />
    )
  }

  // Màn chi tiết 1 bài ngữ pháp
  if (lesson) {
    return (
      <GrammarDetail lesson={lesson} isA={isA} accent={accent} onBack={() => setLesson(null)} />
    )
  }

  // Đánh số bài ngữ pháp liên tục trong cả cấp (Bài 1, Bài 2, …)
  let globalLessonIndex = 0

  return (
    <div className="animate-fade-in">
      {/* Chọn cấp độ CEFR */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {cefrLevels.map((l) => {
          const a = ACCENT[l.accent]
          const on = l.id === levelId
          const lkd = isLevelLocked(l)
          return (
            <button
              key={l.id}
              onClick={() => setLevelId(l.id)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition flex flex-col items-center gap-0.5 ${on ? a.active : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
            >
              {lkd && <Lock className="w-3 h-3 opacity-60" />}
              <span>{l.id}</span>
            </button>
          )
        })}
      </div>

      {/* Thẻ tổng quan cấp độ */}
      <div className={`glass rounded-2xl p-5 mb-4 border ${accent.ring}`}>
        <div className="flex items-start gap-3">
          <GraduationCap className={`w-6 h-6 shrink-0 ${accent.text}`} />
          <div className="flex-1">
            <h3 className="font-bold text-white text-xl leading-tight">
              {isA ? level.titleVi : level.titleEn}
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">{level.subtitleVi}</p>
            <p className="text-base text-zinc-300 mt-2 leading-snug">{level.goalVi}</p>
            <div className="flex gap-3 mt-3 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> {level.units.length} {isA ? 'chủ đề' : 'units'}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {countGrammar(level)}{' '}
                {isA ? 'bài ngữ pháp' : 'grammar points'}
              </span>
            </div>
          </div>
        </div>

        {/* Mục tiêu can-do */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${accent.text}`} />
            {isA ? 'Hoàn thành cấp này, bạn có thể:' : 'After this level, you will be able to:'}
          </p>
          <ul className="space-y-2">
            {level.canDo.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-base text-zinc-300 leading-snug">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${accent.text}`} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Màn khóa — nếu cấp bị khóa */}
      {locked ? (
        <div className="glass rounded-2xl p-6 text-center space-y-3 border border-zinc-700/60">
          <Lock className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-white font-semibold text-lg">
            {isA ? `Cấp ${level.id} đang bị khóa` : `${level.id} is locked`}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {isA
              ? `Hoàn thành ≥70% từ vựng của cấp ${cefrLevels[cefrLevels.findIndex((x) => x.id === level.id) - 1]?.id ?? ''} để mở khóa.`
              : `Complete ≥70% vocabulary in the previous level to unlock.`}
          </p>
        </div>
      ) : (
        /* Danh sách unit */
        <div className="space-y-3">
          {level.units.map((unit) => {
            const startIdx = globalLessonIndex
            globalLessonIndex += unit.grammar.length
            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                isA={isA}
                uid={uid}
                accent={accent}
                lessonStartIndex={startIdx}
                onOpenLesson={setLesson}
                onOpenCircle={setCircle}
                onOpenDialogue={setDialogue}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Thẻ 1 unit ────────────────────────────────────────────────────────────────
function UnitCard({
  unit,
  isA,
  uid,
  accent,
  lessonStartIndex,
  onOpenLesson,
  onOpenCircle,
  onOpenDialogue,
}: {
  unit: CefrUnit
  isA: boolean
  uid: string
  accent: (typeof ACCENT)[keyof typeof ACCENT]
  lessonStartIndex: number
  onOpenLesson: (l: GrammarLesson) => void
  onOpenCircle: (c: Circle) => void
  onOpenDialogue: (d: Dialogue) => void
}) {
  const learned = useMemo(() => getLearnedWords(uid), [uid])
  const [dialogues, setDialogues] = useState<Dialogue[]>([])
  useEffect(() => {
    getDialogues(unit.id).then(setDialogues)
  }, [unit.id])

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{unit.emoji}</span>
        <h4 className="font-semibold text-white text-base">{isA ? unit.titleVi : unit.titleEn}</h4>
      </div>

      {/* Bài ngữ pháp — có số thứ tự toàn cấp */}
      <div className="space-y-1.5 mb-3">
        {unit.grammar.map((g, gi) => (
          <button
            key={g.id}
            onClick={() => onOpenLesson(g)}
            className="w-full flex items-center gap-2 text-left px-3 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 transition"
          >
            <span className={`text-xs font-bold w-14 shrink-0 ${accent.text}`}>
              {isA ? `Bài ${lessonStartIndex + gi + 1}` : `L.${lessonStartIndex + gi + 1}`}
            </span>
            <BookOpen className={`w-4 h-4 shrink-0 ${accent.text}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {isA ? g.titleVi : g.titleEn}
              </p>
              <p className="text-xs text-zinc-400 font-mono truncate">{g.structure}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Chủ đề từ vựng liên kết */}
      {unit.vocabCircleIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unit.vocabCircleIds.map((id) => {
            const c = CIRCLE_BY_ID[id]
            if (!c) return null
            const done = circleDone(c, learned)
            const full = done >= c.words.length
            return (
              <button
                key={id}
                onClick={() => onOpenCircle(c)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition hover:border-zinc-500 ${full ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/70 border-zinc-800 text-zinc-300'}`}
              >
                <span>{c.emoji}</span>
                <span>{isA ? c.titleVi : c.titleEn}</span>
                <span className={full ? accent.text : 'text-zinc-400'}>
                  {full ? <Check className="w-3.5 h-3.5" /> : `${done}/${c.words.length}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Hội thoại mẫu của bài */}
      {dialogues.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5">
          {dialogues.map((dl, i) => (
            <button
              key={i}
              onClick={() => onOpenDialogue(dl)}
              className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 transition"
            >
              <MessageCircle className={`w-4 h-4 shrink-0 ${accent.text}`} />
              <span className="flex-1 min-w-0 text-sm font-medium text-zinc-200 truncate">
                {isA ? dl.titleVi : dl.titleEn}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Chi tiết 1 bài ngữ pháp ───────────────────────────────────────────────────
function GrammarDetail({
  lesson,
  isA,
  accent,
  onBack,
}: {
  lesson: GrammarLesson
  isA: boolean
  accent: (typeof ACCENT)[keyof typeof ACCENT]
  onBack: () => void
}) {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-3"
      >
        <ChevronLeft className="w-4 h-4" /> {isA ? 'Quay lại lộ trình' : 'Back to roadmap'}
      </button>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white text-lg">{isA ? lesson.titleVi : lesson.titleEn}</h3>

        {/* Công thức */}
        <div className={`mt-3 px-4 py-3 rounded-xl ${accent.soft} border ${accent.ring}`}>
          <p className="text-xs text-zinc-400 mb-1">{isA ? 'Cấu trúc' : 'Structure'}</p>
          <p className={`font-mono text-sm font-semibold ${accent.text}`}>{lesson.structure}</p>
        </div>

        {/* Giải thích tiếng Việt */}
        <div className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {lesson.explainVi}
        </div>

        {/* Mẹo / lưu ý */}
        {lesson.tipVi && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> {isA ? 'Mẹo ghi nhớ' : 'Tip'}
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {lesson.tipVi}
            </p>
          </div>
        )}

        {/* Ví dụ có nghe */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 mb-2">{isA ? 'Ví dụ' : 'Examples'}</p>
          <div className="space-y-2">
            {lesson.examples.map((e, i) => (
              <div
                key={i}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3"
              >
                <KaraokeText
                  text={e.en}
                  lang="en-US"
                  textClass={`font-medium text-[15px] leading-snug ${accent.text}`}
                  buttonClass="w-full"
                />
                <p className="text-sm text-zinc-400 mt-1 pl-6">{e.vi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lỗi thường gặp */}
        {lesson.mistakes && lesson.mistakes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              {isA ? 'Lỗi thường gặp' : 'Common mistakes'}
            </p>
            <div className="space-y-2">
              {lesson.mistakes.map((m, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3"
                >
                  <p className="text-sm text-rose-300 line-through decoration-rose-500/60">
                    {m.wrong}
                  </p>
                  <p className="text-sm text-accent-300 mt-0.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" /> {m.right}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{m.noteVi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bài tập nhỏ */}
        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <PencilLine className={`w-3.5 h-3.5 ${accent.text}`} />
              {isA ? 'Tự kiểm tra' : 'Quick check'}
            </p>
            <div className="space-y-3">
              {lesson.quiz.map((q, i) => (
                <QuizCard key={i} item={q} isA={isA} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Một câu trắc nghiệm tự kiểm tra ───────────────────────────────────────────
function QuizCard({ item, isA }: { item: QuizItem; isA: boolean }) {
  // pick = đáp án người dùng đã chọn (null = chưa chọn).
  const [pick, setPick] = useState<number | null>(null)
  const answered = pick !== null
  const correct = pick === item.answer

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3">
      <p className="text-sm font-medium text-zinc-200 mb-2">{item.q}</p>
      <div className="space-y-1.5">
        {item.options.map((opt, i) => {
          // Sau khi trả lời: tô xanh đáp án đúng, tô đỏ đáp án đã chọn nếu sai.
          let cls = 'bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-zinc-500'
          if (answered) {
            if (i === item.answer) cls = 'bg-accent-500/15 border-accent-500/50 text-accent-300'
            else if (i === pick) cls = 'bg-rose-500/15 border-rose-500/50 text-rose-300'
            else cls = 'bg-zinc-800/40 border-zinc-800 text-zinc-400'
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPick(i)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition ${cls}`}
            >
              {opt}
              {answered && i === item.answer && <Check className="inline w-3.5 h-3.5 ml-1.5" />}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-xs mt-2 ${correct ? 'text-accent-400' : 'text-rose-400'}`}>
          {correct ? (isA ? '✓ Chính xác!' : '✓ Correct!') : isA ? '✗ Chưa đúng.' : '✗ Not quite.'}
          {item.explainVi && <span className="text-zinc-400"> {item.explainVi}</span>}
        </p>
      )}
    </div>
  )
}

// ── Flashcard cho 1 vòng từ vựng (gắn vào lộ trình) ───────────────────────────
function VocabFlash({
  circle,
  isA,
  uid,
  onProgress,
  onBack,
  onOpenDialogue,
}: {
  circle: Circle
  isA: boolean
  uid: string
  onProgress: () => void
  onBack: () => void
  onOpenDialogue: (d: Dialogue) => void
}) {
  // Lọc ra các từ CHƯA thuộc để học trước; nếu đã thuộc hết thì ôn lại cả vòng.
  const [cards] = useState<DictEntry[]>(() => {
    const learned = getLearnedWords(uid)
    const todo = circle.words.filter(
      (w) => !learned.has(w.word) && !learned.has(w.word.toLowerCase()),
    )
    return todo.length > 0 ? todo : circle.words
  })
  const [idx, setIdx] = useState(0)
  const card = cards[idx]
  const done = idx >= cards.length
  const [dialogues, setDialogues] = useState<Dialogue[]>([])
  useEffect(() => {
    getDialogues(circle.id).then(setDialogues)
  }, [circle.id])

  function learn() {
    if (!card) return
    markLearned(uid, card.word)
    addToSRS(uid, card.word)
    bumpDailyLearned(uid)
    markStudiedToday(uid) // ghi nhận có học hôm nay → tính streak (đồng bộ server)
    onProgress()
    setIdx((i) => i + 1)
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-3"
      >
        <ChevronLeft className="w-4 h-4" /> {isA ? 'Quay lại lộ trình' : 'Back to roadmap'}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2">
        <span>{circle.emoji}</span>
        <span>{isA ? circle.titleVi : circle.titleEn}</span>
      </div>

      {done || !card ? (
        <div className="glass rounded-xl p-8 text-center space-y-3">
          <Check className="w-10 h-10 text-accent-400 mx-auto" />
          <p className="text-white font-semibold">{isA ? 'Xong bộ từ này!' : 'Set complete!'}</p>
          {circle.sentences.length > 0 && (
            <div className="text-left pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {isA ? 'Câu thông dụng' : 'Common sentences'}
              </p>
              {circle.sentences.map((s, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3"
                >
                  <KaraokeText
                    text={s.en}
                    lang="en-US"
                    textClass="font-medium text-[15px] leading-snug text-teal-300"
                    buttonClass="w-full"
                  />
                  <p className="text-sm text-zinc-400 mt-1 pl-6">{s.vi}</p>
                </div>
              ))}
            </div>
          )}
          {dialogues.length > 0 && (
            <div className="text-left pt-3 border-t border-zinc-800 space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                {isA ? 'Hội thoại mẫu' : 'Sample dialogues'}
              </p>
              {dialogues.map((dl, i) => (
                <button
                  key={i}
                  onClick={() => onOpenDialogue(dl)}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-teal-400" />
                  <span className="flex-1 min-w-0 text-sm font-medium text-zinc-200 truncate">
                    {isA ? dl.titleVi : dl.titleEn}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
          <button
            onClick={onBack}
            className="w-full mt-2 py-3 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
          >
            {isA ? 'Về lộ trình' : 'Back to roadmap'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>
              {isA ? 'Từ' : 'Word'} {idx + 1}/{cards.length}
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full mb-4">
            <div
              className="h-full bg-accent-500 rounded-full transition-all"
              style={{ width: `${(idx / cards.length) * 100}%` }}
            />
          </div>

          <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onProgress} />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition py-3 rounded-xl text-sm font-medium"
            >
              <X className="w-4 h-4" /> {isA ? 'Để sau' : 'Later'}
            </button>
            <button
              onClick={learn}
              className="flex items-center justify-center gap-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 transition py-3 rounded-xl text-sm font-medium"
            >
              <Check className="w-4 h-4" /> {isA ? 'Đã thuộc' : 'Got it'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Xem 1 cuộc hội thoại ──────────────────────────────────────────────────────
// Hai người nói A/B hiển thị so le hai bên (giống khung chat). Mỗi câu tiếng Anh
// bấm nghe được (KaraokeText), kèm bản dịch tiếng Việt bên dưới.
// Có thanh điều khiển: tốc độ (0.75× / 1× / 1.25×) + chế độ EN / EN+VI / VI
// + Phát tất cả / Dừng / Tiếp — giống trang Lessons.

type DlgSpeed = 0.75 | 1 | 1.25
type DlgMode = 'en' | 'both' | 'vi'

function DialogueView({
  dialogue,
  isA,
  accent,
  onBack,
}: {
  dialogue: Dialogue
  isA: boolean
  accent: (typeof ACCENT)[keyof typeof ACCENT]
  onBack: () => void
}) {
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState<DlgSpeed>(1)
  const [mode, setMode] = useState<DlgMode>('en')
  // Từ đang đọc của dòng đang phát (chỉ theo dõi khi audio đang đọc CHÍNH `ln.en` — đúng văn
  // bản mà KaraokeText hiển thị) — cho karaoke sáng chữ trong lúc "Phát tất cả", không chỉ khi
  // bấm nghe từng dòng riêng lẻ.
  const [dlgWordSync, setDlgWordSync] = useState<{
    lineIdx: number
    wordIdx: number | null
  } | null>(null)

  const stopRef = useRef(false)
  const pauseRef = useRef(false)
  const speedRef = useRef<DlgSpeed>(1)
  const modeRef = useRef<DlgMode>('en')

  // Phân giọng cho từng nhân vật — nếu cùng giới thì dùng giọng thứ 2 cho B
  // để 2 nhân vật luôn có giọng khác nhau (female vs female2, male vs male2).
  // Giống cách làm ở src/pages/Lessons.tsx (LessonView).
  const genderA = dialogue.speakerAGender ?? 'female'
  const genderB = dialogue.speakerBGender ?? 'male'
  const voiceA: Voice = genderA === 'female' ? 'female' : 'male'
  const voiceB: Voice =
    genderB === genderA
      ? genderB === 'female'
        ? 'female2'
        : 'male2'
      : genderB === 'female'
        ? 'female'
        : 'male'

  // Dừng audio khi back
  useEffect(
    () => () => {
      stopRef.current = true
      stopSpeaking()
    },
    [],
  )

  function changeSpeed(s: DlgSpeed) {
    setSpeed(s)
    speedRef.current = s
  }
  function changeMode(m: DlgMode) {
    setMode(m)
    modeRef.current = m
  }

  async function startPlayAll() {
    unlockAudio() // mở khoá audio iOS NGAY trong cú bấm (trước mọi await)
    stopRef.current = false
    pauseRef.current = false
    setPlaying(true)
    setPaused(false)
    setActiveLine(null)

    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang = isA ? 'vi-VN' : 'en-US'

    // Nạp TRƯỚC audio các câu (chạy nền, tuần tự) để phát liền mạch không khựng.
    // Tải nhanh hơn đọc nên bộ nạp luôn đi trước trình phát; trùng câu thì gộp (dedup).
    void (async () => {
      for (const ln of dialogue.lines) {
        if (stopRef.current) break
        const v = ln.who === 'A' ? voiceA : voiceB
        const m = modeRef.current
        if (m === 'en' || m === 'both') await prefetchSpeech(ln.en, 'en-US', v)
        if (m === 'vi' || m === 'both') await prefetchSpeech(ln.vi, 'vi-VN', v)
      }
    })()

    for (let i = 0; i < dialogue.lines.length; i++) {
      if (stopRef.current) break
      while (pauseRef.current && !stopRef.current) await new Promise((r) => setTimeout(r, 100))
      if (stopRef.current) break

      const ln = dialogue.lines[i]
      if (!ln) continue // i < lines.length nên ln luôn có; guard để TS narrow kiểu
      setActiveLine(i)
      setDlgWordSync(null)

      const curMode = modeRef.current
      const curSpeed = speedRef.current
      const curVoice = ln.who === 'A' ? voiceA : voiceB

      // Chỉ theo dõi từ đang đọc khi văn bản CHÍNH LÀ ln.en (đúng câu KaraokeText hiển thị) —
      // ln.vi luôn hiện dạng chữ thường, không có karaoke.
      const onWordFor = (text: string) =>
        text === ln.en ? (wi: number) => setDlgWordSync({ lineIdx: i, wordIdx: wi }) : undefined

      if (curMode === 'en') {
        await speak(ln.en, 'en-US', curVoice, curSpeed, onWordFor(ln.en))
      } else if (curMode === 'vi') {
        await speak(ln.vi, 'vi-VN', curVoice, curSpeed)
      } else {
        // both: đích trước, bản dịch sau
        const targetText = isA ? ln.en : ln.vi
        const transText = isA ? ln.vi : ln.en
        await speak(targetText, targetLang, curVoice, curSpeed, onWordFor(targetText))
        if (!stopRef.current) {
          await new Promise((r) => setTimeout(r, 250))
          setDlgWordSync(null)
          await speak(transText, transLang, curVoice, curSpeed, onWordFor(transText))
        }
      }
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 400))
    }

    stopRef.current = false
    setPlaying(false)
    setPaused(false)
    setActiveLine(null)
    setDlgWordSync(null)
  }

  function handlePause() {
    pauseRef.current = true
    setPaused(true)
    pauseCurrentAudio()
  }
  function handleResume() {
    pauseRef.current = false
    setPaused(false)
    resumeCurrentAudio()
  }
  function handleStop() {
    stopRef.current = true
    stopSpeaking()
    setPlaying(false)
    setPaused(false)
    setActiveLine(null)
    setDlgWordSync(null)
  }

  const isIdle = !playing && !paused

  const SPEEDS: DlgSpeed[] = [0.75, 1, 1.25]
  const MODES: { key: DlgMode; label: string }[] = [
    { key: 'en', label: 'EN' },
    { key: 'both', label: isA ? 'EN+VI' : 'VI+EN' },
    { key: 'vi', label: 'VI' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Thanh điều khiển audio */}
      <div className="bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/40 px-4 py-2.5 -mx-4 mb-3">
        <div className="glass rounded-xl px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Nút back */}
          <button
            onClick={onBack}
            className="shrink-0 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> {isA ? 'Quay lại' : 'Back'}
          </button>

          <div className="h-3.5 w-px bg-zinc-700" />

          {/* Play / Pause / Resume / Stop */}
          <div className="flex items-center gap-1.5">
            {isIdle && (
              <button
                onClick={() => void startPlayAll()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-xs font-medium transition"
              >
                <Play className="w-3 h-3 fill-current" />
                {isA ? 'Phát tất cả' : 'Play all'}
              </button>
            )}
            {playing && !paused && (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition"
              >
                <Pause className="w-3 h-3 fill-current" />
                {isA ? 'Dừng' : 'Pause'}
              </button>
            )}
            {paused && (
              <button
                onClick={handleResume}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-xs font-medium transition"
              >
                <Play className="w-3 h-3 fill-current" />
                {isA ? 'Tiếp' : 'Resume'}
              </button>
            )}
            {!isIdle && (
              <button
                onClick={handleStop}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            )}
          </div>

          <div className="h-3.5 w-px bg-zinc-700" />

          {/* Tốc độ đọc */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                  speed === s
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          <div className="h-3.5 w-px bg-zinc-700" />

          {/* Chế độ nghe: EN / EN+VI / VI */}
          <div className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-zinc-400 shrink-0" />
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => changeMode(m.key)}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                  mode === m.key
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Đang phát dòng bao nhiêu */}
          {playing && activeLine !== null && (
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-[11px] text-zinc-400">
                {activeLine + 1}/{dialogue.lines.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className={`w-5 h-5 shrink-0 ${accent.text}`} />
          <h3 className="font-bold text-white">{isA ? dialogue.titleVi : dialogue.titleEn}</h3>
        </div>

        <div className="space-y-2.5">
          {dialogue.lines.map((ln, i) => {
            const isB = ln.who === 'B'
            const isActive = activeLine === i
            return (
              <div key={i} className={`flex ${isB ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 border transition-all ${
                    isActive ? 'ring-2 ring-offset-1 ring-offset-zinc-950 ring-accent-500/60' : ''
                  } ${isB ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/80 border-zinc-800/80'}`}
                >
                  <span
                    className={`text-[11px] font-semibold tracking-wide ${
                      isB ? accent.text : 'text-zinc-400'
                    }`}
                  >
                    {ln.who === 'A'
                      ? isA
                        ? (dialogue.speakerA?.vi ?? 'A')
                        : (dialogue.speakerA?.en ?? 'A')
                      : isA
                        ? (dialogue.speakerB?.vi ?? 'B')
                        : (dialogue.speakerB?.en ?? 'B')}
                  </span>
                  <KaraokeText
                    text={ln.en}
                    lang="en-US"
                    textClass={`font-medium text-[15px] leading-snug ${isB ? accent.text : 'text-zinc-100'}`}
                    buttonClass="w-full"
                    voice={ln.who === 'A' ? voiceA : voiceB}
                    externalState={
                      playing && dlgWordSync?.lineIdx === i
                        ? { playing: true, wordIdx: dlgWordSync.wordIdx }
                        : undefined
                    }
                  />
                  <p className="text-sm text-zinc-400 mt-1 pl-6">{ln.vi}</p>
                  <InlinePronounce
                    text={isA ? ln.en : ln.vi}
                    lang={isA ? 'en-US' : 'vi-VN'}
                    isA={isA}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
