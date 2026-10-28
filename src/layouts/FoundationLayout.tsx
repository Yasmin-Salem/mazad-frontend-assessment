import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from '../shared/components/BrandMark'
import { Icon } from '../shared/components/Icon'
import { IconButton } from '../shared/components/IconButton'
import { LanguageSwitcher } from '../shared/components/LanguageSwitcher'
import { NavigationLinks } from '../shared/components/NavigationLinks'
import { usePresentation } from '../app/providers/PresentationContext'
import { homeCopy } from '../features/home/ui/homeCopy'

function WebHeader() {
  const { language, t } = usePresentation()

  return (
    <header className="web-header">
      <div className="shell-container web-header__topbar">
        <BrandMark />
        <NavigationLinks variant="desktop" />
        <div className="web-header__utilities">
          <span className="web-header__location">
            <span aria-hidden="true">⌖</span>{homeCopy[language].location}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
      <span className="sr-only">{t.phaseLabel}</span>
    </header>
  )
}

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = usePresentation()

  const handleBack = () => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIndex > 0) {
      void navigate(-1)
      return
    }
    void navigate({ pathname: '/', search: location.search }, { replace: true })
  }

  return (
    <header className="app-header">
      <IconButton className="app-header__back" label={t.back} onClick={handleBack}>
        <Icon className="directional-back-icon" name="back" />
      </IconButton>
      <div className="app-header__identity">
        <BrandMark compact />
        <span>{homeCopy[language].location}</span>
      </div>
      <LanguageSwitcher compact />
    </header>
  )
}

export function FoundationLayout() {
  const { isAppMode, t } = usePresentation()

  return (
    <div
      className={isAppMode ? 'site-shell site-shell--app' : 'site-shell site-shell--web'}
      data-mode={isAppMode ? 'app' : 'web'}
    >
      <a className="skip-link" href="#main-content">{t.skipToContent}</a>
      {isAppMode ? <AppHeader /> : <WebHeader />}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      {isAppMode ? (
        <div className="app-bottom-nav">
          <NavigationLinks variant="app" />
        </div>
      ) : (
        <div className="mobile-web-bottom-nav">
          <NavigationLinks variant="mobile" />
        </div>
      )}
    </div>
  )
}
