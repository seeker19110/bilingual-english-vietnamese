// packages/core-personal/capabilityExecutor.ts — Nơi ProposedAction thực sự ĐƯỢC THI HÀNH.
//
// LỖI ĐƯỢC VÁ Ở ĐÂY (phát hiện 2026-08-25): trước file này, `proposedActionService` đánh dấu
// hành động là 'committed' kèm một kết quả ĐÓNG CỨNG `{status:'ok'}` mà KHÔNG hề gọi capability
// nào. Giao diện hiện "✅ Đã thực thi" trong khi không có gì được ghi xuống cơ sở dữ liệu —
// tức là app nói với người dùng một điều không đúng sự thật. Hai hàm ghi thật (`declareFact`,
// `ingestMemory`) đã tồn tại sẵn nhưng chưa nơi nào trong luồng Companion gọi tới.
//
// NGUYÊN TẮC: mọi hàm ở đây chạy TRONG transaction của nơi gọi (nhận `PoolClient`), để việc đổi
// trạng thái hành động và việc ghi dữ liệu thật cùng sống hoặc cùng chết — không bao giờ có cảnh
// hành động ghi 'committed' còn dữ liệu thì không có (đúng lỗi mà file này sinh ra để vá).
import type { PoolClient } from 'pg'
import { ValidationError } from '@dhcb/core-errors/appError'
import { declareFactWithClient } from './personService.js'
import { ingestMemoryWithClient } from './memoryService.js'

/**
 * Những capability GHI vào hồ sơ/ký ức cá nhân — LUÔN phải hỏi người dùng xác nhận trước khi
 * chạy, bất kể Personal Policy cho phép tự động tới đâu (quyết định của người dùng 2026-08-25).
 *
 * Lý do: đây là dữ liệu về CON NGƯỜI thật. AI suy ra sai một điều rồi tự lưu thì người dùng
 * không có cơ hội biết mà sửa, và mọi lượt thoại sau đều bị nhiễm theo.
 */
export const CONFIRMATION_REQUIRED_CAPABILITIES = new Set([
  'profile.update_fact',
  'memory.create_record',
])

export function requiresUserConfirmation(capabilityId: string): boolean {
  return CONFIRMATION_REQUIRED_CAPABILITIES.has(capabilityId)
}

export interface CapabilityExecutionResult {
  /** 'ok' = đã ghi thật · 'no_side_effect' = capability chỉ đọc, không ghi gì. */
  status: 'ok' | 'no_side_effect'
  toolId: string
  executedAt: string
  /** Bằng chứng cụ thể của việc đã ghi (id bản ghi vừa tạo...) để tra ngược lại được. */
  detail: Record<string, unknown>
}

/** Rút một chuỗi không rỗng từ payload; trả undefined nếu thiếu hoặc sai kiểu. */
function readString(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Thi hành thật một capability, bên trong transaction của nơi gọi.
 *
 * Capability chưa có đường ghi thật thì NÉM LỖI, không âm thầm báo thành công — thà người dùng
 * thấy "không thực hiện được" còn hơn tin rằng thứ mình vừa nói đã được lưu.
 */
export async function executeCapability(
  client: PoolClient,
  personId: string,
  capabilityId: string,
  payload: Record<string, unknown>,
  actor: string,
): Promise<CapabilityExecutionResult> {
  const executedAt = new Date().toISOString()

  switch (capabilityId) {
    case 'profile.update_fact': {
      // Companion planner đặt cả câu người dùng vừa nói vào `rawText`. Chưa có bước bóc tách
      // key/value tinh vi, nên lưu nguyên văn dưới một key cố định — thà lưu thô mà đúng còn hơn
      // đoán bừa cấu trúc rồi ghi sai sự thật về con người.
      const content = readString(payload, 'rawText') ?? readString(payload, 'value')
      if (!content) {
        throw new ValidationError('Thiếu nội dung để ghi vào hồ sơ (rawText/value)')
      }

      const fact = await declareFactWithClient(client, {
        personId,
        namespace: readString(payload, 'namespace') ?? 'companion',
        key: readString(payload, 'key') ?? 'self_description',
        value: content,
        // 'observed' = AI quan sát thấy trong hội thoại. KHÔNG dùng 'user_declared' — nhãn đó
        // dành cho lúc người dùng tự điền vào form hồ sơ, không phải AI suy ra hộ.
        origin: 'observed',
        confidence:
          typeof payload.confidence === 'number' &&
          payload.confidence > 0 &&
          payload.confidence <= 1
            ? payload.confidence
            : 0.85,
        source: { type: 'companion_conversation', occurredAt: executedAt },
        sensitivity: 'personal',
      })

      return {
        status: 'ok',
        toolId: capabilityId,
        executedAt,
        detail: { factId: fact.id, namespace: fact.namespace, key: fact.key },
      }
    }

    case 'memory.create_record': {
      const content = readString(payload, 'content')
      if (!content) {
        throw new ValidationError('Thiếu nội dung để lưu vào ký ức (content)')
      }

      const { record, evaluation } = await ingestMemoryWithClient(
        client,
        personId,
        {
          namespace: (readString(payload, 'namespace') ?? 'semantic') as 'semantic',
          content,
          provenance: 'companion:conversation',
          sensitivity: (readString(payload, 'sensitivity') ?? 'personal') as 'personal',
        },
        actor,
      )

      return {
        status: 'ok',
        toolId: capabilityId,
        executedAt,
        detail: { recordId: record.id, outcome: evaluation.outcome },
      }
    }

    case 'learning.update_goal': {
      // Chưa nối vào Goal Engine (life_goals) — nhưng KHÔNG vì thế mà báo thành công suông.
      // Lưu như một fact thuộc namespace 'learning': Context Engine đọc facts mỗi lượt nên mục
      // tiêu vẫn được AI nhớ thật. `detail.storedAs` ghi rõ đang lưu tạm ở đâu để sau này dời.
      const content = readString(payload, 'rawMessage') ?? readString(payload, 'goal')
      if (!content) {
        throw new ValidationError('Thiếu nội dung mục tiêu để ghi (rawMessage/goal)')
      }

      const fact = await declareFactWithClient(client, {
        personId,
        namespace: 'learning',
        key: 'goal',
        value: content,
        origin: 'observed',
        confidence: 0.85,
        source: { type: 'companion_conversation', occurredAt: executedAt },
        sensitivity: 'personal',
      })

      return {
        status: 'ok',
        toolId: capabilityId,
        executedAt,
        detail: { factId: fact.id, storedAs: 'personal_fact:learning.goal' },
      }
    }

    case 'dictionary.lookup':
      // Tra từ điển KHÔNG ghi gì xuống DB — nói thẳng là "không có tác dụng phụ" thay vì báo
      // 'ok' làm người đọc log tưởng vừa có dữ liệu được lưu.
      return { status: 'no_side_effect', toolId: capabilityId, executedAt, detail: {} }

    default:
      throw new ValidationError(
        `Capability '${capabilityId}' chưa có đường thi hành thật — không thể báo là đã thực hiện`,
      )
  }
}
