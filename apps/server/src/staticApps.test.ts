import { describe, it, expect } from 'vitest'
import { parseHubHostnames, resolveDistDir } from './staticApps.js'

const APP = '/var/www/dhcb/dist'
const HUB = '/var/www/dhcb/apps/hub/dist'

// Bơm sẵn "hub đã build" để test không phụ thuộc đĩa thật.
const daBuild = () => true
const chuaBuild = () => false

function chon(
  hostname: string | undefined,
  opts: Partial<Parameters<typeof resolveDistDir>[0]> = {},
) {
  return resolveDistDir({
    hostname,
    hubHostnames: ['hub.donghanhcungban.org'],
    appDistDir: APP,
    hubDistDir: HUB,
    hubBuildExists: daBuild,
    ...opts,
  })
}

describe('parseHubHostnames', () => {
  it('bỏ trống → mặc định đúng host hub production', () => {
    expect(parseHubHostnames(undefined)).toEqual(['hub.donghanhcungban.org'])
  })

  it('nhận nhiều host, bỏ khoảng trắng thừa và hạ chữ thường', () => {
    expect(parseHubHostnames(' Hub.Example.ORG , hub2.example.org ')).toEqual([
      'hub.example.org',
      'hub2.example.org',
    ])
  })

  it('KHÔNG sinh host rỗng từ dấu phẩy thừa — host rỗng sẽ khớp nhầm mọi request', () => {
    expect(parseHubHostnames('a.org,, ,b.org')).toEqual(['a.org', 'b.org'])
    expect(parseHubHostnames('')).toEqual([])
  })
})

describe('resolveDistDir', () => {
  it('host của hub → phục vụ bản build hub', () => {
    expect(chon('hub.donghanhcungban.org')).toBe(HUB)
  })

  it('so khớp không phân biệt hoa thường', () => {
    expect(chon('HUB.DongHanhCungBan.ORG')).toBe(HUB)
  })

  // Đây là bất biến QUAN TRỌNG NHẤT của file: các domain đang chạy thật không được đổi hành vi.
  it.each([
    'www.donghanhcungban.org',
    'donghanhcungban.org',
    'en-vi.donghanhcungban.org',
    'en-vi.donghanhcungban.com',
    'localhost',
    'domain-la-hoac.tan-cong.example',
  ])('%s → vẫn là app nền tảng, KHÔNG phải hub', (host) => {
    expect(chon(host)).toBe(APP)
  })

  it('không có Host header → app nền tảng (không đoán mò)', () => {
    expect(chon(undefined)).toBe(APP)
  })

  it('đúng host hub nhưng CHƯA build hub → rơi về app nền tảng thay vì trả 404 cả domain', () => {
    expect(chon('hub.donghanhcungban.org', { hubBuildExists: chuaBuild })).toBe(APP)
  })

  it('danh sách hub rỗng → mọi host đều là app nền tảng', () => {
    expect(chon('hub.donghanhcungban.org', { hubHostnames: [] })).toBe(APP)
  })
})
