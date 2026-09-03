// lessons/p6u14.ts — Bài học P6-U14: PARADIGM C — ĐỒNG THỜI & PHÂN TÁN (PR-M10).
//
// Trụ thứ hai trong ba trụ paradigm (hiến chương §5). Dạy: mô hình xen kẽ tất định · tranh chấp
// · khoá & deadlock · actor/thông điệp · IDEMPOTENCY · at-least-once vs exactly-once · retry +
// backoff + jitter. Dự án lồng trong bài (§7): dựng bộ mô phỏng lịch xen kẽ, tự tìm ra lỗi mất
// cập nhật, rồi tự sửa.
//
// KẾ THỪA, KHÔNG VIẾT LẠI (hiến chương §5): mô hình xen kẽ tất định đã dựng ở `p6-u2` (track Go,
// hàm `chay_xen_ke(lich)` — mỗi ký tự của `lich` là MỘT vi-bước của một luồng). Unit này dùng
// đúng mô hình đó rồi MỞ RỘNG sang khoá và idempotency, thay vì dựng mô hình mới.
//
// CẤM TUYỆT ĐỐI `threading`/`multiprocessing` (hiến chương P6 §4) — bài dạy CƠ CHẾ bằng mô hình
// tất định, còn cảm giác bất định thì lấy ở làn C trên máy thật.
//
// NGÔN NGỮ: Python — tầng 3 không thêm ngôn ngữ mới, nên bài đi qua `lessonsPython.test.ts`.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U14_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u14-l1',
    unitId: 'p6-u14',
    language: 'python',
    title: 'Tranh chấp và khoá — chỉ thẳng vào chỗ hỏng thay vì chờ nó xuất hiện',
    hook: 'Loại lỗi này không tái lập được: chạy nghìn lần đúng cả nghìn, lên máy chủ thật thì sai một lần trong mười nghìn, không traceback, không dòng nào để nhìn. Cách duy nhất học được nó là TỰ VIẾT RA lịch xen kẽ làm nó hỏng.',
    theory:
      'Bài này mở rộng mô hình bạn đã gặp ở `p6-u2`: **lịch xen kẽ tất định**. Mỗi luồng làm việc theo từng vi-bước, và bạn tự gõ ra thứ tự các vi-bước — nên chỗ hỏng chỉ thẳng được, không phải chờ may rủi.\n\nNHẮC LẠI GỐC RỄ. Câu `chung += 1` là BA vi-bước: ① ĐỌC `chung` vào bản sao · ② CỘNG 1 vào bản sao · ③ GHI bản sao trở lại `chung`. Hai luồng cùng chạy, nếu cả hai ĐỌC trước khi ai kịp GHI thì cả hai ghi cùng một số — một lần tăng biến mất. Đó là **mất cập nhật** (lost update).\n\nSo hai lịch, cùng 6 vi-bước, khác nhau ở kết quả:\n    "AAABBB" → A làm trọn ba bước rồi B mới bắt đầu → chung = 2  ✅\n    "ABABAB" → hai luồng đan xen, cùng đọc số 0     → chung = 1  ❌\nLịch thứ hai không hiếm — nó chỉ cần hệ điều hành cắt ngang đúng chỗ.\n\nKHOÁ (mutex) — cách chữa thứ nhất. Trước khi vào ba vi-bước thì GIÀNH khoá, xong thì TRẢ. Ai chưa có khoá thì phải đợi, nên ba bước của một luồng không bị ai chen vào giữa. Đoạn code nằm trong khoá gọi là **miền găng** (critical section).\n\nKhoá đúng, nhưng có ba cái giá phải biết:\n\n1. **Phải nhớ ở MỌI chỗ.** Quên khoá ở một chỗ đụng vào biến đó là hỏng, mà không công cụ nào nhắc bạn.\n2. **Chậm lại.** Luồng đang đợi thì không làm gì cả; khoá càng to, càng nhiều người xếp hàng.\n3. **DEADLOCK.** Hai luồng, hai khoá, mỗi bên giữ một cái và đợi cái kia — cả hai đứng im vĩnh viễn:\n        Luồng A: giành khoá 1 → chờ khoá 2\n        Luồng B: giành khoá 2 → chờ khoá 1\n   Cách phòng đơn giản và hiệu quả nhất: **luôn giành khoá theo cùng một THỨ TỰ** ở mọi nơi (ví dụ luôn khoá 1 trước khoá 2). Bốn điều kiện của deadlock thì phá vỡ điều kiện "chờ vòng tròn" là rẻ nhất.\n\nCÁCH CHỮA THỨ HAI — ĐỪNG CHIA SẺ. Không ai được chạm vào biến chung; mọi luồng chỉ GỬI thông điệp vào một hàng đợi, và MỘT chủ sở hữu duy nhất xử lý tuần tự. Không có hai người cùng chạm thì không có cuộc đua nào để mà chữa. Đây là mô hình **actor**, và là thứ Go/Erlang/Elixir xây cả ngôn ngữ quanh nó.\n\nCÁCH THỨ BA, thường bị quên: **đừng có trạng thái chung**. Rất nhiều bài toán chỉ cần mỗi luồng tự cộng phần của mình rồi cộng gộp ở cuối (đúng kiểu `reduce` ở unit trước). Không trạng thái chung thì không có tranh chấp — và đây là chỗ trụ F gặp trụ C.\n\n⚠️ MÔ HÌNH KHÁC THẬT chỗ nào, phải biết: máy thật xen kẽ theo lịch của hệ điều hành chứ không theo chuỗi bạn gõ, và còn có chuyện bộ nhớ đệm của từng nhân CPU chưa kịp đồng bộ. Mô hình cho bạn CƠ CHẾ, không cho bạn cảm giác bất định — cảm giác đó lấy ở làn C. Bài này cũng **không dùng threading/multiprocessing**: luồng thật trong sandbox chỉ cho bạn một kết quả may rủi, không dạy được gì.',
    workedExample: {
      code: `# MÔ HÌNH xen kẽ tất định (kế thừa p6-u2) — KHÔNG phải luồng thật.
# Mỗi ký tự trong "lich" là MỘT vi-bước của luồng đó.
VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    chung = 0
    cuc_bo = {"A": 0, "B": 0}
    buoc = {"A": 0, "B": 0}
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung        # ① chụp giá trị hiện tại
        elif viec == "cong":
            cuc_bo[ai] += 1           # ② cộng trên BẢN SAO
        else:
            chung = cuc_bo[ai]        # ③ ghi đè -> chỗ mất cập nhật
        buoc[ai] = i + 1
    return chung


def chay_co_khoa(lich):
    """Có khoá: luồng nào đang trong miền găng thì luồng kia phải đợi."""
    chung = 0
    cuc_bo = {"A": 0, "B": 0}
    buoc = {"A": 0, "B": 0}
    chu_khoa = None                   # ai đang giữ khoá
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue
        if chu_khoa is None:
            chu_khoa = ai             # chưa ai giữ -> giành lấy
        if chu_khoa != ai:
            continue                  # người khác đang giữ -> ĐỢI, bỏ lượt
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung
        elif viec == "cong":
            cuc_bo[ai] += 1
        else:
            chung = cuc_bo[ai]
        buoc[ai] = i + 1
        if buoc[ai] >= len(VI_BUOC):
            chu_khoa = None           # xong ba bước -> TRẢ khoá
    return chung


print("khong khoa, AAABBB:", chay_xen_ke("AAABBB"))
print("khong khoa, ABABAB:", chay_xen_ke("ABABAB"))
# Có khoá: lịch xấu cỡ nào cũng ra 2, nhưng phải cấp thêm lượt cho luồng bị đợi
print("co khoa,   ABABAB:", chay_co_khoa("ABABABABABAB"))`,
      stdinLines: [],
    },
    predict: {
      code: `VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    chung = 0
    cuc_bo = {"A": 0, "B": 0}
    buoc = {"A": 0, "B": 0}
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung
        elif viec == "cong":
            cuc_bo[ai] += 1
        else:
            chung = cuc_bo[ai]
        buoc[ai] = i + 1
    return chung


print(chay_xen_ke("AABBBA"))`,
      question: 'Lịch "AABBBA" cho kết quả bằng bao nhiêu?',
      choices: ['1', '2', '0', '3'],
      answerIndex: 0,
      explain:
        'Theo dõi từng bước: A đọc (thấy 0), A cộng (bản sao A = 1). Rồi B đọc (vẫn thấy 0, vì A CHƯA ghi), B cộng (bản sao B = 1), B ghi (chung = 1). Cuối cùng A ghi (chung = 1) — A ghi đè lên đúng giá trị mà B vừa đặt. Hai lần tăng, kết quả 1: một lần đã bốc hơi. Điểm mấu chốt là B đọc trước khi A kịp ghi.',
    },
    parsons: {
      prompt: 'Xếp các dòng: ba vi-bước của một phép tăng, theo đúng thứ tự máy thực hiện.',
      lines: [
        'chung = 0',
        'ban_sao = chung',
        'ban_sao = ban_sao + 1',
        'chung = ban_sao',
        'print(chung)',
      ],
    },
    make: {
      prompt:
        'Dựng bộ mô phỏng và TỰ TÌM ra lịch làm hỏng.\n\nCho hai luồng A và B, mỗi luồng làm một phép tăng gồm ba vi-bước theo thứ tự `doc` → `cong` → `ghi`.\n\n1. Viết `chay_xen_ke(lich)` như mô hình trong bài: mỗi ký tự của `lich` là một vi-bước của luồng đó; ký tự thừa (luồng đã xong) thì bỏ qua.\n\n2. Viết `tim_lich_hong(cac_lich)` nhận danh sách các chuỗi lịch, trả về danh sách những lịch cho kết quả KHÁC 2 (tức là bị mất cập nhật).\n\n3. In đúng ba dòng, với `cac_lich = ["AAABBB", "ABABAB", "BBBAAA"]`:\nAAABBB -> 2\nABABAB -> 1\nBBBAAA -> 2\nLich hong: [\'ABABAB\']',
      starterCode: `VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    ...


def tim_lich_hong(cac_lich):
    ...


cac_lich = ["AAABBB", "ABABAB", "BBBAAA"]
# in ket qua tung lich, roi in danh sach lich hong
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'AAABBB -> 2',
          match: 'contains',
          hidden: false,
          label: 'lịch tuần tự — không mất cập nhật',
        },
        {
          stdinLines: [],
          expected: 'ABABAB -> 1',
          match: 'contains',
          hidden: false,
          label: 'lịch đan xen — mất một lần tăng',
        },
        {
          stdinLines: [],
          expected: 'BBBAAA -> 2',
          match: 'contains',
          hidden: false,
          label: 'B trước A, vẫn tuần tự',
        },
        {
          stdinLines: [],
          expected: "Lich hong: ['ABABAB']",
          match: 'contains',
          hidden: false,
          label: 'lọc ra đúng lịch hỏng',
        },
      ],
      hints: [
        'Chép nguyên mô hình trong phần ví dụ mẫu: ba từ điển `cuc_bo`, `buoc`, và biến `chung`.',
        'Ký tự thừa: nếu `buoc[ai]` đã bằng 3 thì luồng đó xong rồi, dùng `continue` bỏ qua.',
        '`tim_lich_hong` chính là một phép lọc — đúng kiểu unit trước: `[l for l in cac_lich if chay_xen_ke(l) != 2]`.',
        'In danh sách bằng `print("Lich hong:", tim_lich_hong(cac_lich))` — Python tự in dấu nháy đơn quanh chuỗi.',
      ],
      sampleSolution: `VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    chung = 0
    cuc_bo = {"A": 0, "B": 0}
    buoc = {"A": 0, "B": 0}
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung
        elif viec == "cong":
            cuc_bo[ai] += 1
        else:
            chung = cuc_bo[ai]
        buoc[ai] = i + 1
    return chung


def tim_lich_hong(cac_lich):
    return [l for l in cac_lich if chay_xen_ke(l) != 2]


cac_lich = ["AAABBB", "ABABAB", "BBBAAA"]
for l in cac_lich:
    print(l, "->", chay_xen_ke(l))
print("Lich hong:", tim_lich_hong(cac_lich))`,
    },
    homework:
      'LÀN C — cảm giác bất định thì chỉ máy thật cho được. Trên máy bạn, viết một chương trình nhỏ dùng `threading` (hoặc Go với `go run -race` nếu bạn theo track đó): hai luồng cùng tăng một biến 100.000 lần, rồi in kết quả. Chạy 10 lần và ghi lại 10 con số. Bạn sẽ thấy chúng KHÁC NHAU và gần như không bao giờ đúng 200.000 — đó chính là lịch xen kẽ mà bài này bắt bạn gõ tay, nhưng lần này do hệ điều hành chọn. Sau đó thêm khoá vào và chạy lại 10 lần: luôn đúng 200.000, nhưng chậm hơn hẳn. Ghi lại cả hai con số, vì đánh đổi đó là thứ bạn sẽ phải cân nhắc suốt sự nghiệp.',
    srsCards: [
      {
        hoi: 'Vì sao `chung += 1` có thể làm mất một lần tăng?',
        dap: 'Vì nó là BA vi-bước: đọc vào bản sao, cộng bản sao, ghi bản sao trở lại. Hai luồng cùng đọc trước khi ai kịp ghi thì cả hai ghi cùng một số — một lần tăng biến mất.',
      },
      {
        hoi: 'Ba cái giá phải trả khi dùng khoá là gì?',
        dap: 'Phải nhớ khoá ở MỌI chỗ đụng biến đó (quên một chỗ là hỏng, không ai nhắc); chậm lại vì luồng đợi không làm gì; và nguy cơ deadlock.',
      },
      {
        hoi: 'Cách phòng deadlock rẻ nhất trong thực hành?',
        dap: 'Luôn giành khoá theo cùng một THỨ TỰ ở mọi nơi. Đó là phá vỡ điều kiện "chờ vòng tròn" — rẻ nhất trong bốn điều kiện của deadlock.',
      },
      {
        hoi: 'Ba cách xử lý tranh chấp, xếp theo thứ tự nên ưu tiên?',
        dap: 'Tốt nhất: không có trạng thái chung (mỗi luồng tự tính rồi gộp cuối). Rồi: không chia sẻ mà gửi thông điệp cho một chủ sở hữu duy nhất (actor). Cuối: dùng khoá.',
      },
    ],
  },
  {
    id: 'p6-u14-l2',
    unitId: 'p6-u14',
    language: 'python',
    title: 'Idempotency và retry — khi mạng hứa "ít nhất một lần"',
    hook: 'Ngân hàng gọi webhook báo khách đã chuyển tiền. Mạng chập, họ không nhận được phản hồi nên gọi lại. Máy chủ của bạn vừa cộng tiền hai lần. Không dòng code nào sai — sai ở chỗ bạn tin rằng mỗi thông điệp chỉ tới đúng một lần.',
    theory:
      'BA MỨC BẢO ĐẢM GIAO THÔNG ĐIỆP, và chỉ hai mức đầu là có thật:\n\n- **at-most-once** (nhiều nhất một lần) — gửi rồi thôi, mất thì mất. Đơn giản, hợp cho dữ liệu không quan trọng.\n- **at-least-once** (ít nhất một lần) — gửi cho tới khi nhận được xác nhận. **Không mất, nhưng CÓ THỂ TRÙNG.** Đây là thứ gần như mọi hệ thống thật dùng.\n- **exactly-once** (đúng một lần) — nghe hay nhất, và trên một mạng có thể mất gói thì **không tồn tại** ở tầng giao vận. Lý do gọn: bên gửi không bao giờ phân biệt được "bên nhận chưa nhận" với "bên nhận đã nhận nhưng phản hồi bị mất". Không phân biệt được thì chỉ có hai lựa chọn: gửi lại (có thể trùng) hoặc không gửi lại (có thể mất).\n\nNên câu hỏi đúng không phải "làm sao để đúng một lần", mà là: **làm sao để xử lý trùng cũng không sao.**\n\nIDEMPOTENCY — làm nhiều lần cho kết quả y như làm một lần. Đây là khái niệm quan trọng nhất của bài, và nó biến "exactly-once" từ một lời hứa bất khả thi thành một tính chất bạn tự cài được:\n\n    ❌ KHÔNG idempotent:  so_du = so_du + tien        # gọi 2 lần -> cộng 2 lần\n    ✅ Idempotent:        so_du = tong_cac_giao_dich_da_ghi_nhan()\n\nCÁCH LÀM PHỔ BIẾN NHẤT — **khoá idempotency**. Mỗi yêu cầu mang một mã DUY NHẤT do bên gửi đặt; bên nhận ghi nhớ các mã đã xử lý:\n\n    da_xu_ly = set()\n\n    def nhan(ma, tien, so_du):\n        if ma in da_xu_ly:\n            return so_du            # đã làm rồi -> BỎ QUA, không phải lỗi\n        da_xu_ly.add(ma)\n        return so_du + tien\n\nBa điều cần nhớ về khoá này: mã phải do **bên gửi** đặt (bên nhận tự sinh thì lần gọi lại sẽ ra mã khác, vô nghĩa) · phải lưu **bền** (trong cơ sở dữ liệu, không phải bộ nhớ — máy chủ khởi động lại là quên sạch) · và gặp mã trùng thì **trả về thành công**, đừng báo lỗi, vì bên gửi đang làm đúng giao thức.\n\nRETRY, BACKOFF, JITTER — bộ ba đi cùng nhau:\n\n- **Retry**: thất bại thì thử lại. Nhưng chỉ với lỗi TẠM THỜI (mất mạng, quá tải, 503). Lỗi vĩnh viễn (sai mật khẩu, dữ liệu không hợp lệ) thì thử lại nghìn lần vẫn hỏng, chỉ tốn công.\n- **Backoff**: mỗi lần chờ lâu hơn — 1s, 2s, 4s, 8s (nhân đôi). Thử lại dồn dập vào một dịch vụ đang quá tải chính là đạp cho nó chết hẳn.\n- **Jitter**: cộng thêm một lượng NGẪU NHIÊN nhỏ vào thời gian chờ. Vì sao cần: nếu 10.000 máy khách cùng mất kết nối rồi cùng chờ đúng 1s, chúng sẽ quay lại **cùng một khoảnh khắc** và lại đánh sập dịch vụ lần nữa. Hiện tượng đó gọi là **thundering herd**, và jitter là cách rẻ nhất để phá nó.\n\nGhép lại thành một câu đáng nhớ: **retry an toàn chỉ khi việc bạn thử lại là idempotent.** Thiếu vế sau, retry biến một sự cố mạng thành một sự cố tiền bạc.\n\nĐỒNG HỒ LOGIC — một dòng để biết đường mà tra cứu sau. Trong hệ phân tán, đồng hồ của hai máy không bao giờ khớp tuyệt đối, nên không dùng thời gian thật để xác định "việc nào xảy ra trước". Thay vào đó người ta dùng bộ đếm tăng dần (đồng hồ Lamport) — bạn sẽ gặp lại khi học sâu về hệ phân tán.',
    workedExample: {
      code: `# Mô phỏng webhook được giao "ít nhất một lần": bản tin CÓ THỂ tới trùng.
lan_giao = [
    ("gd-001", 50000),
    ("gd-002", 30000),
    ("gd-001", 50000),   # mạng chập -> ngân hàng gửi lại đúng bản tin này
]


# ❌ Bản NGÂY THƠ: cộng thẳng, trùng là cộng hai lần
def xu_ly_ngay_tho(cac_lan):
    so_du = 0
    for _ma, tien in cac_lan:
        so_du += tien
    return so_du


# ✅ Bản IDEMPOTENT: nhớ mã đã xử lý, gặp lại thì bỏ qua
def xu_ly_idempotent(cac_lan):
    so_du = 0
    da_xu_ly = set()
    for ma, tien in cac_lan:
        if ma in da_xu_ly:
            continue          # đã làm rồi -> bỏ qua, KHÔNG phải lỗi
        da_xu_ly.add(ma)
        so_du += tien
    return so_du


print("ngay tho:  ", xu_ly_ngay_tho(lan_giao))
print("idempotent:", xu_ly_idempotent(lan_giao))

# Phép thử của tính idempotent: chạy lại nhiều lần vẫn ra một kết quả
print("chay lai:  ", xu_ly_idempotent(lan_giao + lan_giao))


# Backoff nhân đôi — tất định, tính được, không cần đồng hồ thật
def cac_moc_cho(so_lan, dau=1):
    return [dau * (2 ** i) for i in range(so_lan)]


print("backoff:", cac_moc_cho(5))`,
      stdinLines: [],
    },
    predict: {
      code: `lan_giao = [("a", 10), ("b", 20), ("a", 10), ("a", 10)]

so_du = 0
da_xu_ly = set()
for ma, tien in lan_giao:
    if ma in da_xu_ly:
        continue
    da_xu_ly.add(ma)
    so_du += tien

print(so_du)`,
      question: 'Đoạn này in ra gì?',
      choices: ['30', '50', '40', '20'],
      answerIndex: 0,
      explain:
        'Mã "a" chỉ được cộng ở lần gặp ĐẦU TIÊN (10), hai lần sau bị bỏ qua vì đã nằm trong `da_xu_ly`. Mã "b" cộng 20. Tổng 30 — đúng bằng kết quả nếu mỗi bản tin chỉ tới một lần. Đó chính là định nghĩa của idempotent: làm nhiều lần cho kết quả y như làm một lần.',
    },
    parsons: {
      prompt: 'Xếp các dòng: xử lý một bản tin theo kiểu idempotent, bỏ qua mã đã gặp.',
      lines: [
        'da_xu_ly = set()',
        'so_du = 0',
        'for ma, tien in [("a", 10), ("a", 10)]:',
        '    if ma in da_xu_ly:',
        '        continue',
        '    da_xu_ly.add(ma)',
        '    so_du += tien',
        'print(so_du)',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN CỦA UNIT — làm cho bộ xử lý webhook chịu được bản tin trùng.\n\nCho danh sách lần giao (mã giao dịch, số tiền), trong đó có bản tin bị gửi lại:\n    [("gd-1", 50000), ("gd-2", 30000), ("gd-1", 50000), ("gd-3", 20000), ("gd-2", 30000)]\n\n1. `xu_ly_ngay_tho(cac_lan)` → cộng thẳng mọi lần giao, trả về tổng.\n2. `xu_ly_idempotent(cac_lan)` → dùng khoá idempotency, mỗi mã chỉ tính MỘT lần.\n3. `cac_moc_cho(so_lan, dau=1)` → trả về danh sách mốc chờ backoff nhân đôi: `[1, 2, 4, ...]`, đúng `so_lan` phần tử.\n\nIn đúng bốn dòng:\nNgay tho: 180000\nIdempotent: 100000\nChay lai van the: 100000\nBackoff: [1, 2, 4, 8]\n\n(Dòng 3 gọi `xu_ly_idempotent` với danh sách NỐI ĐÔI chính nó — kết quả phải không đổi, đó là phép thử của tính idempotent. Dòng 4 gọi `cac_moc_cho(4)`.)',
      starterCode: `lan_giao = [
    ("gd-1", 50000),
    ("gd-2", 30000),
    ("gd-1", 50000),
    ("gd-3", 20000),
    ("gd-2", 30000),
]


def xu_ly_ngay_tho(cac_lan):
    ...


def xu_ly_idempotent(cac_lan):
    ...


def cac_moc_cho(so_lan, dau=1):
    ...


# in 4 dong theo de
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ngay tho: 180000',
          match: 'contains',
          hidden: false,
          label: 'cộng thẳng — trùng bị tính hai lần',
        },
        {
          stdinLines: [],
          expected: 'Idempotent: 100000',
          match: 'contains',
          hidden: false,
          label: 'mỗi mã chỉ tính một lần',
        },
        {
          stdinLines: [],
          expected: 'Chay lai van the: 100000',
          match: 'contains',
          hidden: false,
          label: 'chạy trên danh sách nối đôi — kết quả không đổi',
        },
        {
          stdinLines: [],
          expected: 'Backoff: [1, 2, 4, 8]',
          match: 'contains',
          hidden: false,
          label: 'mốc chờ nhân đôi',
        },
      ],
      hints: [
        'Bản ngây thơ chỉ là `sum(tien for _ma, tien in cac_lan)`.',
        'Khoá idempotency dùng `set()` để nhớ mã đã gặp; gặp lại thì `continue`, KHÔNG báo lỗi.',
        'Nối đôi danh sách bằng `lan_giao + lan_giao` — nếu hàm đúng idempotent thì kết quả giữ nguyên 100000.',
        'Backoff nhân đôi: `[dau * (2 ** i) for i in range(so_lan)]`. Chú ý `2 ** i` là luỹ thừa, không phải `2 * i`.',
      ],
      sampleSolution: `lan_giao = [
    ("gd-1", 50000),
    ("gd-2", 30000),
    ("gd-1", 50000),
    ("gd-3", 20000),
    ("gd-2", 30000),
]


def xu_ly_ngay_tho(cac_lan):
    return sum(tien for _ma, tien in cac_lan)


def xu_ly_idempotent(cac_lan):
    so_du = 0
    da_xu_ly = set()
    for ma, tien in cac_lan:
        if ma in da_xu_ly:
            continue
        da_xu_ly.add(ma)
        so_du += tien
    return so_du


def cac_moc_cho(so_lan, dau=1):
    return [dau * (2 ** i) for i in range(so_lan)]


print("Ngay tho:", xu_ly_ngay_tho(lan_giao))
print("Idempotent:", xu_ly_idempotent(lan_giao))
print("Chay lai van the:", xu_ly_idempotent(lan_giao + lan_giao))
print("Backoff:", cac_moc_cho(4))`,
    },
    homework:
      'Nhìn vào một hệ thống thật bạn biết — có thể là chính dự án này. Webhook thanh toán của DHCB (`/api/payment-webhook`, ngân hàng gọi vào khi khách chuyển khoản) là ví dụ sống của bài học: ngân hàng giao theo kiểu at-least-once, nên nếu handler không idempotent thì một lần mạng chập là khách được cộng gói hai lần. Hãy trả lời ba câu cho bất kỳ điểm nhận thông điệp nào bạn gặp: (1) Mã idempotency là gì, và do BÊN GỬI đặt hay bên nhận tự sinh? (2) Mã đó lưu ở đâu — bộ nhớ hay cơ sở dữ liệu? Nếu ở bộ nhớ, máy chủ khởi động lại là mất. (3) Gặp mã trùng thì trả về thành công hay báo lỗi? Ba câu này đủ để phát hiện phần lớn lỗi cộng tiền hai lần.',
    srsCards: [
      {
        hoi: 'Vì sao "exactly-once" không tồn tại ở tầng giao vận?',
        dap: 'Vì bên gửi không phân biệt được "bên nhận chưa nhận" với "đã nhận nhưng phản hồi bị mất". Không phân biệt được thì chỉ còn hai lựa chọn: gửi lại (có thể trùng) hoặc không (có thể mất).',
      },
      {
        hoi: 'Idempotent nghĩa là gì?',
        dap: 'Làm nhiều lần cho kết quả y như làm một lần. Nó biến "exactly-once" từ lời hứa bất khả thi thành tính chất tự cài được ở phía nhận.',
      },
      {
        hoi: 'Ba điều cần nhớ về khoá idempotency?',
        dap: 'Mã do BÊN GỬI đặt (bên nhận tự sinh thì lần gọi lại ra mã khác, vô nghĩa); lưu BỀN trong CSDL chứ không phải bộ nhớ; gặp mã trùng thì trả về THÀNH CÔNG, đừng báo lỗi.',
      },
      {
        hoi: 'Jitter trong retry dùng để làm gì?',
        dap: 'Phá thundering herd: nếu hàng nghìn máy khách cùng mất kết nối rồi cùng chờ đúng 1s, chúng quay lại cùng một khoảnh khắc và lại đánh sập dịch vụ. Cộng lượng ngẫu nhiên nhỏ vào thời gian chờ để tản chúng ra.',
      },
    ],
  },
]
