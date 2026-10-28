export type Language = 'ar' | 'en'
export type PageKey = 'home' | 'auction' | 'listing' | 'login'

export type TranslationDictionary = {
  appBar: string
  back: string
  brand: string
  brandHomeLabel: string
  brandTagline: string
  languageAction: string
  languageSwitcherLabel: string
  mobileMessages: string
  demoOnly: string
  messagesUnavailable: string
  navigation: Record<PageKey, string>
  navigationLabels: Record<'app' | 'desktop' | 'mobile', string>
  pages: Record<PageKey, { eyebrow: string; title: string; description: string }>
  phaseLabel: string
  skipToContent: string
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    messagesUnavailable: 'الرسائل غير متاحة في هذا العرض التجريبي.',
    mobileMessages: 'الرسائل',
    demoOnly: 'عرض تجريبي فقط',
    appBar: 'وضع التطبيق',
    back: 'رجوع',
    brand: 'أنعام',
    brandHomeLabel: 'أنعام — الصفحة الرئيسية',
    brandTagline: 'منصة المواشي والمزادات',
    languageAction: 'English',
    languageSwitcherLabel: 'التبديل إلى اللغة الإنجليزية',
    navigation: {
      home: 'الرئيسية',
      auction: 'المزادات',
      listing: 'إضافة منتج',
      login: 'تسجيل الدخول',
    },
    navigationLabels: {
      app: 'تنقل التطبيق',
      desktop: 'التنقل الرئيسي',
      mobile: 'تنقل الويب للجوال',
    },
    pages: {
      home: {
        eyebrow: 'منصة مزادات راقية',
        title: 'اقتناء استثنائي، بتجربة مدروسة',
        description: 'هذه صفحة هيكلية توضح نظام التصميم والتنقل فقط. محتوى المزاد سيُنفذ في مرحلة لاحقة بعد الموافقة.',
      },
      auction: {
        eyebrow: 'غرفة المزاد',
        title: 'تفاصيل المزاد قيد الإعداد',
        description: 'لم تُنفذ المزايدة أو العد التنازلي أو معرض الصور بعد. هذا المسار مخصص للتحقق من الهيكل المشترك.',
      },
      listing: {
        eyebrow: 'البيع معنا',
        title: 'نموذج إضافة المنتج قيد الإعداد',
        description: 'لم تُنفذ الحقول أو الحفظ التلقائي بعد. ستبقى متطلبات التقييم الأصلية محفوظة للمرحلة المخصصة.',
      },
      login: {
        eyebrow: 'حسابك',
        title: 'تجربة الدخول قيد الإعداد',
        description: 'لم يُنفذ رقم الهاتف أو رمز التحقق التجريبي بعد. هذه الصفحة عنصر هيكلي غير وظيفي.',
      },
    },
    phaseLabel: 'أساس الواجهة — المرحلة الأولى',
    skipToContent: 'انتقل إلى المحتوى',
  },
  en: {
    messagesUnavailable: 'Messaging is not available in this demo.',
    mobileMessages: 'Messages',
    demoOnly: 'Demo only',
    appBar: 'App mode',
    back: 'Back',
    brand: "AN'AM",
    brandHomeLabel: "AN'AM home",
    brandTagline: 'Livestock marketplace',
    languageAction: 'العربية',
    languageSwitcherLabel: 'Switch to Arabic',
    navigation: {
      home: 'Home',
      auction: 'Auctions',
      listing: 'Add item',
      login: 'Log in',
    },
    navigationLabels: {
      app: 'App navigation',
      desktop: 'Primary navigation',
      mobile: 'Mobile web navigation',
    },
    pages: {
      home: {
        eyebrow: 'A considered auction platform',
        title: 'Exceptional pieces, thoughtfully presented',
        description: 'This structural page demonstrates the design system and navigation only. Auction content belongs to a later approved phase.',
      },
      auction: {
        eyebrow: 'Auction room',
        title: 'Auction details are being prepared',
        description: 'Bidding, countdown, and gallery behavior are intentionally not implemented. This route verifies the shared foundation.',
      },
      listing: {
        eyebrow: 'Sell with us',
        title: 'The add-item form is being prepared',
        description: 'Fields and draft persistence are intentionally not implemented. The original assessment fields remain reserved for their approved phase.',
      },
      login: {
        eyebrow: 'Your account',
        title: 'The sign-in experience is being prepared',
        description: 'Phone and mock OTP behavior are intentionally not implemented. This page is a non-functional structural placeholder.',
      },
    },
    phaseLabel: 'UI foundation — phase one',
    skipToContent: 'Skip to content',
  },
}
