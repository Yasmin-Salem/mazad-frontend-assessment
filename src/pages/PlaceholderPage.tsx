import { useLocation } from 'react-router-dom'
import { usePresentation } from '../app/providers/PresentationContext'
import { Button } from '../shared/components/Button'
import type { PageKey } from '../shared/i18n/translations'

export function PlaceholderPage({ page }: { page: PageKey }) {
  const { isAppMode, t } = usePresentation()
  const location = useLocation()
  const copy = t.pages[page]

  return (
    <section className="placeholder-page shell-container" aria-labelledby={`${page}-title`}>
      <div className="placeholder-page__panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id={`${page}-title`}>{copy.title}</h1>
        <p className="placeholder-page__description">{copy.description}</p>
        <div className="foundation-card" aria-label={t.phaseLabel}>
          <span className="foundation-card__accent" aria-hidden="true" />
          <div>
            <strong>{t.phaseLabel}</strong>
            <p>{isAppMode ? t.appBar : t.navigation[page]}</p>
          </div>
          <Button variant="secondary" disabled>
            {location.pathname}
          </Button>
        </div>
      </div>
    </section>
  )
}
