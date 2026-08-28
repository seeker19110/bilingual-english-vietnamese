import { describe, it, expect } from 'vitest'
import {
  decideRedirect,
  isAssetPath,
  DEFAULT_SUBJECTS_HOSTNAME,
  DEFAULT_CANONICAL_HOSTNAME,
} from './subjectsRouting.js'

const SUBJECT_IDS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'programming']

function quyet(hostname: string | undefined, pathname: string, search = '') {
  return decideRedirect({
    hostname,
    pathname,
    search,
    subjectIds: SUBJECT_IDS,
    subjectsHostname: DEFAULT_SUBJECTS_HOSTNAME,
  })
}

// Cờ bật/tắt: không khai host trụ Học tập thì KHÔNG chuyển hướng gì — để deploy code trước,
// bật sau khi DNS + cert đã sống.
describe('decideRedirect — chưa bật (không khai SUBJECTS_HOSTNAME)', () => {
  it.each([
    ['www.donghanhcungban.org', '/mon-hoc'],
    ['www.donghanhcungban.org', '/mon-hoc/mathematics'],
    ['hoc-tap.donghanhcungban.org', '/tien-do'],
  ])('%s%s → không chuyển hướng', (host, path) => {
    expect(decideRedirect({ hostname: host, pathname: path, subjectIds: SUBJECT_IDS })).toBeNull()
  })
})

describe('isAssetPath', () => {
  it.each([
    '/assets/index-a1b2c3d4.js',
    '/assets/index-a1b2c3d4.css',
    '/favicon.svg',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sw.js',
    '/icon-512.png',
    '/data/curriculum.json',
    '/pyodide/pyodide.asm.wasm',
    '/sqljs/sql-wasm.wasm',
    '/uploads/abc.mp3',
  ])('%s là file tĩnh — KHÔNG được chuyển hướng', (p) => {
    expect(isAssetPath(p)).toBe(true)
  })

  it.each(['/', '/mathematics', '/tien-do', '/mon-hoc/physics'])('%s KHÔNG phải file tĩnh', (p) => {
    expect(isAssetPath(p)).toBe(false)
  })
})

describe('decideRedirect — trên host trụ Học tập', () => {
  const H = DEFAULT_SUBJECTS_HOSTNAME

  it('trang gốc = danh sách môn → phục vụ tại chỗ', () => {
    expect(quyet(H, '/')).toBeNull()
  })

  it.each(SUBJECT_IDS.filter((id) => id !== 'programming'))(
    '/%s là môn hợp lệ → phục vụ tại chỗ',
    (id) => {
      expect(quyet(H, `/${id}`)).toBeNull()
    },
  )

  // Lập trình có không gian riêng trên app nền tảng (route /lap-trinh) — đi thẳng, không dựng
  // trang chi tiết môn rồi mới chuyển tiếp bằng JS.
  it('/programming → thẳng tới /lap-trinh trên www', () => {
    expect(quyet(H, '/programming')).toEqual({
      location: `https://${DEFAULT_CANONICAL_HOSTNAME}/lap-trinh`,
    })
  })

  // Đây là điều kiện chính của phương án "mỗi nội dung chỉ ở MỘT host".
  it.each(['/tien-do', '/tro-truyen', '/cai-dat', '/lap-trinh', '/login', '/ho-so'])(
    '%s không thuộc trụ Học tập → 301 về www',
    (p) => {
      expect(quyet(H, p)).toEqual({ location: `https://${DEFAULT_CANONICAL_HOSTNAME}${p}` })
    },
  )

  it('giữ nguyên query string khi chuyển hướng', () => {
    expect(quyet(H, '/tien-do', '?tab=tuan')).toEqual({
      location: `https://${DEFAULT_CANONICAL_HOSTNAME}/tien-do?tab=tuan`,
    })
  })

  it('mã môn KHÔNG tồn tại → 301 về www (không trả SPA để tránh trùng nội dung)', () => {
    expect(quyet(H, '/khong-co-mon-nay')).toEqual({
      location: `https://${DEFAULT_CANONICAL_HOSTNAME}/khong-co-mon-nay`,
    })
  })

  it('đường dẫn nhiều đoạn dù bắt đầu bằng mã môn → vẫn về www', () => {
    expect(quyet(H, '/mathematics/bai-1')).toEqual({
      location: `https://${DEFAULT_CANONICAL_HOSTNAME}/mathematics/bai-1`,
    })
  })

  // Nếu luật quá rộng, chính bundle của SPA bị 301 và trang trắng — không có lỗi nào để lần ra.
  it('file tĩnh của chính SPA vẫn được phục vụ, KHÔNG bị đẩy đi', () => {
    expect(quyet(H, '/assets/index-abc12345.js')).toBeNull()
    expect(quyet(H, '/manifest.webmanifest')).toBeNull()
  })

  it('không phân biệt hoa thường ở Host header', () => {
    expect(quyet('Hoc-Tap.DongHanhCungBan.ORG', '/tien-do')).not.toBeNull()
  })
})

describe('decideRedirect — trên app nền tảng (www/en-vi)', () => {
  it('/mon-hoc → trang gốc của host Học tập', () => {
    expect(quyet('www.donghanhcungban.org', '/mon-hoc')).toEqual({
      location: `https://${DEFAULT_SUBJECTS_HOSTNAME}/`,
    })
  })

  it('/mon-hoc/mathematics → BỎ tiền tố', () => {
    expect(quyet('www.donghanhcungban.org', '/mon-hoc/mathematics')).toEqual({
      location: `https://${DEFAULT_SUBJECTS_HOSTNAME}/mathematics`,
    })
  })

  it('giữ query string', () => {
    expect(quyet('www.donghanhcungban.org', '/mon-hoc/physics', '?tu=abc')).toEqual({
      location: `https://${DEFAULT_SUBJECTS_HOSTNAME}/physics?tu=abc`,
    })
  })

  // Bất biến quan trọng nhất: KHÔNG được đụng tới phần còn lại của app.
  it.each(['/', '/tien-do', '/tro-truyen', '/lap-trinh', '/login', '/mon-hoc-khac'])(
    '%s KHÔNG bị chuyển hướng',
    (p) => {
      expect(quyet('www.donghanhcungban.org', p)).toBeNull()
    },
  )

  it('en-vi cũng áp dụng cùng luật', () => {
    expect(quyet('en-vi.donghanhcungban.org', '/mon-hoc')).toEqual({
      location: `https://${DEFAULT_SUBJECTS_HOSTNAME}/`,
    })
  })
})

describe('decideRedirect — ca biên', () => {
  it('không có Host header → không chuyển hướng (không đoán mò)', () => {
    expect(quyet(undefined, '/mon-hoc')).toBeNull()
  })

  // localhost/dev: một host phục vụ tất cả, /mon-hoc phải chạy nguyên như cũ.
  it('localhost → /mon-hoc KHÔNG bị chuyển hướng', () => {
    expect(quyet('localhost', '/mon-hoc')).toBeNull()
    expect(quyet('localhost', '/mon-hoc/physics')).toBeNull()
  })

  it('domain lạ giả dạng host Học tập → xử như host thường', () => {
    expect(quyet('hoc-tap.donghanhcungban.org.ke-gian.example', '/tien-do')).toBeNull()
  })
})
