import { describe, expect, it } from 'vitest'
import { getToolManifest, listToolManifests, validateToolInput } from './toolRegistry.js'
import { NotFoundError, ValidationError } from '../core-errors/appError.js'

describe('toolRegistry', () => {
  it('gets manifest for registered tool', () => {
    const tool = getToolManifest('dictionary.lookup')
    expect(tool.id).toBe('dictionary.lookup')
    expect(tool.sideEffect).toBe('none')
  })

  it('throws NotFoundError for unknown tool', () => {
    expect(() => getToolManifest('unknown.tool')).toThrow(NotFoundError)
  })

  it('lists all registered tools', () => {
    const tools = listToolManifests()
    expect(tools.length).toBeGreaterThanOrEqual(4)
    expect(tools.some((t) => t.id === 'learning.update_goal')).toBe(true)
  })

  it('validates tool input object', () => {
    const tool = getToolManifest('dictionary.lookup')
    expect(() => validateToolInput(tool, { word: 'test' })).not.toThrow()
    expect(() => validateToolInput(tool, null)).toThrow(ValidationError)
    expect(() => validateToolInput(tool, 'string-input')).toThrow(ValidationError)
    expect(() => validateToolInput(tool, 123)).toThrow(ValidationError)
  })
})
