import { createContext, useContext } from 'react'
import type { Language, TranslationDictionary } from '../../shared/i18n/translations'

export type PresentationContextValue = {
  direction: 'ltr' | 'rtl'
  isAppMode: boolean
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationDictionary
}

export const PresentationContext = createContext<PresentationContextValue | null>(null)

export function usePresentation() {
  const context = useContext(PresentationContext)

  if (!context) {
    throw new Error('usePresentation must be used within PresentationProvider')
  }

  return context
}
