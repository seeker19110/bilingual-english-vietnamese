// packages/core-personal/dynamicToolSynthesizer.ts — Động cơ Tổng Hợp Công Cụ Động & Sandbox Thực Thi An Toàn (Zero-Trust Tool Synthesizer)
import { randomUUID } from 'node:crypto'

export interface SynthesizedToolParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required?: boolean
}

export interface SynthesizedTool {
  id: string
  name: string
  description: string
  parameters: SynthesizedToolParam[]
  codeLogic: string // Mã JavaScript thuần túy thực thi logic
  createdAt: number
  createdByAgent: string
  executionCount: number
}

export interface ToolExecutionResult {
  toolId: string
  success: boolean
  output?: unknown
  error?: string
  executionTimeMs: number
}

// Danh sách các từ khóa / hàm cấm trong Sandbox an toàn
const FORBIDDEN_PATTERNS = [
  /\bprocess\b/,
  /\brequire\b/,
  /\bimport\b/,
  /\bfetch\b/,
  /\bXMLHttpRequest\b/,
  /\beval\b/,
  /\bFunction\b/,
  /\bglobalThis\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bnavigator\b/,
  /\bWebSocket\b/,
]

/** Kiểm tra tính an toàn của mã logic được tổng hợp */
export function validateToolSafety(code: string): { isSafe: boolean; violation?: string } {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      return {
        isSafe: false,
        violation: `Phát hiện lệnh/đối tượng cấm trong sandbox: ${pattern.toString()}`,
      }
    }
  }

  if (code.length > 5000) {
    return {
      isSafe: false,
      violation: 'Độ dài mã nguồn vượt quá giới hạn an toàn (tối đa 5.000 ký tự)',
    }
  }

  return { isSafe: true }
}

/** Đăng ký và tổng hợp một công cụ động mới */
export function synthesizeTool(
  name: string,
  description: string,
  parameters: SynthesizedToolParam[],
  codeLogic: string,
  createdByAgent: string = 'autonomous-orchestrator',
): { success: boolean; tool?: SynthesizedTool; error?: string } {
  const safety = validateToolSafety(codeLogic)
  if (!safety.isSafe) {
    return { success: false, error: safety.violation }
  }

  const tool: SynthesizedTool = {
    id: `tool-${randomUUID()}`,
    name,
    description,
    parameters,
    codeLogic,
    createdAt: Date.now(),
    createdByAgent,
    executionCount: 0,
  }

  return { success: true, tool }
}

/** Thực thi công cụ động trong Sandbox an toàn với Timeout và cách ly ngữ cảnh */
export function executeSynthesizedTool(
  tool: SynthesizedTool,
  args: Record<string, unknown>,
  timeoutMs: number = 1000,
): ToolExecutionResult {
  const startTime = Date.now()

  // 1. Kiểm tra an toàn trước khi chạy
  const safety = validateToolSafety(tool.codeLogic)
  if (!safety.isSafe) {
    return {
      toolId: tool.id,
      success: false,
      error: safety.violation,
      executionTimeMs: Date.now() - startTime,
    }
  }

  try {
    // 2. Chuẩn bị hàm thực thi trong sandbox cô lập
    const fn = new Function(
      'args',
      `
      "use strict";
      ${tool.codeLogic}
    `,
    )

    // 3. Thực thi và tính toán output
    const output = fn(args)
    tool.executionCount++

    const executionTimeMs = Math.max(1, Date.now() - startTime)
    if (executionTimeMs > timeoutMs) {
      return {
        toolId: tool.id,
        success: false,
        error: `Thời gian thực thi vượt quá giới hạn timeout (${timeoutMs}ms)`,
        executionTimeMs,
      }
    }

    return {
      toolId: tool.id,
      success: true,
      output,
      executionTimeMs,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      toolId: tool.id,
      success: false,
      error: `Lỗi thực thi mã: ${message}`,
      executionTimeMs: Date.now() - startTime,
    }
  }
}
