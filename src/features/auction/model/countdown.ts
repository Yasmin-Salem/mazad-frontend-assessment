export const URGENT_COUNTDOWN_THRESHOLD_MS = 60_000

export type CountdownValue = {
  observedAt: number
  remainingMilliseconds: number
  totalSeconds: number
  hours: number
  minutes: number
  seconds: number
  isUrgent: boolean
  isExpired: boolean
}

export function getCountdown(endsAt: number, observedAt: number): CountdownValue {
  const hasValidTimes = Number.isFinite(endsAt) && Number.isFinite(observedAt)
  const remainingMilliseconds = hasValidTimes ? Math.max(0, endsAt - observedAt) : 0
  const totalSeconds = Math.ceil(remainingMilliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const isExpired = remainingMilliseconds === 0

  return {
    observedAt,
    remainingMilliseconds,
    totalSeconds,
    hours,
    minutes,
    seconds,
    isUrgent: !isExpired && remainingMilliseconds < URGENT_COUNTDOWN_THRESHOLD_MS,
    isExpired,
  }
}

export function formatCountdown(value: CountdownValue): string {
  return [value.hours, value.minutes, value.seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
}
