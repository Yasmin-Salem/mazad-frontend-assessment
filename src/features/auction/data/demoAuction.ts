import type { Auction, Bid, Bidder } from '../model/types'
import type { ScheduledAuctionUpdate } from '../services/localAuctionUpdateSource'
import { getDefaultAuctionListing } from './auctionListings'

export const demoParticipant: Bidder = {
  id: 'demo-participant',
  displayName: 'You',
}

const simulatedBidders: readonly Bidder[] = [
  { id: 'bidder-ahmed', displayName: 'أحمد السيد' },
  { id: 'bidder-noura', displayName: 'نورة أحمد' },
  { id: 'bidder-khalid', displayName: 'خالد العتيبي' },
  { id: 'bidder-mohamed', displayName: 'محمد الدوسري' },
  { id: 'bidder-salem', displayName: 'سالم الحربي' },
]

export const demoLivestockImages = getDefaultAuctionListing().auction.item.imageUrls

function createInitialBids(observedAt: number): readonly Bid[] {
  const amounts = [1_750, 1_900, 2_050, 2_200, 2_350] as const

  return amounts.map((amount, index) => ({
    id: `opening-bid-${index + 1}`,
    auctionId: 'featured-auction',
    bidder: simulatedBidders[index],
    amount,
    placedAt: observedAt - (5 - index) * 60_000,
    source: 'simulator',
  }))
}

export function createDemoAuction(observedAt = Date.now()): Auction {
  const featuredAuction = getDefaultAuctionListing().auction
  const bids = createInitialBids(observedAt)

  return {
    ...featuredAuction,
    id: 'featured-auction',
    item: {
      ...featuredAuction.item,
      id: 'featured-lot',
    },
    currentPrice: 2_350,
    currentBidder: simulatedBidders.at(-1),
    startsAt: observedAt - 30 * 60_000,
    endsAt: observedAt + 5 * 60_000,
    status: 'active',
    bids,
  }
}

export function createDemoAuctionSchedule(
  observedAt = Date.now(),
  auction: Auction = createDemoAuction(observedAt),
): readonly ScheduledAuctionUpdate[] {
  if (observedAt < auction.startsAt || observedAt >= auction.endsAt) return []

  const schedule: readonly ScheduledAuctionUpdate[] = [
    {
      delayMs: 15_000,
      update: {
        type: 'bid-placed',
        bid: {
          id: 'simulated-live-bid-1',
          auctionId: auction.id,
          bidder: { id: 'live-bidder-1', displayName: 'فيصل القحطاني' },
          amount: auction.currentPrice + 500,
          placedAt: observedAt + 15_000,
          source: 'simulator',
        },
      },
    },
    {
      delayMs: 35_000,
      update: {
        type: 'bid-placed',
        bid: {
          id: 'simulated-live-bid-2',
          auctionId: auction.id,
          bidder: { id: 'live-bidder-2', displayName: 'ليلى الحربي' },
          amount: auction.currentPrice + 1_000,
          placedAt: observedAt + 35_000,
          source: 'simulator',
        },
      },
    },
  ]

  return schedule.filter(({ delayMs }) => observedAt + delayMs < auction.endsAt)
}
