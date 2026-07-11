import { describe, it, expect, beforeEach } from 'vitest'
import {
  getChallenge,
  startChallenge,
  restartChallenge,
  resumeChallenge,
  saveEntry,
  getChallengeDay,
  getEarnedMilestones,
  getNewMilestone,
  getKeepDates,
  countWords,
  calcWpm,
  mergeCloudEntries,
  VLOG_MILESTONES,
  type VlogChallenge,
  type VlogEntryLocal,
  type CloudEntryForMerge,
} from './vlog'
import { vnDateStr } from './date'

// ── Tiện ích dựng dữ liệu test ───────────────────────────────────────────────
const dayAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return vnDateStr(d)
}
const today = () => dayAgo(0)

// Entry tối thiểu để nộp (round do saveEntry tự đóng dấu).
const mkEntry = (day: string, challengeDay = 1): Omit<VlogEntryLocal, 'round'> => ({
  day,
  challengeDay,
  topicDay: challengeDay,
  transcript: 'hello world today',
  feedback: null,
  durationSec: 30,
  wordCount: 3,
})

// Dựng thẳng 1 challenge (không qua localStorage) để test hàm thuần getChallengeDay:
// `submittedDaysAgo` = danh sách "n ngày trước" ĐÃ nộp bài.
const mkChallenge = (
  startDaysAgo: number,
  submittedDaysAgo: number[],
  round = 1,
): VlogChallenge => {
  const entries: Record<string, VlogEntryLocal> = {}
  submittedDaysAgo.forEach((n, i) => {
    const day = dayAgo(n)
    entries[day] = { ...mkEntry(day, i + 1), round }
  })
  return { startDate: dayAgo(startDaysAgo), round, entries }
}

describe('startChallenge / getChallenge — vòng và lịch sử', () => {
  beforeEach(() => localStorage.clear())

  it('chưa có thử thách → vòng 1, startDate = hôm nay (giờ VN)', () => {
    expect(getChallenge('u1')).toBeNull()
    const c = startChallenge('u1')
    expect(c.round).toBe(1)
    expect(c.startDate).toBe(today())
    expect(Object.keys(c.entries)).toHaveLength(0)
  })

  it('đã có thử thách → mở vòng mới (+1), entries vòng cũ GIỮ NGUYÊN trong lịch sử', () => {
    startChallenge('u1')
    saveEntry('u1', mkEntry(dayAgo(1)))
    const c2 = startChallenge('u1')
    expect(c2.round).toBe(2)
    expect(Object.keys(c2.entries)).toHaveLength(1) // lịch sử vòng 1 còn nguyên
    expect(c2.entries[dayAgo(1)].round).toBe(1) // entry cũ vẫn mang round cũ
  })

  it('dữ liệu localStorage hỏng → coi như chưa có thử thách, không throw', () => {
    localStorage.setItem('et_vlog_u1', '{"broken":')
    expect(getChallenge('u1')).toBeNull()
    localStorage.setItem('et_vlog_u1', JSON.stringify({ startDate: 1, round: 'x' }))
    expect(getChallenge('u1')).toBeNull()
  })

  it('mỗi người dùng 1 key riêng — không lẫn nhau', () => {
    startChallenge('u1')
    expect(getChallenge('u2')).toBeNull()
  })
})

describe('saveEntry — idempotent theo ngày (ca biên mục 4.3)', () => {
  beforeEach(() => localStorage.clear())

  it('nộp 2 lần cùng 1 ngày → ghi đè, vẫn chỉ 1 entry', () => {
    startChallenge('u1')
    saveEntry('u1', mkEntry(today()))
    const c = saveEntry('u1', { ...mkEntry(today()), transcript: 'second take', wordCount: 2 })
    expect(Object.keys(c.entries)).toHaveLength(1)
    expect(c.entries[today()].transcript).toBe('second take')
    // Nộp lại KHÔNG làm tăng số ngày đã nộp → mốc huy hiệu không nhảy
    expect(getEarnedMilestones(c)).toEqual([1])
  })

  it('chưa startChallenge mà nộp → tự mở vòng 1 (phòng UI gọi lệch thứ tự)', () => {
    const c = saveEntry('u1', mkEntry(today()))
    expect(c.round).toBe(1)
    expect(c.entries[today()].round).toBe(1)
  })

  it('nộp sau khi restart → entry mang round MỚI', () => {
    startChallenge('u1')
    saveEntry('u1', mkEntry(dayAgo(1)))
    restartChallenge('u1')
    const c = saveEntry('u1', mkEntry(today()))
    expect(c.entries[today()].round).toBe(2)
    expect(c.entries[dayAgo(1)].round).toBe(1)
  })
})

describe('getChallengeDay — vé nghỉ 1 ngày/tuần (nhất quán luật getStreak của storage.ts)', () => {
  it('nộp liên tục từ ngày bắt đầu → day = số ngày đã nộp (hôm nay đã nộp)', () => {
    const c = mkChallenge(2, [2, 1, 0])
    expect(getChallengeDay(c, today())).toEqual({ day: 3, isBroken: false })
  })

  it('hôm nay CHƯA nộp → day = số đã nộp + 1, không tính là lỡ (giống getStreak bỏ qua i===0)', () => {
    const c = mkChallenge(2, [2, 1])
    expect(getChallengeDay(c, today())).toEqual({ day: 3, isBroken: false })
  })

  it('lỡ 1 ngày giữa chừng → bắc cầu bằng vé, KHÔNG đứt; số ngày vẫn theo số đã nộp', () => {
    // Bắt đầu 4 ngày trước, nộp ngày -4 -3 -1, LỠ ngày -2
    const c = mkChallenge(4, [4, 3, 1])
    expect(getChallengeDay(c, today())).toEqual({ day: 4, isBroken: false })
  })

  it('lỡ 2 ngày trong cùng 7 ngày → hết vé, ĐỨT', () => {
    // Nộp -5 -3 -1, lỡ -4 và -2 (cách nhau 2 ngày < cooldown 7)
    const c = mkChallenge(5, [5, 3, 1])
    expect(getChallengeDay(c, today()).isBroken).toBe(true)
  })

  it('2 ngày lỡ cách nhau ĐỦ 7 ngày → mỗi tuần 1 vé, không đứt', () => {
    // Bắt đầu -9; lỡ -8 và -1 (cách nhau 7 ngày = hết cooldown); các ngày còn lại đều nộp
    const c = mkChallenge(9, [9, 7, 6, 5, 4, 3, 2, 0])
    expect(getChallengeDay(c, today())).toEqual({ day: 8, isBroken: false })
  })

  it('lỡ 2 ngày LIỀN NHAU → chỉ ngày đầu có vé, ngày sau đứt (như getStreak)', () => {
    const c = mkChallenge(4, [4, 1, 0]) // lỡ -3 và -2 liên tiếp
    expect(getChallengeDay(c, today()).isBroken).toBe(true)
  })

  it('todayStr trước startDate (đồng hồ lệch) → không đứt, không âm', () => {
    const c = mkChallenge(0, [])
    expect(getChallengeDay(c, dayAgo(1))).toEqual({ day: 1, isBroken: false })
  })
})

describe('resume vs restart sau khi đứt', () => {
  beforeEach(() => localStorage.clear())

  // Dựng trạng thái ĐỨT trong localStorage: bắt đầu -5, nộp -5 -4, lỡ -3 -2 -1
  const seedBroken = () => {
    localStorage.setItem('et_vlog_u1', JSON.stringify(mkChallenge(5, [5, 4])))
    expect(getChallengeDay(getChallenge('u1')!, today()).isBroken).toBe(true)
  }

  it('resumeChallenge: giữ vòng + entries, dời startDate → hết đứt, day NỐI TIẾP số đã nộp', () => {
    seedBroken()
    const c = resumeChallenge('u1')
    expect(c).not.toBeNull()
    expect(c!.round).toBe(1) // vẫn vòng cũ
    expect(Object.keys(c!.entries)).toHaveLength(2) // bài đã nộp còn nguyên
    expect(c!.startDate).toBe(today())
    // 2 ngày đã nộp + hôm nay chưa nộp → tiếp tục ở ngày 3
    expect(getChallengeDay(c!, today())).toEqual({ day: 3, isBroken: false })
  })

  it('restartChallenge: vòng mới đếm lại từ ngày 1, mốc huy hiệu về 0, lịch sử vòng cũ còn', () => {
    seedBroken()
    const c = restartChallenge('u1')
    expect(c.round).toBe(2)
    expect(getChallengeDay(c, today())).toEqual({ day: 1, isBroken: false })
    expect(getEarnedMilestones(c)).toEqual([]) // vòng mới chưa nộp gì
    expect(Object.keys(c.entries)).toHaveLength(2) // lịch sử round 1 giữ nguyên
  })

  it('resumeChallenge khi chưa có thử thách → null (không tự bịa trạng thái)', () => {
    expect(resumeChallenge('u9')).toBeNull()
  })
})

describe('Huy hiệu mốc — theo SỐ NGÀY ĐÃ NỘP, không phải ngày lịch', () => {
  it('nộp 3 ngày (dù trải trên 5 ngày lịch) → đạt mốc 1 và 3', () => {
    const c = mkChallenge(5, [5, 3, 1]) // 3 bài nộp rải rác
    expect(getEarnedMilestones(c)).toEqual([1, 3])
  })

  it('đủ 7 ngày nộp → thêm mốc 7; đủ 30 → đủ cả 6 mốc', () => {
    const seven = mkChallenge(6, [6, 5, 4, 3, 2, 1, 0])
    expect(getEarnedMilestones(seven)).toEqual([1, 3, 7])
    const thirty = mkChallenge(
      29,
      Array.from({ length: 30 }, (_, i) => i),
    )
    expect(getEarnedMilestones(thirty)).toEqual([...VLOG_MILESTONES])
  })

  it('chỉ đếm vòng HIỆN TẠI — entry vòng cũ không tính', () => {
    const c = mkChallenge(5, [5, 3, 1], 1)
    const roundTwo: VlogChallenge = { ...c, round: 2, startDate: today() }
    expect(getEarnedMilestones(roundTwo)).toEqual([])
  })

  it('getNewMilestone: phát hiện mốc vừa đạt để bắn confetti; không có gì mới → null', () => {
    expect(getNewMilestone([1], [1, 3])).toBe(3)
    expect(getNewMilestone([1, 3], [1, 3])).toBeNull()
    expect(getNewMilestone([], [1])).toBe(1)
  })
})

describe('getKeepDates — video ngày 1 + 7 video gần nhất', () => {
  it('10 ngày nộp → giữ ngày đầu + 7 ngày cuối (8 ngày, không trùng)', () => {
    const c = mkChallenge(9, [9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    const keep = getKeepDates(c)
    expect(keep).toHaveLength(8)
    expect(keep).toContain(dayAgo(9)) // ngày 1
    expect(keep).toContain(dayAgo(6)) // trong 7 ngày gần nhất
    expect(keep).not.toContain(dayAgo(8)) // ngoài cả 2 diện giữ → sẽ bị dọn
    expect(keep).not.toContain(dayAgo(7))
  })

  it('ít hơn 8 ngày nộp → giữ tất cả; chưa nộp gì → rỗng', () => {
    const c = mkChallenge(3, [3, 2, 0])
    expect(getKeepDates(c)).toEqual([dayAgo(3), dayAgo(2), dayAgo(0)])
    expect(getKeepDates(mkChallenge(0, []))).toEqual([])
  })
})

describe('mergeCloudEntries — đồng bộ đổi máy không mất tiến độ', () => {
  beforeEach(() => localStorage.clear())

  const mkCloud = (
    day: string,
    round: number,
    feedback: string | null = null,
  ): CloudEntryForMerge => ({
    day,
    round,
    challengeDay: 1,
    topicDay: 1,
    transcript: 'from cloud',
    feedback,
    durationSec: 20,
    wordCount: 2,
  })

  it('không có gì từ cloud → giữ nguyên local (kể cả null)', () => {
    expect(mergeCloudEntries('u1', [])).toBeNull()
    startChallenge('u1')
    const before = getChallenge('u1')
    expect(mergeCloudEntries('u1', [])).toEqual(before)
  })

  it('máy MỚI (chưa có challenge local) → dựng challenge từ cloud, startDate = ngày sớm nhất của vòng mới nhất', () => {
    const cloud = [mkCloud(dayAgo(3), 1), mkCloud(dayAgo(1), 1), mkCloud(dayAgo(0), 1)]
    const merged = mergeCloudEntries('u1', cloud)
    expect(merged).not.toBeNull()
    expect(merged!.round).toBe(1)
    expect(merged!.startDate).toBe(dayAgo(3))
    expect(Object.keys(merged!.entries)).toHaveLength(3)
    // Đã ghi vào localStorage — gọi lại getChallenge phải thấy đúng dữ liệu vừa hợp nhất
    expect(getChallenge('u1')).toEqual(merged)
  })

  it('máy ĐÃ có challenge → KHÔNG đụng startDate/round, chỉ bổ sung entry thiếu', () => {
    startChallenge('u1') // startDate = hôm nay, round 1
    saveEntry('u1', mkEntry(today()))
    const before = getChallenge('u1')!
    const cloud = [mkCloud(dayAgo(2), 1), mkCloud(today(), 1)] // dayAgo(2) mới với máy này
    const merged = mergeCloudEntries('u1', cloud)!
    expect(merged.startDate).toBe(before.startDate)
    expect(merged.round).toBe(before.round)
    expect(Object.keys(merged.entries)).toHaveLength(2) // thêm dayAgo(2), giữ today()
  })

  it('cùng ngày: cloud có feedback, local chưa → cloud thắng; local đã có feedback → giữ local', () => {
    startChallenge('u1')
    saveEntry('u1', { ...mkEntry(today()), feedback: null })
    const merged1 = mergeCloudEntries('u1', [mkCloud(today(), 1, '{"praise":"tot"}')])!
    expect(merged1.entries[today()].feedback).toBe('{"praise":"tot"}')

    saveEntry('u1', { ...mkEntry(today()), feedback: '{"praise":"local"}' })
    const merged2 = mergeCloudEntries('u1', [mkCloud(today(), 1, '{"praise":"cloud-cu"}')])!
    expect(merged2.entries[today()].feedback).toBe('{"praise":"local"}')
  })
})

describe('countWords / calcWpm — ca rỗng và chia 0 (mục 4.3)', () => {
  it('countWords: chuỗi rỗng/toàn khoảng trắng → 0; tách theo mọi khoảng trắng', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   \n\t ')).toBe(0)
    expect(countWords('hello')).toBe(1)
    expect(countWords('  hello   world \n today ')).toBe(3)
  })

  it('calcWpm: 0 giây / 0 từ → 0 (không chia 0, không NaN)', () => {
    expect(calcWpm(0, 0)).toBe(0)
    expect(calcWpm(30, 0)).toBe(0)
    expect(calcWpm(0, 60)).toBe(0)
  })

  it('calcWpm: tính đúng và LÀM TRÒN', () => {
    expect(calcWpm(30, 60)).toBe(30) // 30 từ / 1 phút
    expect(calcWpm(25, 30)).toBe(50) // 25 từ / 30s = 50 wpm
    expect(calcWpm(10, 45)).toBe(13) // 13.33 → 13
  })
})
