// packages/core-ai/compassionateCoachPrompt.test.ts
import { describe, expect, it } from 'vitest'
import {
  formatSupremePrinciplesGuardrail,
  formatLifeStageContext,
  buildCompassionateCoachSystemPrompt,
} from './compassionateCoachPrompt.js'

describe('CompassionateCoachPrompt', () => {
  it('formats the two supreme principles correctly', () => {
    const guardrail = formatSupremePrinciplesGuardrail()
    expect(guardrail).toContain('TUÂN THỦ PHÁP LUẬT TUYỆT ĐỐI')
    expect(guardrail).toContain('YÊU THƯƠNG CON NGƯỜI & LÒNG TRẮC ẨN')
    expect(guardrail).toContain('The Shield of Justice')
    expect(guardrail).toContain('The Infinite Engine of Love')
  })

  it('formats life stage context with benchmarks and traps', () => {
    const context = formatLifeStageContext('upper_secondary')
    expect(context).toContain('THPT')
    expect(context).toContain('Cột mốc Chuẩn mực')
    expect(context).toContain('Cột mốc Vượt ngưỡng')
    expect(context).toContain('Cạm bẫy & Chiến lược Phòng vệ')
    expect(context).toContain('IELTS')
  })

  it('builds a rich system prompt with personal status', () => {
    const prompt = buildCompassionateCoachSystemPrompt({
      learnerName: 'Minh',
      lifeStage: 'university_launchpad',
      currentBottleneck: 'financial',
      unshakeableBeliefIndex: 85,
      logotherapyWhyReason: 'Mong muốn lo cho cha mẹ tuổi già và xây dựng sự nghiệp chính trực',
    })

    expect(prompt).toContain('Minh')
    expect(prompt).toContain('Chỉ số Niềm tin Sắt đá: 85/100')
    expect(prompt).toContain('financial')
    expect(prompt).toContain('Mong muốn lo cho cha mẹ tuổi già')
    expect(prompt).toContain('TUÂN THỦ PHÁP LUẬT')
    expect(prompt).toContain('YÊU THƯƠNG CON NGƯỜI')
    expect(prompt).toContain('Tonic Dopamine')
  })

  it('handles default options when name or metrics are missing', () => {
    const prompt = buildCompassionateCoachSystemPrompt({
      lifeStage: 'early_childhood_primary',
    })

    expect(prompt).toContain('bạn')
    expect(prompt).toContain('Tiểu học')
    expect(prompt).toContain('Đang trong quá trình thiết lập mục tiêu')
  })
})
