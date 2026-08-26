// Test business logic "Đi chung" — tập trung vào LỜI HỨA RIÊNG TƯ:
//  1. Không phải thành viên đang hoạt động → không đọc/ghi được gì.
//  2. Tắt chia sẻ = XOÁ vị trí (không phải ẩn), và vị trí bị bỏ qua khi đang tắt.
//  3. Chế độ 'approx' làm mờ toạ độ Ở SERVER trước khi lưu.
//  4. Kết thúc/rời chuyến xoá vị trí ngay.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockQuery = vi.fn()
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({ query: mockQuery }) }))

import {
  getActiveMembership,
  getSessionState,
  leaveSession,
  recordPosition,
  updateSession,
  updateSharing,
} from './locationService.js'

/** Khớp câu SQL theo một mảnh chữ đặc trưng, trả về các lượt gọi tương ứng. */
function callsMatching(fragment: string): unknown[][] {
  return mockQuery.mock.calls.filter((c) => String(c[0]).includes(fragment))
}

beforeEach(() => {
  mockQuery.mockReset()
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 })
})

describe('getActiveMembership', () => {
  it('không có dòng → null (đã rời chuyến / chuyến hết hạn)', async () => {
    expect(await getActiveMembership('s1', 'u1')).toBeNull()
  })

  it('câu truy vấn tự lọc left_at/ended_at/expires_at — không tin client', async () => {
    await getActiveMembership('s1', 'u1')
    const sql = String(mockQuery.mock.calls[0]![0])
    expect(sql).toContain('m.left_at is null')
    expect(sql).toContain('s.ended_at is null')
    expect(sql).toContain('s.expires_at > now()')
  })
})

describe('recordPosition', () => {
  it('không phải thành viên → null, KHÔNG ghi gì vào bảng positions', async () => {
    expect(await recordPosition('s1', 'u1', { lat: 10, lng: 106 })).toBeNull()
    expect(callsMatching('insert into location.positions')).toHaveLength(0)
  })

  it('đang TẮT chia sẻ → bỏ qua im lặng, không ghi vị trí', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ sharing_enabled: false, precision_mode: 'exact' }],
    })
    expect(await recordPosition('s1', 'u1', { lat: 10, lng: 106 })).toBeNull()
    expect(callsMatching('insert into location.positions')).toHaveLength(0)
  })

  it('chế độ approx → toạ độ LƯU vào DB đã bị làm mờ', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ sharing_enabled: true, precision_mode: 'approx' }] })
      .mockResolvedValueOnce({ rows: [{ updated_at: new Date('2026-08-26T00:00:00Z') }] })
      .mockResolvedValueOnce({ rows: [{ name: 'An', owner_id: 'u1' }] })

    const member = await recordPosition('s1', 'u1', { lat: 10.7712, lng: 106.7003 })
    const insert = callsMatching('insert into location.positions')[0]!
    const params = insert[1] as unknown[]
    expect(params[2]).not.toBe(10.7712)
    expect(params[3]).not.toBe(106.7003)
    expect(member?.position?.lat).toBe(params[2])
    expect(member?.isOwner).toBe(true)
  })

  it('chế độ exact → lưu đúng toạ độ thật', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ sharing_enabled: true, precision_mode: 'exact' }] })
      .mockResolvedValueOnce({ rows: [{ updated_at: new Date('2026-08-26T00:00:00Z') }] })
      .mockResolvedValueOnce({ rows: [{ name: 'An', owner_id: 'khac' }] })

    const member = await recordPosition('s1', 'u1', { lat: 10.7712, lng: 106.7003 })
    expect(member?.position).toMatchObject({ lat: 10.7712, lng: 106.7003 })
    expect(member?.isOwner).toBe(false)
  })
})

describe('updateSharing', () => {
  it('không phải thành viên → false, không đụng DB ghi', async () => {
    expect(await updateSharing('s1', 'u1', { sharingEnabled: true })).toBe(false)
    expect(callsMatching('update location.session_members')).toHaveLength(0)
  })

  it('TẮT chia sẻ → xoá luôn vị trí đang lưu + ghi nhật ký "disable"', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ sharing_enabled: true, precision_mode: 'exact' }] })
    expect(await updateSharing('s1', 'u1', { sharingEnabled: false })).toBe(true)
    expect(callsMatching('delete from location.positions')).toHaveLength(1)
    const log = callsMatching('insert into location.consent_log')[0]!
    expect((log[1] as unknown[])[2]).toBe('disable')
  })

  it('BẬT chia sẻ → không xoá vị trí, ghi nhật ký "enable"', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ sharing_enabled: false, precision_mode: 'exact' }] })
    await updateSharing('s1', 'u1', { sharingEnabled: true })
    expect(callsMatching('delete from location.positions')).toHaveLength(0)
    expect((callsMatching('insert into location.consent_log')[0]![1] as unknown[])[2]).toBe(
      'enable',
    )
  })

  it('chỉ đổi độ chính xác (không đổi công tắc) → không ghi nhật ký đồng thuận', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ sharing_enabled: true, precision_mode: 'exact' }] })
    await updateSharing('s1', 'u1', { precisionMode: 'approx' })
    expect(callsMatching('insert into location.consent_log')).toHaveLength(0)
  })
})

describe('getSessionState', () => {
  it('không phải thành viên → null', async () => {
    expect(await getSessionState('s1', 'u1')).toBeNull()
  })

  it('người đang tắt chia sẻ KHÔNG lộ toạ độ, dù DB còn dòng vị trí cũ', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ sharing_enabled: true, precision_mode: 'exact' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 's1',
            owner_id: 'u1',
            name: 'Đi cà phê',
            invite_code: 'ABC123',
            meet_lat: null,
            meet_lng: null,
            meet_label: null,
            alert_radius_m: 300,
            expires_at: new Date('2026-08-26T04:00:00Z'),
            ended_at: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: 'u2',
            name: 'Bình',
            sharing_enabled: false,
            precision_mode: 'exact',
            lat: 10.77,
            lng: 106.7,
            accuracy_m: 12,
            heading_deg: null,
            speed_mps: null,
            battery_pct: 80,
            updated_at: new Date('2026-08-26T00:00:00Z'),
          },
        ],
      })

    const state = await getSessionState('s1', 'u1')
    expect(state?.members[0]).toMatchObject({ userId: 'u2', sharingEnabled: false, position: null })
    expect(state?.members[0]!.updatedAt).toBeNull()
  })
})

describe('updateSession', () => {
  it('không phải chủ chuyến → false, không sửa gì', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ owner_id: 'nguoi-khac' }] })
    expect(await updateSession('s1', 'u1', { alertRadiusM: 500 })).toBe(false)
    expect(callsMatching('update location.sessions set alert_radius_m')).toHaveLength(0)
  })

  it('kết thúc chuyến → xoá TOÀN BỘ vị trí của mọi thành viên', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ owner_id: 'u1' }] })
    expect(await updateSession('s1', 'u1', { end: true })).toBe(true)
    expect(callsMatching('delete from location.positions where session_id = $1')).toHaveLength(1)
    expect((callsMatching('insert into location.consent_log')[0]![1] as unknown[])[2]).toBe('end')
  })

  it('xoá điểm hẹn (meetPoint = null) khác với KHÔNG đổi (undefined)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ owner_id: 'u1' }] })
    await updateSession('s1', 'u1', { meetPoint: null })
    expect(callsMatching('meet_lat = $2')).toHaveLength(1)

    mockQuery.mockReset()
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 })
    mockQuery.mockResolvedValueOnce({ rows: [{ owner_id: 'u1' }] })
    await updateSession('s1', 'u1', { alertRadiusM: 400 })
    expect(callsMatching('meet_lat = $2')).toHaveLength(0)
  })
})

describe('leaveSession', () => {
  it('rời chuyến → tắt chia sẻ, xoá vị trí, ghi nhật ký "leave"', async () => {
    await leaveSession('s1', 'u1')
    expect(callsMatching('set left_at = now()')).toHaveLength(1)
    expect(callsMatching('delete from location.positions')).toHaveLength(1)
    expect((callsMatching('insert into location.consent_log')[0]![1] as unknown[])[2]).toBe('leave')
  })
})
