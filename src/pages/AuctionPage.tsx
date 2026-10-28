import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createDemoAuctionSchedule,
  demoParticipant,
} from '../features/auction/data/demoAuction'
import { getAuctionListing, getDefaultAuctionListing } from '../features/auction/data/auctionListings'
import { LocalAuctionUpdateSource } from '../features/auction/services/localAuctionUpdateSource'
import { AuctionRoom } from '../features/auction/ui/AuctionRoom'

export function AuctionPage() {
  const [searchParams] = useSearchParams()
  const [openedAt] = useState(() => Date.now())
  const selectedListing = getAuctionListing(searchParams.get('auction')) ?? getDefaultAuctionListing()
  const experience = useMemo(() => {
    return {
      auction: selectedListing.auction,
      source: new LocalAuctionUpdateSource(createDemoAuctionSchedule(openedAt, selectedListing.auction)),
    }
  }, [openedAt, selectedListing])

  return (
    <AuctionRoom
      content={selectedListing.content}
      initialAuction={experience.auction}
      key={selectedListing.id}
      lotNumber={selectedListing.lotNumber}
      participant={demoParticipant}
      updateSource={experience.source}
    />
  )
}
