import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, PenLine, Mic, ChevronRight, Crown, BookOpen, GraduationCap, MessagesSquare, ArrowLeftRight, History, Target, Share2, ClipboardList, Bell, BellOff } from 'lucide-react'
// Quiz hiện nằm trong tab "Kiểm tra" của /learn
import Layout from '../components/Layout'
import { getStreak, getDirection, setDirection } from '../lib/storage'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'
import type { Direction } from '../types'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { useCloudSync } from '../lib/useCloudSync'
import ShareProgress from '../components/ShareProgress'
import { isPushSupported, getNotifPermission, subscribePush, unsubscribePush } from '../lib/pushNotif'
import { supabase } from '../lib/supabase'

// ── Nội dung cards theo chiều học và ngôn ngữ giao diện ──────────────────────
function getModes(dir: Direction, T: ReturnType<typeof useLang>['T']) {
  const isA = dir === 'A'
  return [
    {
      path: '/dictionary',
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-500/20',
      ring: 'hover:border-amber-500/40',
      tag: { label: T.tagUnlimited, cls: 'bg-amber-500/15 text-amber-300 border border-amber-500/20' },
      title: isA ? T.dictTitleA : T.dictTitleB,
      desc:  isA ? T.dictDescA  : T.dictDescB,
    },
    {
      path: '/learn',
      icon: Target,
      gradient: 'from-lime-500 to-green-400',
      glow: 'shadow-lime-500/20',
      ring: 'hover:border-lime-500/40',
      tag: { label: isA ? '20 từ/ngày' : '20/day', cls: 'bg-lime-500/15 text-lime-300 border border-lime-500/20' },
      title: isA ? 'Học theo lộ trình' : 'Learning Path',
      desc: isA
        ? 'Bắt đầu từ chữ cái, số... mỗi ngày 20 từ mới theo vòng tròn liên quan, kèm câu thông dụng.'
        : 'Start from letters and numbers — 20 new words a day in related circles, with common sentences.',
    },
    {
      path: '/lessons',
      icon: GraduationCap,
      gradient: 'from-rose-500 to-pink-400',
      glow: 'shadow-rose-500/20',
      ring: 'hover:border-rose-500/40',
      tag: { label: T.tagUnlimited, cls: 'bg-rose-500/15 text-rose-300 border border-rose-500/20' },
      title: isA ? T.lessonsTitleA : T.lessonsTitleB,
      desc:  isA ? T.lessonsDescA  : T.lessonsDescB,
    },
    {
      path: '/phrases',
      icon: MessagesSquare,
      gradient: 'from-teal-500 to-emerald-400',
      glow: 'shadow-teal-500/20',
      ring: 'hover:border-teal-500/40',
      tag: { label: T.tagUnlimited, cls: 'bg-teal-500/15 text-teal-300 border border-teal-500/20' },
      title: isA ? T.phrasesTitleA : T.phrasesTitleB,
      desc:  isA ? T.phrasesDescA  : T.phrasesDescB,
    },
    {
      path: '/chat',
      icon: MessageCircle,
      gradient: 'from-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/20',
      ring: 'hover:border-emerald-500/40',
      tag: { label: T.tagPopular, cls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' },
      title: isA ? T.chatTitleA : T.chatTitleB,
      desc:  isA ? T.chatDescA  : T.chatDescB,
    },
    {
      path: '/speaking',
      icon: Mic,
      gradient: 'from-sky-500 to-cyan-400',
      glow: 'shadow-sky-500/20',
      ring: 'hover:border-sky-500/40',
      tag: { label: T.tagKeyFeature, cls: 'bg-sky-500/15 text-sky-300 border border-sky-500/20' },
      title: isA ? T.speakTitleA : T.speakTitleB,
      desc:  isA ? T.speakDescA  : T.speakDescB,
    },
    {
      path: '/writing',
      icon: PenLine,
      gradient: 'from-violet-500 to-purple-400',
      glow: 'shadow-violet-500/20',
      ring: 'hover:border-violet-500/40',
      tag: { label: 'IELTS', cls: 'bg-violet-500/15 text-violet-300 border border-violet-500/20' },
      title: isA ? T.writeTitleA : T.writeTitleB,
      desc:  isA ? T.writeDescA  : T.writeDescB,
    },
  ]
}

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T, setLang } = useLang()
  useCloudSync(user?.id)   // kéo lượt dùng từ Supabase khi mở trang chủ

  const [dir, setDir]           = useState<Direction>(getDirection)
  const [voice, setVoice]       = useState<Voice>(getVoicePref)
  const [showShare, setShare]   = useState(false)
  const [pushOn, setPushOn]     = useState(false)
  const [pushLoading, setPushL] = useState(false)

  // Kiểm tra push subscription hiện tại
  useEffect(() => {
    if (!isPushSupported()) return
    const perm = getNotifPermission()
    setPushOn(perm === 'granted')
  }, [])

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  const streak = getStreak(user.id)

  function toggleDir() {
    const next: Direction = dir === 'A' ? 'B' : 'A'
    setDirection(next)
    setDir(next)
    setLang(next === 'A' ? 'vi' : 'en')
  }

  function chooseVoice(v: Voice) {
    setVoice(v)
    setVoicePref(v)
  }

  // Bấm cả khối để đổi giọng Nữ ↔ Nam (giống ô Ngôn ngữ học)
  function toggleVoice() {
    chooseVoice(voice === 'female' ? 'male' : 'female')
  }

  async function togglePush() {
    if (!user || pushLoading) return
    setPushL(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? ''
    if (pushOn) {
      await unsubscribePush(token)
      setPushOn(false)
    } else {
      const ok = await subscribePush(token)
      setPushOn(ok)
    }
    setPushL(false)
  }

  const MODES = getModes(dir, T)
  const isA = dir === 'A'

  const firstName = user.name.split(' ').at(-1) ?? user.name

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={T.greeting(firstName)} back={false} />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Greeting + streak ──────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between animate-fade-in gap-3">
          <p className="text-zinc-500 text-sm">{T.todayPractice}</p>

          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-xl px-3 py-2 shrink-0">
              <span className="text-xl leading-none">🔥</span>
              <div className="leading-none">
                <p className="text-base font-bold text-orange-400">{streak}</p>
                <p className="text-[10px] text-orange-400/60 mt-0.5">{T.streakDays}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Chọn chiều học + giọng đọc (cùng hàng, khối rộng) ──────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 animate-fade-in">

          {/* Khối chọn chiều học — nhấn cả khối để toggle */}
          <button
            onClick={toggleDir}
            title={isA ? T.toggleDirTitleA : T.toggleDirTitleB}
            className={`flex flex-col items-start gap-1.5 rounded-2xl px-4 py-3 border transition-all active:scale-[0.98] ${
              isA
                ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                : 'bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60'
            }`}
          >
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
              {isA ? 'Ngôn ngữ học' : 'Language'}
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className={`w-3.5 h-3.5 ${isA ? 'text-emerald-400' : 'text-sky-400'}`} />
              <span className={`text-sm font-semibold ${isA ? 'text-emerald-300' : 'text-sky-300'}`}>
                {isA ? '🇻🇳 Việt → 🇺🇸 Anh' : '🇺🇸 Anh → 🇻🇳 Việt'}
              </span>
            </div>
          </button>

          {/* Khối chọn giọng đọc — nhấn cả khối để đổi Nữ ↔ Nam */}
          <button
            type="button"
            onClick={toggleVoice}
            title={isA ? 'Nhấn để đổi giọng đọc' : 'Tap to switch voice'}
            className="flex flex-col items-start gap-1.5 rounded-2xl px-4 py-3 border bg-zinc-900/80 border-zinc-700/60 hover:border-zinc-600 transition-all active:scale-[0.98]"
          >
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
              {isA ? 'Giọng đọc' : 'Voice'}
            </span>
            <div className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-200">
                {voice === 'female' ? (isA ? 'Nữ' : 'Female') : (isA ? 'Nam' : 'Male')}
              </span>
            </div>
          </button>

        </div>

        {/* ── Usage card — TẠM ẨN, tích hợp thanh toán Pro sau ────────── */}
        {/* TODO: hiện lại khi có cổng thanh toán nâng cấp gói Pro */}
        {false && user?.plan === 'pro' && (
          <div className="mb-6 rounded-2xl p-4 border animate-fade-in delay-50 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/30">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{T.planPro}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{T.unlimited}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Hành động nhanh (lịch sử + quiz + chia sẻ + thông báo) ──────── */}
        <div className="mb-4 space-y-2 animate-fade-in">
          {/* Lịch sử */}
          <button onClick={() => nav('/history')}
            className="w-full bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl px-4 py-3 flex items-center gap-3 transition group">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition">
              <History className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition flex-1 text-left">
              {isA ? 'Xem lịch sử học' : 'View learning history'}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
          </button>

          {/* Hàng ngang: Quiz + Chia sẻ + Thông báo */}
          <div className="grid grid-cols-3 gap-2">
            {/* Quiz — mở trang Học theo lộ trình, tab Kiểm tra */}
            <button onClick={() => nav('/learn')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-violet-500/40 transition group">
              <ClipboardList className="w-4 h-4 text-violet-400" />
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition">
                {isA ? 'Kiểm tra' : 'Quiz'}
              </span>
            </button>

            {/* Chia sẻ tiến độ */}
            <button onClick={() => setShare(true)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-emerald-500/40 transition group">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition">
                {isA ? 'Chia sẻ' : 'Share'}
              </span>
            </button>

            {/* Bật / tắt thông báo nhắc học */}
            {isPushSupported() && (
              <button onClick={togglePush} disabled={pushLoading}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition group ${
                  pushOn
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-zinc-900/60 border-zinc-800/60 hover:border-amber-500/30'
                }`}>
                {pushOn
                  ? <Bell className="w-4 h-4 text-amber-400" />
                  : <BellOff className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition" />}
                <span className={`text-[11px] transition ${pushOn ? 'text-amber-300' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {pushLoading ? '...' : pushOn ? (isA ? 'Nhắc bật' : 'Notif on') : (isA ? 'Nhắc tắt' : 'Notif off')}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Modal chia sẻ tiến độ */}
        {showShare && user && (
          <ShareProgress userId={user.id} isA={isA} onClose={() => setShare(false)} />
        )}

        {/* ── Mode cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {MODES.map((m, i) => {
            const Icon = m.icon
            return (
              <button key={m.path} onClick={() => nav(m.path)}
                className={`w-full bg-zinc-900/80 border border-zinc-800/80 ${m.ring} rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-[0.99] animate-fade-up`}
                style={{ animationDelay: `${100 + i * 60}ms` }}>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-lg ${m.glow} transition-transform group-hover:scale-105`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white text-[15px]">{m.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.tag.cls}`}>
                      {m.tag.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{m.desc}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-all group-hover:translate-x-0.5" />
              </button>
            )
          })}
        </div>

        {/* ── Tip ──────────────────────────────────────────────────────── */}
        <div className="mt-6 glass rounded-xl p-4 text-xs text-zinc-500 animate-fade-in delay-400">
          <strong className="text-zinc-400">{T.tip}</strong>{' '}
          {T.tipBody(
            `<strong class="text-teal-400">${T.tipPhrases}</strong>`,
            `<strong class="text-sky-400">${T.tipSpeaking}</strong>`,
          ).split(/(<strong[^>]*>.*?<\/strong>)/g).map((part, idx) => {
            if (part.startsWith('<strong')) {
              const color = part.includes('teal') ? 'text-teal-400' : 'text-sky-400'
              const text = part.replace(/<[^>]+>/g, '')
              return <strong key={idx} className={color}>{text}</strong>
            }
            return part
          })}
        </div>
      </main>
    </div>
  )
}
