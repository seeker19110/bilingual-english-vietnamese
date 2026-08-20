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

  // --- Nhánh line 55: contentMarkdown rỗng → fallback timestamp string ---
  it('buildNotionPagePayload không có contentMarkdown → fallback sang chuỗi timestamp', () => {
    const payload = buildNotionPagePayload({
      title: 'Task rỗng',
      status: 'todo',
      priority: 'low',
      tags: [],
      // contentMarkdown KHÔNG truyền
    })
    const blockContent = payload.children[0]?.paragraph?.rich_text[0]?.text.content ?? ''
    expect(blockContent).toContain('Xuất từ Không Gian Làm Việc Đồng Hành AI')
  })

  // --- Nhánh: không có dueDate → DueDate property không có trong payload ---
  it('buildNotionPagePayload không có dueDate → DueDate là null hoặc không có date.start', () => {
    const payload = buildNotionPagePayload({
      title: 'No deadline',
      status: 'done',
      priority: 'low',
      tags: [],
    })
    // DueDate không có start
    const dueDateProp = payload.properties.DueDate
    expect(dueDateProp?.date.start).toBeFalsy()
  })
})
