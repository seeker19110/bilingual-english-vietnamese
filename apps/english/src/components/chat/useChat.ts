// apps/english/src/components/chat/useChat.ts
// Real-time user-to-user chat hook — WebSocket + REST API
import { useState, useEffect, useRef, useCallback } from 'react'
import { getAuthHeader } from '@core/authHeader'

// ---------------------------------------------------------------------------
// Local interfaces matching server contracts (packages/core-contracts/chat.ts)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string | null
  senderName: string
  senderNickname: string | null
  content: string
  isFiltered: boolean
  createdAt: string
  editedAt?: string | null
}

export interface RoomMember {
  userId: string
  name: string
  nickname: string | null
}

export interface RoomSummary {
  id: string
  isGroup: boolean
  name: string | null
  members: RoomMember[]
  lastMessage: ChatMessage | null
  unreadCount: number
  lastReadAt: string
}

export interface UserSearchResult {
  id: string
  name: string
  nickname: string | null
  plan: string
}

// ---------------------------------------------------------------------------
// WS event types (server → client)
// ---------------------------------------------------------------------------
interface WsMessageEvent {
  type: 'message'
  payload: ChatMessage
}
interface WsTypingEvent {
  type: 'typing'
  payload: { roomId: string; userId: string; userName: string }
}
interface WsPresenceEvent {
  type: 'presence'
  payload: { userId: string; online: boolean }
}
interface WsReadAckEvent {
  type: 'read_ack'
  payload: { roomId: string; userId: string; messageId: string }
}
interface WsPongEvent {
  type: 'pong'
  payload: Record<string, never>
}
interface WsErrorEvent {
  type: 'error'
  payload: { message: string }
}

type WsEvent =
  WsMessageEvent | WsTypingEvent | WsPresenceEvent | WsReadAckEvent | WsPongEvent | WsErrorEvent

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PING_INTERVAL_MS = 30_000
const BACKOFF_BASE_MS = 1_000
const BACKOFF_MAX_MS = 30_000
const TYPING_DEBOUNCE_MS = 2_000 // clear typing indicator after 2s silence
const MAX_TYPING_USERS = 20

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useChat() {
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  // messages keyed by roomId
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({})
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({}) // roomId → userIds
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryCount = useRef(0)
  const unmounted = useRef(false)
  const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ---------------------------------------------------------------------------
  // REST helpers
  // ---------------------------------------------------------------------------
  const apiFetch = useCallback(async (path: string, options?: RequestInit) => {
    const headers = await getAuthHeader()
    const res = await fetch(path, {
      ...options,
      headers: { ...headers, 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json() as Promise<unknown>
  }, [])

  const fetchRooms = useCallback(async () => {
    try {
      const data = (await apiFetch('/api/chat/rooms')) as { rooms: RoomSummary[] }
      setRooms(data.rooms ?? [])
    } catch {
      // silently fail — rooms will be empty until reconnect
    }
  }, [apiFetch])

  const fetchMessages = useCallback(
    async (roomId: string, before?: string) => {
      try {
        const url = before
          ? `/api/chat/messages?roomId=${roomId}&before=${before}`
          : `/api/chat/messages?roomId=${roomId}`
        const data = (await apiFetch(url)) as { messages: ChatMessage[] }
        const msgs = data.messages ?? []
        setMessagesMap((prev) => {
          const existing = prev[roomId] ?? []
          if (before) {
            // prepend older messages (infinite scroll)
            const existingIds = new Set(existing.map((m) => m.id))
            const newMsgs = msgs.filter((m) => !existingIds.has(m.id))
            return { ...prev, [roomId]: [...newMsgs, ...existing] }
          } else {
            // fresh load
            return { ...prev, [roomId]: msgs }
          }
        })
        return msgs
      } catch {
        return []
      }
    },
    [apiFetch],
  )

  // ---------------------------------------------------------------------------
  // WS send helper (queue-less — only when connected)
  // ---------------------------------------------------------------------------
  const wsSend = useCallback((payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  // ---------------------------------------------------------------------------
  // WS event handler
  // ---------------------------------------------------------------------------
  const handleWsEvent = useCallback(
    (event: WsEvent) => {
      switch (event.type) {
        case 'message': {
          const msg = event.payload
          setMessagesMap((prev) => {
            const existing = prev[msg.roomId] ?? []
            if (existing.some((m) => m.id === msg.id)) return prev
            return { ...prev, [msg.roomId]: [...existing, msg] }
          })
          // update room last message + unread
          setRooms((prev) =>
            prev.map((r) =>
              r.id === msg.roomId
                ? {
                    ...r,
                    lastMessage: msg,
                    unreadCount: r.id === activeRoomId ? 0 : r.unreadCount + 1,
                  }
                : r,
            ),
          )
          break
        }
        case 'typing': {
          const { roomId, userId } = event.payload
          const key = `${roomId}:${userId}`
          // clear any previous timeout for this user
          if (typingTimeouts.current[key]) clearTimeout(typingTimeouts.current[key])
          setTypingUsers((prev) => {
            const set = new Set(prev[roomId] ?? [])
            if (set.size >= MAX_TYPING_USERS) return prev
            set.add(userId)
            return { ...prev, [roomId]: set }
          })
          // auto-clear after debounce period
          typingTimeouts.current[key] = setTimeout(() => {
            setTypingUsers((prev) => {
              const set = new Set(prev[roomId] ?? [])
              set.delete(userId)
              return { ...prev, [roomId]: set }
            })
          }, TYPING_DEBOUNCE_MS)
          break
        }
        case 'presence': {
          const { userId, online } = event.payload
          setOnlineUsers((prev) => {
            const next = new Set(prev)
            if (online) next.add(userId)
            else next.delete(userId)
            return next
          })
          break
        }
        case 'read_ack': {
          const { roomId } = event.payload
          setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r)))
          break
        }
        case 'error': {
          console.error('[chat ws] server error:', event.payload.message)
          break
        }
        case 'pong':
        default:
          break
      }
    },
    [activeRoomId],
  )

  // ---------------------------------------------------------------------------
  // WebSocket connection with exponential backoff
  // ---------------------------------------------------------------------------
  const connect = useCallback(async () => {
    if (unmounted.current) return
    setConnecting(true)

    try {
      const headers = await getAuthHeader()
      const token = (headers as Record<string, string>)['Authorization']?.replace('Bearer ', '')
      if (!token) {
        // not logged in — stop trying
        setConnecting(false)
        return
      }

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${protocol}://${window.location.host}/ws/chat?token=${encodeURIComponent(token)}`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        if (unmounted.current) {
          ws.close()
          return
        }
        setConnected(true)
        setConnecting(false)
        retryCount.current = 0
        // start ping keepalive
        pingIntervalRef.current = setInterval(() => {
          wsSend({ type: 'ping' })
        }, PING_INTERVAL_MS)
        // load rooms after connect
        void fetchRooms()
      }

      ws.onmessage = (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data as string) as WsEvent
          handleWsEvent(event)
        } catch {
          // malformed message — ignore
        }
      }

      ws.onerror = () => {
        // onclose will fire next and handle reconnect
      }

      ws.onclose = () => {
        if (unmounted.current) return
        setConnected(false)
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }
        // exponential backoff reconnect
        const delay = Math.min(BACKOFF_BASE_MS * 2 ** retryCount.current, BACKOFF_MAX_MS)
        retryCount.current += 1
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!unmounted.current) void connect()
        }, delay)
      }
    } catch {
      if (unmounted.current) return
      setConnecting(false)
      const delay = Math.min(BACKOFF_BASE_MS * 2 ** retryCount.current, BACKOFF_MAX_MS)
      retryCount.current += 1
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!unmounted.current) void connect()
      }, delay)
    }
  }, [fetchRooms, handleWsEvent, wsSend])

  // Mount/unmount lifecycle
  useEffect(() => {
    unmounted.current = false
    void connect()
    const currentTypingTimeouts = typingTimeouts.current
    return () => {
      unmounted.current = true
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      Object.values(currentTypingTimeouts).forEach(clearTimeout)
      wsRef.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch messages when active room changes
  useEffect(() => {
    if (!activeRoomId) return
    if (!messagesMap[activeRoomId]) {
      void fetchMessages(activeRoomId)
    }
    // mark as read
    markRead(activeRoomId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId])

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(
    (content: string) => {
      if (!activeRoomId || !content.trim()) return
      wsSend({ type: 'message', payload: { roomId: activeRoomId, content } })
    },
    [activeRoomId, wsSend],
  )

  const setActiveRoom = useCallback((id: string | null) => {
    setActiveRoomId(id)
    if (id) {
      // clear unread locally
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, unreadCount: 0 } : r)))
    }
  }, [])

  const searchUsers = useCallback(
    async (q: string): Promise<UserSearchResult[]> => {
      if (!q.trim()) return []
      try {
        const data = (await apiFetch(`/api/chat/users/search?q=${encodeURIComponent(q)}`)) as {
          users: UserSearchResult[]
        }
        return data.users ?? []
      } catch {
        return []
      }
    },
    [apiFetch],
  )

  const createRoom = useCallback(
    async (targetUserId: string): Promise<string | null> => {
      try {
        const data = (await apiFetch('/api/chat/rooms', {
          method: 'POST',
          body: JSON.stringify({ targetUserId }),
        })) as { room: RoomSummary }
        const room = data.room
        setRooms((prev) => {
          if (prev.some((r) => r.id === room.id)) return prev
          return [room, ...prev]
        })
        setActiveRoomId(room.id)
        return room.id
      } catch {
        return null
      }
    },
    [apiFetch],
  )

  const markRead = useCallback(
    (messageIdOrRoomId: string) => {
      wsSend({ type: 'read', payload: { id: messageIdOrRoomId } })
    },
    [wsSend],
  )

  const sendTyping = useCallback(() => {
    if (!activeRoomId) return
    wsSend({ type: 'typing', payload: { roomId: activeRoomId } })
  }, [activeRoomId, wsSend])

  const loadMoreMessages = useCallback(
    async (roomId: string) => {
      const msgs = messagesMap[roomId] ?? []
      if (!msgs.length) return
      const oldest = msgs[0]
      if (oldest) {
        await fetchMessages(roomId, oldest.createdAt)
      }
    },
    [fetchMessages, messagesMap],
  )

  const messages = activeRoomId ? (messagesMap[activeRoomId] ?? []) : []
  const activeRoomTypingUsers = activeRoomId
    ? (typingUsers[activeRoomId] ?? new Set<string>())
    : new Set<string>()

  return {
    // State
    rooms,
    activeRoomId,
    messages,
    onlineUsers,
    typingUsers: activeRoomTypingUsers,
    connected,
    connecting,
    // Actions
    sendMessage,
    setActiveRoom,
    searchUsers,
    createRoom,
    markRead,
    sendTyping,
    loadMoreMessages,
    fetchRooms,
  }
}
