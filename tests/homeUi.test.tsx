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

describe('responsive AN’AM marketplace Home page', () => {
  it('renders the marketplace banner, actions, and centralized livestock cards', () => {
    renderApp('/?lang=en&campaign=review')

    const page = screen.getByTestId('home-page')
    expect(within(page).getByRole('heading', { name: 'The best livestock at better prices' })).toBeInTheDocument()
    expect(within(page).getByRole('searchbox', { name: 'Search livestock listings' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'Latest offers' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'Holstein dairy cow' })).toBeInTheDocument()
    expect(within(page).getByRole('heading', { name: 'Premium Harri ram' })).toBeInTheDocument()
    expect(within(page).getByText((_, element) => element?.tagName === 'STRONG' && element.textContent === '2,350 SAR')).toBeInTheDocument()

    expect(within(page).getByRole('link', { name: 'Live auctions' })).toHaveAttribute(
      'href',
      '/auction?lang=en&campaign=review',
    )
    expect(within(page).getByRole('link', { name: 'Add listing' })).toHaveAttribute(
      'href',
      '/listing?lang=en&campaign=review',
    )
    expect(within(page).getByRole('button', { name: 'Trusted breeders — Demo only' })).toBeInTheDocument()
  })

  it('keeps every marketplace section inside the shared Home width container', () => {
    renderApp('/?lang=en')

    const page = screen.getByTestId('home-page')
    const search = within(page).getByRole('search')
    const hero = within(page).getByRole('heading', { name: 'The best livestock at better prices' }).closest('section')
    const quickActions = within(page).getByRole('navigation', { name: 'Trusted livestock marketplace' })
    const offers = within(page).getByRole('heading', { name: 'Latest offers' }).closest('section')

    expect(search).toHaveClass('marketplace-search')
    expect(hero).toHaveClass('marketplace-banner')
    expect(quickActions).toHaveClass('marketplace-quick-actions')
    expect(offers).toHaveClass('marketplace-offers')
    expect(page).toContainElement(search)
    expect(page).toContainElement(hero)
    expect(page).toContainElement(quickActions)
    expect(page).toContainElement(offers)
  })

  it('renders readable localized Arabic RTL marketplace content', () => {
    renderApp('/')

    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-direction', 'rtl')
    expect(screen.getByRole('heading', { name: 'أفضل المواشي بأفضل الأسعار' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'أحدث العروض' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'بقرة هولشتاين' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ابحث عن ماشية، سلالة، أو إعلان')).toBeInTheDocument()
  })

  it('uses the five-item mobile composition inside the existing app shell', () => {
    renderApp('/?mode=app&lang=en')

    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
    const navigation = screen.getByRole('navigation', { name: 'App navigation' })
    expect(within(navigation).getAllByRole('link')).toHaveLength(4)
    expect(within(navigation).getAllByRole('button')).toHaveLength(1)
    expect(within(navigation).getByRole('button', { name: 'Messages — Demo only' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The best livestock at better prices' })).toBeInTheDocument()
  })
})
