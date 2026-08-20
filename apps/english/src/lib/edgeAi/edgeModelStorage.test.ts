import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveModelWeights,
  loadModelWeights,
  checkModelCached,
  purgeModelCache,
  isOpfsSupported,
} from './edgeModelStorage'

describe('edgeModelStorage', () => {
  beforeEach(async () => {
    await purgeModelCache()
  })

  it('detects OPFS support in the environment', () => {
    const supported = isOpfsSupported()
    expect(typeof supported).toBe('boolean')
  })

  it('saves and retrieves model weights ArrayBuffer correctly', async () => {
    const modelId = 'intent_classifier_small'
    const version = 'v1.0'
    const rawData = new Uint8Array([10, 20, 30, 40, 50])

    const saved = await saveModelWeights(modelId, version, rawData)
    expect(saved).toBe(true)

    const isCached = await checkModelCached(modelId, version)
    expect(isCached).toBe(true)

    const loaded = await loadModelWeights(modelId, version)
    expect(loaded).toBeDefined()
    expect(loaded).not.toBeNull()
    if (loaded) {
      const retrieved = new Uint8Array(loaded)
      expect(Array.from(retrieved)).toEqual([10, 20, 30, 40, 50])
    }
  })

  it('returns null when querying un-cached model weights', async () => {
    const loaded = await loadModelWeights('non_existent_model', 'v0')
    expect(loaded).toBeNull()

    const isCached = await checkModelCached('non_existent_model', 'v0')
    expect(isCached).toBe(false)
  })

  it('purges model cache properly', async () => {
    const modelId = 'grammar_model'
    const version = 'v1.0'
    await saveModelWeights(modelId, version, new Uint8Array([1, 2, 3]))

    expect(await checkModelCached(modelId, version)).toBe(true)
    await purgeModelCache()
    expect(await checkModelCached(modelId, version)).toBe(false)
  })
})
