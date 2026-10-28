import { useCallback, useEffect, useReducer } from 'react'
import {
  auctionReducer,
  createAuctionState,
  type SubmitBidCommand,
} from '../model/auctionState'
import type {
  Auction,
  AuctionUpdateSource,
  Bidder,
  QuickBidIncrement,
} from '../model/types'
import { useCountdown } from './useCountdown'

const systemNow = () => Date.now()

export type UseAuctionOptions = {
  updateSource?: AuctionUpdateSource
  now?: () => number
  countdownTickMs?: number
}

export type QuickBidRequest = {
  bidder: Bidder
  increment: QuickBidIncrement
  requestId: string
}

export function useAuction(
  initialAuction: Auction,
  {
    updateSource,
    now = systemNow,
    countdownTickMs = 1000,
  }: UseAuctionOptions = {},
) {
  const [state, dispatch] = useReducer(
    auctionReducer,
    initialAuction,
    (auction) => createAuctionState(auction, now()),
  )

  const observeTime = useCallback((observedAt: number) => {
    dispatch({ type: 'time-observed', observedAt })
  }, [])

  const countdownTarget = state.auction.status === 'scheduled'
    ? state.auction.startsAt
    : state.auction.endsAt
  const countdown = useCountdown(countdownTarget, {
    tickMs: countdownTickMs,
    now,
    onTimeObserved: observeTime,
  })

  useEffect(() => {
    if (!updateSource) return
    return updateSource.subscribe(initialAuction.id, (update) => {
      dispatch({ type: 'update-received', update, receivedAt: now() })
    })
  }, [initialAuction.id, now, updateSource])

  const submitQuickBid = useCallback((request: QuickBidRequest) => {
    const command: SubmitBidCommand = {
      auctionId: initialAuction.id,
      bidder: request.bidder,
      increment: request.increment,
      requestId: request.requestId,
      submittedAt: now(),
    }
    dispatch({ type: 'bid-submitted', command })
  }, [initialAuction.id, now])

  return {
    state,
    countdown,
    submitQuickBid,
  }
}
