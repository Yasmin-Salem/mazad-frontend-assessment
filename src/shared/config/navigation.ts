import type { PageKey } from '../i18n/translations'
import type { IconName } from '../components/Icon'

export type NavigationItem = {
  key: PageKey
  path: string
  icon: IconName
}

export const navigationItems: readonly NavigationItem[] = [
  { key: 'home', path: '/', icon: 'home' },
  { key: 'auction', path: '/auction', icon: 'auction' },
  { key: 'listing', path: '/listing', icon: 'add' },
  { key: 'login', path: '/login', icon: 'user' },
]
