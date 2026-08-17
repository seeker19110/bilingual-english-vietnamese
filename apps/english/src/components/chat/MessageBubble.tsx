// apps/english/src/components/chat/MessageBubble.tsx
// Single chat message bubble — left/right aligned based on ownership

import { useState } from 'react'
import type { ChatMessage } from './useChat'

interface Props {
  message: ChatMessage
  isOwn: boolean
  showSenderName: boolean
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MessageBubble({ message, isOwn, showSenderName }: Props) {
  const [showTime, setShowTime] = useState(false)

  if (message.isFiltered) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
        <div
          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm italic text-zinc-500 bg-zinc-800/50 border border-zinc-700/40 ${
            isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
          }`}
        >
          [Tin nhắn này vi phạm quy tắc cộng đồng]
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-1 px-4`}>
      {/* Avatar (only for others, only on first of a group) */}
      {!isOwn && (
        <div className="shrink-0 mb-0.5">
          {showSenderName ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {getInitials(message.senderName)}
            </div>
          ) : (
            <div className="w-7" /> /* spacer to align bubbles */
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Sender name (first message in a sequence) */}
        {showSenderName && !isOwn && (
          <span className="text-[11px] text-zinc-400 mb-0.5 px-1">
            {message.senderNickname ?? message.senderName}
          </span>
        )}

        {/* Bubble */}
        <div className="relative group cursor-default" onClick={() => setShowTime((v) => !v)}>
          <div
            className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed transition-all duration-150 ${
              isOwn
                ? 'bg-accent-500 text-white rounded-tr-sm shadow-md shadow-accent-500/20'
                : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700/50'
            }`}
          >
            {message.content}
          </div>

          {/* Timestamp — show on tap/hover */}
          <div
            className={`absolute ${isOwn ? 'right-0' : 'left-0'} -bottom-5 text-[10px] text-zinc-500 whitespace-nowrap transition-all duration-150 ${
              showTime
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-1 group-hover:opacity-70 group-hover:translate-y-0'
            }`}
          >
            {formatTime(message.editedAt ?? message.createdAt)}
            {message.editedAt && ' · đã sửa'}
          </div>
        </div>
      </div>
    </div>
  )
}
