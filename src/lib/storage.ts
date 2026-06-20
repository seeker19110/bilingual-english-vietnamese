import type { User, ChatSession, WritingSubmission, SpeakingSession, DailyUsage, Direction } from '../types'

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
  } catch { return null }
}

function set<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function hashPassword(pw: string): string {
  // Prototype — không dùng trong production thật
  return btoa(encodeURIComponent(pw))
}

export function register(email: string, name: string, password: string): User | null {
  const users = get<(User & { pwHash: string })[]>(K.users) ?? []
  if (users.find(u => u.email === email)) return null // email đã tồn tại
  const user: User = { id: crypto.randomUUID(), email, name, plan: 'free', createdAt: Date.now() }
  users.push({ ...user, pwHash: hashPassword(password) })
  set(K.users, users)
  set(K.currentUser, user)
  return user
}

export function login(email: string, password: string): User | null {
  const users = get<(User & { pwHash: string })[]>(K.users) ?? []
  const found = users.find(u => u.email === email && u.pwHash === hashPassword(password))
  if (!found) return null
  const { pwHash: _, ...user } = found
  void _
  set(K.currentUser, user)
  return user
}

export function logout() {
  localStorage.removeItem(K.currentUser)
}

export function getCurrentUser(): User | null {
  return get<User>(K.currentUser)
}

// ─── Tài khoản mặc định "everyone" ───────────────────────────────────────────
// Khi chạy app lần đầu (hoặc chưa đăng nhập), tự động tạo và đăng nhập
// vào tài khoản dùng chung này để không cần màn hình login.
const GUEST_EMAIL = 'everyone@tutor.local'
const GUEST_PASSWORD = 'everyone'
const GUEST_NAME = 'Khách'

export function ensureDefaultUser(): User {
  const current = getCurrentUser()
  if (current) return current

  // Thử đăng nhập tài khoản đã tồn tại
  const existing = login(GUEST_EMAIL, GUEST_PASSWORD)
  if (existing) return existing

  // Chưa có → tạo mới
  const created = register(GUEST_EMAIL, GUEST_NAME, GUEST_PASSWORD)
  return created! // luôn thành công vì email chưa tồn tại
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
