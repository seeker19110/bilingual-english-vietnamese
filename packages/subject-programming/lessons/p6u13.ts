// lessons/p6u13.ts — Bài học P6-U13: PARADIGM F — LẬP TRÌNH HÀM (PR-M10).
//
// Trụ thứ nhất trong ba trụ paradigm của chương trình M (hiến chương §5, bảng ba trụ F/C/S).
// Dạy cái gì: bất biến · hàm thuần · hàm bậc cao · map/filter/reduce · TÁCH HIỆU ỨNG PHỤ RA
// KHỎI LÕI THUẦN. Dự án lồng trong bài (§7): refactor một đoạn code có hiệu ứng phụ thành
// "lõi thuần + vỏ hiệu ứng".
//
// NGÔN NGỮ: Python — tầng 3 KHÔNG thêm ngôn ngữ mới (hiến chương §5), dạy bằng bộ chạy đã có.
// Nhờ vậy mọi bài ở đây đi qua `lessonsPython.test.ts`, cổng nội dung mạnh nhất của môn: nó
// chạy python3 THẬT và chấm cả sampleSolution, workedExample lẫn đáp án predict.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U13_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u13-l1',
    unitId: 'p6-u13',
    language: 'python',
    title: 'Hàm thuần và bất biến — vì sao thứ này dễ test đến thế',
    hook: 'Bạn có hai hàm cùng tính tiền đơn hàng. Một hàm test được trong ba dòng; hàm kia phải dựng cơ sở dữ liệu, giả lập đồng hồ, rồi vẫn thỉnh thoảng đỏ. Khác biệt không nằm ở độ khó của phép tính — nó nằm ở chỗ hàm thứ hai có nói chuyện với thế giới bên ngoài.',
    theory:
      'HÀM THUẦN — định nghĩa gọn trong hai gạch đầu dòng:\n\n1. Cùng đầu vào thì LUÔN cho cùng đầu ra.\n2. Không làm gì khác ngoài trả về giá trị — không in, không ghi file, không gọi mạng, không sửa biến bên ngoài.\n\n    def thanh_tien(so_luong, don_gia):   # THUẦN\n        return so_luong * don_gia\n\n    tong = 0\n    def cong_don(x):                     # KHÔNG thuần: sửa biến ngoài\n        global tong\n        tong += x\n\nVÌ SAO ĐÁNG QUAN TÂM: hàm thuần test được bằng một dòng `assert`, không cần dựng gì cả. Nó cũng chạy lại được bao nhiêu lần tuỳ thích, đổi thứ tự gọi cũng không sao, và đọc nó bạn chỉ cần nhìn chính nó — không phải đi tìm xem còn ai đang sửa cái gì ở đâu.\n\nBA THỨ LÀM HÀM MẤT "THUẦN" (nhận diện nhanh): đọc/ghi thế giới ngoài (file, mạng, màn hình, CSDL) · đọc thứ thay đổi theo thời gian (`datetime.now()`, `random`) · sửa dữ liệu mà người khác cũng đang giữ.\n\nBẤT BIẾN — đừng sửa, hãy tạo bản mới:\n    def them_thue(gia_list):\n        return [g * 1.1 for g in gia_list]   # danh sách MỚI, bản gốc còn nguyên\n\nSo với cách sửa tại chỗ (`gia_list[i] = ...`), cách trên tốn thêm bộ nhớ nhưng đổi lại: người gọi không bao giờ bị bất ngờ vì dữ liệu của họ đổi sau lưng. Đây đúng là thứ `copy()` của Kotlin làm ở track trước — cùng một ý tưởng, khác cú pháp.\n\nBA HÀM BẬC CAO phải thuộc. "Bậc cao" nghĩa là hàm NHẬN một hàm khác làm tham số:\n    map    — biến mỗi phần tử thành thứ khác\n    filter — giữ lại phần tử thoả điều kiện\n    reduce — gộp cả danh sách thành MỘT giá trị\n\n    from functools import reduce\n    gia = [10, 20, 30]\n    print(list(map(lambda g: g * 2, gia)))        # [20, 40, 60]\n    print(list(filter(lambda g: g > 15, gia)))    # [20, 30]\n    print(reduce(lambda a, b: a + b, gia, 0))     # 60\n\nTrong Python, `map`/`filter` trả về thứ LƯỜI (lazy) — nó chưa tính gì cho tới khi bạn duyệt, nên phải bọc `list(...)` mới thấy kết quả. Lười không phải là hạn chế: nó cho phép xử lý dữ liệu lớn hơn bộ nhớ, vì chỉ sinh ra từng phần tử khi cần.\n\nMỘT LƯU Ý THẬT LÒNG: người Python thường viết `[g * 2 for g in gia]` thay cho `map`, và đó là lối viết được ưa chuộng hơn trong cộng đồng này. Bài vẫn dạy `map/filter/reduce` vì ba cái tên đó là ngôn ngữ CHUNG của mọi ngôn ngữ hiện đại — bạn sẽ gặp lại chúng nguyên vẹn trong JavaScript, Kotlin, Swift, SQL. Hiểu ý niệm rồi thì viết bằng cú pháp nào cũng được.',
    workedExample: {
      code: `from functools import reduce

# THUẦN: cùng đầu vào luôn cùng đầu ra, không đụng gì bên ngoài
def thanh_tien(so_luong, don_gia):
    return so_luong * don_gia

# Bất biến: trả về danh sách MỚI, không sửa bản gốc
def them_thue(gia_list, ty_le=0.1):
    return [round(g * (1 + ty_le)) for g in gia_list]

gia_goc = [10000, 20000, 30000]
gia_moi = them_thue(gia_goc)
print(gia_goc)   # bản gốc còn nguyên — người gọi không bị bất ngờ
print(gia_moi)

# Ba hàm bậc cao: nhận một hàm làm tham số
print(list(map(lambda g: g * 2, gia_goc)))
print(list(filter(lambda g: g > 15000, gia_goc)))
print(reduce(lambda a, b: a + b, gia_goc, 0))

# Hàm thuần test được bằng đúng một dòng, không cần dựng gì
assert thanh_tien(3, 5000) == 15000
print("thanh_tien: dat")`,
      stdinLines: [],
    },
    predict: {
      code: `def them_mot(ds):
    ds.append(1)
    return ds

goc = [0]
moi = them_mot(goc)
print(goc, goc is moi)`,
      question: 'Đoạn này in ra gì?',
      choices: ['[0, 1] True', '[0] False', '[0, 1] False', '[0] True'],
      answerIndex: 0,
      explain:
        'Hàm này KHÔNG thuần: nó sửa chính danh sách được truyền vào (append sửa tại chỗ) rồi trả lại đúng danh sách đó. Nên `goc` bị đổi thành [0, 1], và `goc is moi` là True vì hai tên đang trỏ cùng MỘT vật. Đây là kiểu lỗi khó tìm nhất: người gọi tưởng dữ liệu của mình còn nguyên. Bản thuần sẽ là `return ds + [1]` — tạo danh sách mới.',
    },
    parsons: {
      prompt: 'Xếp các dòng: một hàm thuần tính tổng tiền, rồi tự kiểm bằng assert.',
      lines: [
        'def tong_tien(gia_list):',
        '    return sum(gia_list)',
        'assert tong_tien([1000, 2000]) == 3000',
        'print(tong_tien([1000, 2000, 3000]))',
      ],
    },
    make: {
      prompt:
        'Viết ba hàm THUẦN cho giỏ hàng — không hàm nào được `print`, sửa biến ngoài, hay đổi danh sách truyền vào.\n\n1. `thanh_tien(so_luong, don_gia)` → trả về tích hai số.\n2. `giam_gia(gia_list, ty_le)` → trả về danh sách MỚI, mỗi giá đã trừ đi `ty_le` phần (0.1 = giảm 10%), làm tròn bằng `round`.\n3. `tong(gia_list)` → trả về tổng danh sách.\n\nSau đó, ở phần chạy chính, với `gio = [10000, 20000, 30000]` in đúng ba dòng:\nThanh tien: 15000\nSau giam: [9000, 18000, 27000]\nGoc con nguyen: [10000, 20000, 30000]\n\n(Dòng 1 dùng `thanh_tien(3, 5000)`. Dòng 3 in lại `gio` để CHỨNG MINH hàm giảm giá không sửa bản gốc.)',
      starterCode: `def thanh_tien(so_luong, don_gia):
    ...

def giam_gia(gia_list, ty_le):
    ...

def tong(gia_list):
    ...

gio = [10000, 20000, 30000]
# in 3 dong theo de
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Thanh tien: 15000',
          match: 'contains',
          hidden: false,
          label: '3 × 5000',
        },
        {
          stdinLines: [],
          expected: 'Sau giam: [9000, 18000, 27000]',
          match: 'contains',
          hidden: false,
          label: 'giảm 10%, danh sách mới',
        },
        {
          stdinLines: [],
          expected: 'Goc con nguyen: [10000, 20000, 30000]',
          match: 'contains',
          hidden: false,
          label: 'bản gốc KHÔNG bị sửa',
        },
      ],
      hints: [
        'Hàm thuần chỉ `return`, không `print`. Phần in nằm ngoài hàm — đó chính là ranh giới lõi thuần / vỏ hiệu ứng của bài sau.',
        'Tạo danh sách mới bằng list comprehension: `[round(g * (1 - ty_le)) for g in gia_list]`. Đừng gán vào `gia_list[i]` — đó là sửa tại chỗ.',
        'Giảm 10% nghĩa là nhân với (1 - 0.1) = 0.9, không phải trừ đi 0.1.',
        '`tong` viết gọn bằng `sum(gia_list)` có sẵn của Python.',
      ],
      sampleSolution: `def thanh_tien(so_luong, don_gia):
    return so_luong * don_gia


def giam_gia(gia_list, ty_le):
    return [round(g * (1 - ty_le)) for g in gia_list]


def tong(gia_list):
    return sum(gia_list)


gio = [10000, 20000, 30000]
print("Thanh tien:", thanh_tien(3, 5000))
print("Sau giam:", giam_gia(gio, 0.1))
print("Goc con nguyen:", gio)`,
    },
    homework:
      'Mở một file code bạn từng viết (bất kỳ ngôn ngữ nào) và chấm điểm từng hàm theo hai tiêu chí của hàm thuần. Với mỗi hàm KHÔNG thuần, ghi lại nó mất "thuần" vì lý do nào trong ba lý do đã học: đụng thế giới ngoài, đọc thứ đổi theo thời gian, hay sửa dữ liệu của người khác. Đừng vội sửa — chỉ đếm. Gần như chắc chắn bạn sẽ thấy hiệu ứng phụ nằm rải rác khắp nơi thay vì gom lại một chỗ, và đó chính là vấn đề bài sau sẽ giải.',
    srsCards: [
      {
        hoi: 'Hai điều kiện để một hàm là hàm thuần?',
        dap: 'Cùng đầu vào luôn cho cùng đầu ra; và không làm gì ngoài trả về giá trị — không in, không ghi file, không gọi mạng, không sửa biến ngoài.',
      },
      {
        hoi: 'Ba lý do phổ biến làm một hàm mất tính thuần?',
        dap: 'Đụng thế giới ngoài (file/mạng/màn hình/CSDL); đọc thứ đổi theo thời gian (now, random); sửa dữ liệu mà người gọi cũng đang giữ.',
      },
      {
        hoi: 'Vì sao `map` và `filter` trong Python phải bọc `list(...)` mới thấy kết quả?',
        dap: 'Vì chúng trả về thứ LƯỜI — chưa tính gì cho tới khi được duyệt. Nhờ lười mà xử lý được dữ liệu lớn hơn bộ nhớ, chỉ sinh từng phần tử khi cần.',
      },
      {
        hoi: 'Bất biến trong thực hành nghĩa là làm gì?',
        dap: 'Không sửa dữ liệu tại chỗ mà trả về BẢN MỚI. Tốn bộ nhớ hơn, đổi lại người gọi không bao giờ bị dữ liệu đổi sau lưng.',
      },
    ],
  },
  {
    id: 'p6-u13-l2',
    unitId: 'p6-u13',
    language: 'python',
    title: 'Lõi thuần + vỏ hiệu ứng — kiến trúc dễ test nhất tồn tại',
    hook: 'Đoạn code đọc dữ liệu, tính toán rồi in ra — ba việc quấn vào nhau trong một hàm. Muốn test phép tính, bạn phải giả lập cả đầu vào lẫn màn hình. Bài này tách nó ra, và bạn sẽ thấy phần đáng test bỗng test được bằng một dòng assert.',
    theory:
      'MỘT CÂU LÀ HẾT Ý: **đẩy hiệu ứng phụ ra RÌA, giữ giữa là hàm thuần.**\n\n    ┌─────────────────────────────────────┐\n    │  VỎ HIỆU ỨNG  (đọc, in, ghi file)   │  ← mỏng, gần như không có logic\n    │   ┌─────────────────────────────┐   │\n    │   │  LÕI THUẦN                  │   │  ← dày, chứa toàn bộ quyết định\n    │   │  dữ liệu vào → dữ liệu ra   │   │\n    │   └─────────────────────────────┘   │\n    └─────────────────────────────────────┘\n\nBa bước làm, áp được cho bất cứ đoạn code nào:\n\n① **ĐỌC vào trước.** Gom hết việc lấy dữ liệu lên đầu.\n② **TÍNH ở giữa, bằng hàm thuần.** Nhận dữ liệu, trả dữ liệu. Không in, không đọc.\n③ **GHI ra sau.** In hoặc lưu kết quả.\n\nTRƯỚC — ba việc quấn vào nhau, không test nổi phép tính:\n    def xu_ly():\n        n = int(input())\n        tong = 0\n        for _ in range(n):\n            gia = int(input())\n            if gia > 10000:\n                tong += gia\n                print("nhan:", gia)     # in nằm GIỮA vòng tính\n        print("tong:", tong)\n\nSAU — lõi thuần tách hẳn ra:\n    def loc_va_tong(gia_list, nguong):        # THUẦN\n        nhan = [g for g in gia_list if g > nguong]\n        return nhan, sum(nhan)\n\n    def main():                                # VỎ\n        n = int(input())\n        gia_list = [int(input()) for _ in range(n)]\n        nhan, tong = loc_va_tong(gia_list, 10000)\n        for g in nhan:\n            print("nhan:", g)\n        print("tong:", tong)\n\nĐƯỢC GÌ, cụ thể chứ không chung chung:\n\n- **Test được bằng một dòng:** `assert loc_va_tong([5000, 20000], 10000) == ([20000], 20000)`. Không cần giả lập bàn phím, không cần bắt màn hình.\n- **Ca biên thử được dễ dàng:** danh sách rỗng, toàn số nhỏ, số âm — mỗi ca một dòng assert.\n- **Đổi vỏ mà không đụng lõi:** mai này đọc từ file, từ mạng, hay từ giao diện web thì chỉ `main` đổi. Toàn bộ quyết định nghiệp vụ nằm nguyên.\n- **Đọc dễ hơn:** nhìn tên hàm là biết nó tính gì, không phải lần theo xem giữa chừng nó còn in cái gì.\n\nĐÂY KHÔNG PHẢI Ý TƯỞNG XA LẠ. Bạn vừa làm đúng nó ở track Kotlin: `dungTrangThai` là lõi thuần, `println`/giao diện là vỏ. Cùng một kiến trúc, và nó có nhiều tên trong nghề — "functional core, imperative shell", "hexagonal", "ports and adapters". Tên khác nhau, ý một: **quyết định ở giữa, giao tiếp ở rìa.**\n\nMỘT CẢNH BÁO ĐỂ KHỎI LÀM QUÁ: đừng cố biến MỌI thứ thành thuần. Chương trình nào rồi cũng phải in ra màn hình, ghi vào cơ sở dữ liệu — hiệu ứng phụ chính là lý do phần mềm tồn tại. Mục tiêu không phải xoá chúng, mà là **gom chúng lại một chỗ mỏng và dễ nhìn**, thay vì rải khắp nơi.',
    workedExample: {
      code: `# ── LÕI THUẦN: dữ liệu vào, dữ liệu ra. Không đọc, không in. ────────────
def loc_va_tong(gia_list, nguong):
    nhan = [g for g in gia_list if g > nguong]
    return nhan, sum(nhan)


def xep_hang(tong):
    if tong >= 50000:
        return "lon"
    if tong >= 20000:
        return "vua"
    return "nho"


# ── VỎ HIỆU ỨNG: mỏng, chỉ đọc và in, không chứa quyết định nào ─────────
def main():
    gia_list = [5000, 20000, 30000, 8000]
    nhan, tong = loc_va_tong(gia_list, 10000)
    for g in nhan:
        print("nhan:", g)
    print("tong:", tong)
    print("hang:", xep_hang(tong))


# Lõi thuần test được bằng assert, không cần bàn phím cũng không cần màn hình
assert loc_va_tong([5000, 20000], 10000) == ([20000], 20000)
assert loc_va_tong([], 10000) == ([], 0)          # ca biên: danh sách rỗng
assert xep_hang(0) == "nho"
print("tu kiem: dat het")

main()`,
      stdinLines: [],
    },
    predict: {
      code: `def cong_thue(gia_list):
    for i in range(len(gia_list)):
        gia_list[i] = gia_list[i] * 2
    return gia_list

goc = [100, 200]
ket_qua = cong_thue(goc)
print(ket_qua, goc)`,
      question: 'Đoạn này in ra gì?',
      choices: [
        '[200, 400] [200, 400]',
        '[200, 400] [100, 200]',
        '[100, 200] [100, 200]',
        'Bao loi vi sua danh sach khi dang duyet',
      ],
      answerIndex: 0,
      explain:
        'Hàm sửa TẠI CHỖ (`gia_list[i] = ...`) nên bản gốc `goc` cũng đổi theo — hai tên đang trỏ cùng một danh sách. Người gọi tưởng mình còn giữ dữ liệu cũ, và đó là loại lỗi rất khó lần ra. Bản thuần là `return [g * 2 for g in gia_list]`: tạo danh sách mới, `goc` giữ nguyên [100, 200].',
    },
    parsons: {
      prompt: 'Xếp các dòng: tách lõi thuần ra khỏi vỏ, rồi tự kiểm lõi bằng assert.',
      lines: [
        'def loc_lon(gia_list, nguong):',
        '    return [g for g in gia_list if g > nguong]',
        'assert loc_lon([5, 20], 10) == [20]',
        'def main():',
        '    print(loc_lon([5, 20, 30], 10))',
        'main()',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN CỦA UNIT — tách một đoạn code có hiệu ứng phụ thành lõi thuần + vỏ hiệu ứng.\n\nChương trình đọc từ bàn phím: dòng đầu là số lượng đơn `n`, rồi `n` dòng mỗi dòng một số tiền.\n\n1. Viết **lõi thuần** `thong_ke(don_list)` nhận danh sách số tiền, trả về một tuple ba phần:\n   `(so_don, tong, trung_binh)` — `trung_binh` làm tròn bằng `round`, danh sách RỖNG thì trả `(0, 0, 0)`.\n   Hàm này KHÔNG được `input` hay `print`.\n\n2. Viết **vỏ** `main()` đọc dữ liệu, gọi lõi, rồi in đúng ba dòng:\nSo don: 3\nTong: 60000\nTrung binh: 20000\n\n3. Trước khi gọi `main()`, tự kiểm lõi bằng đúng hai dòng assert (ca thường và ca biên rỗng).\n\nVới đầu vào 3 / 10000 / 20000 / 30000 thì kết quả đúng như mẫu trên.',
      starterCode: `def thong_ke(don_list):
    # LOI THUAN: khong input, khong print
    ...


def main():
    # VO: doc du lieu, goi loi, in ket qua
    n = int(input())
    ...


assert ...
assert ...
main()
`,
      testCases: [
        {
          stdinLines: ['3', '10000', '20000', '30000'],
          expected: 'So don: 3',
          match: 'contains',
          hidden: false,
          label: '3 đơn',
        },
        {
          stdinLines: ['3', '10000', '20000', '30000'],
          expected: 'Tong: 60000',
          match: 'contains',
          hidden: false,
          label: 'tổng ba đơn',
        },
        {
          stdinLines: ['3', '10000', '20000', '30000'],
          expected: 'Trung binh: 20000',
          match: 'contains',
          hidden: false,
          label: 'trung bình làm tròn',
        },
        {
          stdinLines: ['1', '7000'],
          expected: 'Trung binh: 7000',
          match: 'contains',
          hidden: false,
          label: 'một đơn — trung bình bằng chính nó',
        },
      ],
      hints: [
        'Lõi thuần nhận DANH SÁCH đã đọc sẵn, không tự đọc. Việc đọc là của vỏ: `don_list = [int(input()) for _ in range(n)]`.',
        'Ca biên rỗng phải xử lý TRƯỚC, nếu không phép chia trung bình sẽ lỗi chia cho 0: `if not don_list: return (0, 0, 0)`.',
        'Trả về nhiều giá trị bằng tuple: `return (len(don_list), tong, round(tong / len(don_list)))`.',
        'Hai dòng assert gợi ý: `assert thong_ke([10000, 20000]) == (2, 30000, 15000)` và `assert thong_ke([]) == (0, 0, 0)`.',
      ],
      sampleSolution: `def thong_ke(don_list):
    if not don_list:
        return (0, 0, 0)
    tong = sum(don_list)
    return (len(don_list), tong, round(tong / len(don_list)))


def main():
    n = int(input())
    don_list = [int(input()) for _ in range(n)]
    so_don, tong, trung_binh = thong_ke(don_list)
    print("So don:", so_don)
    print("Tong:", tong)
    print("Trung binh:", trung_binh)


assert thong_ke([10000, 20000]) == (2, 30000, 15000)
assert thong_ke([]) == (0, 0, 0)
main()`,
    },
    homework:
      'Quay lại file code bạn đã chấm điểm ở bài trước. Chọn MỘT hàm không thuần và tách nó theo ba bước: đọc lên đầu, tính ở giữa bằng hàm thuần, ghi ở cuối. Rồi viết ít nhất hai dòng assert cho phần lõi — một ca thường, một ca biên. Nếu viết assert thấy khó, gần như chắc chắn phần tách chưa xong: lõi vẫn còn dính hiệu ứng phụ ở đâu đó. Đó là phép thử tốt nhất, và nó miễn phí.',
    srsCards: [
      {
        hoi: 'Kiến trúc "lõi thuần + vỏ hiệu ứng" nói gì trong một câu?',
        dap: 'Đẩy hiệu ứng phụ ra RÌA, giữ ở giữa là hàm thuần: đọc vào trước, tính ở giữa bằng hàm thuần, ghi ra sau. Quyết định ở giữa, giao tiếp ở rìa.',
      },
      {
        hoi: 'Lợi ích cụ thể nhất của việc tách lõi thuần là gì?',
        dap: 'Phần đáng test test được bằng một dòng assert — không cần giả lập bàn phím, màn hình hay cơ sở dữ liệu. Ca biên cũng thử được mỗi ca một dòng.',
      },
      {
        hoi: 'Có nên cố biến mọi hàm thành hàm thuần không?',
        dap: 'Không. Hiệu ứng phụ chính là lý do phần mềm tồn tại (phải in, phải lưu). Mục tiêu là GOM chúng vào một chỗ mỏng dễ nhìn, không phải xoá chúng.',
      },
      {
        hoi: 'Phép thử nhanh xem đã tách lõi xong chưa?',
        dap: 'Thử viết assert cho lõi. Viết thấy khó thì lõi vẫn còn dính hiệu ứng phụ — chưa tách xong.',
      },
    ],
  },
]
