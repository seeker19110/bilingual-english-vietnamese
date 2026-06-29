// Rate limiting hook — khóa API trong khoảng thời gian nhất định để tránh spam
import { useState, useEffect, useRef } from 'react'

interface UseApiThrottleOptions {
  delayMs?: number // Khoảng thời gian giữa các lần gọi (mặc định: 10000ms = 10s)
  onCountdown?: (remaining: number) => void // Callback mỗi khi countdown thay đổi
}

export function useApiThrottle(options: UseApiThrottleOptions = {}) {
  const { delayMs = 10000, onCountdown } = options
  const [isThrottled, setIsThrottled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const throttle = () => {
    if (isThrottled) return

    setIsThrottled(true)
    let remaining = Math.ceil(delayMs / 1000) // Đếm theo giây

    setCountdown(remaining)
    onCountdown?.(remaining)

    // Cập nhật countdown mỗi 100ms (để hiển thị smooth)
    intervalRef.current = setInterval(() => {
      remaining -= 0.1
      const roundedRemaining = Math.ceil(remaining)
      setCountdown(roundedRemaining)
      onCountdown?.(roundedRemaining)

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 100)

    // Reset throttle sau delayMs
    timeoutRef.current = setTimeout(() => {
      setIsThrottled(false)
      setCountdown(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      onCountdown?.(0)
    }, delayMs)
  }

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsThrottled(false)
    setCountdown(0)
    onCountdown?.(0)
  }

  return {
    isThrottled,
    countdown, // Số giây còn lại
    throttle, // Gọi để bắt đầu throttle
    reset, // Gọi để reset throttle
  }
}
