// apps/english/src/components/chat/ChatWindow.tsx
// Main chat window — messages list, typing indicator, infinite scroll

import { useEffect, useRef, useCallback, useState } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import PresenceDot from './PresenceDot'
import type { ChatMessage, RoomSummary } from './useChat'

interface Props {
  room: RoomSummary
  messages: ChatMessage[]
  currentUserId: string
  onlineUsers: Set<string>
  typingUsers: Set<string>
  onSendMessage: (content: string) => void
  onSendTyping: () => void
  onLoadMore: () => Promise<void>
  userSuspended?: boolean
}

function getOtherMember(room: RoomSummary, currentUserId: string) {
  return room.members.find((m) => m.userId !== currentUserId) ?? null
}

function getRoomDisplayName(room: RoomSummary, currentUserId: string): string {
  if (room.name) return room.name
  const other = getOtherMember(room, currentUserId)
  return other ? (other.nickname ?? other.name) : 'Cuộc trò chuyện'
}

export default function ChatWindow({
  room,
  messages,
  currentUserId,
  onlineUsers,
  typingUsers,
  onSendMessage,
  onSendTyping,
  onLoadMore,
  userSuspended = false,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const prevScrollHeight = useRef(0)

  const other = getOtherMember(room, currentUserId)
  const isOtherOnline = other ? onlineUsers.has(other.userId) : false
  const displayName = getRoomDisplayName(room, currentUserId)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    // Instant scroll on first load, smooth on new messages
    scrollToBottom('instant')
  }, [room.id, scrollToBottom])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    // Only auto-scroll if user is near the bottom (within 200px)
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200
    if (nearBottom) {
      scrollToBottom('smooth')
    }
  }, [messages.length, scrollToBottom])

  // Restore scroll position after loading older messages
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el || !loadingMore) return
    const delta = el.scrollHeight - prevScrollHeight.current
    el.scrollTop += delta
  })

  // Infinite scroll — load more when scrolled to top
  const handleScroll = useCallback(async () => {
    const el = scrollContainerRef.current
    if (!el || loadingMore) return
    if (el.scrollTop < 80) {
      prevScrollHeight.current = el.scrollHeight
      setLoadingMore(true)
      await onLoadMore()
      setLoadingMore(false)
    }
  }, [loadingMore, onLoadMore])

  // Typing indicator label
  const typingList = Array.from(typingUsers)
    .map((uid) => {
      const member = room.members.find((m) => m.userId === uid)
      return member ? (member.nickname ?? member.name) : null
    })
    .filter(Boolean)

  const typingLabel =
    typingList.length === 0
      ? null
      : typingList.length === 1
        ? `${typingList[0]} đang nhập...`
        : `${typingList.slice(0, 2).join(', ')} đang nhập...`

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm shrink-0">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-bold text-white">
            {displayName[0]?.toUpperCase()}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5">
            <PresenceDot online={isOtherOnline} size="sm" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-[11px] text-zinc-400">
            {isOtherOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={() => void handleScroll()}
        className="flex-1 overflow-y-auto py-4 space-y-1 scroll-smooth"
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !loadingMore && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-500 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Bắt đầu cuộc trò chuyện</p>
            <p className="text-xs mt-1 text-zinc-600">Gửi tin nhắn đầu tiên!</p>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUserId
          const prevMsg = messages[i - 1]
          // Show sender name on first message in a sequence from same sender
          const showSenderName =
            !prevMsg ||
            prevMsg.senderId !== msg.senderId ||
            isOwn !== (prevMsg.senderId === currentUserId)
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showSenderName={showSenderName}
            />
          )
        })}

        {/* Typing indicator */}
        {typingLabel && (
          <div className="flex items-center gap-2 px-4 py-1 animate-fade-in">
            <div className="flex gap-1 items-center bg-zinc-800/80 border border-zinc-700/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="text-xs text-zinc-400 ml-1">{typingLabel}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <MessageInput onSend={onSendMessage} onTyping={onSendTyping} disabled={userSuspended} />
      </div>
    </div>
  )
}
