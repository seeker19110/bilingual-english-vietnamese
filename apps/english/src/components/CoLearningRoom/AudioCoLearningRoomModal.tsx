// apps/english/src/components/CoLearningRoom/AudioCoLearningRoomModal.tsx — UI Modal Phòng Học Nhóm Âm Thanh Trực Tiếp V7.1.
import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Mic,
  MicOff,
  Users,
  Volume2,
  Sparkles,
  MessageSquare,
  Radio,
  Send,
  HelpCircle,
} from 'lucide-react'
import type { AudioRoomState } from '../../../../../packages/core-contracts/audioCoLearningRoom.js'
import {
  createAudioRoomApi,
  leaveAudioRoomApi,
  requestSocraticHintApi,
} from '../../lib/coLearningAudioApi.js'

interface AudioCoLearningRoomModalProps {
  isOpen: boolean
  onClose: () => void
  initialSubject?: string
  initialTopic?: string
}

export const AudioCoLearningRoomModal: React.FC<AudioCoLearningRoomModalProps> = ({
  isOpen,
  onClose,
  initialSubject = 'english',
  initialTopic = 'Luyện phát âm & Hội thoại nhóm',
}) => {
  const [currentRoom, setCurrentRoom] = useState<AudioRoomState | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState(initialTopic)
  const [subject, setSubject] = useState(initialSubject)
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: string; text: string; isAi?: boolean }>
  >([])
  const [inputChat, setInputChat] = useState('')
  const [aiHints, setAiHints] = useState<string[]>([
    'Chào mừng bạn đến với phòng học nhóm âm thanh! Bật micro để cùng thảo luận.',
  ])

  const wsRef = useRef<WebSocket | null>(null)
  const roomRef = useRef<AudioRoomState | null>(null)
  roomRef.current = currentRoom

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
        void leaveAudioRoomApi(roomRef.current.id)
      }
    }
  }, [])

  const handleCreateRoom = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const room = await createAudioRoomApi({
        topic,
        subject,
      })
      setCurrentRoom(room)
      connectWebSocket(room.id)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }

  const connectWebSocket = (roomId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/co-learning-room`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join_room',
          roomId,
          displayName: 'Tôi',
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'room_event') {
          const roomEvent = data.event
          if (roomEvent.type === 'ai_socratic_hint') {
            const hint = roomEvent.payload?.hint as string
            if (hint) {
              setAiHints((prev) => [...prev, hint])
            }
          }
        } else if (data.type === 'room_chat_message') {
          setChatMessages((prev) => [...prev, { sender: data.senderName, text: data.content }])
        }
      } catch {
        // non-json or binary audio
      }
    }

    ws.onerror = () => {
      setError('Lỗi kết nối WebSocket phòng âm thanh.')
    }
  }

  const handleLeaveRoom = async () => {
    if (currentRoom) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      await leaveAudioRoomApi(currentRoom.id)
      setCurrentRoom(null)
    }
  }

  const handleSendChat = () => {
    if (!inputChat.trim() || !currentRoom) return
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat_message',
          roomId: currentRoom.id,
          content: inputChat.trim(),
        }),
      )
    }
    setChatMessages((prev) => [...prev, { sender: 'Tôi', text: inputChat.trim() }])
    setInputChat('')
  }

  const handleRequestAiHint = async () => {
    if (!currentRoom) return
    try {
      await requestSocraticHintApi(currentRoom.id)
    } catch {
      // Ignored
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Phòng Học Nhóm Âm Thanh Trực Tiếp</h2>
              <p className="text-xs text-zinc-400">
                Co-learning Room với AI Socratic Moderator hỗ trợ thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleLeaveRoom()
              onClose()
            }}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Nội dung */}
        {!currentRoom ? (
          /* Màn hình tạo phòng */
          <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
            <Users className="mb-4 h-12 w-12 text-accent-400" />
            <h3 className="text-base font-semibold text-zinc-100">Bắt đầu buổi học nhóm</h3>
            <p className="mb-6 max-w-md text-sm text-zinc-400">
              Tạo phòng âm thanh trực tiếp để thảo luận, luyện phát âm và giải bài tập cùng nhau
              dưới sự gợi mở của AI.
            </p>

            <div className="w-full max-w-md space-y-4 text-left">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Chủ đề thảo luận
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="VD: Luyện phản xạ IELTS Speaking Part 3"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Môn học</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none"
                >
                  <option value="english">Tiếng Anh (English)</option>
                  <option value="math">Toán học (Math)</option>
                  <option value="physics">Vật lý (Physics)</option>
                  <option value="chemistry">Hóa học (Chemistry)</option>
                  <option value="biology">Sinh học (Biology)</option>
                </select>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isLoading || !topic.trim()}
                className="w-full rounded-xl bg-accent-500 py-3 font-semibold text-zinc-950 transition hover:bg-accent-400 disabled:opacity-50"
              >
                {isLoading ? 'Đang tạo phòng...' : 'Tạo phòng & Bắt đầu'}
              </button>
            </div>
          </div>
        ) : (
          /* Màn hình trong phòng học */
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden pt-4 md:grid-cols-3">
            {/* Cột trái: Danh sách thành viên & Audio Visualizer */}
            <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-400">
                    {currentRoom.subject.toUpperCase()}
                  </span>
                  <h3 className="mt-1 font-semibold text-zinc-100">{currentRoom.topic}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isMuted
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-accent-500 text-zinc-950 hover:bg-accent-400'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isMuted ? 'Đang tắt mic' : 'Đang bật mic'}
                  </button>
                </div>
              </div>

              {/* Lưới học viên */}
              <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                {currentRoom.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-center"
                  >
                    <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-zinc-100">
                      {member.displayName.slice(0, 2).toUpperCase()}
                      {member.isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                          <Volume2 className="h-3 w-3 animate-bounce" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-zinc-200">{member.displayName}</span>
                    <span className="text-[10px] text-zinc-500">{member.role}</span>
                  </div>
                ))}
              </div>

              {/* Gợi ý AI Socratic Banner */}
              <div className="rounded-xl border border-accent-500/20 bg-accent-950/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent-400">
                    <Sparkles className="h-4 w-4" />
                    AI Socratic Moderator
                  </div>
                  <button
                    onClick={handleRequestAiHint}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-accent-400"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Xin gợi ý
                  </button>
                </div>
                <p className="text-xs text-zinc-300">
                  {aiHints[aiHints.length - 1] || 'Đang lắng nghe cuộc thảo luận...'}
                </p>
              </div>
            </div>

            {/* Cột phải: Chat văn bản kèm theo */}
            <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-semibold text-zinc-300">
                <MessageSquare className="h-4 w-4 text-accent-400" />
                Thảo luận song song
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="rounded-lg bg-zinc-950 p-2">
                    <span className="font-semibold text-accent-400">{msg.sender}: </span>
                    <span className="text-zinc-200">{msg.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                />
                <button
                  onClick={handleSendChat}
                  className="rounded-xl bg-accent-500 px-3 py-2 text-zinc-950 hover:bg-accent-400"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
