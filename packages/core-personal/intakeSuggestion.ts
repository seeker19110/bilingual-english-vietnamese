// packages/core-personal/intakeSuggestion.ts — Lớp GỢI Ý của luồng người mới.
// Đặc tả: docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md mục 5.
//
// Hàm THUẦN, tất định: cùng câu trả lời luôn ra cùng gợi ý. Không gọi AI, không đụng CSDL —
// nhờ vậy test được TOÀN BỘ tổ hợp đầu vào, và bộ lọc ngôn ngữ ở dưới trở thành bảo chứng thật
// chứ không phải lời hứa.
//
// LUẬT SỐ 1 CỦA SẢN PHẨM: kết quả chẩn đoán không bao giờ là màn hình chính. Ở tầng này nghĩa là:
// người dùng nhận được MỘT VIỆC NÊN LÀM, không phải một bảng đánh giá về họ.

import type {
  AgeGroup,
  Focus,
  IntakeAnswers,
  IntakeResult,
  LearningMomentum,
  Suggestion,
} from '@dhcb/core-contracts/intake'
import { INTAKE_SCHEMA_VERSION } from '@dhcb/core-contracts/intake'

// ── Bộ lọc ngôn ngữ ─────────────────────────────────────────────────────────
/**
 * Những cách nói bị CẤM trong mọi chuỗi hiện cho người dùng (đặc tả mục 5.2).
 *
 * Không phải chuyện thẩm mỹ: mỗi mẫu ở đây là một cách biến người thành con số, hoặc một cách nói
 * ngụ ý người dùng đang thiếu sót. Cùng một suy luận vẫn diễn đạt được mà không dùng chúng.
 */
/**
 * Ranh giới từ HIỂU UNICODE.
 *
 * KHÔNG dùng `\b` của JS được: nó chỉ coi `[A-Za-z0-9_]` là ký tự từ, nên `\bđáng` không bao giờ
 * khớp (giữa dấu cách và `đ` không có ranh giới nào theo định nghĩa đó), và `mà\b` cũng vậy. Nghĩa
 * là bộ lọc sẽ MÙ với đúng phần tiếng Việt có dấu — đúng thứ nó sinh ra để canh. Test bắt được lỗi
 * này ngay lần chạy đầu.
 */
function phrase(pattern: string): RegExp {
  return new RegExp(`(?<!\\p{L})(?:${pattern})(?!\\p{L})`, 'iu')
}

const FORBIDDEN_PATTERNS: { re: RegExp; why: string }[] = [
  { re: /\d+\s*\/\s*100/, why: 'điểm số dạng x/100' },
  { re: /\d+\s*%/, why: 'phần trăm' },
  { re: phrase('điểm số|chấm điểm'), why: 'ngôn ngữ chấm điểm' },
  { re: phrase('bạn (đang ở )?mức|trình độ của bạn'), why: 'ngôn ngữ xếp loại' },
  { re: phrase('bạn (thiếu|yếu|kém|chưa đạt)'), why: 'ngôn ngữ khiếm khuyết' },
  { re: phrase('so với (người|bạn bè|những người) (cùng|khác)'), why: 'so sánh với người khác' },
  { re: phrase('xếp hạng|thứ hạng'), why: 'xếp hạng' },
  { re: phrase('đáng lẽ|lẽ ra'), why: 'định mệnh luận tuổi tác' },
  { re: phrase('tuổi này (mà|bạn phải|phải)'), why: 'định mệnh luận tuổi tác' },
]

export interface ForbiddenHit {
  text: string
  why: string
}

/**
 * Tìm cách nói bị cấm trong một tập chuỗi. Trả về danh sách rỗng nghĩa là sạch.
 *
 * Dùng ở hai chỗ: test bất biến (quét mọi tổ hợp đầu vào — bất biến T1/T3 của đặc tả) và có thể
 * dùng như lưới an toàn lúc chạy nếu về sau nội dung gợi ý được sinh động.
 */
export function findForbiddenLanguage(texts: string[]): ForbiddenHit[] {
  const hits: ForbiddenHit[] = []
  for (const text of texts) {
    for (const { re, why } of FORBIDDEN_PATTERNS) {
      if (re.test(text)) hits.push({ text, why })
    }
  }
  return hits
}

// ── Kho việc gợi ý ──────────────────────────────────────────────────────────
// Mỗi việc: NHỎ, cụ thể, bắt đầu được trong tuần này, và tự nó sinh thêm thông tin về người dùng
// (đặc tả mục 5.4) — vì ở lần đầu hệ thống gần như luôn đang đoán.

type TaskId =
  | 'hoc-tu-kiem-tra'
  | 'hoc-lich-gian-cach'
  | 'nghe-viec-that'
  | 'nghe-viet-5-dong'
  | 'suc-khoe-gio-ngu'
  | 'suc-khoe-van-dong'
  | 'tien-ghi-chi-tieu'
  | 'quan-he-lich-co-dinh'
  | 'nang-khieu-thu-20-phut'
  | 'kham-pha-mot-cau-hoi'

const TASKS: Record<TaskId, string> = {
  'hoc-tu-kiem-tra':
    'Buổi ôn tới, gấp sách lại và tự viết ra những gì mình nhớ trước, rồi mới mở ra dò',
  'hoc-lich-gian-cach': 'Chia phần đang học thành 4 buổi ngắn trong 2 tuần thay vì học dồn một hôm',
  'nghe-viec-that': 'Tuần này nhận một việc có hạn thật và giữ đúng hạn đó',
  'nghe-viet-5-dong': 'Viết 5 dòng về việc khó nhất bạn gặp tuần qua và cách bạn xoay xở',
  'suc-khoe-gio-ngu': 'Đặt một giờ đi ngủ cố định và giữ nó 7 ngày liền',
  'suc-khoe-van-dong': 'Đi bộ 20 phút mỗi ngày trong tuần này, cùng một khung giờ',
  'tien-ghi-chi-tieu': 'Ghi lại mọi khoản chi trong 7 ngày tới — chỉ ghi, chưa cần cắt giảm gì',
  'quan-he-lich-co-dinh':
    'Đặt một khung giờ cố định trong tuần cho người quan trọng nhất với bạn, như đặt một cuộc hẹn không dời được',
  'nang-khieu-thu-20-phut': 'Dành 20 phút làm việc đó một cách có chủ đích, rồi ghi lại cảm giác',
  'kham-pha-mot-cau-hoi':
    'Mỗi ngày chọn một thắc mắc của chính mình, tìm hiểu 5 phút rồi viết 3 dòng',
}

// ── Chọn việc ───────────────────────────────────────────────────────────────

/** Đà học yếu ⇒ chọn việc NHỎ hơn. Người lâu không học mà nhận việc lớn thì bỏ ngay tuần đầu. */
function wantsSmallStep(m: LearningMomentum | undefined): boolean {
  return m === 'lau_roi' || m === 'khong_nho'
}

/** Tuổi đi học (dưới ~16) thì việc nghề nghiệp không hợp — đổi sang việc học/khám phá. */
function isSchoolAge(age: AgeGroup | undefined): boolean {
  return age === 'nhi_dong' || age === 'thieu_nien'
}

function pickPrimaryTask(a: IntakeAnswers): TaskId {
  const small = wantsSmallStep(a.lastLearned)

  switch (a.focus) {
    case 'hoc_thi':
      return small ? 'hoc-tu-kiem-tra' : 'hoc-lich-gian-cach'
    case 'cong_viec':
      // Người tuổi đi học chọn "công việc" thường là chuyện bài vở/định hướng, không phải nghề.
      if (isSchoolAge(a.ageGroup)) return 'hoc-tu-kiem-tra'
      return small ? 'nghe-viet-5-dong' : 'nghe-viec-that'
    case 'suc_khoe':
      return small ? 'suc-khoe-gio-ngu' : 'suc-khoe-van-dong'
    case 'tien_bac':
      return 'tien-ghi-chi-tieu'
    case 'quan_he':
      return 'quan-he-lich-co-dinh'
    case 'chua_ro':
    case undefined:
    default:
      // Chưa rõ mối bận tâm: bám vào thứ họ TỰ nói ra ở câu 4 (tín hiệu năng khiếu tự phát) —
      // đáng tin hơn mọi thứ suy ra được. Không có thì chọn việc rẻ nhất, sinh thông tin nhiều
      // nhất: mỗi ngày một câu hỏi.
      return a.flowActivity ? 'nang-khieu-thu-20-phut' : 'kham-pha-mot-cau-hoi'
  }
}

/**
 * Câu "vì sao" — TRÍCH LẠI lời người dùng khi có.
 *
 * Thứ tự ưu tiên phản ánh độ tin cậy của tín hiệu: câu 4 (việc làm quên thời gian) > câu 3 (thêm
 * một giờ) > câu 2 (mối bận tâm) > không có gì. Hai câu đầu là chữ của chính họ nên trích được
 * nguyên văn; câu 2 chỉ là một lựa chọn nên phải diễn đạt lại.
 */
function buildWhy(a: IntakeAnswers, small: boolean): string {
  const quote = a.flowActivity || a.extraHour
  if (quote) {
    return `Bạn có nhắc tới "${quote}" — mình nghĩ bắt đầu từ đó là hợp nhất.`
  }
  const byFocus: Record<Focus, string> = {
    hoc_thi: 'Bạn đang bận chuyện học hành, nên mình chọn việc giúp được ngay cho phần đó.',
    cong_viec: 'Bạn đang để tâm nhiều tới công việc, nên mình chọn việc bám sát chuyện đó.',
    suc_khoe: 'Bạn đang quan tâm tới sức khoẻ, nên mình bắt đầu từ thứ dễ giữ nhất.',
    tien_bac: 'Bạn đang nghĩ nhiều về tiền bạc, và bước đầu tiên thường chỉ là nhìn rõ con số.',
    quan_he: 'Bạn đang để tâm tới những người quanh mình, nên mình chọn việc giữ được điều đó.',
    chua_ro: 'Chưa rõ cũng không sao — mình chọn một việc nhỏ để cùng tìm ra.',
  }
  const base = a.focus ? byFocus[a.focus] : byFocus.chua_ro
  return small ? `${base} Mình cố ý chọn việc nhỏ để bắt đầu cho nhẹ.` : base
}

/** Hai lựa chọn thay thế: khác nhóm với việc chính, để người dùng thật sự có đường khác. */
function pickAlternatives(primary: TaskId, a: IntakeAnswers): TaskId[] {
  const pool: TaskId[] = [
    'kham-pha-mot-cau-hoi',
    'suc-khoe-gio-ngu',
    'tien-ghi-chi-tieu',
    'quan-he-lich-co-dinh',
    'hoc-tu-kiem-tra',
  ]
  // Việc nghề không hợp tuổi đi học — đã loại sẵn khỏi pool nên không cần lọc thêm.
  void a
  return pool.filter((t) => t !== primary).slice(0, 2)
}

/**
 * Sinh kết quả cho lớp GỢI Ý.
 *
 * Luôn trả về đúng 1 việc chính + tối đa 2 lựa chọn — kể cả khi người dùng bỏ qua cả 5 câu.
 */
export function buildIntakeResult(answers: IntakeAnswers): IntakeResult {
  const small = wantsSmallStep(answers.lastLearned)
  const primaryId = pickPrimaryTask(answers)
  const toSuggestion = (id: TaskId, why: string): Suggestion => ({
    id,
    title: TASKS[id],
    why,
  })
  return {
    schemaVersion: INTAKE_SCHEMA_VERSION,
    primary: toSuggestion(primaryId, buildWhy(answers, small)),
    alternatives: pickAlternatives(primaryId, answers).map((id) =>
      toSuggestion(id, 'Một hướng khác, nếu việc trên chưa hợp lúc này.'),
    ),
  }
}

/** Mọi chuỗi hiện ra từ một kết quả — dùng cho test bất biến và cho lưới an toàn lúc chạy. */
export function collectVisibleTexts(result: IntakeResult): string[] {
  return [
    result.primary.title,
    result.primary.why,
    ...result.alternatives.flatMap((s) => [s.title, s.why]),
  ]
}
