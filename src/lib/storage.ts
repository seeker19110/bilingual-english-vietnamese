import type {
  User,
  ChatSession,
  WritingSubmission,
  SpeakingSession,
  DailyUsage,
  Direction,
} from '../types'
// Mỗi lần lưu xuống localStorage, ta cũng đẩy bản ghi lên Supabase (bắn rồi quên)
import { pushChatSession, pushWritingSub, pushSpeakingSession, pushLearnDay } from './cloud'
import { vnDateStr } from './date'

// ─── Keys ────────────────────────────────────────────────────────────────────
const K = {
  currentUser: 'et_current_user',
  users: 'et_users',
  chatSessions: (uid: string) => `et_chat_${uid}`,
  writingSubs: (uid: string) => `et_writing_${uid}`,
  speakingSessions: (uid: string) => `et_speaking_${uid}`,
  usage: (uid: string, date: string) => `et_usage_${uid}_${date}`,
}

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

// Ghi localStorage AN TOÀN: bắt lỗi (đầy bộ nhớ / chế độ riêng tư của Safari) để
// không làm crash luồng lưu chat/viết/nói. Dữ liệu thật vẫn được đồng bộ lên Supabase
// (pushChatSession/...), nên lỗi cache cục bộ không làm mất dữ liệu.
function set<T>(key: string, val: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(val))
    return true
  } catch (err) {
    console.warn('[storage] không ghi được localStorage (bỏ qua, vẫn đồng bộ cloud):', err)
    return false
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// LƯU Ý BẢO MẬT: hashPassword() và verifyPassword() đã bị XÓA vì dùng btoa()
// (base64 — không phải hashing thật, có thể đảo ngược dễ dàng).
// Xác thực thật sự được xử lý qua Supabase Auth (src/lib/auth.ts).
// Các hàm register/login/logout bên dưới chỉ còn dùng để quản lý localStorage guest user.

export function register(email: string, name: string, _password: string): User | null {
  void _password // không còn dùng — giữ lại tham số để không phải sửa nơi gọi
  const users = get<(User & { pwHash?: string })[]>(K.users) ?? []
  if (users.find((u) => u.email === email)) return null // email đã tồn tại
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    plan: 'free',
    onboarded: false,
    createdAt: Date.now(),
  }
  users.push({ ...user })
  set(K.users, users)
  set(K.currentUser, user)
  return user
}

export function login(email: string, _password: string): User | null {
  void _password // không còn dùng — giữ lại tham số để không phải sửa nơi gọi
  // Tìm theo email — không còn kiểm tra password vì storage.ts không dùng cho auth thật
  // (auth thật dùng Supabase — xem src/lib/auth.ts)
  const users = get<(User & { pwHash?: string })[]>(K.users) ?? []
  const found = users.find((u) => u.email === email)
  if (!found) return null
  const { pwHash: _pw, ...user } = found
  void _pw
  set(K.currentUser, user)
  return user
}

export function logout() {
  localStorage.removeItem(K.currentUser)
}

export function getCurrentUser(): User | null {
  return get<User>(K.currentUser)
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export function getChatSessions(userId: string): ChatSession[] {
  return get<ChatSession[]>(K.chatSessions(userId)) ?? []
}

export function saveChatSession(session: ChatSession) {
  const all = getChatSessions(session.userId)
  const idx = all.findIndex((s) => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  set(K.chatSessions(session.userId), all)
  pushChatSession(session) // đồng bộ lên Supabase
}

// ─── Writing ──────────────────────────────────────────────────────────────────
export function getWritingSubs(userId: string): WritingSubmission[] {
  return get<WritingSubmission[]>(K.writingSubs(userId)) ?? []
}

export function saveWritingSub(sub: WritingSubmission) {
  const all = getWritingSubs(sub.userId)
  const idx = all.findIndex((s) => s.id === sub.id)
  if (idx >= 0) all[idx] = sub
  else all.unshift(sub)
  set(K.writingSubs(sub.userId), all)
  pushWritingSub(sub) // đồng bộ lên Supabase
}

// ─── Speaking ─────────────────────────────────────────────────────────────────
export function getSpeakingSessions(userId: string): SpeakingSession[] {
  return get<SpeakingSession[]>(K.speakingSessions(userId)) ?? []
}

export function saveSpeakingSession(session: SpeakingSession) {
  const all = getSpeakingSessions(session.userId)
  const idx = all.findIndex((s) => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  set(K.speakingSessions(session.userId), all)
  pushSpeakingSession(session) // đồng bộ lên Supabase
}

// ─── Usage ────────────────────────────────────────────────────────────────────
function todayStr() {
  return vnDateStr()
}

export function getUsage(userId: string): DailyUsage {
  const date = todayStr()
  const u = get<DailyUsage>(K.usage(userId, date)) ?? {
    date,
    chatCount: 0,
    writingCount: 0,
    speakingCount: 0,
    sttCount: 0,
    learnCount: 0,
  }
  // Bản local cũ có thể thiếu sttCount/learnCount (lưu trước khi thêm tính năng) — bù mặc định.
  if (u.sttCount == null) u.sttCount = 0
  if (u.learnCount == null) u.learnCount = 0
  return u
}

// Tăng lượt CHỈ ở localStorage để giao diện phản hồi tức thì. Số lượt THẬT do SERVER
// đếm authoritative (api/_lib/usage.ts) trong daily_usage; khi mở trang, pullUserData
// kéo số chính xác từ Supabase về ghi đè bản local — nên client KHÔNG đẩy lượt nữa
// (tránh đếm trùng / bị sửa localStorage để gian lận giới hạn).
export function incrementUsage(
  userId: string,
  field: 'chatCount' | 'writingCount' | 'speakingCount' | 'sttCount',
) {
  const usage = getUsage(userId)
  usage[field]++
  set(K.usage(userId, todayStr()), usage)
}

// Ghi nhận "đã học từ vựng hôm nay" để tính chuỗi ngày liên tiếp (streak).
// Khác incrementUsage: việc học từ KHÔNG tốn API và KHÔNG do server đếm tự động,
// nên ở đây client vừa lưu local vừa CHỦ ĐỘNG đẩy lên Supabase (daily_usage.learn_count)
// để đổi máy / xoá cache vẫn giữ được streak (đồng bộ cả server và client).
export function markStudiedToday(userId: string) {
  const usage = getUsage(userId)
  usage.learnCount = (usage.learnCount ?? 0) + 1
  set(K.usage(userId, todayStr()), usage)
  pushLearnDay(userId, usage.date, usage.learnCount) // đồng bộ lên server (chỉ cột learn_count)
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
// Tính số ngày liên tiếp có học (streak) — tối đa 365 ngày.
// "Có học" = bất kỳ hoạt động nào trong ngày: chat / viết / nói / STT / HỌC TỪ VỰNG.
// Dữ liệu đọc từ localStorage (đã được pullUserData đồng bộ từ Supabase tối đa 365 ngày),
// nên streak nhất quán giữa các máy.
const STREAK_MAX_DAYS = 365

function hasActivityOn(usage: DailyUsage | null): boolean {
  if (!usage) return false
  const total =
    usage.chatCount +
    usage.writingCount +
    usage.speakingCount +
    (usage.sttCount ?? 0) +
    (usage.learnCount ?? 0)
  return total > 0
}

export function getStreak(userId: string): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < STREAK_MAX_DAYS; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = vnDateStr(d)
    const usage = get<DailyUsage>(K.usage(userId, dateStr))
    if (hasActivityOn(usage)) {
      streak++
    } else if (i > 0) {
      // Ngày trước không có hoạt động → streak đứt
      break
    }
    // i === 0 (hôm nay) chưa học: cho qua, kiểm tra hôm qua xem streak còn không
  }
  return Math.min(streak, STREAK_MAX_DAYS)
}
