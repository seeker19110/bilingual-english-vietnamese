// packages/core-personal/metacognitiveReflectionService.ts — V5 Flagship Metacognitive & Socratic Reflection Engine.
import {
  MetacognitiveReflection,
  IdentifiedBias,
  SocraticDailyPrompt,
  MetacognitiveSummary,
  CognitiveBiasType,
} from '@dhcb/core-contracts/metacognitiveReflection'

export class MetacognitiveReflectionService {
  /**
   * Sinh câu hỏi phản tỉnh Socratic hàng ngày dựa trên miền chuyên sâu và ngữ cảnh gần nhất.
   */
  static generateDailySocraticPrompt(
    domain: 'learning' | 'career' | 'work' | 'startup' | 'life',
    contextAnchor?: string,
  ): SocraticDailyPrompt {
    const promptLibrary: Record<
      string,
      { theme: string; promptText: string; deepDivingQuestion: string }[]
    > = {
      learning: [
        {
          theme: 'Tự đánh giá năng lực & Điểm mù tri thức',
          promptText:
            'Khi đối mặt với kiến thức phức tạp hôm nay, bạn có nhận ra lúc nào sự hiểu biết thực tế khác với cảm giác "tưởng mình đã hiểu"?',
          deepDivingQuestion:
            'Nếu phải giải thích lại khái niệm này cho một đứa trẻ 10 tuổi mà không nhìn tài liệu, bạn sẽ bị khựng ở bước nào?',
        },
        {
          theme: 'Chiến lược vượt ngưỡng khó khăn',
          promptText:
            'Khi gặp một câu hỏi trắc nghiệm hoặc bài tập khiến bạn bối rối, phản xạ tự nhiên đầu tiên của bạn là gì?',
          deepDivingQuestion:
            'Phản xạ đó đang giúp bạn tiến bộ hay đang là một cơ chế né tránh cảm giác khó chịu?',
        },
      ],
      career: [
        {
          theme: 'Định vị giá trị & Quyết định phát triển',
          promptText:
            'Quyết định sự nghiệp gần nhất của bạn được thúc đẩy bởi mong muốn tạo giá trị thực chất hay nỗi sợ bị tụt hậu?',
          deepDivingQuestion:
            'Lựa chọn nào sẽ mang lại quyền tự quyết cao nhất cho bạn trong 2 năm tới?',
        },
      ],
      work: [
        {
          theme: 'Tối ưu hóa dòng chảy công việc & Quản trị năng lượng',
          promptText:
            'Những tác vụ nào hôm nay thực sự tạo ra đòn bẩy cao nhất, và những tác vụ nào chỉ là bận rộn hình thức?',
          deepDivingQuestion:
            'Nếu chỉ được giữ lại 20% đầu việc để tạo ra 80% kết quả, bạn sẽ loại bỏ tác vụ nào ngay lập tức?',
        },
      ],
      startup: [
        {
          theme: 'Kiểm chứng giả định thị trường',
          promptText:
            'Giả định cốt lõi nào trong mô hình của bạn chưa từng được kiểm chứng bằng hành vi trả tiền thực tế của khách hàng?',
          deepDivingQuestion:
            'Bằng chứng nghịch đảo (Counter-evidence) nào nếu xuất hiện sẽ buộc bạn phải đổi hướng (pivot)?',
        },
      ],
      life: [
        {
          theme: 'Cân bằng nội tại & Khả năng phục hồi',
          promptText:
            'Cảm xúc mạnh nhất bạn trải qua hôm nay là gì, và thông điệp ngầm bên dưới cảm xúc đó muốn nói với bạn điều gì?',
          deepDivingQuestion:
            'Làm thế nào để bạn đối xử với bản thân bằng sự trắc ẩn nhưng vẫn giữ vững kỷ luật?',
        },
      ],
    }

    const defaultFallback = [
      {
        theme: 'Tự đánh giá năng lực & Điểm mù tri thức',
        promptText:
          'Khi đối mặt với kiến thức phức tạp hôm nay, bạn có nhận ra lúc nào sự hiểu biết thực tế khác với cảm giác "tưởng mình đã hiểu"?',
        deepDivingQuestion:
          'Nếu phải giải thích lại khái niệm này cho một đứa trẻ 10 tuổi mà không nhìn tài liệu, bạn sẽ bị khựng ở bước nào?',
      },
    ]

    const domainList = promptLibrary[domain] || defaultFallback
    const selected =
      domainList[Math.floor(Math.random() * domainList.length)] || defaultFallback[0]!

    return {
      id: `socratic-${domain}-${Date.now()}`,
      domain,
      theme: selected.theme,
      promptText: selected.promptText,
      deepDivingQuestion: selected.deepDivingQuestion,
      contextAnchor,
    }
  }

  /**
   * Phân tích văn bản phản tỉnh của người dùng, nhận diện bẫy tư duy và tính toán Metacognitive Awareness Index.
   */
  static analyzeReflection(
    personId: string,
    params: {
      title?: string
      domain: 'learning' | 'career' | 'work' | 'startup' | 'life'
      reflectionPrompt: string
      userReflection: string
    },
  ): MetacognitiveReflection {
    const text = params.userReflection.toLowerCase()
    const identifiedBiases: IdentifiedBias[] = []
    const ahaMoments: string[] = []

    // 1. Phân tích thiên kiến nhận thức (Cognitive Biases)
    if (
      text.includes('chắc chắn') ||
      text.includes('dễ ợt') ||
      text.includes('quá đơn giản') ||
      text.includes('ai cũng biết')
    ) {
      identifiedBiases.push({
        biasType: 'overconfidence',
        biasName: 'Thiên kiến tự tin thái quá (Overconfidence Bias)',
        explanation: 'Bạn có thể đang đánh giá thấp độ phức tạp tiềm ẩn của vấn đề.',
        antidotePrompt: 'Hãy thử tìm 3 tình huống ngoại lệ mà giả định này không còn đúng.',
        severity: 'moderate',
      })
    }

    if (
      text.includes('sợ sai') ||
      text.includes('nghĩ mãi') ||
      text.includes('chưa đủ hoàn hảo') ||
      text.includes('chưa sẵn sàng')
    ) {
      identifiedBiases.push({
        biasType: 'analysis_paralysis',
        biasName: 'Tê liệt phân tích (Analysis Paralysis)',
        explanation: 'Xu hướng cầu toàn dẫn đến chần chừ hành động thực tế.',
        antidotePrompt: 'Áp dụng nguyên lý MVP cá nhân: Hoàn thành một bản nháp thô trong 15 phút.',
        severity: 'high',
      })
    }

    if (
      text.includes('may mắn') ||
      text.includes('không xứng đáng') ||
      text.includes('sợ bị phát hiện')
    ) {
      identifiedBiases.push({
        biasType: 'imposter_syndrome',
        biasName: 'Hội chứng kẻ giả mạo (Imposter Syndrome)',
        explanation: 'Gán thành tựu cho yếu tố ngẫu nhiên thay vì năng lực thực tế.',
        antidotePrompt:
          'Liệt kê 3 bằng chứng cụ thể về sự nỗ lực và kỹ năng đã tạo ra kết quả này.',
        severity: 'moderate',
      })
    }

    if (
      text.includes('tiếc công') ||
      text.includes('đã bỏ ra nhiều') ||
      text.includes('không thể bỏ')
    ) {
      identifiedBiases.push({
        biasType: 'sunk_cost',
        biasName: 'Bẫy chi phí chìm (Sunk Cost Fallacy)',
        explanation:
          'Tiếp tục đầu tư nguồn lực vào quyết định không hiệu quả chỉ vì đã lỡ dồn công sức.',
        antidotePrompt:
          'Nếu bắt đầu lại từ số 0 vào hôm nay, bạn có tiếp tục chọn con đường này không?',
        severity: 'high',
      })
    }

    if (identifiedBiases.length === 0) {
      identifiedBiases.push({
        biasType: 'none',
        biasName: 'Tư duy trung dung & Cởi mở',
        explanation: 'Không phát hiện thiên kiến nhận thức nổi cộm.',
        antidotePrompt: 'Tiếp tục duy trì trạng thái quan sát khách quan.',
        severity: 'low',
      })
    }

    // 2. Trích xuất Aha! Moments
    if (
      text.includes('nhận ra') ||
      text.includes('vỡ lẽ') ||
      text.includes('hóa ra') ||
      text.includes('bài học')
    ) {
      const sentences = params.userReflection.split(/[.!?\n]/).filter((s) => s.trim().length > 15)
      const matching = sentences.find(
        (s) =>
          s.toLowerCase().includes('nhận ra') ||
          s.toLowerCase().includes('vỡ lẽ') ||
          s.toLowerCase().includes('hóa ra') ||
          s.toLowerCase().includes('bài học'),
      )
      if (matching) {
        ahaMoments.push(matching.trim())
      }
    }

    if (ahaMoments.length === 0) {
      ahaMoments.push('Nhận thức rõ ràng hơn về phản ứng cảm xúc và thói quen tư duy của bản thân.')
    }

    // 3. Tính toán Metacognitive Index & Growth Mindset Score
    const wordCount = params.userReflection.trim().split(/\s+/).length
    const depthScore = Math.min(100, Math.round(wordCount * 1.5 + 40))
    const biasClarityBonus = identifiedBiases.filter((b) => b.biasType !== 'none').length * 10
    const metacognitiveIndex = Math.min(100, Math.max(30, depthScore + biasClarityBonus))

    const growthMindsetScore =
      text.includes('cải thiện') ||
      text.includes('thay đổi') ||
      text.includes('thử nghiệm') ||
      text.includes('học hỏi')
        ? 90
        : 75

    // 4. Sinh Socratic Follow-up
    const socraticFollowUps = [
      'Điều gì sẽ xảy ra nếu bạn hành động hoàn toàn trái ngược với thói quen cũ trong vòng 24 giờ tới?',
      'Làm thế nào để biến nhận thức này thành một quy tắc thực thi (If-Then Rule) cụ thể?',
    ]

    return {
      id: `refl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      personId,
      title:
        params.title ||
        `Nhật ký nhận thức: ${params.domain.toUpperCase()} - ${new Date().toLocaleDateString('vi-VN')}`,
      domain: params.domain,
      reflectionPrompt: params.reflectionPrompt,
      userReflection: params.userReflection,
      ahaMoments,
      identifiedBiases,
      metacognitiveIndex,
      growthMindsetScore,
      socraticFollowUps,
      actionCommitment: `Tôi cam kết áp dụng bài học này vào hành động thực tế tiếp theo.`,
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Tạo tóm tắt tiến trình nhận thức tổng thể.
   */
  static summarizeReflections(reflections: MetacognitiveReflection[]): MetacognitiveSummary {
    if (reflections.length === 0) {
      return {
        overallAwarenessIndex: 0,
        totalReflectionsCount: 0,
        topDetectedBiases: [],
        mindsetTrend: 'needs_reflection',
        recentAhaMoments: [],
      }
    }

    const avgAwareness = Math.round(
      reflections.reduce((acc, cur) => acc + cur.metacognitiveIndex, 0) / reflections.length,
    )

    const allBiases = reflections
      .flatMap((r) => r.identifiedBiases.map((b) => b.biasType))
      .filter((b) => b !== 'none')
    const biasFrequency: Record<string, number> = {}
    for (const b of allBiases) {
      biasFrequency[b] = (biasFrequency[b] || 0) + 1
    }
    const topBiases = Object.keys(biasFrequency)
      .sort((a, b) => (biasFrequency[b] ?? 0) - (biasFrequency[a] ?? 0))
      .slice(0, 3) as CognitiveBiasType[]

    const ahaMoments = reflections.flatMap((r) => r.ahaMoments).slice(0, 5)

    return {
      overallAwarenessIndex: avgAwareness,
      totalReflectionsCount: reflections.length,
      topDetectedBiases: topBiases,
      mindsetTrend: avgAwareness >= 80 ? 'accelerating' : 'stable',
      recentAhaMoments: ahaMoments,
    }
  }
}
