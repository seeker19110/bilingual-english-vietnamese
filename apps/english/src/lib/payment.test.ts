import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
}))

import { fetchPlanPrices, createCheckout, fetchPaymentStatus, fetchPaymentHistory } from './payment'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPlanPrices', () => {
  const PRICES = {
    pro: {
      '10day': { priceVnd: 20000, salePriceVnd: null, saleUntil: null, effectiveVnd: 20000 },
    },
    promoPercent: null,
    promoEndsAt: null,
    maxPromoYears: 3,
  }

  it('thành công (không cần đăng nhập) → gọi đúng URL, trả dữ liệu parse', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe('/api/plan-prices')
      return new Response(JSON.stringify(PRICES), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchPlanPrices()
    expect(r).toEqual(PRICES)
  })

  it('HTTP lỗi → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    const r = await fetchPlanPrices()
    expect(r).toBeNull()
  })

  it('fetch reject → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    const r = await fetchPlanPrices()
    expect(r).toBeNull()
  })
})

describe('createCheckout', () => {
  const CHECKOUT_RESULT = {
    paymentCode: 'ENVI123',
    amountVnd: 20000,
    qrUrl: 'https://qr.example/x',
    bankAccount: '0123',
    bankName: 'ABC',
    expiresAt: '2026-08-04T00:00:00Z',
    plan: 'pro' as const,
    cycle: '10day' as const,
    years: 1,
  }

  it('thành công → gọi đúng URL/method/body, trả ok:true kèm data', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/checkout')
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body as string)).toEqual({ plan: 'pro', cycle: '10day', years: 1 })
      return new Response(JSON.stringify(CHECKOUT_RESULT), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await createCheckout('pro', '10day')
    expect(r).toEqual({ ok: true, data: CHECKOUT_RESULT })
  })

  it('HTTP lỗi có message server → ok:false kèm error đó', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Hết hạn mức' }), { status: 400 })),
    )
    const r = await createCheckout('vip', 'month')
    expect(r).toEqual({ ok: false, error: 'Hết hạn mức' })
  })

  it('HTTP lỗi KHÔNG parse được JSON → ok:false kèm message mặc định', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('not json', { status: 500 })),
    )
    const r = await createCheckout('pro', 'year')
    expect(r).toEqual({ ok: false, error: 'Không tạo được đơn' })
  })

  it('fetch reject (mất mạng) → ok:false, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    const r = await createCheckout('pro', '10day')
    expect(r).toEqual({ ok: false, error: 'Lỗi kết nối, thử lại sau' })
  })
})

describe('fetchPaymentStatus', () => {
  const STATUS = {
    status: 'paid' as const,
    plan: 'pro' as const,
    cycle: '10day' as const,
    amountVnd: 20000,
    expiresAt: '2026-08-13T00:00:00Z',
  }

  it('thành công → gọi đúng URL đã encode mã đơn, trả dữ liệu parse', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe('/api/payment-status?code=ENVI%20123')
      return new Response(JSON.stringify(STATUS), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchPaymentStatus('ENVI 123')
    expect(r).toEqual(STATUS)
  })

  it('HTTP lỗi → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 404 })),
    )
    const r = await fetchPaymentStatus('X')
    expect(r).toBeNull()
  })

  it('fetch reject → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    const r = await fetchPaymentStatus('X')
    expect(r).toBeNull()
  })
})

describe('fetchPaymentHistory', () => {
  const HISTORY = [
    {
      plan: 'pro' as const,
      cycle: '10day' as const,
      amountVnd: 20000,
      status: 'paid' as const,
      createdAt: '2026-08-01T00:00:00Z',
      paidAt: '2026-08-01T00:05:00Z',
    },
  ]

  it('thành công → trả mảng payments đã parse', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe('/api/payment-history')
      return new Response(JSON.stringify({ payments: HISTORY }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchPaymentHistory()
    expect(r).toEqual(HISTORY)
  })

  it('HTTP lỗi → trả mảng rỗng (không ném lỗi)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 401 })),
    )
    const r = await fetchPaymentHistory()
    expect(r).toEqual([])
  })

  it('fetch reject → trả mảng rỗng', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    const r = await fetchPaymentHistory()
    expect(r).toEqual([])
  })
})
