import type { Language } from '../../../shared/i18n/translations'
import type { AuctionListStatus } from '../data/auctionListings'

export type AuctionListFilter = 'all' | AuctionListStatus

export const auctionListCopy = {
  ar: {
    title: 'المزادات',
    description: 'اكتشف أفضل المواشي في مزاداتنا المباشرة',
    searchLabel: 'البحث في المزادات',
    searchPlaceholder: 'ابحث عن ماشية أو مزرعة أو مدينة...',
    filtersLabel: 'تصفية المزادات',
    filters: { all: 'الكل', live: 'جارية الآن', upcoming: 'قادمة', ended: 'منتهية' },
    statuses: { live: 'مباشر', upcoming: 'قادم', ended: 'منتهي' },
    startsIn: (time: string) => `يبدأ خلال ${time}`,
    currentBid: 'أعلى سعر',
    bidders: 'عدد المزايدين',
    noPrice: '—',
    currency: 'ر.س',
    favorite: 'حفظ المزاد — عرض تجريبي',
    openAuction: (title: string) => `فتح مزاد ${title}`,
    emptyTitle: 'لا توجد مزادات مطابقة',
    emptyDescription: 'جرّب اختيار حالة أخرى أو تغيير كلمات البحث.',
  },
  en: {
    title: 'Auctions',
    description: 'Discover outstanding livestock in our live auctions',
    searchLabel: 'Search auctions',
    searchPlaceholder: 'Search livestock, farm, or city...',
    filtersLabel: 'Filter auctions',
    filters: { all: 'All', live: 'Live', upcoming: 'Upcoming', ended: 'Ended' },
    statuses: { live: 'Live', upcoming: 'Upcoming', ended: 'Ended' },
    startsIn: (time: string) => `Starts in ${time}`,
    currentBid: 'Highest bid',
    bidders: 'Bidders',
    noPrice: '—',
    currency: 'SAR',
    favorite: 'Save auction — demo only',
    openAuction: (title: string) => `Open ${title} auction`,
    emptyTitle: 'No matching auctions',
    emptyDescription: 'Try another status or change your search terms.',
  },
} as const satisfies Record<Language, object>
