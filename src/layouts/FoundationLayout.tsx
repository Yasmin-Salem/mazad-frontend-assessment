import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from '../shared/components/BrandMark'
import { Icon } from '../shared/components/Icon'
import { IconButton } from '../shared/components/IconButton'
import { LanguageSwitcher } from '../shared/components/LanguageSwitcher'
import { NavigationLinks } from '../shared/components/NavigationLinks'
import { usePresentation } from '../app/providers/PresentationContext'

function WebHeader() {
  const { t } = usePresentation()

  return (
    <header className="web-header">
      <div className="shell-container web-header__topbar">
        <BrandMark />
        <NavigationLinks variant="desktop" />
        <LanguageSwitcher />
      </div>
      <span className="sr-only">{t.phaseLabel}</span>
    </header>
  )
}

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = usePresentation()

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
        <span>{t.appBar}</span>
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
