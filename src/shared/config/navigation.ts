import type { PageKey } from '../i18n/translations'
import type { IconName } from '../components/Icon'

export type NavigationItem = {
  key: PageKey | 'messages'
  path?: string
  icon: IconName
  central?: boolean
  demo?: boolean
}

export const navigationItems: readonly NavigationItem[] = [
  { key: 'home', path: '/', icon: 'home' },
  { key: 'auction', path: '/auctions', icon: 'auction' },
  { key: 'listing', path: '/listing', icon: 'add', central: true },
  { key: 'messages', icon: 'message', demo: true },
  { key: 'login', path: '/login', icon: 'user' },
]
