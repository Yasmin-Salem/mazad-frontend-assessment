import type { Language } from '../../../shared/i18n/translations'
import type { PhoneValidationError } from '../model/authValidation'

type AuthCopy = {
  eyebrow: string
  title: string
  description: string
  demoNoticeTitle: string
  demoNotice: string
  phoneHeading: string
  phoneLabel: string
  phonePlaceholder: string
  phoneHint: string
  phoneErrors: Record<PhoneValidationError, string>
  sendCode: string
  sending: string
  otpHeading: string
  otpDescription: (phone: string) => string
  otpLabel: string
  otpHint: string
  verify: string
  verifying: string
  invalidOtp: string
  codeSent: string
  resend: string
  resending: string
  resent: string
  changePhone: string
  successTitle: string
  success: string
  serviceError: string
  bridgeHeading: string
  bridgeDescription: string
  capturePhoto: string
  capturingPhoto: string
  photoSuccess: (fileName: string) => string
  location: string
  locating: string
  locationSuccess: (latitude: number, longitude: number) => string
  bridgeError: string
  simulatedBadge: string
}

export const authCopy: Record<Language, AuthCopy> = {
  en: {
    eyebrow: 'Mock OTP demo',
    title: 'Log in to your account',
    description: 'Verify a mobile number with the assessment’s local OTP simulation.',
    demoNoticeTitle: 'Demo only — no SMS or account session',
    demoNotice: 'Use code 246810. Nothing is sent to your phone and successful verification does not authenticate a real account.',
    phoneHeading: 'Mobile number',
    phoneLabel: 'Saudi mobile number',
    phonePlaceholder: 'e.g. 05 1234 5678',
    phoneHint: 'Use a Saudi mobile number beginning with 05 or +966 5.',
    phoneErrors: {
      required: 'Enter your mobile number.',
      invalid: 'Enter a valid Saudi mobile number, such as 05 1234 5678.',
    },
    sendCode: 'Continue with demo code',
    sending: 'Preparing demo code…',
    otpHeading: 'Enter verification code',
    otpDescription: (phone) => `Demo verification for ${phone}`,
    otpLabel: 'Six-digit verification code',
    otpHint: 'For this demo, enter 246810.',
    verify: 'Verify demo code',
    verifying: 'Verifying…',
    invalidOtp: 'That demo code is incorrect. Enter 246810.',
    codeSent: 'Demo code prepared. No SMS was sent.',
    resend: 'Resend demo code',
    resending: 'Preparing again…',
    resent: 'Demo code reset. No SMS was sent.',
    changePhone: 'Change number',
    successTitle: 'Demo verification complete',
    success: 'The code was accepted locally. No account session or authentication token was created.',
    serviceError: 'The demo verification service is unavailable. Please try again.',
    bridgeHeading: 'Native bridge preview',
    bridgeDescription: 'These controls return simulated browser data. They do not open a camera, request GPS, or call a native application.',
    capturePhoto: 'Simulate photo capture',
    capturingPhoto: 'Simulating camera…',
    photoSuccess: (fileName) => `Simulated photo ready: ${fileName}. No camera was opened.`,
    location: 'Simulate location',
    locating: 'Simulating location…',
    locationSuccess: (latitude, longitude) => `Simulated location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. No GPS was requested.`,
    bridgeError: 'The simulated native action could not be completed. Please try again.',
    simulatedBadge: 'Browser mock',
  },
  ar: {
    eyebrow: 'عرض تجريبي لرمز تحقق وهمي',
    title: 'تسجيل الدخول إلى حسابك',
    description: 'تحقق من رقم الجوال عبر محاكاة رمز التحقق المحلية الخاصة بالتقييم.',
    demoNoticeTitle: 'عرض تجريبي فقط — لا رسائل نصية ولا جلسة حساب',
    demoNotice: 'استخدم الرمز 246810. لن يُرسل شيء إلى هاتفك، ولا ينشئ نجاح التحقق حسابًا حقيقيًا أو جلسة دخول.',
    phoneHeading: 'رقم الجوال',
    phoneLabel: 'رقم جوال سعودي',
    phonePlaceholder: 'مثال: 05 1234 5678',
    phoneHint: 'استخدم رقم جوال سعودي يبدأ بـ 05 أو ‎+966 5.',
    phoneErrors: {
      required: 'أدخل رقم الجوال.',
      invalid: 'أدخل رقم جوال سعودي صالحًا، مثل 05 1234 5678.',
    },
    sendCode: 'المتابعة بالرمز التجريبي',
    sending: 'جارٍ تجهيز الرمز التجريبي…',
    otpHeading: 'أدخل رمز التحقق',
    otpDescription: (phone) => `تحقق تجريبي للرقم ${phone}`,
    otpLabel: 'رمز التحقق المكوّن من ستة أرقام',
    otpHint: 'لهذا العرض التجريبي، أدخل 246810.',
    verify: 'تحقق من الرمز التجريبي',
    verifying: 'جارٍ التحقق…',
    invalidOtp: 'الرمز التجريبي غير صحيح. أدخل 246810.',
    codeSent: 'تم تجهيز الرمز التجريبي. لم تُرسل رسالة نصية.',
    resend: 'إعادة إرسال الرمز التجريبي',
    resending: 'جارٍ التجهيز مرة أخرى…',
    resent: 'تمت إعادة ضبط الرمز التجريبي. لم تُرسل رسالة نصية.',
    changePhone: 'تغيير الرقم',
    successTitle: 'اكتمل التحقق التجريبي',
    success: 'قُبل الرمز محليًا. لم تُنشأ جلسة حساب أو رمز مصادقة.',
    serviceError: 'خدمة التحقق التجريبية غير متاحة. حاول مرة أخرى.',
    bridgeHeading: 'معاينة الجسر الأصلي',
    bridgeDescription: 'تعيد هذه الأدوات بيانات متصفح محاكاة. لا تفتح الكاميرا ولا تطلب GPS ولا تتصل بتطبيق أصلي.',
    capturePhoto: 'محاكاة التقاط صورة',
    capturingPhoto: 'جارٍ محاكاة الكاميرا…',
    photoSuccess: (fileName) => `الصورة المحاكاة جاهزة: ${fileName}. لم تُفتح الكاميرا.`,
    location: 'محاكاة الموقع',
    locating: 'جارٍ محاكاة الموقع…',
    locationSuccess: (latitude, longitude) => `الموقع المحاكى: ${latitude.toFixed(4)}، ${longitude.toFixed(4)}. لم يُطلب GPS.`,
    bridgeError: 'تعذر إكمال الإجراء الأصلي المحاكى. حاول مرة أخرى.',
    simulatedBadge: 'محاكاة المتصفح',
  },
}
