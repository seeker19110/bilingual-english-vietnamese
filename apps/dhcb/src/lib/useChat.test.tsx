import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useChat, type UseChatOptions } from './useChat'
import * as chatApi from './chatApi'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../context/useAuth.js', () => ({
  useAuth: () => ({
    user: { id: 'user-self', name: 'Self User' },
  }),
}))

let hookState: ReturnType<typeof useChat> | undefined

function TestChatConsumer({ options }: { options?: UseChatOptions }) {
  hookState = useChat(options)
  return null
}

describe('useChat hook', () => {
  let container: HTMLDivElement
  let root: Root

  const mockRooms: chatApi.RoomSummary[] = [
    {
      roomId: 'room-1',
      peer: { id: 'peer-1', name: 'Friend One' },
      lastMessage: null,
      unreadCount: 0,
    },
  ]

  const mockMessages: chatApi.ChatMessage[] = [
    {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'peer-1',
      senderName: 'Friend One',
      content: 'Chào bạn!',
      createdAt: '2026-08-18T07:00:00Z',
    },
  ]

  interface MockWsType {
    readyState: number
    send: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
    onopen: (() => void) | null
    onmessage: ((event: { data: string }) => void) | null
    onclose: (() => void) | null
    onerror: (() => void) | null
  }

  let mockWsInstance: MockWsType

  beforeEach(() => {
    vi.restoreAllMocks()
    hookState = undefined
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.spyOn(chatApi, 'fetchRooms').mockResolvedValue(mockRooms)
    vi.spyOn(chatApi, 'fetchMessages').mockResolvedValue(mockMessages)
    vi.spyOn(chatApi, 'createOrGetDmRoom').mockResolvedValue({ ok: true, roomId: 'room-2' })
    vi.spyOn(chatApi, 'deleteChatMessage').mockResolvedValue(true)

    // Mock WebSocket
    mockWsInstance = {
      readyState: 1, // WebSocket.OPEN
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    }

    class MockWebSocket {
      static OPEN = 1
      static CONNECTING = 0
      static CLOSED = 3

      constructor() {
        Object.assign(this, mockWsInstance)
        setTimeout(() => {
          if (mockWsInstance.onopen) mockWsInstance.onopen()
        }, 0)
        return mockWsInstance
      }
    }
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('fetches rooms on mount and updates state', async () => {
    await act(async () => {
      root.render(<TestChatConsumer />)
    })

    expect(hookState?.rooms).toEqual(mockRooms)
    expect(hookState?.loadingRooms).toBe(false)
  })

  it('selectRoom updates activeRoomId and loads messages', async () => {
    await act(async () => {
      root.render(<TestChatConsumer />)
    })

    await act(async () => {
      hookState?.selectRoom('room-1')
    })

    expect(hookState?.activeRoomId).toBe('room-1')
    expect(hookState?.messages).toEqual(mockMessages)
  })

  it('sendMessage calls websocket send with correct payload', async () => {
    await act(async () => {
      root.render(<TestChatConsumer options={{ initialRoomId: 'room-1' }} />)
    })

    await act(async () => {
      hookState?.sendMessage('Chào bạn nhé!')
    })

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'message',
        roomId: 'room-1',
        content: 'Chào bạn nhé!',
      }),
    )
  })

  it('startChatWithPeer creates room and sets it active', async () => {
    await act(async () => {
      root.render(<TestChatConsumer />)
    })

    let roomId: string | null = null
    await act(async () => {
      roomId = (await hookState?.startChatWithPeer('peer-2')) ?? null
    })

    expect(roomId).toBe('room-2')
    expect(hookState?.activeRoomId).toBe('room-2')
  })

  it('deleteMessage removes message from local state', async () => {
    await act(async () => {
      root.render(<TestChatConsumer options={{ initialRoomId: 'room-1' }} />)
    })

    expect(hookState?.messages).toHaveLength(1)

    await act(async () => {
      await hookState?.deleteMessage('msg-1')
    })

    expect(hookState?.messages).toHaveLength(0)
  })
})
