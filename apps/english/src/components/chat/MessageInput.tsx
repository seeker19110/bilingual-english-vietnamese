// apps/english/src/components/chat/MessageInput.tsx
// Message input area with auto-grow textarea, send button, typing events

import { useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { SendHorizonal } from 'lucide-react'

const MAX_CHARS = 4000
const CHAR_WARN_THRESHOLD = 3600
const TYPING_DEBOUNCE_MS = 500

interface Props {
  onSend: (content: string) => void
  onTyping: () => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Nhắn tin...',
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const valueRef = useRef('')
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS)
    valueRef.current = val
    adjustHeight()

    // Debounced typing event
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
    if (val.trim()) {
      typingDebounceRef.current = setTimeout(() => {
        onTyping()
      }, TYPING_DEBOUNCE_MS)
    }
  }

  const handleSend = () => {
    const el = textareaRef.current
    if (!el) return
    const content = el.value.trim()
    if (!content || disabled) return
    onSend(content)
    el.value = ''
    valueRef.current = ''
    adjustHeight()
    el.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = valueRef.current.length
  const showCharCount = charCount >= CHAR_WARN_THRESHOLD
  const charWarning = charCount >= MAX_CHARS - 100

  return (
    <div className="border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm px-3 py-2.5">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Tài khoản bị tạm khóa' : placeholder}
            className={`w-full resize-none rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              bg-zinc-800/60 border border-zinc-700/50 text-white placeholder:text-zinc-500
              focus:outline-none focus:border-accent-500/60 focus:bg-zinc-800
              transition-all duration-150 max-h-40 scrollbar-thin
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '44px' }}
          />
          {showCharCount && (
            <span
              className={`absolute bottom-2 right-3 text-[10px] transition-colors ${
                charWarning ? 'text-red-400' : 'text-zinc-500'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          aria-label="Gửi tin nhắn"
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150
            ${
              disabled
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-accent-500 hover:bg-accent-400 text-white shadow-md shadow-accent-500/30 hover:scale-105 active:scale-95'
            }`}
        >
          <SendHorizonal className="w-4.5 h-4.5" />
        </button>
      </div>
      <p className="text-center text-[10px] text-zinc-600 mt-1.5 max-w-3xl mx-auto">
        Enter để gửi · Shift + Enter xuống dòng
      </p>
    </div>
  )
}
