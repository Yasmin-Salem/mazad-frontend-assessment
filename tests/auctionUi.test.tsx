import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PresentationProvider } from '../src/app/providers/PresentationProvider'
import { createDemoAuction, demoParticipant } from '../src/features/auction/data/demoAuction'
import type {
  Auction,
  AuctionUpdateListener,
  AuctionUpdateSource,
} from '../src/features/auction/model/types'
import { AuctionRoom } from '../src/features/auction/ui/AuctionRoom'

const NOW = 1_800_000_000_000

function renderRoom({
  auction = createDemoAuction(NOW),
  language = 'en',
  mode = 'web',
  now = () => NOW,
  source,
}: {
  auction?: Auction
  language?: 'ar' | 'en'
  mode?: 'app' | 'web'
  now?: () => number
  source?: AuctionUpdateSource
} = {}) {
  const query = new URLSearchParams({ lang: language })
  if (mode === 'app') query.set('mode', 'app')

  return render(
    <MemoryRouter initialEntries={[`/auction?${query.toString()}`]}>
      <PresentationProvider>
        <AuctionRoom
          initialAuction={auction}
          now={now}
          participant={demoParticipant}
          updateSource={source}
        />
      </PresentationProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('live auction room', () => {
  it('submits exact quick bids through Phase 2 logic and reports accepted and duplicate bids', async () => {
    let observedAt = NOW
    const user = userEvent.setup()
    renderRoom({ now: () => observedAt })

    expect(screen.getByRole('button', { name: '+100' })).toHaveAttribute('data-bid-increment', '100')
    expect(screen.getByRole('button', { name: '+500' })).toHaveAttribute('data-bid-increment', '500')
    expect(screen.getByRole('button', { name: '+1,000' })).toHaveAttribute('data-bid-increment', '1000')

    await user.click(screen.getByRole('button', { name: '+100' }))
    expect(screen.getByTestId('current-price')).toHaveTextContent('SAR 12,600')
    expect(screen.getByText('Bid accepted at SAR 12,600.')).toHaveClass('auction-feedback--accepted')

    observedAt += 100
    await user.click(screen.getByRole('button', { name: '+500' }))
    expect(screen.getByTestId('current-price')).toHaveTextContent('SAR 12,600')
    expect(screen.getByRole('alert')).toHaveTextContent('Please wait a moment before placing another bid.')
  })

  it('shows the refined rapid duplicate feedback in Arabic', async () => {
    let observedAt = NOW
    const user = userEvent.setup()
    renderRoom({ language: 'ar', now: () => observedAt })

    await user.click(screen.getByRole('button', { name: '+100' }))
    observedAt += 100
    await user.click(screen.getByRole('button', { name: '+500' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'يرجى الانتظار لحظة قبل تقديم مزايدة أخرى.',
    )
  })

  it('shows urgent and expired states from the absolute countdown and disables bidding at expiry', () => {
    vi.useFakeTimers()
    let observedAt = NOW
    const auction = {
      ...createDemoAuction(NOW),
      endsAt: NOW + 59_000,
    }
    renderRoom({ auction, now: () => observedAt })

    expect(screen.getByLabelText('Auction ends in')).toHaveAttribute('data-state', 'urgent')

    observedAt = NOW + 60_000
    act(() => vi.advanceTimersByTime(1_000))

    expect(screen.getByLabelText('Auction ended')).toHaveAttribute('data-state', 'expired')
    expect(screen.getByRole('button', { name: '+100' })).toBeDisabled()
    expect(screen.getByText('Auction ended', { selector: '.auction-live-badge' })).toBeInTheDocument()
  })

  it('renders source-driven price increases with a fresh pulse element', () => {
    let listener: AuctionUpdateListener | undefined
    const source: AuctionUpdateSource = {
      subscribe: (_auctionId, nextListener) => {
        listener = nextListener
        return () => undefined
      },
    }
    renderRoom({ now: () => NOW + 5_000, source })
    const previousPrice = screen.getByTestId('current-price')

    act(() => listener?.({
      type: 'bid-placed',
      bid: {
        id: 'ui-live-bid',
        auctionId: 'featured-auction',
        bidder: { id: 'remote', displayName: 'Remote bidder' },
        amount: 13_000,
        placedAt: NOW + 5_000,
        source: 'simulator',
      },
    }))

    const updatedPrice = screen.getByTestId('current-price')
    expect(updatedPrice).toHaveTextContent('SAR 13,000')
    expect(updatedPrice).toHaveClass('auction-price--pulse')
    expect(updatedPrice).not.toBe(previousPrice)
    expect(screen.getAllByText('Remote bidder')).toHaveLength(2)
  })

  it('supports swipe and button navigation, zoom, Escape close, and an image error fallback', async () => {
    const user = userEvent.setup()
    renderRoom()

    const stage = document.querySelector('.auction-gallery__stage')
    expect(stage).not.toBeNull()
    fireEvent.touchStart(stage as Element, { changedTouches: [{ clientX: 260 }] })
    fireEvent.touchEnd(stage as Element, { changedTouches: [{ clientX: 120 }] })
    expect(screen.getByTestId('gallery-image')).toHaveAttribute(
      'alt',
      'Close view of the emerald watch dial',
    )

    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByTestId('gallery-image')).toHaveAttribute(
      'alt',
      'Rear view of the watch movement and leather strap',
    )
    await user.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(screen.getByTestId('gallery-image')).toHaveAttribute('alt', 'Close view of the emerald watch dial')

    await user.click(screen.getByRole('button', { name: 'Open enlarged image' }))
    const dialog = screen.getByRole('dialog', { name: 'Enlarged product image' })
    expect(dialog).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.error(screen.getByTestId('gallery-image'))
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open enlarged image' })).toBeDisabled()
  })

  it('uses logical keyboard navigation in LTR and RTL without separate galleries', () => {
    const english = renderRoom()
    fireEvent.keyDown(screen.getByTestId('auction-gallery'), { key: 'ArrowRight' })
    expect(screen.getByTestId('gallery-image')).toHaveAttribute(
      'alt',
      'Close view of the emerald watch dial',
    )
    expect(screen.getByTestId('auction-room')).toHaveAttribute('data-direction', 'ltr')
    english.unmount()

    renderRoom({ language: 'ar' })
    fireEvent.keyDown(screen.getByTestId('auction-gallery'), { key: 'ArrowRight' })
    expect(screen.getByTestId('gallery-image')).toHaveAttribute(
      'alt',
      'الجهة الخلفية لحركة الساعة والسوار الجلدي',
    )
    expect(screen.getByTestId('auction-room')).toHaveAttribute('data-direction', 'rtl')
  })

  it('keeps stable responsive regions and reuses them inside app mode', () => {
    renderRoom({ mode: 'app' })

    expect(screen.getByTestId('auction-room')).toHaveClass('auction-room--app')
    expect(document.querySelector('[data-responsive-layout="auction-room"]')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-auction-region="gallery"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-auction-region="summary"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-auction-region="history"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-auction-region="details"]')).toHaveLength(1)
  })
})
