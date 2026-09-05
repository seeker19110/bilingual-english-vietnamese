// Cổng cho openclawSim (PR 2/3 khoá OpenClaw — đặc tả §⑤). Canh bốn thứ:
//   1. TẤT ĐỊNH tuyệt đối — cùng kịch bản 2 lượt cho output byte-identical.
//   2. Từng nhóm lệnh của bộ lệnh đóng chạy đúng.
//   3. Đủ ca lỗi của hợp đồng §③ — lỗi tiếng Việt chỉ đúng đường, không stack trace.
//   4. Cả 3 luật sư phạm nạp trong máy hoạt động thật.
import { describe, expect, it } from 'vitest'
import { chayLenhOpenclaw, DONG_TU_KHAI_OPENCLAW } from './openclawSim.js'

/** Mọi ca (trừ ca dạy riêng về onboard) đều dựng cảnh "đã cài" cho gọn. */
const DA_CAI = ['openclaw onboard']
const DA_CHAY = ['openclaw onboard', 'openclaw gateway start']

describe('openclawSim — nền móng', () => {
  it('in dòng tự khai [GIA LAP] ở đầu mọi lượt chạy', () => {
    const r = chayLenhOpenclaw('openclaw onboard')
    expect(r.output.startsWith(DONG_TU_KHAI_OPENCLAW)).toBe(true)
  })

  it('TẤT ĐỊNH: cùng kịch bản hai lượt cho output y hệt từng byte', () => {
    const kichBan = [
      'openclaw onboard',
      'openclaw gateway start',
      'openclaw channel add telegram',
      'openclaw channel reconnect telegram',
      'openclaw cron add "7h sang" "gui bao cao"',
      'openclaw doctor',
    ].join('\n')
    expect(chayLenhOpenclaw(kichBan).output).toBe(chayLenhOpenclaw(kichBan).output)
  })

  it('bỏ qua dòng trống và dòng comment #, vẫn echo lệnh chạy bằng dấu $', () => {
    const r = chayLenhOpenclaw('\n# ghi chu\nopenclaw onboard\n')
    expect(r.output).toContain('$ openclaw onboard')
    expect(r.output).not.toContain('# ghi chu')
  })

  it('lệnh lạ → lỗi tiếng Việt kể các lệnh có, không stack trace', () => {
    const r = chayLenhOpenclaw('hermes')
    expect(r.error).toContain('mo phong khong lam lenh "hermes"')
    expect(r.error).toContain('openclaw')
  })

  it('mọi lệnh (trừ onboard) đòi onboard trước — chưa cài thì chỉ đúng đường', () => {
    const r = chayLenhOpenclaw('openclaw gateway start')
    expect(r.error).toContain('chua cai dat/onboard')
    expect(r.error).toContain('openclaw onboard')
  })
})

describe('openclawSim — cài đặt & gateway (chương C1)', () => {
  it('onboard kể đủ 3 việc: model, workspace, gateway', () => {
    const r = chayLenhOpenclaw('openclaw onboard')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Kiem tra ket noi model — OK')
    expect(r.output).toContain('~/.openclaw/')
    expect(r.output).toContain('openclaw gateway start')
  })

  it('onboard hai lần → lỗi nói đã onboard rồi', () => {
    const r = chayLenhOpenclaw('openclaw onboard\nopenclaw onboard')
    expect(r.error).toContain('da onboard roi')
  })

  it('gateway start/status/stop tròn vòng đời', () => {
    const r = chayLenhOpenclaw(
      'openclaw gateway start\nopenclaw gateway status\nopenclaw gateway stop',
      DA_CAI,
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Gateway dang chay')
    expect(r.output).toContain('gateway: dang-chay')
    expect(r.output).toContain('Da dung gateway')
  })

  it('dashboard đòi gateway đang chạy (luật sư phạm 3)', () => {
    const rot = chayLenhOpenclaw('openclaw dashboard', DA_CAI)
    expect(rot.error).toContain('gateway chua chay')
    const dat = chayLenhOpenclaw('openclaw dashboard', DA_CHAY)
    expect(dat.output).toContain('Control UI')
  })

  it('models liệt kê với dấu *, models use đổi model, tên lạ → lỗi kể danh sách', () => {
    const r = chayLenhOpenclaw('openclaw models\nopenclaw models use suy-luan-sau', DA_CAI)
    expect(r.output).toContain('* can-bang')
    expect(r.output).toContain('Da chuyen model chinh: suy-luan-sau')
    const rot = chayLenhOpenclaw('openclaw models use gpt-9', DA_CAI)
    expect(rot.error).toContain('khong co model "gpt-9"')
    expect(rot.error).toContain('gon-nhe, can-bang, suy-luan-sau')
  })

  it('doctor đọc đúng trạng thái: gateway đứng → CHU Y, kênh cho-token → CHU Y', () => {
    const r = chayLenhOpenclaw('openclaw doctor', [...DA_CAI, 'openclaw channel add telegram'])
    expect(r.output).toContain('[CHU Y] gateway dang dung')
    expect(r.output).toContain('1 kenh cho-token: telegram')
    const ok = chayLenhOpenclaw('openclaw doctor', DA_CHAY)
    expect(ok.output).toContain('[OK] gateway dang chay')
  })

  it('gateway start khi đang chạy / stop khi đã dừng → lỗi; hành động lạ → lỗi', () => {
    expect(chayLenhOpenclaw('openclaw gateway start', DA_CHAY).error).toContain(
      'gateway dang chay roi',
    )
    expect(chayLenhOpenclaw('openclaw gateway stop', DA_CAI).error).toContain(
      'gateway dang dung san roi',
    )
    expect(chayLenhOpenclaw('openclaw gateway banh', DA_CAI).error).toContain(
      'khong hieu "openclaw gateway banh"',
    )
  })

  it('chat thiếu nội dung → lỗi; nội dung bình thường (không secret, không việc máy thật) → agent trả lời thẳng', () => {
    expect(chayLenhOpenclaw('openclaw chat', DA_CHAY).error).toContain('thieu noi dung')
    expect(chayLenhOpenclaw('openclaw chat ""', DA_CHAY).error).toContain('thieu noi dung')
    const r = chayLenhOpenclaw('openclaw chat "hom nay thoi tiet the nao"', DA_CHAY)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('da nhan "hom nay thoi tiet the nao"')
  })

  it('models hành động lạ → lỗi; nhóm lệnh openclaw không rõ → lỗi liệt kê bộ lệnh', () => {
    expect(chayLenhOpenclaw('openclaw models banh', DA_CAI).error).toContain(
      'khong hieu "openclaw models banh"',
    )
    expect(chayLenhOpenclaw('openclaw banh', DA_CAI).error).toContain('khong hieu "openclaw banh"')
  })

  it('models use thiếu tên → lỗi kể danh sách model', () => {
    expect(chayLenhOpenclaw('openclaw models use', DA_CAI).error).toContain('khong co model ""')
  })

  it('skills hành động lạ → lỗi', () => {
    expect(chayLenhOpenclaw('openclaw skills banh', DA_CAI).error).toContain(
      'khong hieu "openclaw skills banh"',
    )
  })

  it('skills info thiếu tên → lỗi', () => {
    expect(chayLenhOpenclaw('openclaw skills info', DA_CAI).error).toContain('khong co ky nang ""')
  })
})

describe('openclawSim — kênh & hàng rào an toàn (chương C2)', () => {
  it('kênh mới LUÔN sinh ra chặn người lạ + allowFrom rỗng (luật sư phạm 1)', () => {
    const r = chayLenhOpenclaw('openclaw channel add telegram\nopenclaw channel list', DA_CAI)
    expect(r.output).toContain('dmPolicy: chan-nguoi-la')
    expect(r.output).toContain('allowFrom: (trong — chan het nguoi la)')
  })

  it('kênh không hỗ trợ / thêm trùng → lỗi rõ', () => {
    expect(chayLenhOpenclaw('openclaw channel add zalo', DA_CAI).error).toContain(
      'kenh "zalo" khong ho tro',
    )
    const trung = chayLenhOpenclaw(
      'openclaw channel add telegram\nopenclaw channel add telegram',
      DA_CAI,
    )
    expect(trung.error).toContain('da co roi')
  })

  it('reconnect và status đòi gateway đang chạy (luật sư phạm 3)', () => {
    const r = chayLenhOpenclaw('openclaw channel reconnect telegram', [
      ...DA_CAI,
      'openclaw channel add telegram',
    ])
    expect(r.error).toContain('gateway chua chay')
    expect(r.error).toContain('openclaw gateway start')
  })

  it('tin từ người lạ BỊ CHẶN, allow xong thì được nhận (luật sư phạm 1)', () => {
    const chuanBi = [
      ...DA_CHAY,
      'openclaw channel add telegram',
      'openclaw channel reconnect telegram',
    ]
    const chan = chayLenhOpenclaw('openclaw channel test telegram nguoi-la', chuanBi)
    expect(chan.error).toBeUndefined()
    expect(chan.output).toContain('BI CHAN')
    const mo = chayLenhOpenclaw(
      'openclaw channel allow telegram dong-nghiep\nopenclaw channel test telegram dong-nghiep',
      chuanBi,
    )
    expect(mo.output).toContain('DUOC NHAN')
  })

  it('chat đòi gateway; secret trong chat → từ chối lưu (luật sư phạm 2a)', () => {
    expect(chayLenhOpenclaw('openclaw chat "xin chao"', DA_CAI).error).toContain(
      'gateway chua chay',
    )
    const secret = chayLenhOpenclaw('openclaw chat "api key la sk-abcdef123456"', DA_CHAY)
    expect(secret.error).toContain('agent tu choi luu')
  })

  it('việc đụng máy thật vào hàng chờ — chỉ NGƯỜI duyệt mới chạy (luật sư phạm 2b)', () => {
    const cho = chayLenhOpenclaw('openclaw chat "xoa thu muc tam tren may"', DA_CHAY)
    expect(cho.error).toBeUndefined()
    expect(cho.output).toContain('hang cho duyet, id d1')
    const duyet = chayLenhOpenclaw('openclaw chat "xoa thu muc tam tren may"\nduyet d1', DA_CHAY)
    expect(duyet.output).toContain('Da duyet d1')
    const tuchoi = chayLenhOpenclaw(
      'openclaw chat "xoa thu muc tam tren may"\ntuchoi d1 "chua chac can"',
      DA_CHAY,
    )
    expect(tuchoi.output).toContain('Da tu choi d1 (ly do: chua chac can)')
  })

  it('duyet id không tồn tại / tuchoi thiếu lý do → lỗi rõ', () => {
    expect(chayLenhOpenclaw('duyet d9', DA_CAI).error).toContain('khong co muc cho duyet "d9"')
    expect(chayLenhOpenclaw('duyet d9', DA_CAI).error).toContain('(trong)')
    const thieu = chayLenhOpenclaw('openclaw chat "xoa file cu"\ntuchoi d1', DA_CHAY)
    expect(thieu.error).toContain('tu choi phai kem ly do')
  })

  it('duyet/tuchoi thiếu id → lỗi thiếu id; id lạ khi hàng chờ không rỗng → kể đúng id đang chờ', () => {
    expect(chayLenhOpenclaw('duyet', DA_CAI).error).toContain('thieu id')
    const r = chayLenhOpenclaw('duyet d9', [...DA_CHAY, 'openclaw chat "xoa file rac"'])
    expect(r.error).toContain('khong co muc cho duyet "d9"')
    expect(r.error).toContain('dang cho: d1')
  })

  it('channel list rỗng → nhắc cách thêm kênh', () => {
    const r = chayLenhOpenclaw('openclaw channel list', DA_CAI)
    expect(r.output).toContain('Chua co kenh nao')
  })

  it('channel status: đòi gateway chạy, kênh không tồn tại → lỗi kể danh sách kênh đã có', () => {
    const chuanBi = [...DA_CAI, 'openclaw channel add telegram']
    const rot = chayLenhOpenclaw('openclaw channel status telegram', chuanBi)
    expect(rot.error).toContain('gateway chua chay')
    const ok = chayLenhOpenclaw('openclaw channel status telegram', [
      ...chuanBi,
      'openclaw gateway start',
    ])
    expect(ok.error).toBeUndefined()
    expect(ok.output).toContain('dmPolicy: chan-nguoi-la')
    const laKhongTonTai = chayLenhOpenclaw('openclaw channel status discord', [
      ...DA_CHAY,
      'openclaw channel add telegram',
    ])
    expect(laKhongTonTai.error).toContain('chua co kenh "discord"')
    expect(laKhongTonTai.error).toContain('Da co: telegram')
  })

  it('channel remove gỡ đúng kênh khỏi danh sách', () => {
    const r = chayLenhOpenclaw('openclaw channel remove telegram\nopenclaw channel list', [
      ...DA_CAI,
      'openclaw channel add telegram',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da go kenh telegram')
    expect(r.output).toContain('Chua co kenh nao')
  })

  it('channel allow thiếu người → lỗi; allow trùng người → lỗi', () => {
    const chuanBi = [...DA_CAI, 'openclaw channel add telegram']
    expect(chayLenhOpenclaw('openclaw channel allow telegram', chuanBi).error).toContain(
      'thieu nguoi can mo',
    )
    const trung = chayLenhOpenclaw(
      'openclaw channel allow telegram a\nopenclaw channel allow telegram a',
      chuanBi,
    )
    expect(trung.error).toContain('da nam trong allowFrom roi')
  })

  it('channel test: kênh chưa nối → lỗi; thiếu người gửi → lỗi; kênh/hành động lạ → lỗi', () => {
    const chuanBi = [...DA_CAI, 'openclaw channel add telegram']
    const chuaNoi = chayLenhOpenclaw('openclaw channel test telegram ai-do', chuanBi)
    expect(chuaNoi.error).toContain('chua noi (dang cho-token)')
    const thieuNguoi = chayLenhOpenclaw('openclaw channel test telegram', [
      ...chuanBi,
      'openclaw gateway start',
      'openclaw channel reconnect telegram',
    ])
    expect(thieuNguoi.error).toContain('thieu nguoi gui')
    expect(chayLenhOpenclaw('openclaw channel banh telegram', DA_CAI).error).toContain(
      'khong hieu "openclaw channel banh telegram"',
    )
    expect(chayLenhOpenclaw('openclaw channel reconnect', DA_CAI).error).toContain('thieu ten kenh')
  })

  it('channel allow/remove/test với kênh không tồn tại → lỗi không có kênh (danh sách rỗng)', () => {
    expect(chayLenhOpenclaw('openclaw channel allow telegram a', DA_CAI).error).toContain(
      'chua co kenh "telegram"',
    )
    expect(chayLenhOpenclaw('openclaw channel allow telegram a', DA_CAI).error).toContain(
      '(chua co kenh nao)',
    )
    expect(chayLenhOpenclaw('openclaw channel remove telegram', DA_CAI).error).toContain(
      'chua co kenh "telegram"',
    )
    expect(chayLenhOpenclaw('openclaw channel test telegram a', DA_CAI).error).toContain(
      'chua co kenh "telegram"',
    )
  })

  it('moTaKenh in đủ danh sách allowFrom khi đã mở người (không còn "trong")', () => {
    const chuanBi = [
      ...DA_CHAY,
      'openclaw channel add telegram',
      'openclaw channel reconnect telegram',
      'openclaw channel allow telegram dong-nghiep',
    ]
    const r = chayLenhOpenclaw('openclaw channel status telegram', chuanBi)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('allowFrom: dong-nghiep')
  })

  it('reconnect nhắc allowFrom đã có người mở, không còn TRONG (kênh reconnect lại sau khi allow)', () => {
    const chuanBi = [
      ...DA_CHAY,
      'openclaw channel add telegram',
      'openclaw channel reconnect telegram',
      'openclaw channel allow telegram dong-nghiep',
      'openclaw gateway stop',
      'openclaw gateway start',
    ]
    const r = chayLenhOpenclaw('openclaw channel reconnect telegram', chuanBi)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('allowFrom dang dong-nghiep')
  })
})

describe('openclawSim — skills, cron, plugins (chương C3)', () => {
  it('skills liệt kê kho có sẵn, info kể ruột, tên lạ → lỗi', () => {
    const r = chayLenhOpenclaw('openclaw skills\nopenclaw skills info tom-tat-web', DA_CAI)
    expect(r.output).toContain('- tom-tat-web')
    expect(r.output).toContain('Ky nang tom-tat-web:')
    expect(chayLenhOpenclaw('openclaw skills info bay', DA_CAI).error).toContain(
      'khong co ky nang "bay"',
    )
  })

  it('cron add/list/disable/enable/run tròn vòng; id tất định c1, c2…', () => {
    const r = chayLenhOpenclaw(
      [
        'openclaw cron add "7h sang thu 2" "gui bao cao tuan"',
        'openclaw cron add "17h thu 6" "nhac nop timesheet"',
        'openclaw cron list',
        'openclaw cron disable c2',
        'openclaw cron enable c2',
        'openclaw cron run c1',
      ].join('\n'),
      DA_CAI,
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('c1 [bat] 7h sang thu 2 — gui bao cao tuan')
    expect(r.output).toContain('Da chay viec c1 (kich tay)')
  })

  it('cron run việc đang tắt / id lạ → lỗi rõ', () => {
    const tat = chayLenhOpenclaw(
      'openclaw cron add "8h" "don dep"\nopenclaw cron disable c1\nopenclaw cron run c1',
      DA_CAI,
    )
    expect(tat.error).toContain('viec c1 dang tat')
    expect(chayLenhOpenclaw('openclaw cron run c9', DA_CAI).error).toContain('khong co viec "c9"')
  })

  it('cron list hiện [tat] cho việc đã tắt', () => {
    const r = chayLenhOpenclaw('openclaw cron disable c1\nopenclaw cron list', [
      ...DA_CAI,
      'openclaw cron add "8h" "don dep"',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('c1 [tat] 8h — don dep')
  })

  it('cron enable/run id lạ khi danh sách KHÔNG rỗng → lỗi kể đúng id đang có', () => {
    const r = chayLenhOpenclaw('openclaw cron run c9', [
      ...DA_CAI,
      'openclaw cron add "8h" "don dep"',
    ])
    expect(r.error).toContain('khong co viec "c9"')
    expect(r.error).toContain('dang co: c1')
  })

  it('cron add thiếu lịch/tên → lỗi; list rỗng → nhắc cách tạo; hành động lạ → lỗi', () => {
    expect(chayLenhOpenclaw('openclaw cron add "7h"', DA_CAI).error).toContain(
      'thieu lich hoac ten viec',
    )
    expect(chayLenhOpenclaw('openclaw cron list', DA_CAI).output).toContain(
      'Chua co viec dinh ky nao',
    )
    expect(chayLenhOpenclaw('openclaw cron enable', DA_CAI).error).toContain('thieu id viec')
    expect(chayLenhOpenclaw('openclaw cron banh', DA_CAI).error).toContain(
      'khong hieu "openclaw cron banh"',
    )
  })

  it('/config in tóm tắt cấu hình, /plugins bật được plugin trong kho', () => {
    const r = chayLenhOpenclaw('/config\n/plugins\n/plugins bat ghi-chu', DA_CAI)
    expect(r.output).toContain('model chinh: can-bang')
    expect(r.output).toContain('[tat] ghi-chu')
    expect(r.output).toContain('Da bat plugin ghi-chu')
  })

  it('/config in đúng danh sách kênh khi đã có kênh; /plugins list hiện cả [bat] lẫn [tat]', () => {
    const r = chayLenhOpenclaw('/plugins bat ghi-chu\n/plugins\n/config', [
      ...DA_CAI,
      'openclaw channel add telegram',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('[bat] ghi-chu')
    expect(r.output).toContain('[tat] lich-hop')
    expect(r.output).toContain('kenh: telegram')
  })

  it('lệnh gạch chéo trước khi onboard → lỗi đòi onboard', () => {
    const r = chayLenhOpenclaw('/config')
    expect(r.error).toContain('chua cai dat/onboard')
  })

  it('/plugins bat tên lạ/thiếu → lỗi; bật trùng → lỗi', () => {
    expect(chayLenhOpenclaw('/plugins bat', DA_CAI).error).toContain('khong co plugin ""')
    expect(chayLenhOpenclaw('/plugins bat khong-co', DA_CAI).error).toContain(
      'khong co plugin "khong-co"',
    )
    expect(chayLenhOpenclaw('/plugins bat ghi-chu\n/plugins bat ghi-chu', DA_CAI).error).toContain(
      'da bat roi',
    )
  })

  it('lệnh gạch chéo lạ → lỗi kể /config /plugins', () => {
    expect(chayLenhOpenclaw('/banh', DA_CAI).error).toContain('/config /plugins')
  })
})

describe('openclawSim — nhiều agent (chương C4)', () => {
  it('agents add/bind/list — bind đòi kênh đã tồn tại', () => {
    const r = chayLenhOpenclaw(
      [
        'openclaw channel add telegram',
        'openclaw agents add thu-ky',
        'openclaw agents bind thu-ky telegram',
        'openclaw agents list',
      ].join('\n'),
      DA_CAI,
    )
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('thu-ky — kenh ghim: telegram')
    const rot = chayLenhOpenclaw('openclaw agents add a\nopenclaw agents bind a discord', DA_CAI)
    expect(rot.error).toContain('chua co kenh "discord"')
  })

  it('bind agent chưa tạo → gợi agents add; không xoá được agent mac-dinh', () => {
    expect(chayLenhOpenclaw('openclaw agents bind bong telegram', DA_CAI).error).toContain(
      'openclaw agents add',
    )
    expect(chayLenhOpenclaw('openclaw agents delete mac-dinh', DA_CAI).error).toContain(
      'khong xoa duoc agent mac-dinh',
    )
  })

  it('agents delete xoá agent thường ra khỏi danh sách', () => {
    const r = chayLenhOpenclaw('openclaw agents delete thu-ky\nopenclaw agents list', [
      ...DA_CAI,
      'openclaw agents add thu-ky',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da xoa agent "thu-ky"')
    expect(r.output).not.toContain('thu-ky —')
  })

  it('agents delete/bind/unbind agent không tồn tại → lỗi rõ', () => {
    expect(chayLenhOpenclaw('openclaw agents delete ma', DA_CAI).error).toContain(
      'khong co agent "ma"',
    )
    expect(chayLenhOpenclaw('openclaw agents unbind ma telegram', DA_CAI).error).toContain(
      'khong co agent "ma"',
    )
  })

  it('agents bind/unbind thiếu tên kênh → lỗi; unbind kênh chưa ghim → lỗi; unbind thành công', () => {
    const chuanBi = [...DA_CAI, 'openclaw channel add telegram', 'openclaw agents add thu-ky']
    expect(chayLenhOpenclaw('openclaw agents bind thu-ky', chuanBi).error).toContain(
      'thieu ten kenh',
    )
    expect(chayLenhOpenclaw('openclaw agents unbind thu-ky telegram', chuanBi).error).toContain(
      'khong ghim kenh telegram',
    )
    const r = chayLenhOpenclaw('openclaw agents unbind thu-ky telegram\nopenclaw agents list', [
      ...chuanBi,
      'openclaw agents bind thu-ky telegram',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da bo ghim kenh telegram khoi agent "thu-ky"')
    expect(r.output).toContain('thu-ky — kenh ghim: (khong)')
  })

  it('agents bind kênh đã ghim rồi → lỗi', () => {
    const chuanBi = [
      ...DA_CAI,
      'openclaw channel add telegram',
      'openclaw agents add thu-ky',
      'openclaw agents bind thu-ky telegram',
    ]
    expect(chayLenhOpenclaw('openclaw agents bind thu-ky telegram', chuanBi).error).toContain(
      'da ghim telegram roi',
    )
  })

  it('agents add thiếu tên / trùng tên → lỗi; hành động lạ → lỗi', () => {
    expect(chayLenhOpenclaw('openclaw agents add', DA_CAI).error).toContain('thieu ten agent')
    expect(
      chayLenhOpenclaw('openclaw agents add thu-ky\nopenclaw agents add thu-ky', DA_CAI).error,
    ).toContain('da ton tai')
    expect(chayLenhOpenclaw('openclaw agents banh', DA_CAI).error).toContain(
      'khong hieu "openclaw agents banh"',
    )
  })

  it('agents delete/bind/unbind không tên (khi danh sách agent còn agent mac-dinh) → lỗi thiếu tên', () => {
    expect(chayLenhOpenclaw('openclaw agents delete', DA_CAI).error).toContain('khong co agent ""')
    expect(chayLenhOpenclaw('openclaw agents bind', DA_CAI).error).toContain('khong co agent ""')
  })
})

describe('openclawSim — lenhChuanBi dựng bối cảnh', () => {
  it('lệnh chuẩn bị chạy ngầm không in ra, lỗi trong đó báo "Loi khi dung boi canh"', () => {
    const r = chayLenhOpenclaw('openclaw gateway status', DA_CHAY)
    expect(r.output).not.toContain('$ openclaw onboard')
    expect(r.output).toContain('gateway: dang-chay')
    const rot = chayLenhOpenclaw('openclaw doctor', ['openclaw bay'])
    expect(rot.error).toContain('Loi khi dung boi canh')
  })
})

// Đợt 2 coverage 2026-09-05: nhánh chưa phủ — mỗi nhánh dưới đây tương ứng một dòng cụ thể
// liệt kê trong uncovered-all.md (đường lỗi hiếm gặp, ca "unknown subcommand", ca thiếu tham
// số). Không sửa file nguồn — chỉ thêm test cho hành vi đã có.
describe('openclawSim — Đợt 2 coverage 2026-09-05: nhánh chưa phủ', () => {
  describe('nhóm lệnh "khong hieu ... " (nhánh else cuối mỗi bảng lệnh con)', () => {
    it.each([
      ['channel foobar', 'openclaw channel foobar', 'khong hieu "openclaw channel foobar"'],
      ['cron foobar', 'openclaw cron foobar', 'khong hieu "openclaw cron foobar"'],
      ['agents foobar', 'openclaw agents foobar', 'khong hieu "openclaw agents foobar"'],
      ['gateway foobar', 'openclaw gateway foobar', 'khong hieu "openclaw gateway foobar"'],
      ['models foobar', 'openclaw models foobar', 'khong hieu "openclaw models foobar"'],
      ['skills foobar', 'openclaw skills foobar', 'khong hieu "openclaw skills foobar"'],
      ['openclaw foobar (đã onboard)', 'openclaw foobar', 'khong hieu "openclaw foobar"'],
      ['/foobar (slash lạ)', '/foobar', 'mo phong khong lam lenh "/foobar"'],
    ])('%s', (_mota, script, chuoiLoi) => {
      const r = chayLenhOpenclaw(script, DA_CAI)
      expect(r.error).toContain(chuoiLoi)
    })
  })

  describe('thiếu tham số bắt buộc — cùng bối cảnh "đã onboard"', () => {
    it.each([
      ['channel reconnect thiếu tên kênh', 'openclaw channel reconnect', 'thieu ten kenh'],
      ['channel add thiếu tên kênh', 'openclaw channel add', 'kenh "" khong ho tro'],
      ['cron add thiếu lịch/tên', 'openclaw cron add "only-one"', 'thieu lich hoac ten viec'],
      ['cron enable thiếu id', 'openclaw cron enable', 'thieu id viec'],
      ['agents add thiếu tên', 'openclaw agents add', 'thieu ten agent'],
      ['agents add trùng tên mặc định', 'openclaw agents add mac-dinh', 'da ton tai'],
      [
        'agents delete agent không tồn tại',
        'openclaw agents delete ghost',
        'khong co agent "ghost"',
      ],
      [
        'agents unbind agent không tồn tại',
        'openclaw agents unbind ghost telegram',
        'khong co agent "ghost" — tao truoc',
      ],
      ['models use thiếu tên', 'openclaw models use', 'khong co model ""'],
      ['skills info thiếu tên', 'openclaw skills info', 'khong co ky nang ""'],
      ['gateway stop khi chưa start', 'openclaw gateway stop', 'gateway dang dung san roi'],
      ['/plugins bat thiếu tên', '/plugins bat', 'khong co plugin ""'],
      ['/plugins bat plugin lạ', '/plugins bat khong-co', 'khong co plugin "khong-co"'],
    ])('%s', (_mota, script, chuoiLoi) => {
      const r = chayLenhOpenclaw(script, DA_CAI)
      expect(r.error).toContain(chuoiLoi)
    })
  })

  describe('channel: các nhánh còn lại (status/allow/test/remove)', () => {
    it('status kênh chưa tồn tại → lỗi "chua co kenh"', () => {
      const r = chayLenhOpenclaw('openclaw channel status whatsapp', DA_CAI)
      expect(r.error).toContain('chua co kenh "whatsapp"')
    })

    it('kênh chưa tồn tại nhưng máy ĐÃ có kênh khác → lỗi liệt kê đúng tên kênh đang có', () => {
      const r = chayLenhOpenclaw('openclaw channel status whatsapp', [
        ...DA_CAI,
        'openclaw channel add telegram',
      ])
      expect(r.error).toContain('Da co: telegram.')
    })

    it('status kênh có tồn tại nhưng gateway chưa chạy → lỗi gateway', () => {
      const r = chayLenhOpenclaw('openclaw channel status telegram', [
        ...DA_CAI,
        'openclaw channel add telegram',
      ])
      expect(r.error).toContain('gateway chua chay — trang thai kenh do gateway giu')
    })

    it('reconnect kênh chưa tồn tại → lỗi "chua co kenh" (trước cả khi kiểm gateway)', () => {
      const r = chayLenhOpenclaw('openclaw channel reconnect discord', DA_CAI)
      expect(r.error).toContain('chua co kenh "discord"')
    })

    it('reconnect khi allowFrom đã có người → câu nhắc liệt kê đúng danh sách (không còn TRONG)', () => {
      const r = chayLenhOpenclaw('openclaw channel reconnect telegram', [
        ...DA_CHAY,
        'openclaw channel add telegram',
        'openclaw channel allow telegram boss',
      ])
      expect(r.error).toBeUndefined()
      expect(r.output).toContain('Kenh telegram da noi thanh cong. Nho: allowFrom dang boss.')
    })

    it('allow kênh chưa tồn tại → lỗi; thiếu tài khoản → lỗi; trùng tài khoản → lỗi', () => {
      expect(chayLenhOpenclaw('openclaw channel allow discord ai-do', DA_CAI).error).toContain(
        'chua co kenh "discord"',
      )
      const chuanBi = [...DA_CAI, 'openclaw channel add telegram']
      expect(chayLenhOpenclaw('openclaw channel allow telegram', chuanBi).error).toContain(
        'thieu nguoi can mo',
      )
      const trung = chayLenhOpenclaw(
        'openclaw channel allow telegram boss\nopenclaw channel allow telegram boss',
        chuanBi,
      )
      expect(trung.error).toContain('"boss" da nam trong allowFrom roi')
    })

    it('remove xoá đúng kênh — list sau đó rỗng trở lại', () => {
      const r = chayLenhOpenclaw('openclaw channel remove telegram\nopenclaw channel list', [
        ...DA_CAI,
        'openclaw channel add telegram',
      ])
      expect(r.error).toBeUndefined()
      expect(r.output).toContain('Da go kenh telegram.')
      expect(r.output).toContain('Chua co kenh nao')
    })

    it('remove kênh chưa tồn tại → lỗi "chua co kenh"', () => {
      const r = chayLenhOpenclaw('openclaw channel remove discord', DA_CAI)
      expect(r.error).toContain('chua co kenh "discord"')
    })

    it('test (mô phỏng tin đến) kênh chưa tồn tại / thiếu người gửi / kênh chưa nối', () => {
      expect(chayLenhOpenclaw('openclaw channel test discord ai-do', DA_CHAY).error).toContain(
        'chua co kenh "discord"',
      )
      const daThem = [...DA_CHAY, 'openclaw channel add telegram']
      expect(chayLenhOpenclaw('openclaw channel test telegram', daThem).error).toContain(
        'thieu nguoi gui',
      )
      const chuaNoi = chayLenhOpenclaw('openclaw channel test telegram ai-do', daThem)
      expect(chuaNoi.error).toContain('kenh telegram chua noi (dang cho-token)')
    })
  })

  describe('cron: các nhánh còn lại (list rỗng/tắt, id không tìm thấy)', () => {
    it('list rỗng khi chưa tạo việc nào', () => {
      const r = chayLenhOpenclaw('openclaw cron list', DA_CAI)
      expect(r.output).toContain('Chua co viec dinh ky nao')
    })

    it('list in đúng "[tat]" cho việc đã disable', () => {
      const r = chayLenhOpenclaw(
        'openclaw cron add "8h" "don dep"\nopenclaw cron disable c1\nopenclaw cron list',
        DA_CAI,
      )
      expect(r.output).toContain('c1 [tat] 8h — don dep')
    })

    it('run id lạ khi đã có việc khác → liệt kê đúng id đang có (không phải "trống")', () => {
      const r = chayLenhOpenclaw('openclaw cron run c9', [...DA_CAI, 'openclaw cron add "8h" "x"'])
      expect(r.error).toContain('khong co viec "c9" — dang co: c1.')
    })
  })

  describe('agents: bind/unbind & delete còn lại', () => {
    it('delete agent thường (không phải mac-dinh) → xoá thành công, biến mất khỏi list', () => {
      const r = chayLenhOpenclaw('openclaw agents delete phu\nopenclaw agents list', [
        ...DA_CAI,
        'openclaw agents add phu',
      ])
      expect(r.error).toBeUndefined()
      expect(r.output).toContain('Da xoa agent "phu".')
      expect(r.output).not.toContain('phu — kenh ghim')
    })

    it('bind thiếu tên kênh → lỗi rõ', () => {
      const r = chayLenhOpenclaw('openclaw agents bind a', [...DA_CAI, 'openclaw agents add a'])
      expect(r.error).toContain('thieu ten kenh — dung: openclaw agents bind <agent> <kenh>')
    })

    it('delete/bind không truyền tên agent nào cả → lỗi vẫn rõ (không in "undefined")', () => {
      expect(chayLenhOpenclaw('openclaw agents delete', DA_CAI).error).toContain(
        'khong co agent "" — xem: openclaw agents list.',
      )
      expect(chayLenhOpenclaw('openclaw agents bind', DA_CAI).error).toContain(
        'khong co agent "" — tao truoc: openclaw agents add <ten>.',
      )
    })

    it('bind trùng kênh đã ghim → lỗi "da ghim ... roi"', () => {
      const r = chayLenhOpenclaw('openclaw agents bind a telegram', [
        ...DA_CAI,
        'openclaw channel add telegram',
        'openclaw agents add a',
        'openclaw agents bind a telegram',
      ])
      expect(r.error).toContain('agent "a" da ghim telegram roi')
    })

    it('unbind kênh chưa từng ghim → lỗi; đã ghim thì unbind thành công', () => {
      const chuaGhim = chayLenhOpenclaw('openclaw agents unbind a telegram', [
        ...DA_CAI,
        'openclaw agents add a',
      ])
      expect(chuaGhim.error).toContain('agent "a" khong ghim kenh telegram')
      const daGhim = chayLenhOpenclaw('openclaw agents unbind a telegram', [
        ...DA_CAI,
        'openclaw channel add telegram',
        'openclaw agents add a',
        'openclaw agents bind a telegram',
      ])
      expect(daGhim.error).toBeUndefined()
      expect(daGhim.output).toContain('Da bo ghim kenh telegram khoi agent "a".')
    })
  })

  describe('gateway/chat/config: nhánh còn lại', () => {
    it('start gateway hai lần liên tiếp → lần hai báo "dang chay roi"', () => {
      const r = chayLenhOpenclaw('openclaw gateway start\nopenclaw gateway start', DA_CAI)
      expect(r.error).toContain('gateway dang chay roi')
    })

    it('chat không có nội dung (thiếu ngoặc kép hoặc ngoặc kép rỗng) → cùng một lỗi', () => {
      expect(chayLenhOpenclaw('openclaw chat', DA_CHAY).error).toContain('thieu noi dung')
      expect(chayLenhOpenclaw('openclaw chat ""', DA_CHAY).error).toContain('thieu noi dung')
    })

    it('/config liệt kê tên kênh khi máy đã có kênh (không còn "(chua co)")', () => {
      const r = chayLenhOpenclaw('/config', [...DA_CAI, 'openclaw channel add telegram'])
      expect(r.output).toContain('kenh: telegram')
    })

    it('/plugins bat plugin đã bật rồi → lỗi "da bat roi"', () => {
      const r = chayLenhOpenclaw('/plugins bat ghi-chu', [...DA_CAI, '/plugins bat ghi-chu'])
      expect(r.error).toContain('plugin "ghi-chu" da bat roi')
    })
  })

  describe('duyet/tuchoi: nhánh còn lại', () => {
    it('duyet thiếu id → lỗi rõ (không phải id sai, mà không truyền id nào)', () => {
      const r = chayLenhOpenclaw('duyet', DA_CAI)
      expect(r.error).toContain('thieu id — dung: duyet <id>')
    })

    it('duyet id sai khi ĐÃ có mục khác đang chờ → liệt kê đúng id đang chờ (không phải rỗng)', () => {
      const r = chayLenhOpenclaw('duyet d9', [...DA_CHAY, 'openclaw chat "xoa file cu"'])
      expect(r.error).toContain('khong co muc cho duyet "d9" — dang cho: d1.')
    })
  })
})
