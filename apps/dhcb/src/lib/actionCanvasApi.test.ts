// apps/dhcb/src/lib/actionCanvasApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchActionCanvas,
  saveActionCanvas,
  synthesizeGoalCanvas,
  exportCanvasMarkdown,
} from './actionCanvasApi.js'

describe('actionCanvasApi client library', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches action canvas', async () => {
    const mockCanvas = { title: 'Test Canvas', nodes: [] }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, canvas: mockCanvas }),
    } as unknown as Response)

    const canvas = await fetchActionCanvas()
    expect(canvas.title).toBe('Test Canvas')
  })

  it('saves action canvas via POST', async () => {
    const mockCanvas = { title: 'Updated Canvas', nodes: [] }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, canvas: mockCanvas }),
    } as unknown as Response)

    const saved = await saveActionCanvas(
      mockCanvas as unknown as Parameters<typeof saveActionCanvas>[0],
    )
    expect(saved.title).toBe('Updated Canvas')
  })

  it('synthesizes goal canvas', async () => {
    const mockCanvas = { title: 'Lộ trình IELTS', nodes: [] }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, canvas: mockCanvas }),
    } as unknown as Response)

    const canvas = await synthesizeGoalCanvas('Luyện thi IELTS')
    expect(canvas.title).toBe('Lộ trình IELTS')
  })

  it('exports canvas to markdown', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        format: 'markdown',
        markdown: '# Report',
        title: 'Plan',
      }),
    } as unknown as Response)

    const res = await exportCanvasMarkdown()
    expect(res.markdown).toBe('# Report')
  })
})
