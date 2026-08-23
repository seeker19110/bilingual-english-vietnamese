// ──────────────────────────────────────────────────────────────────────
// HUY HIỆU & MỐC (② M2 — docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
//
// Khai báo TĨNH — chỉ mô tả huy hiệu (icon/tên/nhóm), KHÔNG chứa điều kiện đạt
// (điều kiện nằm ở lib/achievements.ts, so với dữ liệu THẬT đã có sẵn trong app
// — không thêm tracking mới, xem ghi chú ở đó). Giữ tách 2 file theo đúng pattern
// data/*.ts (khai báo) vs lib/*.ts (logic) của app.
// ──────────────────────────────────────────────────────────────────────

export type AchievementGroup = 'streak' | 'vocab' | 'cefr' | 'skill' | 'challenge'

export interface AchievementDef {
  id: string
  icon: string
  nameVi: string
  nameEn: string
  group: AchievementGroup
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Chuỗi ngày (streak) ────────────────────────────────────────────
  { id: 'streak_7', icon: '🔥', nameVi: 'Chuỗi 7 ngày', nameEn: '7-day streak', group: 'streak' },
  {
    id: 'streak_30',
    icon: '🔥',
    nameVi: 'Chuỗi 30 ngày',
    nameEn: '30-day streak',
    group: 'streak',
  },
  {
    id: 'streak_100',
    icon: '🔥',
    nameVi: 'Chuỗi 100 ngày',
    nameEn: '100-day streak',
    group: 'streak',
  },
  {
    id: 'streak_365',
    icon: '🔥',
    nameVi: 'Chuỗi 365 ngày',
    nameEn: '365-day streak',
    group: 'streak',
  },

  // ── Khối lượng từ vựng ─────────────────────────────────────────────
  {
    id: 'vocab_100',
    icon: '📚',
    nameVi: '100 từ đã thuộc',
    nameEn: '100 words learned',
    group: 'vocab',
  },
  {
    id: 'vocab_500',
    icon: '📚',
    nameVi: '500 từ đã thuộc',
    nameEn: '500 words learned',
    group: 'vocab',
  },
  {
    id: 'vocab_1000',
    icon: '📚',
    nameVi: '1.000 từ đã thuộc',
    nameEn: '1,000 words learned',
    group: 'vocab',
  },

  // ── Qua cấp CEFR (thi cuối cấp đạt) ────────────────────────────────
  { id: 'cefr_a1', icon: '🎓', nameVi: 'Qua cấp A1', nameEn: 'Passed A1', group: 'cefr' },
  { id: 'cefr_a2', icon: '🎓', nameVi: 'Qua cấp A2', nameEn: 'Passed A2', group: 'cefr' },
  { id: 'cefr_b1', icon: '🎓', nameVi: 'Qua cấp B1', nameEn: 'Passed B1', group: 'cefr' },
  { id: 'cefr_b2', icon: '🎓', nameVi: 'Qua cấp B2', nameEn: 'Passed B2', group: 'cefr' },
  { id: 'cefr_c1', icon: '🎓', nameVi: 'Qua cấp C1', nameEn: 'Passed C1', group: 'cefr' },
  { id: 'cefr_c2', icon: '🎓', nameVi: 'Qua cấp C2', nameEn: 'Passed C2', group: 'cefr' },

  // ── Kỹ năng ─────────────────────────────────────────────────────────
  {
    id: 'speak_10',
    icon: '🎙️',
    nameVi: '10 phiên luyện nói',
    nameEn: '10 speaking sessions',
    group: 'skill',
  },
  {
    id: 'write_10',
    icon: '✍️',
    nameVi: '10 bài viết được chấm',
    nameEn: '10 graded essays',
    group: 'skill',
  },

  // ── Challenge 1 phút (thay mốc 30-ngày cũ — quyết định 2026-07-15) ──
  {
    id: 'challenge_10',
    icon: '🎬',
    nameVi: '10 challenge đã nộp',
    nameEn: '10 challenges submitted',
    group: 'challenge',
  },
  {
    id: 'challenge_30',
    icon: '🎬',
    nameVi: '30 challenge đã nộp',
    nameEn: '30 challenges submitted',
    group: 'challenge',
  },
  {
    id: 'challenge_100',
    icon: '🎬',
    nameVi: '100 challenge đã nộp',
    nameEn: '100 challenges submitted',
    group: 'challenge',
  },
  {
    id: 'challenge_perfect_week',
    icon: '🏆',
    nameVi: 'Tuần trọn vẹn 7/7 challenge',
    nameEn: 'Perfect 7/7 challenge week',
    group: 'challenge',
  },
]
