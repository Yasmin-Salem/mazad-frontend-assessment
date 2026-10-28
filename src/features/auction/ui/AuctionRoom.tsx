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
import { getDefaultAuctionListing, type AuctionRoomContent } from '../data/auctionListings'
import type { Language } from '../../../shared/i18n/translations'
import { AuctionGallery } from './AuctionGallery'
import { getAuctionCopy, type AuctionCopy } from './auctionCopy'

type AuctionRoomProps = {
  initialAuction: Auction
  participant: Bidder
  updateSource?: AuctionUpdateSource
  now?: () => number
  countdownTickMs?: number
  content?: Record<Language, AuctionRoomContent>
  lotNumber?: number
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)
}

function currencyLabel(language: 'ar' | 'en', currency: string): string {
  return language === 'ar' ? 'ر.س' : currency
}

function AuctionCountdown({
  copy,
  countdown,
  heading,
  showUrgent = true,
  variant = 'panel',
}: {
  copy: AuctionCopy
  countdown: ReturnType<typeof useAuction>['countdown']
  heading?: string
  showUrgent?: boolean
  variant?: 'panel' | 'overlay'
}) {
  const statusClass = countdown.isExpired
    ? ' auction-countdown--expired'
    : countdown.isUrgent ? ' auction-countdown--urgent' : ''

  return (
    <section
      aria-label={countdown.isExpired ? copy.expired : heading ?? copy.endsIn}
      className={`auction-countdown auction-countdown--${variant}${statusClass}`}
      data-state={countdown.isExpired ? 'expired' : countdown.isUrgent ? 'urgent' : 'active'}
    >
      <div className="auction-countdown__heading">
        <span>{countdown.isExpired ? copy.expired : heading ?? copy.endsIn}</span>
        {showUrgent && countdown.isUrgent && <strong>{copy.urgent}</strong>}
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

function BidHistory({ bids, copy, currency, observedAt }: {
  bids: readonly Bid[]
  copy: AuctionCopy
  currency: string
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
                <bdi className="auction-history__amount">{formatAmount(bid.amount)} <small>{currency}</small></bdi>
              </li>
            )
          })}
        </ol>
      )}
      <p className="auction-card__note">{copy.viewHistory}</p>
    </section>
  )
}

function ItemDetails({ auction, content, copy }: { auction: Auction; content?: AuctionRoomContent; copy: AuctionCopy }) {
  const values = content?.detailValues ?? copy.detailValues
  const details = [
    [copy.category, values[0]],
    [copy.type, values[1]],
    [copy.age, values[2]],
    [copy.openingPrice, `${formatAmount(auction.openingPrice)} ${auction.currency}`],
    [copy.city, values[3]],
    [copy.detailsDescription, values[4]],
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
  content,
  countdownTickMs,
  initialAuction,
  lotNumber = getDefaultAuctionListing().lotNumber,
  now,
  participant,
  updateSource,
}: AuctionRoomProps) {
  const { direction, isAppMode, language } = usePresentation()
  const copy = getAuctionCopy(language)
  const selectedContent = content?.[language]
  const requestSequence = useRef(0)
  const { countdown, state, submitQuickBid } = useAuction(initialAuction, {
    countdownTickMs,
    now,
    updateSource,
  })
  const { auction, lastBidResult } = state
  const isScheduled = auction.status === 'scheduled'
  const isEnded = auction.status === 'ended' || auction.status === 'cancelled'
  const showOpeningPrice = isScheduled && auction.bids.length === 0
  const displayedPrice = showOpeningPrice ? auction.openingPrice : auction.currentPrice
  const displayCurrency = currencyLabel(language, auction.currency)
  const bidderCount = new Set(auction.bids.map((bid) => bid.bidder.id)).size
  const currentBidder = auction.currentBidder?.id === participant.id
    ? language === 'ar' ? 'أنت' : 'You'
    : auction.currentBidder?.displayName
  const feedback = lastBidResult?.status === 'accepted'
    ? copy.accepted(formatAmount(lastBidResult.bid.amount))
    : lastBidResult?.status === 'rejected'
      ? `${copy.rejected} ${copy.rejectionReasons[lastBidResult.reason]}`
      : null
  const submitIncrement = (increment: (typeof QUICK_BID_INCREMENTS)[number]) => {
    requestSequence.current += 1
    submitQuickBid({
      bidder: participant,
      increment,
      requestId: `${auction.id}-ui-${requestSequence.current}`,
    })
  }

  return (
    <article
      className={`auction-room${isAppMode ? ' auction-room--app' : ''}`}
      data-direction={direction}
      data-testid="auction-room"
    >
      <div className="auction-room__layout" data-responsive-layout="auction-room">
        <div className="auction-room__gallery" data-auction-region="gallery">
          <AuctionGallery
            copy={copy}
            direction={direction}
            imageAlts={selectedContent?.imageAlt}
            imageUrls={auction.item.imageUrls}
            stageOverlay={(
              <div className="auction-stage-overlay">
                <span className={`auction-live-badge auction-live-badge--overlay${isEnded ? ' is-ended' : ''}`}>
                  <i aria-hidden="true" />
                  {isEnded ? copy.expired : isScheduled ? copy.upcoming : copy.live}
                </span>
                <button aria-label={copy.favoriteDemo} className="auction-favorite" type="button"><span aria-hidden="true">♡</span></button>
                <AuctionCountdown
                  copy={copy}
                  countdown={countdown}
                  heading={isScheduled ? copy.startsIn : copy.endsIn}
                  showUrgent={!isScheduled}
                  variant="overlay"
                />
              </div>
            )}
          />
        </div>

        <section className="auction-summary auction-card" data-auction-region="summary">
          <div className="auction-summary__identity">
            <div>
              <h1>{selectedContent?.title ?? copy.title}</h1>
              <p className="auction-summary__edition">{selectedContent?.edition ?? copy.edition}</p>
            </div>
            <span className="auction-summary__lot">{copy.lotNumber} <bdi>#{lotNumber}</bdi></span>
          </div>
          <p className="auction-summary__description">{selectedContent?.description ?? copy.description}</p>
          <div className="auction-specs">
            <span>{selectedContent?.tags[0] ?? copy.tags[0]}</span>
            <span>{copy.age}: {selectedContent?.detailValues[2] ?? copy.detailValues[2]}</span>
            <span>{copy.weight}: {selectedContent?.weightValue ?? copy.weightValue}</span>
            <span>{copy.city}: {selectedContent?.detailValues[3] ?? copy.detailValues[3]}</span>
          </div>

          <div className="auction-bid-overview">
            <div>
              <span>{copy.bidderCount}</span>
              <strong>{bidderCount}</strong>
            </div>
            <div className="auction-bid-overview__price">
              <span>{showOpeningPrice ? copy.openingBid : copy.currentBid}</span>
              <strong className="auction-price auction-price--pulse" data-testid="current-price" key={displayedPrice}>
                <bdi>{language === 'ar' ? `${formatAmount(displayedPrice)} ${displayCurrency}` : `${displayCurrency} ${formatAmount(displayedPrice)}`}</bdi>
              </strong>
            </div>
          </div>

          <div className="auction-leader">
            <span>{copy.currentBidder}</span>
            <strong className="auction-bidder">
              <i aria-hidden="true" className="bidder-avatar">{bidderInitial(currentBidder ?? '')}</i>
              {currentBidder ?? copy.noBidder}
            </strong>
          </div>

          <div className="auction-quick-bids">
            <span>{copy.quickBid}</span>
            <div>
              {QUICK_BID_INCREMENTS.map((increment) => (
                <Button
                  data-bid-increment={increment}
                  disabled={auction.status !== 'active' || countdown.isExpired}
                  key={increment}
                  onClick={() => submitIncrement(increment)}
                  variant="secondary"
                >
                  <bdi>{copy.addAmount(formatAmount(increment))}</bdi>
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="auction-primary-bid"
            disabled={auction.status !== 'active' || countdown.isExpired}
            onClick={() => submitIncrement(QUICK_BID_INCREMENTS[0])}
            variant="primary"
          >
            {isEnded
              ? copy.auctionEndedButton
              : isScheduled
                ? copy.biddingNotStarted
                : copy.placeBid(formatAmount(auction.currentPrice + QUICK_BID_INCREMENTS[0]))}
          </Button>

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
          <BidHistory bids={auction.bids} copy={copy} currency={displayCurrency} observedAt={state.observedAt} />
          <ItemDetails auction={auction} content={selectedContent} copy={copy} />
        </aside>
      </div>
    </article>
  )
}
