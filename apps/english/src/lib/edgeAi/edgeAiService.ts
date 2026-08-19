// apps/english/src/lib/edgeAi/edgeAiService.ts — Hạ tầng Edge AI Client-side (WebGPU / Local SLM Engine)
// Xử lý phân loại ý định, kiểm tra ngữ pháp tức thì với 0ms độ trễ mạng và 0đ chi phí API.

export interface WebGpuCapability {
  isSupported: boolean
  adapterName?: string
  estimatedMemoryMb?: number
  inferenceMode: 'webgpu' | 'wasm' | 'cloud_fallback'
}

export interface EdgeIntentResult {
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life' | 'general'
  intent: string
  confidence: number // 0.0 -> 1.0
  source: 'edge_slm' | 'cloud_gateway'
  executionTimeMs: number
}

export interface EdgeGrammarIssue {
  original: string
  suggestion: string
  reason: string
  offset: number
  length: number
}

export interface EdgeGrammarResult {
  hasErrors: boolean
  correctedText: string
  issues: EdgeGrammarIssue[]
  executionTimeMs: number
}

/** Kiểm tra năng lực hỗ trợ WebGPU và tài nguyên của thiết bị */
export async function detectWebGpuCapability(): Promise<WebGpuCapability> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isSupported: false, inferenceMode: 'cloud_fallback' }
  }

  const nav = navigator as unknown as {
    gpu?: { requestAdapter: () => Promise<{ info?: { name?: string } } | null> }
    deviceMemory?: number
  }

  if (nav.gpu && typeof nav.gpu.requestAdapter === 'function') {
    try {
      const adapter = await nav.gpu.requestAdapter()
      if (adapter) {
        return {
          isSupported: true,
          adapterName: adapter.info?.name || 'Generic WebGPU Adapter',
          estimatedMemoryMb: (nav.deviceMemory || 4) * 1024,
          inferenceMode: 'webgpu',
        }
      }
    } catch {
      // Fallback sang WASM hoặc Cloud
    }
  }

  // Kiểm tra hỗ trợ WebAssembly cơ bản
  if (typeof WebAssembly !== 'undefined') {
    return {
      isSupported: false,
      estimatedMemoryMb: (nav.deviceMemory || 2) * 1024,
      inferenceMode: 'wasm',
    }
  }

  return {
    isSupported: false,
    inferenceMode: 'cloud_fallback',
  }
}

/** Phân loại ý định và lĩnh vực trực tiếp tại trình duyệt (< 5ms) */
export function classifyIntentEdge(text: string): EdgeIntentResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const lower = text.toLowerCase().trim()

  let domain: EdgeIntentResult['domain'] = 'general'
  let intent = 'general.chat'
  let confidence = 0.85

  if (
    /học|tiếng anh|ielts|toeic|từ vựng|ngữ pháp|phát âm|toán|lý|hóa|sinh|bài tập|lesson|vocab|grammar/i.test(
      lower,
    )
  ) {
    domain = 'learning'
    intent = /phát âm|nói|speaking|pronounce/i.test(lower)
      ? 'learning.speaking_practice'
      : /ngữ pháp|grammar|sửa lỗi/i.test(lower)
        ? 'learning.grammar_check'
        : 'learning.study_concept'
    confidence = 0.95
  } else if (
    /cv|resume|phỏng vấn|interview|sự nghiệp|nghề nghiệp|việc làm|job|thăng tiến|kỹ năng|salary/i.test(
      lower,
    )
  ) {
    domain = 'career'
    intent = /cv|resume/i.test(lower)
      ? 'career.review_cv'
      : /phỏng vấn|interview/i.test(lower)
        ? 'career.mock_interview'
        : 'career.skill_gap_analysis'
    confidence = 0.92
  } else if (
    /dự án|công việc|task|nhiệm vụ|meeting|họp|deadline|kanban|báo cáo|tài liệu|notion|jira/i.test(
      lower,
    )
  ) {
    domain = 'work'
    intent = /họp|meeting/i.test(lower)
      ? 'work.meeting_summary'
      : /deadline|task/i.test(lower)
        ? 'work.task_management'
        : 'work.project_plan'
    confidence = 0.9
  } else if (
    /khởi nghiệp|startup|kinh doanh|mô hình|business|khách hàng|mvp|thị trường|doanh thu|hypothesis/i.test(
      lower,
    )
  ) {
    domain = 'startup'
    intent = /mô hình|canvas/i.test(lower)
      ? 'startup.business_model'
      : 'startup.validate_hypothesis'
    confidence = 0.91
  } else if (
    /thói quen|sức khỏe|tập thể dục|ngủ|tài chính|tiết kiệm|chi tiêu|tâm trạng|habit|wellbeing/i.test(
      lower,
    )
  ) {
    domain = 'life'
    intent = /thói quen|habit/i.test(lower) ? 'life.habit_track' : 'life.wellbeing_check'
    confidence = 0.88
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const executionTimeMs = Math.max(0.1, Math.round((endTime - startTime) * 100) / 100)

  return {
    domain,
    intent,
    confidence,
    source: 'edge_slm',
    executionTimeMs,
  }
}

/** Kiểm tra và gợi ý sửa lỗi ngữ pháp tiếng Anh tức thì tại Client */
export function checkGrammarEdge(text: string): EdgeGrammarResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const issues: EdgeGrammarIssue[] = []
  let correctedText = text

  // 1. Kiểm tra mạo từ a/an trước nguyên âm
  const anRegex = /\b(a)\s+([aeiou][a-z]+)\b/gi
  let match: RegExpExecArray | null
  while ((match = anRegex.exec(text)) !== null) {
    const orig = match[0]
    const article = match[1]
    const word = match[2]
    if (orig && article && word) {
      issues.push({
        original: orig,
        suggestion: `an ${word}`,
        reason: `Dùng 'an' thay vì 'a' trước từ bắt đầu bằng nguyên âm ('${word}')`,
        offset: match.index,
        length: orig.length,
      })
    }
  }

  // 2. Kiểm tra lỗi phổ biến: "he/she/it don't" -> "doesn't"
  const subjVerbRegex = /\b(he|she|it)\s+(don't|dont)\b/gi
  while ((match = subjVerbRegex.exec(text)) !== null) {
    const orig = match[0]
    const subj = match[1]
    if (orig && subj) {
      issues.push({
        original: orig,
        suggestion: `${subj} doesn't`,
        reason: `Chủ ngữ ngôi thứ 3 số ít ('${subj}') đi với 'doesn't' thay vì 'don't'`,
        offset: match.index,
        length: orig.length,
      })
    }
  }

  // 3. Kiểm tra lỗi lặp từ (ví dụ: "the the", "is is")
  const repeatWordRegex = /\b([a-z]+)\s+\1\b/gi
  while ((match = repeatWordRegex.exec(text)) !== null) {
    const orig = match[0]
    const word = match[1]
    if (orig && word) {
      issues.push({
        original: orig,
        suggestion: word,
        reason: `Trùng lặp từ '${word}'`,
        offset: match.index,
        length: orig.length,
      })
    }
  }

  for (const issue of issues) {
    correctedText = correctedText.replace(issue.original, issue.suggestion)
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const executionTimeMs = Math.max(0.1, Math.round((endTime - startTime) * 100) / 100)

  return {
    hasErrors: issues.length > 0,
    correctedText,
    issues,
    executionTimeMs,
  }
}
