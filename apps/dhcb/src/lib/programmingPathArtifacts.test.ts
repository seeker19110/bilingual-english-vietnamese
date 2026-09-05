// Test lib programmingPathArtifacts: client CRUD kho artifact (không cache localStorage).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPathArtifacts,
  createPathArtifact,
  deletePathArtifact,
} from './programmingPathArtifacts'

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchPathArtifacts', () => {
  it('thành công → trả danh sách artifact', async () => {
    const artifacts = [
      { id: 'a1', pathId: 'p1', phaseId: 'ph1', url: 'https://x', note: 'ghi chú', createdAt: 1 },
    ]
    mockFetch({ artifacts })
    expect(await fetchPathArtifacts('p1')).toEqual(artifacts)
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/path-artifact?pathId=p1',
      expect.anything(),
    )
  })

  it('server thiếu field artifacts → mảng rỗng', async () => {
    mockFetch({})
    expect(await fetchPathArtifacts('p1')).toEqual([])
  })

  it('HTTP lỗi → mảng rỗng', async () => {
    mockFetch(null, false)
    expect(await fetchPathArtifacts('p1')).toEqual([])
  })

  it('fetch ném lỗi mạng → mảng rỗng, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchPathArtifacts('p1')).toEqual([])
  })
})

describe('createPathArtifact', () => {
  it('thành công → { ok: true }', async () => {
    mockFetch({})
    const res = await createPathArtifact('p1', 'ph1', 'https://x', 'note')
    expect(res).toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/path-artifact',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('lỗi HTTP có body error → trả error đó', async () => {
    mockFetch({ error: 'URL không hợp lệ' }, false)
    const res = await createPathArtifact('p1', 'ph1', 'bad-url', '')
    expect(res).toEqual({ ok: false, error: 'URL không hợp lệ' })
  })

  it('lỗi HTTP không parse được body → dùng thông báo mặc định', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: false,
            json: async () => {
              throw new Error('not json')
            },
          }) as unknown as Response,
      ),
    )
    const res = await createPathArtifact('p1', 'ph1', 'bad-url', '')
    expect(res).toEqual({ ok: false, error: 'Nộp artifact thất bại' })
  })

  it('fetch ném lỗi mạng → thông báo không kết nối được', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    const res = await createPathArtifact('p1', 'ph1', 'https://x', '')
    expect(res).toEqual({ ok: false, error: 'Không kết nối được máy chủ' })
  })
})

describe('deletePathArtifact', () => {
  it('thành công → true', async () => {
    mockFetch({})
    expect(await deletePathArtifact('a1')).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/path-artifact?id=a1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('lỗi HTTP → false', async () => {
    mockFetch(null, false)
    expect(await deletePathArtifact('a1')).toBe(false)
  })

  it('fetch ném lỗi mạng → false, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await deletePathArtifact('a1')).toBe(false)
  })
})
