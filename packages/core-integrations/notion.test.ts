// packages/core-integrations/notion.test.ts
import { describe, it, expect } from 'vitest'
import { buildNotionPagePayload, exportToNotion } from './notion.js'

describe('Notion Connector', () => {
  it('builds valid Notion Page payload with properties', () => {
    const payload = buildNotionPagePayload({
      title: 'Tối ưu hiệu năng V2',
      status: 'in_progress',
      priority: 'urgent',
      tags: ['engineering', 'scale'],
      dueDate: '2026-08-30',
      contentMarkdown: 'Chi tiết tối ưu...',
    })

    expect(payload.properties.Name.title[0]?.text.content).toBe('Tối ưu hiệu năng V2')
    expect(payload.properties.Status.select.name).toBe('in_progress')
    expect(payload.properties.Priority.select.name).toBe('urgent')
    expect(payload.properties.Tags.multi_select).toHaveLength(2)
    expect(payload.properties.DueDate?.date.start).toBe('2026-08-30')
  })

  it('exports task and returns success response', async () => {
    const res = await exportToNotion({
      title: 'Luyện tập Speaking',
      status: 'todo',
      priority: 'medium',
      tags: ['learning'],
    })

    expect(res.success).toBe(true)
    expect(res.provider).toBe('notion')
    expect(res.receiptId).toContain('notion-receipt')
  })
})
