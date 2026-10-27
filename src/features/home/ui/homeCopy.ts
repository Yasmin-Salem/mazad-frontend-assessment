import type { Language } from '../../../shared/i18n/translations'

export type HomeCopy = {
  eyebrow: string
  title: string
  description: string
  exploreAuctions: string
  addItem: string
  featuredAuction: string
  liveAuction: string
  currentBid: string
  viewAuction: string
  howItWorks: string
  steps: readonly { title: string; description: string }[]
  sellerTitle: string
  sellerDescription: string
}

export const homeCopy: Record<Language, HomeCopy> = {
  en: {
    eyebrow: 'Curated live auctions',
    title: 'Discover extraordinary auctions for rare pieces',
    description: 'Explore distinctive lots through a clear, secure-feeling demonstration designed for confident bidding.',
    exploreAuctions: 'Explore auctions',
    addItem: 'Add an item',
    featuredAuction: 'Featured auction',
    liveAuction: 'Live auction',
    currentBid: 'Demo current bid',
    viewAuction: 'View auction',
    howItWorks: 'How Mazad works',
    steps: [
      { title: 'Explore auctions', description: 'Browse the featured live lot and its details.' },
      { title: 'Place your bid', description: 'Choose one of the available quick bid amounts.' },
      { title: 'Follow the result', description: 'Watch the price and bidder update during the demo.' },
    ],
    sellerTitle: 'List your item',
    sellerDescription: 'Prepare a detailed item draft and save your progress locally.',
  },
  ar: {
    eyebrow: 'مزادات مباشرة منتقاة',
    title: 'اكتشف مزادات استثنائية على قطع نادرة',
    description: 'استكشف قطعًا مميزة عبر تجربة تجريبية واضحة تمنحك الثقة أثناء المزايدة.',
    exploreAuctions: 'استكشف المزادات',
    addItem: 'أضف منتجًا',
    featuredAuction: 'مزاد مميز',
    liveAuction: 'مزاد مباشر',
    currentBid: 'مزايدة حالية تجريبية',
    viewAuction: 'عرض المزاد',
    howItWorks: 'كيف يعمل مزاد؟',
    steps: [
      { title: 'استكشف المزادات', description: 'تصفح المزاد المباشر المميز وتفاصيل القطعة.' },
      { title: 'قدّم مزايدتك', description: 'اختر إحدى قيم المزايدة السريعة المتاحة.' },
      { title: 'تابع النتيجة', description: 'راقب تحديث السعر والمزايد خلال العرض التجريبي.' },
    ],
    sellerTitle: 'أضف منتجك',
    sellerDescription: 'جهّز مسودة مفصلة للمنتج واحفظ تقدمك محليًا.',
  },
}
