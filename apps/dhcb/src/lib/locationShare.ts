// apps/dhcb/src/lib/locationShare.ts — Client cho tính năng "Đi chung" (chia sẻ vị trí khi đi
// chơi chung). Ba phần tách bạch để dễ test:
//   1. REST (fetch*) — luôn dùng được, là nguồn sự thật.
//   2. LocationSocket — WebSocket /ws/location để thấy bạn di chuyển gần như tức thì; hỏng thì
//      TỰ QUAY VỀ polling REST (mạng công cộng/proxy hay chặn WebSocket).
//   3. watchMyPosition — đọc GPS trình duyệt, lọc bớt nhịp gửi cho đỡ tốn pin (geo.shouldSendUpdate).

import { getAuthHeader } from '@core/authHeader'
import type {
  MeetPoint,
  MemberPosition,
  Position,
  SessionState,
  WsLocationServerEvent,
} from '@dhcb/core-contracts/location'
import { shouldSendUpdate, type LatLng } from '@dhcb/core-location/geo'

export type { MemberPosition, Position, SessionState, MeetPoint }

export interface SessionSummary {
  sessionId: string
  name: string
  inviteCode: string
  expiresAt: string
  memberCount: number
}

async function request<T>(input: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: { 'content-type': 'application/json', ...getAuthHeader(), ...init?.headers },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchMySessions(): Promise<SessionSummary[]> {
  const data = await request<{ sessions: SessionSummary[] }>('/api/location')
  return data?.sessions ?? []
}

export async function fetchSessionState(sessionId: string): Promise<SessionState | null> {
  const data = await request<{ state: SessionState }>(
    `/api/location?sessionId=${encodeURIComponent(sessionId)}`,
  )
  return data?.state ?? null
}

export async function createSession(
  name: string,
  durationMinutes: 60 | 240 | 480,
): Promise<SessionState | null> {
  const data = await request<{ state: SessionState }>('/api/location', {
    method: 'POST',
    body: JSON.stringify({ name, durationMinutes }),
  })
  return data?.state ?? null
}

export async function joinSession(inviteCode: string): Promise<SessionState | null> {
  const data = await request<{ state: SessionState }>('/api/location?action=join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  })
  return data?.state ?? null
}

export async function setSharing(
  sessionId: string,
  changes: { sharingEnabled?: boolean; precisionMode?: 'exact' | 'approx' },
): Promise<SessionState | null> {
  const data = await request<{ state: SessionState }>('/api/location?action=sharing', {
    method: 'PATCH',
    body: JSON.stringify({ sessionId, ...changes }),
  })
  return data?.state ?? null
}

export async function updateSession(
  sessionId: string,
  changes: {
    meetPoint?: MeetPoint | null
    alertRadiusM?: number
    extendMinutes?: 60 | 240 | 480
    end?: true
  },
): Promise<SessionState | null> {
  const data = await request<{ state?: SessionState }>('/api/location', {
    method: 'PATCH',
    body: JSON.stringify({ sessionId, ...changes }),
  })
  return data?.state ?? null
}

export async function leaveSession(sessionId: string): Promise<boolean> {
  const data = await request<{ ok: boolean }>(
    `/api/location?sessionId=${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' },
  )
  return !!data?.ok
}

export async function sendPositionRest(sessionId: string, position: Position): Promise<void> {
  await request('/api/location?action=position', {
    method: 'POST',
    body: JSON.stringify({ sessionId, position }),
  })
}

/** Link mời vào chuyến — dán vào nhóm chat, người bấm sẽ vào thẳng chuyến. */
export function buildInviteUrl(inviteCode: string): string {
  return `${window.location.origin}/nhom-di-chung/${inviteCode}`
}

/** Mở Google Maps chỉ đường tới một điểm — không cần API key, dùng URL công khai. */
export function buildDirectionsUrl(point: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`
}

// ── WebSocket + fallback polling ──────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 8_000

export interface LocationSocketHandlers {
  onState: (state: SessionState) => void
  onMemberPosition: (member: MemberPosition) => void
  onMemberLeft: (userId: string) => void
  onSessionEnded: () => void
  onTransportChange?: (transport: 'websocket' | 'polling') => void
}

/**
 * Kết nối thời gian thực tới 1 chuyến. Nếu WebSocket không mở được (proxy chặn, mạng lởm) thì
 * tự động chuyển sang gọi REST định kỳ — tính năng vẫn chạy, chỉ chậm hơn vài giây.
 */
export class LocationSocket {
  private ws: WebSocket | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private closed = false

  constructor(
    private readonly sessionId: string,
    private readonly handlers: LocationSocketHandlers,
  ) {}

  connect(): void {
    this.closed = false
    if (typeof WebSocket === 'undefined') {
      this.startPolling()
      return
    }
    try {
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${scheme}://${window.location.host}/ws/location`)
      this.ws = ws
      ws.onopen = () => {
        this.stopPolling()
        this.handlers.onTransportChange?.('websocket')
        ws.send(JSON.stringify({ type: 'subscribe', sessionId: this.sessionId }))
      }
      ws.onmessage = (ev) => this.handleServerEvent(ev.data)
      ws.onerror = () => this.startPolling()
      ws.onclose = () => {
        this.ws = null
        if (!this.closed) this.startPolling()
      }
    } catch {
      this.startPolling()
    }
  }

  private handleServerEvent(raw: unknown): void {
    let event: WsLocationServerEvent
    try {
      event = JSON.parse(String(raw)) as WsLocationServerEvent
    } catch {
      return
    }
    if (event.type === 'state') this.handlers.onState(event.state)
    else if (event.type === 'position') this.handlers.onMemberPosition(event.member)
    else if (event.type === 'member_left') this.handlers.onMemberLeft(event.userId)
    else if (event.type === 'session_ended') this.handlers.onSessionEnded()
  }

  private startPolling(): void {
    if (this.pollTimer || this.closed) return
    this.handlers.onTransportChange?.('polling')
    const tick = () => {
      void fetchSessionState(this.sessionId).then((state) => {
        if (!state || this.closed) return
        if (state.endedAt) this.handlers.onSessionEnded()
        else this.handlers.onState(state)
      })
    }
    tick()
    this.pollTimer = setInterval(tick, POLL_INTERVAL_MS)
  }

  private stopPolling(): void {
    if (!this.pollTimer) return
    clearInterval(this.pollTimer)
    this.pollTimer = null
  }

  /** Gửi vị trí: ưu tiên WebSocket, không có thì REST — người dùng không cần biết khác biệt. */
  sendPosition(position: Position): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'position', sessionId: this.sessionId, position }))
      return
    }
    void sendPositionRest(this.sessionId, position)
  }

  close(): void {
    this.closed = true
    this.stopPolling()
    this.ws?.close()
    this.ws = null
  }
}

// ── Đọc GPS trình duyệt ───────────────────────────────────────────────────────────────────

export interface WatchHandle {
  stop: () => void
}

/** Mức pin (0–100) nếu trình duyệt cho biết — để bạn bè thấy "máy sắp hết pin, đừng đợi tin". */
async function readBatteryPct(): Promise<number | undefined> {
  const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }
  if (!nav.getBattery) return undefined
  try {
    const battery = await nav.getBattery()
    return Math.round(battery.level * 100)
  } catch {
    return undefined
  }
}

/**
 * Theo dõi vị trí của chính mình và gọi `onSend` khi ĐÁNG gửi (di chuyển ≥20m hoặc quá 30s).
 * Trả về handle để dừng — LUÔN gọi stop() khi tắt chia sẻ/rời trang, nếu không GPS chạy nền
 * sẽ ngốn pin.
 */
export function watchMyPosition(
  onSend: (position: Position) => void,
  onError?: (message: string) => void,
): WatchHandle {
  if (!('geolocation' in navigator)) {
    onError?.('Trình duyệt không hỗ trợ định vị')
    return { stop: () => {} }
  }

  let last: { point: LatLng; sentAtMs: number } | null = null
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      const now = Date.now()
      if (!shouldSendUpdate(last, point, now)) return
      last = { point, sentAtMs: now }
      void readBatteryPct().then((batteryPct) => {
        onSend({
          ...point,
          accuracyM: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined,
          headingDeg:
            pos.coords.heading != null && !Number.isNaN(pos.coords.heading)
              ? ((pos.coords.heading % 360) + 360) % 360
              : undefined,
          speedMps:
            pos.coords.speed != null && !Number.isNaN(pos.coords.speed) && pos.coords.speed >= 0
              ? pos.coords.speed
              : undefined,
          batteryPct,
        })
      })
    },
    (err) => {
      const message =
        err.code === err.PERMISSION_DENIED
          ? 'Bạn chưa cho phép truy cập vị trí — hãy bật quyền vị trí trong trình duyệt'
          : 'Không lấy được vị trí — thử ra chỗ thoáng hoặc bật GPS'
      onError?.(message)
    },
    { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
  )

  return { stop: () => navigator.geolocation.clearWatch(watchId) }
}
