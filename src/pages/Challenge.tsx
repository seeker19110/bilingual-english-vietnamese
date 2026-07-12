// src/pages/Challenge.tsx — Thử thách "Challenge 1 phút / 30 ngày"
// (docs/research/thu-thach-challenge-30-ngay.md). Mỗi ngày quay 1 video ngắn theo chủ đề
// gợi ý → audio gửi /api/stt nhận diện → AI (prompts/challenge.ts) khen + sửa lỗi + gợi ý
// câu nâng cấp. Video KHÔNG upload — chỉ lưu trên máy (IndexedDB, lib/challengeVideo.ts).
import { useEffect, useMemo, useRef, useState } from 'react'
import { Video, Mic, RotateCcw, Send, Square, Type, Trophy, Check, Volume2 } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import Celebration from '../components/Celebration'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastProvider'
import { useApiThrottle } from '../lib/useApiThrottle'
import { getUsage, incrementUsage, getDirection } from '../lib/storage'
import { LIMITS, type Direction } from '../types'
import { vnDateStr } from '../lib/date'
import { callClaude, parseJson } from '../lib/ai'
import { speak } from '../lib/tts'
import { haptics } from '../lib/haptics'
import { getAuthHeader } from '../lib/authHeader'
import { getTopicForDay, type ChallengeTopic } from '../data/challengeTopics'
import { challengeFeedbackSystemPrompt, type ChallengeFeedback } from '../prompts/challenge'
import {
  getChallenge,
  startChallenge,
  resumeChallenge,
  restartChallenge,
  saveEntry,
  getChallengeDay,
  getEarnedMilestones,
  getNewMilestone,
  getKeepDates,
  countWords,
  calcWpm,
  mergeCloudEntries,
  CHALLENGE_MILESTONES,
  CHALLENGE_TOTAL_DAYS,
  type ChallengeState,
  type ChallengeEntryLocal,
} from '../lib/challenge'
import {
  startChallengeRecording,
  isChallengeRecordingSupported,
  MAX_CHALLENGE_SEC,
  MIN_CHALLENGE_SEC,
  CHALLENGE_ERR_PERMISSION,
  type ChallengeRecorderHandle,
  type ChallengeRecording,
} from '../lib/challengeRecorder'
import { saveChallengeVideo, getChallengeVideo, pruneChallengeVideos } from '../lib/challengeVideo'
import {
  upsertChallengeEntryCloud,
  fetchChallengeEntriesCloud,
  cloudChallengeToLocal,
} from '../lib/challengeCloud'

type Stage = 'idle' | 'countdown' | 'recording' | 'reviewing' | 'typed' | 'submitting'

const MILESTONE_LABEL: Record<number, { emoji: string; vi: string; en: string }> = {
  1: { emoji: '🎬', vi: 'Mở màn', en: 'Kickoff' },
  3: { emoji: '🔥', vi: 'Khởi động', en: 'Warming up' },
  7: { emoji: '🏅', vi: 'Tuần đầu', en: 'First week' },
  14: { emoji: '🚀', vi: 'Nửa chặng', en: 'Halfway' },
  21: { emoji: '💪', vi: 'Thành thói quen', en: 'Habit formed' },
  30: { emoji: '🏆', vi: 'Hoàn thành', en: 'Completed' },
}

// Đọc Blob → base64 thô (bỏ tiền tố data:...;base64,) — cùng cách sttServer.ts làm,
// nhân bản nhỏ vì hàm đó không export (gắn chặt vào Recorder riêng của nó).
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const b64 = result.split(',')[1] ?? ''
      if (!b64) reject(new Error('Không đọc được dữ liệu ghi âm'))
      else resolve(b64)
    }
    reader.onerror = () => reject(new Error('Lỗi đọc dữ liệu ghi âm'))
    reader.readAsDataURL(blob)
  })
}

async function transcribeChallengeAudio(
  blob: Blob,
  mime: string,
  lang: 'en' | 'vi',
): Promise<string> {
  const b64 = await blobToBase64(blob)
  const auth = await getAuthHeader()
  const resp = await fetch('/api/stt', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ audio_b64: b64, mime, lang }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Lỗi nhận diện giọng nói (${resp.status})`)
  }
  const data = (await resp.json()) as unknown
  const text = (data as { text?: unknown } | null)?.text
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Không nhận diện được giọng nói — thử quay lại hoặc gõ tay.')
  }
  return text.trim()
}

// Entry của 1 ngày cụ thể trong VÒNG hiện tại (bỏ qua lịch sử vòng cũ trùng ngày — hiếm).
function entryForDay(challenge: ChallengeState, day: string): ChallengeEntryLocal | null {
  const e = challenge.entries[day]
  return e && e.round === challenge.round ? e : null
}

// ── Từ gợi ý — bấm để nghe TTS ────────────────────────────────────────────────
function HintChip({ text, lang }: { text: string; lang: 'en-US' | 'vi-VN' }) {
  return (
    <button
      onClick={() => void speak(text, lang)}
      className="tap-44 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-xs text-zinc-200 hover:border-accent-500/50 transition"
    >
      <Volume2 className="w-3 h-3 text-zinc-400 shrink-0" />
      {text}
    </button>
  )
}

// ── Câu mẫu — bấm để nghe TTS chất lượng cao trước khi tự quay/ghi âm ─────────
// Audio đã được thu thập sẵn (npm run seed:all — nhóm "challenge") nên bấm phát gần
// như tức thì, không phải đợi Google TTS tạo mới ở lần bấm đầu tiên.
function SampleLine({ text, lang }: { text: string; lang: 'en-US' | 'vi-VN' }) {
  return (
    <button
      onClick={() => void speak(text, lang)}
      className="tap-44 w-full flex items-start gap-2 text-left px-2 py-1.5 -mx-2 rounded-lg hover:bg-zinc-800/60 transition"
    >
      <Volume2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
      <span className="text-xs text-zinc-400 italic">“{text}”</span>
    </button>
  )
}

// ── Thẻ chủ đề của ngày ────────────────────────────────────────────────────────
function TopicCard({ topic, isA }: { topic: ChallengeTopic; isA: boolean }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
      <p className="text-xs text-zinc-400 mb-1">
        {isA ? `Chủ đề ngày ${topic.day}/30` : `Day ${topic.day}/30 topic`}
      </p>
      <p className="text-lg font-semibold text-white mb-2">{isA ? topic.titleVi : topic.titleEn}</p>
      <p className="text-xs text-zinc-400 mb-3">{isA ? topic.titleEn : topic.titleVi}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {topic.hintWords.map((h) => (
          <HintChip key={h.en} text={isA ? h.en : h.vi} lang={isA ? 'en-US' : 'vi-VN'} />
        ))}
      </div>
      <p className="text-[11px] text-zinc-500 mb-1">
        {isA ? '🔊 Bấm nghe câu mẫu trước khi quay:' : '🔊 Tap to hear a sample before recording:'}
      </p>
      <div>
        {(isA ? topic.sampleEn : topic.sampleVi).map((s, i) => (
          <SampleLine key={i} text={s} lang={isA ? 'en-US' : 'vi-VN'} />
        ))}
      </div>
    </div>
  )
}

// ── Bảng 30 ô ────────────────────────────────────────────────────────────────
function ChallengeBoard({
  challenge,
  todayDay,
  isA,
}: {
  challenge: ChallengeState
  todayDay: number
  isA: boolean
}) {
  const days = useMemo(() => {
    const byDay = new Map<number, ChallengeEntryLocal>()
    for (const e of Object.values(challenge.entries)) {
      if (e.round === challenge.round) byDay.set(e.challengeDay, e)
    }
    return Array.from({ length: CHALLENGE_TOTAL_DAYS }, (_, i) => ({
      day: i + 1,
      entry: byDay.get(i + 1) ?? null,
    }))
  }, [challenge])

  return (
    <div
      className="grid grid-cols-5 gap-1.5"
      role="list"
      aria-label={isA ? 'Bảng 30 ngày thử thách' : '30-day challenge board'}
    >
      {days.map(({ day, entry }) => {
        const isToday = day === todayDay
        const done = !!entry
        const isFuture = day > todayDay
        return (
          <div
            key={day}
            role="listitem"
            aria-label={
              done
                ? `${isA ? 'Ngày' : 'Day'} ${day}: ${isA ? 'đã nộp' : 'submitted'}`
                : `${isA ? 'Ngày' : 'Day'} ${day}${isFuture ? (isA ? ' — chưa tới' : ' — upcoming') : ''}`
            }
            className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold border transition ${
              done
                ? 'bg-accent-500 text-black border-transparent'
                : isToday
                  ? 'bg-accent-500/15 border-accent-500/60 text-accent-300 theme-light:text-accent-800 animate-pulse'
                  : isFuture
                    ? 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
            }`}
          >
            {done ? <Check className="w-3.5 h-3.5" /> : day}
          </div>
        )
      })}
    </div>
  )
}

// ── Hàng huy hiệu mốc ──────────────────────────────────────────────────────────
function MilestoneRow({ earned, isA }: { earned: number[]; isA: boolean }) {
  const earnedSet = new Set(earned)
  return (
    <div className="flex justify-between gap-1">
      {CHALLENGE_MILESTONES.map((m) => {
        const has = earnedSet.has(m)
        const meta = MILESTONE_LABEL[m]
        return (
          <div key={m} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                has
                  ? 'bg-accent-500/20 border border-accent-500/50'
                  : 'bg-zinc-900/60 border border-zinc-800/60 opacity-40'
              }`}
            >
              {meta?.emoji}
            </span>
            <span className="text-[10px] text-zinc-400 text-center leading-tight truncate w-full">
              {isA ? meta?.vi : meta?.en}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Video/audio đã lưu local của 1 ngày (dùng cho màn tổng kết) ────────────────
function ChallengePlayback({ uid, day, label }: { uid: string; day: string; label: string }) {
  const [media, setMedia] = useState<{ url: string; kind: 'video' | 'audio' } | null | undefined>(
    undefined,
  )
  useEffect(() => {
    let alive = true
    let objectUrl: string | null = null
    getChallengeVideo(uid, day).then((v) => {
      if (!alive) return
      if (!v) {
        setMedia(null)
        return
      }
      objectUrl = URL.createObjectURL(v.blob)
      setMedia({ url: objectUrl, kind: v.mime.startsWith('audio') ? 'audio' : 'video' })
    })
    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [uid, day])

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-zinc-400 mb-1.5">{label}</p>
      {media === undefined ? (
        <div className="h-56 rounded-xl bg-zinc-900 animate-pulse" />
      ) : media === null ? (
        <div className="h-56 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center text-center px-2">
          <p className="text-[11px] text-zinc-400">Video không còn trên máy này</p>
        </div>
      ) : media.kind === 'video' ? (
        <video
          src={media.url}
          controls
          playsInline
          className="w-full max-h-56 rounded-xl bg-black"
        />
      ) : (
        <audio src={media.url} controls className="w-full" />
      )}
    </div>
  )
}

export default function Challenge() {
  const user = useAuth().user!
  const toast = useToast()
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  const uid = user.id

  const { isThrottled, throttle } = useApiThrottle()

  const [challenge, setChallenge] = useState<ChallengeState | null>(() => getChallenge(uid))
  const [syncedOnce, setSyncedOnce] = useState(false)

  // Kéo entries đã đồng bộ từ Supabase 1 lần khi vào trang — hợp nhất vào state local
  // (đổi máy không mất tiến độ). Lỗi mạng/chưa đăng nhập → bỏ qua êm, dùng bản local.
  useEffect(() => {
    let alive = true
    fetchChallengeEntriesCloud()
      .then((rows) => {
        if (!alive || !rows || rows.length === 0) return
        const forMerge = rows.map((r) => {
          const local = cloudChallengeToLocal(r)
          return {
            day: local.day,
            round: local.challengeRound ?? local.round ?? 1,
            challengeDay: local.challengeDay,
            topicDay: local.topicDay,
            transcript: local.transcript,
            feedback: local.feedback,
            durationSec: local.durationSec,
            wordCount: local.wordCount,
          }
        })
        const merged = mergeCloudEntries(uid, forMerge)
        if (merged) setChallenge(merged)
      })
      .catch(() => undefined)
      .finally(() => setSyncedOnce(true))
    return () => {
      alive = false
    }
  }, [uid])

  const todayStr = vnDateStr()
  const dayInfo = challenge ? getChallengeDay(challenge, todayStr) : null
  const todaysEntry = challenge ? entryForDay(challenge, todayStr) : null
  const topic = getTopicForDay(dayInfo?.day ?? 1)
  const earnedMilestones = challenge ? getEarnedMilestones(challenge) : []
  const isComplete = earnedMilestones.includes(CHALLENGE_TOTAL_DAYS)

  // Ngày 1 vs ngày 30 (video + nhịp nói) cho màn tổng kết khi hoàn thành 30 ngày.
  const completionStats = useMemo(() => {
    if (!challenge || !isComplete) return null
    const entries = Object.values(challenge.entries).filter((e) => e.round === challenge.round)
    const first = entries.reduce<ChallengeEntryLocal | null>(
      (min, e) => (!min || e.challengeDay < min.challengeDay ? e : min),
      null,
    )
    const last = entries.reduce<ChallengeEntryLocal | null>(
      (max, e) => (!max || e.challengeDay > max.challengeDay ? e : max),
      null,
    )
    if (!first || !last) return null
    return {
      first,
      last,
      totalEntries: entries.length,
      firstWpm: calcWpm(first.wordCount, first.durationSec),
      lastWpm: calcWpm(last.wordCount, last.durationSec),
    }
  }, [challenge, isComplete])

  // ── Ghi hình ──────────────────────────────────────────────────────────────
  const canRecord = isChallengeRecordingSupported()
  const [stage, setStage] = useState<Stage>('idle')
  const [reRecording, setReRecording] = useState(false)
  const [wantVideo, setWantVideo] = useState(true)
  const [countdown, setCountdown] = useState(3)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [recording, setRecording] = useState<ChallengeRecording | null>(null)
  const [typedText, setTypedText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [celebrateMilestone, setCelebrateMilestone] = useState<number | null>(null)

  const handleRef = useRef<ChallengeRecorderHandle | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const livePreviewRef = useRef<HTMLVideoElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const showRecordFlow = !todaysEntry || reRecording

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
      handleRef.current?.cancel()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Đếm ngược 3-2-1 rồi tự bắt đầu ghi.
  useEffect(() => {
    if (stage !== 'countdown') return
    if (countdown <= 0) {
      void beginRecording()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, countdown])

  // Gắn live stream vào <video> khi vừa có handle (đợi render xong).
  useEffect(() => {
    if (stage === 'recording' && handleRef.current && livePreviewRef.current) {
      livePreviewRef.current.srcObject = handleRef.current.stream
    }
  }, [stage])

  function startCountdown() {
    setSubmitError('')
    if (!canRecord) {
      setStage('typed')
      return
    }
    setCountdown(3)
    setStage('countdown')
  }

  async function beginRecording() {
    try {
      const handle = await startChallengeRecording({ video: wantVideo })
      handleRef.current = handle
      setStage('recording')
      setElapsedSec(0)
      haptics.start()
      timerRef.current = setInterval(() => {
        setElapsedSec((s) => {
          const next = s + 1
          if (next >= MAX_CHALLENGE_SEC) void stopRecording()
          return next
        })
      }, 1000)
    } catch (e) {
      if (e instanceof Error && e.message === CHALLENGE_ERR_PERMISSION && wantVideo) {
        // Bị từ chối quyền camera → tự động thử lại CHỈ ghi âm trước khi bỏ cuộc.
        setWantVideo(false)
        toast.info(
          isA
            ? 'Không có quyền camera — chuyển sang chỉ ghi âm.'
            : 'No camera permission — switching to audio-only.',
        )
        try {
          const handle = await startChallengeRecording({ video: false })
          handleRef.current = handle
          setStage('recording')
          setElapsedSec(0)
          timerRef.current = setInterval(() => {
            setElapsedSec((s) => {
              const next = s + 1
              if (next >= MAX_CHALLENGE_SEC) void stopRecording()
              return next
            })
          }, 1000)
          return
        } catch {
          setStage('typed')
          return
        }
      }
      setStage('typed')
    }
  }

  async function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const handle = handleRef.current
    if (!handle) return
    handleRef.current = null
    haptics.stop()
    const result = await handle.stop()
    const url = URL.createObjectURL(result.videoBlob ?? result.audioBlob)
    setPreviewUrl(url)
    setRecording(result)
    setStage('reviewing')
  }

  function discardRecording() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecording(null)
    setStage('idle')
    setElapsedSec(0)
  }

  async function submitEntry() {
    if (!challenge || !dayInfo || isThrottled) {
      if (isThrottled) toast.error(isA ? 'Chờ chút rồi thử lại...' : 'Please wait...')
      return
    }
    const usage = getUsage(uid)
    const isTyped = stage === 'typed'
    if (!isTyped && usage.sttCount >= LIMITS[user.plan].stt) {
      toast.error(
        isA
          ? 'Hết lượt nhận diện giọng nói hôm nay. Bạn có thể gõ tay thay vào.'
          : "You've used all speech-recognition turns today. You can type instead.",
      )
      return
    }
    if (usage.chatCount >= LIMITS[user.plan].chat) {
      toast.error(
        isA ? 'Hết lượt AI hôm nay. Thử lại ngày mai.' : "You've used all AI turns today.",
      )
      return
    }

    setStage('submitting')
    setSubmitError('')
    try {
      let transcript: string
      if (isTyped) {
        transcript = typedText.trim()
        if (!transcript)
          throw new Error(isA ? 'Hãy gõ vài câu trước đã.' : 'Type a few sentences first.')
      } else {
        if (!recording) throw new Error('missing recording')
        transcript = await transcribeChallengeAudio(
          recording.audioBlob,
          recording.audioMime,
          isA ? 'en' : 'vi',
        )
        incrementUsage(uid, 'sttCount')
      }

      const sys = challengeFeedbackSystemPrompt(transcript, topic, dir)
      const raw = await callClaude([], sys, 1024, 'chat')
      incrementUsage(uid, 'chatCount')
      throttle()
      const feedback = parseJson<ChallengeFeedback>(raw)

      const wordCount = countWords(transcript)
      const durationSec = isTyped ? 0 : (recording?.durationSec ?? 0)
      const beforeMilestones = getEarnedMilestones(challenge)
      const nextChallenge = saveEntry(uid, {
        day: todayStr,
        challengeDay: dayInfo.day,
        topicDay: topic.day,
        transcript,
        feedback: feedback ? JSON.stringify(feedback) : null,
        durationSec,
        wordCount,
      })
      setChallenge(nextChallenge)

      if (!isTyped && recording?.videoBlob) {
        await saveChallengeVideo(
          uid,
          todayStr,
          recording.videoBlob,
          recording.videoMime ?? 'video/webm',
        )
      }
      void pruneChallengeVideos(uid, getKeepDates(nextChallenge))
      void upsertChallengeEntryCloud({
        day: todayStr,
        challengeRound: nextChallenge.round,
        challengeDay: dayInfo.day,
        topicDay: topic.day,
        transcript,
        feedback: feedback ? JSON.stringify(feedback) : null,
        durationSec,
        wordCount,
      })

      const newMilestone = getNewMilestone(beforeMilestones, getEarnedMilestones(nextChallenge))
      haptics.success()
      if (newMilestone) setCelebrateMilestone(newMilestone)

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setRecording(null)
      setTypedText('')
      setReRecording(false)
      setStage('idle')
    } catch (e) {
      const m = e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error'
      setSubmitError(m)
      toast.error(m)
      setStage(isTyped ? 'typed' : recording ? 'reviewing' : 'idle')
    }
  }

  // ── Chưa bắt đầu thử thách ────────────────────────────────────────────────
  if (!challenge) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
          <PageHeader
            title={isA ? 'Challenge 1 phút — 30 ngày' : '1-Minute Challenge — 30 Days'}
            subtitle={
              isA
                ? 'Mỗi ngày quay 1 video ngắn kể về cuộc sống của bạn — AI nghe, khen và sửa lỗi.'
                : 'Record a short video about your life every day — AI listens, praises, and corrects.'
            }
          />
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-3 animate-fade-in">
            <p className="text-sm text-zinc-300">
              {isA
                ? 'Ban đầu khó lắm — nhưng chỉ sau vài ngày bạn sẽ thấy mình nói tự nhiên hơn hẳn.'
                : "It's hard at first — but within days you'll notice yourself speaking much more naturally."}
            </p>
            <ul className="text-xs text-zinc-400 space-y-1.5">
              {[
                isA
                  ? 'Video CHỈ lưu trên máy bạn — không tải lên máy chủ'
                  : 'Video stays ONLY on your device — never uploaded',
                isA
                  ? 'Mỗi ngày 1 chủ đề gợi ý, có thể nói tự do'
                  : 'A suggested topic each day — free to go off-topic',
                isA
                  ? 'AI khen + sửa 2-3 lỗi đáng nhất, không dội bom lỗi'
                  : 'AI praises + fixes the 2-3 most important errors, no overload',
              ].map((line) => (
                <li key={line} className="flex gap-1.5">
                  <span aria-hidden="true">•</span>
                  {line}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setChallenge(startChallenge(uid))}
              className="w-full mt-2 py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition active:scale-[0.98]"
            >
              {isA ? '🎬 Bắt đầu thử thách 30 ngày' : '🎬 Start the 30-day challenge'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Thử thách đã đứt: cho chọn tiếp tục hoặc bắt đầu lại ─────────────────────
  if (dayInfo?.isBroken) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
          <PageHeader title={isA ? 'Chuỗi bị gián đoạn' : 'Streak interrupted'} />
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 space-y-4 text-center animate-fade-in">
            <p className="text-4xl">😅</p>
            <p className="text-sm text-zinc-300">
              {isA
                ? 'Bạn đã lỡ quá số ngày nghỉ cho phép. Không sao — chọn cách bạn muốn tiếp tục nhé.'
                : "You've missed more days than allowed. No worries — choose how you'd like to continue."}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setChallenge(resumeChallenge(uid))}
                className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
              >
                {isA ? 'Tiếp tục từ ngày đã đến' : 'Continue where I left off'}
              </button>
              <button
                onClick={() => setChallenge(restartChallenge(uid))}
                className="w-full py-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:border-zinc-600 transition"
              >
                {isA ? 'Bắt đầu lại từ ngày 1' : 'Start over from day 1'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const parsedFeedback: ChallengeFeedback | null =
    todaysEntry?.feedback && !reRecording
      ? parseJson<ChallengeFeedback>(todaysEntry.feedback)
      : null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      {celebrateMilestone != null && (
        <Celebration
          icon={MILESTONE_LABEL[celebrateMilestone]?.emoji ?? '🎉'}
          title={
            isA
              ? `Ngày ${celebrateMilestone} — ${MILESTONE_LABEL[celebrateMilestone]?.vi}!`
              : `Day ${celebrateMilestone} — ${MILESTONE_LABEL[celebrateMilestone]?.en}!`
          }
          subtitle={isA ? 'Tiếp tục phát huy nhé!' : 'Keep it up!'}
          ctaLabel={isA ? 'Tiếp tục' : 'Continue'}
          onDone={() => setCelebrateMilestone(null)}
        />
      )}

      <main className="max-w-lg mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <PageHeader
          title={isA ? 'Challenge 1 phút — 30 ngày' : '1-Minute Challenge — 30 Days'}
          subtitle={
            isA
              ? `Vòng ${challenge.round} · Ngày ${dayInfo?.day}/${CHALLENGE_TOTAL_DAYS}${syncedOnce ? '' : ' · đang đồng bộ...'}`
              : `Round ${challenge.round} · Day ${dayInfo?.day}/${CHALLENGE_TOTAL_DAYS}${syncedOnce ? '' : ' · syncing...'}`
          }
        />

        <ChallengeBoard challenge={challenge} todayDay={dayInfo?.day ?? 1} isA={isA} />
        <MilestoneRow earned={earnedMilestones} isA={isA} />

        {isComplete && completionStats && !showRecordFlow && (
          <div className="bg-accent-500/10 border border-accent-500/30 rounded-2xl p-4 text-center space-y-3">
            <Trophy className="w-8 h-8 text-accent-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              {isA ? 'Bạn đã hoàn thành 30 ngày!' : "You've completed 30 days!"}
            </p>
            <p className="text-xs text-zinc-400">
              {isA
                ? `${completionStats.totalEntries} challenge đã nộp · nhịp nói ${completionStats.firstWpm} → ${completionStats.lastWpm} từ/phút`
                : `${completionStats.totalEntries} challenges submitted · pace ${completionStats.firstWpm} → ${completionStats.lastWpm} wpm`}
            </p>
            <div className="flex gap-3 text-left">
              <ChallengePlayback
                uid={uid}
                day={completionStats.first.day}
                label={isA ? 'Ngày 1' : 'Day 1'}
              />
              <ChallengePlayback
                uid={uid}
                day={completionStats.last.day}
                label={isA ? 'Ngày 30' : 'Day 30'}
              />
            </div>
            <button
              onClick={() => setChallenge(startChallenge(uid))}
              className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
            >
              {isA ? '🔁 Bắt đầu vòng mới' : '🔁 Start a new round'}
            </button>
          </div>
        )}

        {!showRecordFlow && todaysEntry && (
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Check className="w-4 h-4 text-accent-400" />
              {isA ? 'Đã nộp challenge hôm nay!' : "Today's challenge submitted!"}
            </p>
            {parsedFeedback ? (
              <div className="space-y-2.5">
                <p className="text-sm text-accent-300 theme-light:text-accent-800">
                  {parsedFeedback.praise}
                </p>
                {parsedFeedback.corrections.map((c, i) => (
                  <div
                    key={i}
                    className="bg-amber-500/8 border border-amber-500/20 border-l-2 border-l-amber-400 rounded-r-xl px-3 py-2 text-xs"
                  >
                    <p className="text-zinc-400 line-through">{c.original}</p>
                    <p className="text-amber-200 theme-light:text-amber-800 mt-0.5">→ {c.better}</p>
                    <p className="text-zinc-400 mt-0.5">{c.explain}</p>
                  </div>
                ))}
                <p className="text-xs text-sky-300 theme-light:text-sky-800">
                  💡 {parsedFeedback.upgrade}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                {isA
                  ? 'Chưa có nhận xét AI (có thể do lỗi tạm thời) — challenge vẫn được tính.'
                  : 'No AI feedback yet (possibly a temporary error) — your challenge still counts.'}
              </p>
            )}
            <button
              onClick={() => setReRecording(true)}
              className="tap-44 w-full py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300 hover:border-zinc-600 transition"
            >
              {isA ? 'Quay lại challenge hôm nay' : "Re-record today's challenge"}
            </button>
          </div>
        )}

        {showRecordFlow && (
          <div className="space-y-4">
            <TopicCard topic={topic} isA={isA} />

            {stage === 'idle' && (
              <div className="flex flex-col items-center gap-3">
                {canRecord && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWantVideo(true)}
                      className={`tap-44 px-3 py-2 rounded-xl text-xs font-medium border transition ${wantVideo ? 'bg-accent-500/15 border-accent-500/50 text-accent-300 theme-light:text-accent-800' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      <Video className="w-3.5 h-3.5 inline mr-1" />
                      {isA ? 'Quay video' : 'Record video'}
                    </button>
                    <button
                      onClick={() => setWantVideo(false)}
                      className={`tap-44 px-3 py-2 rounded-xl text-xs font-medium border transition ${!wantVideo ? 'bg-accent-500/15 border-accent-500/50 text-accent-300 theme-light:text-accent-800' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      <Mic className="w-3.5 h-3.5 inline mr-1" />
                      {isA ? 'Chỉ ghi âm' : 'Audio only'}
                    </button>
                  </div>
                )}
                <button
                  onClick={startCountdown}
                  aria-label={isA ? 'Bắt đầu quay challenge' : 'Start recording challenge'}
                  className="tap-44 w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-500 shadow-xl shadow-rose-500/30 flex items-center justify-center active:scale-95 transition"
                >
                  {wantVideo && canRecord ? (
                    <Video className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                <p className="text-xs text-zinc-400 text-center">
                  {canRecord
                    ? isA
                      ? `Tối đa ${MAX_CHALLENGE_SEC}s, tối thiểu ${MIN_CHALLENGE_SEC}s`
                      : `Up to ${MAX_CHALLENGE_SEC}s, at least ${MIN_CHALLENGE_SEC}s`
                    : isA
                      ? 'Trình duyệt không hỗ trợ ghi hình — gõ tay bên dưới.'
                      : "Browser doesn't support recording — type below instead."}
                </p>
                {canRecord && (
                  <button
                    onClick={() => setStage('typed')}
                    className="tap-44 text-xs text-zinc-400 hover:text-zinc-300 underline flex items-center gap-1"
                  >
                    <Type className="w-3 h-3" />
                    {isA ? 'Không quay được? Gõ thay' : "Can't record? Type instead"}
                  </button>
                )}
              </div>
            )}

            {stage === 'countdown' && (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-6xl font-bold text-white animate-scale-in" key={countdown}>
                  {countdown > 0 ? countdown : '🎬'}
                </p>
              </div>
            )}

            {stage === 'recording' && (
              <div className="flex flex-col items-center gap-3">
                {wantVideo ? (
                  <video
                    ref={livePreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full max-h-72 rounded-2xl bg-black"
                  />
                ) : (
                  <div className="w-full h-40 rounded-2xl bg-zinc-900 border border-red-500/30 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-red-400 animate-pulse" />
                  </div>
                )}
                <p className="text-sm text-red-400 theme-light:text-red-700 font-mono">
                  🔴 {elapsedSec}s / {MAX_CHALLENGE_SEC}s
                </p>
                <button
                  onClick={() => void stopRecording()}
                  disabled={elapsedSec < MIN_CHALLENGE_SEC}
                  aria-label={isA ? 'Dừng quay' : 'Stop recording'}
                  className="tap-44 w-16 h-16 rounded-full bg-red-500 disabled:opacity-40 flex items-center justify-center active:scale-95 transition"
                >
                  <Square className="w-6 h-6 text-white fill-current" />
                </button>
                {elapsedSec < MIN_CHALLENGE_SEC && (
                  <p className="text-[11px] text-zinc-400">
                    {isA
                      ? `Nói thêm ${MIN_CHALLENGE_SEC - elapsedSec}s nữa mới dừng được`
                      : `${MIN_CHALLENGE_SEC - elapsedSec}s more before you can stop`}
                  </p>
                )}
              </div>
            )}

            {stage === 'reviewing' && recording && (
              <div className="flex flex-col items-center gap-3">
                {recording.videoBlob && previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full max-h-72 rounded-2xl bg-black"
                  />
                ) : previewUrl ? (
                  <audio src={previewUrl} controls className="w-full" />
                ) : null}
                <p className="text-xs text-zinc-400">
                  {isA ? `${recording.durationSec}s đã ghi` : `${recording.durationSec}s recorded`}
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={discardRecording}
                    className="tap-44 flex-1 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isA ? 'Quay lại' : 'Retake'}
                  </button>
                  <button
                    onClick={() => void submitEntry()}
                    className="tap-44 flex-1 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-4 h-4" />
                    {isA ? 'Nộp challenge' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {stage === 'typed' && (
              <div className="space-y-2">
                <textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  rows={5}
                  placeholder={
                    isA
                      ? 'Gõ những gì bạn định nói trong challenge hôm nay...'
                      : "Type what you'd say in today's challenge..."
                  }
                  className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-zinc-400 outline-none focus:border-accent-500/60 transition resize-none"
                />
                <div className="flex gap-2">
                  {canRecord && (
                    <button
                      onClick={() => setStage('idle')}
                      className="tap-44 py-3 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 transition"
                    >
                      {isA ? 'Quay video thay' : 'Record instead'}
                    </button>
                  )}
                  <button
                    onClick={() => void submitEntry()}
                    disabled={!typedText.trim()}
                    className="tap-44 flex-1 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 disabled:opacity-40 text-black font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-4 h-4" />
                    {isA ? 'Nộp challenge' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {stage === 'submitting' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <span className="w-8 h-8 border-2 border-zinc-700 border-t-accent-400 rounded-full animate-spin" />
                <p className="text-xs text-zinc-400">
                  {isA
                    ? 'Đang nhận diện & chấm challenge của bạn...'
                    : 'Transcribing & grading your challenge...'}
                </p>
              </div>
            )}

            {submitError && (
              <p className="text-center text-xs text-red-400 theme-light:text-red-700 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {submitError}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
