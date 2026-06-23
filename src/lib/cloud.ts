// cloud.ts — Đồng bộ dữ liệu người dùng lên Supabase (chat, viết, nói, lượt dùng).
//
// Ý tưởng: localStorage vẫn là "bộ nhớ đệm" cho đọc nhanh + chạy offline.
// Mỗi lần lưu, ta ĐẨY (push) bản ghi lên Supabase theo kiểu "bắn rồi quên"
// (không chặn giao diện). Khi mở app/trang, ta KÉO (pull) dữ liệu từ Supabase
// về ghi đè vào localStorage để các máy/trình duyệt khác thấy cùng dữ liệu.
//
// Tất cả bảng đã bật RLS (xem supabase/schema.sql) nên client chỉ đọc/ghi được
// dữ liệu của chính tài khoản đang đăng nhập — an toàn dù dùng anon key.

import { supabase } from './supabase'
import type { ChatSession, WritingSubmission, SpeakingSession, DailyUsage } from '../types'

// Khóa localStorage — PHẢI khớp với storage.ts để dùng chung bộ nhớ đệm
const K = {
  chat: (uid: string) => `et_chat_${uid}`,
  writing: (uid: string) => `et_writing_${uid}`,
  speaking: (uid: string) => `et_speaking_${uid}`,
  usage: (uid: string, date: string) => `et_usage_${uid}_${date}`,
}

function setLocal<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* hết dung lượng — bỏ qua */ }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Ghi log lỗi đồng bộ nhẹ nhàng — KHÔNG làm vỡ giao diện (vẫn còn bản localStorage)
function warn(where: string, error: { message: string } | null) {
  if (error) console.warn(`[cloud] đồng bộ ${where} lỗi:`, error.message)
}

// ── Chuyển đổi giữa hàng DB (snake_case) và kiểu của app (camelCase) ──────────
function rowToChat(r: unknown): ChatSession {
  if (!r || typeof r !== 'object') throw new Error('Invalid chat row')
  const row = r as Record<string, unknown>
  return {
    id: typeof row.id === 'string' ? row.id : '',
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    situation: typeof row.situation === 'string' ? row.situation : '',
    level: typeof row.level === 'string' ? row.level : 'beginner',
    messages: Array.isArray(row.messages) ? row.messages : [],
    createdAt: typeof row.created_at === 'number' || typeof row.created_at === 'string' ? Number(row.created_at) : Date.now()
  }
}
function chatToRow(s: ChatSession) {
  return { id: s.id, user_id: s.userId, situation: s.situation, level: s.level, messages: s.messages, created_at: s.createdAt }
}
function rowToSpeaking(r: unknown): SpeakingSession {
  if (!r || typeof r !== 'object') throw new Error('Invalid speaking row')
  const row = r as Record<string, unknown>
  return {
    id: typeof row.id === 'string' ? row.id : '',
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    situation: typeof row.situation === 'string' ? row.situation : '',
    level: typeof row.level === 'string' ? row.level : 'beginner',
    messages: Array.isArray(row.messages) ? row.messages : [],
    createdAt: typeof row.created_at === 'number' || typeof row.created_at === 'string' ? Number(row.created_at) : Date.now()
  }
}
function speakingToRow(s: SpeakingSession) {
  return { id: s.id, user_id: s.userId, situation: s.situation, level: s.level, messages: s.messages, created_at: s.createdAt }
}
function rowToWriting(r: unknown): WritingSubmission {
  if (!r || typeof r !== 'object') throw new Error('Invalid writing row')
  const row = r as Record<string, unknown>
  return {
    id: typeof row.id === 'string' ? row.id : '',
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    essayPrompt: typeof row.essay_prompt === 'string' ? row.essay_prompt : '',
    essay: typeof row.essay === 'string' ? row.essay : '',
    feedback: typeof row.feedback === 'string' ? row.feedback : '',
    submittedAt: typeof row.submitted_at === 'number' || typeof row.submitted_at === 'string' ? Number(row.submitted_at) : Date.now()
  }
}
function writingToRow(s: WritingSubmission) {
  return { id: s.id, user_id: s.userId, essay_prompt: s.essayPrompt, essay: s.essay, feedback: s.feedback, submitted_at: s.submittedAt }
}

// ── PUSH: đẩy 1 bản ghi lên Supabase (bắn rồi quên) ──────────────────────────
export function pushChatSession(s: ChatSession) {
  void supabase.from('chat_sessions').upsert(chatToRow(s)).then(({ error }) => warn('chat', error))
}
export function pushSpeakingSession(s: SpeakingSession) {
  void supabase.from('speaking_sessions').upsert(speakingToRow(s)).then(({ error }) => warn('speaking', error))
}
export function pushWritingSub(s: WritingSubmission) {
  void supabase.from('writing_submissions').upsert(writingToRow(s)).then(({ error }) => warn('writing', error))
}
export function pushUsage(userId: string, usage: DailyUsage) {
  void supabase.from('daily_usage').upsert({
    user_id: userId,
    day: usage.date,
    chat_count: usage.chatCount,
    writing_count: usage.writingCount,
    speaking_count: usage.speakingCount,
    stt_count: usage.sttCount,
  }).then(({ error }) => warn('usage', error))
}

// ── PULL: kéo toàn bộ dữ liệu của user về ghi vào localStorage ────────────────
// Gọi khi đăng nhập / mở trang. Lỗi mạng sẽ bị nuốt (vẫn dùng được bản local cũ).
export async function pullUserData(userId: string): Promise<void> {
  const date = todayStr()
  const results = await Promise.allSettled([
    supabase.from('chat_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('writing_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }),
    supabase.from('speaking_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('daily_usage').select('*').eq('user_id', userId).eq('day', date).maybeSingle(),
  ])

  const [chatResult, writingResult, speakingResult, usageResult] = results

  if (chatResult.status === 'fulfilled') {
    const chat = chatResult.value
    if (!chat.error && chat.data) setLocal(K.chat(userId), chat.data.map(rowToChat))
    else if (chat.error) warn('pull chat', chat.error)
  } else {
    console.warn('[cloud] chat query rejected:', chatResult.reason)
  }

  if (writingResult.status === 'fulfilled') {
    const writing = writingResult.value
    if (!writing.error && writing.data) setLocal(K.writing(userId), writing.data.map(rowToWriting))
    else if (writing.error) warn('pull writing', writing.error)
  } else {
    console.warn('[cloud] writing query rejected:', writingResult.reason)
  }

  if (speakingResult.status === 'fulfilled') {
    const speaking = speakingResult.value
    if (!speaking.error && speaking.data) setLocal(K.speaking(userId), speaking.data.map(rowToSpeaking))
    else if (speaking.error) warn('pull speaking', speaking.error)
  } else {
    console.warn('[cloud] speaking query rejected:', speakingResult.reason)
  }

  if (usageResult.status === 'fulfilled') {
    const usage = usageResult.value
    if (!usage.error && usage.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = usage.data as any
      setLocal(K.usage(userId, date), {
        date,
        chatCount: u.chat_count ?? 0,
        writingCount: u.writing_count ?? 0,
        speakingCount: u.speaking_count ?? 0,
        sttCount: u.stt_count ?? 0,
      } satisfies DailyUsage)
    } else if (usage.error) warn('pull usage', usage.error)
  } else {
    console.warn('[cloud] usage query rejected:', usageResult.reason)
  }
}

// ── profiles: đảm bảo có hồ sơ + đọc gói + trạng thái onboarding ──────────────
export async function ensureProfile(userId: string, name: string): Promise<{ plan: 'free' | 'pro'; onboarded: boolean }> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name }, { onConflict: 'id', ignoreDuplicates: true })
    .select('plan, onboarded')
    .maybeSingle()

  if (error) { warn('profile', error); return { plan: 'free', onboarded: false } }
  if (data?.plan !== undefined) {
    return { plan: data.plan === 'pro' ? 'pro' : 'free', onboarded: !!data.onboarded }
  }

  const { data: existing } = await supabase.from('profiles').select('plan, onboarded').eq('id', userId).maybeSingle()
  return {
    plan: existing?.plan === 'pro' ? 'pro' : 'free',
    onboarded: !!existing?.onboarded,
  }
}

// ── Lưu kết quả onboarding ────────────────────────────────────────────────────
export async function saveOnboarding(userId: string, data: { level: string; goal: string; dailyMinutes: number }) {
  const { error } = await supabase.from('profiles').update({
    user_level: data.level,
    goal: data.goal,
    daily_minutes: data.dailyMinutes,
    onboarded: true,
  }).eq('id', userId)
  if (error) warn('onboarding', error)
}
