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
      <svg className="brand__mark" aria-hidden="true" viewBox="0 0 48 48">
        <rect className="brand__mark-tile" x="2" y="2" width="44" height="44" rx="13" />
        <path className="brand__mark-animal" d="M15 18c-4-1-6 2-5 6 1 3 4 4 7 2m16-8c4-1 6 2 5 6-1 3-4 4-7 2M17 19c1-5 4-7 7-7s6 2 7 7v9c0 6-3 9-7 9s-7-3-7-9v-9Z" />
        <path className="brand__mark-animal" d="M19 27c3 2 7 2 10 0M21 31h6M20 20l-3-4m11 4 3-4" />
      </svg>
      <span className="brand__copy">
        <strong className="brand__name">{t.brand}</strong>
        <span className="brand__tagline">{t.brandTagline}</span>
      </span>
    </Link>
  )
}
