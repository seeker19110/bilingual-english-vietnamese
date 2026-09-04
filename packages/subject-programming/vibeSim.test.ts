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
})

// Đợt 2 coverage 2026-09-05: nhánh chưa phủ — mỗi ca dưới đây khớp một dòng cụ thể liệt kê
// trong uncovered-all.md (thiếu tham số bắt buộc, ca "đã ở trạng thái cuối", nhánh rẽ trong
// vòng lặp quaylai). Không sửa file nguồn.
describe('vibeSim — Đợt 2 coverage 2026-09-05: nhánh chưa phủ', () => {
  it.each([
    ['mota thiếu nội dung (không ngoặc kép)', 'mota', 'thieu noi dung — dung: mota'],
    ['kehoach thiếu nội dung (không ngoặc kép)', 'kehoach', 'thieu noi dung — dung: kehoach'],
    ['xemdiff thiếu id', 'xemdiff', 'thieu id ban nhap — dung: xemdiff <id>'],
    ['luu thiếu tên mốc (không ngoặc kép)', 'luu', 'thieu ten moc — dung: luu'],
  ])('%s', (_mota, script, chuoiLoi) => {
    expect(chayLenhVibe(script).error).toContain(chuoiLoi)
  })

  it('lichsu khi chưa lưu mốc nào → chỉ chỗ lưu, không im lặng', () => {
    const r = chayLenhVibe('lichsu')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Chua co moc nao — luu bang: luu "<ten moc>".')
  })

  it('sua thiếu góp ý (không kèm ngoặc kép) → lỗi rõ', () => {
    const r = chayLenhVibe('sua v1', [MOTA_CHUAN])
    expect(r.error).toContain('sua phai kem gop y — dung: sua <id>')
  })

  it('nhan thiếu id → lỗi rõ (nhánh lỗi riêng của lenhNhan, khác lenhXemDiff)', () => {
    const r = chayLenhVibe('nhan')
    expect(r.error).toContain('thieu id ban nhap — dung: nhan <id>')
  })

  it('nhan một bản nháp đã nhận rồi → lỗi "da duoc nhan roi"', () => {
    const r = chayLenhVibe('nhan v1', [MOTA_CHUAN, 'xemdiff v1', 'nhan v1'])
    expect(r.error).toContain('ban nhap v1 da duoc nhan roi.')
  })

  it('vibe sau khi đã trienkhai thành công → dòng "trien khai: da len song"', () => {
    const r = chayLenhVibe('vibe', [MOTA_CHUAN, 'xemdiff v1', 'nhan v1', 'kiemtra', 'trienkhai'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('trien khai: da len song')
  })

  it('quaylai khi CÒN bản nháp cho-xem chưa nhận (chưa từng nhận) → không gỡ gì, báo giữ nguyên', () => {
    // Bản nháp v2 chỉ được mota, KHÔNG xemdiff/nhan — nằm nguyên ở "cho-xem" khi quaylai chạy,
    // nên vòng lặp trong lenhQuayLai phải NHẢY QUA nó (nhánh continue) thay vì gỡ nhầm.
    const r = chayLenhVibe('quaylai', [
      MOTA_CHUAN,
      'xemdiff v1',
      'nhan v1',
      'luu "ban chay duoc dau tien"',
      MOTA_QUEN_BIEN,
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Khong co tinh nang nao nhan sau moc — du an giu nguyen.')
  })
})
