import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { createDemoAuction } from '../../auction/data/demoAuction'
import { getAuctionCopy } from '../../auction/ui/auctionCopy'
import { Icon } from '../../../shared/components/Icon'
import { homeCopy } from './homeCopy'

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)
}

export function HomePage() {
  const { direction, isAppMode, language } = usePresentation()
  const location = useLocation()
  const copy = homeCopy[language]
  const auctionCopy = getAuctionCopy(language)
  const [featuredAuction] = useState(() => createDemoAuction())
  const routeSearch = location.search

  return (
    <article
      className={`home-page${isAppMode ? ' home-page--app' : ''}`}
      data-direction={direction}
      data-testid="home-page"
    >
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="home-hero__description">{copy.description}</p>
          <div className="home-actions">
            <Link className="button button--primary home-action" to={{ pathname: '/auction', search: routeSearch }}>
              {copy.exploreAuctions}<span aria-hidden="true">→</span>
            </Link>
            <Link className="button button--secondary home-action" to={{ pathname: '/listing', search: routeSearch }}>
              {copy.addItem}<span aria-hidden="true">+</span>
            </Link>
          </div>
        </div>
        <div className="home-hero__media">
          <img
            alt={auctionCopy.imageAlt[0]}
            fetchPriority="high"
            src={featuredAuction.item.imageUrls[0]}
          />
          <span aria-hidden="true" className="home-hero__media-accent" />
        </div>
      </section>

      <div className="home-support">
        <section className="home-panel home-featured" aria-labelledby="featured-auction-title">
          <header className="home-panel__heading">
            <h2 id="featured-auction-title">{copy.featuredAuction}</h2>
            <span>{copy.liveAuction}</span>
          </header>
          <div className="home-featured__body">
            <img alt={auctionCopy.imageAlt[0]} loading="lazy" src={featuredAuction.item.imageUrls[0]} />
            <div>
              <h3>{auctionCopy.title}</h3>
              <p>{copy.currentBid}</p>
              <strong dir="ltr">{formatAmount(featuredAuction.currentPrice)} {featuredAuction.currency}</strong>
            </div>
          </div>
          <Link className="home-panel__link" to={{ pathname: '/auction', search: routeSearch }}>
            {copy.viewAuction}<span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="home-panel home-how" aria-labelledby="how-it-works-title">
          <h2 id="how-it-works-title">{copy.howItWorks}</h2>
          <ol>
            {copy.steps.map((step, index) => (
              <li key={step.title}>
                <span className="home-how__icon" aria-hidden="true">
                  <Icon name={index === 0 ? 'search' : index === 1 ? 'auction' : 'trophy'} />
                  <b>{index + 1}</b>
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="home-panel home-seller" aria-labelledby="seller-title">
          <span className="home-seller__icon" aria-hidden="true"><Icon name="package" /></span>
          <div>
            <h2 id="seller-title">{copy.sellerTitle}</h2>
            <p>{copy.sellerDescription}</p>
          </div>
          <Link className="button button--primary home-action" to={{ pathname: '/listing', search: routeSearch }}>
            {copy.addItem}<span aria-hidden="true">+</span>
          </Link>
        </aside>
      </div>
    </article>
  )
}
