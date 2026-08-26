// apps/dhcb/src/components/location/MemberList.tsx — Danh sách người trong chuyến.
//
// Đây cũng là BẢN THAY THẾ VĂN BẢN cho bản đồ (bản đồ được aria-hidden vì trình đọc màn hình
// không đọc được ảnh động) — nên mọi thông tin cần để "không bị lạc" phải có đủ ở đây bằng chữ.
//
// Thứ tự ưu tiên thị giác, theo đúng thứ người dùng cần khi đang đi bộ ngoài đường:
//   1. AI  — avatar màu (trùng màu chấm trên bản đồ) + tên.
//   2. BAO XA — con số to, đậm, canh phải, dùng chữ số đều bề ngang (tabular-nums) để nhiều dòng
//      xếp thẳng cột, liếc một cái là so sánh được ai gần ai xa.
//   3. Chi tiết phụ (cập nhật lúc nào, pin, gần đúng) — chữ nhỏ, dòng dưới.
// Trước đây cả ba tầng này bị dồn vào MỘT dòng chữ nhỏ ngăn bằng dấu chấm giữa, phải đọc từng
// chữ mới hiểu.

import { Navigation } from 'lucide-react'
import { buildDirectionsUrl, type MemberPosition } from '../../lib/locationShare'
import { formatAgo, formatDistance } from '../../lib/locationFormat'
import { MEMBER_INK, memberColor, memberInitial } from './memberColor'

interface Props {
  members: MemberPosition[]
  myUserId: string
  /** Khoảng cách từ TÔI tới từng người (mét). Thiếu khoá = không tính được (tôi chưa bật chia sẻ). */
  distancesFromMe: Map<string, number>
}

export default function MemberList({ members, myUserId, distancesFromMe }: Props) {
  return (
    <ul className="divide-y divide-zinc-800">
      {members.map((member) => {
        const isMe = member.userId === myUserId
        const color = memberColor(member.userId)
        const distance = distancesFromMe.get(member.userId)

        // Các mẩu chi tiết phụ, ghép bằng dấu chấm giữa — chỉ giữ mẩu nào thật sự có dữ liệu.
        const details: string[] = []
        if (member.sharingEnabled) {
          details.push(formatAgo(member.updatedAt))
          if (member.precisionMode === 'approx') details.push('vị trí gần đúng ~500m')
          if (member.position?.batteryPct !== undefined) {
            details.push(`pin ${member.position.batteryPct}%`)
          }
        }

        return (
          <li key={member.userId} className="flex items-center gap-3 py-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                member.sharingEnabled ? '' : 'opacity-40'
              }`}
              style={
                member.sharingEnabled
                  ? { backgroundColor: color, color: MEMBER_INK }
                  : { border: `2px dashed ${color}`, color }
              }
              aria-hidden="true"
            >
              {memberInitial(member.name)}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-zinc-100">
                {member.name}
                {isMe && <span className="font-normal text-zinc-300"> (bạn)</span>}
                {member.isOwner && (
                  <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-normal text-zinc-300 ring-1 ring-zinc-700">
                    chủ chuyến
                  </span>
                )}
              </span>
              <span className="block truncate text-sm text-zinc-300">
                {member.sharingEnabled ? details.join(' · ') : 'đang tắt chia sẻ'}
              </span>
            </span>

            {/* Khoảng cách: chỉ có nghĩa với NGƯỜI KHÁC và khi cả hai cùng đang chia sẻ. */}
            {distance !== undefined && !isMe && (
              <span className="shrink-0 text-lg font-bold tabular-nums text-zinc-100">
                {formatDistance(distance)}
              </span>
            )}

            {member.position && !isMe && (
              <a
                href={buildDirectionsUrl(member.position)}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-44 flex shrink-0 items-center justify-center rounded-xl border border-zinc-700 px-3 text-zinc-100"
                aria-label={`Chỉ đường tới ${member.name}`}
              >
                <Navigation className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}
