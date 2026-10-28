import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { App } from '../src/app/App'
import { ScrollManager } from '../src/app/ScrollManager'

let windowScrollY = 0

function scrollTopFrom(options?: ScrollToOptions | number): number {
  if (typeof options === 'number') return options
  return options?.top ?? 0
}

beforeEach(() => {
  windowScrollY = 0
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => windowScrollY,
  })
  vi.spyOn(window, 'scrollTo').mockImplementation((options) => {
    windowScrollY = scrollTopFrom(options)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

function HistoryFixture() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <p>{location.pathname}</p>
      <Link to="/next">Next page</Link>
      <button onClick={() => void navigate(-1)} type="button">Back</button>
    </>
  )
}

function renderHistoryFixture() {
  return render(
    <MemoryRouter initialEntries={['/start']}>
      <ScrollManager />
      <Routes>
        <Route path="*" element={<HistoryFixture />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('route scroll management', () => {
  it('starts a new Home CTA destination at the top in app mode', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/?mode=app&lang=en']}>
        <App />
      </MemoryRouter>,
    )
    const scrollTo = vi.mocked(window.scrollTo)
    scrollTo.mockClear()
    windowScrollY = 720

    await user.click(screen.getAllByRole('link', { name: 'Add listing' })[0])

    expect(screen.getByRole('heading', { name: 'Add a new item' })).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', left: 0, top: 0 })
  })

  it('does not reset scroll for a language query change on the same page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/?lang=en']}>
        <App />
      </MemoryRouter>,
    )
    const scrollTo = vi.mocked(window.scrollTo)
    scrollTo.mockClear()
    windowScrollY = 480

    await user.click(screen.getByRole('button', { name: 'Switch to Arabic' }))

    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(scrollTo).not.toHaveBeenCalled()
    expect(windowScrollY).toBe(480)
  })

  it('restores a saved position when browser history returns to a route', async () => {
    const user = userEvent.setup()
    renderHistoryFixture()
    const scrollTo = vi.mocked(window.scrollTo)
    scrollTo.mockClear()
    windowScrollY = 640

    await user.click(screen.getByRole('link', { name: 'Next page' }))
    expect(windowScrollY).toBe(0)

    windowScrollY = 210
    scrollTo.mockClear()
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('/start')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', left: 0, top: 640 })
  })

  it('uses the main content element when it owns vertical scrolling', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/?lang=en']}>
        <App />
      </MemoryRouter>,
    )
    const main = document.getElementById('main-content') as HTMLElement & {
      scrollTo: (options: ScrollToOptions) => void
    }
    main.style.overflowY = 'auto'
    main.scrollTop = 530
    const mainScrollTo = vi.fn((options: ScrollToOptions) => {
      main.scrollTop = options.top ?? 0
    })
    main.scrollTo = mainScrollTo

    await user.click(screen.getAllByRole('link', { name: 'Add listing' })[0])

    expect(mainScrollTo).toHaveBeenCalledWith({ behavior: 'auto', left: 0, top: 0 })
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
