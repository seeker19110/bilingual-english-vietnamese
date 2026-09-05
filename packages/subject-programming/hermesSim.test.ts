// Cổng cho hermesSim (PR 2/4 khoá Hermes — đặc tả §⑤). Canh bốn thứ:
//  1. TẤT ĐỊNH tuyệt đối — cùng chuỗi lệnh hai lượt phải cho output y hệt từng byte.
//  2. Từng lệnh của bộ lệnh đóng chạy được + đủ ca lỗi ở bảng ③ của đặc tả.
//  3. BA LUẬT SƯ PHẠM nạp trong máy (chỉ NGƯỜI duyệt được việc · chặn secret · dừng hỏi
//     trước việc khó hoàn tác) — đây là nội dung dạy, hỏng là khoá mất lý do tồn tại.
//  4. Luật tự khai: mọi lượt chạy mở đầu bằng DONG_TU_KHAI_HERMES.
import { describe, expect, it } from 'vitest'
import { chayLenhHermes, DONG_TU_KHAI_HERMES } from './hermesSim.js'

describe('hermesSim — nền móng', () => {
  it('mọi lượt chạy in dòng tự khai [GIA LAP] ở dòng đầu', () => {
    const r = chayLenhHermes('hermes')
    expect(r.output.split('\n')[0]).toBe(DONG_TU_KHAI_HERMES)
    expect(DONG_TU_KHAI_HERMES).toContain('[GIA LAP]')
  })

  it('TẤT ĐỊNH: chạy hai lần cùng kịch bản cho output y hệt', () => {
    const kichBan = `hermes
hermes gateway setup
hermes gateway start
/new viec-bao-cao
giao "tong hop so lieu ban hang thang 8"
trangthai
duyet v1
trangthai`
    const a = chayLenhHermes(kichBan)
    const b = chayLenhHermes(kichBan)
    expect(a.output).toBe(b.output)
    expect(a.error).toBeUndefined()
  })

  it('dòng trống và dòng # bị bỏ qua, lệnh được echo lại với dấu $', () => {
    const r = chayLenhHermes('\n# ghi chu\nhermes\n')
    expect(r.output).toContain('$ hermes')
    expect(r.output).not.toContain('# ghi chu')
  })

  it('lệnh ngoài bộ lệnh đóng → lỗi tiếng Việt kể ra các lệnh có, không stack trace', () => {
    const r = chayLenhHermes('docker compose up')
    expect(r.error).toContain('mo phong khong lam lenh "docker"')
    expect(r.output).toContain('loi:')
    expect(r.error).toContain('giao')
  })
})

describe('hermesSim — cài đặt & cấu hình (chương C1)', () => {
  it('hermes không tham số in trạng thái tổng: profile, model, gateway, phiên', () => {
    const r = chayLenhHermes('hermes')
    expect(r.output).toContain('profile: mac-dinh')
    expect(r.output).toContain('model: hermes-4 · curator: hermes-4-mini')
    expect(r.output).toContain('gateway telegram: chua-cau-hinh')
  })

  it('gateway start khi chưa setup → lỗi gợi đúng lệnh kế tiếp', () => {
    const r = chayLenhHermes('hermes gateway start')
    expect(r.error).toContain('"hermes gateway setup" truoc')
  })

  it('gateway setup → start chạy trọn luồng Telegram', () => {
    const r = chayLenhHermes('hermes gateway setup\nhermes gateway start')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('@BotFather')
    expect(r.output).toContain('Gateway Telegram dang chay')
  })

  it('đổi model chính và model curator, /model đọc lại được', () => {
    const r = chayLenhHermes(
      'hermes model hermes-4-405b\nhermes model curator hermes-4-mini\n/model',
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da dat model chinh: hermes-4-405b')
    expect(r.output).toContain('model chinh: hermes-4-405b')
    expect(r.output).toContain('model curator: hermes-4-mini')
  })

  it('profile create tạo và chuyển sang profile mới; trùng tên → lỗi', () => {
    const ok = chayLenhHermes('hermes profile create thu-ky\nhermes profile')
    expect(ok.output).toContain('* thu-ky')
    expect(ok.output).toContain('  mac-dinh')
    const trung = chayLenhHermes('hermes profile create thu-ky\nhermes profile create thu-ky')
    expect(trung.error).toContain('da ton tai')
  })

  it('hermes gateway <lệnh lạ> → lỗi gợi đúng setup/start', () => {
    const r = chayLenhHermes('hermes gateway ngung')
    expect(r.error).toContain('khong hieu "hermes gateway ngung"')
    expect(r.error).toContain('dung: setup hoac start')
  })

  it('hermes profile create thiếu tên → lỗi', () => {
    const r = chayLenhHermes('hermes profile create')
    expect(r.error).toContain('thieu ten profile')
  })

  it('hermes profile <lệnh lạ> → lỗi gợi đúng create', () => {
    const r = chayLenhHermes('hermes profile xoa thu-ky')
    expect(r.error).toContain('khong hieu "hermes profile xoa thu-ky"')
  })

  it('hermes <nhóm lệnh lạ> → lỗi liệt kê toàn bộ bộ lệnh hermes', () => {
    const r = chayLenhHermes('hermes abc xyz')
    expect(r.error).toContain('khong hieu "hermes abc xyz"')
    expect(r.error).toContain('hermes gateway setup|start')
  })

  it('hermes model curator thiếu tên → lỗi', () => {
    const r = chayLenhHermes('hermes model curator')
    expect(r.error).toContain('thieu ten model')
  })

  it('giao "" (chuỗi rỗng sau khi trim) cũng bị coi là thiếu nội dung', () => {
    const r = chayLenhHermes('giao "   "')
    expect(r.error).toContain('thieu noi dung viec')
  })

  it('/new đặt tên trùng phiên đang có → lỗi gợi /resume', () => {
    const r = chayLenhHermes('/new phien-1')
    expect(r.error).toContain('da ton tai')
    expect(r.error).toContain('/resume phien-1')
  })

  it('/resume thiếu tên phiên → lỗi', () => {
    const r = chayLenhHermes('/resume')
    expect(r.error).toContain('thieu ten phien')
  })

  it('/learn thiếu tên kỹ năng → lỗi', () => {
    const r = chayLenhHermes('/learn')
    expect(r.error).toContain('thieu ten ky nang')
  })

  it('/steer thiếu chỉ dẫn (không có nội dung trong nháy kép) → lỗi', () => {
    const r = chayLenhHermes('/steer')
    expect(r.error).toContain('thieu chi dan')
  })

  it('trangthai/duyet/tuchoi thiếu id việc → lỗi', () => {
    expect(chayLenhHermes('duyet').error).toContain('thieu id viec')
    expect(chayLenhHermes('tuchoi').error).toContain('thieu id viec')
  })

  it('lệnh hoàn toàn không nhận diện được (không phải / hay nhóm nào) → lỗi liệt kê bộ lệnh', () => {
    const r = chayLenhHermes('abc-khong-ro-nghia')
    expect(r.error).toContain('mo phong khong lam lenh "abc-khong-ro-nghia"')
  })

  it('nhánh khác của luật chặn secret: "mat khau la …" (không có sk-) vẫn bị từ chối', () => {
    const r = chayLenhHermes('giao "dang nhap voi mat khau la 12345"')
    expect(r.error).toContain('agent tu choi')
  })
})

describe('hermesSim — phiên & kỹ năng (chương C1)', () => {
  it('/new không tên tự đặt phien-2, /resume quay lại phiên cũ', () => {
    const r = chayLenhHermes('/new\n/resume phien-1')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da mo phien moi "phien-2"')
    expect(r.output).toContain('Da quay lai phien "phien-1"')
  })

  it('/resume phiên không tồn tại → lỗi nêu tên + gợi /new', () => {
    const r = chayLenhHermes('/resume phien-ma')
    expect(r.error).toContain('khong co phien "phien-ma"')
    expect(r.error).toContain('/new phien-ma')
  })

  it('/skills liệt kê kỹ năng có sẵn; /learn thêm kỹ năng mới, trùng → lỗi', () => {
    const r = chayLenhHermes('/skills\n/learn bao-cao-tuan\n/skills')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('- tom-tat-tai-lieu')
    expect(r.output).toContain('Da dong goi cach lam viec vua roi thanh ky nang "bao-cao-tuan"')
    expect(r.output).toContain('- bao-cao-tuan')
    const trung = chayLenhHermes('/learn tom-tat-tai-lieu')
    expect(trung.error).toContain('da co')
  })
})

describe('hermesSim — goal & steer (chương C2)', () => {
  it('/goal đặt mục tiêu, /steer lái mà mục tiêu giữ nguyên', () => {
    const r = chayLenhHermes('/goal "moi sang tong hop tin nganh"\n/steer "chi lay tin tieng Viet"')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da dat muc tieu: moi sang tong hop tin nganh')
    expect(r.output).toContain('Muc tieu van giu nguyen')
  })

  it('/goal khi đã có mục tiêu → bắt chọn rõ bằng /goal thay (luật một-mục-tiêu)', () => {
    const r = chayLenhHermes('/goal "muc tieu A"\n/goal "muc tieu B"')
    expect(r.error).toContain('/goal thay "muc tieu B"')
    const thay = chayLenhHermes('/goal "muc tieu A"\n/goal thay "muc tieu B"\n/goal')
    expect(thay.error).toBeUndefined()
    expect(thay.output).toContain('Muc tieu dang theo: muc tieu B')
  })

  it('/steer khi chưa có mục tiêu → lỗi gợi /goal', () => {
    const r = chayLenhHermes('/steer "nhanh len"')
    expect(r.error).toContain('/goal')
  })

  it('/goal không tham số và chưa có mục tiêu → nhắc cách đặt mục tiêu', () => {
    const r = chayLenhHermes('/goal')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Chua co muc tieu — dat bang /goal')
  })
})

describe('hermesSim — /permission (chương C2)', () => {
  it('/permission không tham số → in chế độ hiện tại kèm giải thích hoi/tu-do', () => {
    const r = chayLenhHermes('/permission')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Che do quyen hien tai: hoi')
  })

  it('/permission giá trị lạ → lỗi chỉ đúng hai lựa chọn', () => {
    const r = chayLenhHermes('/permission linh-hoat')
    expect(r.error).toContain('chi co: hoi hoac tu-do')
  })

  it('/permission tu-do đổi được chế độ, đọc lại đúng giá trị mới', () => {
    const r = chayLenhHermes('/permission tu-do\n/permission')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da chuyen che do quyen: tu-do')
    expect(r.output).toContain('Che do quyen hien tai: tu-do')
  })

  it('/stop báo đã dừng, trạng thái việc giữ nguyên', () => {
    const r = chayLenhHermes('/stop')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da dung viec dang chay')
  })

  it('lệnh slash lạ → lỗi liệt kê toàn bộ lệnh slash có', () => {
    const r = chayLenhHermes('/khong-ton-tai')
    expect(r.error).toContain('mo phong khong lam lenh "/khong-ton-tai"')
    expect(r.error).toContain('/new /resume /model /skills /learn /goal /steer /permission /stop')
  })
})

describe('hermesSim — luồng việc giao/duyệt (chương C3–C4) + 3 luật sư phạm', () => {
  it('giao → cho-duyet; CHỈ duyet của học viên chuyển sang xong (luật sư phạm 1)', () => {
    const r = chayLenhHermes('giao "soan email moi hop khach hang"\ntrangthai\nduyet v1\ntrangthai')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('v1 [cho-duyet] soan email moi hop khach hang')
    expect(r.output).toContain('Nghiem thu la viec cua NGUOI')
    expect(r.output).toContain('v1 [xong]')
  })

  it('tuchoi phải kèm lý do; có lý do thì việc sang tu-choi', () => {
    const thieu = chayLenhHermes('giao "viet bao cao"\ntuchoi v1')
    expect(thieu.error).toContain('kem ly do')
    const du = chayLenhHermes('giao "viet bao cao"\ntuchoi v1 "thieu so lieu quy 2"\ntrangthai')
    expect(du.error).toBeUndefined()
    expect(du.output).toContain('v1 [tu-choi]')
  })

  it('duyet id không tồn tại / việc không ở cho-duyet → lỗi nói rõ, gợi trangthai', () => {
    const khong = chayLenhHermes('duyet v9')
    expect(khong.error).toContain('khong co viec "v9"')
    expect(khong.error).toContain('trangthai')
    const daXong = chayLenhHermes('giao "viec a"\nduyet v1\nduyet v1')
    expect(daXong.error).toContain('dang o trang thai "xong"')
  })

  it('secret trong nội dung việc → agent TỪ CHỐI, không tạo việc (luật sư phạm 2)', () => {
    const r = chayLenhHermes('giao "goi API voi api key la sk-abcdef123456"\ntrangthai')
    expect(r.error).toContain('Secret khong bao gio dan vao noi dung viec')
    // Việc không được tạo — kịch bản dừng ở lệnh lỗi nên không tới trangthai.
    expect(r.output).not.toContain('v1 [')
  })

  it('việc khó hoàn tác → dừng hỏi xác nhận; thêm CHAC CHAN mới làm (luật sư phạm 3)', () => {
    const dung = chayLenhHermes('giao "xoa tat ca email nhap"')
    expect(dung.error).toContain('kho hoan tac')
    expect(dung.error).toContain('CHAC CHAN')
    const xacNhan = chayLenhHermes('giao "xoa tat ca email nhap CHAC CHAN"\ntrangthai')
    expect(xacNhan.error).toBeUndefined()
    expect(xacNhan.output).toContain('v1 [cho-duyet]')
  })

  it('dò mẫu không phụ thuộc dấu tiếng Việt: "xoá toàn bộ" có dấu vẫn bị chặn', () => {
    const r = chayLenhHermes('giao "xoá toàn bộ dữ liệu khách"')
    expect(r.error).toContain('kho hoan tac')
  })

  it('trangthai khi chưa có việc → chỉ chỗ giao việc, không im lặng', () => {
    const r = chayLenhHermes('trangthai')
    expect(r.output).toContain('Chua co viec nao')
  })
})

describe('hermesSim — lenhChuanBi dựng bối cảnh', () => {
  it('bối cảnh chạy trước, không in ra; kịch bản dùng được trạng thái đã dựng', () => {
    const r = chayLenhHermes('duyet v1\ntrangthai', ['giao "viec dung san"'])
    expect(r.error).toBeUndefined()
    expect(r.output).not.toContain('Da nhan viec v1')
    expect(r.output).toContain('v1 [xong] viec dung san')
  })

  it('bối cảnh lỗi → báo "Loi khi dung boi canh", không chạy tiếp kịch bản', () => {
    const r = chayLenhHermes('trangthai', ['lenh-khong-ton-tai'])
    expect(r.error).toContain('Loi khi dung boi canh')
  })

  it('/permission tu-do rồi giao việc khó hoàn tác thì không bị chặn — bài học dạy vì sao nên giữ hoi', () => {
    const r = chayLenhHermes('giao "xoa tat ca file tam"', ['/permission tu-do'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('v1')
  })
})

// Đợt 2 coverage 2026-09-05: nhánh chưa phủ — mỗi ca dưới đây khớp một dòng cụ thể liệt kê
// trong uncovered-all.md (nhánh "khong hieu ..." của từng bảng lệnh con, và các ca thiếu
// tham số bắt buộc chưa ai gọi tới). Không sửa file nguồn.
describe('hermesSim — Đợt 2 coverage 2026-09-05: nhánh chưa phủ', () => {
  it.each([
    ['hermes gateway lệnh lạ', 'hermes gateway foobar', 'khong hieu "hermes gateway foobar"'],
    ['hermes profile lệnh lạ', 'hermes profile foobar', 'khong hieu "hermes profile foobar"'],
    ['hermes nhóm lệnh lạ', 'hermes foobar', 'khong hieu "hermes foobar"'],
    [
      '/foobar (slash lạ)',
      '/foobar',
      'mo phong khong lam lenh "/foobar" — cac lenh co: /new /resume /model /skills /learn /goal /steer /permission /stop.',
    ],
  ])('%s', (_mota, script, chuoiLoi) => {
    expect(chayLenhHermes(script).error).toContain(chuoiLoi)
  })

  it.each([
    ['hermes model curator thiếu tên', 'hermes model curator', 'thieu ten model'],
    ['hermes profile create thiếu tên', 'hermes profile create', 'thieu ten profile'],
    ['/resume thiếu tên phiên', '/resume', 'thieu ten phien — dung: /resume <ten-phien>.'],
    ['/learn thiếu tên kỹ năng', '/learn', 'thieu ten ky nang — dung: /learn <ten-ky-nang>.'],
    ['/steer thiếu chỉ dẫn (không có ngoặc kép)', '/steer', 'thieu chi dan — dung: /steer'],
    ['/permission chế độ lạ', '/permission banana', 'che do quyen chi co: hoi hoac tu-do.'],
    [
      'giao thiếu nội dung (không có ngoặc kép)',
      'giao',
      'thieu noi dung viec — dung: giao "<viec can lam>".',
    ],
    ['giao ngoặc kép rỗng — cùng lỗi như không có ngoặc', 'giao ""', 'thieu noi dung viec'],
    ['duyet thiếu id', 'duyet', 'thieu id viec — dung: duyet <id>. Xem id bang "trangthai".'],
  ])('%s', (_mota, script, chuoiLoi) => {
    expect(chayLenhHermes(script).error).toContain(chuoiLoi)
  })

  it('/new với tên phiên trùng phiên mặc định "phien-1" → lỗi gợi /resume', () => {
    const r = chayLenhHermes('/new phien-1')
    expect(r.error).toContain('phien "phien-1" da ton tai — dung /resume phien-1 de quay lai.')
  })

  it('/goal khi chưa từng đặt mục tiêu và gõ không kèm ngoặc kép → báo "Chua co muc tieu"', () => {
    const r = chayLenhHermes('/goal')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Chua co muc tieu — dat bang /goal "<muc tieu>".')
  })

  it('/permission không kèm chế độ → đọc chế độ hiện tại (mặc định hoi)', () => {
    const r = chayLenhHermes('/permission')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Che do quyen hien tai: hoi')
  })

  it('/stop báo đã dừng, trạng thái công việc giữ nguyên', () => {
    const r = chayLenhHermes('/stop')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da dung viec dang chay — trang thai cong viec giu nguyen')
  })
})
