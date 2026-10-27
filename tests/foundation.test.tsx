import { render, screen, within } from '@testing-library/react'
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

describe('foundation shell', () => {
  it('renders the Arabic web shell and route content by default', () => {
    renderApp('/auction')

    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('heading', { name: 'ساعة إميرالد ديت جست 41' })).toBeInTheDocument()
    expect(document.querySelector('[data-mode="web"]')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'رجوع' })).not.toBeInTheDocument()
  })

  it('switches language and document direction while preserving app mode', async () => {
    const user = userEvent.setup()
    renderApp('/auction?mode=app')

    await user.click(screen.getByRole('button', { name: 'التبديل إلى اللغة الإنجليزية' }))

    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(screen.getByRole('heading', { name: 'Emerald Datejust 41' })).toBeInTheDocument()
    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' }).querySelector('[data-icon="back"]')).toBeInTheDocument()
  })

  it('preserves query parameters when navigating inside app mode', async () => {
    const user = userEvent.setup()
    renderApp('/?mode=app&lang=en')

    const links = screen.getAllByRole('link', { name: 'Auctions' })
    expect(links[0]).toHaveAttribute('href', '/auction?mode=app&lang=en')
    await user.click(links[0])

    expect(screen.getByRole('heading', { name: 'Emerald Datejust 41' })).toBeInTheDocument()
    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
  })

  it('uses a safe home fallback for back on a direct app-mode entry', async () => {
    const user = userEvent.setup()
    renderApp('/login?mode=app&lang=en')

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Discover extraordinary auctions for rare pieces' })).toBeInTheDocument()
    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
  })

  it('redirects unknown routes to home without dropping presentation parameters', () => {
    renderApp('/missing?mode=app&lang=en')

    expect(screen.getByRole('heading', { name: 'Discover extraordinary auctions for rare pieces' })).toBeInTheDocument()
    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
  })

  it('uses one primary web navigation in the header with active-route semantics', () => {
    renderApp('/auction?lang=en')

    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(primaryNavigation).toHaveAttribute('data-navigation', 'desktop')
    expect(primaryNavigation.parentElement).toHaveClass('web-header__topbar')
    expect(screen.getByRole('navigation', { name: 'Mobile web navigation' })).toHaveAttribute('data-navigation', 'mobile')
    expect(screen.queryByRole('navigation', { name: 'App navigation' })).not.toBeInTheDocument()
    expect(document.querySelector('.tablet-web-nav')).not.toBeInTheDocument()

    const activeAuctionLink = within(primaryNavigation).getByRole('link', { name: 'Auctions' })
    expect(activeAuctionLink).toHaveAttribute('aria-current', 'page')
    expect(activeAuctionLink.querySelector('.navigation__marker')).toBeInTheDocument()
  })

  it('uses a marker-free Add Item CTA on web while preserving the mobile marker', () => {
    renderApp('/listing?lang=en')

    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' })
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile web navigation' })
    const primaryAddItem = within(primaryNavigation).getByRole('link', { name: 'Add item' })
    const mobileAddItem = within(mobileNavigation).getByRole('link', { name: 'Add item' })

    expect(primaryAddItem).toHaveAttribute('aria-current', 'page')
    expect(primaryAddItem).toHaveClass('navigation__link--listing', 'is-active')
    expect(primaryAddItem.querySelector('.navigation__marker')).not.toBeInTheDocument()

    expect(mobileAddItem).toHaveAttribute('aria-current', 'page')
    expect(mobileAddItem.querySelector('.navigation__marker')).toBeInTheDocument()
    expect(mobileAddItem.querySelector('[data-icon="add"]')).toBeInTheDocument()
  })

  it('uses only the app navigation shell in app mode', () => {
    renderApp('/listing?mode=app&lang=en')

    expect(screen.getByRole('navigation', { name: 'App navigation' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Mobile web navigation' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add item' })).toHaveAttribute('aria-current', 'page')
  })
})
