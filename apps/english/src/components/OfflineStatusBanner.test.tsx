// apps/english/src/components/OfflineStatusBanner.test.tsx — Unit test cho OfflineStatusBanner

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import OfflineStatusBanner from './OfflineStatusBanner'

describe('OfflineStatusBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('không hiển thị khi navigator.onLine là true (render rỗng)', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const html = renderToStaticMarkup(React.createElement(OfflineStatusBanner))
    expect(html).toBe('')
  })

  it('hiển thị cảnh báo khi navigator.onLine là false', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const html = renderToStaticMarkup(React.createElement(OfflineStatusBanner))
    expect(html).toContain('role="alert"')
    expect(html).toContain('Bạn đang ngoại tuyến')
  })
})
