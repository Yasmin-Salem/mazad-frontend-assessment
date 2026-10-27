import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  auctionReducer,
  createAuctionState,
  DUPLICATE_BID_WINDOW_MS,
  getAuctionStatus,
  type AuctionState,
  type SubmitBidCommand,
} from '../src/features/auction/model/auctionState'
import {
  formatCountdown,
  getCountdown,
} from '../src/features/auction/model/countdown'
import {
  QUICK_BID_INCREMENTS,
  type Auction,
  type Bidder,
  type QuickBidIncrement,
} from '../src/features/auction/model/types'
import { LocalAuctionUpdateSource } from '../src/features/auction/services/localAuctionUpdateSource'

const NOW = 1_800_000_000_000
const participant: Bidder = { id: 'participant-1', displayName: 'Participant One' }
const simulatorBidder: Bidder = { id: 'simulator-1', displayName: 'Simulated Bidder' }

function createAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id: 'auction-1',
    item: {
      id: 'item-1',
      title: 'Generic auction lot',
      imageUrls: [],
    },
    currency: 'SAR',
    openingPrice: 1_000,
    currentPrice: 1_000,
    startsAt: NOW - 60_000,
    endsAt: NOW + 60_000,
    status: 'active',
    bids: [],
    ...overrides,
  }
}

function submit(
  state: AuctionState,
  increment: QuickBidIncrement,
  requestId: string,
  submittedAt = NOW,
): AuctionState {
  const command: SubmitBidCommand = {
    auctionId: state.auction.id,
    bidder: participant,
    increment,
    requestId,
    submittedAt,
  }
  return auctionReducer(state, { type: 'bid-submitted', command })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('auction countdown', () => {
  it('derives display time from the absolute deadline without accumulating timer drift', () => {
    const initial = getCountdown(NOW + 3_661_000, NOW)
    const delayedObservation = getCountdown(NOW + 3_661_000, NOW + 3_605_250)

    expect(formatCountdown(initial)).toBe('01:01:01')
    expect(delayedObservation.remainingMilliseconds).toBe(55_750)
    expect(formatCountdown(delayedObservation)).toBe('00:00:56')
    expect(delayedObservation.isUrgent).toBe(true)
  })

  it('clamps expired or invalid deadlines to zero', () => {
    const expired = getCountdown(NOW - 1, NOW)
    const invalid = getCountdown(Number.NaN, NOW)

    expect(expired).toMatchObject({
      remainingMilliseconds: 0,
      totalSeconds: 0,
      isExpired: true,
      isUrgent: false,
    })
    expect(formatCountdown(expired)).toBe('00:00:00')
    expect(invalid.isExpired).toBe(true)
  })

  it('derives scheduled, active, and ended status from absolute timestamps', () => {
    const scheduled = createAuction({ startsAt: NOW + 1_000 })
    const active = createAuction()

    expect(getAuctionStatus(scheduled, NOW)).toBe('scheduled')
    expect(getAuctionStatus(active, NOW)).toBe('active')
    expect(getAuctionStatus(active, active.endsAt + 30_000)).toBe('ended')
  })
})

describe('auction bid state', () => {
  it.each(QUICK_BID_INCREMENTS)('accepts the exact +%i SAR quick-bid increment', (increment) => {
    const state = createAuctionState(createAuction(), NOW)
    const next = submit(state, increment, `request-${increment}`)

    expect(next.auction.currentPrice).toBe(1_000 + increment)
    expect(next.auction.currentBidder).toEqual(participant)
    expect(next.auction.bids.at(-1)).toMatchObject({
      amount: 1_000 + increment,
      source: 'participant',
    })
    expect(next.lastBidResult?.status).toBe('accepted')
  })

  it('rejects rapid repeats and replayed request identifiers inside the reducer', () => {
    const initial = createAuctionState(createAuction(), NOW)
    const accepted = submit(initial, 100, 'request-1')
    const rapidRepeat = submit(accepted, 500, 'request-2', NOW + 100)
    const replay = submit(accepted, 500, 'request-1', NOW + DUPLICATE_BID_WINDOW_MS + 1)
    const laterIntentionalBid = submit(
      accepted,
      500,
      'request-3',
      NOW + DUPLICATE_BID_WINDOW_MS,
    )

    expect(rapidRepeat.auction.currentPrice).toBe(1_100)
    expect(rapidRepeat.lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'duplicate-submission',
    })
    expect(replay.lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'duplicate-submission',
    })
    expect(laterIntentionalBid.auction.currentPrice).toBe(1_600)
    expect(laterIntentionalBid.lastBidResult?.status).toBe('accepted')
  })

  it('rejects bids at or after expiry and transitions state to ended', () => {
    const auction = createAuction({ endsAt: NOW + 1_000 })
    const initial = createAuctionState(auction, NOW)
    const next = submit(initial, 100, 'late-request', auction.endsAt)

    expect(next.auction.currentPrice).toBe(1_000)
    expect(next.auction.status).toBe('ended')
    expect(next.lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'auction-expired',
    })
  })

  it('rejects bids while the auction is scheduled or cancelled', () => {
    const scheduled = createAuctionState(createAuction({ startsAt: NOW + 5_000 }), NOW)
    const cancelled = createAuctionState(createAuction({ status: 'cancelled' }), NOW)

    expect(submit(scheduled, 100, 'scheduled').lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'auction-not-active',
    })
    expect(submit(cancelled, 100, 'cancelled').lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'auction-not-active',
    })
  })

  it('rejects unsupported increments and inconsistent price state at runtime', () => {
    const initial = createAuctionState(createAuction(), NOW)
    const unsupported = submit(initial, 250 as QuickBidIncrement, 'unsupported')
    const inconsistent = createAuctionState(createAuction({ currentPrice: 900 }), NOW)
    const inconsistentResult = submit(inconsistent, 100, 'inconsistent')

    expect(unsupported.lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'invalid-increment',
    })
    expect(inconsistentResult.lastBidResult).toMatchObject({
      status: 'rejected',
      reason: 'invalid-state',
    })
  })

  it('applies valid simulated bids and ignores stale or duplicate updates', () => {
    const initial = createAuctionState(createAuction(), NOW)
    const update = {
      type: 'bid-placed' as const,
      bid: {
        id: 'simulated-1',
        auctionId: initial.auction.id,
        bidder: simulatorBidder,
        amount: 1_500,
        placedAt: NOW + 5_000,
        source: 'simulator' as const,
      },
    }
    const applied = auctionReducer(initial, {
      type: 'update-received',
      update,
      receivedAt: NOW + 5_000,
    })
    const duplicate = auctionReducer(applied, {
      type: 'update-received',
      update,
      receivedAt: NOW + 6_000,
    })
    const stale = auctionReducer(applied, {
      type: 'update-received',
      update: {
        ...update,
        bid: { ...update.bid, id: 'simulated-stale', amount: 1_400 },
      },
      receivedAt: NOW + 6_000,
    })

    expect(applied.auction.currentPrice).toBe(1_500)
    expect(applied.auction.currentBidder).toEqual(simulatorBidder)
    expect(duplicate.auction.bids).toHaveLength(1)
    expect(stale.auction.bids).toHaveLength(1)
  })
})

describe('local auction update source', () => {
  it('emits controlled updates on schedule and cancels pending work on unsubscribe', () => {
    vi.useFakeTimers()
    const firstUpdate = {
      type: 'bid-placed' as const,
      bid: {
        id: 'simulated-1',
        auctionId: 'auction-1',
        bidder: simulatorBidder,
        amount: 1_500,
        placedAt: NOW + 1_000,
        source: 'simulator' as const,
      },
    }
    const secondUpdate = {
      type: 'bid-placed' as const,
      bid: {
        ...firstUpdate.bid,
        id: 'simulated-2',
        amount: 2_000,
        placedAt: NOW + 2_000,
      },
    }
    const source = new LocalAuctionUpdateSource([
      { delayMs: 1_000, update: firstUpdate },
      { delayMs: 2_000, update: secondUpdate },
    ])
    const listener = vi.fn()

    const unsubscribe = source.subscribe('auction-1', listener)
    vi.advanceTimersByTime(1_000)
    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenLastCalledWith(firstUpdate)

    unsubscribe()
    vi.advanceTimersByTime(5_000)
    expect(listener).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
