import {
  QUICK_BID_INCREMENTS,
  type Auction,
  type AuctionStatus,
  type AuctionUpdate,
  type Bid,
  type Bidder,
  type QuickBidIncrement,
} from './types'

export const DUPLICATE_BID_WINDOW_MS = 750

export type BidRejectionReason =
  | 'auction-expired'
  | 'auction-not-active'
  | 'auction-mismatch'
  | 'duplicate-submission'
  | 'invalid-bidder'
  | 'invalid-increment'
  | 'invalid-request'
  | 'invalid-state'

export type BidSubmissionResult =
  | { status: 'accepted'; requestId: string; bid: Bid }
  | { status: 'rejected'; requestId: string; reason: BidRejectionReason }

export type SubmitBidCommand = {
  auctionId: string
  bidder: Bidder
  increment: QuickBidIncrement
  requestId: string
  submittedAt: number
}

export type AuctionState = {
  auction: Auction
  observedAt: number
  lastBidResult: BidSubmissionResult | null
  lastAcceptedLocalBid: { bidderId: string; acceptedAt: number } | null
  processedRequestIds: readonly string[]
}

export type AuctionAction =
  | { type: 'time-observed'; observedAt: number }
  | { type: 'bid-submitted'; command: SubmitBidCommand }
  | { type: 'update-received'; update: AuctionUpdate; receivedAt: number }

export function getAuctionStatus(auction: Auction, observedAt: number): AuctionStatus {
  if (auction.status === 'cancelled' || auction.status === 'ended') {
    return auction.status
  }
  if (!Number.isFinite(observedAt) || observedAt >= auction.endsAt) {
    return 'ended'
  }
  if (observedAt < auction.startsAt) {
    return 'scheduled'
  }
  return 'active'
}

function withObservedStatus(auction: Auction, observedAt: number): Auction {
  const status = getAuctionStatus(auction, observedAt)
  return status === auction.status ? auction : { ...auction, status }
}

export function createAuctionState(auction: Auction, observedAt: number): AuctionState {
  return {
    auction: withObservedStatus(auction, observedAt),
    observedAt,
    lastBidResult: null,
    lastAcceptedLocalBid: null,
    processedRequestIds: [],
  }
}

function hasValidBidder(bidder: Bidder): boolean {
  return bidder.id.trim().length > 0 && bidder.displayName.trim().length > 0
}

function hasConsistentAuctionState(auction: Auction): boolean {
  if (
    !Number.isSafeInteger(auction.openingPrice)
    || !Number.isSafeInteger(auction.currentPrice)
    || auction.openingPrice < 0
    || auction.currentPrice < auction.openingPrice
    || !Number.isFinite(auction.startsAt)
    || !Number.isFinite(auction.endsAt)
    || auction.endsAt <= auction.startsAt
  ) {
    return false
  }

  const lastBid = auction.bids.at(-1)
  return !lastBid || (
    lastBid.auctionId === auction.id
    && lastBid.amount === auction.currentPrice
    && Number.isSafeInteger(lastBid.amount)
  )
}

function reject(
  state: AuctionState,
  requestId: string,
  reason: BidRejectionReason,
  observedAt: number,
): AuctionState {
  return {
    ...state,
    auction: withObservedStatus(state.auction, observedAt),
    observedAt,
    lastBidResult: { status: 'rejected', requestId, reason },
  }
}

function submitBid(state: AuctionState, command: SubmitBidCommand): AuctionState {
  const requestId = command.requestId.trim()
  if (!requestId) return reject(state, command.requestId, 'invalid-request', command.submittedAt)
  if (command.auctionId !== state.auction.id) {
    return reject(state, requestId, 'auction-mismatch', command.submittedAt)
  }
  if (!hasValidBidder(command.bidder)) {
    return reject(state, requestId, 'invalid-bidder', command.submittedAt)
  }
  if (!(QUICK_BID_INCREMENTS as readonly number[]).includes(command.increment)) {
    return reject(state, requestId, 'invalid-increment', command.submittedAt)
  }
  if (!hasConsistentAuctionState(state.auction) || !Number.isFinite(command.submittedAt)) {
    return reject(state, requestId, 'invalid-state', command.submittedAt)
  }
  if (command.submittedAt >= state.auction.endsAt) {
    return reject(state, requestId, 'auction-expired', command.submittedAt)
  }
  if (getAuctionStatus(state.auction, command.submittedAt) !== 'active') {
    return reject(state, requestId, 'auction-not-active', command.submittedAt)
  }

  const isKnownRequest = state.processedRequestIds.includes(requestId)
  const isRapidRepeat = state.lastAcceptedLocalBid?.bidderId === command.bidder.id
    && command.submittedAt - state.lastAcceptedLocalBid.acceptedAt < DUPLICATE_BID_WINDOW_MS
  if (isKnownRequest || isRapidRepeat) {
    return reject(state, requestId, 'duplicate-submission', command.submittedAt)
  }

  const amount = state.auction.currentPrice + command.increment
  if (!Number.isSafeInteger(amount)) {
    return reject(state, requestId, 'invalid-state', command.submittedAt)
  }

  const bid: Bid = {
    id: `participant-${requestId}`,
    auctionId: state.auction.id,
    bidder: command.bidder,
    amount,
    placedAt: command.submittedAt,
    source: 'participant',
  }
  const processedRequestIds = [...state.processedRequestIds, requestId]

  return {
    auction: {
      ...state.auction,
      currentPrice: amount,
      currentBidder: command.bidder,
      status: 'active',
      bids: [...state.auction.bids, bid],
    },
    observedAt: command.submittedAt,
    lastBidResult: { status: 'accepted', requestId, bid },
    lastAcceptedLocalBid: {
      bidderId: command.bidder.id,
      acceptedAt: command.submittedAt,
    },
    processedRequestIds,
  }
}

function receiveUpdate(
  state: AuctionState,
  update: AuctionUpdate,
  receivedAt: number,
): AuctionState {
  const auction = withObservedStatus(state.auction, receivedAt)
  const { bid } = update
  const isValid = auction.status === 'active'
    && bid.auctionId === auction.id
    && hasValidBidder(bid.bidder)
    && Number.isSafeInteger(bid.amount)
    && bid.amount > auction.currentPrice
    && Number.isFinite(bid.placedAt)
    && bid.placedAt >= auction.startsAt
    && bid.placedAt < auction.endsAt
    && bid.placedAt <= receivedAt
    && !auction.bids.some((existingBid) => existingBid.id === bid.id)

  if (!isValid) {
    return { ...state, auction, observedAt: receivedAt }
  }

  return {
    ...state,
    auction: {
      ...auction,
      currentPrice: bid.amount,
      currentBidder: bid.bidder,
      bids: [...auction.bids, bid],
    },
    observedAt: receivedAt,
  }
}

export function auctionReducer(state: AuctionState, action: AuctionAction): AuctionState {
  switch (action.type) {
    case 'time-observed':
      return {
        ...state,
        auction: withObservedStatus(state.auction, action.observedAt),
        observedAt: action.observedAt,
      }
    case 'bid-submitted':
      return submitBid(state, action.command)
    case 'update-received':
      return receiveUpdate(state, action.update, action.receivedAt)
  }
}
