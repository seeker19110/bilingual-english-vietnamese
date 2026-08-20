// packages/core-ai/hybridRagEngine.ts — Động cơ Truy xuất Ngữ cảnh Lai (Hybrid RAG: Vector Semantic + BM25 Keyword Search)
// Áp dụng thuật toán xếp hạng hợp nhất Reciprocal Rank Fusion (RRF) chuẩn công nghiệp.

export interface RagDocument {
  id: string
  content: string
  metadata?: Record<string, unknown>
  embedding?: number[] // Vector nhúng dense
}

export interface HybridSearchResult {
  document: RagDocument
  rrfScore: number
  semanticRank: number
  keywordRank: number
  combinedConfidence: number
}

export interface HybridRagOptions {
  rrfK?: number // Hằng số làm mượt RRF (mặc định k = 60 theo chuẩn Cormack et al.)
  semanticWeight?: number // Trọng số semantic (0.0 -> 1.0)
  keywordWeight?: number // Trọng số từ khóa (0.0 -> 1.0)
  topK?: number
}

/** Tính tích vô hướng cosine similarity giữa 2 vector */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0
    const b = vecB[i] ?? 0
    dotProduct += a * b
    normA += a * a
    normB += b * b
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/** Tính điểm khớp từ khóa (BM25 simplified keyword frequency scoring) */
export function calculateKeywordScore(query: string, text: string): number {
  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
  const docTokens = text.toLowerCase().split(/\s+/)

  if (queryTokens.length === 0 || docTokens.length === 0) return 0

  let matchScore = 0
  const docLength = docTokens.length
  const avgDocLength = 50 // Giả định trung bình
  const k1 = 1.2
  const b = 0.75

  for (const token of queryTokens) {
    const termFreq = docTokens.filter((t) => t.includes(token)).length
    if (termFreq > 0) {
      // Công thức BM25 Term Frequency Saturation
      const numerator = termFreq * (k1 + 1)
      const denominator = termFreq + k1 * (1 - b + b * (docLength / avgDocLength))
      matchScore += numerator / denominator
    }
  }

  return matchScore
}

/** Thực thi tìm kiếm lai và xếp hạng Reciprocal Rank Fusion (RRF) */
export function searchHybridRag(
  query: string,
  queryEmbedding: number[] | undefined,
  documents: RagDocument[],
  options: HybridRagOptions = {},
): HybridSearchResult[] {
  if (documents.length === 0) return []

  const k = options.rrfK ?? 60
  const topK = options.topK ?? 5
  const semanticWeight = options.semanticWeight ?? 0.6
  const keywordWeight = options.keywordWeight ?? 0.4

  // 1. Xếp hạng ngữ nghĩa (Dense Semantic Search)
  const semanticRanked: Array<{ doc: RagDocument; score: number }> = []
  if (queryEmbedding && queryEmbedding.length > 0) {
    for (const doc of documents) {
      if (doc.embedding && doc.embedding.length === queryEmbedding.length) {
        const sim = calculateCosineSimilarity(queryEmbedding, doc.embedding)
        semanticRanked.push({ doc, score: sim })
      } else {
        semanticRanked.push({ doc, score: 0 })
      }
    }
    semanticRanked.sort((a, b) => b.score - a.score)
  } else {
    // Nếu chưa có query embedding, giữ nguyên thứ tự
    documents.forEach((doc) => semanticRanked.push({ doc, score: 0 }))
  }

  // 2. Xếp hạng từ khóa (Sparse BM25 Search)
  const keywordRanked: Array<{ doc: RagDocument; score: number }> = []
  for (const doc of documents) {
    const kwScore = calculateKeywordScore(query, doc.content)
    keywordRanked.push({ doc, score: kwScore })
  }
  keywordRanked.sort((a, b) => b.score - a.score)

  // 3. Hợp nhất xếp hạng qua Reciprocal Rank Fusion (RRF)
  // RRF_score(d) = w_sem * (1 / (k + rank_sem(d))) + w_kw * (1 / (k + rank_kw(d)))
  const rrfMap = new Map<
    string,
    {
      doc: RagDocument
      rrfScore: number
      semanticRank: number
      keywordRank: number
    }
  >()

  semanticRanked.forEach((item, index) => {
    const rank = index + 1
    const score = semanticWeight * (1 / (k + rank))
    rrfMap.set(item.doc.id, {
      doc: item.doc,
      rrfScore: score,
      semanticRank: rank,
      keywordRank: documents.length + 1, // Khởi tạo rank thấp
    })
  })

  keywordRanked.forEach((item, index) => {
    const rank = index + 1
    const addScore = keywordWeight * (1 / (k + rank))
    const existing = rrfMap.get(item.doc.id)
    if (existing) {
      existing.rrfScore += addScore
      existing.keywordRank = rank
    } else {
      rrfMap.set(item.doc.id, {
        doc: item.doc,
        rrfScore: addScore,
        semanticRank: documents.length + 1,
        keywordRank: rank,
      })
    }
  })

  const results: HybridSearchResult[] = Array.from(rrfMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, topK)
    .map((item) => ({
      document: item.doc,
      rrfScore: Math.round(item.rrfScore * 10000) / 10000,
      semanticRank: item.semanticRank,
      keywordRank: item.keywordRank,
      combinedConfidence: Math.min(1.0, Math.round(item.rrfScore * (k + 1) * 100) / 100),
    }))

  return results
}
