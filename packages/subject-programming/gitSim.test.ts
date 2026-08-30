// gitSim.test.ts — CỔNG ĐƠN VỊ cho engine mô phỏng git (PR 1 của khoá "Git & GitHub thực
// hành", docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md). File này KHÔNG tồn tại trước —
// gitSim.ts trước đó chỉ được phủ gián tiếp qua lessonsGit.test.ts (chấm nội dung bài học).
//
// Phạm vi ở đây: BA TẦNG LỆNH MỚI (hoàn tác · kho từ xa giả lập · nâng cao) — mỗi lệnh mới,
// kèm đủ ca lỗi ở bảng ③ của đặc tả. Vòng làm việc 8 lệnh cũ (init/status/add/commit/log/
// branch/switch/merge) đã có cổng riêng ở lessonsGit.test.ts, KHÔNG lặp lại ở đây.
import { describe, expect, it } from 'vitest'
import { chayLenh } from './gitSim.js'

describe('gitSim — tầng HOÀN TÁC (diff/restore/reset/revert/reflog)', () => {
  it('diff (chưa add) hiện đúng dòng đổi; diff --staged chỉ hiện thứ đã add', () => {
    const r = chayLenh(`git init
echo "dong 1" > f.txt
git add .
git commit -m "c1"
echo "dong moi" > f.txt
git diff`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('-dong 1')
    expect(r.output).toContain('+dong moi')

    const rStaged = chayLenh(`git init
echo "dong 1" > f.txt
git add .
git commit -m "c1"
echo "dong moi" > f.txt
git diff --staged`)
    // Chưa add lần sửa mới → diff --staged không in thêm gì SAU dòng lệnh (rỗng thật sự).
    expect(rStaged.output.trim().endsWith('$ git diff --staged')).toBe(true)
  })

  it('diff rỗng khi không có gì đổi', () => {
    const r = chayLenh('git init\necho "a" > f.txt\ngit add .\ngit commit -m "c"\ngit diff')
    expect(r.output.trim().endsWith('$ git diff')).toBe(true)
  })

  it('restore <file> bỏ thay đổi chưa add, MẤT vĩnh viễn phần chưa add', () => {
    const r = chayLenh(`git init
echo "goc" > f.txt
git add .
git commit -m "c1"
echo "sua tam" > f.txt
git restore f.txt
cat f.txt`)
    expect(r.error).toBeUndefined()
    // Chỉ kiểm nội dung THẬT của f.txt sau khi restore (dòng cuối, do `cat` in ra) — transcript
    // phía trên vẫn còn nhắc lại "sua tam" trong chính dòng lệnh echo đã gõ, điều đó không tính.
    const dongCuoi = r.output.trim().split('\n').pop()
    expect(dongCuoi).toBe('goc')
  })

  it('restore --staged bỏ khỏi vùng chờ nhưng GIỮ nguyên thư mục làm việc', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git status
git restore --staged f.txt
git status`)
    expect(r.error).toBeUndefined()
    const [truoc, sau] = r.output.split('git restore --staged f.txt')
    expect(truoc).toContain('Thay doi da chuan bi de commit')
    expect(sau).toContain('File chua duoc theo doi')
    expect(sau).not.toContain('Thay doi da chuan bi de commit')
  })

  it('restore thiếu tên file thì báo lỗi dạy được', () => {
    expect(chayLenh('git init\ngit restore').error).toContain('Thieu ten file')
  })

  it('restore file không nằm trong vùng chờ khi dùng --staged thì báo lỗi', () => {
    expect(chayLenh('git init\necho "a" > f.txt\ngit restore --staged f.txt').error).toContain(
      'khong o trong vung cho',
    )
  })

  it('reset --soft: dời nhánh về commit cũ nhưng GIỮ nguyên vùng chờ + thư mục làm việc', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
echo "b" > g.txt
git add .
git commit -m "c2"
git reset --soft c1
git status`)
    expect(r.error).toBeUndefined()
    // Sau reset --soft, g.txt (đã commit ở c2) giờ lại nằm trong vùng chờ so với c1.
    expect(r.output).toContain('Thay doi da chuan bi de commit')
  })

  it('reset --hard: xoá cả vùng chờ lẫn thư mục làm việc, cảnh báo trước', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
echo "b" > g.txt
git add .
git commit -m "c2"
git reset --hard c1
ls`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('CANH BAO')
    // Kiểm đúng KẾT QUẢ của `ls` (dòng cuối) — không kiểm toàn bộ transcript vì transcript
    // còn in lại cả lệnh "echo ... > g.txt" (tên file g.txt xuất hiện ở ĐÓ, không phải ở ls).
    const dongCuoi = r.output.trim().split('\n').pop()
    expect(dongCuoi).toBe('f.txt')
  })

  it('reset tới commit không tồn tại thì báo lỗi dạy được (gợi ý git log)', () => {
    expect(
      chayLenh('git init\necho "a" > f.txt\ngit add .\ngit commit -m "c"\ngit reset c9').error,
    ).toContain('git log --oneline')
  })

  it('revert tạo COMMIT MỚI hoàn tác nội dung, KHÔNG xoá lịch sử (khác reset)', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
echo "b" > f.txt
git add .
git commit -m "c2 sai roi"
git revert c2
git log --oneline
cat f.txt`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Revert "c2 sai roi"')
    // Lịch sử vẫn còn đủ 3 commit (c1, c2, và commit revert mới) — không bị xoá.
    expect(r.output).toContain('c1 c1')
    expect(r.output).toContain('c2 c2 sai roi')
    expect(r.output).toContain('a')
    expect(r.output).not.toContain('\nb\n')
  })

  it('revert commit không tồn tại thì báo lỗi', () => {
    expect(chayLenh('git init\ngit revert c9').error).toContain('Khong co commit')
  })

  it('reflog liệt kê MỌI commit từng tạo, kể cả sau khi reset --hard "làm mất" nó', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
echo "b" > f.txt
git add .
git commit -m "c2"
git reset --hard c1
git reflog`)
    expect(r.error).toBeUndefined()
    // c2 không còn trên nhánh nào, nhưng reflog vẫn nhớ — đây là lý do reflog "cứu hộ" được.
    expect(r.output).toContain('c2')
    expect(r.output).toContain('c1')
  })

  it('reflog khi chưa có commit nào', () => {
    expect(chayLenh('git init\ngit reflog').output).toContain('Chua co gi trong reflog')
  })
})

describe('gitSim — tầng KHO TỪ XA GIẢ LẬP (remote/push/fetch/pull/clone)', () => {
  const NEN = `git init
echo "goc" > f.txt
git add .
git commit -m "c1"
`

  it('push khi chưa remote add thì báo lỗi gợi đúng lệnh kế tiếp', () => {
    expect(chayLenh(`${NEN}git push`).error).toContain('git remote add origin')
  })

  it('remote add + push -u origin main: thiết lập upstream, đẩy lên thành công', () => {
    const r = chayLenh(`${NEN}git remote add origin https://vi-du.local/kho.git
git push -u origin main`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da day len origin/main')
  })

  it('remote add hai lần thì báo lỗi; remote -v liệt kê URL', () => {
    const script = `${NEN}git remote add origin https://vi-du.local/kho.git`
    expect(chayLenh(`${script}\ngit remote add origin https://khac.local/kho.git`).error).toContain(
      'da ton tai',
    )
    expect(chayLenh(`${script}\ngit remote -v`).output).toContain('https://vi-du.local/kho.git')
  })

  it('fetch không đổi gì cục bộ, chỉ báo trạng thái origin', () => {
    const r = chayLenh(`${NEN}git remote add origin https://vi-du.local/kho.git
git push -u origin main
git fetch`)
    expect(r.output).toContain('origin/main')
  })

  it('pull khi chưa có gì mới trên origin thì nói "không có gì mới"', () => {
    const r = chayLenh(`${NEN}git remote add origin https://vi-du.local/kho.git
git push -u origin main
git pull`)
    expect(r.output).toContain('khong co gi moi')
  })

  it('pull sau khi "người khác" push thêm (không đụng file nào của mình) → tua nhanh', () => {
    // remote add + push + "người khác push thêm" đều nằm trong BỐI CẢNH (chạy trước, không in
    // ra) — đúng khuôn các bài Make đã có: đề bài nói "kho của bạn đang có…", học viên chỉ gõ
    // lệnh MỚI (ở đây là `git pull`).
    const boiCanh = [
      'git init',
      'echo "cua toi" > minh.txt',
      'git add .',
      'git commit -m "c1"',
      'git remote add origin https://vi-du.local/kho.git',
      'git push -u origin main',
      'remote-seed main "commit cua nguoi khac" nguoikhac.txt "noi dung ho"',
    ]
    const r = chayLenh('git pull\ngit log --oneline\nls', boiCanh)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Tua nhanh (fast-forward) tu origin/main')
    expect(r.output).toContain('minh.txt')
    expect(r.output).toContain('nguoikhac.txt')
  })

  it('pull khi CẢ HAI phía cùng sửa MỘT file → chèn dấu xung đột thật, KHÔNG tự tạo commit', () => {
    const boiCanh = [
      'git init',
      'echo "ban goc" > f.txt',
      'git add .',
      'git commit -m "c1"',
      'git remote add origin https://vi-du.local/kho.git',
      'git push -u origin main',
      'echo "ban cua toi" > f.txt',
      'git add .',
      'git commit -m "sua o may toi"',
      'remote-seed main "sua tren github" f.txt "ban cua nguoi khac"',
    ]
    const r = chayLenh('git pull\ncat f.txt', boiCanh)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('XUNG DOT')
    expect(r.output).toContain('<<<<<<< HEAD')
    expect(r.output).toContain('=======')
    expect(r.output).toContain('>>>>>>> origin/main')
    expect(r.output).toContain('ban cua toi')
    expect(r.output).toContain('ban cua nguoi khac')
  })

  it('commit khi còn xung đột chưa giải thì bị chặn; giải xong rồi commit thì thành công', () => {
    const boiCanh = [
      'git init',
      'echo "ban goc" > f.txt',
      'git add .',
      'git commit -m "c1"',
      'git remote add origin https://vi-du.local/kho.git',
      'git push -u origin main',
      'echo "ban cua toi" > f.txt',
      'git add .',
      'git commit -m "sua o may toi"',
      'remote-seed main "sua tren github" f.txt "ban cua nguoi khac"',
      'git pull',
    ]
    const chuaGiai = chayLenh('git commit -m "xong roi"', boiCanh)
    expect(chuaGiai.error).toContain('Con xung dot chua giai')

    const daGiai = chayLenh(
      'echo "da hop nhat ca hai" > f.txt\ngit add f.txt\ngit commit -m "giai xung dot"\ngit log --oneline',
      boiCanh,
    )
    expect(daGiai.error).toBeUndefined()
    expect(daGiai.output).toContain('Da hoan tat gop')
    expect(daGiai.output).toContain('giai xung dot')
  })

  it('push khi origin có commit mình chưa có thì bị từ chối (phải pull trước)', () => {
    const boiCanh = [
      'git init',
      'echo "a" > f.txt',
      'git add .',
      'git commit -m "c1"',
      'git remote add origin https://vi-du.local/kho.git',
      'git push -u origin main',
      'echo "b" > g.txt',
      'git add .',
      'git commit -m "c2 o may toi"',
      'remote-seed main "cua nguoi khac" h.txt "noi dung"',
    ]
    const r = chayLenh('git push', boiCanh)
    expect(r.error).toContain('Chay "git pull" truoc')
  })

  it('push --force-with-lease vẫn đẩy được dù origin đã có commit mới (chấp nhận rủi ro)', () => {
    const boiCanh = [
      'git init',
      'echo "a" > f.txt',
      'git add .',
      'git commit -m "c1"',
      'git remote add origin https://vi-du.local/kho.git',
      'git push -u origin main',
      'echo "b" > g.txt',
      'git add .',
      'git commit -m "c2"',
      'remote-seed main "cua nguoi khac" h.txt "noi dung"',
    ]
    const r = chayLenh('git push --force-with-lease origin main', boiCanh)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da day len origin/main')
  })

  it('clone: kho mới tinh tải toàn bộ lịch sử + file từ origin', () => {
    const r = chayLenh('git clone https://mo-phong.local/kho.git\ngit log --oneline\nls', [
      'remote-seed main "commit dau" README.md "xin chao"',
    ])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('README.md')
    expect(r.output).toContain('commit dau')
  })

  it('clone kho không tồn tại (URL không khớp bối cảnh) thì báo lỗi rõ ràng', () => {
    expect(chayLenh('git clone https://khong-ton-tai.local/x.git').error).toBeTruthy()
  })

  it('clone khi thư mục đã là kho git thì báo lỗi', () => {
    expect(chayLenh('git init\ngit clone https://vi-du.local/kho.git').error).toContain(
      'da la kho git roi',
    )
  })
})

describe('gitSim — tầng NÂNG CAO (stash/tag/cherry-pick/rebase)', () => {
  it('stash push cất thay đổi, dọn sạch thư mục; stash pop lấy lại và xoá khỏi ngăn', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
echo "dang lam do" > g.txt
git stash push -m "dang lam do"
git status
git stash pop
cat g.txt
git stash list`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('thu muc lam viec sach')
    expect(r.output).toContain('dang lam do')
    expect(r.output).toContain('(khong co stash nao)')
  })

  it('stash push khi không có gì để cất thì báo lỗi', () => {
    expect(chayLenh('git init\ngit stash push').error).toContain('Khong co gi de stash')
  })

  it('stash pop khi ngăn rỗng thì báo lỗi', () => {
    expect(chayLenh('git init\ngit stash pop').error).toContain('Khong co stash nao')
  })

  it('tag -a gắn nhãn lên commit hiện tại; liệt kê ra đúng tên; trùng tên thì báo lỗi', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
git tag -a v1.0 -m "Ban dau tien"
git tag`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('v1.0')
    expect(
      chayLenh(
        `git init\necho "a" > f.txt\ngit add .\ngit commit -m "c"\ngit tag -a v1.0 -m "x"\ngit tag -a v1.0 -m "y"`,
      ).error,
    ).toContain('da ton tai')
  })

  it('tag không kèm -a thì báo lỗi dạy được', () => {
    expect(chayLenh('git init\ngit tag -a').error).toContain('Thieu ten tag')
  })

  it('cherry-pick mang một commit sang nhánh khác, tạo mã commit MỚI', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
git switch -c phu
echo "b" > g.txt
git add .
git commit -m "them g"
git switch main
git cherry-pick c2
git log --oneline
ls`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('them g')
    expect(r.output).toContain('g.txt')
    // Commit mới trên main không trùng mã c2 (mã sinh mới, không phải copy mã cũ).
    expect(r.output.match(/c3/)).toBeTruthy()
  })

  it('cherry-pick commit không tồn tại thì báo lỗi', () => {
    expect(chayLenh('git init\ngit cherry-pick c9').error).toContain('Khong co commit')
  })

  it('rebase tuyến tính: chuyển tiếp commit riêng của nhánh phụ lên đầu nhánh chính', () => {
    const r = chayLenh(`git init
echo "a" > f.txt
git add .
git commit -m "c1"
git switch -c phu
echo "b" > g.txt
git add .
git commit -m "them g"
git switch main
echo "c" > h.txt
git add .
git commit -m "them h tren main"
git switch phu
git rebase main
git log --oneline`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da rebase 1 commit')
    expect(r.output).toContain('them h tren main')
    expect(r.output).toContain('them g')
  })

  it('rebase -i (tương tác) không được mô phỏng, nói rõ nằm ngoài bài học', () => {
    expect(
      chayLenh('git init\necho "a" > f.txt\ngit add .\ngit commit -m "c"\ngit rebase main -i')
        .error,
    ).toContain('nam ngoai bai hoc')
  })

  it('rebase khi nhánh đích chưa có commit nào (tổ tiên là gốc rỗng) vẫn chạy được', () => {
    const r = chayLenh(`git init
git branch dich
echo "a" > f.txt
git add .
git commit -m "c1"
git rebase dich
git log --oneline`)
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('Da rebase 1 commit')
  })
})

describe('gitSim — tất định + không dạy nhầm lệnh ngoài phạm vi mô phỏng', () => {
  it('kho từ xa: cùng chuỗi lệnh chạy hai lần cho output y hệt', () => {
    const script = `git init
echo "a" > f.txt
git add .
git commit -m "c1"
git remote add origin https://vi-du.local/kho.git
git push -u origin main
git stash push -m "x"
git tag -a v1 -m "y"
git log --oneline`
    expect(chayLenh(script).output).toBe(chayLenh(script).output)
  })

  it('lệnh ngoài phạm vi mô phỏng nói thẳng, không im lặng bỏ qua', () => {
    for (const lenh of ['worktree', 'submodule', 'lfs', 'mergetool', 'archive', 'fsck']) {
      const r = chayLenh(`git init\ngit ${lenh}`)
      expect(r.error, lenh).toContain('khong lam')
    }
  })
})
