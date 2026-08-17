// packages/core-contracts/work.ts — Contract cho Work Domain (V2-15).
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const WORK_SCHEMA_VERSION = 1

export const WorkProjectStatusSchema = z.enum(['active', 'completed', 'archived'])

export const WorkProjectSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: WorkProjectStatusSchema,
    deadline: IsoDateTimeSchema.optional(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  WORK_SCHEMA_VERSION,
)

export const WorkTaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export const WorkTaskStatusSchema = z.enum(['todo', 'in_progress', 'blocked', 'done'])

export const WorkTaskSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    projectId: UuidSchema.optional(),
    title: z.string().min(1).max(200),
    priority: WorkTaskPrioritySchema,
    status: WorkTaskStatusSchema,
    dueAt: IsoDateTimeSchema.optional(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  WORK_SCHEMA_VERSION,
)

export const WorkMeetingSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    title: z.string().min(1).max(200),
    scheduledAt: IsoDateTimeSchema,
    durationMinutes: z.number().int().positive(),
    summary: z.string().max(2000).optional(),
    actionItems: z.array(z.string().min(1).max(500)),
    createdAt: IsoDateTimeSchema,
  },
  WORK_SCHEMA_VERSION,
)

export const WorkDocumentTypeSchema = z.enum(['spec', 'minutes', 'proposal', 'report', 'note'])

export const WorkDocumentSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    projectId: UuidSchema.optional(),
    title: z.string().min(1).max(200),
    documentType: WorkDocumentTypeSchema,
    summary: z.string().min(1).max(2000),
    contentUri: z.string().max(500).optional(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  WORK_SCHEMA_VERSION,
)

export type WorkProject = z.infer<typeof WorkProjectSchema>
export type WorkTask = z.infer<typeof WorkTaskSchema>
export type WorkMeeting = z.infer<typeof WorkMeetingSchema>
export type WorkDocument = z.infer<typeof WorkDocumentSchema>
