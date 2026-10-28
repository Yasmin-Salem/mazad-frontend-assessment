import type { Language } from '../../../shared/i18n/translations'

export type HomeCopy = {
  location: string
  searchLabel: string
  searchPlaceholder: string
  bannerEyebrow: string
  bannerTitle: string
  bannerDescription: string
  bannerAction: string
  quickActions: readonly [string, string, string, string]
  latestOffers: string
  viewAll: string
  live: string
  demoOnly: string
  currency: string
  favoriteDemo: string
}

export const homeCopy: Record<Language, HomeCopy> = {
  en: {
    location: 'Riyadh',
    searchLabel: 'Search livestock listings',
    searchPlaceholder: 'Search livestock, breed, or listing',
    bannerEyebrow: 'Trusted livestock marketplace',
    bannerTitle: 'The best livestock at better prices',
    bannerDescription: 'Browse selected listings and join transparent live auctions.',
    bannerAction: 'Browse now',
    quickActions: ['Direct sale', 'Live auctions', 'Trusted breeders', 'Add listing'],
    latestOffers: 'Latest offers',
    viewAll: 'View all',
    live: 'Live now',
    demoOnly: 'Demo only',
    currency: 'SAR',
    favoriteDemo: 'Save listing — demo only',
  },
  ar: {
    location: 'الرياض',
    searchLabel: 'البحث في إعلانات المواشي',
    searchPlaceholder: 'ابحث عن ماشية، سلالة، أو إعلان',
    bannerEyebrow: 'سوق المواشي الموثوق',
    bannerTitle: 'أفضل المواشي بأفضل الأسعار',
    bannerDescription: 'تصفح عروضاً مختارة وشارك في مزادات مباشرة بشفافية.',
    bannerAction: 'تصفح الآن',
    quickActions: ['بيع مباشر', 'مزاد مباشر', 'مربون موثوقون', 'أضف إعلان'],
    latestOffers: 'أحدث العروض',
    viewAll: 'عرض الكل',
    live: 'مباشر الآن',
    demoOnly: 'عرض تجريبي',
    currency: 'ر.س',
    favoriteDemo: 'حفظ الإعلان — عرض تجريبي',
  },
}
