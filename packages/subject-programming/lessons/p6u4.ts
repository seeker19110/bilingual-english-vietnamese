// lessons/p6u4.ts — P6-U4: Track luyện phỏng vấn thuật toán (làn A, `python`).
//
// Chấm bằng PHÉP ĐẾM (hiến chương P5 §2): dem phải đúng bằng n, tức chỉ lời giải MỘT LƯỢT
// (Kadane) mới qua — bản vét cạn O(n²) cho cùng đáp số nhưng số đếm khác hẳn.
//
// Ca biên toàn số âm là bẫy kinh điển của chính bài này trong phỏng vấn thật: lời giải khởi
// tạo tot_nhat = 0 trả về 0 thay vì phần tử lớn nhất. Đề có ca đó ở cả mức nhìn thấy lẫn ca ẩn.
//
// Ba bài, ba mẫu tối ưu hay ra đề nhất: l1 Kadane (một lượt) → l2 đổi thời gian lấy bộ nhớ
// (dict, two-sum) → l3 cửa sổ trượt (hai con trỏ, lập luận khấu hao).
// Cả ba đều chấm bằng phép đếm nói trên.
// Bẫy của l2 là ghi-trước-hỏi-sau (sinh cặp giả gồm một phần tử dùng hai lần); bẫy của l3 là
// quên vế "chỗ lặp còn nằm trong cửa sổ" — lỗi làm kết quả TO HƠN sự thật, ca thử ngắn không bắt được.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u4-l1',
    unitId: 'p6-u4',
    language: 'python',
    title: 'Phỏng vấn thuật toán: cách nghĩ quan trọng hơn lời giải',
    hook: 'Người phỏng vấn viết lên bảng một câu hai dòng và nhìn bạn. Điều họ chấm không phải là bạn có nhớ thuật toán này hay không — mà là mười phút tiếp theo bạn làm gì khi chưa biết đáp án.',
    theory:
      'Phỏng vấn thuật toán bị mang tiếng là học thuộc, nhưng người phỏng vấn giỏi chấm theo một khung khá cố định. Biết khung đó thì bạn đỡ hoảng, và cũng biết mình đang bỏ sót bước nào.\n\nNĂM BƯỚC, theo đúng thứ tự — bỏ bước nào cũng mất điểm:\n\n1. **LÀM RÕ ĐỀ (đừng bỏ qua).** Hỏi lại trước khi viết: dữ liệu có thể rỗng không? Có số âm không? Lớn cỡ nào? Có trùng lặp không? Người phỏng vấn cố tình ra đề mơ hồ — im lặng lao vào code là hỏng ngay ở đây. Với bài hôm nay, câu hỏi đáng giá nhất là: "mảng có thể toàn số âm không?".\n2. **NÊU CA BIÊN TRƯỚC KHI GIẢI.** Mảng rỗng, một phần tử, toàn âm, toàn dương. Nói to chúng ra: nó cho thấy bạn nghĩ như người viết phần mềm chạy thật, không phải người giải đố.\n3. **NÊU LỜI GIẢI THÔ trước, kèm big-O của nó.** "Em có thể thử mọi đoạn con, O(n²), chắc chắn đúng." Đừng ngại nói cách chậm — có một lời giải đúng trong tay là điểm sàn, và nó cho bạn cái để so.\n4. **TỐI ƯU, giải thích Ý TƯỞNG trước khi viết code.** Đây là chỗ chiếm nhiều điểm nhất.\n5. **TỰ KIỂM bằng ví dụ.** Chạy tay lời giải trên một ca nhỏ và một ca biên. Người phỏng vấn tìm được lỗi trước bạn là mất điểm; bạn tự tìm ra là được điểm.\n\nBÀI HÔM NAY: cho một dãy số (có cả âm), tìm ĐOẠN CON LIÊN TIẾP có tổng lớn nhất. Trả về tổng đó. Đoạn con phải có ít nhất một phần tử.\n\nCách thô: thử mọi cặp đầu-cuối, cộng lại, giữ số lớn nhất. O(n²). Đúng, và với 10.000 phần tử là 50 triệu phép cộng.\n\nÝ TƯỞNG TỐI ƯU (thuật toán Kadane) — chỉ một câu, nhưng phải hiểu chứ đừng thuộc: đi từ trái sang phải, tại mỗi phần tử hỏi **"đoạn tốt nhất KẾT THÚC TẠI ĐÂY là gì?"**. Chỉ có hai lựa chọn: hoặc nối tiếp đoạn tốt nhất kết thúc ở phần tử trước, hoặc bắt đầu lại từ chính phần tử này.\n  hien_tai = max(x, hien_tai + x)\nRồi giữ lại số lớn nhất từng thấy. Một lượt, O(n).\n\nVì sao "bắt đầu lại" là đúng: nếu tổng tích luỹ tới trước đang ÂM, thì mang nó theo chỉ làm mọi đoạn về sau tệ đi — vứt đi luôn tốt hơn. Đó là toàn bộ cái hay của thuật toán này.\n\nCÁI BẪY, và nó là bẫy thật trong phỏng vấn: rất nhiều người khởi tạo tot_nhat = 0. Với mảng toàn số âm, lời giải đó trả về 0 — nhưng 0 không phải tổng của đoạn con nào cả (đoạn con phải có ít nhất một phần tử). Đáp án đúng là phần tử LỚN NHẤT, tức số âm gần 0 nhất. Khởi tạo cả hai biến bằng ds[0] rồi duyệt từ phần tử thứ hai là hết bẫy. Đây chính là lý do bước 1 và bước 2 tồn tại: ai hỏi "có thể toàn âm không?" ngay từ đầu thì không bao giờ rơi vào đây.\n\nMột lời khuyên thực dụng cuối: **nói to cách nghĩ của bạn trong suốt buổi.** Im lặng năm phút rồi viết ra lời giải đúng vẫn kém hơn vừa nghĩ vừa nói. Người phỏng vấn không đọc được đầu bạn, và thứ họ cần chấm nằm trong đầu đó.',
    workedExample: {
      code: `def tong_lon_nhat_THO(ds):
    """Cách thô: thử MỌI đoạn con. O(n^2) — nói ra được cách này đã là điểm sàn."""
    if not ds:
        return 0
    tot_nhat = ds[0]
    for i in range(len(ds)):
        tong = 0
        for j in range(i, len(ds)):
            tong += ds[j]
            tot_nhat = max(tot_nhat, tong)
    return tot_nhat


def tong_lon_nhat(ds):
    """Kadane: một lượt, O(n). Tại mỗi phần tử hỏi 'đoạn tốt nhất KẾT THÚC TẠI ĐÂY?'"""
    if not ds:
        return 0, 0
    tot_nhat = hien_tai = ds[0]     # KHỞI TẠO BẰNG ds[0], không phải 0 -> hết bẫy toàn âm
    dem = 1
    for x in ds[1:]:
        dem += 1
        hien_tai = max(x, hien_tai + x)   # nối tiếp, hoặc bắt đầu lại từ x
        tot_nhat = max(tot_nhat, hien_tai)
    return tot_nhat, dem


vi_du = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Tho :", tong_lon_nhat_THO(vi_du))
print("Kadane:", tong_lon_nhat(vi_du))          # đoạn [4, -1, 2, 1] -> 6

toan_am = [-8, -3, -6, -2, -5]
print("Toan am - dung:", tong_lon_nhat(toan_am)[0])   # -2, KHÔNG phải 0

mot_phan_tu = [-7]
print("Mot phan tu:", tong_lon_nhat(mot_phan_tu)[0])  # -7`,
      stdinLines: [],
    },
    predict: {
      code: `def tong_lon_nhat_SAI(ds):
    tot_nhat = 0                 # <- khoi tao bang 0
    hien_tai = 0
    for x in ds:
        hien_tai = max(x, hien_tai + x)
        tot_nhat = max(tot_nhat, hien_tai)
    return tot_nhat

print(tong_lon_nhat_SAI([-8, -3, -6, -2, -5]))`,
      question: 'Mảng toàn số âm. Lời giải khởi tạo bằng 0 trả về gì?',
      choices: ['0', '-2', '-24', '-8'],
      answerIndex: 0,
      explain:
        'Trả về 0 — và 0 là một câu trả lời không tồn tại, vì không đoạn con nào của mảng này có tổng bằng 0 (đoạn con phải có ít nhất một phần tử, mà mọi phần tử đều âm). Đáp án đúng là -2: phần tử lớn nhất, tức số âm gần 0 nhất. Đây là cái bẫy được cài sẵn trong chính đề bài, và nó bắt được rất nhiều người trong phỏng vấn thật — không phải vì họ không biết thuật toán, mà vì họ không hỏi "mảng có thể toàn số âm không?" ở phút đầu tiên. Cách chữa: khởi tạo cả hai biến bằng ds[0] rồi duyệt từ phần tử thứ hai.',
    },
    parsons: {
      prompt: 'Xếp lại thuật toán Kadane — chú ý chỗ khởi tạo, vì đó là chỗ bẫy toàn số âm nằm.',
      lines: [
        'if not ds:',
        '    return 0',
        'tot_nhat = hien_tai = ds[0]',
        'for x in ds[1:]:',
        '    hien_tai = max(x, hien_tai + x)',
        '    tot_nhat = max(tot_nhat, hien_tai)',
        'return tot_nhat',
      ],
    },
    make: {
      prompt:
        'Đề phỏng vấn: cho một dãy số nguyên (có cả âm), tìm ĐOẠN CON LIÊN TIẾP có tổng lớn nhất, trả về tổng đó. Đoạn con phải có ít nhất một phần tử.\n\nDãy được sinh bằng công thức để thử được ở quy mô thật:\nds = [((i * 37) % 21) - 10 + lech for i in range(n)]\n\nViết tong_lon_nhat(ds) trả về (tong, dem):\n- tong: tổng lớn nhất.\n- dem: SỐ PHẦN TỬ đã xét — cộng 1 cho mỗi phần tử bạn duyệt qua. Lời giải một lượt sẽ có dem đúng bằng n; lời giải thử mọi đoạn con thì không.\n- ds rỗng → trả về (0, 0).\n\nChương trình chính đọc 2 dòng input(): dòng 1 là n, dòng 2 là lech (số nguyên, có thể âm). Dựng ds theo công thức rồi in đúng hai dòng:\nTong lon nhat: <tong>\nSo phan tu da xet: <dem>\n\nTrước khi nộp, tự chạy ca lech = -50 (mọi phần tử đều âm) và tự hỏi: kết quả có phải là tổng của một đoạn con có thật không?',
      starterCode: `def tong_lon_nhat(ds):
    if not ds:
        return 0, 0
    # Khởi tạo thế nào để ca TOÀN SỐ ÂM vẫn đúng?
    ...


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
ds = [((i * 37) % 21) - 10 + lech for i in range(n)]
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['20', '0'],
          expected: 'Tong lon nhat: 23',
          match: 'contains',
          hidden: false,
          label: 'Dãy 20 phần tử có cả âm lẫn dương → 23',
        },
        {
          stdinLines: ['20', '0'],
          expected: 'So phan tu da xet: 20',
          match: 'contains',
          hidden: false,
          label: 'Một lượt duy nhất: số phần tử xét đúng bằng n (thử mọi đoạn con sẽ ra 210)',
        },
        {
          stdinLines: ['20', '-50'],
          expected: 'Tong lon nhat: -40',
          match: 'contains',
          hidden: false,
          label: 'BẪY: toàn số âm → phải là -40 (phần tử lớn nhất), KHÔNG phải 0',
        },
        {
          stdinLines: ['1', '0'],
          expected: 'Tong lon nhat: -10',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: đúng một phần tử, và nó âm',
        },
        {
          stdinLines: ['0', '0'],
          expected: 'Tong lon nhat: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: dãy rỗng → 0, không nổ IndexError',
        },
        {
          stdinLines: ['1000', '-50'],
          expected: 'So phan tu da xet: 1000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quy mô 1.000 — vẫn phải là MỘT lượt, không phải 500.500',
        },
        {
          stdinLines: ['7', '3'],
          expected: 'Tong lon nhat: 21',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy ngắn lệch dương — không hardcode theo một bộ dữ liệu',
        },
      ],
      hints: [
        'Câu hỏi đáng giá nhất của bài này, và cũng là câu nên hỏi người phỏng vấn ở phút đầu: mảng có thể toàn số âm không? Câu trả lời quyết định bạn khởi tạo bằng 0 hay bằng ds[0].',
        'Khởi tạo tot_nhat = hien_tai = ds[0] rồi duyệt từ ds[1:]. Khởi tạo bằng 0 thì ca lech = -50 trả về 0 — một con số không phải tổng của đoạn con nào cả.',
        'Cốt lõi chỉ một dòng: hien_tai = max(x, hien_tai + x). Nghĩa là "đoạn tốt nhất kết thúc tại x" hoặc nối tiếp đoạn trước, hoặc bắt đầu lại từ x — vì mang theo một tổng đang ÂM chỉ làm mọi đoạn sau tệ đi.',
        'Đừng quên cập nhật tot_nhat SAU mỗi bước, không phải chỉ ở cuối: đoạn tốt nhất có thể kết thúc ở giữa dãy rồi sau đó hien_tai tụt xuống.',
        'dem đếm PHẦN TỬ, và vì bạn khởi tạo bằng ds[0] nên nó bắt đầu từ 1 rồi cộng thêm cho từng phần tử trong ds[1:] — tổng cộng đúng bằng n.',
      ],
      sampleSolution: `def tong_lon_nhat(ds):
    if not ds:
        return 0, 0
    # Khởi tạo bằng ds[0], KHÔNG phải 0 -> ca toàn số âm vẫn ra đáp án có thật
    tot_nhat = hien_tai = ds[0]
    dem = 1
    for x in ds[1:]:
        dem += 1
        # Đoạn tốt nhất KẾT THÚC TẠI x: nối tiếp, hoặc bắt đầu lại từ x.
        # Mang theo một tổng đang âm chỉ làm mọi đoạn về sau tệ đi.
        hien_tai = max(x, hien_tai + x)
        tot_nhat = max(tot_nhat, hien_tai)   # cập nhật SAU mỗi bước
    return tot_nhat, dem


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
ds = [((i * 37) % 21) - 10 + lech for i in range(n)]

tong, dem = tong_lon_nhat(ds)
print(f"Tong lon nhat: {tong}")
print(f"So phan tu da xet: {dem}")`,
    },
    homework:
      'Luyện phỏng vấn không phải là cày số lượng đề — là luyện cách nghĩ tới lúc nó thành phản xạ.\n\n1. Viết thêm bản THÔ O(n²) của chính bài này, cho cả hai chạy trên dãy 1.000 phần tử và so số phép cộng. Rồi tự trả lời: nếu trong phỏng vấn bạn chỉ kịp viết bản thô, có nên nộp không? (Có — một lời giải đúng luôn hơn một lời giải tối ưu dang dở.)\n\n2. Mở rộng: trả về thêm VỊ TRÍ đầu và cuối của đoạn. Đây là câu hỏi tiếp theo người phỏng vấn hay hỏi, và nó khó hơn bạn tưởng — bạn phải nhớ chỗ "bắt đầu lại".\n\n3. Quan trọng nhất: giải một đề bất kỳ TRƯỚC MẶT một người và NÓI TO từng bước theo đúng năm bước ở phần lý thuyết. Không có ai thì tự quay màn hình kèm tiếng rồi xem lại — bạn sẽ nghe thấy mình im lặng bao lâu.',
    srsCards: [
      {
        hoi: 'Bước đầu tiên khi nhận một đề phỏng vấn thuật toán là gì?',
        dap: 'Làm rõ đề bằng cách hỏi lại: dữ liệu có rỗng không, có số âm không, lớn cỡ nào, có trùng lặp không. Đề được ra mơ hồ có chủ đích, và im lặng lao vào code là mất điểm ngay ở bước này.',
      },
      {
        hoi: 'Ý tưởng cốt lõi của thuật toán Kadane là gì?',
        dap: 'Đi một lượt từ trái sang, tại mỗi phần tử hỏi "đoạn tốt nhất KẾT THÚC TẠI ĐÂY là gì" — chỉ có hai lựa chọn: nối tiếp đoạn trước, hoặc bắt đầu lại từ chính phần tử này (khi tổng tích luỹ đang âm).',
      },
      {
        hoi: 'Vì sao khởi tạo tot_nhat = 0 là sai với bài tổng đoạn con lớn nhất?',
        dap: 'Vì khi mảng toàn số âm, nó trả về 0 — mà 0 không phải tổng của đoạn con nào (đoạn con phải có ít nhất một phần tử). Đáp án đúng là phần tử lớn nhất. Khởi tạo bằng ds[0] là hết bẫy.',
      },
      {
        hoi: 'Nên nêu lời giải thô O(n²) trong phỏng vấn hay giấu đi để chờ giải tối ưu?',
        dap: 'Nên nêu ra, kèm big-O của nó. Có một lời giải đúng trong tay là điểm sàn và là mốc để so khi tối ưu; một lời giải tối ưu viết dở dang thì không được điểm nào.',
      },
    ],
  },
  {
    id: 'p6-u4-l2',
    unitId: 'p6-u4',
    language: 'python',
    title: 'Đổi thời gian lấy bộ nhớ: mẹo một dòng biến O(n²) thành O(n)',
    hook: 'Người phỏng vấn nghe bạn trình bày cách vét cạn xong, gật đầu, rồi hỏi đúng một câu: "Nhanh hơn được không?". Câu trả lời cho phần lớn đề dạng này chỉ là một chữ: nhớ lại những gì mình đã đi qua.',
    theory:
      'Bài trước bạn đã có khung năm bước để không hoảng khi nhận đề. Bài này là **mẫu tối ưu hay dùng nhất** trong phỏng vấn thuật toán, và may mắn thay nó cũng dễ hiểu nhất: **đổi thời gian lấy bộ nhớ**.\n\nĐề mẫu: cho một dãy số và một mục tiêu, tìm HAI phần tử cộng lại đúng bằng mục tiêu, trả về chỉ số của chúng.\n\n**Cách thô** ai cũng nghĩ ra: hai vòng lặp lồng nhau, thử mọi cặp. O(n²) — với 10.000 phần tử là 50 triệu lần thử.\n\n**Chỗ lãng phí nằm ở đâu?** Đây là câu hỏi cần tập hỏi, vì nó dẫn tới lời giải cho hầu hết bài dạng này. Vòng trong đang làm gì? Nó đi tìm xem "số bù" (mục tiêu trừ số hiện tại) có nằm đâu đó phía trước không. Mà những số phía trước thì bạn ĐÃ ĐI QUA rồi — bạn đã nhìn thấy chúng, chỉ là bạn không giữ lại. Rồi mỗi phần tử mới lại đi tìm lại từ đầu. Toàn bộ chi phí O(n²) sinh ra từ việc quên.\n\n**Lời giải: nhớ lại.** Đi một lượt, vừa đi vừa ghi mỗi số đã gặp vào một dict (số → chỉ số). Tại mỗi phần tử, thay vì đi tìm, chỉ cần hỏi dict: "số bù đã gặp chưa?". Tra dict trung bình mất O(1) — không phụ thuộc dict đang chứa bao nhiêu phần tử, nhờ băm (hash). Vậy là một lượt O(n) thay cho O(n²).\n\n**Ba chi tiết mà người phỏng vấn thực sự chờ nghe:**\n\n1. **Hỏi TRƯỚC khi ghi, đừng ghi trước rồi hỏi.** Ghi trước thì với mục tiêu bằng đúng hai lần số hiện tại, chính nó sẽ tự khớp với chính nó và bạn trả về một cặp giả gồm cùng một chỉ số. Đảo thứ tự hai dòng là hết bệnh, mà thứ tự ấy đúng chỉ vì một lẽ tự nhiên: bạn chỉ được ghép với những gì đã đi qua TRƯỚC đó.\n2. **Trùng lặp thì giữ chỉ số ĐẦU hay CUỐI?** Đề không nói thì bạn phải hỏi. Giữ chỉ số đầu (chỉ ghi khi số chưa có trong dict) cho ra cặp có chỉ số nhỏ hơn — thường là thứ người ta muốn.\n3. **O(1) của dict là TRUNG BÌNH, không phải luôn luôn.** Trường hợp xấu nhất, khi mọi khoá đâm nhau vào cùng một ô băm, tra cứu tụt về O(n). Đời thường không gặp, nhưng nói ra câu này là bạn cho thấy mình hiểu công cụ mình dùng chứ không chỉ thuộc lòng.\n\n**MẪU CHUNG, đáng nhớ hơn chính bài này:** rất nhiều đề "tìm cặp/nhóm thoả điều kiện" đều hạ được một bậc độ phức tạp bằng cùng một câu hỏi — **"tôi có thể NHỚ gì từ những phần tử đã đi qua để khỏi phải quay lại tìm?"**. Nhớ bằng dict (đếm số lần xuất hiện, ghi chỉ số) hoặc bằng set (đã gặp hay chưa). Cái giá luôn là bộ nhớ O(n), và bạn nên nói thẳng cái giá đó ra: người phỏng vấn muốn nghe bạn biết mình đang đánh đổi cái gì lấy cái gì, chứ không muốn nghe "em dùng dict cho nhanh".',
    workedExample: {
      code: `def hai_so_THO(ds, muc_tieu):
    """Cach vet can: thu moi cap. O(n^2)."""
    dem = 0
    for i in range(len(ds)):
        for j in range(i + 1, len(ds)):
            dem += 1
            if ds[i] + ds[j] == muc_tieu:
                return i, j, dem
    return -1, -1, dem


def hai_so(ds, muc_tieu):
    """Mot luot, nho lai bang dict. O(n) thoi gian, O(n) bo nho."""
    da_thay = {}          # gia tri -> chi so DAU tien gap
    dem = 0
    for i, x in enumerate(ds):
        dem += 1
        can = muc_tieu - x
        if can in da_thay:            # HỎI trước...
            return da_thay[can], i, dem
        if x not in da_thay:          # ...rồi mới GHI, và chỉ ghi lần đầu
            da_thay[x] = i
    return -1, -1, dem


ds = [((i * 41) % 97) for i in range(20)]
print("Tho   :", hai_so_THO(ds, 100))
print("Mot luot:", hai_so(ds, 100))

# Vi sao phai HOI truoc khi GHI: muc tieu = 2 * mot phan tu
print("Bay tu khop chinh minh:", hai_so([5, 3, 9], 10))   # khong co cap that`,
      stdinLines: [],
    },
    predict: {
      code: `def hai_so_SAI(ds, muc_tieu):
    da_thay = {}
    for i, x in enumerate(ds):
        da_thay[x] = i               # GHI truoc...
        can = muc_tieu - x
        if can in da_thay:           # ...roi moi HOI
            return da_thay[can], i
    return -1, -1

print(hai_so_SAI([5, 3, 9], 10))`,
      question: 'Không có cặp nào cộng lại bằng 10. Hàm ghi-trước-hỏi-sau trả về gì?',
      choices: ['(0, 0)', '(-1, -1)', '(0, 2)', '(1, 2)'],
      answerIndex: 0,
      explain:
        'Trả về (0, 0) — một "cặp" gồm đúng một phần tử dùng hai lần. Ở bước đầu, x = 5 được ghi vào dict trước, rồi hàm đi tìm số bù 10 - 5 = 5 và tất nhiên tìm thấy: chính nó. Trong khi dãy [5, 3, 9] không có cặp nào bằng 10, đáp án đúng phải là (-1, -1). Cách chữa chỉ là đảo hai dòng: HỎI trước, GHI sau — thứ tự ấy đúng vì bạn chỉ được ghép phần tử hiện tại với những gì đã đi qua TRƯỚC nó. Người phỏng vấn thường đưa sẵn ca mục tiêu bằng hai lần một phần tử để xem bạn có tự phát hiện không.',
    },
    parsons: {
      prompt:
        'Xếp lại lời giải một lượt. Chú ý thứ tự hai câu lệnh cuối — đảo chúng là sinh ra cặp giả.',
      lines: [
        'da_thay = {}',
        'for i, x in enumerate(ds):',
        '    dem += 1',
        '    can = muc_tieu - x',
        '    if can in da_thay:',
        '        return da_thay[can], i, dem',
        '    if x not in da_thay:',
        '        da_thay[x] = i',
        'return -1, -1, dem',
      ],
    },
    make: {
      prompt:
        'Đề phỏng vấn kinh điển: cho một dãy số và một mục tiêu, tìm HAI phần tử KHÁC CHỈ SỐ cộng lại đúng bằng mục tiêu.\n\nViết hai_so(ds, muc_tieu) trả về (i, j, dem):\n- i, j: chỉ số của cặp tìm được, i < j. Không có cặp nào → (-1, -1, dem).\n- Nếu nhiều cặp thoả, trả về cặp mà j nhỏ nhất (tức cặp kết thúc sớm nhất khi duyệt từ trái sang); trong đó i là lần xuất hiện ĐẦU TIÊN của số bù.\n- dem: SỐ PHẦN TỬ đã xét — cộng 1 cho mỗi phần tử bạn duyệt qua. Lời giải một lượt có dem tối đa bằng n; lời giải vét cạn thì không.\n\nChương trình chính đọc 3 dòng input(): n, lech, muc_tieu. Dựng dãy theo công thức rồi in đúng hai dòng:\nds = [((i * 41) % 97) + lech for i in range(n)]\n\nCap tim duoc: <i> <j>        (không có cặp thì in: Cap tim duoc: khong co)\nSo lan xet: <dem>\n\nTrước khi nộp, tự thử với một dãy nhỏ mà mục tiêu bằng đúng hai lần một phần tử — kết quả có phải một cặp CÓ THẬT không?',
      starterCode: `def hai_so(ds, muc_tieu):
    da_thay = {}   # gia tri -> chi so dau tien gap
    dem = 0
    for i, x in enumerate(ds):
        dem += 1
        # HỎI dict trước (số bù đã gặp chưa?), rồi mới GHI số hiện tại vào
        ...
    return -1, -1, dem


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
muc_tieu = int(input("Muc tieu: "))
ds = [((i * 41) % 97) + lech for i in range(n)]
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['20', '0', '100'],
          expected: 'Cap tim duoc: 9 10',
          match: 'contains',
          hidden: false,
          label: '20 phần tử, mục tiêu 100 → cặp chỉ số 9 và 10',
        },
        {
          stdinLines: ['20', '0', '100'],
          expected: 'So lan xet: 11',
          match: 'contains',
          hidden: false,
          label: 'Chỉ xét 11 phần tử rồi dừng — vét cạn phải xét hàng chục cặp',
        },
        {
          stdinLines: ['20', '0', '5000'],
          expected: 'Cap tim duoc: khong co',
          match: 'contains',
          hidden: false,
          label: 'Mục tiêu quá lớn: không cặp nào thoả',
        },
        {
          stdinLines: ['20', '0', '5000'],
          expected: 'So lan xet: 20',
          match: 'contains',
          hidden: false,
          label: 'Không tìm thấy vẫn chỉ MỘT lượt: đúng 20, không phải 190 cặp',
        },
        {
          stdinLines: ['20', '0', '58'],
          expected: 'Cap tim duoc: khong co',
          match: 'contains',
          hidden: false,
          label: 'BẪY: 58 = 29 + 29 nhưng dãy không có số 29 nào — đừng cho phần tử tự khớp',
        },
        {
          stdinLines: ['0', '0', '10'],
          expected: 'So lan xet: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: dãy rỗng → không xét gì, không nổ lỗi',
        },
        {
          stdinLines: ['1', '0', '10'],
          expected: 'Cap tim duoc: khong co',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng một phần tử — một mình nó không thành cặp',
        },
        {
          stdinLines: ['200', '10', '150'],
          expected: 'So lan xet: 9',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy 200 phần tử mà chỉ xét 9 — dừng ngay khi tìm thấy',
        },
        {
          stdinLines: ['5', '0', '82'],
          expected: 'Cap tim duoc: 0 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy ngắn, cặp nằm ở hai đầu',
        },
      ],
      hints: [
        'Câu hỏi mở khoá cả bài: vòng trong của cách vét cạn đang đi tìm cái gì? Nó tìm "số bù" = muc_tieu - x trong đám phần tử bạn ĐÃ ĐI QUA. Đã đi qua thì ghi lại được, khỏi tìm lại.',
        'Dict lưu giá trị → chỉ số: da_thay[x] = i. Rồi mỗi bước chỉ cần hỏi "can in da_thay" — tra dict trung bình O(1), không phụ thuộc dict đang to cỡ nào.',
        'Thứ tự hai dòng cuối là mấu chốt: HỎI (can in da_thay) TRƯỚC, GHI (da_thay[x] = i) SAU. Ghi trước thì ca mục tiêu 58 sẽ cho ra cặp giả gồm một phần tử dùng hai lần.',
        'Chỉ ghi khi số CHƯA có trong dict ("if x not in da_thay") để giữ chỉ số đầu tiên — đề yêu cầu i là lần xuất hiện đầu của số bù.',
        'dem đếm PHẦN TỬ chứ không đếm cặp, và phải cộng ngay đầu mỗi vòng, kể cả vòng tìm thấy rồi return. Ca "So lan xet: 11" nghĩa là bạn dừng đúng lúc, không duyệt nốt cho hết dãy.',
      ],
      sampleSolution: `def hai_so(ds, muc_tieu):
    da_thay = {}          # gia tri -> chi so DAU tien gap
    dem = 0
    for i, x in enumerate(ds):
        dem += 1
        can = muc_tieu - x
        # HỎI trước: số bù đã đi qua chưa? (chỉ ghép với những gì nằm TRƯỚC x)
        if can in da_thay:
            return da_thay[can], i, dem
        # GHI sau, và chỉ ghi lần đầu để giữ chỉ số nhỏ nhất
        if x not in da_thay:
            da_thay[x] = i
    return -1, -1, dem


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
muc_tieu = int(input("Muc tieu: "))
ds = [((i * 41) % 97) + lech for i in range(n)]

i, j, dem = hai_so(ds, muc_tieu)
if i == -1:
    print("Cap tim duoc: khong co")
else:
    print(f"Cap tim duoc: {i} {j}")
print(f"So lan xet: {dem}")`,
    },
    homework:
      'Ba biến thể — đều là câu hỏi tiếp theo người phỏng vấn hay hỏi sau bài gốc.\n\n1. **Đo thật.** Viết bản vét cạn O(n²), cho cả hai chạy trên dãy 5.000 phần tử với mục tiêu không tồn tại (ép chạy hết), đo bằng time.perf_counter(). Con số chênh lệch thuyết phục hơn mọi lời giải thích về big-O.\n\n2. **Ba số cộng lại bằng mục tiêu.** Vét cạn là O(n³). Dùng lại mẹo hôm nay: cố định một số rồi giải bài hai số trên phần còn lại → O(n²). Đây là bài 3Sum nổi tiếng, và nó chỉ là bài hôm nay lồng thêm một vòng.\n\n3. **Trả về MỌI cặp.** Giờ trùng lặp thành vấn đề thật: [3, 3, 4, 4] với mục tiêu 7 có bao nhiêu cặp? Bạn phải hỏi lại: cặp tính theo chỉ số hay theo giá trị? Chính câu hỏi đó là điểm số — nó cho thấy bạn nhận ra chỗ đề chưa nói rõ.',
    srsCards: [
      {
        hoi: 'Mẫu tối ưu hay dùng nhất để hạ O(n²) xuống O(n) trong phỏng vấn là gì?',
        dap: 'Đổi thời gian lấy bộ nhớ: vừa duyệt vừa NHỚ những phần tử đã đi qua vào dict hoặc set, để không phải quay lại tìm chúng. Chi phí O(n²) thường sinh ra đúng từ việc quên rồi tìm lại.',
      },
      {
        hoi: 'Trong bài tìm hai số cộng bằng mục tiêu, vì sao phải HỎI dict trước rồi mới GHI vào?',
        dap: 'Vì ghi trước thì khi mục tiêu bằng đúng hai lần phần tử hiện tại, nó tự khớp với chính mình và trả về một cặp giả gồm cùng một chỉ số. Thứ tự đúng phản ánh luật: chỉ ghép với những gì đã đi qua trước đó.',
      },
      {
        hoi: 'Tra cứu dict là O(1) — câu này thiếu chữ gì quan trọng?',
        dap: 'Thiếu chữ TRUNG BÌNH. Trường hợp xấu nhất, khi mọi khoá đâm nhau vào cùng một ô băm, tra cứu tụt về O(n). Hiếm gặp trong đời thường, nhưng nói ra là cho thấy mình hiểu công cụ chứ không thuộc lòng.',
      },
      {
        hoi: 'Cái giá phải trả khi dùng dict để tăng tốc, và vì sao nên nói ra?',
        dap: 'Cái giá là bộ nhớ O(n). Nên nói thẳng ra vì người phỏng vấn muốn nghe bạn biết mình đang đánh đổi cái gì lấy cái gì, chứ không muốn nghe "em dùng dict cho nhanh".',
      },
    ],
  },
  {
    id: 'p6-u4-l3',
    unitId: 'p6-u4',
    language: 'python',
    title: 'Cửa sổ trượt: hai con trỏ cùng đi tới, và vì sao thế vẫn là một lượt',
    hook: 'Bạn nói với người phỏng vấn "em dùng hai con trỏ, có vòng lặp lồng nhau ở đây". Họ hỏi lại: "vậy độ phức tạp là O(n²)?". Trả lời đúng câu này là qua bài — và nó không phải chuyện đếm số vòng for.',
    theory:
      'Bài trước hạ O(n²) xuống O(n) bằng cách NHỚ. Bài này hạ bằng một mẫu khác, mẫu thứ hai hay ra đề nhất: **cửa sổ trượt (sliding window)** — dùng cho mọi đề dạng "tìm ĐOẠN CON LIÊN TIẾP dài nhất/ngắn nhất thoả điều kiện X".\n\nĐề mẫu hôm nay: cho một chuỗi, tìm độ dài đoạn con LIÊN TIẾP dài nhất mà mọi ký tự đều khác nhau.\n\n**Cách thô:** thử mọi cặp đầu-cuối, mỗi lần kiểm xem đoạn đó có ký tự lặp không. O(n³), tệ nhất trong các cách. Kiểm nhanh hơn một chút bằng set thì còn O(n²).\n\n**Ý TƯỞNG CỬA SỔ TRƯỢT.** Giữ một cửa sổ [trai, phai] luôn luôn HỢP LỆ (không có ký tự lặp). Mỗi bước, mở rộng phai thêm một ký tự. Nếu ký tự mới phá vỡ điều kiện, KÉO trai lên vừa đủ để cửa sổ hợp lệ trở lại. Ghi lại độ dài lớn nhất từng thấy. Cửa sổ chỉ bò từ trái sang phải, không bao giờ lùi.\n\n**VÌ SAO VẪN LÀ O(n) DÙ CÓ HAI CON TRỎ.** Đây chính là câu người phỏng vấn hỏi, và câu trả lời không nằm ở chỗ đếm vòng for. Nó là một lập luận gọi là **khấu hao (amortized)**: biến phai chạy từ 0 tới n đúng một lượt; biến trai cũng chỉ TĂNG, không bao giờ giảm, nên trong suốt cả chương trình nó cũng chỉ nhích tổng cộng nhiều nhất n lần. Tổng công việc là nhiều nhất 2n bước, tức O(n). Có hai vòng lặp lồng nhau trên màn hình không có nghĩa là O(n²) — cái quyết định là TỔNG số bước mà các con trỏ đi được, không phải hình dạng của code.\n\n**KÉO trai LÊN ĐÂU?** Có hai cách, và cách hai là chỗ hay sai:\n- Cách 1: bò từng bước — trong khi còn lặp thì bỏ dần ký tự ở đầu, trai += 1. Dễ đúng, dễ hiểu.\n- Cách 2: nhảy thẳng — nhớ vị trí lần cuối gặp mỗi ký tự trong một dict, gặp lại thì trai nhảy tới ngay sau vị trí đó. Nhanh hơn, nhưng có một bẫy sắc: **chỉ nhảy khi vị trí cũ còn NẰM TRONG cửa sổ hiện tại.** Ký tự lặp nằm ngoài, tức bên trái của trai, thì nó đã bị bỏ ra khỏi cửa sổ rồi — nhảy theo nó là kéo trai LÙI lại, cửa sổ phình ra sai, và kết quả to hơn sự thật. Vế điều kiện "vi_tri[c] >= trai" nhỏ xíu ấy chính là cả bài toán.\n\n**NHẬN DIỆN ĐỀ CỬA SỔ TRƯỢT.** Ba dấu hiệu, thấy đủ hai là gần như chắc:\n1. Đề hỏi về đoạn con LIÊN TIẾP (khác với "dãy con" cho phép bỏ cách quãng — đó là họ đề quy hoạch động, khác hẳn).\n2. Có một điều kiện kiểm được nhanh khi thêm/bớt một phần tử ở hai đầu (đếm ký tự, tổng, số phần tử khác nhau).\n3. Hỏi dài nhất, ngắn nhất, hoặc đếm số đoạn thoả.\n\nBài trước và bài này gộp lại bao phủ một phần rất lớn đề phỏng vấn dạng mảng và chuỗi. Khi bí, hãy tự hỏi đúng hai câu: **"tôi có thể NHỚ gì để khỏi tìm lại?"** và **"tôi có thể giữ một CỬA SỔ hợp lệ rồi trượt nó không?"**.',
    workedExample: {
      code: `def dai_nhat_THO(s):
    """Thu moi doan con roi kiem bang set. O(n^2)."""
    tot = 0
    for i in range(len(s)):
        da_thay = set()
        for j in range(i, len(s)):
            if s[j] in da_thay:
                break
            da_thay.add(s[j])
            tot = max(tot, j - i + 1)
    return tot


def dai_nhat(s):
    """Cua so truot, nhay thang. O(n) — vi trai chi TANG, khong bao gio lui."""
    vi_tri = {}       # ky tu -> vi tri lan cuoi gap
    trai = 0
    tot = 0
    dem = 0
    for phai, c in enumerate(s):
        dem += 1
        # CHI nhay khi cho lap con NAM TRONG cua so — thieu ve nay la keo trai LUI
        if c in vi_tri and vi_tri[c] >= trai:
            trai = vi_tri[c] + 1
        vi_tri[c] = phai
        tot = max(tot, phai - trai + 1)
    return tot, dem


for s in ["akihhikaejcj", "abcabcbb", "bbbb", "abcdef"]:
    print(s, "-> tho:", dai_nhat_THO(s), " cua so truot:", dai_nhat(s))`,
      stdinLines: [],
    },
    predict: {
      code: `def dai_nhat_SAI(s):
    vi_tri = {}
    trai = 0
    tot = 0
    for phai, c in enumerate(s):
        if c in vi_tri:              # THIEU ve "vi_tri[c] >= trai"
            trai = vi_tri[c] + 1
        vi_tri[c] = phai
        tot = max(tot, phai - trai + 1)
    return tot

print(dai_nhat_SAI("akihhikaejcj"))`,
      question: 'Đáp án đúng là 7. Bản thiếu vế kiểm "chỗ lặp còn trong cửa sổ" in ra gì?',
      choices: ['10', '7', '12', '4'],
      answerIndex: 0,
      explain:
        'In ra 10, tức LỚN HƠN đáp án đúng là 7 — hướng sai này rất đáng chú ý: lỗi làm kết quả to lên, không phải nhỏ đi. Khi gặp một ký tự đã xuất hiện ở vị trí nằm BÊN TRÁI của trai, ký tự đó đã ra khỏi cửa sổ từ lâu và không còn gây lặp. Bản sai vẫn nhảy theo vị trí cũ ấy nên trai bị kéo LÙI, cửa sổ phình ra và chứa ký tự lặp thật. Bài học rộng hơn: lỗi làm kết quả to lên thường qua mặt được ca thử nhỏ rồi mới lộ ở dữ liệu thật — muốn bắt nó, ca thử phải có ký tự lặp lại sau khi đã ra khỏi cửa sổ.',
    },
    parsons: {
      prompt:
        'Xếp lại vòng cửa sổ trượt. Chú ý dòng điều kiện có hai vế — vế thứ hai là cả bài toán.',
      lines: [
        'vi_tri = {}',
        'trai = 0',
        'tot = 0',
        'for phai, c in enumerate(s):',
        '    if c in vi_tri and vi_tri[c] >= trai:',
        '        trai = vi_tri[c] + 1',
        '    vi_tri[c] = phai',
        '    tot = max(tot, phai - trai + 1)',
        'return tot',
      ],
    },
    make: {
      prompt:
        'Đề phỏng vấn kinh điển: cho một chuỗi, tìm độ dài đoạn con LIÊN TIẾP dài nhất mà mọi ký tự đều khác nhau.\n\nViết dai_nhat(s) trả về (do_dai, dem):\n- do_dai: độ dài đoạn dài nhất không có ký tự lặp. Chuỗi rỗng → 0.\n- dem: SỐ KÝ TỰ đã xét — cộng 1 cho mỗi ký tự con trỏ phải đi qua. Lời giải cửa sổ trượt có dem đúng bằng độ dài chuỗi; lời giải thử mọi đoạn con thì không.\n\nChương trình chính đọc MỘT dòng input() là n. Dựng chuỗi theo công thức rồi in đúng hai dòng:\ns = "".join(chr(97 + ((i * i * 7 + 3 * i) % 13)) for i in range(n))\n\nDoan dai nhat: <do_dai>\nSo ky tu da xet: <dem>\n\nTrước khi nộp, tự chạy n = 12 và đối chiếu với bản vét cạn tự viết. Nếu số của bạn LỚN HƠN, cửa sổ của bạn đang phình ra — xem lại chỗ kéo trai.',
      starterCode: `def dai_nhat(s):
    vi_tri = {}   # ky tu -> vi tri lan cuoi gap
    trai = 0
    tot = 0
    dem = 0
    for phai, c in enumerate(s):
        dem += 1
        # Kéo trai lên khi gặp lặp — nhưng CHỈ khi chỗ lặp còn nằm trong cửa sổ
        ...
    return tot, dem


n = int(input("Do dai chuoi: "))
s = "".join(chr(97 + ((i * i * 7 + 3 * i) % 13)) for i in range(n))
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['12'],
          expected: 'Doan dai nhat: 7',
          match: 'contains',
          hidden: false,
          label: 'Chuỗi 12 ký tự "akihhikaejcj" → đoạn dài nhất là 7',
        },
        {
          stdinLines: ['12'],
          expected: 'So ky tu da xet: 12',
          match: 'contains',
          hidden: false,
          label: 'Một lượt: số ký tự xét đúng bằng độ dài chuỗi, không phải 78 đoạn con',
        },
        {
          stdinLines: ['20'],
          expected: 'Doan dai nhat: 7',
          match: 'contains',
          hidden: false,
          label: 'BẪY: chuỗi dài hơn, ký tự lặp lại sau khi đã ra khỏi cửa sổ — vẫn phải là 7',
        },
        {
          stdinLines: ['5'],
          expected: 'Doan dai nhat: 4',
          match: 'contains',
          hidden: false,
          label: 'Chuỗi ngắn "akihh": bốn ký tự đầu khác nhau',
        },
        {
          stdinLines: ['0'],
          expected: 'Doan dai nhat: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: chuỗi rỗng → 0, không nổ lỗi',
        },
        {
          stdinLines: ['1'],
          expected: 'Doan dai nhat: 1',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: một ký tự → đoạn dài nhất là chính nó',
        },
        {
          stdinLines: ['40'],
          expected: 'Doan dai nhat: 7',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chuỗi dài, nhiều lần lặp — bản kéo trai lùi sẽ ra 13',
        },
        {
          stdinLines: ['40'],
          expected: 'So ky tu da xet: 40',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: vẫn đúng MỘT lượt ở quy mô lớn hơn',
        },
      ],
      hints: [
        'Giữ hai chỉ số: phai chạy qua từng ký tự bằng vòng for, trai là đầu trái của cửa sổ. Bất biến cần giữ: đoạn s[trai..phai] LUÔN không có ký tự lặp, sau mỗi bước.',
        'Độ dài cửa sổ hiện tại là phai - trai + 1. Chỗ hay lệch một đơn vị: quên cộng 1, cửa sổ một ký tự sẽ ra 0.',
        'Dùng dict ghi vị trí lần cuối gặp mỗi ký tự. Gặp lại thì trai nhảy tới vi_tri[c] + 1 — ngay SAU chỗ lặp cũ, không phải ngay tại nó.',
        'Bẫy chính của cả bài: chỉ nhảy khi "vi_tri[c] >= trai". Chỗ lặp nằm bên trái của trai thì nó đã ra khỏi cửa sổ rồi; nhảy theo nó là kéo trai LÙI và kết quả to hơn sự thật.',
        'Cập nhật vi_tri[c] = phai sau khi đã xét xong, và cập nhật tot bằng max ngay trong vòng lặp — đoạn dài nhất có thể nằm ở giữa chuỗi rồi sau đó cửa sổ co lại.',
      ],
      sampleSolution: `def dai_nhat(s):
    vi_tri = {}       # ky tu -> vi tri lan cuoi gap
    trai = 0
    tot = 0
    dem = 0
    for phai, c in enumerate(s):
        dem += 1
        # CHỈ nhảy khi chỗ lặp còn NẰM TRONG cửa sổ; nếu không, trai bị kéo lùi
        if c in vi_tri and vi_tri[c] >= trai:
            trai = vi_tri[c] + 1
        vi_tri[c] = phai
        tot = max(tot, phai - trai + 1)   # cập nhật NGAY, đỉnh có thể ở giữa chuỗi
    return tot, dem


n = int(input("Do dai chuoi: "))
s = "".join(chr(97 + ((i * i * 7 + 3 * i) % 13)) for i in range(n))

do_dai, dem = dai_nhat(s)
print(f"Doan dai nhat: {do_dai}")
print(f"So ky tu da xet: {dem}")`,
    },
    homework:
      'Ba biến thể để mẫu cửa sổ trượt thành phản xạ, không phải một bài đã giải.\n\n1. **Cửa sổ độ dài CỐ ĐỊNH.** Cho dãy số và số k, tìm tổng lớn nhất của k phần tử liên tiếp. Mẹo: đừng cộng lại cả cửa sổ mỗi bước — trượt thì cộng phần tử vào bên phải, trừ phần tử rời ra bên trái. Đó là khác nhau giữa O(n·k) và O(n).\n\n2. **Cửa sổ NGẮN NHẤT.** Cho dãy số dương và một mục tiêu, tìm đoạn con liên tiếp ngắn nhất có tổng ≥ mục tiêu. Khuôn đảo lại: mở rộng phải tới khi thoả, rồi CO trái chừng nào còn thoả. Nhận ra hai khuôn này là giải được phần lớn đề dạng đó.\n\n3. **Tập lập luận khấu hao.** Với mỗi bài trên, viết ra giấy vì sao nó là O(n) dù có hai vòng lồng nhau, rồi tập nói to trong 30 giây — đây đúng là câu hỏi ngay sau khi bạn viết xong code.',
    srsCards: [
      {
        hoi: 'Mẫu cửa sổ trượt dùng cho loại đề nào?',
        dap: 'Đề tìm đoạn con LIÊN TIẾP dài nhất/ngắn nhất thoả một điều kiện kiểm được nhanh khi thêm hoặc bớt một phần tử ở hai đầu. Khác đề "dãy con" cho phép bỏ cách quãng — đó là họ quy hoạch động.',
      },
      {
        hoi: 'Vì sao cửa sổ trượt vẫn là O(n) dù nhìn thấy hai vòng lặp lồng nhau?',
        dap: 'Vì lập luận khấu hao: con trỏ phải chạy hết n lần, con trỏ trái chỉ TĂNG nên tổng cộng cũng nhích nhiều nhất n lần — tổng công việc tối đa 2n. Quyết định độ phức tạp là tổng số bước con trỏ đi, không phải hình dạng code.',
      },
      {
        hoi: 'Khi nhảy con trỏ trái tới sau vị trí lặp cũ, phải kiểm thêm điều kiện gì?',
        dap: 'Phải kiểm vị trí cũ còn NẰM TRONG cửa sổ hiện tại (vi_tri[c] >= trai). Chỗ lặp nằm bên trái của trai đã ra khỏi cửa sổ rồi; nhảy theo nó là kéo trai lùi và cửa sổ phình ra sai.',
      },
      {
        hoi: 'Hai câu hỏi tự đặt khi bí trước một đề phỏng vấn về mảng hoặc chuỗi là gì?',
        dap: 'Một: tôi có thể NHỚ gì từ các phần tử đã đi qua để khỏi quay lại tìm (dict/set)? Hai: tôi có thể giữ một CỬA SỔ hợp lệ rồi trượt nó không? Hai mẫu này phủ phần rất lớn đề dạng mảng và chuỗi.',
      },
    ],
  },
]
