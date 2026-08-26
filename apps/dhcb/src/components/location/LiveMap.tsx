// apps/dhcb/src/components/location/LiveMap.tsx — Bản đồ Google hiển thị vị trí bạn bè trong
// chuyến. LUÔN có đường lui: thiếu API key hoặc bản đồ tải hỏng thì hiện lời nhắc, còn danh sách
// khoảng cách nằm ngay dưới (MemberList) nên tính năng "không bị lạc" vẫn dùng được.
//
// A11y: bản đồ là ảnh động không đọc được bằng màn hình đọc → đánh dấu aria-hidden và để
// MemberList (text thật) làm nguồn thông tin tương đương.
//
// Hai điểm thiết kế đáng chú ý:
//   • Chấm của mỗi người mang ĐÚNG màu định danh dùng trong MemberList (memberColor.ts), nên
//     nhìn chấm là biết ngay ai — không phải bấm vào từng chấm đọc tên.
//   • Bản đồ CHỈ tự canh khung khi người dùng chưa tự kéo. Vị trí cập nhật vài giây một lần,
//     nếu cứ fitBounds mỗi lần thì người đang kéo bản đồ xem đường sẽ bị giật về liên tục —
//     thay vào đó hiện nút "Canh lại cả nhóm" để họ chủ động quay về.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Crosshair, MapPin, Users } from 'lucide-react'
import {
  hasMapsApiKey,
  loadGoogleMaps,
  type GoogleMap,
  type GoogleMarker,
} from '../../lib/googleMapsLoader'
import type { MeetPoint, MemberPosition } from '../../lib/locationShare'
import { MEMBER_INK, memberColor, memberInitial } from './memberColor'

interface Props {
  members: MemberPosition[]
  meetPoint: MeetPoint | null
  myUserId: string
}

/** Toạ độ trung tâm mặc định khi chưa ai bật chia sẻ (Hồ Gươm, Hà Nội). */
const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 }

const MEET_POINT_KEY = '__meet__'

function escapeXml(text: string): string {
  return text.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c,
  )
}

/** Chấm tròn màu định danh, có sẵn chữ cái đầu — vẽ bằng SVG nên không cần tải ảnh từ đâu cả. */
function memberIcon(color: string, initial: string, isMe: boolean): Record<string, unknown> {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">` +
    `<circle cx="19" cy="19" r="15" fill="${color}" stroke="${MEMBER_INK}" stroke-width="${isMe ? 4 : 2}"/>` +
    `<text x="19" y="19" font-family="system-ui,sans-serif" font-size="16" font-weight="700"` +
    ` fill="${MEMBER_INK}" text-anchor="middle" dominant-baseline="central">${escapeXml(initial)}</text>` +
    `</svg>`
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` }
}

/** Điểm hẹn — cờ trắng viền tối, cố tình KHÁC hẳn chấm người để không lẫn. */
function meetPointIcon(): Record<string, unknown> {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">` +
    `<circle cx="19" cy="19" r="15" fill="#ffffff" stroke="${MEMBER_INK}" stroke-width="2"/>` +
    `<text x="19" y="19" font-family="system-ui,sans-serif" font-size="18"` +
    ` fill="${MEMBER_INK}" text-anchor="middle" dominant-baseline="central">★</text>` +
    `</svg>`
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` }
}

export default function LiveMap({ members, meetPoint, myUserId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<GoogleMap | null>(null)
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map())
  // Người dùng đã tự kéo/thu phóng bản đồ chưa — còn false thì bản đồ được tự canh khung.
  const userMovedRef = useRef(false)
  const [error, setError] = useState<string | null>(
    hasMapsApiKey() ? null : 'Bản đồ chưa được bật (thiếu khoá Google Maps)',
  )
  const [ready, setReady] = useState(false)
  const [followingGroup, setFollowingGroup] = useState(true)

  const sharingCount = members.filter((m) => m.position).length

  useEffect(() => {
    if (!hasMapsApiKey() || !containerRef.current) return
    let cancelled = false

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return
        const map = new maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          // Bản đồ nằm giữa một trang cuộn dọc: để cuộn một ngón lướt qua được bản đồ thay vì
          // bị bản đồ "nuốt" cú vuốt. Muốn di chuyển bản đồ thì kéo hai ngón (chuẩn của Google).
          gestureHandling: 'cooperative',
        })
        // Người dùng tự kéo/thu phóng → ngừng tự canh khung, nhường quyền điều khiển cho họ.
        const release = () => {
          userMovedRef.current = true
          setFollowingGroup(false)
        }
        map.addListener('dragstart', release)
        map.addListener('zoom_changed', release)
        mapRef.current = map
        setReady(true)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Vẽ lại điểm mỗi khi vị trí đổi — TÁI DÙNG marker cũ (setPosition) thay vì tạo mới, nếu không
  // bản đồ sẽ nháy và ngốn bộ nhớ khi cập nhật vài giây một lần.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    let cancelled = false

    void loadGoogleMaps().then((maps) => {
      if (cancelled) return
      const bounds = new maps.LatLngBounds()
      const seen = new Set<string>()

      for (const member of members) {
        if (!member.position) continue
        seen.add(member.userId)
        bounds.extend(member.position)
        const isMe = member.userId === myUserId
        const title = `${member.name}${isMe ? ' (bạn)' : ''}`
        const icon = memberIcon(memberColor(member.userId), memberInitial(member.name), isMe)
        const existing = markersRef.current.get(member.userId)
        if (existing) {
          existing.setPosition(member.position)
          existing.setTitle(title)
        } else {
          markersRef.current.set(
            member.userId,
            new maps.Marker({
              map,
              position: member.position,
              title,
              icon,
              // Chấm của mình luôn nằm trên cùng để không bị chấm người khác đè mất.
              zIndex: isMe ? 1000 : 1,
            }),
          )
        }
      }

      if (meetPoint) {
        seen.add(MEET_POINT_KEY)
        bounds.extend(meetPoint)
        const title = meetPoint.label ?? 'Điểm hẹn'
        const existing = markersRef.current.get(MEET_POINT_KEY)
        if (existing) {
          existing.setPosition(meetPoint)
          existing.setTitle(title)
        } else {
          markersRef.current.set(
            MEET_POINT_KEY,
            new maps.Marker({
              map,
              position: meetPoint,
              title,
              icon: meetPointIcon(),
              zIndex: 900,
            }),
          )
        }
      }

      // Ai vừa tắt chia sẻ/rời chuyến → gỡ điểm khỏi bản đồ.
      for (const [key, marker] of markersRef.current) {
        if (seen.has(key)) continue
        marker.setMap(null)
        markersRef.current.delete(key)
      }

      if (!bounds.isEmpty() && !userMovedRef.current) map.fitBounds(bounds, 64)
    })

    return () => {
      cancelled = true
    }
  }, [members, meetPoint, myUserId, ready])

  const recenter = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    void loadGoogleMaps().then((maps) => {
      const bounds = new maps.LatLngBounds()
      for (const member of members) if (member.position) bounds.extend(member.position)
      if (meetPoint) bounds.extend(meetPoint)
      if (bounds.isEmpty()) return
      map.fitBounds(bounds, 64)
      userMovedRef.current = false
      setFollowingGroup(true)
    })
  }, [members, meetPoint])

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
        <MapPin
          className="mx-auto mb-2 h-6 w-6 text-accent-400 theme-light:text-accent-700"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-200">
          {error}. Bạn vẫn xem được khoảng cách của từng người ở danh sách bên dưới và bấm
          &laquo;Chỉ đường&raquo; để mở Google Maps.
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-[45dvh] min-h-[16rem] w-full overflow-hidden rounded-2xl border border-zinc-800">
      <div ref={containerRef} aria-hidden="true" className="h-full w-full" />

      {/* Chưa ai bật chia sẻ thì bản đồ trống trơn trông như hỏng — nói rõ vì sao nó trống. */}
      {sharingCount === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/80 p-6 text-center">
          <p className="text-sm text-zinc-100">
            <Users className="mx-auto mb-2 h-6 w-6" aria-hidden="true" />
            Chưa ai bật chia sẻ vị trí. Bật công tắc bên dưới để mọi người thấy bạn trên bản đồ.
          </p>
        </div>
      )}

      {!followingGroup && sharingCount > 0 && (
        <button
          type="button"
          onClick={recenter}
          className="tap-44 absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/95 px-3 text-sm font-semibold text-zinc-100 shadow-lg backdrop-blur-md"
        >
          <Crosshair className="h-4 w-4" aria-hidden="true" />
          Canh lại cả nhóm
        </button>
      )}
    </div>
  )
}
