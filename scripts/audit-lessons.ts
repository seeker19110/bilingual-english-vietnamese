// audit-lessons — RÀ CHẤT LƯỢNG toàn bộ nội dung học của môn Lập trình.
//
// VÌ SAO: nội dung học là sản phẩm chính của môn này, nhưng các cổng CI hiện có chỉ kiểm
// KHUÔN (Zod schema) và code mẫu chạy đúng test-case. Còn một lớp lỗi không cổng nào bắt:
// bài mồ côi (không trang nào dẫn tới), tham chiếu gãy (khoá/lộ trình trỏ bài không tồn tại),
// slug URL đụng nhau (hai bài cùng URL sau khi ghép tiêu đề), và các dấu hiệu nội dung soạn
// dở (gợi ý một bậc, không có ca test ẩn, thiếu thẻ SRS, chỗ ghi TODO).
//
// Chạy: npx tsx scripts/audit-lessons.ts        (in báo cáo, thoát 0)
//       npx tsx scripts/audit-lessons.ts --ci   (thoát 1 nếu còn lỗi mức LỖI)
import { PROGRAMMING_LESSONS, getLesson } from '@dhcb/subject-programming/lessons'
import { SHORT_COURSES } from '@dhcb/subject-programming/courses/registry'
import { PROGRAMMING_SPECIALIZATIONS } from '@dhcb/subject-programming/specializations/registry'
import { SPEC_STAGE_UNITS } from '@dhcb/subject-programming/specializations/stageUnits'
import { LEARNING_PATHS, pathStageRefs } from '@dhcb/subject-programming/learningPaths/registry'
import { resolveStage } from '@dhcb/subject-programming/learningPaths/pathStages'
import { PROGRAMMING_LEVELS } from '@dhcb/subject-programming/curriculum'
import { buildSlugSegment } from '@dhcb/core-ui/slug'

type Muc = 'LOI' | 'CANH_BAO'
interface Phat {
  muc: Muc
  ma: string
  doiTuong: string
  moTa: string
}
const phat: Phat[] = []
const loi = (ma: string, doiTuong: string, moTa: string) =>
  phat.push({ muc: 'LOI', ma, doiTuong, moTa })
const canhBao = (ma: string, doiTuong: string, moTa: string) =>
  phat.push({ muc: 'CANH_BAO', ma, doiTuong, moTa })

const chuanHoa = (s: string) => s.replace(/\s+/g, ' ').trim()

// ── Tập hợp tham chiếu: unit nào / bài nào ĐƯỢC dẫn tới từ đâu ────────────────────────────
const unitTrongXuongSong = new Set<string>()
for (const level of PROGRAMMING_LEVELS) for (const u of level.units) unitTrongXuongSong.add(u.id)

const unitTrongChang = new Set<string>()
for (const units of Object.values(SPEC_STAGE_UNITS)) for (const u of units) unitTrongChang.add(u)

const baiTrongKhoa = new Set<string>()
for (const khoa of SHORT_COURSES)
  for (const ch of khoa.chapters) for (const id of ch.lessonIds) baiTrongKhoa.add(id)

// ── 1. Bài học ────────────────────────────────────────────────────────────────────────────
const theoId = new Map<string, number>()
const theoSlug = new Map<string, string[]>()
const theoTieuDe = new Map<string, string[]>()

for (const bai of PROGRAMMING_LESSONS) {
  theoId.set(bai.id, (theoId.get(bai.id) ?? 0) + 1)
  const slug = buildSlugSegment(bai.id, bai.title)
  theoSlug.set(slug, [...(theoSlug.get(slug) ?? []), bai.id])
  const td = chuanHoa(bai.title).toLowerCase()
  theoTieuDe.set(td, [...(theoTieuDe.get(td) ?? []), bai.id])

  // Bài mồ côi: unit không thuộc xương sống, không thuộc chặng nào, và bài cũng không được
  // khoá ngắn nào tham chiếu → không có đường nào từ giao diện đi tới.
  if (
    !unitTrongXuongSong.has(bai.unitId) &&
    !unitTrongChang.has(bai.unitId) &&
    !baiTrongKhoa.has(bai.id)
  )
    loi('BAI_MO_COI', bai.id, `unit '${bai.unitId}' không nằm trong xương sống, chặng hay khoá nào`)

  // Chỗ soạn dở còn sót.
  const vanBan = [bai.hook, bai.theory, bai.make.prompt, bai.homework, ...bai.make.hints].join('\n')
  // Chỉ bắt DẤU HIỆU THẬT: 'TODO:'/'FIXME:' kiểu ghi chú người soạn, hoặc câu hứa hẹn.
  // Cố ý không bắt 'xxx'/'chưa viết' trần — chúng xuất hiện hợp lệ trong nội dung bài
  // (ví dụ Git ghi nhầm "xxx go nham xxx", bài đặc tả nói "giả định chưa viết ra").
  const dauHieu = vanBan.match(
    /\b(TODO|FIXME)\b\s*[:：]|lorem ipsum|sẽ (bổ sung|viết) (sau|tiếp)|đang soạn|placeholder/i,
  )
  if (dauHieu) canhBao('SOAN_DO', bai.id, `còn dấu hiệu soạn dở: "${dauHieu[0]}"`)

  // Lộ lời giải: code khởi đầu đã gần bằng code mẫu.
  const kd = chuanHoa(bai.make.starterCode)
  const mau = chuanHoa(bai.make.sampleSolution)
  if (kd.length > 0 && kd === mau)
    loi('LO_LOI_GIAI', bai.id, 'starterCode trùng hệt sampleSolution')

  // Bài Make chỉ là chép lại ví dụ mẫu ở bước ③ → học viên không phải nghĩ gì.
  // Ngoại lệ có chủ ý: bài mà lời giải chỉ có MỘT lệnh (bài "đọc bảng trạng thái" mở đầu
  // các khoá công cụ) — ở đó chỉ tồn tại đúng một lệnh để gõ, nên trùng là không tránh được;
  // hạ xuống cảnh báo thay vì lỗi.
  if (chuanHoa(bai.workedExample.code) === mau) {
    const nhieuDong =
      bai.make.sampleSolution
        .trim()
        .split('\n')
        .filter((d) => d.trim()).length > 1
    const ma = 'MAKE_TRUNG_VI_DU'
    const moTa = 'sampleSolution trùng hệt workedExample.code'
    if (nhieuDong) loi(ma, bai.id, moTa)
    else canhBao(ma, bai.id, `${moTa} (lời giải chỉ một lệnh — ngoại lệ chấp nhận được)`)
  }

  // Gợi ý phải là BẬC THANG (nhắc khái niệm → chỉ vùng lỗi → ví dụ tương tự).
  if (bai.make.hints.length < 2)
    canhBao('GOI_Y_MOT_BAC', bai.id, `chỉ có ${bai.make.hints.length} gợi ý, không thành bậc thang`)

  // Không có ca test ẩn → học viên hardcode được output là qua bài. Chỉ xét ngôn ngữ mà học
  // viên VIẾT CODE: bài mô phỏng công cụ (git/hermes/vibe/openclaw/bash) học viên gõ LỆNH,
  // output do bộ mô phỏng sinh nên không hardcode được — ca ẩn ở đó vô nghĩa.
  // Cũng bỏ qua bài đã có ca 'exact' phủ TOÀN BỘ output: khớp tuyệt đối trên bộ dữ liệu cố
  // định đã chặn đường ăn may, ca ẩn thêm không kiểm được gì mới (các bài SQL là ca này).
  const NGON_NGU_MO_PHONG = ['git', 'hermes', 'vibe', 'openclaw', 'bash']
  const coCaExact = bai.make.testCases.some((tc) => tc.match === 'exact')
  if (
    !NGON_NGU_MO_PHONG.includes(bai.language) &&
    !coCaExact &&
    !bai.make.testCases.some((tc) => tc.hidden)
  )
    canhBao('KHONG_CA_AN', bai.id, 'không ca test-case nào ẩn (chống hardcode)')

  if (!bai.srsCards) canhBao('THIEU_SRS', bai.id, 'chưa có thẻ SRS (bước ⑧)')

  // Lựa chọn Predict trùng nhau → câu hỏi hỏng (hai đáp án cùng đúng/cùng sai).
  const luaChon = bai.predict.choices.map(chuanHoa)
  if (new Set(luaChon).size !== luaChon.length)
    loi('PREDICT_TRUNG_LUA_CHON', bai.id, 'predict.choices có lựa chọn trùng nhau')
}

for (const [id, n] of theoId) if (n > 1) loi('ID_TRUNG', id, `${n} bài cùng id`)
for (const [slug, ids] of theoSlug)
  if (ids.length > 1) loi('SLUG_DUNG_NHAU', slug, `cùng URL: ${ids.join(', ')}`)
for (const [td, ids] of theoTieuDe)
  if (ids.length > 1)
    canhBao('TIEU_DE_TRUNG', td, `${ids.length} bài cùng tiêu đề: ${ids.join(', ')}`)

// ── 2. Khoá ngắn ──────────────────────────────────────────────────────────────────────────
for (const khoa of SHORT_COURSES) {
  const daGap = new Set<string>()
  for (const ch of khoa.chapters) {
    if (ch.lessonIds.length === 0) canhBao('CHUONG_RONG', ch.id, 'chương không có bài nào')
    for (const id of ch.lessonIds) {
      if (!getLesson(id))
        loi('KHOA_THAM_CHIEU_GAY', `${khoa.id}/${ch.id}`, `bài '${id}' không tồn tại`)
      if (daGap.has(id))
        canhBao('KHOA_BAI_LAP', `${khoa.id}/${ch.id}`, `bài '${id}' xuất hiện 2 lần trong khoá`)
      daGap.add(id)
    }
  }
}

// ── 3. Hướng chuyên sâu ───────────────────────────────────────────────────────────────────
const changCoThat = new Set<string>()
for (const spec of PROGRAMMING_SPECIALIZATIONS) {
  const bac = spec.stages.map((s) => s.tier)
  if (bac.join(',') !== 's1,s2,s3,s4')
    loi('CHANG_THIEU_BAC', spec.id, `bậc chặng là [${bac.join(', ')}], phải là s1→s4`)
  for (const st of spec.stages) {
    changCoThat.add(st.id)
    if (st.id !== `${spec.id}-${st.tier}`)
      loi('CHANG_SAI_ID', st.id, `id chặng phải là '${spec.id}-${st.tier}'`)
    if (st.modules.length === 0) canhBao('CHANG_RONG', st.id, 'chặng không có module nào')
  }
}
for (const [changId, units] of Object.entries(SPEC_STAGE_UNITS)) {
  const laChangLoTrinh = resolveStage(changId) !== undefined
  if (!changCoThat.has(changId) && !laChangLoTrinh)
    loi('STAGE_UNITS_GAY', changId, 'khai unit cho một chặng không tồn tại')
  for (const u of units)
    if (!PROGRAMMING_LESSONS.some((b) => b.unitId === u))
      loi('UNIT_KHONG_CO_BAI', `${changId}/${u}`, `unit '${u}' chưa có bài học nào`)
}

// ── 4. Lộ trình mục tiêu ──────────────────────────────────────────────────────────────────
for (const lt of LEARNING_PATHS) {
  const daGap = new Set<string>()
  for (const ref of pathStageRefs(lt)) {
    if (!resolveStage(ref.stageId))
      loi('LO_TRINH_THAM_CHIEU_GAY', lt.id, `chặng '${ref.stageId}' không tra ra được`)
    if (daGap.has(ref.stageId))
      canhBao('LO_TRINH_CHANG_LAP', lt.id, `chặng '${ref.stageId}' lặp lại`)
    daGap.add(ref.stageId)
    for (const req of ref.requires ?? [])
      if (!pathStageRefs(lt).some((r) => r.stageId === req))
        loi('LO_TRINH_REQUIRES_GAY', lt.id, `'${ref.stageId}' đòi '${req}' không có trong lộ trình`)
  }
}

// ── In báo cáo ────────────────────────────────────────────────────────────────────────────
const soLoi = phat.filter((p) => p.muc === 'LOI').length
const soCanhBao = phat.length - soLoi
console.log(
  `Đã rà: ${PROGRAMMING_LESSONS.length} bài · ${SHORT_COURSES.length} khoá ngắn · ${PROGRAMMING_SPECIALIZATIONS.length} hướng · ${LEARNING_PATHS.length} lộ trình`,
)
console.log(`Kết quả: ${soLoi} LỖI · ${soCanhBao} cảnh báo\n`)
const theoMa = new Map<string, Phat[]>()
for (const p of phat) theoMa.set(p.ma, [...(theoMa.get(p.ma) ?? []), p])
for (const [ma, ds] of [...theoMa].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`[${ds[0]!.muc}] ${ma} — ${ds.length} ca`)
  for (const p of ds.slice(0, 12)) console.log(`   · ${p.doiTuong}: ${p.moTa}`)
  if (ds.length > 12) console.log(`   · … còn ${ds.length - 12} ca nữa`)
}
if (process.argv.includes('--ci') && soLoi > 0) process.exit(1)
