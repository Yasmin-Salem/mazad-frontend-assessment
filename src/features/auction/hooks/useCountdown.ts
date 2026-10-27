import { useEffect, useState } from 'react'
import { getCountdown, type CountdownValue } from '../model/countdown'

const systemNow = () => Date.now()

export type UseCountdownOptions = {
  tickMs?: number
  now?: () => number
  onTimeObserved?: (observedAt: number) => void
}

export function useCountdown(
  endsAt: number,
  {
    tickMs = 1000,
    now = systemNow,
    onTimeObserved,
  }: UseCountdownOptions = {},
): CountdownValue {
  const [observedAt, setObservedAt] = useState(() => now())
  const countdown = getCountdown(endsAt, observedAt)

  useEffect(() => {
    if (countdown.isExpired) return

    const synchronize = () => {
      const nextObservedAt = now()
      setObservedAt(nextObservedAt)
      onTimeObserved?.(nextObservedAt)
    }
    const intervalId = globalThis.setInterval(synchronize, Math.max(100, tickMs))
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') synchronize()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      globalThis.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [countdown.isExpired, now, onTimeObserved, tickMs])

  return countdown
}
