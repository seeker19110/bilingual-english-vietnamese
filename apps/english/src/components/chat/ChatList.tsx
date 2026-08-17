// apps/english/src/components/chat/ChatList.tsx
// Sidebar showing list of conversations with search and online presence

import { useState, useMemo } from 'react'
import { MessageCirclePlus, Search } from 'lucide-react'
import PresenceDot from './PresenceDot'
import UserSearch from './UserSearch'
import type { RoomSummary, UserSearchResult } from './useChat'

interface Props {
  rooms: RoomSummary[]
  activeRoomId: string | null
  onlineUsers: Set<string>
  currentUserId: string
  onSelectRoom: (id: string) => void
  onSearchUsers: (q: string) => Promise<UserSearchResult[]>
  onCreateRoom: (userId: string) => Promise<string | null>
}

function getRoomDisplayName(room: RoomSummary, currentUserId: string): string {
  if (room.name) return room.name
  const other = room.members.find((m) => m.userId !== currentUserId)
  return other ? (other.nickname ?? other.name) : 'Cuộc trò chuyện'
}

function getOtherMember(room: RoomSummary, currentUserId: string) {
  return room.members.find((m) => m.userId !== currentUserId) ?? null
}

function formatLastTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'vừa xong'
  if (diffMins < 60) return `${diffMins}p`
  const diffH = Math.floor(diffMins / 60)
  if (diffH < 24) return `${diffH}g`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ChatList({
  rooms,
  activeRoomId,
  onlineUsers,
  currentUserId,
  onSelectRoom,
  onSearchUsers,
  onCreateRoom,
}: Props) {
  const [showSearch, setShowSearch] = useState(false)
  const [filterQ, setFilterQ] = useState('')

  const filteredRooms = useMemo(() => {
    if (!filterQ.trim()) return rooms
    const q = filterQ.toLowerCase()
    return rooms.filter((r) => {
      const name = getRoomDisplayName(r, currentUserId).toLowerCase()
      return name.includes(q)
    })
  }, [rooms, filterQ, currentUserId])

  const totalUnread = rooms.reduce((acc, r) => acc + r.unreadCount, 0)

  if (showSearch) {
    return (
      <div className="flex flex-col h-full">
        <UserSearch
          onSearch={onSearchUsers}
          onCreateRoom={onCreateRoom}
          onClose={() => setShowSearch(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base">Tin nhắn</h2>
            {totalUnread > 0 && (
              <span className="text-[10px] font-bold bg-accent-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSearch(true)}
            aria-label="Nhắn tin mới"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <MessageCirclePlus className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Filter existing rooms */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={filterQ}
            onChange={(e) => setFilterQ(e.target.value)}
            placeholder="Tìm cuộc trò chuyện..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 focus:bg-zinc-800 transition"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 px-6 text-center">
            <MessageCirclePlus className="w-10 h-10 mb-3 opacity-25" />
            <p className="text-sm font-medium text-zinc-400">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs mt-1">
              Bấm{' '}
              <button
                onClick={() => setShowSearch(true)}
                className="text-accent-400 hover:underline"
              >
                nhắn tin mới
              </button>{' '}
              để bắt đầu
            </p>
          </div>
        ) : (
          <ul role="list" className="py-1">
            {filteredRooms.map((room) => {
              const other = getOtherMember(room, currentUserId)
              const displayName = getRoomDisplayName(room, currentUserId)
              const isOnline = other ? onlineUsers.has(other.userId) : false
              const isActive = room.id === activeRoomId
              const initials = getInitials(displayName)

              return (
                <li key={room.id}>
                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left relative
                      ${isActive ? 'bg-accent-500/10 border-r-2 border-accent-500' : 'hover:bg-zinc-800/40'}`}
                  >
                    {/* Avatar with presence */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-bold text-white">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <PresenceDot online={isOnline} size="sm" />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-sm font-medium truncate ${
                            isActive
                              ? 'text-white'
                              : room.unreadCount > 0
                                ? 'text-white'
                                : 'text-zinc-300'
                          }`}
                        >
                          {displayName}
                        </span>
                        {room.lastMessage && (
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            {formatLastTime(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            room.unreadCount > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-500'
                          }`}
                        >
                          {room.lastMessage?.isFiltered
                            ? '[Tin nhắn bị ẩn]'
                            : (room.lastMessage?.content ?? 'Bắt đầu trò chuyện')}
                        </p>
                        {room.unreadCount > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-bold px-1">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
