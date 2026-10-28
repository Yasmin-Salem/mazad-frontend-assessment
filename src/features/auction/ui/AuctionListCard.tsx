import { Link, type To } from 'react-router-dom'
import type { Language } from '../../../shared/i18n/translations'
import type { AuctionListing, AuctionListStatus } from '../data/auctionListings'
import { auctionListCopy } from './auctionListCopy'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price)
}

export function AuctionListCard({ listing, language, status, timing, to }: { listing: AuctionListing; language: Language; status: AuctionListStatus; timing: string; to: To }) {
  const copy = auctionListCopy[language]
  const content = listing.content[language]
  const { auction } = listing
  const title = content.title
  const isEnded = status === 'ended'
  const bidderCount = new Set(auction.bids.map((bid) => bid.bidder.id)).size
  const hasBid = auction.bids.length > 0

  return (
    <article className={`auction-list-card auction-list-card--${status}`} data-status={status}>
      <Link aria-label={copy.openAuction(title)} className="auction-list-card__link" to={to}>
        <div className="auction-list-card__media">
          <img alt={content.imageAlt[0] ?? title} src={auction.item.imageUrls[0]} />
          {isEnded ? <span className="auction-list-card__ended">{timing}</span> : null}
          <span className={`auction-list-card__badge auction-list-card__badge--${status}`}>
            {copy.statuses[status]}
          </span>
          {!isEnded ? <time className="auction-list-card__timing">{timing}</time> : null}
        </div>
        <div className="auction-list-card__body">
          <h2>{title}</h2>
          <p><span aria-hidden="true">⌖</span>{content.location} · {content.farm}</p>
          <div className="auction-list-card__stats">
            <div>
              <strong>{!hasBid ? copy.noPrice : <><b>{formatPrice(auction.currentPrice)}</b> {copy.currency}</>}</strong>
              <span>{copy.currentBid}</span>
            </div>
            <div>
              <strong>{bidderCount}</strong>
              <span>{copy.bidders}</span>
            </div>
          </div>
        </div>
      </Link>
      <button aria-label={copy.favorite} className="auction-list-card__favorite-button" type="button">
        <span aria-hidden="true">♡</span>
      </button>
    </article>
  )
}
