// apps/dhcb/src/pages/core/UiNoise.design.test.ts — Cổng canh chặn quầng sáng nền trang trí
// quay lại (đợt D1 thiết kế lại UI/UX, 2026-09-03).
//
// VÌ SAO CẦN: `blur-2xl`/`blur-3xl` trên một `<div>` tuyệt đối định vị + nền màu mờ là "quầng
// sáng" — dấu hiệu UI do AI sinh liệt kê ở luật 5 mục 9 `.agents/skills/ui-ux-craftsman`. Đo
// 2026-09-03: 8 chỗ trong `apps/`, 7 chỗ là quầng trang trí thuần (đã gỡ ở đợt D1); còn lại
// `Layout.tsx` dùng `backdrop-blur-2xl` cho dropdown nổi (frosted glass thật, không phải quầng
// sáng) nên GIỮ NGUYÊN — test dưới chỉ cấm mẫu quầng sáng, không cấm backdrop-blur.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC_DIR = join(__dirname, '../..')
// Quầng sáng: div tuyệt đối định vị, bo tròn hết cỡ, nền màu mờ, mờ nét — không phải
// `backdrop-blur` (frosted glass hợp lệ trên bề mặt nổi như dropdown/modal).
const GLOW_PATTERN = /rounded-full[^"]*blur-(2xl|3xl)|blur-(2xl|3xl)[^"]*rounded-full/

function listSourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...listSourceFiles(full))
    } else if (
      ['.ts', '.tsx'].includes(extname(entry)) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.d.ts')
    ) {
      out.push(full)
    }
  }
  return out
}

describe('Không còn quầng sáng nền trang trí (đợt D1)', () => {
  const files = listSourceFiles(SRC_DIR)
  expect(files.length).toBeGreaterThan(100) // canh chống hàm quét bị hỏng rồi lặng lẽ quét rỗng

  it('không file nào chứa mẫu quầng sáng (rounded-full + blur-2xl/3xl)', () => {
    const offenders = files
      .filter((f) => GLOW_PATTERN.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(SRC_DIR.length + 1))
    expect(offenders).toEqual([])
  })
})

// ── Đợt D2 (2026-09-03) — bóng phát sáng màu (`shadow-<màu>-500/xx`) ──────────────────
//
// VÌ SAO CẦN: luật 5 mục 9 `.agents/skills/ui-ux-craftsman` chỉ cho bóng màu khi mang
// nghĩa trạng thái thật (đang ghi âm/đang lắng nghe, đang được chọn, đúng/sai vừa chấm,
// trực tuyến) — không dùng trang trí cho icon tĩnh/CTA nghỉ/thẻ nội dung. Luật gốc còn nói
// "chỗ cũ gỡ dần khi đụng tới, không mở đợt quét riêng"; đợt D2 CHỦ Ý làm trái câu đó (đo
// 2026-09-03: 154 chỗ ở 57 file — quá lớn để chờ gỡ dần), theo quyết định của người dùng.
//
// Đo trước D2: 154 chỗ. Sau D2: 46 chỗ CÒN LẠI, mỗi chỗ mang đúng một trong ba nghĩa trên —
// liệt kê tường minh dưới đây (đường dẫn tương đối tới `apps/dhcb/src`, số lần đúng bằng
// hiện trạng). Test khoá CẢ HAI CHIỀU: thêm bóng màu mới ở đâu đó (kể cả file đã có mặt
// trong danh sách) → đỏ vì tổng KHÔNG khớp allowlist; gỡ nhầm một chỗ đang hợp lệ → cũng đỏ
// vì thiếu so với allowlist. Sửa allowlist chỉ khi THẬT SỰ thêm/bớt một trạng thái có nghĩa,
// không phải để dập tắt test đỏ.
const SHADOW_COLOR_PATTERN =
  /shadow-(?:accent|violet|cyan|emerald|blue|purple|rose|amber|sky|indigo|pink|orange|lime|teal|fuchsia|red|green|yellow|slate)-\d+\/\d+/g

const ALLOWED_COLOR_SHADOW_COUNT: Record<string, number> = {
  'components/BottomNav.tsx': 4, // 4 tab đáy đang được chọn (route hiện tại)
  'components/CompanionStudios/StudioDialogue.tsx': 4, // viewMode/domain đang chọn + nút "Dừng Ghi Âm"
  'components/CompanionVoice/ArticulatoryPhoneticsVisualizer.tsx': 1, // âm vị đang chọn
  'components/CompanionVoice/EchoShadowingCard.tsx': 1, // đoạn đang chọn
  'components/CompanionVoice/ScenarioHolodeckCard.tsx': 1, // kịch bản đang chọn
  'components/CompanionVoice/SocraticDiagnosticsCard.tsx': 1, // mục đang chọn
  'components/CompanionVoice/WearablesSyncCard.tsx': 1, // nguồn đang chọn
  'components/CompanionVoice/WorkplaceHarvesterCard.tsx': 2, // 2 tab đang chọn
  'components/FeedbackModal.tsx': 1, // hạng mục phản hồi đang chọn
  'components/Home/HomeUniversalAiBar.tsx': 1, // đang lắng nghe (ghi âm)
  'components/NeuralCurriculum/CollocationGraphExplorer.tsx': 1, // cụm từ đang chọn
  'components/NeuralCurriculum/MicroDrillModal.tsx': 1, // vừa chấm ĐÚNG
  'components/PvPArena/PvPBattlefieldModal.tsx': 1, // vừa chấm ĐÚNG
  'components/chat/PresenceDot.tsx': 1, // đang trực tuyến
  'pages/companion/Companion.tsx': 1, // studio đang mở
  'pages/domains/life/LifeGraph.tsx': 1, // tab đang chọn
  'pages/learning/AppliedKnowledge.tsx': 14, // 4 tab + 10 simulator đang chọn
  'pages/learning/SubjectDetail.tsx': 2, // lớp/độ khó đang chọn
  'pages/learning/Subjects.tsx': 3, // 3 bộ lọc đang chọn
  'pages/subjects/english/Chat.tsx': 1, // cấp độ đang chọn
  'pages/subjects/english/Lessons.tsx': 1, // dòng hội thoại đang đọc
  'pages/subjects/english/Speaking.tsx': 2, // cấp độ đang chọn + đang ghi âm
}

describe('Bóng phát sáng màu chỉ còn ở trạng thái có nghĩa (đợt D2)', () => {
  const files = listSourceFiles(SRC_DIR)

  it('mỗi file khớp ĐÚNG số bóng màu trong allowlist — không hơn, không kém', () => {
    const actual: Record<string, number> = {}
    for (const f of files) {
      const matches = readFileSync(f, 'utf8').match(SHADOW_COLOR_PATTERN)
      if (matches) actual[f.slice(SRC_DIR.length + 1)] = matches.length
    }
    expect(actual).toEqual(ALLOWED_COLOR_SHADOW_COUNT)
  })
})
