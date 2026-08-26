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
//
// Ba bài theo một mạch: l1 vì sao ĐỪNG chia sẻ bộ nhớ → l2 hàng đợi công việc (cách làm
// đúng: giao tiếp thay vì chia sẻ) → l3 hạn chót và huỷ việc (context của Go).
// l2 chấm bằng MAKESPAN của hai cách phát việc trên cùng bộ dữ liệu — chia tĩnh và hàng đợi
// động cho hai con số khác nhau, nên không thể qua bài bằng một hàm dùng chung.
// l3 có hai bẫy: cộng dồn độ trễ (mô phỏng tuần tự thay vì song song) và chờ hết mọi dịch vụ
// rồi mới so hạn chót (tức không huỷ đúng lúc).
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
  {
    id: 'p6-u2-l2',
    unitId: 'p6-u2',
    language: 'python',
    title: 'Hàng đợi công việc: vì sao chia đều trước lại chậm hơn để thợ tự lấy việc',
    hook: 'Bốn thợ, hai mươi đơn hàng. Bạn chia mỗi người năm đơn cho công bằng. Ba người xong sớm ngồi chơi, người thứ tư ôm toàn đơn nặng và cả xưởng phải chờ họ — công bằng trên giấy, chậm trong thực tế.',
    theory:
      'Bài trước bạn thấy vì sao chia sẻ bộ nhớ giữa các luồng là nguồn cơn của lỗi khó tìm nhất, và vì sao Go có câu châm ngôn "đừng giao tiếp bằng cách chia sẻ bộ nhớ; hãy chia sẻ bộ nhớ bằng cách giao tiếp". Bài này là cách làm đúng đó trong hình hài thực tế nhất của nó: **hàng đợi công việc và nhóm thợ (worker pool)**.\n\nKhuôn rất đơn giản, và nó là khuôn xử lý song song phổ biến nhất trong backend: một hàng đợi chứa việc, N thợ cùng lấy việc từ hàng đợi đó, thợ nào rảnh thì lấy việc kế tiếp. Không thợ nào sửa dữ liệu của thợ khác — họ chỉ nhận việc và trả kết quả. Trong Go, hàng đợi ấy chính là một channel, và mỗi thợ là một goroutine đọc từ channel. Trong Python là queue.Queue với ThreadPoolExecutor. Tên gọi khác nhau, ý tưởng y hệt.\n\n**VÌ SAO KHÔNG CHIA SẴN TỪ ĐẦU.** Cách ai cũng nghĩ ra trước: có 20 việc, 4 thợ, chia mỗi người 5 việc rồi cho chạy. Cách này gọi là chia tĩnh, và nó chỉ tối ưu khi mọi việc nặng như nhau. Đời thật thì không: đơn hàng có đơn 1 món và đơn 30 món, ảnh có ảnh 20KB và ảnh 8MB, trang web có trang tải nhanh và trang treo 10 giây.\n\nTổng thời gian của cả nhóm KHÔNG phải trung bình các thợ — nó là thời gian của thợ CHẬM NHẤT. Chỉ tiêu này có tên riêng: makespan. Chia tĩnh mà lỡ dồn mấy việc nặng vào một người là cả nhóm chờ người đó, dù ba người kia đã rảnh từ lâu. Hàng đợi động không có bệnh này: ai xong trước lấy việc tiếp, tải tự cân bằng mà không cần biết trước việc nào nặng — đó là điều kiện quan trọng, vì thường bạn KHÔNG biết trước.\n\n**CHỌN SỐ THỢ.** Nhiều thợ hơn không phải lúc nào cũng nhanh hơn, và đây là chỗ hay bị hiểu sai:\n- Việc **nặng CPU** (nén ảnh, tính toán): số thợ ≈ số lõi. Thêm nữa thì các thợ chỉ giành nhau lõi, tốn thêm chi phí chuyển đổi ngữ cảnh mà không nhanh lên.\n- Việc **chờ I/O** (gọi API, đọc ổ cứng, truy vấn CSDL): số thợ có thể lớn hơn số lõi rất nhiều, vì phần lớn thời gian thợ chỉ ngồi CHỜ chứ không dùng CPU. Đây cũng chính là chỗ goroutine của Go toả sáng: một goroutine tốn vài KB bộ nhớ, chạy hàng chục nghìn cái cùng lúc là chuyện thường; luồng hệ điều hành thì nặng hơn cả nghìn lần.\n- Nhưng đừng vô hạn: mỗi thợ đang chạy đều giữ bộ nhớ, giữ kết nối CSDL, và đổ tải lên hệ thống ở đầu kia. Trần số thợ cũng chính là cách bạn TỰ GIỚI HẠN mình để không đánh sập dịch vụ của người khác.\n\n**MỘT CHI TIẾT NHỎ MÀ QUAN TRỌNG: việc lỗi thì sao?** Một thợ gặp lỗi ở việc thứ 7 không được phép làm cả nhóm dừng, cũng không được phép im lặng nuốt lỗi. Khuôn chuẩn: thợ trả về (kết quả, lỗi) cho từng việc, nhóm chạy hết rồi mới tổng kết "18 việc xong, 2 việc lỗi, đây là danh sách". Đây đúng là cách Go bắt bạn viết, vì hàm nào cũng trả về err và bạn không lờ nó đi được.\n\nBài hôm nay so hai cách trên cùng một đống việc, và con số sẽ nói thay lời: cùng số thợ, cùng số việc, chỉ khác cách phát việc.',
    workedExample: {
      code: `# So hai cach phat viec cho cung mot nhom tho.
def chia_khoi(viec, k):
    """Chia TĨNH: cắt danh sách thành k khối liên tiếp, mỗi thợ một khối."""
    if not viec:
        return 0
    n = len(viec)
    tong = []
    for w in range(k):
        dau = (n * w) // k
        cuoi = (n * (w + 1)) // k
        tong.append(sum(viec[dau:cuoi]))
    return max(tong)      # cả nhóm chờ thợ CHẬM NHẤT — chỉ tiêu makespan


def hang_doi(viec, k):
    """Hàng đợi ĐỘNG: thợ nào rảnh sớm nhất thì lấy việc kế tiếp."""
    if not viec:
        return 0
    ranh = [0] * k        # ranh[w] = thời điểm thợ w rảnh trở lại
    for t in viec:
        w = ranh.index(min(ranh))
        ranh[w] += t
    return max(ranh)


viec = [1, 4, 13, 11, 15, 8, 7]     # việc nặng nhẹ rất khác nhau — như đời thật
print("Chia tinh, 2 tho :", chia_khoi(viec, 2))
print("Hang doi, 2 tho  :", hang_doi(viec, 2))

# Thêm thợ có nhanh mãi không?
for k in [1, 2, 3, 4, 8]:
    print(f"  {k} tho -> {hang_doi(viec, k)}")
# Từ một mức nào đó, makespan chạm sàn = việc NẶNG NHẤT (15) — thêm thợ vô ích`,
      stdinLines: [],
    },
    predict: {
      code: `def hang_doi(viec, k):
    ranh = [0] * k
    for t in viec:
        w = ranh.index(min(ranh))
        ranh[w] += t
    return max(ranh)

viec = [1, 4, 13, 11, 15, 8, 7]
print(hang_doi(viec, 20))`,
      question: 'Bảy việc mà tung ra hai mươi thợ. Tổng thời gian của cả nhóm là bao nhiêu?',
      choices: ['15', '59', '20', '3'],
      answerIndex: 0,
      explain:
        'Là 15 — đúng bằng việc NẶNG NHẤT trong danh sách. Bảy việc thì nhiều nhất bảy thợ có việc làm, mười ba thợ còn lại ngồi không; và dù mỗi việc có một thợ riêng, cả nhóm vẫn phải chờ người ôm việc 15 đơn vị làm xong. Đây là cái sàn cứng của mọi bài toán song song: bạn không thể nhanh hơn công đoạn dài nhất không chia nhỏ được. Bài học thực dụng: khi thêm thợ mà thời gian không giảm nữa, đừng thêm nữa — hãy đi tìm cách CHIA NHỎ chính việc nặng nhất đó, hoặc chấp nhận nó là giới hạn của hệ.',
    },
    parsons: {
      prompt:
        'Xếp lại mô phỏng hàng đợi động. Ý cốt lõi nằm ở dòng chọn thợ: luôn là thợ rảnh SỚM NHẤT.',
      lines: [
        'def hang_doi(viec, k):',
        '    if not viec:',
        '        return 0',
        '    ranh = [0] * k',
        '    for t in viec:',
        '        w = ranh.index(min(ranh))',
        '        ranh[w] += t',
        '    return max(ranh)',
      ],
    },
    make: {
      prompt:
        'Bạn có một đống việc nền cần chạy (nén ảnh sản phẩm chẳng hạn) và một nhóm thợ. Hãy đo xem cách phát việc đáng giá bao nhiêu.\n\nViết hai hàm, cả hai trả về TỔNG THỜI GIAN của cả nhóm — tức thời điểm thợ CHẬM NHẤT làm xong (makespan):\n- chia_khoi(viec, k): chia tĩnh thành k khối liên tiếp. Thợ w nhận đoạn từ (n * w) // k tới (n * (w + 1)) // k. Có khối rỗng cũng không sao.\n- hang_doi(viec, k): hàng đợi động — lần lượt giao từng việc cho thợ đang RẢNH SỚM NHẤT.\n- Không có việc nào → cả hai trả về 0.\n\nChương trình chính đọc 2 dòng input(): n (số việc) và k (số thợ). Dựng danh sách thời lượng theo công thức rồi in đúng ba dòng:\nviec = [1 + (i * i * 3) % 17 for i in range(n)]\n\nChia tinh: <số> don vi\nHang doi: <số> don vi\nTiet kiem: <số> don vi\n\n(Tiết kiệm = chia tĩnh trừ hàng đợi. Không có việc nào thì cả ba số đều là 0.)',
      starterCode: `def chia_khoi(viec, k):
    # Thợ w nhận đoạn (n * w) // k tới (n * (w + 1)) // k
    # Trả về tổng của thợ NẶNG NHẤT, không phải tổng tất cả
    ...


def hang_doi(viec, k):
    # ranh[w] = thời điểm thợ w rảnh trở lại; luôn giao việc cho thợ rảnh sớm nhất
    ...


n = int(input("So viec: "))
k = int(input("So tho: "))
viec = [1 + (i * i * 3) % 17 for i in range(n)]
# In ba dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['7', '2'],
          expected: 'Chia tinh: 41 don vi',
          match: 'contains',
          hidden: false,
          label: '7 việc nặng nhẹ khác nhau, 2 thợ, chia tĩnh → 41',
        },
        {
          stdinLines: ['7', '2'],
          expected: 'Hang doi: 30 don vi',
          match: 'contains',
          hidden: false,
          label: 'Cùng việc, cùng thợ, chỉ khác cách phát việc → 30',
        },
        {
          stdinLines: ['7', '2'],
          expected: 'Tiet kiem: 11 don vi',
          match: 'contains',
          hidden: false,
          label: 'Nhanh hơn hơn một phần tư — không tốn thêm thợ nào',
        },
        {
          stdinLines: ['12', '4'],
          expected: 'Hang doi: 30 don vi',
          match: 'contains',
          hidden: false,
          label: 'Nhiều việc hơn, nhiều thợ hơn — hàng đợi vẫn thắng',
        },
        {
          stdinLines: ['12', '1'],
          expected: 'Tiet kiem: 0 don vi',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: một thợ thì hai cách y hệt nhau, không tiết kiệm được gì',
        },
        {
          stdinLines: ['0', '3'],
          expected: 'Hang doi: 0 don vi',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: không có việc → 0, không nổ lỗi khi gọi max() trên dãy rỗng',
        },
        {
          stdinLines: ['3', '5'],
          expected: 'Hang doi: 13 don vi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: thợ nhiều hơn việc → chạm sàn đúng bằng việc nặng nhất',
        },
        {
          stdinLines: ['50', '4'],
          expected: 'Chia tinh: 131 don vi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quy mô 50 việc — không hardcode theo một bộ dữ liệu',
        },
      ],
      hints: [
        'Cả hai hàm đều trả về THỜI GIAN CỦA THỢ CHẬM NHẤT, không phải tổng thời gian mọi việc. Nếu số của bạn to bằng sum(viec) thì bạn đang cộng thay vì lấy max.',
        'Ca 0 việc: max() trên danh sách rỗng ném ValueError. Trả về 0 sớm bằng "if not viec: return 0" là gọn nhất.',
        'Chia khối: tính mốc đầu và cuối bằng đúng công thức (n * w) // k và (n * (w + 1)) // k rồi sum(viec[dau:cuoi]). Công thức này tự chia phần dư cho đều, không cần xử lý riêng.',
        'Hàng đợi: giữ danh sách ranh[w] = thời điểm thợ w rảnh. Mỗi việc, tìm thợ rảnh sớm nhất bằng ranh.index(min(ranh)) rồi cộng thời lượng việc vào đúng thợ đó.',
        'Số thợ nhiều hơn số việc vẫn phải chạy đúng: mấy thợ thừa giữ nguyên ranh = 0, và makespan chạm sàn đúng bằng việc nặng nhất.',
      ],
      sampleSolution: `def chia_khoi(viec, k):
    """Chia TĨNH: k khối liên tiếp. Cả nhóm chờ thợ ôm khối nặng nhất."""
    if not viec:
        return 0
    n = len(viec)
    tong = []
    for w in range(k):
        dau = (n * w) // k
        cuoi = (n * (w + 1)) // k
        tong.append(sum(viec[dau:cuoi]))
    return max(tong)


def hang_doi(viec, k):
    """Hàng đợi ĐỘNG: thợ rảnh sớm nhất lấy việc kế tiếp — tải tự cân bằng."""
    if not viec:
        return 0
    ranh = [0] * k
    for t in viec:
        w = ranh.index(min(ranh))
        ranh[w] += t
    return max(ranh)


n = int(input("So viec: "))
k = int(input("So tho: "))
viec = [1 + (i * i * 3) % 17 for i in range(n)]

tinh = chia_khoi(viec, k)
dong = hang_doi(viec, k)
print(f"Chia tinh: {tinh} don vi")
print(f"Hang doi: {dong} don vi")
print(f"Tiet kiem: {tinh - dong} don vi")`,
    },
    homework:
      'Ba việc, làm tới đâu hay tới đó — việc số 3 đáng giá nhất.\n\n1. **Tìm điểm bão hoà.** Cố định n = 50, cho k chạy từ 1 tới 20, in makespan của hàng đợi. Từ k nào trở đi thêm thợ không giảm được nữa? Con số đó là trần song song của chính đống việc này.\n\n2. **Thêm chi phí khởi động.** Mỗi thợ tốn thêm 2 đơn vị để khởi động. Sửa hai hàm rồi chạy lại phần 1: nhiều thợ có còn luôn tốt hơn không? Đây là lý do đời thật người ta dùng nhóm thợ dựng sẵn thay vì đẻ thợ mới cho từng việc.\n\n3. **Viết bản chạy THẬT.** Dùng ThreadPoolExecutor với max_workers = k, mỗi việc là time.sleep(thoi_luong / 100), đo bằng time.perf_counter(). So với con số mô phỏng của bài này — chúng sẽ gần nhau, và bạn có một công cụ ước lượng chạy trong một phần nghìn giây thay vì thử thật mất nửa tiếng.',
    srsCards: [
      {
        hoi: 'Makespan của một nhóm thợ chạy song song được tính thế nào?',
        dap: 'Bằng thời gian của thợ CHẬM NHẤT, không phải trung bình cũng không phải tổng. Cả nhóm chỉ xong khi người cuối cùng xong, nên tối ưu song song thực chất là kéo người chậm nhất xuống.',
      },
      {
        hoi: 'Vì sao hàng đợi động thường nhanh hơn chia việc sẵn từ đầu?',
        dap: 'Vì thời lượng các việc rất khác nhau và thường không biết trước. Chia tĩnh có thể dồn mấy việc nặng vào một thợ và cả nhóm phải chờ; hàng đợi để thợ rảnh tự lấy việc kế nên tải tự cân bằng.',
      },
      {
        hoi: 'Số thợ nên chọn thế nào cho việc nặng CPU so với việc chờ I/O?',
        dap: 'Việc nặng CPU: số thợ xấp xỉ số lõi, thêm nữa chỉ giành nhau lõi. Việc chờ I/O: số thợ có thể lớn hơn số lõi nhiều lần vì thợ chủ yếu ngồi chờ — đây là chỗ goroutine của Go tỏ rõ ưu thế.',
      },
      {
        hoi: 'Khi thêm thợ mà tổng thời gian không giảm nữa thì đã chạm giới hạn gì?',
        dap: 'Chạm sàn bằng việc NẶNG NHẤT không chia nhỏ được — dù mỗi việc có một thợ riêng vẫn phải chờ nó xong. Muốn nhanh hơn phải chia nhỏ chính việc đó, chứ không phải thêm thợ.',
      },
    ],
  },
  {
    id: 'p6-u2-l3',
    unitId: 'p6-u2',
    language: 'python',
    title: 'Hạn chót và huỷ việc: dịch vụ chậm không được phép kéo cả trang chết theo',
    hook: 'Trang chủ của bạn gọi năm dịch vụ nhỏ để dựng nội dung. Bốn cái trả lời trong 200ms. Cái thứ năm — dịch vụ gợi ý sản phẩm — hôm nay treo 40 giây. Người dùng nhìn màn hình trắng 40 giây rồi đóng tab, chỉ vì một khối gợi ý mà không có cũng chẳng sao.',
    theory:
      'Trong hệ nhiều dịch vụ, câu hỏi khó nhất không phải "làm sao gọi song song" — bài trước đã trả lời rồi. Câu hỏi khó là: **khi nào thì thôi chờ?**\n\nMặc định của phần lớn thư viện mạng là chờ rất lâu, có cái chờ vô hạn. Mặc định đó âm thầm biến một dịch vụ chậm thành sự cố toàn hệ thống, theo dây chuyền: dịch vụ E treo → dịch vụ D đang gọi E cũng treo và giữ nguyên kết nối → luồng của D cạn → C gọi D cũng treo... Cả hệ sập vì một mắt xích, hiện tượng có tên là **sập dây chuyền (cascading failure)**. Chữa bằng ba lớp phòng thủ.\n\n**LỚP 1 — HẠN CHÓT (deadline), không phải timeout rời rạc.** Khác biệt tinh tế mà quan trọng: timeout là "mỗi lần gọi được 2 giây"; hạn chót là "toàn bộ yêu cầu này phải xong trước mốc T". Đặt từng timeout riêng lẻ thì ba lần gọi nối tiếp, mỗi lần 2 giây, vẫn thành 6 giây. Hạn chót thì được TRUYỀN XUỐNG: mỗi tầng biết mình còn bao nhiêu thời gian và truyền phần còn lại cho tầng dưới. Trong Go đây chính là context.Context — tham số đầu tiên của gần như mọi hàm có I/O, và nó không phải thủ tục rườm rà mà là cơ chế mang hạn chót đi khắp hệ.\n\n**LỚP 2 — HUỶ THẬT, không chỉ bỏ chờ.** Hết hạn mà chỉ "thôi không đọc kết quả nữa" là chưa đủ: yêu cầu vẫn chạy ở đầu kia, vẫn ăn CPU, vẫn giữ kết nối CSDL. Huỷ đúng nghĩa là báo cho công việc đang chạy dừng lại và nhả tài nguyên. Đó là lý do context của Go đi kèm kênh Done() để mọi tầng bên dưới cùng biết "khỏi làm nữa".\n\n**LỚP 3 — SUY GIẢM CÓ DUYÊN (graceful degradation).** Đây là phần thiết kế, không phải phần kỹ thuật, và nó cần bạn trả lời một câu hỏi trước khi viết dòng code nào: **dịch vụ nào là BẮT BUỘC, dịch vụ nào là CÓ THÌ TỐT?** Giá và tồn kho: bắt buộc — thiếu thì thà báo lỗi còn hơn hiện sai. Gợi ý sản phẩm, đánh giá, "người khác cũng xem": có thì tốt — thiếu thì ẩn khối đó đi, trang vẫn dùng được. Trang trả về trong 300ms với bốn phần năm nội dung tốt hơn hẳn trang đầy đủ sau 40 giây, vì sau 40 giây thì chẳng còn ai ngồi đó xem.\n\n**MỘT CON SỐ ĐỂ NHỚ.** Gọi song song n dịch vụ, tổng thời gian chờ là con SỐ LỚN NHẤT trong các độ trễ, không phải tổng của chúng — đó là toàn bộ lý do người ta gọi song song. Nhưng hệ quả đi kèm: **cái chậm nhất quyết định tất cả.** Nên đặt hạn chót không phải là chuyện phòng hờ hiếm gặp, nó là cách bạn đặt trần cho con số lớn nhất kia. Có hạn chót thì tổng thời gian chờ = min(độ trễ lớn nhất, hạn chót) — bạn giành lại quyền kiểm soát từ tay dịch vụ chậm nhất.\n\nMột lớp phòng thủ thứ tư đáng biết tên để tự tìm hiểu thêm: **cầu dao (circuit breaker)**. Nếu một dịch vụ hỏng liên tục, đừng gọi nó nữa trong ít phút — vừa đỡ tốn hạn chót của mọi yêu cầu, vừa cho nó thời gian hồi phục thay vì bị dội yêu cầu lúc đang yếu.',
    workedExample: {
      code: `# Goi song song nhieu dich vu, co HAN CHOT chung cho ca yeu cau.
def goi_song_song(do_tre, han_chot):
    """do_tre: độ trễ (ms) của từng dịch vụ. Trả về (số kịp, tổng thời gian chờ)."""
    if not do_tre:
        return 0, 0
    kip = [d for d in do_tre if d <= han_chot]
    cham_nhat = max(do_tre)
    # Song song: chờ theo cái CHẬM NHẤT, không phải tổng. Nhưng không quá hạn chót.
    tong = cham_nhat if cham_nhat <= han_chot else han_chot
    return len(kip), tong


dich_vu = {"gia": 80, "ton_kho": 120, "danh_gia": 260, "goi_y": 900}
do_tre = list(dich_vu.values())

for han in [1000, 300, 100]:
    so_kip, tong = goi_song_song(do_tre, han)
    thieu = [ten for ten, d in dich_vu.items() if d > han]
    print(f"Han chot {han}ms -> cho {tong}ms, {so_kip}/4 kip, an khoi: {thieu}")

# Neu goi TUAN TU thi tong la bao nhieu?
print("Goi tuan tu se mat:", sum(do_tre), "ms")`,
      stdinLines: [],
    },
    predict: {
      code: `def goi_SAI(do_tre, han_chot):
    tong = 0
    kip = 0
    for d in do_tre:
        tong += d                 # cong don tung dich vu
        if tong <= han_chot:
            kip += 1
    return kip, tong

print(goi_SAI([80, 120, 260, 900], 300))`,
      question: 'Bốn dịch vụ, hạn chót 300ms. Hàm này báo bao nhiêu dịch vụ kịp và chờ bao lâu?',
      choices: ['(2, 1360)', '(3, 300)', '(4, 900)', '(2, 300)'],
      answerIndex: 0,
      explain:
        'Trả về (2, 1360) — sai cả hai con số, vì hàm này gọi TUẦN TỰ chứ không song song. Nó cộng dồn: 80, rồi 200, rồi 460, rồi 1360; hai dịch vụ đầu nằm trong 300ms nên báo 2 kịp. Sự thật khi gọi song song: cả ba dịch vụ 80, 120, 260 đều dưới 300ms nên KỊP CẢ BA, và tổng thời gian chờ là 300ms (chạm hạn chót rồi huỷ cái 900). Hai lỗi tách bạch ở đây: (1) song song thì chờ theo cái CHẬM NHẤT chứ không phải tổng; (2) có hạn chót thì không bao giờ chờ quá hạn chót — 1360ms là con số không thể xảy ra khi bạn đã đặt hạn 300ms.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm gọi song song có hạn chót. Chú ý dòng quyết định tổng thời gian chờ — nó là chỗ phân biệt song song với tuần tự.',
      lines: [
        'def goi_song_song(do_tre, han_chot):',
        '    if not do_tre:',
        '        return 0, 0',
        '    kip = [d for d in do_tre if d <= han_chot]',
        '    cham_nhat = max(do_tre)',
        '    tong = cham_nhat if cham_nhat <= han_chot else han_chot',
        '    return len(kip), tong',
      ],
    },
    make: {
      prompt:
        'Trang chủ của bạn gọi song song n dịch vụ nhỏ, dưới một hạn chót chung. Hãy viết phần quyết định "khi nào thôi chờ".\n\nHàm goi_song_song(do_tre, han_chot) trả về bộ ba (so_kip, tong_thoi_gian, ket_qua):\n- so_kip: số dịch vụ có độ trễ NHỎ HƠN HOẶC BẰNG hạn chót (đúng bằng hạn chót vẫn tính là kịp).\n- tong_thoi_gian: gọi song song nên chờ theo dịch vụ CHẬM NHẤT — nhưng không bao giờ quá hạn chót. Chậm nhất còn trong hạn thì chờ đúng chừng đó; vượt hạn thì chờ đúng bằng hạn chót rồi huỷ phần còn lại.\n- ket_qua: chuỗi "day du" nếu mọi dịch vụ đều kịp, ngược lại "thieu".\n- Không có dịch vụ nào → (0, 0, "day du") — không gọi gì thì không thiếu gì.\n\nChương trình chính đọc 2 dòng input(): n và han_chot. Dựng độ trễ theo công thức rồi in đúng ba dòng:\ndo_tre = [50 + (i * 130) % 400 for i in range(n)]\n\nSo dich vu kip: <số>\nTong thoi gian: <số> ms\nKet qua: <day du hoặc thieu>',
      starterCode: `def goi_song_song(do_tre, han_chot):
    if not do_tre:
        return 0, 0, "day du"
    # Song song = chờ theo cái CHẬM NHẤT, và không bao giờ quá hạn chót
    ...


n = int(input("So dich vu: "))
han_chot = int(input("Han chot (ms): "))
do_tre = [50 + (i * 130) % 400 for i in range(n)]
# In ba dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['5', '300'],
          expected: 'So dich vu kip: 3',
          match: 'contains',
          hidden: false,
          label: '5 dịch vụ, hạn 300ms → 3 cái kịp (50, 180, 170)',
        },
        {
          stdinLines: ['5', '300'],
          expected: 'Tong thoi gian: 300 ms',
          match: 'contains',
          hidden: false,
          label: 'Chạm hạn chót rồi huỷ — KHÔNG chờ tới 440ms, càng không cộng dồn thành 1150ms',
        },
        {
          stdinLines: ['5', '300'],
          expected: 'Ket qua: thieu',
          match: 'contains',
          hidden: false,
          label: 'Thiếu 2 khối — trang vẫn dựng được, chỉ ẩn hai khối "có thì tốt"',
        },
        {
          stdinLines: ['5', '500'],
          expected: 'Tong thoi gian: 440 ms',
          match: 'contains',
          hidden: false,
          label: 'Hạn rộng: mọi dịch vụ kịp → chờ đúng cái chậm nhất (440), không phải 500',
        },
        {
          stdinLines: ['5', '500'],
          expected: 'Ket qua: day du',
          match: 'contains',
          hidden: false,
          label: 'Không thiếu khối nào',
        },
        {
          stdinLines: ['0', '300'],
          expected: 'Tong thoi gian: 0 ms',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: không gọi dịch vụ nào → 0ms, không nổ lỗi max() trên dãy rỗng',
        },
        {
          stdinLines: ['5', '50'],
          expected: 'So dich vu kip: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hạn chót bằng đúng độ trễ nhỏ nhất — "bằng" vẫn tính là kịp',
        },
        {
          stdinLines: ['8', '200'],
          expected: 'Tong thoi gian: 200 ms',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 8 dịch vụ, hạn chặt — không hardcode theo một bộ dữ liệu',
        },
        {
          stdinLines: ['3', '1000'],
          expected: 'Ket qua: day du',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hạn rất rộng, mọi dịch vụ đều kịp',
        },
      ],
      hints: [
        'Đếm số kịp bằng một dòng lọc: [d for d in do_tre if d <= han_chot]. Nhớ dấu "bằng" — đúng bằng hạn chót vẫn là kịp.',
        'Nếu tổng thời gian của bạn ra 1150 ở ca đầu, bạn đang CỘNG các độ trễ, tức mô phỏng gọi tuần tự. Song song thì lấy max(), đó chính là điểm khác nhau giữa hai cách gọi.',
        'Nếu ra 440 ở ca hạn 300, bạn đang chờ hết mọi dịch vụ rồi mới so hạn chót. Hạn chót là để CẮT NGANG: tổng = min(max(do_tre), han_chot).',
        'ket_qua so số kịp với tổng số dịch vụ: bằng nhau thì "day du", ít hơn thì "thieu". Đừng so với hạn chót lần nữa, bạn đã lọc rồi.',
        'Ca 0 dịch vụ trả về "day du" chứ không phải "thieu": không gọi gì thì không thiếu gì. Xử lý ca này bằng câu return sớm ở đầu hàm cho gọn.',
      ],
      sampleSolution: `def goi_song_song(do_tre, han_chot):
    if not do_tre:
        # Không gọi gì thì không thiếu gì
        return 0, 0, "day du"
    kip = [d for d in do_tre if d <= han_chot]     # "bằng" vẫn tính là kịp
    cham_nhat = max(do_tre)
    # Song song: chờ theo cái CHẬM NHẤT — nhưng hạn chót cắt ngang, không chờ quá
    tong = cham_nhat if cham_nhat <= han_chot else han_chot
    ket_qua = "day du" if len(kip) == len(do_tre) else "thieu"
    return len(kip), tong, ket_qua


n = int(input("So dich vu: "))
han_chot = int(input("Han chot (ms): "))
do_tre = [50 + (i * 130) % 400 for i in range(n)]

so_kip, tong, ket_qua = goi_song_song(do_tre, han_chot)
print(f"So dich vu kip: {so_kip}")
print(f"Tong thoi gian: {tong} ms")
print(f"Ket qua: {ket_qua}")`,
    },
    homework:
      'Hạn chót chỉ có giá trị khi con số được chọn từ dữ liệu, không phải chọn bừa.\n\n1. **Phân loại dịch vụ của bạn.** Lấy một trang trong dự án của bạn, liệt kê mọi thứ nó cần lấy về, chia hai cột BẮT BUỘC và CÓ THÌ TỐT. Với mỗi cái ở cột hai, viết một câu: thiếu thì trang hiện gì thay thế?\n\n2. **Chọn hạn chót bằng số liệu.** Ghi thời gian phản hồi của một dịch vụ qua vài trăm lần gọi, sắp xếp rồi lấy mốc p95 và p99. Đặt hạn quanh p99 thường là điểm cân bằng tốt. Tự trả lời: vì sao lấy trung bình lại là lựa chọn tệ ở đây?\n\n3. **Thử bản chạy thật.** Dùng asyncio.wait_for cho vài dịch vụ giả bằng asyncio.sleep, trong đó một cái cố tình treo 30 giây. Xác nhận bằng mắt: chương trình có trả về đúng lúc hết hạn không, và cái treo kia có bị huỷ thật không hay vẫn chạy ngầm tới cùng?',
    srsCards: [
      {
        hoi: 'Hạn chót (deadline) khác timeout từng lần gọi ở chỗ nào?',
        dap: 'Timeout đặt riêng cho mỗi lần gọi nên ba lần nối tiếp mỗi lần 2 giây vẫn thành 6 giây. Hạn chót là mốc chung cho cả yêu cầu và được truyền xuống các tầng: mỗi tầng biết mình còn bao nhiêu thời gian.',
      },
      {
        hoi: 'Sập dây chuyền (cascading failure) xảy ra theo cơ chế nào?',
        dap: 'Một dịch vụ treo khiến dịch vụ gọi nó cũng treo và giữ nguyên kết nối, luồng cạn dần, rồi tầng gọi tiếp theo cũng treo — cả hệ sập vì một mắt xích chậm, chỉ vì mặc định của thư viện mạng là chờ rất lâu.',
      },
      {
        hoi: 'Vì sao "hết hạn thì thôi không đọc kết quả nữa" là chưa đủ?',
        dap: 'Vì yêu cầu vẫn chạy ở đầu kia: vẫn ăn CPU, vẫn giữ kết nối cơ sở dữ liệu. Huỷ đúng nghĩa là báo xuống cho công việc đang chạy dừng lại và nhả tài nguyên, như kênh Done() của context trong Go.',
      },
      {
        hoi: 'Gọi song song n dịch vụ thì tổng thời gian chờ bằng bao nhiêu?',
        dap: 'Bằng độ trễ LỚN NHẤT trong các dịch vụ, không phải tổng của chúng — và khi có hạn chót thì bằng số nhỏ hơn giữa độ trễ lớn nhất và hạn chót. Hệ quả: cái chậm nhất quyết định tất cả.',
      },
    ],
  },
]
