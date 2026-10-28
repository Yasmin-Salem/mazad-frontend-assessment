import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDemoAuction } from '../src/features/auction/data/demoAuction'
import { useAuction } from '../src/features/auction/hooks/useAuction'
import { useCountdown } from '../src/features/auction/hooks/useCountdown'
import type {
  AuctionUpdateListener,
  AuctionUpdateSource,
} from '../src/features/auction/model/types'

const NOW = 1_800_000_000_000

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useCountdown', () => {
  it('recalculates from the clock after a delayed timer and stops at expiry', () => {
    vi.useFakeTimers()
    let observedAt = NOW
    const now = () => observedAt
    const onTimeObserved = vi.fn()
    const { result } = renderHook(() => useCountdown(NOW + 10_000, {
      now,
      onTimeObserved,
    }))

    expect(result.current.totalSeconds).toBe(10)

    observedAt = NOW + 9_500
    act(() => vi.advanceTimersByTime(1_000))
    expect(result.current.remainingMilliseconds).toBe(500)
    expect(result.current.totalSeconds).toBe(1)

    observedAt = NOW + 15_000
    act(() => vi.advanceTimersByTime(1_000))
    expect(result.current.isExpired).toBe(true)
    expect(result.current.totalSeconds).toBe(0)
    expect(onTimeObserved).toHaveBeenLastCalledWith(NOW + 15_000)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('removes its timer when unmounted', () => {
    vi.useFakeTimers()
    const { unmount } = renderHook(() => useCountdown(NOW + 60_000, { now: () => NOW }))

    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('resynchronizes from the absolute clock when a hidden tab becomes visible', () => {
    vi.useFakeTimers()
    let observedAt = NOW
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    const { result } = renderHook(() => useCountdown(NOW + 60_000, {
      now: () => observedAt,
    }))

    observedAt = NOW + 45_250
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(result.current.remainingMilliseconds).toBe(14_750)
    expect(result.current.totalSeconds).toBe(15)
  })
})

describe('useAuction', () => {
  it('moves a scheduled auction from its start countdown to active and then ended', () => {
    vi.useFakeTimers()
    let observedAt = NOW
    const auction = {
      ...createDemoAuction(NOW),
      startsAt: NOW + 1_000,
      endsAt: NOW + 2_000,
      status: 'scheduled' as const,
      bids: [],
      currentPrice: 1_500,
      currentBidder: undefined,
    }
    const { result } = renderHook(() => useAuction(auction, {
      countdownTickMs: 100,
      now: () => observedAt,
    }))

    expect(result.current.state.auction.status).toBe('scheduled')
    expect(result.current.countdown.totalSeconds).toBe(1)

    observedAt = NOW + 1_000
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.state.auction.status).toBe('active')
    expect(result.current.countdown.totalSeconds).toBe(1)

    observedAt = NOW + 2_000
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.state.auction.status).toBe('ended')
    expect(result.current.countdown.totalSeconds).toBe(0)
    expect(result.current.countdown.isExpired).toBe(true)
  })

  it('accepts updates through the replaceable source and unsubscribes on cleanup', () => {
    vi.useFakeTimers()
    let listener: AuctionUpdateListener | undefined
    const unsubscribe = vi.fn()
    const source: AuctionUpdateSource = {
      subscribe: vi.fn((_auctionId, nextListener) => {
        listener = nextListener
        return unsubscribe
      }),
    }
    const auction = createDemoAuction(NOW)
    const now = () => NOW + 5_000
    const { result, unmount } = renderHook(() => useAuction(auction, {
      updateSource: source,
      now,
    }))

    act(() => listener?.({
      type: 'bid-placed',
      bid: {
        id: 'simulated-hook-bid',
        auctionId: auction.id,
        bidder: { id: 'simulated', displayName: 'Simulated Bidder' },
        amount: 13_000,
        placedAt: NOW + 5_000,
        source: 'simulator',
      },
    }))

    expect(source.subscribe).toHaveBeenCalledWith(auction.id, expect.any(Function))
    expect(result.current.state.auction.currentPrice).toBe(13_000)
    expect(result.current.state.auction.currentBidder?.id).toBe('simulated')

    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
