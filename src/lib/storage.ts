import type { User, ChatSession, WritingSubmission, SpeakingSession, DailyUsage } from '../types'

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
