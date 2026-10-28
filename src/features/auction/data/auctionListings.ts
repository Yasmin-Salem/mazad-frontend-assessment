import type { Language } from '../../../shared/i18n/translations'
import type { Auction, AuctionStatus, Bid, Bidder } from '../model/types'

export type AuctionListStatus = 'live' | 'upcoming' | 'ended'

export type AuctionRoomContent = {
  title: string
  edition: string
  description: string
  tags: readonly [string, string, string]
  weightValue: string
  detailValues: readonly [string, string, string, string, string]
  imageAlt: readonly string[]
  location: string
  farm: string
}

export type AuctionListing = {
  id: string
  lotNumber: number
  auction: Auction
  content: Record<Language, AuctionRoomContent>
  roomPath: '/auction'
}

const createdAt = Date.now()
const minute = 60_000
const hour = 60 * minute
const ramImages = [
  '/images/auction/livestock/ram-curly-horns.jpg',
  '/images/auction/livestock/ram-field.jpg',
  '/images/auction/livestock/ram-white.jpg',
] as const
const cowImages = [
  '/images/marketplace/brown-cow.jpg',
  '/images/marketplace/cow-hero-approved-wide.png',
  '/images/marketplace/holstein-cow.jpg',
] as const

const bidders: readonly Bidder[] = [
  { id: 'bidder-ahmed', displayName: 'أحمد السيد' },
  { id: 'bidder-noura', displayName: 'نورة أحمد' },
  { id: 'bidder-khalid', displayName: 'خالد العتيبي' },
  { id: 'bidder-salem', displayName: 'سالم الحربي' },
  { id: 'bidder-faisal', displayName: 'فيصل القحطاني' },
]

function makeBids(auctionId: string, amounts: readonly number[], endsAt: number): readonly Bid[] {
  const lastPlacedAt = Math.min(createdAt, endsAt - 1)
  return amounts.map((amount, index) => ({
    id: `${auctionId}-bid-${index + 1}`,
    auctionId,
    bidder: bidders[index % bidders.length]!,
    amount,
    placedAt: lastPlacedAt - (amounts.length - index) * minute,
    source: 'simulator',
  }))
}

function makeAuction(
  id: string,
  itemTitle: string,
  itemDescription: string,
  imageUrls: readonly string[],
  openingPrice: number,
  amounts: readonly number[],
  startsAt: number,
  endsAt: number,
  status: AuctionStatus,
): Auction {
  const bidsForAuction = makeBids(id, amounts, endsAt)
  return {
    id,
    item: { id: `${id}-lot`, title: itemTitle, description: itemDescription, category: 'Livestock', imageUrls },
    currency: 'SAR',
    openingPrice,
    currentPrice: bidsForAuction.at(-1)?.amount ?? openingPrice,
    currentBidder: bidsForAuction.at(-1)?.bidder,
    startsAt,
    endsAt,
    status,
    bids: bidsForAuction,
  }
}

function roomContent(en: AuctionRoomContent, ar: AuctionRoomContent): Record<Language, AuctionRoomContent> {
  return { en, ar }
}

const featuredId = 'featured-harri-ram'

export const auctionListings: readonly AuctionListing[] = [
  {
    id: featuredId,
    lotNumber: 1256,
    auction: makeAuction(featuredId, 'Premium Harri ram', 'Healthy purebred Harri ram from a trusted Riyadh farm.', ramImages, 1_500, [1_750, 1_900, 2_050, 2_200, 2_350], createdAt - 30 * minute, createdAt + 25 * minute, 'active'),
    content: roomContent(
      { title: 'Premium Harri ram', edition: 'Purebred · Riyadh farm', description: 'A healthy purebred Harri ram with excellent build and documented care, suitable for breeding.', tags: ['Harri sheep', 'Purebred', 'Health checked'], weightValue: '55 kg', detailValues: ['Sheep', 'Purebred Harri ram', '2 years', 'Riyadh · Al Muzahimiyah', 'Healthy Harri ram from a trusted local farm, suitable for breeding and carefully cared for.'], imageAlt: ['Purebred horned ram in a green pasture', 'Full-body Harri ram in a field', 'Close portrait of a white ram'], location: 'Riyadh', farm: 'Al Muzahimiyah Farm' },
      { title: 'خروف حري فاخر', edition: 'حري نقي · مزرعة الرياض', description: 'خروف حري أصيل بصحة ممتازة وبنية قوية، موثق العناية ومناسب للتربية والاقتناء.', tags: ['حري', 'فحل أصيل', 'مفحوص صحياً'], weightValue: '55 كجم', detailValues: ['أغنام', 'خروف حري نقي', 'سنتان', 'الرياض · المزاحمية', 'خروف حري أصيل من مزرعة موثوقة، بصحة ممتازة ومناسب للتربية.'], imageAlt: ['خروف حري أصيل في مرعى أخضر', 'خروف حري كامل الجسم في حقل', 'صورة مقربة لخروف أبيض'], location: 'الرياض', farm: 'مزرعة المزاحمية' },
    ),
    roomPath: '/auction',
  },
  {
    id: 'qassim-brown-cow',
    lotNumber: 1257,
    auction: makeAuction('qassim-brown-cow', 'Qassim Brown Cow', 'Well-cared-for brown cow raised on a Qassim farm.', cowImages, 8_000, [], createdAt + 2 * hour, createdAt + 4 * hour, 'scheduled'),
    content: roomContent(
      { title: 'Qassim Brown Cow', edition: 'Local breed · Qassim farm', description: 'A healthy brown cow with balanced build and complete farm care records.', tags: ['Cattle', 'Farm raised', 'Health checked'], weightValue: '480 kg', detailValues: ['Cattle', 'Local brown cow', '3 years', 'Qassim · Buraidah', 'Farm-raised brown cow in excellent condition with documented care.'], imageAlt: ['Brown cow in a pasture', 'Brown cow on green grass', 'Dairy cow in a field'], location: 'Qassim', farm: 'Buraidah Farm' },
      { title: 'بقرة القصيم البنية', edition: 'سلالة محلية · مزرعة القصيم', description: 'بقرة بنية بصحة ممتازة وبنية متوازنة مع سجل عناية متكامل من المزرعة.', tags: ['أبقار', 'تربية مزارع', 'مفحوصة صحياً'], weightValue: '480 كجم', detailValues: ['أبقار', 'بقرة بنية محلية', '3 سنوات', 'القصيم · بريدة', 'بقرة بنية من تربية المزرعة بحالة ممتازة وعناية موثقة.'], imageAlt: ['بقرة بنية في مرعى', 'بقرة بنية وسط العشب', 'بقرة حلوب في حقل'], location: 'القصيم', farm: 'مزرعة بريدة' },
    ),
    roomPath: '/auction',
  },
  {
    id: 'northern-white-ram',
    lotNumber: 1258,
    auction: makeAuction('northern-white-ram', 'Northern White Ram', 'Strong white ram from a northern livestock farm.', [...ramImages].reverse(), 1_300, [1_450, 1_600, 1_800], createdAt - 4 * hour, createdAt - 2 * hour, 'ended'),
    content: roomContent(
      { title: 'Northern White Ram', edition: 'Local breed · Northern farm', description: 'A strong white ram with characteristic curled horns and documented health care.', tags: ['Sheep', 'White ram', 'Health checked'], weightValue: '60 kg', detailValues: ['Sheep', 'White breeding ram', '3 years', 'Northern Borders · Arar', 'Strong white ram raised under professional farm care.'], imageAlt: ['White ram portrait', 'Ram standing in a field', 'Horned ram in a pasture'], location: 'Northern Borders', farm: 'Arar Farm' },
      { title: 'كبش الشمال الأبيض', edition: 'سلالة محلية · مزرعة الشمال', description: 'كبش أبيض قوي بقرون ملتفة مميزة وسجل رعاية صحية موثق.', tags: ['أغنام', 'كبش أبيض', 'مفحوص صحياً'], weightValue: '60 كجم', detailValues: ['أغنام', 'كبش أبيض للتربية', '3 سنوات', 'الحدود الشمالية · عرعر', 'كبش أبيض قوي تمت تربيته بعناية احترافية في المزرعة.'], imageAlt: ['صورة كبش أبيض', 'كبش يقف في حقل', 'كبش بقرون في مرعى'], location: 'الحدود الشمالية', farm: 'مزرعة عرعر' },
    ),
    roomPath: '/auction',
  },
  {
    id: 'najdi-ram',
    lotNumber: 1259,
    auction: makeAuction('najdi-ram', 'Najdi Breeding Ram', 'Selected Najdi ram with strong build.', [ramImages[1], ramImages[0], ramImages[2]], 2_000, [2_200, 2_400, 2_700, 3_000], createdAt - hour, createdAt + 68 * minute, 'active'),
    content: roomContent(
      { title: 'Najdi Breeding Ram', edition: 'Najdi · Makkah farm', description: 'Selected breeding ram with strong build, healthy movement, and excellent farm care.', tags: ['Najdi', 'Breeding ram', 'Selected'], weightValue: '67 kg', detailValues: ['Sheep', 'Najdi breeding ram', '2.5 years', 'Makkah · Taif', 'Selected Najdi ram suitable for breeding and maintained in excellent health.'], imageAlt: ['Najdi ram in a field', 'Horned ram in a pasture', 'White ram portrait'], location: 'Makkah', farm: 'Taif Farm' },
      { title: 'فحل نجدي مميز', edition: 'نجدي · مزرعة مكة', description: 'فحل مختار ببنية قوية وحركة سليمة وعناية ممتازة من المزرعة.', tags: ['نجدي', 'فحل تربية', 'مختار'], weightValue: '67 كجم', detailValues: ['أغنام', 'فحل نجدي للتربية', 'سنتان ونصف', 'مكة · الطائف', 'فحل نجدي مختار مناسب للتربية ومحافظ على صحة ممتازة.'], imageAlt: ['فحل نجدي في حقل', 'كبش بقرون في مرعى', 'صورة كبش أبيض'], location: 'مكة', farm: 'مزرعة الطائف' },
    ),
    roomPath: '/auction',
  },
  {
    id: 'dairy-cow',
    lotNumber: 1260,
    auction: makeAuction('dairy-cow', 'Premium Dairy Cow', 'Productive dairy cow with documented veterinary care.', [cowImages[2], cowImages[0], cowImages[1]], 9_000, [], createdAt + 24 * hour, createdAt + 26 * hour, 'scheduled'),
    content: roomContent(
      { title: 'Premium Dairy Cow', edition: 'Dairy breed · Al Kharj farm', description: 'Healthy productive dairy cow with complete veterinary and farm records.', tags: ['Dairy cattle', 'Productive', 'Vet checked'], weightValue: '520 kg', detailValues: ['Cattle', 'Dairy cow', '4 years', 'Riyadh · Al Kharj', 'Productive dairy cow with documented veterinary care and farm records.'], imageAlt: ['Dairy cow in a field', 'Brown cow in a pasture', 'Cow on green grass'], location: 'Al Kharj', farm: 'Green Fields Farm' },
      { title: 'بقرة حلوب مميزة', edition: 'سلالة حلوب · مزرعة الخرج', description: 'بقرة حلوب منتجة بصحة ممتازة وسجلات بيطرية ورعاية متكاملة.', tags: ['أبقار حلوب', 'منتجة', 'مفحوصة بيطرياً'], weightValue: '520 كجم', detailValues: ['أبقار', 'بقرة حلوب', '4 سنوات', 'الرياض · الخرج', 'بقرة حلوب منتجة مع رعاية بيطرية وسجلات مزرعة موثقة.'], imageAlt: ['بقرة حلوب في حقل', 'بقرة بنية في مرعى', 'بقرة وسط العشب'], location: 'الخرج', farm: 'مزرعة الحقول الخضراء' },
    ),
    roomPath: '/auction',
  },
  {
    id: 'swiss-cow',
    lotNumber: 1261,
    auction: makeAuction('swiss-cow', 'Swiss Brown Cow', 'Calm Swiss brown cow from a certified farm.', cowImages, 10_000, [10_500, 11_000, 11_500], createdAt - 5 * hour, createdAt - 3 * hour, 'ended'),
    content: roomContent(
      { title: 'Swiss Brown Cow', edition: 'Swiss breed · Eastern farm', description: 'Calm Swiss brown cow with sound health and certified farm care.', tags: ['Swiss Brown', 'Certified farm', 'Health checked'], weightValue: '560 kg', detailValues: ['Cattle', 'Swiss Brown cow', '4 years', 'Eastern Province · Al Ahsa', 'Calm Swiss Brown cow raised at a certified livestock farm.'], imageAlt: ['Brown cow in pasture', 'Cow on a green farm', 'Dairy cow in field'], location: 'Al Ahsa', farm: 'Eastern Farm' },
      { title: 'بقرة سويسرية بنية', edition: 'سلالة سويسرية · مزرعة الشرقية', description: 'بقرة سويسرية هادئة بصحة سليمة ورعاية موثقة من مزرعة معتمدة.', tags: ['سويسرية بنية', 'مزرعة معتمدة', 'مفحوصة صحياً'], weightValue: '560 كجم', detailValues: ['أبقار', 'بقرة سويسرية بنية', '4 سنوات', 'المنطقة الشرقية · الأحساء', 'بقرة سويسرية هادئة تمت تربيتها في مزرعة مواشٍ معتمدة.'], imageAlt: ['بقرة بنية في مرعى', 'بقرة في مزرعة خضراء', 'بقرة حلوب في حقل'], location: 'الأحساء', farm: 'مزرعة الشرقية' },
    ),
    roomPath: '/auction',
  },
]

export const DEFAULT_AUCTION_ID = featuredId

export function getAuctionListing(id: string | null | undefined): AuctionListing | undefined {
  return auctionListings.find((listing) => listing.id === id)
}

export function getDefaultAuctionListing(): AuctionListing {
  return getAuctionListing(DEFAULT_AUCTION_ID) ?? auctionListings[0]!
}
