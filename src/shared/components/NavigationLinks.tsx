import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePresentation } from '../../app/providers/PresentationContext'
import { navigationItems, type NavigationItem } from '../config/navigation'
import { Icon } from './Icon'

type NavigationVariant = 'app' | 'desktop' | 'mobile'

export function NavigationLinks({ variant }: { variant: NavigationVariant }) {
  const location = useLocation()
  const { t } = usePresentation()
  const [isDemoFeedbackVisible, setIsDemoFeedbackVisible] = useState(false)
  const demoFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (demoFeedbackTimer.current !== null) {
      clearTimeout(demoFeedbackTimer.current)
    }
  }, [])

  const showDemoFeedback = () => {
    if (demoFeedbackTimer.current !== null) {
      clearTimeout(demoFeedbackTimer.current)
    }

    setIsDemoFeedbackVisible(true)
    demoFeedbackTimer.current = setTimeout(() => {
      setIsDemoFeedbackVisible(false)
      demoFeedbackTimer.current = null
    }, 3_000)
  }

  const itemLabel = (item: NavigationItem) => item.key === 'messages'
    ? t.mobileMessages
    : t.navigation[item.key]

  const renderItem = (item: NavigationItem) => {
    const label = itemLabel(item)
    const content = (
      <>
        <span aria-hidden="true" className="navigation__marker" />
        <Icon className="navigation__icon" name={item.icon} />
        <span className="navigation__text">{label}</span>
      </>
    )

    if (!item.path) {
      return (
        <button
          aria-label={`${label} — ${t.demoOnly}`}
          className={`navigation__link navigation__link--${item.key} navigation__link--demo`}
          key={item.key}
          onClick={showDemoFeedback}
          title={t.demoOnly}
          type="button"
        >
          {content}
        </button>
      )
    }

    const isAuctionRoute = item.key === 'auction'
      && (location.pathname === '/auction' || location.pathname === '/auctions')

    return (
      <NavLink
        aria-current={isAuctionRoute ? 'page' : undefined}
        key={item.key}
        to={{ pathname: item.path, search: location.search }}
        end={item.path === '/'}
        className={({ isActive }) =>
          `navigation__link navigation__link--${item.key}${item.central ? ' navigation__link--central' : ''}${isActive || isAuctionRoute ? ' is-active' : ''}`
        }
      >
        {content}
      </NavLink>
    )
  }

  return (
    <nav
      className={`navigation navigation--${variant}`}
      aria-label={t.navigationLabels[variant]}
      data-navigation={variant}
    >
      {navigationItems.map(renderItem)}
      {isDemoFeedbackVisible ? (
        <span className="navigation__feedback" role="status">
          {t.messagesUnavailable}
        </span>
      ) : null}
    </nav>
  )
}
