import {
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  translations,
  type Language,
} from '../../shared/i18n/translations'
import { PresentationContext, type PresentationContextValue } from './PresentationContext'

export function PresentationProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const language: Language = searchParams.get('lang') === 'en' ? 'en' : 'ar'
  const direction = language === 'ar' ? 'rtl' : 'ltr'
  const isAppMode = searchParams.get('mode') === 'app'

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [direction, language])

  const value = useMemo<PresentationContextValue>(
    () => ({
      direction,
      isAppMode,
      language,
      setLanguage: (nextLanguage) => {
        const nextSearchParams = new URLSearchParams(location.search)
        nextSearchParams.set('lang', nextLanguage)
        void navigate(
          { pathname: location.pathname, search: nextSearchParams.toString() },
          { replace: true },
        )
      },
      t: translations[language],
    }),
    [direction, isAppMode, language, location.pathname, location.search, navigate],
  )

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  )
}
