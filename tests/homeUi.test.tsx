import { render, screen, within } from '@testing-library/react'
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

describe('responsive Home page', () => {
  it('uses existing auction data and routes in the four approved sections', () => {
    renderApp('/?lang=en&campaign=review')

    const page = screen.getByTestId('home-page')
    expect(within(page).getByRole('heading', { name: 'Discover extraordinary auctions for rare pieces' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'Featured auction' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'How Mazad works' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'List your item' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'Emerald Datejust 41' })).toBeInTheDocument()
    expect(within(page).getByText('Demo current bid')).toBeInTheDocument()
    expect(within(page).getByText('12,500 SAR')).toBeInTheDocument()

    const auctionLinks = within(page).getAllByRole('link', { name: /Explore auctions|View auction/ })
    expect(auctionLinks).toHaveLength(2)
    expect(auctionLinks[0]).toHaveAttribute('href', '/auction?lang=en&campaign=review')
    expect(auctionLinks[1]).toHaveAttribute('href', '/auction?lang=en&campaign=review')
    expect(within(page).getAllByRole('link', { name: /Add an item/ })[0]).toHaveAttribute(
      'href',
      '/listing?lang=en&campaign=review',
    )
  })

  it('renders localized Arabic RTL content through the same component tree', () => {
    renderApp('/')

    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-direction', 'rtl')
    expect(screen.getByRole('heading', { name: 'اكتشف مزادات استثنائية على قطع نادرة' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'مزاد مميز' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'كيف يعمل مزاد؟' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'أضف منتجك' })).toBeInTheDocument()
    expect(screen.getByText('مزايدة حالية تجريبية')).toBeInTheDocument()
    expect(screen.getByText('12,500 SAR')).toBeInTheDocument()
  })

  it('reuses the Home page inside the existing app shell', () => {
    renderApp('/?mode=app&lang=en')

    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
    expect(screen.getAllByTestId('home-page')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Discover extraordinary auctions for rare pieces' })).toBeInTheDocument()
  })
})
