import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import ChatPage from './ChatPage'
import * as chatApi from '../lib/chatApi'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-self', name: 'Self User' },
  }),
}))

vi.mock('@core/ToastProvider', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('../components/Layout', () => ({
  default: () => <div data-testid="layout">Layout Mock</div>,
}))

describe('ChatPage Component', () => {
  let container: HTMLDivElement
  let root: Root

  const mockRooms: chatApi.RoomSummary[] = [
    {
      roomId: 'room-1',
      peer: { id: 'peer-1', name: 'Nguyen Van A' },
      lastMessage: {
        id: 'msg-1',
        roomId: 'room-1',
        senderId: 'peer-1',
        senderName: 'Nguyen Van A',
        content: 'Xin chào bạn!',
        createdAt: '2026-08-18T07:00:00Z',
      },
      unreadCount: 2,
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
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    vi.spyOn(chatApi, 'fetchRooms').mockResolvedValue(mockRooms)
    vi.spyOn(chatApi, 'fetchMessages').mockResolvedValue([])

    mockWsInstance = {
      readyState: 1,
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

  it('renders chat list with rooms and unread count', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/tin-nhan']}>
          <ChatPage />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Tin nhắn')
    expect(container.textContent).toContain('Nguyen Van A')
    expect(container.textContent).toContain('Xin chào bạn!')
    expect(container.textContent).toContain('2')
  })

  it('shows empty placeholder when no room is selected', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/tin-nhan']}>
          <ChatPage />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Chọn một cuộc trò chuyện')
  })

  it('opens conversation when initialRoomId is provided', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/tin-nhan?roomId=room-1']}>
          <ChatPage />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Nguyen Van A')
    expect(container.textContent).toContain('Bảo vệ nội dung')
  })
})
