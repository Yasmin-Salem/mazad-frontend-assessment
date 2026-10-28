import type { Language } from '../../../shared/i18n/translations'

type LocalizedText = Record<Language, string>

export type MarketplaceListing = {
  id: string
  title: LocalizedText
  location: LocalizedText
  price: number
  imageUrl: string
  imageAlt: LocalizedText
  isLive?: boolean
  auctionPath?: '/auction'
}

export const marketplaceListings: readonly MarketplaceListing[] = [
  {
    id: 'holstein-cow',
    title: { ar: 'بقرة هولشتاين', en: 'Holstein dairy cow' },
    location: { ar: 'القصيم', en: 'Al Qassim' },
    price: 6200,
    imageUrl: '/images/marketplace/holstein-cow.jpg',
    imageAlt: { ar: 'بقرة هولشتاين سوداء وبيضاء في مرعى أخضر', en: 'Black and white Holstein cow in a green pasture' },
  },
  {
    id: 'naimi-ram',
    title: { ar: 'خروف نعيمي', en: 'Naimi ram' },
    location: { ar: 'الرياض', en: 'Riyadh' },
    price: 1850,
    imageUrl: '/images/auction/livestock/ram-white.jpg',
    imageAlt: { ar: 'خروف أبيض يقف في المرعى', en: 'White ram standing in a pasture' },
  },
  {
    id: 'harri-auction',
    title: { ar: 'خروف حري مميز', en: 'Premium Harri ram' },
    location: { ar: 'حائل', en: 'Hail' },
    price: 2350,
    imageUrl: '/images/auction/livestock/ram-curly-horns.jpg',
    imageAlt: { ar: 'خروف حري بقرون ملتفة', en: 'Harri ram with curled horns' },
    isLive: true,
    auctionPath: '/auction',
  },
  {
    id: 'brown-cow',
    title: { ar: 'بقرة سويسرية بنية', en: 'Brown Swiss cow' },
    location: { ar: 'الطائف', en: 'Taif' },
    price: 5400,
    imageUrl: '/images/marketplace/brown-cow.jpg',
    imageAlt: { ar: 'بقرة بنية في مرعى جبلي', en: 'Brown cow in a mountain pasture' },
  },
]

export function listingText(value: LocalizedText, language: Language): string {
  return value[language]
}
