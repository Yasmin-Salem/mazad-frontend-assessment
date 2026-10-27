import { usePresentation } from '../../app/providers/PresentationContext'
import { Icon } from './Icon'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = usePresentation()

  return (
    <button
      className={compact ? 'language-switcher language-switcher--compact' : 'language-switcher'}
      type="button"
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      aria-label={t.languageSwitcherLabel}
    >
      <Icon className="language-switcher__icon" name="language" />
      <span>{t.languageAction}</span>
    </button>
  )
}
