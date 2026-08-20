// packages/core-ai/coLearningRoomService.ts — Giao thức Phòng Học Nhóm Thời Gian Thực Có AI Socratic Điều Phối (Multiplayer Co-learning Protocol)
import { randomUUID } from 'node:crypto'

export interface CoLearningMember {
  id: string
  personId: string
  name: string
  role: 'learner' | 'peer_tutor' | 'moderator'
  joinedAt: number
}

export interface CoLearningMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  isAiModerator: boolean
  content: string
  timestamp: number
  socraticType?:
    | 'clarification'
    | 'probing_assumptions'
    | 'probing_reasons'
    | 'viewpoint_alternative'
    | 'summary'
}

export interface CoLearningRoom {
  id: string
  topic: string
  subject: string
  members: CoLearningMember[]
  messages: CoLearningMessage[]
  isActive: boolean
  createdAt: number
}

export interface SocraticInterventionResult {
  shouldIntervene: boolean
  interventionMessage?: string
  socraticType?: CoLearningMessage['socraticType']
}

/** Tạo phòng học nhóm mới */
export function createCoLearningRoom(
  topic: string,
  subject: string,
  host: CoLearningMember,
): CoLearningRoom {
  return {
    id: `room-${randomUUID()}`,
    topic,
    subject,
    members: [host],
    messages: [
      {
        id: `msg-welcome`,
        roomId: '',
        senderId: 'ai-moderator',
        senderName: 'Bạn Đồng Hành (AI Socratic Moderator)',
        isAiModerator: true,
        content: `Chào mừng các bạn đến với phòng học nhóm về chủ đề "${topic}". Tôi sẽ đồng hành gợi mở và hỗ trợ các bạn thảo luận hiệu quả!`,
        timestamp: Date.now(),
        socraticType: 'clarification',
      },
    ],
    isActive: true,
    createdAt: Date.now(),
  }
}

/** Phân tích hội thoại để phát hiện bế tắc kiến thức hoặc mâu thuẫn nhận thức cần AI Socratic can thiệp */
export function evaluateSocraticIntervention(
  recentMessages: CoLearningMessage[],
  roomTopic: string,
): SocraticInterventionResult {
  if (recentMessages.length < 2) {
    return { shouldIntervene: false }
  }

  const lastMsg = recentMessages[recentMessages.length - 1]
  if (!lastMsg || lastMsg.isAiModerator) {
    return { shouldIntervene: false }
  }

  const text = lastMsg.content.toLowerCase()

  // 1. Phát hiện học viên hỏi về định nghĩa hoặc bối rối ("không hiểu", "tại sao", "khác nhau thế nào")
  if (/không hiểu|khó hiểu|tại sao lại|khác nhau thế nào|là gì/i.test(text)) {
    return {
      shouldIntervene: true,
      interventionMessage: `Một câu hỏi rất hay từ ${lastMsg.senderName}! Trước khi đi vào câu trả lời trực tiếp, các bạn hãy thử nghĩ xem: Điểm mấu chốt tạo nên sự khác biệt trong ngữ cảnh này là gì?`,
      socraticType: 'probing_reasons',
    }
  }

  // 2. Phát hiện tranh luận 2 luồng quan điểm ("tôi nghĩ là", "nhưng mà", "không đồng ý")
  if (/nhưng mà|không đồng ý|sai rồi|ngược lại/i.test(text)) {
    return {
      shouldIntervene: true,
      interventionMessage: `Tôi nhận thấy có hai góc nhìn thú vị đang được đưa ra. Cả hai bạn có thể chia sẻ thêm bằng chứng hoặc ví dụ cụ thể nào củng cố cho quan điểm của mình không?`,
      socraticType: 'probing_assumptions',
    }
  }

  // 3. Khuyến khích mở rộng góc nhìn khi cuộc trò chuyện ngắn gọn
  if (recentMessages.length >= 4 && recentMessages.every((m) => !m.isAiModerator)) {
    return {
      shouldIntervene: true,
      interventionMessage: `Các bạn đang thảo luận rất tích cực về "${roomTopic}". Nếu chúng ta thử áp dụng góc nhìn này vào một tình huống thực tế khác, kết quả sẽ thay đổi ra sao?`,
      socraticType: 'viewpoint_alternative',
    }
  }

  return { shouldIntervene: false }
}

/** Gửi tin nhắn vào phòng học nhóm và tự động kích hoạt AI Socratic Moderator nếu cần */
export function postMessageToRoom(
  room: CoLearningRoom,
  message: { senderId: string; senderName: string; content: string },
): { updatedRoom: CoLearningRoom; aiReply?: CoLearningMessage } {
  const userMsg: CoLearningMessage = {
    id: `msg-${randomUUID()}`,
    roomId: room.id,
    senderId: message.senderId,
    senderName: message.senderName,
    isAiModerator: false,
    content: message.content,
    timestamp: Date.now(),
  }

  const updatedMessages = [...room.messages, userMsg]
  const intervention = evaluateSocraticIntervention(updatedMessages.slice(-5), room.topic)

  let aiReply: CoLearningMessage | undefined = undefined
  if (intervention.shouldIntervene && intervention.interventionMessage) {
    aiReply = {
      id: `msg-ai-${randomUUID()}`,
      roomId: room.id,
      senderId: 'ai-moderator',
      senderName: 'Bạn Đồng Hành (AI Moderator)',
      isAiModerator: true,
      content: intervention.interventionMessage,
      timestamp: Date.now() + 10,
      socraticType: intervention.socraticType,
    }
    updatedMessages.push(aiReply)
  }

  const updatedRoom: CoLearningRoom = {
    ...room,
    messages: updatedMessages,
  }

  return { updatedRoom, aiReply }
}
