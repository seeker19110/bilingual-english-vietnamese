// apps/english/src/lib/edgeAi/useEdgeAi.ts — React Hook tương tác với Edge AI Engine
import { useState, useEffect, useCallback } from 'react'
import {
  detectWebGpuCapability,
  classifyIntentEdge,
  checkGrammarEdge,
  type WebGpuCapability,
  type EdgeIntentResult,
  type EdgeGrammarResult,
} from './edgeAiService.js'

export function useEdgeAi() {
  const [capability, setCapability] = useState<WebGpuCapability>({
    isSupported: false,
    inferenceMode: 'cloud_fallback',
  })
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let mounted = true
    detectWebGpuCapability().then((cap) => {
      if (mounted) {
        setCapability(cap)
        setIsInitializing(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const classifyIntent = useCallback((text: string): EdgeIntentResult => {
    return classifyIntentEdge(text)
  }, [])

  const checkGrammar = useCallback((text: string): EdgeGrammarResult => {
    return checkGrammarEdge(text)
  }, [])

  return {
    capability,
    isInitializing,
    isWebGpuSupported: capability.isSupported,
    inferenceMode: capability.inferenceMode,
    classifyIntent,
    checkGrammar,
  }
}
