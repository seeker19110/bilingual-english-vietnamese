// mistakes.ts — SỔ LỖI CÁ NHÂN (Mistake Bank).
//
// Ý tưởng (docs/research/danh-gia-tien-trien-hoc-2026-07-07.md — đề xuất A):
// mỗi lần AI sửa lỗi trong Chat / Viết / Nói, ta lưu lại { câu sai, câu đúng, giải thích }
// để học viên ÔN LẠI về sau dưới dạng thẻ. Đây là tài liệu ôn giá trị nhất và độc nhất của
// từng người (lỗi thật của chính họ) — trước đây bị "bay hơi" sau mỗi phiên.
//
// Đợt đầu: CHỈ localStorage (giống "vé nghỉ streak") — CHƯA đồng bộ Supabase để KHÔNG phải
// thêm migration (migration 0007/0008 còn đang treo ở production). Có thể lệch nhẹ giữa các
// máy; chấp nhận được ở giai đoạn này. Đồng bộ cloud để đợt sau. Vì vậy module này KHÔNG
// import supabase — chạy hoàn toàn cục bộ, mọi thao tác đều nuốt lỗi (không throw) để việc
// lưu/ôn lỗi không bao giờ làm gãy luồng Chat/Viết/Nói.

import type { Direction } from '../types'

export type MistakeSource = 'chat' | 'writing' | 'speaking'

export interface Mistake {
  id: string
  wrong: string // câu/cụm học viên viết sai (ngôn ngữ đích)
  corrected: string // câu đúng (ngôn ngữ đích) — có thể rỗng nếu nguồn không tách được (vd Chat)
  explanation: string // giải thích (tiếng mẹ đẻ của học viên)
  source: MistakeSource
  dir: Direction // chiều học lúc mắc lỗi (A: học tiếng Anh · B: học tiếng Việt)
  createdAt: number // thời điểm mắc lỗi GẦN NHẤT (dùng để sắp theo độ mới)
  count: number // số lần mắc lỗi giống nhau (gộp) — lỗi lặp nhiều được ưu tiên ôn
  lastReviewedAt: number | null // lần ôn gần nhất (null = chưa ôn bao giờ)
  reviewCount: number // tổng số lần đã ôn
}

// Dữ liệu tối thiểu để thêm 1 lỗi — phần còn lại (id, thời gian, đếm) do addMistake tự điền.
export interface MistakeInput {
  wrong: string
  corrected: string
  explanation: string
  source: MistakeSource
  dir: Direction
}

const KEY = (uid: string) => `et_mistakes_${uid}`

// Giới hạn số lỗi lưu để không phình localStorage vô hạn — giữ lại các bản GẦN/HAY LẶP nhất.
const MAX_MISTAKES = 200
// Độ dài tối đa mỗi trường (tránh lưu nguyên bài viết dài vào 1 thẻ lỗi).
const MAX_FIELD_LEN = 500
// Giãn cách ôn tối thiểu: đã ôn trong vòng 2 ngày thì tạm chưa cần ôn lại.
const REVIEW_SPACING_MS = 2 * 86_400_000

function read(uid: string): Mistake[] {
  try {
    const raw = localStorage.getItem(KEY(uid))
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? (arr as Mistake[]) : []
  } catch {
    return []
  }
}

function write(uid: string, list: Mistake[]): void {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(list))
  } catch {
    /* hết dung lượng / chế độ riêng tư — bỏ qua, không làm gãy luồng gọi */
  }
}

// Chuẩn hóa để so trùng: gộp khoảng trắng + thường hóa + bỏ khoảng trắng đầu/cuối.
function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function clip(s: string): string {
  const t = (s ?? '').trim()
  return t.length > MAX_FIELD_LEN ? t.slice(0, MAX_FIELD_LEN) : t
}

// Lỗi có "đáng lưu" không: phải có câu sai (đủ dài) và PHẢI có ít nhất câu đúng HOẶC giải
// thích. Bỏ trường hợp câu sai trùng hệt câu đúng (không phải lỗi thật).
function isWorthSaving(m: MistakeInput): boolean {
  const wrong = clip(m.wrong)
  if (wrong.length < 2) return false
  const corrected = clip(m.corrected)
  const explanation = clip(m.explanation)
  if (!corrected && !explanation) return false
  if (corrected && norm(wrong) === norm(corrected)) return false
  return true
}

export function getMistakes(userId: string): Mistake[] {
  if (!userId) return []
  return read(userId)
}

// Thêm 1 lỗi. Nếu đã có lỗi GIỐNG (cùng câu sai + câu đúng sau chuẩn hóa) thì KHÔNG tạo
// bản mới mà tăng count + làm mới thời gian + đánh dấu cần ôn lại (lastReviewedAt = null).
export function addMistake(userId: string, input: MistakeInput): void {
  if (!userId || !isWorthSaving(input)) return
  try {
    const list = read(userId)
    const wrong = clip(input.wrong)
    const corrected = clip(input.corrected)
    const key = `${norm(wrong)}→${norm(corrected)}`
    const now = Date.now()
    const idx = list.findIndex((m) => `${norm(m.wrong)}→${norm(m.corrected)}` === key)
    const existing = idx >= 0 ? list[idx] : undefined
    if (existing) {
      list[idx] = {
        ...existing,
        count: existing.count + 1,
        createdAt: now, // đẩy lên đầu theo độ mới
        lastReviewedAt: null, // lỗi lặp lại → cần ôn lại
        // Giữ giải thích mới nhất nếu có (đôi khi AI diễn đạt rõ hơn ở lần sau)
        explanation: clip(input.explanation) || existing.explanation,
      }
    } else {
      list.unshift({
        id: crypto.randomUUID(),
        wrong,
        corrected,
        explanation: clip(input.explanation),
        source: input.source,
        dir: input.dir,
        createdAt: now,
        count: 1,
        lastReviewedAt: null,
        reviewCount: 0,
      })
    }
    // Cắt bớt nếu vượt trần: bỏ các thẻ CŨ nhất & ít lặp nhất trước.
    if (list.length > MAX_MISTAKES) {
      list.sort((a, b) => b.count - a.count || b.createdAt - a.createdAt)
      list.length = MAX_MISTAKES
    }
    write(userId, list)
  } catch {
    /* không bao giờ để việc lưu lỗi làm gãy luồng gọi */
  }
}

// Thêm nhiều lỗi cùng lúc (vd mảng errors của bài Luyện viết).
export function addMistakes(userId: string, inputs: MistakeInput[]): void {
  for (const m of inputs) addMistake(userId, m)
}

export function deleteMistake(userId: string, id: string): void {
  if (!userId) return
  write(
    userId,
    read(userId).filter((m) => m.id !== id),
  )
}

// Đánh dấu đã ôn 1 lỗi (tăng reviewCount + ghi thời điểm) → tạm rời khỏi danh sách cần ôn.
export function markReviewed(userId: string, id: string): void {
  if (!userId) return
  const list = read(userId)
  const idx = list.findIndex((m) => m.id === id)
  const existing = idx >= 0 ? list[idx] : undefined
  if (!existing) return
  list[idx] = {
    ...existing,
    lastReviewedAt: Date.now(),
    reviewCount: existing.reviewCount + 1,
  }
  write(userId, list)
}

// Lỗi "cần ôn": chưa ôn bao giờ HOẶC lần ôn gần nhất đã quá REVIEW_SPACING_MS.
// Sắp xếp: lỗi LẶP NHIỀU trước (ưu tiên theo đề xuất), rồi tới lỗi mới hơn.
export function getDueMistakes(userId: string, now: number = Date.now()): Mistake[] {
  return getMistakes(userId)
    .filter((m) => m.lastReviewedAt == null || now - m.lastReviewedAt >= REVIEW_SPACING_MS)
    .sort((a, b) => b.count - a.count || b.createdAt - a.createdAt)
}

export function getMistakeStats(userId: string): { total: number; due: number } {
  const all = getMistakes(userId)
  const now = Date.now()
  const due = all.filter(
    (m) => m.lastReviewedAt == null || now - m.lastReviewedAt >= REVIEW_SPACING_MS,
  ).length
  return { total: all.length, due }
}
