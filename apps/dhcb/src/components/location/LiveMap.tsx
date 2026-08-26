// apps/dhcb/src/components/location/LiveMap.tsx — Bản đồ Google hiển thị vị trí bạn bè trong
// chuyến. LUÔN có đường lui: thiếu API key hoặc bản đồ tải hỏng thì hiện lời nhắc, còn danh sách
// khoảng cách nằm ngay dưới (MemberList) nên tính năng "không bị lạc" vẫn dùng được.
//
// A11y: bản đồ là ảnh động không đọc được bằng màn hình đọc → đánh dấu aria-hidden và để
// MemberList (text thật) làm nguồn thông tin tương đương.

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import {
  hasMapsApiKey,
  loadGoogleMaps,
  type GoogleMap,
  type GoogleMarker,
} from '../../lib/googleMapsLoader'
import type { MeetPoint, MemberPosition } from '../../lib/locationShare'

interface Props {
  members: MemberPosition[]
  meetPoint: MeetPoint | null
  myUserId: string
}

/** Toạ độ trung tâm mặc định khi chưa ai bật chia sẻ (Hồ Gươm, Hà Nội). */
const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 }

export default function LiveMap({ members, meetPoint, myUserId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<GoogleMap | null>(null)
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map())
  const [error, setError] = useState<string | null>(
    hasMapsApiKey() ? null : 'Bản đồ chưa được bật (thiếu khoá Google Maps)',
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hasMapsApiKey() || !containerRef.current) return
    let cancelled = false

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return
        mapRef.current = new maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
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
        const existing = markersRef.current.get(member.userId)
        const title = `${member.name}${member.userId === myUserId ? ' (bạn)' : ''}`
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
              label: member.name.slice(0, 1),
            }),
          )
        }
      }

      if (meetPoint) {
        seen.add('__meet__')
        bounds.extend(meetPoint)
        const existing = markersRef.current.get('__meet__')
        const title = meetPoint.label ?? 'Điểm hẹn'
        if (existing) {
          existing.setPosition(meetPoint)
          existing.setTitle(title)
        } else {
          markersRef.current.set(
            '__meet__',
            new maps.Marker({ map, position: meetPoint, title, label: '★' }),
          )
        }
      }

      // Ai vừa tắt chia sẻ/rời chuyến → gỡ điểm khỏi bản đồ.
      for (const [key, marker] of markersRef.current) {
        if (seen.has(key)) continue
        marker.setMap(null)
        markersRef.current.delete(key)
      }

      if (!bounds.isEmpty()) map.fitBounds(bounds, 64)
    })

    return () => {
      cancelled = true
    }
  }, [members, meetPoint, myUserId, ready])

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
        <MapPin className="mx-auto mb-2 h-6 w-6 text-accent-400" aria-hidden="true" />
        <p className="text-sm text-zinc-300">
          {error}. Bạn vẫn xem được khoảng cách của từng người ở danh sách bên dưới và bấm
          &laquo;Chỉ đường&raquo; để mở Google Maps.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="h-72 w-full overflow-hidden rounded-xl border border-white/10 sm:h-96"
    />
  )
}
