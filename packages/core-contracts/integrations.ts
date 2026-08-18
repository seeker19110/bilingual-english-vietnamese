// packages/core-contracts/integrations.ts — V2 Flagship Google Calendar & Notion Integrations Contracts.
import { z } from 'zod'

export const IntegrationProviderSchema = z.enum(['google_calendar', 'notion'])
export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>

export const CalendarEventSyncSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  startIso: z.string().min(1),
  endIso: z.string().min(1),
  recurrenceRule: z.string().optional(),
})
export type CalendarEventSync = z.infer<typeof CalendarEventSyncSchema>

export const NotionTaskExportSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.array(z.string()).default([]),
  dueDate: z.string().optional(),
  contentMarkdown: z.string().max(5000).optional(),
})
export type NotionTaskExport = z.infer<typeof NotionTaskExportSchema>

export const IntegrationSyncRequestSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('google_calendar_sync'),
    event: CalendarEventSyncSchema,
  }),
  z.object({
    kind: z.literal('notion_export'),
    task: NotionTaskExportSchema,
  }),
])
export type IntegrationSyncRequest = z.infer<typeof IntegrationSyncRequestSchema>

export const IntegrationSyncResponseSchema = z.object({
  success: z.boolean(),
  provider: IntegrationProviderSchema,
  externalUrl: z.string().url().optional(),
  receiptId: z.string().min(1),
  message: z.string().min(1),
})
export type IntegrationSyncResponse = z.infer<typeof IntegrationSyncResponseSchema>
