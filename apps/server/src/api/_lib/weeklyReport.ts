// weeklyReport.ts — NỘI DUNG báo cáo tuần gửi "Người thân theo dõi".
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md (mục 5).
//
// Cùng khuôn `reminderContent.ts`: TOÀN BỘ hàm ở đây THUẦN (không chạm DB, không gọi mạng) để
// test được không cần Postgres — `weeklyReportService.ts` lo phần truy vấn rồi gọi vào đây.
//
// BA LUẬT VIẾT NỘI DUNG (phần dễ làm hỏng nhất của tính năng này), ÁP DỤNG CHO CẢ HAI CHIỀU:
//
//   1. Không phải bảng điểm. Mở đầu bằng thứ đứa trẻ ĐÃ LÀM ĐƯỢC, không bằng con số thiếu hụt.
//   2. Không so sánh với người khác. Không xếp hạng, không "giỏi hơn X% bạn cùng lứa".
//   3. Tuần kém KHÔNG được viết thành lời trách. Học 0 ngày → chuyển sang hướng hỏi thăm
//      ("tuần này có vẻ bận"), tuyệt đối không "đã bỏ học 6 ngày".
//
// Và luôn kết bằng MỘT câu gợi ý để hỏi — thứ biến báo cáo thành một cuộc trò chuyện thay vì
// một cuộc kiểm tra. Đó là toàn bộ lý do tính năng này tồn tại.
//
// CHIỀU HỌC (2026-09-03, trả nợ kỹ thuật ghi ở PROGRESS.md "Hai tính năng mới CHƯA có bản chiều
// B"): `direction === 'A'` viết thư tiếng Việt (người học học tiếng Anh, người thân đọc tiếng
// Việt); `direction === 'B'` viết thư tiếng Anh (người học học tiếng Việt, người thân đọc tiếng
// Anh) — KHÔNG bao giờ trộn hai thứ tiếng trong cùng một thư.

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
  /** Footer cố định (quyền riêng tư) — tách riêng để hai hàm render dùng đúng bản dịch. */
  footer: string
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
const QUESTION_BY_LEVEL_A: Record<string, string> = {
  A1: 'Thử nhờ con dạy lại 3 từ tiếng Anh con mới học tuần này xem — chỉ 3 từ thôi.',
  A2: 'Thử hỏi con nói một câu tiếng Anh về bữa cơm tối nay xem con nói thế nào.',
  B1: 'Thử hỏi con kể bằng tiếng Anh xem cuối tuần này nhà mình nên đi đâu.',
  B2: 'Thử hỏi con giải thích bằng tiếng Anh một thứ con thích — phim, game, hay ca sĩ nào đó.',
  C1: 'Thử hỏi con tranh luận bằng tiếng Anh một chuyện nhỏ trong nhà xem con lập luận ra sao.',
  C2: 'Thử nhờ con dịch giúp một đoạn tin tức tiếng Anh và hỏi con thấy chỗ nào khó dịch nhất.',
}
const QUESTION_FALLBACK_A = 'Thử hỏi con tuần này học được gì con thấy thú vị nhất.'

// Bản chiều B — người học đang học TIẾNG VIỆT, người thân đọc thư bằng tiếng Anh.
const QUESTION_BY_LEVEL_B: Record<string, string> = {
  A1: 'Try asking them to teach you 3 Vietnamese words they learned this week — just 3 words.',
  A2: 'Try asking them to say one Vietnamese sentence about tonight’s dinner.',
  B1: 'Try asking them to tell you in Vietnamese where the family should go this weekend.',
  B2: 'Try asking them to explain something they like in Vietnamese — a movie, a game, a singer.',
  C1: 'Try asking them to debate a small everyday topic in Vietnamese and see how they argue it.',
  C2: 'Try handing them a short Vietnamese news snippet and asking what was hardest to translate.',
}
const QUESTION_FALLBACK_B = 'Try asking what they found most interesting to learn this week.'

export function pickQuestion(data: WeeklyReportData): string {
  const isA = data.direction !== 'B'
  if (data.topicHint) {
    return isA
      ? `Tuần này con học chủ đề "${data.topicHint}" — thử hỏi con vài từ trong chủ đề đó xem.`
      : `This week they studied "${data.topicHint}" — try asking them a few words from that topic.`
  }
  const byLevel = isA ? QUESTION_BY_LEVEL_A : QUESTION_BY_LEVEL_B
  if (data.cefrLevel && byLevel[data.cefrLevel]) {
    return byLevel[data.cefrLevel]!
  }
  return isA ? QUESTION_FALLBACK_A : QUESTION_FALLBACK_B
}

function factLines(data: WeeklyReportData, mood: WeekMood): string[] {
  const isA = data.direction !== 'B'
  const lines: string[] = []

  if (mood !== 'absent') {
    lines.push(
      isA
        ? `Đã học ${data.daysStudied}/${data.weeklyGoalDays} ngày trong tuần.`
        : `Studied ${data.daysStudied}/${data.weeklyGoalDays} days this week.`,
    )
  }
  // Một dòng cho cả học mới lẫn ôn lại — `learn_count` gộp chung hai việc, xem contract.
  if (data.wordsPracticed > 0) {
    lines.push(
      isA
        ? `Học và ôn ${data.wordsPracticed} lượt từ vựng.`
        : `${data.wordsPracticed} vocabulary reps (new + review).`,
    )
  }
  // Streak chỉ nhắc khi ĐANG CÓ — nhắc "streak 0" là nhắc về thất bại, đúng thứ luật 3 cấm.
  if (data.streakDays > 0) {
    lines.push(
      isA
        ? `Đang giữ chuỗi ${data.streakDays} ngày học liên tiếp.`
        : `Currently on a ${data.streakDays}-day learning streak.`,
    )
  }
  if (data.cefrLevel && typeof data.cefrPercent === 'number') {
    lines.push(
      isA
        ? `Đang học trình độ ${data.cefrLevel}, hoàn thành ${data.cefrPercent}% cấp này.`
        : `Currently at level ${data.cefrLevel}, ${data.cefrPercent}% through it.`,
    )
  }
  return lines
}

const FOOTER_A =
  'Bạn nhận được thư này vì có người đã mời bạn theo dõi việc học của họ. ' +
  'Họ có thể ngừng chia sẻ bất cứ lúc nào, và bạn cũng có thể tự gỡ trong phần Hồ sơ.'
const FOOTER_B =
  'You are receiving this because someone invited you to follow their learning progress. ' +
  'They can stop sharing at any time, and you can also remove yourself from their Profile page.'

export function buildWeeklyReport(data: WeeklyReportData): WeeklyReportMessage {
  const mood = classifyWeek(data)
  const isA = data.direction !== 'B'
  const name = data.learnerName

  const opening: Record<WeekMood, string> = isA
    ? {
        strong: `Tuần vừa rồi ${name} học rất đều — ${data.daysStudied} ngày.`,
        steady: `Tuần vừa rồi ${name} vẫn giữ được nhịp học.`,
        // "Có ghé vào" — nói đúng sự thật mà không quy thành lỗi.
        sparse: `Tuần vừa rồi ${name} có ghé vào học ${data.daysStudied} ngày.`,
        // Tuần vắng: KHÔNG nêu con số 0, không dùng từ "bỏ", "quên", "lười".
        absent: `Tuần vừa rồi ${name} chưa vào học buổi nào — có thể tuần này bạn ấy bận.`,
      }
    : {
        strong: `${name} studied very consistently last week — ${data.daysStudied} days.`,
        steady: `${name} kept up a steady pace last week.`,
        sparse: `${name} dropped in to study ${data.daysStudied} day(s) last week.`,
        absent: `${name} didn’t study last week — they might have had a busy week.`,
      }

  const closing: Record<WeekMood, string> = isA
    ? {
        strong: 'Nếu bạn khen một câu vào lúc này thì đúng lúc lắm.',
        steady: 'Nhịp này giữ được là tốt rồi — không cần nhanh hơn.',
        sparse: 'Học ít vẫn hơn không học. Không cần thúc, hỏi thăm là đủ.',
        absent: 'Thư này không phải để nhắc bạn nhắc con — chỉ để bạn biết mà hỏi thăm một câu.',
      }
    : {
        strong: 'A word of praise right now would land really well.',
        steady: 'This pace is worth keeping — no need to push for more.',
        sparse: 'A little is still better than none. No need to push, just ask how they’re doing.',
        absent:
          'This email isn’t a nudge for you to nudge them — just so you know, to ask how they are.',
      }

  const subject = isA
    ? mood === 'absent'
      ? `Tuần này của ${name}`
      : `Tuần này ${name} học ${data.daysStudied} ngày`
    : mood === 'absent'
      ? `${name}’s week`
      : `${name} studied ${data.daysStudied} day(s) this week`

  return {
    subject,
    opening: opening[mood],
    facts: factLines(data, mood),
    question: pickQuestion(data),
    closing: closing[mood],
    footer: isA ? FOOTER_A : FOOTER_B,
  }
}

/** Bản chữ thuần của thư — dùng cho `text` của mail (và làm nguồn cho bản HTML). */
export function renderWeeklyReportText(msg: WeeklyReportMessage): string {
  const facts = msg.facts.length > 0 ? `\n${msg.facts.map((f) => `• ${f}`).join('\n')}\n` : '\n'
  const suggestionLabel = msg.footer === FOOTER_B ? 'Suggestion for you' : 'Gợi ý cho bạn'
  return (
    `${msg.opening}\n${facts}\n` +
    `${suggestionLabel}: ${msg.question}\n\n` +
    `${msg.closing}\n\n` +
    `${msg.footer}`
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
  const suggestionLabel = msg.footer === FOOTER_B ? 'Suggestion for you' : 'Gợi ý cho bạn'
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
      <p style="font-size: 15px; color: #18181b; line-height: 1.6; margin-top: 0;">${escapeHtml(msg.opening)}</p>
      ${facts ? `<ul style="font-size: 14px; color: #3f3f46; line-height: 1.6; padding-left: 20px;">${facts}</ul>` : ''}
      <p style="font-size: 14px; color: #18181b; line-height: 1.6; background: #f4f4f5; padding: 12px 14px; border-radius: 8px;">
        <strong>${suggestionLabel}:</strong> ${escapeHtml(msg.question)}
      </p>
      <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">${escapeHtml(msg.closing)}</p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
      <p style="font-size: 11px; color: #71717a; line-height: 1.5;">
        ${escapeHtml(msg.footer)}
      </p>
    </div>
  `
}
