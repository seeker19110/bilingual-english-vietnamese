// Test companionLink (client) — mọi hàm phải NUỐT lỗi mạng, không bao giờ ném ra ngoài làm
// gãy trang Hồ sơ; và mã luôn được chuẩn hoá trước khi gửi lên.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchCompanionLinks,
  createCompanionInvite,
  redeemCompanionInvite,
  removeCompanionLink,
} from './companionLink'

vi.mock('@core/authHeader', () => ({ getAuthHeader: () => ({ Authorization: 'Bearer t' }) }))

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

function res(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body }
}

describe('fetchCompanionLinks', () => {
  it('trả dữ liệu khi 200', async () => {
    fetchMock.mockResolvedValue(res({ watchers: [], following: [] }))
    expect(await fetchCompanionLinks()).toEqual({ watchers: [], following: [] })
  })

  it('lỗi mạng → null, KHÔNG ném', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(fetchCompanionLinks()).resolves.toBeNull()
  })

  it('401 → null', async () => {
    fetchMock.mockResolvedValue(res({}, false, 401))
    expect(await fetchCompanionLinks()).toBeNull()
  })
})

describe('createCompanionInvite', () => {
  it('lỗi server → null, không ném', async () => {
    fetchMock.mockResolvedValue(res({ error: 'lỗi' }, false, 500))
    expect(await createCompanionInvite()).toBeNull()
  })
})

describe('redeemCompanionInvite', () => {
  it('chuẩn hoá mã trước khi gửi (viết hoa, bỏ khoảng trắng)', async () => {
    fetchMock.mockResolvedValue(res({ learner: { name: 'Na' } }))
    await redeemCompanionInvite('  abcdefgh2345 ')
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1].body))
    expect(body).toEqual({ action: 'redeem', code: 'ABCDEFGH2345', relation: 'family' })
  })

  it('giữ nguyên thông điệp lỗi của server để hiện đúng cho người dùng', async () => {
    fetchMock.mockResolvedValue(res({ error: 'Mã không đúng hoặc đã hết hạn' }, false, 400))
    expect(await redeemCompanionInvite('ABCDEFGH2345')).toEqual({
      ok: false,
      message: 'Mã không đúng hoặc đã hết hạn',
    })
  })

  it('lỗi mạng → thông điệp riêng, không ném', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const out = await redeemCompanionInvite('ABCDEFGH2345')
    expect(out).toEqual({ ok: false, message: 'Lỗi mạng — thử lại sau' })
  })
})

describe('removeCompanionLink', () => {
  it('mã hoá linkId vào query — không nối chuỗi thô', async () => {
    fetchMock.mockResolvedValue(res({ ok: true }))
    await removeCompanionLink('a b&c')
    expect(String(fetchMock.mock.calls[0]![0])).toContain('linkId=a%20b%26c')
  })

  it('lỗi mạng → false, không ném', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    expect(await removeCompanionLink('x')).toBe(false)
  })
})
