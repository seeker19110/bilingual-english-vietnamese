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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToChat(r: any): ChatSession {
  return { id: r.id, userId: r.user_id, situation: r.situation, level: r.level, messages: r.messages ?? [], createdAt: Number(r.created_at) }
}
function chatToRow(s: ChatSession) {
  return { id: s.id, user_id: s.userId, situation: s.situation, level: s.level, messages: s.messages, created_at: s.createdAt }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSpeaking(r: any): SpeakingSession {
  return { id: r.id, userId: r.user_id, situation: r.situation, level: r.level, messages: r.messages ?? [], createdAt: Number(r.created_at) }
}
function speakingToRow(s: SpeakingSession) {
  return { id: s.id, user_id: s.userId, situation: s.situation, level: s.level, messages: s.messages, created_at: s.createdAt }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToWriting(r: any): WritingSubmission {
  return { id: r.id, userId: r.user_id, essayPrompt: r.essay_prompt, essay: r.essay, feedback: r.feedback, submittedAt: Number(r.submitted_at) }
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
  const [chat, writing, speaking, usage] = await Promise.all([
    supabase.from('chat_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('writing_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }),
    supabase.from('speaking_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('daily_usage').select('*').eq('user_id', userId).eq('day', date).maybeSingle(),
  ])

  if (!chat.error && chat.data) setLocal(K.chat(userId), chat.data.map(rowToChat))
  if (!writing.error && writing.data) setLocal(K.writing(userId), writing.data.map(rowToWriting))
  if (!speaking.error && speaking.data) setLocal(K.speaking(userId), speaking.data.map(rowToSpeaking))
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
  }

  warn('pull', chat.error ?? writing.error ?? speaking.error ?? usage.error)
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

// ── Đồng bộ số từ đã học lên profiles.words_learned (dùng cho leaderboard) ───
export function pushWordsLearned(userId: string, count: number) {
  void supabase.from('profiles').update({ words_learned: count }).eq('id', userId)
    .then(({ error }) => warn('words_learned', error))
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
