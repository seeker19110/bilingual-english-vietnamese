// weeklyReport.ts — NỘI DUNG báo cáo tuần gửi "Người thân theo dõi".
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md (mục 5).
//
// Cùng khuôn `reminderContent.ts`: TOÀN BỘ hàm ở đây THUẦN (không chạm DB, không gọi mạng) để
// test được không cần Postgres — `weeklyReportService.ts` lo phần truy vấn rồi gọi vào đây.
//
// BA LUẬT VIẾT NỘI DUNG (phần dễ làm hỏng nhất của tính năng này):
//
//   1. Không phải bảng điểm. Mở đầu bằng thứ đứa trẻ ĐÃ LÀM ĐƯỢC, không bằng con số thiếu hụt.
//   2. Không so sánh với người khác. Không xếp hạng, không "giỏi hơn X% bạn cùng lứa".
//   3. Tuần kém KHÔNG được viết thành lời trách. Học 0 ngày → chuyển sang hướng hỏi thăm
//      ("tuần này có vẻ bận"), tuyệt đối không "đã bỏ học 6 ngày".
//
// Và luôn kết bằng MỘT câu gợi ý để hỏi — thứ biến báo cáo thành một cuộc trò chuyện thay vì
// một cuộc kiểm tra. Đó là toàn bộ lý do tính năng này tồn tại.

import type { WeeklyReportData } from '@dhcb/core-contracts/companionLink'

/** Bốn tình huống tuần. Thứ tự từ nhiều tới ít, dùng để chọn giọng văn. */
export type WeekMood = 'strong' | 'steady' | 'sparse' | 'absent'

export interface WeeklyReportMessage {
  subject: string
  /** Câu mở — luôn nói việc đã làm được trước. */
  opening: string
  /** 2–4 dòng số liệu ngắn, mỗi dòng một ý. */
  facts: string[]
  /** Câu gợi ý để hỏi chuyện người học. Luôn có. */
  question: string
  /** Câu khép, tuỳ tình huống. Không bao giờ mang tính nhắc nhở/đe doạ. */
  closing: string
}

export function classifyWeek(data: Pick<WeeklyReportData, 'daysStudied'>): WeekMood {
  const d = data.daysStudied
  if (d === 0) return 'absent'
  if (d <= 2) return 'sparse'
  if (d <= 4) return 'steady'
  return 'strong'
}

// Câu hỏi gợi ý theo cấp CEFR — chọn theo cấp vì đó là thứ quyết định người học NÓI được gì,
// không phải theo số ngày học. Người thân hỏi được câu vừa tầm thì đứa trẻ trả lời được, và đó
// là lúc việc học thành ra có ích thật.
const QUESTION_BY_LEVEL: Record<string, string> = {
  A1: 'Thử nhờ con dạy lại 3 từ tiếng Anh con mới học tuần này xem — chỉ 3 từ thôi.',
  A2: 'Thử hỏi con nói một câu tiếng Anh về bữa cơm tối nay xem con nói thế nào.',
  B1: 'Thử hỏi con kể bằng tiếng Anh xem cuối tuần này nhà mình nên đi đâu.',
  B2: 'Thử hỏi con giải thích bằng tiếng Anh một thứ con thích — phim, game, hay ca sĩ nào đó.',
  C1: 'Thử hỏi con tranh luận bằng tiếng Anh một chuyện nhỏ trong nhà xem con lập luận ra sao.',
  C2: 'Thử nhờ con dịch giúp một đoạn tin tức tiếng Anh và hỏi con thấy chỗ nào khó dịch nhất.',
}
const QUESTION_FALLBACK = 'Thử hỏi con tuần này học được gì con thấy thú vị nhất.'

export function pickQuestion(data: WeeklyReportData): string {
  if (data.topicHint) {
    return `Tuần này con học chủ đề "${data.topicHint}" — thử hỏi con vài từ trong chủ đề đó xem.`
  }
  if (data.cefrLevel && QUESTION_BY_LEVEL[data.cefrLevel]) {
    return QUESTION_BY_LEVEL[data.cefrLevel]!
  }
  return QUESTION_FALLBACK
}

function factLines(data: WeeklyReportData, mood: WeekMood): string[] {
  const lines: string[] = []

  if (mood !== 'absent') {
    lines.push(`Đã học ${data.daysStudied}/${data.weeklyGoalDays} ngày trong tuần.`)
  }
  // Một dòng cho cả học mới lẫn ôn lại — `learn_count` gộp chung hai việc, xem contract.
  if (data.wordsPracticed > 0) {
    lines.push(`Học và ôn ${data.wordsPracticed} lượt từ vựng.`)
  }
  // Streak chỉ nhắc khi ĐANG CÓ — nhắc "streak 0" là nhắc về thất bại, đúng thứ luật 3 cấm.
  if (data.streakDays > 0) {
    lines.push(`Đang giữ chuỗi ${data.streakDays} ngày học liên tiếp.`)
  }
  if (data.cefrLevel && typeof data.cefrPercent === 'number') {
    lines.push(`Đang học trình độ ${data.cefrLevel}, hoàn thành ${data.cefrPercent}% cấp này.`)
  }
  return lines
}

export function buildWeeklyReport(data: WeeklyReportData): WeeklyReportMessage {
  const mood = classifyWeek(data)
  const name = data.learnerName

  const opening: Record<WeekMood, string> = {
    strong: `Tuần vừa rồi ${name} học rất đều — ${data.daysStudied} ngày.`,
    steady: `Tuần vừa rồi ${name} vẫn giữ được nhịp học.`,
    // "Có ghé vào" — nói đúng sự thật mà không quy thành lỗi.
    sparse: `Tuần vừa rồi ${name} có ghé vào học ${data.daysStudied} ngày.`,
    // Tuần vắng: KHÔNG nêu con số 0, không dùng từ "bỏ", "quên", "lười".
    absent: `Tuần vừa rồi ${name} chưa vào học buổi nào — có thể tuần này bạn ấy bận.`,
  }

  const closing: Record<WeekMood, string> = {
    strong: 'Nếu bạn khen một câu vào lúc này thì đúng lúc lắm.',
    steady: 'Nhịp này giữ được là tốt rồi — không cần nhanh hơn.',
    sparse: 'Học ít vẫn hơn không học. Không cần thúc, hỏi thăm là đủ.',
    absent: 'Thư này không phải để nhắc bạn nhắc con — chỉ để bạn biết mà hỏi thăm một câu.',
  }

  const subject =
    mood === 'absent' ? `Tuần này của ${name}` : `Tuần này ${name} học ${data.daysStudied} ngày`

  return {
    subject,
    opening: opening[mood],
    facts: factLines(data, mood),
    question: pickQuestion(data),
    closing: closing[mood],
  }
}

/** Bản chữ thuần của thư — dùng cho `text` của mail (và làm nguồn cho bản HTML). */
export function renderWeeklyReportText(msg: WeeklyReportMessage): string {
  const facts = msg.facts.length > 0 ? `\n${msg.facts.map((f) => `• ${f}`).join('\n')}\n` : '\n'
  return (
    `${msg.opening}\n${facts}\n` +
    `Gợi ý cho bạn: ${msg.question}\n\n` +
    `${msg.closing}\n\n` +
    'Bạn nhận được thư này vì có người đã mời bạn theo dõi việc học của họ. ' +
    'Họ có thể ngừng chia sẻ bất cứ lúc nào, và bạn cũng có thể tự gỡ trong phần Hồ sơ.'
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Bản HTML của thư. Mọi giá trị đi qua `escapeHtml` — `learnerName` và `topicHint` là dữ liệu
 * NGƯỜI DÙNG TỰ ĐẶT, nhét thẳng vào HTML là mở đường chèn mã vào hộp thư người khác.
 */
export function renderWeeklyReportHtml(msg: WeeklyReportMessage): string {
  const facts = msg.facts
    .map((f) => `<li style="margin-bottom:6px;">${escapeHtml(f)}</li>`)
    .join('')
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
      <p style="font-size: 15px; color: #18181b; line-height: 1.6; margin-top: 0;">${escapeHtml(msg.opening)}</p>
      ${facts ? `<ul style="font-size: 14px; color: #3f3f46; line-height: 1.6; padding-left: 20px;">${facts}</ul>` : ''}
      <p style="font-size: 14px; color: #18181b; line-height: 1.6; background: #f4f4f5; padding: 12px 14px; border-radius: 8px;">
        <strong>Gợi ý cho bạn:</strong> ${escapeHtml(msg.question)}
      </p>
      <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">${escapeHtml(msg.closing)}</p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
      <p style="font-size: 11px; color: #71717a; line-height: 1.5;">
        Bạn nhận được thư này vì có người đã mời bạn theo dõi việc học của họ. Họ có thể ngừng
        chia sẻ bất cứ lúc nào, và bạn cũng có thể tự gỡ trong phần Hồ sơ.
      </p>
    </div>
  `
}
