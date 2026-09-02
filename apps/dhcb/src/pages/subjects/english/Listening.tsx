// Listening — trang "Thư viện Nghe" (/listening), gom mọi nội dung để NGHE-HIỂU (khác /phrases và
// mục "Nghe" ở /practice vốn là bài tập CÓ CHẤM ĐIỂM). 2 tab: Câu thông dụng · Hội thoại.
// Tab Truyện trước đây ở đây đã tách thành trang riêng /stories (2026-08-02, xem Stories.tsx)
// để dễ phát triển thêm tính năng sau.
// Xem docs/research/dac-ta-trang-nghe-2026-08-01.md mục 6 + danh-muc-truyen-nghe-2026-08-01.md mục 9.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Play, Square, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { usePageTitle } from '../../../lib/usePageTitle'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { CardListSkeleton } from '../../../components/Skeleton'
import KaraokeText, { KARAOKE_INDENT } from '../../../components/KaraokeText'
import { useAuth } from '../../../context/useAuth'
import { useLang } from '../../../context/useLang'
import { getDirection } from '../../../lib/storage'
import { speak, stopSpeaking, unlockAudio, type Voice } from '../../../lib/tts'
import { pickRandomVoice } from '../../../lib/voiceTiers'
import type { Plan } from '../../../types'
import { loadIndex, loadSubject } from '../../../data/patterns/loader'
import type { SubjectMeta, Subject } from '../../../data/patterns/loader'
import { getAllDialogues } from '../../../data/dialoguesLoader'
import type { Dialogue } from '../../../data/dialogues'

type Tab = 'phrases' | 'dialogues'
const TABS: Tab[] = ['phrases', 'dialogues']

export default function Listening() {
  usePageTitle('Luyện nghe | Môn Tiếng Anh · Đồng hành cùng bạn')
  const { user } = useAuth()
  const { T } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const isA = getDirection() === 'A'

  const tab: Tab = ((): Tab => {
    const t = searchParams.get('tab')
    return (TABS as string[]).includes(t ?? '') ? (t as Tab) : 'phrases'
  })()

  function setTab(next: Tab) {
    setSearchParams(next === 'phrases' ? {} : { tab: next }, { replace: false })
  }

  const TAB_LABELS: Record<Tab, string> = {
    phrases: T.tabPhrases,
    dialogues: T.tabDialogues,
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout back />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
        <PageHeader title={T.listeningPageTitle} subtitle={T.listeningPageSub} />

        {/* Thanh 2 tab */}
        <div
          role="tablist"
          aria-label={T.listeningPageTitle}
          className="grid grid-cols-2 gap-1.5 mb-5"
        >
          {TABS.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`tap-44 px-1.5 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition text-center leading-tight ${
                tab === key
                  ? 'bg-accent-500/20 text-accent-300 theme-light:text-accent-800 border border-accent-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {tab === 'phrases' && <PhrasesTab isA={isA} T={T} />}
        {tab === 'dialogues' && <DialoguesTab isA={isA} T={T} plan={user?.plan ?? 'free'} />}
      </main>
    </div>
  )
}

// Kiểu T lấy trực tiếp từ useLang() để không phải import Translations riêng ở mỗi sub-tab.
type Lang = ReturnType<typeof useLang>['T']

// ── Tab 1 — Câu thông dụng (chế độ nghe, tái dùng data/patterns) ─────────────
function PhrasesTab({ isA, T }: { isA: boolean; T: Lang }) {
  const [index, setIndex] = useState<SubjectMeta[] | null>(null)
  const [selected, setSelected] = useState<Subject | null>(null)
  const [opening, setOpening] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  useEffect(() => {
    loadIndex().then(setIndex)
  }, [])

  async function open(meta: SubjectMeta) {
    setOpening(true)
    const s = await loadSubject(meta)
    setSelected(s)
    setOpening(false)
  }

  if (selected) {
    return (
      <SentenceListPlayer
        title={selected.starter}
        sentences={selected.sentences}
        isA={isA}
        T={T}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation((v) => !v)}
        onBack={() => setSelected(null)}
      />
    )
  }

  if (opening) return <CardListSkeleton rows={3} />
  if (index === null) return <CardListSkeleton rows={5} />
  if (index.length === 0) {
    return <EmptyState isA={isA} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {index.map((meta) => (
        <button
          key={meta.starter}
          onClick={() => open(meta)}
          className="text-left bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800/60 active:scale-[0.98] transition-all flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="text-xs text-zinc-400 truncate">{meta.category}</p>
            <p className="font-semibold text-white truncate">{meta.starter}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
        </button>
      ))}
    </div>
  )
}

// ── Tab 2 — Hội thoại, nhóm theo cấp CEFR bằng tiền tố id ─────────────────────
const CEFR_PREFIX = /^(a1|a2|b1|b2|c1|c2)-/

interface DialogueEntry {
  id: string
  dialogue: Dialogue
}

function DialoguesTab({ isA, T, plan }: { isA: boolean; T: Lang; plan: Plan }) {
  const [groups, setGroups] = useState<Record<string, DialogueEntry[]> | null>(null)
  const [selected, setSelected] = useState<DialogueEntry | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)

  useEffect(() => {
    getAllDialogues().then((data) => {
      const byLevel: Record<string, DialogueEntry[]> = {}
      for (const [id, dialogues] of Object.entries(data)) {
        const m = CEFR_PREFIX.exec(id)
        const level = m ? m[1]!.toUpperCase() : T.otherGroupLabel
        for (const dialogue of dialogues) {
          ;(byLevel[level] ??= []).push({ id, dialogue })
        }
      }
      setGroups(byLevel)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (selected) {
    return (
      <DialoguePlayer
        entry={selected}
        isA={isA}
        T={T}
        plan={plan}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation((v) => !v)}
        onBack={() => setSelected(null)}
      />
    )
  }

  if (groups === null) return <CardListSkeleton rows={5} />
  const levelKeys = Object.keys(groups)
  if (levelKeys.length === 0) return <EmptyState isA={isA} />

  return (
    <div className="space-y-5">
      {levelKeys.map((level) => (
        <div key={level}>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            {level}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {groups[level]!.map((entry, i) => (
              <button
                key={`${entry.id}-${i}`}
                onClick={() => setSelected(entry)}
                className="text-left bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800/60 active:scale-[0.98] transition-all flex items-center justify-between gap-2"
              >
                <span className="font-medium text-white text-sm truncate">
                  {isA ? entry.dialogue.titleVi : entry.dialogue.titleEn}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Trạng thái rỗng dùng chung ─────────────────────────────────────────────
function EmptyState({ isA }: { isA: boolean }) {
  return (
    <div className="text-center py-16 text-zinc-400 text-sm">
      {isA ? 'Chưa có nội dung.' : 'No content yet.'}
    </div>
  )
}

// ── Trình phát tuần tự cho danh sách câu (tab Câu thông dụng) ────────────────
function SentenceListPlayer({
  title,
  sentences,
  isA,
  T,
  showTranslation,
  onToggleTranslation,
  onBack,
}: {
  title: string
  sentences: { en: string; vi: string }[]
  isA: boolean
  T: Lang
  showTranslation: boolean
  onToggleTranslation: () => void
  onBack: () => void
}) {
  const [playing, setPlaying] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [wordIdx, setWordIdx] = useState<number | null>(null)
  const stopRef = useRef(false)

  useEffect(
    () => () => {
      stopRef.current = true
      stopSpeaking()
    },
    [],
  )

  async function playAll() {
    if (sentences.length === 0) return
    unlockAudio()
    stopRef.current = false
    setPlaying(true)
    const lang = isA ? 'en-US' : 'vi-VN'
    for (let i = 0; i < sentences.length; i++) {
      if (stopRef.current) break
      const s = sentences[i]
      if (!s) continue
      setActiveIdx(i)
      setWordIdx(null)
      await speak(isA ? s.en : s.vi, lang, undefined, undefined, (wi) => setWordIdx(wi))
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 250))
    }
    stopRef.current = false
    setPlaying(false)
    setActiveIdx(null)
    setWordIdx(null)
  }

  function stopAll() {
    stopRef.current = true
    stopSpeaking()
    setPlaying(false)
    setActiveIdx(null)
    setWordIdx(null)
  }

  const targetLang = isA ? 'en-US' : 'vi-VN'

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="tap-44 text-sm text-zinc-400 hover:text-zinc-200 transition px-2 -ml-2"
        >
          ← {isA ? 'Quay lại' : 'Back'}
        </button>
        <h2 className="font-semibold text-white truncate flex-1">{title}</h2>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {!playing ? (
          <button
            onClick={playAll}
            className="tap-44 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
          >
            <Play className="w-4 h-4 fill-current" />
            {T.playAllLabel}
          </button>
        ) : (
          <button
            onClick={stopAll}
            className="tap-44 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
          >
            <Square className="w-4 h-4 fill-current" />
            {isA ? 'Dừng' : 'Stop'}
          </button>
        )}
        <button
          onClick={onToggleTranslation}
          aria-pressed={showTranslation}
          className="tap-44 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition"
        >
          {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showTranslation ? T.hideTranslation : T.showTranslation}
        </button>
      </div>

      <div className="space-y-1.5">
        {sentences.map((s, i) => {
          const isActive = playing && activeIdx === i
          return (
            <div key={i} className={`rounded-lg ${isActive ? 'bg-accent-500/10' : ''}`}>
              <KaraokeText
                text={isA ? s.en : s.vi}
                lang={targetLang}
                textClass="text-[15px] leading-relaxed text-zinc-100"
                buttonClass="w-full px-2 py-1.5 rounded-lg hover:bg-zinc-900/60"
                externalState={
                  playing ? { playing: isActive, wordIdx: isActive ? wordIdx : null } : undefined
                }
              />
              {showTranslation && (
                <p className={`text-sm text-zinc-400 ${KARAOKE_INDENT}`}>{isA ? s.vi : s.en}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Trình phát 1 hội thoại (tab Hội thoại) — 2 giọng theo speakerA/BGender ────
function DialoguePlayer({
  entry,
  isA,
  T,
  plan,
  showTranslation,
  onToggleTranslation,
  onBack,
}: {
  entry: DialogueEntry
  isA: boolean
  T: Lang
  plan: Plan
  showTranslation: boolean
  onToggleTranslation: () => void
  onBack: () => void
}) {
  const { dialogue } = entry
  const [playing, setPlaying] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [wordIdx, setWordIdx] = useState<number | null>(null)
  const stopRef = useRef(false)

  // Chọn giọng cho A/B theo giới tính nhân vật (mẫu tái dùng từ CefrLessonViews.tsx
  // DialogueView) — đổi mỗi lần mở hội thoại khác.
  const voices = useMemo<{ voiceA: Voice; voiceB: Voice }>(() => {
    const genderA = dialogue.speakerAGender ?? 'female'
    const genderB = dialogue.speakerBGender ?? 'male'
    const a = pickRandomVoice(genderA, plan)
    let b = pickRandomVoice(genderB, plan)
    for (let i = 0; i < 5 && b === a; i++) b = pickRandomVoice(genderB, plan)
    return { voiceA: a, voiceB: b }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue.titleEn])

  useEffect(
    () => () => {
      stopRef.current = true
      stopSpeaking()
    },
    [],
  )

  async function playAll() {
    if (dialogue.lines.length === 0) return
    unlockAudio()
    stopRef.current = false
    setPlaying(true)
    const lang = isA ? 'en-US' : 'vi-VN'
    for (let i = 0; i < dialogue.lines.length; i++) {
      if (stopRef.current) break
      const ln = dialogue.lines[i]
      if (!ln) continue
      setActiveIdx(i)
      setWordIdx(null)
      const voice = ln.who === 'A' ? voices.voiceA : voices.voiceB
      await speak(isA ? ln.en : ln.vi, lang, voice, undefined, (wi) => setWordIdx(wi))
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 300))
    }
    stopRef.current = false
    setPlaying(false)
    setActiveIdx(null)
    setWordIdx(null)
  }

  function stopAll() {
    stopRef.current = true
    stopSpeaking()
    setPlaying(false)
    setActiveIdx(null)
    setWordIdx(null)
  }

  const targetLang = isA ? 'en-US' : 'vi-VN'

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="tap-44 text-sm text-zinc-400 hover:text-zinc-200 transition px-2 -ml-2"
        >
          ← {isA ? 'Quay lại' : 'Back'}
        </button>
        <h2 className="font-semibold text-white truncate flex-1">
          {isA ? dialogue.titleVi : dialogue.titleEn}
        </h2>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {!playing ? (
          <button
            onClick={playAll}
            className="tap-44 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
          >
            <Play className="w-4 h-4 fill-current" />
            {T.playWholeDialogue}
          </button>
        ) : (
          <button
            onClick={stopAll}
            className="tap-44 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
          >
            <Square className="w-4 h-4 fill-current" />
            {isA ? 'Dừng' : 'Stop'}
          </button>
        )}
        <button
          onClick={onToggleTranslation}
          aria-pressed={showTranslation}
          className="tap-44 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition"
        >
          {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showTranslation ? T.hideTranslation : T.showTranslation}
        </button>
      </div>

      <div className="space-y-2">
        {dialogue.lines.map((ln, i) => {
          const isActive = playing && activeIdx === i
          const speakerName =
            ln.who === 'A'
              ? isA
                ? (dialogue.speakerA?.vi ?? 'A')
                : (dialogue.speakerA?.en ?? 'A')
              : isA
                ? (dialogue.speakerB?.vi ?? 'B')
                : (dialogue.speakerB?.en ?? 'B')
          return (
            <div
              key={i}
              className={`rounded-lg p-2 ${isActive ? 'bg-accent-500/10' : 'bg-zinc-900/50'}`}
            >
              <p className="text-[11px] text-zinc-500 font-medium mb-0.5">{speakerName}</p>
              <KaraokeText
                text={isA ? ln.en : ln.vi}
                lang={targetLang}
                textClass="text-[15px] leading-relaxed text-zinc-100"
                buttonClass="w-full"
                externalState={
                  playing ? { playing: isActive, wordIdx: isActive ? wordIdx : null } : undefined
                }
              />
              {showTranslation && (
                <p className={`text-sm text-zinc-400 ${KARAOKE_INDENT}`}>{isA ? ln.vi : ln.en}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
