// lessons/p4u4.ts — Bài học P4-U4: LỖI NGHIỆP VỤ & LOGGING (exception tự định nghĩa).
// Làn A (chạy thật trong sandbox) — hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
// Lưu ý kỹ thuật: logging mặc định ghi ra stderr; bài học luôn cấu hình stream=sys.stdout để
// học viên thấy log ngay trong khung kết quả của sandbox (và để cổng CI chấm được).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u4-l1',
    unitId: 'p4-u4',
    language: 'python',
    title: 'Lỗi nghiệp vụ tự định nghĩa và nhật ký chạy (logging)',
    hook: 'Bán 8 ly trà đá trong khi kho chỉ còn 5 — chương trình của bạn hiện vẫn vui vẻ trừ xuống âm 3. Nó không "hỏng", nó chỉ sai lặng lẽ, và ba tuần sau bạn mới phát hiện khi kiểm kho. Loại sai đó phải được ném ra ngay chỗ nó xảy ra.',
    theory:
      'Có hai loại lỗi. Lỗi KỸ THUẬT (ValueError, ZeroDivisionError) do Python ném. Lỗi NGHIỆP VỤ là quy tắc của riêng cửa hàng bạn: không bán quá tồn kho, không nhận số lượng âm. Python không biết những quy tắc đó — bạn phải tự định nghĩa.\n\nclass KhoKhongDu(Exception):\n    pass\n\nMột dòng đó là đủ để có kiểu lỗi riêng. Ném nó ra bằng raise, kèm thông điệp cho người đọc:\n\n    raise KhoKhongDu(f"Kho chi con {ton}, khong du {mua}")\n\nBắt đúng loại mình quan tâm:\n\n    try:\n        ban(ton, mua)\n    except KhoKhongDu as e:\n        print(f"Loi: {e}")\n\nVì sao phải tự định nghĩa thay vì raise Exception chung: nơi gọi mới chọn lọc được. except KhoKhongDu chỉ bắt đúng chuyện hết hàng, còn một lỗi lập trình thật sự vẫn nổ lên cho bạn thấy. Bắt Exception trống là cách chôn lỗi hiệu quả nhất.\n\nLuật kèm: đừng dùng exception cho luồng bình thường. "Khách nhập sai số lượng" là chuyện xảy ra hằng ngày, kiểm bằng if là đủ; exception dành cho tình huống hàm KHÔNG thể hoàn thành việc của nó.\n\nLOGGING là nhật ký chạy — thứ bạn đọc khi sự cố đã xảy ra rồi và không dựng lại được hiện trường. Khác print ở ba điểm: có MỨC ĐỘ (info/warning/error) để lọc, có mốc thời gian, và tắt bật được mà không phải xoá từng dòng code. Quy tắc thực dụng: print là nói với NGƯỜI DÙNG, log là ghi cho CHÍNH BẠN đọc lúc đi tìm nguyên nhân.',
    workedExample: {
      code: `import logging, sys

# Cấu hình một lần ở đầu chương trình. stream=sys.stdout để log hiện ngay trong khung kết quả.
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s", stream=sys.stdout)

class KhoKhongDu(Exception):     # lỗi NGHIỆP VỤ của riêng cửa hàng
    pass

def ban(ton, mua):
    if mua > ton:
        # ném ra ngay chỗ phát hiện, kèm đủ số liệu để người đọc hiểu chuyện gì
        raise KhoKhongDu(f"Kho chi con {ton}, khong du {mua}")
    logging.info(f"Ban {mua}, con lai {ton - mua}")   # nhật ký cho chính mình
    return ton - mua

logging.info("Bat dau ca ban hang")

con_lai = ban(10, 3)          # hợp lệ
print(f"Con lai: {con_lai}")

try:
    ban(5, 8)                 # vượt tồn kho -> ném KhoKhongDu
except KhoKhongDu as e:
    logging.warning(f"Tu choi don hang: {e}")   # ghi lại cho người quản lý
    print(f"Loi: {e}")                          # và báo cho người đang đứng quầy`,
      stdinLines: [],
    },
    predict: {
      code: `class LoiRieng(Exception):\n    pass\n\ndef f():\n    try:\n        raise LoiRieng("A")\n    except ValueError:\n        print("bat ValueError")\n    finally:\n        print("don dep")\n\ntry:\n    f()\nexcept LoiRieng as e:\n    print(f"ngoai bat: {e}")`,
      question: 'Chạy đoạn code này, máy in ra gì (theo đúng thứ tự)?',
      choices: [
        'bat ValueError\ndon dep',
        'don dep\nngoai bat: A',
        'ngoai bat: A\ndon dep',
        'Chuong trinh dung han vi khong ai bat loi',
      ],
      answerIndex: 1,
      explain:
        'except ValueError không bắt được LoiRieng nên lỗi tiếp tục bay lên. Nhưng finally luôn chạy TRƯỚC khi lỗi rời khỏi hàm, nên "don dep" in ra trước, rồi except ở ngoài mới bắt được và in "ngoai bat: A".',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau: định nghĩa lỗi nghiệp vụ KhoKhongDu, hàm ban() ném lỗi khi mua quá tồn, và chỗ gọi bắt lỗi rồi in ra.',
      lines: [
        'class KhoKhongDu(Exception):',
        '    pass',
        'def ban(ton, mua):',
        '    if mua > ton:',
        '        raise KhoKhongDu(f"Kho chi con {ton}, khong du {mua}")',
        '    return ton - mua',
        'try:',
        '    print(ban(5, 8))',
        'except KhoKhongDu as e:',
        '    print(f"Loi: {e}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình bán hàng có lỗi nghiệp vụ riêng:\n1. Định nghĩa class KhoKhongDu kế thừa Exception.\n2. Viết hàm ban(ton, mua): nếu mua > ton thì raise KhoKhongDu với thông điệp ĐÚNG dạng "Kho chi con <ton>, khong du <mua>"; ngược lại trả về số còn lại.\n3. Đọc 2 dòng input(): dòng 1 là tồn kho, dòng 2 là số lượng khách mua (đều là số nguyên).\n4. Gọi ban() trong try/except:\n   - Thành công → in "Da ban <mua>, con lai <con_lai>".\n   - Gặp KhoKhongDu → in "Loi: <thong diep cua loi>".\n\nVí dụ: tồn 5, mua 8 → in "Loi: Kho chi con 5, khong du 8".',
      starterCode: `# 1. Định nghĩa lỗi nghiệp vụ KhoKhongDu\n\n# 2. Hàm ban(ton, mua): raise khi không đủ, còn lại trả về số tồn mới\n\nton = int(input("Ton kho: "))\nmua = int(input("Khach mua: "))\n\n# 3. Gọi ban() trong try/except và in đúng một dòng kết quả\n`,
      testCases: [
        {
          stdinLines: ['10', '3'],
          expected: 'Da ban 3, con lai 7',
          match: 'contains',
          hidden: false,
          label: 'Tồn 10, mua 3 → bán được, còn 7',
        },
        {
          stdinLines: ['5', '8'],
          expected: 'Loi: Kho chi con 5, khong du 8',
          match: 'contains',
          hidden: false,
          label: 'Tồn 5, mua 8 → ném lỗi nghiệp vụ, chương trình KHÔNG được vỡ',
        },
        {
          stdinLines: ['4', '4'],
          expected: 'Da ban 4, con lai 0',
          match: 'contains',
          hidden: false,
          label: 'RANH GIỚI: mua đúng bằng tồn → vẫn bán được, còn 0',
        },
        {
          stdinLines: ['0', '1'],
          expected: 'Loi: Kho chi con 0, khong du 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kho rỗng, mua 1 ly',
        },
      ],
      hints: [
        'Định nghĩa một loại lỗi mới chỉ cần hai dòng: class KhoKhongDu(Exception): rồi pass.',
        'Ranh giới ở đây là "mua > ton" mới lỗi, KHÔNG phải ">=": ca tồn 4 mua 4 trong danh sách test chính là để bắt lỗi này.',
        'Thông điệp lỗi bạn đặt trong raise chính là thứ f"{e}" in ra ở except — nên nó phải khớp từng chữ với mẫu đề bài.',
        'Khung tham chiếu:\n\nclass KhoKhongDu(Exception):\n    pass\n\ndef ban(ton, mua):\n    if mua > ton:\n        raise KhoKhongDu(f"Kho chi con {ton}, khong du {mua}")\n    return ton - mua\n\ntry:\n    con_lai = ban(ton, mua)\n    print(f"Da ban {mua}, con lai {con_lai}")\nexcept KhoKhongDu as e:\n    print(f"Loi: {e}")',
      ],
      sampleSolution: `class KhoKhongDu(Exception):
    pass

def ban(ton, mua):
    if mua > ton:                                            # chỉ VƯỢT tồn mới là lỗi
        raise KhoKhongDu(f"Kho chi con {ton}, khong du {mua}")
    return ton - mua

ton = int(input("Ton kho: "))
mua = int(input("Khach mua: "))

try:
    con_lai = ban(ton, mua)
    print(f"Da ban {mua}, con lai {con_lai}")
except KhoKhongDu as e:
    print(f"Loi: {e}")`,
    },
    homework:
      'Trong dự án quán của bạn, tìm MỘT quy tắc kinh doanh đang bị bỏ qua lặng lẽ (bán quá tồn, giảm giá âm, nhập số lượng 0...). Định nghĩa một lớp lỗi riêng cho nó, ném ở đúng chỗ phát hiện, và bắt ở chỗ nói chuyện với người dùng. Thêm logging.info ở đầu và cuối phiên bán hàng, rồi đọc lại nhật ký sau khi chạy thử vài đơn: nếu mai có sự cố, nhật ký này có đủ cho bạn dựng lại chuyện gì đã xảy ra không?',
    srsCards: [
      {
        hoi: 'Vì sao nên tự định nghĩa lớp lỗi riêng thay vì raise Exception chung?',
        dap: 'Để nơi gọi bắt được ĐÚNG loại chuyện mình muốn xử lý (except KhoKhongDu), trong khi lỗi lập trình thật sự vẫn nổ lên cho mình thấy. Bắt Exception trống là chôn lỗi.',
      },
      {
        hoi: 'Khi nào KHÔNG nên dùng exception?',
        dap: 'Khi đó là luồng bình thường, xảy ra thường xuyên (khách nhập sai, danh sách rỗng) — kiểm bằng if là đủ. Exception dành cho tình huống hàm không thể hoàn thành việc của nó.',
      },
      {
        hoi: 'Logging khác print ở chỗ nào?',
        dap: 'Log có mức độ (info/warning/error) để lọc, có mốc thời gian, và bật tắt được không cần xoá code. Print là nói với người dùng; log là ghi cho chính mình đọc lúc đi tìm nguyên nhân sự cố.',
      },
    ],
  },
]
