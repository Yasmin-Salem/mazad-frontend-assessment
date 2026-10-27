export type AuctionStatus = 'scheduled' | 'active' | 'ended' | 'cancelled'

export type AuctionItem = {
  id: string
  title: string
  description?: string
  category?: string
  imageUrls: readonly string[]
}

export type Bidder = {
  id: string
  displayName: string
}

export type BidSource = 'participant' | 'simulator'

export type Bid = {
  id: string
  auctionId: string
  bidder: Bidder
  amount: number
  placedAt: number
  source: BidSource
}

export type Auction = {
  id: string
  item: AuctionItem
  currency: string
  openingPrice: number
  currentPrice: number
  currentBidder?: Bidder
  startsAt: number
  endsAt: number
  status: AuctionStatus
  bids: readonly Bid[]
}

export const QUICK_BID_INCREMENTS = [100, 500, 1000] as const

export type QuickBidIncrement = (typeof QUICK_BID_INCREMENTS)[number]

export type AuctionUpdate = {
  type: 'bid-placed'
  bid: Bid
}

export type AuctionUpdateListener = (update: AuctionUpdate) => void

export interface AuctionUpdateSource {
  subscribe: (auctionId: string, listener: AuctionUpdateListener) => () => void
}
