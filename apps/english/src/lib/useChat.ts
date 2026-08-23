// apps/english/src/lib/useChat.ts — Hook quản lý toàn bộ kết nối WebSocket & REST cho Real-time Chat.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  fetchRooms,
  fetchMessages,
  createOrGetDmRoom,
  deleteChatMessage,
  type ChatMessage,
  type RoomSummary,
} from './chatApi'
import type { WsClientEvent, WsServerEvent } from '@dhcb/core-contracts/chat'
import { useAuth } from '../context/useAuth'

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface UseChatOptions {
  initialRoomId?: string | null
  initialPeerId?: string | null
}

export function useChat(options?: UseChatOptions) {
  const { user } = useAuth()
  const currentUserId = user?.id

  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(options?.initialRoomId ?? null)
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({})
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('disconnected')
  const [presence, setPresence] = useState<Record<string, boolean>>({})
  const [typingMap, setTypingMap] = useState<
    Record<string, { userId: string; name: string; expiresAt: number }>
  >({})
  const [chatError, setChatError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const typingTimerMapRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const lastTypingSentRef = useRef<number>(0)

  // 1. Tải danh sách phòng từ REST API
  const refreshRooms = useCallback(async () => {
    if (!currentUserId) return
    const fetchedRooms = await fetchRooms()
    setRooms(fetchedRooms)
    setLoadingRooms(false)
    return fetchedRooms
  }, [currentUserId])

  useEffect(() => {
    void refreshRooms()
  }, [refreshRooms])

  // 2. Tải tin nhắn khi đổi activeRoomId
  const loadMessagesForRoom = useCallback(
    async (roomId: string) => {
      setLoadingMessages(true)
      const list = await fetchMessages(roomId)
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: list,
      }))
      setLoadingMessages(false)

      // Gửi read receipt cho tin nhắn cuối nếu cần
      if (list.length > 0) {
        const lastMsg = list[list.length - 1]
        if (
          lastMsg &&
          lastMsg.senderId !== currentUserId &&
          wsRef.current?.readyState === WebSocket.OPEN
        ) {
          const readEvent: WsClientEvent = {
            type: 'read',
            roomId,
            messageId: lastMsg.id,
          }
          wsRef.current.send(JSON.stringify(readEvent))
        }
      }
    },
    [currentUserId],
  )

  useEffect(() => {
    if (activeRoomId) {
      void loadMessagesForRoom(activeRoomId)
    }
  }, [activeRoomId, loadMessagesForRoom])

  // 3. Xử lý mở chat từ query params initialPeerId
  useEffect(() => {
    if (options?.initialPeerId && currentUserId) {
      void (async () => {
        const res = await createOrGetDmRoom(options.initialPeerId!)
        if (res.ok) {
          setActiveRoomId(res.roomId)
          void refreshRooms()
        }
      })()
    }
  }, [options?.initialPeerId, currentUserId, refreshRooms])

  // 4. Quản lý kết nối WebSocket
  const connectWs = useCallback(() => {
    if (!currentUserId || typeof window === 'undefined') return
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    setWsStatus('connecting')
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setWsStatus('connected')
        setChatError(null)

        // Bật heartbeat ping mỗi 25 giây
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const pingEvent: WsClientEvent = { type: 'ping' }
            ws.send(JSON.stringify(pingEvent))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as WsServerEvent
          if (payload.type === 'message') {
            const msg = payload.message
            // Cập nhật tin nhắn vào phòng
            setMessagesByRoom((prev) => {
              const currentList = prev[msg.roomId] ?? []
              if (currentList.some((m) => m.id === msg.id)) return prev
              return {
                ...prev,
                [msg.roomId]: [...currentList, msg],
              }
            })

            // Cập nhật danh sách phòng (lastMessage, unread count)
            setRooms((prev) => {
              const roomIndex = prev.findIndex((r) => r.roomId === msg.roomId)
              if (roomIndex === -1) {
                void refreshRooms()
                return prev
              }
              const target = prev[roomIndex]
              if (!target) return prev

              const isCurrentRoom = msg.roomId === activeRoomId
              const updatedRoom: RoomSummary = {
                roomId: target.roomId,
                peer: target.peer,
                lastMessage: msg,
                unreadCount:
                  isCurrentRoom || msg.senderId === currentUserId
                    ? target.unreadCount
                    : target.unreadCount + 1,
              }
              const nextRooms = [...prev]
              nextRooms.splice(roomIndex, 1)
              return [updatedRoom, ...nextRooms]
            })

            // Nếu đang xem phòng này và tin nhắn từ đối phương, gửi ngay read receipt
            if (msg.roomId === activeRoomId && msg.senderId !== currentUserId) {
              const readEvent: WsClientEvent = {
                type: 'read',
                roomId: msg.roomId,
                messageId: msg.id,
              }
              ws.send(JSON.stringify(readEvent))
            }
          } else if (payload.type === 'typing') {
            const { roomId, userId, senderName } = payload
            if (userId !== currentUserId) {
              setTypingMap((prev) => ({
                ...prev,
                [roomId]: { userId, name: senderName, expiresAt: Date.now() + 3000 },
              }))

              if (typingTimerMapRef.current[roomId]) {
                clearTimeout(typingTimerMapRef.current[roomId])
              }
              typingTimerMapRef.current[roomId] = setTimeout(() => {
                setTypingMap((prev) => {
                  const next = { ...prev }
                  delete next[roomId]
                  return next
                })
              }, 3000)
            }
          } else if (payload.type === 'presence') {
            setPresence((prev) => ({
              ...prev,
              [payload.userId]: payload.online,
            }))
          } else if (payload.type === 'error') {
            setChatError(payload.message)
          }
        } catch {
          // Bỏ qua JSON không hợp lệ
        }
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        // Tự động kết nối lại sau 3s
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = setTimeout(() => {
          connectWs()
        }, 3000)
      }

      ws.onerror = () => {
        setWsStatus('error')
      }
    } catch {
      setWsStatus('error')
    }
  }, [currentUserId, activeRoomId, refreshRooms])

  useEffect(() => {
    connectWs()
    const timers = typingTimerMapRef.current
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      Object.values(timers).forEach(clearTimeout)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connectWs])

  // 5. Các hành động chat
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!activeRoomId || !content.trim()) return false

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const event: WsClientEvent = {
          type: 'message',
          roomId: activeRoomId,
          content: content.trim(),
        }
        wsRef.current.send(JSON.stringify(event))
        return true
      }
      return false
    },
    [activeRoomId],
  )

  const sendTyping = useCallback(() => {
    if (!activeRoomId) return
    const now = Date.now()
    if (now - lastTypingSentRef.current < 2000) return
    lastTypingSentRef.current = now

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const event: WsClientEvent = {
        type: 'typing',
        roomId: activeRoomId,
      }
      wsRef.current.send(JSON.stringify(event))
    }
  }, [activeRoomId])

  const startChatWithPeer = useCallback(
    async (peerId: string): Promise<string | null> => {
      const res = await createOrGetDmRoom(peerId)
      if (res.ok) {
        setActiveRoomId(res.roomId)
        await refreshRooms()
        return res.roomId
      } else {
        setChatError(res.error)
        return null
      }
    },
    [refreshRooms],
  )

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      const ok = await deleteChatMessage(messageId)
      if (ok && activeRoomId) {
        setMessagesByRoom((prev) => ({
          ...prev,
          [activeRoomId]: (prev[activeRoomId] ?? []).filter((m) => m.id !== messageId),
        }))
      }
      return ok
    },
    [activeRoomId],
  )

  const selectRoom = useCallback((roomId: string | null) => {
    setActiveRoomId(roomId)
    setChatError(null)
  }, [])

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.roomId === activeRoomId) ?? null
  }, [rooms, activeRoomId])

  const activeMessages = useMemo(() => {
    return activeRoomId ? (messagesByRoom[activeRoomId] ?? []) : []
  }, [activeRoomId, messagesByRoom])

  const isPeerOnline = useMemo(() => {
    if (!activeRoom?.peer?.id) return false
    return !!presence[activeRoom.peer.id]
  }, [activeRoom, presence])

  const isPeerTyping = useMemo(() => {
    if (!activeRoomId) return false
    const typingInfo = typingMap[activeRoomId]
    return !!typingInfo && typingInfo.expiresAt > Date.now()
  }, [activeRoomId, typingMap])

  return {
    rooms,
    activeRoomId,
    activeRoom,
    messages: activeMessages,
    loadingRooms,
    loadingMessages,
    wsStatus,
    presence,
    chatError,
    isPeerOnline,
    isPeerTyping,
    currentUserId,
    selectRoom,
    startChatWithPeer,
    sendMessage,
    sendTyping,
    deleteMessage,
    refreshRooms,
  }
}
