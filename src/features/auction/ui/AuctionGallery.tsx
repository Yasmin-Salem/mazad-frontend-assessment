import { useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from 'react'
import type { AuctionCopy } from './auctionCopy'

type AuctionGalleryProps = {
  copy: AuctionCopy
  direction: 'ltr' | 'rtl'
  imageUrls: readonly string[]
  imageAlts?: readonly string[]
  stageOverlay?: ReactNode
}

const SWIPE_THRESHOLD_PX = 45

export function AuctionGallery({ copy, direction, imageAlts, imageUrls, stageOverlay }: AuctionGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(imageUrls.length > 0)
  const [hasError, setHasError] = useState(imageUrls.length === 0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const zoomOpener = useRef<HTMLButtonElement | null>(null)
  const imageUrl = imageUrls[activeIndex]
  const imageAlt = imageAlts?.[activeIndex] ?? copy.imageAlt[activeIndex] ?? copy.title

  const showImage = (nextIndex: number) => {
    if (imageUrls.length === 0) return
    const normalizedIndex = (nextIndex + imageUrls.length) % imageUrls.length
    setIsLoading(true)
    setHasError(false)
    setActiveIndex(normalizedIndex)
  }

  const showPrevious = () => showImage(activeIndex - 1)
  const showNext = () => showImage(activeIndex + 1)

  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (direction === 'rtl') showPrevious()
      else showNext()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (direction === 'rtl') showNext()
      else showPrevious()
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const endX = event.changedTouches[0]?.clientX
    if (touchStartX.current === null || endX === undefined) return
    const distance = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return
    const movedTowardNext = direction === 'rtl' ? distance > 0 : distance < 0
    if (movedTowardNext) showNext()
    else showPrevious()
  }

  const closeZoom = () => {
    setIsZoomOpen(false)
    requestAnimationFrame(() => zoomOpener.current?.focus())
  }

  return (
    <section
      aria-label={copy.galleryLabel}
      className="auction-gallery"
      data-testid="auction-gallery"
      onKeyDown={handleKeyboard}
    >
      <div className="auction-gallery__stage-wrap">
        <div
          className="auction-gallery__stage"
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          {imageUrl && !hasError && (
            <span
              aria-hidden="true"
              className="auction-gallery__backdrop"
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />
          )}
          {imageUrl && !hasError ? (
            <img
              alt={imageAlt}
              className={`auction-gallery__image${isLoading ? ' is-loading' : ''}`}
              data-testid="gallery-image"
              draggable="false"
              onError={() => {
                setIsLoading(false)
                setHasError(true)
              }}
              onLoad={() => setIsLoading(false)}
              src={imageUrl}
            />
          ) : (
            <div className="auction-gallery__fallback" role="status">
              <span aria-hidden="true">◇</span>
              <strong>{copy.imageError}</strong>
              <small>{copy.imageErrorHint}</small>
            </div>
          )}

          {isLoading && !hasError && (
            <span className="auction-gallery__loading" role="status">{copy.loadingImage}</span>
          )}

          {stageOverlay}

          <button
            aria-label={copy.previousImage}
            className="auction-gallery__arrow auction-gallery__arrow--previous"
            disabled={imageUrls.length < 2}
            onClick={showPrevious}
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            aria-label={copy.nextImage}
            className="auction-gallery__arrow auction-gallery__arrow--next"
            disabled={imageUrls.length < 2}
            onClick={showNext}
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>

          <button
            aria-label={copy.openZoom}
            className="auction-gallery__zoom"
            disabled={hasError || !imageUrl}
            onClick={() => setIsZoomOpen(true)}
            ref={zoomOpener}
            type="button"
          >
            <span aria-hidden="true">⌕</span>
          </button>

          <span className="auction-gallery__count">
            {copy.imageCount(activeIndex + 1, imageUrls.length)}
          </span>
        </div>
      </div>

      <div className="auction-gallery__thumbnails" aria-label={copy.galleryLabel}>
        {imageUrls.map((url, index) => (
          <button
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={copy.thumbnail(index + 1)}
            className="auction-gallery__thumbnail"
            key={url}
            onClick={() => showImage(index)}
            type="button"
          >
            <img
              alt=""
              onError={(event) => { event.currentTarget.hidden = true }}
              src={url}
            />
          </button>
        ))}
      </div>

      {isZoomOpen && imageUrl && (
        <div
          aria-label={copy.zoomTitle}
          aria-modal="true"
          className="auction-gallery__dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeZoom()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeZoom()
            else handleKeyboard(event)
          }}
          role="dialog"
        >
          <button
            aria-label={copy.closeZoom}
            autoFocus
            className="auction-gallery__dialog-close"
            onClick={closeZoom}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
          <img alt={imageAlt} src={imageUrl} />
        </div>
      )}
    </section>
  )
}
