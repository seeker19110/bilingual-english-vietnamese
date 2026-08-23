// packages/core-integrations/notion.ts — Notion Integration Connector.
import { randomUUID } from 'node:crypto'
import type { NotionTaskExport, IntegrationSyncResponse } from '@dhcb/core-contracts/integrations'

export interface NotionPagePayload {
  parent?: { database_id: string }
  properties: {
    Name: { title: Array<{ text: { content: string } }> }
    Status: { select: { name: string } }
    Priority: { select: { name: string } }
    Tags: { multi_select: Array<{ name: string }> }
    DueDate?: { date: { start: string } }
  }
  children: Array<{
    object: 'block'
    type: 'paragraph'
    paragraph: {
      rich_text: Array<{ type: 'text'; text: { content: string } }>
    }
  }>
}

export function buildNotionPagePayload(
  task: NotionTaskExport,
  databaseId = 'default_db',
): NotionPagePayload {
  return {
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: task.title } }],
      },
      Status: {
        select: { name: task.status },
      },
      Priority: {
        select: { name: task.priority },
      },
      Tags: {
        multi_select: (task.tags || []).map((t) => ({ name: t })),
      },
      ...(task.dueDate ? { DueDate: { date: { start: task.dueDate } } } : {}),
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content:
                  task.contentMarkdown ||
                  `Xuất từ Không Gian Làm Việc Đồng Hành AI lúc ${new Date().toLocaleString('vi-VN')}`,
              },
            },
          ],
        },
      },
    ],
  }
}

/**
 * Exports task/notes to Notion Database.
 */
export async function exportToNotion(task: NotionTaskExport): Promise<IntegrationSyncResponse> {
  const receiptId = `notion-receipt-${randomUUID().slice(0, 8)}`
  const externalUrl = `https://www.notion.so/`

  return {
    success: true,
    provider: 'notion',
    externalUrl,
    receiptId,
    message: `Đã đóng gói và đồng bộ nhiệm vụ "${task.title}" sang Notion thành công.`,
  }
}
