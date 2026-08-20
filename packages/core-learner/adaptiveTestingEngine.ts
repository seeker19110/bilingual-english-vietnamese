// packages/core-learner/adaptiveTestingEngine.ts — Động cơ Kiểm tra Thích ứng Máy tính (Computerized Adaptive Testing - CAT)
// Dựa trên mô hình Item Response Theory (IRT 3PL: 3-Parameter Logistic Model) chuẩn quốc tế.

export interface ItemParameters {
  id: string
  difficultyB: number // Độ khó b: thường trong khoảng [-3.0, +3.0]
  discriminationA: number // Độ phân biệt a: thường trong khoảng [0.5, 2.5]
  guessingC: number // Hệ số đoán mò c: thường trong khoảng [0.0, 0.25] (4 lựa chọn = 0.25)
  category?: string
  targetCefr?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export interface CatSessionState {
  thetaEstimate: number // Ước lượng năng lực hiện tại theta
  standardError: number // Sai số chuẩn SE(theta)
  answeredItemIds: string[]
  responses: Array<{ itemId: string; isCorrect: boolean; thetaAtStep: number }>
  isComplete: boolean
  finalCefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export interface CatConfig {
  minItems: number
  maxItems: number
  targetSeThreshold: number // Dừng khi SE(theta) < threshold (ví dụ: 0.35)
}

export const DEFAULT_CAT_CONFIG: CatConfig = {
  minItems: 10,
  maxItems: 15,
  targetSeThreshold: 0.35,
}

/** Tính xác suất trả lời đúng câu hỏi theo mô hình IRT 3PL: P(theta) = c + (1 - c) / (1 + e^(-1.7 * a * (theta - b))) */
export function calculateProbability3Pl(theta: number, item: ItemParameters): number {
  const exponent = -1.7 * item.discriminationA * (theta - item.difficultyB)
  const logistic = 1 / (1 + Math.exp(exponent))
  return item.guessingC + (1 - item.guessingC) * logistic
}

/** Tính hàm thông tin Fisher I(theta) của một câu hỏi tại mức năng lực theta */
export function calculateFisherInformation(theta: number, item: ItemParameters): number {
  const p = calculateProbability3Pl(theta, item)
  const q = 1 - p
  const exponent = -1.7 * item.discriminationA * (theta - item.difficultyB)
  const logistic = 1 / (1 + Math.exp(exponent))

  // Đạo hàm P'(theta)
  const pPrime = 1.7 * item.discriminationA * (1 - item.guessingC) * logistic * (1 - logistic)
  if (p === 0 || q === 0) return 0
  return (pPrime * pPrime) / (p * q)
}

/** Chọn câu hỏi tối ưu tiếp theo mang lại lượng thông tin Fisher lớn nhất tại theta hiện tại */
export function selectNextOptimalItem(
  currentTheta: number,
  itemBank: ItemParameters[],
  answeredItemIds: string[],
): ItemParameters | null {
  const remainingItems = itemBank.filter((item) => !answeredItemIds.includes(item.id))
  if (remainingItems.length === 0) return null

  let bestItem: ItemParameters | null = null
  let maxInfo = -1

  for (const item of remainingItems) {
    const info = calculateFisherInformation(currentTheta, item)
    if (info > maxInfo) {
      maxInfo = info
      bestItem = item
    }
  }

  return bestItem
}

/** Ước lượng năng lực EAP (Expected A Posteriori) bằng tích phân số học Gauss-Hermite / Phân phối đều trên lưới 41 điểm [-3, +3] */
export function estimateThetaEap(
  responses: Array<{ item: ItemParameters; isCorrect: boolean }>,
  priorMean: number = 0,
  priorSd: number = 1,
): { theta: number; se: number } {
  if (responses.length === 0) {
    return { theta: priorMean, se: priorSd }
  }

  const NUM_POINTS = 61
  const MIN_THETA = -3.0
  const MAX_THETA = 3.0
  const STEP = (MAX_THETA - MIN_THETA) / (NUM_POINTS - 1)

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < NUM_POINTS; i++) {
    const node = MIN_THETA + i * STEP
    // Hàm mật độ tiên nghiệm Chuẩn Gauss: f(theta)
    const prior =
      (1 / (priorSd * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((node - priorMean) / priorSd, 2))

    // Hàm hợp lý Likelihood L(X|theta)
    let likelihood = 1.0
    for (const res of responses) {
      const p = calculateProbability3Pl(node, res.item)
      likelihood *= res.isCorrect ? p : 1 - p
    }

    const posteriorWeight = likelihood * prior
    numerator += node * posteriorWeight * STEP
    denominator += posteriorWeight * STEP
  }

  if (denominator === 0) {
    return { theta: priorMean, se: priorSd }
  }

  const thetaEstimate = numerator / denominator

  // Tính phương sai hậu nghiệm Var(theta) và sai số chuẩn SE(theta)
  let varianceNumerator = 0
  for (let i = 0; i < NUM_POINTS; i++) {
    const node = MIN_THETA + i * STEP
    const prior =
      (1 / (priorSd * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((node - priorMean) / priorSd, 2))

    let likelihood = 1.0
    for (const res of responses) {
      const p = calculateProbability3Pl(node, res.item)
      likelihood *= res.isCorrect ? p : 1 - p
    }

    const posteriorWeight = likelihood * prior
    varianceNumerator += Math.pow(node - thetaEstimate, 2) * posteriorWeight * STEP
  }

  const variance = varianceNumerator / denominator
  const standardError = Math.sqrt(Math.max(0.01, variance))

  return {
    theta: Math.round(thetaEstimate * 100) / 100,
    se: Math.round(standardError * 100) / 100,
  }
}

/** Ánh xạ giá trị năng lực theta sang bậc CEFR chuẩn */
export function mapThetaToCefr(theta: number): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
  if (theta < -1.5) return 'A1'
  if (theta < -0.5) return 'A2'
  if (theta < 0.5) return 'B1'
  if (theta < 1.5) return 'B2'
  if (theta < 2.3) return 'C1'
  return 'C2'
}

/** Cập nhật trạng thái phiên kiểm tra thích ứng sau khi học viên trả lời một câu hỏi */
export function processCatResponse(
  currentState: CatSessionState,
  answeredItem: ItemParameters,
  isCorrect: boolean,
  itemBank: ItemParameters[],
  config: CatConfig = DEFAULT_CAT_CONFIG,
): CatSessionState {
  const updatedResponses = [
    ...currentState.responses,
    {
      itemId: answeredItem.id,
      isCorrect,
      thetaAtStep: currentState.thetaEstimate,
    },
  ]

  const mappedHistory = updatedResponses.map((r) => {
    const foundItem = itemBank.find((it) => it.id === r.itemId) || answeredItem
    return { item: foundItem, isCorrect: r.isCorrect }
  })

  const { theta, se } = estimateThetaEap(mappedHistory)
  const answeredCount = updatedResponses.length

  const reachedMin = answeredCount >= config.minItems
  const reachedMax = answeredCount >= config.maxItems
  const reachedPrecision = se <= config.targetSeThreshold && reachedMin

  const isComplete = reachedMax || reachedPrecision
  const finalCefrLevel = isComplete ? mapThetaToCefr(theta) : undefined

  return {
    thetaEstimate: theta,
    standardError: se,
    answeredItemIds: [...currentState.answeredItemIds, answeredItem.id],
    responses: updatedResponses,
    isComplete,
    finalCefrLevel,
  }
}
