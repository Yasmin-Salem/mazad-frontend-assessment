import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from '../src/app/App'

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('responsive Auction List page', () => {
  it('keeps the featured auction as the fallback for missing or unknown IDs', () => {
    renderApp('/auction?lang=en&auction=not-a-real-auction')
    expect(screen.getByRole('heading', { name: 'Premium Harri ram' })).toBeInTheDocument()
  })

  it('renders centralized listings and preserves presentation parameters on room links', () => {
    renderApp('/auctions?lang=en&campaign=review')

    expect(screen.getByTestId('auction-list-page')).toHaveAttribute('data-direction', 'ltr')
    expect(screen.getByRole('heading', { name: 'Auctions' })).toBeInTheDocument()
    expect(document.querySelectorAll('.auction-list-card')).toHaveLength(6)
    expect(screen.getByRole('link', { name: 'Open Premium Harri ram auction' })).toHaveAttribute(
      'href',
      '/auction?lang=en&campaign=review&auction=featured-harri-ram',
    )
    expect(screen.getByRole('link', { name: 'Open Qassim Brown Cow auction' })).toHaveAttribute(
      'href',
      '/auction?lang=en&campaign=review&auction=qassim-brown-cow',
    )
  })

  it.each([
    {
      id: 'featured-harri-ram',
      title: 'Premium Harri ram',
      price: 'SAR 2,350',
      image: '/images/auction/livestock/ram-curly-horns.jpg',
      lot: '#1256',
      priceLabel: 'Current bid',
      button: 'Bid SAR 2,450',
      disabled: false,
    },
    {
      id: 'qassim-brown-cow',
      title: 'Qassim Brown Cow',
      price: 'SAR 8,000',
      image: '/images/marketplace/brown-cow.jpg',
      lot: '#1257',
      priceLabel: 'Opening Price',
      button: 'Bidding Not Yet Available',
      disabled: true,
    },
    {
      id: 'northern-white-ram',
      title: 'Northern White Ram',
      price: 'SAR 1,800',
      image: '/images/auction/livestock/ram-white.jpg',
      lot: '#1258',
      priceLabel: 'Current bid',
      button: 'Auction Ended',
      disabled: true,
    },
  ])('renders the $id room data and status controls', ({ button, disabled, id, image, lot, price, priceLabel, title }) => {
    renderApp(`/auction?lang=en&auction=${id}`)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByTestId('current-price')).toHaveTextContent(price)
    expect(screen.getByTestId('gallery-image')).toHaveAttribute('src', image)
    expect(screen.getByText(lot)).toBeInTheDocument()
    expect(screen.getByText(priceLabel)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: button })).toHaveProperty('disabled', disabled)
  })

  it('filters All, Live, Upcoming, and Ended auctions accessibly', async () => {
    const user = userEvent.setup()
    renderApp('/auctions?lang=en')

    const all = screen.getByRole('button', { name: 'All' })
    const live = screen.getByRole('button', { name: 'Live' })
    const upcoming = screen.getByRole('button', { name: 'Upcoming' })
    const ended = screen.getByRole('button', { name: 'Ended' })

    expect(all).toHaveAttribute('aria-pressed', 'true')
    await user.click(live)
    expect(live).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelectorAll('.auction-list-card[data-status="live"]')).toHaveLength(2)
    expect(document.querySelector('.auction-list-grid')).toHaveClass('auction-list-grid--2')

    await user.click(upcoming)
    expect(document.querySelectorAll('.auction-list-card[data-status="upcoming"]')).toHaveLength(2)

    await user.click(ended)
    expect(document.querySelectorAll('.auction-list-card[data-status="ended"]')).toHaveLength(2)
  })

  it('searches localized auction data and exposes an empty state', async () => {
    const user = userEvent.setup()
    renderApp('/auctions?lang=en')

    const search = screen.getByRole('searchbox', { name: 'Search auctions' })
    await user.type(search, 'Riyadh')
    expect(document.querySelectorAll('.auction-list-card')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Premium Harri ram' })).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'not-a-real-auction')
    expect(screen.getByRole('status')).toHaveTextContent('No matching auctions')
  })

  it('renders Arabic RTL and opens the room for the selected auction', async () => {
    const user = userEvent.setup()
    renderApp('/auctions')

    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('heading', { name: 'المزادات' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'فتح مزاد بقرة القصيم البنية' }))
    expect(screen.getByTestId('auction-room')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'بقرة القصيم البنية' })).toBeInTheDocument()
  })
})
