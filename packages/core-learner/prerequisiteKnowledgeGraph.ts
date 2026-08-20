// packages/core-learner/prerequisiteKnowledgeGraph.ts — Đồ Thị Tri Thức Tiền Đề & Truy Vết Lỗ Hổng Kiến Thức (Bayesian Knowledge Tracing Engine)

export interface KnowledgeNode {
  id: string
  code: string // ví dụ: "GRAMMAR_INVERSION_ADVANCED", "PRONUNCIATION_IPA_TH"
  title: string
  domain: 'grammar' | 'phonetics' | 'vocabulary' | 'speaking' | 'writing'
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  prerequisiteNodeIds: string[] // Danh sách các ID kiến thức tiền đề bắt buộc
}

export interface BktMasteryState {
  nodeId: string
  pMastery: number // Xác suất học viên đã làm chủ kỹ năng (0.0 -> 1.0)
  pSlip: number // Xác suất biết làm nhưng sẩy chân (mặc định 0.1)
  pGuess: number // Xác suất đoán mò đúng (mặc định 0.2)
  pTransit: number // Xác suất chuyển dịch từ chưa biết sang biết (mặc định 0.15)
  totalAttempts: number
  lastUpdated: number
}

export interface PrerequisiteGapReport {
  targetNodeId: string
  targetNodeTitle: string
  isMastered: boolean
  pMastery: number
  unmasteredPrerequisites: {
    nodeId: string
    code: string
    title: string
    pMastery: number
  }[]
  recommendedBridgingLesson?: {
    lessonTitle: string
    focusNodeId: string
    rationale: string
  }
}

/** Cập nhật xác suất làm chủ kỹ năng theo thuật toán Bayesian Knowledge Tracing (BKT) */
export function updateBktMastery(
  currentState: BktMasteryState,
  isCorrect: boolean,
): BktMasteryState {
  const { pMastery: pOld, pSlip: s, pGuess: g, pTransit: t } = currentState

  // 1. Tính xác suất hậu nghiệm P(L_t | Action)
  let pPosterior: number
  if (isCorrect) {
    // P(L_t | Correct) = [P(L) * (1 - S)] / [P(L) * (1 - S) + (1 - P(L)) * G]
    const numerator = pOld * (1 - s)
    const denominator = numerator + (1 - pOld) * g
    pPosterior = denominator > 0 ? numerator / denominator : pOld
  } else {
    // P(L_t | Incorrect) = [P(L) * S] / [P(L) * S + (1 - P(L)) * (1 - G)]
    const numerator = pOld * s
    const denominator = numerator + (1 - pOld) * (1 - g)
    pPosterior = denominator > 0 ? numerator / denominator : pOld
  }

  // 2. Chuyển dịch trạng thái sang bước tiếp theo: P(L_t+1) = P(L_t | Action) + (1 - P(L_t | Action)) * T
  const pNew = pPosterior + (1 - pPosterior) * t
  const pMastery = Math.min(0.99, Math.max(0.01, Math.round(pNew * 1000) / 1000))

  return {
    ...currentState,
    pMastery,
    totalAttempts: currentState.totalAttempts + 1,
    lastUpdated: Date.now(),
  }
}

/** Truy vết ngược đồ thị DAG để tìm kiếm các lỗ hổng kiến thức tiền đề */
export function tracePrerequisiteGaps(
  targetNodeId: string,
  knowledgeNodes: Map<string, KnowledgeNode>,
  learnerStates: Map<string, BktMasteryState>,
  masteryThreshold: number = 0.7,
): PrerequisiteGapReport {
  const targetNode = knowledgeNodes.get(targetNodeId)
  if (!targetNode) {
    return {
      targetNodeId,
      targetNodeTitle: 'Unknown Node',
      isMastered: false,
      pMastery: 0,
      unmasteredPrerequisites: [],
    }
  }

  const targetState = learnerStates.get(targetNodeId)
  const targetPMastery = targetState?.pMastery || 0.1
  const isMastered = targetPMastery >= masteryThreshold

  const unmasteredPrerequisites: PrerequisiteGapReport['unmasteredPrerequisites'] = []
  const visited = new Set<string>()

  // Duyệt BFS / DFS ngược đồ thị tiền đề
  const queue = [...targetNode.prerequisiteNodeIds]
  while (queue.length > 0) {
    const currId = queue.shift()
    if (!currId || visited.has(currId)) continue
    visited.add(currId)

    const currNode = knowledgeNodes.get(currId)
    if (!currNode) continue

    const state = learnerStates.get(currId)
    const pMastery = state?.pMastery || 0.1

    if (pMastery < masteryThreshold) {
      unmasteredPrerequisites.push({
        nodeId: currNode.id,
        code: currNode.code,
        title: currNode.title,
        pMastery,
      })
    }

    // Tiếp tục duyệt sâu các tiền đề của nút hiện tại
    for (const preId of currNode.prerequisiteNodeIds) {
      if (!visited.has(preId)) {
        queue.push(preId)
      }
    }
  }

  // Đề xuất bài học bắc cầu nếu có tiền đề chưa vững
  let recommendedBridgingLesson: PrerequisiteGapReport['recommendedBridgingLesson'] = undefined
  if (unmasteredPrerequisites.length > 0) {
    const weakestPre = [...unmasteredPrerequisites].sort((a, b) => a.pMastery - b.pMastery)[0]
    if (weakestPre) {
      recommendedBridgingLesson = {
        lessonTitle: `Củng cố nền tảng: ${weakestPre.title}`,
        focusNodeId: weakestPre.nodeId,
        rationale: `Lỗ hổng tại "${weakestPre.title}" (năng lực chỉ đạt ${Math.round(weakestPre.pMastery * 100)}%) đang cản trở việc tiếp thu "${targetNode.title}".`,
      }
    }
  }

  return {
    targetNodeId,
    targetNodeTitle: targetNode.title,
    isMastered,
    pMastery: targetPMastery,
    unmasteredPrerequisites,
    recommendedBridgingLesson,
  }
}
