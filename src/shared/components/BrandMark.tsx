import { Link, useLocation } from 'react-router-dom'
import { usePresentation } from '../../app/providers/PresentationContext'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const location = useLocation()
  const { t } = usePresentation()

  return (
    <Link
      aria-label={t.brandHomeLabel}
      className={`brand${compact ? ' brand--compact' : ''}`}
      to={{ pathname: '/', search: location.search }}
    >
      <svg className="brand__mark" aria-hidden="true" viewBox="0 0 42 42">
        <path d="M20.8 35.5C12 31.7 8.1 24.8 9.1 13c8.8 2.6 13.6 8.9 11.7 22.5Z" />
        <path d="M22 35.5c-.9-12.8 3-21.2 11.7-27.2 2.3 12.4-1.6 21.5-11.7 27.2Z" />
        <path className="brand__mark-accent" d="M21.4 35.5c-4.1-9.4-3.1-18.1 3.2-26.2 4 10.6 2.9 19.3-3.2 26.2Z" />
      </svg>
      <span className="brand__copy">
        <strong className="brand__name">{t.brand}</strong>
        <span className="brand__tagline">{t.brandTagline}</span>
      </span>
    </Link>
  )
}
