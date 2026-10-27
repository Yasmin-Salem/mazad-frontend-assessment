import type { Auction, Bid, Bidder } from '../model/types'
import type { ScheduledAuctionUpdate } from '../services/localAuctionUpdateSource'

export const demoParticipant: Bidder = {
  id: 'demo-participant',
  displayName: 'You',
}

const simulatedBidders: readonly Bidder[] = [
  { id: 'bidder-ahmed', displayName: 'Ahmed S.' },
  { id: 'bidder-sara', displayName: 'Sara M.' },
  { id: 'bidder-khalid', displayName: 'Khalid A.' },
  { id: 'bidder-noura', displayName: 'Noura A.' },
  { id: 'bidder-mohamed', displayName: 'Mohamed K.' },
]

export const demoWatchImages = [
  '/images/auction/emerald-watch-front.png',
  '/images/auction/emerald-watch-dial.png',
  '/images/auction/emerald-watch-back.png',
] as const

function createInitialBids(observedAt: number): readonly Bid[] {
  const amounts = [9_000, 10_500, 11_300, 12_000, 12_500] as const

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
  const bids = createInitialBids(observedAt)

  return {
    id: 'featured-auction',
    item: {
      id: 'featured-lot',
      title: 'Emerald Datejust 41',
      description: 'A refined mechanical timepiece with an emerald dial, soft-gold case, and hand-finished leather strap.',
      category: 'Luxury Watches',
      imageUrls: demoWatchImages,
    },
    currency: 'SAR',
    openingPrice: 8_000,
    currentPrice: 12_500,
    currentBidder: simulatedBidders.at(-1),
    startsAt: observedAt - 30 * 60_000,
    endsAt: observedAt + 5 * 60_000,
    status: 'active',
    bids,
  }
}

export function createDemoAuctionSchedule(observedAt = Date.now()): readonly ScheduledAuctionUpdate[] {
  return [
    {
      delayMs: 15_000,
      update: {
        type: 'bid-placed',
        bid: {
          id: 'simulated-live-bid-1',
          auctionId: 'featured-auction',
          bidder: { id: 'live-bidder-1', displayName: 'Faisal R.' },
          amount: 13_000,
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
          auctionId: 'featured-auction',
          bidder: { id: 'live-bidder-2', displayName: 'Layla H.' },
          amount: 13_500,
          placedAt: observedAt + 35_000,
          source: 'simulator',
        },
      },
    },
  ]
}
