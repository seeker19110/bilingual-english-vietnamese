// CỔNG cho BỘ CHẠY BASH (bashSim.ts, PR-M1) — hạ tầng tầng 1 của chương trình M.
//
// Mạch này KHÔNG có khe hở "xanh ở CI, rớt ở người học": engine là TypeScript thuần, cổng CI
// và trình duyệt gọi chung một hàm chayBash() — không có hai bản cài đặt như mạch Python
// (python3 vs Pyodide).
//
// Ba nhóm bất biến được canh ở đây:
//  1. TẤT ĐỊNH + sạch giữa các lượt — nếu không thì không thể làm cổng chấm nội dung.
//  2. TỰ KHAI (hiến chương M §3.3) — mỗi lượt chạy phải nói ra nó là bộ mô phỏng, và lệnh
//     không mô phỏng được phải nói thẳng thay vì giả vờ chạy được.
//  3. ĐỦ TẬP LỆNH mà hiến chương M §4 bắt buộc phủ — thiếu một lệnh là bài học sau không soạn
//     được, nên phải đỏ ngay ở PR hạ tầng chứ không phải ở PR nội dung.
import { describe, expect, it } from 'vitest'
import { chayBash, DONG_TU_KHAI } from './bashSim.js'

/** Bỏ dòng tự khai để so output cho gọn — dòng đó đã có test riêng canh. */
function ra(script: string, boiCanh: string[] = []): string {
  const r = chayBash(script, boiCanh)
  return r.output.replace(`${DONG_TU_KHAI}\n`, '')
}

describe('bashSim — luật tự khai và giới hạn (hiến chương M §3.3)', () => {
  it('MỌI lượt chạy in dòng tự khai ở dòng đầu tiên', () => {
    expect(chayBash('echo xin chao').output.split('\n')[0]).toBe(DONG_TU_KHAI)
    expect(chayBash('').output.split('\n')[0]).toBe(DONG_TU_KHAI)
  })

  it('dòng tự khai nói rõ đây KHÔNG phải bash thật', () => {
    expect(DONG_TU_KHAI).toContain('GIA LAP')
    expect(DONG_TU_KHAI).toContain('khong phai bash that')
  })

  it('lệnh cần mạng/quyền thật nói rõ vì sao không chạy được (không giả vờ thành công)', () => {
    for (const lenh of ['curl abc.com', 'wget abc.com', 'ssh may-chu', 'sudo rm x']) {
      expect(ra(lenh), lenh).toContain('khong co')
    }
    expect(ra('date')).toContain('KHONG co dong ho')
    expect(ra('sed s/a/b/ f.txt')).toContain('khong co "sed"')
  })

  it('lệnh không tồn tại thì liệt kê các lệnh dùng được', () => {
    const r = chayBash('lenh_khong_co_that')
    expect(r.output).toContain('Khong tim thay lenh')
    expect(r.output).toContain('grep')
    expect(r.exitCode).toBe(1)
  })

  it('chặn xoá thư mục gốc và dạy vì sao "rm -rf /" nguy hiểm', () => {
    expect(ra('rm -rf /')).toContain('pha huy ca may')
  })

  it('vòng lặp quá nhiều lệnh thì dừng lại thay vì treo trình duyệt', () => {
    // 3 vòng lồng nhau × 30 giá trị = 27.000 lượt, vượt trần 20.000.
    const so = Array.from({ length: 30 }, (_, i) => i).join(' ')
    const r = chayBash(
      `for a in ${so}; do\nfor b in ${so}; do\nfor c in ${so}; do\ntrue\ndone\ndone\ndone`,
    )
    expect(r.output).toContain('bo chay dung lai')
    expect(r.exitCode).toBe(1)
  })
})

describe('bashSim — tất định', () => {
  const script = `mkdir bai-tap
cd bai-tap
echo "mot" > a.txt
echo "hai" >> a.txt
cat a.txt
ls
pwd`

  it('chạy hai lần cùng script cho ra output y hệt', () => {
    expect(chayBash(script).output).toBe(chayBash(script).output)
  })

  it('mỗi lượt chạy là máy MỚI TINH — không dính trạng thái lượt trước', () => {
    chayBash('echo "cu" > cu.txt\nmkdir cu')
    expect(ra('ls')).toBe('')
  })
})

describe('bashSim — đi lại và xem thư mục', () => {
  it('pwd bắt đầu ở thư mục nhà; cd đi vào rồi cd .. đi ra', () => {
    expect(ra('pwd')).toBe('/home/ban\n')
    expect(ra('mkdir a\ncd a\npwd')).toBe('/home/ban/a\n')
    expect(ra('mkdir a\ncd a\ncd ..\npwd')).toBe('/home/ban\n')
    expect(ra('mkdir a\ncd a\ncd ~\npwd')).toBe('/home/ban\n')
  })

  it('cd vào chỗ không có thì báo lỗi dạy được, kèm số dòng', () => {
    const r = chayBash('echo mo dau\ncd khong-co')
    expect(r.output).toContain('dong 2:')
    expect(r.output).toContain('Khong co thu muc "khong-co"')
    expect(r.exitCode).toBe(1)
  })

  it('ls sắp xếp tất định; ls -l hiện quyền và kích thước', () => {
    expect(ra('touch b.txt\ntouch a.txt\nmkdir zz\nls')).toBe('a.txt\nb.txt\nzz\n')
    expect(ra('echo abc > a.txt\nls -l a.txt')).toBe('-rw-r--r-- 4 a.txt\n')
  })

  it('mkdir -p tạo cả đường dẫn nhiều cấp; không có -p thì báo lỗi', () => {
    expect(ra('mkdir -p a/b/c\nfind a -type d')).toBe('a\na/b\na/b/c\n')
    expect(ra('mkdir a/b/c')).toContain('Them "-p"')
  })
})

describe('bashSim — tạo, chép, đổi tên, xoá', () => {
  it('cp giữ bản gốc, mv thì không', () => {
    expect(ra('echo x > a.txt\ncp a.txt b.txt\nls')).toBe('a.txt\nb.txt\n')
    expect(ra('echo x > a.txt\nmv a.txt b.txt\nls')).toBe('b.txt\n')
  })

  it('cp/mv vào một THƯ MỤC thì giữ nguyên tên file', () => {
    expect(ra('echo x > a.txt\nmkdir kho\ncp a.txt kho\nls kho')).toBe('a.txt\n')
  })

  it('cp thư mục cần -r, và -r chép cả cây bên trong', () => {
    expect(ra('mkdir -p d/con\necho x > d/con/a.txt\ncp d d2')).toContain('them "-r"')
    expect(ra('mkdir -p d/con\necho x > d/con/a.txt\ncp -r d d2\ncat d2/con/a.txt')).toBe('x\n')
  })

  it('rm thư mục cần -r; rm -f không kêu ca khi file không tồn tại', () => {
    expect(ra('mkdir d\nrm d')).toContain('them "-r"')
    expect(ra('mkdir d\nrm -r d\nls')).toBe('')
    expect(chayBash('rm -f khong-co.txt').exitCode).toBe(0)
    expect(chayBash('rm khong-co.txt').exitCode).toBe(1)
  })
})

describe('bashSim — echo, biến, nháy và chuyển hướng', () => {
  it('> ghi đè, >> nối thêm (cái bẫy tự xoá mất công sức)', () => {
    expect(ra('echo mot > f.txt\necho hai > f.txt\ncat f.txt')).toBe('hai\n')
    expect(ra('echo mot > f.txt\necho hai >> f.txt\ncat f.txt')).toBe('mot\nhai\n')
  })

  it('biến gán rồi dùng lại; nháy KÉP nội suy, nháy ĐƠN thì không', () => {
    expect(ra('TEN=Lan\necho "Chao $TEN"')).toBe('Chao Lan\n')
    expect(ra("TEN=Lan\necho 'Chao $TEN'")).toBe('Chao $TEN\n')
    expect(ra('TEN=Lan\necho ${TEN}h')).toBe('Lanh\n')
  })

  it('biến chưa gán nở ra chuỗi rỗng, không phải lỗi', () => {
    expect(ra('echo "[$KHONG_CO]"')).toBe('[]\n')
  })

  it('$( ) lồng kết quả lệnh khác vào', () => {
    expect(ra('echo "a\nb" > f.txt\necho "co $(wc -l f.txt | cut -d" " -f1) dong"')).toBe(
      'co 2 dong\n',
    )
    expect(ra('SO=$(echo 5)\necho $SO')).toBe('5\n')
    expect(ra('mkdir kho\ncd kho\necho "dang o $(pwd)"')).toBe('dang o /home/ban/kho\n')
  })

  it('echo -n không xuống dòng', () => {
    expect(ra('echo -n abc\necho xyz')).toBe('abcxyz\n')
  })
})

describe('bashSim — ống, mã thoát, && và ||', () => {
  it('ống nối output lệnh trước vào lệnh sau', () => {
    const boiCanh = ['printf-khong-co || true']
    expect(boiCanh).toBeTruthy()
    expect(ra('echo "b\na\nb" > f.txt\ncat f.txt | sort | uniq')).toBe('a\nb\n')
    expect(ra('echo "b\na\nb" > f.txt\ncat f.txt | sort | uniq -c')).toBe('1 a\n2 b\n')
  })

  it('$? giữ mã thoát của lệnh vừa chạy', () => {
    expect(ra('true\necho $?')).toBe('0\n')
    expect(ra('false\necho $?')).toBe('1\n')
    expect(ra('echo a > f.txt\ngrep khong-co f.txt\necho $?')).toBe('1\n')
  })

  it('&& chỉ chạy khi vế trước thành công; || chỉ chạy khi thất bại', () => {
    expect(ra('true && echo chay')).toBe('chay\n')
    expect(ra('false && echo chay')).toBe('')
    expect(ra('false || echo chay')).toBe('chay\n')
    expect(ra('true || echo chay')).toBe('')
  })

  // Ranh giới này do TEST TRÌNH DUYỆT của PR-M2 chỉ ra: giao diện tô ĐỎ (ô "lỗi hệ thống") mọi
  // ca có `error` và GIẤU output đi. Mà với bộ chạy bash, output CHÍNH LÀ chỗ chứa câu tiếng
  // Việt chỉ cách sửa. Nên lệnh gõ sai phải đi đường "kết quả học tập" chứ không phải "sự cố".
  it('lệnh gõ sai KHÔNG bị coi là lỗi hệ thống — chỉ trả mã thoát và thông báo trong output', () => {
    expect(chayBash('true').error).toBeUndefined()
    const r = chayBash('mkdir d\nrm d')
    expect(r.error).toBeUndefined()
    expect(r.exitCode).toBe(1)
    expect(r.output).toContain('them "-r"')
  })

  it('lỗi ĐỘNG CƠ (vượt trần, cú pháp không phân tích nổi) mới đặt error', () => {
    expect(chayBash('echo "chua dong').error).toContain('nhay kep')
    expect(chayBash('sleep 1 &').error).toContain('tien trinh nen')
  })

  it('lệnh lỗi giữa chừng KHÔNG dừng script (khác gitSim — đúng như bash thật)', () => {
    const r = chayBash('cat khong-co.txt\necho van chay tiep')
    expect(r.output).toContain('van chay tiep')
  })

  it('exit dừng script với mã thoát mình chọn', () => {
    const r = chayBash('echo truoc\nexit 3\necho sau')
    expect(r.output).toContain('truoc')
    expect(r.output).not.toContain('sau')
    expect(r.exitCode).toBe(3)
  })
})

describe('bashSim — lọc và xử lý văn bản', () => {
  const bc = ['echo "cam 3\nchuoi 5\ncam 2\ndua 9" > kho.txt']

  it('grep lọc dòng; -v đảo ngược; -n kèm số dòng; -c đếm; -i bỏ qua hoa thường', () => {
    expect(ra('grep cam kho.txt', bc)).toBe('cam 3\ncam 2\n')
    expect(ra('grep -v cam kho.txt', bc)).toBe('chuoi 5\ndua 9\n')
    expect(ra('grep -n dua kho.txt', bc)).toBe('4:dua 9\n')
    expect(ra('grep -c cam kho.txt', bc)).toBe('2\n')
    expect(ra('grep -i CAM kho.txt', bc)).toBe('cam 3\ncam 2\n')
  })

  it('grep trả mã thoát 0 khi TÌM THẤY, 1 khi không — thứ mà if dùng', () => {
    expect(chayBash('grep cam kho.txt', bc).exitCode).toBe(0)
    expect(chayBash('grep xoai kho.txt', bc).exitCode).toBe(1)
  })

  it('wc đếm dòng/từ/ký tự', () => {
    expect(ra('wc -l kho.txt', bc)).toBe('4 kho.txt\n')
    expect(ra('cat kho.txt | wc -w', bc)).toBe('8\n')
  })

  it('head/tail lấy đầu/cuối; -n chọn số dòng', () => {
    expect(ra('head -n 2 kho.txt', bc)).toBe('cam 3\nchuoi 5\n')
    expect(ra('tail -n 1 kho.txt', bc)).toBe('dua 9\n')
  })

  it('sort xếp chữ, -n xếp số, -r đảo ngược', () => {
    expect(ra('sort kho.txt', bc)).toBe('cam 2\ncam 3\nchuoi 5\ndua 9\n')
    expect(ra('sort -r kho.txt', bc)).toBe('dua 9\nchuoi 5\ncam 3\ncam 2\n')
    expect(ra('echo "10\n9\n2" > s.txt\nsort -n s.txt')).toBe('2\n9\n10\n')
  })

  it('uniq chỉ gộp dòng TRÙNG LIỀN NHAU — lý do luôn phải sort trước', () => {
    expect(ra('echo "a\nb\na" > u.txt\nuniq u.txt')).toBe('a\nb\na\n')
    expect(ra('echo "a\nb\na" > u.txt\nsort u.txt | uniq')).toBe('a\nb\n')
  })

  it('cut lấy cột theo dấu ngăn cách', () => {
    expect(ra('echo "lan,10\nhoa,9" > d.csv\ncut -d, -f1 d.csv')).toBe('lan\nhoa\n')
    expect(ra('echo "lan,10,a\nhoa,9,b" > d.csv\ncut -d, -f1,3 d.csv')).toBe('lan,a\nhoa,b\n')
  })

  it('cut thiếu -f thì nhắc đúng cách viết', () => {
    expect(ra('echo a > f.txt\ncut -d, f.txt')).toContain('Thieu "-f"')
  })
})

describe('bashSim — tìm file và ký tự đại diện', () => {
  const bc = [
    'mkdir -p du-an/src',
    'touch du-an/a.txt',
    'touch du-an/b.md',
    'touch du-an/src/c.txt',
  ]

  it('find liệt kê cả cây; -name lọc theo tên; -type lọc file/thư mục', () => {
    expect(ra('find du-an -name "*.txt"', bc)).toBe('du-an/a.txt\ndu-an/src/c.txt\n')
    expect(ra('find du-an -type d', bc)).toBe('du-an\ndu-an/src\n')
  })

  it('* nở ra danh sách file trong thư mục hiện tại', () => {
    expect(ra('cd du-an\nls *.txt', bc)).toBe('a.txt\n')
    expect(ra('cd du-an\necho *.txt', bc)).toBe('a.txt\n')
  })

  it('* không khớp gì thì giữ nguyên (đúng như bash mặc định)', () => {
    expect(ra('echo *.khongcogi')).toBe('*.khongcogi\n')
  })
})

describe('bashSim — vòng for và rẽ nhánh if', () => {
  it('for chạy qua từng giá trị', () => {
    expect(ra('for x in a b c; do\necho $x\ndone')).toBe('a\nb\nc\n')
  })

  it('for viết gọn một dòng cũng chạy', () => {
    expect(ra('for x in 1 2; do echo so $x; done')).toBe('so 1\nso 2\n')
  })

  it('for kết hợp ký tự đại diện — khuôn xử lý hàng loạt file', () => {
    const r = ra('touch a.txt\ntouch b.txt\nfor f in *.txt; do\necho "xu ly $f"\ndone')
    expect(r).toBe('xu ly a.txt\nxu ly b.txt\n')
  })

  it('if dùng mã thoát: [ -f file ] đúng thì chạy nhánh then', () => {
    expect(ra('echo x > f.txt\nif [ -f f.txt ]; then\necho co\nelse\necho khong\nfi')).toBe('co\n')
    expect(ra('if [ -f f.txt ]; then\necho co\nelse\necho khong\nfi')).toBe('khong\n')
  })

  it('if dùng ngay kết quả grep — mạch thật hay gặp nhất', () => {
    const r = ra('echo loi > log.txt\nif grep -q loi log.txt; then\necho co loi\nfi')
    expect(r).toBe('co loi\n')
  })

  it('elif chạy đúng nhánh giữa', () => {
    const s =
      'N=2\nif [ $N -eq 1 ]; then\necho mot\nelif [ $N -eq 2 ]; then\necho hai\nelse\necho khac\nfi'
    expect(ra(s)).toBe('hai\n')
  })

  it('test so sánh số và chuỗi; sai cú pháp thì nhắc dạy được', () => {
    expect(ra('if [ abc = abc ]; then\necho bang\nfi')).toBe('bang\n')
    expect(ra('if [ 3 -gt 5 ]; then\necho lon\nelse\necho be\nfi')).toBe('be\n')
    expect(ra('[ abc -gt 5 ]')).toContain('chi so sanh SO')
  })

  it('for/if thiếu từ khoá đóng thì báo đúng chỗ thiếu', () => {
    expect(ra('for x in a b; do\necho $x')).toContain('done')
  })
})

describe('bashSim — chmod và chạy script .sh', () => {
  // Nháy ĐƠN khi ghi script: nếu dùng nháy kép thì $1 bị shell ngoài nội suy NGAY (thành rỗng)
  // trước khi kịp ghi vào file — đúng như bash thật, và là cái bẫy đáng dạy.
  const script = "echo '#!/bin/bash' > chao.sh\necho 'echo Xin chao $1' >> chao.sh\n"

  it('script chưa có quyền chạy thì nhắc chmod +x', () => {
    const r = ra(`${script}./chao.sh`)
    expect(r).toContain('chua co quyen chay')
    expect(r).toContain('chmod +x ./chao.sh')
  })

  it('chmod +x rồi thì ./script.sh chạy được', () => {
    expect(ra(`${script}chmod +x chao.sh\n./chao.sh`)).toBe('Xin chao\n')
  })

  it('bash script.sh chạy được kể cả khi chưa chmod (đúng như thật)', () => {
    expect(ra(`${script}bash chao.sh Lan`)).toBe('Xin chao Lan\n')
  })

  it('chmod dạng số đổi đúng quyền hiện trên ls -l', () => {
    expect(ra('touch f.sh\nchmod 755 f.sh\nls -l f.sh')).toBe('-rwxr-xr-x 0 f.sh\n')
    expect(ra('touch f.sh\nchmod 600 f.sh\nls -l f.sh')).toBe('-rw------- 0 f.sh\n')
  })

  it('chmod dạng chưa hiểu thì nói rõ dạng nào dùng được', () => {
    expect(ra('touch f.sh\nchmod u=rwx f.sh')).toContain('chua hieu')
  })

  it('script tự gọi chính nó thì dừng lại chứ không treo', () => {
    const r = chayBash('echo "bash tu.sh" > tu.sh\nbash tu.sh')
    expect(r.output).toContain('qua sau')
  })
})

describe('bashSim — dựng bối cảnh cho đề bài (lenhChuanBi)', () => {
  it('bối cảnh dựng sẵn file mà KHÔNG in ra gì', () => {
    const r = chayBash('cat ghi_chu.txt', ['echo "noi dung co san" > ghi_chu.txt'])
    expect(r.output).toBe(`${DONG_TU_KHAI}\nnoi dung co san\n`)
  })

  it('bối cảnh hỏng thì báo là lỗi của ĐỀ BÀI, không đổ cho học viên', () => {
    const r = chayBash('ls', ['cd khong-co-thu-muc-nay'])
    expect(r.error).toContain('Loi khi dung boi canh')
    expect(r.output).toBe('')
  })
})

describe('bashSim — cú pháp không hỗ trợ nói thẳng', () => {
  it('chạy nền (&) và chuyển hướng vào (<) đều nói rõ vì sao không có', () => {
    expect(ra('sleep 1 &')).toContain('khong co tien trinh nen')
    expect(ra('sort < f.txt')).toContain('chuyen huong vao')
  })

  it('thiếu dấu nháy đóng thì nhắc đúng dấu còn thiếu', () => {
    expect(ra('echo "chua dong')).toContain('nhay kep')
    expect(ra("echo 'chua dong")).toContain('nhay don')
  })
})

// Nhóm dưới đây phủ nốt các NHÁNH còn lại của engine. Không phải test cho đủ số: mỗi ca là một
// đường học viên thật sự đi (gõ thiếu tham số, gõ nhầm tên, viết cờ dạng khác), và một bộ mô
// phỏng chỉ đáng tin khi mọi lối rẽ — nhất là lối rẽ BÁO LỖI — đều được chạy ít nhất một lần.
describe('bashSim — ca biên của từng lệnh', () => {
  it('thiếu tham số thì mỗi lệnh nhắc đúng ví dụ của nó', () => {
    expect(ra('mkdir')).toContain('Thieu ten thu muc')
    expect(ra('touch')).toContain('Thieu ten file')
    expect(ra('rm')).toContain('Thieu ten file')
    expect(ra('cp a.txt')).toContain('Thieu tham so')
    expect(ra('chmod')).toContain('Thieu tham so')
    expect(ra('grep')).toContain('Thieu mau tim')
    expect(ra('bash')).toContain('Thieu ten file script')
  })

  it('thao tác lên thứ không tồn tại thì báo đúng tên thứ đang thiếu', () => {
    expect(ra('cat khong-co.txt')).toContain('Khong co file "khong-co.txt"')
    expect(ra('cp khong-co.txt b.txt')).toContain('Khong co "khong-co.txt"')
    expect(ra('chmod +x khong-co.sh')).toContain('Khong co "khong-co.sh"')
    expect(ra('find khong-co')).toContain('Khong co "khong-co"')
    expect(ra('./khong-co.sh')).toContain('Khong co file "./khong-co.sh"')
    expect(ra('ls khong-co')).toContain('ls: khong co "khong-co"')
  })

  it('nhầm file với thư mục (và ngược lại) thì nói rõ nhầm ở đâu', () => {
    expect(ra('mkdir d\ncat d')).toContain('la thu muc chu khong phai file')
    expect(ra('touch f.txt\ncd f.txt')).toContain('la file chu khong phai thu muc')
    expect(ra('mkdir d\necho x > d')).toContain('khong ghi de len duoc')
    expect(ra('echo x > khong-co/f.txt')).toContain('Tao truoc bang "mkdir -p"')
  })

  it('mkdir -p chạy lại trên thư mục đã có thì im lặng (đúng ý nghĩa của -p)', () => {
    expect(chayBash('mkdir d\nmkdir -p d').exitCode).toBe(0)
    expect(ra('mkdir d\nmkdir d')).toContain('da ton tai')
    expect(ra('touch f.txt\ntouch f.txt\nls')).toBe('f.txt\n')
    expect(ra('touch khong-co/f.txt')).toContain('Khong co thu muc')
  })

  it('cp/mv: nhiều nguồn thì đích phải là thư mục; đích thiếu thư mục cha thì báo', () => {
    expect(ra('touch a.txt\ntouch b.txt\ncp a.txt b.txt c.txt')).toContain('phai la THU MUC')
    expect(ra('touch a.txt\ncp a.txt khong-co/b.txt')).toContain('Khong co thu muc')
    expect(ra('mkdir -p d/con\nmkdir kho\nmv -r d kho\nfind kho -type d')).toBe(
      'kho\nkho/d\nkho/d/con\n',
    )
  })

  it('ls nhiều đường dẫn thì gắn nhãn từng thư mục', () => {
    const r = ra('mkdir a\nmkdir b\ntouch a/x.txt\nls a b')
    expect(r).toContain('a:')
    expect(r).toContain('x.txt')
    expect(r).toContain('b:')
  })

  it('head/tail nhận cả dạng -3 lẫn -n 3; -n không phải số thì báo lỗi', () => {
    const bc = ['echo "1\n2\n3\n4" > f.txt']
    expect(ra('head -2 f.txt', bc)).toBe('1\n2\n')
    expect(ra('tail -2 f.txt', bc)).toBe('3\n4\n')
    expect(ra('head -n abc f.txt', bc)).toContain('phai la mot so')
    // Không tham số thì mặc định 10 dòng — file 4 dòng nên ra cả file.
    expect(ra('head f.txt', bc)).toBe('1\n2\n3\n4\n')
  })

  it('grep: nhiều file thì gắn tên file; -q chỉ trả mã thoát; mẫu hỏng lùi về so chuỗi', () => {
    const bc = ['echo "co loi" > a.log', 'echo "binh thuong" > b.log']
    expect(ra('grep loi a.log b.log', bc)).toBe('a.log:co loi\n')
    expect(ra('grep -q loi a.log', bc)).toBe('')
    expect(chayBash('grep -q loi a.log', bc).exitCode).toBe(0)
    // "[" là regex hỏng — không được ném lỗi, phải so như chuỗi thường.
    expect(ra('echo "a[b" > f.txt\ngrep "[" f.txt')).toBe('a[b\n')
  })

  it('wc -c đếm ký tự; không cờ thì in cả ba số', () => {
    expect(ra('echo -n abcd > f.txt\nwc -c f.txt')).toBe('4 f.txt\n')
    expect(ra('echo "a b" > f.txt\nwc f.txt')).toBe('1 2 4 f.txt\n')
  })

  it('sort -u bỏ trùng luôn; cut nhận cả dạng "-d ," rời', () => {
    expect(ra('echo "b\na\nb" > f.txt\nsort -u f.txt')).toBe('a\nb\n')
    expect(ra('echo "lan,10" > d.csv\ncut -d , -f2 d.csv')).toBe('10\n')
    expect(ra('echo "lan,10" > d.csv\ncut -d, -f9 d.csv')).toBe('\n')
    expect(ra('echo "lan,10" > d.csv\ncut -d, -fx d.csv')).toContain('phai la so cot')
  })

  it('find: -type sai giá trị thì nhắc f hoặc d; tìm trên một file cũng ra chính nó', () => {
    expect(ra('mkdir d\nfind d -type x')).toContain('f (file) hoac d (thu muc)')
    expect(ra('touch f.txt\nfind f.txt')).toBe('f.txt\n')
  })

  it('chmod -x gỡ quyền chạy — script vừa chạy được lại thành không', () => {
    const r = ra("echo 'echo chay' > s.sh\nchmod +x s.sh\n./s.sh\nchmod -x s.sh\n./s.sh")
    expect(r).toContain('chay')
    expect(r).toContain('chua co quyen chay')
  })

  it('test/[ phủ hết phép thu: -e -z -n, != và các phép so sánh số', () => {
    expect(ra('touch f.txt\nif [ -e f.txt ]; then\necho co\nfi')).toBe('co\n')
    expect(ra('if [ -z "" ]; then\necho rong\nfi')).toBe('rong\n')
    expect(ra('if [ -n "abc" ]; then\necho co chu\nfi')).toBe('co chu\n')
    expect(ra('if [ a != b ]; then\necho khac\nfi')).toBe('khac\n')
    expect(ra('if [ 2 -ne 3 ]; then\necho ne\nfi')).toBe('ne\n')
    expect(ra('if [ 2 -le 2 ]; then\necho le\nfi')).toBe('le\n')
    expect(ra('if [ 3 -ge 2 ]; then\necho ge\nfi')).toBe('ge\n')
    expect(ra('if [ 2 -lt 3 ]; then\necho lt\nfi')).toBe('lt\n')
    expect(ra('if [ "abc" ]; then\necho co\nfi')).toBe('co\n')
    expect(ra('[ -q f.txt ]')).toContain('chua hieu phep thu')
    expect(ra('[ a %% b ]')).toContain('chua hieu phep thu')
    expect(ra('[ a b c d ]')).toContain('khoang trang hai ben')
  })

  it('biến đặc biệt: $# $@ $HOME $PWD và tham số vị trí của script', () => {
    const s = "echo 'echo so:$# tat ca:$@ nha:$HOME o:$PWD' > s.sh\nbash s.sh x y"
    expect(ra(s)).toBe('so:2 tat ca:x y nha:/home/ban o:/home/ban\n')
  })

  it('dấu $ đứng lẻ và dấu \\ thoát nghĩa không làm hỏng dòng lệnh', () => {
    expect(ra('echo "gia 100$"')).toBe('gia 100$\n')
    expect(ra('echo "10$ va $%"')).toBe('10$ va $%\n')
    expect(ra('echo a\\ b')).toBe('a b\n')
    expect(ra('echo "noi \\"trong\\" nhay"')).toBe('noi "trong" nhay\n')
  })

  it('cú pháp hỏng của $( ) và ${ } nhắc đúng dấu còn thiếu', () => {
    expect(ra('echo $(pwd')).toContain('ngoac dong ")"')
    expect(ra('echo ${TEN')).toContain('ngoac nhon dong')
  })

  it('for với tên biến không hợp lệ thì nhắc cú pháp đúng', () => {
    expect(ra('for 1x in a; do\necho $1x\ndone')).toContain('phai la ten bien')
  })

  it('từ khoá do/done nằm trong nháy KHÔNG bị tính là đóng khối', () => {
    expect(ra('for x in a; do\necho "done roi"\ndone')).toBe('done roi\n')
  })

  it('glob trong thư mục khác và glob trên đường dẫn không có thật', () => {
    expect(ra('mkdir d\ntouch d/a.txt\ntouch d/b.md\necho d/*.txt')).toBe('d/a.txt\n')
    expect(ra('echo khong-co/*.txt')).toBe('khong-co/*.txt\n')
  })

  it('exit không kèm số thì giữ mã thoát của lệnh vừa chạy', () => {
    expect(chayBash('false\nexit').exitCode).toBe(1)
    expect(chayBash('true\nexit').exitCode).toBe(0)
  })

  it('output quá dài thì dừng in chứ không đơ khung hiển thị', () => {
    const dai = 'x'.repeat(500)
    const muoi = '1 2 3 4 5 6 7 8 9 10'
    // 10 × 10 × 10 dòng × 500 ký tự = 500.000 > trần 200.000.
    const r = chayBash(
      `for i in ${muoi}; do\nfor j in ${muoi}; do\nfor k in ${muoi}; do\necho "${dai}"\ndone\ndone\ndone`,
    )
    expect(r.output).toContain('Output qua dai')
  })

  it('dòng trống, chú thích và dấu ; nối lệnh đều xử lý đúng', () => {
    expect(ra('\n# chu thich\necho a; echo b')).toBe('a\nb\n')
    expect(ra('echo a # cuoi dong')).toBe('a\n')
  })

  it('cat không tham số trả lại đúng thứ nhận từ ống', () => {
    expect(ra('echo abc | cat')).toBe('abc\n')
    expect(ra('cat')).toBe('')
  })
})

describe('bashSim — nốt các lối rẽ hiếm gặp nhưng có thật', () => {
  it('$( ) lồng trong $( )', () => {
    expect(ra('echo $(echo $(pwd))')).toBe('/home/ban\n')
  })

  it('tên lệnh viết trong nháy vẫn chạy (không bị nhầm là từ khoá)', () => {
    expect(ra('"echo" xin chao')).toBe('xin chao\n')
  })

  it('for viết "do" ngay sau danh sách, không có dấu ;', () => {
    expect(ra('for x in a b do\necho $x\ndone')).toBe('a\nb\n')
  })

  it('từ khoá đứng một mình (gõ thừa "fi") thì báo cú pháp không hợp lệ', () => {
    expect(ra('fi')).toContain('Cu phap khong hop le')
  })

  it('thiếu tên file sau > và > nhận nhiều tên do glob thì đều báo lỗi', () => {
    expect(ra('echo a >')).toContain('Thieu ten file sau dau ">"')
    expect(ra('touch a.txt\ntouch b.txt\necho x > *.txt')).toContain('DUNG MOT ten file')
  })

  it('lệnh nở ra rỗng (biến chưa gán đứng một mình) thì bỏ qua, không báo lỗi', () => {
    expect(chayBash('$KHONG_CO\necho sau do').exitCode).toBe(0)
  })

  it('>> tạo mới file khi file chưa tồn tại', () => {
    expect(ra('echo a >> moi.txt\ncat moi.txt')).toBe('a\n')
  })

  it('exit với tham số không phải số thì coi như 0', () => {
    expect(chayBash('exit abc').exitCode).toBe(0)
  })

  it('exit bên trong script chỉ dừng script đó, shell gọi nó vẫn chạy tiếp', () => {
    const r = ra("echo 'echo trong\nexit 2\necho khong toi' > s.sh\nbash s.sh\necho ngoai")
    expect(r).toBe('trong\nngoai\n')
  })

  it('viết "test" thay cho [ ] cũng chạy', () => {
    expect(ra('touch f.txt\nif test -f f.txt; then\necho co\nfi')).toBe('co\n')
    expect(ra('mkdir d\nif [ -d d ]; then\necho la thu muc\nfi')).toBe('la thu muc\n')
  })

  it('ls -l hiện thư mục với chữ d ở đầu chuỗi quyền', () => {
    expect(ra('mkdir d\nls -l')).toBe('drwxr-xr-x 0 d\n')
    expect(ra('mkdir d\ntouch d/x\nls -l d')).toBe('-rw-r--r-- 0 x\n')
  })

  it('grep -i với mẫu regex hỏng vẫn so như chuỗi thường', () => {
    expect(ra('echo "A[b" > f.txt\ngrep -i "a[" f.txt')).toBe('A[b\n')
  })

  it('sort -n khi hai dòng bằng nhau thì xếp tiếp theo chữ (tất định)', () => {
    expect(ra('echo "10\n10\n2" > f.txt\nsort -n f.txt')).toBe('2\n10\n10\n')
  })

  it('cut nhận "-f 2" rời; find nhận cờ ngay sau tên lệnh và -type f', () => {
    expect(ra('echo "a,b" > d.csv\ncut -d, -f 2 d.csv')).toBe('b\n')
    expect(ra('touch a.txt\nmkdir d\nfind -name "*.txt"')).toBe('./a.txt\n')
    expect(ra('touch a.txt\nmkdir d\nfind . -type f')).toBe('./a.txt\n')
    expect(ra('touch a.txt\nfind . -name')).toBe('.\n./a.txt\n')
  })
})
