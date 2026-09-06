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
// Windows sinh đường dẫn dùng "\\" trong khi allowlist dưới đây viết bằng "/" — chuẩn hoá
// trước khi so sánh để test không đỏ giả trên Windows (xem PR #794 — cùng lớp lỗi).
function toRelativePosix(f: string): string {
  return f
    .slice(SRC_DIR.length + 1)
    .split('\\')
    .join('/')
}
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
      .map((f) => toRelativePosix(f))
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
  'pages/subjects/english/lessons/LessonView.tsx': 1, // dòng hội thoại đang đọc (tách từ Lessons.tsx 2026-09-06)
  'pages/subjects/english/Speaking.tsx': 2, // cấp độ đang chọn + đang ghi âm
}

describe('Bóng phát sáng màu chỉ còn ở trạng thái có nghĩa (đợt D2)', () => {
  const files = listSourceFiles(SRC_DIR)

  it('mỗi file khớp ĐÚNG số bóng màu trong allowlist — không hơn, không kém', () => {
    const actual: Record<string, number> = {}
    for (const f of files) {
      const matches = readFileSync(f, 'utf8').match(SHADOW_COLOR_PATTERN)
      if (matches) actual[toRelativePosix(f)] = matches.length
    }
    expect(actual).toEqual(ALLOWED_COLOR_SHADOW_COUNT)
  })
})

// ── Đợt D3 (2026-09-03) — nhấp nháy trang trí (`animate-pulse`/`animate-ping`) ────────
//
// VÌ SAO CẦN: luật 6 mục 9 `.agents/skills/ui-ux-craftsman` — "Pulse chỉ dành cho thứ ĐANG
// THAY ĐỔI THẬT": skeleton tải, hoặc trạng thái sống thật (đang ghi âm/lắng nghe/nói, đang
// trực tuyến, tiến trình đang chạy). Nhãn trạng thái TĨNH (bullet đầu tiêu đề mục, huy hiệu
// khả năng cố định, dữ kiện lịch không đổi trong lúc xem như "hôm nay") thì để tĩnh.
//
// Đo trước D3: 10 `animate-ping` + 49 `animate-pulse` (kể cả các chỗ trùng khớp giả từ
// `animate-pulse-ring` — một animation KHÁC, không thuộc phạm vi luật này, không đụng tới).
// Sau D3: gỡ 1 `animate-ping` (chấm mesh luôn nhấp nháy bất kể còn kết nối hay không — không
// phản ánh trạng thái thật) + 6 `animate-pulse` (badge FAB không gắn điều kiện nào, huy hiệu
// WebGPU tĩnh theo thiết bị, 3 bullet trang trí đầu tiêu đề mục, ô "hôm nay" trong lịch —
// dữ kiện không đổi trong lúc xem). Test khoá cả hai chiều như D2.
//
// Regex loại trừ `animate-pulse-ring` bằng lookahead phủ định — đó là animation RIÊNG (dùng ở
// `ShareToggle.tsx`/`Speaking.tsx` cho tín hiệu "đang phát trực tiếp", đã tự tôn trọng
// prefers-reduced-motion), không phải Tailwind `animate-pulse` nên không nằm trong luật này.
const PULSE_PATTERN = /animate-pulse(?!-ring)\b/g
const PING_PATTERN = /animate-ping\b/g

const ALLOWED_PULSE_COUNT: Record<string, number> = {
  'components/CompanionLinkSection.tsx': 1, // skeleton tải
  'components/CompanionStudios/StudioDialogue.tsx': 2, // voice.state đang hoạt động + nút "Dừng Ghi Âm"
  'components/CompanionVoice/AmbientScreenCopilot.tsx': 1, // đang chia sẻ màn hình (stream sống)
  'components/CompanionVoice/ArticulatoryPhoneticsVisualizer.tsx': 1, // minh hoạ dây thanh đang rung (thuộc tính âm vị thật)
  'components/CompanionVoice/EchoShadowingCard.tsx': 2, // đang ghi âm (waveform + nút)
  'components/CompanionVoice/NeuroAffectiveCard.tsx': 1, // đang ở trạng thái flow đỉnh cao
  'components/CompanionVoice/ScenarioHolodeckCard.tsx': 1, // áp lực phiên mô phỏng đang tăng cao
  'components/CompanionVoice/SubconsciousInsightsCard.tsx': 1, // skeleton tải
  'components/DecisionLedger/OutcomeCalibrationCard.tsx': 1, // skeleton tải
  'components/Home/HomeAiBriefingCard.tsx': 3, // skeleton tải (2 dòng) + comment giải thích lý do
  'components/Home/HomeUniversalAiBar.tsx': 1, // đang lắng nghe (ghi âm)
  'components/Layout.tsx': 1, // CHỈ LÀ CHÚ THÍCH ghi lại lý do đã gỡ, không phải mã thật
  'components/LifeGraph/CrossDomainSynergyCard.tsx': 1, // skeleton tải
  'components/ProactiveBriefingCard.tsx': 1, // mục ưu tiên "khẩn" (urgent) — màu ngữ nghĩa
  'components/PvPArena/PvPArenaLobbyModal.tsx': 1, // đang ghép trận
  'components/PvPArena/PvPBattlefieldModal.tsx': 1, // đồng hồ đếm ngược đang chạy
  'components/ReferralSection.tsx': 1, // skeleton tải
  'components/ShareProgress.tsx': 1, // skeleton tải (đang tạo mã QR)
  'components/admin/AdminSystemControlPanel.tsx': 1, // circuit breaker đang ngắt (cảnh báo)
  'components/CefrLessonViews.tsx': 3, // dòng đang đọc + lượt đang nói + nút "Dừng Ghi Âm"
  'pages/subjects/english/CefrLevelPage.tsx': 6, // skeleton tải (aria-busy)
  'pages/subjects/english/Challenge.tsx': 2, // skeleton media + đang ghi âm (fallback không video)
  // Lessons.tsx tách thành lessons/ ngày 2026-09-06 — cùng 5 chỗ, chỉ đổi file.
  'pages/subjects/english/lessons/LessonView.tsx': 4, // dòng đang đọc + lượt đang nói + audio đang phát + nút ghi âm
  'pages/subjects/english/lessons/InlinePronounce.tsx': 1, // đang lắng nghe
}

const ALLOWED_PING_COUNT: Record<string, number> = {
  'components/Companion3D/CyberTutorAvatar3D.tsx': 1, // đang nghe/đang nói (avatar 3D)
  'components/CompanionVoice/EchoShadowingCard.tsx': 1, // đang ghi âm
  'components/Home/HomeUniversalAiBar.tsx': 1, // đang lắng nghe (ghi âm)
  'components/Layout.tsx': 1, // CHỈ LÀ CHÚ THÍCH ghi lại lý do đã gỡ, không phải mã thật
  'components/chat/PresenceDot.tsx': 1, // đang trực tuyến
  'pages/learning/Subjects.tsx': 1, // đang tải danh sách môn học
}

describe('Nhấp nháy chỉ còn khi có thứ đang thay đổi thật (đợt D3)', () => {
  const files = listSourceFiles(SRC_DIR)

  it('animate-pulse: mỗi file khớp ĐÚNG số trong allowlist', () => {
    const actual: Record<string, number> = {}
    for (const f of files) {
      const matches = readFileSync(f, 'utf8').match(PULSE_PATTERN)
      if (matches) actual[toRelativePosix(f)] = matches.length
    }
    expect(actual).toEqual(ALLOWED_PULSE_COUNT)
  })

  it('animate-ping: mỗi file khớp ĐÚNG số trong allowlist', () => {
    const actual: Record<string, number> = {}
    for (const f of files) {
      const matches = readFileSync(f, 'utf8').match(PING_PATTERN)
      if (matches) actual[toRelativePosix(f)] = matches.length
    }
    expect(actual).toEqual(ALLOWED_PING_COUNT)
  })
})
