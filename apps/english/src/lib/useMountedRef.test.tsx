import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMountedRef } from './useMountedRef'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let mountedRefFromConsumer: { current: boolean } | undefined

function Consumer() {
  mountedRefFromConsumer = useMountedRef()
  return null
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  mountedRefFromConsumer = undefined
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  container.remove()
})

describe('useMountedRef', () => {
  it('đang mount → .current là true', async () => {
    await act(async () => {
      root.render(<Consumer />)
    })
    expect(mountedRefFromConsumer?.current).toBe(true)
  })

  it('unmount → .current chuyển thành false', async () => {
    await act(async () => {
      root.render(<Consumer />)
    })
    await act(async () => {
      root.unmount()
    })
    expect(mountedRefFromConsumer?.current).toBe(false)
  })
})
