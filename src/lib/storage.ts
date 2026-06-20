import type { ChatSession, WritingSubmission, SpeakingSession, DailyUsage, Direction } from '../types'

// ─── Keys ────────────────────────────────────────────────────────────────────
// Đăng nhập/đăng ký THẬT giờ dùng Supabase Auth — xem src/context/AuthContext.tsx
// (src/lib/supabaseClient.ts). File này chỉ còn lưu DỮ LIỆU HỌC TẬP (lịch sử
// chat/viết/nói, số lượt dùng, chiều học) ở localStorage, khoá theo userId lấy
// từ Supabase (uid thật, ổn định) thay vì id tự sinh cũ.
const K = {
  chatSessions: (uid: string) => `et_chat_${uid}`,
  writingSubs: (uid: string) => `et_writing_${uid}`,
  speakingSessions: (uid: string) => `et_speaking_${uid}`,
  usage: (uid: string, date: string) => `et_usage_${uid}_${date}`,
}

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

function set<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export function getChatSessions(userId: string): ChatSession[] {
  return get<ChatSession[]>(K.chatSessions(userId)) ?? []
}

export function saveChatSession(session: ChatSession) {
  const all = getChatSessions(session.userId)
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  set(K.chatSessions(session.userId), all)
}

// ─── Writing ──────────────────────────────────────────────────────────────────
export function getWritingSubs(userId: string): WritingSubmission[] {
  return get<WritingSubmission[]>(K.writingSubs(userId)) ?? []
}

export function saveWritingSub(sub: WritingSubmission) {
  const all = getWritingSubs(sub.userId)
  const idx = all.findIndex(s => s.id === sub.id)
  if (idx >= 0) all[idx] = sub
  else all.unshift(sub)
  set(K.writingSubs(sub.userId), all)
}

// ─── Speaking ─────────────────────────────────────────────────────────────────
export function getSpeakingSessions(userId: string): SpeakingSession[] {
  return get<SpeakingSession[]>(K.speakingSessions(userId)) ?? []
}

export function saveSpeakingSession(session: SpeakingSession) {
  const all = getSpeakingSessions(session.userId)
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  set(K.speakingSessions(session.userId), all)
}

// ─── Usage ────────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function getUsage(userId: string): DailyUsage {
  const date = todayStr()
  return get<DailyUsage>(K.usage(userId, date)) ?? { date, chatCount: 0, writingCount: 0, speakingCount: 0 }
}

export function incrementUsage(userId: string, field: 'chatCount' | 'writingCount' | 'speakingCount') {
  const usage = getUsage(userId)
  usage[field]++
  set(K.usage(userId, todayStr()), usage)
}

// ─── Direction (chiều học) ────────────────────────────────────────────────────
const DIRECTION_KEY = 'et_direction'

export function getDirection(): Direction {
  return (localStorage.getItem(DIRECTION_KEY) as Direction) ?? 'A'
}

export function setDirection(dir: Direction) {
  localStorage.setItem(DIRECTION_KEY, dir)
}

// ─── Streak ───────────────────────────────────────────────────────────────────
// Tính số ngày liên tiếp có học (streak)
export function getStreak(userId: string): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const usage = get<DailyUsage>(K.usage(userId, dateStr))
    const hasActivity = usage && (usage.chatCount + usage.writingCount + usage.speakingCount > 0)
    if (hasActivity) {
      streak++
    } else if (i > 0) {
      // Không có hoạt động từ hôm qua trở về — streak kết thúc
      break
    }
    // i === 0 chưa học hôm nay: bỏ qua, kiểm tra hôm qua
  }
  return streak
}
