// lessons/p6u2.ts — P6-U2: Track backend cloud / Go (làn A, `python`).
//
// Hiến chương P6 §3: bài KHÔNG chạy Go — không engine nào của môn chạy được — nên nó dạy CƠ
// CHẾ bằng một mô hình chạy được, và nói thẳng đó là mô hình. Cú pháp Go thật + `go run -race`
// nằm ở bước ⑦ (làn C).
//
// §4 (đã KIỂM CHỨNG khi soạn): KHÔNG được dùng `threading`. Trên Pyodide 314.0.5 của repo,
// `import threading` thành công nhưng `Thread.start()` ném RuntimeError: can't start new
// thread — tức bài dùng thread sẽ XANH ở cổng CI (python3 trên runner có thread thật) và RỚT
// trên máy học viên. Mô hình xen kẽ TẤT ĐỊNH tránh hẳn khe hở đó, và còn hơn chạy thật ở một
// điểm: cuộc đua trở nên TÁI LẬP ĐƯỢC, chỉ được vào đúng một lịch xen kẽ cụ thể.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u2-l1',
    unitId: 'p6-u2',
    language: 'python',
    title: 'Đồng thời: vì sao "chung += 1" là ba việc, và vì sao Go bảo đừng chia sẻ bộ nhớ',
    hook: 'Máy chủ của bạn nhận hai đơn cùng lúc, cả hai cùng tăng biến đếm doanh thu. Cuối ngày sổ báo 1 đơn thay vì 2. Code không sai dòng nào, test cũng xanh — chỉ là bạn đã tin rằng "chung += 1" là một việc.',
    theory:
      'Track này về Go, và điều đầu tiên phải nói thẳng: **bài này không chạy Go.** Sandbox của môn chạy Python, JavaScript và SQLite, hết. Nên ở đây bạn sẽ tự xây một MÔ HÌNH của cơ chế mà Go giải quyết — rồi cài Go thật ở phần về nhà và đối chiếu. Không giả vờ, và cũng không mất gì: cái khó của lập trình đồng thời chưa bao giờ là cú pháp.\n\nMỘT DÒNG, BA VIỆC. Câu lệnh chung += 1 nhìn thì liền mạch, nhưng máy làm ba bước riêng:\n  ① ĐỌC giá trị chung vào một bản sao cục bộ · ② CỘNG 1 vào bản sao · ③ GHI bản sao trở lại chung.\nKhi hai luồng chạy song song, hệ điều hành có quyền cắt ngang giữa bất kỳ hai bước nào. Nếu cả hai cùng ĐỌC được số 0 trước khi ai kịp GHI, cả hai sẽ ghi số 1 — và một lần tăng biến mất. Đó gọi là MẤT CẬP NHẬT (lost update), trường hợp phổ biến nhất của CUỘC ĐUA DỮ LIỆU (data race).\n\nVÌ SAO NÓ ĐÁNG SỢ HƠN MỌI LỖI BẠN TỪNG GẶP: nó không tái lập được. Chạy 1.000 lần đúng cả 1.000; lên máy chủ thật, đông người dùng, nó sai một lần trong mười nghìn. Không có traceback, không có dòng nào để nhìn. Đây là lý do bài này dựng mô hình XEN KẼ TẤT ĐỊNH: bạn tự viết ra lịch xen kẽ, nên bạn chỉ thẳng được vào đúng chỗ hỏng thay vì chờ nó tự xuất hiện.\n\nHAI CÁCH CHỮA, và Go chọn cách thứ hai:\n\n① KHOÁ (mutex): trước khi vào ba bước thì giành khoá, xong thì trả. Ai chưa có khoá thì đợi. Đúng, nhưng phải nhớ khoá ở MỌI chỗ đụng vào biến đó — quên một chỗ là hỏng, mà trình biên dịch không nhắc.\n\n② KÊNH (channel): không ai được chạm vào biến chung cả. Mọi luồng chỉ GỬI yêu cầu vào một hàng đợi, và một luồng DUY NHẤT sở hữu biến đó xử lý tuần tự từng yêu cầu. Không có hai người cùng chạm thì không có cuộc đua nào để mà chữa.\n\nCâu châm ngôn của Go nói đúng ý đó: *"Đừng giao tiếp bằng cách chia sẻ bộ nhớ; hãy chia sẻ bộ nhớ bằng cách giao tiếp."* Trong Go, luồng nhẹ gọi là **goroutine** (bật bằng từ khoá go, rẻ tới mức chạy hàng chục nghìn cái là bình thường), và hàng đợi có kiểu gọi là **channel**. Mô hình bạn sắp viết chính là hình dạng của cơ chế đó.\n\nĐiểm mô hình KHÁC thật, phải biết: máy thật xen kẽ theo lịch của hệ điều hành, không theo chuỗi bạn gõ; và ở máy thật còn có chuyện bộ nhớ đệm của từng nhân CPU chưa kịp đồng bộ. Mô hình cho bạn cơ chế, không cho bạn cảm giác bất định — cảm giác đó lấy ở phần về nhà, bằng `go run -race`.',
    workedExample: {
      code: `# MÔ HÌNH xen kẽ tất định — KHÔNG phải luồng thật, và cũng không phải Go.
# Mỗi "luồng" A và B làm một phép tăng, gồm đúng ba vi-bước theo thứ tự:
VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    """lich là chuỗi các chữ A/B — mỗi ký tự là MỘT vi-bước của luồng đó."""
    chung = 0                       # biến dùng chung
    cuc_bo = {"A": 0, "B": 0}       # bản sao riêng của mỗi luồng (thanh ghi)
    buoc = {"A": 0, "B": 0}         # luồng này đã đi tới vi-bước thứ mấy
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue                # luồng đã xong -> ký tự thừa bị bỏ qua
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung      # ① chụp lại giá trị hiện tại
        elif viec == "cong":
            cuc_bo[ai] += 1         # ② cộng trên BẢN SAO, chung chưa đổi
        else:
            chung = cuc_bo[ai]      # ③ ghi đè -> chỗ mất cập nhật xảy ra
        buoc[ai] = i + 1
    return chung


def chay_qua_kenh(so_viec):
    """Không ai chạm vào biến chung. Mọi luồng chỉ GỬI yêu cầu vào kênh."""
    kenh = ["tang"] * so_viec       # hàng đợi yêu cầu
    chung = 0                       # chỉ MỘT chủ sở hữu duy nhất đụng vào
    for _yeu_cau in kenh:
        chung += 1                  # xử lý tuần tự -> không có gì để đua
    return chung


for lich in ["AAABBB", "ABABAB", "AABABB"]:
    print(f"Xen ke {lich}: chung = {chay_xen_ke(lich)}")
print("Qua kenh:", chay_qua_kenh(2))

# Dòng đầu ra 2 (A xong hẳn rồi B mới bắt đầu). Hai dòng sau ra 1 — một lần tăng
# đã biến mất. Cùng một code, chỉ khác THỜI ĐIỂM bị cắt ngang.`,
      stdinLines: [],
    },
    predict: {
      code: `VI_BUOC = ["doc", "cong", "ghi"]

def chay_xen_ke(lich):
    chung = 0
    cuc_bo = {"A": 0, "B": 0}
    buoc = {"A": 0, "B": 0}
    for ai in lich:
        i = buoc[ai]
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

# A da di duoc 2 trong 3 vi buoc TRUOC KHI B bat dau
print(chay_xen_ke("AABABB"))`,
      question: 'Hai luồng, mỗi luồng tăng 1. Lịch "AABABB" cho kết quả cuối là bao nhiêu?',
      choices: ['1', '2', '3', '0'],
      answerIndex: 0,
      explain:
        'Ra 1 — mất một lần tăng, dù A đã đi được hai phần ba công việc trước khi B chen vào. Diễn biến: A đọc 0 · A cộng thành 1 (trên bản sao, chung VẪN là 0) · B đọc 0 · A ghi 1 · B cộng thành 1 · B ghi 1. Cái bẫy nằm ở chỗ trực giác "A gần xong rồi thì chắc không sao": vi-bước duy nhất thật sự quan trọng là ĐỌC, và B đọc trước khi A kịp GHI. Chỉ cần một khe hở giữa đọc và ghi là đủ, dù nó hẹp tới đâu — và trên máy chủ thật, khe hở đó mở ra vài triệu lần mỗi ngày.',
    },
    parsons: {
      prompt:
        'Xếp lại thân vòng lặp của mô hình xen kẽ — ba vi-bước, và chỉ "ghi" mới đụng vào biến chung.',
      lines: [
        'for ai in lich:',
        '    i = buoc[ai]',
        '    if i >= len(VI_BUOC):',
        '        continue',
        '    viec = VI_BUOC[i]',
        '    if viec == "doc":',
        '        cuc_bo[ai] = chung',
        '    elif viec == "cong":',
        '        cuc_bo[ai] += 1',
        '    else:',
        '        chung = cuc_bo[ai]',
        '    buoc[ai] = i + 1',
      ],
    },
    make: {
      prompt:
        'Xây mô hình xen kẽ tất định cho hai luồng A và B, mỗi luồng làm ĐÚNG MỘT phép tăng biến chung.\n\nMỗi phép tăng gồm ba vi-bước theo thứ tự VI_BUOC = ["doc", "cong", "ghi"]:\n- "doc": chép giá trị biến chung vào bản sao cục bộ của luồng đó.\n- "cong": cộng 1 vào BẢN SAO (biến chung chưa đổi).\n- "ghi": ghi bản sao đè lên biến chung.\n\nViết hai hàm:\n1. chay_xen_ke(lich) — lich là chuỗi các chữ A/B, mỗi ký tự là một vi-bước của luồng đó. Luồng nào đã đi hết ba vi-bước thì ký tự thừa của nó bị BỎ QUA (không lỗi). Trả về giá trị biến chung cuối cùng.\n2. chay_qua_kenh(so_viec) — mô hình kênh: dựng hàng đợi so_viec yêu cầu, rồi MỘT chủ sở hữu duy nhất xử lý tuần tự, mỗi yêu cầu tăng 1. Trả về kết quả.\n\nChương trình chính đọc MỘT dòng input() là lịch xen kẽ, rồi in đúng hai dòng:\nXen ke: chung = <ket qua>\nQua kenh: chung = <ket qua cua chay_qua_kenh(2)>\n\nĐọc kỹ hai dòng đó với vài lịch khác nhau: dòng trên đổi theo lịch, dòng dưới thì không bao giờ đổi. Đó chính là điều Go muốn bạn nhận ra.',
      starterCode: `VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    chung = 0
    cuc_bo = {"A": 0, "B": 0}       # bản sao riêng của mỗi luồng
    buoc = {"A": 0, "B": 0}         # đã đi tới vi-bước thứ mấy
    # Duyệt từng ký tự của lịch, làm đúng MỘT vi-bước
    ...


def chay_qua_kenh(so_viec):
    # Không ai chạm vào biến chung — chỉ một chủ sở hữu xử lý hàng đợi
    ...


lich = input("Lich xen ke: ")
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['AAABBB'],
          expected: 'Xen ke: chung = 2',
          match: 'contains',
          hidden: false,
          label: 'A xong hẳn rồi B mới bắt đầu → không ai chen vào, kết quả đúng',
        },
        {
          stdinLines: ['AAABBB'],
          expected: 'Qua kenh: chung = 2',
          match: 'contains',
          hidden: false,
          label: 'Kênh cho kết quả đúng — và sẽ đúng với MỌI lịch',
        },
        {
          stdinLines: ['ABABAB'],
          expected: 'Xen ke: chung = 1',
          match: 'contains',
          hidden: false,
          label: 'Xen kẽ đều → mất một lần tăng',
        },
        {
          stdinLines: ['AABABB'],
          expected: 'Xen ke: chung = 1',
          match: 'contains',
          hidden: false,
          label: 'A đã đi 2/3 chặng đường vẫn mất cập nhật — chỉ cần B ĐỌC trước khi A GHI',
        },
        {
          stdinLines: ['AAA'],
          expected: 'Xen ke: chung = 1',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: B chưa từng được chạy → chỉ có một lần tăng',
        },
        {
          stdinLines: ['AAABBBAAA'],
          expected: 'Xen ke: chung = 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ký tự thừa sau khi luồng đã xong phải bị bỏ qua, không nổ IndexError',
        },
        {
          stdinLines: ['BABABA'],
          expected: 'Xen ke: chung = 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đổi thứ tự luồng vẫn mất cập nhật (không hardcode theo A)',
        },
      ],
      hints: [
        'Ba vi-bước phải TÁCH BẠCH: "cong" chỉ được đụng vào cuc_bo, tuyệt đối không đụng vào chung. Gộp "cong" và "ghi" làm một là mô hình mất đúng cái khe hở cần dạy, và mọi lịch đều cho ra 2.',
        'Nhớ tăng buoc[ai] SAU khi làm vi-bước, và kiểm i >= len(VI_BUOC) TRƯỚC — đó là cách ký tự thừa bị bỏ qua êm thay vì nổ IndexError.',
        'Ca "AAA" cho thấy một điều dễ quên: luồng B không chạy vi-bước nào thì phép tăng của nó không tồn tại. Đừng cộng sẵn cho đủ hai.',
        'chay_qua_kenh KHÔNG cần biết gì về lịch — đó chính là điểm của nó. Nếu hàm của bạn nhận lich làm tham số thì bạn đang mô hình sai: kênh loại bỏ hẳn ảnh hưởng của lịch xen kẽ.',
        'Khung tham chiếu cho phần in:\n\nprint(f"Xen ke: chung = {chay_xen_ke(lich)}")\nprint(f"Qua kenh: chung = {chay_qua_kenh(2)}")',
      ],
      sampleSolution: `VI_BUOC = ["doc", "cong", "ghi"]


def chay_xen_ke(lich):
    chung = 0                       # biến dùng chung
    cuc_bo = {"A": 0, "B": 0}       # bản sao riêng của mỗi luồng
    buoc = {"A": 0, "B": 0}
    for ai in lich:
        i = buoc.get(ai, len(VI_BUOC))
        if i >= len(VI_BUOC):
            continue                # luồng đã xong -> bỏ qua ký tự thừa
        viec = VI_BUOC[i]
        if viec == "doc":
            cuc_bo[ai] = chung      # ① chụp giá trị hiện tại
        elif viec == "cong":
            cuc_bo[ai] += 1         # ② cộng trên BẢN SAO -> chung chưa đổi
        else:
            chung = cuc_bo[ai]      # ③ ghi đè -> mất cập nhật xảy ra ở đây
        buoc[ai] = i + 1
    return chung


def chay_qua_kenh(so_viec):
    kenh = ["tang"] * so_viec       # mọi luồng chỉ GỬI yêu cầu vào đây
    chung = 0                       # một chủ sở hữu duy nhất đụng vào
    for _yeu_cau in kenh:
        chung += 1                  # xử lý tuần tự -> không có cuộc đua nào
    return chung


lich = input("Lich xen ke: ")
print(f"Xen ke: chung = {chay_xen_ke(lich)}")
print(f"Qua kenh: chung = {chay_qua_kenh(2)}")`,
    },
    homework:
      'Phần này chạm vào Go THẬT, trên máy thật của bạn — sandbox của môn không chạy Go và không giả vờ ngược lại.\n\n1. Cài Go. Viết chương trình bật 1.000 goroutine, mỗi cái làm chung++ trên cùng một biến. Chạy vài lần: kết quả khác nhau và gần như không bao giờ đủ 1.000. Rồi chạy lại bằng `go run -race` — công cụ dò cuộc đua sẽ chỉ đích danh dòng nào đua với dòng nào. Đó là thứ mô hình trong bài không cho bạn được.\n\n2. Sửa hai lần: bằng sync.Mutex, rồi bằng channel. So hai bản: bản nào bạn dễ quên khoá hơn khi code lớn lên?\n\n3. Docker và CI/CD của track này cũng là thao tác trên máy thật — đóng gói vào Dockerfile, viết một workflow GitHub Actions build nó. Không mô phỏng được, cùng lý do deploy không mô phỏng được ở bậc P5.',
    srsCards: [
      {
        hoi: 'Câu lệnh "chung += 1" thật ra gồm mấy việc?',
        dap: 'Ba việc: ĐỌC giá trị chung vào bản sao, CỘNG 1 vào bản sao, GHI bản sao trở lại chung. Hệ điều hành có quyền cắt ngang giữa bất kỳ hai bước nào, và khe hở giữa đọc và ghi chính là chỗ mất cập nhật.',
      },
      {
        hoi: 'Vì sao cuộc đua dữ liệu khó tìm hơn mọi lỗi thông thường?',
        dap: 'Vì nó không tái lập được: chạy nghìn lần đúng cả nghìn, rồi sai một lần trong mười nghìn trên máy chủ thật. Không có traceback, không có dòng nào để nhìn — chỉ có dữ liệu lệch.',
      },
      {
        hoi: 'Châm ngôn của Go về đồng thời nói gì?',
        dap: '"Đừng giao tiếp bằng cách chia sẻ bộ nhớ; hãy chia sẻ bộ nhớ bằng cách giao tiếp." Tức đừng để nhiều luồng cùng chạm một biến, hãy để chúng gửi yêu cầu qua channel cho một chủ sở hữu duy nhất xử lý.',
      },
      {
        hoi: 'Khoá (mutex) và kênh (channel) khác nhau ở điểm yếu nào?',
        dap: 'Khoá đúng nhưng bạn phải nhớ khoá ở MỌI chỗ đụng vào biến đó, quên một chỗ là hỏng mà trình biên dịch không nhắc. Kênh loại bỏ hẳn việc nhiều luồng cùng chạm, nên không còn chỗ nào để quên.',
      },
    ],
  },
]
