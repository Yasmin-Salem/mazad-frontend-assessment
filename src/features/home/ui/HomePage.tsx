import { Link, useLocation } from 'react-router-dom'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { Icon, type IconName } from '../../../shared/components/Icon'
import { listingText, marketplaceListings } from '../data/marketplaceData'
import { homeCopy } from './homeCopy'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)
}

export function HomePage() {
  const { direction, isAppMode, language } = usePresentation()
  const location = useLocation()
  const copy = homeCopy[language]
  const routeSearch = location.search
  const quickActions: readonly { icon: IconName; label: string; path?: '/auction' | '/listing' }[] = [
    { icon: 'package', label: copy.quickActions[0] },
    { icon: 'auction', label: copy.quickActions[1], path: '/auction' },
    { icon: 'user', label: copy.quickActions[2] },
    { icon: 'add', label: copy.quickActions[3], path: '/listing' },
  ]

  return (
    <article
      className={`marketplace-home${isAppMode ? ' marketplace-home--app' : ''}`}
      data-direction={direction}
      data-testid="home-page"
    >
      <div className="marketplace-utility">
        <span className="marketplace-location"><span aria-hidden="true">⌖</span>{copy.location}</span>
        <form className="marketplace-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <input aria-label={copy.searchLabel} placeholder={copy.searchPlaceholder} type="search" />
          <button aria-label={copy.searchLabel} type="submit"><Icon name="search" /></button>
        </form>
      </div>

      <section className="marketplace-banner" aria-labelledby="home-title">
        <picture className="marketplace-banner__picture" aria-hidden="true">
          <source media="(max-width: 47.99rem)" srcSet="/images/marketplace/cow-hero-approved-mobile.png" />
          <img alt="" fetchPriority="high" src="/images/marketplace/cow-hero-approved-wide.png" />
        </picture>
        <span className="marketplace-banner__shade" aria-hidden="true" />
        <div className="marketplace-banner__content">
          <p>{copy.bannerEyebrow}</p>
          <h1 id="home-title">{copy.bannerTitle}</h1>
          <span>{copy.bannerDescription}</span>
          <Link to={{ pathname: '/auction', search: routeSearch }}>{copy.bannerAction}</Link>
        </div>
      </section>

      <nav className="marketplace-quick-actions" aria-label={copy.bannerEyebrow}>
        {quickActions.map((action) => {
          const content = <><span aria-hidden="true"><Icon name={action.icon} /></span><strong>{action.label}</strong></>
          return action.path ? (
            <Link key={action.label} to={{ pathname: action.path, search: routeSearch }}>{content}</Link>
          ) : (
            <button aria-label={`${action.label} — ${copy.demoOnly}`} key={action.label} type="button">{content}</button>
          )
        })}
      </nav>

      <section className="marketplace-offers" aria-labelledby="latest-offers-title">
        <header>
          <h2 id="latest-offers-title">{copy.latestOffers}</h2>
          <button aria-label={`${copy.viewAll} — ${copy.demoOnly}`} type="button">{copy.viewAll}</button>
        </header>
        <div className="marketplace-offers__grid">
          {marketplaceListings.map((listing) => (
            <article className="marketplace-listing-card" key={listing.id}>
              <div className="marketplace-listing-card__media">
                <img alt={listingText(listing.imageAlt, language)} loading="eager" src={listing.imageUrl} />
                {listing.isLive ? <span className="marketplace-listing-card__live">{copy.live}</span> : null}
                <button aria-label={copy.favoriteDemo} type="button"><span aria-hidden="true">♡</span></button>
              </div>
              <div className="marketplace-listing-card__body">
                <h3>
                  {listing.auctionPath ? (
                    <Link to={{ pathname: listing.auctionPath, search: routeSearch }}>{listingText(listing.title, language)}</Link>
                  ) : listingText(listing.title, language)}
                </h3>
                <p><span aria-hidden="true">⌖</span>{listingText(listing.location, language)}</p>
                <strong dir="ltr">{formatAmount(listing.price)} <span>{copy.currency}</span></strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  )
}
