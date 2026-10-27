import { useRef } from 'react'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { Button } from '../../../shared/components/Button'
import { formatCountdown } from '../model/countdown'
import {
  QUICK_BID_INCREMENTS,
  type Auction,
  type AuctionUpdateSource,
  type Bid,
  type Bidder,
} from '../model/types'
import { useAuction } from '../hooks/useAuction'
import { AuctionGallery } from './AuctionGallery'
import { getAuctionCopy, type AuctionCopy } from './auctionCopy'

type AuctionRoomProps = {
  initialAuction: Auction
  participant: Bidder
  updateSource?: AuctionUpdateSource
  now?: () => number
  countdownTickMs?: number
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)
}

function AuctionCountdown({
  copy,
  countdown,
}: {
  copy: AuctionCopy
  countdown: ReturnType<typeof useAuction>['countdown']
}) {
  const statusClass = countdown.isExpired
    ? ' auction-countdown--expired'
    : countdown.isUrgent ? ' auction-countdown--urgent' : ''

  return (
    <section
      aria-label={countdown.isExpired ? copy.expired : copy.endsIn}
      className={`auction-countdown${statusClass}`}
      data-state={countdown.isExpired ? 'expired' : countdown.isUrgent ? 'urgent' : 'active'}
    >
      <div className="auction-countdown__heading">
        <span>{countdown.isExpired ? copy.expired : copy.endsIn}</span>
        {countdown.isUrgent && <strong>{copy.urgent}</strong>}
      </div>
      <time dateTime={`PT${countdown.totalSeconds}S`} dir="ltr">
        {formatCountdown(countdown)}
      </time>
      <div className="auction-countdown__labels" dir="ltr">
        <span>{copy.hours}</span>
        <span>{copy.minutes}</span>
        <span>{copy.seconds}</span>
      </div>
    </section>
  )
}

function bidderInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '•'
}

function BidHistory({ bids, copy, observedAt }: {
  bids: readonly Bid[]
  copy: AuctionCopy
  observedAt: number
}) {
  const recentBids = [...bids].reverse().slice(0, 6)

  return (
    <section className="auction-card auction-history" data-auction-region="history">
      <div className="auction-card__heading">
        <h2>{copy.bidHistory}</h2>
        <span>{bids.length}</span>
      </div>
      {recentBids.length === 0 ? <p>{copy.emptyHistory}</p> : (
        <ol>
          {recentBids.map((bid) => {
            const minutesAgo = Math.max(0, Math.floor((observedAt - bid.placedAt) / 60_000))
            return (
              <li key={bid.id}>
                <span aria-hidden="true" className="bidder-avatar">{bidderInitial(bid.bidder.displayName)}</span>
                <span className="auction-history__bidder">
                  <strong>{bid.bidder.displayName}</strong>
                  <small>{copy.ago(minutesAgo)}</small>
                </span>
                <bdi className="auction-history__amount">{formatAmount(bid.amount)}</bdi>
              </li>
            )
          })}
        </ol>
      )}
      <p className="auction-card__note">{copy.viewHistory}</p>
    </section>
  )
}

function ItemDetails({ auction, copy }: { auction: Auction; copy: AuctionCopy }) {
  const details = [
    [copy.category, copy.detailValues[0]],
    [copy.type, copy.detailValues[1]],
    [copy.age, copy.detailValues[2]],
    [copy.openingPrice, `${formatAmount(auction.openingPrice)} ${auction.currency}`],
    [copy.city, copy.detailValues[3]],
    [copy.detailsDescription, copy.detailValues[4]],
  ] as const

  return (
    <section className="auction-card auction-details" data-auction-region="details">
      <div className="auction-card__heading"><h2>{copy.itemDetails}</h2></div>
      <dl>
        {details.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function AuctionRoom({
  countdownTickMs,
  initialAuction,
  now,
  participant,
  updateSource,
}: AuctionRoomProps) {
  const { direction, isAppMode, language } = usePresentation()
  const copy = getAuctionCopy(language)
  const requestSequence = useRef(0)
  const { countdown, state, submitQuickBid } = useAuction(initialAuction, {
    countdownTickMs,
    now,
    updateSource,
  })
  const { auction, lastBidResult } = state
  const currentBidder = auction.currentBidder?.id === participant.id
    ? language === 'ar' ? 'أنت' : 'You'
    : auction.currentBidder?.displayName
  const feedback = lastBidResult?.status === 'accepted'
    ? copy.accepted(formatAmount(lastBidResult.bid.amount))
    : lastBidResult?.status === 'rejected'
      ? `${copy.rejected} ${copy.rejectionReasons[lastBidResult.reason]}`
      : null

  return (
    <article
      className={`auction-room${isAppMode ? ' auction-room--app' : ''}`}
      data-direction={direction}
      data-testid="auction-room"
    >
      <div className="auction-room__layout" data-responsive-layout="auction-room">
        <div className="auction-room__gallery" data-auction-region="gallery">
          <AuctionGallery copy={copy} direction={direction} imageUrls={auction.item.imageUrls} />
        </div>

        <section className="auction-summary auction-card" data-auction-region="summary">
          <div className="auction-summary__status-row">
            <span className={`auction-live-badge${countdown.isExpired ? ' is-ended' : ''}`}>
              <i aria-hidden="true" />
              {countdown.isExpired ? copy.expired : copy.live}
            </span>
            <span className="auction-summary__lot">#104</span>
          </div>
          <h1>{copy.title}</h1>
          <p className="auction-summary__edition">{copy.edition}</p>
          <p className="auction-summary__description">{copy.description}</p>
          <ul className="auction-summary__tags" aria-label={copy.category}>
            {copy.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>

          <AuctionCountdown copy={copy} countdown={countdown} />

          <div className="auction-bid-overview">
            <div>
              <span>{copy.currentBidder}</span>
              <strong className="auction-bidder">
                <i aria-hidden="true" className="bidder-avatar">{bidderInitial(currentBidder ?? '')}</i>
                {currentBidder ?? copy.noBidder}
              </strong>
            </div>
            <div className="auction-bid-overview__price">
              <span>{copy.currentBid}</span>
              <strong
                className="auction-price auction-price--pulse"
                data-testid="current-price"
                key={auction.currentPrice}
              >
                <bdi>{auction.currency} {formatAmount(auction.currentPrice)}</bdi>
              </strong>
            </div>
          </div>

          <div className="auction-quick-bids">
            <span>{copy.quickBid}</span>
            <div>
              {QUICK_BID_INCREMENTS.map((increment) => (
                <Button
                  data-bid-increment={increment}
                  disabled={auction.status !== 'active' || countdown.isExpired}
                  key={increment}
                  onClick={() => {
                    requestSequence.current += 1
                    submitQuickBid({
                      bidder: participant,
                      increment,
                      requestId: `${auction.id}-ui-${requestSequence.current}`,
                    })
                  }}
                  variant="secondary"
                >
                  <bdi>{copy.addAmount(formatAmount(increment))}</bdi>
                </Button>
              ))}
            </div>
          </div>

          {feedback && (
            <p
              className={`auction-feedback auction-feedback--${lastBidResult?.status}`}
              role={lastBidResult?.status === 'rejected' ? 'alert' : 'status'}
            >
              {feedback}
            </p>
          )}
        </section>

        <aside className="auction-room__supporting">
          <BidHistory bids={auction.bids} copy={copy} observedAt={state.observedAt} />
          <ItemDetails auction={auction} copy={copy} />
        </aside>
      </div>
    </article>
  )
}
