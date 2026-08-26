// apps/dhcb/src/pages/core/LiveLocation.tsx — "Đi chung": chia sẻ vị trí thời gian thực với bạn
// bè trong một chuyến đi chơi, để không ai bị lạc.
//
// Nguyên tắc giao diện: công tắc chia sẻ luôn nhìn thấy được và LUÔN mặc định TẮT — người dùng
// phải chủ động bật, và bấm tắt là dừng ngay lập tức (server xoá vị trí, xem migration 0068).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Navigation,
  Copy,
  Check,
  LogOut,
  Radio,
  RadioTower,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flag,
} from 'lucide-react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import LiveMap from '../../components/location/LiveMap'
import { useToast } from '@core/ToastProvider'
import { useAuth } from '../../context/useAuth'
import { distanceMeters, findStragglers, groupCenter } from '@dhcb/core-location/geo'
import {
  LocationSocket,
  buildDirectionsUrl,
  buildInviteUrl,
  createSession,
  fetchMySessions,
  fetchSessionState,
  joinSession,
  leaveSession,
  setSharing,
  updateSession,
  watchMyPosition,
  type MemberPosition,
  type SessionState,
  type SessionSummary,
  type WatchHandle,
} from '../../lib/locationShare'

const DURATIONS: { value: 60 | 240 | 480; label: string }[] = [
  { value: 60, label: '1 giờ' },
  { value: 240, label: '4 giờ' },
  { value: 480, label: '8 giờ' },
]

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

function formatAgo(iso: string | null): string {
  if (!iso) return 'chưa chia sẻ'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds} giây trước`
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút trước`
  return `${Math.round(seconds / 3600)} giờ trước`
}

function formatRemaining(expiresAt: string): string {
  const minutes = Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000)
  if (minutes <= 0) return 'đã hết hạn'
  if (minutes < 60) return `còn ${minutes} phút`
  return `còn ${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
}

export default function LiveLocation() {
  const toast = useToast()
  const { user } = useAuth()
  const { code: codeFromUrl } = useParams<{ code?: string }>()

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [state, setState] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [transport, setTransport] = useState<'websocket' | 'polling'>('polling')
  const [copied, setCopied] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDuration, setNewDuration] = useState<60 | 240 | 480>(240)
  const [joinCode, setJoinCode] = useState('')

  const socketRef = useRef<LocationSocket | null>(null)
  const watchRef = useRef<WatchHandle | null>(null)

  const myUserId = user?.id ?? ''
  const me = useMemo(
    () => state?.members.find((m) => m.userId === myUserId) ?? null,
    [state, myUserId],
  )
  const sharing = !!me?.sharingEnabled

  // ── Nạp danh sách chuyến + vào thẳng chuyến nếu mở bằng link mời ────────────────────────
  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      if (codeFromUrl) {
        const joined = await joinSession(codeFromUrl)
        if (!cancelled && joined) setState(joined)
        else if (!cancelled) toast.error('Mã mời không dùng được (sai mã hoặc chuyến đã kết thúc)')
      }
      const list = await fetchMySessions()
      if (cancelled) return
      setSessions(list)
      setLoading(false)
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [codeFromUrl, toast])

  // ── Kết nối thời gian thực khi đang mở một chuyến ───────────────────────────────────────
  useEffect(() => {
    const sessionId = state?.sessionId
    if (!sessionId) return

    const socket = new LocationSocket(sessionId, {
      onState: (next) => setState(next),
      onMemberPosition: (member: MemberPosition) =>
        setState((prev) =>
          prev && prev.sessionId === sessionId
            ? {
                ...prev,
                members: prev.members.some((m) => m.userId === member.userId)
                  ? prev.members.map((m) => (m.userId === member.userId ? member : m))
                  : [...prev.members, member],
              }
            : prev,
        ),
      onMemberLeft: (userId) =>
        setState((prev) =>
          prev ? { ...prev, members: prev.members.filter((m) => m.userId !== userId) } : prev,
        ),
      onSessionEnded: () => {
        setState(null)
        toast.info('Chuyến đã kết thúc — vị trí của mọi người đã được xoá')
      },
      onTransportChange: setTransport,
    })
    socket.connect()
    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [state?.sessionId, toast])

  // ── Bật/tắt GPS theo đúng công tắc chia sẻ ──────────────────────────────────────────────
  // Tắt chia sẻ mà vẫn để watchPosition chạy là vừa tốn pin vừa sai lời hứa riêng tư.
  useEffect(() => {
    if (!sharing || !state?.sessionId) {
      watchRef.current?.stop()
      watchRef.current = null
      return
    }
    if (watchRef.current) return
    watchRef.current = watchMyPosition(
      (position) => socketRef.current?.sendPosition(position),
      (message) => toast.error(message),
    )
    return () => {
      watchRef.current?.stop()
      watchRef.current = null
    }
  }, [sharing, state?.sessionId, toast])

  // ── Khoảng cách + cảnh báo lạc ──────────────────────────────────────────────────────────
  const myPosition = me?.position ?? null
  const anchor = useMemo(() => {
    if (state?.meetPoint) return { lat: state.meetPoint.lat, lng: state.meetPoint.lng }
    const points = (state?.members ?? []).flatMap((m) => (m.position ? [m.position] : []))
    return groupCenter(points)
  }, [state])

  const stragglers = useMemo(
    () =>
      findStragglers(
        (state?.members ?? []).map((m) => ({ userId: m.userId, position: m.position })),
        anchor,
        state?.alertRadiusM ?? 300,
      ),
    [state, anchor],
  )

  const refresh = useCallback(async (sessionId: string) => {
    const next = await fetchSessionState(sessionId)
    if (next) setState(next)
  }, [])

  // ── Hành động ───────────────────────────────────────────────────────────────────────────
  async function handleCreate() {
    const name = newName.trim()
    if (!name) {
      toast.error('Đặt tên cho chuyến đi đã nhé')
      return
    }
    const created = await createSession(name, newDuration)
    if (!created) {
      toast.error('Không tạo được chuyến — thử lại sau')
      return
    }
    setNewName('')
    setState(created)
    toast.success(`Đã tạo chuyến "${created.name}" — chia sẻ mã ${created.inviteCode} cho bạn bè`)
  }

  async function handleJoin() {
    const joined = await joinSession(joinCode)
    if (!joined) {
      toast.error('Mã mời không dùng được')
      return
    }
    setJoinCode('')
    setState(joined)
  }

  async function toggleSharing() {
    if (!state) return
    const next = await setSharing(state.sessionId, { sharingEnabled: !sharing })
    if (!next) {
      toast.error('Không đổi được trạng thái chia sẻ')
      return
    }
    setState(next)
    toast.success(
      sharing
        ? 'Đã TẮT chia sẻ — vị trí của bạn đã được xoá khỏi máy chủ'
        : 'Đang chia sẻ vị trí với mọi người trong chuyến',
    )
  }

  async function togglePrecision() {
    if (!state || !me) return
    const next = await setSharing(state.sessionId, {
      precisionMode: me.precisionMode === 'exact' ? 'approx' : 'exact',
    })
    if (next) setState(next)
  }

  async function setMeetPointHere() {
    if (!state || !myPosition) {
      toast.error('Cần bật chia sẻ vị trí trước để lấy chỗ bạn đang đứng')
      return
    }
    const next = await updateSession(state.sessionId, {
      meetPoint: { lat: myPosition.lat, lng: myPosition.lng, label: 'Điểm hẹn' },
    })
    if (next) {
      setState(next)
      toast.success('Đã đặt điểm hẹn tại chỗ bạn đang đứng')
    } else toast.error('Chỉ chủ chuyến mới đặt được điểm hẹn')
  }

  async function handleExtend() {
    if (!state) return
    const next = await updateSession(state.sessionId, { extendMinutes: 60 })
    if (next) {
      setState(next)
      toast.success('Đã gia hạn thêm 1 giờ')
    } else toast.error('Chỉ chủ chuyến mới gia hạn được')
  }

  async function handleEnd() {
    if (!state) return
    // updateSession(end) trả về null vì server không gửi kèm state của chuyến đã kết thúc —
    // dựa vào việc màn hình quay lại danh sách để biết đã xong.
    await updateSession(state.sessionId, { end: true })
    setState(null)
    setSessions(await fetchMySessions())
    toast.success('Đã kết thúc chuyến — vị trí của mọi người đã xoá')
  }

  async function handleLeave() {
    if (!state) return
    await leaveSession(state.sessionId)
    setState(null)
    setSessions(await fetchMySessions())
    toast.success('Bạn đã rời chuyến, vị trí của bạn đã được xoá')
  }

  function copyInvite() {
    if (!state) return
    void navigator.clipboard.writeText(buildInviteUrl(state.inviteCode)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Giao diện ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        <PageHeader
          title="Đi chung"
          subtitle="Chia sẻ vị trí thời gian thực với bạn bè khi đi chơi chung — bật/tắt lúc nào cũng được"
        />

        {loading ? (
          <p className="text-zinc-300">Đang tải…</p>
        ) : !state ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 p-4">
              <h2 className="mb-3 text-lg font-bold text-white">Tạo chuyến mới</h2>
              <label className="mb-2 block text-sm text-zinc-300" htmlFor="trip-name">
                Tên chuyến (ví dụ: Đi cà phê Bờ Hồ)
              </label>
              <input
                id="trip-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={80}
                className="mb-3 w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-[16px] text-white"
              />
              <fieldset className="mb-3">
                <legend className="mb-2 text-sm text-zinc-300">
                  Tự tắt sau (không có chế độ chia sẻ vĩnh viễn)
                </legend>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setNewDuration(d.value)}
                      aria-pressed={newDuration === d.value}
                      className={`min-h-[44px] rounded-lg px-4 text-sm ${
                        newDuration === d.value
                          ? 'bg-accent-500 text-[#fff]'
                          : 'border border-white/15 text-zinc-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                onClick={() => void handleCreate()}
                className="min-h-[44px] rounded-lg bg-accent-500 px-5 font-semibold text-[#fff]"
              >
                Tạo chuyến
              </button>
            </section>

            <section className="rounded-xl border border-white/10 p-4">
              <h2 className="mb-3 text-lg font-bold text-white">Vào chuyến bằng mã mời</h2>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="invite-code">
                  Mã mời
                </label>
                <input
                  id="invite-code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="VD: K7M2QP"
                  className="flex-1 rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-[16px] uppercase text-white"
                />
                <button
                  type="button"
                  onClick={() => void handleJoin()}
                  className="min-h-[44px] rounded-lg border border-white/15 px-4 text-zinc-100"
                >
                  Vào chuyến
                </button>
              </div>
            </section>

            {sessions.length > 0 && (
              <section className="rounded-xl border border-white/10 p-4">
                <h2 className="mb-3 text-lg font-bold text-white">Chuyến đang mở của bạn</h2>
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li key={s.sessionId}>
                      <button
                        type="button"
                        onClick={() => void refresh(s.sessionId)}
                        className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-white/10 px-3 text-left text-zinc-100"
                      >
                        <span>
                          {s.name}{' '}
                          <span className="text-sm text-zinc-300">· {s.memberCount} người</span>
                        </span>
                        <span className="text-sm text-zinc-300">
                          {formatRemaining(s.expiresAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Công tắc chia sẻ — luôn ở trên cùng, không bao giờ giấu trong menu con */}
            <section className="rounded-xl border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{state.name}</h2>
                  <p className="text-sm text-zinc-300">
                    <Clock className="mr-1 inline h-4 w-4" aria-hidden="true" />
                    {formatRemaining(state.expiresAt)} · mã mời{' '}
                    <strong className="tracking-widest">{state.inviteCode}</strong> ·{' '}
                    {transport === 'websocket' ? 'cập nhật tức thì' : 'cập nhật mỗi vài giây'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleSharing()}
                  aria-pressed={sharing}
                  className={`flex min-h-[44px] items-center gap-2 rounded-lg px-5 font-semibold ${
                    sharing ? 'bg-accent-500 text-[#fff]' : 'border border-white/20 text-zinc-100'
                  }`}
                >
                  {sharing ? (
                    <RadioTower className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Radio className="h-5 w-5" aria-hidden="true" />
                  )}
                  {sharing ? 'Đang chia sẻ — bấm để TẮT' : 'BẬT chia sẻ vị trí'}
                </button>
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                <ShieldCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />
                Tắt chia sẻ là vị trí của bạn bị xoá khỏi máy chủ ngay. Ứng dụng không lưu lịch sử
                hành trình.
              </p>
            </section>

            {stragglers.length > 0 && (
              <section
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4"
                role="status"
              >
                <h2 className="flex items-center gap-2 font-bold text-amber-100">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  Có người đang cách xa nhóm
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-amber-50">
                  {stragglers.map((s) => {
                    const member = state.members.find((m) => m.userId === s.userId)
                    return (
                      <li key={s.userId}>
                        {member?.name ?? 'Ai đó'} cách điểm chung {formatDistance(s.distanceM)}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            <LiveMap members={state.members} meetPoint={state.meetPoint} myUserId={myUserId} />

            <section className="rounded-xl border border-white/10 p-4">
              <h2 className="mb-3 text-lg font-bold text-white">Mọi người trong chuyến</h2>
              <ul className="space-y-3">
                {state.members.map((member) => {
                  const distance =
                    myPosition && member.position && member.userId !== myUserId
                      ? distanceMeters(myPosition, member.position)
                      : null
                  return (
                    <li
                      key={member.userId}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {member.name}
                          {member.userId === myUserId && ' (bạn)'}
                          {member.isOwner && (
                            <span className="ml-2 text-sm text-zinc-300">· chủ chuyến</span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-300">
                          {member.sharingEnabled
                            ? `${distance !== null ? `cách bạn ${formatDistance(distance)} · ` : ''}${formatAgo(member.updatedAt)}`
                            : 'đang tắt chia sẻ'}
                          {member.precisionMode === 'approx' &&
                            member.sharingEnabled &&
                            ' · vị trí gần đúng'}
                          {member.position?.batteryPct !== undefined &&
                            ` · pin ${member.position.batteryPct}%`}
                        </p>
                      </div>
                      {member.position && (
                        <a
                          href={buildDirectionsUrl(member.position)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[44px] items-center gap-1 rounded-lg border border-white/15 px-3 text-sm text-zinc-100"
                        >
                          <Navigation className="h-4 w-4" aria-hidden="true" />
                          Chỉ đường
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyInvite}
                className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-4 text-zinc-100"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? 'Đã chép link mời' : 'Chép link mời'}
              </button>
              <button
                type="button"
                onClick={() => void togglePrecision()}
                className="min-h-[44px] rounded-lg border border-white/15 px-4 text-zinc-100"
              >
                {me?.precisionMode === 'approx'
                  ? 'Chuyển sang vị trí chính xác'
                  : 'Chỉ hiện gần đúng (~500m)'}
              </button>
              {state.ownerId === myUserId && (
                <>
                  <button
                    type="button"
                    onClick={() => void setMeetPointHere()}
                    className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-4 text-zinc-100"
                  >
                    <Flag className="h-4 w-4" aria-hidden="true" />
                    Đặt điểm hẹn tại đây
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExtend()}
                    className="min-h-[44px] rounded-lg border border-white/15 px-4 text-zinc-100"
                  >
                    Gia hạn thêm 1 giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEnd()}
                    className="min-h-[44px] rounded-lg border border-rose-400/40 px-4 text-rose-100"
                  >
                    Kết thúc chuyến cho cả nhóm
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => void handleLeave()}
                className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-4 text-zinc-100"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Rời chuyến
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
