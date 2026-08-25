// lessons/p2u7.ts — Bài học P2-U7: XỬ LÝ LỖI try/except + kiểm dữ liệu nhập.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u7-l1',
    unitId: 'p2-u7',
    language: 'python',
    title: 'try/except — chương trình không sập vì khách gõ bậy',
    hook: 'Bạn viết int(input(...)) và yên tâm. Rồi một hôm khách gõ "hai ly" thay vì "2" — chương trình sập giữa lúc đang tính tiền, mất luôn cả phiên bán hàng. Phần mềm dùng được thật là phần mềm KHÔNG SẬP.',
    theory:
      'Khi gặp tình huống không xử lý được, Python NÉM RA một lỗi (exception) và chương trình dừng ngay. try/except cho bạn bắt lấy lỗi đó và xử lý tử tế:\n\ntry:\n    so = int(input("So luong: "))\nexcept ValueError:\n    print("Du lieu khong hop le")\n\n- Khối try: đặt phần code CÓ THỂ lỗi — càng ngắn càng tốt.\n- except <TênLỗi>: chạy khi đúng loại lỗi đó xảy ra.\n- Bắt được nhiều loại: viết nhiều except, hoặc except (ValueError, ZeroDivisionError).\n- else: chạy khi try KHÔNG lỗi. finally: luôn chạy dù có lỗi hay không (hay dùng để dọn dẹp).\n\nBa lỗi người mới gặp nhiều nhất: ValueError (int("abc")), ZeroDivisionError (chia cho 0), KeyError (tra khoá dict không có).\n\nĐừng bắt lỗi trần trụi bằng except: rồi im lặng bỏ qua — làm vậy là giấu lỗi, sau này bạn không hiểu vì sao số liệu sai. Bắt ĐÚNG loại lỗi mình lường trước, và luôn nói cho người dùng biết chuyện gì vừa xảy ra.\n\nCòn một cách nữa, dùng song song: KIỂM TRA TRƯỚC (if so_luong <= 0: ...). Quy tắc thực dụng: điều kiện nào kiểm được bằng if thì kiểm trước, cái nào không lường hết được thì bọc try.',
    workedExample: {
      code: `# Máy chia tiền hoá đơn — không sập dù nhập bậy
def chia_tien(tong_str, so_nguoi_str):
    try:
        tong = int(tong_str)                 # có thể ValueError
        so_nguoi = int(so_nguoi_str)
        return f"Moi nguoi: {tong // so_nguoi} dong"   # có thể ZeroDivisionError
    except ValueError:
        return "Du lieu khong hop le"
    except ZeroDivisionError:
        return "Khong the chia cho 0"

print(chia_tien("90000", "3"))     # trường hợp bình thường
print(chia_tien("90000", "0"))     # chia cho 0
print(chia_tien("90000", "ba"))    # chữ thay vì số`,
      stdinLines: [],
    },
    predict: {
      code: `try:\n    so = int("12abc")\n    print("Da doi thanh cong")\nexcept ValueError:\n    print("Khong phai so")\nprint("Chuong trinh van chay tiep")`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: [
        'Da doi thanh cong',
        'Khong phai so\nChuong trinh van chay tiep',
        'Chỉ in "Khong phai so" rồi dừng',
        'Báo lỗi và dừng hẳn',
      ],
      answerIndex: 1,
      explain:
        'int("12abc") ném ValueError nên dòng print trong try bị bỏ qua, nhảy sang except in "Khong phai so". Quan trọng: bắt được lỗi rồi thì chương trình CHẠY TIẾP bình thường — dòng cuối vẫn in ra.',
    },
    parsons: {
      prompt: 'Xếp các dòng sau thành chương trình đọc số lượng an toàn, nhập bậy thì báo lỗi.',
      lines: [
        'tho = input("So luong: ")',
        'try:',
        '    so_luong = int(tho)',
        '    print(f"Da nhan {so_luong} mon")',
        'except ValueError:',
        '    print("Du lieu khong hop le")',
      ],
    },
    make: {
      prompt:
        'Viết máy chia tiền hoá đơn "không thể sập".\n\nĐọc 2 dòng bằng input(): dòng 1 là TỔNG TIỀN, dòng 2 là SỐ NGƯỜI. In đúng một dòng theo các trường hợp:\n- Bình thường: Moi nguoi: <tổng // số người> dong   (chia lấy phần nguyên)\n- Nếu số người bằng 0: Khong the chia cho 0\n- Nếu một trong hai dòng KHÔNG phải số nguyên: Du lieu khong hop le\n\nChương trình không được văng traceback trong bất kỳ trường hợp nào.',
      starterCode: `tong_str = input("Tong tien: ")\nnguoi_str = input("So nguoi: ")\n# Bọc phần có thể lỗi trong try, bắt ĐÚNG loại lỗi rồi in theo mẫu đề\n`,
      testCases: [
        {
          stdinLines: ['90000', '3'],
          expected: 'Moi nguoi: 30000 dong',
          match: 'contains',
          hidden: false,
          label: '90.000đ chia 3 người → 30.000đ',
        },
        {
          stdinLines: ['90000', '0'],
          expected: 'Khong the chia cho 0',
          match: 'contains',
          hidden: false,
          label: 'Số người bằng 0 — không được sập',
        },
        {
          stdinLines: ['90000', 'ba'],
          expected: 'Du lieu khong hop le',
          match: 'contains',
          hidden: false,
          label: 'Gõ chữ "ba" thay vì số 3',
        },
        {
          stdinLines: ['muoi nghin', '2'],
          expected: 'Du lieu khong hop le',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tổng tiền cũng gõ bậy',
        },
        {
          stdinLines: ['100000', '3'],
          expected: 'Moi nguoi: 33333 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chia không hết — phải lấy phần nguyên bằng //',
        },
      ],
      hints: [
        'Đặt CẢ hai lệnh int(...) và phép chia vào trong khối try — lỗi có thể đến từ bất kỳ chỗ nào trong ba chỗ đó.',
        'Hai loại lỗi khác nhau cần hai except riêng: except ValueError cho chuyện gõ chữ, except ZeroDivisionError cho chuyện chia 0.',
        'Chia lấy phần nguyên là toán tử // (hai dấu gạch chéo). Dùng một gạch / sẽ ra 30000.0 và output lệch mẫu đề.',
      ],
      sampleSolution: `tong_str = input("Tong tien: ")\nnguoi_str = input("So nguoi: ")\n\ntry:\n    tong = int(tong_str)\n    so_nguoi = int(nguoi_str)\n    print(f"Moi nguoi: {tong // so_nguoi} dong")\nexcept ValueError:\n    print("Du lieu khong hop le")\nexcept ZeroDivisionError:\n    print("Khong the chia cho 0")`,
    },
    homework:
      'Về nhà: bọc vòng lặp while quanh phần nhập liệu — nhập sai thì HỎI LẠI thay vì bỏ cuộc, chỉ thoát khi nhận được số hợp lệ. Đó là cách mọi phần mềm thật xử lý người dùng gõ nhầm.',
  },
]
