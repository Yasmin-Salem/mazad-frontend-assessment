import { useState } from 'react'
import {
  createDemoAuction,
  createDemoAuctionSchedule,
  demoParticipant,
} from '../features/auction/data/demoAuction'
import { LocalAuctionUpdateSource } from '../features/auction/services/localAuctionUpdateSource'
import { AuctionRoom } from '../features/auction/ui/AuctionRoom'

export function AuctionPage() {
  const [experience] = useState(() => {
    const createdAt = Date.now()
    return {
      auction: createDemoAuction(createdAt),
      source: new LocalAuctionUpdateSource(createDemoAuctionSchedule(createdAt)),
    }
  })

  return (
    <AuctionRoom
      initialAuction={experience.auction}
      participant={demoParticipant}
      updateSource={experience.source}
    />
  )
}
