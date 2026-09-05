// vibeSim.test.ts — cổng đơn vị cho bộ mô phỏng tác tử AI viết code (khoá Vibe Code,
// docs/specs/2026-08-31-khoa-vibe-code.md §④/⑤). Mỗi luật sư phạm có test dương + âm;
// cơ chế ca biên và tính tất định có cổng riêng — đúng khuôn hermesSim.test.ts.
import { describe, expect, it } from 'vitest'
import { chayLenhVibe, DONG_TU_KHAI_VIBE } from './vibeSim.js'

/** Mô tả đủ dài, có nhắc ca biên — dùng làm "mô tả chuẩn" xuyên suốt file test. */
const MOTA_CHUAN = 'mota "them may tinh chia tien an trua, chia deu, bao loi khi so nguoi bang 0"'
/** Mô tả đủ dài nhưng KHÔNG nhắc ca biên — để thử cơ chế quên ca biên. */
const MOTA_QUEN_BIEN = 'mota "them nut doi giao dien sang mau toi cho de nhin ban dem"'

describe('vibeSim — luật tự khai + bộ lệnh đóng', () => {
  it('mọi lượt chạy in dòng tự khai [GIA LAP] đầu tiên', () => {
    const r = chayLenhVibe('vibe')
    expect(r.output.startsWith(DONG_TU_KHAI_VIBE)).toBe(true)
  })

  it('lệnh ngoài bộ lệnh đóng bị từ chối kèm danh sách lệnh có', () => {
    const r = chayLenhVibe('npm install')
    expect(r.error).toContain('mo phong khong lam lenh')
  })

  it('bảng trạng thái ban đầu: 0 tính năng, test chua-chay, chưa có mốc', () => {
    const r = chayLenhVibe('vibe')
    expect(r.output).toContain('tinh nang da nhan: 0')
    expect(r.output).toContain('test: chua-chay')
    expect(r.output).toContain('moc gan nhat: chua co')
  })
})

describe('luật 1 — mô tả mơ hồ thì agent hỏi lại, không xây gì', () => {
  it('mô tả quá ngắn → 3 câu hỏi làm rõ, KHÔNG tạo bản nháp', () => {
    const r = chayLenhVibe('mota "lam web"\nvibe')
    expect(r.error).toContain('qua mo ho')
    expect(r.output).toContain('1. Ai dung tinh nang nay')
  })

  it('kehoach cũng chịu phép kiểm mơ hồ', () => {
    expect(chayLenhVibe('kehoach "app hay"').error).toContain('qua mo ho')
  })

  it('mô tả đủ rõ → tạo bản nháp cho-xem (test dương)', () => {
    const r = chayLenhVibe(`${MOTA_CHUAN}\nvibe`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('ban nhap cho xem: 1')
    // moc gan nhat phai hien dung ten khi da co moc (nhanh mocCuoi truthy).
  })

  it('mota không có nội dung trong ngoặc kép → lỗi thiếu nội dung', () => {
    const r = chayLenhVibe('mota')
    expect(r.error).toContain('thieu noi dung')
  })

  it('mota với ngoặc kép rỗng → lỗi thiếu nội dung', () => {
    const r = chayLenhVibe('mota ""')
    expect(r.error).toContain('thieu noi dung')
  })

  it('kehoach không có nội dung → lỗi thiếu nội dung', () => {
    const r = chayLenhVibe('kehoach')
    expect(r.error).toContain('thieu noi dung')
  })

  it('kehoach đủ rõ → in đủ 4 bước kế hoạch, chưa đụng vào code', () => {
    const r = chayLenhVibe(
      'kehoach "them may tinh chia tien an trua, chia deu, bao loi khi so nguoi bang 0"',
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Ke hoach cho:')
    expect(r.output).toContain('4. Noi giao dien, chay thu tung buoc.')
    expect(r.output).toContain('Chua dung vao code')
  })
})

describe('luật 2 — không nhận code chưa đọc', () => {
  it('nhan khi chưa xemdiff → từ chối', () => {
    const r = chayLenhVibe('nhan v1', [MOTA_CHUAN])
    expect(r.error).toContain('chua xem diff')
  })

  it('xemdiff rồi mới nhan → được (test dương)', () => {
    const r = chayLenhVibe('xemdiff v1\nnhan v1', [MOTA_CHUAN])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da nhan v1')
  })

  it('sua xong cờ đã-xem bị xoá — phải xemdiff lại mới nhan được', () => {
    const r = chayLenhVibe('sua v1 "doi mau nut sang xanh la cho noi bat"\nnhan v1', [
      MOTA_CHUAN,
      'xemdiff v1',
    ])
    expect(r.error).toContain('chua xem diff')
  })

  it('nhan bản nháp đã nhận rồi → lỗi đã nhận', () => {
    const r = chayLenhVibe('nhan v1', [MOTA_CHUAN, 'xemdiff v1', 'nhan v1'])
    expect(r.error).toContain('da duoc nhan roi')
  })

  it('xemdiff/nhan/giaithich/sua thiếu id → lỗi thiếu id', () => {
    expect(chayLenhVibe('xemdiff').error).toContain('thieu id ban nhap')
    expect(chayLenhVibe('nhan').error).toContain('thieu id ban nhap')
    expect(chayLenhVibe('giaithich').error).toContain('thieu id ban nhap')
    expect(chayLenhVibe('sua').error).toContain('thieu id ban nhap')
  })

  it('xemdiff/nhan id không tồn tại → lỗi không có bản nháp', () => {
    const r = chayLenhVibe('xemdiff v9', [MOTA_CHUAN])
    expect(r.error).toContain('khong co ban nhap "v9"')
  })

  it('giaithich giải thích bản nháp bằng lời thường (không phải diff)', () => {
    const r = chayLenhVibe('giaithich v1', [MOTA_CHUAN])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Giai thich v1 bang loi thuong')
    expect(r.output).toContain('Hoi tiep duoc')
  })

  it('sua thiếu id → lỗi thiếu id ban nhap (đã canh ở trên); sua id không tồn tại → lỗi', () => {
    const r = chayLenhVibe('sua v9 "gop y"', [MOTA_CHUAN])
    expect(r.error).toContain('khong co ban nhap "v9"')
  })

  it('sua không kèm góp ý trong ngoặc kép → lỗi thiếu góp ý', () => {
    const r = chayLenhVibe('sua v1', [MOTA_CHUAN])
    expect(r.error).toContain('sua phai kem gop y')
    const rong = chayLenhVibe('sua v1 ""', [MOTA_CHUAN])
    expect(rong.error).toContain('sua phai kem gop y')
  })
})

describe('luật 3 — test chưa xanh thì không deploy', () => {
  const CHUAN_BI_DA_NHAN = [MOTA_CHUAN, 'xemdiff v1', 'nhan v1']

  it('trienkhai khi test chua-chay → từ chối', () => {
    const r = chayLenhVibe('trienkhai', CHUAN_BI_DA_NHAN)
    expect(r.error).toContain('khong trien khai')
  })

  it('kiemtra xanh rồi trienkhai → được (test dương)', () => {
    const r = chayLenhVibe('kiemtra\ntrienkhai', CHUAN_BI_DA_NHAN)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da trien khai')
  })

  it('vibe hiện "da len song" sau khi đã trienkhai thành công', () => {
    const r = chayLenhVibe('vibe', [...CHUAN_BI_DA_NHAN, 'kiemtra', 'trienkhai'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('trien khai: da len song')
  })

  it('nhận thêm tính năng SAU khi kiểm → test về chua-chay, deploy lại bị chặn', () => {
    const r = chayLenhVibe('xemdiff v2\nnhan v2\ntrienkhai', [
      ...CHUAN_BI_DA_NHAN,
      'kiemtra',
      MOTA_CHUAN.replace('may tinh chia tien', 'bang xep hang nguoi tra tien'),
    ])
    expect(r.error).toContain('khong trien khai')
  })
})

describe('luật 4 — secret không vào mô tả', () => {
  it('mô tả chứa khoá API dạng sk-… → từ chối, không tạo gì', () => {
    const r = chayLenhVibe('mota "goi api thoi tiet voi khoa sk-abc12345xyz de hien nhiet do"')
    expect(r.error).toContain('agent tu choi')
  })

  it('mô tả chứa "mat khau la …" → từ chối', () => {
    const r = chayLenhVibe('mota "dang nhap trang quan tri, mat khau la 123456, roi tai bao cao"')
    expect(r.error).toContain('agent tu choi')
  })
})

describe('cơ chế ca biên — AI quên ca biên trừ khi được nhắc', () => {
  it('mô tả không nhắc ca biên → kiemtra ra 1 đỏ nêu đích danh', () => {
    const r = chayLenhVibe('kiemtra', [MOTA_QUEN_BIEN, 'xemdiff v1', 'nhan v1'])
    expect(r.output).toContain('1 do')
    expect(r.output).toContain('quen ca bien')
  })

  it('mô tả có nhắc ca biên ngay từ đầu → xanh hết', () => {
    const r = chayLenhVibe('kiemtra', [MOTA_CHUAN, 'xemdiff v1', 'nhan v1'])
    expect(r.output).toContain('xanh het')
  })

  it('sua kèm góp ý nhắc ca biên → kiểm lại xanh', () => {
    const r = chayLenhVibe(
      'sua v1 "them xu ly khi danh sach rong thi bao chua co du lieu"\nxemdiff v1\nnhan v1\nkiemtra',
      [MOTA_QUEN_BIEN, 'xemdiff v1', 'nhan v1', 'kiemtra'],
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('xanh het')
  })
})

describe('mốc & hoàn tác', () => {
  it('quaylai khi chưa có mốc → từ chối kèm lời khuyên', () => {
    expect(chayLenhVibe('quaylai').error).toContain('chua co moc nao')
  })

  it('luu mốc → nhận thêm → quaylai gỡ đúng tính năng nhận sau mốc', () => {
    const r = chayLenhVibe('quaylai\nvibe', [
      MOTA_CHUAN,
      'xemdiff v1',
      'nhan v1',
      'luu "ban chay duoc dau tien"',
      MOTA_QUEN_BIEN,
      'xemdiff v2',
      'nhan v2',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('cho-xem: v2')
    expect(r.output).toContain('tinh nang da nhan: 1')
  })

  it('luu thiếu tên mốc → lỗi thiếu tên', () => {
    expect(chayLenhVibe('luu').error).toContain('thieu ten moc')
    expect(chayLenhVibe('luu ""').error).toContain('thieu ten moc')
  })

  it('lichsu khi chưa có mốc → nhắc cách lưu', () => {
    const r = chayLenhVibe('lichsu')
    expect(r.output).toContain('Chua co moc nao')
  })

  it('lichsu liệt kê các mốc đã lưu theo thứ tự', () => {
    const r = chayLenhVibe('luu "moc 2"\nlichsu', [MOTA_CHUAN, 'luu "moc 1"'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('1. moc 1 (0 tinh nang)')
    expect(r.output).toContain('2. moc 2 (0 tinh nang)')
  })

  it('quaylai khi không có tính năng nào nhận sau mốc → báo giữ nguyên', () => {
    const r = chayLenhVibe('quaylai', [MOTA_CHUAN, 'luu "moc rong"'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Khong co tinh nang nao nhan sau moc')
  })

  it('vibe hiện đúng tên mốc gần nhất sau khi đã lưu', () => {
    const r = chayLenhVibe('vibe', [MOTA_CHUAN, 'luu "moc dau tien"'])
    expect(r.output).toContain('moc gan nhat: moc dau tien')
  })
})

describe('kiemtra ca biên', () => {
  it('kiemtra khi chưa nhận tính năng nào → lỗi không có gì để kiểm', () => {
    const r = chayLenhVibe('kiemtra')
    expect(r.error).toContain('chua co tinh nang nao duoc nhan')
  })

  it('kiemtra khi còn bản nháp cho-xem → cảnh báo chưa tính vào dự án', () => {
    const r = chayLenhVibe('kiemtra', [
      MOTA_CHUAN,
      'xemdiff v1',
      'nhan v1',
      MOTA_QUEN_BIEN.replace('nut doi giao dien', 'khung tim kiem nang cao'),
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('con 1 ban nhap cho xem')
  })
})

describe('tất định + bối cảnh', () => {
  it('cùng script chạy hai lần cho output y hệt', () => {
    const script = `${MOTA_CHUAN}\nxemdiff v1\nnhan v1\nkiemtra\nluu "moc 1"\ntrienkhai`
    expect(chayLenhVibe(script).output).toBe(chayLenhVibe(script).output)
  })

  it('lenhChuanBi dựng cảnh không in ra, lỗi dựng cảnh báo rõ', () => {
    const ok = chayLenhVibe('vibe', [MOTA_CHUAN])
    expect(ok.output).not.toContain('$ mota')
    const hong = chayLenhVibe('vibe', ['mota "mo ho"'])
    expect(hong.error).toContain('Loi khi dung boi canh')
  })

  it('dòng trống và dòng bắt đầu bằng # bị bỏ qua, không echo ra output', () => {
    const r = chayLenhVibe('\n# ghi chu khong chay\nvibe')
    expect(r.output).not.toContain('ghi chu khong chay')
    expect(r.output).toContain('$ vibe')
  })
})
