// apps/dhcb/src/lib/chatFormatters.test.ts
import { describe, expect, it } from 'vitest'
import { formatChatPreviewTime, formatMessageTime, getAvatarColor } from './chatFormatters.js'

describe('chatFormatters', () => {
  describe('formatChatPreviewTime', () => {
    it('returns empty string when undefined or null', () => {
      expect(formatChatPreviewTime(undefined)).toBe('')
      expect(formatChatPreviewTime('')).toBe('')
    })

    it('returns "Vừa xong" when less than 1 minute ago', () => {
      const now = new Date().toISOString()
      expect(formatChatPreviewTime(now)).toBe('Vừa xong')
    })

    it('returns "Xp" when within the last hour', () => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      expect(formatChatPreviewTime(tenMinsAgo)).toBe('10p')
    })

    it('returns "HH:mm" when earlier today (> 1 hour)', () => {
      const date = new Date()
      date.setHours(date.getHours() - 3)
      // Make sure it's still today
      if (date.getDate() === new Date().getDate()) {
        const result = formatChatPreviewTime(date.toISOString())
        expect(result).toMatch(/^\d{2}:\d{2}$/)
      }
    })

    it('returns "Hôm qua" when message is from yesterday', () => {
      const now = new Date()
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 0, 0)
      expect(formatChatPreviewTime(yesterday.toISOString())).toBe('Hôm qua')
    })

    it('returns "DD/MM" when older than yesterday', () => {
      const olderDate = new Date('2025-01-15T08:30:00Z')
      const result = formatChatPreviewTime(olderDate.toISOString())
      expect(result).toMatch(/\d{2}\/\d{2}/)
    })
  })

  describe('formatMessageTime', () => {
    it('formats time to HH:mm', () => {
      const date = new Date('2026-08-20T14:05:00')
      const result = formatMessageTime(date.toISOString())
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('getAvatarColor', () => {
    it('returns a deterministic color class for names', () => {
      const color1 = getAvatarColor('Alice')
      const color2 = getAvatarColor('Alice')
      expect(color1).toBe(color2)
      expect(color1).toMatch(/^bg-/)
    })

    it('returns default color for empty name', () => {
      const color = getAvatarColor('')
      expect(color).toMatch(/^bg-/)
    })
  })
})
