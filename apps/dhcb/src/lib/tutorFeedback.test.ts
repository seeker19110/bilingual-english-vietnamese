import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportTutorFeedback } from './tutorFeedback'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer fake-token' })),
  getStoredToken: vi.fn(() => 'fake-token'),
}))
import { getStoredToken } from '@core/authHeader'
const mockedGetStoredToken = vi.mocked(getStoredToken)

describe('reportTutorFeedback — gửi phản hồi 👎 về server', () => {
  beforeEach(() => {
    mockedGetStoredToken.mockReturnValue('fake-token')
    vi.stubGlobal('fetch', vi.fn())
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('gọi fetch thành công → resolve, không throw', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 } as Response)
    await expect(
      reportTutorFeedback('u1', 'chat', 'input người dùng', 'nhận xét AI'),
    ).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith(
      '/api/tutor-feedback',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('server trả HTTP lỗi → không throw, chỉ cảnh báo console', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(
      reportTutorFeedback('u1', 'speaking', 'input', 'feedback'),
    ).resolves.toBeUndefined()
    expect(console.warn).toHaveBeenCalled()
  })

  it('fetch reject (mất mạng) → không throw, chỉ cảnh báo console', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    await expect(reportTutorFeedback('u1', 'chat', 'input', 'feedback')).resolves.toBeUndefined()
    expect(console.warn).toHaveBeenCalled()
  })

  it('thiếu userId → không gọi fetch', async () => {
    await reportTutorFeedback('', 'chat', 'input', 'feedback')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('userInput rỗng (chỉ khoảng trắng) → không gọi fetch', async () => {
    await reportTutorFeedback('u1', 'chat', '   ', 'feedback')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('aiFeedback rỗng → không gọi fetch', async () => {
    await reportTutorFeedback('u1', 'chat', 'input', '')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('chưa đăng nhập (không có token) → không gọi fetch', async () => {
    mockedGetStoredToken.mockReturnValue(null)
    await reportTutorFeedback('u1', 'chat', 'input', 'feedback')
    expect(fetch).not.toHaveBeenCalled()
  })
})
