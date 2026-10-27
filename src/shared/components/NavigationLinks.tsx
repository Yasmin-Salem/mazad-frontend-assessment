import { NavLink, useLocation } from 'react-router-dom'
import { usePresentation } from '../../app/providers/PresentationContext'
import { navigationItems } from '../config/navigation'
import { Icon } from './Icon'

type NavigationVariant = 'app' | 'desktop' | 'mobile'

export function NavigationLinks({ variant }: { variant: NavigationVariant }) {
  const location = useLocation()
  const { t } = usePresentation()

  return (
    <nav
      className={`navigation navigation--${variant}`}
      aria-label={t.navigationLabels[variant]}
      data-navigation={variant}
    >
      {navigationItems.map((item) => (
        <NavLink
          key={item.key}
          to={{ pathname: item.path, search: location.search }}
          end={item.path === '/'}
          className={({ isActive }) =>
            `navigation__link navigation__link--${item.key}${isActive ? ' is-active' : ''}`
          }
        >
          {variant !== 'desktop' || item.key !== 'listing' ? (
            <span aria-hidden="true" className="navigation__marker" />
          ) : null}
          <Icon className="navigation__icon" name={item.icon} />
          <span className="navigation__text">{t.navigation[item.key]}</span>
        </NavLink>
      ))}
    </nav>
  )
}
