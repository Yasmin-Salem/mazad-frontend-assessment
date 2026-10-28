import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { Icon } from '../../../shared/components/Icon'
import { auctionListings, type AuctionListStatus } from '../data/auctionListings'
import { getAuctionStatus } from '../model/auctionState'
import { formatCountdown, getCountdown } from '../model/countdown'
import { AuctionListCard } from './AuctionListCard'
import { auctionListCopy, type AuctionListFilter } from './auctionListCopy'

const filters: readonly AuctionListFilter[] = ['all', 'live', 'upcoming', 'ended']

export function AuctionListPage() {
  const { direction, isAppMode, language } = usePresentation()
  const location = useLocation()
  const copy = auctionListCopy[language]
  const [activeFilter, setActiveFilter] = useState<AuctionListFilter>('all')
  const [query, setQuery] = useState('')
  const [observedAt, setObservedAt] = useState(() => Date.now())

  useEffect(() => {
    const synchronize = () => setObservedAt(Date.now())
    const intervalId = globalThis.setInterval(synchronize, 1000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') synchronize()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      globalThis.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const listingViews = useMemo(() => auctionListings.map((listing) => {
    const auctionStatus = getAuctionStatus(listing.auction, observedAt)
    const status: AuctionListStatus = auctionStatus === 'active'
      ? 'live'
      : auctionStatus === 'scheduled' ? 'upcoming' : 'ended'
    const target = auctionStatus === 'scheduled' ? listing.auction.startsAt : listing.auction.endsAt
    const timing = status === 'ended'
      ? copy.statuses.ended
      : status === 'upcoming'
        ? copy.startsIn(formatCountdown(getCountdown(target, observedAt)))
        : formatCountdown(getCountdown(target, observedAt))
    return { listing, status, timing }
  }), [copy, observedAt])

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language)

    return listingViews.filter(({ listing, status }) => {
      if (activeFilter !== 'all' && status !== activeFilter) return false
      if (!normalizedQuery) return true

      const content = listing.content[language]
      return [content.title, content.location, content.farm]
        .map((value) => value.toLocaleLowerCase(language))
        .some((value) => value.includes(normalizedQuery))
    })
  }, [activeFilter, language, listingViews, query])

  return (
    <article
      className={`auction-list-page${isAppMode ? ' auction-list-page--app' : ''}`}
      data-direction={direction}
      data-testid="auction-list-page"
    >
      <header className="auction-list-page__heading">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      <form className="auction-list-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <Icon name="search" />
        <input
          aria-label={copy.searchLabel}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
          type="search"
          value={query}
        />
      </form>

      <div aria-label={copy.filtersLabel} className="auction-list-filters" role="group">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? 'is-active' : ''}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {copy.filters[filter]}
          </button>
        ))}
      </div>

      {visibleListings.length ? (
        <section
          aria-live="polite"
          className={`auction-list-grid auction-list-grid--${Math.min(visibleListings.length, 3)}`}
        >
          {visibleListings.map(({ listing, status, timing }) => {
            const searchParams = new URLSearchParams(location.search)
            searchParams.set('auction', listing.id)
            return (
            <AuctionListCard
              key={listing.id}
              language={language}
              listing={listing}
              status={status}
              timing={timing}
              to={{ pathname: listing.roomPath, search: `?${searchParams.toString()}` }}
            />
            )
          })}
        </section>
      ) : (
        <section className="auction-list-empty" role="status">
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyDescription}</p>
        </section>
      )}
    </article>
  )
}
